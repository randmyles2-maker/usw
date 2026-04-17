/**
 * AETHER KERNEL - SERVICE WORKER V5.2
 * Provides offline support and enables PWA installation.
 */

const CACHE_NAME = 'aether-v5-stable';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './storage.js',
    './manifest.json',
    './icon-512.png'
];

// INSTALL: Pre-cache all essential assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('AETHER: Caching Kernel Assets');
            return cache.addAll(ASSETS);
        })
    );
});

// ACTIVATE: Clean up old caches to prevent bugs
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('AETHER: Clearing Legacy Cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// FETCH: Network-first strategy with cache fallback
// Required for the "Install" icon to appear in the URL bar
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network is successful, return the response
                return response;
            })
            .catch(() => {
                // If network fails, try to serve from cache
                return caches.match(event.request);
            })
    );
});
