import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { lessons, questionCount } from '../src/content/historicalCourse.ts';
import { questionTasks } from '../src/content/questionTasks.ts';
import { gradeAnswer, normalizeAnswer } from '../src/lib/grading.ts';
import { emptyProgress, decodeProgress, getScore, isLessonUnlocked, isStepUnlocked, PROGRESS_KEY, updateProgress } from '../src/lib/progress.ts';
import { openProgressSession } from '../src/lib/progressStorage.ts';
import { validateTaskIndicators } from '../src/lib/taskIndicators.ts';
import { createQaProgress, restoreQaProgress, saveQaProgress, QA_PROGRESS_KEY } from '../src/dev/qaState.ts';
import { validateCourse } from '../src/lib/validation.ts';
import { applyStep, correctAnswers, legacyFixtures, stepAction, wrongAnswer } from '../scripts/curriculum-pilot-fixtures.mjs';

const published = lessons.slice(0, 21);
const pilot = lessons.slice(21);
const pilotIds = ['hours-and-signs', 'directions-on-foot', 'bus-schedules', 'name-and-contact', 'store-prices-and-payment'];
const questionsFor = course => course.flatMap(({ lesson }) => lesson.steps.flatMap(step => step.type === 'exercise' ? step.questions : []));
const hash = value => createHash('sha256').update(value).digest('hex');
const answerHash = progress => hash(JSON.stringify(Object.entries(progress.lessons).map(([id, record]) => [id, record.answers])));

test('the pilot extends the published catalog and authored task indicators without altering their data', () => {
  assert.deepEqual(pilot.map(entry => entry.id), pilotIds);
  assert.equal(lessons.length, 26);
  assert.equal(lessons.flatMap(entry => entry.lesson.steps).length, 182);
  assert.equal(questionCount, 555);
  assert.equal(new Set(lessons.map(entry => entry.id)).size, 26);
  assert.equal(new Set(questionsFor(lessons).map(question => question.id)).size, 555);
  assert.equal(hash(JSON.stringify(published)), '4dc7261c6d9b843b37d41e9cb1b70694bee708f2c7feb01a21c11d92f72778b4');
  const oldTasks = questionsFor(published).map(question => [question.id, questionTasks[question.id]]);
  assert.equal(hash(JSON.stringify(oldTasks)), '1b6fb94b026e9b802512971fa833926253302816faa91020005c6cafb6b9e311');
  assert.deepEqual(Object.keys(questionTasks).sort(), questionsFor(lessons).map(question => question.id).sort());
  assert.equal(validateTaskIndicators(lessons, questionTasks), 555);
  assert.doesNotThrow(() => validateCourse(lessons));
});

test('each pilot lesson has clean scoped IDs, three five-question exercises, original prompts, and usable keys', () => {
  const normalizePrompt = question => normalizeAnswer(question.prompt, { ignoreTerminalPunctuation: true });
  const prompts = new Set(questionsFor(published).map(normalizePrompt));
  for (const { id, lesson } of pilot) {
    assert.equal(lesson.id, id);
    assert.equal(lesson.level, 'A1');
    assert.equal(lesson.steps.length, 7);
    assert.deepEqual(lesson.steps.map(step => step.id), ['intro', 'theory', 'choice', 'blank', 'written', 'review', 'summary']);
    assert.equal(new Set(lesson.steps.map(step => step.id)).size, 7);
    assert.equal(lesson.steps[0].type, 'intro');
    assert.deepEqual(lesson.steps.slice(-2).map(step => step.type), ['review', 'summary']);
    const exercises = lesson.steps.filter(step => step.type === 'exercise');
    assert.equal(exercises.length, 3);
    for (const [index, type] of ['choice', 'blank', 'written'].entries()) {
      const { questions } = exercises[index];
      assert.equal(questions.length, 5);
      for (const question of questions) {
        assert.equal(question.type, type, question.id);
        assert.ok(questionTasks[question.id], question.id);
        assert.ok(question.prompt.trim() && question.acceptedAnswers.length, question.id);
        const prompt = normalizePrompt(question);
        assert.ok(!prompts.has(prompt), `${question.id}: repeated prompt ${question.prompt}`);
        prompts.add(prompt);
        for (const answer of question.acceptedAnswers) assert.ok(gradeAnswer(question, answer), question.id);
        assert.equal(gradeAnswer(question, ''), false, question.id);
        assert.equal(gradeAnswer(question, wrongAnswer(question)), false, question.id);
        if (type === 'choice') {
          assert.equal(new Set(question.options.map(option => normalizeAnswer(option))).size, question.options.length, question.id);
          assert.equal(question.options.filter(option => gradeAnswer(question, option)).length, 1, question.id);
        }
      }
    }
  }
});

