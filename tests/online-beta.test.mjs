import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { BETA_STORAGE_KEYS as keys } from '../src/lib/betaStorage.ts';
import { emptyAdaptiveState } from '../src/lib/adaptive/state.ts';
import { getProgressCourse } from '../src/content/extension/registry.ts';
import { emptyProgress, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';

const { bank: _oldBank, ...pilot } = adaptivePilot;
const content = { ...pilot, rules: { ...pilot.rules, version: 'online-beta-v1' } };
const stable = {
  [PROGRESS_KEY]: JSON.stringify({
    ...emptyProgress(getProgressCourse()),
    lastVisited: { lessonId: 'bp-a1-01', stepId: 'intro' },
  }),
  [ADAPTIVE_STORAGE_KEY]: JSON.stringify({ version: 1, data: { ...emptyAdaptiveState(),
    grants: [{ lessonId: 'unit-062', reason: 'start', source: 'profile', version: 'stable', resume: null }],
  } }),
  'gps.theme.v1': 'dark',
};

function fixture(seed = {}) {
  const disk = new Map(Object.entries({ ...stable, ...seed }));
  const accesses = [];
  const requested = [];
  return {
    disk, accesses, requested,
    storage: {
      getItem(key) { accesses.push(key); return disk.get(key) ?? null; },
      setItem(key, value) { accesses.push(key); disk.set(key, value); },
    },
    locks: { async request(name, callback) { requested.push(name); return callback(); } },
  };
}
const open = f => openAdaptiveHost(f.storage, content, keys, f.locks);
const verifyStable = f => {
  assert.ok(f.accesses.every(key => key.startsWith('gps.beta.')), f.accesses);
  for (const [key, value] of Object.entries(stable)) assert.equal(f.disk.get(key), value);
};
const visit = host => updateProgress(host.session.progress, getProgressCourse(), {
  type: 'visit', lessonId: 'bp-a1-01', stepId: 'intro',
}, host.grants());

test('Beta starts Fast Placement with a clean course even when Stable has a resume and an A2 grant', async () => {
  const f = fixture();
  let host = await open(f);
  assert.equal(host.session.progress.lastVisited, null);
  assert.deepEqual([...host.grants()], []);
  assert.equal(host.engine.access('unit-062').available, false);
  assert.equal(host.engine.fast.entry().canStart, true);
  assert.equal(host.engine.entry().diagnosticAvailable, false);
  assert.equal(await host.engine.begin('old-R-P'), 'unchanged');
  assert.equal(host.engine.diagnostic(), null);
  assert.equal(await host.engine.fast.begin('beta'), 'saved');
  assert.equal(await host.persistProgress(visit(host)), 'saved');
  host = await open(f);
  assert.equal(host.engine.fast.view().method, 'fast-placement-v1');
  assert.equal(host.session.progress.lastVisited.lessonId, 'bp-a1-01');
  assert.deepEqual(new Set(f.requested), new Set([keys.progress, keys.adaptive]));
  verifyStable(f);
});

test('Beta retains both stale guards inside its own write locks', async () => {
  const f = fixture();
  const current = await open(f);
  const stale = await open(f);
  assert.equal(await current.persistProgress(visit(current)), 'saved');
  assert.equal(await stale.persistProgress(stale.session.progress), 'conflict');
  assert.equal(await stale.persistProgress(stale.session.progress, { allowReset: true }), 'conflict');
  assert.equal(await current.engine.fast.begin('current'), 'saved');
  assert.equal(await stale.engine.verifyStorage(), 'conflict');
  assert.equal(await stale.engine.fast.begin('stale'), 'conflict');
  assert.equal(await stale.engine.resetAfterConfirmation(), 'conflict');
  assert.equal(JSON.parse(f.disk.get(keys.adaptive)).data.fastPlacement.session.id, 'current');
  assert.equal(JSON.parse(f.disk.get(keys.progress)).lastVisited.lessonId, 'bp-a1-01');
  verifyStable(f);
});

test('Beta reset and explicit recovery preserve edition-scoped backup bytes', async () => {
  const f = fixture({ [keys.adaptive]: '{beta-damaged' });
  let host = await open(f);
  assert.equal(host.protectedData, true);
  assert.equal(await host.engine.recoverAfterConfirmation(), 'saved');
  assert.ok(host.engine.recoveryKey().startsWith(keys.adaptive + '.recovery.'));
  assert.equal(f.disk.get(host.engine.recoveryKey()), '{beta-damaged');

  host = await open(f);
  await host.engine.fast.begin('before-reset');
  await host.persistProgress(visit(host));
  const previous = f.disk.get(keys.progress);
  assert.equal(await host.persistProgress(emptyProgress(getProgressCourse()), { allowReset: true }), 'saved');
  assert.ok(host.session.backupKey.startsWith(keys.progress + '.backup.'));
  assert.equal(f.disk.get(host.session.backupKey), previous);
  assert.equal(await host.engine.resetAfterConfirmation(), 'saved');
  assert.equal(host.engine.fast.view(), null);
  assert.ok(f.disk.has(keys.adaptive + '.recovery.latest'));
  verifyStable(f);
});

test('Beta progress rejects a backup-time competing write before replacing the newer snapshot', async () => {
  const f = fixture({ [keys.progress]: stable[PROGRESS_KEY] });
  const host = await open(f);
  const write = f.storage.setItem.bind(f.storage);
  f.storage.setItem = (key, value) => {
    write(key, value);
    if (key.startsWith(keys.progress + '.backup.')) f.disk.set(keys.progress, '{"newer":true}');
  };
  assert.equal(await host.persistProgress(emptyProgress(getProgressCourse()), { allowReset: true }), 'conflict');
  assert.equal(f.disk.get(keys.progress), '{"newer":true}');
  verifyStable(f);
});
