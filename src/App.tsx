import { lazy, Suspense, useEffect, useRef } from 'react';
import { useRoute } from './lib/router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CoursePage } from './pages/CoursePage';
import { LessonPage } from './pages/LessonPage';
import { lessons } from './content/course';
import { LinkButton } from './components/LinkButton';
import { useAdaptive } from './components/adaptive/AdaptiveContext';

const AdaptivePage = __ONLINE_BETA__ || import.meta.env.DEV ? lazy(() => import('./components/adaptive/AdaptivePage')) : null;

export function App({ themeStorageKey, persistTheme }: {
  themeStorageKey?: string; persistTheme?: (theme: 'light' | 'dark') => Promise<boolean>;
} = {}) {
  const route = useRoute();
  const adaptive = useAdaptive();
  const adaptiveRoute = AdaptivePage && adaptive && (/^\/(start|diagnostic(?:\/new)?|checkpoint\/[^/]+)$/.test(route));
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(route);
  const match = /^\/lesson\/([^/]+)\/([^/]+)$/.exec(route);
  const entry = lessons.find(item => item.id === match?.[1]);
  const step = entry?.lesson?.steps.find(item => item.id === match?.[2]);
  const title = adaptiveRoute ? 'Учебный маршрут' : route === '/' ? 'Английский с понятного начала' : route === '/course/a1' || route === '/course/a2' ? 'Курс A1 → A2' : entry ? `${entry.title}${step ? ` — ${step.title}` : ''}` : 'Страница не найдена';
  useEffect(() => {
    document.title = `${title} | Greg Public Study`;
    if (previousRoute.current !== route) {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousRoute.current = route;
    }
  }, [route, title]);
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>Перейти к содержимому</a><Header route={route} themeStorageKey={themeStorageKey} persistTheme={persistTheme} /><main id="main-content" className="main-container" tabIndex={-1} ref={mainRef}>{AdaptivePage && adaptiveRoute ? <Suspense fallback={<p role="status">Загружаем учебный маршрут…</p>}><AdaptivePage key={route} route={route} /></Suspense> : route === '/' ? <HomePage /> : route === '/course/a1' || route === '/course/a2' ? <CoursePage level={route === '/course/a2' ? 'A2' : undefined} /> : entry && match ? <LessonPage key={entry.id} entry={entry} stepId={match[2]} /> : <section className="not-found"><h1>Здесь пока нет страницы</h1><p>Вернитесь к программе и выберите доступный урок.</p><LinkButton href="#/course/a1">К курсу A1</LinkButton></section>}</main><Footer /></>;
}
