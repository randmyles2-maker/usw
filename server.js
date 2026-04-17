// Aether Virtual Server Node
const version = "v1";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Intercept API calls to act as a server
    if (event.request.url.includes('/api/status')) {
        event.respondWith(
            new Response(JSON.stringify({ 
                status: "Aether Virtual Server Online",
                node: "Internal Browser Kernel" 
            }), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
    }
});
