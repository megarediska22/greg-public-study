import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { lessons } from '../content/course';
import { emptyProgress, loadProgress, saveProgress, updateProgress, type Progress, type ProgressAction } from './progress';

type ProgressContextValue = { progress: Progress; dispatch: (action: ProgressAction) => void; reset: () => void };
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => {
    try { return loadProgress(window.localStorage, lessons); }
    catch { return { progress: emptyProgress(), recovered: false, unavailable: true }; }
  });
  const [progress, setProgress] = useState(loaded.progress);
  const [unavailable, setUnavailable] = useState(loaded.unavailable);
  useEffect(() => {
    try { setUnavailable(!saveProgress(window.localStorage, progress)); }
    catch { setUnavailable(true); }
  }, [progress]);
  const dispatch = useCallback((action: ProgressAction) => { setProgress(previous => updateProgress(previous, lessons, action)); }, []);
  function reset() {
    setProgress(emptyProgress());
  }
  return <ProgressContext value={{ progress, dispatch, reset }}>
    {(unavailable || loaded.recovered) && <p className="storage-note" role="status">{unavailable ? 'Браузер не разрешает сохранить прогресс. Он действует до перезагрузки.' : 'Сохранённые данные проверены по текущей программе. Корректный прогресс восстановлен; новые или незавершённые задания нужно пройти.'}</p>}
    {children}
  </ProgressContext>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress requires ProgressProvider');
  return context;
}
