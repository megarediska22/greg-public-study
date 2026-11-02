import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/content/course.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { emptyProgress, updateProgress, decodeProgress, loadProgress, saveProgress, isLessonUnlocked, isStepUnlocked, getScore, PROGRESS_KEY } from '../src/lib/progress.ts';
import { sampleLesson } from './fixtures/sampleLesson.ts';

const questions = lessons.flatMap(entry => entry.lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []));
// Independent reviewed answer oracle: key, canonical answer, specific incorrect form.
// This checks authored keys against grammar expectations, not just against themselves.
const answerAudit = [
  ['choose-am', 'am', 'is'],
  ['to-be-teacher', 'is', 'are'],
  ['to-be-location', 'are', 'is'],
  ['to-be-age', 'are', 'am'],
  ['to-be-weather', 'is', 'are'],
  ['negative-blank', 'am not', 'is not'],
  ['to-be-she-negative', 'is not', 'are not'],
  ['to-be-we-negative', 'are not', 'is not'],
  ['to-be-he-negative', 'is not', 'am not'],
  ['to-be-they-negative', 'are not', 'is not'],
  ['ready-question', 'Are you ready?', 'You are ready?'],
  ['to-be-student-negative', 'I am not a student.', 'I not am a student.'],
  ['to-be-home-negative', 'She is not at home.', 'She not is at home.'],
  ['to-be-tired-question', 'Are they tired?', 'They are tired?'],
  ['to-be-short-answer', 'Yes, I am.', "Yes, I'm."],
  ['ps-works', 'works', 'work'],
  ['ps-watches', 'watches', 'watchs'],
  ['ps-studies', 'studies', 'studys'],
  ['ps-plays', 'plays', 'plaies'],
  ['ps-goes', 'goes', 'gos'],
  ['ps-i-negative', 'do not', 'does not'],
  ['ps-she-negative', 'does not', 'do not'],
  ['ps-they-negative', 'do not', 'does not'],
  ['ps-study-base', 'study', 'studies'],
  ['ps-we-base', 'watch', 'watches'],
  ['ps-work-sentence', 'She does not work at home.', "She doesn't works at home."],
  ['ps-play-sentence', 'I do not play tennis.', "I doesn't play tennis."],
  ['ps-study-sentence', 'He does not study English.', "He doesn't studies English."],
  ['ps-watch-sentence', 'You do not watch TV.', "You doesn't watch TV."],
  ['ps-go-sentence', 'They do not go to school.', "They don't goes to school."],
  ['dd-you', 'Do', 'Does'],
  ['dd-she', 'Does', 'Do'],
  ['dd-they', 'Do', 'Does'],
  ['dd-he', 'Does', 'Do'],
  ['dd-we', 'Do', 'Does'],
  ['dd-like-base', 'like', 'likes'],
  ['dd-i-short', 'do', 'does'],
  ['dd-she-short', 'does not', 'do not'],
  ['dd-where', 'does', 'do'],
  ['dd-be-difference', 'Are', 'Do'],
  ['dd-work-question', 'Do you work at home?', 'You do work at home?'],
  ['dd-watch-question', 'Does she watch TV?', 'Does she watches TV?'],
  ['dd-study-question', 'Does he study English?', 'Does he studies English?'],
  ['dd-he-negative-answer', 'No, he does not.', "No, he don't."],
  ['dd-they-positive-answer', 'Yes, they do.', 'Yes, they does.'],
];

