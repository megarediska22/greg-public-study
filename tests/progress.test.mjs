import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleLesson } from './fixtures/sampleLesson.ts';
import { emptyProgress, updateProgress, isLessonUnlocked, isStepUnlocked, isStepComplete, getScore, resumeStep, decodeProgress, loadProgress, saveProgress, PROGRESS_KEY } from '../src/lib/progress.ts';

const course = ['to-be', 'present-simple', 'do-does'].map(id => ({ id, lesson: { ...sampleLesson, id } }));
function act(progress, type, stepId, extra = {}, lessonId = 'to-be') {
  return updateProgress(progress, course, { type, lessonId, stepId, ...extra });
}
function readyForPractice() {
  return act(act(emptyProgress(), 'complete', 'intro'), 'complete', 'theory');
}
function practiceComplete() {
  let progress = readyForPractice();
  for (const step of sampleLesson.steps.filter(step => step.type === 'exercise')) {
    for (const question of step.questions) progress = act(progress, 'answer', step.id, { questionId: question.id, answer: question.acceptedAnswers[0] });
  }
  return progress;
}
function lessonComplete() { return act(act(practiceComplete(), 'complete', 'review'), 'complete', 'summary'); }
function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('initial state opens only first lesson and its first step', () => {
  const progress = emptyProgress();
  assert.equal(isLessonUnlocked(progress, course, 'to-be'), true);
  assert.equal(isLessonUnlocked(progress, course, 'present-simple'), false);
  assert.equal(isLessonUnlocked(progress, course, 'missing'), false);
  assert.equal(isStepUnlocked(progress, sampleLesson, 'intro'), true);
  assert.equal(isStepUnlocked(progress, sampleLesson, 'theory'), false);
  assert.equal(isStepUnlocked(progress, sampleLesson, 'missing'), false);
});
test('direct mutations cannot skip locked lessons, steps or finish exercises with Next', () => {
  const progress = emptyProgress();
  assert.equal(act(progress, 'complete', 'summary'), progress);
  assert.equal(act(progress, 'complete', 'intro', {}, 'present-simple'), progress);
  assert.equal(act(progress, 'answer', 'choice', { questionId: 'choose-am', answer: 'am' }), progress);
  const ready = readyForPractice();
  assert.equal(act(ready, 'complete', 'choice'), ready);
  assert.equal(isStepUnlocked(ready, sampleLesson, 'blank'), false);
});
test('wrong answers block completion, require retry, then unlock on success without losing history', () => {
  const initial = readyForPractice();
  const wrong = act(initial, 'answer', 'choice', { questionId: 'choose-am', answer: 'is' });
  assert.equal(isStepComplete(wrong, 'to-be', 'choice'), false);
  assert.equal(isStepUnlocked(wrong, sampleLesson, 'blank'), false);
  assert.equal(act(wrong, 'answer', 'choice', { questionId: 'choose-am', answer: 'am' }), wrong);
  const retry = act(wrong, 'retry', 'choice', { questionId: 'choose-am' });
  assert.equal(retry.lessons['to-be'].answers['choose-am'].retrying, true);
  const correct = act(retry, 'answer', 'choice', { questionId: 'choose-am', answer: 'am' });
  assert.equal(isStepUnlocked(correct, sampleLesson, 'blank'), true);
  assert.deepEqual(correct.lessons['to-be'].answers['choose-am'].attempts, [{ answer: 'is', correct: false }, { answer: 'am', correct: true }]);
  assert.deepEqual(getScore(correct, sampleLesson), { total: 3, correct: 1, firstTry: 0, attempts: 2 });
  assert.equal(initial.lessons['to-be'].answers['choose-am'], undefined);
});
test('rejects empty answers, unknown questions/options and retry before submission', () => {
  const progress = readyForPractice();
  for (const extra of [{ questionId: 'choose-am', answer: '  ' }, { questionId: 'missing', answer: 'am' }, { questionId: 'choose-am', answer: 'unknown' }, { questionId: 'choose-am', answer: 'x'.repeat(2001) }]) assert.equal(act(progress, 'answer', 'choice', extra), progress);
  assert.equal(act(progress, 'retry', 'choice', { questionId: 'choose-am' }), progress);
});
test('multi-question section requires every question to be correct', () => {
  const expanded = structuredClone(course);
  const step = expanded[0].lesson.steps[2];
  step.questions.push({ ...step.questions[0], id: 'second-question' });
  const answer = (progress, questionId) => updateProgress(progress, expanded, { type: 'answer', lessonId: 'to-be', stepId: 'choice', questionId, answer: 'am' });
  const one = answer(readyForPractice(), 'choose-am');
  assert.equal(isStepComplete(one, 'to-be', 'choice'), false);
  assert.equal(isStepComplete(answer(one, 'second-question'), 'to-be', 'choice'), true);
});
test('practice, review and summary have separate completion rules', () => {
  const practice = practiceComplete();
  assert.equal(isStepUnlocked(practice, sampleLesson, 'review'), true);
  assert.equal(isStepUnlocked(practice, sampleLesson, 'summary'), false);
  const review = act(practice, 'complete', 'review');
  assert.equal(isStepUnlocked(review, sampleLesson, 'summary'), true);
  assert.deepEqual(review.completedLessons, []);
  const complete = act(review, 'complete', 'summary');
  assert.deepEqual(complete.completedLessons, ['to-be']);
  assert.equal(isLessonUnlocked(complete, course, 'present-simple'), true);
  assert.equal(isLessonUnlocked(complete, course, 'do-does'), false);
});
test('completed lessons and steps stay accessible and cannot be downgraded by review', () => {
  const complete = lessonComplete();
  for (const step of sampleLesson.steps) assert.equal(isStepUnlocked(complete, sampleLesson, step.id), true);
  assert.equal(act(complete, 'retry', 'choice', { questionId: 'choose-am' }), complete);
  assert.equal(act(complete, 'answer', 'choice', { questionId: 'choose-am', answer: 'is' }), complete);
  assert.equal(act(complete, 'complete', 'intro'), complete);
});
test('completing the second lesson unlocks the third and keeps lesson results independent', () => {
  let progress = lessonComplete();
  for (const step of sampleLesson.steps) {
    if (step.type === 'exercise') {
      for (const question of step.questions) progress = act(progress, 'answer', step.id, { questionId: question.id, answer: question.acceptedAnswers[0] }, 'present-simple');
    } else progress = act(progress, 'complete', step.id, {}, 'present-simple');
  }
  assert.equal(isLessonUnlocked(progress, course, 'do-does'), true);
  assert.deepEqual(progress.completedLessons, ['to-be', 'present-simple']);
  assert.deepEqual(getScore(progress, course[1].lesson), { total: 3, correct: 3, firstTry: 3, attempts: 3 });
  assert.deepEqual(decodeProgress(JSON.stringify(progress), course), { progress, recovered: false });
});
test('visit saves only accessible locations; resume works without affecting scores', () => {
  const initial = emptyProgress();
  assert.equal(act(initial, 'visit', 'summary'), initial);
  assert.equal(resumeStep(initial, sampleLesson), 'intro');
  const progress = act(readyForPractice(), 'visit', 'theory');
  assert.deepEqual(progress.lastVisited, { lessonId: 'to-be', stepId: 'theory' });
  assert.equal(resumeStep(progress, sampleLesson), 'theory');
  assert.equal(getScore(progress, sampleLesson).attempts, 0);
});
test('local storage round trip preserves completion, scores, history and location', () => {
  const storage = memoryStorage();
  const complete = act(lessonComplete(), 'visit', 'summary');
  assert.equal(saveProgress(storage, complete), true);
  assert.equal(JSON.parse(storage.getItem(PROGRESS_KEY)).version, 1);
  assert.deepEqual(loadProgress(storage, course), { progress: complete, recovered: false, unavailable: false });
});
test('wrong attempts and an unfinished retry survive refresh', () => {
  let progress = act(readyForPractice(), 'answer', 'choice', { questionId: 'choose-am', answer: 'are' });
  const wrong = decodeProgress(JSON.stringify(progress), course);
  assert.deepEqual(wrong, { progress, recovered: false });
  progress = act(progress, 'retry', 'choice', { questionId: 'choose-am' });
  assert.deepEqual(decodeProgress(JSON.stringify(progress), course), { progress, recovered: false });
});
test('missing, malformed, invalid-shape and incompatible storage are handled safely', () => {
  assert.deepEqual(decodeProgress(null, course), { progress: emptyProgress(), recovered: false });
  for (const raw of ['{bad', 'null', '[]', '42', '{"version":99,"lessons":{}}', '{"version":1,"lessons":[]}']) assert.deepEqual(decodeProgress(raw, course), { progress: emptyProgress(), recovered: true });
});
test('partial recovery preserves valid earlier steps while rejecting unearned completion', () => {
  const saved = lessonComplete();
  saved.lessons['to-be'].answers['choose-am'].attempts = [{ answer: 'is', correct: true }];
  const { progress, recovered } = decodeProgress(JSON.stringify(saved), course);
  assert.equal(recovered, true);
  assert.deepEqual(progress.lessons['to-be'].completedSteps, ['intro', 'theory']);
  assert.equal(progress.lessons['to-be'].answers['choose-am'].attempts[0].correct, false);
  assert.equal(isLessonUnlocked(progress, course, 'present-simple'), false);
});
test('malformed individual answers do not discard valid earlier progress', () => {
  const saved = practiceComplete();
  saved.lessons['to-be'].answers['negative-blank'] = { attempts: [null, {}, { answer: 20, correct: true }], retrying: false };
  saved.lastVisited = { lessonId: 'to-be', stepId: 'summary' };
  const result = decodeProgress(JSON.stringify(saved), course);
  assert.equal(result.recovered, true);
  assert.deepEqual(result.progress.lessons['to-be'].completedSteps, ['intro', 'theory', 'choice']);
  assert.equal(result.progress.lastVisited, null);
});
test('adding future lessons preserves earned completion without unlocking beyond prerequisites', () => {
  const progress = lessonComplete();
  const expanded = [...course, { id: 'future-lesson', lesson: { ...sampleLesson, id: 'future-lesson' } }];
  assert.deepEqual(decodeProgress(JSON.stringify(progress), expanded).progress, progress);
  assert.equal(isLessonUnlocked(progress, expanded, 'future-lesson'), false);
});
test('missing Phase 3 content cannot be completed even if its catalog card is unlocked', () => {
  const pending = [course[0], { id: 'present-simple' }, { id: 'do-does' }];
  const progress = lessonComplete();
  assert.equal(isLessonUnlocked(progress, pending, 'present-simple'), true);
  assert.equal(updateProgress(progress, pending, { type: 'complete', lessonId: 'present-simple', stepId: 'summary' }), progress);
});
test('denied storage reads and quota write failures never throw', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(loadProgress(denied, course), { progress: emptyProgress(), recovered: false, unavailable: true });
  assert.equal(saveProgress(denied, lessonComplete()), false);
});
test('reset can persist an empty schema without modifying separate theme data', () => {
  const storage = memoryStorage();
  storage.setItem('gps.theme.v1', 'dark');
  saveProgress(storage, lessonComplete());
  saveProgress(storage, emptyProgress());
  assert.deepEqual(loadProgress(storage, course).progress, emptyProgress());
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
});
