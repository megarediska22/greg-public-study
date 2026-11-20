import { emptyProgress, updateProgress } from '../src/lib/progress.ts';

export const stepAction = (type, lesson, step) => ({ type, lessonId: lesson.id, stepId: step.id });
export const correctAnswers = step => Object.fromEntries(step.questions.map(question => [question.id, question.acceptedAnswers[0]]));
export const wrongAnswer = question => question.type === 'choice' ? question.options.find(option => !question.acceptedAnswers.includes(option)) : 'incorrect answer for this question';

export function applyStep(progress, course, lesson, step) {
  if (step.type !== 'exercise') return updateProgress(progress, course, stepAction('complete', lesson, step));
  return updateProgress(progress, course, { ...stepAction('check-exercise', lesson, step), answers: correctAnswers(step) });
}

export function legacyFixtures(published) {
  let progress = emptyProgress();
  let partial;
  for (const { lesson } of published) {
    for (const step of lesson.steps) {
      if (lesson.id === 'small-talk-basics' && step === lesson.steps[2]) {
        const answers = correctAnswers(step);
        answers[step.questions[0].id] = wrongAnswer(step.questions[0]);
        partial = updateProgress(progress, published, { ...stepAction('check-exercise', lesson, step), answers });
        partial = updateProgress(partial, published, stepAction('visit', lesson, step));
      }
      progress = applyStep(progress, published, lesson, step);
    }
  }
  const last = published.at(-1).lesson;
  const completed = updateProgress(progress, published, stepAction('visit', last, last.steps.at(-1)));
  return { completed, partial };
}
