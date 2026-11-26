import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { lessons, historicalLessons, baselineLessons, baselineQuestionCount, questionCount } from '../src/content/course.ts';
import { availableEntries } from '../src/content/extension/generated/catalog.ts';
import { unitLoaders, replayLoaders } from '../src/content/extension/generated/loaders.ts';
import { availableUnitIds, extensionEntries, getProgressCourse, loadLesson, loadedUnitIds, loadedReplayIds, prepareProgressCourse } from '../src/content/extension/registry.ts';
import { adaptUnit, replayLesson, unitBand, unitLevel } from '../src/content/extension/adaptUnit.ts';
import { decodeProgress, emptyProgress, getScore, isLessonUnlocked, isStepUnlocked, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { openProgressSession } from '../src/lib/progressStorage.ts';
import { taskPresentation, validateTaskIndicators } from '../src/lib/taskIndicators.ts';
import { gradeAnswer } from '../src/lib/grading.ts';

const questions = lesson => lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []);
function finish(progress, course, lesson, introduceMistakes = false) {
  for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    if (step.type !== 'exercise') progress = updateProgress(progress, course, { ...base, type: 'complete' });
    else {
      const answers = Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]]));
      if (introduceMistakes) {
        const first = step.questions[0];
        const wrong = first.type === 'choice' ? first.options.find(option => !first.acceptedAnswers.includes(option)) : 'definitely invalid answer';
        progress = updateProgress(progress, course, { ...base, type: 'check-exercise', answers: { ...answers, [first.id]: wrong } });
        assert.equal(getScore(progress, lesson, step).correct, 4);
        assert.equal(progress.lessons[lesson.id].answers[first.id].attempts.length, 1);
      }
      progress = updateProgress(progress, course, { ...base, type: 'check-exercise', answers });
    }
  }
  return progress;
}

// A fixed hash covers all 26 historical lesson definitions including pilot #22–26.
// The expected value is recorded independently of the generated extension catalog.
test('lightweight startup preserves the complete historical fixture and imports no rich extensions', async () => {
  assert.equal(historicalLessons.length, 26);
  assert.deepEqual(baselineLessons.slice(0, 26), historicalLessons);
  assert.equal(createHash('sha256').update(JSON.stringify(historicalLessons)).digest('hex'), '2ecd1ba372f0f2c3a15082d38b23e346d00ce8c7d1a8739d1e5077219a71e6cd');
  assert.deepEqual(loadedUnitIds(), []);
  assert.deepEqual(loadedReplayIds(), []);
  assert.equal(baselineQuestionCount, 555 + extensionEntries.length * 15);
  const fresh = await prepareProgressCourse(null);
  assert.deepEqual(decodeProgress(null, fresh).progress, emptyProgress(fresh));
  assert.deepEqual(loadedReplayIds(), []);
  assert.deepEqual(loadedUnitIds(), []);
  const malformed = await prepareProgressCourse('{bad');
  assert.equal(decodeProgress('{bad', malformed).recovered, true);
  assert.deepEqual(loadedReplayIds(), []);
  for (const { id } of extensionEntries) assert.equal(isLessonUnlocked(emptyProgress(), lessons, id), false);
});

test('current batches are refreshed exactly, while gaps never bypass course prerequisites', () => {
  const files = fs.readdirSync(new URL('../src/content/extension/units', import.meta.url)).filter(file => /^\d{3}\.json$/.test(file)).sort();
  assert.deepEqual(availableUnitIds, files.map(file => `unit-${file.slice(0, 3)}`), 'Run npm run course:refresh after authors finish another batch');
  assert.deepEqual(Object.keys(replayLoaders), availableUnitIds);
  assert.deepEqual(availableEntries.map(entry => entry.id), availableUnitIds);
  extensionEntries.forEach((entry, index) => assert.equal(entry.number, index + 27));
  assert.equal(baselineLessons.length, 26 + extensionEntries.length);
  for (const entry of availableEntries) {
    assert.doesNotMatch(entry.title, /<|>|unit-|A1|A2/);
    assert.ok(/[а-яё]/iu.test(entry.title));
    assert.equal(entry.stepCount, 7);
    assert.equal(entry.questionCount, 15);
  }
});

test('level and transition boundaries are explicit even before those batches arrive', () => {
  assert.deepEqual([27, 41, 42, 61, 62, 121].map(unitLevel), ['A1', 'A1', 'A2', 'A2', 'A2', 'A2']);
  assert.deepEqual([41, 42, 61, 62].map(unitBand), ['A1', 'A1 → A2 · Переход', 'A1 → A2 · Переход', 'A2']);
});

