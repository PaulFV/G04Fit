/* ============================================================
   GoFit — Erinnerungen

   Konzept Abschnitt 8: geplante Einheiten erinnern und nach
   längeren Pausen den Wiedereinstieg anstoßen.

   Umsetzung im Prototyp:
   · Solange die App geöffnet ist, wird lokal geprüft und über die
     Notification-API erinnert.
   · Ist keine Systembenachrichtigung erlaubt oder möglich,
     erscheint die Erinnerung als Hinweis in der App.
   · Ohne Einwilligung "Benachrichtigungen" passiert nichts.
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;
  var timer = null;
  var firedToday = {};

  function st() { return G.store.state; }
  function allowed() { return G.store.hasConsent('push'); }

  function supported() {
    return typeof Notification !== 'undefined';
  }

  function permission() {
    if (!supported()) return 'unsupported';
    return Notification.permission;
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

  function notify(title, body, tag) {
    if (!allowed()) return false;
    if (supported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          tag: tag || 'gofit',
          icon: iconDataUrl(),
          badge: iconDataUrl(),
          silent: !!st().settings.soundless
        });
        return true;
      } catch (e) { /* Fallback unten */ }
    }
    u.toast(title, body, 'ok', 6500);
    return false;
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
      notify('GoFit · Training steht an',
        plan.name + ' — ' + plan.exercises.length + ' Übungen geplant.', 'gofit-train');
    }

    // 2) Wiedereinstieg nach längerer Pause
    if (s.settings.reentry) {
      var re = G.coach.reentry();
      var rkey = 're-' + today;
      if (re && !firedToday[rkey]) {
        firedToday[rkey] = true;
        notify('GoFit · Wiedereinstieg',
          re.days + ' Tage ohne Training. GoFit hat die Gewichte für den Neustart angepasst.', 'gofit-reentry');
      }
    }
  }

  function start() {
    stop();
    check();
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
    var ok = notify('GoFit · Testerinnerung',
      'So sieht deine Trainingserinnerung aus.', 'gofit-test');
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
    upcoming: upcoming,
    nextReminder: nextReminder,
    start: start,
    stop: stop,
    check: check,
    test: test
  };
})(GoFit);
