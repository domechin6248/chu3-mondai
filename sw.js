// オフラインでも使えるように、アプリのファイルを端末に保存しておく。
// ファイルを更新して公開するときは VERSION を上げること。
const VERSION = 'v2';
const CACHE = `chu3-ichimon-${VERSION}`;
const FILES = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'js/common.js',
  'js/japanese.js',
  'js/japanese-patterns.js',
  'js/math.js',
  'js/science.js',
  'js/social.js',
  'js/english.js',
  'js/english-patterns.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 保存済みのファイルをすぐ返しつつ、通信できるときは裏で最新版に更新する
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req)
      .then((res) => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => cached);
    event.waitUntil(network.catch(() => {}));
    return cached || network;
  })());
});
