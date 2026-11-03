import type { Question } from '../types/lesson.ts';
import { questionSolved, type QuestionProgress } from './progress.ts';

/** Presentation state uses only submitted outcomes, never grades a draft. */
export function getQuestionState(saved: QuestionProgress | undefined, draft: string) {
  const last = saved?.attempts.at(-1);
  return {
    locked: questionSolved(saved),
    feedback: last ? last.correct ? 'correct' as const : 'incorrect' as const : null,
    edited: !!last && draft !== last.answer,
  };
}

export function getMissingAnswers(questions: readonly Question[], saved: Readonly<Record<string, QuestionProgress>>, drafts: Readonly<Record<string, string>>) {
  return questions.filter(question => !questionSolved(saved[question.id]) && !drafts[question.id]?.trim()).map(question => question.id);
}
