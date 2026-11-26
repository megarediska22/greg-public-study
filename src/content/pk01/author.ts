import type { Lesson, LessonStep, Question } from '../../types/lesson.ts';
import type { TaskAction } from '../../lib/taskIndicators.ts';

type Item = {
  id: string;
  instruction: string;
  prompt: string;
  answers: readonly string[];
  explanation: string;
  hints: readonly [string, string];
  action: TaskAction;
  strict?: boolean;
  russian?: boolean;
};
export function choice(item: Item, options: readonly string[], russianOptions = false): Question {
  return { ...base(item), type: 'choice', options, ...(russianOptions ? { optionsLanguage: 'ru' } : {}) };
}
export function input(type: 'blank' | 'written', item: Item, placeholder = 'Введите ответ'): Question {
  return { ...base(item), type, placeholder, ...(item.strict ? { normalization: { caseSensitive: true, ignoreTerminalPunctuation: false } } : {}) };
}
function base(item: Item) {
  return { id: item.id, instruction: item.instruction, prompt: item.prompt, acceptedAnswers: item.answers,
    explanation: item.explanation, hints: item.hints, task: { action: item.action }, ...(item.russian ? { promptLanguage: 'ru' as const } : {}) };
}
export function practice(id: string, title: string, questions: readonly Question[], optional = false): Extract<LessonStep, { type: 'exercise' }> {
  return { id, type: 'exercise', completion: 'all-correct', title,
    description: optional ? 'Дополнительная практика' : 'Сначала ответьте без подсказки',
    questions, ...(optional ? { optional: true } : {}) };
}
type Unit = {
  id: string;
  level: 'Pre-A1' | 'A1';
  title: string;
  goals: readonly string[];
  example: readonly [string, string];
  theory: Omit<Extract<LessonStep, { type: 'theory' }>, 'id' | 'type' | 'completion' | 'title' | 'description'>;
  choices: readonly Question[];
  blanks: readonly Question[];
  transfer: readonly Question[];
  review: string;
};
export function lesson(unit: Unit): Lesson {
  return { id: unit.id, title: unit.title, level: unit.level, sample: false, exerciseLayout: 'compact', objectives: unit.goals, steps: [
    { id: 'intro', type: 'intro', completion: 'acknowledge', title: 'Задача урока', description: 'Зачем это нужно',
      heading: unit.title, text: unit.goals.join(' '), example: unit.example[0], translation: unit.example[1] },
    { id: 'theory', type: 'theory', completion: 'acknowledge', title: 'Примеры и опоры', description: 'Посмотрите, как это работает', ...unit.theory },
    practice('choice', 'Выберите по смыслу', unit.choices),
    practice('blank', 'Заполните пропуск', unit.blanks),
    practice('written', 'Новая ситуация', unit.transfer),
    { id: 'review', type: 'review', completion: 'acknowledge', title: 'Разбор ошибок', description: 'Что стоит повторить', guidance: unit.review },
    { id: 'summary', type: 'summary', completion: 'acknowledge', title: 'Итоги', description: 'Следующий шаг' },
  ] };
}
