import { useLayoutEffect, useRef } from 'react';

type Token = { id: string; label: string };
export function FastCards({ tokens, selected, busy, change }: {
  tokens: readonly Token[]; selected: readonly string[]; busy: boolean; change: (ids: string[]) => Promise<boolean>;
}) {
  const target = useRef<string | undefined>(undefined);
  const region = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!busy && target.current) {
      region.current?.querySelector<HTMLButtonElement>(`[data-token="${CSS.escape(target.current)}"]`)?.focus();
      target.current = undefined;
    }
  }, [busy, selected]);
  async function edit(ids: string[], focus: string) {
    target.current = focus;
    if (!await change(ids)) target.current = undefined;
  }
  return <div ref={region}>
    <p>Нажимайте на слова, чтобы собрать ответ. Выбранное слово можно убрать или передвинуть стрелками.</p>
    <div className="fast-selected" role="group" aria-label="Собранный ответ">
      {selected.length === 0 && <p className="muted">Выберите слова ниже.</p>}
      {selected.map((id, index) => {
        const token = tokens.find(token => token.id === id)!;
        return <div className="fast-token" key={id}>
          <button type="button" className="button button-secondary" data-token={id} disabled={busy}
            aria-label={`Убрать «${token.label}», слово ${index + 1}`}
            onClick={() => void edit(selected.filter(key => key !== id), id)}>{token.label}</button>
          <button type="button" className="icon-button" disabled={busy || index === 0}
            aria-label={`Передвинуть «${token.label}» влево, слово ${index + 1}`}
            onClick={() => { const ids = [...selected]; [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]; void edit(ids, id); }}>←</button>
          <button type="button" className="icon-button" disabled={busy || index === selected.length - 1}
            aria-label={`Передвинуть «${token.label}» вправо, слово ${index + 1}`}
            onClick={() => { const ids = [...selected]; [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]; void edit(ids, id); }}>→</button>
        </div>;
      })}
    </div>
    <div className="fast-token-bank" role="group" aria-label="Доступные слова">
      {tokens.filter(token => !selected.includes(token.id)).map(token =>
        <button type="button" className="button button-secondary" key={token.id} data-token={token.id}
          disabled={busy} onClick={() => void edit([...selected, token.id], token.id)}>{token.label}</button>)}
    </div>
    <p className="field-hint" role="status">Выбрано слов: {selected.length}</p>
  </div>;
}
