import { lessons as historicalLessons, questionCount as historicalQuestionCount } from './historicalCourse.ts';
import { assembleCourse } from './assembleCourse.ts';
import { extensionEntries } from './extension/registry.ts';
export { grammarLessons, foundationLessons, practicalLessons } from './historicalCourse.ts';
export { historicalLessons };
export const baselineLessons = [...historicalLessons, ...extensionEntries];
export const baselineQuestionCount = historicalQuestionCount + extensionEntries.length * 15;
export const lessons = assembleCourse(extensionEntries);
export const questionCount = lessons.reduce((total, entry) => total + (entry.questionCount ??
  entry.lesson?.steps.reduce((count, step) => count + (step.type === 'exercise' ? step.questions.length : 0), 0) ?? 0), 0);
