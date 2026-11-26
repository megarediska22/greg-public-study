import test from 'node:test';
import assert from 'node:assert/strict';
import { openAdaptiveEngine } from '../src/lib/adaptive/engine.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { emptyAdaptiveState } from '../src/lib/adaptive/state.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { interpret, familyKey } from '../src/lib/adaptive/evidence.ts';
import { pilotCriteria } from '../src/lib/adaptive/model.ts';
import { FAST_LIMIT, gradeFast, validateFastBank } from '../src/lib/adaptive/fast/bank.ts';
import { nextStep, summarize } from '../src/lib/adaptive/fast/routing.ts';
import { fastFixtureBank, right, wrong } from './fixtures/fast-placement.mjs';
import { storage } from './fixtures/adaptive.mjs';

const absent = { completed: [], available: ['bp-a1-01'], resume: null };
const saved = disk => JSON.parse(disk.getItem(ADAPTIVE_STORAGE_KEY))?.data;
const mark = (disk, state) => disk.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify({ version: 1, data: state }));
const entry = (kind, lessonId) => ({ kind, lessonId });
const criterion = group => pilotCriteria.find(criterion => criterion.group === group);
const neutral = () => ({ type: 'skip' });
const passThrough = () => right;
const learners = (opts = {}) => {
  const disk = opts.disk ?? storage();
  const bank = opts.fastBank ?? fastFixtureBank();
  const config = opts.rules ?? adaptivePilot.rules;
  const open = (change = {}) => openAdaptiveEngine({
    ...adaptivePilot, ...opts, storage: disk, fastBank: bank, rules: config,
    legacy: () => absent, ...change,
  });
  let engine = open();
  return { disk, bank, open, get engine() { return engine; }, get api() { return engine.fast; }, reload(change) { engine = open(change); } };
};

async function finish(learner, choose) {
  const { api, disk } = learner;
  if (!api.view()) assert.equal(await api.begin('placement'), 'saved');
  const traversed = [];
  while (api.view().status === 'active') {
    const view = api.view();
    const pin = saved(disk).fastPlacement.session.presented.at(-1);
    assert.ok(view.prompt);
    assert.ok(view.presented <= 15 && traversed.length < 15);
    const answer = choose(pin.slot, pin)(view.prompt);
    traversed.push(pin.slot);
    assert.equal(await api.submit(view.cursor, answer), 'saved', pin.slot);
  }
  return { result: api.result(), traversed };
}

test('the bank contract rejects P, duplicate keys or family aliases, and answers in display order', () => {
  const bank = fastFixtureBank();
  assert.deepEqual(validateFastBank(bank), []);
  const cards = bank.forms[0].slots['core-ask'][0];
  assert.equal(cards.role, 'S');
  assert.equal(gradeFast(cards, right(cards)), true);
  assert.equal(gradeFast(cards, { type: 'cards', tokenIds: ['first-1', 'third', 'second-1', 'second-2'] }), true);
  assert.equal(gradeFast(cards, { type: 'cards', tokenIds: ['first-1', 'second-1', 'second-1', 'third'] }), null);
  assert.equal(gradeFast(cards, { type: 'cards', tokenIds: ['impossible'] }), null);
  assert.equal(gradeFast(cards, { type: 'cards', tokenIds: ['first-1', 'second-1', 'third'] }), false);
  assert.equal(gradeFast(bank.forms[0].slots['upper-num'][0], { type: 'option', optionId: 'Gamma' }), null);
  const invalid = structuredClone(bank);
  invalid.forms[1].slots['core-be'][0].family = invalid.forms[0].slots['core-be'][0].family;
  invalid.forms[0].slots['core-ask'][0].tokens.reverse();
  invalid.forms[0].slots['core-ask'][0].role = 'P';
  assert.match(validateFastBank(invalid).join('\n'), /material shared/);
  assert.match(validateFastBank(invalid).join('\n'), /invalid metadata/);
  const exposedKey = structuredClone(bank);
  const item = exposedKey.forms[0].slots['core-ask'][0];
  item.tokens = [item.tokens[2], item.tokens[0], item.tokens[1], item.tokens[4], item.tokens[3]];
  assert.match(validateFastBank(exposedKey).join('\n'), /displayed card key/);
  const badOption = structuredClone(bank);
  badOption.forms[1].slots['core-lat'][0].acceptedOptionIds = ['missing'];
  assert.match(validateFastBank(badOption).join('\n'), /invalid option key/);
});

