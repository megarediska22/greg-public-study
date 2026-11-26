import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveCatalog, pilotCriteria, pilotRules } from '../src/lib/adaptive/model.ts';
import { foldKnowledge, interpret } from '../src/lib/adaptive/evidence.ts';
import { openAdaptiveEngine } from '../src/lib/adaptive/engine.ts';
import { beginDiagnostic, changeDiagnostic, submitDiagnostic } from '../src/lib/adaptive/diagnostic.ts';
import { validateCatalogue, validateAdaptiveContent } from '../src/lib/adaptive/content.ts';
import { currentPlacement, grantAccess, lessonAccess, checkpointState, pilotCriterion, startProfiles } from '../src/lib/adaptive/routes.ts';
import { reviewAdvice } from '../src/lib/adaptive/advice.ts';
import { capturePractice, trackHint } from '../src/lib/adaptive/practice.ts';
import { emptyAdaptiveState, isAdaptiveState } from '../src/lib/adaptive/state.ts';
import { legacyAccess, ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { lessons } from '../src/content/course.ts';
import { decodeProgress, emptyProgress, updateProgress } from '../src/lib/progress.ts';
import { makeBank, metadata, makeQuestion, novice, rulesFor, storage } from './fixtures/adaptive.mjs';

const bank = makeBank();
const rules = rulesFor(adaptiveCatalog.sequence.map(lesson => lesson.id));
const groups = pilotCriteria.map(criterion => criterion.group);
const options = (port = storage(), overrides = {}) => ({ storage: port, rules, bank, practice: [], legacy: () => novice, ...overrides });
const reading = async (engine, getMode, optional = 'decline-upper') => {
  const visited = [];
  while (engine.diagnostic()?.status === 'active' || engine.diagnostic()?.status === 'offer-upper') {
    if (engine.diagnostic().status === 'offer-upper') { await engine.diagnosticAction(optional); continue; }
    const prompt = engine.diagnostic().prompt;
    const item = bank.items.find(item => item.itemId === prompt.id);
    const mode = getMode(prompt.block, item.criterion.group, item.role);
    visited.push([prompt.block, item.criterion.group, item.role]);
    assert.ok(visited.length <= pilotRules.maxItems);
    const base = { slot: prompt.slot, itemId: prompt.id, key: engine.diagnostic().id + '-' + prompt.slot };
    const action = mode === 'unknown' ? { ...base, type: 'unknown' } : {
      ...base, type: 'answer', answer: mode === 'correct' ? item.question.acceptedAnswers[0] : item.role === 'R' ? 'east' : 'wrong',
    };
    assert.equal(await engine.submit(action), 'saved');
  }
  return visited;
};
async function run(getMode, optional) {
  const engine = openAdaptiveEngine(options());
  assert.equal(await engine.begin('placement'), 'saved');
  const visited = await reading(engine, getMode, optional);
  return { engine, visited };
}
const groupState = (engine, group, type = 'fresh') => engine.result().knowledge.find(item => item.criterion.group === group)[type].state;
const all = () => 'correct';
const lat = 'K-P-LAT', num = 'K-P-NUM', be = 'K-A1-BE', ask = 'K-A1-ASK';
const event = (group, id, role, sign, extras = {}) => interpret({
  source: 'run-' + id, submission: id, channel: 'lesson', first: true, assistance: 'H0', priorExposure: false,
  outcome: sign === '+' ? 'correct' : 'incorrect', item: metadata(group, id, role), ...extras,
});
const pair = (group, id, sign, channel = 'lesson') => [event(group, id + 'R', 'R', sign, { channel }), event(group, id + 'P', 'P', sign, { channel })];
const knowledge = (events, group = ask, withdrawn = []) => foldKnowledge(events, pilotCriterion(group), withdrawn);

test('catalogue has the approved 38 groups, 159 goals, 140 entries, 12 slices and 13 checkpoints with valid references', () => {
  assert.deepEqual([adaptiveCatalog.groups.length, adaptiveCatalog.objectives.length, adaptiveCatalog.sequence.length, pilotCriteria.length, adaptiveCatalog.checkpoints.length], [38, 159, 140, 12, 13]);
  assert.deepEqual(validateCatalogue(), []);
  assert.deepEqual(validateAdaptiveContent(rules, bank, [], true), []);
  assert.ok(lessons.every(lesson => adaptiveCatalog.sequence.some(row => row.id === lesson.id)));
});

test('S01 early Latin gap and voluntary preparation preserve the A1 option', async () => {
  const { engine, visited } = await run((_block, group) => group === lat ? 'wrong' : 'unknown');
  assert.equal(visited.length, 4);
  assert.equal(groupState(engine, num), 'UNKNOWN');
  assert.equal(groupState(engine, lat), 'GAP');
  assert.equal(engine.result().placement.start.lessonId, 'bp-pre-01');
  assert.equal(engine.access('bp-pre-01').available, false);
  await engine.choose({ type: 'accept', lessonId: 'bp-pre-01' });
  assert.equal(engine.access('bp-pre-01').available, true);
  assert.equal(engine.access('bp-a1-01').available, true);
});
test('S02 only entry literacy yields safe A1 and no intermediate access', async () => {
  const { engine, visited } = await run(block => block === 'D0' ? 'correct' : 'unknown');
  assert.ok(visited.some(([block]) => block === 'D2-BASE'));
  assert.equal(groupState(engine, be), 'UNKNOWN');
  assert.equal(engine.result().placement.start.lessonId, 'bp-a1-01');
  assert.equal(engine.access('unit-042').available, false);
});
test('S03 contradiction remains MIXED through one D3 clarification', async () => {
  const { engine, visited } = await run((block, group, role) => block === 'D0' || group === be ? 'correct' : group === ask ? role === 'R' ? 'correct' : 'wrong' : 'unknown');
  assert.equal(groupState(engine, ask), 'MIXED');
  assert.equal(visited.filter(([block, group]) => block === 'D3' && group === ask).length, 2);
  assert.equal(engine.result().placement.start.lessonId, 'bp-a1-01');
});
test('S04 confirms transition entry and grants only accepted unit, never completions', async () => {
  const { engine } = await run((block, group) => block === 'D2-UP' && group.startsWith('K-A2-') || block === 'D3' ? 'unknown' : 'correct');
  assert.equal(engine.result().placement.start.lessonId, 'unit-042');
  assert.equal(engine.result().placement.earlier.lessonId, 'hours-and-signs');
  await engine.choose({ type: 'accept', lessonId: 'unit-043' });
  assert.equal(engine.access('unit-043').available, false);
  await engine.choose({ type: 'accept', lessonId: 'unit-042' });
  assert.equal(engine.access('unit-042').available, true);
  assert.equal(engine.access('unit-042').completed, false);
  assert.equal(engine.access('hours-and-signs').available, false);
});
test('S05 optional upper refusal is neutral and offers unit-062 only on acceptance', async () => {
  const { engine, visited } = await run(all);
  assert.equal(visited.length, 20);
  assert.equal(engine.result().record.reason, 'declined-upper');
  assert.equal(groupState(engine, 'K-A2-GIST'), 'UNKNOWN');
  assert.equal(engine.result().placement.start.lessonId, 'unit-062');
  await engine.choose({ type: 'accept', lessonId: 'unit-062' });
  assert.equal(engine.access('bp-a2-07').available, false);
});
test('S06 strong upper answers and ASK gap produce focused do-does', async () => {
  const { engine } = await run((_block, group) => group === ask ? 'wrong' : 'correct');
  assert.equal(groupState(engine, ask), 'GAP');
  assert.equal(groupState(engine, 'K-A2-WRITE'), 'CONFIRMED');
  assert.deepEqual(engine.result().placement.start, { lessonId: 'do-does', reason: 'gap', group: ask });
  await engine.choose({ type: 'accept', lessonId: 'do-does' });
  assert.equal(engine.access('do-does').available, true);
  assert.equal(engine.access('unit-062').available, false);
});
test('S07 repeated recognition alone yields only preliminary knowledge', async () => {
  const { engine } = await run((_block, group, role) => group === lat || role === 'R' ? 'correct' : 'unknown');
  assert.equal(groupState(engine, ask), 'PRELIMINARY');
  assert.equal(engine.result().placement.start.lessonId, 'bp-a1-01');
});
test('S08 alternating signs remain MIXED', () => {
  assert.equal(knowledge([event(ask, 'a', 'R', '+'), event(ask, 'b', 'P', '-'), event(ask, 'c', 'R', '+'), event(ask, 'd', 'P', '-')]).state, 'MIXED');
});
test('S09 one independent error retains confirmation', () => assert.equal(knowledge([...pair(ask, 'a', '+'), event(ask, 'b', 'P', '-')]).state, 'CONFIRMED'));
test('S10/S11 new negative pair opens REVIEW, fresh positive pair closes it and issued access stays available', () => {
  const issue = [...pair(ask, 'a', '+'), ...pair(ask, 'b', '-')];
  const cleared = [...issue, ...pair(ask, 'c', '+')];
  assert.equal(knowledge(issue).state, 'REVIEW');
  assert.equal(knowledge(cleared).state, 'CONFIRMED');
  assert.equal(knowledge(cleared).episode, undefined);
  const grants = [{ lessonId: 'unit-062' }];
  assert.equal(lessonAccess(rules, novice, grants, cleared, 'unit-062').available, true);
});
test('S12 assistance persists across hint closure and captures only committed attempt deltas', () => {
  const course = lessons.slice(0, 1), { lesson } = course[0], step = lesson.steps.find(step => step.type === 'exercise');
  const itemIds = step.questions.slice(0, 3).map(q => q.id);
  const practice = itemIds.map(id => ({ ...metadata(be, id, 'R'), lessonId: lesson.id, stepId: step.id }));
  const base = { lessonId: lesson.id, stepId: step.id };
  const before = lesson.steps.slice(0, 2).reduce((p, step) => updateProgress(p, course, { type: 'complete', lessonId: lesson.id, stepId: step.id }), emptyProgress());
  const answers = Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]]));
  const wrong = step.questions[2].options.find(option => option !== answers[itemIds[2]]);
  let state = emptyAdaptiveState();
  state = trackHint(state, practice, lesson.id, step.id, itemIds[0], 1);
  state = trackHint(state, practice, lesson.id, step.id, itemIds[1], 2);
  const action = { ...base, type: 'check-exercise', answers: { ...answers, [itemIds[2]]: wrong } };
  assert.equal(capturePractice(state, rules, practice, { before, after: before, action }), state);
  const after = updateProgress(before, course, action);
  state = capturePractice(state, rules, practice, { before, after, action });
  state = capturePractice(state, rules, practice, { before: after, after: updateProgress(after, course, { ...action, answers }), action });
  assert.deepEqual(state.history.map(e => [e.assistance, e.sign, e.neutral]), [
    ['H1', undefined, 'assisted'], ['H2', undefined, 'assisted'], ['H0', '-', undefined], ['H0', undefined, 'retry'],
  ]);
  assert.equal(knowledge(state.history, be).state, 'PRELIMINARY');
});
test('S13 pause pins exact next slot; manual finish has no effect on history', async () => {
  const port = storage(); let engine = openAdaptiveEngine(options(port));
  await engine.begin('pause-me');
  for (let i = 0; i < 5; i++) {
    const q = engine.diagnostic().prompt;
    await engine.submit({ slot: q.slot, itemId: q.id, key: 'resume-' + i, type: 'answer', answer: q.options ? 'west' : 'quartz' });
  }
  const next = engine.diagnostic().prompt;
  assert.equal('acceptedAnswers' in next, false);
  await engine.diagnosticAction('pause');
  engine = openAdaptiveEngine(options(port));
  await engine.diagnosticAction('resume');
  assert.deepEqual(engine.diagnostic().prompt, next);
  await engine.diagnosticAction('finish');
  assert.equal(engine.result().record.applied.length, 0);
  assert.equal(groupState(engine, lat, 'historical'), 'UNKNOWN');
});
test('S14 retake uses fresh families, retains late access and recommends to-be for new BE gap', async () => {
  const engine = openAdaptiveEngine(options());
  await engine.begin('first');
  await reading(engine, all);
  await engine.choose({ type: 'accept', lessonId: 'unit-062' });
  await engine.begin('retake');
  assert.equal(engine.diagnostic().formId, 'fixture-b');
  await reading(engine, (_block, group) => group === be ? 'wrong' : 'correct');
  assert.equal(groupState(engine, be), 'GAP');
  assert.equal(groupState(engine, be, 'historical'), 'REVIEW');
  assert.equal(engine.result().placement.start.lessonId, 'to-be');
  assert.equal(engine.access('unit-062').available, true);
});
test('S15 existing learned history receives no adaptive evidence or mandatory prompt', () => {
  const port = storage();
  const old = { ...emptyProgress(lessons), pk01CoreAccess: true, lastVisited: { lessonId: 'to-be', stepId: 'intro' } };
  const engine = openAdaptiveEngine(options(port, { legacy: () => legacyAccess(old, lessons) }));
  assert.equal(engine.entry().showChoice, false);
  assert.equal(engine.entry().resume, 'to-be');
  assert.equal(engine.access('to-be').available, true);
  assert.equal(engine.result(), null);
  assert.equal(port.values.size, 0);
});
test('S16 dismissal remains scoped to the original episode and can be viewed on request', () => {
  const signs = pair(ask, 'a', '-');
  const advice = reviewAdvice(rules, signs, {}, 'do-does');
  assert.equal(advice.lessonId, 'do-does');
  const dismissed = { [advice.criterion]: advice.episode };
  assert.equal(reviewAdvice(rules, signs, dismissed, 'do-does'), null);
  assert.deepEqual(reviewAdvice(rules, signs, dismissed, 'do-does', true), advice);
  assert.equal(reviewAdvice(rules, [...signs, ...pair(ask, 'b', '+')], dismissed, 'do-does'), null);
  assert.ok(reviewAdvice(rules, [...signs, ...pair(ask, 'b', '+'), ...pair(ask, 'c', '-')], dismissed, 'do-does'));
});
test('S17 full upper route offers the final A2 self-check without opening it', async () => {
  const { engine, visited } = await run(all, 'upper');
  assert.equal(visited.length, 24);
  assert.equal(engine.result().placement.start.lessonId, 'bp-a2-07');
  assert.equal(engine.access('bp-a2-07').available, false);
});
test('S18 D0R and three D3 pairs stop exactly at 28, preserve uncertain NOTE and choose hours-and-signs', async () => {
  const { engine, visited } = await run((block, group, role) => {
    if (block === 'D0' && group === lat && role === 'P') return 'wrong';
    if (block === 'D0' || block === 'D0R' || group === ask) return 'correct';
    if (block === 'D3') return group === 'K-A1-NOTE' && role === 'P' ? 'wrong' : 'correct';
    return 'unknown';
  });
  assert.equal(visited.length, 28);
  assert.equal(engine.diagnostic().prompt, null);
  assert.equal(groupState(engine, 'K-A1-NOTE'), 'MIXED');
  assert.equal(engine.result().placement.start.lessonId, 'hours-and-signs');
});
test('S18 key withdrawal mid-block returns partial result with unaffected staged evidence', () => {
  let session = beginDiagnostic('partial', bank, rules, [], []);
  const submit = (session, config) => {
    const item = bank.items.find(item => item.itemId === session.queue[session.cursor].itemId);
    return submitDiagnostic(session, { slot: session.cursor, itemId: item.itemId, key: 'k-' + session.cursor, type: 'answer', answer: item.question.acceptedAnswers[0] }, bank, config, [], []);
  };
  for (let i = 0; i < 5; i++) session = submit(session, rules);
  const item = bank.items.find(item => item.itemId === session.queue[session.cursor].itemId);
  session = submit(session, { ...rules, withdrawnKeys: [item] });
  assert.equal(session.reason, 'insufficient-items');
  assert.equal(knowledge(session.events, be).state, 'PRELIMINARY');
});
test('S19 additional R negatives retain GAP, then one and two positives resolve separately', () => {
  const signs = [...pair(ask, 'a', '-'), event(ask, 'x', 'R', '-'), event(ask, 'y', 'R', '-')];
  assert.equal(knowledge(signs).state, 'GAP');
  assert.equal(knowledge([...signs, event(ask, 'z', 'R', '+')]).state, 'MIXED');
  assert.equal(knowledge([...signs, ...pair(ask, 'b', '+')]).state, 'CONFIRMED');
});
test('S20 withdrawal recomputes the affected criterion and archives incompatible drafts', () => {
  const signs = pair(ask, 'a', '-');
  assert.equal(knowledge(signs, ask, [signs[0].item]).state, 'PRELIMINARY');
  const session = beginDiagnostic('draft', bank, rules, [], []);
  const paused = changeDiagnostic(session, 'pause', bank, rules, [], []);
  const key = bank.items.find(item => item.itemId === paused.queue[0].itemId);
  assert.equal(changeDiagnostic(paused, 'resume', bank, { ...rules, withdrawnKeys: [key] }, [], []).reason, 'incompatible');
});
test('S21 historical CONFIRMED does not replace a fresh mixed criterion for a new late start', () => {
  const history = startProfiles[2].groups.flatMap(group => pair(group, 'old-' + group, '+', 'diagnostic'));
  const fresh = [...startProfiles[1].groups.flatMap(group => pair(group, 'new-' + group, '+', 'diagnostic')),
    ...pair('K-A2-CONSTRAINT', 'constraint', '+', 'diagnostic'), event('K-A2-WRITE', 'writingA', 'R', '+'), event('K-A2-WRITE', 'writingB', 'P', '-')];
  assert.equal(knowledge([...history, ...fresh], 'K-A2-WRITE').state, 'CONFIRMED');
  assert.equal(knowledge(fresh, 'K-A2-WRITE').state, 'MIXED');
  assert.equal(currentPlacement(rules, novice, [], [...history, ...fresh], fresh).start.lessonId, 'unit-042');
});
test('S22 visible or multiple-choice P invalidates the bank', () => {
  const bad = structuredClone(bank);
  const index = bad.items.findIndex(item => item.role === 'P');
  bad.items[index].question = makeQuestion(bad.items[index].itemId, 'R');
  assert.match(validateAdaptiveContent(rules, bad, [], true).join(), /Invalid diagnostic task/);
  assert.equal(openAdaptiveEngine(options(storage(), { bank: bad })).entry().diagnosticAvailable, false);
});
test('S23 checkpoint counts fresh evidence and allows supported continuation after a full marked attempt', async () => {
  const cp = adaptiveCatalog.checkpoints.find(row => row.id === 'CP-A1');
  const practice = cp.readiness.map((group, index) => ({ ...metadata(group, 'task-' + index, 'P'), lessonId: cp.lesson, stepId: 'written', checkpointId: cp.id }));
  const config = { ...rules, checkpoints: [{ id: cp.id, items: practice.map(item => item.itemId), readiness: cp.readiness.map(pilotCriterion) }] };
  const engine = openAdaptiveEngine(options(storage(), { rules: config, practice, question: item => makeQuestion(item.itemId, 'P'), legacy: () => ({ ...novice, available: [...novice.available, cp.lesson] }) }));
  await engine.beginCheckpoint(cp.id, 'checkpoint-run');
  assert.equal(engine.checkpoint(cp.id).status, 'incomplete');
  for (const item of practice) await engine.checkpointAnswer(cp.id, 'checkpoint-run', item.itemId, { type: 'skip' });
  assert.equal(engine.checkpoint(cp.id).status, 'insufficient');
  await engine.choose({ type: 'checkpoint', checkpointId: cp.id, attempt: 'checkpoint-run', path: 'independent' });
  assert.equal(engine.access('unit-042').available, false);
  await engine.choose({ type: 'checkpoint', checkpointId: cp.id, attempt: 'checkpoint-run', path: 'supported' });
  assert.equal(engine.access('unit-042').available, true);
  assert.equal(engine.access(cp.lesson).completed, false);
  assert.equal(engine.access('unit-043').available, false);
  const historic = cp.readiness.flatMap(group => pair(group, 'historic-' + group, '+'));
  const timely = practice.map(item => event(item.criterion.group, item.itemId, 'P', '+', { item, channel: 'checkpoint', source: 'fresh-cp' }));
  assert.equal(checkpointState(config, [...historic, ...timely], cp.id, 'fresh-cp').status, 'independent');
  assert.equal(checkpointState(config, historic, cp.id, 'fresh-cp', practice.map(item => item.itemId)).status, 'insufficient');
});
test('S24 skip opens exactly one ready lesson and insufficient catalogue falls back to to-be', () => {
  const history = pair(lat, 'a', '+', 'diagnostic');
  const config = { ...rules, skipProfiles: { 'bp-pre-01': [pilotCriterion(lat)] } };
  const first = grantAccess(config, novice, [], history, { type: 'start', route: 'pre-a1' });
  const next = grantAccess(config, novice, first, history, { type: 'skip', lessonId: 'bp-pre-01' });
  assert.deepEqual(next.map(entry => entry.lessonId), ['bp-pre-01', 'bp-pre-02']);
  assert.equal(lessonAccess(config, novice, next, history, 'bp-pre-01').completed, false);
  assert.equal(lessonAccess(config, novice, next, history, 'bp-pre-01').placementConfirmed, true);
  assert.equal(currentPlacement(rulesFor(['to-be']), novice, [], history, history).start.lessonId, 'to-be');
});
test('S25 stale tabs and duplicate submissions cannot double-record; corruption stays protected', async () => {
  const port = storage();
  let engine = openAdaptiveEngine(options(port));
  await engine.begin('shared');
  const other = openAdaptiveEngine(options(port));
  const q = engine.diagnostic().prompt;
  const action = { slot: q.slot, itemId: q.id, key: 'shared-key', type: 'answer', answer: 'west' };
  assert.equal(await engine.submit(action), 'saved');
  assert.equal(await engine.submit(action), 'unchanged');
  assert.equal(await other.submit(action), 'conflict');
  engine = openAdaptiveEngine(options(port));
  assert.equal(engine.diagnostic().answered, 1);
  port.setItem(ADAPTIVE_STORAGE_KEY, '{broken');
  engine = openAdaptiveEngine(options(port));
  assert.equal(await engine.begin('cannot-write'), 'protected');
  assert.equal(engine.diagnostic(), null);
  assert.equal(port.getItem(ADAPTIVE_STORAGE_KEY), '{broken');
});
test('S26 reused family or stimulus cannot restore knowledge or replace advice with BE practice', () => {
  const signs = pair(ask, 'a', '-');
  const repeat = event(ask, 'repeated', 'P', '+');
  repeat.item.family = signs[0].item.family;
  const reusedStimulus = event(ask, 'reused', 'P', '+');
  reusedStimulus.item.stimulus = signs[0].item.stimulus;
  const history = [...pair(be, 'b', '+'), ...signs, repeat, reusedStimulus];
  assert.equal(knowledge(history).state, 'GAP');
  assert.equal(reviewAdvice(rules, history, {}, 'do-does').lessonId, 'do-does');
});
test('production-disabled configuration leaves linear progress untouched and offers no diagnostic', async () => {
  const engine = openAdaptiveEngine(options(undefined, { rules: { ...rules, enabled: false } }));
  assert.equal(engine.entry().diagnosticAvailable, false);
  assert.equal(await engine.begin('disabled'), 'unchanged');
  assert.equal(engine.access('bp-a1-01').available, true);
  assert.equal(engine.access('unit-042').available, false);
  assert.equal(isAdaptiveState({ ...emptyAdaptiveState(), session: { queue: [] } }), false);
  assert.equal(groups.length, 12);
});

