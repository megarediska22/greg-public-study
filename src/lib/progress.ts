import type { CourseEntry, Lesson, LessonStep } from '../types/lesson.ts';
import { gradeAnswer } from './grading.ts';

export const PROGRESS_KEY = 'gps.progress.v1';
export type Attempt = { answer: string; correct: boolean };
export type QuestionProgress = { attempts: Attempt[]; retrying: boolean };
export type LessonProgress = { completedSteps: string[]; answers: Record<string, QuestionProgress> };
export type Progress = {
  version: 1;
  curriculumVersion?: 2;
  legacyUnlockedLessons?: string[];
  completedLessons: string[];
  lessons: Record<string, LessonProgress>;
  lastVisited: { lessonId: string; stepId: string } | null;
};
export type ProgressAction =
  | { type: 'visit'; lessonId: string; stepId: string }
  | { type: 'complete'; lessonId: string; stepId: string }
  | { type: 'check-exercise'; lessonId: string; stepId: string; answers: Readonly<Record<string, string>> }
  | { type: 'answer'; lessonId: string; stepId: string; questionId: string; answer: string }
  | { type: 'retry'; lessonId: string; stepId: string; questionId: string };

export function emptyProgress(): Progress {
  return { version: 1, curriculumVersion: 2, completedLessons: [], lessons: {}, lastVisited: null };
}

export function isLessonUnlocked(progress: Progress, course: readonly CourseEntry[], lessonId: string): boolean {
  const index = course.findIndex(lesson => lesson.id === lessonId);
  // A validated pre-vocabulary frontier retains grammar access. It never earns
  // completion or exempts vocabulary/new grammar from the integrated sequence.
  if (index >= 0 && course[index].lesson?.kind !== 'vocabulary' && progress.legacyUnlockedLessons?.includes(lessonId)) {
    return course.slice(0, index).filter(entry => entry.lesson?.kind !== 'vocabulary').every(entry => progress.completedLessons.includes(entry.id));
  }
  return index >= 0 && course.slice(0, index).every(entry => progress.completedLessons.includes(entry.id));
}

export function isStepUnlocked(progress: Progress, lesson: Lesson, stepId: string): boolean {
  const index = lesson.steps.findIndex(step => step.id === stepId);
  return index >= 0 && lesson.steps.slice(0, index).every(step => progress.lessons[lesson.id]?.completedSteps.includes(step.id));
}

export function isStepComplete(progress: Progress, lessonId: string, stepId: string): boolean {
  return progress.lessons[lessonId]?.completedSteps.includes(stepId) ?? false;
}

export function questionSolved(answer?: QuestionProgress): boolean {
  return answer?.attempts.some(attempt => attempt.correct) ?? false;
}

export function getScore(progress: Progress, lesson: Lesson, step?: LessonStep) {
  const questions = (step ? [step] : lesson.steps).flatMap(item => item.type === 'exercise' ? item.questions : []);
  const answers = progress.lessons[lesson.id]?.answers ?? {};
  return {
    total: questions.length,
    correct: questions.filter(question => questionSolved(answers[question.id])).length,
    firstTry: questions.filter(question => answers[question.id]?.attempts[0]?.correct).length,
    attempts: questions.reduce((total, question) => total + (answers[question.id]?.attempts.length ?? 0), 0),
  };
}

export function resumeStep(progress: Progress, lesson: Lesson): string {
  const visited = progress.lastVisited;
  if (visited?.lessonId === lesson.id && isStepUnlocked(progress, lesson, visited.stepId)) return visited.stepId;
  return lesson.steps.find(step => !isStepComplete(progress, lesson.id, step.id))?.id ?? lesson.steps.at(-1)!.id;
}

