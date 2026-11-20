import test from 'node:test';
import assert from 'node:assert/strict';
import { defineLesson, mergeTaskCatalogs } from '../src/content/continuation/defineLesson.ts';
import { lessons } from '../src/content/historicalCourse.ts';
import { questionTasks } from '../src/content/questionTasks.ts';
import { validateCourse } from '../src/lib/validation.ts';

// Reuse an existing valid lesson strictly as a contract fixture, never new curriculum.
function fixture() {
  const source = structuredClone(lessons[0].lesson);
  const definition = { id: 'contract-unit', title: source.title, objectives: source.objectives };
  for (const step of source.steps) {
    const { id, type, completion, ...data } = step;
    const key = type === 'exercise' ? ['choice', 'blank', 'written'][source.steps.indexOf(step) - 2] : type;
    definition[key] = type === 'exercise' ? { ...data, questions: data.questions.map(q => {
      const { type, ...rest } = q;
      return { ...rest, task: questionTasks[q.id] };
    }) } : data;
  }
  return definition;
}

test('helper preserves authored payload, creates stable IDs and extracts explicit intent', () => {
  const definition = fixture(), before = structuredClone(definition);
  const { lesson, tasks } = defineLesson(definition);
  assert.deepEqual(definition, before);
  assert.deepEqual(lesson.steps.map(s => s.id), ['intro','theory','choice','blank','written','review','summary']);
  assert.equal(lesson.level, 'A1'); assert.equal(lesson.kind, 'grammar'); assert.equal(lesson.sample, false);
  assert.deepEqual(lesson.objectives, definition.objectives);
  for (const type of ['choice','blank','written']) {
    const output = lesson.steps.find(s => s.id === type).questions;
    assert.equal(output.length, 5);
    definition[type].questions.forEach(({ task, ...q }, i) => {
      const id = `${definition.id}-${q.id}`;
      assert.deepEqual(output[i], { ...q, id, type });
      assert.deepEqual(tasks[id], task);
    });
  }
  assert.equal(Object.keys(tasks).length, 15);
  assert.deepEqual(defineLesson(definition), { lesson, tasks });
  validateCourse([...lessons, { id: lesson.id, title: lesson.title, subtitle: 'Contract', objective: 'Contract', lesson }]);
});
test('neutral placeholders are defaults only; custom theory heading is optional and validated', () => {
  const d = fixture(); delete d.blank.questions[0].placeholder;
  d.theory.subjectHeading = 'Слово или выражение';
  const { lesson } = defineLesson(d);
  assert.equal(lesson.steps[3].questions[0].placeholder, 'Ваш ответ');
  assert.equal(lesson.steps[1].subjectHeading, d.theory.subjectHeading);
  assert.equal(defineLesson(fixture()).lesson.steps[1].subjectHeading, undefined);
  d.theory.subjectHeading = '  ';
  assert.throws(() => defineLesson(d), /subjectHeading/);
});
test('bad counts, IDs, duplicate IDs, incompatible actions and conflicting forms fail early', () => {
  const count = fixture(); count.choice.questions.pop();
  assert.throws(() => defineLesson(count), /exactly five/);
  const bad = fixture(); bad.choice.questions[0].id = 'Bad ID';
  assert.throws(() => defineLesson(bad), /invalid local/);
  const duplicate = fixture(); duplicate.blank.questions[0].id = duplicate.choice.questions[0].id;
  assert.throws(() => defineLesson(duplicate), /Duplicate task/);
  const action = fixture(); action.choice.questions[0].task = { action: 'fill' };
  assert.throws(() => defineLesson(action), /incompatible action/);
  const form = fixture(); form.written.questions[0].sentenceType = 'question'; form.written.questions[0].task = { action: 'build', form: 'negative' };
  assert.throws(() => defineLesson(form), /Conflicting task form/);
});
test('catalog merge retains historical metadata and rejects all collisions', () => {
  const { tasks } = defineLesson(fixture());
  // Keep the historical 480 + 15 baseline scoped to the published prefix.
  const publishedTasks = Object.fromEntries(lessons.slice(0, 21).flatMap(({ lesson }) =>
    lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions.map(q => [q.id, questionTasks[q.id]]) : [])));
  const merged = mergeTaskCatalogs(publishedTasks, tasks);
  assert.equal(Object.keys(merged).length, 495);
  for (const id of Object.keys(publishedTasks)) assert.deepEqual(merged[id], questionTasks[id]);
  assert.equal(Object.keys(mergeTaskCatalogs(questionTasks, tasks)).length, 570);
  assert.throws(() => mergeTaskCatalogs(tasks, tasks), /Duplicate task intent/);
});
