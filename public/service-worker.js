// Install event - caching important assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/index.html",
        "/main.js",
        // List other assets you want to cache
      ]);
    })
  );
});

// Activation event - cleanup old caches
self.addEventListener("activate", (event) => {
  var cacheKeeplist = ["v1"];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (cacheKeeplist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event - defining how to handle network requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
