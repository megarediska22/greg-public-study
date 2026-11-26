import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { lessons, questionCount } from '../src/content/course.ts';
import { validateAdaptiveContent, validateCatalogue } from '../src/lib/adaptive/content.ts';
import { openAdaptiveEngine } from '../src/lib/adaptive/engine.ts';
import { adaptiveCatalog, pilotCriteria, pilotRules } from '../src/lib/adaptive/model.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { getProgressCourse, loadLesson } from '../src/content/extension/registry.ts';
import { gradeAnswer, normalizeAnswer } from '../src/lib/grading.ts';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { emptyProgress, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { novice, storage } from './fixtures/adaptive.mjs';

const { bank, rules, practice } = adaptivePilot;
const itemById = new Map(bank.items.map(item => [item.itemId, item]));
const slots = [
  ['D0', ['K-P-LAT', 'K-P-NUM']],
  ['D0R', ['K-P-LAT']],
  ['D1', ['K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE']],
  ['D2-BASE', ['K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE']],
  ['D2-UP', ['K-A1-NOW', 'K-A1-PAST', 'K-A2-CONSTRAINT', 'K-A2-WRITE']],
  ['D3', ['K-P-NUM', 'K-A1-BE', 'K-A1-ASK', 'K-A1-ORIENT', 'K-A1-NOTE', 'K-A2-CONSTRAINT', 'K-A2-WRITE', 'K-A2-GIST', 'K-A2-MEDIATE']],
];
const lat = 'K-P-LAT', num = 'K-P-NUM', be = 'K-A1-BE', ask = 'K-A1-ASK', note = 'K-A1-NOTE', orient = 'K-A1-ORIENT';

const expected = [
  [
    'O', 'Hal', 'fourteen', '56', 'f', 'R',
    'are', 'am', 'Where does Sam work?', 'What do you drink in the morning?', '8:20 a.m.', '1:35',
    'Leave Jo’s bag at the front desk.', 'Drew, meet me by the clock at 9.',
    'Mia’s shoes are wet.', 'is', 'What do they read?', 'Where does Ray study?', '4:00 p.m.', '8:40',
    'Max by the door.', 'Pat, bring the box to Room 8.',
    'Bea is putting books on the piano.', 'Kai is painting the sign.', 'Rosa opened a window.', "didn't send",
    'The snack box.', '3:05', 'Could you leave it at the stage door? It opens after three.',
    'Sam, the main door is closed. Please use the east door.',
    '79', '0', 'They are ready.', 'are', 'When does Lee water the plants?', 'What time do you finish work?',
    '6:15 p.m.', '6:40', 'Take Ren’s umbrella from the hall.', 'Ann, leave the form on the kitchen table.',
    'Cedar at 6:00.', 'Thursday', 'I paid for two seats. Could you email me a receipt?',
    'Al, the lamp works now. Could you check the fan?', 'Post the corrected map in the chat.',
    'They started late because the paint arrived late.', 'Lena will bring the posters to the lobby.',
    'Lee, drop off the key at the front desk by 4:30.',
  ],
  [
    'R r', 'Ida', '21', '80', 'N', 'p',
    'is', 'are', 'What does Avery do at the gym?', 'What books does Lin buy?', '10:35 a.m.', '10:10', 'Take the tea to Kim in the hall.',
    'Kelly, wait at the bus stop until 8:20.', 'am', 'We are on Team Red.', 'Where does Omar live?', 'When do they read?', '8:50 a.m.',
    '7:15', 'Put the socks in the blue bag.', 'Morgan, come at 10.',
    'Toby is getting out of a taxi.', 'They are moving the chairs.', 'Mia was hungry.', "The driver didn't take the boxes.",
    'Boat C.', '3', 'Lia, the microphone works. Could you bring a spare cable?',
    'Jay, your order is ready. Please pick it up by 4:15.',
    '60', '31', 'is', "I'm at the bus stop.", 'What do Sam and Jo cook?', 'Why does Mara leave so early?',
    '3:30 p.m.', '2:25', 'The spare key from the desk.', 'Tay, pick up your pass at the west window.',
    'Red at 7:00.', '12:30', 'The cabin is open. Please use the side door.',
    'Bo, the keyboard battery is dead. Could you bring a new battery?', 'They added a show because some people needed seats.',
    'Use the online form because the printer broke.', 'Friday at 3:00, from the library.',
    'Dan, Quinn will open the gym at 7.',
  ],
];

test('the local bank contains two complete forms with 96 separately versioned, approved items', async () => {
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, practice, true), []);
  assert.equal(bank.forms.length, 2);
  assert.equal(bank.items.length, 96);
  assert.equal(bank.version, 'diagnostic-bank-v2');
  assert.equal(questionCount, 2267);
  assert.deepEqual(rules.readyLessons, adaptiveCatalog.sequence.map(row => row.id));
  assert.deepEqual(rules.readyLessons, lessons.map(lesson => lesson.id));
  assert.equal(practice.length, 54);
  assert.equal(rules.checkpoints.length, 13);
  const course = await Promise.all(lessons.map(entry => loadLesson(entry.id)));
  const productionQuestions = course.flatMap(lesson => lesson.steps.flatMap(step => step.questions ?? []));
  const courseQuestionIds = new Set(productionQuestions.map(question => question.id));
  const oldSources = new Set(productionQuestions.map(question => normalizeAnswer(question.prompt)));
  const seen = new Set();
  const family = new Set();
  const sources = new Set();
  const stimulus = new Set();
  for (const [formIndex, form] of bank.forms.entries()) {
    const positions = [0, 0, 0];
    assert.deepEqual(form.slots.map(slot => [slot.block, slot.group, slot.role]),
      slots.flatMap(([block, groups]) => groups.flatMap(group => ['R', 'P'].map(role => [block, group, role]))));
    for (const [index, slot] of form.slots.entries()) {
      assert.equal(slot.items.length, 1);
      const item = itemById.get(slot.items[0]);
      const q = item.question;
      const approved = pilotCriteria.find(ref => ref.group === slot.group);
      assert.deepEqual(item.criterion, { id: approved.id, version: approved.version }, q.id);
      assert.ok(approved.objectives.every(id => adaptiveCatalog.objectives.some(objective => objective.id === id)));
      assert.equal(q.id, item.itemId);
      assert.equal(item.keyId, q.id + '-key');
      assert.deepEqual([item.itemRevision, item.keyRevision],
        item.itemId === 'diag-b-team-reply' ? ['2', '2'] :
        item.itemId === 'diag-b-email-no-paper' ? ['1', '2'] : ['1', '1']);
      assert.equal(item.role, q.type === 'choice' ? 'R' : 'P');
      assert.ok(item.designated && !item.keyVisible && !q.hints);
      for (const [values, value] of [[seen, q.id], [family, item.family], [stimulus, item.stimulus], [sources, normalizeAnswer(q.prompt)]]) {
        assert.ok(!values.has(value), value);
        values.add(value);
      }
      assert.ok(!courseQuestionIds.has(q.id) && !oldSources.has(normalizeAnswer(q.prompt)), q.id);
      assert.equal(q.acceptedAnswers[0], expected[formIndex][index], q.id);
      for (const answer of q.acceptedAnswers) assert.ok(gradeAnswer(q, answer), q.id);
      if (q.type === 'choice') {
        assert.equal(q.options.length, 3, q.id);
        positions[q.options.indexOf(q.acceptedAnswers[0])]++;
        for (const option of q.options.filter(option => option !== q.acceptedAnswers[0])) assert.ok(!gradeAnswer(q, option), q.id);
      } else {
        for (const invalid of ['', ' unrelated ', 'Не знаю']) assert.ok(!gradeAnswer(q, invalid), q.id);
        assert.ok(!q.acceptedAnswers.some(answer => q.prompt.includes(answer) && answer.split(' ').length > 3), q.id);
      }
    }
    assert.deepEqual(positions, [8, 8, 8], form.id);
  }
  assert.equal(seen.size, bank.items.length);
  const q = slug => itemById.get(slug).question;
  assert.ok(gradeAnswer(q('diag-a-badge-hal'), 'Hal'));
  assert.ok(!gradeAnswer(q('diag-a-badge-hal'), 'hal'));
  assert.ok(!gradeAnswer(q('diag-a-badge-hal'), 'Наl')); // Cyrillic first two glyphs.
  assert.ok(gradeAnswer(q('diag-a-mail-not-sent'), 'didn’t send'));
  assert.ok(gradeAnswer(q('diag-b-truck-left-box'), 'The driver did not take the boxes'));
  assert.ok(!gradeAnswer(q('diag-b-truck-left-box'), 'The driver did not took the boxes'));
});

