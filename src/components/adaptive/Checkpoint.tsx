import { useEffect, useState } from 'react';
import { loadLesson } from '../../content/extension/registry';
import { adaptiveCatalog } from '../../lib/adaptive/model';
import type { Lesson } from '../../types/lesson';
import { LinkButton } from '../LinkButton';
import { AdaptiveQuestion, type Response } from './AdaptiveQuestion';
import { useAdaptive } from './AdaptiveContext';

export function Checkpoint({ id }: { id: string }) {
  const adaptive = useAdaptive();
  const row = adaptiveCatalog.checkpoints.find(item => item.id === id);
  const host = adaptive?.host;
  const profile = host?.content.rules.checkpoints?.find(item => item.id === id);
  const state = host?.engine.checkpoint(id);
  const allowed = Boolean(row && profile && state?.status !== 'unavailable' && host?.engine.access(row.lesson).available);
  const [lesson, setLesson] = useState<Lesson>();
  const [attempt, setAttempt] = useState<string>();
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!allowed || !row) return;
    let active = true;
    loadLesson(row.lesson).then(value => { if (active) setLesson(value); })
      .catch(() => { if (active) setNotice('Не удалось загрузить задания. Можно вернуться к уроку.'); });
    return () => { active = false; };
  }, [allowed, row]);

  const back = <LinkButton href={allowed && row ? `#/lesson/${row.lesson}/intro` : '#/course/a1'} secondary>Продолжить обучение</LinkButton>;
  if (!adaptive || !row || !profile || !state || !allowed) return <>
    <h1>Контрольная пока недоступна</h1><p>Для этого раздела нужны проверенные задания и доступ к уроку.</p>{back}
  </>;
  const { write, busy } = adaptive;
  const { engine } = adaptive.host;
  const questions = profile.items.map(itemId => lesson?.steps.flatMap(step => step.type === 'exercise' ? step.questions : []).find(q => q.id === itemId));
  const prompt = questions[index];
  async function begin() {
    const next = crypto.randomUUID();
    await write(async () => {
      const status = await engine.beginCheckpoint(id, next);
      if (status === 'saved') { setAttempt(next); setIndex(0); setNotice(''); }
      return status;
    });
  }
  async function answer(response: Response) {
    if (!attempt || !prompt) return;
    await write(async () => {
      const status = await engine.checkpointAnswer(id, attempt, prompt.id, response);
      if (status === 'saved') setIndex(value => value + 1);
      else if (status === 'unchanged') setNotice('Ответ не записан. Проверьте ввод или начните новую попытку.');
      return status;
    });
  }
  async function transition(path: 'independent' | 'supported') {
    if (!attempt || !state?.next) return;
    const next = state.next;
    if (await write(() => engine.choose({ type: 'checkpoint', checkpointId: id, attempt, path })) && engine.access(next).available)
      window.location.hash = `#/lesson/${next}/intro`;
    else setNotice('Следующий урок пока не удалось открыть.');
  }

  return <>
    <h1>Контрольная</h1>
    {attempt && state.completedAttempt ? <>
      <p role="status">{state.status === 'independent' ? 'Самостоятельная готовность подтверждена.' : 'Попытка завершена.'}</p>
      <h2>Получилось самостоятельно</h2>
      {state.criteria.some(item => item.fresh && item.state === 'CONFIRMED') ? <ul>
        {state.criteria.filter(item => item.fresh && item.state === 'CONFIRMED').map(item => <li key={item.criterion.id}>{criterionTitle(item.criterion.id)}</li>)}
      </ul> : <p>Пока нет подтверждённых тем в этой попытке.</p>}
      {state.review.length > 0 && <><h2>Стоит потренировать</h2><ul>
        {state.review.map(item => <li key={item.id}>{criterionTitle(item.id)}</li>)}</ul></>}
      <div className="adaptive-actions">
        {row.mode === 'BRIDGE' && state.next && <button className="button button-primary" disabled={busy}
          onClick={() => void transition(state.status === 'independent' ? 'independent' : 'supported')}>
          {state.status === 'independent' ? 'Продолжить' : 'Продолжить с опорой'}
        </button>}
        <LinkButton href={`#/lesson/${row.lesson}/intro`} secondary>Повторить тему</LinkButton>
        <LinkButton href="#/course/a1" secondary>К программе курса</LinkButton>
      </div>
    </> : attempt && prompt ? <>
      <p role="status">Задание {index + 1} из {questions.length}</p>
      <AdaptiveQuestion key={prompt.id} prompt={{ ...prompt, options: prompt.type === 'choice' ? prompt.options : undefined }} busy={busy} onAnswer={answer} focus />
      {back}
    </> : <>
      <p>Ответьте на задания самостоятельно. В конце вы увидите, что получилось и что стоит повторить.</p>
      <div className="adaptive-actions">
        <button className="button button-primary" disabled={busy || questions.some(question => !question)} onClick={() => void begin()}>Начать контрольную</button>
        {back}
      </div>
      {!lesson && !notice && <p role="status">Загружаем задания…</p>}
      {lesson && questions.some(question => !question) && <p role="status">Часть проверенных заданий пока недоступна.</p>}
    </>}
    {notice && <p role="status">{notice}</p>}
  </>;
}

function criterionTitle(id: string) {
  return adaptiveCatalog.groups.find(group => group.placementCriterion === id)?.name ?? 'Проверяемое умение';
}
