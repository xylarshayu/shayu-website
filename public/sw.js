
self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/shayu_imp.svg',
    badge: '/shayu_imp.svg',
    tag: 'shayu-update',
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    // self.Notification.permission === 'granted' &&
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data.url || '/';
  event.waitUntil(
    clients.openWindow(url)
  );
});