const correct = () => 'correct';
const getState = (engine, group, scope = 'fresh') => engine.result().knowledge.find(item => item.criterion.group === group)[scope].state;
function newRun(port = storage(), formIndex = 0, config = {}) {
  return openAdaptiveEngine({ ...adaptivePilot, storage: port, legacy: () => novice,
    bank: formIndex === 0 ? bank : { ...bank, forms: [...bank.forms].reverse() }, ...config });
}
function response(engine, mode) {
  const peek = engine.diagnostic();
  const card = peek.prompt;
  const item = itemById.get(card.id);
  const key = { slot: card.slot, itemId: card.id, key: peek.id + ':' + card.slot };
  if (mode === 'unknown' || mode === 'skip') return { ...key, type: mode };
  const q = item.question;
  const wrong = q.type === 'choice' ? q.options.find(option => !q.acceptedAnswers.includes(option)) : 'invalid';
  return { ...key, type: 'answer', answer: mode === 'correct' ? q.acceptedAnswers[0] : wrong };
}
async function walk(engine, strategy, upper = 'decline-upper') {
  const seen = [];
  while (engine.diagnostic().status !== 'finished') {
    if (engine.diagnostic().status === 'offer-upper') {
      assert.equal(await engine.diagnosticAction(upper), 'saved');
      continue;
    }
    const card = engine.diagnostic().prompt;
    const item = itemById.get(card.id);
    const group = pilotCriteria.find(ref => ref.id === item.criterion.id).group;
    for (const privateField of ['acceptedAnswers', 'explanation', 'keyRevision', 'correct', 'hints']) assert.ok(!(privateField in card));
    assert.ok(!seen.some(prior => prior.id === card.id || prior.family === item.family));
    const mode = strategy(card.block, group, item.role);
    seen.push({ ...card, group, role: item.role, family: item.family, mode });
    assert.ok(engine.diagnostic().presented <= 28);
    assert.equal(await engine.submit(response(engine, mode)), 'saved');
  }
  return seen;
}