test('published complete and partial progress restore byte-for-byte without access or answer regressions', () => {
  const fixtures = legacyFixtures(published);
  const expectations = {
    completed: [21, 'summary', '875a9f2827958063af414fe91aad12a58f45feb6ddc628a0788482467f516d09', 'efd12e7191bc386b314a2b82c9fc7bcc06c5c163d89d79037827f9ea695eb9cb'],
    partial: [20, 'choice', 'de9eeee1a638cc4dafe800e03d77eb53e5d17e695de0aab0ddf333952f1d10f1', '4cc9763cc1547ff153d5b47cb976a91a2ad3e4118f99f908fe184afbfad928f4'],
  };
  for (const [label, progress] of Object.entries(fixtures)) {
    const [completed, stepId, rawHash, answersHash] = expectations[label];
    const raw = JSON.stringify(progress, null, 2);
    assert.equal(hash(raw), rawHash);
    const values = new Map([[PROGRESS_KEY, raw], ['gps.theme.v1', 'dark']]);
    const writes = [];
    const session = openProgressSession({
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { writes.push(key); values.set(key, value); },
    }, lessons);
    assert.equal(session.recovered, false);
    assert.deepEqual(session.progress, progress);
    assert.equal(session.progress.completedLessons.length, completed);
    assert.deepEqual(session.progress.lastVisited, { lessonId: 'small-talk-basics', stepId });
    assert.equal(answerHash(session.progress), answersHash);
    assert.deepEqual(published.map(entry => isLessonUnlocked(session.progress, lessons, entry.id)),
      published.map(entry => isLessonUnlocked(progress, published, entry.id)));
    assert.deepEqual(pilotIds.map(id => isLessonUnlocked(session.progress, lessons, id)),
      [label === 'completed', false, false, false, false]);
    assert.equal(session.persist(session.progress), 'unchanged');
    assert.deepEqual(writes, []);
    assert.equal(values.get(PROGRESS_KEY), raw);
    assert.equal(values.get('gps.theme.v1'), 'dark');
  }
});

test('all pilot lessons preserve hard locks, batch retry, reload, and summary progression', () => {
  let { completed: progress } = legacyFixtures(published);
  for (const [index, { lesson }] of pilot.entries()) {
    assert.deepEqual(pilotIds.map(id => isLessonUnlocked(progress, lessons, id)),
      pilotIds.map((_, position) => position <= index));
    assert.equal(isStepUnlocked(progress, lesson, lesson.steps[1].id), false);
    for (const step of lesson.steps) {
      if (step.type !== 'exercise') {
        progress = applyStep(progress, lessons, lesson, step);
        continue;
      }
      const [first, second] = step.questions;
      const action = stepAction('check-exercise', lesson, step);
      assert.equal(updateProgress(progress, lessons, { ...action, answers: { [first.id]: first.acceptedAnswers[0] } }), progress);
      const answers = correctAnswers(step);
      answers[first.id] = wrongAnswer(first);
      progress = updateProgress(progress, lessons, { ...action, answers });
      assert.equal(getScore(progress, lesson, step).correct, 4);
      const following = lesson.steps[lesson.steps.indexOf(step) + 1];
      assert.equal(isStepUnlocked(progress, lesson, following.id), false);
      const session = openProgressSession({ getItem: () => JSON.stringify(progress), setItem: () => assert.fail('reload writes storage') }, lessons);
      assert.deepEqual(session.progress, progress);
      const solved = session.progress.lessons[lesson.id].answers[second.id];
      progress = updateProgress(session.progress, lessons, { ...action, answers: { [first.id]: first.acceptedAnswers[0], [second.id]: wrongAnswer(second) } });
      assert.deepEqual(progress.lessons[lesson.id].answers[second.id], solved);
      assert.equal(progress.lessons[lesson.id].answers[first.id].attempts.length, 2);
      assert.equal(getScore(progress, lesson, step).correct, 5);
      assert.equal(isStepUnlocked(progress, lesson, following.id), true);
      if (pilotIds[index + 1]) assert.equal(isLessonUnlocked(progress, lessons, pilotIds[index + 1]), false);
    }
    assert.equal(progress.completedLessons.includes(lesson.id), true);
    assert.deepEqual(getScore(progress, lesson), { total: 15, correct: 15, firstTry: 12, attempts: 18 });
  }
  assert.deepEqual(progress.completedLessons, lessons.map(entry => entry.id));
});

