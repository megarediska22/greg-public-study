import { useAdaptive } from '../components/adaptive/AdaptiveContext';
import { LessonAdvice } from '../components/adaptive/LessonAdvice';
import { useEffect, useState } from 'react';
import { lessons } from '../content/course';
import { loadLesson } from '../content/extension/registry';
import type { Lesson } from '../types/lesson';
import type { CourseEntry } from '../types/lesson';
import { useProgress } from '../lib/ProgressContext';
import { getScore, isLessonUnlocked, isOptionalStep, requiredSteps, isStepComplete, isStepUnlocked, resumeStep } from '../lib/progress';
import { Icon } from '../components/Icon';
import { LinkButton } from '../components/LinkButton';
import { StepNavigation } from '../components/lessons/StepNavigation';
import { LessonContent } from '../components/lessons/LessonContent';

export function LessonPage({ entry, stepId }: { entry: CourseEntry; stepId: string }) {
  const { progress, dispatch } = useProgress();
  const adaptive = useAdaptive();
  const engine = adaptive?.host.protectedData ? null : adaptive?.host.engine;
  const checkpoint = engine ? adaptive?.host.checkpointFor(entry.id) : undefined;
  const bridgePending = Boolean(checkpoint?.mode === 'BRIDGE' && checkpoint.next && !engine?.access(checkpoint.next).available);
  const [lesson, setLesson] = useState<Lesson | undefined>(entry.lesson);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const step = lesson?.steps.find(item => item.id === stepId);
  const unlocked = engine?.access(entry.id).available ?? isLessonUnlocked(progress, lessons, entry.id);
  useEffect(() => {
    if (!unlocked || lesson) return;
    let active = true;
    loadLesson(entry.id).then(loaded => { if (active) setLesson(loaded); }).catch(() => { if (active) setLoadFailed(true); });
    return () => { active = false; };
  }, [entry.id, unlocked, lesson, retry]);
  const accessible = unlocked && lesson && step && isStepUnlocked(progress, lesson, step.id);
  useEffect(() => {
    if (accessible) dispatch({ type: 'visit', lessonId: entry.id, stepId });
  }, [accessible, entry.id, stepId, dispatch]);

  if (!unlocked) return <section className="not-found"><h1>Урок пока заблокирован</h1><p>Завершите предыдущие уроки программы.</p><LinkButton href="#/course/a1">К программе курса</LinkButton></section>;
  if (!lesson) return <section className="notice" role="status"><h1>{entry.title}</h1><p>{loadFailed ? 'Не удалось загрузить урок. Прогресс сохранён.' : 'Загружаем урок…'}</p>{loadFailed && <button className="button button-secondary" onClick={() => { setLoadFailed(false); setRetry(value => value + 1); }}>Повторить загрузку</button>}<LinkButton href="#/course/a1">К программе курса</LinkButton></section>;
  if (!step) return <section className="not-found"><h1>Раздел не найден</h1><LinkButton href={`#/lesson/${lesson.id}/${resumeStep(progress, lesson)}`}>К доступному шагу</LinkButton></section>;
  if (!accessible) return <section className="not-found"><h1>Шаг пока заблокирован</h1><p>Сначала завершите предыдущие разделы урока.</p><LinkButton href={`#/lesson/${lesson.id}/${resumeStep(progress, lesson)}`}>Продолжить урок</LinkButton></section>;

  const index = lesson.steps.indexOf(step);
  // QA opens navigation with synthetic flags, but an exercise's Continue button
  // still reflects its real answers, just as it does in normal learning mode.
  const score = step.type === 'exercise' ? getScore(progress, lesson, step) : null;
  const complete = score ? score.correct === score.total : isStepComplete(progress, lesson.id, step.id);
  const mandatory = requiredSteps(lesson);
  const completedCount = mandatory.filter(item => isStepComplete(progress, lesson.id, item.id)).length;
  const supplement = lesson.steps.find(isOptionalStep);
  const optional = isOptionalStep(step);
  const nextStep = lesson.steps.slice(index + 1).find(item => !isOptionalStep(item));
  const previousStep = lesson.steps.slice(0, index).filter(item => !isOptionalStep(item)).at(-1);
  const nextLesson = lessons[lessons.indexOf(entry) + 1];
  const nextAccessible = nextLesson && (engine?.access(nextLesson.id).available ?? isLessonUnlocked(progress, lessons, nextLesson.id));
  function advance() {
    if (!lesson || !step || (!complete && step.completion !== 'acknowledge')) return;
    dispatch({ type: 'complete', lessonId: lesson.id, stepId });
    if (nextStep) window.location.hash = `/lesson/${lesson.id}/${nextStep.id}`;
  }
  return <div className="lesson-page"><a className="back-link" href="#/course/a1"><Icon name="back" /> К программе курса</a>
    <div className="lesson-heading"><div><span className="muted">{lesson.band ?? lesson.level} / {lesson.level === 'Pre-A1' ? 'Подготовка' : lesson.id.startsWith('bp-') ? 'Общение' : lesson.kind === 'vocabulary' ? 'Словарь' : 'Грамматика'} / Урок {String(lessons.indexOf(entry) + 1).padStart(2, '0')}</span><h1>{entry.title} <span>{entry.subtitle}</span></h1></div>{lesson.sample && <span className="pill">Демонстрационный контент</span>}</div>
    <div className="lesson-progress"><div><span>Прогресс урока</span><span aria-live="polite">{completedCount} из {mandatory.length} шагов пройдено</span></div><progress value={completedCount} max={mandatory.length} aria-label={`Прогресс урока: ${completedCount} из ${mandatory.length} шагов`} /></div>
    <div className="lesson-layout"><StepNavigation lesson={lesson} current={stepId} /><section className="lesson-panel" tabIndex={-1} aria-label={step.title}><div className="lesson-panel-content">{engine && <LessonAdvice key={lesson.id} lessonId={lesson.id} />}
      {engine && checkpoint && (checkpoint.id === 'CP-PRE' ? step.type === 'theory' : step.type === 'review' || step.type === 'summary' && bridgePending) && <p><LinkButton href={`#/checkpoint/${checkpoint.id}`} secondary>{checkpoint.id === 'CP-PRE' ? 'Проверить себя до практики' : 'Открыть контрольную'}</LinkButton></p>}
      {(step.type === 'review' || step.type === 'summary') && supplement && isStepUnlocked(progress, lesson, supplement.id) && <p><LinkButton secondary href={`#/lesson/${lesson.id}/${supplement.id}`}>Дополнительная практика</LinkButton></p>}
      <LessonContent key={`${lesson.id}/${stepId}`} lesson={lesson} step={step} />{step.type === 'summary' && complete && <LinkButton href={nextAccessible ? `#/lesson/${nextLesson.id}/intro` : '#/course/a1'}>{nextAccessible ? 'К следующему уроку' : 'К программе курса'} <Icon name="arrow" /></LinkButton>}</div>
      <nav className="lesson-pagination" aria-label="Навигация по уроку">{previousStep ? <LinkButton secondary href={`#/lesson/${lesson.id}/${previousStep.id}`}><Icon name="back" /> Назад</LinkButton> : <LinkButton secondary href="#/course/a1"><Icon name="back" /> К курсу</LinkButton>}<span>{optional ? 'Дополнительно' : `${mandatory.indexOf(step) + 1} из ${mandatory.length}`}</span>
        {step.type === 'summary' && bridgePending ? <LinkButton href={`#/checkpoint/${checkpoint!.id}`}>К контрольной <Icon name="arrow" /></LinkButton> : step.type === 'summary' && complete ? <LinkButton href="#/course/a1">К курсу <Icon name="arrow" /></LinkButton> : optional && nextStep ? <LinkButton href={`#/lesson/${lesson.id}/${nextStep.id}`}>К итогам <Icon name="arrow" /></LinkButton> : <button className="button button-primary" disabled={step.completion === 'all-correct' && !complete} onClick={advance}>{step.type === 'summary' ? 'Завершить урок' : step.type === 'exercise' ? 'Продолжить' : complete ? 'Далее' : step.type === 'review' ? 'Разбор завершён' : 'Прочитано, далее'}<Icon name="arrow" /></button>}
      </nav>
    </section></div>
  </div>;
}
