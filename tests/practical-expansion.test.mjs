import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lessons, foundationLessons, practicalLessons, questionCount } from '../src/content/course.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { emptyProgress, updateProgress, decodeProgress, isLessonUnlocked, isStepUnlocked, getScore, PROGRESS_KEY } from '../src/lib/progress.ts';
import { getQuestionState } from '../src/lib/exercise.ts';
import { openProgressSession } from '../src/lib/progressStorage.ts';
import { createQaProgress, restoreQaProgress, restartQaLesson, QA_PROGRESS_KEY, loadQaProgress, saveQaProgress } from '../src/dev/qaState.ts';

const ids=['greetings-reactions','everyday-combinations','help-and-cafe','simple-arrangements','small-talk-basics'];
// Reviewed independent term/canonical-context oracle, not factory-derived answers.
const oracle=[
 ["Hi!","How's it going?","What's up?","Good to see you.",'Long time no see.','Really?','No way!',"That's awesome!",'Take care.','Have a good one.'],
 ['make a mistake','take a break','get ready','take a look','take notes','pay attention','take a test','pass a test','have fun','do your best'],
 ['Excuse me.','Can you help me, please?','Can I have the menu, please?',"I'd like a coffee, please.",'Can you pass me the salt, please?','Can you say that again, please?',"I don't understand.",'What do you mean?','No problem.','Thank you anyway.'],
 ['Are you free?',"Let's get coffee.",'What time works for you?','At three?','That works for me.','Sounds good.',"I'm on my way.","I'm heading home.",'See you later.','See you tomorrow.'],
 ['Nice weather today.','Is this seat free?','What do you do?','What do you like to do?',"That's interesting.",'Me too.','Tell me more.','How about you?','It was nice talking to you.','I need to go now.'],
];
const contexts=[
 ['Hi!','How is it going?','What is up?','Good to see you.','Long time no see.','Really?','No way!','That is awesome!','Take care.','Have a good one.'],
 ['I can make a mistake.','We can take a break.','I get ready at home.','Can you take a look?','Natasha takes notes.','We pay attention in class.','We take a test at school.','She can pass the test.','We have fun at home.','I do my best.'],
 ['Excuse me.','Can you help me, please?','Can I have the menu, please?','I would like a coffee, please.','Can you pass me the salt, please?','Can you say that again, please?','I do not understand.','What do you mean?','No problem.','Thank you anyway.'],
 ['Are you free?',"Let's get coffee.",'What time works for you?','At three?','That works for me.','Sounds good.','I am on my way.','I am heading home.','See you later.','See you tomorrow.'],
 ['Nice weather today.','Is this seat free?','What do you do?','What do you like to do?','That is interesting.','Me too.','Tell me more.','How about you?','It was nice talking to you.','I need to go now.'],
];

test('21-lesson registry appends five complete A1 lessons / 35 steps / 150 questions',()=>{
 assert.deepEqual(lessons.slice(0,16),foundationLessons);
 assert.deepEqual(lessons.slice(16).map(e=>e.id),ids);
 assert.equal(lessons.length,21);assert.equal(questionCount,480);
 assert.equal(lessons.flatMap(e=>e.lesson.steps).length,147);
 assert.equal(new Set(lessons.flatMap(e=>e.lesson.steps.flatMap(s=>s.type==='exercise'?s.questions.map(q=>q.id):[]))).size,480);
 assert.doesNotThrow(()=>validateCourse(lessons));
 for(const {lesson:l} of practicalLessons){
  assert.equal(l.kind,'vocabulary');assert.equal(l.level,'A1');assert.equal(l.sample,false);
  assert.deepEqual(l.steps.map(s=>s.type),['intro','vocabulary','exercise','exercise','exercise','review','summary']);
  assert.deepEqual(l.steps.slice(2,5).map(s=>s.questions.length),[10,10,10]);
  assert.match(l.steps[0].example,/Gregory|Natasha/);assert.match(l.steps[0].translation,/Григорий|Наташа/);
 }
});

test('all previous content is exact except one explicit non-gating demonstratives block',()=>{
 const previous=structuredClone(foundationLessons);
 const theory=previous.find(e=>e.id==='demonstratives').lesson.steps[1];
 const extra=theory.blocks.filter(b=>b.title==='Произнесите и покажите');
 assert.equal(extra.length,1);assert.match(extra[0].text,/ðɪs/);assert.match(extra[0].text,/ðiːz/);assert.match(extra[0].text,/относительно ситуации/);
 theory.blocks=theory.blocks.filter(b=>b.title!=='Произнесите и покажите');
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),'a157e7c70b1bf236932dc88b4f80cc00840154827737099846a02a436c3e2a9e');
});

