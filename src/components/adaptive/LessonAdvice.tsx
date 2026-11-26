import { useState } from 'react';
import { lessons } from '../../content/course';
import { LinkButton } from '../LinkButton';
import { useAdaptive } from './AdaptiveContext';

export function LessonAdvice({ lessonId }: { lessonId: string }) {
  const adaptive = useAdaptive();
  const [hidden, setHidden] = useState<string>();
  const advice = adaptive?.host.engine.advice(lessonId);
  if (!adaptive || !advice || hidden === advice.id || adaptive.host.protectedData) return null;
  const lesson = lessons.find(entry => entry.id === advice.lessonId);
  if (!lesson || !adaptive.host.engine.access(lesson.id).available) return null;
  return <aside className="notice" aria-label="Совет для повторения">
    <strong>Стоит потренироваться</strong>
    <p>{advice.reason === 'prerequisite' ? 'Для этого урока пригодится одна из предыдущих тем.' : 'Недавние ответы показывают, что эту тему полезно закрепить.'} «{lesson.title}».</p>
    <div className="adaptive-actions">
      <LinkButton href={`#/lesson/${lesson.id}/intro`} secondary>Потренироваться</LinkButton>
      <button className="button button-secondary" disabled={adaptive.busy} onClick={async () => {
        if (await adaptive.write(() => adaptive.host.engine.dismissAdvice(lessonId, advice.id))) setHidden(advice.id);
      }}>Не сейчас</button>
      <button className="button button-secondary" onClick={() => {
        document.querySelector<HTMLElement>('.lesson-panel')?.focus();
        setHidden(advice.id);
      }}>Продолжить урок</button>
    </div>
  </aside>;
}
