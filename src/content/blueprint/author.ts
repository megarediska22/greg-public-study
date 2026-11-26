import { lesson } from '../pk01/author.ts';
import { questions } from '../pk01/lessons.ts';
import type { Lesson, Question } from '../../types/lesson.ts';

type Row = readonly [context: string, form: string, example: string, translation: string];
type Key = string | readonly string[];
type Hint = readonly [meaning: string, form: string];

export function tasks(id: string) {
  const author = questions(id);
  const keys = (key: Key) => typeof key === 'string' ? [key] : key;
  return {
    c(slug: string, instruction: string, prompt: string, options: readonly string[], correct: number, explanation: string, hints: Hint, russian = false) {
      return author.choose([slug, instruction, prompt, [options[correct]], explanation, ...hints], options, russian);
    },
    b(slug: string, instruction: string, prompt: string, key: Key, explanation: string, hints: Hint) {
      return author.blank([slug, instruction, prompt, keys(key), explanation, ...hints]);
    },
    w(slug: string, instruction: string, prompt: string, key: Key, explanation: string, hints: Hint, action: Parameters<typeof author.write>[1] = 'respond') {
      return author.write([slug, instruction, prompt, keys(key), explanation, ...hints], action);
    },
  };
}

export function unit(
  id: string, level: Lesson['level'], title: string, goals: string, heading: string, text: string,
  rows: readonly Row[], note: string, choices: readonly Question[], blanks: readonly Question[],
  transfer: readonly Question[], review: string,
) {
  return lesson({
    id, level, title, goals: [goals], example: [rows[0][2], rows[0][3]],
    theory: {
      heading, text, tableCaption: 'Опоры для ответа', subjectHeading: 'Ситуация',
      rows: rows.map(([subject, form, example, translation]) => ({ subject, form, example, translation })),
      noteTitle: 'Быстрая проверка', note,
    }, choices, blanks, transfer, review,
  });
}

export type Addition = { reminder: string; questions: readonly Question[] };
export type ContentPacket = {
  version: 4 | 5 | 6 | 7;
  placements: readonly (readonly [after: string, lesson: Lesson])[];
  supplements: Readonly<Record<string, Addition>>;
  reviewEdits?: Readonly<Record<string, string>>;
};
