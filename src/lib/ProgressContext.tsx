import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getProgressCourse } from '../content/extension/registry';
import { emptyProgress, updateProgress, type Progress, type ProgressAction } from './progress';
import type { openProgressSession, SaveStatus } from './progressStorage';
import type { PracticePort } from './adaptive/practice';
import { openCourseSession } from './courseSession';
import type { AdaptiveHost } from './adaptiveHost';
import type { AdaptivePersistStatus } from './adaptive/storage';

type AdaptiveProgress = {
  adaptive?: AdaptiveHost;
  reportAdaptiveStatus?: (status: AdaptivePersistStatus) => void;
  suspendPersistence?: boolean;
};

type ProgressContextValue = { progress: Progress; dispatch: (action: ProgressAction) => void; reset: () => void | Promise<boolean>; reportHint?: PracticePort['hint'] };
export const ProgressContext = createContext<ProgressContextValue | null>(null);

type Session = ReturnType<typeof openProgressSession>;

export function ProgressProvider({ children, practice, adaptive, ...options }: { children: ReactNode; practice?: PracticePort } & AdaptiveProgress) {
  if (adaptive) return <ReadyProgressProvider loaded={adaptive.session} adaptive={adaptive} {...options}>{children}</ReadyProgressProvider>;
  return <LoadProgressProvider practice={practice}>{children}</LoadProgressProvider>;
}

function LoadProgressProvider({ children, practice }: { children: ReactNode; practice?: PracticePort }) {
  const [session, setSession] = useState<Session | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const storage = {
      getItem: (key: string) => window.localStorage.getItem(key),
      setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    };
    openCourseSession(storage).then(loaded => {
      if (active) setSession(loaded);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [retry]);
  if (!session) return <section className="notice" role="status"><p>{failed ? 'Не удалось загрузить данные для восстановления прогресса. Сохранение не изменено.' : 'Восстанавливаем прогресс…'}</p>{failed && <button className="button button-secondary" onClick={() => { setFailed(false); setRetry(value => value + 1); }}>Повторить загрузку</button>}</section>;
  return <ReadyProgressProvider loaded={session} practice={practice}>{children}</ReadyProgressProvider>;
}

function ReadyProgressProvider({ children, loaded, practice, adaptive, reportAdaptiveStatus, suspendPersistence }: { children: ReactNode; loaded: Session; practice?: PracticePort } & AdaptiveProgress) {
  const [progress, setProgress] = useState(loaded.progress);
  const latestProgress = useRef(loaded.progress);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(loaded.unavailable ? 'unavailable' : 'unchanged');
  const explicitReset = useRef(false);
  const savedProgress = useRef(loaded.progress);
  const pendingCaptures = useRef<Parameters<PracticePort['capture']>[0][]>([]);
  const canPersist = !adaptive?.protectedData && !suspendPersistence;
  useEffect(() => {
    if (!canPersist) return;
    const result = loaded.persist(progress, { allowReset: explicitReset.current });
    explicitReset.current = false;
    setSaveStatus(result);
    const captures = pendingCaptures.current.splice(0);
    if (adaptive && (result === 'saved' || result === 'unchanged')) {
      adaptive.sync(progress);
      if (progress !== savedProgress.current) reportAdaptiveStatus?.('saved');
      const newlyCompleted = progress.completedLessons.filter(id => !savedProgress.current.completedLessons.includes(id));
      savedProgress.current = progress;
      for (const capture of captures) void adaptive.engine.capture(capture).then(reportAdaptiveStatus);
      for (const lessonId of newlyCompleted) void adaptive.engine.choose({ type: 'complete', lessonId }).then(reportAdaptiveStatus);
    }
  }, [progress, canPersist, adaptive, loaded, reportAdaptiveStatus]);
  const dispatch = useCallback((action: ProgressAction) => {
    const before = latestProgress.current;
    if (adaptive && !adaptive.protectedData && !adaptive.engine.access(action.lessonId).available) return;
    if (adaptive && action.type === 'complete' && action.stepId === 'summary') {
      const bridge = adaptive.checkpointFor(action.lessonId);
      if (bridge?.mode === 'BRIDGE' && bridge.next && !adaptive.engine.access(bridge.next).available) return;
    }
    const after = updateProgress(before, getProgressCourse(), action, adaptive?.grants());
    if (before === after) return;
    latestProgress.current = after;
    setProgress(after);
    if (adaptive && canPersist && action.type === 'check-exercise') pendingCaptures.current.push({ before, after, action });
    practice?.capture({ before, after, action });
  }, [practice, adaptive, canPersist]);
  function reset() {
    if (adaptive) return resetPilot();
    explicitReset.current = true;
    latestProgress.current = emptyProgress();
    setProgress(latestProgress.current);
  }
  async function resetPilot() {
    if (!adaptive || !canPersist) return false;
    const next = emptyProgress();
    const status = loaded.persist(next, { allowReset: true });
    setSaveStatus(status);
    if (status !== 'saved' && status !== 'unchanged') return false;
    latestProgress.current = next;
    setProgress(next);
    const adaptiveStatus = await adaptive.engine.resetAfterConfirmation();
    reportAdaptiveStatus?.(adaptiveStatus);
    if (adaptiveStatus !== 'saved' && adaptiveStatus !== 'unchanged') return false;
    window.location.reload();
    return true;
  }

  const reportHint: PracticePort['hint'] | undefined = adaptive && canPersist
    ? (...args) => { void adaptive.engine.hint(...args).then(reportAdaptiveStatus); }
    : practice?.hint;
  return <ProgressContext value={{ progress, dispatch, reset, reportHint }}>
    {(saveStatus !== 'saved' && saveStatus !== 'unchanged' || loaded.recovered) && <p className="storage-note" role="status">{saveStatus === 'conflict' ? 'В другой вкладке изменился прогресс. Чтобы не перезаписать его, сохранение остановлено. Обновите страницу перед продолжением.' : saveStatus === 'backup-failed' || saveStatus === 'empty-blocked' ? 'Исходный прогресс защищён от перезаписи. Не удалось безопасно сохранить изменения; они действуют до перезагрузки.' : saveStatus === 'unavailable' ? 'Не удалось безопасно прочитать или сохранить прогресс. Существующие данные не перезаписываются; новые изменения действуют до перезагрузки.' : 'Сохранённые данные проверены по текущей программе. Корректная часть восстановлена. Исходные данные сохраняются отдельно перед записью изменений; новые задания нужно пройти.'}</p>}
    {children}
  </ProgressContext>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress requires ProgressProvider');
  return context;
}
