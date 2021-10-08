self.addEventListener("push", (event) => {
  console.log(event);
  const data = event.data.json();
  console.log("New notification", data);
  const options = {
    body: data.body,
    icon: data.icon,
    vibrate: [300, 100, 400],
    data: { url: data.url },
    action: [{ type: "open_url" }],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
self.addEventListener(
  "notificationclick",
  function (event) {
    switch (event.action) {
      case "open_url":
        clients.openWindow(event.notification.data.url); //which we got from above
        break;
      default:
        break;
    }
  },
  false
);
