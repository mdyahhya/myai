const CACHE_NAME = 'tan-ai-v1';
const ASSETS_TO_CACHE = [
  '/index.html',
  '/data.html',
  '/schedule.html',
  '/history.html',
  '/tasks.html',
  '/manifest.json',
  '/tanai.jpg',
  '/aitan.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network-First for HTML/JS/CSS to ensure it's always fresh from GitHub
  // But fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid response, clone it and save to cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (offline), try the cache
        return caches.match(event.request);
      })
  );
});
