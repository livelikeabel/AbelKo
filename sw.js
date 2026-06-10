/* FIGHT CAMP 식단 — service worker
   precache + stale-while-revalidate (cache-first, 백그라운드 업데이트) */
var CACHE = 'fightcamp-diet-v1';
var FONT_CACHE = 'fightcamp-fonts-v1';

var PRECACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k !== FONT_CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (cached) {
      var fetched = fetch(req).then(function (res) {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || fetched;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  /* 구글 폰트 런타임 캐시 */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* 내비게이션은 캐시된 index.html로 (오프라인 보장) */
  if (req.mode === 'navigate') {
    e.respondWith(
      staleWhileRevalidate(req, CACHE).then(function (res) {
        return res || caches.match('./index.html');
      })
    );
    return;
  }

  e.respondWith(staleWhileRevalidate(req, CACHE));
});
