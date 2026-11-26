import { validateCourse } from '../lib/validation.ts';
import { validateTaskIndicators } from '../lib/taskIndicators.ts';
import { questionTasks } from './questionTasks.ts';
import type { CourseEntry } from '../types/lesson.ts';
import { lessons as historicalLessons } from './historicalCourse.ts';
import { pk01Entries, supplementEntry } from './pk01/integration.ts';

const earlyEntries = [...pk01Entries, ...historicalLessons.map(supplementEntry)];
validateCourse(earlyEntries);
validateTaskIndicators(earlyEntries, questionTasks);

export function assembleCourse(extension: readonly CourseEntry[]): readonly CourseEntry[] {
  return [...earlyEntries, ...extension];
}
