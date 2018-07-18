const staticCacheName = 'restaurant-reviews-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/restaurant.html?id=1',
  '/restaurant.html?id=2',
  '/restaurant.html?id=3',
  '/restaurant.html?id=4',
  '/restaurant.html?id=5',
  '/restaurant.html?id=6',
  '/restaurant.html?id=7',
  '/restaurant.html?id=8',
  '/restaurant.html?id=9',
  '/restaurant.html?id=10',
  'css/styles.css',
  'data/restaurants.json',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'js/reg_serviceWorker.js',
  '/sw.js'
];

self.addEventListener('install', event => {
  // event.waitUntil lets us signel the progress of the install of the serviceWorker
  // we pass it a promise, if the promise resolves, the browser knows the install is complete, if the promise rejects, it knows the install failed and this serviceWorker should be discarded
  event.waitUntil(
    // if we want to load restaurant reviews offline,then we need somewhere to store the html, the css, the images, the webfont and to do this we can utilize the cache/caches API. The caches API gives us a cache object on the global scope. If I want to create or open a cache we can simply call cache.open or caches.open and give the cache the name we want to use (in this case 'v1', it could be 'my-stuff' or anything else). That returns a promise for a cache of that name, and if I haven't opened a cache of that name before, it creates one and returns it.

    caches.open(staticCacheName).then(cache => {
      // a cache 'box' contains request and response PAIRS from any SECURE origin (https). We can use it to store fonts, scripts, images and anything, from both our own origin as well as anywhere else on the web.

      // We can add cache items using cache.put(request, response); and pass in a request or url and a response or we can use cache.addAll([]); which takes an array of requests or urls, fetches them and puts the request response pairs into the cache, however, when using cache.addALL if any of these fail to cache, then none of them are added.

      // later when we want to get something out of the cache, we can use cache.match(request); passing in a request, or a url. This will return a promise for a matching response if one is found or NULL if one is no matches are found. Alternatively, caches.match(request) tries to find a match in ANY cache, starting with the OLDEST cache first.
        return cache.addAll(urlsToCache);
      }).catch(err => {
          console.log(err);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(

    // get all the cacheNames that exist
    caches.keys().then(cacheNames => {
      // we wrap everything in Promise.all() so we wait the complete of all the promises that were mapped before we return anything here. This way we delete everything before signaling the job is done.
      return Promise.all(
        // then we're going to filter those cacheNames because...
        cacheNames.filter(cacheName => {
          // we are only interested in the ones that begin with 'restaurant-reviews-' AND ISN't a name in the list of our staticCacheNames
          return cacheName.startsWith('restaurant-reviews-') && cacheName != staticCacheName;

          // this leaves us with an array of names we don't need anymore that we can map those
        }).map(cacheName => {
          // to promises returned by caches.delete()
          return caches.delete(cacheName);
        })
      );
    })

    // the simpleway, just delete everything else inside of event.waitUntil();
    // caches.delete('restaurant-reviews-v1')
  );
});


//
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     // open the cache
//     caches.open(staticCacheName)
//       // check the cache for a match
//       .then(cache => {
//         return cache.match(event.request)
//           .then(response => {
//             // if no match in catch get it from the network
//             return response || fetch(event.request)
//               .then(response => {
//                 // add it to cache
//                cache.put(event.request, response.clone());
//                // and send it back to the page at the same time
//                return response;
//         });
//       });
//     })
//   );
// });

self.addEventListener('fetch', function(event) {
  // console.log(event.request);
  // console.log(event.request.url);
  // console.log(event.request.method);
  // console.log(event.request.headers);
  // console.log(event.request.body);

  event.respondWith(

    // check for a match to the request in the cache
    caches.match(event.request).then(function(response) {

      // if the data already exists in the cache
      if (response) {

        // log to the console that we found a match and what is was we found
        // console.log('Found response in cache:', response);

        // return the data we found in the cache
        return response;
      }

      // if we didn't find a match, then log to the console that this is something new and we need to go get it from the network
      // console.log('No response found in cache. About to fetch from network...');

      // return what we got from the network
      return fetch(event.request).then(function(response) {

        // log to the console what we got from the network
        // console.log('Response from network is:', response);
        // return the data
        return response;

        // on network error
      }).catch(function(error) {
        // console.error('Fetching failed:', error);

        throw error;
      });
    })
  );
});

// TODO: listen for the 'message' event, and call
// skipWaiting if you get the appropriate message
self.addEventListener('message', function (event) {
  // so when the user clicks the refresh button, we send a message to the worker, telling it to call self.skipWaiting();
  // event.data; // the message
  if (event.data.action == 'skipWaiting') {
    self.skipWaiting();
  }
});
