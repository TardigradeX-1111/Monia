// service-worker.js
const CACHE_NAME = 'pwacache-v2'; // ↑ bump this string when you change files
const ASSETS = ['/', '/index.html', '/app.js', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
  // Install: pre-cache assets
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Activate the new SW as soon as it's finished installing
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy: try network first, fall back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(networkResp => {
      // Update cache with fresh response (for same-origin GET requests)
      if (event.request.method === 'GET' && networkResp && networkResp.ok) {
        const copy = networkResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return networkResp;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
  );
});