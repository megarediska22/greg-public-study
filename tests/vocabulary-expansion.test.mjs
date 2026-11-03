import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, grammarLessons, questionCount } from '../src/content/course.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { emptyProgress, updateProgress, decodeProgress, isLessonUnlocked, isStepUnlocked, getScore, PROGRESS_KEY } from '../src/lib/progress.ts';
import { openProgressSession, PROGRESS_BACKUP_PREFIX } from '../src/lib/progressStorage.ts';
import { createQaProgress, restoreQaProgress, restartQaLesson, loadQaProgress, saveQaProgress, QA_PROGRESS_KEY } from '../src/dev/qaState.ts';
import { getQuestionState } from '../src/lib/exercise.ts';

const vocabulary = lessons.filter(e => e.lesson.kind === 'vocabulary');
const order = ['to-be','people-feelings','present-simple','do-does','daily-routines','have-has','articles','family-objects','demonstratives','there-is-are','home-places','can-cant','hobbies-abilities','present-continuous','actions-time','was-were'];
// Independent reviewed oracle. It does not read accepted strings from the factory.
const audit = [
 ['people-feelings', [
 ['student','студент / студентка','I am a student.'], ['teacher','учитель / учительница','Gregory is a teacher.'], ['friend','друг / подруга','Natasha is my friend.'], ['happy','счастливый / довольный','I am happy.'], ['sad','грустный','She is sad.'], ['tired','уставший','We are tired.'], ['hungry','голодный','I am hungry.'], ['thirsty','испытывающий жажду','He is thirsty.'], ['busy','занятый','Natasha is busy.'], ['ready','готовый','They are ready.']]],
 ['daily-routines', [
 ['wake up','просыпаться','I wake up.'], ['get up','вставать с постели','We get up.'], ['have breakfast','завтракать','I have breakfast.'], ['go to school','ходить в школу','They go to school.'], ['go to work','ходить на работу','I go to work.'], ['study','учиться / изучать','Natasha studies English.'], ['work','работать','Gregory works at home.'], ['eat lunch','есть обед','We eat lunch.'], ['come home','приходить домой','I come home.'], ['go to bed','ложиться спать','They go to bed.']]],
 ['family-objects', [
 ['mother','мать','She is my mother.'], ['father','отец','He is my father.'], ['sister','сестра','Natasha has a sister.'], ['brother','брат','Gregory has a brother.'], ['family','семья','I have a family.'], ['book','книга','I have a book.'], ['bag','сумка','She has a bag.'], ['phone','телефон','I have a phone.'], ['key','ключ','The key is here.'], ['cup','чашка','The cup is red.']]],
 ['home-places', [
 ['kitchen','кухня','Natasha is in the kitchen.'], ['bedroom','спальня','This is a bedroom.'], ['bathroom','ванная комната','The bathroom is here.'], ['living room','гостиная','We are in the living room.'], ['table','стол','There is a table in the room.'], ['chair','стул','There is a chair here.'], ['bed','кровать','The bed is in the room.'], ['door','дверь','This is a door.'], ['park','парк','Gregory is in the park.'], ['store','магазин','There is a store near the park.']]],
 ['hobbies-abilities', [
 ['swim','плавать','I can swim.'], ['cook','готовить еду','Natasha can cook.'], ['sing','петь','He can sing.'], ['dance','танцевать','We can dance.'], ['draw','рисовать','Gregory can draw.'], ['read','читать','I can read.'], ['play tennis','играть в теннис','She can play tennis.'], ['play soccer','играть в футбол','They can play soccer.'], ['play the guitar','играть на гитаре','I can play the guitar.'], ['ride a bike','ездить на велосипеде','We can ride a bike.']]],
 ['actions-time', [
 ['write','писать','Natasha is writing now.'], ['run','бегать','Gregory is running now.'], ['listen','слушать','I am listening to music.'], ['watch','смотреть','We are watching TV.'], ['wait','ждать','She is waiting here.'], ['now','сейчас','I am reading now.'], ['right now','прямо сейчас','They are cooking right now.'], ['today','сегодня','I am working at home today.'], ['every day','каждый день','We work every day.'], ['at night','ночью','I read at night.']]],
];

