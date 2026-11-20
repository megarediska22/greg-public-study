// Disposable browser seed data, produced by the real engine; never imported by src/.
import { lessons, historicalLessons } from '../src/content/course.ts';
import { loadAuthoredCourse } from '../tests/fixtures/extensionCourse.mjs';
import { emptyProgress } from '../src/lib/progress.ts';
import { applyStep, legacyFixtures } from './curriculum-pilot-fixtures.mjs';
const course=(await loadAuthoredCourse()).filter(e=>lessons.some(x=>x.id===e.id));
let progress=emptyProgress();const before={};
for(const {lesson} of course){before[lesson.id]=progress;for(const step of lesson.steps)progress=applyStep(progress,course,lesson,step);}
console.log(JSON.stringify({course,before,...legacyFixtures(historicalLessons),completed:progress,graduate:before['unit-027']}));