for (const [label, select, upper, count, reason, target, states] of [
  ['absolute beginner', (_block, group) => group === lat ? 'wrong' : 'unknown', 'decline-upper', 4, 'early-gap', 'bp-pre-01', [[lat, 'GAP'], [num, 'UNKNOWN']]],
  ['all unknown', () => 'unknown', 'decline-upper', 6, 'early-uncertain', 'bp-pre-01', [[lat, 'UNKNOWN']]],
  ['unconfirmed print recognition', (block, group, role) => block === 'D0' && group === lat && role === 'R' ? 'correct' : 'skip', 'decline-upper', 6, 'early-uncertain', 'bp-pre-01', [[lat, 'PRELIMINARY']]],
  ['printed entry skills only', block => block === 'D0' ? 'correct' : 'unknown', 'decline-upper', 22, 'complete', 'bp-a1-01', [[lat, 'CONFIRMED'], [be, 'UNKNOWN']]],
  ['early A1 with questions and be', (block, group) => block === 'D0' || group === ask || group === be ? 'correct' : 'unknown', 'decline-upper', 22, 'complete', 'hours-and-signs', [[ask, 'CONFIRMED'], [orient, 'UNKNOWN']]],
  ['strong A1 transition', (block, group) => group.startsWith('K-A2-') || block === 'D3' ? 'unknown' : 'correct', 'decline-upper', 22, 'complete', 'unit-042', [['K-A1-NOW', 'CONFIRMED'], ['K-A2-CONSTRAINT', 'UNKNOWN']]],
  ['strong placement with an early ASK gap', (_block, group) => group === ask ? 'wrong' : 'correct', 'decline-upper', 20, 'complete', 'do-does', [[ask, 'GAP'], ['K-A2-WRITE', 'CONFIRMED']]],
  ['recognition without independent production', (_block, group, role) => group === lat || role === 'R' ? 'correct' : 'unknown', 'decline-upper', 22, 'complete', 'bp-a1-01', [[ask, 'PRELIMINARY'], [num, 'PRELIMINARY']]],
  ['contradictory production', (block, group, role) => block === 'D0' || group === be ? 'correct' : group === ask ? role === 'R' ? 'correct' : 'wrong' : 'unknown', 'decline-upper', 22, 'complete', 'bp-a1-01', [[ask, 'MIXED']]],
  ['partially supported A2', (_block, group, role) => group === 'K-A2-WRITE' && role === 'P' ? 'unknown' : 'correct', 'decline-upper', 22, 'complete', 'unit-042', [['K-A2-CONSTRAINT', 'CONFIRMED'], ['K-A2-WRITE', 'PRELIMINARY']]],
  ['sufficient A2 profile, optional upper declined', correct, 'decline-upper', 20, 'declined-upper', 'unit-062', [['K-A2-GIST', 'UNKNOWN']]],
  ['full upper profile', correct, 'upper', 24, 'complete', 'bp-a2-07', [['K-A2-GIST', 'CONFIRMED'], ['K-A2-MEDIATE', 'CONFIRMED']]],
  ['recovery from unclear D0 and maximum D3 budget', (block, group, role) => {
    if (block === 'D0' && group === lat && role === 'P') return 'wrong';
    if (['D0', 'D0R'].includes(block) || group === ask) return 'correct';
    if (block === 'D3') return group === note && role === 'P' ? 'unknown' : 'correct';
    return 'unknown';
  }, 'upper', 28, 'budget', 'hours-and-signs', [[lat, 'CONFIRMED'], [note, 'PRELIMINARY']]],
]) {
  test(`both forms branch correctly for ${label}`, async () => {
    for (const formIndex of [0, 1]) {
      const engine = newRun(storage(), formIndex);
      assert.equal(await engine.begin('entry'), 'saved');
      assert.equal(engine.diagnostic().formId, bank.forms[formIndex].id);
      const seen = await walk(engine, select, upper);
      assert.equal(seen.length, count);
      assert.equal(engine.result().record.reason, reason);
      assert.equal(engine.result().placement.start.lessonId, target);
      assert.equal(engine.grantedLessons().size, 0);
      for (const [group, state] of states) assert.equal(getState(engine, group), state, group);
      if (target !== 'bp-a1-01') assert.equal(engine.access(target).available, false);
      const other = target === 'unit-062' ? 'unit-042' : 'unit-062';
      assert.equal(engine.access(other).available, false);
      assert.equal(await engine.choose({ type: 'accept', lessonId: target }), 'saved');
      assert.deepEqual([...engine.grantedLessons()], [target]);
      assert.equal(engine.access(target).completed, false);
      assert.equal(engine.access(other).available, false);
    }
  });
}

