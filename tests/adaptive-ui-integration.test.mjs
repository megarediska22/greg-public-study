import test from 'node:test';
import assert from 'node:assert/strict';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { ADAPTIVE_STORAGE_KEY } from '../src/lib/adaptive/storage.ts';
import { emptyProgress, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { getProgressCourse, loadLesson } from '../src/content/extension/registry.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { content } from './fixtures/adaptive-ui-data.mjs';
import { storage } from './fixtures/adaptive.mjs';

test('UI host opens the old progress read-only and enables the local bank and keeps explicit empty or disabled modes unavailable', async () => {
  const disk = storage();
  const legacy = { ...emptyProgress(), lastVisited: { lessonId: 'to-be', stepId: 'intro' } };
  const raw = JSON.stringify(legacy);
  disk.setItem(PROGRESS_KEY, raw);
  const host = await openAdaptiveHost(disk, adaptivePilot);
  assert.equal(host.engine.entry().resume, 'to-be');
  assert.equal(host.engine.entry().diagnosticAvailable, true);
  assert.equal(host.engine.access('to-be').available, true);
  const empty = await openAdaptiveHost(disk, { ...adaptivePilot, bank: { version: 'empty-test', items: [], forms: [] } });
  assert.equal(empty.engine.entry().diagnosticAvailable, false);
  assert.equal(await empty.engine.begin('unavailable'), 'unchanged');
  const disabled = await openAdaptiveHost(disk, { ...adaptivePilot, rules: { ...adaptivePilot.rules, enabled: false } });
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

test('a persisted practice receipt restores the first attempt after a failed sidecar write, exactly once and with original help', async () => {
  const disk = storage();
  let failAdaptive = false;
  const port = {
    getItem: disk.getItem,
    setItem(key, value) {
      if (key === ADAPTIVE_STORAGE_KEY && failAdaptive) throw new Error('Quota');
      disk.setItem(key, value);
    },
  };
  let host = await openAdaptiveHost(port, adaptivePilot);
  const lessonId = 'bp-a1-01';
  const lesson = await loadLesson(lessonId);
  const course = getProgressCourse();
  let progress = host.session.progress;
  for (const step of lesson.steps.slice(0, 4)) {
    const action = step.type === 'exercise'
      ? { type: 'check-exercise', lessonId, stepId: step.id, answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
      : { type: 'complete', lessonId, stepId: step.id };
    progress = updateProgress(progress, course, action, host.grants());
  }
  const written = lesson.steps.find(step => step.type === 'exercise' && step.id === 'written');
  const assisted = written.questions.find(q => q.id.endsWith('lost-surname'));
  assert.equal(await host.engine.hint(lessonId, written.id, assisted.id, 2), 'saved');
  const action = { type: 'check-exercise', lessonId, stepId: written.id,
    answers: Object.fromEntries(written.questions.map(q => [q.id, q.acceptedAnswers[0]])) };
  const after = updateProgress(progress, course, action, host.grants());
  host.engine.receiptPractice(progress, after, action);
  assert.equal(host.session.persist(after), 'saved');
  failAdaptive = true;
  assert.equal(await host.engine.restoreStudy(after), 'unavailable');
  assert.equal(JSON.parse(disk.getItem(ADAPTIVE_STORAGE_KEY)).data.history.length, 0);
  failAdaptive = false;
  host = await openAdaptiveHost(port, adaptivePilot);
  assert.equal(await host.engine.restoreStudy(host.session.progress), 'saved');
  assert.equal(await host.engine.restoreStudy(host.session.progress), 'unchanged');
  const events = JSON.parse(disk.getItem(ADAPTIVE_STORAGE_KEY)).data.history;
  assert.equal(events.length, 2);
  assert.equal(events.find(event => event.item.itemId === assisted.id).neutral, 'assisted');
  assert.equal(events.find(event => event.item.itemId === assisted.id).assistance, 'H2');
  assert.equal(events.filter(event => event.sign === '+').length, 1);
  assert.equal(host.engine.knowledge().find(item => item.criterion.id === 'C-PK01-REPAIR').state, 'PRELIMINARY');
});

test('startup reconciliation restores an ordinary successor from a completed granted lesson after a failed save', async () => {
  const disk = storage();
  const host = await openAdaptiveHost(disk, content);
  assert.equal(await host.engine.begin('placement-before-completion'), 'saved');
  while (host.engine.diagnostic().prompt) {
    const { id, slot, type } = host.engine.diagnostic().prompt;
    await host.engine.submit({ slot, itemId: id, key: String(slot), type: 'answer', answer: type === 'choice' ? 'west' : 'quartz' });
  }
  assert.equal(await host.engine.diagnosticAction('decline-upper'), 'saved');
  const lessonId = 'unit-062';
  assert.equal(await host.engine.choose({ type: 'accept', lessonId }), 'saved');
  const lesson = await loadLesson(lessonId);
  const course = getProgressCourse();
  let progress = host.session.progress;
  for (const step of lesson.steps) {
    const action = step.type === 'exercise'
      ? { type: 'check-exercise', lessonId, stepId: step.id, answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
      : { type: 'complete', lessonId, stepId: step.id };
    progress = updateProgress(progress, course, action, host.grants());
  }
  assert.equal(host.session.persist(progress), 'saved');
  // Simulate a restart before the adaptive completion effect.
  const reopened = await openAdaptiveHost(disk, content);
  assert.equal(reopened.engine.access('unit-063').available, false);
  assert.equal(await reopened.engine.restoreStudy(reopened.session.progress), 'saved');
  assert.equal(await reopened.engine.restoreStudy(reopened.session.progress), 'unchanged');
  assert.deepEqual([...reopened.grants()], ['unit-062', 'unit-063']);
  assert.deepEqual(reopened.session.progress.completedLessons, ['unit-062']);
});
