const CACHE_NAME = 'aether-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './storage.js',
    './manifest.json',
    './icon-512.png'
];

// Install & Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Fetch Interceptor (Required for PWA Install)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