test('two independent LAT negatives end at item 2 and leave A1 elective', async () => {
  const learner = learners();
  const { result, traversed } = await finish(learner, () => wrong);
  assert.deepEqual(traversed, ['core-lat', 'lat-followup']);
  assert.equal(result.reason, 'early-preparation');
  assert.equal(result.recommendation.lessonId, 'bp-pre-01');
  assert.equal(result.a1, 'bp-a1-01');
  assert.deepEqual(saved(learner.disk).grants, []);
});

test('two attributable BE negatives give a targeted stop after 7 presentations', async () => {
  const { result, traversed } = await finish(learners(), slot => slot.endsWith('-be') ? wrong : right);
  assert.equal(traversed.length, 7);
  assert.equal(result.recommendation.lessonId, 'to-be');
  assert.equal(result.reason, 'early-gap');
});

test('two ASK negatives stop at 8, with a later saved route remaining primary', async () => {
  const legacy = () => ({ completed: [], available: ['bp-a1-01', 'unit-062'], resume: 'unit-062' });
  const learner = learners();
  learner.reload({ legacy });
  const { result, traversed } = await finish(learner, slot => slot.endsWith('-ask') ? wrong : right);
  assert.equal(traversed.length, 8);
  assert.equal(result.recommendation.lessonId, 'do-does');
  assert.equal(result.resume, 'unit-062');
  assert.equal(result.resumePrimary, true);
  assert.equal(await learner.api.accept(result.sessionId, entry('recommendation', 'do-does')), 'saved');
  assert.equal(learner.engine.access('unit-062').available, true);
});

test('fatigue skips retain a supported late-A1 anchor and never produce a negative sign', async () => {
  const { result } = await finish(learners(), slot => ['core-lat', 'core-be', 'core-ask'].includes(slot) ? right : neutral);
  assert.equal(result.recommendation.lessonId, 'hours-and-signs');
  assert.ok(result.skipped >= 5);
  assert.ok(result.knowledge.every(group => group.negative === 0));
});

test('five or more skips without anchors give insufficient support with elective routes', async () => {
  const { result, traversed } = await finish(learners(), () => neutral);
  assert.equal(result.recommendation, null);
  assert.equal(result.skipped, traversed.length);
  assert.ok(result.skipped >= 5);
  assert.ok(result.knowledge.every(group => group.status === 'insufficient'));
  assert.equal(result.a1, 'bp-a1-01');
  assert.equal(result.preA1, 'bp-pre-01');
});

test('upper route gives provisional later A2 in 10 with two constraints and WRITE S', async () => {
  const learner = learners();
  const { result, traversed } = await finish(learner, passThrough);
  assert.deepEqual(traversed.slice(-5), ['upper-num', 'upper-constraint', 'upper-write', 'upper-constraint-2', 'upper-transfer']);
  assert.equal(traversed.length, 10);
  assert.equal(result.recommendation.lessonId, 'unit-062');
  assert.equal(result.provisional, true);
  assert.equal(result.knowledge.find(group => group.group === 'WRITE').supportedPositive, true);
  assert.equal(learner.engine.access('bp-a2-07').available, false);
  assert.deepEqual(saved(learner.disk).history, []);
});

test('uncertain upper skills preserve the entry profile after at most two useful clarifiers', async () => {
  const { result, traversed } = await finish(learners(), slot =>
    slot.includes('constraint') || slot.includes('write') ? neutral : right);
  assert.equal(result.recommendation.lessonId, 'unit-042');
  assert.equal(traversed.length, 10); // Two constraints plus writing cannot be supplied in two optional slots.
});

