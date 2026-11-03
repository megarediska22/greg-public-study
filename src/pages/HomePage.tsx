import { LinkButton } from '../components/LinkButton';
import { Icon } from '../components/Icon';
import { useProgress } from '../lib/ProgressContext';
import { lessons } from '../content/course';

export function HomePage() {
  const { progress } = useProgress();
  const last = progress.lastVisited;
  return <>
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <span className="pill"><span className="status-dot" />Бесплатно. Без регистрации.</span>
        <h1 id="home-title">Английский.<br />С понятного<br />начала.</h1>
        <p className="lead">Небольшие уроки, понятные правила и практика. Учитесь в своём темпе — шаг за шагом, от первой фразы.</p>
        <LinkButton href={last ? `#/lesson/${last.lessonId}/${last.stepId}` : '#/course/a1'}>{last ? 'Продолжить учиться' : 'Начать учиться'} <Icon name="arrow" /></LinkButton>
        <p className="hero-note">Первый шаг — базовый курс A1</p>
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
      <div className="section-heading"><div><h2 id="levels-title">Ваш путь в английском</h2><p>Начните с основ. Остальные уровни появятся позже.</p></div><span className="muted">4 уровня · один понятный путь</span></div>
      <div className="level-grid">
        {['A1', 'A2', 'B1', 'B2'].map((level, i) => <article className={`level-card ${i === 0 ? 'level-available' : ''}`} key={level}>
          <div className="level-card-top"><span className="level-number">{level}</span><span className={`pill ${i === 0 ? 'pill-accent' : ''}`}>{i === 0 ? 'Доступен' : 'Скоро'}</span></div>
          <h3>{['Самое начало', 'Больше уверенности', 'Свобода общения', 'Новый горизонт'][i]}</h3>
          <p>{['Базовая грамматика и первые фразы о себе.', 'Повседневные ситуации и простые диалоги.', 'Разговоры, мнения и самостоятельность.', 'Точные формулировки и сложные темы.'][i]}</p>
          {i === 0 ? <a className="text-link" href="#/course/a1">Посмотреть {lessons.length} уроков <Icon name="arrow" /></a> : <span className="upcoming"><Icon name="lock" /> В разработке</span>}
        </article>)}
      </div>
    </section>
    <section className="method-section" aria-labelledby="method-title"><h2 id="method-title">Меньше спешки.<br />Больше понимания.</h2><div className="method-items">{[['Поймите правило', 'Короткая теория с примерами и переводом.'], ['Попробуйте сами', 'От выбора ответа к самостоятельным фразам.'], ['Закрепите знания', 'Разбор ошибок и итог после каждого урока.']].map(([title, text], i) => <div key={title}><span className="method-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
  </>;
}
