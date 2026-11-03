import type { CourseEntry, Lesson } from '../types/lesson.ts';
import type { Progress } from './progress.ts';

/** A disposable view of existing recall questions, never persisted or registered. */
export function createVocabularyReview(earned: Progress, course: readonly CourseEntry[], lesson: Lesson, wordIds: readonly string[]) {
  const recall = lesson.steps.find(step => step.id === 'blank' && step.type === 'exercise');
  if (!recall || recall.type !== 'exercise') throw new Error('Vocabulary recall step is missing');
  const step = { ...recall, title: 'Ещё одна встреча со знакомыми словами', questions: recall.questions.filter(question => wordIds.includes(question.vocabularyId!)) };
  const reviewCourse = course.map(entry => entry.id === lesson.id ? { ...entry, lesson: { ...lesson, steps: lesson.steps.map(item => item.id === step.id ? step : item) } } : entry);
  const answers = { ...earned.lessons[lesson.id]?.answers };
  for (const question of step.questions) delete answers[question.id];
  const progress: Progress = { ...earned, lessons: { ...earned.lessons, [lesson.id]: { completedSteps: lesson.steps.map(item => item.id), answers } } };
  return { step, course: reviewCourse, progress };
}
