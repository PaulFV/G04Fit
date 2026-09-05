/* ============================================================
   GoFit — Erinnerungen
   Konzept Abschnitt 8: intelligente Erinnerungen an geplante
   Einheiten und ein Wiedereinstiegsmodus nach längeren Pausen.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  function iosInstallHint() {
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    if (!ios || standalone) return '';
    return '<div class="note note--warn">' + u.icon('info', 18) +
      '<div><b>Für Benachrichtigungen auf dem iPhone</b><br>' +
      'Öffne in Safari „Teilen“ und wähle „Zum Home-Bildschirm“. Starte GoFit danach über das App-Symbol ' +
      'und erlaube die Benachrichtigungen.</div></div>';
  }

  function permissionBox() {
    var perm = G.reminders.permission();
    if (!G.store.hasConsent('push')) return '';

    if (perm === 'unsupported') {
      return '<div class="note note--warn">' + u.icon('warn', 18) +
        '<div>Dieser Browser unterstützt keine Systembenachrichtigungen. ' +
        'GoFit zeigt Erinnerungen stattdessen als Hinweis in der App an, solange sie geöffnet ist.</div></div>';
    }
    if (perm === 'granted') {
      return '<div class="note note--neon">' + u.icon('check', 18) +
        '<div>Systembenachrichtigungen sind erlaubt. GoFit synchronisiert deine Trainingstage mit dem ' +
        'Push-Dienst und kann dich dadurch auch bei vollständig geschlossener App erinnern.</div></div>';
    }
    if (perm === 'denied') {
      return '<div class="note note--warn">' + u.icon('warn', 18) +
        '<div>Benachrichtigungen wurden im Browser blockiert. Du kannst das in den Website-Einstellungen ' +
        'wieder freigeben. Bis dahin erscheinen Erinnerungen nur innerhalb der App.</div></div>';
    }
    return '<div class="note">' + u.icon('info', 18) +
      '<div>Der Browser hat noch nicht nach der Erlaubnis gefragt.' +
      '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn btn--sm btn--primary" data-act="ask">Systembenachrichtigungen erlauben</button>' +
      '</div></div></div>';
  }

  function upcomingList() {
    var items = G.reminders.upcoming(8);
    if (!items.length) {
      return '<div class="empty">' + u.icon('reminders', 40) + '<b>Keine Termine</b>' +
        '<p>Lege im Profil Trainingstage fest, dann erscheinen hier die nächsten Einheiten.</p></div>';
    }
    return '<div class="list">' + items.map(function (i) {
      return '<div class="list__row">' +
        '<div class="list__ic"' + (i.done ? ' style="border-color:var(--neon-line);color:var(--neon)"' : '') + '>' +
        u.icon(i.done ? 'check' : 'clock', 17) + '</div>' +
        '<div class="list__main"><b>' + u.esc(i.title) + '</b><span>' + u.esc(i.when) + '</span></div>' +
        '<div class="list__end">' +
        (i.done ? '<span class="pill pill--neon">erledigt</span>'
          : i.isToday ? '<span class="pill pill--gold">heute</span>'
            : '<span class="pill pill--muted">geplant</span>') +
        '</div></div>';
    }).join('') + '</div>';
  }

  G.views.reminders = {
    title: 'Erinnerungen',
    sub: function () {
      var n = G.reminders.nextReminder();
      if (!G.store.hasConsent('push')) return 'Ausgeschaltet';
      return n ? 'Nächste: ' + n.when : 'Keine offenen Termine';
    },
    render: function () {
      var s = G.store.state;
      var on = G.store.hasConsent('push');
      var re = G.coach.allowed() ? G.coach.reentry() : null;
      var days = G.store.daysSinceLastWorkout();

      return '<div class="view stack">' +

        '<div class="card card--hero' + (on ? ' card--hl' : '') + '">' +
        '<div class="row" style="gap:16px;flex-wrap:wrap">' +
        '<div class="coach__av" style="animation:none">' + u.icon(on ? 'reminders' : 'lock', 20) + '</div>' +
        '<div style="flex:1;min-width:200px">' +
        '<h2 style="font-size:20px">' + (on ? 'Erinnerungen sind aktiv' : 'Erinnerungen sind aus') + '</h2>' +
        '<p class="muted small" style="margin-top:5px">' +
        (on ? 'GoFit meldet sich an deinen Trainingstagen um ' + u.esc(s.profile.reminderTime) + ' Uhr.'
          : 'Ohne die Einwilligung „Benachrichtigungen“ erinnert GoFit dich nicht.') + '</p>' +
        '</div>' +
        '<div class="btn-row">' +
        (on
          ? '<button class="btn" data-act="test">Testerinnerung</button>' +
          '<button class="btn btn--ghost" data-act="off">Abschalten</button>'
          : '<button class="btn btn--primary" data-act="on">Erinnerungen erlauben</button>') +
        '</div></div></div>' +

        iosInstallHint() + permissionBox() +

        '<div class="grid grid--2">' +

        '<div class="card">' +
        '<div class="card__head">' + u.icon('clock', 18) + '<h3>Zeitpunkt</h3></div>' +
        '<div class="field"><label>Uhrzeit der Erinnerung</label>' +
        '<input class="input" id="remTime" type="time" value="' + u.esc(s.profile.reminderTime || '18:00') + '">' +
        '<span class="field__hint">Gilt für alle Trainingstage.</span></div>' +

        '<div class="field" style="margin-top:16px"><label>Trainingstage</label>' +
        '<div class="chips" style="margin-top:6px">' +
        [1, 2, 3, 4, 5, 6, 0].map(function (d) {
          return '<button class="chip' + ((s.profile.trainingDays || []).indexOf(d) >= 0 ? ' is-on' : '') +
            '" data-day="' + d + '">' + u.DAYS[d] + '</button>';
        }).join('') + '</div></div>' +

        '<label class="switch" style="margin-top:16px">' +
        '<input type="checkbox" id="remReentry"' + (s.settings.reentry ? ' checked' : '') + '>' +
        '<span class="switch__track"></span>' +
        '<span class="switch__label"><b>Wiedereinstiegsmodus</b>' +
        '<span>Nach mehr als 10 Tagen ohne Training erinnert GoFit gesondert und reduziert die Gewichte.</span></span></label>' +
        '</div>' +

        '<div class="card">' +
        '<div class="card__head">' + u.icon('reminders', 18) + '<h3>Nächste Termine</h3></div>' +
        upcomingList() +
        '</div></div>' +

        /* Wiedereinstieg-Status */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('refresh', 18) + '<h3>Wiedereinstieg</h3>' +
        '<span class="spacer"></span>' +
        (days == null ? '<span class="pill pill--muted">noch kein Training</span>'
          : '<span class="pill ' + (days > 10 ? 'pill--gold' : 'pill--neon') + '">' +
          (days === 0 ? 'heute trainiert' : 'letzte Einheit vor ' + days + ' Tagen') + '</span>') +
        '</div>' +
        (re
          ? '<p class="small muted">' + u.esc(re.text) + '</p>' +
          '<div class="row row--wrap" style="gap:8px;margin-top:12px">' +
          '<span class="pill pill--neon">Gewichte auf ' + Math.round(re.factor * 100) + ' %</span>' +
          '<span class="pill">Aufbau über ' + re.weeks + (re.weeks === 1 ? ' Woche' : ' Wochen') + '</span>' +
          '</div>'
          : '<p class="small muted">' +
          (days == null
            ? 'Sobald du die erste Einheit abgeschlossen hast, überwacht GoFit deine Pausen.'
            : days > 10
              ? 'Der Wiedereinstiegsmodus greift, sobald der Coach die Auswertung übernehmen darf.'
              : 'Deine Pausen sind im normalen Bereich. Es ist keine Anpassung nötig.') + '</p>') +
        '</div>' +

      '<div class="note">' + u.icon('info', 18) +
        '<div><b>Hintergrund-Benachrichtigungen wie bei GoSleep</b><br>' +
        'GoFit meldet Uhrzeit und Trainingstage verschlüsselt beim Push-Dienst an. Auf dem iPhone muss ' +
        'GoFit dafür als Home-Bildschirm-App installiert und von dort geöffnet sein. Ohne Push-Unterstützung ' +
        'bleibt die lokale Erinnerung innerhalb der geöffneten App aktiv.</div></div>' +

        '</div>';
    },
    mount: function (host) {
      var s = G.store.state;

      u.on(host, 'click', '[data-act="on"]', async function () {
        G.store.setConsent('push', true);
        try {
          await G.reminders.enableBackgroundPush();
          u.toast('Push aktiv', 'GoFit erinnert dich auch bei geschlossener App.', 'ok');
        } catch (e) {
          await G.reminders.requestPermission();
          u.toast('Lokale Erinnerung aktiv', e.message || 'Hintergrund-Push ist noch nicht verfügbar.', 'warn', 7000);
        }
        G.reminders.start();
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="off"]', async function () {
        try { await G.reminders.disableBackgroundPush(); } catch (e) { /* lokal trotzdem abschalten */ }
        G.store.setConsent('push', false);
        G.reminders.stop();
        u.toast('Erinnerungen aus', 'GoFit sendet keine Hinweise mehr.', 'warn');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="ask"]', async function () {
        try {
          await G.reminders.enableBackgroundPush();
          u.toast('Erlaubt', 'Hintergrund-Benachrichtigungen sind freigegeben.', 'ok');
        } catch (e) {
          u.toast('Nicht aktiviert', e.message || 'GoFit zeigt Erinnerungen weiterhin in der App.', 'warn', 7000);
        }
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="test"]', function () { G.reminders.test(); });

      var t = host.querySelector('#remTime');
      if (t) t.addEventListener('change', function () {
        s.profile.reminderTime = t.value || '18:00';
        G.store.commit('reminder-time');
        G.reminders.scheduleBackground();
        u.toast('Zeit gespeichert', 'Erinnerung um ' + s.profile.reminderTime + ' Uhr.', 'ok');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-day]', function (e, tt) {
        var d = +tt.getAttribute('data-day');
        var arr = s.profile.trainingDays || [];
        var i = arr.indexOf(d);
        if (i >= 0) arr.splice(i, 1); else arr.push(d);
        if (!arr.length) arr.push(d);
        s.profile.trainingDays = arr;
        G.store.commit('days');
        G.reminders.scheduleBackground();
        G.app.rerender();
      });

      var re = host.querySelector('#remReentry');
      if (re) re.addEventListener('change', function () {
        s.settings.reentry = re.checked;
        G.store.commit('settings');
        G.app.rerender();
      });
    }
  };
})(GoFit);
