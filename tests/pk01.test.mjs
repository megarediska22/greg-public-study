import assert from 'node:assert/strict';
import test from 'node:test';
import { lessons, baselineLessons, questionCount } from '../src/content/course.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { loadLesson, getProgressCourse } from '../src/content/extension/registry.ts';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { validateAdaptiveContent, validateCatalogue } from '../src/lib/adaptive/content.ts';
import { adaptiveCatalog } from '../src/lib/adaptive/model.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { openCourseSession } from '../src/lib/courseSession.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { decodeProgress, emptyProgress, getScore, isLessonUnlocked, isStepUnlocked, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { validateTaskIndicators } from '../src/lib/taskIndicators.ts';
import { questionTasks } from '../src/content/questionTasks.ts';

const pk02Waivers = ['bp-a1-02', 'bp-a1-03', 'bp-a1-04', 'bp-a1-05'];
const ids = ['bp-pre-01', 'bp-pre-02', 'bp-pre-03', 'bp-pre-04', 'bp-a1-01'];
const supplements = ['to-be', 'greetings-reactions', 'help-and-cafe'];
const exerciseQuestions = unit => unit.steps.flatMap(step => step.questions ?? []);
const unit = id => lessons.find(entry => entry.id === id).lesson;
function store(raw = null) {
  const values = new Map([[PROGRESS_KEY, raw], ['gps.theme.v1', 'dark']]);
  const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); writes.push(key); } };
}
function submit(progress, course, lessonId, step, answers = Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]]))) {
  return updateProgress(progress, course, { type: 'check-exercise', lessonId, stepId: step.id, answers });
}
function finish(progress, course, lesson) {
  for (const step of lesson.steps) {
    if (step.optional) continue;
    progress = step.type === 'exercise' ? submit(progress, course, lesson.id, step)
      : updateProgress(progress, course, { type: 'complete', lessonId: lesson.id, stepId: step.id });
  }
  return progress;
}

test('Installed registry is the implemented blueprint order and all installed questions have unique keys', async () => {
  const fullyLoaded = await Promise.all(lessons.map(async entry => ({ ...entry, lesson: await loadLesson(entry.id) })));
  const installed = new Set(lessons.map(entry => entry.id));
  assert.deepEqual(lessons.map(entry => entry.id), adaptiveCatalog.sequence.filter(row => installed.has(row.id)).map(row => row.id));
  assert.deepEqual(lessons.slice(0, 5).map(entry => entry.id), ids);
  assert.equal(lessons.length, 140);
  assert.equal(questionCount, 2267);
  assert.equal(fullyLoaded.flatMap(entry => entry.lesson.steps).length, 1011);
  assert.doesNotThrow(() => validateCourse(fullyLoaded));
  assert.equal(validateTaskIndicators(fullyLoaded, questionTasks), 2267);
  assert.deepEqual(ids.map(id => exerciseQuestions(unit(id)).length), [10, 11, 8, 10, 12]);
  for (const id of supplements) {
    const before = baselineLessons.find(entry => entry.id === id).lesson;
    assert.deepEqual(exerciseQuestions(unit(id)).filter(q => !q.id.startsWith('pk01-')), exerciseQuestions(before));
    assert.deepEqual(unit(id).steps.filter(step => !step.optional).map(step => step.id), before.steps.map(step => step.id));
  }
});

const expected = [
  ['d', 'Q', 'First name', 'Ii', 'f', 'W', 'c', 'j', 'Blair', 'Cleo'],
  ['13', 'forty', 'zero', 'Age', '8', '2', '7', '0', '57', '4155550182', 'eighty-three'],
  ['Hello!', 'Bye!', 'Пожалуйста', 'June', 'Lane', 'i', "I'm Rowan.", 'Bye!'],
  ['Can you say that again?', "I don't understand.", 'Inez', 'Телефона', 'Blake', '4', 'again', 'Jules', '94', 'Can you say that again?'],
  ['Hello!', "What's your name?", 'Nice to meet you.', 'Last name', 'Bye!', 'Wren', 'meet', 'your', 'Tate', "Hi, I'm Quinn.", 'Can you repeat your last name?', 'What does badge mean?'],
  ["I'm Jamie Brooks.", "I'm Casey Lin.", 'Are you ready?', 'Are you tired?'],
  ["Hello, I'm Eden.", "That's awesome!"],
  ['Can you repeat the options?', 'What size?', "I'd like a tea."],
];
test('all 60 authored questions accept the independent expected answer and reject nonkeys', () => {
  for (const [index, id] of [...ids, ...supplements].entries()) {
    const questions = exerciseQuestions(unit(id)).filter(q => ids.includes(id) || q.id.startsWith('pk01-'));
    assert.deepEqual(questions.map(q => q.acceptedAnswers[0]), expected[index]);
    for (const question of questions) {
      assert.equal(question.hints.length, 2, question.id);
      for (const answer of question.acceptedAnswers) assert.equal(gradeAnswer(question, answer), true, question.id);
      for (const wrong of question.type === 'choice' ? question.options.filter(option => option !== question.acceptedAnswers[0]) : ['unrelated text', '']) {
        assert.equal(gradeAnswer(question, wrong), false, question.id);
      }
    }
  }
  const keys = id => lessons.slice(0, 31).flatMap(entry => exerciseQuestions(entry.lesson)).find(q => q.id === id);
  assert.equal(gradeAnswer(keys('bp-pre-01-library-tag'), 'Сleo'), false, 'Cyrillic С');
  assert.equal(gradeAnswer(keys('bp-pre-01-library-tag'), 'cleo'), false, 'name case');
  assert.equal(gradeAnswer(keys('bp-pre-02-callback-number'), '4155550128'), false, 'reordered digits');
  assert.equal(gradeAnswer(keys('bp-a1-01-unknown-word'), 'What does ‘badge’ mean?'), true);
  assert.equal(gradeAnswer(keys('bp-a1-01-lost-surname'), 'Could you say your last name again?'), true);
});