test('integrated curriculum contains exactly 16 lessons / 112 steps / 330 unique questions', () => {
 assert.deepEqual(lessons.map(e=>e.id),order);
 assert.equal(questionCount,330);
 assert.equal(vocabulary.length,6);
 assert.equal(lessons.flatMap(e=>e.lesson.steps).length,112);
 const all=lessons.flatMap(e=>e.lesson.steps.flatMap(s=>s.type==='exercise'?s.questions:[]));
 assert.equal(new Set(all.map(q=>q.id)).size,330);
 assert.doesNotThrow(()=>validateCourse(lessons));
 for (const {lesson} of vocabulary) {
  assert.deepEqual(lesson.steps.map(s=>s.type),['intro','vocabulary','exercise','exercise','exercise','review','summary']);
  assert.equal(lesson.steps[1].items.length,10);
  assert.deepEqual(lesson.steps.filter(s=>s.type==='exercise').map(s=>s.questions.length),[10,10,10]);
  assert.equal(new Set(lesson.steps[1].items.map(w=>w.id)).size,10);
 }
 assert.equal(new Set(vocabulary.flatMap(e=>e.lesson.steps[1].items.map(w=>w.term))).size,60);
});

for (const [id, rows] of audit) for (const [index,[term,meaning,sentence]] of rows.entries()) test(`vocabulary answer audit: ${id}/${term}`,()=>{
 const lesson=vocabulary.find(e=>e.id===id).lesson;
 const word=lesson.steps[1].items[index];
 assert.equal(word.term,term); assert.equal(word.meaningRu,meaning);
 assert.match(word.exampleTranslation,/[А-Яа-я]/u);
 assert.ok(word.example && word.partOfSpeech && word.usage);
 const canonical=[meaning,term,sentence];
 for(const [offset,step] of lesson.steps.slice(2,5).entries()) {
  const q=step.questions[index];
  assert.equal(q.vocabularyId,word.id);
  assert.equal(q.acceptedAnswers[0],canonical[offset]);
  assert.equal(gradeAnswer(q,canonical[offset]),true);
  assert.equal(gradeAnswer(q,offset===0?rows[(index+1)%10][1]:`${canonical[offset]} incorrect`),false);
  assert.equal(gradeAnswer(q,''),false);
  for(const answer of q.acceptedAnswers) {
   assert.equal(gradeAnswer(q,answer),true);
   if(q.type!=='choice') assert.equal(gradeAnswer(q,`  ${answer.toUpperCase().replaceAll("'",'’').replaceAll(' ','   ')}  `),true);
  }
  if(q.type!=='choice') {
   assert.equal(q.prompt.includes(term),false, 'target English word must not leak into recall/context clue');
   assert.equal(q.placeholder.includes(term),false);
  }
 }
});

test('new schema rejects missing/duplicate cards, invalid languages and unknown vocabulary references',()=>{
 const bad=(mutate,pattern)=>{const c=structuredClone(vocabulary);mutate(c[0].lesson);assert.throws(()=>validateCourse(c),pattern);};
 bad(l=>l.steps[1].items[0].exampleTranslation='',/complete translated/);
 bad(l=>l.steps[1].items[1].id=l.steps[1].items[0].id,/unique IDs/);
 bad(l=>l.steps[1].items.splice(0,5),/6–12/);
 bad(l=>l.steps[2].questions[0].vocabularyId='unknown',/unknown vocabulary/);
 bad(l=>delete l.steps[2].questions[0].vocabularyId,/card reference/);
 bad(l=>l.steps[3].questions[0].promptLanguage='xx',/language/);
 bad(l=>l.steps[3].questions[0].optionsLanguage='ru',/only valid/);
 bad(l=>l.kind='grammar',/seven ordered/);
});

