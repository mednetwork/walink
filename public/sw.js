// Walink PWA Service Worker (walink.ma & wclient.walink.ma)
const CACHE_NAME = "walink-v4";

self.addEventListener("install", () => {
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

// Handle Background Web Push Notifications (WhatsApp / Native App style on lock screen)
self.addEventListener("push", (event) => {
  let data = {
    title: "Walink • والينك",
    body: "لديك عرض أو تحديث جديد على بطاقة الوفاء الخاصة بك",
    icon: "/icon-192.png?v=2",
    badge: "/icon-192.png?v=2",
    tag: "walink-promo",
    renotify: true,
    dir: "rtl",
    lang: "ar",
    url: "",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") {
        data = { ...data, ...parsed };
      }
    } catch {
      const txt = event.data.text();
      if (txt) data.body = txt;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png?v=2",
    badge: data.badge || "/icon-192.png?v=2",
    tag: data.tag || "walink-promo",
    renotify: data.renotify !== false,
    dir: data.dir || "rtl",
    lang: data.lang || "ar",
    vibrate: [120, 60, 120],
    data: {
      url: data.url && data.url !== "/" ? data.url : "",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Open exact customer pass URL (/pass/[serial]) cleanly — never "/" (Stealth 404 on wclient)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification.data?.url;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      let targetUrl = "";
      if (typeof rawUrl === "string" && rawUrl && rawUrl !== "/") {
        try {
          targetUrl = new URL(rawUrl, self.location.origin).href;
        } catch {
          targetUrl = "";
        }
      }

      if (targetUrl) {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        const targetPath = new URL(targetUrl).pathname;
        for (const client of clientList) {
          try {
            if (new URL(client.url).pathname === targetPath && "focus" in client) {
              return client.focus();
            }
          } catch (urlErr) {
            console.warn("[SW] Ignored unparseable client URL:", urlErr);
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }

      // Fallback if URL omitted: focus any open /pass/ tab rather than opening "/"
      for (const client of clientList) {
        if (client.url.includes("/pass/") && "focus" in client) {
          return client.focus();
        }
      }
      return undefined;
    })
  );
});

// Bridge message from active web pass page when document becomes hidden
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, url, dir, lang, tag } = event.data;
    const options = {
      body: body || "",
      icon: icon || "/icon-192.png",
      badge: "/icon-192.png",
      dir: dir || (lang === "ar" ? "rtl" : "ltr"),
      lang: lang || "ar",
      tag: tag || "walink-pass-alert",
      renotify: true,
      data: { url: url && url !== "/" ? url : "" },
    };

    self.registration.showNotification(title || "Walink", options);
  }
});
