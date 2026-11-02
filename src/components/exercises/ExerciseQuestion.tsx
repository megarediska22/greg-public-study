import { useEffect, useRef, useState } from 'react';
import type { Question } from '../../types/lesson';
import { useProgress } from '../../lib/ProgressContext';
import { questionSolved } from '../../lib/progress';

export function ExerciseQuestion({ question, lessonId, stepId, index }: { question: Question; lessonId: string; stepId: string; index: number }) {
  const { progress, dispatch } = useProgress();
  const saved = progress.lessons[lessonId]?.answers[question.id];
  const last = saved?.attempts.at(-1);
  const solved = questionSolved(saved);
  const checked = !!last && !saved?.retrying;
  const [value, setValue] = useState(saved?.retrying ? '' : last?.answer ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const previousAttempts = useRef(saved?.attempts.length ?? 0);
  const count = saved?.attempts.length ?? 0;
  const feedbackId = `${question.id}-feedback`;
  useEffect(() => {
    if (count > previousAttempts.current) feedbackRef.current?.focus();
    previousAttempts.current = count;
  }, [count]);
  useEffect(() => { if (saved?.retrying) inputRef.current?.focus(); }, [saved?.retrying]);

  return <form onSubmit={event => {
    event.preventDefault();
    dispatch({ type: 'answer', lessonId, stepId, questionId: question.id, answer: value });
  }}>
    <fieldset className="exercise-card" disabled={checked} aria-describedby={checked ? feedbackId : undefined}>
      <legend>Вопрос {index + 1} · {question.instruction}</legend>
      <p className="exercise-prompt" lang="en">{question.prompt}</p>
      {question.type === 'choice' ? <div className="choice-options">{question.options.map((option, optionIndex) =>
        <label className={`choice-option ${value === option ? 'selected' : ''}`} key={option}>
          <input ref={optionIndex === 0 ? inputRef : undefined} type="radio" name={question.id} value={option} checked={value === option} required onChange={() => setValue(option)} />
          <span lang="en">{option}</span>
        </label>)}</div> : <label className="answer-label">Ваш ответ
          <input ref={inputRef} className="answer-input" type="text" lang="en" value={value} onChange={event => setValue(event.target.value)} placeholder={question.placeholder} required maxLength={2000} autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={checked && !solved ? true : undefined} aria-describedby={checked ? feedbackId : undefined} />
        </label>}
    </fieldset>
    {!checked && <button className="button button-primary" type="submit" disabled={!value.trim()}>Проверить ответ</button>}
    <div ref={feedbackRef} id={feedbackId} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1} className={checked ? `answer-feedback ${solved ? 'is-correct' : 'is-incorrect'}` : 'retry-feedback'}>
      {checked ? <><strong>{solved ? '✓ Верно' : 'Попробуйте ещё раз'}</strong><p>{question.explanation}</p><p>Образец ответа: <span lang="en">{question.acceptedAnswers[0]}</span></p><small>Попыток: {count}</small></> : saved?.retrying ? 'Новая попытка. Предыдущий результат сохранён в истории.' : null}
    </div>
    {checked && !solved && <button className="button button-secondary" type="button" onClick={() => {
      setValue('');
      dispatch({ type: 'retry', lessonId, stepId, questionId: question.id });
    }}>Попробовать снова</button>}
  </form>;
}
