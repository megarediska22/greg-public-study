import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getProgressCourse } from '../content/extension/registry';
import { emptyProgress, updateProgress, type Progress, type ProgressAction } from './progress';
import type { openProgressSession, SaveStatus } from './progressStorage';
import { openCourseSession } from './courseSession';

type ProgressContextValue = { progress: Progress; dispatch: (action: ProgressAction) => void; reset: () => void };
export const ProgressContext = createContext<ProgressContextValue | null>(null);

type Session = ReturnType<typeof openProgressSession>;

export function ProgressProvider({ children }: { children: ReactNode }) {
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
  return <ReadyProgressProvider loaded={session}>{children}</ReadyProgressProvider>;
}

function ReadyProgressProvider({ children, loaded }: { children: ReactNode; loaded: Session }) {
  const [progress, setProgress] = useState(loaded.progress);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(loaded.unavailable ? 'unavailable' : 'unchanged');
  const explicitReset = useRef(false);
  useEffect(() => {
    const result = loaded.persist(progress, { allowReset: explicitReset.current });
    explicitReset.current = false;
    setSaveStatus(result);
  }, [progress]);
  const dispatch = useCallback((action: ProgressAction) => { setProgress(previous => updateProgress(previous, getProgressCourse(), action)); }, []);
  function reset() {
    explicitReset.current = true;
    setProgress(emptyProgress());
  }
  return <ProgressContext value={{ progress, dispatch, reset }}>
    {(saveStatus !== 'saved' && saveStatus !== 'unchanged' || loaded.recovered) && <p className="storage-note" role="status">{saveStatus === 'conflict' ? 'В другой вкладке изменился прогресс. Чтобы не перезаписать его, сохранение остановлено. Обновите страницу перед продолжением.' : saveStatus === 'backup-failed' || saveStatus === 'empty-blocked' ? 'Исходный прогресс защищён от перезаписи. Не удалось безопасно сохранить изменения; они действуют до перезагрузки.' : saveStatus === 'unavailable' ? 'Не удалось безопасно прочитать или сохранить прогресс. Существующие данные не перезаписываются; новые изменения действуют до перезагрузки.' : 'Сохранённые данные проверены по текущей программе. Корректная часть восстановлена. Исходные данные сохраняются отдельно перед записью изменений; новые задания нужно пройти.'}</p>}
    {children}
  </ProgressContext>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress requires ProgressProvider');
  return context;
}
