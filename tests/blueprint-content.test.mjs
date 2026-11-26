import test from 'node:test';
import { readFileSync } from 'node:fs';
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
  [5, [10, 12, 13], 7],
  [6, [12, 12, 12], 16],
  [7, [12, 12, 12, 12], 6],
];

const keys = new Map([
  ['bp-a1-02', ['Mia is sleepy.', 'He checks email.', 'Where does Jo work?', 'Lu bikes to school on Tuesdays.', 'works', 'do', 'are', 'read', 'I study at the studio on Mondays.', 'Where do you eat lunch?', 'Remy starts work at 8.', 'What does Dana cook on Sundays?']],
  ['bp-a1-03', ['In a cup.', 'О книге на столе.', 'There are two coats in the hall.', 'By the door.', 'an', 'the', 'is', 'in', 'The guest towel is beside the sink.', 'The glasses are in the red box.', 'Is there a blanket in the bedroom?', "No, there aren't."]],
  ['bp-a1-04', ['Kim is reading a note.', 'The worker works at the gym on Mondays.', 'Natasha can help after practice.', 'Учитель говорит в этот момент.', 'teaches', 'are', 'help', 'playing', 'Ren is talking to a guest.', 'Sky sells fruit at the market.', "Jo isn't cooking dinner.", 'Are you studying?']],
  ['bp-a1-05', ['What time works for you?', 'Can we meet at 4:30?', 'Great! Noon works for me.', 'Человек предлагает выбрать другое время.', '11:30', 'at', 'Thursday', 'What', "I can't. How about seven?", 'Monday works for me. What time works for you?', '12:30 works for me. See you then!', 'What day can we meet?']],
  ['bp-a1-06', ['2:15 p.m.', 'The east door.', 'The lobby.', 'The room.', '10:45', 'at', '61', '4:30', "Hi, Kim. I'll be back at 1:45. Please wait in Room 6.", "Hi, Bo. Wait by the side door. I'll be back at 3:20."]],
  ['bp-a1-07', ['Opened the doors.', 'The hall was cold.', 'Wash the cups.', 'At two on Saturday.', 'opened', 'was', 'finish', '9:20', 'First we opened the gym. Then we checked the balls.', "We changed the room. We didn't send a note.", 'The window was open.', 'Kai finished the signs.']],
  ['bp-a1-08', ['Tuesday at 6:15.', 'Where does Dev work?', 'They moved the piano.', 'Kelly is carrying two bags.', '3:15', 'do', 'open', 'plays', 'Where do you buy lunch?', 'Dana is packing the boxes.', "Drew, I'll be back at 2:40. Please wait in Room 4.", "We opened the side door. We didn't call Sam.", "Hi, Chris. I'll be back at 11:35. Please leave your form on the table by the door."]],
  ['bp-a2-01', ['The customer.', 'The room.', 'They received the form.', 'Could I pick it up at the side desk?', '2:40', 'Where', 'Monday', 'you', "Could you tell me where to pick up my pass? I'll bring my ID.", "What time will the technician arrive? I'll be home.", 'Could you call me after 2?', 'Could I bring my sister?']],
  ['bp-a2-02', ['Review the PDF today.', 'Another class has the room first.', 'Friday is not confirmed yet.', 'The blue link is usable again.', 'Friday', 'Mia', 'PNG', 'but', 'Jill, use the short version. Send it by Thursday.', 'Lou, use the new drawing. The map is due Tuesday.', 'The team changed the sheet because it was torn.', 'Lee, the poster is ready. Send the photo.']],
  ['bp-a2-03', ['The first store was out of bread.', 'They rode later because the bike needed repair.', 'A sign went up.', 'Who did you go with?', '6:40', 'because', 'Thursday', 'did', 'Who showed you the knot?', 'Where did you meet?', 'They took the bus because a tree fell on the tracks.', 'First, we made sandwiches. Then, we baked the bread.']],
  ['bp-a2-04', ['Room Ash.', 'Take the noon bus because it’s on time and within budget.', 'Please reply by 2:30.', 'Show B starts too late.', '2', 'cheaper', '2:45', 'because', 'We should use Elm because it seats 8. Please reply by noon.', 'We should visit River Gallery because it closes at 6. Please confirm by 3.', "We can't take the bus because we get there too late.", "If everyone agrees, I'll book the room."]],
  ['bp-a2-05', ['Only the front lock.', 'Both repairs are complete.', 'A visit is planned. The heater isn’t fixed.', 'The bedroom light is out. I’m home from two to four. Could someone come by?', '2:15', 'still', 'kitchen', 'to', "The dryer isn't working in the laundry room. I'll be home from 5:30 to 7:00. Could someone come by?", 'The oven works now. Could you fix the kitchen fan?', 'The lock and the window work now.', "I'll be home at 10:15. Please check the heater."]],
  ['bp-a2-06', ['Ari opens the hall at 9:00.', 'The room.', 'How many guests are coming?', 'Send quiz.pdf by Saturday.', 'Noor', '3:30', 'Lia', 'by', 'Bo, Ava will bring the speakers. The deadline is still noon.', 'Dev, drop off the key at the side desk by 5:30.', 'Which door should we meet at?', 'Ben will order the paper. Jo will deliver it to the gym.']],
  ['bp-a2-07', ['Take the ferry to the covered cleanup.', 'Check the storage door.', 'Bring digital copies because the printer is closed.', 'Seven.', '3:40', '8', 'Pat', '2:30', 'Could you bring an umbrella? Please reply by 11:30.', 'Six people came. They liked the team games. Mina still needs to send the next date.', 'The app works now. When will you restore my files?', 'Ray, we meet at 5:15 by the library side door.']],
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
  assert.deepEqual(['Pre-A1', 'A1', 'A2'].map(level => course.filter(entry => entry.level === level).length), [4, 49, 87]);
  assert.deepEqual(course.map(entry => entry.id), adaptiveCatalog.sequence.map(row => row.id));
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
  const approvedPrerequisites = new Map(readFileSync('research/curriculum-assessment/assessment/CHECKPOINT_SPEC.csv', 'utf8')
    .trim().split('\n').slice(1).map(line => {
      const [id, , , , , , prerequisites] = line.split(',', 7);
      return [id, prerequisites.split(' | ')];
    }));
  const criteria = new Map(rules.criteria.map(ref => [ref.id, ref]));
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, practice), []);
  assert.deepEqual(rules.readyLessons, course.map(entry => entry.id));
  assert.deepEqual(bank.items, []);
  assert.deepEqual(bank.forms, []);
  for (const item of practice.filter(item => item.criterion.id.startsWith('C-BP-'))) {
    const step = course.find(entry => entry.id === item.lessonId).lesson.steps.find(step => step.id === item.stepId);
    const q = step.questions.find(q => q.id === item.itemId);
    assert.equal(item.role, q.type === 'choice' ? 'R' : 'P', item.itemId);
    assert.equal(item.keyId, q.id + '-key');
    assert.ok(criteria.get(item.criterion.id).objectives.every(id =>
      adaptiveCatalog.sequence.find(row => row.id === item.lessonId).objectives.includes(id) ||
      adaptiveCatalog.checkpoints.find(row => row.id === item.checkpointId)?.objectives.includes(id) ||
      approvedPrerequisites.get(item.checkpointId)?.includes(id)), item.itemId);
  }
});

