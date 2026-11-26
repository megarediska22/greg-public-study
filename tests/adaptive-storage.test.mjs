import test from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTIVE_STORAGE_KEY, ADAPTIVE_RECOVERY_PREFIX, openAdaptiveStorage, legacyAccess } from '../src/lib/adaptive/storage.ts';
import { PROGRESS_KEY, emptyProgress, updateProgress, isLessonUnlocked } from '../src/lib/progress.ts';
import { grammarLessons } from '../src/content/historicalCourse.ts';

const initial = { events: [], cursor: 0 };
const next = { events: ['one'], cursor: 1 };
const isData = value => value !== null && typeof value === 'object' && Array.isArray(value.events) && value.events.every(event => typeof event === 'string') && Number.isSafeInteger(value.cursor) && value.cursor >= 0;
const envelope = data => JSON.stringify({ version: 1, data });
function memoryStorage(raw = null) {
  const values = new Map(raw === null ? [] : [[ADAPTIVE_STORAGE_KEY, raw]]);
  const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); writes.push([key, value]); } };
}
function complete(course, count) {
  let progress = emptyProgress();
  for (const { lesson } of course.slice(0, count)) for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    if (step.type === 'exercise') for (const question of step.questions) progress = updateProgress(progress, course, { ...base, type: 'answer', questionId: question.id, answer: question.acceptedAnswers[0] });
    else progress = updateProgress(progress, course, { ...base, type: 'complete' });
  }
  return progress;
}

test('empty and supported startup are read-only; unchanged saves preserve exact raw bytes', () => {
  for (const raw of [null, JSON.stringify({ version: 1, data: initial }, null, 2)]) {
    const storage = memoryStorage(raw);
    const session = openAdaptiveStorage(storage, initial, isData);
    assert.equal(session.status, raw === null ? 'empty' : 'ready');
    assert.deepEqual(session.data, initial);
    assert.equal(session.persist(initial), 'unchanged');
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), raw);
  }
});

test('save, read-back and reload preserve an idempotent snapshot; callers receive detached data', () => {
  const storage = memoryStorage();
  const session = openAdaptiveStorage(storage, initial, isData);
  session.data.events.push('local mutation');
  assert.deepEqual(session.data, initial);
  assert.equal(session.persist(next), 'saved');
  assert.equal(session.status, 'ready');
  assert.deepEqual(session.data, next);
  assert.equal(session.persist(next), 'unchanged');
  const reopened = openAdaptiveStorage(storage, initial, isData);
  assert.deepEqual(reopened.data, next);
  assert.equal(reopened.persist(next), 'unchanged');
  assert.equal(storage.writes.length, 1);
});

test('replacement verifies an exact recovery copy before writing and never touches legacy progress or theme', () => {
  const raw = JSON.stringify({ version: 1, data: initial }, null, 2);
  const storage = memoryStorage(raw);
  storage.values.set(PROGRESS_KEY, '{legacy exact bytes}');
  storage.values.set('gps.theme.v1', 'dark');
  const session = openAdaptiveStorage(storage, initial, isData);
  assert.equal(session.persist(next), 'saved');
  assert.ok(session.recoveryKey.startsWith(ADAPTIVE_RECOVERY_PREFIX));
  assert.equal(storage.getItem(session.recoveryKey), raw);
  assert.equal(storage.writes[0][0], session.recoveryKey);
  assert.equal(storage.writes[1][0], ADAPTIVE_STORAGE_KEY);
  assert.equal(storage.getItem(PROGRESS_KEY), '{legacy exact bytes}');
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
});

test('ordinary saves reuse a single recovery slot with the immediately preceding snapshot', () => {
  const storage = memoryStorage(envelope(initial));
  const session = openAdaptiveStorage(storage, initial, isData);
  assert.equal(session.persist(next), 'saved');
  assert.equal(session.persist(initial), 'saved');
  assert.equal(session.recoveryKey, `${ADAPTIVE_RECOVERY_PREFIX}latest`);
  assert.equal(storage.getItem(session.recoveryKey), envelope(next));
  assert.equal([...storage.values.keys()].filter(key => key.startsWith(ADAPTIVE_RECOVERY_PREFIX)).length, 1);
});

