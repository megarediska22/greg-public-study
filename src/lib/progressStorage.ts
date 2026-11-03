import type { CourseEntry } from '../types/lesson.ts';
import { decodeProgress, emptyProgress, PROGRESS_KEY, type Progress } from './progress.ts';

export const PROGRESS_BACKUP_PREFIX = `${PROGRESS_KEY}.backup.`;
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveStatus = 'unchanged' | 'saved' | 'unavailable' | 'conflict' | 'backup-failed' | 'empty-blocked';

function hasProgress(progress: Progress): boolean {
  return progress.lastVisited !== null || progress.completedLessons.length > 0 || Object.values(progress.lessons).some(lesson => lesson.completedSteps.length > 0 || Object.keys(lesson.answers).length > 0);
}

/** Opening a session only reads. Recovery never replaces the original on startup. */
export function openProgressSession(storage: StoragePort, course: readonly CourseEntry[]) {
  let expectedRaw: string | null = null;
  let readable = true;
  let initial: ReturnType<typeof decodeProgress>;
  try {
    expectedRaw = storage.getItem(PROGRESS_KEY);
    initial = decodeProgress(expectedRaw, course);
  } catch {
    readable = false;
    initial = { progress: emptyProgress(), recovered: false };
  }
  let savedSnapshot = JSON.stringify(initial.progress);
  let needsBackup = initial.recovered && expectedRaw !== null;
  let backupKey: string | null = null;

  function persist(progress: Progress, { allowReset = false } = {}): SaveStatus {
    // A failed read must never become a blind write if storage later becomes writable.
    if (!readable) return 'unavailable';
    const nextRaw = JSON.stringify(progress);
    if (nextRaw === savedSnapshot && !allowReset) return 'unchanged';
    try {
      // Do not let a stale tab replace another tab's newly saved progress.
      if (storage.getItem(PROGRESS_KEY) !== expectedRaw) return 'conflict';
      if (!allowReset && !hasProgress(progress) && hasProgress(initial.progress)) return 'empty-blocked';
      if ((needsBackup || allowReset) && expectedRaw !== null) {
        try {
          const prefix = `${PROGRESS_BACKUP_PREFIX}${Date.now()}`;
          let candidate = prefix;
          let suffix = 0;
          while (storage.getItem(candidate) !== null) candidate = `${prefix}.${++suffix}`;
          storage.setItem(candidate, expectedRaw);
          backupKey = candidate;
        } catch { return 'backup-failed'; }
      }
      storage.setItem(PROGRESS_KEY, nextRaw);
      expectedRaw = nextRaw;
      savedSnapshot = nextRaw;
      initial = { progress, recovered: false };
      needsBackup = false;
      return 'saved';
    } catch { return 'unavailable'; }
  }

  return { ...initial, unavailable: !readable, persist, get backupKey() { return backupKey; } };
}
