import { useAdaptive } from '../components/adaptive/AdaptiveContext';
import { formatLessonCount } from '../lib/format';
import { LinkButton } from '../components/LinkButton';
import { Icon } from '../components/Icon';
import { useProgress } from '../lib/ProgressContext';
import { lessons } from '../content/course';

export function HomePage() {
  const { progress } = useProgress();
  const last = progress.lastVisited;
  const adaptive = useAdaptive();
  const entry = adaptive?.host.engine.entry();
  const next = lessons.find(lesson => entry?.resume === lesson.id);
  return <>
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <span className="pill"><span className="status-dot" />Бесплатно. Без регистрации.</span>
        <h1 id="home-title">Английский.<br />С понятного<br />начала.</h1>
        <p className="lead">Небольшие уроки, понятные правила и практика. Учитесь в своём темпе — шаг за шагом, от первой фразы.</p>
        <LinkButton href={last ? `#/lesson/${last.lessonId}/${last.stepId}` : adaptive ? '#/start' : '#/course/a1'}>{last ? adaptive ? 'Продолжить обучение' : 'Продолжить учиться' : 'Начать учиться'} <Icon name="arrow" /></LinkButton>
        <p className="hero-note">{next ? `Ваш урок — «${next.title}».` : 'Первый шаг — базовый курс A1'}</p>
        {adaptive && (entry?.resumable || entry?.incompatibleDraft || entry?.diagnosticAvailable
          ? <a className="text-link" href={entry.resumable || entry.incompatibleDraft ? '#/diagnostic' : adaptive.host.engine.result() ? '#/diagnostic/new' : '#/diagnostic'}>
            {entry.resumable ? 'Продолжить диагностику' : entry.incompatibleDraft ? 'О незавершённой диагностике'
              : adaptive.host.engine.result() ? 'Пройти диагностику снова' : 'Подобрать учебный старт'}
          </a>
          : <p className="muted">{adaptive.host.engine.result()
            ? 'Доступные варианты диагностики пройдены. Можно продолжить обучение.'
            : 'Диагностика пока недоступна. Можно продолжить обучение.'}</p>)}

      </div>
      <div className="study-visual" aria-label="Формы глагола to be: I am, you are, we are">
        <div className="notebook-top"><Icon name="book" /><span>Ваше первое знакомство с английским</span><span className="level-tag">A1</span></div>
        <div className="phrase"><span>I</span><strong>am.</strong><small>Я. Уже хорошее начало.</small></div>
        <div className="phrase"><span>You</span><strong>are.</strong><small>Ты. Учимся говорить о себе.</small></div>
        <div className="phrase"><span>We</span><strong>are.</strong><small>Мы. Дальше — больше.</small></div>
        <div className="notebook-bottom"><span>От простого правила к своей фразе</span><Icon name="arrow" /></div>
      </div>
    </section>
    <section className="levels-section" aria-labelledby="levels-title">
      <div className="section-heading"><div><h2 id="levels-title">Ваш путь в английском</h2><p>Начните с основ и двигайтесь к повседневным задачам A2.</p></div><span className="muted">4 уровня · один понятный путь</span></div>
      <div className="level-grid">
        {['A1', 'A2', 'B1', 'B2'].map((level, i) => <article className={`level-card ${i < 2 ? 'level-available' : ''}`} key={level}>
          <div className="level-card-top"><span className="level-number">{level}</span><span className={`pill ${i < 2 ? 'pill-accent' : ''}`}>{i === 0 ? 'Доступен' : i === 1 ? 'По порядку после A1' : 'Скоро'}</span></div>
          <h3>{['Самое начало', 'Больше уверенности', 'Свобода общения', 'Новый горизонт'][i]}</h3>
          <p>{['Базовая грамматика и первые фразы о себе.', 'Повседневные ситуации и простые диалоги.', 'Разговоры, мнения и самостоятельность.', 'Точные формулировки и сложные темы.'][i]}</p>
          {i < 2 ? <a className="text-link" href={`#/course/${level.toLowerCase()}`}>Посмотреть {formatLessonCount(lessons.filter(entry => (entry.level ?? entry.lesson?.level) === level).length)} <Icon name="arrow" /></a> : <span className="upcoming"><Icon name="lock" /> В разработке</span>}
        </article>)}
      </div>
    </section>
    <section className="method-section" aria-labelledby="method-title"><h2 id="method-title">Меньше спешки.<br />Больше понимания.</h2><div className="method-items">{[['Поймите правило', 'Короткая теория с примерами и переводом.'], ['Попробуйте сами', 'От выбора ответа к самостоятельным фразам.'], ['Закрепите знания', 'Разбор ошибок и итог после каждого урока.']].map(([title, text], i) => <div key={title}><span className="method-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
  </>;
}
