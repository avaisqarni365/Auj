'use client';

import { useEffect } from 'react';

// The PWA service worker is retired (it caused stale pages after deploys). This now actively
// unregisters any installed SW and clears all caches, so the site is always served fresh from
// the network. (public/sw.js is a self-unregistering kill-switch for clients on an old build.)
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {
        /* ignore */
      });
    if (typeof caches !== 'undefined') {
      caches
        .keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {
          /* ignore */
        });
    }
  }, []);
  return null;
}
