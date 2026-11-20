import assert from 'node:assert/strict';
import test from 'node:test';
import { grammarLessons, lessons } from '../src/content/historicalCourse.ts';
import { decodeProgress, emptyProgress, isLessonUnlocked, updateProgress } from '../src/lib/progress.ts';

const publishedCourse = lessons.slice(0, 21);
const extensionId = 'migration-test-extension';
const extensionEntry = {
  ...grammarLessons[0],
  id: extensionId,
  lesson: {
    ...grammarLessons[0].lesson,
    id: extensionId,
    kind: 'grammar',
    steps: grammarLessons[0].lesson.steps.map(step => step.type === 'exercise'
      ? { ...step, questions: step.questions.map(question => ({ ...question, id: `${extensionId}-${question.id}` })) }
      : step),
  },
};
const extendedCourse = [...publishedCourse, extensionEntry];

function finish(progress, course, lesson) {
  for (const step of lesson.steps) {
    const target = { lessonId: lesson.id, stepId: step.id };
    const action = step.type === 'exercise'
      ? { type: 'check-exercise', answers: Object.fromEntries(step.questions.map(q => [q.id, q.acceptedAnswers[0]])) }
      : { type: 'complete' };
    progress = updateProgress(progress, course, { ...target, ...action });
  }
  return progress;
}

test('a pre-vocabulary graduate retains the original ten lessons and cannot skip to appended grammar', () => {
  const original = grammarLessons.reduce((progress, entry) => finish(progress, grammarLessons, entry.lesson), emptyProgress());
  delete original.curriculumVersion;
  const raw = JSON.stringify(original);

  const result = decodeProgress(raw, extendedCourse);
  assert.equal(result.recovered, true);
  assert.deepEqual(result.progress, decodeProgress(raw, publishedCourse).progress);
  assert.deepEqual(result.progress.legacyUnlockedLessons, grammarLessons.map(entry => entry.id));
  assert.equal(isLessonUnlocked(result.progress, extendedCourse, 'was-were'), true);
  assert.equal(isLessonUnlocked(result.progress, extendedCourse, extensionId), false);

  const cached = { ...result.progress, legacyUnlockedLessons: [...result.progress.legacyUnlockedLessons, extensionId] };
  assert.equal(isLessonUnlocked(cached, extendedCourse, extensionId), false);
  assert.deepEqual(decodeProgress(JSON.stringify(cached), extendedCourse), result);
  assert.deepEqual(decodeProgress(JSON.stringify(result.progress), extendedCourse), { ...result, recovered: false });
});

test('appended grammar opens normally for learners who completed the published sequence', () => {
  const progress = publishedCourse.reduce((state, entry) => finish(state, publishedCourse, entry.lesson), emptyProgress());
  const result = decodeProgress(JSON.stringify(progress), extendedCourse);

  assert.deepEqual(result, { progress, recovered: false });
  assert.equal(isLessonUnlocked(result.progress, extendedCourse, extensionId), true);
});
