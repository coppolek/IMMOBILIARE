import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept benign Google AdSense TagError in Single-Page Application lifecycle
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || (event?.error && event.error.message) || '';
      if (
        msg.includes('adsbygoogle') ||
        msg.includes('TagError') ||
        msg.includes("All 'ins' elements in the DOM with class=adsbygoogle already have ads in them")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || String(event?.reason || '');
    if (
      reason.includes('adsbygoogle') ||
      reason.includes('TagError') ||
      reason.includes("All 'ins' elements in the DOM with class=adsbygoogle already have ads in them")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
