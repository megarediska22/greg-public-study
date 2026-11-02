import { useEffect } from 'react';
import { lessons } from '../content/course';
import type { CourseEntry } from '../types/lesson';
import { useProgress } from '../lib/ProgressContext';
import { isLessonUnlocked, isStepComplete, isStepUnlocked, resumeStep } from '../lib/progress';
import { Icon } from '../components/Icon';
import { LinkButton } from '../components/LinkButton';
import { StepNavigation } from '../components/lessons/StepNavigation';
import { LessonContent } from '../components/lessons/LessonContent';

export function LessonPage({ entry, stepId }: { entry: CourseEntry; stepId: string }) {
  const { progress, dispatch } = useProgress();
  const lesson = entry.lesson;
  const step = lesson?.steps.find(item => item.id === stepId);
  const unlocked = isLessonUnlocked(progress, lessons, entry.id);
  const accessible = unlocked && lesson && step && isStepUnlocked(progress, lesson, step.id);
  useEffect(() => {
    if (accessible) dispatch({ type: 'visit', lessonId: entry.id, stepId });
  }, [accessible, entry.id, stepId, dispatch]);

  if (!unlocked) return <section className="not-found"><h1>Урок пока заблокирован</h1><p>Завершите предыдущие уроки курса A1.</p><LinkButton href="#/course/a1">К программе курса</LinkButton></section>;
  if (!lesson) return <section className="not-found"><h1>{entry.title}</h1><p>Содержание урока пока недоступно.</p><LinkButton href="#/course/a1">К программе курса</LinkButton></section>;
  if (!step) return <section className="not-found"><h1>Раздел не найден</h1><LinkButton href={`#/lesson/${lesson.id}/${resumeStep(progress, lesson)}`}>К доступному шагу</LinkButton></section>;
  if (!accessible) return <section className="not-found"><h1>Шаг пока заблокирован</h1><p>Сначала завершите предыдущие разделы урока.</p><LinkButton href={`#/lesson/${lesson.id}/${resumeStep(progress, lesson)}`}>Продолжить урок</LinkButton></section>;

  const index = lesson.steps.indexOf(step);
  const complete = isStepComplete(progress, lesson.id, step.id);
  const completedCount = progress.lessons[lesson.id]?.completedSteps.length ?? 0;
  const nextLesson = lessons[lessons.indexOf(entry) + 1];
  function advance() {
    if (!lesson || !step || (!complete && step.completion !== 'acknowledge')) return;
    dispatch({ type: 'complete', lessonId: lesson.id, stepId });
    if (index < lesson.steps.length - 1) window.location.hash = `/lesson/${lesson.id}/${lesson.steps[index + 1].id}`;
  }
  return <div className="lesson-page"><a className="back-link" href="#/course/a1"><Icon name="back" /> К программе курса A1</a>
    <div className="lesson-heading"><div><span className="muted">{lesson.level} / Урок {String(lessons.indexOf(entry) + 1).padStart(2, '0')}</span><h1>{entry.title} <span>{entry.subtitle}</span></h1></div>{lesson.sample && <span className="pill">Демонстрационный контент</span>}</div>
    <div className="lesson-progress"><div><span>Прогресс урока</span><span aria-live="polite">{completedCount} из {lesson.steps.length} шагов пройдено</span></div><progress value={completedCount} max={lesson.steps.length} aria-label={`Прогресс урока: ${completedCount} из ${lesson.steps.length} шагов`} /></div>
    <div className="lesson-layout"><StepNavigation lesson={lesson} current={stepId} /><section className="lesson-panel" aria-label={step.title}><div className="lesson-panel-content"><LessonContent key={`${lesson.id}/${stepId}`} lesson={lesson} step={step} />{step.type === 'summary' && complete && <LinkButton href={nextLesson ? `#/lesson/${nextLesson.id}/intro` : '#/course/a1'}>{nextLesson ? 'К следующему уроку' : 'К программе курса'} <Icon name="arrow" /></LinkButton>}</div>
      <nav className="lesson-pagination" aria-label="Навигация по уроку">{index > 0 ? <LinkButton secondary href={`#/lesson/${lesson.id}/${lesson.steps[index - 1].id}`}><Icon name="back" /> Назад</LinkButton> : <LinkButton secondary href="#/course/a1"><Icon name="back" /> К курсу</LinkButton>}<span>{index + 1} из {lesson.steps.length}</span>
        {step.type === 'summary' && complete ? <LinkButton href="#/course/a1">К курсу <Icon name="arrow" /></LinkButton> : <button className="button button-primary" disabled={step.completion === 'all-correct' && !complete} onClick={advance}>{step.type === 'summary' ? 'Завершить урок' : complete || step.type === 'exercise' ? 'Далее' : step.type === 'review' ? 'Разбор завершён' : 'Прочитано, далее'}<Icon name="arrow" /></button>}
      </nav>
    </section></div>
  </div>;
}
