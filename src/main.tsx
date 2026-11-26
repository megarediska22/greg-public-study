import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { ProgressProvider } from './lib/ProgressContext';

const root = createRoot(document.getElementById('root')!);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('qa') === '1' && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) {
  // This import and its entire module tree are removed by the production build.
  const { mountLocalQa } = await import('./dev/qa');
  await mountLocalQa(root);
} else if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('adaptive') === '1' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) {
  const [{ AdaptiveRoot }, { adaptivePilot }] = await Promise.all([
    import('./components/adaptive/AdaptiveRoot'), import('./content/adaptivePilot'),
  ]);
  root.render(<AdaptiveRoot content={adaptivePilot} />);
} else {
  root.render(<ProgressProvider><App /></ProgressProvider>);
}
