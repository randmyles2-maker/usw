/**
 * AETHER KERNEL - SERVICE WORKER V9.0 (FINAL)
 * High-performance lifecycle management for PWA and IDE stability.
 */

const CACHE_NAME = 'aether-v9-final';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './storage.js',
    './manifest.json',
    './icon-512.png'
];

// 1. INSTALLATION: Prepare the environment and cache local sigils
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force active state immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('AETHER: indexing assets and sigils...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATION: Wipe the old "Visa" cache nodes and ghost data
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('AETHER: Purging legacy data node:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. FETCH: The PWA Engine (Required for the Install icon in URL bar)
self.addEventListener('fetch', (event) => {
    // Skip caching for external CDN libraries (Monaco/Pyodide) to ensure they always load
    if (event.request.url.includes('cdnjs') || event.request.url.includes('cdn.jsdelivr')) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If the network is available, provide the live version
                return response;
            })
            .catch(() => {
                // If offline, serve the local cached file
                return caches.match(event.request);
            })
    );
});
