const CACHE_NAME = "autolog-v6";
const RUNTIME_CACHE = "autolog-runtime-v6";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
  "./icon.svg",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  "https://unpkg.com/@phosphor-icons/web",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.error("Cache install error:", err)),
  );
  self.skipWaiting();
});

// Skip waiting when message received
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch event - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and analytics
  if (url.origin !== location.origin) {
    return;
  }

  // For Firebase API calls, use network first
  if (url.pathname.includes("firestore")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloneResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, cloneResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        }),
    );
    return;
  }

  // For other requests, use cache first, fallback to network
  event.respondWith(
    caches
      .match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }
          const cloneResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, cloneResponse);
          });
          return response;
        });
      })
      .catch(() => {
        // Return a fallback for offline
        if (request.destination === "document") {
          return caches.match("./index.html");
        }
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});
