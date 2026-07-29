// Service Worker for Cyber Dash: Genesis PWA Cache & Offline Play

const CACHE_NAME = 'cyber-dash-genesis-v2.0';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/landing.css',
  '/js/landing.js',
  '/js/game.js',
  '/js/main.js',
  '/js/player.js',
  '/js/coop_ai.js',
  '/js/multiplayer.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Use Network-First strategy for HTML, CSS, and JS to ensure Netlify deployments update immediately
  if (e.request.mode === 'navigate' || url.includes('/css/') || url.includes('/js/')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            if (cached) return cached;
            if (e.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
        })
    );
    return;
  }

  // Fallback to Cache-First for static image assets / fonts
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