for(const [u,terms] of oracle.entries())for(const [i,term] of terms.entries())test(`practical answer audit: ${ids[u]}/${term}`,()=>{
 const l=practicalLessons[u].lesson;const word=l.steps[1].items[i];const choice=l.steps[2].questions[i];const recall=l.steps[3].questions[i];const use=l.steps[4].questions[i];
 assert.equal(word.term,term);assert.ok(word.meaningRu&&word.exampleTranslation&&word.usage);
 assert.equal(choice.acceptedAnswers[0],word.meaningRu);assert.match(choice.instruction,/в этом примере/);
 assert.equal(recall.acceptedAnswers[0],term);assert.equal(use.acceptedAnswers[0],contexts[u][i]);
 for(const q of [choice,recall,use]){
  assert.equal(q.vocabularyId,word.id);
  for(const answer of q.acceptedAnswers){assert.equal(gradeAnswer(q,answer),true);if(q.type!=='choice')assert.equal(gradeAnswer(q,`  ${answer.toUpperCase().replaceAll("'",'’').replaceAll(' ','   ').replace(/[.!?]+$/,'')}  `),true);}
  assert.equal(gradeAnswer(q,''),false);assert.equal(gradeAnswer(q,q.type==='choice'?q.options.find(v=>!q.acceptedAnswers.includes(v)):'incorrect'),false);
 }
 assert.equal(recall.prompt.includes(term),false);assert.equal(use.prompt.includes(contexts[u][i]),false);
});

test('real equivalents, numeral spelling and internal comma variants are explicitly accepted',()=>{
 const q=id=>practicalLessons.flatMap(e=>e.lesson.steps.flatMap(s=>s.type==='exercise'?s.questions:[])).find(q=>q.id===id);
 for(const [id,answers]of [
 ['help-and-cafe-recall-coffee-please',["I'd like a coffee please.",'I would like a coffee, please.']],
 ['help-and-cafe-use-say-again',['Can you say that again please?']],
 ['simple-arrangements-use-at-three',['At 3?','At three']],
 ['simple-arrangements-recall-on-way',['I am on my way',"I'm on my way."]],
 ['help-and-cafe-use-thanks-anyway',['Thanks anyway.']],
 ])for(const a of answers)assert.equal(gradeAnswer(q(id),a),true);
 assert.equal(gradeAnswer(q('everyday-combinations-use-take-test'),'We pass a test at school.'),false);
 assert.equal(gradeAnswer(q('simple-arrangements-use-what-time'),'What time work for you?'),false);
 assert.equal(gradeAnswer(q('help-and-cafe-use-coffee-please'),'I like a coffee, please.'),false);
});

function finish(p,course,l,summary=true){for(const s of l.steps){if(!summary&&s.type==='summary')break;const base={lessonId:l.id,stepId:s.id};p=updateProgress(p,course,s.type==='exercise'?{...base,type:'check-exercise',answers:Object.fromEntries(s.questions.map(q=>[q.id,q.acceptedAnswers[0]]))}:{...base,type:'complete'});}return p;}
function storage(raw){const values=new Map([[PROGRESS_KEY,raw],['gps.theme.v1','dark']]);const writes=[];return{values,writes,getItem:k=>values.get(k)??null,setItem:(k,v)=>{writes.push(k);values.set(k,v);}};}

test('every 16-lesson completion frontier and partial retries round-trip without new migration or relocking',()=>{
 let prefix=emptyProgress();
 for(let n=0;n<=16;n++){
  let old=prefix;
  if(n<16){const l=foundationLessons[n].lesson;for(const stepId of [l.steps[0].id,l.steps[1].id])old=updateProgress(old,foundationLessons,{type:'complete',lessonId:l.id,stepId});const s=l.steps[2];old=updateProgress(old,foundationLessons,{type:'check-exercise',lessonId:l.id,stepId:s.id,answers:Object.fromEntries(s.questions.map((q,i)=>[q.id,i?q.acceptedAnswers[0]:q.options.find(v=>!q.acceptedAnswers.includes(v))]))});old=updateProgress(old,foundationLessons,{type:'retry',lessonId:l.id,stepId:s.id,questionId:s.questions[0].id});old=updateProgress(old,foundationLessons,{type:'visit',lessonId:l.id,stepId:s.id});}
  const raw=JSON.stringify(old,null,2),port=storage(raw),session=openProgressSession(port,lessons);
  assert.deepEqual(session.progress,old);assert.equal(session.recovered,false);assert.equal(session.persist(session.progress),'unchanged');assert.deepEqual(port.writes,[]);assert.equal(port.values.get(PROGRESS_KEY),raw);
  for(const e of foundationLessons)assert.equal(isLessonUnlocked(session.progress,lessons,e.id),isLessonUnlocked(old,foundationLessons,e.id));
  assert.equal(isLessonUnlocked(session.progress,lessons,ids[0]),n===16);
  if(n<16)prefix=finish(prefix,foundationLessons,foundationLessons[n].lesson);
 }
});

