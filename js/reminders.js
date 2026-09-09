/* ============================================================
   G04Fit — Erinnerungen

   Konzept Abschnitt 8: geplante Einheiten erinnern und nach
   längeren Pausen den Wiedereinstieg anstoßen.

   Umsetzung:
   · Solange die App geöffnet ist, wird lokal geprüft und über die
     Notification-API erinnert.
   · Web Push synchronisiert Uhrzeit und Trainingstage mit dem optionalen
     G04Fit Push Worker und funktioniert dadurch auch bei geschlossener App.
   · Notification Triggers bleiben als zusätzlicher lokaler Fallback aktiv.
   · Ist keine Systembenachrichtigung erlaubt oder möglich,
     erscheint die Erinnerung als Hinweis in der App.
   · Ohne Einwilligung "Benachrichtigungen" passiert nichts.
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;
  var timer = null;
  var firedToday = {};
  var audioContext = null;
  var PUSH_API = String(window.GOFIT_PUSH_API || '').replace(/\/+$/, '');
  var MOTIVATION_MESSAGES = [
    { title: 'Komm, trainieren! 💪', body: 'Dein Plan wartet auf dich. Öffne G04Fit und leg los.' },
    { title: 'Heute ist ein guter Tag zum Trainieren', body: 'Ein kleiner Anfang reicht – der Rest kommt mit der Bewegung.' },
    { title: 'Zeit für dich und dein Training', body: 'Schenk dir diese Einheit. Danach wirst du froh sein, angefangen zu haben.' },
    { title: 'Nur anfangen', body: 'Du musst nicht perfekt trainieren. Du musst nur den ersten Satz machen.' },
    { title: 'Dein stärkeres Ich wartet', body: 'Jede Einheit zählt. Öffne G04Fit und mach heute deinen nächsten Schritt.' },
    { title: 'Los geht’s! 🔥', body: 'Deine heutige Einheit bringt dich deinem Ziel ein Stück näher.' },
    { title: 'Mach heute zu deinem Trainingstag', body: 'Motivation kommt beim Machen. Starte jetzt mit G04Fit.' },
    { title: 'Du kannst das', body: 'Ein Training, ein Schritt, ein Erfolg. Heute zählt.' }
  ];

  function st() { return G.store.state; }
  function allowed() { return G.store.hasConsent('push'); }

  /* Für denselben Kalendertag bleibt der Text stabil, an den nächsten
     Trainingstagen wechselt er automatisch. */
  function motivationFor(day, planTitle) {
    var key = String(day || u.today());
    var hash = 0;
    for (var i = 0; i < key.length; i++) hash = ((hash * 31) + key.charCodeAt(i)) >>> 0;
    var message = MOTIVATION_MESSAGES[hash % MOTIVATION_MESSAGES.length];
    return {
      title: message.title,
      body: planTitle ? message.body + ' Heute: ' + planTitle + '.' : message.body
    };
  }

  function supported() {
    return typeof Notification !== 'undefined';
  }

  function permission() {
    if (!supported()) return 'unsupported';
    return Notification.permission;
  }

  function isIOSDevice() {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  }

  function backgroundSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && supported();
  }

  function backgroundStatus() {
    if (!PUSH_API) return 'unconfigured';
    if (isIOSDevice() && !isStandaloneApp()) return 'install-required';
    if (!backgroundSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    if (Notification.permission === 'granted') return 'available';
    return 'permission-required';
  }

  function base64UrlToBytes(value) {
    var padding = '='.repeat((4 - value.length % 4) % 4);
    var binary = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, function (char) { return char.charCodeAt(0); });
  }

  function randomBase64Url(bytes) {
    var values = new Uint8Array(bytes);
    crypto.getRandomValues(values);
    var binary = '';
    values.forEach(function (value) { binary += String.fromCharCode(value); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function pushIdentity() {
    var deviceId = localStorage.getItem('gofit.push.deviceId');
    var deviceSecret = localStorage.getItem('gofit.push.deviceSecret');
    if (!deviceId) {
      deviceId = crypto.randomUUID ? crypto.randomUUID() : randomBase64Url(18);
      localStorage.setItem('gofit.push.deviceId', deviceId);
    }
    if (!deviceSecret) {
      deviceSecret = randomBase64Url(32);
      localStorage.setItem('gofit.push.deviceSecret', deviceSecret);
    }
    return { deviceId: deviceId, deviceSecret: deviceSecret };
  }

  async function pushRequest(path, options) {
    if (!PUSH_API) throw new Error('Der Push-Server ist noch nicht konfiguriert.');
    options = options || {};
    var identity = pushIdentity();
    var response = await fetch(PUSH_API + path, Object.assign({}, options, {
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + identity.deviceSecret
      }, options.headers || {})
    }));
    if (!response.ok) {
      var detail = await response.json().catch(function () { return {}; });
      throw new Error(detail.error || 'Push-Server nicht erreichbar.');
    }
    return response.json().catch(function () { return {}; });
  }

  async function syncPushSchedule(subscription) {
    if (!allowed() || !PUSH_API || !backgroundSupported() || Notification.permission !== 'granted') return false;
    var registration = await navigator.serviceWorker.ready;
    var active = subscription || await registration.pushManager.getSubscription();
    if (!active) return false;
    var identity = pushIdentity();
    await pushRequest('/api/devices/' + encodeURIComponent(identity.deviceId), {
      method: 'PUT',
      body: JSON.stringify({
        subscription: active.toJSON(),
        reminder: {
          enabled: true,
          time: st().profile.reminderTime || '18:00',
          days: st().profile.trainingDays || [1, 3, 5],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin'
        }
      })
    });
    return true;
  }

  async function enableBackgroundPush() {
    if (!PUSH_API) throw new Error('Der G04Fit Push-Server ist noch nicht verbunden.');
    if (isIOSDevice() && !isStandaloneApp()) {
      throw new Error('Füge G04Fit zuerst zum iPhone-Home-Bildschirm hinzu und öffne es von dort.');
    }
    if (!backgroundSupported()) throw new Error('Dieser Browser unterstützt keine Hintergrund-Benachrichtigungen.');

    var granted = await requestPermission();
    if (granted !== 'granted') {
      throw new Error('Benachrichtigungen wurden nicht erlaubt. Du kannst sie in den Systemeinstellungen freigeben.');
    }

    var keyResponse = await fetch(PUSH_API + '/vapid-public-key');
    if (!keyResponse.ok) throw new Error('Der Push-Server ist nicht erreichbar.');
    var keyData = await keyResponse.json();
    if (!keyData.publicKey) throw new Error('Der Push-Server ist noch nicht vollständig eingerichtet.');

    var registration = await navigator.serviceWorker.ready;
    var subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(keyData.publicKey)
      });
    }
    await syncPushSchedule(subscription);
    return true;
  }

  async function disableBackgroundPush() {
    if (!backgroundSupported()) return;
    var registration = await navigator.serviceWorker.ready;
    var subscription = await registration.pushManager.getSubscription();
    var deviceId = localStorage.getItem('gofit.push.deviceId');
    var serverError = null;
    try {
      if (PUSH_API && deviceId) {
        await pushRequest('/api/devices/' + encodeURIComponent(deviceId), { method: 'DELETE' });
      }
    } catch (e) {
      serverError = e;
    } finally {
      if (subscription) await subscription.unsubscribe();
    }
    if (serverError) throw serverError;
  }

  async function testBackgroundPush() {
    if (!PUSH_API || !backgroundSupported() || Notification.permission !== 'granted') return false;
    var registration = await navigator.serviceWorker.ready;
    var subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;
    var identity = pushIdentity();
    await pushRequest('/api/devices/' + encodeURIComponent(identity.deviceId) + '/test', {
      method: 'POST', body: '{}'
    });
    return true;
  }

  /** Systemerlaubnis anfragen – nur nach ausdrücklicher Nutzeraktion aufrufen */
  async function requestPermission() {
    if (!supported()) return 'unsupported';
    try {
      var p = await Notification.requestPermission();
      return p;
    } catch (e) {
      return 'denied';
    }
  }

  async function notify(title, body, tag, options) {
    if (!allowed()) return false;
    options = options || {};
    if (supported() && Notification.permission === 'granted') {
      var notificationOptions = {
        body: body,
        tag: tag || 'gofit',
        icon: './icons/icon-v3-192.png',
        badge: './icons/icon-v3-192.png',
        silent: options.silent == null ? !!st().settings.soundless : !!options.silent,
        requireInteraction: !!options.requireInteraction,
        data: { url: options.url || './index.html#workout' }
      };

      // Eine Service-Worker-Benachrichtigung bleibt auch sichtbar, wenn
      // G04Fit minimiert ist oder der Browser die Seite in den Hintergrund legt.
      try {
        if ('serviceWorker' in navigator) {
          var registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, notificationOptions);
          return true;
        }
      } catch (e) { /* Fallback unten */ }

      try {
        notificationOptions.icon = iconDataUrl();
        notificationOptions.badge = iconDataUrl();
        new Notification(title, notificationOptions);
        return true;
      } catch (e) { /* Fallback unten */ }
    }
    u.toast(title, body, 'ok', 6500);
    return false;
  }

  /* Push-Zeitplan synchronisieren und zusätzlich lokale Notification
     Triggers verwenden, wenn der Browser sie anbietet. */
  async function scheduleBackground() {
    if (!allowed() || !supported() || Notification.permission !== 'granted') return 0;
    try { await syncPushSchedule(); } catch (e) { /* lokale Erinnerung bleibt aktiv */ }
    if (!('serviceWorker' in navigator) || typeof TimestampTrigger === 'undefined') return 0;
    try {
      var registration = await navigator.serviceWorker.ready;
      var items = upcoming(14).filter(function (i) { return !i.done; });
      var jobs = items.map(function (i) {
        var day = G.u.parseDay(i.day);
        var hm = String(i.time || '18:00').split(':');
        day.setHours(+hm[0] || 0, +hm[1] || 0, 0, 0);
        var timestamp = day.getTime();
        if (timestamp <= Date.now()) return null;
        var message = motivationFor(i.day, i.title);
        return registration.showNotification(message.title, {
          body: message.body,
          tag: 'gofit-plan-' + i.day,
          icon: './icons/icon-v3-192.png',
          badge: './icons/icon-v3-192.png',
          silent: !!st().settings.soundless,
          data: { url: './index.html#workout' },
          showTrigger: new TimestampTrigger(timestamp)
        });
      }).filter(Boolean);
      await Promise.all(jobs);
      return jobs.length;
    } catch (e) {
      return 0;
    }
  }

  /** Audio bei einer Nutzeraktion freischalten, bevor die App im Hintergrund ist. */
  function prepareAlarm(force) {
    if (st().settings.soundless && !force) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume().catch(function () {});
    } catch (e) { /* Systemton der Benachrichtigung bleibt als Fallback */ }
  }

  async function playAlarm(force) {
    if (st().settings.soundless && !force) return false;
    prepareAlarm(force);
    if (!audioContext) return false;
    if (audioContext.state === 'suspended') {
      try { await audioContext.resume(); } catch (e) { return false; }
    }
    if (audioContext.state !== 'running') return false;

    try {
      var now = audioContext.currentTime;
      var selected = st().settings.alarmSound || 'signal';
      var sounds = {
        signal: [
          { at: 0, hz: 880, len: 0.24, type: 'sine' },
          { at: 0.32, hz: 880, len: 0.24, type: 'sine' },
          { at: 0.64, hz: 880, len: 0.24, type: 'sine' }
        ],
        pulse: [
          { at: 0, hz: 620, len: 0.18, type: 'square' },
          { at: 0.22, hz: 820, len: 0.18, type: 'square' },
          { at: 0.44, hz: 620, len: 0.18, type: 'square' },
          { at: 0.66, hz: 980, len: 0.28, type: 'square' }
        ],
        chime: [
          { at: 0, hz: 523.25, len: 0.55, type: 'sine' },
          { at: 0.16, hz: 659.25, len: 0.55, type: 'sine' },
          { at: 0.32, hz: 783.99, len: 0.7, type: 'sine' },
          { at: 0.48, hz: 1046.5, len: 0.8, type: 'sine' }
        ]
      };
      (sounds[selected] || sounds.signal).forEach(function (note) {
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        osc.type = note.type;
        osc.frequency.setValueAtTime(note.hz, now + note.at);
        gain.gain.setValueAtTime(0.0001, now + note.at);
        gain.gain.exponentialRampToValueAtTime(note.type === 'square' ? 0.11 : 0.22, now + note.at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.len);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + note.at);
        osc.stop(now + note.at + note.len + 0.02);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function restFinished() {
    playAlarm();
    return notify('G04Fit · Pause vorbei', 'Weiter mit dem nächsten Satz.', 'gofit-rest', {
      silent: st().settings.soundless,
      requireInteraction: true,
      url: './index.html#workout'
    });
  }

  /* ---------- Klingeln bei Pausenende ---------- */
  var ringTimer = null;

  /** Wiederholt den Alarmton für ca. `ms` Millisekunden (Standard 10 s),
      damit die abgelaufene Satzpause auch auffällt, wenn man kurz nicht
      aufs Handy schaut. Respektiert die Stumm-Einstellung wie playAlarm().
      Endet von selbst — oder sofort über stopRingAlarm(). */
  function ringAlarm(ms) {
    stopRingAlarm();
    ms = ms || 10000;
    var elapsed = 0, step = 1200;
    ringTimer = setInterval(function () {
      elapsed += step;
      if (elapsed >= ms) { stopRingAlarm(); return; }
      playAlarm();
    }, step);
  }

  function stopRingAlarm() {
    if (ringTimer) clearInterval(ringTimer);
    ringTimer = null;
  }

  function iconDataUrl() {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="16" fill="#05070A"/>' +
      '<path d="M18 42 L30 22 L34 30 L40 22 L46 42" stroke="#3DFF9E" stroke-width="5" fill="none" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
  }

  /* ------------------------------------------------------------
     Anstehende Erinnerungen berechnen
     ------------------------------------------------------------ */
  function upcoming(limit) {
    var s = st();
    var plan = G.planner.weekPlan();
    var next = G.planner.weekPlan(u.addDays(u.weekStart(), 7));
    var today = u.today();
    var time = s.profile.reminderTime || '18:00';

    var items = plan.concat(next)
      .filter(function (p) { return p.day >= today; })
      .map(function (p) {
        var doneThatDay = s.history.some(function (h) { return h.day === p.day; });
        return {
          day: p.day,
          time: time,
          title: p.name,
          muscles: p.muscles,
          done: doneThatDay,
          isToday: p.day === today,
          when: u.dayName(p.day, true) + ', ' + u.fmtDateShort(p.day) + ' · ' + time
        };
      });

    return items.slice(0, limit || 6);
  }

  /** Der Termin, auf den die App als Nächstes hinweist */
  function nextReminder() {
    return upcoming(8).filter(function (i) { return !i.done; })[0] || null;
  }

  /* ------------------------------------------------------------
     Prüfschleife (nur bei geöffneter App)
     ------------------------------------------------------------ */
  function check() {
    if (!allowed()) return;
    var s = st();
    var today = u.today();
    var now = new Date();
    var hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // 1) Trainingserinnerung zur eingestellten Zeit
    var plan = G.planner.todayPlan();
    var already = s.history.some(function (h) { return h.day === today; });
    var key = 'train-' + today;

    if (plan && !already && !firedToday[key] && hhmm >= (s.profile.reminderTime || '18:00')) {
      firedToday[key] = true;
      var message = motivationFor(today, plan.name);
      notify(message.title, message.body, 'gofit-train');
    }

    // 2) Wiedereinstieg nach längerer Pause
    if (s.settings.reentry) {
      var re = G.coach.reentry();
      var rkey = 're-' + today;
      if (re && !firedToday[rkey]) {
        firedToday[rkey] = true;
        notify('G04Fit · Wiedereinstieg',
          re.days + ' Tage ohne Training. G04Fit hat die Gewichte für den Neustart angepasst.', 'gofit-reentry');
      }
    }
  }

  function start() {
    stop();
    check();
    scheduleBackground();
    timer = setInterval(check, 60000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  /** Testbenachrichtigung für die Einstellungsseite */
  async function test() {
    if (!allowed()) {
      u.toast('Nicht erlaubt', 'Aktiviere zuerst die Einwilligung für Benachrichtigungen.', 'warn');
      return;
    }
    if (supported() && Notification.permission === 'default') {
      await requestPermission();
    }
    try {
      if (await testBackgroundPush()) {
        u.toast('Test gesendet', 'Die Push-Nachricht sollte gleich erscheinen.', 'ok');
        return;
      }
    } catch (e) {
      u.toast('Push-Test fehlgeschlagen', e.message || 'Der Push-Server ist nicht erreichbar.', 'warn', 6500);
    }
    var preview = motivationFor(u.today(), 'dein Training');
    var ok = await notify(preview.title, preview.body, 'gofit-test');
    if (!ok) {
      u.toast('Als App-Hinweis zugestellt',
        'Systembenachrichtigungen sind hier nicht verfügbar – beim Start über einen lokalen Server funktionieren sie.', 'warn', 6000);
    }
  }

  G.reminders = {
    allowed: allowed,
    supported: supported,
    permission: permission,
    requestPermission: requestPermission,
    notify: notify,
    prepareAlarm: prepareAlarm,
    playAlarm: playAlarm,
    restFinished: restFinished,
    ringAlarm: ringAlarm,
    stopRingAlarm: stopRingAlarm,
    upcoming: upcoming,
    nextReminder: nextReminder,
    motivationFor: motivationFor,
    start: start,
    stop: stop,
    check: check,
    scheduleBackground: scheduleBackground,
    syncPushSchedule: syncPushSchedule,
    enableBackgroundPush: enableBackgroundPush,
    disableBackgroundPush: disableBackgroundPush,
    backgroundSupported: backgroundSupported,
    backgroundStatus: backgroundStatus,
    test: test
  };
})(G04Fit);
