const CACHE_NAME = 'resumeiq-v1';
const ASSETS = [
  '/',
  '/assets/styles.css',
  '/assets/app.js',
  '/assets/react.development.js',
  '/assets/react-dom.development.js',
  '/assets/babel.min.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Only intercept requests for same-origin static files
  if (e.request.url.startsWith(self.location.origin) && !e.request.url.includes('/api/v1/')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
