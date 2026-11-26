import { useEffect, useRef, useState } from 'react';
import { lessons } from '../../content/course';
import { adaptiveCatalog, type Block } from '../../lib/adaptive/model';
import type { Start } from '../../lib/adaptive/routes';
import { useProgress } from '../../lib/ProgressContext';
import { resumeStep } from '../../lib/progress';
import { LinkButton } from '../LinkButton';
import { AdaptiveQuestion, type Response } from './AdaptiveQuestion';
import { useAdaptive } from './AdaptiveContext';
import { Checkpoint } from './Checkpoint';

const phase: Record<Block, string> = {
  D0: 'Буквы и числа', D0R: 'Буквы и короткие записи', D1: 'Короткие тексты и фразы',
  'D2-BASE': 'Повседневные ситуации', 'D2-UP': 'Условия и короткие ответы', D3: 'Уточняющие задания',
};
const lessonName = (id: string) => lessons.find(entry => entry.id === id)?.title;
const skillName = (id: string) => adaptiveCatalog.groups.find(group => group.id === id)?.name ?? 'Проверяемое умение';

function reason(start: Start) {
  switch (start.reason) {
    case 'gap': return `В заданиях на тему «${skillName(start.group ?? '')}» возникали трудности. Этот урок поможет потренироваться.`;
    case 'profile': return 'Самостоятельные ответы в этой проверке и предыдущие результаты подтверждают готовность к этому уроку.';
    case 'resume': return 'Ваш прежний урок по-прежнему доступен.';
    case 'preparation': return 'Этот урок поможет освоиться с чтением английских букв.';
    case 'insufficient': return 'Данных пока мало. Можно начать с базового урока.';
    default: return 'Этот урок подходит для старта с основ.';
  }
}

