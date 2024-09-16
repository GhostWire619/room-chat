self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  // Handle notification click event
});
