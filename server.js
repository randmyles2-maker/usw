/**
 * AETHER KERNEL - SERVICE WORKER V6.0
 * Unified logic for offline stability and PWA installation.
 */

const CACHE_NAME = 'aether-v6-stable';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './storage.js',
    './manifest.json',
    './icon-512.png'
];

// 1. INSTALL: Force the browser to cache all assets immediately.
self.addEventListener('install', (event) => {
    // Force this service worker to become the active service worker.
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('AETHER: System files indexed.');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. ACTIVATE: Clear out old, bugged caches from previous versions.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('AETHER: Clearing legacy cache node:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    // Ensure the service worker takes control of the page immediately.
    return self.clients.claim();
});

// 3. FETCH: Essential for the "Install" button to show in the URL bar.
// This handles the request by trying the network first, then the cache.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network is available, use it.
                return response;
            })
            .catch(() => {
                // If offline or network fails, look in the cache.
                return caches.match(event.request);
            })
    );
});
