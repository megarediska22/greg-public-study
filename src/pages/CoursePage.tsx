import { formatLessonCount } from '../lib/format';
import { lessons, questionCount } from '../content/course';
import { Icon } from '../components/Icon';
import { LinkButton } from '../components/LinkButton';
import { useProgress } from '../lib/ProgressContext';
import { isLessonUnlocked, resumeStep } from '../lib/progress';
import { ResetProgress } from '../components/lessons/ResetProgress';

export function CoursePage() {
  const { progress } = useProgress();
  return <div className="course-page">
    <a className="back-link" href="#/"><Icon name="back" /> На главную</a>
    <div className="course-heading"><div><span className="pill pill-accent">A1 · Начальный уровень</span><h1>Большой путь<br />с простых фраз.</h1><p className="lead">Грамматика и полезные слова чередуются: от первых фраз с to be до действий сейчас и рассказов о прошлом.</p></div><div className="course-stamp"><strong>A1</strong><span>Начните здесь</span></div></div>
    <div className="course-meta"><span><Icon name="book" /> {formatLessonCount(lessons.length)} · {questionCount} вопросов</span><span>Теория → практика → разбор</span><span>Без регистрации</span></div>
    <aside className="notice"><strong>Завершено уроков: {progress.completedLessons.length} из {lessons.length}.</strong><p>{progress.completedLessons.length === lessons.length ? 'Курс A1 завершён. Все уроки доступны для повторения.' : 'Начните с глагола to be. Следующий урок откроется после практики, разбора ошибок и завершения предыдущего.'}</p></aside>
    {progress.legacyUnlockedLessons?.length ? <aside className="notice"><strong>Ваш прежний прогресс сохранён.</strong><p>Ранее открытые грамматические уроки остаются доступны. Новые словарные уроки нужно пройти отдельно; для дальнейшего движения по новой программе заполните эти пробелы.</p></aside> : null}
    <section aria-labelledby="program-title"><div className="section-heading"><h2 id="program-title">Программа курса</h2><span className="muted">Уроки идут по порядку</span></div>
      <div className="lesson-list">{lessons.map((entry, i) => {
        const unlocked = isLessonUnlocked(progress, lessons, entry.id);
        const complete = progress.completedLessons.includes(entry.id);
        const count = progress.lessons[entry.id]?.completedSteps.length ?? 0;
        const started = count > 0 || progress.lastVisited?.lessonId === entry.id;
        return <article className={`lesson-card ${unlocked ? 'available' : ''}`} key={entry.id}><span className="lesson-number">{String(i + 1).padStart(2, '0')}</span><div className="lesson-card-content"><span className="lesson-status">{complete ? 'Завершён · можно повторить' : !unlocked ? 'Заблокирован' : started ? 'В процессе' : 'Доступен'}</span><span className="lesson-kind">{entry.lesson?.kind === 'vocabulary' ? 'Словарь' : 'Грамматика'}</span><h3>{entry.title}</h3><p className="lesson-subtitle">{entry.subtitle}</p><p>{entry.objective}</p>{entry.lesson && <div className="course-lesson-progress"><small>{count} из {entry.lesson.steps.length} шагов</small><progress value={count} max={entry.lesson.steps.length} aria-label={`${entry.title}: ${count} из ${entry.lesson.steps.length} шагов`} /></div>}</div><div className="lesson-card-action">{unlocked ? <LinkButton href={`#/lesson/${entry.id}/${entry.lesson ? resumeStep(progress, entry.lesson) : 'intro'}`}>{complete ? 'Повторить' : started ? 'Продолжить' : 'Открыть'} <Icon name="arrow" /></LinkButton> : <span className="locked-label"><Icon name="lock" /> После урока {i}</span>}</div></article>;
      })}</div>
    </section>
    <p className="course-footnote">Прогресс хранится только в этом браузере и не синхронизируется между устройствами. Следующий урок открывается после завершения предыдущего.</p>
    <ResetProgress />
  </div>;
}
