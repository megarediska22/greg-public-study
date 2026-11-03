import { useEffect, useRef, useState } from 'react';
import type { Lesson, LessonStep } from '../../types/lesson';
import { useProgress } from '../../lib/ProgressContext';
import { getScore, questionSolved } from '../../lib/progress';
import { getMissingAnswers } from '../../lib/exercise';
import { gradeAnswer } from '../../lib/grading';
import { ExerciseQuestion } from './ExerciseQuestion';

type Exercise = Extract<LessonStep, { type: 'exercise' }>;
type CheckResult = { missing: string[] };

function focusQuestion(id: string) {
  const question = document.getElementById(`${id}-question`);
  question?.focus({ preventScroll: true });
  question?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

export function ExerciseStep({ lesson, step, reviewOnly = false }: { lesson: Lesson; step: Exercise; reviewOnly?: boolean }) {
  const { progress, dispatch } = useProgress();
  const saved = progress.lessons[lesson.id]?.answers ?? {};
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(
    step.questions.map(question => [question.id, saved[question.id]?.attempts.at(-1)?.answer ?? '']),
  ));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ id?: string } | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const score = getScore(progress, lesson, step);
  const complete = score.correct === score.total;
  const checked = score.attempts > 0;
  const filled = step.questions.filter(question => questionSolved(saved[question.id]) || drafts[question.id]?.trim()).length;
  const missing = result?.missing ?? [];
  const numbers = (ids: string[]) => ids.map(id => step.questions.findIndex(question => question.id === id) + 1).join(', ');

  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget.id) focusQuestion(focusTarget.id);
    else summaryRef.current?.focus({ preventScroll: true });
  }, [focusTarget]);

  return <>
    <span className="pill">{lesson.sample ? 'Демонстрационное упражнение' : 'Практика'}</span>
    <h2>{step.title}</h2>
    <p className="muted">Ответьте на все вопросы, затем нажмите «Проверить ответы» внизу. Верные ответы сохранятся — исправлять нужно только ошибки.</p>
    <div className="exercise-status"><span>{checked ? `Выполнено: ${score.correct} из ${score.total}` : `Заполнено: ${filled} из ${score.total}`}</span><span>{reviewOnly ? 'Дополнительное повторение. Прогресс урока сохранён.' : 'Следующий шаг откроется после всех верных ответов.'}</span></div>
    <form className="exercise-form" noValidate onSubmit={event => {
      event.preventDefault();
      if (complete) return;
      const unanswered = getMissingAnswers(step.questions, saved, drafts);
      if (unanswered.length) {
        setResult({ missing: unanswered });
        setFocusTarget({ id: unanswered[0] });
        return;
      }
      // Determine the focus target only on explicit submission, using the same
      // deterministic grader as the reducer. Draft edits never trigger grading.
      const firstIncorrect = step.questions.find(question => !questionSolved(saved[question.id]) && !gradeAnswer(question, drafts[question.id]));
      dispatch({ type: 'check-exercise', lessonId: lesson.id, stepId: step.id, answers: drafts });
      setResult({ missing: [] });
      setFocusTarget({ id: firstIncorrect?.id });
    }}>
      {step.questions.map((question, index) => <ExerciseQuestion
        key={question.id} question={question} index={index} value={drafts[question.id] ?? ''}
        saved={saved[question.id]} missing={missing.includes(question.id)}
        onChange={value => {
          setDrafts(previous => ({ ...previous, [question.id]: value }));
          // A field ceases to be missing when filled; this never grades it.
          if (value.trim() && missing.includes(question.id)) setResult(previous => previous ? { missing: previous.missing.filter(id => id !== question.id) } : null);
        }}
      />)}
      <div className="batch-actions">
        <div ref={summaryRef} className="batch-summary" role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>
          {missing.length ? <p>Заполните задания: {numbers(missing)}. Введённые ответы оставлены в полях; попытки не засчитаны.</p> : null}
          {checked && <><strong>{score.correct} из {score.total} правильно{complete ? ' — раздел завершён.' : '.'}</strong><p>{complete ? reviewOnly ? 'Повторение завершено. Можно вернуться к разбору.' : 'Теперь можно нажать «Продолжить».' : 'Исправьте отмеченные ответы и проверьте ещё раз.'}</p><small>С первой попытки: {score.firstTry}. Всего попыток: {score.attempts}.</small></>}
          {!checked && !missing.length && <p>Результат появится здесь после отправки всех ответов.</p>}
        </div>
        <button className="button button-primary batch-check" type="submit" disabled={complete}>Проверить ответы</button>
      </div>
    </form>
  </>;
}
