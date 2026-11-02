import type { Lesson, LessonStep } from '../../types/lesson';
import { useProgress } from '../../lib/ProgressContext';
import { getScore, isStepComplete } from '../../lib/progress';
import { ExerciseQuestion } from '../exercises/ExerciseQuestion';
import { Icon } from '../Icon';
import { lessons } from '../../content/course';

export function LessonContent({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
  const { progress } = useProgress();
  const score = getScore(progress, lesson, step.type === 'exercise' ? step : undefined);
  if (step.type === 'exercise') return <>
    <span className="pill">{lesson.sample ? 'Демонстрационное упражнение' : 'Практика'}</span><h2>{step.title}</h2>
    <p className="muted">Для перехода дальше ответьте верно на все вопросы. Число попыток не ограничено.</p>
    {step.questions.map((question, index) => <ExerciseQuestion key={question.id} question={question} lessonId={lesson.id} stepId={step.id} index={index} />)}
    <p className="field-hint" role="status">Результат раздела: {score.correct} из {score.total}. С первой попытки: {score.firstTry}. Всего попыток: {score.attempts}.</p>
  </>;
  if (step.type === 'theory') return <>
    <span className="pill">Короткая теория</span><h2>{step.heading}</h2>{step.text.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <div className="grammar-table-wrap"><table className="grammar-table"><caption>{step.tableCaption}</caption><thead><tr><th scope="col">Кто?</th><th scope="col">Форма</th><th scope="col">Пример</th></tr></thead><tbody>{step.rows.map(row => <tr key={`${row.subject}/${row.example}`}><th scope="row" lang="en">{row.subject}</th><td><strong lang="en">{row.form}</strong></td><td><span lang="en">{row.example}</span><small>{row.translation}</small></td></tr>)}</tbody></table></div>
    <aside className="rule-note"><strong>{step.noteTitle}</strong><p>{step.note}</p></aside>
  </>;
  if (step.type === 'review') {
    const questions = lesson.steps.flatMap(item => item.type === 'exercise' ? item.questions.map(question => ({ question, stepId: item.id })) : []);
    const mistakes = questions.filter(({ question }) => progress.lessons[lesson.id]?.answers[question.id]?.attempts.some(attempt => !attempt.correct));
    return <><span className="pill">Разбор практики</span><h2>Закрепим то, что узнали.</h2><p>Исправленные ошибки остаются в истории. Пройденные разделы доступны для повторения.</p>
      {mistakes.length ? mistakes.map(({ question, stepId }) => <article className="exercise-card" key={question.id}><h3 lang="en">{question.prompt}</h3><p>Ваши неверные ответы: <span lang="en">{progress.lessons[lesson.id].answers[question.id].attempts.filter(attempt => !attempt.correct).map(attempt => attempt.answer).join(' · ')}</span></p><p>Образец ответа: <span lang="en">{question.acceptedAnswers[0]}</span></p><p>{question.explanation}</p><a className="text-link" href={`#/lesson/${lesson.id}/${stepId}`}>Повторить раздел <Icon name="arrow" /></a></article>) : <div className="empty-state"><Icon name="check" /><h3>Все ответы с первой попытки</h3><p>Ошибок нет. Можно перейти к итогам.</p></div>}
    </>;
  }
  if (step.type === 'summary') {
    const complete = isStepComplete(progress, lesson.id, step.id);
    const hasNext = lessons.findIndex(entry => entry.id === lesson.id) < lessons.length - 1;
    return <><span className="pill">{lesson.sample ? 'Итоги демонстрационного урока' : 'Итоги урока'}</span><h2>{complete ? 'Урок пройден.' : 'Практика завершена.'}</h2>{lesson.sample && <p>Это результаты короткого примера второго этапа. Они не означают завершение полной программы A1.</p>}
      <div className="summary-grid"><div><span>Верные ответы</span><strong>{score.correct} / {score.total}</strong><small>С первой попытки: {score.firstTry} / {score.total}. Всего попыток: {score.attempts}.</small></div><div><span>Статус урока</span><strong className="summary-status">{complete ? 'Завершён' : 'Готов к завершению'}</strong><small>{complete ? hasNext ? 'Следующий урок разблокирован.' : `Все уроки курса A1 завершены: ${progress.completedLessons.length} из ${lessons.length}.` : hasNext ? 'Нажмите «Завершить урок», чтобы открыть следующий.' : 'Нажмите «Завершить урок», чтобы завершить курс A1.'}</small></div></div>
      <h3>Теперь вы умеете</h3><ul className="objective-list">{lesson.objectives.map(objective => <li key={objective}><Icon name="check" />{objective}</li>)}</ul>
    </>;
  }
  return <><span className="pill pill-accent">{lesson.sample ? 'Демонстрационный урок' : 'Знакомство с уроком'}</span><h2>{step.heading}</h2><p>{step.text}</p><div className="intro-example"><span lang="en">{step.example}</span><small>{step.translation}</small></div><h3>Что будет в уроке</h3><ul className="objective-list">{lesson.objectives.map(objective => <li key={objective}><Icon name="check" />{objective}</li>)}</ul></>;
}