// Independent surface strings from the final pedagogical acceptance crosswalk.
// Do not generate these expectations from authored keys or normalization output.
test('reviewed pilot responses preserve time, route, transit, exact phone and payment meaning', () => {
  const byId = new Map(questionsFor(pilot).map(question => [question.id, question]));
  const cases = [
    ['hours-and-signs-exit-opening-reply', ['It opens at 11 a.m.', 'It opens at 11:00 AM.'], ['It opens at 11 p.m.', 'It opens at 3 p.m.']],
    ['directions-on-foot-oak-two-moves', ['Go straight ahead for 1 block, and then turn left at the corner.'], ['Turn left at the corner and then go straight one block.', 'Go straight one block and then turn right at the corner.']],
    ['directions-on-foot-exit-second-move', ['Turn right at the corner.'], ['Turn left at the corner.', 'Go straight one block.']],
    ['bus-schedules-exit-route', ['14'], ['12', '8:55 a.m.']],
    ['bus-schedules-exit-arrival', ['It gets to the park at 9:10 a.m.', 'It gets to the park at 9:10 AM.'], ['It gets to the park at 8:55 a.m.', 'It gets to the library at 9:10 a.m.']],
    ['name-and-contact-exit-phone', ['202-555-0168', '(202) 555-0168', '2025550168'], ['202-555-0169', '202-555-0142', '202-555-0168.']],
    ['store-prices-and-payment-exit-payment-method', ['Cash and cards'], ['Cash only', 'Card only']],
    ['store-prices-and-payment-retrieve-cash-request', ['Can I pay in cash?', 'Can I pay with cash?'], ['Can I pay by card?', 'Can I pay by cash?']],
    ['store-prices-and-payment-exit-card-question', ['Can I pay by card?', 'Can I pay with a card?'], ['Can I pay in cash?', 'Can I pay with card?']],
  ];
  for (const [id, correct, wrong] of cases) {
    const question = byId.get(id);
    assert.ok(question, id);
    for (const answer of correct) assert.equal(gradeAnswer(question, answer), true, `${id}: ${answer}`);
    for (const answer of wrong) assert.equal(gradeAnswer(question, answer), false, `${id}: ${answer}`);
  }
});

test('pilot access is synthetic only in isolated QA and cannot enter fresh production progress', () => {
  const normal = emptyProgress();
  const qa = createQaProgress(lessons);
  assert.equal(qa.completedLessons.length, 26);
  for (const { lesson } of pilot) {
    assert.equal(isLessonUnlocked(normal, lessons, lesson.id), false);
    const action = { type: 'complete', lessonId: lesson.id, stepId: 'intro' };
    assert.equal(updateProgress(normal, lessons, action), normal);
    assert.equal(isLessonUnlocked(qa, lessons, lesson.id), true);
    for (const step of lesson.steps) assert.equal(isStepUnlocked(qa, lesson, step.id), true);
    assert.equal(getScore(qa, lesson).attempts, 0);
  }
  const values = new Map([[PROGRESS_KEY, JSON.stringify(normal)], ['gps.theme.v1', 'dark']]);
  const writes = [];
  assert.equal(saveQaProgress({ setItem: (key, value) => { writes.push(key); values.set(key, value); } }, qa), true);
  assert.deepEqual(writes, [QA_PROGRESS_KEY]);
  assert.equal(values.get(PROGRESS_KEY), JSON.stringify(normal));
  assert.equal(values.get('gps.theme.v1'), 'dark');
  assert.deepEqual(restoreQaProgress(values.get(QA_PROGRESS_KEY), lessons), qa);
  const intake = decodeProgress(values.get(QA_PROGRESS_KEY), lessons).progress;
  assert.deepEqual(intake.completedLessons, []);
  for (const { id } of pilot) assert.equal(isLessonUnlocked(intake, lessons, id), false);
});