test('audit: a NOW gap does not block the unit-062 profile or optional upper check', async () => {
  const { engine } = await run((_block, group) => group === 'K-A1-NOW' ? 'wrong' : 'correct');
  assert.equal(groupState(engine, 'K-A1-NOW'), 'GAP');
  assert.equal(engine.result().record.reason, 'declined-upper');
  assert.equal(engine.result().placement.start.lessonId, 'unit-062');
});

test('audit: pause retains shown count and checks all pinned future slots before resume', async () => {
  const port = storage();
  const engine = openAdaptiveEngine(options(port));
  await engine.begin('future-withdrawal');
  assert.equal(engine.diagnostic().presented, 1);
  await engine.diagnosticAction('pause');
  assert.equal(engine.diagnostic().presented, 1);
  const withdrawn = bank.items.find(item => item.itemId === bank.forms[0].slots[3].items[0]);
  const reopened = openAdaptiveEngine(options(port, { rules: { ...rules, withdrawnKeys: [withdrawn] } }));
  assert.equal(reopened.entry().resumable, false);
  assert.equal(reopened.entry().incompatibleDraft, true);
  await reopened.diagnosticAction('resume');
  assert.equal(reopened.result().record.reason, 'incompatible');
  assert.deepEqual(reopened.result().record.applied, []);
});