test('two jointly useful upper clarifiers run in priority order and only once each', async () => {
  const { result, traversed } = await finish(learners(), slot =>
    ['upper-constraint-2', 'upper-write'].includes(slot) ? neutral : right);
  assert.deepEqual(traversed.slice(-2), ['clarify-constraint', 'clarify-write']);
  assert.equal(traversed.length, 12);
  assert.equal(result.recommendation.lessonId, 'unit-062');
});

test('an independent R positive and S negative remain disputed', async () => {
  const bank = fastFixtureBank();
  for (const form of bank.forms) delete form.slots['clarify-be'];
  const { result } = await finish(learners({ fastBank: bank }), slot => slot === 'foundation-be' ? wrong :
    ['core-lat', 'core-be'].includes(slot) ? right : neutral);
  assert.deepEqual(result.knowledge.find(group => group.group === 'BE'), {
    group: 'BE', status: 'disputed', direction: null, positive: 1, negative: 1, supportedPositive: false,
  });
  assert.equal(result.recommendation, null);
});

test('only a deliberate matching third clarifier can restore direction', () => {
  const signs = [
    { group: 'LAT', role: 'R', sign: '-', clarifier: false },
    { group: 'LAT', role: 'R', sign: '+', clarifier: false },
    { group: 'LAT', role: 'R', sign: '+', clarifier: false },
  ];
  assert.equal(summarize(signs)[0].status, 'disputed');
  signs[2].clarifier = true;
  assert.equal(summarize(signs)[0].direction, '+');
});

test('LAT conflict can be clarified only once within the ten-item foundation limit', async () => {
  const { result, traversed } = await finish(learners(), slot => slot === 'core-lat' ? wrong : right);
  assert.equal(traversed.length, 10);
  assert.equal(traversed.at(-1), 'clarify-lat');
  assert.equal(result.recommendation.lessonId, 'unit-042');
});

test('ambiguous wrong supported construction and unknown responses stay neutral', async () => {
  const bank = fastFixtureBank();
  for (const form of bank.forms) form.slots['core-ask'][0].wrongAttribution = 'ambiguous';
  const learner = learners({ fastBank: bank });
  const { result } = await finish(learner, slot => slot === 'core-ask' ? wrong : () => ({ type: 'unknown' }));
  assert.equal(result.ambiguous, 1);
  assert.ok(result.unknown >= 5);
  assert.ok(result.knowledge.every(group => group.negative === 0));
});

test('explicit early result uses already committed observations, excluding an unsubmitted selection', async () => {
  const { api } = learners();
  assert.equal(await api.begin('manual'), 'saved');
  for (let i = 0; i < 3; i++) assert.equal(await api.submit(api.view().cursor, right(api.view().prompt)), 'saved');
  const view = api.view();
  assert.equal(await api.select(view.cursor, right(view.prompt)), 'saved');
  assert.equal(await api.action(api.sessionCursor(), 'finish'), 'saved');
  const result = api.result();
  assert.equal(result.reason, 'manual');
  assert.equal(result.answered, 3);
  assert.equal(result.presented, 4);
  assert.equal(result.recommendation.lessonId, 'hours-and-signs');
  assert.equal(result.knowledge.find(group => group.group === 'ORIENT').status, 'insufficient');
});

