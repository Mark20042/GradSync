self.addEventListener('push', function (event) {
  // A malformed payload used to throw before showNotification ran, which made
  // the push silently disappear (and can cost the subscription).
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = { message: event.data ? event.data.text() : '' };
  }

  const options = {
    body: data.message || '',
    icon: '/3dgradsynnclogo.png',
    badge: '/3dgradsynnclogo.png',
    data: {
      // There is no /notifications route in the app, so anything that is not a
      // message opens the home page instead of an empty route.
      url: data.type === 'MESSAGE' ? '/messages' : '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'GradSync', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const target = (event.notification.data && event.notification.data.url) || '/';
  const targetUrl = new URL(target, self.location.origin).href;
  const targetPath = new URL(targetUrl).pathname;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      // Focus an open window that is already on the target page. Comparing
      // pathnames avoids the absolute-vs-relative mismatch that made this
      // branch never match before.
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (new URL(client.url).pathname === targetPath && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
