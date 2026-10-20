/* ============================================================
   G04Fit Coach — Ansicht
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
      '<p class="muted small">Damit G04Fit Vorschläge zu Gewicht und Progression machen kann, muss er ' +
      'deine Trainingsdaten auswerten dürfen. Dafür brauchst du die Einwilligung <b>KI-Analyse</b>.</p>' +
      '</div></div>' +
      '<div class="btn-row" style="margin-top:20px">' +
      '<button class="btn btn--primary" data-act="enable-ai">Auswertung erlauben</button>' +
      '<button class="btn btn--ghost" data-go="privacy">Datenschutz öffnen</button>' +
      '</div></div>' +

      '<div class="note note--neon">' + u.icon('info', 18) +
      '<div><b>Was passiert bei der Auswertung?</b><br>' +
      'G04Fit rechnet ausschließlich auf diesem Gerät. Es werden keine Daten an einen Server oder an ' +
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

  /* Inhalte der Fenster (früher alles untereinander auf der Seite) */
  var ST = { open: null };
  var TITLES = { re: 'Wiedereinstieg', rec: 'Empfehlungen je Übung', obs: 'Beobachtungen', perf: 'Leistungsprofil', how: 'So rechnet der Coach' };
  function parts() {
    var rows = suggestionRows(), re = G.coach.reentry(), metrics = G.coach.metrics(), ins = G.coach.insights();
    return {
      re: re ? '<p class="small muted">' + u.esc(re.text) + '</p>' +
        '<div class="row row--wrap" style="gap:8px">' +
        '<span class="pill pill--neon">Gewicht auf ' + Math.round(re.factor * 100) + ' %</span>' +
        '<span class="pill">Aufbau über ' + re.weeks + (re.weeks === 1 ? ' Woche' : ' Wochen') + '</span>' +
        (G.store.state.settings.reentry ? '<span class="pill pill--neon">automatisch aktiv</span>'
          : '<span class="pill pill--muted">im Profil deaktiviert</span>') + '</div>' : '',
      obs: '<div class="stack" style="--sp:10px">' + ins.map(insightCard).join('') + '</div>',
      rec: rows.length
        ? '<div class="list">' + rows.map(function (r) {
          var ex = r.ex, g = r.s;
          return '<div class="list__row list__row--click" data-ex="' + ex.id + '">' +
            '<div class="list__ic list__ic--map">' + G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</div>' +
            '<div class="list__main"><b>' + u.esc(ex.name) + '</b><span>' + u.esc(g.reason) + '</span></div>' +
            '<div class="list__end" style="min-width:96px">' +
            '<b class="mono small' + (g.kind === 'up' ? ' neon' : '') + '"' + (g.kind === 'down' ? ' style="color:var(--danger)"' : '') + '>' +
            (ex.time ? u.fmtReps(g.reps, 's') : u.fmt(g.weight) + ' kg') + '</b>' +
            '<br><span class="tiny dim">' + (ex.time ? 'Haltezeit' : u.fmtReps(g.reps) + ' × ' + g.sets) + '</span>' +
            '<br>' + kindPill(g.kind) + '</div></div>';
        }).join('') + '</div>'
        : '<div class="empty">' + u.icon('coach', 40) + '<b>Noch keine Grundlage</b>' +
          '<p>Absolviere eine Einheit, danach entstehen konkrete Vorschläge.</p></div>',
      perf: '<div style="display:grid;place-items:center">' + G.charts.radar(metrics, { size: 250 }) + '</div>' +
        '<div class="attrs">' + metrics.map(function (m) {
          return '<div class="attr"><span class="muted">' + u.esc(m.label) + '</span>' +
            '<span class="bar"><span class="bar__fill" style="width:' + Math.round(m.value * 100) + '%"></span></span>' +
            '<span class="attr__v neon">' + Math.round(m.value * 100) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="note note--warn">' + u.icon('warn', 17) +
        '<div>Die Kennzahlen beschreiben nur dein Trainingsverhalten in G04Fit. ' +
        '<b>Sie sind ausdrücklich keine medizinischen Werte.</b></div></div>',
      how: '<p class="small muted">Erreichst du in allen Sätzen die obere Grenze des Wiederholungsbereichs, wird das Gewicht um den ' +
        'kleinsten sinnvollen Schritt erhöht und der Bereich beginnt wieder unten. Bleibst du darunter oder ' +
        'markierst die Sätze als schwer, hält der Coach das Gewicht oder reduziert es. ' +
        'Nach längeren Pausen greift zusätzlich der Wiedereinstiegsmodus.</p>'
    };
  }
  function openTile(key) {
    var body = parts()[key];
    if (!body) { ST.open = null; return; }
    u.tileOpen(ST, key, TITLES[key], body, function (root) {
      u.on(root, 'click', '[data-ex]', function (e, t) { ST.open = null; G.views.exercises.openDetail(t.getAttribute('data-ex')); });
    });
  }

  G.views.coach = {
    title: 'G04Fit Coach',
    sub: function () {
      if (!G.coach.allowed()) return 'Auswertung ist ausgeschaltet';
      var n = suggestionRows().filter(function (r) { return r.s.kind === 'up'; }).length;
      return n ? n + (n === 1 ? ' Übung bereit für mehr Gewicht' : ' Übungen bereit für mehr Gewicht')
        : 'Analyse deiner Trainingsdaten';
    },
    render: function () {
      if (!G.coach.allowed()) return lockedView();
      var s = G.store.state;
      var P = parts();
      var ins = G.coach.insights(), rows = suggestionRows(), re = G.coach.reentry(), metrics = G.coach.metrics();
      var up = rows.filter(function (r) { return r.s.kind === 'up'; }).length;
      var best = metrics.slice().sort(function (a, b) { return b.value - a.value; })[0];
      var warn = ins.filter(function (i) { return i.kind === 'warn'; }).length;

      var items = [];
      if (re) items.push({ k: 're', color: 'orange', icon: 'refresh', title: 'Wiedereinstieg',
        sum: '<b>' + re.days + ' Tage Pause</b> · Gewicht auf ' + Math.round(re.factor * 100) + ' %' });
      items.push({ k: 'rec', color: 'green', icon: 'dumbbell', title: 'Empfehlungen je Übung',
        sum: rows.length ? (up ? '<b>' + up + ' steigern</b> · ' : '') + rows.length + ' Übungen' : 'Noch keine Grundlage' });
      if (ins.length) items.push({ k: 'obs', color: warn ? 'gold' : 'cyan', icon: warn ? 'warn' : 'info', title: 'Beobachtungen',
        sum: '<b>' + u.esc(ins[0].title) + '</b>' + (ins.length > 1 ? ' (+' + (ins.length - 1) + ')' : '') });
      items.push({ k: 'perf', color: 'violet', icon: 'target', title: 'Leistungsprofil',
        sum: best ? '<span>Stärke:</span> <b>' + u.esc(best.label) + ' ' + Math.round(best.value * 100) + '</b>' : '' });
      items.push({ k: 'how', color: 'blue', icon: 'info', title: 'So rechnet der Coach',
        sum: '<span>Regeln für Gewicht, Wiederholungen und Pausen</span>' });

      return '<div class="view stack">' +
        /* Kopf */
        '<div class="card card--hero card--hl">' +
        '<div class="coach">' +
        '<div class="coach__av">' + u.icon('coach', 20) + '</div>' +
        '<div style="flex:1">' +
        '<p class="muted small">Auswertung vom ' + u.fmtDate(u.today()) + '</p>' +
        '<h2 style="font-size:20px;margin:4px 0 8px">' +
        (s.history.length ? s.history.length + ' Einheiten ausgewertet' : 'Noch keine Trainingsdaten') + '</h2>' +
        '<p class="muted small">Alle Berechnungen laufen lokal auf diesem Gerät.</p>' +
        '</div></div></div>' +
        u.tileGrid(items) +
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
      u.on(host, 'click', '[data-tile]', function (e, t) { openTile(t.getAttribute('data-tile')); });
      if (ST.open) openTile(ST.open);
    }
  };
})(G04Fit);
