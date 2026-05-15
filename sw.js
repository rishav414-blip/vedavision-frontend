/* VedaVision Service Worker — Offline cache for core assets */
const CACHE = 'vedavision-v1';
const CORE = [
  '/',
  '/index.html',
  '/vedavision.css',
  '/vedavision-data.js',
  '/manifest.json'
];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Always network for API calls and external resources
  if (url.hostname !== self.location.hostname || url.pathname.startsWith('/chart') || url.pathname.startsWith('/health')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
