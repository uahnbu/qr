const STATIC_CACHE_NAME = 'v1';

const filesToCache = [
  'index.html',
  'scripts/index.js',
  'scripts/qcode-decoder.min.js',
  'scripts/qr-scanner-worker.min.js',
  'scripts/qr-scanner.min.js',
  'styles/fontawesome-solid.min.css',
  'styles/fontawesome.min.css',
  'styles/style.css',
  'webfonts/fa-solid-900.woff2'
];

// https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
self.addEventListener('install', event => {
  // console.log('Installing service worker', STATIC_CACHE_NAME);
  // Prevent waiting for page navigation before activating v2
  // self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(filesToCache))
  );
});

// Activate the SW. Only one SV can be active at a time.
self.addEventListener('activate', event => {
  // console.log('Activating service worker', STATIC_CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== STATIC_CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for', event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(response => {
        return caches.open(STATIC_CACHE_NAME).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    })
  );
});