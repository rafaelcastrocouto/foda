var version = '0.5.31';
var urlCache = [
  '/',
  'index.html',
  'bundle/game.min.js',
  'bundle/game.min.css',
  'img/banner.jpg'
];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(version).then(function (cache) {
    return cache.addAll(urlCache);
  }));
});
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(version).then(function (cache) {
      return cache.match(event.request).then(function(cacheResponse) {
        if (cacheResponse) return cacheResponse;
        return fetch(event.request).then(function (networkResponse) {
          if (event.request.method == 'GET') cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(function(error) {
        console.error('Error in fetch handler:', error);
        throw error;
      });
    })
  );
});