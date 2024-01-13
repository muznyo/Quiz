self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('my-cache').then(cache => {
            return cache.addAll([
                'index.html',
                'styles.css',
                'script.js'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});