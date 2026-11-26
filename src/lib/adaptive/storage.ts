import type { CourseEntry } from '../../types/lesson.ts';
import { isLessonUnlocked, type Progress } from '../progress.ts';

export const ADAPTIVE_STORAGE_KEY = 'gps.adaptive.v1';
export const ADAPTIVE_RECOVERY_PREFIX = `${ADAPTIVE_STORAGE_KEY}.recovery.`;
export type AdaptiveStorageStatus = 'ready' | 'empty' | 'unavailable' | 'corrupt' | 'unsupported';
export type AdaptivePersistStatus = 'saved' | 'unchanged' | 'conflict' | 'unavailable' | 'invalid' | 'protected';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A separate, read-only legacy projection; historical attempts never become evidence. */
export function legacyAccess(progress: Progress, course: readonly CourseEntry[]): { completed: string[]; available: string[]; resume: string | null } {
  const completed = course.filter(entry => progress.completedLessons.includes(entry.id)).map(entry => entry.id);
  const available = course.filter(entry => isLessonUnlocked(progress, course, entry.id)).map(entry => entry.id);
  const visited = progress.lastVisited?.lessonId;
  const hasHistory = progress.lastVisited !== null || completed.length > 0 || course.some(entry => Object.hasOwn(progress.lessons, entry.id));
  const resume = visited && available.includes(visited)
    ? visited
    : hasHistory ? available.find(id => !completed.includes(id)) ?? available.at(-1) ?? null : null;
  return { completed, available, resume };
}

/** Opening never writes. The validator must accept only complete, JSON-safe snapshots. */
export function openAdaptiveStorage<T>(storage: StoragePort, initial: T, isData: (value: unknown) => value is T) {
  function encode(value: T): string | null {
    try {
      if (!isData(value)) return null;
      const raw = JSON.stringify({ version: 1, data: value });
      const decoded: unknown = JSON.parse(raw);
      // Validate the bytes too: JSON/toJSON may discard or transform input fields.
      return record(decoded) && decoded.version === 1 && isData(decoded.data) ? raw : null;
    } catch { return null; }
  }

  const initialSnapshot = encode(initial);
  if (initialSnapshot === null) throw new TypeError('Invalid initial adaptive snapshot');
  let snapshot = initialSnapshot;
  let expectedRaw: string | null = null;
  let status: AdaptiveStorageStatus = 'empty';
  let recoveryKey: string | null = null;
  let canWrite = true;
  try {
    expectedRaw = storage.getItem(ADAPTIVE_STORAGE_KEY);
    if (expectedRaw !== null) {
      try {
        const value: unknown = JSON.parse(expectedRaw);
        if (record(value) && typeof value.version === 'number' && value.version !== 1) status = 'unsupported';
        else if (record(value) && value.version === 1 && isData(value.data)) {
          const valid = encode(value.data);
          if (valid === null) status = 'corrupt';
          else { snapshot = valid; status = 'ready'; }
        } else status = 'corrupt';
      } catch { status = 'corrupt'; }
    }
  } catch { status = 'unavailable'; canWrite = false; }

  function persist(next: T, replaceProtected = false): AdaptivePersistStatus {
    if (!canWrite) return 'unavailable';
    const nextRaw = encode(next);
    if (nextRaw === null) return 'invalid';
    if ((status === 'corrupt' || status === 'unsupported') && !replaceProtected) return 'protected';
    try {
      // Check even no-op saves: a stale in-memory snapshot is not current storage.
      if (storage.getItem(ADAPTIVE_STORAGE_KEY) !== expectedRaw) return 'conflict';
      if (nextRaw === snapshot && !replaceProtected) return 'unchanged';
      if (expectedRaw !== null) {
        // Keep the exact previous bytes until (and after) the replacement is verified.
        let candidate = `${ADAPTIVE_RECOVERY_PREFIX}latest`;
        if (replaceProtected) {
          const prefix = `${ADAPTIVE_RECOVERY_PREFIX}${Date.now()}`;
          candidate = prefix;
          let suffix = 0;
          while (storage.getItem(candidate) !== null) {
            if (++suffix > 100) return 'unavailable';
            candidate = `${prefix}.${suffix}`;
          }
        }
        storage.setItem(candidate, expectedRaw);
        if (storage.getItem(candidate) !== expectedRaw) return 'unavailable';
        recoveryKey = candidate;
        // Backup creation may yield to a different writer through the storage port.
        if (storage.getItem(ADAPTIVE_STORAGE_KEY) !== expectedRaw) return 'conflict';
      }
      storage.setItem(ADAPTIVE_STORAGE_KEY, nextRaw);
      let written: string | null;
      try { written = storage.getItem(ADAPTIVE_STORAGE_KEY); }
      catch {
        // The commit is uncertain. Reopen before any further write attempt.
        canWrite = false;
        status = 'unavailable';
        return 'unavailable';
      }
      if (written !== nextRaw) return 'conflict';
      expectedRaw = nextRaw;
      snapshot = nextRaw;
      status = 'ready';
      return 'saved';
    } catch { return 'unavailable'; }
  }

  return {
    // Detached snapshots prevent caller mutations from changing the saved baseline.
    get data(): T { return (JSON.parse(snapshot) as { data: T }).data; },
    get status(): AdaptiveStorageStatus { return status; },
    get recoveryKey(): string | null { return recoveryKey; },
    persist(next: T): AdaptivePersistStatus { return persist(next); },
    /** Explicit recovery only; callers must obtain the user's confirmed choice. */
    replaceProtectedWithRecovery(next: T): AdaptivePersistStatus {
      if (status !== 'corrupt' && status !== 'unsupported') return 'protected';
      return persist(next, true);
    },
  };
}
