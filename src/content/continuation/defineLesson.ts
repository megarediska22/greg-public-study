import type { Lesson, LessonStep, Question } from '../../types/lesson.ts';
import { taskActions, validateTaskIndicators } from '../../lib/taskIndicators.ts';
import type { TaskAction, TaskCatalog, TaskMetadata } from '../../lib/taskIndicators.ts';
import { validateCourse } from '../../lib/validation.ts';

type StepOf<T extends LessonStep['type']> = Extract<LessonStep, { type: T }>;
type Reading<T extends 'intro' | 'theory' | 'review' | 'summary'> = Omit<StepOf<T>, 'id' | 'type' | 'completion'>;
type QuestionOf<T extends Question['type']> = Extract<Question, { type: T }>;
// The production text-question branch shares two types, so narrow distributively.
type TextQuestion = Extract<Question, { placeholder: string }>;
type ActionFor<T extends Question['type']> = {
  [A in TaskAction]: T extends (typeof taskActions)[A]['types'][number] ? A : never
}[TaskAction];
export type AuthoredQuestion<T extends Question['type']> =
  Omit<T extends 'choice' ? QuestionOf<'choice'> : TextQuestion, 'type' | 'placeholder'> &
  (T extends 'choice' ? object : { placeholder?: string }) &
  { task: Omit<TaskMetadata, 'action'> & { action: ActionFor<T> } };
export type FiveQuestions<T extends Question['type']> = readonly [
  AuthoredQuestion<T>, AuthoredQuestion<T>, AuthoredQuestion<T>, AuthoredQuestion<T>, AuthoredQuestion<T>,
];
type Exercise<T extends Question['type']> = {
  title: string; description: string; questions: FiveQuestions<T>;
};
export type LessonDefinition = Pick<Lesson, 'id' | 'title' | 'objectives'> & {
  intro: Reading<'intro'>;
  theory: Reading<'theory'>;
  choice: Exercise<'choice'>;
  blank: Exercise<'blank'>;
  written: Exercise<'written'>;
  review: Reading<'review'>;
  summary: Reading<'summary'>;
};
export type DefinedLesson = { lesson: Lesson; tasks: TaskCatalog };

/** Reject collisions even if two sources supply identical metadata. */
export function mergeTaskCatalogs(...catalogs: readonly TaskCatalog[]): TaskCatalog {
  const result: Record<string, TaskMetadata> = Object.create(null);
  for (const catalog of catalogs) for (const [id, task] of Object.entries(catalog)) {
    if (Object.hasOwn(result, id)) throw Error(`Duplicate task intent: ${id}`);
    result[id] = task;
  }
  return result;
}

/** Content only: no registration, storage changes, inferred intent or generated exercises. */
export function defineLesson(definition: LessonDefinition): DefinedLesson {
  const { id, title, objectives } = definition;
  const tasks: Record<string, TaskMetadata> = Object.create(null);
  const reading = <T extends 'intro' | 'theory' | 'review' | 'summary'>(type: T) =>
    ({ ...definition[type], id: type, type, completion: 'acknowledge' as const });
  const exercise = (type: 'choice' | 'blank' | 'written'): StepOf<'exercise'> => {
    const group = definition[type];
    if (group.questions.length !== 5) throw Error(`${id}/${type}: exactly five authored questions required`);
    const questions = group.questions.map(({ task, ...question }) => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(question.id)) throw Error(`${id}/${type}: invalid local question ID`);
      const questionId = `${id}-${question.id}`;
      if (Object.hasOwn(tasks, questionId)) throw Error(`Duplicate task intent: ${questionId}`);
      tasks[questionId] = { ...task };
      return type === 'choice'
        ? { ...question, id: questionId, type } as Question
        : { placeholder: 'Ваш ответ', ...question, id: questionId, type } as Question;
    });
    return { id: type, type: 'exercise', completion: 'all-correct', title: group.title, description: group.description, questions };
  };
  const lesson: Lesson = {
    id, title, objectives, level: 'A1', sample: false, kind: 'grammar',
    steps: [reading('intro'), reading('theory'), exercise('choice'), exercise('blank'), exercise('written'), reading('review'), reading('summary')],
  };
  const course = [{ id, title, subtitle: title, objective: objectives[0], lesson }];
  validateCourse(course);
  validateTaskIndicators(course, tasks);
  return { lesson, tasks };
}