test('audit: family and stimulus namespaces cannot reject an independent R/P pair', () => {
  const distinct = structuredClone(bank);
  const form = distinct.forms[0];
  const r = distinct.items.find(item => item.itemId === form.slots[0].items[0]);
  const p = distinct.items.find(item => item.itemId === form.slots[1].items[0]);
  p.stimulus = r.family;
  assert.equal(beginDiagnostic('namespace', distinct, rules, [], []).formId, form.id);
});

test('audit: an invalid or disabled bank cannot hide an issued grant to ready content', async () => {
  const port = storage();
  let engine = openAdaptiveEngine(options(port));
  await engine.begin('grant');
  await reading(engine, all);
  await engine.choose({ type: 'accept', lessonId: 'unit-062' });
  const invalid = structuredClone(bank);
  invalid.items[0].keyVisible = true;
  engine = openAdaptiveEngine(options(port, { bank: invalid }));
  assert.equal(engine.entry().diagnosticAvailable, false);
  assert.equal(engine.access('unit-062').available, true);
  assert.equal(engine.access('unit-063').available, false);
  assert.equal(engine.result().record.choice.lessonId, 'unit-062');
});

test('audit: confirmed reset clears remembered hints in the same engine session', async () => {
  const course = lessons.slice(0, 1), { lesson } = course[0], step = lesson.steps.find(step => step.type === 'exercise');
  const question = step.questions[0];
  const item = { ...metadata(be, question.id, 'R'), lessonId: lesson.id, stepId: step.id };
  const engine = openAdaptiveEngine(options(undefined, { practice: [item], question: () => question }));
  await engine.hint(lesson.id, step.id, item.itemId, 2);
  await engine.resetAfterConfirmation();
  const base = { lessonId: lesson.id, stepId: step.id };
  const before = lesson.steps.slice(0, 2).reduce((p, step) => updateProgress(p, course, { type: 'complete', lessonId: lesson.id, stepId: step.id }), emptyProgress());
  const action = { ...base, type: 'check-exercise', answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) };
  await engine.capture({ before, after: updateProgress(before, course, action), action });
  assert.equal(engine.advice('to-be').reason, 'check');
});

