/**
 * AETHER KERNEL - SERVICE WORKER V7.0
 * Verified for PWA Installation and Asset Refresh.
 */

const CACHE_NAME = 'aether-v7-final';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './storage.js',
    './manifest.json',
    './icon-512.png'
];

// 1. INSTALL: Force the browser to grab the NEW icon immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('AETHER: indexing new assets...');
            return cache.addAll(ASSETS);
        })
    );
});

// 2. ACTIVATE: Kill the old "Visa icon" cache nodes
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('AETHER: Purging legacy node:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Required for the Install Button to appear in URL bar
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => response)
            .catch(() => caches.match(event.request))
    );
});