test('production A1 curriculum has the exact lesson/step/type order and 45 distinct questions', () => {
  assert.deepEqual(lessons.map(entry => entry.id), ['to-be', 'present-simple', 'do-does']);
  assert.equal(questions.length, 45);
  assert.equal(new Set(questions.map(question => question.id)).size, 45);
  assert.deepEqual(answerAudit.map(([id]) => id), questions.map(question => question.id));
  assert.doesNotThrow(() => validateCourse(lessons));
  for (const { lesson } of lessons) {
    assert.equal(lesson.sample, false);
    assert.equal(lesson.level, 'A1');
    assert.deepEqual(lesson.steps.map(step => step.type), ['intro', 'theory', 'exercise', 'exercise', 'exercise', 'review', 'summary']);
    const exercises = lesson.steps.filter(step => step.type === 'exercise');
    assert.deepEqual(exercises.map(step => step.questions.length), [5, 5, 5]);
    assert.deepEqual(exercises.map(step => [...new Set(step.questions.map(question => question.type))]), [['choice'], ['blank'], ['written']]);
    for (const step of exercises) {
      assert.equal(new Set(step.questions.map(question => question.instruction + question.prompt)).size, step.questions.length);
      for (const question of step.questions) {
        assert.match(question.instruction, /[А-Яа-яЁё]/u);
        assert.match(question.explanation, /[А-Яа-яЁё]/u);
      }
    }
  }
});

for (const [id, expected, wrong] of answerAudit) test(`grammar audit: ${id}`, () => {
  const question = questions.find(item => item.id === id);
  assert.equal(question.acceptedAnswers[0], expected);
  assert.equal(gradeAnswer(question, expected), true);
  assert.equal(gradeAnswer(question, wrong), false);
  assert.equal(gradeAnswer(question, ''), false);
  for (const answer of question.acceptedAnswers) {
    assert.equal(gradeAnswer(question, answer), true);
    if (question.type !== 'choice') {
      const normalizedVariant = `  ${answer.toUpperCase().replaceAll("'", '’').replaceAll(' ', '   ')}  `;
      assert.equal(gradeAnswer(question, normalizedVariant), true);
      if (question.type === 'written') assert.equal(gradeAnswer(question, answer.replace(/[.!?]$/, '')), true);
    }
  }
});

test('legitimate written contractions and uncontracted alternatives are explicitly configured', () => {
  const alternatives = {
    'to-be-student-negative': ['I am not a student.', "I'm not a student."],
    'to-be-home-negative': ['She is not at home.', "She isn't at home.", "She's not at home."],
    'ps-work-sentence': ['She does not work at home.', "She doesn't work at home."],
    'ps-play-sentence': ['I do not play tennis.', "I don't play tennis."],
    'ps-study-sentence': ['He does not study English.', "He doesn't study English."],
    'ps-watch-sentence': ['You do not watch TV.', "You don't watch TV."],
    'ps-go-sentence': ['They do not go to school.', "They don't go to school."],
    'dd-he-negative-answer': ['No, he does not.', "No, he doesn't.", 'No he does not.', "No he doesn't."],
  };
  for (const [id, answers] of Object.entries(alternatives)) {
    assert.deepEqual(questions.find(question => question.id === id).acceptedAnswers, answers);
  }
});

test('validator rejects production order, undersized exercises and wrong question types with paths', () => {
  const order = structuredClone(lessons);
  [order[0].lesson.steps[1], order[0].lesson.steps[2]] = [order[0].lesson.steps[2], order[0].lesson.steps[1]];
  assert.throws(() => validateCourse(order), /to-be.*exactly seven ordered steps/);
  const small = structuredClone(lessons);
  small[1].lesson.steps[3].questions.pop();
  assert.throws(() => validateCourse(small), /present-simple\/blank.*at least five/);
  const type = structuredClone(lessons);
  type[2].lesson.steps[4].questions[0].type = 'blank';
  assert.throws(() => validateCourse(type), /do-does\/sentence\/dd-work-question.*expected written/);
});

test('validator rejects duplicate course-wide question IDs and incomplete theory', () => {
  const duplicate = structuredClone(lessons);
  duplicate[1].lesson.steps[2].questions[0].id = 'choose-am';
  assert.throws(() => validateCourse(duplicate), /present-simple\/choice\/choose-am.*unique across the course/);
  const theory = structuredClone(lessons);
  theory[0].lesson.steps[1].rows[0].translation = '';
  assert.throws(() => validateCourse(theory), /to-be\/theory.*translated table rows/);
});