test('registered checkpoint routes match the approved transitions and require a fresh sign per readiness criterion', async () => {
  const { checkpointState } = await import('../src/lib/adaptive/routes.ts');
  const { interpret } = await import('../src/lib/adaptive/evidence.ts');
  const { rules, practice } = adaptivePilot;
  assert.deepEqual(rules.checkpoints.map(profile => profile.id), adaptiveCatalog.checkpoints.map(row => row.id));
  for (const profile of rules.checkpoints) {
    const row = adaptiveCatalog.checkpoints.find(row => row.id === profile.id);
    const designated = profile.items.map(itemId => practice.find(item => item.itemId === itemId));
    const event = (item, source = 'current', channel = 'checkpoint', assistance = 'H0') => interpret({
      submission: source + ':' + item.itemId, source, channel, item, first: true,
      outcome: 'correct', assistance, priorExposure: false,
    });
    const fresh = designated.map(item => event(item));
    const prior = profile.readiness.flatMap(ref => practice.filter(item => !item.checkpointId && item.criterion.id === ref.id).map(item => event(item, 'earlier', 'lesson')));
    const result = checkpointState(rules, [...prior, ...fresh], row.id, 'current', profile.items);
    assert.equal(result.completedAttempt, true, row.id);
    assert.equal(result.next, row.next || null, row.id);
    assert.equal(result.status, profile.readiness.length ? 'independent' : 'practice', row.id);
    assert.equal(checkpointState(rules, [...prior, ...fresh], row.id, 'current', profile.items.slice(1)).status, 'incomplete', row.id);
    if (profile.readiness.length) {
      const assisted = designated.map(item => event(item, 'current', 'checkpoint', 'H1'));
      assert.equal(checkpointState(rules, [...prior, ...assisted], row.id, 'current', profile.items).status, 'insufficient', row.id);
    }
  }
});

