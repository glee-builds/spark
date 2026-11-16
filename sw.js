// The service worker: a small script the browser keeps running for this site.
// It saves a complete copy of the app, so Spark opens with no signal.
//
// How updates work:
//   - VERSION is a fingerprint of every app file, written by tools/stamp.mjs.
//   - When any file changes, VERSION changes, so the browser sees a new sw.js.
//   - The new worker saves the complete new set of files in its own cache,
//     then takes over and deletes the old cache. Old and new files never mix.
//   - The open app switches to the new version the next time it returns to
//     the first screen (see src/install.js).

const VERSION = 'fd0b2c112a7b';
const CACHE = `spark-${VERSION}`;

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

// Save every file for this version. "reload" skips the browser's own
// short-term cache, so the saved copy is the one on the server right now.
self.addEventListener('install', (event) => {
  const requests = FILES.map((file) => new Request(file, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

// Delete the caches of older versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// Answer from this version's saved files; fall back to the network for
// anything not saved.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE)
    .then((cache) => cache.match(request, { ignoreSearch: true }))
    .then((saved) => saved || fetch(request)));
});
