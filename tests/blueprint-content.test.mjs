import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, questionCount } from '../src/content/course.ts';
import { packets } from '../src/content/blueprint/integration.ts';
import { loadLesson, prepareProgressCourse } from '../src/content/extension/registry.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { adaptiveCatalog } from '../src/lib/adaptive/model.ts';
import { validateCatalogue, validateAdaptiveContent } from '../src/lib/adaptive/content.ts';
import { normalizeAnswer, gradeAnswer } from '../src/lib/grading.ts';
import { decodeProgress, emptyProgress, isLessonUnlocked, updateProgress } from '../src/lib/progress.ts';
import { validateCourse } from '../src/lib/validation.ts';

const counts = [
  [4, [12, 12, 12, 12], 31],
];

const keys = new Map([
  ['bp-a1-02', ['Mia is sleepy.', 'He checks email.', 'Where does Jo work?', 'Lu bikes to school on Tuesdays.', 'works', 'do', 'are', 'read', 'I study at the studio on Mondays.', 'Where do you eat lunch?', 'Remy starts work at 8.', 'What does Dana cook on Sundays?']],
  ['bp-a1-03', ['In a cup.', 'О книге на столе.', 'There are two coats in the hall.', 'By the door.', 'an', 'the', 'is', 'in', 'The guest towel is beside the sink.', 'The glasses are in the red box.', 'Is there a blanket in the bedroom?', "No, there aren't."]],
  ['bp-a1-04', ['Kim is reading a note.', 'The worker works at the gym on Mondays.', 'Natasha can help after practice.', 'Учитель говорит в этот момент.', 'teaches', 'are', 'help', 'playing', 'Ren is talking to a guest.', 'Sky sells fruit at the market.', "Jo isn't cooking dinner.", 'Are you studying?']],
  ['bp-a1-05', ['What time works for you?', 'Can we meet at 4:30?', 'Great! Noon works for me.', 'Человек предлагает выбрать другое время.', '11:30', 'at', 'Thursday', 'What', "I can't. How about seven?", 'Monday works for me. What time works for you?', '12:30 works for me. See you then!', 'What day can we meet?']],
]);

const full = async () => Promise.all(lessons.map(async entry => ({ ...entry, lesson: await loadLesson(entry.id) })));
const questions = lesson => lesson.steps.flatMap(step => step.questions ?? []);
const finish = (progress, course, entry) => entry.lesson.steps.filter(step => !step.optional).reduce((state, step) => updateProgress(state, course, {
  lessonId: entry.id, stepId: step.id, ...(step.type === 'exercise'
    ? { type: 'check-exercise', answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
    : { type: 'complete' }),
}), progress);

test('installed packets match the approved sequence, volumes, question keys and physical content', async () => {
  const course = await full();
  const ids = new Set(course.map(entry => entry.id));
  assert.deepEqual(course.map(entry => entry.id), adaptiveCatalog.sequence.filter(row => ids.has(row.id)).map(row => row.id));
  assert.equal(course.length, 126 + counts.reduce((sum, [, main]) => sum + main.length, 0));
  assert.equal(questionCount, 2040 + counts.reduce((sum, [, main, extras]) => sum + main.reduce((a, b) => a + b, extras), 0));
  assert.equal(course.flatMap(entry => questions(entry.lesson)).length, questionCount);
  validateCourse(course);
  for (const [version, sizes, extras] of counts) {
    const packet = packets.find(packet => packet.version === version);
    assert.deepEqual(packet.placements.map(([, lesson]) => questions(lesson).length), sizes);
    assert.equal(Object.values(packet.supplements).flatMap(addition => addition.questions).length, extras);
    for (const [, lesson] of packet.placements) {
      assert.deepEqual(questions(lesson).map(q => q.acceptedAnswers[0]), keys.get(lesson.id), lesson.id);
    }
    const authored = [
      ...packet.placements.flatMap(([, lesson]) => questions(lesson)),
      ...Object.values(packet.supplements).flatMap(addition => addition.questions),
    ];
    for (const q of authored) {
      assert.equal(q.hints.length, 2, q.id);
      const normalized = q.acceptedAnswers.map(answer => normalizeAnswer(answer, { ignoreTerminalPunctuation: q.type === 'written', ...q.normalization }));
      assert.equal(new Set(normalized).size, normalized.length, q.id);
      for (const answer of q.acceptedAnswers) assert.ok(gradeAnswer(q, answer), q.id);
      const distractors = q.type === 'choice' ? q.options.filter(option => !q.acceptedAnswers.includes(option)) : ['', 'an unrelated answer'];
      for (const answer of distractors) assert.ok(!gradeAnswer(q, answer), q.id);
    }
  }
});

test('a former PK-01 frontier retains access and a resumed partial attempt, without skipping later unseen inserts', async () => {
  const course = await full();
  const before = course.filter(entry => !entry.introducedIn);
  const first = before.findIndex(entry => entry.id === 'have-has');
  let old = before.slice(0, first).reduce((progress, entry) => finish(progress, before, entry), emptyProgress(before));
  const target = before[first];
  const step = target.lesson.steps[2];
  const firstQuestion = step.questions[0];
  for (const reading of target.lesson.steps.slice(0, 2)) old = updateProgress(old, before, { type: 'complete', lessonId: target.id, stepId: reading.id });
  old = updateProgress(old, before, { type: 'answer', lessonId: target.id, stepId: step.id, questionId: firstQuestion.id, answer: firstQuestion.options.find(option => option !== firstQuestion.acceptedAnswers[0]) });
  old = updateProgress(old, before, { type: 'visit', lessonId: target.id, stepId: step.id });
  const cursor = await prepareProgressCourse(JSON.stringify(old));
  const restored = decodeProgress(JSON.stringify(old), cursor).progress;
  assert.deepEqual(restored.completedLessons, old.completedLessons);
  assert.deepEqual(restored.lessons, old.lessons);
  assert.deepEqual(restored.lastVisited, old.lastVisited);
  assert.deepEqual(restored.waivedInsertions, ['bp-a1-02']);
  assert.equal(isLessonUnlocked(restored, cursor, target.id), true);
  assert.equal(isLessonUnlocked(restored, cursor, 'bp-a1-03'), false);
  assert.equal(isLessonUnlocked(restored, cursor, 'bp-pre-01'), true);
  assert.deepEqual(decodeProgress(JSON.stringify(restored), cursor), { progress: restored, recovered: false });
});

test('live mappings match their exact authored question and approved objectives', async () => {
  const { rules, bank, practice } = adaptivePilot;
  const course = await full();
  const criteria = new Map(rules.criteria.map(ref => [ref.id, ref]));
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, practice), []);
  assert.deepEqual(rules.readyLessons, course.map(entry => entry.id));
  assert.deepEqual(bank.items, []);
  assert.deepEqual(bank.forms, []);
  for (const item of practice.filter(item => !item.criterion.id.startsWith('C-P'))) {
    const step = course.find(entry => entry.id === item.lessonId).lesson.steps.find(step => step.id === item.stepId);
    const q = step.questions.find(q => q.id === item.itemId);
    assert.equal(item.role, q.type === 'choice' ? 'R' : 'P', item.itemId);
    assert.equal(item.keyId, q.id + '-key');
    assert.ok(criteria.get(item.criterion.id).objectives.every(id =>
      adaptiveCatalog.sequence.find(row => row.id === item.lessonId).objectives.includes(id) ||
      adaptiveCatalog.checkpoints.find(row => row.id === item.checkpointId)?.objectives.includes(id)), item.itemId);
  }
});
