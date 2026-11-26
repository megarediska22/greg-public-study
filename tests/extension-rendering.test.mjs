import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { availableUnitIds, loadLesson } from '../src/content/extension/registry.ts';
import { emptyProgress } from '../src/lib/progress.ts';
let server, ExerciseQuestion, LessonContent, CoursePage, HomePage, ProgressContext;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ ExerciseQuestion } = await server.ssrLoadModule('/src/components/exercises/ExerciseQuestion.tsx'));
  ({ LessonContent } = await server.ssrLoadModule('/src/components/lessons/LessonContent.tsx'));
  ({ CoursePage } = await server.ssrLoadModule('/src/pages/CoursePage.tsx'));
  ({ HomePage } = await server.ssrLoadModule('/src/pages/HomePage.tsx'));
  ({ ProgressContext } = await server.ssrLoadModule('/src/lib/ProgressContext.tsx'));
});
after(async () => { await server?.close(); });
const render = element => renderToStaticMarkup(createElement(ProgressContext, { value: { progress: emptyProgress(), dispatch() {}, reset() {} } }, element));

test('new exercise indicators render the actual written task before the stimulus, with language labels', async () => {
  for (const id of availableUnitIds) {
    const lesson = await loadLesson(id);
    for (const step of lesson.steps) if (step.type === 'exercise') for (const question of step.questions) {
      const html = render(createElement(ExerciseQuestion, { question, index: 0, value: '', saved: undefined, missing: false, onChange() {} }));
      assert.ok(html.indexOf('class="task-indicator"') < html.indexOf('class="exercise-prompt"'), question.id);
      assert.match(html, new RegExp(`data-task-question="${question.id}"`));
      assert.match(html, new RegExp(`class="exercise-prompt" lang="${question.promptLanguage ?? 'en'}"`));
      assert.doesNotMatch(html, /answer-feedback/);
      if (question.type === 'choice') assert.match(html, new RegExp(`<span lang="${question.optionsLanguage ?? 'en'}">`));
    }
    const theory = render(createElement(LessonContent, { lesson, step: lesson.steps[1] }));
    assert.match(theory, /<th scope="col">Перевод<\/th>/);
    const review = render(createElement(LessonContent, { lesson, step: lesson.steps[5] }));
    assert.ok(review.includes(lesson.steps[5].description.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;')));
  }
});

test('A2 is discoverable while old A1 catalog links remain available', () => {
  const home = render(createElement(HomePage));
  assert.match(home, /href="#\/course\/a2"/);
  assert.match(home, /href="#\/course\/a1"/);
  assert.match(home, /По порядку после A1/);
  const catalog = render(createElement(CoursePage));
  assert.match(catalog, /A1 → A2/);
  assert.match(catalog, /href="#\/lesson\/bp-a1-01\/intro"/);
  const a2 = render(createElement(CoursePage, { level: 'A2' }));
  assert.doesNotMatch(a2, /href="#\/lesson\/bp-a1-01\/intro"/);
});
