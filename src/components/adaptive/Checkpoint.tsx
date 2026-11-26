import { useEffect, useState } from 'react';
import { finalSkillLabels, finalSkillTips } from '../../content/blueprint/pk05Evidence';
import { loadLesson } from '../../content/extension/registry';
import { adaptiveCatalog, pilotCriteria } from '../../lib/adaptive/model';
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
  const { engine, content } = adaptive.host;
  const active = engine.checkpointAttempt(id);
  const attempt = active?.id;
  const index = profile.items.findIndex(itemId => !active?.items.includes(itemId));
  const criterionTitle = (id: string) => {
    const ref = [...content.rules.criteria, ...pilotCriteria].find(criterion => criterion.id === id);
    return adaptiveCatalog.groups.find(group => group.id === ref?.group)?.name ?? 'Проверяемое умение';
  };
  const questions = profile.items.map(itemId => lesson?.steps.flatMap(step => step.type === 'exercise' ? step.questions : []).find(q => q.id === itemId));
  const prompt = questions[index];
  async function begin() {
    const next = crypto.randomUUID();
    await write(async () => {
      const status = await engine.beginCheckpoint(id, next);
      if (status === 'saved') setNotice('');
      return status;
    });
  }
  async function answer(response: Response) {
    if (!attempt || !prompt) return;
    await write(async () => {
      const status = await engine.checkpointAnswer(id, attempt, prompt.id, response);
      if (status === 'unchanged') setNotice('Ответ не записан. Проверьте ввод или начните новую попытку.');
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

  const confirmed = state.criteria.filter(item => item.fresh && item.state === 'CONFIRMED');
  const preliminary = state.criteria.filter(item => item.fresh && item.state !== 'CONFIRMED');
  const review = state.criteria.filter(item => !item.fresh);
  const skill = (id: string) => row.mode === 'FINAL_TEXT' && Object.hasOwn(finalSkillLabels, id)
    ? finalSkillLabels[id as keyof typeof finalSkillLabels] : criterionTitle(id);
  const feedback = (id: string) => row.mode === 'FINAL_TEXT' && Object.hasOwn(finalSkillTips, id)
    ? <p>{finalSkillTips[id as keyof typeof finalSkillTips]}</p> : null;

  return <>
    <h1>Контрольная</h1>
    {attempt && state.completedAttempt ? <>
      <p role="status">{state.status === 'independent' ? 'Самостоятельная готовность подтверждена.' : 'Попытка завершена.'}</p>
      {confirmed.length > 0 && <><h2>Получилось самостоятельно</h2>
        <ul>{confirmed.map(({ criterion }) => <li key={criterion.id}>{skill(criterion.id)}</li>)}</ul>
      </>}
      {preliminary.length > 0 && <><h2>Есть верный самостоятельный ответ</h2>
        <ul>{preliminary.map(({ criterion }) => <li key={criterion.id}>{skill(criterion.id)}{feedback(criterion.id)}</li>)}</ul>
        {row.mode !== 'FINAL_TEXT' && <p>Попробуйте другой материал по этим умениям, чтобы проверить результат ещё раз.</p>}
      </>}
      {review.length > 0 && <><h2>Стоит потренировать</h2>
        <ul>{review.map(({ criterion }) => <li key={criterion.id}>{skill(criterion.id)}{feedback(criterion.id)}</li>)}</ul>
      </>}
      <div className="adaptive-actions">
        {row.mode === 'BRIDGE' && state.next && <button className="button button-primary" disabled={busy}
          onClick={() => void transition(state.status === 'independent' ? 'independent' : 'supported')}>
          {state.status === 'independent' ? 'Продолжить' : 'Продолжить с опорой'}
        </button>}
        {row.id === 'CP-PRE' && state.next && <LinkButton href={`#/lesson/${state.next}/intro`}>Перейти к A1</LinkButton>}
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