test('each of the nine D3 groups is independently reachable in both forms', async () => {
  for (const formIndex of [0, 1]) {
    for (const group of slots.at(-1)[1]) {
      const engine = newRun(storage(), formIndex);
      assert.equal(await engine.begin('branch-' + group), 'saved');
      const visited = await walk(engine, (block, skill) => skill === group && block !== 'D3' ? 'unknown' : 'correct', 'upper');
      const pair = visited.filter(card => card.block === 'D3' && card.group === group);
      assert.deepEqual(pair.map(item => item.role), ['R', 'P'], group);
      assert.notEqual(pair[0].family, pair[1].family);
      assert.equal(getState(engine, group), 'CONFIRMED');
    }
  }
});

test('an interrupted diagnostic restores its pinned cursor; manual end stays neutral, retake uses B and exhausts', async () => {
  const port = storage();
  let engine = newRun(port);
  assert.equal(await engine.begin('interrupted'), 'saved');
  for (let i = 0; i < 5; i++) assert.equal(await engine.submit(response(engine, 'correct')), 'saved');
  const next = engine.diagnostic().prompt;
  assert.equal(next.block, 'D1');
  assert.equal(next.slot, 5);
  const before = port.getItem(ADAPTIVE_STORAGE_KEY);
  assert.equal(await engine.diagnosticAction('pause'), 'saved');
  engine = newRun(port);
  assert.equal(engine.entry().resumable, true);
  assert.equal(engine.diagnostic().status, 'paused');
  assert.equal(await engine.diagnosticAction('resume'), 'saved');
  assert.deepEqual(engine.diagnostic().prompt, next);
  assert.ok(engine.knowledge().every(item => item.state === 'UNKNOWN'));
  assert.equal(await engine.diagnosticAction('finish'), 'saved');
  assert.equal(engine.result().record.reason, 'manual');
  assert.deepEqual(engine.result().record.applied, []);
  assert.equal(await engine.begin('retake'), 'saved');
  assert.equal(engine.diagnostic().formId, 'pilot-form-b');
  const tried = await walk(engine, correct, 'upper');
  const old = JSON.parse(before).data.session.exposed;
  assert.ok(tried.every(item => !old.some(key => key.includes(item.family))));
  assert.equal(tried.length, 24);
  assert.equal(engine.entry().diagnosticAvailable, false);
  assert.equal(await engine.begin('exhausted'), 'unchanged');
  assert.equal(port.getItem(PROGRESS_KEY), null);
});

