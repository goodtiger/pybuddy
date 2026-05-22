const CACHE_NAME = 'pybuddy-offline-v1';

const CORE_ASSETS = [
  '/',
  '/onboarding',
  '/map',
  '/parent',
  '/profile',
  '/register',
  '/settings',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/vendor/skulpt/skulpt.min.js',
  '/vendor/skulpt/skulpt-stdlib.js',
  '/blockly-media/sprites.png',
  '/blockly-media/sprites.svg',
  '/blockly-media/dropdown-arrow.svg',
  '/blockly-media/delete-icon.svg',
  '/blockly-media/resize-handle.svg',
  '/blockly-media/foldout-icon.svg',
  '/blockly-media/quote0.png',
  '/blockly-media/quote1.png',
  '/blockly-media/1x1.gif',
  '/courses/level-1/lesson_001.json',
  '/courses/level-1/lesson_002.json',
  '/courses/level-1/lesson_003.json',
  '/courses/level-1/lesson_004.json',
  '/courses/level-1/lesson_005.json',
  '/courses/level-1/lesson_006.json',
  '/courses/level-1/lesson_007.json',
  '/courses/level-1/lesson_008.json',
  '/courses/level-1/lesson_009.json',
  '/courses/level-1/lesson_010.json',
  '/courses/level-1/lesson_011.json',
  '/courses/level-1/lesson_012.json',
  '/courses/level-1/lesson_013.json',
  '/courses/level-1/lesson_014.json',
  '/courses/level-1/lesson_015.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/map')));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