test('adaptive grants work through the ordinary reducer and survive replay without completing skipped lessons', () => {
  const course = lessons.slice(0, 3), { lesson } = course[2];
  const granted = new Set([lesson.id]);
  let progress = emptyProgress();
  for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    const action = step.type === 'exercise' ? { ...base, type: 'check-exercise', answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
      : { ...base, type: 'complete' };
    assert.equal(updateProgress(progress, course, action), progress);
    progress = updateProgress(progress, course, action, granted);
  }
  assert.deepEqual(progress.completedLessons, [lesson.id]);
  assert.deepEqual(decodeProgress(JSON.stringify(progress), course, granted), { progress, recovered: false });
});

test('withdrawal never converts a previously shadowed family repeat into independent proof', () => {
  const original = event(ask, 'original', 'R', '+');
  const shadow = event(ask, 'repeat', 'P', '+');
  shadow.item.family = original.item.family;
  const separate = event(ask, 'separate', 'R', '+');
  assert.equal(knowledge([original, shadow, separate], ask, [original.item]).state, 'PRELIMINARY');
});

test('placement refusal keeps the baseline and explicitly confirmed recovery retains exact protected bytes', async () => {
  const port = storage();
  const engine = openAdaptiveEngine(options(port));
  await engine.begin('refusal');
  await reading(engine, all);
  await engine.declinePlacement();
  assert.equal(engine.result().record.choice.type, 'declined');
  assert.equal(engine.access('unit-062').available, false);
  const raw = '{"version":9,"data":{"source":"future"}}';
  port.setItem(ADAPTIVE_STORAGE_KEY, raw);
  const recovered = openAdaptiveEngine(options(port));
  assert.equal(recovered.storageStatus(), 'unsupported');
  assert.equal(await recovered.recoverAfterConfirmation(), 'saved');
  assert.equal(port.getItem(recovered.recoveryKey()), raw);
  assert.equal(recovered.access('bp-a1-01').available, true);
});