test('malformed, invalid-data and unsupported snapshots stay protected until explicit recovery', () => {
  for (const [raw, status] of [
    ['{broken', 'corrupt'], ['null', 'corrupt'], ['{"version":1,"data":{"events":[],"cursor":-1}}', 'corrupt'],
    ['{"version":2,"data":{"future":"preserve"}}', 'unsupported'],
  ]) {
    const storage = memoryStorage(raw);
    const session = openAdaptiveStorage(storage, initial, isData);
    assert.equal(session.status, status);
    assert.deepEqual(session.data, initial);
    assert.equal(session.persist(initial), 'protected');
    assert.equal(session.persist(next), 'protected');
    assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), raw);
    assert.equal(storage.writes.length, 0);
    assert.equal(session.replaceProtectedWithRecovery(next), 'saved');
    assert.equal(storage.getItem(session.recoveryKey), raw);
    assert.equal(session.status, 'ready');
    assert.equal(session.replaceProtectedWithRecovery(initial), 'protected');
  }
});

test('validation rejects invalid input, exceptions, cycles and serialized transformations before writes', () => {
  const storage = memoryStorage(envelope(initial));
  const session = openAdaptiveStorage(storage, initial, isData);
  const cyclic = { events: [], cursor: 1 };
  cyclic.self = cyclic;
  for (const value of [{ events: [], cursor: -1 }, cyclic, { ...next, toJSON: () => ({ cursor: -1 }) }]) {
    assert.equal(session.persist(value), 'invalid');
  }
  assert.deepEqual(storage.writes, []);
  assert.throws(() => openAdaptiveStorage(storage, { cursor: -1 }, isData), TypeError);
  let throws = false;
  const guarded = openAdaptiveStorage(storage, initial, value => { if (throws) throw Error('validator'); return isData(value); });
  throws = true;
  assert.equal(guarded.persist(next), 'invalid');
  assert.deepEqual(storage.writes, []);
});

test('a failed initial read remains unavailable and cannot turn into a blind write', () => {
  const storage = memoryStorage(envelope(next));
  let denied = true;
  const session = openAdaptiveStorage({ getItem: key => { if (denied) throw Error('denied'); return storage.getItem(key); }, setItem: storage.setItem }, initial, isData);
  denied = false;
  assert.equal(session.status, 'unavailable');
  assert.equal(session.persist(initial), 'unavailable');
  assert.equal(session.persist(next), 'unavailable');
  assert.equal(session.replaceProtectedWithRecovery(next), 'protected');
  assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), envelope(next));
  assert.deepEqual(storage.writes, []);
});

test('quota or backup verification failure leaves existing data and last valid memory intact', () => {
  for (const failure of ['backup-quota', 'silent-backup', 'main-quota']) {
    const raw = envelope(initial);
    const storage = memoryStorage(raw);
    const session = openAdaptiveStorage({ getItem: storage.getItem, setItem: (key, value) => {
      if ((failure === 'backup-quota' && key !== ADAPTIVE_STORAGE_KEY) || (failure === 'main-quota' && key === ADAPTIVE_STORAGE_KEY)) throw Error('quota');
      if (failure === 'silent-backup' && key !== ADAPTIVE_STORAGE_KEY) return;
      storage.setItem(key, value);
    } }, initial, isData);
    assert.equal(session.persist(next), 'unavailable');
    assert.deepEqual(session.data, initial);
    assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), raw);
    if (failure === 'main-quota') assert.equal(storage.getItem(session.recoveryKey), raw);
  }
  const storage = memoryStorage('{broken');
  const session = openAdaptiveStorage({ getItem: storage.getItem, setItem: () => { throw Error('quota'); } }, initial, isData);
  assert.equal(session.replaceProtectedWithRecovery(next), 'unavailable');
  assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), '{broken');
});

test('two sessions reject stale writes and stale no-op saves without duplicating committed changes', () => {
  const storage = memoryStorage();
  const stale = openAdaptiveStorage(storage, initial, isData);
  const current = openAdaptiveStorage(storage, initial, isData);
  assert.equal(current.persist(next), 'saved');
  assert.equal(stale.persist(initial), 'conflict');
  assert.equal(stale.persist({ events: ['other'], cursor: 1 }), 'conflict');
  assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), envelope(next));
  assert.equal(current.persist(next), 'unchanged');
  assert.equal(storage.writes.length, 1);
});

