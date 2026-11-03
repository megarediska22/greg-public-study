import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarLessons as lessons } from '../src/content/course.ts';
import { getMissingAnswers, getQuestionState } from '../src/lib/exercise.ts';
import { emptyProgress, updateProgress, getScore, isStepComplete, isStepUnlocked, decodeProgress, PROGRESS_KEY } from '../src/lib/progress.ts';
import { openProgressSession } from '../src/lib/progressStorage.ts';
import { createQaProgress, restoreQaProgress } from '../src/dev/qaState.ts';

const lesson = lessons[0].lesson;
const step = lesson.steps[2];
const drafts = Object.fromEntries(step.questions.map(question => [question.id, question.acceptedAnswers[0]]));
function ready() {
  let progress = emptyProgress();
  for (const stepId of ['intro', 'theory']) progress = updateProgress(progress, lessons, { type: 'complete', lessonId: lesson.id, stepId });
  return progress;
}
function check(progress, answers = drafts, stepId = step.id, lessonId = lesson.id) {
  return updateProgress(progress, lessons, { type: 'check-exercise', lessonId, stepId, answers });
}
function answers(progress) { return progress.lessons[lesson.id]?.answers ?? {}; }

test('all 150 questions start editable; even correct-looking drafts reveal no correctness', () => {
  for (const { lesson } of lessons) for (const step of lesson.steps) if (step.type === 'exercise') {
    for (const question of step.questions) for (const draft of ['', question.acceptedAnswers[0], 'incorrect']) {
      assert.deepEqual(getQuestionState(undefined, draft), { locked: false, feedback: null, edited: false });
    }
  }
});

test('missing answers identify exact fields and reject the entire batch without any attempts', () => {
  const progress = ready();
  const partial = { ...drafts, [step.questions[1].id]: '', [step.questions[4].id]: '  ' };
  assert.deepEqual(getMissingAnswers(step.questions, answers(progress), partial), [step.questions[1].id, step.questions[4].id]);
  assert.equal(check(progress, partial), progress);
  assert.equal(getScore(progress, lesson, step).attempts, 0);
  assert.equal(partial[step.questions[0].id], drafts[step.questions[0].id]);
});

test('one action grades all five answers together and retains every submitted value', () => {
  const batch = { ...drafts, [step.questions[1].id]: 'invalid', [step.questions[3].id]: 'invalid' };
  // An invalid choice value is rejected atomically, rather than recorded as a learner mistake.
  assert.equal(check(ready(), batch).lessons[lesson.id].answers[step.questions[0].id], undefined);
  const mixed = { ...drafts };
  for (const index of [1, 3]) mixed[step.questions[index].id] = step.questions[index].options.find(option => option !== step.questions[index].acceptedAnswers[0]);
  const progress = check(ready(), mixed);
  assert.deepEqual(getScore(progress, lesson, step), { total: 5, correct: 3, firstTry: 3, attempts: 5 });
  for (const question of step.questions) {
    assert.equal(answers(progress)[question.id].attempts.length, 1);
    assert.equal(answers(progress)[question.id].attempts[0].answer, mixed[question.id]);
  }
  assert.equal(isStepComplete(progress, lesson.id, step.id), false);
});

test('correct answers stay locked, incorrect answers stay editable, edits are not regraded', () => {
  const wrong = step.questions[1];
  const progress = check(ready(), { ...drafts, [wrong.id]: wrong.options.find(option => option !== wrong.acceptedAnswers[0]) });
  assert.deepEqual(getQuestionState(answers(progress)[step.questions[0].id], drafts[step.questions[0].id]), { locked: true, feedback: 'correct', edited: false });
  assert.deepEqual(getQuestionState(answers(progress)[wrong.id], wrong.acceptedAnswers[0]), { locked: false, feedback: 'incorrect', edited: true });
  assert.equal(answers(progress)[wrong.id].attempts.length, 1);
});

test('rechecking touches only unresolved questions and unlocks the next step on all-correct', () => {
  const wrong = step.questions[1];
  const first = check(ready(), { ...drafts, [wrong.id]: wrong.options.find(option => option !== wrong.acceptedAnswers[0]) });
  assert.equal(isStepUnlocked(first, lesson, lesson.steps[3].id), false);
  const next = check(first, { [wrong.id]: wrong.acceptedAnswers[0] });
  assert.deepEqual(getScore(next, lesson, step), { total: 5, correct: 5, firstTry: 4, attempts: 6 });
  assert.equal(isStepUnlocked(next, lesson, lesson.steps[3].id), true);
  for (const question of step.questions.filter(question => question.id !== wrong.id)) assert.equal(answers(next)[question.id], answers(first)[question.id]);
  assert.equal(check(next), next);
  assert.equal(next.lastVisited, null); // Checking never navigates to the next step.
});

