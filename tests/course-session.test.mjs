import test from 'node:test';
import assert from 'node:assert/strict';
import { openCourseSession } from '../src/lib/courseSession.ts';
import { emptyProgress, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { historicalLessons, lessons } from '../src/content/course.ts';
import { availableUnitIds, loadedUnitIds, loadedReplayIds } from '../src/content/extension/registry.ts';
import { replayLoaders } from '../src/content/extension/generated/loaders.ts';
import { replayLesson } from '../src/content/extension/adaptUnit.ts';

function store(raw) {
  const values = new Map([[PROGRESS_KEY, raw], ['gps.theme.v1', 'dark']]);
  const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
}
function finish(progress, course, lesson) {
  for (const step of lesson.steps) progress = updateProgress(progress, course, step.type === 'exercise'
    ? { type: 'check-exercise', lessonId: lesson.id, stepId: step.id, answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
    : { type: 'complete', lessonId: lesson.id, stepId: step.id });
  return progress;
}

test('async startup is read-only for empty, malformed and denied storage', async () => {
  for (const raw of [null, '{bad', '[]', '{"version":1,"lessons":null}']) {
    const storage = store(raw);
    const session = await openCourseSession(storage);
    assert.deepEqual(session.progress, emptyProgress(lessons));
    assert.equal(session.persist(session.progress), 'unchanged');
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.values.get(PROGRESS_KEY), raw);
    assert.equal(storage.values.get('gps.theme.v1'), 'dark');
  }
  const denied = await openCourseSession({ getItem: () => { throw Error('denied'); }, setItem: () => assert.fail('blind write') });
  assert.equal(denied.unavailable, true);
  assert.equal(denied.persist(emptyProgress()), 'unavailable');
  assert.deepEqual(loadedReplayIds(), []);
  assert.deepEqual(loadedUnitIds(), []);
});

test('a cross-tab change during asynchronous startup cannot be decoded or overwritten as the prepared snapshot', async () => {
  const storage = store(null);
  const opening = openCourseSession(storage);
  storage.values.set(PROGRESS_KEY, '{"another":"tab"}');
  const session = await opening;
  assert.deepEqual(session.progress, emptyProgress(lessons));
  const changed = updateProgress(session.progress, lessons, { type: 'complete', lessonId: 'bp-a1-01', stepId: 'intro' });
  assert.equal(session.persist(changed), 'conflict');
  assert.deepEqual(storage.writes, []);
  assert.equal(storage.values.get(PROGRESS_KEY), '{"another":"tab"}');
});

test('old-only and mixed saves preserve attempts without fetching rich units or untouched replay keys', async () => {
  let progress = emptyProgress();
  for (const { lesson } of historicalLessons) progress = finish(progress, historicalLessons, lesson);
  const oldStore = store(JSON.stringify(progress));
  const migrated = { ...progress, curriculumVersion: 3, pk01CoreAccess: true };
  assert.deepEqual((await openCourseSession(oldStore)).progress, migrated);
  assert.deepEqual(loadedUnitIds(), []);
  assert.deepEqual(loadedReplayIds(), []);
  const first = lessons.find(entry => entry.id === 'unit-027');
  if (!first) return;
  const compact = replayLesson(await replayLoaders[first.id]());
  progress = finish(migrated, [...historicalLessons, { ...first, lesson: compact }], compact);
  progress = { ...progress, lastVisited: { lessonId: first.id, stepId: 'summary' } };
  const storage = store(JSON.stringify(progress));
  const session = await openCourseSession(storage);
  assert.deepEqual(session.progress, progress);
  assert.equal(session.recovered, false);
  assert.equal(session.persist(progress), 'unchanged');
  assert.deepEqual(storage.writes, []);
  assert.deepEqual(loadedReplayIds(), [first.id]);
  assert.deepEqual(loadedUnitIds(), []);
  assert.ok(loadedReplayIds().length <= availableUnitIds.length);
});

test('an unavailable replay chunk stops startup without erasing stored new attempts', async () => {
  const entry = lessons.find(entry => entry.id.startsWith('unit-') && !loadedReplayIds().includes(entry.id));
  if (!entry) return;
  const original = replayLoaders[entry.id];
  const raw = JSON.stringify({ ...emptyProgress(), lessons: { [entry.id]: { completedSteps: ['intro'], answers: {} } } });
  const storage = store(raw);
  try {
    replayLoaders[entry.id] = async () => { throw Error('chunk unavailable'); };
    await assert.rejects(openCourseSession(storage), /chunk unavailable/);
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.values.get(PROGRESS_KEY), raw);
  } finally { replayLoaders[entry.id] = original; }
});

test('mixed saves with unknown future data stay byte-for-byte unchanged on startup and retain a backup before edits', async () => {
  let progress = finish(emptyProgress(), historicalLessons, historicalLessons[0].lesson);
  const mixed = { ...progress, lessons: { ...progress.lessons, 'unit-999': { completedSteps: ['intro'], answers: { 'unit-999-original': { attempts: [{ answer: 'original answer', correct: false }], retrying: false } } } } };
  const raw = JSON.stringify(mixed);
  const storage = store(raw);
  const session = await openCourseSession(storage);
  assert.equal(session.recovered, true);
  assert.equal(storage.values.get(PROGRESS_KEY), raw);
  assert.equal(session.persist(session.progress), 'unchanged');
  progress = updateProgress(session.progress, lessons, { type: 'visit', lessonId: 'to-be', stepId: 'theory' });
  assert.equal(session.persist(progress), 'saved');
  assert.equal(storage.values.get(session.backupKey), raw);
  assert.equal(storage.values.get('gps.theme.v1'), 'dark');
});