test('old saves load no extension chunks; compact new saves restore only saved lessons', async () => {
  let old = emptyProgress();
  for (const { lesson } of historicalLessons) old = finish(old, historicalLessons, lesson);
  const course = await prepareProgressCourse(JSON.stringify(old));
  old = { ...old, curriculumVersion: 3, pk01CoreAccess: true };
  assert.deepEqual(decodeProgress(JSON.stringify(old), course), { progress: old, recovered: false });
  assert.deepEqual(loadedReplayIds(), []);
  assert.deepEqual(loadedUnitIds(), []);
  if (!extensionEntries.length) return;
  const entry = extensionEntries[0];
  const compact = replayLesson(await replayLoaders[entry.id]());
  const isolated = [{ ...entry, lesson: compact }];
  const saved = finish(emptyProgress(), isolated, compact, true);
  const mixed = { ...old, completedLessons: [...old.completedLessons, ...saved.completedLessons], lessons: { ...old.lessons, ...saved.lessons }, lastVisited: { lessonId: entry.id, stepId: 'summary' } };
  const restoredCourse = await prepareProgressCourse(JSON.stringify(mixed));
  assert.deepEqual(loadedReplayIds(), [entry.id]);
  assert.deepEqual(loadedUnitIds(), []);
  assert.deepEqual(decodeProgress(JSON.stringify(mixed), restoredCourse), { progress: mixed, recovered: false });
  const values = new Map([[PROGRESS_KEY, JSON.stringify(mixed)], ['gps.theme.v1', 'dark']]);
  const writes = [];
  const session = openProgressSession({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } }, restoredCourse);
  assert.equal(session.persist(session.progress), 'unchanged');
  assert.deepEqual(writes, []);
  assert.equal(values.get('gps.theme.v1'), 'dark');
  const denied = openProgressSession({ getItem: () => { throw Error('denied'); }, setItem: () => assert.fail('blind write') }, restoredCourse);
  assert.equal(denied.unavailable, true);
  assert.equal(denied.persist(mixed), 'unavailable');
  // Corrupt flags and injected future completion never earn new access.
  const forged = structuredClone(mixed);
  forged.lessons[entry.id].answers[compact.steps[2].questions[0].id].attempts = [{ answer: 'invalid', correct: true }];
  const recovered = decodeProgress(JSON.stringify(forged), restoredCourse);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.progress.completedLessons.includes(entry.id), false);
});

for (const id of availableUnitIds) test(`${id}: authored feedback, stable IDs, 5/5/5, indicator instructions, replay equivalence and retry`, async () => {
  const unit = await unitLoaders[id]();
  const raw = JSON.stringify(unit);
  const lesson = await loadLesson(id);
  assert.equal(await loadLesson(id), lesson);
  assert.equal(JSON.stringify(unit), raw, 'Adapter must not mutate author data');
  assert.equal(lesson.id, id);
  assert.equal(lesson.level, unitLevel(unit.number));
  assert.equal(lesson.band, unitBand(unit.number));
  assert.deepEqual(lesson.steps.map(step => step.id), ['intro', 'theory', 'choice', 'blank', 'written', 'review', 'summary']);
  assert.deepEqual(lesson.steps.filter(step => step.type === 'exercise').map(step => step.questions.length), [5, 5, 5]);
  assert.equal(lesson.steps[5].description, unit.review);
  assert.equal(lesson.steps[6].description, unit.summary);
  const entry = availableEntries.find(entry => entry.id === id);
  const course = [{ ...entry, lesson }];
  assert.equal(validateTaskIndicators(course, {}), 15);
  for (const type of ['choice', 'blank', 'written']) unit[type].forEach((tuple, index) => {
    const q = lesson.steps[type === 'choice' ? 2 : type === 'blank' ? 3 : 4].questions[index];
    assert.equal(q.id, `${id}-${tuple[0]}`);
    assert.equal(q.instruction, tuple[1]);
    assert.equal(q.prompt, tuple[2]);
    assert.equal(q.explanation, tuple.at(-1));
    assert.equal(taskPresentation(q.task).label, tuple[1]);
    assert.equal(q.promptLanguage, /[а-яё]/iu.test(tuple[2]) ? 'ru' : 'en');
    for (const accepted of q.acceptedAnswers) assert.equal(gradeAnswer(q, accepted), true);
  });
  let progress = emptyProgress();
  assert.equal(updateProgress(progress, course, { type: 'complete', lessonId: id, stepId: 'theory' }), progress);
  progress = finish(progress, course, lesson, true);
  assert.deepEqual(progress.completedLessons, [id]);
  assert.deepEqual(getScore(progress, lesson), { total: 15, correct: 15, firstTry: 12, attempts: 18 });
  const replay = replayLesson(await replayLoaders[id]());
  assert.deepEqual(decodeProgress(JSON.stringify(progress), [{ ...entry, lesson: replay }]), { progress, recovered: false });
  assert.deepEqual(decodeProgress(JSON.stringify(progress), course), { progress, recovered: false });
  assert.equal(isStepUnlocked(progress, lesson, 'summary'), true);
  const duplicate = structuredClone(unit);
  duplicate.written[0][0] = duplicate.choice[0][0];
  assert.throws(() => adaptUnit(duplicate), /duplicate localSlug/);
});

test('entire current continuous catalog completes in order with exact attempts and survives replay', async () => {
  let progress = emptyProgress();
  for (const entry of lessons) {
    const lesson = await loadLesson(entry.id);
    const course = getProgressCourse();
    assert.equal(isLessonUnlocked(progress, course, entry.id), true);
    const next = course.slice(course.findIndex(item => item.id === entry.id) + 1).find(item => (item.level === 'Pre-A1') === (entry.level === 'Pre-A1'));
    if (next) assert.equal(isLessonUnlocked(progress, course, next.id), false);
    progress = finish(progress, course, lesson);
    if (next) assert.equal(isLessonUnlocked(progress, course, next.id), true);
  }
  assert.deepEqual(progress.completedLessons, lessons.map(entry => entry.id));
  const reloaded = await prepareProgressCourse(JSON.stringify(progress));
  assert.deepEqual(decodeProgress(JSON.stringify(progress), reloaded), { progress, recovered: false });
  assert.equal(Object.values(progress.lessons).flatMap(saved => Object.values(saved.answers)).reduce((n, saved) => n + saved.attempts.length, 0), questionCount);
  await assert.rejects(loadLesson('unit-999'), /Unknown lesson/);
});
