const CACHE = 'dulce-v4';

self.addEventListener('install', e => {
  // Don't skip waiting immediately — wait for SKIP_WAITING message
  // so we only update when the app is ready
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'])
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Listen for skip waiting signal from the app
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  // Network first — always try to get fresh content
  // Fall back to cache only if offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a copy of fresh responses
        if(res.ok){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
