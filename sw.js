/* ============================================================
   G04Fit — Service Worker
   Sorgt dafür, dass die App nach dem ersten Aufruf auch ohne
   Internetverbindung startet. Es werden ausschließlich die
   eigenen Programmdateien zwischengespeichert. Der optionale
   Push-Dienst wird nur nach ausdrücklicher Einwilligung verwendet.
   ============================================================ */
var CACHE = 'g04fit-v2.8.167';

var ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './privacy-en.html',
  './copyright.html',
  './copyright-en.html',
  './push-config.js',
  './manifest.webmanifest',
  './css/theme.css',
  './css/layout.css',
  './css/components.css',
  './css/workout-preview.css',
  './assets/workout-hero-bg.webp',
  './css/progress-overview.css',
  './css/dashboard-preview.css',
  './assets/dashboard-hero-bg.webp',
  './assets/exercise-backdrop.webp',
  './assets/dashboard-reminder-bg.png',
  './assets/dashboard-records-bg.png',
  './assets/dashboard-profile.png',
  './assets/nav/nav-dashboard.png',
  './assets/nav/nav-journey.png',
  './assets/nav/nav-workout.png',
  './assets/nav/nav-exercises.png',
  './assets/nav/nav-progress.png',
  './assets/progress/stat-volume.png',
  './assets/progress/stat-reps.png',
  './assets/progress/stat-streak.png',
  './assets/progress/stat-best-streak.png',
  './assets/progress/stat-records.png',
  './assets/progress/profile-lock.png',
  './assets/header-menu.webp',
  './assets/header-sun.webp',
  './assets/header-shield.webp',
  './assets/journey-workout-avatar-wide-atlas.webp',
  './assets/journey-difficulty-icons.webp',
  './css/anim.css',
  './js/util.js',
  './js/i18n.js',
  './js/i18n-exercises-en.js',
  './js/data-exercises.js',
  './js/data-journey.js',
  './js/store.js',
  './js/anim.js',
  './js/charts.js',
  './js/avatar.js',
  './js/coach.js',
  './js/planner.js',
  './js/reminders.js',
  './js/obsidian.js',
  './js/view-dashboard.js',
  './js/view-journey.js',
  './js/view-workout.js',
  './js/view-exercises.js',
  './js/view-progress.js',
  './js/view-profile.js',
  './js/view-coach.js',
  './js/view-reminders.js',
  './js/view-obsidian.js',
  './js/view-privacy.js',
  './js/onboarding.js',
  './js/app.js',
  './icons/icon-v4-180.png',
  './icons/icon-v4-192.png',
  './icons/icon-v4-512.png',
  './icons/icon-v4-maskable-512.png',
  './assets/avatar/anatomy-front-v4.webp',
  './assets/avatar/anatomy-back-v4.webp',
  './assets/exercises/anatomy/pushup-v2.webp',
  './assets/exercises/anatomy/bench-bb.webp',
  './assets/exercises/anatomy/fly-cable.webp'
];

self.addEventListener('install', function (e) {
  // Jede Datei einzeln ablegen: eine fehlende Datei darf nicht
  // dazu führen, dass gar nichts zwischengespeichert wird.
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () { /* diese eine Datei überspringen */ });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Navigationsanfragen: erst Netz, sonst die zwischengespeicherte Startseite
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Bilder, GIFs und Videos: erst aus dem Cache, sonst einmal laden und
  // ablegen. Die Übungs-GIFs werden deshalb nicht mehr beim Installieren
  // vorab geladen (ca. 26 MB), sondern erst, wenn eine Übung angesehen
  // wird — danach sind sie auch offline verfügbar. Bei einer neuen
  // Cache-Version wird der alte Cache gelöscht, geänderte Bilder kommen
  // also trotzdem an.
  if (/\.(?:gif|webp|png|jpe?g|svg|mp4|webm)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.status === 200 && res.type === 'basic') {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  // Programmdateien: erst das Netz, damit Änderungen sofort ankommen.
  // Der Cache dient als Rückfallebene, wenn keine Verbindung besteht.
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || Response.error();
      });
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || './index.html#workout';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
      for (var i = 0; i < windows.length; i++) {
        if ('focus' in windows[i]) {
          windows[i].navigate(target);
          return windows[i].focus();
        }
      }
      return clients.openWindow ? clients.openWindow(target) : null;
    })
  );
});

// Optionaler Einstieg für spätere Web-Push- oder Periodic-Sync-Anbieter.
// Ohne Server werden keine Daten übertragen; lokale Trigger bleiben davon
// vollständig unabhängig.
self.addEventListener('push', function (e) {
  var data = {
    title: 'Heute ist ein guter Tag zum Trainieren',
    body: 'Dein Plan wartet auf dich. Öffne G04Fit und leg los.',
    tag: 'g04fit-training',
    url: './index.html#workout'
  };
  try { data = e.data ? e.data.json() : {}; } catch (err) {
    data = { body: e.data ? e.data.text() : 'Deine G04Fit-Erinnerung ist da.' };
  }
  e.waitUntil(self.registration.showNotification(data.title || 'G04Fit · Erinnerung', {
    body: data.body || 'Zeit für dein Training.',
    tag: data.tag || 'g04fit-push',
    icon: './icons/icon-v4-192.png',
    badge: './icons/icon-v4-192.png',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || './index.html#workout' }
  }));
});
