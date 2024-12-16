self.addEventListener("push", function (event) {
  console.log("Push 이벤트 수신:", event);
  if (event.data) {
    const data = event.data.json();
    console.log("Push 데이터:", data);
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon-192x192.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: { dateOfArrival: Date.now(), primaryKey: "2" },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  } else {
    console.log("Push 이벤트에 데이터가 없습니다.");
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("알림 클릭 이벤트 발생:", event);
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
