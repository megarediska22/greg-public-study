import type { Lesson } from '../../types/lesson';
import { useProgress } from '../../lib/ProgressContext';
import { isStepComplete, isStepUnlocked } from '../../lib/progress';
import { Icon } from '../Icon';

function StepList({ lesson, current }: { lesson: Lesson; current: string }) {
  const { progress } = useProgress();
  return <ol className="step-list">{lesson.steps.map((step, i) => {
    const unlocked = isStepUnlocked(progress, lesson, step.id);
    const complete = isStepComplete(progress, lesson.id, step.id);
    const content = <><span className="step-number">{String(i + 1).padStart(2, '0')}</span><span><strong>{step.title}</strong><small>{complete ? 'Пройдено · повторить' : unlocked ? step.description : 'Пройдите предыдущий шаг'}</small></span>{complete ? <Icon name="check" /> : !unlocked ? <Icon name="lock" /> : current === step.id ? <span className="active-step-dot" /> : null}</>;
    return <li key={step.id}>{unlocked ? <a href={`#/lesson/${lesson.id}/${step.id}`} aria-current={current === step.id ? 'step' : undefined}>{content}</a> : <span className="locked-step" aria-disabled="true">{content}</span>}</li>;
  })}</ol>;
}
export function StepNavigation({ lesson, current }: { lesson: Lesson; current: string }) {
  return <aside className="lesson-sidebar"><div className="desktop-steps"><h2>В этом уроке</h2><nav aria-label="Разделы урока"><StepList lesson={lesson} current={current} /></nav><p className="sidebar-note"><Icon name="book" />Каждый пройденный шаг открывает следующий. К пройденным шагам можно вернуться.</p></div><details className="mobile-steps" key={current}><summary>Разделы урока <span>{lesson.steps.findIndex(step => step.id === current) + 1} / {lesson.steps.length}</span></summary><nav aria-label="Разделы урока на мобильном"><StepList lesson={lesson} current={current} /></nav></details></aside>;
}
