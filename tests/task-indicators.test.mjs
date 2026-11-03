import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { lessons } from '../src/content/course.ts';
import { questionTasks } from '../src/content/questionTasks.ts';
import { taskPresentation, validateTaskIndicators } from '../src/lib/taskIndicators.ts';

let server, ExerciseQuestion;
before(async () => {
  // Middleware-only SSR loader: no listening port, no existing QA server changes.
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ ExerciseQuestion } = await server.ssrLoadModule('/src/components/exercises/ExerciseQuestion.tsx'));
});
after(async () => { await server?.close(); });
const questions = lessons.flatMap(({lesson})=>lesson.steps.flatMap(s=>s.type==='exercise'?s.questions:[]));
const byId = Object.fromEntries(questions.map(q=>[q.id,q]));
const view = id => taskPresentation(questionTasks[id]);
const render = (id, saved) => renderToStaticMarkup(createElement(ExerciseQuestion, {
  question: byId[id], index: 0, value: '', saved, missing: false, onChange() {},
}));

test('all 480 questions have one authored compatible task, with no orphan metadata', () => {
  assert.equal(validateTaskIndicators(lessons,questionTasks),480);
  assert.deepEqual(Object.keys(questionTasks).sort(),questions.map(q=>q.id).sort());
});
test('To Be exercise 2: every blank prominently requests a negative before the answer', () => {
  const step=lessons[0].lesson.steps.find(s=>s.id==='blank');
  for(const q of step.questions){
    assert.equal(view(q.id).label,'Отрицание');
    assert.equal(view(q.id).icon,'✖️');
    assert.match(view(q.id).detail,/Вставь слова/);
    const html=render(q.id);
    assert.ok(html.indexOf('Отрицание')<html.indexOf('class="answer-input"'));
    assert.match(html, /class="task-title"/);
    assert.doesNotMatch(html,/answer-feedback/);
  }
});
test('affirmative construction and mixed To Be transformations have independent forms', () => {
  assert.equal(view('pc-run-now').label,'Утверждение');
  assert.equal(view('pc-run-now').icon,'✔️');
  assert.equal(view('ready-question').label,'Вопрос');
  assert.equal(view('ready-question').icon,'❔');
  assert.deepEqual(lessons[0].lesson.steps[4].questions.map(q=>view(q.id).label),['Вопрос','Отрицание','Отрицание','Вопрос','Короткий ответ: да']);
});
test('translation and word recall have different visible primary actions', () => {
  assert.equal(view('people-feelings-recognize-student').label,'Выбери перевод');
  assert.equal(view('people-feelings-recall-student').label,'Вспомни и напиши');
  assert.equal(questionTasks['people-feelings-use-student'].action,'translate');
  assert.match(view('people-feelings-use-student').detail,/Переведи/);
  assert.match(render('people-feelings-recall-student'),/Вспомни и напиши/);
});
test('conversational tasks follow intent, not English word or punctuation heuristics', () => {
  assert.equal(view('greetings-reactions-use-hi').label,'Поздоровайся');
  assert.equal(view('greetings-reactions-use-no-way').label,'Отреагируй');
  assert.equal(view('greetings-reactions-use-good-see').label,'Поздоровайся');
  assert.equal(view('help-and-cafe-use-no-problem').label,'Согласись');
  assert.equal(questionTasks['help-and-cafe-use-help-please'].form,'question');
  assert.match(view('help-and-cafe-use-help-please').detail,/Вежливо попроси/);
  assert.equal(view('everyday-combinations-recall-make-mistake').label,'Вспомни и напиши');
});
test('article correction and plural tasks are not mislabeled as sentence construction', () => {
  assert.equal(view('art-fix-apple').label,'Исправь ошибку');
  assert.equal(view('art-add-book').label,'Добавь артикль');
  assert.equal(view('dem-books-plural').label,'Множественное число');
});
test('missing, invalid, incompatible or conflicting intent is rejected', () => {
  let metadata={...questionTasks};delete metadata['negative-blank'];
  assert.throws(()=>validateTaskIndicators(lessons,metadata),/Missing.*negative-blank/);
  for(const task of [{action:'unknown'},{action:'choose'},{action:'fill',form:'ambiguous'}])
    assert.throws(()=>validateTaskIndicators(lessons,{...questionTasks,'negative-blank':task}),/indicator|form/);
  assert.throws(()=>validateTaskIndicators(lessons,{...questionTasks,'ready-question':{action:'build',form:'negative'}}),/Conflicting/);
});
test('every controlled question renders its indicator before submission and before the prompt', () => {
  for(const q of questions){
    const html=render(q.id);
    assert.equal((html.match(/data-task-question=/g)||[]).length,1,q.id);
    assert.ok(html.indexOf('class="task-indicator"')<html.indexOf('class="exercise-prompt"'),q.id);
    assert.doesNotMatch(html,/answer-feedback|type="submit"/,q.id);
    assert.match(html,/aria-describedby="[^"]*-task/);
  }
});
test('task does not change when saved feedback locks a question', () => {
  const saved={attempts:[{answer:'am not',correct:true}],retrying:false};
  const html=render('negative-blank',saved);
  assert.match(html,/Отрицание/);assert.match(html,/disabled/);assert.match(html,/✓ Верно/);
});

test('all 21 lessons, 147 steps and 480 question definitions retain their exact baseline', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(lessons)).digest('hex'),'4dc7261c6d9b843b37d41e9cb1b70694bee708f2c7feb01a21c11d92f72778b4');
  assert.equal(lessons.length,21);assert.equal(lessons.flatMap(e=>e.lesson.steps).length,147);
});
