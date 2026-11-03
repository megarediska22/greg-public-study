import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, questionCount } from '../src/content/course.ts';
import { gradeAnswer } from '../src/lib/grading.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { emptyProgress, updateProgress, decodeProgress, saveProgress, loadProgress, isLessonUnlocked, isStepUnlocked, getScore, resumeStep, PROGRESS_KEY } from '../src/lib/progress.ts';

const added = lessons.slice(3);
const questions = added.flatMap(({ lesson }) => lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []));

// Authored separately from production keys: canonical response and a specific error.
const audit = [
  ['hh-i-have', 'have', 'has'],
  ['hh-natasha-has', 'has', 'have'],
  ['hh-we-have', 'have', 'has'],
  ['hh-negative-have', 'have', 'has'],
  ['hh-question-have', 'have', 'has'],
  ['hh-gregory-has', 'has', 'have'],
  ['hh-they-have', 'have', 'has'],
  ['hh-i-negative', 'do not', 'does not'],
  ['hh-she-negative', 'does not', 'do not'],
  ['hh-do-question', 'Do', 'Does'],
  ['hh-car-negative', 'He does not have a car.', "He doesn't has a car."],
  ['hh-bag-question', 'Do you have a bag?', 'Have you a bag?'],
  ['hh-natasha-question', 'Does Natasha have a bike?', 'Does Natasha has a bike?'],
  ['hh-phone-negative', 'I do not have a phone.', "I doesn't have a phone."],
  ['hh-short-yes', 'Yes, she does.', 'Yes, she has.'],
  ['art-first-book', 'a', 'an'],
  ['art-first-apple', 'an', 'a'],
  ['art-first-egg', 'an', 'a'],
  ['art-known-bag', 'The', 'An'],
  ['art-known-teacher', 'The', 'An'],
  ['art-car', 'a', 'an'],
  ['art-umbrella', 'an', 'a'],
  ['art-cup', 'a', 'an'],
  ['art-known-key', 'The', 'An'],
  ['art-known-apple', 'The', 'An'],
  ['art-add-book', 'I have a book.', 'I have an book.'],
  ['art-fix-apple', 'She has an apple.', 'She has a apple.'],
  ['art-fix-car', 'We have a car.', 'We have an car.'],
  ['art-second-bag', 'The bag is red.', 'An bag is red.'],
  ['art-known-orange', 'It is the orange.', 'It is an orange.'],
  ['dem-near-book', 'This', 'These'],
  ['dem-far-bag', 'That', 'Those'],
  ['dem-near-apples', 'These', 'This'],
  ['dem-far-cars', 'Those', 'That'],
  ['dem-these-are', 'are', 'is'],
  ['dem-near-cup', 'This', 'These'],
  ['dem-far-chair', 'That', 'Those'],
  ['dem-this-is', 'is', 'are'],
  ['dem-those-are', 'are', 'is'],
  ['dem-plural-books', 'books', 'book'],
  ['dem-books-plural', 'These are books.', 'These is books.'],
  ['dem-chairs-plural', 'Those are chairs.', 'Those are a chairs.'],
  ['dem-bag-question', 'Is this a bag?', 'This is a bag?'],
  ['dem-apples-negative', 'These are not apples.', 'These not are apples.'],
  ['dem-car-negative', 'That is not a car.', 'That not is a car.'],
  ['there-one-desk', 'is', 'are'],
  ['there-two-books', 'are', 'is'],
  ['there-question-one', 'Is', 'Are'],
  ['there-question-many', 'Are', 'Is'],
  ['there-not-lamp', "isn't", 'aren’t'],
  ['there-a-chair', 'is', 'are'],
  ['there-apples', 'are', 'is'],
  ['there-no-desk', 'is not', 'are not'],
  ['there-are-question', 'Are', 'Is'],
  ['there-short-is', 'is', 'are'],
  ['there-desk-negative', 'There is not a desk in the room.', "There aren't a desk in the room."],
  ['there-book-question', 'Is there a book on the table?', 'There is a book on the table?'],
  ['there-chairs-question', 'Are there two chairs in the kitchen?', 'Is there two chairs in the kitchen?'],
  ['there-short-no', 'No, there is not.', 'No, it is not.'],
  ['there-short-yes-plural', 'Yes, there are.', 'Yes, there is.'],
  ['can-swim-base', 'swim', 'swims'],
  ['can-she-can', 'can', 'cans'],
  ['can-question', 'Can', 'Do can'],
  ['can-negative', "can't", 'cans'],
  ['can-positive-short', 'can', 'do'],
  ['can-read', 'can', 'cans'],
  ['can-no-cook', 'cannot', 'does not can'],
  ['can-play-base', 'play', 'plays'],
  ['can-help-question', 'Can', 'Does can'],
  ['can-no-short', 'cannot', 'does not'],
  ['can-he-negative', 'He cannot swim.', "He doesn't can swim."],
  ['can-you-question', 'Can you cook?', 'Do you can cook?'],
  ['can-natasha-question', 'Can Natasha read English?', 'Can Natasha reads English?'],
  ['can-i-short-yes', 'Yes, I can.', 'Yes, I do.'],
  ['can-she-short-no', 'No, she cannot.', "No, she doesn't."],
  ['pc-i-am', 'am', 'is'],
  ['pc-natasha-is', 'is', 'are'],
  ['pc-they-are', 'are', 'is'],
  ['pc-making', 'making', 'makeing'],
  ['pc-running', 'running', 'runing'],
  ['pc-cooking', 'cooking', 'cook'],
  ['pc-watching', 'watching', 'watches'],
  ['pc-writing', 'writing', 'writeing'],
  ['pc-swimming', 'swimming', 'swiming'],
  ['pc-playing', 'playing', 'plaing'],
  ['pc-he-negative', 'He is not reading a book.', 'He not reading a book.'],
  ['pc-they-question', 'Are they watching TV?', 'Do they watching TV?'],
  ['pc-i-negative', 'I am not working now.', "I isn't working now."],
  ['pc-natasha-question', 'Is Natasha cooking?', 'Does Natasha cooking?'],
  ['pc-run-now', 'He is running now.', 'He running now.'],
  ['past-i-was', 'was', 'were'],
  ['past-they-were', 'were', 'was'],
  ['past-she-was', 'was', 'were'],
  ['past-you-were', 'were', 'was'],
  ['past-we-were', 'were', 'was'],
  ['past-he-negative', 'was not', 'were not'],
  ['past-we-negative', 'were not', 'was not'],
  ['past-was-question', 'Was', 'Were'],
  ['past-were-question', 'Were', 'Was'],
  ['past-she-short', 'was not', 'were not'],
  ['past-home-negative', 'He was not at home yesterday.', "He weren't at home yesterday."],
  ['past-they-question', 'Were they tired last night?', 'Was they tired last night?'],
  ['past-you-question', 'Were you at school yesterday?', 'Was you at school yesterday?'],
  ['past-she-yes', 'Yes, she was.', 'Yes, she were.'],
  ['past-they-no', 'No, they were not.', "No, they wasn't."],
];

