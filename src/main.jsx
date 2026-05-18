import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force unregister Service Worker on localhost preview to prevent aggressive offline caching
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '192.168.1.111') &&
  'serviceWorker' in navigator
) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    let unregisteredAny = false;
    for (const registration of registrations) {
      registration.unregister();
      unregisteredAny = true;
    }
    if (unregisteredAny) {
      console.log('Unregistered service worker to clear development cache.');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