function finish(progress,course,lesson,throughSummary=true) {
 for(const step of lesson.steps) {
  if(!throughSummary && step.type==='summary') break;
  const action={lessonId:lesson.id,stepId:step.id};
  progress=updateProgress(progress,course,step.type==='exercise'?{...action,type:'check-exercise',answers:Object.fromEntries(step.questions.map(q=>[q.id,q.acceptedAnswers[0]]))}:{...action,type:'complete'});
 }
 return progress;
}

test('new learner completes all 16 lessons in strict order, with 48 batches and refresh persistence',()=>{
 let p=emptyProgress();let batches=0;
 for(const [index,{lesson}] of lessons.entries()) {
  assert.equal(isLessonUnlocked(p,lessons,lesson.id),true);
  for(const future of lessons.slice(index+1)) assert.equal(isLessonUnlocked(p,lessons,future.id),false);
  for(const step of lesson.steps) {
   const base={lessonId:lesson.id,stepId:step.id};
   assert.equal(isStepUnlocked(p,lesson,step.id),true);
   if(step.type==='exercise') {
    const drafts=Object.fromEntries(step.questions.map(q=>[q.id,q.acceptedAnswers[0]]));
    const wrong=step.questions[0];
    drafts[wrong.id]=wrong.type==='choice'?wrong.options.find(v=>!wrong.acceptedAnswers.includes(v)):'incorrect';
    const partial=updateProgress(p,lessons,{...base,type:'check-exercise',answers:{}});
    assert.equal(partial,p);
    p=updateProgress(p,lessons,{...base,type:'check-exercise',answers:drafts});
    assert.equal(p.lessons[lesson.id].completedSteps.includes(step.id),false);
    assert.equal(getQuestionState(p.lessons[lesson.id].answers[wrong.id],drafts[wrong.id]).locked,false);
    p=decodeProgress(JSON.stringify(p),lessons).progress;
    const locked=p.lessons[lesson.id].answers[step.questions[1].id];
    p=updateProgress(p,lessons,{...base,type:'check-exercise',answers:{[wrong.id]:wrong.acceptedAnswers.at(-1)}});
    assert.equal(p.lessons[lesson.id].answers[step.questions[1].id],locked);
    assert.equal(getQuestionState(locked,'anything').locked,true);
    assert.equal(p.lessons[lesson.id].answers[wrong.id].attempts.length,2);
    batches++;
   } else {
    if(step.type==='summary' && index<15) assert.equal(isLessonUnlocked(p,lessons,lessons[index+1].id),false);
    p=updateProgress(p,lessons,{...base,type:'complete'});
   }
   assert.deepEqual(decodeProgress(JSON.stringify(p),lessons),{progress:p,recovered:false});
  }
  assert.equal(getScore(p,lesson).correct,lesson.kind==='vocabulary'?30:15);
 }
 assert.equal(batches,48);assert.deepEqual(p.completedLessons,order);
});

for(let completed=0;completed<=10;completed++) test(`pre-insertion progress migration preserves grammar frontier ${completed}/10, attempts and location`,()=>{
 let old=emptyProgress();
 for(const {lesson} of grammarLessons.slice(0,completed)) old=finish(old,grammarLessons,lesson);
 const next=grammarLessons[completed]?.lesson;
 if(next) {
  for(const step of next.steps.slice(0,2)) old=updateProgress(old,grammarLessons,{type:'complete',lessonId:next.id,stepId:step.id});
  const step=next.steps[2];
  old=updateProgress(old,grammarLessons,{type:'check-exercise',lessonId:next.id,stepId:step.id,answers:Object.fromEntries(step.questions.map((q,i)=>[q.id,i?q.acceptedAnswers[0]:q.options.find(v=>!q.acceptedAnswers.includes(v))]))});
  old=updateProgress(old,grammarLessons,{type:'retry',lessonId:next.id,stepId:step.id,questionId:step.questions[0].id});
  old=updateProgress(old,grammarLessons,{type:'visit',lessonId:next.id,stepId:step.id});
 }
 delete old.curriculumVersion; // Actual old v1 shape, not a newly marked session.
 const {progress:migrated,recovered}=decodeProgress(JSON.stringify(old),lessons);
 assert.equal(recovered,true);
 assert.deepEqual(migrated.lessons,old.lessons);
 assert.deepEqual(migrated.completedLessons,old.completedLessons);
 assert.deepEqual(migrated.lastVisited,old.lastVisited);
 for(const e of grammarLessons.slice(0,Math.min(10,completed+1))) assert.equal(isLessonUnlocked(migrated,lessons,e.id),true);
 for(const e of grammarLessons.slice(completed+1)) assert.equal(isLessonUnlocked(migrated,lessons,e.id),false);
 for(const e of vocabulary) assert.equal(migrated.completedLessons.includes(e.id),false);
 assert.deepEqual(decodeProgress(JSON.stringify(migrated),lessons),{progress:migrated,recovered:false});
 if(next && completed<9) {
  const finished=finish(migrated,lessons,next);
  assert.equal(isLessonUnlocked(finished,lessons,grammarLessons[completed+1].id),false,'new frontier requires vocabulary backfill');
 }
});