test('v1.1 adds exactly 7 complete lessons and 105 questions without reducing validation', () => {
  assert.equal(lessons.length, 10);
  assert.equal(questionCount, 150);
  assert.equal(questions.length, 105);
  assert.deepEqual(audit.map(([id]) => id), questions.map(question => question.id));
  assert.doesNotThrow(() => validateCourse(lessons));
  for (const { lesson } of added) {
    assert.equal(lesson.sample, false);
    assert.equal(lesson.level, 'A1');
    assert.equal(lesson.steps.length, 7);
    assert.ok(lesson.steps[1].blocks.length > 0);
    assert.ok(lesson.objectives.length >= 3);
    for (const step of lesson.steps.filter(step => step.type === 'exercise')) {
      assert.equal(step.questions.length, 5);
      assert.equal(new Set(step.questions.map(question => question.prompt + question.instruction)).size, 5);
    }
  }
});

for (const [id, expected, wrong] of audit) test(`v1.1 answer audit: ${id}`, () => {
  const question = questions.find(item => item.id === id);
  assert.equal(question.acceptedAnswers[0], expected);
  assert.equal(gradeAnswer(question, expected), true);
  assert.equal(gradeAnswer(question, wrong), false);
  assert.equal(gradeAnswer(question, ''), false);
  for (const answer of question.acceptedAnswers) {
    assert.equal(gradeAnswer(question, answer), true);
    if (question.type !== 'choice') {
      assert.equal(gradeAnswer(question, `  ${answer.toUpperCase().replaceAll("'", '’').replaceAll(' ', '   ')}  `), true);
      if (question.type === 'written') assert.equal(gradeAnswer(question, answer.replace(/[.!?]+$/, '')), true);
    }
  }
});

