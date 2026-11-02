import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { ProgressProvider } from './lib/ProgressContext';

createRoot(document.getElementById('root')!).render(<ProgressProvider><App /></ProgressProvider>);
