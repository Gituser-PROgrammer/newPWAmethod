self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("pwa-cache").then(async (cache) => {
      const filesToCache = ["./index.html"];

      for (const file of filesToCache) {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn(`Failed to cache ${file}:`, err);
        }
      }
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