function finish(progress, course, lesson) {
  for (const step of lesson.steps) {
    const base = { lessonId: lesson.id, stepId: step.id };
    if (step.type === 'exercise') {
      for (const question of step.questions) progress = updateProgress(progress, course, { ...base, type: 'answer', questionId: question.id, answer: question.acceptedAnswers[0] });
    } else progress = updateProgress(progress, course, { ...base, type: 'complete' });
  }
  return progress;
}

test('v1.0 completion, attempts, last location and theme survive; lesson 4 alone becomes available', () => {
  const oldCourse = lessons.slice(0, 3);
  let legacy = emptyProgress();
  for (const { lesson } of oldCourse) legacy = finish(legacy, oldCourse, lesson);
  legacy = updateProgress(legacy, oldCourse, { type: 'visit', lessonId: 'do-does', stepId: 'summary' });
  const values = new Map([['gps.theme.v1', 'dark']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  saveProgress(storage, legacy);
  assert.deepEqual(loadProgress(storage, lessons), { progress: legacy, recovered: false, unavailable: false });
  assert.deepEqual(decodeProgress(JSON.stringify(legacy), lessons), { progress: legacy, recovered: false });
  assert.equal(storage.getItem('gps.theme.v1'), 'dark');
  assert.deepEqual(legacy.completedLessons, ['to-be', 'present-simple', 'do-does']);
  assert.equal(isLessonUnlocked(legacy, lessons, 'have-has'), true);
  assert.equal(isLessonUnlocked(legacy, lessons, 'articles'), false);
  assert.equal(resumeStep(legacy, lessons[2].lesson), 'summary');
  assert.equal(JSON.parse(storage.getItem(PROGRESS_KEY)).version, 1);
});

test('every one of 10 lessons keeps subsequent content locked until explicit summary completion', () => {
  let progress = emptyProgress();
  for (const [index, { lesson }] of lessons.entries()) {
    for (const future of lessons.slice(index + 1)) {
      assert.equal(isLessonUnlocked(progress, lessons, future.id), false);
      assert.equal(updateProgress(progress, lessons, { type: 'complete', lessonId: future.id, stepId: 'intro' }), progress);
    }
    assert.equal(updateProgress(progress, lessons, { type: 'complete', lessonId: lesson.id, stepId: 'summary' }), progress);
    const summary = lesson.steps.at(-1);
    const partial = { ...lesson, steps: lesson.steps.slice(0, -1) };
    // Use the real catalog guards; finishing practice/review alone must not unlock the next lesson.
    progress = finish(progress, lessons, partial);
    assert.equal(isStepUnlocked(progress, lesson, summary.id), true);
    assert.equal(progress.completedLessons.includes(lesson.id), false);
    if (index < 9) assert.equal(isLessonUnlocked(progress, lessons, lessons[index + 1].id), false);
    progress = updateProgress(progress, lessons, { type: 'complete', lessonId: lesson.id, stepId: summary.id });
    assert.deepEqual(getScore(progress, lesson), { total: 15, correct: 15, firstTry: 15, attempts: 15 });
    assert.deepEqual(decodeProgress(JSON.stringify(progress), lessons), { progress, recovered: false });
  }
  assert.deepEqual(progress.completedLessons, lessons.map(entry => entry.id));
  assert.equal(Object.values(progress.lessons).reduce((count, lesson) => count + lesson.completedSteps.length, 0), 70);
});

test('all new sections support a wrong attempt, retry, refresh, mistake history and revisit', () => {
  let progress = emptyProgress();
  for (const entry of lessons.slice(0, 3)) progress = finish(progress, lessons, entry.lesson);
  for (const { lesson } of added) {
    for (const step of lesson.steps) {
      const base = { lessonId: lesson.id, stepId: step.id };
      if (step.type !== 'exercise') { progress = updateProgress(progress, lessons, { ...base, type: 'complete' }); continue; }
      const first = step.questions[0];
      const wrong = first.type === 'choice' ? first.options.find(option => !first.acceptedAnswers.includes(option)) : 'wrong answer';
      progress = updateProgress(progress, lessons, { ...base, type: 'answer', questionId: first.id, answer: wrong });
      assert.equal(progress.lessons[lesson.id].completedSteps.includes(step.id), false);
      assert.equal(updateProgress(progress, lessons, { ...base, type: 'complete' }), progress);
      progress = decodeProgress(JSON.stringify(progress), lessons).progress;
      progress = updateProgress(progress, lessons, { ...base, type: 'retry', questionId: first.id });
      assert.deepEqual(decodeProgress(JSON.stringify(progress), lessons), { progress, recovered: false });
      for (const question of step.questions) progress = updateProgress(progress, lessons, { ...base, type: 'answer', questionId: question.id, answer: question.acceptedAnswers.at(-1) });
      assert.equal(progress.lessons[lesson.id].answers[first.id].attempts.length, 2);
      assert.equal(progress.lessons[lesson.id].completedSteps.includes(step.id), true);
    }
    assert.deepEqual(getScore(progress, lesson), { total: 15, correct: 15, firstTry: 12, attempts: 18 });
    const before = progress.completedLessons;
    progress = updateProgress(progress, lessons, { type: 'visit', lessonId: lesson.id, stepId: 'theory' });
    assert.deepEqual(progress.completedLessons, before);
  }
});

test('new written negative tasks explicitly accept full forms and legitimate contractions', () => {
  const required = {
    'hh-car-negative': ['He does not have a car.', "He doesn't have a car."],
    'hh-phone-negative': ['I do not have a phone.', "I don't have a phone."],
    'art-known-orange': ['It is the orange.', "It's the orange."],
    'dem-car-negative': ['That is not a car.', "That isn't a car.", "That's not a car."],
    'dem-apples-negative': ['These are not apples.', "These aren't apples."],
    'there-desk-negative': ['There is not a desk in the room.', "There isn't a desk in the room.", "There's not a desk in the room."],
    'can-he-negative': ['He cannot swim.', "He can't swim.", 'He can not swim.'],
    'pc-he-negative': ['He is not reading a book.', "He isn't reading a book.", "He's not reading a book."],
    'pc-i-negative': ['I am not working now.', "I'm not working now."],
    'pc-run-now': ['He is running now.', "He's running now."],
    'past-home-negative': ['He was not at home yesterday.', "He wasn't at home yesterday."],
  };
  for (const [id, answers] of Object.entries(required)) assert.deepEqual(questions.find(question => question.id === id).acceptedAnswers, answers);
});

test('ten-lesson validation still rejects missing questions and IDs duplicated from earlier lessons', () => {
  const small = structuredClone(lessons);
  small[9].lesson.steps[4].questions.pop();
  assert.throws(() => validateCourse(small), /was-were\/sentence.*at least five/);
  const duplicate = structuredClone(lessons);
  duplicate[9].lesson.steps[2].questions[0].id = 'choose-am';
  assert.throws(() => validateCourse(duplicate), /was-were\/choice\/choose-am.*unique across the course/);
});
