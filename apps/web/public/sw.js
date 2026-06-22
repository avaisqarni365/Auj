/* AUJ service worker — RETIRED kill-switch.
 * The PWA cache caused stale pages to be served after deploys. This worker now unregisters
 * itself, deletes every cache, and reloads any window it controls — so older clients that
 * still have an old service worker installed self-heal to plain network (always-fresh) on
 * their next visit. No HTML is ever served from cache again. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop all caches from the old SW versions (auj-v2/v3/v4).
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      // Remove this service worker entirely.
      await self.registration.unregister();
      // Reload every controlled window so it re-fetches from the network (no SW in the way).
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        if ('navigate' in client) client.navigate(client.url);
      }
    })(),
  );
});
// No fetch handler — the SW never intercepts requests; the network is the source of truth.
