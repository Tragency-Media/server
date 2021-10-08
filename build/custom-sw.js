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
// self.addEventListener("notificationclick", (event) => {
//   event.waitUntil(
//     clients
//       .matchAll({ includeUncontrolled: true, type: "window" })
//       .then((windowClients) => {
//         // Check if there is already a window/tab open with the target URL
//         for (var i = 0; i < windowClients.length; i++) {
//           var client = windowClients[i];
//           // If so, just focus it.
//           if (client.url === url) {
//             return client.focus();
//           }
//         }
//         // If not, then open the target URL in a new window/tab.
//         if (clients.openWindow) {
//           return clients.openWindow(url);
//         }
//       })
//   );
// });

self.onnotificationclick = (e) => {
  e.notification.close(); // Android needs explicit close.
  e.waitUntil(
    clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clientsArr) => {
        // If a Window tab matching the targeted URL already exists, focus that;
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url ===
          `${self.location.origin + e.notification.data.url}`
            ? (windowClient.focus(), true)
            : false
        );
        // Otherwise, open a new tab to the applicable URL and focus it.
        if (!hadWindowToFocus)
          clients
            .openWindow(`${self.location.origin + e.notification.data.url}`)
            .then((windowClient) =>
              windowClient ? windowClient.focus() : null
            );
      })
  );
};
