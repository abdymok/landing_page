const CACHE = 'abdymok-landing-v20261021-2';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('abdymok-landing-') && key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Let MP4/media and byte-range requests bypass the worker entirely.
  if (request.headers.has('range') || /\.(mp4|mov|m4a|webm|m4v)$/i.test(url.pathname)) return;

  event.respondWith(
    fetch(request, {cache:'no-store'})
      .then(response => {
        if (response && response.ok) {
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(request))
  );
});
