'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA support.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // eslint-disable-next-line no-console
          console.log('[PWA] Service Worker registrado:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] SW error:', err);
        });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