test('fresh A1 bypasses preparation, both routes progress independently, and optional exercises survive later replay', () => {
  let progress = emptyProgress(lessons);
  assert.equal(isLessonUnlocked(progress, lessons, 'bp-pre-01'), true);
  assert.equal(isLessonUnlocked(progress, lessons, 'bp-pre-02'), false);
  assert.equal(isLessonUnlocked(progress, lessons, 'bp-a1-01'), true);
  assert.equal(isLessonUnlocked(progress, lessons, 'to-be'), false);
  progress = finish(progress, lessons, unit('bp-a1-01'));
  assert.equal(isLessonUnlocked(progress, lessons, 'to-be'), true);
  assert.equal(isLessonUnlocked(progress, lessons, 'bp-pre-02'), false);
  progress = finish(progress, lessons, unit('to-be'));
  assert.equal(isLessonUnlocked(progress, lessons, 'people-feelings'), true);
  assert.equal(getScore(progress, unit('to-be')).total, 15);
  const extra = unit('to-be').steps.find(step => step.optional);
  assert.ok(isStepUnlocked(progress, unit('to-be'), extra.id));
  progress = submit(progress, lessons, 'to-be', extra);
  for (const id of ids.slice(0, 4)) progress = finish(progress, lessons, unit(id));
  assert.deepEqual(decodeProgress(JSON.stringify(progress), lessons), { progress, recovered: false });
});

test('v2 compact replay retains old completions, errors and available lessons without a startup write', async () => {
  const baseline = [...baselineLessons];
  const former = await Promise.all(baseline.slice(0, 27).map(async entry => ({ ...entry, lesson: entry.lesson ?? await loadLesson(entry.id) })));
  let old = emptyProgress();
  for (const { lesson } of former.slice(0, -1)) old = finish(old, former, lesson);
  const last = former.at(-1).lesson;
  for (const step of last.steps.slice(0, 2)) old = updateProgress(old, former, { type: 'complete', lessonId: last.id, stepId: step.id });
  const choice = last.steps[2];
  const wrong = choice.questions[0].options.find(option => option !== choice.questions[0].acceptedAnswers[0]);
  const answers = Object.fromEntries(choice.questions.map((q, index) => [q.id, index === 0 ? wrong : q.acceptedAnswers[0]]));
  old = submit(old, former, last.id, choice, answers);
  old = updateProgress(old, former, { type: 'visit', lessonId: last.id, stepId: choice.id });
  const raw = JSON.stringify(old);
  const disk = store(raw);
  const session = await openCourseSession(disk);
  assert.deepEqual(session.progress, { ...old, curriculumVersion: emptyProgress(lessons).curriculumVersion, pk01CoreAccess: true, waivedInsertions: pk02Waivers });
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.deepEqual(disk.writes, []);
  for (const entry of baseline) assert.equal(isLessonUnlocked(session.progress, lessons, entry.id), isLessonUnlocked(old, baseline, entry.id));
  const changed = updateProgress(session.progress, getProgressCourse(), { type: 'visit', lessonId: 'to-be', stepId: 'pk01-transfer' });
  assert.equal(session.persist(changed), 'saved');
  assert.equal(disk.getItem(session.backupKey), raw);
  assert.deepEqual((await openCourseSession(disk)).progress, changed);
  assert.equal(disk.getItem('gps.theme.v1'), 'dark');
});

