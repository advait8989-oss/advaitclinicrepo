// Simple offline support: try the network first, fall back to the last
// cached copy so the app still opens without internet.
const CACHE = 'advait-clinic-v2'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim()),
  ),
)

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(e.request)
        cache.put(e.request, fresh.clone())
        return fresh
      } catch {
        const cached = await cache.match(e.request)
        return cached || cache.match(self.registration.scope)
      }
    }),
  )
})
