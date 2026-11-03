import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { grammarLessons as lessons } from '../src/content/course.ts';
import { validateCourse } from '../src/lib/validation.ts';

const questions = lessons.flatMap(({lesson}) => lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []));
test('UX metadata preserves the complete pre-change catalog including all 150 answer keys', () => {
  const original = JSON.parse(JSON.stringify(lessons));
  for (const {lesson} of original) for (const step of lesson.steps) if (step.type === 'exercise') for (const question of step.questions) delete question.sentenceType;
  assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), 'df8daf3bb478da053d3eebe2630db8aef9a9a9557b1c79661d9c287df506ac1a');
  assert.equal(questions.length, 150);
});
test('intent identifies requested output, including short answers rather than the input question', () => {
  const byId = Object.fromEntries(questions.map(q => [q.id,q]));
  assert.equal(questions.filter(q => q.sentenceType).length, 43);
  assert.equal(byId['ready-question'].sentenceType, 'question');
  assert.equal(byId['to-be-student-negative'].sentenceType, 'negative');
  assert.equal(byId['pc-run-now'].sentenceType, 'affirmative');
  assert.equal(byId['dd-he-negative-answer'].sentenceType, 'short-negative');
  assert.equal(byId['to-be-short-answer'].sentenceType, 'short-affirmative');
  assert.equal(byId['art-fix-apple'].sentenceType, undefined);
  assert.equal(byId['dem-books-plural'].sentenceType, undefined);
});
test('validation rejects unknown or misplaced intent while legacy questions remain valid', () => {
  const course = structuredClone(lessons);
  const question = course[0].lesson.steps[2].questions[0];
  question.sentenceType = 'negative';
  assert.throws(() => validateCourse(course), /sentenceType/);
  delete question.sentenceType;
  const written = course[0].lesson.steps[4].questions[0];
  written.sentenceType = 'guess-from-punctuation';
  assert.throws(() => validateCourse(course), /sentenceType/);
  delete written.sentenceType;
  assert.doesNotThrow(() => validateCourse(course));
});
