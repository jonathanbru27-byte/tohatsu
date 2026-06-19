// Tohatsu Motors - Service Worker (PWA)
// Bump version to force update when shipping new assets
const CACHE_VERSION = 'tohatsu-v1.0.0';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Minimal app shell: the document + manifest + icons. Bundle JS files are
// versioned by Metro and cached at runtime via the fetch handler.
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url).catch(() => null)))
    )
  );
  // Activate the new SW as soon as it finishes installing
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isHtmlRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache /api/* (always go to the network, fallback offline)
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ offline: true, message: 'Sin conexión' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Navigation requests: network-first with cache fallback (offline support)
  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put('/', copy)).catch(() => {});
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(APP_SHELL_CACHE);
          const cached = await cache.match('/');
          return cached || new Response('Sin conexión', { status: 503 });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) - cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Refresh in background
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone())).catch(() => {});
            }
          })
          .catch(() => {});
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('/'));
    })
  );
});

// Allow page to ask SW to skip waiting (for future updates UX)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
