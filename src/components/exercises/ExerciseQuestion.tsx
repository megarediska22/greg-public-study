import type { Question } from '../../types/lesson';
import type { QuestionProgress } from '../../lib/progress';
import { getQuestionState } from '../../lib/exercise';
import { TaskIndicator } from './TaskIndicator';

type Props = {
  question: Question;
  index: number;
  value: string;
  saved?: QuestionProgress;
  missing: boolean;
  onChange: (value: string) => void;
};

/** Controlled question: checking and focus are owned by the exercise group. */
export function ExerciseQuestion({ question, index, value, saved, missing, onChange }: Props) {
  const { locked, feedback, edited } = getQuestionState(saved, value);
  const feedbackId = `${question.id}-feedback`;
  const instructionId = `${question.id}-instruction`;
  const missingId = `${question.id}-missing`;
  const descriptionIds = [`${question.id}-task`, instructionId, feedback ? feedbackId : '', missing ? missingId : ''].filter(Boolean).join(' ');
  const answerLabel = question.type !== 'written' ? question.vocabularyId ? 'Ваш ответ — слово или выражение' : 'Ваш ответ — пропущенные слова'
    : question.sentenceType === 'short-affirmative' || question.sentenceType === 'short-negative'
      ? 'Ваш короткий ответ' : question.vocabularyId ? 'Ваш ответ — фраза целиком' : 'Ваш ответ — предложение целиком';
  const invalid = missing || feedback === 'incorrect';

  return <div className={`question-card ${feedback ? `question-${feedback}` : ''} ${missing ? 'question-missing' : ''}`}>
    <fieldset id={`${question.id}-question`} className="exercise-card" disabled={locked} tabIndex={-1} aria-describedby={descriptionIds} aria-invalid={invalid || undefined}>
      <legend>Задание {index + 1}{feedback ? locked ? ' · ✓ Верно' : ' · ✕ Исправьте ответ' : ''}</legend>
      <TaskIndicator questionId={question.id} />
      <p id={instructionId} className="question-instruction">{question.instruction}</p>
      <p className="exercise-prompt" lang={question.promptLanguage ?? 'en'}>{question.prompt}</p>
      {question.type === 'choice' ? <div className="choice-options">{question.options.map(option =>
        <label className={`choice-option ${value === option ? 'selected' : ''}`} key={option}>
          <input type="radio" name={question.id} value={option} checked={value === option} required onChange={() => onChange(option)} aria-describedby={descriptionIds} aria-invalid={invalid || undefined} />
          <span lang={question.optionsLanguage ?? 'en'}>{option}</span>
        </label>)}</div> : <label className="answer-label">{answerLabel}
          <input className="answer-input" type="text" lang="en" value={value} onChange={event => onChange(event.target.value)} placeholder={question.placeholder} required maxLength={2000} enterKeyHint="done" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={invalid || undefined} aria-describedby={descriptionIds} />
        </label>}
      {missing && <p id={missingId} className="missing-answer">Ответьте на это задание. Попытка не засчитана.</p>}
    </fieldset>
    {feedback && <div id={feedbackId} className={`answer-feedback ${locked ? 'is-correct' : 'is-incorrect'}`}>
      <strong>{locked ? '✓ Верно' : '✕ Пока неверно'}</strong>
      {edited && !locked && <p>Ответ изменён. Нажмите «Проверить ответы», чтобы проверить исправление.</p>}
      <p>{question.explanation}</p><p>Образец ответа: <span lang={question.type === 'choice' ? question.optionsLanguage ?? 'en' : 'en'}>{question.acceptedAnswers[0]}</span></p>
      <small>Попыток: {saved?.attempts.length ?? 0}</small>
    </div>}
  </div>;
}