test('legacy course bytes and earned resume survive a real diagnostic and an explicitly accepted grant', async () => {
  const port = storage();
  const intro = { type: 'complete', lessonId: 'bp-a1-01', stepId: 'intro' };
  const visit = { type: 'visit', lessonId: 'bp-a1-01', stepId: 'theory' };
  const initial = updateProgress(updateProgress(emptyProgress(lessons), lessons, intro), lessons, visit);
  const raw = JSON.stringify(initial);
  port.setItem(PROGRESS_KEY, raw);
  port.setItem('gps.theme.v1', 'dark');
  let host = await openAdaptiveHost(port, adaptivePilot);
  assert.equal(host.engine.entry().resume, 'bp-a1-01');
  assert.ok(host.engine.knowledge().every(item => item.state === 'UNKNOWN'));
  await host.engine.begin('returning');
  await walk(host.engine, correct);
  assert.equal(host.engine.result().placement.start.lessonId, 'unit-062');
  assert.equal(host.engine.result().placement.resume, 'bp-a1-01');
  assert.equal(await host.engine.choose({ type: 'accept', lessonId: 'unit-062' }), 'saved');
  assert.equal(port.getItem(PROGRESS_KEY), raw);
  assert.equal(port.getItem('gps.theme.v1'), 'dark');
  const ready = await loadLesson('unit-062');
  const entered = updateProgress(host.session.progress, getProgressCourse(), { type: 'complete', lessonId: ready.id, stepId: 'intro' }, host.grants());
  const saved = updateProgress(entered, getProgressCourse(), { type: 'visit', lessonId: ready.id, stepId: 'theory' }, host.grants());
  assert.equal(host.session.persist(saved), 'saved');
  host = await openAdaptiveHost(port, adaptivePilot);
  assert.deepEqual(host.session.progress.lastVisited, { lessonId: 'unit-062', stepId: 'theory' });
  assert.deepEqual(host.session.progress.lessons['bp-a1-01'], initial.lessons['bp-a1-01']);
  assert.deepEqual([...host.grants()], ['unit-062']);
  assert.equal(host.engine.access('unit-062').completed, false);
  assert.equal(host.engine.access('unit-063').available, false);
  assert.equal(await host.engine.begin('retake-lower'), 'saved');
  await walk(host.engine, (_block, group) => group === be ? 'wrong' : 'correct');
  assert.equal(getState(host.engine, be, 'historical'), 'REVIEW');
  assert.equal(host.engine.result().placement.start.lessonId, 'to-be');
  assert.equal(host.engine.entry().resume, 'unit-062');
  assert.equal(host.engine.access('unit-062').available, true);
});

