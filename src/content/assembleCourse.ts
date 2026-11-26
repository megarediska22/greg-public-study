import { validateCourse } from '../lib/validation.ts';
import { validateTaskIndicators } from '../lib/taskIndicators.ts';
import { questionTasks } from './questionTasks.ts';
import type { CourseEntry } from '../types/lesson.ts';
import { lessons as historicalLessons } from './historicalCourse.ts';
import { applyBlueprint, insertBlueprint } from './blueprint/integration.ts';
import { pk01Entries, supplementEntry } from './pk01/integration.ts';

const earlyEntries = [...pk01Entries, ...historicalLessons.map(supplementEntry).map(entry =>
  entry.lesson ? { ...entry, level: entry.lesson.level, lesson: applyBlueprint(entry.lesson) } : entry)];
validateCourse(earlyEntries);
validateTaskIndicators(earlyEntries, questionTasks);

export function assembleCourse(extension: readonly CourseEntry[]): readonly CourseEntry[] {
  const entries = insertBlueprint([...earlyEntries, ...extension]);
  const authored = entries.filter(entry => entry.introducedIn);
  validateCourse(authored);
  validateTaskIndicators(authored, {});
  return entries;
}
