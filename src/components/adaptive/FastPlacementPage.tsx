import { useEffect, useRef, useState } from 'react';
import { lessons } from '../../content/course';
import { useProgress } from '../../lib/ProgressContext';
import { resumeStep } from '../../lib/progress';
import type { Acceptance, FastResponse, Selection } from '../../lib/adaptive/fast/index';
import { LinkButton } from '../LinkButton';
import { useAdaptive } from './AdaptiveContext';
import { FastCards } from './FastCards';

const phases = {
  core: 'Короткие повседневные ситуации', 'entry-followup': 'Буквы и короткие записи',
  foundation: 'Основы в разных ситуациях', upper: 'Условия и сообщения', clarifier: 'Уточняем рекомендацию',
};
const skills = {
  LAT: 'Чтение букв', BE: 'Формы to be', ASK: 'Порядок слов в вопросах', ORIENT: 'Время и расписания',
  NOTE: 'Короткие записки', NUM: 'Числа', CONSTRAINT: 'Несколько условий', WRITE: 'Сообщение из предложенных слов',
  GIST: 'Главная мысль текста', MEDIATE: 'Передача актуальных сведений',
};
const reasons = {
  preparation: 'В заданиях с буквами возникла повторная трудность. Можно выбрать короткую подготовку.',
  'targeted-be': 'Полезно потренировать формы to be. Другие наблюдения показаны ниже.',
  'targeted-ask': 'Полезно потренировать порядок слов в вопросах. Другие наблюдения показаны ниже.',
  'late-a1': 'Ответы на базовые задания позволяют попробовать этот раздел. Некоторые темы ещё требуют уточнения.',
  'a2-entry': 'Ответы позволяют попробовать начало A2. Для более позднего старта пока мало данных.',
  'later-a2': 'Вы справились с условиями и составлением сообщения из предложенных слов. Можно попробовать этот урок.',
};
const title = (id: string) => lessons.find(lesson => lesson.id === id)?.title;

