import { createRoot } from 'react-dom/client';
import { AdapterFixture, checkpointFixture } from './adaptive-ui-data.mjs';
import { AdaptiveRoot } from '../../src/components/adaptive/AdaptiveRoot';
import '../../src/styles/global.css';

if (import.meta.env.DEV && ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname)) {
  const theme = localStorage.getItem('gps.theme.v1') === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  createRoot(document.getElementById('root')!).render(<AdaptiveRoot {...(new URLSearchParams(location.search).has('checkpoint') ? await checkpointFixture() : AdapterFixture)} />);
}
