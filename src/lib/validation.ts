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
    if (lesson.kind !== undefined && !['grammar', 'vocabulary'].includes(lesson.kind)) fail(entry.id, 'unknown lesson kind');
    if (lesson.id !== entry.id || !lesson.title.trim() || !lesson.objectives.length || lesson.objectives.some(objective => !objective.trim())) fail(entry.id, 'missing or inconsistent lesson metadata');
    if (lesson.steps[0]?.type !== 'intro' || lesson.steps.at(-1)?.type !== 'summary') fail(entry.id, 'start with introduction and end with summary');
    const discoveryType = lesson.kind === 'vocabulary' ? 'vocabulary' : 'theory';
    if (!lesson.sample && lesson.steps.map(step => step.type).join(',') !== `intro,${discoveryType},exercise,exercise,exercise,review,summary`) fail(entry.id, 'production lessons require exactly seven ordered steps');
    const vocabularyIds = new Set<string>();
    for (const step of lesson.steps) if (step.type === 'vocabulary') {
      const path = `${lesson.id}/${step.id}`;
      if (lesson.kind !== 'vocabulary' || !step.heading.trim() || !step.text.trim() || !step.note.trim() || step.items.length < 6 || step.items.length > 12) fail(path, 'vocabulary discovery needs 6–12 complete cards');
      const terms = new Set<string>();
      for (const item of step.items) {
        if (!validId(item.id) || vocabularyIds.has(item.id) || [item.term, item.meaningRu, item.partOfSpeech, item.example, item.exampleTranslation].some(value => !value.trim()) || (item.usage !== undefined && !item.usage.trim()) || terms.has(item.term.toLowerCase())) fail(`${path}/${item.id}`, 'vocabulary cards need unique IDs/terms and complete translated examples');
        vocabularyIds.add(item.id);
        terms.add(item.term.toLowerCase());
      }
    }
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
          if (question.vocabularyId !== undefined && !vocabularyIds.has(question.vocabularyId)) fail(location, 'unknown vocabulary reference');
          if (lesson.kind === 'vocabulary' && !question.vocabularyId) fail(location, 'vocabulary practice needs a card reference');
          if ([question.promptLanguage, question.optionsLanguage].some(value => value !== undefined && !['ru', 'en'].includes(value))) fail(location, 'question language must be en or ru');
          if (question.optionsLanguage !== undefined && question.type !== 'choice') fail(location, 'optionsLanguage is only valid for choices');
          if (!validId(question.id) || questionIds.has(question.id)) fail(location, 'question IDs must be unique within a lesson');
          questionIds.add(question.id);
          if (!lesson.sample) {
            if (productionQuestionIds.has(question.id)) fail(location, 'production question IDs must be unique across the course');
            productionQuestionIds.add(question.id);
            if (question.type !== expectedType) fail(location, `expected ${expectedType} questions in this section`);
          }
          if (question.sentenceType !== undefined && (question.type !== 'written' || !['affirmative', 'negative', 'question', 'short-affirmative', 'short-negative'].includes(question.sentenceType))) fail(location, 'sentenceType must describe a written sentence task');
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
      if (step.type === 'theory' && step.blocks) {
        const titles = new Set<string>();
        for (const block of step.blocks) {
          const location = `${path}/${block.title}`;
          if (!block.title.trim() || !block.text.trim() || titles.has(block.title)) fail(location, 'theory blocks need unique titles and nonempty explanations');
          titles.add(block.title);
          if (block.formula !== undefined && !block.formula.trim()) fail(location, 'theory formulas must be nonempty');
          if ((block.example !== undefined || block.translation !== undefined) && (!block.example?.trim() || !block.translation?.trim())) fail(location, 'theory examples require both English text and a translation');
        }
      }
    }
  }
}
