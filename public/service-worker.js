const staticCacheName = "static files";
const dataCacheName = "data files"
const staticCacheFiles = [
    '/',
    '/index.html',
    '/index.js',
    '/manifest.webmanifest',
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
                        if (key !== staticCacheName) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        );
    self.clients.claim();
});

self.addEventListener('fetch', evt => {
 console.log(evt.request.url)
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(dataCacheName).then(cache => {
        return fetch(evt.request)
          .then(response => {
          
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
        
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
    
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
})