test('tap and card drafts preserve order across pause and reload without exposing keys', async () => {
  const learner = learners();
  let api = learner.api;
  await api.begin('pause');
  await api.submit(api.view().cursor, right(api.view().prompt));
  await api.submit(api.view().cursor, right(api.view().prompt));
  const view = api.view();
  assert.deepEqual(Object.keys(view.prompt).sort(), ['format', 'id', 'instruction', 'prompt', 'role', 'tokens']);
  assert.ok(view.prompt.tokens.every(token => Object.keys(token).sort().join() === 'id,label'));
  assert.equal(await api.select(view.cursor, { type: 'cards', tokenIds: ['first-2', 'third'] }), 'saved');
  assert.equal(await api.select(view.cursor, { type: 'cards', tokenIds: ['first-1'] }), 'unchanged');
  const beforePause = api.sessionCursor();
  assert.equal(await api.action(beforePause, 'pause'), 'saved');
  learner.reload();
  api = learner.api;
  assert.equal(api.view().prompt, null);
  assert.equal(api.entry().resumable, true);
  assert.equal(await api.action(api.sessionCursor(), 'resume'), 'saved');
  assert.deepEqual(api.view().prompt, view.prompt);
  assert.deepEqual(api.view().selection.tokenIds, ['first-2', 'third']);
  assert.equal(api.view().presented, 3);
  assert.equal(await api.submit(beforePause, right(view.prompt)), 'unchanged');
  assert.equal(await api.submit(api.view().cursor, { type: 'cards', tokenIds: ['first-1', 'first-1'] }), 'unchanged');
  assert.equal(await api.submit(api.view().cursor, { type: 'cards', tokenIds: [] }), 'unchanged');
  const current = api.view().cursor;
  assert.equal(await api.submit(current, right(view.prompt)), 'saved');
  assert.equal(await api.submit(current, right(view.prompt)), 'unchanged');
  assert.equal(api.view().presented, 4);
});

test('a short first run still consumes its form, retake is independent, and there is no third form', async () => {
  const learner = learners();
  const { api, disk } = learner;
  for (const id of ['one', 'two']) {
    assert.equal(await api.begin(id), 'saved');
    assert.equal(await api.action(api.sessionCursor(), 'finish'), 'saved');
    learner.reload();
  }
  assert.equal(learner.api.entry().canStart, false);
  assert.equal(await learner.api.begin('third'), 'unchanged');
  const state = saved(disk).fastPlacement;
  assert.notEqual(state.past[0].form, state.session.form);
  assert.notEqual(state.exposures[0].family, state.exposures[1].family);
  assert.equal(learner.api.result().canRetake, false);
});

test('prior R/P draft and family exposure remain intact and near variants cannot be reused', async () => {
  const learner = learners();
  const { disk, bank } = learner;
  const base = learner.open({ fastBank: undefined });
  assert.equal(await base.begin('legacy-draft'), 'saved');
  const original = saved(disk);
  const first = bank.forms[0].slots['core-lat'][0];
  original.session.exposed.push(familyKey({ criterion: criterion('K-P-LAT'), family: first.family }));
  mark(disk, original);
  learner.reload();
  assert.equal(learner.api.entry().legacyDraft, 'read-only');
  assert.equal(await learner.api.begin('new-method'), 'saved');
  assert.equal(learner.api.view().form, 'fixture-b');
  assert.deepEqual(saved(disk).session, original.session);
  assert.deepEqual(saved(disk).history, original.history);
});

test('legacy material appearing later in a form ends safely as exhausted', async () => {
  const learner = learners();
  const item = learner.bank.forms[0].slots['core-orient'][0];
  const existing = { ...emptyAdaptiveState(), exposed: [familyKey({ criterion: criterion('K-A1-ORIENT'), family: item.family })] };
  mark(learner.disk, existing);
  learner.reload();
  const { result, traversed } = await finish(learner, passThrough);
  assert.equal(traversed.length, 3);
  assert.equal(result.reason, 'exhausted');
  assert.equal(result.recommendation.lessonId, 'hours-and-signs');
});

test('an unavailable highest anchor falls back only to a supported ready one', async () => {
  const rules = { ...adaptivePilot.rules, readyLessons: adaptivePilot.rules.readyLessons.filter(id => id !== 'unit-062') };
  const learner = learners({ rules });
  const { result } = await finish(learner, passThrough);
  assert.equal(result.recommendation.lessonId, 'unit-042');
  assert.equal(await learner.api.accept(result.sessionId, entry('recommendation', 'unit-062')), 'unchanged');
  assert.deepEqual(saved(learner.disk).grants, []);
});