/** All mutations enforce prerequisites, including calls that bypass the UI. */
export function updateProgress(progress: Progress, course: readonly CourseEntry[], action: ProgressAction): Progress {
  const lesson = course.find(entry => entry.id === action.lessonId)?.lesson;
  const step = lesson?.steps.find(item => item.id === action.stepId);
  if (!lesson || !step || !isLessonUnlocked(progress, course, lesson.id) || !isStepUnlocked(progress, lesson, step.id)) return progress;
  if (action.type === 'visit') {
    if (progress.lastVisited?.lessonId === lesson.id && progress.lastVisited.stepId === step.id) return progress;
    return { ...progress, lastVisited: { lessonId: lesson.id, stepId: step.id } };
  }
  const previous = progress.lessons[lesson.id] ?? { completedSteps: [], answers: {} };
  const current: LessonProgress = { completedSteps: [...previous.completedSteps], answers: { ...previous.answers } };
  if (action.type === 'complete') {
    // Exercise completion is earned by correct answers, never by Next.
    if (step.completion !== 'acknowledge' || current.completedSteps.includes(step.id)) return progress;
    current.completedSteps.push(step.id);
  } else if (action.type === 'check-exercise') {
    if (step.type !== 'exercise') return progress;
    const unresolved = step.questions.filter(question => !questionSolved(current.answers[question.id]));
    // Validate the whole submission before recording any attempts. Missing/invalid
    // fields never produce partial scores or consume attempts for other answers.
    if (!unresolved.length || unresolved.some(question => {
      const answer = action.answers[question.id];
      return typeof answer !== 'string' || !answer.trim() || answer.length > 2000 ||
        (question.type === 'choice' && !question.options.includes(answer));
    })) return progress;
    for (const question of unresolved) {
      const answer = action.answers[question.id];
      const saved = current.answers[question.id];
      current.answers[question.id] = {
        attempts: [...(saved?.attempts ?? []), { answer, correct: gradeAnswer(question, answer) }],
        retrying: false,
      };
    }
    if (step.questions.every(question => questionSolved(current.answers[question.id])) && !current.completedSteps.includes(step.id)) current.completedSteps.push(step.id);
  } else {
    if (step.type !== 'exercise') return progress;
    const question = step.questions.find(item => item.id === action.questionId);
    const saved = current.answers[action.questionId] ?? { attempts: [], retrying: false };
    if (!question || questionSolved(saved)) return progress;
    if (action.type === 'retry') {
      if (!saved.attempts.length || saved.retrying) return progress;
      current.answers[question.id] = { ...saved, retrying: true };
    } else {
      if (!action.answer.trim() || action.answer.length > 2000 || (saved.attempts.length && !saved.retrying)) return progress;
      if (question.type === 'choice' && !question.options.includes(action.answer)) return progress;
      const correct = gradeAnswer(question, action.answer);
      current.answers[question.id] = { attempts: [...saved.attempts, { answer: action.answer, correct }], retrying: false };
      if (step.questions.every(item => questionSolved(current.answers[item.id])) && !current.completedSteps.includes(step.id)) current.completedSteps.push(step.id);
    }
  }
  const completed = lesson.steps.every(item => current.completedSteps.includes(item.id));
  return {
    ...progress,
    lessons: { ...progress.lessons, [lesson.id]: current },
    completedLessons: completed && !progress.completedLessons.includes(lesson.id)
      ? course.filter(entry => entry.id === lesson.id || progress.completedLessons.includes(entry.id)).map(entry => entry.id)
      : progress.completedLessons,
  };
}

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = Pick<Storage, 'setItem'>;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function comparableJson(value: unknown): string {
  // Completing an inserted lesson changes map insertion order, not earned data.
  return JSON.stringify(value, (_key, item: unknown) => record(item)
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
}

/** Rebuild earned progress from known content and validated attempts, never trust stored scores. */
export function decodeProgress(raw: string | null, course: readonly CourseEntry[]): { progress: Progress; recovered: boolean } {
  let clean = emptyProgress();
  if (raw === null) return { progress: clean, recovered: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || !record(data.lessons)) return { progress: clean, recovered: true };
    if (course.some(entry => entry.lesson?.kind === 'vocabulary')) {
      const grammar = course.filter(entry => entry.lesson?.kind !== 'vocabulary');
      let retained: string[] = [];
      if (data.curriculumVersion === undefined) {
        // Replay the former grammar curriculum first; stored completion booleans
        // alone cannot grant access. No storage writes occur during migration.
        const legacy = decodeProgress(raw, grammar).progress;
        const frontier = grammar.findIndex(entry => !legacy.completedLessons.includes(entry.id));
        retained = grammar.slice(0, frontier < 0 ? grammar.length : frontier + 1).map(entry => entry.id);
      } else if (data.curriculumVersion === 2 && Array.isArray(data.legacyUnlockedLessons)) {
        retained = grammar.filter(entry => (data.legacyUnlockedLessons as unknown[]).includes(entry.id)).map(entry => entry.id);
      }
      if (retained.length) clean.legacyUnlockedLessons = retained;
    }
    for (const entry of course) {
      const lesson = entry.lesson;
      const saved = data.lessons[entry.id];
      if (!lesson || !record(saved) || !isLessonUnlocked(clean, course, entry.id)) continue;
      const completedSteps = Array.isArray(saved.completedSteps) ? saved.completedSteps : [];
      const answers = record(saved.answers) ? saved.answers : {};
      for (const step of lesson.steps) {
        if (!isStepUnlocked(clean, lesson, step.id)) break;
        if (step.type === 'exercise') {
          for (const question of step.questions) {
            const savedAnswer = answers[question.id];
            if (!record(savedAnswer) || !Array.isArray(savedAnswer.attempts)) continue;
            // Replay through the same guards used for live answers. Recompute correctness.
            for (const attempt of savedAnswer.attempts) {
              if (!record(attempt) || typeof attempt.answer !== 'string' || typeof attempt.correct !== 'boolean') continue;
              const action = { lessonId: lesson.id, stepId: step.id, questionId: question.id };
              if (clean.lessons[lesson.id]?.answers[question.id]?.attempts.length) clean = updateProgress(clean, course, { ...action, type: 'retry' });
              clean = updateProgress(clean, course, { ...action, type: 'answer', answer: attempt.answer });
            }
            if (savedAnswer.retrying === true) clean = updateProgress(clean, course, { type: 'retry', lessonId: lesson.id, stepId: step.id, questionId: question.id });
          }
        } else if (completedSteps.includes(step.id)) {
          clean = updateProgress(clean, course, { type: 'complete', lessonId: lesson.id, stepId: step.id });
        }
      }
    }
    const visited = data.lastVisited;
    if (record(visited) && typeof visited.lessonId === 'string' && typeof visited.stepId === 'string') {
      clean = updateProgress(clean, course, { type: 'visit', lessonId: visited.lessonId, stepId: visited.stepId });
    }
    return { progress: clean, recovered: comparableJson(data) !== comparableJson(clean) };
  } catch {
    return { progress: clean, recovered: true };
  }
}

export function loadProgress(storage: StorageReader, course: readonly CourseEntry[]) {
  try { return { ...decodeProgress(storage.getItem(PROGRESS_KEY), course), unavailable: false }; }
  catch { return { progress: emptyProgress(), recovered: false, unavailable: true }; }
}

export function saveProgress(storage: StorageWriter, progress: Progress): boolean {
  try { storage.setItem(PROGRESS_KEY, JSON.stringify(progress)); return true; }
  catch { return false; }
}