test('forged old completion flags cannot expand retained access; new marker never acquires legacy rights',()=>{
 const old={version:1,completedLessons:grammarLessons.map(e=>e.id),lessons:{},lastVisited:null};
 const p=decodeProgress(JSON.stringify(old),lessons).progress;
 assert.deepEqual(p.completedLessons,[]);
 assert.equal(isLessonUnlocked(p,lessons,'present-simple'),false);
 let fresh=finish(emptyProgress(),lessons,lessons[0].lesson);
 const restored=decodeProgress(JSON.stringify(fresh),lessons).progress;
 assert.equal(restored.legacyUnlockedLessons,undefined);
 assert.equal(isLessonUnlocked(restored,lessons,'people-feelings'),true);
 assert.equal(isLessonUnlocked(restored,lessons,'present-simple'),false);
});

test('returning learner can backfill vocabulary and continue beyond the retained grammar frontier',()=>{
 let old=emptyProgress();for(const e of grammarLessons.slice(0,3)) old=finish(old,grammarLessons,e.lesson);
 delete old.curriculumVersion;
 let p=decodeProgress(JSON.stringify(old),lessons).progress;
 const original=structuredClone(p.lessons);
 for(const id of ['people-feelings','daily-routines']) {
  p=finish(p,lessons,lessons.find(e=>e.id===id).lesson);
  assert.deepEqual(decodeProgress(JSON.stringify(p),lessons),{progress:p,recovered:false});
 }
 assert.equal(isLessonUnlocked(p,lessons,'have-has'),true);
 for(const e of grammarLessons.slice(0,3)) assert.deepEqual(p.lessons[e.id],original[e.id]);
 assert.equal(p.completedLessons.length,5);
 p=finish(p,lessons,lessons.find(e=>e.id==='have-has').lesson);
 assert.equal(isLessonUnlocked(p,lessons,'articles'),true);
 assert.deepEqual(decodeProgress(JSON.stringify(p),lessons),{progress:p,recovered:false});
});

test('a returning ten-grammar graduate can complete all six vocabulary lessons and reach 16/16',()=>{
 let old=emptyProgress();for(const e of grammarLessons) old=finish(old,grammarLessons,e.lesson);
 delete old.curriculumVersion;
 let p=decodeProgress(JSON.stringify(old),lessons).progress;
 for(const {lesson} of vocabulary) {
  assert.equal(isLessonUnlocked(p,lessons,lesson.id),true);
  p=finish(p,lessons,lesson);
  assert.deepEqual(decodeProgress(JSON.stringify(p),lessons),{progress:p,recovered:false});
 }
 for(const e of grammarLessons) assert.deepEqual(p.lessons[e.id],old.lessons[e.id]);
 assert.deepEqual(p.completedLessons,order);
});