test('acceptance validates the offered id and commits one grant atomically without learning progress', async () => {
  const learner = learners();
  const { api, disk } = learner;
  const rawProgress = '{"historical":"untouched"}';
  disk.setItem('gps.progress.v1', rawProgress);
  const { result } = await finish(learner, passThrough);
  assert.equal(await api.accept('stale-session', entry('recommendation', 'unit-062')), 'unchanged');
  assert.equal(await api.accept(result.sessionId, entry('recommendation', 'unit-043')), 'unchanged');
  assert.equal(await api.accept(result.sessionId, entry('recommendation', 'unit-062')), 'saved');
  assert.equal(await api.accept(result.sessionId, entry('a1', 'bp-a1-01')), 'unchanged');
  assert.deepEqual(saved(disk).grants.map(grant => grant.lessonId), ['unit-062']);
  assert.equal(learner.engine.access('unit-062').completed, false);
  assert.equal(learner.engine.access('unit-062').available, true);
  assert.equal(learner.engine.access('unit-063').available, false);
  assert.equal(disk.getItem('gps.progress.v1'), rawProgress);
  assert.deepEqual(saved(disk).history, []);
  learner.reload();
  assert.equal(learner.engine.access('unit-062').available, true);
});

test('withdrawal revalidates recommendations without touching existing grants', async () => {
  const learner = learners();
  const { result } = await finish(learner, passThrough);
  await learner.api.accept(result.sessionId, entry('recommendation', 'unit-062'));
  const item = learner.bank.forms[0].slots['upper-constraint'][0];
  const withdrawn = { itemId: item.id, keyId: item.keyId, keyRevision: item.keyRevision };
  learner.reload({ rules: { ...adaptivePilot.rules, withdrawnKeys: [withdrawn] } });
  assert.equal(learner.api.result().recommendation.lessonId, 'unit-042');
  assert.equal(learner.engine.access('unit-062').available, true);
});

test('changed bank and pinned options never silently resume a draft', async () => {
  const learner = learners();
  await learner.api.begin('old');
  const changed = structuredClone(learner.bank);
  changed.forms[0].slots['core-lat'][0].options.reverse();
  learner.reload({ fastBank: changed });
  assert.equal(learner.api.entry().incompatibleDraft, true);
  assert.equal(learner.api.view().prompt, null);
  assert.equal(await learner.api.begin('replacement'), 'saved');
  assert.equal(learner.api.view().form, 'fixture-b');
  assert.equal(saved(learner.disk).fastPlacement.past[0].reason, 'incompatible');
});

test('stale tabs and failed writes cannot partially grant a result', async () => {
  const learner = learners();
  const { api, disk } = learner;
  const { result } = await finish(learner, passThrough);
  const other = learner.open().fast;
  const denied = learner.open({ storage: { getItem: disk.getItem, setItem: () => { throw new Error('quota'); } } }).fast;
  const choice = entry('recommendation', 'unit-062');
  assert.equal(await denied.accept(result.sessionId, choice), 'unavailable');
  assert.deepEqual(saved(disk).grants, []);
  assert.equal(denied.result().accepted, null);
  assert.equal(await api.accept(result.sessionId, choice), 'saved');
  assert.equal(await other.accept(result.sessionId, entry('a1', 'bp-a1-01')), 'conflict');
  assert.deepEqual(saved(disk).grants.map(grant => grant.lessonId), ['unit-062']);
});

test('unknown fast partition protects it without shadowing existing adaptive access', async () => {
  const learner = learners();
  const before = { ...emptyAdaptiveState(), fastPlacement: { version: 9, data: 'preserve' },
    grants: [{ lessonId: 'unit-062', reason: 'start', version: 'original', source: 'profile', resume: null }] };
  mark(learner.disk, before);
  learner.reload();
  assert.equal(learner.api.entry().protectedData, true);
  assert.equal(await learner.api.begin('protected'), 'protected');
  assert.equal(learner.engine.access('unit-062').available, true);
  assert.equal(await learner.engine.choose({ type: 'start', route: 'a1' }), 'saved');
  assert.deepEqual(saved(learner.disk).fastPlacement, before.fastPlacement);
});

