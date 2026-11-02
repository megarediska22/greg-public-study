import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeAnswer, normalizeAnswer } from '../src/lib/grading.ts';
import { sampleLesson } from './fixtures/sampleLesson.ts';
import { validateCourse } from '../src/lib/validation.ts';

const questions = sampleLesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []);
const [choice, blank, written] = questions;
const course = [{ id: sampleLesson.id, lesson: sampleLesson }];

test('normalizes surrounding/repeated whitespace, case and curly apostrophes', () => {
  assert.equal(normalizeAnswer('  I’M   NOT\tready.  '), "i'm not ready.");
  assert.equal(normalizeAnswer('Iʼm'), "i'm");
});
test('harmless terminal punctuation is optional; meaningful internal punctuation is preserved', () => {
  assert.equal(gradeAnswer(written, '  ARE   you ready. '), true);
  assert.equal(gradeAnswer(written, 'are you ready'), true);
  assert.equal(gradeAnswer(written, 'Are, you ready?'), false);
  assert.equal(gradeAnswer(written, 'You are ready?'), false);
});
test('accepted variants are explicit and normalize contractions', () => {
  for (const answer of ['am not', ' AM   NOT ', '’m not', "'m not"]) assert.equal(gradeAnswer(blank, answer), true);
  assert.equal(gradeAnswer(blank, 'is not'), false);
  assert.equal(gradeAnswer(blank, ''), false);
  assert.equal(gradeAnswer(blank, 'am not.'), false);
});
test('normalization configuration overrides defaults', () => {
  const exact = { ...written, normalization: { caseSensitive: true, ignoreTerminalPunctuation: false } };
  assert.equal(gradeAnswer(exact, 'Are you ready?'), true);
  assert.equal(gradeAnswer(exact, 'are you ready?'), false);
  assert.equal(gradeAnswer(exact, 'Are you ready'), false);
});
test('choice grades only configured options and the single answer key', () => {
  assert.equal(gradeAnswer(choice, 'am'), true);
  assert.equal(gradeAnswer(choice, 'is'), false);
  assert.equal(gradeAnswer(choice, 'AM'), false);
  assert.equal(gradeAnswer(choice, 'not an option'), false);
});
test('all sample answer keys validate', () => {
  assert.doesNotThrow(() => validateCourse(course));
  for (const question of questions) for (const answer of question.acceptedAnswers) assert.equal(gradeAnswer(question, answer), true);
});
test('content errors identify invalid question keys and duplicate step IDs', () => {
  const bad = structuredClone(course);
  bad[0].lesson.steps[2].questions[0].acceptedAnswers = ['invalid'];
  assert.throws(() => validateCourse(bad), /to-be\/choice\/choose-am.*exactly one valid answer/);
  const duplicate = structuredClone(course);
  duplicate[0].lesson.steps[1].id = 'intro';
  assert.throws(() => validateCourse(duplicate), /to-be\/intro.*unique/);
});
