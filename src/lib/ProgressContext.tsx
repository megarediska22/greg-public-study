import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { lessons } from '../content/course';
import { emptyProgress, updateProgress, type Progress, type ProgressAction } from './progress';
import { openProgressSession, type SaveStatus } from './progressStorage';

type ProgressContextValue = { progress: Progress; dispatch: (action: ProgressAction) => void; reset: () => void };
export const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => openProgressSession({
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
  }, lessons));
  const [progress, setProgress] = useState(loaded.progress);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(loaded.unavailable ? 'unavailable' : 'unchanged');
  const explicitReset = useRef(false);
  useEffect(() => {
    const result = loaded.persist(progress, { allowReset: explicitReset.current });
    explicitReset.current = false;
    setSaveStatus(result);
  }, [progress]);
  const dispatch = useCallback((action: ProgressAction) => { setProgress(previous => updateProgress(previous, lessons, action)); }, []);
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