test('a suitable genuine ordinary P can refine uncertainty, while fast R/S never enter confirmation', async () => {
  const ref = criterion('K-A1-ASK');
  const p = { itemId: 'genuine-P', itemRevision: '1', keyId: 'genuine-P-key', keyRevision: '1', family: 'fresh-ordinary-P',
    stimulus: 'fresh-ordinary-S', criterion: { id: ref.id, version: ref.version }, role: 'P', designated: true,
    keyVisible: false, wrongAttribution: 'direct', lessonId: 'do-does', stepId: 'written' };
  const item = { id: p.itemId, type: 'written' };
  const baseline = { ...emptyAdaptiveState(), history: [interpret({
    item: { ...p, itemId: 'old-R', family: 'older-ordinary-R', stimulus: 'older-stimulus', role: 'R' },
    submission: 'genuine-R', source: 'old-course', channel: 'lesson', first: true, assistance: 'H0', priorExposure: false,
    outcome: 'correct',
  })] };
  const learner = learners({ practice: [...adaptivePilot.practice, p], question: () => item });
  mark(learner.disk, baseline);
  learner.reload();
  const { result } = await finish(learner, slot => slot.endsWith('-ask') ? wrong : right);
  assert.equal(result.recommendation.lessonId, 'do-does');
  assert.equal(learner.engine.knowledge().find(value => value.criterion.id === ref.id).state, 'PRELIMINARY');
  await learner.api.accept(result.sessionId, entry('recommendation', 'do-does'));
  assert.deepEqual(learner.api.followup('do-does'), { lessonId: 'do-does', stepId: 'written', questionId: p.itemId, group: 'ASK' });
  await learner.engine.capture({
    before: { lessons: {} }, after: { lessons: { 'do-does': { answers: { [p.itemId]: { attempts: [{ correct: true }] } } } } },
    action: { type: 'check-exercise', lessonId: p.lessonId, stepId: p.stepId, answers: {} },
  });
  assert.equal(learner.engine.knowledge().find(value => value.criterion.id === ref.id).state, 'CONFIRMED');
  assert.equal(learner.api.followup('do-does'), null);
});

test('hard stop prevents a sixteenth presentation even if a bank has more material', () => {
  assert.deepEqual(nextStep({ presented: Array(FAST_LIMIT) }, fastFixtureBank().forms[0], new Set(), adaptivePilot.rules), { reason: 'limit' });
});

test('the existing host stays opt-in and a corrupt envelope blocks fast writes', async () => {
  const learner = learners();
  assert.equal(learner.open({ fastBank: undefined }).fast, undefined);
  assert.equal(learner.disk.getItem(ADAPTIVE_STORAGE_KEY), null);
  learner.disk.setItem(ADAPTIVE_STORAGE_KEY, '{damaged');
  learner.reload();
  assert.equal(learner.api.entry().protectedData, true);
  assert.equal(learner.api.entry().canStart, false);
  assert.equal(await learner.api.begin('protected-envelope'), 'protected');
  assert.equal(learner.disk.getItem(ADAPTIVE_STORAGE_KEY), '{damaged');
});

test('a clear early gap stops even when its addressed lesson is missing', async () => {
  const rules = { ...adaptivePilot.rules, readyLessons: adaptivePilot.rules.readyLessons.filter(id => id !== 'to-be') };
  const { result, traversed } = await finish(learners({ rules }), slot => slot.endsWith('-be') ? wrong : right);
  assert.equal(traversed.length, 7);
  assert.equal(result.reason, 'early-gap');
  assert.equal(result.recommendation, null);
  assert.equal(result.a1, 'bp-a1-01');
});
