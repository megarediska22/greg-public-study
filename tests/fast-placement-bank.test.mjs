import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { openAdaptiveEngine } from '../src/lib/adaptive/engine.ts';
import { gradeFast, tokenWord, validateFastBank } from '../src/lib/adaptive/fast/bank.ts';
import { emptyAdaptiveState } from '../src/lib/adaptive/state.ts';
import { familyKey, materialKey } from '../src/lib/adaptive/evidence.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { storage } from './fixtures/adaptive.mjs';

const bank = adaptivePilot.fastBank;
const old = new Map(adaptivePilot.bank.items.map(item => [item.itemId, item]));
const minCourseAccess = { completed: [], available: ['bp-a1-01'], resume: null };
const flattened = form => Object.values(form.slots).flat();

const reviewed = {
  'fast-live-a': [
    'Q', 'are', 'What time does the shop open', '5:45 p.m.', 'Принести Бену книги в кабинет 8.', 'd', '30', 'am',
    'Do you walk in the morning', '17', 'The snack box.', 'Elm',
    ['The draft is finished. Please send me the new map', 'The draft is finished. Please send the new map to me'],
    'Green', 'Post the corrected map in the chat.', 'Клуб меняет место из-за протечки.', 'MNV', 'is',
    'What do the volunteers bring for lunch', '11:30', 'Положить очки в синий футляр.', 'forty-six', 'Train B',
    'The studio is open. Please bring the recording',
  ],
  'fast-live-b': [
    'R', 'is', 'Where does your family eat dinner on Fridays', '1:30 p.m.', 'Полить растения у окна.', 'H', 'twenty', 'are',
    'What days does the bus run', '15', 'Boat C.', 'Lake', 'The stage is ready. Please bring the small cart',
    'West', 'Friday at 3:00, from the library.', 'В 4:30 на кухню школы.', 'T t', 'are', 'Why do they stay after class',
    '3:10 Friday', 'Отнести шнур на кухню.', '60', 'Maple', 'The tickets are ready. Please reply by Friday',
  ],
};

function answer(item, sequence = item.acceptedSequences?.[0]) {
  if (item.format !== 'cards') return { type: 'option', optionId: item.acceptedOptionIds[0] };
  const remaining = [...item.tokens];
  return { type: 'cards', tokenIds: sequence.map(word => {
    const index = remaining.findIndex(token => tokenWord(token) === word);
    assert.ok(index >= 0, `${item.id}: ${word}`);
    return remaining.splice(index, 1)[0].id;
  }) };
}

function wrong(item) {
  return item.format === 'cards'
    ? { type: 'cards', tokenIds: answer(item).tokenIds.reverse() }
    : { type: 'option', optionId: item.options.find(option => !item.acceptedOptionIds.includes(option.id)).id };
}

test('the real forms cover all slots with verified keys and supported card orders', () => {
  assert.deepEqual(validateFastBank(bank), []);
  for (const form of bank.forms) {
    assert.equal(Object.keys(form.slots).length, 22);
    const items = flattened(form);
    assert.equal(items.length, 24);
    for (const [index, item] of items.entries()) {
      const expected = reviewed[form.id][index];
      assert.equal(gradeFast(item, answer(item)), true, item.id);
      assert.equal(gradeFast(item, wrong(item)), false, item.id);
      if (item.format === 'cards') {
        assert.equal(item.role, 'S');
        assert.deepEqual(item.acceptedSequences.map(sequence => sequence.join(' ')), [expected].flat(), item.id);
        for (const sequence of item.acceptedSequences) assert.equal(gradeFast(item, answer(item, sequence)), true);
        const ids = answer(item).tokenIds;
        assert.equal(gradeFast(item, { type: 'cards', tokenIds: [ids[0], ...ids] }), null);
        assert.ok(item.group === 'ASK' ? item.wrongAttribution === 'direct' : item.wrongAttribution === 'ambiguous');
      } else {
        assert.equal(item.role, 'R');
        assert.deepEqual(item.options.filter(option => item.acceptedOptionIds.includes(option.id)).map(option => option.label), [expected], item.id);
      }
    }
  }
});

function open(formId, disk = storage()) {
  const forms = [...bank.forms].sort((a, b) => Number(b.id === formId) - Number(a.id === formId));
  const engine = openAdaptiveEngine({ ...adaptivePilot, fastBank: { ...bank, forms }, storage: disk, legacy: () => minCourseAccess });
  assert.equal(engine.fast.entry().contentErrors.length, 0);
  return { engine, disk };
}

const saved = disk => JSON.parse(disk.getItem(ADAPTIVE_STORAGE_KEY)).data;
const skip = () => ({ type: 'skip' });
async function run(engine, disk, id, respond) {
  const api = engine.fast;
  assert.equal(await api.begin(id), 'saved');
  const seen = [];
  const form = bank.forms.find(form => form.id === api.view().form);
  while (api.view().status === 'active') {
    const view = api.view();
    assert.ok(view.presented <= 15);
    assert.ok(!['acceptedSequences', 'acceptedOptionIds', 'target', 'wrongAttribution'].some(key => key in view.prompt));
    const pin = saved(disk).fastPlacement.session.presented.at(-1);
    const item = form.slots[pin.slot].find(item => item.id === pin.itemId);
    assert.ok(!seen.some(prev => prev.item.id === item.id || prev.item.family === item.family));
    seen.push({ slot: pin.slot, item });
    assert.equal(await api.submit(view.cursor, respond(pin.slot, item)), 'saved');
  }
  assert.equal(api.result().presented, seen.length);
  return { result: api.result(), seen };
}

