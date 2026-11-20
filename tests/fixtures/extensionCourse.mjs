// Test-only eager registry. Never import this fixture from src/.
import { historicalLessons } from '../../src/content/course.ts';
import { availableEntries } from '../../src/content/extension/generated/catalog.ts';
import { availableUnitIds, loadLesson } from '../../src/content/extension/registry.ts';

/** For batch QA use a list of stable unit IDs; synthetic gates remain QA-only.
 * This may contain gaps and must never replace the production course sequence. */
export async function loadAuthoredCourse(ids = availableUnitIds) {
  for (const id of ids) if (!availableUnitIds.includes(id)) throw Error(`Missing authored QA unit: ${id}`);
  const selected = new Set(ids);
  const entries = await Promise.all(availableEntries.filter(entry => selected.has(entry.id)).map(async entry => ({ ...entry, lesson: await loadLesson(entry.id) })));
  return [...historicalLessons, ...entries];
}
