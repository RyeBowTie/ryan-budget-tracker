const staticCacheName = "static files";
const dataCacheName = "data files"
const staticCacheFiles = [
    '/',
    'index.html',
    'index.js',
    'manifest.webmanifest',
    'styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];




self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(staticCacheName)
            .then(cache => {
                console.log("static files cached");
                cache.addAll(staticCacheFiles);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.log(err))
    );
    
});



self.addEventListener("activate", event => {
    console.log("activated")
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== staticCacheName && key !== dataCacheName) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        );
    self.clients.claim();
})