export default function AdaptivePage({ route }: { route: string }) {
  const adaptive = useAdaptive();
  const { progress } = useProgress();
  const [startedHere, setStartedHere] = useState(false);
  const [notice, setNotice] = useState('');
  const panel = useRef<HTMLElement>(null);
  const diagnosticState = adaptive?.host.engine.diagnostic()?.status;
  const incompatible = adaptive?.host.engine.entry().incompatibleDraft;
  useEffect(() => {
    if (!startedHere || diagnosticState !== 'active')
      panel.current?.querySelector('h1')?.focus();
  }, [diagnosticState, incompatible, startedHere]);
  if (!adaptive) return null;
  const { host, write, busy } = adaptive;
  const { engine } = host;
  const entry = engine.entry();
  const diagnostic = engine.diagnostic();
  const checkpointId = route.startsWith('/checkpoint/') ? route.slice('/checkpoint/'.length) : null;
  const course = '#/course/a1';

  function hrefFor(id: string) {
    const lesson = lessons.find(entry => entry.id === id)?.lesson;
    const visited = progress.lastVisited?.lessonId === id ? progress.lastVisited.stepId : null;
    return `#/lesson/${id}/${lesson ? resumeStep(progress, lesson) : visited ?? 'intro'}`;
  }

  const ordinary = entry.resume && lessonName(entry.resume) && (host.protectedData || engine.access(entry.resume).available) ? hrefFor(entry.resume) : course;
  const go = (href: string) => { window.location.hash = href; };
  async function openStart(route: 'pre-a1' | 'a1', id: string) {
    if (await write(() => engine.choose({ type: 'start', route })) && engine.access(id).available) go(hrefFor(id));
    else setNotice('Этот урок пока не удалось открыть.');
  }

  async function start() {
    const id = crypto.randomUUID();
    if (await write(() => engine.begin(id)) && engine.diagnostic()?.id === id) {
      setStartedHere(true);
      setNotice('');
    } else setNotice('Сейчас не хватает заданий для новой диагностики. Можно продолжить обучение.');
  }

  async function act(action: Parameters<typeof engine.diagnosticAction>[0]) {
    if (!await write(() => engine.diagnosticAction(action))) return;
    const next = engine.diagnostic();
    if (action === 'pause' && next?.status === 'paused') {
      setStartedHere(false);
      setNotice('Диагностика приостановлена. Отправленные ответы сохранены.');
    } else if (action === 'resume' && ['active', 'offer-upper'].includes(next?.status ?? '')) {
      setStartedHere(true);
      setNotice('');
    } else if (next?.status === 'finished') {
      setStartedHere(true);
      setNotice('');
    }
  }

  async function answer(response: Response) {
    const card = diagnostic?.prompt;
    if (!card || !diagnostic) return;
    const key = `${diagnostic.id}:${card.slot}:${card.id}`;
    if (await write(() => engine.submit({ ...response, slot: card.slot, itemId: card.id, key }))) {
      const next = engine.diagnostic();
      setNotice(next?.prompt?.slot === card.slot ? 'Ответ не записан. Проверьте ввод.' : '');
    }
  }

  async function accept(id: string) {
    if (await write(() => engine.choose({ type: 'accept', lessonId: id }))) {
      const choice = engine.result()?.record?.choice;
      if (choice?.type === 'accepted' && choice.lessonId === id && engine.access(id).available) go(hrefFor(id));
      else setNotice('Рекомендованный урок пока не удалось открыть.');
    }
  }
  async function decline() {
    if (!await write(() => engine.declinePlacement())) return;
    if (engine.result()?.record?.choice?.type === 'declined') go(ordinary);
  }
  const leave = <LinkButton href={ordinary} secondary>{entry.resume ? 'Продолжить обучение' : 'К программе курса'}</LinkButton>;
  const startButton = <button className="button button-primary" disabled={busy || !entry.diagnosticAvailable} onClick={() => void start()}>Начать новую диагностику</button>;
  const result = engine.result();

  return <section ref={panel} className="lesson-panel adaptive-panel" aria-label="Подбор учебного старта">
    <div className="lesson-panel-content">
      {checkpointId ? <Checkpoint id={checkpointId} /> : route === '/start' ? <>
        <h1 tabIndex={-1}>{entry.showChoice ? 'Начать с нуля' : 'Продолжить обучение'}</h1>
        {entry.resume && lessonName(entry.resume) && <p>Ваш урок — «{lessonName(entry.resume)}».</p>}
        {!entry.preA1 && <p>Подготовительный раздел пока недоступен. Можно начать с первого урока A1.</p>}
        <div className="adaptive-actions">
          {entry.resume && leave}
          {entry.preA1 && <button className="button button-secondary" disabled={busy}
            onClick={() => void openStart('pre-a1', entry.preA1!)}>Подготовка к A1</button>}
          {entry.a1 && <button className="button button-primary" disabled={busy}
            onClick={() => void openStart('a1', entry.a1!)}>Сразу к A1</button>}
          <LinkButton href={result ? '#/diagnostic/new' : '#/diagnostic'} secondary>
            {result ? 'Пройти диагностику снова' : 'Подобрать учебный старт'}
          </LinkButton>
          {!entry.resume && leave}
        </div>
        {entry.preA1 && <p>Если пока трудно читать английские буквы, можно начать с подготовки.</p>}
      </> : entry.incompatibleDraft ? <>
        <h1 tabIndex={-1}>Задания обновились</h1>
        <p>Эту диагностику уже нельзя продолжить с того же места.</p>
        <div className="adaptive-actions">{startButton}{leave}</div>
        {!entry.diagnosticAvailable && <p>Для новой диагностики пока не хватает проверенных заданий.</p>}
      </> : entry.resumable && (!startedHere || diagnostic?.status === 'paused') ? <>
        <h1 tabIndex={-1}>У вас есть незавершённая диагностика</h1>
        <p>Отправленные ответы сохранены. Можно вернуться к следующему заданию.</p>
        <div className="adaptive-actions">
          <button className="button button-primary" disabled={busy} onClick={() => void act('resume')}>Продолжить диагностику</button>
          <button className="button button-secondary" disabled={busy} onClick={() => void act('finish')}>Завершить сейчас</button>
          {leave}
        </div>
      </> : diagnostic?.status === 'offer-upper' ? <>
        <h1 tabIndex={-1}>Дополнительная проверка</h1>
        <p>Хотите проверить, подойдёт ли вам заключительный раздел?</p>
        <div className="adaptive-actions">
          <button className="button button-primary" disabled={busy} onClick={() => void act('upper')}>Ещё несколько заданий</button>
          <button className="button button-secondary" disabled={busy} onClick={() => void act('decline-upper')}>Посмотреть результат</button>
          <button className="button button-secondary" disabled={busy} onClick={() => void act('pause')}>Выйти и продолжить позже</button>
        </div>
      </> : diagnostic?.prompt ? <>
        <h1 tabIndex={-1}>Подбор учебного старта</h1>
        <p role="status">Задание {diagnostic.prompt.slot + 1} · {phase[diagnostic.prompt.block]}</p>
        <AdaptiveQuestion key={`${diagnostic.id}/${diagnostic.prompt.slot}`} prompt={diagnostic.prompt} busy={busy} focus onAnswer={answer} />
        <button className="button button-secondary" disabled={busy} onClick={() => void act('pause')}>Выйти и продолжить позже</button>
      </> : result && (route !== '/diagnostic/new' || startedHere) ? <>
        <h1 tabIndex={-1}>Результат диагностики</h1>
        {diagnostic?.reason === 'insufficient-items' && <p>Для продолжения не хватило проверенных заданий.</p>}
        {['insufficient-items', 'manual', 'early-uncertain'].includes(diagnostic?.reason ?? '') && <p>Данных пока мало.</p>}
        {result.placement?.start && lessonName(result.placement.start.lessonId) ? <>
          <h2>Рекомендуем «{lessonName(result.placement.start.lessonId)}»</h2>
          <p>{reason(result.placement.start)}</p>
        </> : <p>Сейчас нет готового урока для рекомендации. Можно вернуться к программе курса.</p>}
        <ResultDetails knowledge={result.knowledge} />
        <details><summary>Что проверяли</summary><p>Чтение коротких текстов и письменные ответы. Устная речь, произношение, аудирование и свободное письмо не проверялись.</p>
          <ul>{result.knowledge.filter(item => item.checked).map(item => <li key={item.criterion.id}>{skillName(item.criterion.group)}</li>)}</ul>
        </details>
        <div className="adaptive-actions">
          {result.placement?.start && lessonName(result.placement.start.lessonId) && <button className="button button-primary" disabled={busy}
            onClick={() => void accept(result.placement!.start!.lessonId)}>Начать с этого урока</button>}
          {result.placement?.earlier && result.placement.earlier.lessonId !== result.placement.start?.lessonId &&
            lessonName(result.placement.earlier.lessonId) && <button className="button button-secondary" disabled={busy}
              onClick={() => void accept(result.placement!.earlier!.lessonId)}>Выбрать более ранний урок · {lessonName(result.placement.earlier.lessonId)}</button>}
          <button className="button button-secondary" disabled={busy} onClick={() => void decline()}>{entry.resume ? 'Продолжить с моего урока' : 'Продолжить обычное обучение'}</button>
          {leave}
        </div>
      </> : <>
        <h1 tabIndex={-1}>Подобрать учебный старт</h1>
        {entry.diagnosticAvailable ? <>
          <p>Подберём, с какого урока начать. Обычно потребуется 20–28 заданий и около 8–12 минут. В некоторых случаях проверка закончится раньше.</p>
          <p>Задания проверяют английский в текстах и коротких ответах. Можно остановиться и вернуться позже.</p>
          <div className="adaptive-actions"><button className="button button-primary" disabled={busy} onClick={() => void start()}>Начать диагностику</button>{leave}</div>
        </> : <>
          <p>Диагностика пока недоступна. Можно учиться по обычной программе.</p>
          {leave}
        </>}
      </>}
      {notice && <p role="status">{notice}</p>}
    </div>
  </section>;
}

