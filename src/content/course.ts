import { lessons as historicalLessons, questionCount as historicalQuestionCount } from './historicalCourse.ts';
import { extensionEntries } from './extension/registry.ts';
export { grammarLessons, foundationLessons, practicalLessons } from './historicalCourse.ts';
export { historicalLessons };
// Stable published prefix; lightweight extension metadata, rich content on demand.
export const lessons = [...historicalLessons, ...extensionEntries];
export const questionCount = historicalQuestionCount + extensionEntries.length * 15;
