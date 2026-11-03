import type { Lesson, LessonStep } from '../../types/lesson';
import { useProgress } from '../../lib/ProgressContext';
import { getScore, isStepComplete } from '../../lib/progress';
import { ExerciseStep } from '../exercises/ExerciseStep';
import { Icon } from '../Icon';
import { VocabularyReview } from './VocabularyReview';
import { VocabularyDiscovery } from './VocabularyDiscovery';
import { lessons } from '../../content/course';

export function LessonContent({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
  const { progress } = useProgress();
  const score = getScore(progress, lesson, step.type === 'exercise' ? step : undefined);
  if (step.type === 'exercise') return <ExerciseStep lesson={lesson} step={step} />;
  if (step.type === 'vocabulary') return <VocabularyDiscovery {...step} />;
  if (step.type === 'theory') return <div className="theory-content">
    <span className="pill">Короткая теория</span><h2>{step.heading}</h2>{step.text.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <div className="grammar-table-wrap"><table className="grammar-table"><caption>{step.tableCaption}</caption><thead><tr><th scope="col">Кто?</th><th scope="col">Форма</th><th scope="col">Пример</th></tr></thead><tbody>{step.rows.map(row => <tr key={`${row.subject}/${row.example}`}><th scope="row"><span lang="en">{row.subject}</span>{row.subjectTranslation && <small>{row.subjectTranslation}</small>}</th><td><strong lang="en">{row.form}</strong></td><td><span lang="en">{row.example}</span><small>{row.translation}</small></td></tr>)}</tbody></table></div>
    {step.blocks?.map(block => <section className="theory-block" key={block.title}>
      <h3>{block.title}</h3><p>{block.text}</p>
      {block.formula && <p className="theory-formula"><strong>{block.formula}</strong></p>}
      {block.example && <div className="theory-example"><p lang="en">{block.example}</p><p>{block.translation}</p></div>}
    </section>)}
    <aside className="rule-note"><strong>{step.noteTitle}</strong><p>{step.note}</p></aside>
  </div>;
  if (step.type === 'review') {
    const questions = lesson.steps.flatMap(item => item.type === 'exercise' ? item.questions.map(question => ({ question, stepId: item.id })) : []);
    const mistakes = questions.filter(({ question }) => progress.lessons[lesson.id]?.answers[question.id]?.attempts.some(attempt => !attempt.correct));
    const wordIds = [...new Set(mistakes.flatMap(({ question }) => question.vocabularyId ? [question.vocabularyId] : []))];
    const review = <><span className="pill">Разбор практики</span><h2>Закрепим то, что узнали.</h2><p>Исправленные ошибки остаются в истории. Пройденные разделы доступны для повторения.</p>
      {mistakes.length ? mistakes.map(({ question, stepId }) => <article className="exercise-card" key={question.id}><h3 lang={question.promptLanguage ?? 'en'}>{question.prompt}</h3><p>Ваши неверные ответы: <span lang={question.type === 'choice' ? question.optionsLanguage ?? 'en' : 'en'}>{progress.lessons[lesson.id].answers[question.id].attempts.filter(attempt => !attempt.correct).map(attempt => attempt.answer).join(' · ')}</span></p><p>Образец ответа: <span lang={question.type === 'choice' ? question.optionsLanguage ?? 'en' : 'en'}>{question.acceptedAnswers[0]}</span></p><p>{question.explanation}</p><a className="text-link" href={`#/lesson/${lesson.id}/${stepId}`}>Повторить раздел <Icon name="arrow" /></a></article>) : <div className="empty-state"><Icon name="check" /><h3>Все ответы с первой попытки</h3><p>Ошибок нет. Можно перейти к итогам.</p></div>}
    </>;
    return lesson.kind === 'vocabulary' ? <VocabularyReview lesson={lesson} wordIds={wordIds}>{review}</VocabularyReview> : review;
  }
  if (step.type === 'summary') {
    const complete = isStepComplete(progress, lesson.id, step.id);
    const hasNext = lessons.findIndex(entry => entry.id === lesson.id) < lessons.length - 1;
    return <><span className="pill">{lesson.sample ? 'Итоги демонстрационного урока' : 'Итоги урока'}</span><h2>{complete ? 'Урок пройден.' : 'Практика завершена.'}</h2>{lesson.sample && <p>Это результаты короткого примера второго этапа. Они не означают завершение полной программы A1.</p>}
      <div className="summary-grid"><div><span>Верные ответы</span><strong>{score.correct} / {score.total}</strong><small>С первой попытки: {score.firstTry} / {score.total}. Всего попыток: {score.attempts}.</small></div><div><span>Статус урока</span><strong className="summary-status">{complete ? 'Завершён' : 'Готов к завершению'}</strong><small>{complete ? hasNext ? 'Завершение сохранено. Доступные уроки — в программе курса.' : `Завершено уроков A1: ${progress.completedLessons.length} из ${lessons.length}. Проверьте программу курса.` : hasNext ? 'Нажмите «Завершить урок», чтобы открыть следующий.' : 'Нажмите «Завершить урок», чтобы завершить курс A1.'}</small></div></div>
      {lesson.kind === 'vocabulary' && <><h3>Ваш словарный запас этого урока</h3><p className="word-summary" lang="en">{lesson.steps.flatMap(item => item.type === 'vocabulary' ? item.items.map(word => word.term) : []).join(' · ')}</p><p>Узнавание: {getScore(progress, lesson, lesson.steps[2]).correct} / 10. Написание: {getScore(progress, lesson, lesson.steps[3]).correct} / 10. Фразы: {getScore(progress, lesson, lesson.steps[4]).correct} / 10. Слова из разбора ошибок стоит ещё раз написать по памяти.</p></>}
      <h3>Теперь вы умеете</h3><ul className="objective-list">{lesson.objectives.map(objective => <li key={objective}><Icon name="check" />{objective}</li>)}</ul>
    </>;
  }
  return <><span className="pill pill-accent">{lesson.sample ? 'Демонстрационный урок' : 'Знакомство с уроком'}</span><h2>{step.heading}</h2><p>{step.text}</p><div className="intro-example"><span lang="en">{step.example}</span><small>{step.translation}</small></div><h3>Что будет в уроке</h3><ul className="objective-list">{lesson.objectives.map(objective => <li key={objective}><Icon name="check" />{objective}</li>)}</ul></>;
}
