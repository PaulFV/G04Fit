/* ============================================================
   GoFit — Service Worker
   Sorgt dafür, dass die App nach dem ersten Aufruf auch ohne
   Internetverbindung startet. Es werden ausschließlich die
   eigenen Programmdateien zwischengespeichert – keine
   Nutzerdaten, keine Anfragen an fremde Server.
   ============================================================ */
var CACHE = 'gofit-v1.0.2';

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
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './assets/exercises/bench-bb.gif'
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
