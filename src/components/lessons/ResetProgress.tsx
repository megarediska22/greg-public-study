import { useEffect, useRef, useState } from 'react';
import { useProgress } from '../../lib/ProgressContext';

export function ResetProgress() {
  const { reset } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [didReset, setDidReset] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (confirming) cancelRef.current?.focus(); }, [confirming]);
  function close() {
    setConfirming(false);
    triggerRef.current?.focus();
  }
  return <div className="reset-progress">
    <button ref={triggerRef} className="button button-secondary" aria-expanded={confirming} aria-controls={confirming ? 'reset-confirmation' : undefined} onClick={() => { setDidReset(false); setConfirming(true); }}>Сбросить прогресс</button>
    {confirming && <section id="reset-confirmation" className="notice reset-confirmation" role="group" aria-labelledby="reset-title" onKeyDown={event => { if (event.key === 'Escape') close(); }}>
      <h3 id="reset-title">Сбросить весь учебный прогресс?</h3><p>Ответы, попытки и пройденные шаги будут удалены из этого браузера. Тема оформления сохранится.</p>
      <div className="reset-actions"><button ref={cancelRef} className="button button-secondary" onClick={close}>Отмена</button><button className="button button-primary" onClick={() => { reset(); setDidReset(true); close(); }}>Да, сбросить</button></div>
    </section>}
    <p className="field-hint" role="status">{didReset ? 'Прогресс сброшен.' : ''}</p>
  </div>;
}
