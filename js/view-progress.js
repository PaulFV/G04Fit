/* ============================================================
   G04Fit — Fortschritt
   Konzept Abschnitt 7: Trainingshistorie, persönliche Rekorde,
   Kraftentwicklung, Trainingsserien, Muskelgruppen-Balance und
   ein spielerisches Leistungsprofil.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var tab = 'ueberblick';

  /* ------------------------------------------------------------
     Hilfsdaten
     ------------------------------------------------------------ */
  function weeklyVolume(weeks) {
    var s = G.store.state;
    var out = [];
    var start = u.weekStart();
    for (var i = weeks - 1; i >= 0; i--) {
      var ws = u.addDays(start, -7 * i);
      var we = u.addDays(ws, 6);
      var sessions = G.store.sessionsInRange(ws, we);
      out.push({
        label: 'KW' + isoWeek(ws),
        value: u.sum(sessions, function (x) { return x.volume || 0; }),
        sessions: sessions.length
      });
    }
    return out;
  }

  function isoWeek(iso) {
    var d = u.parseDay(iso);
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
    var week1 = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round(((t - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }

  /**
   * Wochenvolumen als ruhiges Linien-Diagramm. Die vorhandenen Chart-Helfer
   * bleiben für die Detail-Tabs erhalten; die Übersicht bekommt eine eigene
   * Darstellung, damit der Verlauf auch bei einem leeren Konto verständlich
   * bleibt (Null-Linie + Hinweis statt einer Wand aus Null-Balken).
   */
  function volumeChart(bars) {
    var W = 820, H = 270, padL = 54, padR = 18, padT = 18, padB = 42;
    var iw = W - padL - padR, ih = H - padT - padB;
    var max = Math.max.apply(null, bars.map(function (b) { return +b.value || 0; }));
    var top = Math.max(1000, Math.ceil(max / 250) * 250);
    var hasData = max > 0;
    function px(i) { return padL + (bars.length < 2 ? iw / 2 : i / (bars.length - 1) * iw); }
    function py(v) { return padT + ih - (v / top) * ih; }
    var points = bars.map(function (b, i) { return [px(i), py(+b.value || 0)]; });
    var d = points.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = d + ' L' + px(bars.length - 1).toFixed(1) + ' ' + (padT + ih) + ' L' + padL + ' ' + (padT + ih) + ' Z';
    var out = '<div class="progress-chart" role="img" aria-label="Volumen je Woche">' +
      '<div class="progress-chart__head"><div class="progress-chart__title">' + u.icon('progress', 25) +
      '<h3>Volumen je Woche</h3></div><span class="progress-chart__mark"><img class="progress-chart__art" src="assets/progress/stat-volume.png?v=2.5.0" alt="" aria-hidden="true"></span></div>' +
      '<div class="progress-chart__plot">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="progressChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(61,255,158,.26)"/><stop offset="100%" stop-color="rgba(61,255,158,0)"/></linearGradient></defs>';

    for (var g = 0; g <= 4; g++) {
      var yy = padT + ih * g / 4;
      var value = Math.round(top - top * g / 4);
      out += '<line x1="' + padL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + yy.toFixed(1) + '" class="progress-chart__gridline"/>' +
        '<text x="' + (padL - 11) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" class="progress-chart__axis">' + value + '</text>';
    }
    out += '<path d="' + area + '" class="progress-chart__area"/>' +
      '<path d="' + d + '" class="progress-chart__line"/>';
    points.forEach(function (p, i) {
      out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" class="progress-chart__point"><title>' +
        u.esc(bars[i].label + ': ' + u.fmt(bars[i].value) + ' kg') + '</title></circle>';
      out += '<text x="' + p[0].toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle" class="progress-chart__label">' +
        u.esc(bars[i].label) + '</text>';
    });
    out += '</svg>' + (!hasData ? '<div class="progress-chart__empty"><span>' + u.icon('progress', 25) +
      '</span><b>Noch keine Trainingsdaten.</b></div>' : '') +
      '</div><p class="progress-chart__caption">Volumen = Summe aus Gewicht × Wiederholungen aller abgehakten Sätze.</p></div>';
    return out;
  }

  /** Kraftverlauf einer Übung als geschätztes 1RM */
  function strengthSeries(exId) {
    var s = G.store.state;
    var ex = G.ex.byId(exId);
    var pts = [];
    s.history.forEach(function (sess) {
      (sess.exercises || []).forEach(function (b) {
        if (b.exId !== exId) return;
        var best = 0;
        (b.sets || []).forEach(function (x) {
          if (!x.done) return;
          best = Math.max(best, ex && ex.time ? (+x.reps || 0) : u.e1rm(+x.weight || 0, +x.reps || 0));
        });
        if (best) pts.push({ x: u.fmtDateShort(sess.day), y: Math.round(best * 10) / 10 });
      });
    });
    return pts;
  }

  /** Übungen mit genügend Datenpunkten für einen Verlauf */
  function trackedExercises() {
    var s = G.store.state;
    var counts = {};
    s.history.forEach(function (sess) {
      (sess.exercises || []).forEach(function (b) {
        if ((b.sets || []).some(function (x) { return x.done; })) counts[b.exId] = (counts[b.exId] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .filter(function (id) { return G.ex.byId(id); })
      .sort(function (a, b) { return counts[b] - counts[a]; });
  }

  /* ------------------------------------------------------------
     Sperr-Hinweis ohne Einwilligung
     ------------------------------------------------------------ */
  function lockedView() {
    return '<div class="view stack progress-view progress-view--locked">' +
      '<section class="card card--hero progress-locked-card">' +
      '<div class="progress-locked-card__icon">' + u.icon('lock', 30) + '</div>' +
      '<div class="progress-locked-card__copy">' +
      '<p class="progress-eyebrow">Datenschutz</p>' +
      '<h2>Fortschritt wird nicht aufgezeichnet</h2>' +
      '<p class="muted small">G04Fit speichert Trainingshistorie und Rekorde nur, wenn du dem ausdrücklich ' +
      'zustimmst. Ohne diese Einwilligung bleiben abgeschlossene Einheiten nicht erhalten und es gibt ' +
      'keine Verlaufsdaten, die ausgewertet werden könnten.</p>' +
      '<div class="btn-row progress-locked-card__actions">' +
      '<button class="btn btn--primary" data-act="enable-history">Trainingshistorie erlauben</button>' +
      '<button class="btn btn--ghost" data-go="privacy">Datenschutz öffnen</button>' +
      '</div></div></section>' +
      '<div class="note progress-privacy-note">' + u.icon('info', 18) +
      '<div>Die Daten bleiben ausschließlich auf diesem Gerät. Es findet keine Übertragung an einen Server statt. ' +
      'Du kannst die Einwilligung jederzeit widerrufen – die Daten werden dann sofort gelöscht.</div>' +
      '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     Tab: Überblick
     ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     Wochen-Rückblick (21.10.2026): Einheiten, Volumen, Sätze,
     Trainingszeit und neue Rekorde einer Woche im Vergleich zur
     Vorwoche. Als Karte im Überblick (laufende Woche) und einmal
     pro Woche als Fenster beim App-Start (abgeschlossene Vorwoche).
     ------------------------------------------------------------ */
  function weekStats(start, days) {
    var s = G.store.state, end = u.addDays(start, days == null ? 6 : days);
    var list = s.history.filter(function (h) { return h.day >= start && h.day <= end; });
    var prs = Object.keys(s.records).filter(function (id) { var d = s.records[id].date; return d >= start && d <= end; });
    return {
      start: start, end: end, n: list.length,
      vol: u.sum(list, function (h) { return h.volume || 0; }),
      sets: u.sum(list, function (h) { return h.totalSets || 0; }),
      time: u.sum(list, function (h) { return u.sessionDuration(h); }),
      prs: prs
    };
  }
  function delta(cur, prev, fmtFn) {
    if (!prev && !cur) return '<span class="wr-d wr-d--eq">–</span>';
    if (!prev) return '<span class="wr-d wr-d--up">neu</span>';
    var d = cur - prev;
    if (Math.abs(d) < 0.0001) return '<span class="wr-d wr-d--eq">= Vorwoche</span>';
    return '<span class="wr-d ' + (d > 0 ? 'wr-d--up' : 'wr-d--down') + '">' + (d > 0 ? '▲ +' : '▼ −') + fmtFn(Math.abs(d)) + '</span>';
  }
  function fmtVol(v) { return v >= 1000 ? u.fmt(v / 1000, 1) + ' t' : u.fmt(v) + ' kg'; }
  function fmtTime(sec) { var m = Math.round(sec / 60); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
  function weekReviewHtml(start, title) {
    // Laufende Woche fair vergleichen: nur bis zum gleichen Wochentag der Vorwoche
    var running = start === u.weekStart(u.today());
    var days = running ? Math.max(0, Math.min(6, u.daysBetween(start, u.today()))) : 6;
    var c = weekStats(start, days), p = weekStats(u.addDays(start, -7), days);
    var range = u.fmtDateShort(c.start) + ' – ' + u.fmtDateShort(running ? u.addDays(start, 6) : c.end);
    var cmp = running ? 'im Vergleich zum gleichen Zeitraum der Vorwoche' : 'im Vergleich zur Vorwoche';
    var tiles = [
      { k: 'Einheiten', v: String(c.n), d: delta(c.n, p.n, function (x) { return String(x); }), cls: 'green', ic: 'dumbbell' },
      { k: 'Volumen', v: fmtVol(c.vol), d: delta(c.vol, p.vol, fmtVol), cls: 'cyan', ic: 'progress' },
      { k: 'Sätze', v: String(c.sets), d: delta(c.sets, p.sets, function (x) { return String(x); }), cls: 'violet', ic: 'exercises' },
      { k: 'Trainingszeit', v: fmtTime(c.time), d: delta(c.time, p.time, fmtTime), cls: 'gold', ic: 'clock' }
    ];
    var prNames = c.prs.map(function (id) { var ex = G.ex.byId(id); return ex ? ex.name : null; }).filter(Boolean);
    return '<section class="card week-review">' +
      '<div class="week-review__head">' + u.icon('progress', 20) +
      '<div><h3>' + u.esc(title) + '</h3><span>' + u.esc(range) + ' · ' + cmp + '</span></div></div>' +
      '<div class="week-review__grid">' + tiles.map(function (x) {
        return '<div class="wr-tile wr-tile--' + x.cls + '"><span class="wr-tile__k">' + u.icon(x.ic, 14) + '<span>' + u.esc(x.k) + '</span></span>' +
          '<b class="wr-tile__v">' + u.esc(x.v) + '</b>' + x.d + '</div>';
      }).join('') + '</div>' +
      '<div class="week-review__pr">' + u.icon('medal', 16) +
      (prNames.length
        ? '<span><b>' + prNames.length + (prNames.length === 1 ? ' neuer Rekord' : ' neue Rekorde') + '</b> · ' + u.esc(prNames.slice(0, 3).join(', ')) + (prNames.length > 3 ? ' …' : '') + '</span>'
        : '<span>Keine neuen Rekorde in dieser Woche</span>') +
      '</div></section>';
  }
  /** Einmal pro Woche beim App-Start: Rückblick auf die abgeschlossene Vorwoche */
  function maybeShowWeekReview() {
    var s = G.store.state;
    if (!G.store.hasConsent('history') || s.session) return false;
    var thisWeek = u.weekStart(u.today());
    if (s.settings.lastReviewWeek === thisWeek) return false;
    var last = u.addDays(thisWeek, -7);
    s.settings.lastReviewWeek = thisWeek;
    G.store.commit('settings');
    if (!weekStats(last).n) return false;
    u.openSheet('Dein Wochen-Rückblick', weekReviewHtml(last, 'Letzte Woche') +
      '<button type="button" class="btn btn--primary btn--block" data-act="wr-close" style="margin-top:14px">Weiter so!</button>',
      function (root) { var b = root.querySelector('[data-act="wr-close"]'); if (b) b.onclick = function () { u.closeSheet(); }; });
    return true;
  }
  G.weekReview = { html: weekReviewHtml, maybeShow: maybeShowWeekReview, stats: weekStats };

  function tabOverview() {
    var s = G.store.state;
    var vol = weeklyVolume(8);
    var totalVol = u.sum(s.history, function (x) { return x.volume || 0; });
    var totalSets = u.sum(s.history, function (x) { return x.totalSets || 0; });
    var totalReps = u.sum(s.history, function (x) { return x.totalReps || 0; });

    /* Gesamt-Kennzahlen kompakt in einer Reihe (22.10.2026) — die
       Wochenwerte stehen im Wochen-Rückblick darüber, nichts doppelt. */
    var items = [
      { k: 'Einheiten gesamt', v: s.journey.completed, art: 'assets/nav/nav-workout.png', tone: '' },
      { k: 'Volumen gesamt', v: totalVol >= 1000 ? u.fmt(totalVol / 1000, 1) : u.fmt(totalVol), d: totalVol >= 1000 ? 't' : 'kg', art: 'assets/progress/stat-volume.png', tone: 'neon' },
      { k: 'Serie (Wochen)', v: s.journey.streak, art: 'assets/progress/stat-streak.png', tone: 'gold' },
      { k: 'Beste Serie', v: s.journey.bestStreak || 0, art: 'assets/progress/stat-best-streak.png', tone: '' },
      { k: 'Rekorde', v: Object.keys(s.records).length, art: 'assets/progress/stat-records.png', tone: 'cyan' }
    ];

    return '<div class="progress-overview">' + levelCard() +
      weekReviewHtml(u.weekStart(u.today()), 'Diese Woche') +
      '<section class="progress-total"><h3 class="progress-total__h">' + u.icon('medal', 15) + '<span>Gesamt</span>' +
      '<small>' + totalSets + ' Sätze · ' + totalReps + ' Wdh.</small></h3>' +
      '<div class="dashboard-stats dashboard-stats--row">' + items.map(function (i) {
        return '<div class="dashboard-stat card' + (i.tone ? ' dashboard-stat--' + i.tone : '') + '">' +
          '<img class="dashboard-stat__art" src="' + u.esc(i.art) + '?v=2.5.0" alt="">' +
          '<span class="dashboard-stat__v">' + u.esc(String(i.v)) + (i.d ? '<span class="dashboard-stat__u">' + u.esc(i.d) + '</span>' : '') + '</span>' +
          '<span class="dashboard-stat__k">' + u.esc(i.k) + '</span></div>';
      }).join('') + '</div></section>' +
      volumeChart(vol) +
      '<div class="progress-lower-grid">' +
      '<section class="card progress-balance-card">' +
      '<div class="progress-card-head"><div>' + u.icon('target', 25) + '<h3>Muskelgruppen-Balance</h3></div>' +
      '<span class="progress-card-head__mark">' + u.icon('target', 28) + '</span></div>' +
      '<div class="progress-balance-card__body">' +
      '<div class="progress-balance-card__copy">' +
      (s.history.length
        ? G.charts.balance(G.coach.balance())
        : '<p class="progress-empty-title">Noch keine Daten.</p>') +
      '<p class="tiny dim progress-balance-card__hint">Sekundär beanspruchte Gruppen fließen anteilig ein.</p>' +
      '</div><div class="progress-balance-card__visual"><span class="progress-balance-card__halo"></span>' +
      '<img src="assets/avatar/anatomy-front-v4.webp" alt="" loading="lazy"></div></div>' +
      '</section>' +

      '<section class="card progress-profile-card">' +
      '<div class="progress-card-head"><div>' + u.icon('coach', 25) + '<h3>Leistungsprofil</h3></div>' +
      '<span class="progress-card-head__mark">' + u.icon('coach', 28) + '</span></div>' +
      (G.coach.allowed()
        ? '<div class="progress-profile-card__radar">' + G.charts.radar(G.coach.metrics(), { size: 250 }) + '</div>' +
        '<div class="note note--warn progress-profile-card__note">' + u.icon('warn', 17) +
        '<div>Diese Kennzahlen sind ein spielerisches Profil aus deinen Trainingsdaten. ' +
        '<b>Es sind ausdrücklich keine medizinischen Werte</b> und keine Diagnose.</div></div>'
        : '<div class="progress-profile-lock"><div class="progress-profile-lock__icon"><img class="progress-profile-lock__art" src="assets/progress/profile-lock.png?v=2.5.0" alt="" aria-hidden="true"></div>' +
        '<div>Das Leistungsprofil benötigt die Einwilligung <b>KI-Analyse</b>.</div></div>' +
        '<button class="btn btn--sm btn--block progress-profile-card__privacy" data-go="privacy">Datenschutz öffnen</button>') +
      '</section></div></div>';
  }

  /* ------------------------------------------------------------
     Tab: Kraftentwicklung
     ------------------------------------------------------------ */
  var strengthPick = null;

  function tabStrength() {
    var ids = trackedExercises();
    if (!ids.length) {
      return '<div class="empty">' + u.icon('progress', 40) + '<b>Noch keine Verlaufsdaten</b>' +
        '<p>Absolviere dieselbe Übung in mindestens zwei Einheiten, dann entsteht hier eine Kurve.</p></div>';
    }
    if (!strengthPick || ids.indexOf(strengthPick) < 0) strengthPick = ids[0];

    var ex = G.ex.byId(strengthPick);
    var pts = strengthSeries(strengthPick);
    var rec = G.store.state.records[strengthPick];
    var first = pts.length ? pts[0].y : 0;
    var last = pts.length ? pts[pts.length - 1].y : 0;
    var delta = last - first;

    return '<div class="card">' +
      '<div class="chips" style="margin-bottom:16px">' +
      ids.slice(0, 14).map(function (id) {
        var e = G.ex.byId(id);
        return '<button class="chip' + (id === strengthPick ? ' is-on' : '') + '" data-sp="' + id + '">' +
          u.esc(e.name) + '</button>';
      }).join('') + '</div>' +

      '<div class="row row--wrap" style="gap:22px;margin-bottom:16px">' +
      '<div class="stat stat--neon"><span class="stat__k">' + (ex.time ? 'Beste Haltezeit' : 'Geschätztes 1RM') + '</span>' +
      '<span class="stat__v">' + u.fmt(last, 1) + '<span class="stat__u">' + (ex.time ? 's' : 'kg') + '</span></span></div>' +
      '<div class="stat"><span class="stat__k">Veränderung</span>' +
      '<span class="stat__v" style="color:' + (delta >= 0 ? 'var(--neon)' : 'var(--danger)') + '">' +
      (delta >= 0 ? '+' : '') + u.fmt(delta, 1) + '<span class="stat__u">' + (ex.time ? 's' : 'kg') + '</span></span></div>' +
      (rec ? '<div class="stat stat--gold"><span class="stat__k">Rekord</span>' +
        '<span class="stat__v">' + (ex.time ? rec.reps + '<span class="stat__u">s</span>'
          : ex.bw ? u.fmtSetWeight(ex, rec.weight) + '<span class="stat__u"> × ' + rec.reps + '</span>'
          : u.fmt(rec.weight) + '<span class="stat__u">kg × ' + rec.reps + '</span>') + '</span></div>' : '') +
      '<div class="stat"><span class="stat__k">Einheiten</span>' +
      '<span class="stat__v">' + pts.length + '</span></div>' +
      '</div>' +

      G.charts.line(pts.slice(-20), { height: 210 }) +
      '<p class="tiny dim center" style="margin-top:12px">' +
      (ex.time ? 'Beste Haltezeit je Einheit.'
        : 'Geschätztes Einwiederholungsmaximum nach der Epley-Formel: Gewicht × (1 + Wdh. ÷ 30).') +
      '</p></div>';
  }

  /* ------------------------------------------------------------
     Tab: Rekorde
     ------------------------------------------------------------ */
  function tabRecords() {
    var s = G.store.state;
    var ids = Object.keys(s.records);
    if (!ids.length) {
      return '<div class="empty">' + u.icon('medal', 40) + '<b>Noch keine Rekorde</b>' +
        '<p>Sobald du eine Übung abschließt, merkt sich G04Fit deine beste Leistung.</p></div>';
    }

    var groups = u.groupBy(ids.filter(function (id) { return G.ex.byId(id); }), function (id) {
      return G.ex.byId(id).muscle;
    });

    // Neuester Rekord insgesamt (nach Datum, bei Gleichstand der mit dem
    // höheren Zuwachs) — wird farbig hervorgehoben.
    var latestId = null;
    ids.forEach(function (id) {
      if (!G.ex.byId(id)) return;
      var r = s.records[id], cur = latestId && s.records[latestId];
      if (!cur || r.date > cur.date ||
        (r.date === cur.date && (r.e1rm - (r.prev ? r.prev.e1rm : 0)) > (cur.e1rm - (cur.prev ? cur.prev.e1rm : 0)))) latestId = id;
    });

    return G.MUSCLE_ORDER.filter(function (m) { return groups[m]; }).map(function (m) {
      return '<div class="card">' +
        '<div class="card__head"><i class="mdot m-' + m + '"></i><h3>' + u.esc(G.MUSCLES[m].name) + '</h3>' +
        '<span class="spacer"></span><span class="tiny dim">' + groups[m].length + '</span></div>' +
        '<div class="stack" style="--sp:8px">' +
        groups[m].sort(function (a, b) { return s.records[b].e1rm - s.records[a].e1rm; })
          .map(function (id, idx) {
            var ex = G.ex.byId(id), r = s.records[id];
            var gain = r.prev ? r.e1rm - r.prev.e1rm : null;
            // Bester Rekord der Gruppe = höchstes geschätztes 1RM (bzw. längste
            // Haltezeit / meiste Wdh.); nur markieren, wenn es mehr als einen gibt.
            var best = idx === 0 && groups[m].length > 1 && r.e1rm > 0;
            var latest = id === latestId;
            var cls = 'pr' + (best ? ' pr--best' : '') + (latest ? ' pr--latest' : '');
            var badges = (latest ? '<span class="pr__badge pr__badge--latest">Neuester Rekord</span>' : '') +
              (best ? '<span class="pr__badge pr__badge--best">Bestwert ' + u.esc(G.MUSCLES[m].name) + '</span>' : '');
            return '<div class="' + cls + '" data-ex="' + id + '" style="cursor:pointer">' +
              '<div class="pr__medal">' + u.icon('medal', 16) + '</div>' +
              '<div class="pr__main">' + (badges ? '<div class="pr__badges">' + badges + '</div>' : '') +
              '<b>' + u.esc(ex.name) + '</b>' +
              '<span>' + u.esc(u.fmtDate(r.date)) + ' · ' + u.esc(u.relDay(r.date)) +
              (gain ? ' · <span style="color:var(--neon)">+' + u.fmt(gain, 1) + ' kg</span>' : '') + '</span></div>' +
              '<div class="pr__v">' + (ex.time ? '<span class="pr__w">' + r.reps + ' s</span>'
                : '<span class="pr__w">' + (ex.bw ? u.fmtSetWeight(ex, r.weight) + ' × ' + r.reps : u.fmt(r.weight) + ' kg × ' + r.reps) + '</span>' +
                (r.e1rm > 0 ? '<span class="pr__e tiny dim">≈ ' + u.fmt(r.e1rm, 1) + ' kg 1RM</span>' : '')) + '</div>' +
              '</div>';
          }).join('') +
        '</div></div>';
    }).join('');
  }

  /* ------------------------------------------------------------
     Tab: Historie
     ------------------------------------------------------------ */
  function tabHistory() {
    var s = G.store.state;
    if (!s.history.length) {
      return '<div class="empty">' + u.icon('clock', 40) + '<b>Noch keine Einheiten</b>' +
        '<p>Abgeschlossene Trainings erscheinen hier mit allen Sätzen.</p></div>';
    }

    var byMonth = u.groupBy(s.history.slice().reverse(), function (x) {
      return u.parseDay(x.day).getFullYear() + '-' + u.MONTHS[u.parseDay(x.day).getMonth()];
    });

    var latestSess = s.history.slice().sort(function (a, b) {
      var ka = (a.day || '') + (a.finishedAt || ''), kb = (b.day || '') + (b.finishedAt || '');
      return ka < kb ? 1 : ka > kb ? -1 : 0;
    })[0];

    return Object.keys(byMonth).map(function (mk) {
      var parts = mk.split('-');
      return '<div class="sec"><h2>' + parts[1] + ' ' + parts[0] + '</h2><span class="sec__line"></span>' +
        '<span class="tiny dim">' + byMonth[mk].length + ' Einheiten</span></div>' +
        '<div class="card"><div class="list">' +
        byMonth[mk].map(function (x) {
          var isLatest = latestSess && x.id === latestSess.id;
          return '<div class="list__row list__row--click' + (isLatest ? ' hist-row--latest' : '') + '" data-sess="' + x.id + '">' +
            '<div class="list__ic" style="border-color:var(--neon-line);color:var(--neon)">' +
            u.icon('check', 17) + '</div>' +
            '<div class="list__main">' + (isLatest ? '<span class="hist-row__badge">Letzte Einheit</span>' : '') +
            '<b>' + u.esc(x.title) + '</b>' +
            '<span>' + u.esc(u.dayName(x.day) + ', ' + u.fmtDate(x.day)) + ' · ' + x.totalSets + ' Sätze · ' +
            (x.totalReps || 0) + ' Wdh.' + (u.sessionDuration(x) ? ' · ' + u.fmtDuration(u.sessionDuration(x)) : '') + '</span></div>' +
            '<div class="list__end"><b class="mono small">' + u.fmt(x.volume) + ' kg</b>' +
            (x.newRecords ? '<br><span class="pill pill--gold tiny">' + x.newRecords + '× PR</span>' : '') + '</div>' +
            '</div>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function openSessionDetail(id) {
    var s = G.store.state;
    var sess = s.history.filter(function (x) { return x.id === id; })[0];
    if (!sess) return;

    var html = ['<div class="stack">',
      '<div class="row row--wrap" style="gap:7px">',
      '<span class="pill pill--neon">' + u.esc(u.fmtDate(sess.day)) + '</span>',
      '<span class="pill">' + sess.totalSets + ' Sätze</span>',
      '<span class="pill">' + (sess.totalReps || 0) + ' Wdh.</span>',
      '<span class="pill">' + u.fmt(sess.volume) + ' kg</span>',
      u.sessionDuration(sess) ? '<span class="pill pill--cyan">' + u.fmtDuration(u.sessionDuration(sess)) + ' Trainingszeit</span>' : '',
      sess.newRecords ? '<span class="pill pill--gold">' + sess.newRecords + ' Rekorde</span>' : '',
      sess.reentry ? '<span class="pill pill--gold">Wiedereinstieg</span>' : '',
      '</div>'
    ];

    (sess.exercises || []).forEach(function (b) {
      var ex = G.ex.byId(b.exId);
      if (!ex) return;
      var done = (b.sets || []).filter(function (x) { return x.done; });
      if (!done.length) return;
      var repsSum = u.sum(done, function (x) { return +x.reps || 0; });
      html.push('<div class="card card--pad-sm">' +
        '<div class="card__head"><i class="mdot m-' + ex.muscle + '"></i><h3>' + u.esc(ex.name) + '</h3>' +
        '<span class="spacer"></span><span class="pill">' + repsSum + (ex.time ? ' s' : ' Wdh.') + '</span></div>' +
        '<div class="set-head"><span>#</span><span>' + (ex.time ? '' : 'Gewicht') + '</span><span>' +
        (ex.time ? 'Sek.' : 'Wdh.') + '</span><span></span></div>' +
        done.map(function (x, i) {
          return '<div class="set-row is-done">' +
            '<span class="set-row__n">' + (i + 1) + '</span>' +
            '<span class="center mono small">' + (ex.time ? '–' : u.fmtSetWeight(ex, x.weight)) + '</span>' +
            '<span class="center mono small">' + x.reps + (ex.time ? ' s' : '') + '</span>' +
            '<span class="tiny dim center">' + (x.rpe === 'easy' ? 'leicht' : x.rpe === 'hard' ? 'schwer' : '') + '</span>' +
            '</div>';
        }).join('') + '</div>');
    });

    if (sess.notes) {
      html.push('<div class="card card--pad-sm"><div class="card__head">' + u.icon('exercises', 16) +
        '<h3>Notiz</h3></div><p class="small muted">' + u.esc(sess.notes) + '</p></div>');
    }

    html.push('<button class="btn btn--danger btn--block" data-act="del">' + u.icon('trash', 16) +
      ' Diese Einheit löschen</button>');
    html.push('</div>');

    u.openSheet(sess.title, html.join(''), function (body) {
      body.querySelector('[data-act="del"]').onclick = async function () {
        var ok = await u.confirmSheet({
          title: 'Einheit löschen',
          body: 'Diese Trainingseinheit wird dauerhaft entfernt. Rekorde, die daraus entstanden sind, bleiben bestehen.',
          ok: 'Löschen'
        });
        if (!ok) return;
        s.history = s.history.filter(function (x) { return x.id !== id; });
        G.store.recomputeStreak();
        G.store.commit('history-delete');
        u.toast('Gelöscht', 'Die Einheit wurde entfernt.', 'ok');
        G.app.rerender();
      };
    });
  }

  /* ------------------------------------------------------------
     View
     ------------------------------------------------------------ */
  var TABS = [
    { k: 'ueberblick', n: 'Überblick' },
    { k: 'journey', n: 'Journey' },
    { k: 'kraft', n: 'Kraft' },
    { k: 'rekorde', n: 'Rekorde' },
    { k: 'historie', n: 'Historie' }
  ];

  function tabBar(list) {
    return '<div class="tabs progress-tabs progress-tabs--' + list.length + '" id="progTabs" role="tablist">' + list.map(function (t) {
      return '<button class="tabs__b progress-tabs__button' + (tab === t.k ? ' is-on' : '') + '" data-t="' + t.k + '" role="tab" aria-selected="' + (tab === t.k ? 'true' : 'false') + '">' +
        u.esc(t.n) + '</button>';
    }).join('') + '</div>';
  }

  /** Level-Karte oben im Überblick, führt in den Reiter Journey */
  function levelCard() {
    var s = G.store.state, li = G.store.levelInfo();
    return '<button class="card progress-level" type="button" data-t="journey">' +
      '<span class="progress-level__ring">' + G.charts.ring(li.pct, { size: 64, stroke: 6, value: li.level, label: 'Level' }) + '</span>' +
      '<span class="progress-level__copy"><span class="progress-level__eyebrow">Journey · ' + u.esc(li.title) + '</span>' +
      '<b>' + li.region.icon + ' ' + u.esc(li.region.name) + '</b>' +
      '<span class="progress-level__bar"><span style="width:' + Math.round(li.pct * 100) + '%"></span></span>' +
      '<span class="progress-level__meta">' + s.journey.xp + ' XP · noch ' + (li.need - li.into) + ' XP bis Level ' + (li.level + 1) + '</span></span>' +
      '<span class="progress-level__go"><span>Weltkarte</span>' + u.icon('chevron', 18) + '</span></button>';
  }

  G.views.progress = {
    title: 'Fortschritt',
    sub: function () {
      var s = G.store.state;
      if (!G.store.hasConsent('history')) return 'Aufzeichnung ist ausgeschaltet';
      return s.journey.completed + ' Einheiten · Serie ' + s.journey.streak +
        (s.journey.streak === 1 ? ' Woche' : ' Wochen');
    },
    setTab: function (t) { tab = t; },
    render: function () {
      // Ohne Einwilligung „Trainingshistorie“ gibt es nur Überblick (Sperr-
      // hinweis) und Journey — Level und XP brauchen keine Historie.
      if (!G.store.hasConsent('history')) {
        if (tab !== 'journey') tab = 'ueberblick';
        return '<div class="view stack progress-view">' + tabBar(TABS.filter(function (t) {
          return t.k === 'ueberblick' || t.k === 'journey';
        })) + (tab === 'journey' ? G.views.journey.render() : lockedView()) + '</div>';
      }

      var body = tab === 'journey' ? G.views.journey.render()
        : tab === 'kraft' ? tabStrength()
        : tab === 'rekorde' ? tabRecords()
          : tab === 'historie' ? tabHistory()
            : tabOverview();

      return '<div class="view stack progress-view">' + tabBar(TABS) + body + '</div>';
    },
    mount: function (host) {
      if (tab === 'journey' && G.views.journey && G.views.journey.mount) G.views.journey.mount(host);
      u.on(host, 'click', '[data-t]', function (e, t) {
        tab = t.getAttribute('data-t');
        G.app.rerender();
      });
      u.on(host, 'click', '[data-sp]', function (e, t) {
        strengthPick = t.getAttribute('data-sp');
        G.app.rerender();
      });
      u.on(host, 'click', '[data-sess]', function (e, t) {
        openSessionDetail(t.getAttribute('data-sess'));
      });
      u.on(host, 'click', '.pr[data-ex]', function (e, t) {
        G.views.exercises.openDetail(t.getAttribute('data-ex'));
      });
      u.on(host, 'click', '[data-act="enable-history"]', function () {
        G.store.setConsent('history', true);
        u.toast('Aufzeichnung aktiv', 'Ab jetzt merkt sich G04Fit deine Einheiten – nur auf diesem Gerät.', 'ok');
        G.app.rerender();
      });
    }
  };
})(G04Fit);
