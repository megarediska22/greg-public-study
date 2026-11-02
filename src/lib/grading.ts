import type { Normalization, Question } from '../types/lesson.ts';

export function normalizeAnswer(answer: string, options: Normalization = {}): string {
  let value = answer.normalize('NFC').replace(/[‘’ʼ]/g, "'").trim().replace(/\s+/g, ' ');
  if (options.ignoreTerminalPunctuation) value = value.replace(/[.!?]+$/u, '').trim();
  return options.caseSensitive ? value : value.toLocaleLowerCase('en-US');
}

export function gradeAnswer(question: Question, answer: string): boolean {
  if (!answer.trim()) return false;
  // Choice labels are exact values, never free-form text.
  if (question.type === 'choice') return question.options.includes(answer) && question.acceptedAnswers.includes(answer);
  const options = { ignoreTerminalPunctuation: question.type === 'written', ...question.normalization };
  return question.acceptedAnswers.some(accepted => normalizeAnswer(accepted, options) === normalizeAnswer(answer, options));
}
