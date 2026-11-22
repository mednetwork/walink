// Walink PWA Service Worker (walink.ma)
const CACHE_NAME = "walink-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Handle Background Push Notifications
self.addEventListener("push", (event) => {
  let data = {
    title: "Walink • والينك",
    body: "إشعار جديد على بطاقة الوفاء ديالك",
    icon: "/favicon.ico",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    dir: "rtl",
    lang: "ar",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click Action (Deep-link to pass or Google Maps)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Bridge message from active web pass page
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, url, dir, lang } = event.data;
    const options = {
      body: body || "",
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      dir: dir || (lang === "ar" ? "rtl" : "ltr"),
      lang: lang || "ar",
      data: { url: url || "/" },
    };

    self.registration.showNotification(title || "Walink", options);
  }
});

