import { useState } from 'react';
import type { VocabularyItem } from '../../types/lesson';

export function VocabularyDiscovery({ heading, text, items, note }: { heading: string; text: string; items: readonly VocabularyItem[]; note: string }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const allShown = revealed.length === items.length;
  return <div className="vocabulary-content">
    <span className="pill pill-accent">Словарь · {items.length} слов и выражений</span>
    <h2>{heading}</h2><p>{text}</p>
    <button className="button button-secondary word-reveal-all" type="button" onClick={() => setRevealed(allShown ? [] : items.map(item => item.id))}>{allShown ? 'Скрыть все переводы' : 'Показать все переводы'}</button>
    <div className="word-grid">{items.map((item, index) => {
      const open = revealed.includes(item.id);
      return <article className="word-card" key={item.id} aria-labelledby={`${item.id}-term`}>
        <div className="word-card-heading"><span className="muted">{String(index + 1).padStart(2, '0')}</span><span className="muted">{item.partOfSpeech}</span></div>
        <h3 id={`${item.id}-term`} lang="en">{item.term}</h3>
        {item.example !== item.term && <p className="word-example" lang="en">{item.example}</p>}
        <button className="text-link word-reveal" type="button" aria-expanded={open} aria-controls={`${item.id}-meaning`} onClick={() => setRevealed(previous => open ? previous.filter(id => id !== item.id) : [...previous, item.id])}>{open ? 'Скрыть перевод' : 'Открыть перевод'}<span className="sr-only">: {item.term}</span></button>
        <div id={`${item.id}-meaning`} hidden={!open} className="word-meaning"><strong>{item.meaningRu}</strong>{item.exampleTranslation !== item.meaningRu && <p>{item.exampleTranslation}</p>}</div>
        {item.usage && <p className="word-usage">{item.usage}</p>}
      </article>;
    })}</div>
    <aside className="rule-note"><strong>Маленькая подсказка</strong><p>{note}</p></aside>
  </div>;
}
