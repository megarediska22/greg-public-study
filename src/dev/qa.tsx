import { useCallback, useEffect, useState } from 'react';
import type { Root } from 'react-dom/client';
import { App } from '../App';
import { lessons } from '../content/course';
import { ProgressContext } from '../lib/ProgressContext';
import { updateProgress, type ProgressAction } from '../lib/progress';
import { useRoute } from '../lib/router';
import { createQaProgress, loadQaProgress, restartQaLesson, saveQaProgress, QA_THEME_KEY } from './qaState';
import './qa.css';

function LocalQa() {
  const [progress, setProgress] = useState(() => loadQaProgress({ getItem: key => window.localStorage.getItem(key) }, lessons));
  const [unavailable, setUnavailable] = useState(false);
  const [notice, setNotice] = useState('');
  const [selection, setSelection] = useState(lessons[0].id);
  const route = useRoute();
  const currentId = /^\/lesson\/([^/]+)\//.exec(route)?.[1];
  const selected = lessons.some(entry => entry.id === currentId) ? currentId! : selection;
  useEffect(() => { setUnavailable(!saveQaProgress({ setItem: (key, value) => window.localStorage.setItem(key, value) }, progress)); }, [progress]);
  const dispatch = useCallback((action: ProgressAction) => setProgress(previous => updateProgress(previous, lessons, action)), []);
  function reset() { setProgress(createQaProgress(lessons)); setNotice('Все тестовые ответы очищены. Уроки остаются открыты.'); }
  return <ProgressContext value={{ progress, dispatch, reset }}>
    <aside className="qa-bar" aria-label="Локальная проверка">
      <strong>Локальная проверка · все уроки и шаги открыты</strong>
      <p>Отметки завершения условные. Вопросы доступны без ответов; результаты и ошибки относятся только к этой проверке. Учебный прогресс сайта не используется.</p>
      <div className="qa-controls"><label>Открыть урок<select value={selected} onChange={event => {
        setSelection(event.target.value); setNotice(''); window.location.hash = `/lesson/${event.target.value}/intro`;
      }}>{lessons.map((entry, index) => <option key={entry.id} value={entry.id}>{index + 1}. {entry.title}</option>)}</select></label>
        <button className="button button-secondary" onClick={() => {
          setProgress(previous => restartQaLesson(previous, lessons, selected));
          setNotice('Тестовые ответы и ошибки выбранного урока очищены. Можно пройти его с начала.');
          window.location.hash = `/lesson/${selected}/intro`;
        }}>Очистить ответы этого урока</button>
        <a className="text-link" href="#/course/a1">Все уроки ({lessons.length})</a>
      </div>
      {(notice || unavailable) && <p role="status">{unavailable ? 'Тестовые ответы не сохраняются: браузер ограничил хранилище.' : notice}</p>}
    </aside>
    <App themeStorageKey={QA_THEME_KEY} />
  </ProgressContext>;
}

export function mountLocalQa(root: Root) {
  let theme = 'light';
  try { if (window.localStorage.getItem(QA_THEME_KEY) === 'dark') theme = 'dark'; } catch { /* Default QA theme. */ }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121212' : '#F7F7F7');
  root.render(<LocalQa />);
}