test('unsupported curriculum markers and waivers beyond an earned frontier cannot unlock lessons', async () => {
  const course = await full();
  const old = { ...emptyProgress(course), waivedInsertions: ['bp-a1-02'] };
  const forged = decodeProgress(JSON.stringify(old), course);
  assert.equal(forged.recovered, true);
  assert.equal(forged.progress.waivedInsertions, undefined);
  const future = decodeProgress(JSON.stringify({ ...old, curriculumVersion: 999 }), course);
  assert.deepEqual(future, { progress: emptyProgress(course), recovered: true });
  assert.equal(isLessonUnlocked(forged.progress, course, 'have-has'), false);
});

test('PK-01 graduates retain every historical result; the appended A2 check can be completed but never waived', async () => {
  const course = await full();
  const oldCourse = course.filter(entry => !entry.introducedIn);
  const old = oldCourse.reduce((progress, entry) => finish(progress, oldCourse, entry), emptyProgress(oldCourse));
  const ready = await prepareProgressCourse(JSON.stringify(old));
  const migrated = decodeProgress(JSON.stringify(old), ready).progress;
  assert.deepEqual(migrated.completedLessons, old.completedLessons);
  assert.deepEqual(migrated.lessons, old.lessons);
  assert.equal(migrated.waivedInsertions.length, 13);
  assert.ok(!migrated.waivedInsertions.includes('bp-a2-07'));
  assert.ok(oldCourse.every(entry => isLessonUnlocked(migrated, ready, entry.id)));
  assert.equal(isLessonUnlocked(migrated, ready, 'bp-a2-07'), true);
  const final = ready.find(entry => entry.id === 'bp-a2-07');
  const completed = finish(migrated, ready, final);
  assert.ok(completed.completedLessons.includes(final.id));
  assert.deepEqual(decodeProgress(JSON.stringify(completed), ready), { progress: completed, recovered: false });
});

test('CP-A2 reports five specific criteria and grants no next-level access', async () => {
  const { openAdaptiveEngine } = await import('../src/lib/adaptive/engine.ts');
  const { rules, bank, practice } = adaptivePilot;
  const lesson = await loadLesson('bp-a2-07');
  const profile = rules.checkpoints.find(profile => profile.id === 'CP-A2');
  const byId = new Map(questions(lesson).map(q => [q.id, q]));
  const port = new Map();
  const engine = openAdaptiveEngine({
    rules, bank, practice,
    storage: { getItem: key => port.get(key) ?? null, setItem: (key, value) => port.set(key, value) },
    legacy: () => ({ completed: [], available: [lesson.id], resume: lesson.id }),
    question: item => byId.get(item.itemId),
  });
  assert.equal(engine.entry().diagnosticAvailable, false);
  assert.equal(await engine.beginCheckpoint(profile.id, 'final'), 'saved');
  for (const id of profile.items) {
    const q = byId.get(id);
    assert.equal(await engine.checkpointAnswer(profile.id, 'final', id, { type: 'answer', answer: q.acceptedAnswers[0] }), 'saved');
  }
  const result = engine.checkpoint(profile.id);
  assert.equal(result.status, 'practice');
  assert.equal(result.next, null);
  assert.equal(result.criteria.length, 5);
  assert.ok(result.criteria.every(item => item.fresh));
  assert.equal(await engine.choose({ type: 'checkpoint', checkpointId: profile.id, attempt: 'final', path: 'supported' }), 'unchanged');
  assert.equal(engine.grantedLessons().size, 0);
});