test('repeated wrong batches append attempts without an explicit per-question retry action', () => {
  const wrong = step.questions[1];
  const wrongValue = wrong.options.find(option => option !== wrong.acceptedAnswers[0]);
  const first = check(ready(), { ...drafts, [wrong.id]: wrongValue });
  const second = check(first, { [wrong.id]: wrongValue });
  assert.deepEqual(answers(second)[wrong.id].attempts, [{ answer: wrongValue, correct: false }, { answer: wrongValue, correct: false }]);
  assert.equal(getScore(second, lesson, step).correct, 4);
});

test('a missing correction neither rechecks nor consumes attempts for any unresolved answer', () => {
  const wrong = step.questions[1];
  const first = check(ready(), { ...drafts, [wrong.id]: wrong.options.find(option => option !== wrong.acceptedAnswers[0]) });
  assert.deepEqual(getMissingAnswers(step.questions, answers(first), {}), [wrong.id]);
  assert.equal(check(first, {}), first);
});

test('batches preserve sequential lesson/step guards and reject invalid or oversized inputs', () => {
  const empty = emptyProgress();
  assert.equal(check(empty), empty);
  assert.equal(check(ready(), drafts, 'choice', lessons[1].id).lessons[lessons[1].id], undefined);
  assert.equal(check(ready(), drafts, 'intro').lessons[lesson.id].answers[step.questions[0].id], undefined);
  const progress = ready();
  assert.equal(check(progress, { ...drafts, [step.questions[0].id]: 'x'.repeat(2001) }), progress);
});

test('batch grading works on all 30 sections and all 150 existing choice, blank and written questions', () => {
  let progress = emptyProgress();
  const types = new Set();
  for (const { lesson } of lessons) for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    if (step.type === 'exercise') {
      const values = Object.fromEntries(step.questions.map(question => {
        types.add(question.type);
        return [question.id, question.acceptedAnswers[0]];
      }));
      progress = updateProgress(progress, lessons, { ...base, type: 'check-exercise', answers: values });
      assert.deepEqual(getScore(progress, lesson, step), { total: 5, correct: 5, firstTry: 5, attempts: 5 });
    } else progress = updateProgress(progress, lessons, { ...base, type: 'complete' });
  }
  assert.deepEqual([...types].sort(), ['blank', 'choice', 'written']);
  assert.equal(progress.completedLessons.length, 10);
  assert.deepEqual(decodeProgress(JSON.stringify(progress), lessons), { progress, recovered: false });
});

test('batch attempts use the v1 schema, persist and reload with read-only startup', () => {
  const progress = check(ready());
  const values = new Map();
  const writes = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  const session = openProgressSession(storage, lessons);
  assert.equal(session.persist(progress), 'saved');
  assert.equal(JSON.parse(values.get(PROGRESS_KEY)).version, 1);
  const reloaded = openProgressSession(storage, lessons);
  assert.deepEqual(reloaded.progress, progress);
  assert.equal(reloaded.persist(reloaded.progress), 'unchanged');
  assert.deepEqual(writes, [PROGRESS_KEY]);
});

test('legacy per-question successes, wrong attempts and pending retries can join a batch unchanged', () => {
  const first = step.questions[0];
  const second = step.questions[1];
  let legacy = updateProgress(ready(), lessons, { type: 'answer', lessonId: lesson.id, stepId: step.id, questionId: first.id, answer: first.acceptedAnswers[0] });
  legacy = updateProgress(legacy, lessons, { type: 'answer', lessonId: lesson.id, stepId: step.id, questionId: second.id, answer: second.options.find(option => option !== second.acceptedAnswers[0]) });
  legacy = updateProgress(legacy, lessons, { type: 'retry', lessonId: lesson.id, stepId: step.id, questionId: second.id });
  const raw = JSON.stringify(legacy, null, 2);
  const writes = [];
  const session = openProgressSession({ getItem: () => raw, setItem: (...args) => writes.push(args) }, lessons);
  assert.deepEqual(session.progress, legacy);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.deepEqual(writes, []);
  const corrected = check(session.progress);
  assert.equal(answers(corrected)[first.id], answers(session.progress)[first.id]);
  assert.deepEqual(answers(corrected)[first.id], answers(legacy)[first.id]);
  assert.equal(answers(corrected)[second.id].attempts.length, 2);
  assert.equal(answers(corrected)[second.id].retrying, false);
  assert.deepEqual(decodeProgress(JSON.stringify(corrected), lessons), { progress: corrected, recovered: false });
});

test('QA keeps every lesson open without exposing premature real correctness, and batch results reload', () => {
  const qa = createQaProgress(lessons);
  assert.equal(getScore(qa, lesson, step).correct, 0);
  const checked = check(qa);
  assert.deepEqual(restoreQaProgress(JSON.stringify(checked), lessons), checked);
});
