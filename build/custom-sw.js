self.addEventListener("push", (event) => {
  console.log(event);
  const data = event.data.json();
  console.log("New notification", data);
  const options = {
    body: data.body,
    icon: data.icon,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
