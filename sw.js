// The service worker: a small script the browser keeps running for this site.
// It saves a copy of every file the app needs, so Spark opens with no signal.
//
// How it answers a request:
//   1. If a saved copy exists, hand it back straight away (fast, works offline).
//   2. In the background, fetch a fresh copy and save it for next time.
// So after an update is published, the app shows it the second time it is opened.

const CACHE = 'spark-v1';

// Everything the app needs to run. tests/offline.test.js checks this list
// against the files in the repo, so a new file can't be forgotten.
const FILES = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'src/app.js',
  'src/config.js',
  'src/install.js',
  'src/library.js',
  'src/matching.js',
  'src/storage.js',
  'src/support.js',
  'data/family.json',
  'data/friends.json',
  'data/networking.json',
  'data/other.json',
  'data/support.json',
  'data/work.json',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
];

// First visit: save every file.
self.addEventListener('install', (event) => {
  // "reload" skips the browser's own short-term cache, so the saved copy
  // is the one on the server right now, never a stale one.
  const requests = FILES.map((file) => new Request(file, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

// Clear out caches left by an older version of this file.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const saved = await cache.match(request, { ignoreSearch: true });
    // "no-cache" makes the browser check with the server for a newer copy.
    const fresh = fetch(request, { cache: 'no-cache' }).then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => saved);
    if (saved) {
      event.waitUntil(fresh);
      return saved;
    }
    return fresh;
  }));
});
