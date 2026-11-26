import { useState } from 'react';
import { useAdaptive } from '../components/adaptive/AdaptiveContext';
import { formatLessonCount } from '../lib/format';
import { lessons, questionCount } from '../content/course';
import { extensionStepIds } from '../content/extension/adaptUnit';
import { Icon } from '../components/Icon';
import { LinkButton } from '../components/LinkButton';
import { useProgress } from '../lib/ProgressContext';
import { isLessonUnlocked, requiredSteps, resumeStep } from '../lib/progress';
import { ResetProgress } from '../components/lessons/ResetProgress';

const core = lessons.filter(entry => entry.level !== 'Pre-A1');

export function CoursePage({ level }: { level?: 'A2' } = {}) {
  const { progress } = useProgress();
  const adaptive = useAdaptive();
  const engine = adaptive?.host.protectedData ? null : adaptive?.host.engine;
  const completedCore = core.filter(entry => progress.completedLessons.includes(entry.id)).length;
  return <div className="course-page">
    <a className="back-link" href="#/"><Icon name="back" /> На главную</a>
    <div className="course-heading"><div><span className="pill pill-accent">A1 → A2 · Поэтапная программа</span><h1>Большой путь<br />с простых фраз.</h1><p className="lead">Грамматика и полезные слова чередуются: от короткого знакомства до повседневных задач уровня A2.</p></div><div className="course-stamp"><strong>{level ?? 'A1'}</strong><span>{level ? 'После основ A1' : 'От A1 к A2'}</span></div></div>
    <div className="course-meta"><span><Icon name="book" /> {formatLessonCount(lessons.length)} · {questionCount} вопросов</span><span>Теория → практика → разбор</span><span>Без регистрации</span></div>
    <aside className="notice"><strong>Завершено уроков: {completedCore} из {core.length} по основному маршруту.</strong><p>{completedCore === core.length ? 'Программа завершена. Все уроки доступны для повторения.' : engine ? 'Откройте доступный урок или посмотрите рекомендацию.' : 'Основной маршрут начинается с короткого знакомства. При желании сначала пройдите подготовку Pre-A1.'}</p></aside>
    {progress.legacyUnlockedLessons?.length ? <aside className="notice"><strong>Ваш прежний прогресс сохранён.</strong><p>Ранее открытые грамматические уроки остаются доступны. Новые словарные уроки нужно пройти отдельно; для дальнейшего движения по новой программе заполните эти пробелы.</p></aside> : null}
    <p>{!level && <><a className="text-link" href="#/lesson/bp-a1-01/intro">Начать A1</a> · <a className="text-link" href="#/lesson/bp-pre-01/intro">Подготовка Pre-A1</a> · </>}<a className="text-link" href="#/course/a1">Вся программа</a> · <a className="text-link" href="#/course/a2">Переход и A2</a></p>
    <section aria-labelledby="program-title"><div className="section-heading"><h2 id="program-title">Программа курса</h2><span className="muted">Уроки идут по порядку</span></div>
      <div className="lesson-list">{lessons.map((entry, i) => {
        if (level === 'A2' && (entry.level ?? entry.lesson?.level) !== 'A2') return null;
        const steps = entry.stepCount ?? (entry.lesson ? requiredSteps(entry.lesson).length : 7);
        const access = engine?.access(entry.id);
        const unlocked = access?.available ?? isLessonUnlocked(progress, lessons, entry.id);
        const complete = progress.completedLessons.includes(entry.id);
        const savedSteps = progress.lessons[entry.id]?.completedSteps ?? [];
        const requiredIds = entry.lesson ? requiredSteps(entry.lesson).map(step => step.id) : extensionStepIds;
        const count = requiredIds.filter(id => savedSteps.includes(id)).length;
        const started = count > 0 || progress.lastVisited?.lessonId === entry.id;
        return <article className={`lesson-card ${unlocked ? 'available' : ''}`} key={entry.id}><span className="lesson-number">{String(i + 1).padStart(2, '0')}</span><div className="lesson-card-content"><span className="lesson-status">{access ? [access.completed && 'Пройден', access.placementConfirmed && 'Знания подтверждены диагностикой', access.recommended && 'Рекомендуем', access.available ? 'Доступен' : 'Пока недоступен'].filter(Boolean).join(' · ') : complete ? 'Завершён · можно повторить' : !unlocked ? 'Заблокирован' : started ? 'В процессе' : 'Доступен'}</span><span className="lesson-kind">{entry.band ?? entry.level ?? entry.lesson?.level ?? 'A1'} · {entry.level === 'Pre-A1' ? 'Необязательная подготовка' : entry.id.startsWith('bp-') ? 'Общение' : entry.lesson?.kind === 'vocabulary' ? 'Словарь' : 'Грамматика'}</span><h3>{entry.title}</h3><p className="lesson-subtitle">{entry.subtitle}</p><p>{entry.objective}</p>{access?.recommended && <a className="text-link" href="#/diagnostic">О рекомендации</a>}<div className="course-lesson-progress"><small>{count} из {steps} шагов</small><progress value={count} max={steps} aria-label={`${entry.title}: ${count} из ${steps} шагов`} /></div></div><div className="lesson-card-action">{unlocked ? <LinkButton href={`#/lesson/${entry.id}/${entry.lesson ? resumeStep(progress, entry.lesson) : progress.lastVisited?.lessonId === entry.id ? progress.lastVisited.stepId : extensionStepIds.find(id => !progress.lessons[entry.id]?.completedSteps.includes(id)) ?? 'summary'}`}>{complete ? 'Повторить' : started ? 'Продолжить' : 'Открыть'} <Icon name="arrow" /></LinkButton> : <span className="locked-label"><Icon name="lock" /> После урока {i}</span>}
          {unlocked && !complete && access?.placementConfirmed && <SkipLesson lessonId={entry.id} />}
        </div></article>;
      })}</div>
    </section>
    <p className="course-footnote">Прогресс хранится только в этом браузере и не синхронизируется между устройствами. {!engine && 'Следующий урок открывается после завершения предыдущего.'}</p>
    <ResetProgress />
  </div>;
}

function SkipLesson({ lessonId }: { lessonId: string }) {
  const adaptive = useAdaptive();
  const [notice, setNotice] = useState('');
  if (!adaptive) return null;
  const { host, write, busy } = adaptive;
  return <div>
    <button className="button button-secondary" disabled={busy} onClick={async () => {
      const before = host.grants();
      if (await write(() => host.engine.choose({ type: 'skip', lessonId }))) {
        const target = [...host.grants()].find(id => !before.has(id) && host.engine.access(id).available);
        if (target) window.location.hash = `#/lesson/${target}/intro`;
        else setNotice('Откройте доступный урок в программе курса.');
      }
    }}>Пропустить урок</button>
    <p>Урок останется доступен для практики.</p>
    {notice && <p role="status">{notice}</p>}
  </div>;
}