test('concurrent changes during backup abort replacement after preserving the prior bytes', () => {
  const raw = envelope(initial);
  const concurrent = envelope({ events: ['other tab'], cursor: 4 });
  const storage = memoryStorage(raw);
  const session = openAdaptiveStorage({ getItem: storage.getItem, setItem: (key, value) => {
    storage.setItem(key, value);
    if (key.startsWith(ADAPTIVE_RECOVERY_PREFIX)) storage.values.set(ADAPTIVE_STORAGE_KEY, concurrent);
  } }, initial, isData);
  assert.equal(session.persist(next), 'conflict');
  assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), concurrent);
  assert.equal(storage.getItem(session.recoveryKey), raw);
  assert.deepEqual(session.data, initial);
});

test('read-back detects a concurrent replacement or silent write failure without claiming a commit', () => {
  for (const concurrent of [null, envelope({ events: ['winner'], cursor: 2 })]) {
    const storage = memoryStorage();
    const session = openAdaptiveStorage({ getItem: storage.getItem, setItem: (key, value) => {
      if (key === ADAPTIVE_STORAGE_KEY) { if (concurrent !== null) storage.values.set(key, concurrent); }
      else storage.setItem(key, value);
    } }, initial, isData);
    assert.equal(session.persist(next), 'conflict');
    assert.deepEqual(session.data, initial);
    assert.equal(storage.getItem(ADAPTIVE_STORAGE_KEY), concurrent);
  }
});

test('an uncertain commit caused by read-back denial blocks further writes until reopening', () => {
  const storage = memoryStorage();
  let denied = false;
  const session = openAdaptiveStorage({ getItem: key => { if (denied) throw Error('read denied'); return storage.getItem(key); }, setItem: (key, value) => { storage.setItem(key, value); denied = true; } }, initial, isData);
  assert.equal(session.persist(next), 'unavailable');
  denied = false;
  assert.equal(session.status, 'unavailable');
  assert.equal(session.persist(initial), 'unavailable');
  assert.deepEqual(session.data, initial);
  assert.deepEqual(openAdaptiveStorage(storage, initial, isData).data, next);
});

test('legacy access preserves current sequential gates, completed IDs and a usable resume independently', () => {
  const progress = complete(grammarLessons, 3);
  const before = JSON.stringify(progress);
  progress.lastVisited = { lessonId: grammarLessons[1].id, stepId: 'summary' };
  const result = legacyAccess(progress, grammarLessons);
  assert.deepEqual(result.completed, grammarLessons.slice(0, 3).map(entry => entry.id));
  assert.deepEqual(result.available, grammarLessons.filter(entry => isLessonUnlocked(progress, grammarLessons, entry.id)).map(entry => entry.id));
  assert.equal(result.resume, grammarLessons[1].id);
  const { lastVisited: _ignored, ...rest } = progress;
  assert.deepEqual(rest, (({ lastVisited: _ignored, ...data }) => data)(JSON.parse(before)));
  progress.lastVisited = { lessonId: 'planned-not-present', stepId: 'intro' };
  assert.equal(legacyAccess(progress, grammarLessons).resume, grammarLessons[3].id);
  assert.deepEqual(legacyAccess(progress, []), { completed: [], available: [], resume: null });
});

test('legacy projection includes ready lazy catalogue members but never invents planned IDs or knowledge', () => {
  const fresh = legacyAccess(emptyProgress(), grammarLessons);
  assert.equal(fresh.resume, null);
  assert.deepEqual(fresh.available, [grammarLessons[0].id]);
  const lazy = { id: 'registered-lazy', title: 'Lazy ready', subtitle: '', objective: '' };
  const course = [...grammarLessons.slice(0, 1), lazy];
  const progress = complete(course, 1);
  progress.completedLessons.push('planned-not-present');
  const result = legacyAccess(progress, course);
  assert.deepEqual(result, { completed: [course[0].id], available: [course[0].id, lazy.id], resume: lazy.id });
  assert.deepEqual(Object.keys(result), ['completed', 'available', 'resume']);
  const legacy = { ...emptyProgress(), completedLessons: ['to-be'], legacyUnlockedLessons: ['to-be', 'present-simple'] };
  assert.deepEqual(legacyAccess(legacy, grammarLessons).available, grammarLessons.filter(entry => isLessonUnlocked(legacy, grammarLessons, entry.id)).map(entry => entry.id));
});
