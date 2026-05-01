// MyDanceFitness service worker
// Bumping CACHE_VERSION forces the browser to refresh cached files —
// increment this whenever you redeploy a new version.
const CACHE_VERSION = 'mydancefitness-v7';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

// On install: pre-cache the app shell so it works offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// On activate: clean up old caches so users always get the latest version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch: try network first (so updates show up fast), fall back to cache (so it works offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with the fresh response
        const respClone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, respClone));
        return response;
      })
      .catch(() => caches.match(event.request))  // offline → cache
  );
});
