import type { CourseEntry } from '../types/lesson.ts';
import { updateProgress, type Progress } from '../lib/progress.ts';

export const QA_PROGRESS_KEY = 'gps.qa.progress.v1';
export const QA_THEME_KEY = 'gps.qa.theme.v1';

/** Synthetic completion flags open the UI; all questions start unanswered. */
export function createQaProgress(course: readonly CourseEntry[]): Progress {
  return {
    version: 1,
    completedLessons: course.filter(entry => entry.lesson).map(entry => entry.id),
    lessons: Object.fromEntries(course.flatMap(entry => entry.lesson ? [[entry.id, { completedSteps: entry.lesson.steps.map(step => step.id), answers: {} }]] : [])),
    lastVisited: null,
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validate only isolated QA attempts through the existing engine, never a second grader. */
export function restoreQaProgress(raw: string | null, course: readonly CourseEntry[]): Progress {
  let progress = createQaProgress(course);
  if (!raw) return progress;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || !record(data.lessons)) return progress;
    for (const { id, lesson } of course) {
      const saved = data.lessons[id];
      if (!lesson || !record(saved) || !record(saved.answers)) continue;
      for (const step of lesson.steps) {
        if (step.type !== 'exercise') continue;
        for (const question of step.questions) {
          const answer = saved.answers[question.id];
          if (!record(answer) || !Array.isArray(answer.attempts)) continue;
          const base = { lessonId: id, stepId: step.id, questionId: question.id };
          for (const attempt of answer.attempts) {
            if (!record(attempt) || typeof attempt.answer !== 'string') continue;
            if (progress.lessons[id].answers[question.id]?.attempts.length) progress = updateProgress(progress, course, { ...base, type: 'retry' });
            progress = updateProgress(progress, course, { ...base, type: 'answer', answer: attempt.answer });
          }
          if (answer.retrying === true) progress = updateProgress(progress, course, { ...base, type: 'retry' });
        }
      }
    }
    if (record(data.lastVisited) && typeof data.lastVisited.lessonId === 'string' && typeof data.lastVisited.stepId === 'string') {
      progress = updateProgress(progress, course, { type: 'visit', lessonId: data.lastVisited.lessonId, stepId: data.lastVisited.stepId });
    }
  } catch { /* Invalid disposable QA data starts with unanswered questions. */ }
  return progress;
}

export function restartQaLesson(progress: Progress, course: readonly CourseEntry[], lessonId: string): Progress {
  if (!course.some(entry => entry.id === lessonId && entry.lesson)) return progress;
  const fresh = createQaProgress(course);
  return { ...progress, lessons: { ...progress.lessons, [lessonId]: fresh.lessons[lessonId] }, lastVisited: { lessonId, stepId: 'intro' } };
}

export function loadQaProgress(storage: Pick<Storage, 'getItem'>, course: readonly CourseEntry[]) {
  try { return restoreQaProgress(storage.getItem(QA_PROGRESS_KEY), course); }
  catch { return createQaProgress(course); }
}

export function saveQaProgress(storage: Pick<Storage, 'setItem'>, progress: Progress): boolean {
  try { storage.setItem(QA_PROGRESS_KEY, JSON.stringify(progress)); return true; }
  catch { return false; }
}