for (const form of bank.forms) {
  const scenarios = [
    ['two Latin negatives', (_, item) => wrong(item), 'bp-pre-01', 2],
    ['two BE negatives', (slot, item) => slot.endsWith('-be') ? wrong(item) : answer(item), 'to-be', 7],
    ['two ASK negatives', (slot, item) => slot.endsWith('-ask') ? wrong(item) : answer(item), 'do-does', 8],
    ['fatigue after late A1 anchors', (slot, item) => ['core-lat', 'core-be', 'core-ask'].includes(slot) ? answer(item) : skip(), 'hours-and-signs', 8],
    ['conflicting Latin answers followed by a fresh clarifier',
      (slot, item) => slot === 'core-lat' ? wrong(item) : answer(item), 'unit-042', 10],
    ['only neutral responses', skip, null, 8],
    ['A2 entry with limited upper evidence', (slot, item) => /constraint|write/.test(slot) ? skip() : answer(item), 'unit-042', 10],
    ['strong upper route', (_, item) => answer(item), 'unit-062', 10],
    ['upper route with two clarifications', (slot, item) => ['upper-constraint-2', 'upper-write'].includes(slot) ? skip() : answer(item), 'unit-062', 12],
  ];
  for (const [label, strategy, lesson, length] of scenarios) {
    test(`${form.id} uses the expected route for ${label}`, async () => {
      const { engine, disk } = open(form.id);
      const { result, seen } = await run(engine, disk, 'route', strategy);
      assert.equal(engine.fast.view().form, form.id);
      assert.equal(result.recommendation?.lessonId ?? null, lesson);
      assert.equal(seen.length, length);
      if (length === 12) assert.deepEqual(seen.slice(-2).map(entry => entry.slot), ['clarify-constraint', 'clarify-write']);
      assert.deepEqual(saved(disk).history, []);
      assert.deepEqual(saved(disk).grants, []);
      if (lesson) {
        assert.equal(await engine.fast.accept(result.sessionId, { kind: 'recommendation', lessonId: lesson }), 'saved');
        assert.deepEqual([...engine.grantedLessons()], [lesson]);
        assert.equal(engine.access(lesson).completed, false);
      }
    });
  }

  test(`${form.id} selects fresh alternatives when the legacy materials were shown`, async () => {
    const reused = flattened(form).filter(item => old.has(item.id));
    assert.equal(reused.length, 2);
    for (const item of reused) {
      const legacy = old.get(item.id);
      assert.deepEqual([item.family, item.stimulus, item.keyId, item.itemRevision, item.keyRevision],
        [legacy.family, legacy.stimulus, legacy.keyId, legacy.itemRevision, legacy.keyRevision]);
      assert.equal(item.prompt, legacy.question.prompt);
      assert.equal(item.instruction, legacy.question.instruction);
    }
    for (const exposureKey of [familyKey, materialKey]) {
      const disk = storage();
      disk.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify({ version: 1, data: {
        ...emptyAdaptiveState(), exposed: reused.map(item => exposureKey(old.get(item.id))),
      } }));
      const { engine } = open(form.id, disk);
      const { result, seen } = await run(engine, disk, 'legacy-return', (_, item) => answer(item));
      assert.equal(result.recommendation.lessonId, 'unit-062');
      assert.equal(seen.length, 10);
      assert.ok(seen.every(({ item }) => !old.has(item.id)));
      assert.equal(seen.find(({ slot }) => slot === 'upper-transfer').item.group, form.id === 'fast-live-a' ? 'GIST' : 'MEDIATE');
    }
  });
}

test('pause and reload preserve the real card draft and a retake uses the other form', async () => {
  const disk = storage();
  let { engine } = open(bank.forms[0].id, disk);
  const api = engine.fast;
  await api.begin('one');
  for (const slot of ['core-lat', 'core-be']) await api.submit(api.view().cursor, answer(bank.forms[0].slots[slot][0]));
  const cards = bank.forms[0].slots['core-ask'][0];
  const draft = { type: 'cards', tokenIds: answer(cards).tokenIds.slice(0, 2).reverse() };
  await api.select(api.view().cursor, draft);
  await api.action(api.sessionCursor(), 'pause');
  ({ engine } = open(bank.forms[0].id, disk));
  await engine.fast.action(engine.fast.sessionCursor(), 'resume');
  assert.deepEqual(engine.fast.view().selection, draft);
  assert.equal(engine.fast.view().answered, 2);
  await engine.fast.action(engine.fast.sessionCursor(), 'finish');
  assert.equal(engine.fast.result().recommendation, null);
  const { seen } = await run(engine, disk, 'two', (_, item) => answer(item));
  assert.equal(engine.fast.view().form, bank.forms[1].id);
  assert.equal(seen.length, 10);
  assert.equal(engine.fast.entry().canStart, false);
});
