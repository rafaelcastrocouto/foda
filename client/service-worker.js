var version = '0.5.0';
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
  event.respondWith(caches.match(event.request) || fetch(event.request));
});