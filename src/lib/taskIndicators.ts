import type { CourseEntry, SentenceType } from '../types/lesson.ts';

// Learner actions, never answer keys or grading statuses.
export const taskActions = {
  choose: { icon: '👀', label: 'Выбери ответ', hint: 'Отметь один вариант.', types: ['choice'] },
  'choose-article': { icon: '👀', label: 'Выбери артикль', hint: 'Отметь один артикль.', types: ['choice'] },
  'fill-article': { icon: '🔤', label: 'Вставь артикль', hint: 'Напиши только артикль.', types: ['blank'] },
  'plural-word': { icon: '🔤', label: 'Множественное число', hint: 'Напиши слово во множественном числе.', types: ['blank'] },
  fill: { icon: '🔤', label: 'Вставь слова', hint: 'Напиши только пропущенную часть.', types: ['blank'] },
  build: { icon: '✍️', label: 'Составь предложение', hint: 'Напиши предложение целиком.', types: ['written'] },
  short: { icon: '💬', label: 'Коротко ответь', hint: 'Напиши короткий ответ целиком.', types: ['written'] },
  fix: { icon: '🔄', label: 'Исправь ошибку', hint: 'Напиши исправленную фразу целиком.', types: ['written'] },
  article: { icon: '🔤', label: 'Добавь артикль', hint: 'Напиши нужное предложение целиком.', types: ['written'] },
  plural: { icon: '✍️', label: 'Множественное число', hint: 'Измени фразу и напиши её целиком.', types: ['written'] },
  'choose-translation': { icon: '🌐', label: 'Выбери перевод', hint: 'Отметь значение слова или выражения.', types: ['choice'] },
  recall: { icon: '✍️', label: 'Вспомни и напиши', hint: 'Напиши слово или выражение по-английски.', types: ['blank'] },
  translate: { icon: '🌐', label: 'Переведи', hint: 'Напиши фразу целиком по-английски.', types: ['written'] },
  greet: { icon: '💬', label: 'Поздоровайся', hint: 'Напиши реплику по-английски.', types: ['written'] },
  react: { icon: '💬', label: 'Отреагируй', hint: 'Напиши короткую реплику по ситуации.', types: ['written'] },
  farewell: { icon: '💬', label: 'Попрощайся', hint: 'Напиши реплику по-английски.', types: ['written'] },
  ask: { icon: '❔', label: 'Задай вопрос', hint: 'Напиши вопрос целиком по-английски.', types: ['written'] },
  request: { icon: '💬', label: 'Вежливо попроси', hint: 'Напиши просьбу целиком по-английски.', types: ['written'] },
  order: { icon: '💬', label: 'Сделай заказ', hint: 'Напиши реплику для заказа.', types: ['written'] },
  agree: { icon: '💬', label: 'Согласись', hint: 'Напиши короткую реплику по ситуации.', types: ['written'] },
  thank: { icon: '💬', label: 'Поблагодари', hint: 'Напиши реплику по-английски.', types: ['written'] },
  invite: { icon: '💬', label: 'Предложи встречу', hint: 'Напиши приглашение по-английски.', types: ['written'] },
  respond: { icon: '💬', label: 'Ответь в ситуации', hint: 'Напиши реплику по-английски.', types: ['written'] },
} as const;
export type TaskAction = keyof typeof taskActions;
export type TaskMetadata = { action: TaskAction; form?: SentenceType };
export type TaskCatalog = Readonly<Record<string, TaskMetadata>>;

export const taskForms: Record<SentenceType, { icon: string; label: string }> = {
  affirmative: { icon: '✔️', label: 'Утверждение' },
  negative: { icon: '✖️', label: 'Отрицание' },
  question: { icon: '❔', label: 'Вопрос' },
  'short-affirmative': { icon: '✔️', label: 'Короткий ответ: да' },
  'short-negative': { icon: '✖️', label: 'Короткий ответ: нет' },
};

export function taskPresentation(task: TaskMetadata) {
  const action = taskActions[task.action];
  const form = task.form ? taskForms[task.form] : undefined;
  return { icon: form?.icon ?? action.icon, label: form?.label ?? action.label, detail: form ? `${action.label}. ${action.hint}` : action.hint };
}

/** Missing author intent is a content error, never silently guessed from language. */
export function validateTaskIndicators(course: readonly CourseEntry[], metadata: TaskCatalog) {
  const ids = new Set<string>();
  for (const { lesson } of course) for (const step of lesson?.steps ?? []) {
    if (step.type !== 'exercise') continue;
    for (const question of step.questions) {
      ids.add(question.id);
      const task = metadata[question.id];
      const path = `${lesson!.id}/${step.id}/${question.id}`;
      if (!task || !Object.hasOwn(taskActions, task.action)) throw Error(`Missing or unknown task indicator: ${path}`);
      const action = taskActions[task.action];
      if (!(action.types as readonly string[]).includes(question.type)) throw Error(`Task indicator has incompatible action: ${path}`);
      if (task.form !== undefined && !Object.hasOwn(taskForms, task.form)) throw Error(`Unknown task form: ${path}`);
      if (question.sentenceType && task.form !== question.sentenceType) throw Error(`Conflicting task form: ${path}`);
    }
  }
  // A subset catalog may be validated without discarding metadata for the rest.
  return ids.size;
}
