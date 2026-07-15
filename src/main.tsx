import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme before render to prevent flash
(function initTheme() {
  const saved = localStorage.getItem('sc_theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();

createRoot(document.getElementById('root')!).render(<App />);
