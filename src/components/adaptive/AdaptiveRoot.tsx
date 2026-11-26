import { useCallback, useEffect, useRef, useState } from 'react';
import { App } from '../../App';
import { ProgressProvider } from '../../lib/ProgressContext';
import { openAdaptiveHost, type AdaptiveContent, type AdaptiveHost } from '../../lib/adaptiveHost';
import type { AdaptivePersistStatus } from '../../lib/adaptive/storage';
import { AdaptiveContext } from './AdaptiveContext';
import { LinkButton } from '../LinkButton';

export const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
};

export function AdaptiveRoot({ content, storage = browserStorage }: { content: AdaptiveContent; storage?: typeof browserStorage }) {
  const [host, setHost] = useState<AdaptiveHost>();
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdaptivePersistStatus>();
  const [confirm, setConfirm] = useState(false);
  const writing = useRef(false);
  const [, setRevision] = useState(0);
  const report = useCallback((status: AdaptivePersistStatus) => {
    if (status === 'saved') setRevision(value => value + 1);
    if (status !== 'saved' && status !== 'unchanged') setError(status);
  }, []);

  useEffect(() => {
    let active = true;
    openAdaptiveHost(storage, content)
      .then(value => { if (active) setHost(value); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [storage, content, retry]);

  async function write(operation: () => Promise<AdaptivePersistStatus>) {
    if (writing.current) return false;
    writing.current = true;
    setBusy(true);
    try {
      const status = await operation();
      const ok = status === 'saved' || status === 'unchanged';
      setError(ok ? undefined : status);
      return ok;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  if (!host) return <main className="main-container"><p role="status">{failed ? 'Загрузить сохранённые данные не удалось.' : 'Восстанавливаем прогресс…'}</p>
    {failed && <button className="button button-secondary" onClick={() => { setFailed(false); setRetry(value => value + 1); }}>Повторить загрузку</button>}</main>;
  const visited = host.session.progress.lastVisited;
  const savedRoute = visited ? `#/lesson/${visited.lessonId}/${visited.stepId}` : '#/course/a1';
  const needsRecovery = ['corrupt', 'unsupported'].includes(host.engine.storageStatus());
  const canWrite = !host.protectedData && error !== 'conflict' && error !== 'protected';

  return <AdaptiveContext value={{ host, write, busy: busy || !canWrite }}>
    {(host.protectedData || error) && <section className="main-container storage-note" aria-label="Сохранение прогресса">
      <p role="status">{error === 'conflict' ? 'Прогресс изменился в другой вкладке.' : needsRecovery
        ? 'Сохранённые данные диагностики повреждены или записаны в другой версии.'
        : 'Сохранить результат в этом браузере не удалось.'}
        {host.protectedData && ' Можно продолжить обучение во временном режиме. Новые ответы могут пропасть после перезагрузки.'}</p>
      <div className="adaptive-actions">
        <button className="button button-secondary" onClick={() => window.location.reload()}>Перечитать данные</button>
        <LinkButton href={savedRoute} secondary>{visited ? 'Продолжить с сохранённого урока' : 'К программе курса'}</LinkButton>
        {needsRecovery && !confirm && <button className="button button-secondary" onClick={() => setConfirm(true)}>Восстановить данные</button>}
      </div>
      {needsRecovery && confirm && <div>
        <p>Текущие данные диагностики будут скопированы в резервную запись. После этого можно начать новую диагностику.</p>
        <div className="adaptive-actions">
          <button className="button button-secondary" onClick={() => setConfirm(false)}>Отмена</button>
          <button className="button button-primary" disabled={busy || error === 'conflict'} onClick={async () => {
            if (await write(() => host.engine.recoverAfterConfirmation())) window.location.reload();
          }}>Создать резервную копию и начать заново</button>
        </div>
      </div>}
    </section>}
    <ProgressProvider adaptive={host} reportAdaptiveStatus={report} suspendPersistence={error === 'conflict' || error === 'protected'}><App /></ProgressProvider>
  </AdaptiveContext>;
}
