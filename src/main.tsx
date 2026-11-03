import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { ProgressProvider } from './lib/ProgressContext';

const root = createRoot(document.getElementById('root')!);
if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('qa') === '1' && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)) {
  // This import and its entire module tree are removed by the production build.
  const { mountLocalQa } = await import('./dev/qa');
  mountLocalQa(root);
} else {
  root.render(<ProgressProvider><App /></ProgressProvider>);
}