export function FastPlacementPage({ route }: { route: string }) {
  const adaptive = useAdaptive()!;
  const { progress } = useProgress();
  const { host, write, busy } = adaptive;
  const fast = host.engine.fast!;
  const entry = fast.entry();
  const view = fast.view();
  const result = fast.result();
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [view?.status, view?.presented, active]);
  const headingNode = (text: string) => <h1 ref={heading} tabIndex={-1}>{text}</h1>;
  function href(id: string) {
    const lesson = lessons.find(entry => entry.id === id)?.lesson;
    return `#/lesson/${id}/${lesson ? resumeStep(progress, lesson) : progress.lastVisited?.lessonId === id ? progress.lastVisited.stepId : 'intro'}`;
  }
  const continuation = <LinkButton href={entry.resume ? href(entry.resume) : '#/course/a1'} secondary>
    {entry.resume ? 'Продолжить обучение' : 'К программе курса'}
  </LinkButton>;
  async function begin() {
    const id = crypto.randomUUID();
    if (await write(() => fast.begin(id)) && fast.view()?.sessionId === id) { setActive(true); setNotice(''); }
    else setNotice('Новый вариант сейчас недоступен. Можно продолжить обучение.');
  }
  async function action(action: 'pause' | 'resume' | 'finish') {
    const cursor = fast.sessionCursor();
    if (cursor && await write(() => fast.action(cursor, action))) {
      setActive(action !== 'pause');
      setNotice('');
    }
  }
  async function select(selection: Selection) {
    const cursor = fast.view()?.cursor;
    if (!cursor) return false;
    return write(() => fast.select(cursor, selection));
  }
  async function submit(response: FastResponse) {
    const cursor = fast.view()?.cursor;
    if (cursor) await write(() => fast.submit(cursor, response));
  }
  async function choose(kind: Acceptance['kind'], lessonId: string) {
    if (result) {
      if (!await write(() => fast.accept(result.sessionId, { kind, lessonId }))) return;
      if (fast.result()?.accepted?.lessonId !== lessonId) { setNotice('Этот выбор сейчас недоступен. Можно вернуться к курсу.'); return; }
    } else if (kind !== 'recommendation') {
      if (!await write(() => host.engine.choose({ type: 'start', route: kind }))) return;
    }
    if (host.engine.access(lessonId).available) window.location.hash = href(lessonId);
  }
  const elective = <>{entry.a1 && <button className="button button-secondary" disabled={busy}
    onClick={() => void choose('a1', entry.a1!)}>Начать с основ A1</button>}
    {entry.preA1 && <button className="button button-secondary" disabled={busy}
      onClick={() => void choose('pre-a1', entry.preA1!)}>Подготовка к A1</button>}</>;
  const showResult = result && (route !== '/diagnostic/new' || active);
  return <section className="lesson-panel adaptive-panel" aria-label="Быстрый подбор старта"><div className="lesson-panel-content">
    {route === '/start' ? <>
      {headingNode(entry.resume ? 'Продолжить обучение' : 'С чего начать')}
      {entry.resume && <p>Ваш урок — «{title(entry.resume)}».</p>}
      <div className="adaptive-actions">{continuation}{elective}
        <LinkButton href="#/diagnostic" secondary>Подобрать учебный старт</LinkButton></div>
    </> : entry.protectedData || entry.incompatibleDraft ? <>
      {headingNode('Диагностику пока нельзя продолжить')}
      <p>{entry.protectedData ? 'Сохранённые данные требуют восстановления. Ваш учебный маршрут остаётся доступен.' : 'Задания обновились. Можно начать новую диагностику.'}</p>
      <div className="adaptive-actions">{entry.canStart && <button className="button button-primary" disabled={busy} onClick={() => void begin()}>Начать новую диагностику</button>}{continuation}</div>
    </> : entry.resumable && (!active || view?.status === 'paused') ? <>
      {headingNode('У вас есть незавершённая диагностика')}
      <p>Отправленные ответы и выбранные слова сохранены. Можно продолжить позже.</p>
      <div className="adaptive-actions">
        <button className="button button-primary" disabled={busy} onClick={() => void action('resume')}>Продолжить диагностику</button>
        <button className="button button-secondary" disabled={busy} onClick={() => void action('finish')}>Посмотреть предварительный результат</button>{continuation}
      </div>
    </> : active && view?.prompt ? <>
      {headingNode('Подбор учебного старта')}
      <p role="status">Задание {view.presented} · {phases[view.phase]}</p>
      <form onSubmit={event => { event.preventDefault(); if (view.selection) void submit(view.selection); }}>
        <fieldset className="exercise-card" disabled={busy}>
          <legend>{view.prompt.instruction}</legend>
          <p className="exercise-prompt" lang={/[а-яё]/i.test(view.prompt.prompt) ? 'ru' : 'en'}>{view.prompt.prompt}</p>
          {view.prompt.format === 'cards' ? <FastCards tokens={view.prompt.tokens}
            selected={view.selection?.type === 'cards' ? view.selection.tokenIds : []} busy={busy}
            change={ids => select({ type: 'cards', tokenIds: ids })} /> :
            <div className="choice-options">{view.prompt.options.map(option => <label className={`choice-option ${view.selection?.type === 'option' && view.selection.optionId === option.id ? 'selected' : ''}`} key={option.id}>
              <input type="radio" name={view.prompt!.id} disabled={busy} checked={view.selection?.type === 'option' && view.selection.optionId === option.id}
                onChange={() => void select({ type: 'option', optionId: option.id })} />
              <span lang={/[а-яё]/i.test(option.label) ? 'ru' : 'en'}>{option.label}</span>
            </label>)}</div>}
          <div className="adaptive-actions"><button className="button button-primary" type="submit" disabled={busy || !view.selection || view.selection.type === 'cards' && !view.selection.tokenIds.length}>Проверить ответ</button>
            <button className="button button-secondary" type="button" disabled={busy} onClick={() => void submit({ type: 'skip' })}>Пропустить</button>
            <button className="button button-secondary" type="button" disabled={busy} onClick={() => void submit({ type: 'unknown' })}>Не знаю</button></div>
        </fieldset>
      </form>
      <div className="adaptive-actions">
        <button className="button button-secondary" disabled={busy} onClick={() => void action('pause')}>Выйти и продолжить позже</button>
        <button className="button button-secondary" disabled={busy} onClick={() => void action('finish')}>Посмотреть предварительный результат</button></div>
    </> : showResult ? <>
      {headingNode('Предварительный результат')}
      <p>Это ориентир для выбора урока по коротким текстовым заданиям. Самостоятельное письмо, аудирование и устная речь здесь не проверялись.</p>
      {result.recommendation && title(result.recommendation.lessonId) ? <>
        <h2>Можно начать с «{title(result.recommendation.lessonId)}»</h2><p>{reasons[result.recommendation.reason]}</p>
      </> : <p>Пока недостаточно данных для точной рекомендации.</p>}
      {result.reason === 'exhausted' && <p>Подходящие свежие задания закончились. Результат учитывает только отправленные ответы.</p>}
      <p>Показано заданий: {result.presented}. Пропущено: {result.skipped}. Ответов «Не знаю»: {result.unknown}.</p>
      <ul>{result.knowledge.map(item => <li key={item.group}>{skills[item.group]} · {item.status === 'disputed' ? 'ответы расходятся' : item.direction === '+' ? 'есть предварительная опора' : item.direction === '-' ? 'стоит потренировать' : 'пока мало данных'}
        {item.status === 'limited' && ' · одно наблюдение'}{item.supportedPositive && ' · с предложенными словами'}</li>)}</ul>
      <div className="adaptive-actions">{continuation}
        {result.recommendation && title(result.recommendation.lessonId) && <button className="button button-primary" disabled={busy}
          onClick={() => void choose('recommendation', result.recommendation!.lessonId)}>Начать с этого урока</button>}
        {elective}{result.canRetake && <LinkButton href="#/diagnostic/new" secondary>Пройти другой вариант</LinkButton>}
      </div>
    </> : <>
      {headingNode('Подобрать учебный старт')}
      {entry.legacyDraft && <p>Предыдущая диагностика сохранена в прежнем формате. Для нового подбора используйте короткую проверку.</p>}
      <p>Обычно 10–15 заданий и около 3–5 минут. Проверка может закончиться раньше. Печатать не нужно: выбирайте ответы и собирайте фразы из слов.</p>
      <p>Можно пропустить задание, остановиться или посмотреть предварительный результат в любой момент.</p>
      <div className="adaptive-actions">{entry.canStart ? <button className="button button-primary" disabled={busy} onClick={() => void begin()}>Начать диагностику</button>
        : <p>Свежих вариантов сейчас нет. Можно продолжить обучение.</p>}{continuation}{elective}</div>
    </>}
    {notice && <p role="status">{notice}</p>}
  </div></section>;
}
