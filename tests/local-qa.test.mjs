import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarLessons as lessons } from '../src/content/course.ts';
const questionCount = lessons.reduce((n, {lesson}) => n + lesson.steps.flatMap(s => s.type === 'exercise' ? s.questions : []).length, 0);
import { createQaProgress, restoreQaProgress, restartQaLesson, loadQaProgress, saveQaProgress, QA_PROGRESS_KEY, QA_THEME_KEY } from '../src/dev/qaState.ts';
import { emptyProgress, isLessonUnlocked, isStepUnlocked, updateProgress, getScore, PROGRESS_KEY } from '../src/lib/progress.ts';

test('QA opens every lesson and step, with all 150 questions initially unanswered', () => {
  const qa = createQaProgress(lessons);
  assert.equal(questionCount, 150);
  for (const { lesson } of lessons) {
    assert.equal(isLessonUnlocked(qa, lessons, lesson.id), true);
    for (const step of lesson.steps) assert.equal(isStepUnlocked(qa, lesson, step.id), true);
    assert.deepEqual(getScore(qa, lesson), { total: 15, correct: 0, firstTry: 0, attempts: 0 });
  }
  assert.equal(isLessonUnlocked(emptyProgress(), lessons, 'was-were'), false);
});

test('QA can test a late written exercise directly, keep mistakes and restore a retry after refresh', () => {
  const action = { lessonId: 'was-were', stepId: 'sentence', questionId: 'past-home-negative' };
  let qa = updateProgress(createQaProgress(lessons), lessons, { ...action, type: 'answer', answer: 'He were not at home yesterday.' });
  qa = updateProgress(qa, lessons, { ...action, type: 'retry' });
  assert.deepEqual(restoreQaProgress(JSON.stringify(qa), lessons), qa);
  qa = updateProgress(qa, lessons, { ...action, type: 'answer', answer: "He wasn't at home yesterday." });
  assert.equal(qa.lessons['was-were'].answers[action.questionId].attempts.length, 2);
  assert.equal(getScore(qa, lessons[9].lesson).correct, 1);
  assert.deepEqual(restoreQaProgress(JSON.stringify(qa), lessons), qa);
});

test('QA restart clears only the selected lesson’s disposable answers and keeps access open', () => {
  let qa = createQaProgress(lessons);
  for (const { lesson } of [lessons[0], lessons[9]]) qa = updateProgress(qa, lessons, { type: 'answer', lessonId: lesson.id, stepId: 'choice', questionId: lesson.steps[2].questions[0].id, answer: lesson.steps[2].questions[0].acceptedAnswers[0] });
  const restarted = restartQaLesson(qa, lessons, 'was-were');
  assert.deepEqual(restarted.lessons['to-be'], qa.lessons['to-be']);
  assert.deepEqual(restarted.lessons['was-were'].answers, {});
  assert.equal(restarted.lastVisited.stepId, 'intro');
  assert.equal(isLessonUnlocked(restarted, lessons, 'was-were'), true);
  assert.equal(isStepUnlocked(restarted, lessons[9].lesson, 'summary'), true);
});

test('QA reads and writes only its own progress key, never the real progress or theme', () => {
  const normal = 'do not modify real progress';
  const values = new Map([[PROGRESS_KEY, normal], ['gps.theme.v1', 'dark']]);
  const reads = [];
  const writes = [];
  const storage = { getItem: key => { reads.push(key); return values.get(key) ?? null; }, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  const qa = loadQaProgress(storage, lessons);
  assert.equal(saveQaProgress(storage, qa), true);
  assert.deepEqual(reads, [QA_PROGRESS_KEY]);
  assert.deepEqual(writes, [QA_PROGRESS_KEY]);
  assert.equal(values.get(PROGRESS_KEY), normal);
  assert.equal(values.get('gps.theme.v1'), 'dark');
  assert.notEqual(QA_THEME_KEY, 'gps.theme.v1');
});

test('malformed QA data and denied storage do not affect real state or prevent inspection', () => {
  const fresh = createQaProgress(lessons);
  assert.deepEqual(restoreQaProgress('{bad', lessons), fresh);
  assert.deepEqual(loadQaProgress({ getItem: () => { throw Error('denied'); } }, lessons), fresh);
  assert.equal(saveQaProgress({ setItem: () => { throw Error('quota'); } }, fresh), false);
});

test('all Russian educational text uses Григорий/Григория, while English Gregory and Natasha remain', () => {
  const text = JSON.stringify(lessons);
  assert.doesNotMatch(text, /Грегор[а-яё]*/iu);
  assert.match(text, /Я Григорий\./u);
  assert.match(text, /У Григория есть/u);
  assert.match(text, /I am Gregory\./u);
  assert.match(text, /Наташа/u);
  assert.match(text, /Natasha/u);
  assert.equal(lessons.length, 10);
  assert.equal(questionCount, 150);
});