test('optional theory blocks validate translations and remain compatible with legacy lessons', () => {
  assert.doesNotThrow(() => validateCourse([{ id: sampleLesson.id, lesson: sampleLesson }]));
  const missingTranslation = structuredClone(lessons);
  missingTranslation[0].lesson.steps[1].blocks[0].translation = '';
  assert.throws(() => validateCourse(missingTranslation), /to-be\/theory.*both English text and a translation/);
  const duplicate = structuredClone(lessons);
  duplicate[0].lesson.steps[1].blocks[1].title = duplicate[0].lesson.steps[1].blocks[0].title;
  assert.throws(() => validateCourse(duplicate), /to-be\/theory.*unique titles/);
  const blankFormula = structuredClone(lessons);
  blankFormula[0].lesson.steps[1].blocks[0].formula = ' ';
  assert.throws(() => validateCourse(blankFormula), /to-be\/theory.*formulas must be nonempty/);
});

function completeLesson(progress, course, lesson) {
  for (const step of lesson.steps) {
    const action = { lessonId: lesson.id, stepId: step.id };
    if (step.type === 'exercise') {
      for (const question of step.questions) progress = updateProgress(progress, course, { ...action, type: 'answer', questionId: question.id, answer: question.acceptedAnswers[0] });
    } else progress = updateProgress(progress, course, { ...action, type: 'complete' });
  }
  return progress;
}

test('completed Phase 2 demo restores only compatible progress and never completes production or unlocks lesson 2', () => {
  const demoCourse = [{ id: 'to-be', lesson: sampleLesson }];
  const demo = completeLesson(emptyProgress(), demoCourse, sampleLesson);
  assert.deepEqual(demo.completedLessons, ['to-be']);
  const { progress, recovered } = decodeProgress(JSON.stringify(demo), lessons);
  assert.equal(recovered, true);
  assert.deepEqual(progress.completedLessons, []);
  assert.deepEqual(progress.lessons['to-be'].completedSteps, ['intro', 'theory']);
  assert.equal(progress.lessons['to-be'].answers['choose-am'].attempts[0].correct, true);
  assert.equal(progress.lessons['to-be'].answers['negative-blank'], undefined);
  assert.equal(isLessonUnlocked(progress, lessons, 'present-simple'), false);
  assert.equal(isStepUnlocked(progress, lessons[0].lesson, 'summary'), false);
  assert.deepEqual(getScore(progress, lessons[0].lesson), { total: 15, correct: 1, firstTry: 1, attempts: 1 });
  const values = new Map([['gps.theme.v1', 'dark']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  saveProgress(storage, progress);
  assert.deepEqual(loadProgress(storage, lessons), { progress, recovered: false, unavailable: false });
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
  assert.equal(JSON.parse(storage.getItem(PROGRESS_KEY)).version, 1);
});

test('all production lessons unlock sequentially, finish with 15/15 each and survive refresh/review', () => {
  let progress = emptyProgress();
  for (const [index, { lesson }] of lessons.entries()) {
    assert.equal(isLessonUnlocked(progress, lessons, lesson.id), true);
    if (index < lessons.length - 1) assert.equal(isLessonUnlocked(progress, lessons, lessons[index + 1].id), false);
    progress = completeLesson(progress, lessons, lesson);
    assert.equal(progress.lessons[lesson.id].completedSteps.length, 7);
    assert.deepEqual(getScore(progress, lesson), { total: 15, correct: 15, firstTry: 15, attempts: 15 });
    assert.deepEqual(decodeProgress(JSON.stringify(progress), lessons), { progress, recovered: false });
    const reviewed = updateProgress(progress, lessons, { type: 'visit', lessonId: lesson.id, stepId: 'theory' });
    assert.deepEqual(reviewed.completedLessons, progress.completedLessons);
  }
  assert.deepEqual(progress.completedLessons, lessons.map(lesson => lesson.id));
});
