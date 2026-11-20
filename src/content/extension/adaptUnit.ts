import type { CourseEntry, Lesson, Question } from '../../types/lesson.ts';
import type { TaskMetadata } from '../../lib/taskIndicators.ts';
import { normalizeAnswer } from '../../lib/grading.ts';
import { validateCourse } from '../../lib/validation.ts';

export type ChoiceTuple = [string, string, string, string[], number, string];
export type TextTuple = [string, string, string, string[], string];
export type AuthoredUnit = {
  number: number; title: string; subtitle: string; goal: string; intro: string; example: string;
  translation: string; theory: string; rows: [string, string, string][]; tip: string;
  review: string; summary: string; choice: ChoiceTuple[]; blank: TextTuple[]; written: TextTuple[];
};
export const extensionStepIds = ['intro', 'theory', 'choice', 'blank', 'written', 'review', 'summary'] as const;
export const unitId = (number: number) => `unit-${String(number).padStart(3, '0')}`;
export const unitLevel = (number: number): Lesson['level'] => number <= 41 ? 'A1' : 'A2';
export const unitBand = (number: number) => number <= 41 ? 'A1' : number <= 61 ? 'A1 → A2 · Переход' : 'A2';
const language = (text: string): 'ru' | 'en' => /[а-яё]/iu.test(text) ? 'ru' : 'en';

/** The indicator repeats the written instruction verbatim; it never infers a sentence
 * form from the correct answer, punctuation, or a topic shared by other questions. */
export function unitTask(type: Question['type'], instruction: string): TaskMetadata {
  return { action: type === 'choice' ? 'choose' : type === 'blank' ? 'fill' : 'respond', label: instruction, detail: type === 'choice' ? 'Выберите один вариант.' : type === 'blank' ? 'Напишите только пропущенную часть.' : 'Следуйте условию задания.' };
}

export function adaptUnit(unit: AuthoredUnit): Lesson {
  const id = unitId(unit.number);
  if (!Number.isInteger(unit.number) || unit.number < 27 || unit.number > 121) throw Error(`Invalid extension number: ${unit.number}`);
  const seen = new Set<string>();
  const exercise = (type: 'choice' | 'blank' | 'written') => {
    if (!Array.isArray(unit[type]) || unit[type].length !== 5) throw Error(`${id}/${type}: exactly five questions required`);
    const questions: Question[] = unit[type].map(tuple => {
      const [slug, instruction, prompt] = tuple;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(slug)) throw Error(`${id}: invalid or duplicate localSlug ${slug}`);
      seen.add(slug);
      const common = { id: `${id}-${slug}`, instruction, prompt, promptLanguage: language(prompt), task: unitTask(type, instruction) };
      if (type === 'choice') {
        const [, , , options, correctIndex, explanation] = tuple as ChoiceTuple;
        if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) throw Error(`${id}/${slug}: invalid choice index`);
        if (new Set(options.map(language)).size !== 1) throw Error(`${id}/${slug}: mixed option languages`);
        return { ...common, type, options, optionsLanguage: language(options.join(' ')), acceptedAnswers: [options[correctIndex]], explanation };
      }
      const [, , , accepted, explanation] = tuple as TextTuple;
      // The engine compares normalized values; preserve the first authored spelling
      // while collapsing harmless equivalent variants in source answer arrays.
      const keys = new Set<string>();
      const acceptedAnswers = accepted.filter(answer => {
        const key = normalizeAnswer(answer, { ignoreTerminalPunctuation: type === 'written' });
        if (keys.has(key)) return false;
        keys.add(key); return true;
      });
      return { ...common, type, acceptedAnswers, explanation, placeholder: type === 'blank' ? 'Пропущенная часть' : 'Ответ по условию' };
    });
    return { id: type, type: 'exercise' as const, completion: 'all-correct' as const, title: type === 'choice' ? 'Выбор ответа' : type === 'blank' ? 'Пропуски' : 'Письменная практика', description: 'Пять заданий с объяснениями', questions };
  };
  if (!Array.isArray(unit.rows) || unit.rows.length < 2) throw Error(`${id}: at least two theory rows required`);
  for (const key of ['title', 'subtitle', 'goal', 'intro', 'example', 'translation', 'theory', 'tip', 'review', 'summary'] as const) {
    if (typeof unit[key] !== 'string' || !unit[key].trim()) throw Error(`${id}: missing ${key}`);
  }
  const lesson: Lesson = { id, level: unitLevel(unit.number), band: unitBand(unit.number), title: unit.title, sample: false, kind: 'grammar', objectives: [unit.goal], steps: [
    { id: 'intro', type: 'intro', completion: 'acknowledge', title: 'Знакомство', description: unit.goal, heading: unit.title, text: unit.intro, example: unit.example, translation: unit.translation },
    { id: 'theory', type: 'theory', completion: 'acknowledge', title: 'Теория', description: 'Объяснения и примеры', heading: 'Как это сказать', text: unit.theory, tableCaption: 'Выражения и примеры', patternTable: true, subjectHeading: 'Выражение', rows: unit.rows.map(([subject, example, translation]) => ({ subject, form: subject, example, translation })), noteTitle: 'Обратите внимание', note: unit.tip },
    exercise('choice'), exercise('blank'), exercise('written'),
    { id: 'review', type: 'review', completion: 'acknowledge', title: 'Разбор и повторение', description: unit.review },
    { id: 'summary', type: 'summary', completion: 'acknowledge', title: 'Итоги', description: unit.summary },
  ] };
  validateCourse([{ id, title: unit.title, subtitle: unit.subtitle, objective: unit.goal, lesson }]);
  return lesson;
}

export type ReplayData = { id: string; level: Lesson['level']; groups: [string, string[], string[]?][][] };
/** Minimal engine-only lesson: contains keys/options, never rich teaching content. */
export function replayLesson(data: ReplayData): Lesson {
  return { id: data.id, level: data.level, title: '', sample: false, steps: extensionStepIds.map((id, index) => {
    const base = { id, title: '', description: '' };
    if (index >= 2 && index <= 4) return { ...base, type: 'exercise', completion: 'all-correct', questions: data.groups[index - 2].map(([id, acceptedAnswers, options]) => options
      ? { id, type: 'choice', options, acceptedAnswers, instruction: '', prompt: '', explanation: '' }
      : { id, type: index === 3 ? 'blank' : 'written', acceptedAnswers, instruction: '', prompt: '', explanation: '', placeholder: '' }) };
    return { ...base, type: id, completion: 'acknowledge' } as Lesson['steps'][number];
  }), objectives: [] };
}
export const catalogEntry = (unit: AuthoredUnit): CourseEntry => ({ id: unitId(unit.number), number: unit.number, title: unit.title, subtitle: unit.subtitle, objective: unit.goal, level: unitLevel(unit.number), band: unitBand(unit.number), stepCount: 7, questionCount: 15 });