test('the approved optional LAT profile opens only the next preparation lesson after explicit skip', async () => {
  const engine = newRun();
  assert.equal(await engine.begin('placement'), 'saved');
  await walk(engine, block => block === 'D0' ? 'correct' : 'unknown');
  assert.equal(await engine.choose({ type: 'start', route: 'pre-a1' }), 'saved');
  assert.equal(engine.access('bp-pre-01').placementConfirmed, true);
  assert.equal(await engine.choose({ type: 'skip', lessonId: 'bp-pre-01' }), 'saved');
  assert.deepEqual([...engine.grantedLessons()], ['bp-pre-01', 'bp-pre-02']);
  assert.equal(engine.access('bp-pre-01').completed, false);
  assert.equal(engine.access('bp-pre-03').available, false);
});

test('an unavailable future pair preserves completed evidence and offers the intact form for retake', async () => {
  const removed = bank.forms[0].slots.find(slot => slot.block === 'D2-UP' && slot.group === 'K-A2-WRITE' && slot.role === 'P');
  const item = itemById.get(removed.items[0]);
  const engine = newRun(storage(), 0, { rules: { ...rules, withdrawnKeys: [item] } });
  assert.equal(await engine.begin('withdrawn-future-pair'), 'saved');
  const visited = await walk(engine, correct);
  assert.equal(visited.length, 12);
  assert.ok(visited.every(question => ['D0', 'D1'].includes(question.block)));
  assert.equal(engine.result().record.reason, 'insufficient-items');
  assert.equal(engine.result().placement.start.lessonId, 'unit-042');
  assert.equal(getState(engine, 'K-A2-WRITE'), 'UNKNOWN');
  assert.equal(await engine.begin('intact-form'), 'saved');
  assert.equal(engine.diagnostic().formId, 'pilot-form-b');
  assert.equal((await walk(engine, correct)).length, 20);
});

test('an incomplete, overlapping or invalid bank leaves ordinary entry available without writes', async () => {
  for (const change of [
    draft => { draft.forms.pop(); },
    draft => { draft.forms[0].slots.pop(); },
    draft => { draft.forms[0].slots[0].items[0] = 'missing-item'; },
    draft => { draft.items[0].keyVisible = true; },
    draft => { draft.items[0].family = draft.items[48].family; },
  ]) {
    const draft = structuredClone(bank);
    change(draft);
    const disk = storage();
    const engine = newRun(disk, 0, { bank: draft });
    assert.equal(engine.entry().diagnosticAvailable, false);
    assert.equal(await engine.begin('blocked'), 'unchanged');
    assert.equal(disk.values.size, 0);
    assert.equal(engine.access('bp-a1-01').available, true);
    assert.equal(engine.access('unit-062').available, false);
  }
});
