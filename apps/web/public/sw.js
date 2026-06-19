/* AUJ service worker — conservative offline support.
 * Pages: network-first (so online behaviour is unchanged; offline falls back to cache, then a
 * friendly offline page). Static assets (Next build output, images, audio, fonts): stale-while-
 * revalidate. Bump CACHE to invalidate everything on the next visit. */
const CACHE = 'auj-v1';
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

function putInCache(request, response) {
  const copy = response.clone();
  caches.open(CACHE).then((c) => c.put(request, copy));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch third-party / API origins

  // Navigations → network-first, fall back to cached page, then the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => putInCache(request, res))
        .catch(() => caches.match(request).then((m) => m || caches.match(OFFLINE_URL))),
    );
    return;
  }

  // Static assets → stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/img/') ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/icon');
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => putInCache(request, res))
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