type Knowledge = NonNullable<ReturnType<NonNullable<ReturnType<typeof useAdaptive>>['host']['engine']['result']>>['knowledge'];

function ResultDetails({ knowledge }: { knowledge: Knowledge }) {
  const lists = [
    { heading: 'Получилось самостоятельно', items: knowledge.filter(item => item.fresh.state === 'CONFIRMED') },
    { heading: 'Стоит потренировать', items: knowledge.filter(item => ['GAP', 'REVIEW'].includes(item.fresh.state)) },
    { heading: 'Пока мало данных', items: knowledge.filter(item => ['UNKNOWN', 'PRELIMINARY', 'MIXED'].includes(item.fresh.state)) },
  ];
  return <div className="adaptive-result">
    {lists.map(({heading, items}) => <section key={heading}>
      <h3>{heading}</h3>
      {items.length ? <ul>{items.map(item => <li key={item.criterion.id}>{skillName(item.criterion.group)}
        {item.fresh.state === 'MIXED' && ' · ответы неоднозначны'}
        {item.unanswered > 0 && ` · без ответа: ${item.unanswered}`}
        {item.checked === 0 && ' · не проверялось'}
        {item.historical.state === 'CONFIRMED' && item.fresh.state !== 'CONFIRMED' && ' · получалось в прошлых проверках'}
      </li>)}</ul> : <p>Нет отмеченных тем.</p>}
    </section>)}
  </div>;
}