test('adaptive metadata resolves to live tasks and leaves the diagnostic release gate closed', () => {
  const { rules, bank, practice } = adaptivePilot;
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, practice), []);
  assert.deepEqual(rules.readyLessons, lessons.map(entry => entry.id));
  const pk01Practice = practice.filter(item => ids.includes(item.lessonId));
  assert.equal(pk01Practice.length, 8);
  const allCriteria = new Map(adaptiveCatalog.groups.flatMap(group => group.placementCriterion
    ? [[group.placementCriterion, group.objectives]] : []).concat(rules.criteria.map(criterion => [criterion.id, criterion.objectives])));
  for (const item of pk01Practice) {
    const step = unit(item.lessonId).steps.find(candidate => candidate.id === item.stepId);
    const question = step.questions.find(q => q.id === item.itemId);
    assert.equal(item.role, question.type === 'choice' ? 'R' : 'P');
    const row = adaptiveCatalog.sequence.find(row => row.id === item.lessonId);
    assert.ok(allCriteria.get(item.criterion.id).every(objective => row.objectives.includes(objective)));
    assert.equal(item.keyId, `${question.id}-key`);
    assert.equal(item.keyVisible, false);
  }
  assert.deepEqual(bank.items, []);
  assert.deepEqual(bank.forms, []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, practice, true), [
    'Pilot requires enabled rules, two independent complete forms and a ready A1 entry',
  ]);
});

test('CP-PRE ignores historical and assisted answers while capturing a new unassisted result', async () => {
  let previous = emptyProgress(lessons);
  for (const id of ids.slice(0, 3)) previous = finish(previous, lessons, unit(id));
  const prep = unit('bp-pre-04');
  for (const step of prep.steps.slice(0, 2)) previous = updateProgress(previous, lessons, { type: 'complete', lessonId: prep.id, stepId: step.id });
  previous = submit(previous, lessons, prep.id, prep.steps[2]);
  const disk = store(JSON.stringify(previous));
  const host = await openAdaptiveHost(disk, adaptivePilot);
  assert.equal(host.engine.entry().diagnosticAvailable, false);
  assert.equal(disk.getItem(ADAPTIVE_STORAGE_KEY), null);
  assert.equal(await host.engine.beginCheckpoint('CP-PRE', 'readiness-first'), 'saved');
  assert.equal(await host.engine.checkpointAnswer('CP-PRE', 'readiness-first', 'bp-pre-04-letter-pass', { type: 'answer', answer: 'Inez' }), 'saved');
  assert.equal(await host.engine.hint(prep.id, 'written', 'bp-pre-04-class-number', 2), 'saved');
  assert.equal(await host.engine.checkpointAnswer('CP-PRE', 'readiness-first', 'bp-pre-04-class-number', { type: 'answer', answer: '94' }), 'saved');
  const history = JSON.parse(disk.getItem(ADAPTIVE_STORAGE_KEY)).data.history;
  assert.equal(history[0].neutral, 'retry');
  assert.equal(history[1].neutral, 'assisted');
  assert.equal(host.engine.checkpoint('CP-PRE').status, 'insufficient');
  const newHost = await openAdaptiveHost(store(JSON.stringify(previous)), adaptivePilot);
  assert.equal(await newHost.engine.beginCheckpoint('CP-PRE', 'fresh'), 'saved');
  assert.equal(await newHost.engine.checkpointAnswer('CP-PRE', 'fresh', 'bp-pre-04-class-number', { type: 'answer', answer: '94' }), 'saved');
  assert.equal(newHost.engine.checkpoint('CP-PRE').criteria.find(entry => entry.criterion.id === 'C-P-NUM-ENTRY').fresh, true);
});

test('CP-PRE combines eligible fresh signs with independent preparation observations', async () => {
  const disk = store();
  const host = await openAdaptiveHost(disk, adaptivePilot);
  let progress = host.session.progress;
  for (const id of ids.slice(0, 3)) {
    for (const step of unit(id).steps) {
      const before = progress;
      const target = { lessonId: id, stepId: step.id };
      if (step.type === 'exercise') {
        const action = { ...target, type: 'check-exercise', answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) };
        progress = updateProgress(progress, lessons, action);
        await host.engine.capture({ before, after: progress, action });
      } else {
        progress = updateProgress(progress, lessons, { ...target, type: 'complete' });
      }
    }
    host.sync(progress);
    await host.engine.choose({ type: 'complete', lessonId: id });
  }
  assert.equal(await host.engine.beginCheckpoint('CP-PRE', 'readiness-pair'), 'saved');
  assert.equal(await host.engine.checkpointAnswer('CP-PRE', 'readiness-pair', 'bp-pre-04-letter-pass', { type: 'answer', answer: 'Inez' }), 'saved');
  assert.equal(await host.engine.checkpointAnswer('CP-PRE', 'readiness-pair', 'bp-pre-04-class-number', { type: 'answer', answer: '94' }), 'saved');
  assert.equal(host.engine.checkpoint('CP-PRE').status, 'independent');
  assert.equal(host.engine.checkpoint('CP-PRE').next, 'bp-a1-01');
});
