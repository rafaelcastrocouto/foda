var options = {
  "version": "0.5.57",
  urlCache: [
    '/', 'index.html',
    'bundle/game.min.js',
    'bundle/game.min.css'
  ]
};
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(options.version).then(function (cache) {
    return cache.addAll(options.urlCache);
  }));
});
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(options.version).then(function (cache) {
      return cache.match(event.request).then(function(cacheResponse) {
        if (cacheResponse && cacheResponse.status != 404) return cacheResponse;
        return fetch(event.request).then(function (networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(function(error) {
        console.error('Error in service worker fetch handler:', error, event);
      });
    })
  );
});