test('CP-061 requires an approved PLAN criterion and fresh independent evidence from the current checkpoint', () => {
  const row = adaptiveCatalog.checkpoints.find(checkpoint => checkpoint.id === 'CP-061');
  const group = adaptiveCatalog.groups.find(group => group.id === 'K-A2-PLAN');
  const plan = { id: 'C-PLAN-CHECKPOINT', version: '1', group: group.id, objectives: group.objectives };
  const readiness = [plan, pilotCriterion('K-A2-CONSTRAINT')];
  const practice = readiness.map((criterion, index) => ({ ...metadata('K-A2-CONSTRAINT', 'bridge-' + index, 'P'), criterion, lessonId: row.lesson, stepId: 'written', checkpointId: row.id }));
  const profile = { id: row.id, items: practice.map(item => item.itemId), readiness };
  assert.ok(validateAdaptiveContent({ ...rules, checkpoints: [profile] }, bank, practice).length);
  const config = { ...rules, criteria: [plan], checkpoints: [profile] };
  assert.deepEqual(validateAdaptiveContent(config, bank, practice), []);
  const prior = pair('K-A2-CONSTRAINT', 'prior', '+').concat(pair('K-A2-CONSTRAINT', 'plan', '+').map(event => ({ ...event, item: { ...event.item, criterion: plan } })));
  const fresh = practice.map(item => event('K-A2-CONSTRAINT', item.itemId, 'P', '+', { item, channel: 'checkpoint', source: 'current' }));
  assert.equal(checkpointState(config, [...prior, fresh[1]], row.id, 'current', profile.items).status, 'insufficient');
  assert.equal(checkpointState(config, [...prior, ...fresh], row.id, 'current', profile.items).status, 'independent');
});
