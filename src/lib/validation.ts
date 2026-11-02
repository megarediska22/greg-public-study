import type { CourseEntry } from '../types/lesson.ts';
import { gradeAnswer, normalizeAnswer } from './grading.ts';

/** Validate authored content before rendering; errors name the lesson/step/question. */
export function validateCourse(course: readonly CourseEntry[]): void {
  const ids = new Set<string>();
  const productionQuestionIds = new Set<string>();
  const fail = (path: string, message: string): never => { throw new Error(`Invalid lesson content at ${path}: ${message}`); };
  const validId = (id: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
  for (const entry of course) {
    if (!validId(entry.id) || ids.has(entry.id)) fail(entry.id, 'course IDs must be unique URL-safe slugs');
    ids.add(entry.id);
    const lesson = entry.lesson;
    if (!lesson) continue;
    if (lesson.id !== entry.id || !lesson.title.trim() || !lesson.objectives.length || lesson.objectives.some(objective => !objective.trim())) fail(entry.id, 'missing or inconsistent lesson metadata');
    if (lesson.steps[0]?.type !== 'intro' || lesson.steps.at(-1)?.type !== 'summary') fail(entry.id, 'start with introduction and end with summary');
    if (!lesson.sample && lesson.steps.map(step => step.type).join(',') !== 'intro,theory,exercise,exercise,exercise,review,summary') fail(entry.id, 'production lessons require exactly seven ordered steps');
    const stepIds = new Set<string>();
    const questionIds = new Set<string>();
    for (const step of lesson.steps) {
      const path = `${lesson.id}/${step.id}`;
      if (!validId(step.id) || stepIds.has(step.id) || !step.title.trim() || !step.description.trim()) fail(path, 'step IDs must be unique URL-safe slugs and titles/descriptions must be nonempty');
      stepIds.add(step.id);
      if (step.type === 'exercise') {
        if (step.completion !== 'all-correct' || !step.questions.length) fail(path, 'exercise needs questions and all-correct completion');
        if (!lesson.sample && step.questions.length < 5) fail(path, 'production exercise needs at least five questions');
        const expectedType = ['choice', 'blank', 'written'][lesson.steps.indexOf(step) - 2];
        for (const question of step.questions) {
          const location = `${path}/${question.id}`;
          if (!validId(question.id) || questionIds.has(question.id)) fail(location, 'question IDs must be unique within a lesson');
          questionIds.add(question.id);
          if (!lesson.sample) {
            if (productionQuestionIds.has(question.id)) fail(location, 'production question IDs must be unique across the course');
            productionQuestionIds.add(question.id);
            if (question.type !== expectedType) fail(location, `expected ${expectedType} questions in this section`);
          }
          if (!question.prompt.trim() || !question.instruction.trim() || !question.explanation.trim() || !question.acceptedAnswers.length || question.acceptedAnswers.some(answer => !answer.trim())) fail(location, 'prompt, instruction, explanation and accepted answers are required');
          if (question.type === 'choice' && (question.options.length < 2 || new Set(question.options).size !== question.options.length || question.options.some(option => !option.trim()) || question.acceptedAnswers.length !== 1 || !question.options.includes(question.acceptedAnswers[0]))) fail(location, 'choice needs unique options and exactly one valid answer');
          if (question.type !== 'choice' && !question.placeholder.trim()) fail(location, 'text question needs a placeholder');
          const normalized = question.acceptedAnswers.map(answer => normalizeAnswer(answer, { ignoreTerminalPunctuation: question.type === 'written', ...question.normalization }));
          if (new Set(normalized).size !== normalized.length) fail(location, 'accepted answers must be distinct after normalization');
          if (question.acceptedAnswers.some(answer => !gradeAnswer(question, answer))) fail(location, 'an accepted answer fails grading');
        }
      } else if (step.completion !== 'acknowledge') fail(path, 'reading/review/summary needs acknowledgement');
      if (step.type === 'intro' && [step.heading, step.text, step.example, step.translation].some(value => !value.trim())) fail(path, 'introduction needs a heading, explanation and translated example');
      if (step.type === 'theory' && ([step.heading, step.text, step.tableCaption, step.noteTitle, step.note].some(value => !value.trim()) || !step.rows.length || step.rows.some(row => [row.subject, row.form, row.example, row.translation].some(value => !value.trim())))) fail(path, 'theory needs explanations, translated table rows and a common-mistake note');
    }
  }
}
