import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarLessons as lessons } from '../src/content/course.ts';
import { emptyProgress, updateProgress, decodeProgress, loadProgress, saveProgress, isLessonUnlocked, PROGRESS_KEY } from '../src/lib/progress.ts';
import { openProgressSession, PROGRESS_BACKUP_PREFIX } from '../src/lib/progressStorage.ts';

function memoryStorage(raw = null) {
  const values = new Map(raw === null ? [] : [[PROGRESS_KEY, raw]]);
  const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
}
function complete(course = lessons, count = course.length) {
  let progress = emptyProgress();
  for (const { lesson } of course.slice(0, count)) for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    if (step.type === 'exercise') for (const question of step.questions) progress = updateProgress(progress, course, { ...base, type: 'answer', questionId: question.id, answer: question.acceptedAnswers[0] });
    else progress = updateProgress(progress, course, { ...base, type: 'complete' });
  }
  return progress;
}
const visit = progress => updateProgress(progress, lessons, { type: 'visit', lessonId: 'to-be', stepId: 'intro' });

test('historical unguarded startup sequence reproduces data loss using only disposable mock storage', () => {
  const original = JSON.stringify(complete(lessons, 3));
  const storage = memoryStorage(original);
  const deniedRead = { getItem: () => { throw Error('temporary read denial'); }, setItem: storage.setItem };
  const loaded = loadProgress(deniedRead, lessons);
  assert.equal(loaded.unavailable, true);
  // This was the old provider's unconditional mount effect, not the current provider.
  assert.equal(saveProgress(deniedRead, loaded.progress), true);
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY)), emptyProgress());
  assert.notEqual(storage.getItem(PROGRESS_KEY), original);
  const legacyRaw = '{"version":99,"lessons":{"old":{"completedSteps":["summary"]}}}';
  const legacy = memoryStorage(legacyRaw);
  saveProgress(legacy, loadProgress(legacy, lessons).progress);
  assert.equal(legacy.getItem(PROGRESS_KEY), JSON.stringify(emptyProgress()));
});

test('normal startup is read-only, retaining exact saved bytes and all completed lessons', () => {
  const progress = complete();
  const raw = JSON.stringify(progress, null, 2);
  const storage = memoryStorage(raw);
  const session = openProgressSession(storage, lessons);
  assert.deepEqual(session.progress, progress);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.deepEqual(storage.writes, []);
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
});

test('repeated initialization and persistence effects never replace valid progress with empty data', () => {
  const raw = JSON.stringify(complete());
  const storage = memoryStorage(raw);
  for (let index = 0; index < 5; index++) {
    const session = openProgressSession(storage, lessons);
    assert.equal(session.persist(session.progress), 'unchanged');
    assert.equal(session.persist(emptyProgress()), 'empty-blocked');
  }
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
  assert.deepEqual(storage.writes, []);
});

test('original three-lesson state loads unchanged and unlocks only lesson 4 in the expanded catalog', () => {
  const old = complete(lessons.slice(0, 3));
  const storage = memoryStorage(JSON.stringify(old));
  storage.values.set('gps.theme.v1', 'dark');
  const session = openProgressSession(storage, lessons);
  assert.deepEqual(session.progress, old);
  assert.equal(session.recovered, false);
  assert.equal(isLessonUnlocked(session.progress, lessons, 'have-has'), true);
  assert.equal(isLessonUnlocked(session.progress, lessons, 'articles'), false);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
});

test('real changes save and survive reload without reinitializing scores or last visited step', () => {
  const storage = memoryStorage(JSON.stringify(complete(lessons, 3)));
  const session = openProgressSession(storage, lessons);
  const changed = visit(session.progress);
  assert.equal(session.persist(changed), 'saved');
  const reloaded = openProgressSession(storage, lessons);
  assert.deepEqual(reloaded.progress, changed);
  assert.equal(reloaded.persist(reloaded.progress), 'unchanged');
  assert.equal(storage.writes.length, 1);
});

test('appending lessons preserves all earned completion and does not trigger a startup write', () => {
  const progress = complete();
  const future = { ...lessons[0], id: 'future', lesson: { ...lessons[0].lesson, id: 'future' } };
  const storage = memoryStorage(JSON.stringify(progress));
  const session = openProgressSession(storage, [...lessons, future]);
  assert.deepEqual(session.progress, progress);
  assert.equal(session.recovered, false);
  assert.equal(isLessonUnlocked(session.progress, [...lessons, future], 'future'), true);
  assert.equal(session.persist(session.progress), 'unchanged');
});

test('temporarily missing lessons are retained in a byte-exact backup before later writes', () => {
  const original = complete();
  const raw = JSON.stringify(original);
  const storage = memoryStorage(raw);
  const smaller = lessons.slice(0, 3);
  const session = openProgressSession(storage, smaller);
  assert.equal(session.recovered, true);
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
  assert.deepEqual(storage.writes, []);
  assert.equal(session.persist(visit(session.progress)), 'saved');
  assert.ok(session.backupKey.startsWith(PROGRESS_BACKUP_PREFIX));
  assert.equal(storage.getItem(session.backupKey), raw);
  assert.deepEqual(decodeProgress(storage.getItem(session.backupKey), lessons).progress, original);
});

