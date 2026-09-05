/* ============================================================
   GoFit — Service Worker
   Sorgt dafür, dass die App nach dem ersten Aufruf auch ohne
   Internetverbindung startet. Es werden ausschließlich die
   eigenen Programmdateien zwischengespeichert – keine
   Nutzerdaten, keine Anfragen an fremde Server.
   ============================================================ */
var CACHE = 'gofit-v1.0.60';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/theme.css',
  './css/layout.css',
  './css/components.css',
  './css/anim.css',
  './js/util.js',
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
  './icons/icon-v2-180.png',
  './icons/icon-v2-192.png',
  './icons/icon-v2-512.png',
  './icons/icon-v2-maskable-512.png',
  './assets/avatar/avatar-front-map.png',
  './assets/avatar/avatar-back-map.png',
  './assets/avatar/anatomy-front-v4.webp',
  './assets/avatar/anatomy-back-v4.webp',
  './assets/exercises/anatomy/pushup-v2.webp',
  './assets/exercises/anatomy/bench-bb.webp',
  './assets/exercises/anatomy/fly-cable.webp',
  './assets/exercises/gifs/fly-cable-avatar.gif',
  './assets/exercises/gifs/fly-cable-reference-avatar.gif',
  './assets/exercises/gifs/butterfly-avatar.gif',
  './assets/exercises/gifs/butterfly2.gif',
  './assets/exercises/gifs/butterfly2-clean.gif',
  './assets/exercises/gifs/bench-db-clean.gif',
  './assets/exercises/gifs/bench-bb-clean.gif',
  './assets/exercises/gifs/incline-db-clean2.gif',
  './assets/exercises/gifs/bench-bb-solid.gif',
  './assets/exercises/gifs/bench-db-solid.gif',
  './assets/exercises/gifs/incline-db-solid.gif',
  './assets/exercises/gifs/butterfly2-solid.gif',
  './assets/exercises/gifs/bench-bb.gif',
  './assets/exercises/gifs/bench-db.gif',
  './assets/exercises/gifs/incline-db.gif',
  './assets/exercises/gifs/butterfly2.gif',
  './assets/exercises/gifs/bench-bb-whiteclean.gif',
  './assets/exercises/gifs/bench-db-whiteclean.gif',
  './assets/exercises/gifs/incline-db-whiteclean.gif',
  './assets/exercises/gifs/butterfly2-whiteclean.gif',
  './assets/exercises/gifs/fly-cable-whiteclean.gif',
  './assets/exercises/gifs/butterfly-avatar-whiteclean.gif',
  './assets/exercises/gifs/pushup-whiteclean.gif',
  './assets/exercises/gifs/pushup-close-whiteclean.gif',
  './assets/exercises/gifs/pushup-decline-whiteclean.gif',
  './assets/exercises/gifs/pushup-knee-whiteclean.gif',
  './assets/exercises/gifs/pushup-positive-whiteclean.gif',
  './assets/exercises/gifs/dip-chest-whiteclean.gif',
  './assets/exercises/gifs/dip-heavy-whiteclean.gif',
  './assets/exercises/gifs/triceps-bench-whiteclean.gif',
  './assets/exercises/gifs/pullup-whiteclean.gif',
  './assets/exercises/gifs/pullup-assisted-whiteclean.gif',
  './assets/exercises/gifs/pullup-close-overhand-whiteclean.gif',
  './assets/exercises/gifs/pullup-wide-overhand-whiteclean.gif',
  './assets/exercises/gifs/pullup-wide-weighted-whiteclean.gif',
  './assets/exercises/gifs/latpull-close-whiteclean.gif',
  './assets/exercises/gifs/latpull-neck-close-whiteclean.gif',
  './assets/exercises/gifs/latpull-wide-whiteclean.gif',
  './assets/exercises/gifs/latpull-wide-neck-whiteclean.gif',
  './assets/exercises/gifs/latpull-chest-whiteclean.gif',
  './assets/exercises/gifs/row-bb-whiteclean.gif',
  './assets/exercises/gifs/row-bb-underhand-incline-whiteclean.gif',
  './assets/exercises/gifs/row-smith-underhand-whiteclean.gif',
  './assets/exercises/gifs/row-db-whiteclean.gif',
  './assets/exercises/gifs/row-cable-whiteclean.gif',
  './assets/exercises/gifs/pullover-whiteclean.gif',
  './assets/exercises/gifs/pullover-db-hammer-whiteclean.gif',
  './assets/exercises/gifs/pullover-db-ball-whiteclean.gif',
  './assets/exercises/gifs/pullover-cable-whiteclean.gif',
  './assets/exercises/gifs/pullover-bb-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-machine-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-db-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-db-incline-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-cable-bent-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-cable-standing-whiteclean.gif',
  './assets/exercises/gifs/reverse-fly-cable-lying-whiteclean.gif',
  './assets/exercises/gifs/curl-bb-whiteclean.gif',
  './assets/exercises/gifs/curl-bb-scott-whiteclean.gif',
  './assets/exercises/gifs/curl-db-whiteclean.gif',
  './assets/exercises/gifs/curl-db-incline-bilateral-whiteclean.gif',
  './assets/exercises/gifs/curl-db-bilateral-whiteclean.gif',
  './assets/exercises/gifs/curl-preacher-whiteclean.gif',
  './assets/exercises/gifs/crunch-cable-kneeling-whiteclean.gif',
  './assets/exercises/gifs/curl-cable-whiteclean.gif',
  './assets/exercises/gifs/plank-whiteclean.gif',
  './assets/exercises/gifs/plank-weighted-whiteclean.gif',
  './assets/exercises/gifs/side-plank-whiteclean.gif',
  './assets/exercises/gifs/side-plank-db-whiteclean.gif',
  './assets/exercises/gifs/crunch-whiteclean.gif',
  './assets/exercises/gifs/situp-straight-whiteclean.gif',
  './assets/exercises/gifs/crunch-side-whiteclean.gif',
  './assets/exercises/gifs/legraise-hanging-whiteclean.gif',
  './assets/exercises/gifs/legraise-hanging-station-whiteclean.gif',
  './assets/exercises/gifs/abs-side-bench-whiteclean.gif',
  './assets/exercises/gifs/bench-db-triceps-whiteclean.gif',
  './assets/exercises/gifs/bench-bb-triceps-whiteclean.gif',
  './assets/exercises/gifs/triceps-cable-lying-whiteclean.gif',
  './assets/exercises/gifs/triceps-overhead-whiteclean.gif',
  './assets/exercises/gifs/triceps-cable-overhead-onearm-whiteclean.gif',
  './assets/exercises/gifs/shrug-db-whiteclean.gif',
  './assets/exercises/gifs/lateral-db-whiteclean.gif',
  './assets/exercises/gifs/front-raise-db-whiteclean.gif',
  './assets/exercises/gifs/ohp-bb-whiteclean.gif',
  './assets/exercises/gifs/ohp-db-whiteclean.gif',
  './assets/exercises/gifs/kickback-db-whiteclean.gif',
  './assets/exercises/gifs/skullcrusher-bb-whiteclean.gif'
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
      fetch(req).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Programmdateien: erst das Netz, damit Änderungen sofort ankommen.
  // Der Cache dient als Rückfallebene, wenn keine Verbindung besteht.
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
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
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {
    data = { body: e.data ? e.data.text() : 'Deine GoFit-Erinnerung ist da.' };
  }
  e.waitUntil(self.registration.showNotification(data.title || 'GoFit · Erinnerung', {
    body: data.body || 'Zeit für dein Training.',
    tag: data.tag || 'gofit-push',
    icon: './icons/icon-v2-192.png',
    badge: './icons/icon-v2-192.png',
    data: { url: data.url || './index.html#workout' }
  }));
});