test('migration is read-only on startup; first change archives exact legacy bytes; theme untouched',()=>{
 let old=emptyProgress();for(const e of grammarLessons) old=finish(old,grammarLessons,e.lesson);
 delete old.curriculumVersion;
 const raw=JSON.stringify(old,null,2);const values=new Map([[PROGRESS_KEY,raw],['gps.theme.v1','dark']]);const writes=[];
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{writes.push(k);values.set(k,v);}};
 const session=openProgressSession(storage,lessons);
 assert.equal(session.persist(session.progress),'unchanged');assert.deepEqual(writes,[]);assert.equal(values.get(PROGRESS_KEY),raw);
 const changed=updateProgress(session.progress,lessons,{type:'visit',lessonId:'was-were',stepId:'theory'});
 assert.equal(session.persist(changed),'saved');assert.ok(session.backupKey.startsWith(PROGRESS_BACKUP_PREFIX));
 assert.equal(values.get(session.backupKey),raw);assert.equal(values.get('gps.theme.v1'),'dark');
 assert.deepEqual(openProgressSession(storage,lessons).progress,changed);
});

test('integrated QA opens all 112 steps / 330 unanswered questions, and resets only a chosen vocabulary lesson',()=>{
 let p=createQaProgress(lessons);const values=new Map([[PROGRESS_KEY,'normal sentinel'],['gps.theme.v1','dark']]);
 const port={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 for(const {lesson} of lessons) {
  assert.equal(isLessonUnlocked(p,lessons,lesson.id),true);
  for(const s of lesson.steps) assert.equal(isStepUnlocked(p,lesson,s.id),true);
  assert.equal(getScore(p,lesson).attempts,0);
 }
 const lesson=vocabulary.at(-1).lesson;const step=lesson.steps[3];
 p=updateProgress(p,lessons,{type:'check-exercise',lessonId:lesson.id,stepId:step.id,answers:Object.fromEntries(step.questions.map(q=>[q.id,q.acceptedAnswers[0]]))});
 assert.equal(saveQaProgress(port,p),true);assert.deepEqual(loadQaProgress(port,lessons),p);
 assert.deepEqual(restoreQaProgress(JSON.stringify(p),lessons),p);
 const reset=restartQaLesson(p,lessons,lesson.id);
 assert.equal(getScore(reset,lesson).attempts,0);assert.equal(reset.completedLessons.length,16);
 assert.equal(values.get(PROGRESS_KEY),'normal sentinel');assert.equal(values.get('gps.theme.v1'),'dark');assert.ok(values.has(QA_PROGRESS_KEY));
});

test('optional missed-word practice reuses batch checking without mutating earned attempts or other lessons', async()=>{
 const {createVocabularyReview}=await import('../src/lib/vocabularyReview.ts');
 let earned=createQaProgress(lessons);
 const lesson=vocabulary[0].lesson;
 earned=finish(earned,lessons,lesson);
 const before=structuredClone(earned);
 const session=createVocabularyReview(earned,lessons,lesson,['ready','busy','busy']);
 assert.deepEqual(session.step.questions.map(q=>q.vocabularyId),['busy','ready']);
 assert.deepEqual(earned,before);
 assert.equal(session.progress.lessons[lesson.id].answers[session.step.questions[0].id],undefined);
 const base={type:'check-exercise',lessonId:lesson.id,stepId:'blank'};
 let local=updateProgress(session.progress,session.course,{...base,answers:Object.fromEntries(session.step.questions.map((q,i)=>[q.id,i?'wrong':q.acceptedAnswers[0]]))});
 assert.equal(getScore(local,lesson,session.step).correct,1);
 const correct=local.lessons[lesson.id].answers[session.step.questions[0].id];
 local=updateProgress(local,session.course,{...base,answers:{[session.step.questions[1].id]:'ready'}});
 assert.equal(getScore(local,lesson,session.step).correct,2);
 assert.equal(local.lessons[lesson.id].answers[session.step.questions[0].id],correct);
 assert.deepEqual(earned,before);
 assert.deepEqual(local.lessons['to-be'],earned.lessons['to-be']);
 assert.equal(lessons[1].lesson.steps[3].questions.length,10,'temporary review does not change the catalog');
});
