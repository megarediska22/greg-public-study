import { useState, type ReactNode } from 'react';
import type { Lesson } from '../../types/lesson';
import { lessons } from '../../content/course';
import { ProgressContext, useProgress } from '../../lib/ProgressContext';
import { updateProgress, type ProgressAction } from '../../lib/progress';
import { createVocabularyReview } from '../../lib/vocabularyReview';
import { ExerciseStep } from '../exercises/ExerciseStep';

/** Optional retrieval of missed words; the original scored history stays intact. */
export function VocabularyReview({ lesson, wordIds, children }: { lesson: Lesson; wordIds: string[]; children: ReactNode }) {
  const [active, setActive] = useState(false);
  return active ? <><p>Напишите по памяти только слова, с которыми были ошибки. Это дополнительное повторение: результаты основного урока и история не меняются.</p><ReviewExercise lesson={lesson} wordIds={wordIds} /><button className="button button-secondary" onClick={() => setActive(false)}>К разбору ошибок</button></> : <>{wordIds.length > 0 && <p><button className="button button-secondary" onClick={() => setActive(true)}>Повторить слова с ошибками ({wordIds.length})</button></p>}{children}</>;
}

function ReviewExercise({ lesson, wordIds }: { lesson: Lesson; wordIds: string[] }) {
  const { progress: earned } = useProgress();
  const [session] = useState(() => createVocabularyReview(earned, lessons, lesson, wordIds));
  const [progress, setProgress] = useState(session.progress);
  function dispatch(action: ProgressAction) { setProgress(previous => updateProgress(previous, session.course, action)); }
  return <ProgressContext value={{ progress, dispatch, reset: () => {} }}><ExerciseStep lesson={lesson} step={session.step} reviewOnly /></ProgressContext>;
}
