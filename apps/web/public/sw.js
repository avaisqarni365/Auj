/* AUJ service worker — offline support WITHOUT ever showing stale content online.
 * Strategy: network-first for everything. When online you always get the freshest build; the cache
 * is only a fallback when the network fails (offline). Bumping CACHE evicts everything on next load. */
const CACHE = 'auj-v3';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch third-party / API origins

  // Network-first: always try the live network; cache the result; fall back to cache (then the
  // offline page for navigations) only when the network is unavailable.
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match(OFFLINE_URL) : undefined)),
      ),
  );
});