test('legacy grammar entitlement records remain identical on 16→21 expansion',()=>{
 const grammar=foundationLessons.filter(e=>e.lesson.kind!=='vocabulary');let p=emptyProgress();for(const e of grammar)p=finish(p,grammar,e.lesson);delete p.curriculumVersion;
 const old=decodeProgress(JSON.stringify(p),foundationLessons).progress;
 assert.deepEqual(decodeProgress(JSON.stringify(old),lessons),{progress:old,recovered:false});
 for(const e of grammar)assert.equal(isLessonUnlocked(old,lessons,e.id),true);
 assert.equal(isLessonUnlocked(old,lessons,ids[0]),false);
});

test('all 21 lessons complete sequentially; new batches preserve missing-input semantics, locks, retries and refresh',()=>{
 let p=emptyProgress();
 for(const [index,{lesson:l}]of lessons.entries()){
  assert.equal(isLessonUnlocked(p,lessons,l.id),true);if(index<20)assert.equal(isLessonUnlocked(p,lessons,lessons[index+1].id),false);
  if(index<16)p=finish(p,lessons,l);
  else for(const s of l.steps){const base={lessonId:l.id,stepId:s.id};if(s.type==='exercise'){
   const inputs=Object.fromEntries(s.questions.map(q=>[q.id,q.acceptedAnswers[0]]));const first=s.questions[0];
   assert.equal(updateProgress(p,lessons,{...base,type:'check-exercise',answers:{[first.id]:inputs[first.id]}}),p);
   inputs[first.id]=first.type==='choice'?first.options.find(o=>!first.acceptedAnswers.includes(o)):'incorrect';
   p=updateProgress(p,lessons,{...base,type:'check-exercise',answers:inputs});assert.equal(getScore(p,l,s).correct,9);assert.equal(p.lessons[l.id].completedSteps.includes(s.id),false);
   p=decodeProgress(JSON.stringify(p),lessons).progress;const locked=p.lessons[l.id].answers[s.questions[1].id];assert.equal(getQuestionState(locked,'changed').locked,true);
   p=updateProgress(p,lessons,{...base,type:'check-exercise',answers:{[first.id]:first.acceptedAnswers.at(-1)}});assert.equal(p.lessons[l.id].answers[s.questions[1].id],locked);assert.equal(p.lessons[l.id].answers[first.id].attempts.length,2);assert.equal(getScore(p,l,s).correct,10);
  }else{if(s.type==='summary'&&index<20)assert.equal(isLessonUnlocked(p,lessons,lessons[index+1].id),false);p=updateProgress(p,lessons,{...base,type:'complete'});}assert.deepEqual(decodeProgress(JSON.stringify(p),lessons),{progress:p,recovered:false});}
 }
 assert.deepEqual(p.completedLessons,lessons.map(e=>e.id));assert.equal(Object.values(p.lessons).reduce((n,v)=>n+v.completedSteps.length,0),147);
});

test('QA opens all new steps, stores only QA answers, and can restart any practical unit',()=>{
 const port=storage('normal sentinel');let qa=loadQaProgress(port,lessons);
 for(const {lesson:l}of practicalLessons){assert.equal(isLessonUnlocked(qa,lessons,l.id),true);for(const s of l.steps)assert.equal(isStepUnlocked(qa,l,s.id),true);assert.equal(getScore(qa,l).attempts,0);qa=finish(qa,lessons,l);}
 assert.equal(saveQaProgress(port,qa),true);assert.deepEqual(restoreQaProgress(JSON.stringify(qa),lessons),qa);assert.deepEqual(port.writes,[QA_PROGRESS_KEY]);assert.equal(port.values.get(PROGRESS_KEY),'normal sentinel');assert.equal(port.values.get('gps.theme.v1'),'dark');
 for(const {lesson:l}of practicalLessons){const reset=restartQaLesson(qa,lessons,l.id);assert.equal(getScore(reset,l).attempts,0);assert.equal(reset.completedLessons.length,21);}
});

test('Russian course counts remain natural after reaching 21 lessons',async()=>{
 const {formatLessonCount}=await import('../src/lib/format.ts');
 assert.equal(formatLessonCount(16),'16 уроков');assert.equal(formatLessonCount(21),'21 урок');assert.equal(formatLessonCount(22),'22 урока');
});