test('renamed IDs and unknown legacy records are not silently erased on initialization', () => {
  const original = complete(lessons, 3);
  const raw = JSON.stringify({ ...original, lessons: { ...original.lessons, 'legacy-lesson': { completedSteps: ['old-step'], answers: {} } } });
  const renamed = lessons.map((entry, index) => index ? entry : { ...entry, id: 'renamed', lesson: { ...entry.lesson, id: 'renamed' } });
  const storage = memoryStorage(raw);
  const session = openProgressSession(storage, renamed);
  assert.equal(session.recovered, true);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
  const changed = updateProgress(session.progress, renamed, { type: 'visit', lessonId: 'renamed', stepId: 'intro' });
  assert.equal(session.persist(changed), 'saved');
  assert.equal(storage.getItem(session.backupKey), raw);
});

test('malformed and unsupported schemas remain untouched until activity, then are backed up', () => {
  for (const raw of ['{broken json', '{"version":99,"lessons":{"legacy":{"answers":{}}}}']) {
    const storage = memoryStorage(raw);
    const session = openProgressSession(storage, lessons);
    assert.equal(session.recovered, true);
    assert.equal(session.persist(session.progress), 'unchanged');
    assert.equal(storage.getItem(PROGRESS_KEY), raw);
    assert.equal(session.persist(visit(session.progress)), 'saved');
    assert.equal(storage.getItem(session.backupKey), raw);
    assert.equal(storage.writes[0], session.backupKey);
    assert.equal(storage.writes[1], PROGRESS_KEY);
  }
});

test('a transient read failure cannot be followed by a blind empty or visit write', () => {
  const raw = JSON.stringify(complete(lessons, 3));
  const storage = memoryStorage(raw);
  let denied = true;
  const port = { getItem: key => { if (denied) throw Error('transient read failure'); return storage.getItem(key); }, setItem: storage.setItem };
  const session = openProgressSession(port, lessons);
  denied = false;
  assert.equal(session.unavailable, true);
  assert.equal(session.persist(emptyProgress()), 'unavailable');
  assert.equal(session.persist(visit(session.progress)), 'unavailable');
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
  assert.deepEqual(storage.writes, []);
  assert.equal(openProgressSession(port, lessons).progress.completedLessons.length, 3);
});

test('backup failure preserves the current raw data and reports the blocked save', () => {
  const raw = '{invalid';
  const storage = memoryStorage(raw);
  const session = openProgressSession({ getItem: storage.getItem, setItem: (key, value) => { if (key.startsWith(PROGRESS_BACKUP_PREFIX)) throw Error('quota'); storage.setItem(key, value); } }, lessons);
  assert.equal(session.persist(visit(session.progress)), 'backup-failed');
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
  assert.deepEqual(storage.writes, []);
});

test('stale sessions cannot overwrite another tab’s newer saved progress', () => {
  const storage = memoryStorage();
  const older = openProgressSession(storage, lessons);
  const newer = openProgressSession(storage, lessons);
  const progressed = complete(lessons, 3);
  assert.equal(newer.persist(progressed), 'saved');
  const raw = storage.getItem(PROGRESS_KEY);
  assert.equal(older.persist(visit(older.progress)), 'conflict');
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
});

test('only an explicit confirmed reset can replace earned progress, retaining a backup and theme', () => {
  const raw = JSON.stringify(complete(lessons, 3));
  const storage = memoryStorage(raw);
  storage.values.set('gps.theme.v1', 'dark');
  const session = openProgressSession(storage, lessons);
  assert.equal(session.persist(emptyProgress()), 'empty-blocked');
  assert.equal(session.persist(emptyProgress(), { allowReset: true }), 'saved');
  assert.equal(storage.getItem(session.backupKey), raw);
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
});

test('a failed write leaves existing progress intact', () => {
  const raw = JSON.stringify(complete(lessons, 3));
  const storage = memoryStorage(raw);
  const session = openProgressSession({ getItem: storage.getItem, setItem: () => { throw Error('write denied'); } }, lessons);
  assert.equal(session.persist(visit(session.progress)), 'unavailable');
  assert.equal(storage.getItem(PROGRESS_KEY), raw);
});

test('explicit reset can replace a malformed initial record only after preserving its exact backup', () => {
  const raw = '{broken legacy record';
  const storage = memoryStorage(raw);
  const session = openProgressSession(storage, lessons);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.equal(session.persist(emptyProgress(), { allowReset: true }), 'saved');
  assert.equal(storage.getItem(session.backupKey), raw);
  assert.equal(storage.getItem(PROGRESS_KEY), JSON.stringify(emptyProgress()));
});
