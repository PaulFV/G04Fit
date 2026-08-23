/* ============================================================
   GoFit — Fortschritt
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
    return '<div class="view stack">' +
      '<div class="card card--hero">' +
      '<div class="row" style="gap:16px;align-items:flex-start">' +
      '<div class="coach__av">' + u.icon('lock', 20) + '</div>' +
      '<div style="flex:1">' +
      '<h2 style="font-size:20px;margin-bottom:6px">Fortschritt wird nicht aufgezeichnet</h2>' +
      '<p class="muted small">GoFit speichert Trainingshistorie und Rekorde nur, wenn du dem ausdrücklich ' +
      'zustimmst. Ohne diese Einwilligung bleiben abgeschlossene Einheiten nicht erhalten und es gibt ' +
      'keine Verlaufsdaten, die ausgewertet werden könnten.</p>' +
      '<div class="btn-row" style="margin-top:18px">' +
      '<button class="btn btn--primary" data-act="enable-history">Trainingshistorie erlauben</button>' +
      '<button class="btn btn--ghost" data-go="privacy">Datenschutz öffnen</button>' +
      '</div></div></div></div>' +
      '<div class="note">' + u.icon('info', 18) +
      '<div>Die Daten bleiben ausschließlich auf diesem Gerät. Es findet keine Übertragung an einen Server statt. ' +
      'Du kannst die Einwilligung jederzeit widerrufen – die Daten werden dann sofort gelöscht.</div></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     Tab: Überblick
     ------------------------------------------------------------ */
  function tabOverview() {
    var s = G.store.state;
    var today = u.today();
    var vol = weeklyVolume(8);
    var totalVol = u.sum(s.history, function (x) { return x.volume || 0; });
    var totalSets = u.sum(s.history, function (x) { return x.totalSets || 0; });

    var cards = [
      { k: 'Einheiten', v: s.journey.completed, cls: '' },
      { k: 'Gesamtvolumen', v: totalVol >= 1000 ? u.fmt(totalVol / 1000, 1) : u.fmt(totalVol), d: totalVol >= 1000 ? 't' : 'kg', cls: 'stat--neon' },
      { k: 'Sätze gesamt', v: totalSets, cls: '' },
      { k: 'Serie', v: s.journey.streak, d: 'Wochen', cls: 'stat--gold' },
      { k: 'Beste Serie', v: s.journey.bestStreak || 0, d: 'Wochen', cls: '' },
      { k: 'Rekorde', v: Object.keys(s.records).length, cls: 'stat--cyan' }
    ];

    return '<div class="grid grid--auto" style="--sp:12px">' +
      cards.map(function (i) {
        return '<div class="card card--pad-sm"><div class="stat ' + i.cls + '">' +
          '<span class="stat__k">' + u.esc(i.k) + '</span>' +
          '<span class="stat__v">' + u.esc(String(i.v)) +
          (i.d ? '<span class="stat__u">' + u.esc(i.d) + '</span>' : '') + '</span></div></div>';
      }).join('') + '</div>' +

      '<div class="card">' +
      '<div class="card__head">' + u.icon('progress', 18) + '<h3>Volumen je Woche</h3>' +
      '<span class="spacer"></span><span class="tiny dim">letzte 8 Wochen</span></div>' +
      G.charts.columns(vol) +
      '<p class="tiny dim center" style="margin-top:12px">Volumen = Summe aus Gewicht × Wiederholungen aller abgehakten Sätze.</p>' +
      '</div>' +

      '<div class="grid grid--2">' +
      '<div class="card">' +
      '<div class="card__head">' + u.icon('target', 18) + '<h3>Muskelgruppen-Balance</h3>' +
      '<span class="spacer"></span><span class="tiny dim">8 Wochen</span></div>' +
      (s.history.length
        ? G.charts.balance(G.coach.balance())
        : '<p class="small muted">Noch keine Daten.</p>') +
      '<p class="tiny dim" style="margin-top:14px">Sekundär beanspruchte Gruppen fließen anteilig ein.</p>' +
      '</div>' +

      '<div class="card">' +
      '<div class="card__head">' + u.icon('coach', 18) + '<h3>Leistungsprofil</h3></div>' +
      (G.coach.allowed()
        ? G.charts.radar(G.coach.metrics(), { size: 250 }) +
        '<div class="note note--warn" style="margin-top:14px">' + u.icon('warn', 17) +
        '<div>Diese Kennzahlen sind ein spielerisches Profil aus deinen Trainingsdaten. ' +
        '<b>Es sind ausdrücklich keine medizinischen Werte</b> und keine Diagnose.</div></div>'
        : '<div class="note">' + u.icon('lock', 17) +
        '<div>Das Leistungsprofil benötigt die Einwilligung <b>KI-Analyse</b>.</div></div>' +
        '<button class="btn btn--sm btn--block" style="margin-top:12px" data-go="privacy">Datenschutz öffnen</button>') +
      '</div>' +
      '</div>';
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
        '<p>Sobald du eine Übung abschließt, merkt sich GoFit deine beste Leistung.</p></div>';
    }

    var groups = u.groupBy(ids.filter(function (id) { return G.ex.byId(id); }), function (id) {
      return G.ex.byId(id).muscle;
    });

    return G.MUSCLE_ORDER.filter(function (m) { return groups[m]; }).map(function (m) {
      return '<div class="card">' +
        '<div class="card__head"><i class="mdot m-' + m + '"></i><h3>' + u.esc(G.MUSCLES[m].name) + '</h3>' +
        '<span class="spacer"></span><span class="tiny dim">' + groups[m].length + '</span></div>' +
        '<div class="stack" style="--sp:8px">' +
        groups[m].sort(function (a, b) { return s.records[b].e1rm - s.records[a].e1rm; })
          .map(function (id) {
            var ex = G.ex.byId(id), r = s.records[id];
            var gain = r.prev ? r.e1rm - r.prev.e1rm : null;
            return '<div class="pr" data-ex="' + id + '" style="cursor:pointer">' +
              '<div class="pr__medal">' + u.icon('medal', 16) + '</div>' +
              '<div class="pr__main"><b>' + u.esc(ex.name) + '</b>' +
              '<span>' + u.esc(u.fmtDate(r.date)) + ' · ' + u.esc(u.relDay(r.date)) +
              (gain ? ' · <span style="color:var(--neon)">+' + u.fmt(gain, 1) + ' kg</span>' : '') + '</span></div>' +
              '<div class="pr__v">' + (ex.time ? r.reps + ' s'
                : u.fmt(r.weight) + '×' + r.reps + '<br><span class="tiny dim">≈' + u.fmt(r.e1rm, 1) + ' kg</span>') + '</div>' +
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

    return Object.keys(byMonth).map(function (mk) {
      var parts = mk.split('-');
      return '<div class="sec"><h2>' + parts[1] + ' ' + parts[0] + '</h2><span class="sec__line"></span>' +
        '<span class="tiny dim">' + byMonth[mk].length + ' Einheiten</span></div>' +
        '<div class="card"><div class="list">' +
        byMonth[mk].map(function (x) {
          return '<div class="list__row list__row--click" data-sess="' + x.id + '">' +
            '<div class="list__ic" style="border-color:var(--neon-line);color:var(--neon)">' +
            u.icon('check', 17) + '</div>' +
            '<div class="list__main"><b>' + u.esc(x.title) + '</b>' +
            '<span>' + u.esc(u.dayName(x.day) + ', ' + u.fmtDate(x.day)) + ' · ' + x.totalSets + ' Sätze</span></div>' +
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
      '<span class="pill">' + u.fmt(sess.volume) + ' kg</span>',
      sess.newRecords ? '<span class="pill pill--gold">' + sess.newRecords + ' Rekorde</span>' : '',
      sess.reentry ? '<span class="pill pill--gold">Wiedereinstieg</span>' : '',
      '</div>'
    ];

    (sess.exercises || []).forEach(function (b) {
      var ex = G.ex.byId(b.exId);
      if (!ex) return;
      var done = (b.sets || []).filter(function (x) { return x.done; });
      if (!done.length) return;
      html.push('<div class="card card--pad-sm">' +
        '<div class="card__head"><i class="mdot m-' + ex.muscle + '"></i><h3>' + u.esc(ex.name) + '</h3></div>' +
        '<div class="set-head"><span>#</span><span>' + (ex.time ? '' : 'Gewicht') + '</span><span>' +
        (ex.time ? 'Sek.' : 'Wdh.') + '</span><span></span></div>' +
        done.map(function (x, i) {
          return '<div class="set-row is-done">' +
            '<span class="set-row__n">' + (i + 1) + '</span>' +
            '<span class="center mono small">' + (ex.time ? '–' : u.fmt(x.weight) + ' kg') + '</span>' +
            '<span class="center mono small">' + x.reps + (ex.time ? ' s' : '') + '</span>' +
            '<span class="tiny dim center">' + (x.rpe === 'easy' ? 'leicht' : x.rpe === 'hard' ? 'schwer' : '') + '</span>' +
            '</div>';
        }).join('') + '</div>');
    });

    if (sess.notes) {
      html.push('<div class="card card--pad-sm"><div class="card__head">' + u.icon('exercises', 16) +
        '<h3>Notiz</h3></div><p class="small muted">' + u.esc(sess.notes) + '</p></div>');
    }

    if (G.obsidian.allowed()) {
      html.push('<button class="btn btn--cyan btn--block" data-act="md">' + u.icon('obsidian', 17) +
        ' Als Markdown ausgeben</button>');
    }
    html.push('<button class="btn btn--danger btn--block" data-act="del">' + u.icon('trash', 16) +
      ' Diese Einheit löschen</button>');
    html.push('</div>');

    u.openSheet(sess.title, html.join(''), function (body) {
      var md = body.querySelector('[data-act="md"]');
      if (md) md.onclick = function () {
        u.closeSheet();
        G.app.go('obsidian', { session: sess });
      };
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
    { k: 'kraft', n: 'Kraftentwicklung' },
    { k: 'rekorde', n: 'Rekorde' },
    { k: 'historie', n: 'Historie' }
  ];

  G.views.progress = {
    title: 'Fortschritt',
    sub: function () {
      var s = G.store.state;
      if (!G.store.hasConsent('history')) return 'Aufzeichnung ist ausgeschaltet';
      return s.journey.completed + ' Einheiten · Serie ' + s.journey.streak +
        (s.journey.streak === 1 ? ' Woche' : ' Wochen');
    },
    render: function () {
      if (!G.store.hasConsent('history')) return lockedView();

      var body = tab === 'kraft' ? tabStrength()
        : tab === 'rekorde' ? tabRecords()
          : tab === 'historie' ? tabHistory()
            : tabOverview();

      return '<div class="view stack">' +
        '<div class="tabs" id="progTabs">' + TABS.map(function (t) {
          return '<button class="tabs__b' + (tab === t.k ? ' is-on' : '') + '" data-t="' + t.k + '">' +
            u.esc(t.n) + '</button>';
        }).join('') + '</div>' +
        body + '</div>';
    },
    mount: function (host) {
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
        u.toast('Aufzeichnung aktiv', 'Ab jetzt merkt sich GoFit deine Einheiten – nur auf diesem Gerät.', 'ok');
        G.app.rerender();
      });
    }
  };
})(GoFit);
