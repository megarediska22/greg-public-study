import { useEffect, useRef } from 'react';
import { useRoute } from './lib/router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CoursePage } from './pages/CoursePage';
import { LessonPage } from './pages/LessonPage';
import { lessons } from './content/course';
import { LinkButton } from './components/LinkButton';

export function App({ themeStorageKey }: { themeStorageKey?: string } = {}) {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(route);
  const match = /^\/lesson\/([^/]+)\/([^/]+)$/.exec(route);
  const entry = lessons.find(item => item.id === match?.[1]);
  const step = entry?.lesson?.steps.find(item => item.id === match?.[2]);
  const title = route === '/' ? 'Английский с понятного начала' : route === '/course/a1' ? 'Курс A1' : entry ? `${entry.title}${step ? ` — ${step.title}` : ''}` : 'Страница не найдена';
  useEffect(() => {
    document.title = `${title} | Greg Public Study`;
    if (previousRoute.current !== route) {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousRoute.current = route;
    }
  }, [route, title]);
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>Перейти к содержимому</a><Header route={route} themeStorageKey={themeStorageKey} /><main id="main-content" className="main-container" tabIndex={-1} ref={mainRef}>{route === '/' ? <HomePage /> : route === '/course/a1' ? <CoursePage /> : entry && match ? <LessonPage key={entry.id} entry={entry} stepId={match[2]} /> : <section className="not-found"><h1>Здесь пока нет страницы</h1><p>Вернитесь к программе и выберите доступный урок.</p><LinkButton href="#/course/a1">К курсу A1</LinkButton></section>}</main><Footer /></>;
}
