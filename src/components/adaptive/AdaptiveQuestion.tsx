import { useEffect, useRef, useState } from 'react';
import type { Question } from '../../types/lesson';

export type Prompt = Pick<Question, 'id' | 'type' | 'instruction' | 'prompt' | 'promptLanguage' | 'optionsLanguage'> & { options?: readonly string[] };
export type Response = { type: 'answer'; answer: string } | { type: 'unknown' | 'skip' };

export function AdaptiveQuestion({ prompt, busy, onAnswer, focus }: {
  prompt: Prompt; busy: boolean; onAnswer: (answer: Response) => void; focus: boolean;
}) {
  const [answer, setAnswer] = useState('');
  const field = useRef<HTMLFieldSetElement>(null);
  useEffect(() => { if (focus) field.current?.focus(); }, [focus]);
  return <form onSubmit={event => {
    event.preventDefault();
    if (answer.trim() && !busy) onAnswer({ type: 'answer', answer });
  }}>
    <fieldset className="exercise-card" ref={field} tabIndex={-1} disabled={busy} aria-describedby="adaptive-prompt">
      <legend>{prompt.instruction}</legend>
      <p className="exercise-prompt" id="adaptive-prompt" lang={prompt.promptLanguage ?? (/[а-яё]/i.test(prompt.prompt) ? 'ru' : 'en')}>{prompt.prompt}</p>
      {prompt.type === 'choice' ? <div className="choice-options">{prompt.options?.map(option =>
        <label className={`choice-option ${answer === option ? 'selected' : ''}`} key={option}>
          <input type="radio" name={prompt.id} value={option} checked={answer === option} onChange={() => setAnswer(option)} />
          <span lang={prompt.optionsLanguage ?? (/[а-яё]/i.test(option) ? 'ru' : 'en')}>{option}</span>
        </label>)}</div> : <label className="answer-label">Ваш ответ
        <input className="answer-input" type="text" lang="en" value={answer} maxLength={2000} autoComplete="off"
          autoCapitalize="none" spellCheck={false} enterKeyHint="send" onChange={event => setAnswer(event.target.value)} />
      </label>}
      <div className="adaptive-actions">
        <button className="button button-primary" type="submit" disabled={!answer.trim()}>Ответить</button>
        <button className="button button-secondary" type="button" onClick={() => onAnswer({ type: 'unknown' })}>Не знаю</button>
        <button className="button button-secondary" type="button" onClick={() => onAnswer({ type: 'skip' })}>Пропустить</button>
      </div>
    </fieldset>
  </form>;
}
