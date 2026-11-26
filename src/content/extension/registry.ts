import type { CourseEntry, Lesson } from '../../types/lesson.ts';
import { assembleCourse } from '../assembleCourse.ts';
import { applyBlueprint, blueprintCounts } from '../blueprint/integration.ts';
import { availableEntries } from './generated/catalog.ts';
import { unitLoaders, replayLoaders } from './generated/loaders.ts';
import { adaptUnit, replayLesson } from './adaptUnit.ts';

// Only a contiguous prefix can enter the learner sequence; a missing file can
// never silently remove a prerequisite. QA can load other authored IDs directly.
const byId = new Map(availableEntries.map(entry => [entry.id, blueprintCounts({ ...entry })]));
const prefix: CourseEntry[] = [];
for (let number = 27; number <= 121; number++) {
  const entry = byId.get(`unit-${String(number).padStart(3, '0')}`);
  if (!entry) break;
  prefix.push(entry);
}
export const extensionEntries: readonly CourseEntry[] = prefix;
const installedEntries = assembleCourse(extensionEntries);
export const availableUnitIds = Object.keys(unitLoaders);
const pending = new Map<string, Promise<Lesson>>();
const replays = new Map<string, Lesson>();
export const loadedUnitIds = () => [...pending.keys()];
export const loadedReplayIds = () => [...replays.keys()];

/** Loads exactly one rich unit. Failures are retryable; no future lesson prefetch. */
export function loadLesson(id: string): Promise<Lesson> {
  const old = installedEntries.find(entry => entry.id === id)?.lesson;
  if (old) return Promise.resolve(old);
  const existing = pending.get(id);
  if (existing) return existing;
  if (!Object.hasOwn(unitLoaders, id)) return Promise.reject(Error(`Unknown lesson: ${id}`));
  const request = unitLoaders[id]().then(unit => {
    const lesson = applyBlueprint(adaptUnit(unit));
    const entry = byId.get(id)!;
    lesson.title = entry.title;
    entry.lesson = lesson;
    return lesson;
  }).catch(error => { pending.delete(id); throw error; });
  pending.set(id, request);
  return request;
}

/** Engine registry can use compact replay lessons; these are never rendered. */
export function getProgressCourse(): readonly CourseEntry[] {
  return installedEntries.map(entry => ({ ...entry, lesson: entry.lesson ?? replays.get(entry.id) }));
}

/** Inspect IDs only; the engine still validates every saved attempt and gate.
 * A broken chunk rejects startup so original storage cannot be silently truncated. */
export async function prepareProgressCourse(raw: string | null): Promise<readonly CourseEntry[]> {
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { return getProgressCourse(); }
  const saved = data?.lessons;
  if (data?.version !== 1 || !saved || typeof saved !== 'object' || Array.isArray(saved)) return getProgressCourse();
  const ids = extensionEntries.filter(entry => Object.hasOwn(saved, entry.id) && !entry.lesson && !replays.has(entry.id)).map(entry => entry.id);
  await Promise.all(ids.map(async id => {
    const data = await replayLoaders[id]();
    replays.set(id, applyBlueprint(replayLesson(data)));
  }));
  return getProgressCourse();
}
