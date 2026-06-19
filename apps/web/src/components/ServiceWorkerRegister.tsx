'use client';

import { useEffect } from 'react';

// Registers the service worker (offline support + installable PWA). No-op where unsupported.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = (): void => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration failed — app still works online */
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
