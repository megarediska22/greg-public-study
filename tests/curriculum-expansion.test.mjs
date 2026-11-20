import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { lessons, historicalLessons, questionCount } from '../src/content/course.ts';
import { availableEntries } from '../src/content/extension/generated/catalog.ts';
import { loadAuthoredCourse } from './fixtures/extensionCourse.mjs';
import { gradeAnswer } from '../src/lib/grading.ts';
import { normalizeAnswer } from '../src/lib/grading.ts';
import { openCourseSession } from '../src/lib/courseSession.ts';
import { emptyProgress, updateProgress, isLessonUnlocked, getScore, PROGRESS_KEY } from '../src/lib/progress.ts';
import { applyStep, correctAnswers, legacyFixtures } from '../scripts/curriculum-pilot-fixtures.mjs';

const expected = Array.from({length:95}, (_, i) => `unit-${String(i+27).padStart(3,'0')}`);
const hash = text => createHash('sha256').update(text).digest('hex');
const plan = fs.readFileSync('research/curriculum/curriculum-100.md','utf8');
const titles = new Map([...plan.matchAll(/^\| <a id="unit-(\d+)"><\/a>([^|]+)\|/gm)].map(([,n,cell]) => [+n,cell.trim().split(' · ').slice(1).filter(s=>/[а-яё]/iu.test(s)).join(' · ')]));

test('FINAL exact production registry: 121 lessons / 847 steps / 1980 questions', async () => {
  assert.deepEqual(availableEntries.map(e=>e.id), expected);
  assert.deepEqual(lessons.slice(26).map(e=>e.id), expected);
  const course = await loadAuthoredCourse();
  assert.equal(course.length,121);
  assert.equal(course.reduce((n,e)=>n+e.lesson.steps.length,0),847);
  assert.equal(questionCount,1980);
  assert.equal(course.flatMap(e=>e.lesson.steps.flatMap(s=>s.questions??[])).length,1980);
});

test('FINAL 95 independent accepted review receipts match exact content hashes', () => {
  const directory='research/curriculum/qa/extension';
  const receipts=fs.readdirSync(directory).filter(f=>/^review-\d{3}-\d{3}\.json$/.test(f)).flatMap(f=>JSON.parse(fs.readFileSync(`${directory}/${f}`,'utf8')));
  assert.deepEqual(receipts.map(r=>r.number).sort((a,b)=>a-b),Array.from({length:95},(_,i)=>i+27));
  for(const r of receipts){
    assert.equal(r.decision,'accept'); assert.equal(r.reviewedQuestions,15);
    assert.ok(typeof r.evidence==='string' && r.evidence.trim()); assert.ok(Array.isArray(r.correctedIds));
    assert.equal(r.sha256,hash(fs.readFileSync(`src/content/extension/units/${String(r.number).padStart(3,'0')}.json`)));
  }
});

test('extension questions are distinct from earlier lessons and from linked questions about the same source', async () => {
  const firstLessonForSource = new Map();
  const originalTask = new Map();
  const normalize = value => normalizeAnswer(value, { ignoreTerminalPunctuation: true });
  for (const { id, lesson } of await loadAuthoredCourse()) {
    for (const question of lesson.steps.flatMap(step => step.questions ?? [])) {
      const source = normalize(question.prompt);
      const task = JSON.stringify([normalize(question.instruction), source]);
      if (id.startsWith('unit-')) {
        assert.ok(!originalTask.has(task), `${question.id} repeats ${originalTask.get(task)}`);
        // Linked comprehension questions can ask different things about the same text.
        const priorLesson = firstLessonForSource.get(source);
        assert.ok(priorLesson === undefined || priorLesson === id, `${question.id} reuses a text from ${priorLesson}`);
      }
      firstLessonForSource.set(source, id);
      originalTask.set(task, question.id);
    }
  }
});

