/* ============================================================
   GoFit Coach — Ansicht
   Konzept Abschnitt 6: Analyse der Trainingsdaten und
   individuelle Vorschläge für Gewicht, Wiederholungen,
   Progression und Wiedereinstieg.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  function lockedView() {
    return '<div class="view stack">' +
      '<div class="card card--hero">' +
      '<div class="coach">' +
      '<div class="coach__av">' + u.icon('lock', 20) + '</div>' +
      '<div style="flex:1">' +
      '<h2 style="font-size:20px;margin-bottom:8px">Der Coach ist ausgeschaltet</h2>' +
      '<p class="muted small">Damit GoFit Vorschläge zu Gewicht und Progression machen kann, muss er ' +
      'deine Trainingsdaten auswerten dürfen. Dafür brauchst du die Einwilligung <b>KI-Analyse</b>.</p>' +
      '</div></div>' +
      '<div class="btn-row" style="margin-top:20px">' +
      '<button class="btn btn--primary" data-act="enable-ai">Auswertung erlauben</button>' +
      '<button class="btn btn--ghost" data-go="privacy">Datenschutz öffnen</button>' +
      '</div></div>' +

      '<div class="note note--neon">' + u.icon('info', 18) +
      '<div><b>Was passiert bei der Auswertung?</b><br>' +
      'GoFit rechnet ausschließlich auf diesem Gerät. Es werden keine Daten an einen Server oder an ' +
      'einen externen Dienst gesendet. Die Regeln sind nachvollziehbar: Wiederholungen, Gewichte, ' +
      'Pausenlängen und der Abstand zwischen Einheiten.</div></div>' +

      '<div class="card">' +
      '<div class="card__head">' + u.icon('dumbbell', 18) + '<h3>Beispiel für eine Empfehlung</h3></div>' +
      '<div class="coach"><div class="coach__av">' + u.icon('coach', 19) + '</div>' +
      '<div class="coach__msg">Du hast <b>80 kg × 12</b> sauber geschafft. Erhöhe auf <b>82,5 kg</b> ' +
      'und arbeite dich wieder in Richtung 12 Wiederholungen.</div></div>' +
      '<p class="tiny dim" style="margin-top:12px">So sehen die Vorschläge aus, sobald die Auswertung aktiv ist.</p>' +
      '</div></div>';
  }

  function insightCard(i) {
    var cls = i.kind === 'warn' ? 'note--warn' : i.kind === 'ok' ? 'note--neon' : '';
    return '<div class="note ' + cls + '">' + u.icon(i.icon || 'info', 18) +
      '<div><b>' + u.esc(i.title) + '</b><br>' + u.esc(i.text) + '</div></div>';
  }

  /** Übungen, für die aktuell ein Vorschlag sinnvoll ist */
  function suggestionRows() {
    var s = G.store.state;
    var ids = {};

    // Übungen aus dem aktuellen Wochenplan
    G.planner.weekPlan().forEach(function (p) {
      p.exercises.forEach(function (id) { ids[id] = true; });
    });
    // Übungen aus den letzten Einheiten
    s.history.slice(-8).forEach(function (sess) {
      (sess.exercises || []).forEach(function (b) { ids[b.exId] = true; });
    });

    return Object.keys(ids).map(function (id) {
      var ex = G.ex.byId(id);
      if (!ex) return null;
      return { ex: ex, s: G.coach.suggestNext(id) };
    }).filter(Boolean).sort(function (a, b) {
      var rank = { up: 0, start: 1, hold: 2, down: 3 };
      return (rank[a.s.kind] - rank[b.s.kind]) || a.ex.name.localeCompare(b.ex.name, 'de');
    });
  }

  function kindPill(kind) {
    if (kind === 'up') return '<span class="pill pill--neon">' + u.icon('arrowUp', 12) + ' steigern</span>';
    if (kind === 'down') return '<span class="pill pill--danger">reduzieren</span>';
    if (kind === 'start') return '<span class="pill pill--cyan">Start</span>';
    return '<span class="pill pill--muted">halten</span>';
  }

  G.views.coach = {
    title: 'GoFit Coach',
    sub: function () {
      if (!G.coach.allowed()) return 'Auswertung ist ausgeschaltet';
      var n = suggestionRows().filter(function (r) { return r.s.kind === 'up'; }).length;
      return n ? n + (n === 1 ? ' Übung bereit für mehr Gewicht' : ' Übungen bereit für mehr Gewicht')
        : 'Analyse deiner Trainingsdaten';
    },
    render: function () {
      if (!G.coach.allowed()) return lockedView();

      var s = G.store.state;
      var ins = G.coach.insights();
      var rows = suggestionRows();
      var re = G.coach.reentry();
      var metrics = G.coach.metrics();

      return '<div class="view stack">' +

        /* Kopf */
        '<div class="card card--hero card--hl">' +
        '<div class="coach">' +
        '<div class="coach__av">' + u.icon('coach', 20) + '</div>' +
        '<div style="flex:1">' +
        '<p class="muted small">Auswertung vom ' + u.fmtDate(u.today()) + '</p>' +
        '<h2 style="font-size:20px;margin:4px 0 8px">' +
        (s.history.length
          ? s.history.length + ' Einheiten ausgewertet'
          : 'Noch keine Trainingsdaten') + '</h2>' +
        '<p class="muted small">Alle Berechnungen laufen lokal auf diesem Gerät.</p>' +
        '</div></div></div>' +

        /* Wiedereinstieg */
        (re ? '<div class="card card--hl">' +
          '<div class="card__head">' + u.icon('refresh', 18) + '<h3>Wiedereinstieg</h3>' +
          '<span class="spacer"></span><span class="pill pill--gold">' + re.days + ' Tage Pause</span></div>' +
          '<p class="small muted">' + u.esc(re.text) + '</p>' +
          '<div class="row row--wrap" style="gap:8px;margin-top:14px">' +
          '<span class="pill pill--neon">Gewicht auf ' + Math.round(re.factor * 100) + ' %</span>' +
          '<span class="pill">Aufbau über ' + re.weeks + (re.weeks === 1 ? ' Woche' : ' Wochen') + '</span>' +
          (G.store.state.settings.reentry ? '<span class="pill pill--neon">automatisch aktiv</span>'
            : '<span class="pill pill--muted">im Profil deaktiviert</span>') +
          '</div></div>' : '') +

        /* Hinweise */
        (ins.length
          ? '<div class="sec"><h2>Beobachtungen</h2><span class="sec__line"></span></div>' +
          '<div class="stack" style="--sp:10px">' + ins.map(insightCard).join('') + '</div>'
          : '') +

        /* Empfehlungen je Übung */
        '<div class="sec"><h2>Empfehlungen je Übung</h2><span class="sec__line"></span>' +
        '<span class="tiny dim">' + rows.length + ' Übungen</span></div>' +

        (rows.length
          ? '<div class="card card--flush"><div class="list" style="padding:6px 14px">' +
          rows.map(function (r) {
            var ex = r.ex, g = r.s;
            return '<div class="list__row list__row--click" data-ex="' + ex.id + '">' +
              '<div class="list__ic list__ic--map">' +
              G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</div>' +
              '<div class="list__main">' +
              '<b>' + u.esc(ex.name) + '</b>' +
              '<span>' + u.esc(g.reason) + '</span></div>' +
              '<div class="list__end" style="min-width:96px">' +
              '<b class="mono small' + (g.kind === 'up' ? ' neon' : g.kind === 'down' ? '' : '') + '"' +
              (g.kind === 'down' ? ' style="color:var(--danger)"' : '') + '>' +
              (ex.time ? u.fmtReps(g.reps, 's') : u.fmt(g.weight) + ' kg') + '</b>' +
              '<br><span class="tiny dim">' + (ex.time ? 'Haltezeit' : u.fmtReps(g.reps) + ' × ' + g.sets) + '</span>' +
              '<br>' + kindPill(g.kind) +
              '</div></div>';
          }).join('') + '</div></div>'
          : '<div class="empty">' + u.icon('coach', 40) + '<b>Noch keine Grundlage</b>' +
          '<p>Absolviere eine Einheit, danach entstehen konkrete Vorschläge.</p></div>') +

        /* Leistungsprofil */
        '<div class="sec"><h2>Leistungsprofil</h2><span class="sec__line"></span></div>' +
        '<div class="grid grid--2">' +
        '<div class="card">' + G.charts.radar(metrics, { size: 250 }) + '</div>' +
        '<div class="card">' +
        '<div class="card__head">' + u.icon('target', 18) + '<h3>Kennzahlen</h3></div>' +
        '<div class="attrs">' + metrics.map(function (m) {
          return '<div class="attr">' +
            '<span class="muted">' + u.esc(m.label) + '</span>' +
            '<span class="bar"><span class="bar__fill" style="width:' + Math.round(m.value * 100) + '%"></span></span>' +
            '<span class="attr__v neon">' + Math.round(m.value * 100) + '</span>' +
            '</div>';
        }).join('') + '</div>' +
        '<div class="note note--warn" style="margin-top:16px">' + u.icon('warn', 17) +
        '<div>Die Kennzahlen beschreiben nur dein Trainingsverhalten in GoFit. ' +
        '<b>Sie sind ausdrücklich keine medizinischen Werte.</b></div></div>' +
        '</div></div>' +

        '<div class="note">' + u.icon('info', 18) +
        '<div><b>Wie der Coach rechnet</b><br>' +
        'Erreichst du in allen Sätzen die obere Grenze des Wiederholungsbereichs, wird das Gewicht um den ' +
        'kleinsten sinnvollen Schritt erhöht und der Bereich beginnt wieder unten. Bleibst du darunter oder ' +
        'markierst die Sätze als schwer, hält der Coach das Gewicht oder reduziert es. ' +
        'Nach längeren Pausen greift zusätzlich der Wiedereinstiegsmodus.</div></div>' +

        '</div>';
    },
    mount: function (host) {
      u.on(host, 'click', '[data-act="enable-ai"]', function () {
        G.store.setConsent('ai', true);
        u.toast('Coach aktiv', 'Die Auswertung läuft ab sofort – nur auf diesem Gerät.', 'ok');
        G.app.rerender();
      });
      u.on(host, 'click', '[data-ex]', function (e, t) {
        G.views.exercises.openDetail(t.getAttribute('data-ex'));
      });
    }
  };
})(GoFit);
