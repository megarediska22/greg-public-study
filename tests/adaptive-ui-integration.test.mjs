import test from 'node:test';
import assert from 'node:assert/strict';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { emptyProgress, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { getProgressCourse, loadLesson } from '../src/content/extension/registry.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { content } from './fixtures/adaptive-ui-data.mjs';
import { storage } from './fixtures/adaptive.mjs';

test('UI host opens the old progress read-only and keeps the empty bank and disabled mode unavailable', async () => {
  const disk = storage();
  const legacy = updateProgress(emptyProgress(), getProgressCourse(), { type: 'visit', lessonId: 'to-be', stepId: 'intro' });
  const raw = JSON.stringify(legacy);
  disk.setItem(PROGRESS_KEY, raw);
  const host = await openAdaptiveHost(disk, adaptivePilot);
  assert.equal(host.engine.entry().resume, 'to-be');
  assert.equal(host.engine.entry().diagnosticAvailable, false);
  assert.equal(host.engine.access('to-be').available, true);
  assert.equal(await host.engine.begin('unavailable'), 'unchanged');
  const disabled = await openAdaptiveHost(disk, { ...content, rules: { ...content.rules, enabled: false } });
  assert.equal(disabled.engine.entry().diagnosticAvailable, false);
  assert.equal(disk.getItem(PROGRESS_KEY), raw);
  assert.equal(disk.getItem(ADAPTIVE_STORAGE_KEY), null);
});

test('UI host resumes the same diagnostic slot and restores only explicitly granted lesson progress', async () => {
  const disk = storage();
  let host = await openAdaptiveHost(disk, content);
  assert.equal(host.engine.entry().showChoice, true);
  assert.equal(await host.engine.begin('diagnostic-ui'), 'saved');
  assert.equal(await host.engine.diagnosticAction('pause'), 'saved');
  host = await openAdaptiveHost(disk, content);
  assert.equal(host.engine.entry().resumable, true);
  assert.equal(host.engine.diagnostic().status, 'paused');
  assert.equal(await host.engine.diagnosticAction('resume'), 'saved');
  while (host.engine.diagnostic().prompt) {
    const { id, slot, type } = host.engine.diagnostic().prompt;
    assert.equal(await host.engine.submit({ slot, itemId: id, key: String(slot), type: 'answer', answer: type === 'choice' ? 'west' : 'quartz' }), 'saved');
  }
  assert.equal(host.engine.diagnostic().status, 'offer-upper');
  assert.equal(await host.engine.diagnosticAction('decline-upper'), 'saved');
  const { lessonId } = host.engine.result().placement.start;
  assert.notEqual(lessonId, 'to-be');
  assert.equal(host.engine.access(lessonId).recommended, true);
  assert.equal(host.engine.access(lessonId).available, false);
  assert.equal(await host.engine.choose({ type: 'accept', lessonId }), 'saved');
  assert.equal(host.engine.access(lessonId).available, true);
  assert.deepEqual([...host.grants()], [lessonId]);
  await loadLesson(lessonId);
  const entered = updateProgress(host.session.progress, getProgressCourse(), { type: 'complete', lessonId, stepId: 'intro' }, host.grants());
  const visited = updateProgress(entered, getProgressCourse(), { type: 'visit', lessonId, stepId: 'theory' }, host.grants());
  assert.equal(host.session.persist(visited), 'saved');
  host = await openAdaptiveHost(disk, content);
  assert.deepEqual(host.session.progress.lastVisited, { lessonId, stepId: 'theory' });
  assert.equal(host.engine.entry().resume, lessonId);
  assert.equal(host.engine.entry().diagnosticAvailable, true);
  assert.equal(await host.engine.begin('retake-ui'), 'saved');
});

test('UI host protects an incompatible draft and the original bytes of a damaged store', async () => {
  const disk = storage();
  const first = await openAdaptiveHost(disk, content);
  assert.equal(await first.engine.begin('old-draft'), 'saved');
  const draft = disk.getItem(ADAPTIVE_STORAGE_KEY);
  const next = await openAdaptiveHost(disk, { ...content, bank: { ...content.bank, version: 'updated-bank' } });
  assert.equal(next.engine.entry().incompatibleDraft, true);
  assert.equal(disk.getItem(ADAPTIVE_STORAGE_KEY), draft);
  disk.setItem(ADAPTIVE_STORAGE_KEY, '{damaged');
  const damaged = await openAdaptiveHost(disk, content);
  assert.equal(damaged.protectedData, true);
  assert.equal(await damaged.engine.begin('protected'), 'protected');
  assert.equal(disk.getItem(ADAPTIVE_STORAGE_KEY), '{damaged');
  assert.equal(await damaged.engine.recoverAfterConfirmation(), 'saved');
  assert.equal(disk.getItem(damaged.engine.recoveryKey()), '{damaged');
});

test('UI host reports failed writes and stale tab writes without granting lesson access', async () => {
  const disk = storage();
  const before = await openAdaptiveHost(disk, content);
  const other = await openAdaptiveHost(disk, content);
  assert.equal(await before.engine.begin('first-tab'), 'saved');
  assert.equal(await other.engine.begin('stale-tab'), 'conflict');
  assert.equal(other.engine.diagnostic(), null);
  const denied = await openAdaptiveHost({ getItem: disk.getItem, setItem: () => { throw new Error('Quota'); } }, content);
  assert.equal(await denied.engine.diagnosticAction('pause'), 'unavailable');
  assert.equal(denied.engine.diagnostic().status, 'active');
});