test('SUBSET historical prefix, plan identity, metadata, all keys and plausible nonkeys', async () => {
  assert.equal(hash(JSON.stringify(historicalLessons)),'2ecd1ba372f0f2c3a15082d38b23e346d00ce8c7d1a8739d1e5077219a71e6cd');
  assert.deepEqual(lessons.slice(0,26),historicalLessons);
  assert.deepEqual([...titles.keys()],Array.from({length:100},(_,i)=>i+22));
  const ids=new Set();
  for(const entry of (await loadAuthoredCourse()).slice(26)){
    assert.equal(entry.title,titles.get(entry.number));
    assert.equal(entry.lesson.title,entry.title);
    assert.equal(entry.level,entry.number<=41?'A1':'A2');
    assert.equal(entry.band,entry.number<=41?'A1':entry.number<=61?'A1 → A2 · Переход':'A2');
    const questions=entry.lesson.steps.flatMap(s=>s.questions??[]);
    assert.equal(questions.length,15);
    for(const q of questions){
      assert.ok(!ids.has(q.id),q.id); ids.add(q.id);
      for(const field of ['instruction','prompt','explanation']) assert.ok(q[field]?.trim(),`${q.id}/${field}`);
      for(const key of q.acceptedAnswers) assert.equal(gradeAnswer(q,key),true,q.id);
      const candidates=q.type==='choice'?q.options.filter(a=>!q.acceptedAnswers.includes(a)):
        ['is','are','was','were','do','does','did','can','cannot','the','a','at','in','on','yes','no','I am ready.','She is here.'].filter(a=>!q.acceptedAnswers.some(k=>normalizeAnswer(k,{ignoreTerminalPunctuation:q.type==='written'})===normalizeAnswer(a,{ignoreTerminalPunctuation:q.type==='written'})));
      assert.ok(candidates.length,q.id);
      for(const value of candidates) assert.equal(gradeAnswer(q,value),false,`${q.id}: ${value}`);
      assert.equal(gradeAnswer(q,''),false);
    }
  }
});

test('SUBSET real sequential replay, oldest partial, graduate, retries and preserved attempts', async () => {
  const course=(await loadAuthoredCourse()).filter(e=>lessons.some(x=>x.id===e.id));
  async function refresh(progress){
    const raw=JSON.stringify(progress); const writes=[];
    const session=await openCourseSession({getItem:k=>k===PROGRESS_KEY?raw:null,setItem:(...args)=>writes.push(args)});
    assert.deepEqual(session.progress,progress); assert.equal(session.persist(session.progress),'unchanged');assert.deepEqual(writes,[]);
  }
  const legacy=legacyFixtures(historicalLessons);
  await refresh(legacy.partial); await refresh(legacy.completed);
  let progress=emptyProgress();
  for(let i=0;i<course.length;i++){
    const {lesson}=course[i];assert.equal(isLessonUnlocked(progress,course,lesson.id),true);
    if(course[i+1])assert.equal(isLessonUnlocked(progress,course,course[i+1].id),false);
    for(const step of lesson.steps){
      if(i>=26 && step.type==='exercise'){
        const q=step.questions[0], answers=correctAnswers(step);
        const wrong=q.type==='choice'?q.options.find(a=>!q.acceptedAnswers.includes(a)):'I am certainly the wrong answer.';
        progress=updateProgress(progress,course,{type:'check-exercise',lessonId:lesson.id,stepId:step.id,answers:{...answers,[q.id]:wrong}});
        assert.equal(getScore(progress,lesson,step).correct,4);
      }
      progress=applyStep(progress,course,lesson,step);
    }
    if(i>=26)assert.equal(getScore(progress,lesson).attempts,18);
  }
  await refresh(progress);
  assert.deepEqual(progress.completedLessons,course.map(e=>e.id));
});

test('SUBSET rendered new instructions occur once; historical instructions and theory markup remain', async () => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
  try {
    const {ExerciseQuestion}=await server.ssrLoadModule('/src/components/exercises/ExerciseQuestion.tsx');
    const {LessonContent}=await server.ssrLoadModule('/src/components/lessons/LessonContent.tsx');
    const {ProgressContext}=await server.ssrLoadModule('/src/lib/ProgressContext.tsx');
    const render=element=>renderToStaticMarkup(createElement(ProgressContext,{value:{progress:emptyProgress(),dispatch(){},reset(){}}},element));
    for(const entry of await loadAuthoredCourse()){
      const extension=entry.id.startsWith('unit-');
      for(const step of entry.lesson.steps){
        if(step.type==='exercise')for(const question of step.questions){
          const html=render(createElement(ExerciseQuestion,{question,index:0,value:'',missing:false,onChange(){}}));
          if(extension){assert.doesNotMatch(html,/class="question-instruction"/);assert.ok(!html.includes(`${question.id}-instruction`));}
          else assert.match(html,/class="question-instruction"/);
        }
        if(step.type==='theory'){
          const html=render(createElement(LessonContent,{lesson:entry.lesson,step}));
          assert.equal((html.match(/scope="col"/g)??[]).length,3);
          if(extension){assert.equal(step.patternTable,true);assert.match(html,/>Пример<\/th><th scope="col">Перевод<\/th>/);}
          else assert.ok(!step.patternTable);
        }
      }
    }
  } finally {await server.close();}
});
