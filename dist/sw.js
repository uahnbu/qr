self.addEventListener("install", event => {
  event.waitUntil(
    caches.open('pwa').then(cache => cache.addAll(["/"]))
  );
});
 
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});