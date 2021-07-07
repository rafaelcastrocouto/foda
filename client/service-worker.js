var options = {
  "version": "0.5.65",
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
  var url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.pathname == '/db') return;
  event.respondWith(
    caches.open(options.version).then(function (cache) {
      return cache.match(event.request).then(function(cacheResponse) {
        if (cacheResponse && cacheResponse.status != 404) return cacheResponse;
        return fetch(event.request).then(function (networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(function(error) {
        console.error(error, event.request.url);
      });
    })
  );
});