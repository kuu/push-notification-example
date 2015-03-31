'use strict';

importScripts('serviceworker-cache-polyfill.js');

var CACHE_NAME = 'push-notification-example-01',
    urlsToCache = [
      '/'
    ];

self.addEventListener('install', function (event) {
  console.log('ServiceWorker.oninstall: ', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('ServiceWorker.onactive: ', event);
  event.waitUntil(
    caches.keys()
    .then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function (event) {
  // Since there is no payload data with the first version
  // of push messages, we'll grab some data from
  // an API and use it to populate a notification
  event.waitUntil(
    fetch('/pull').then(function (response) {
      if (response.status !== 200) {
        // Either show a message to the user explaining the error
        // or enter a generic message and handle the
        // onnotificationclick event to direct the user to a web page
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        throw new Error();
      }

      // Examine the text in the response
      return response.text().then(function (data) {
        if (!data) {
          console.error('The API returned an error.', data.error);
          throw new Error();
        }

        return self.registration.showNotification('Current time:', {
          body: data,
          icon: 'pig.jpeg'
        });
      });
    })
    .catch(function(err) {
      console.error('Unable to retrieve data', err);
    })
  );
});
