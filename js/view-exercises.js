/* ============================================================
   GoFit — Übungsbibliothek
   Konzept Abschnitt 5: Bewegungsausführung, beanspruchte
   Muskelgruppen und Technikhinweise je Übung.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var filter = { muscle: 'all', q: '', equip: 'all' };
  var filtersOpen = false;

  function levelLabel(n) {
    return n === 1 ? 'Einsteiger' : n === 2 ? 'Fortgeschritten' : 'Profi';
  }

  function equipIcon(name) {
    if (name === 'all') return 'equipment';
    if (/Körpergewicht/i.test(name)) return 'bodyweight';
    if (/Klimmzug/i.test(name)) return 'pullup';
    if (/Kabel/i.test(name)) return 'cable';
    if (/Scheibe/i.test(name)) return 'plate';
    if (/Maschine/i.test(name)) return 'machine';
    if (/Scottbank/i.test(name)) return 'bench';
    return 'dumbbell';
  }

  function matches(ex) {
    if (filter.muscle !== 'all' && ex.muscle !== filter.muscle) return false;
    if (filter.equip !== 'all' && ex.equip !== filter.equip) return false;
    if (filter.q) {
      var q = filter.q.toLowerCase();
      var hay = (ex.name + ' ' + ex.equip + ' ' + G.MUSCLES[ex.muscle].name).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  }

  function card(ex) {
    var rec = G.store.state.records[ex.id];
    return '<article class="ex-card" data-ex="' + ex.id + '" tabindex="0">' +
      '<div class="ex-card__vis">' +
      '<span class="ex-card__fig">' + G.anim.figure(ex) + '</span>' +
      '</div>' +
      '<div class="ex-card__body">' +
      '<b>' + u.esc(ex.name) + '</b>' +
      '<span class="tiny dim">' + u.esc(ex.equip) + ' · ' + levelLabel(ex.level) + '</span>' +
      '<div class="ex-card__tags">' +
      '<span class="pill"><i class="mdot m-' + ex.muscle + '"></i>' + u.esc(G.MUSCLES[ex.muscle].name) + '</span>' +
      ex.sec.map(function (m) {
        return '<span class="pill pill--muted"><i class="mdot m-' + m + '" style="opacity:.5"></i>' +
          u.esc(G.MUSCLES[m].name) + '</span>';
      }).join('') +
      (rec ? '<span class="pill pill--gold">' + u.icon('medal', 11) + ' ' +
        (ex.time ? rec.reps + ' s' : u.fmt(rec.weight) + '×' + rec.reps) + '</span>' : '') +
      '</div><span class="ex-card__open">Ausführung ansehen' + u.icon('chevron', 15) + '</span>' +
      '</div></article>';
  }

  /* ------------------------------------------------------------
     Detailansicht
     ------------------------------------------------------------ */
  function openDetail(exId) {
    var ex = G.ex.byId(exId);
    if (!ex) return;
    var s = G.store.state;
    var sug = G.coach.suggestNext(exId);
    var rec = s.records[exId];
    var last = G.store.lastSessionFor(exId);
    var range = G.coach.repRange(ex);

    var html = [
      '<div class="stack">',

      /* Bewegungsablauf */
      '<div class="card card--pad-sm" style="background:rgba(0,0,0,.28)">',
      '<div class="fig-box" style="height:196px">' + G.anim.figure(ex) + '</div>',
      '<p class="tiny dim center">Bewegungsablauf</p>',
      '</div>',

      /* Beanspruchte Muskeln */
      '<div class="card card--pad-sm" style="background:rgba(0,0,0,.28)">',
      '<div class="card__head" style="margin-bottom:8px">' + u.icon('target', 16) +
      '<h3>Beanspruchte Muskeln</h3></div>',
      '<div class="fig-box" style="height:248px">' + G.anim.muscleMap(ex.muscle, ex.sec) + '</div>',
      G.anim.muscleLegend(ex.muscle, ex.sec),
      '</div>',

      /* Eckdaten */
      '<div class="row row--wrap" style="gap:7px">',
      '<span class="pill pill--neon"><i class="mdot m-' + ex.muscle + '"></i>' + u.esc(G.MUSCLES[ex.muscle].name) + '</span>',
      ex.sec.map(function (m) {
        return '<span class="pill"><i class="mdot m-' + m + '"></i>' + u.esc(G.MUSCLES[m].name) + '</span>';
      }).join(''),
      '<span class="pill">' + u.esc(ex.equip) + '</span>',
      '<span class="pill">' + levelLabel(ex.level) + '</span>',
      '</div>',

      /* Coach-Empfehlung */
      '<div class="card card--hl">',
      '<div class="card__head">' + u.icon('coach', 17) + '<h3>Empfehlung</h3></div>',
      G.coach.allowed()
        ? '<div class="row" style="gap:16px;align-items:flex-start">' +
        '<div><span class="stat__k">' + (ex.time ? 'Haltezeit' : 'Gewicht') + '</span>' +
        '<div class="stat__v neon" style="font-size:24px">' +
        (ex.time ? u.fmtReps(sug.reps, 's') : u.fmt(sug.weight) + '<span class="stat__u">kg</span>') + '</div></div>' +
        (ex.time ? '' : '<div><span class="stat__k">Wiederholungen</span>' +
          '<div class="stat__v" style="font-size:24px">' + u.fmtReps(sug.reps) + '</div></div>') +
        '<div><span class="stat__k">Sätze</span>' +
        '<div class="stat__v" style="font-size:24px">' + sug.sets + '</div></div>' +
        '</div>' +
        '<p class="small muted" style="margin-top:12px">' + u.esc(sug.reason) + '</p>'
        : '<div class="note">' + u.icon('lock', 17) + '<div>Für konkrete Vorschläge benötigt der Coach die Einwilligung ' +
        '<b>KI-Analyse</b>. Ohne sie zeigt GoFit nur den allgemeinen Bereich: ' +
        range[0] + '–' + range[1] + ' Wiederholungen, ' + G.coach.setCount(ex) + ' Sätze.</div></div>',
      '</div>',

      /* Technik */
      '<div class="card">',
      '<div class="card__head">' + u.icon('check', 17) + '<h3>Technikhinweise</h3></div>',
      '<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px" class="small">',
      ex.cues.map(function (c) { return '<li>' + u.esc(c) + '</li>'; }).join(''),
      '</ul></div>',

      '<div class="card">',
      '<div class="card__head" style="color:var(--warn)">' + u.icon('warn', 17) + '<h3>Häufige Fehler</h3></div>',
      '<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px" class="small muted">',
      (ex.err || []).map(function (c) { return '<li>' + u.esc(c) + '</li>'; }).join(''),
      '</ul></div>',

      /* Verlauf & Rekord */
      historyBlock(ex, rec, last),

      /* Startgewicht */
      ex.bw || ex.time ? '' :
        '<div class="card">' +
        '<div class="card__head">' + u.icon('dumbbell', 17) + '<h3>Eigenes Startgewicht</h3></div>' +
        '<p class="small muted" style="margin-bottom:12px">Trage hier ein, womit du realistisch arbeitest. ' +
        'GoFit startet dich dann nicht künstlich leicht.</p>' +
        '<div class="row"><div class="input-suffix" style="flex:1">' +
        '<input class="input" id="startW" type="number" inputmode="decimal" step="' + (ex.inc || 2.5) +
        '" min="0" value="' + (s.profile.startWeights[ex.id] != null ? s.profile.startWeights[ex.id] : '') +
        '" placeholder="' + G.ex.suggestStart(ex, s.profile.weight, s.profile.experience) + '"><span>kg</span></div>' +
        '<button class="btn btn--primary" data-act="save-start">Speichern</button></div>' +
        '</div>',

      '<div class="btn-row">',
      '<button class="btn btn--primary btn--block" data-act="quick-add">' + u.icon('plus', 17) + ' Zur Einheit hinzufügen</button>',
      '</div>',

      '</div>'
    ].join('');

    u.openSheet(ex.name, html, function (body) {
      var sw = body.querySelector('[data-act="save-start"]');
      if (sw) sw.onclick = function () {
        var v = body.querySelector('#startW').value;
        if (v === '') delete s.profile.startWeights[ex.id];
        else s.profile.startWeights[ex.id] = u.num(v, 0);
        G.store.commit('start-weight');
        u.toast('Gespeichert', ex.name + ': Startgewicht aktualisiert.', 'ok');
      };

      body.querySelector('[data-act="quick-add"]').onclick = function () {
        if (s.session) {
          var add = G.planner.buildCustomSession([ex.id]).exercises;
          s.session.exercises = s.session.exercises.concat(add);
          G.store.commit('ex-added');
          u.closeSheet();
          u.toast('Hinzugefügt', ex.name + ' ist Teil der laufenden Einheit.', 'ok');
          G.app.go('workout');
        } else {
          s.session = G.planner.buildCustomSession([ex.id], ex.name);
          G.store.commit('session-start');
          u.closeSheet();
          G.app.go('workout');
        }
      };
    });
  }

  function historyBlock(ex, rec, last) {
    var s = G.store.state;
    if (!G.store.hasConsent('history')) {
      return '<div class="note">' + u.icon('lock', 17) +
        '<div>Ohne die Einwilligung <b>Trainingshistorie</b> speichert GoFit keine vergangenen Sätze – ' +
        'deshalb gibt es hier keinen Verlauf.</div></div>';
    }
    if (!rec && !last) {
      return '<div class="note">' + u.icon('info', 17) +
        '<div>Noch keine Daten zu dieser Übung. Nach der ersten Einheit erscheinen hier Rekord und Verlauf.</div></div>';
    }

    var points = [];
    s.history.forEach(function (sess) {
      (sess.exercises || []).forEach(function (b) {
        if (b.exId !== ex.id) return;
        var best = 0;
        (b.sets || []).forEach(function (x) {
          if (x.done) best = Math.max(best, ex.time ? (+x.reps || 0) : u.e1rm(+x.weight || 0, +x.reps || 0));
        });
        if (best) points.push({ x: u.fmtDateShort(sess.day), y: Math.round(best * 10) / 10 });
      });
    });

    return '<div class="card">' +
      '<div class="card__head">' + u.icon('progress', 17) + '<h3>' +
      (ex.time ? 'Haltezeit' : 'Kraftentwicklung') + '</h3><span class="spacer"></span>' +
      (rec ? '<span class="pill pill--gold">' + u.icon('medal', 12) + ' ' +
        (ex.time ? rec.reps + ' s' : u.fmt(rec.weight) + ' kg × ' + rec.reps) + '</span>' : '') +
      '</div>' +
      G.charts.line(points.slice(-14), { height: 160 }) +
      (last ? '<p class="tiny dim" style="margin-top:10px">Zuletzt trainiert: ' +
        u.esc(u.relDay(last.session.day)) + '</p>' : '') +
      '</div>';
  }

  /* ------------------------------------------------------------
     View
     ------------------------------------------------------------ */
  G.views.exercises = {
    title: 'Übungen',
    sub: function () { return G.EXERCISES.length + ' Übungen · 6 Muskelgruppen'; },
    render: function () {
      var equips = ['all'].concat(Object.keys(u.groupBy(G.EXERCISES, function (e) { return e.equip; })).sort());
      var list = G.EXERCISES.filter(matches);
      var activeFilters = (filter.muscle !== 'all' ? 1 : 0) + (filter.equip !== 'all' ? 1 : 0);

      return '<div class="view stack">' +
        '<div class="card ex-filters' + (filtersOpen ? ' is-open' : '') + '">' +
        '<div class="ex-search-row">' +
        '<label class="ex-search" aria-label="Übung suchen">' + u.icon('search', 18) +
        '<input class="input" id="exSearch" type="search" placeholder="Übung suchen …" value="' + u.esc(filter.q) + '"></label>' +
        '<button class="btn ex-filter-toggle' + (activeFilters ? ' btn--primary' : '') + '" data-act="filters" aria-expanded="' +
        (filtersOpen ? 'true' : 'false') + '">' + u.icon('filter', 17) + '<span>Filter</span>' +
        (activeFilters ? '<b>' + activeFilters + '</b>' : '') + '</button></div>' +
        '<div class="ex-filter-options">' +
        '<div class="tabs" id="exTabs">' +
        '<button class="tabs__b' + (filter.muscle === 'all' ? ' is-on' : '') + '" data-m="all">Alle</button>' +
        G.MUSCLE_ORDER.map(function (m) {
          return '<button class="tabs__b' + (filter.muscle === m ? ' is-on' : '') + '" data-m="' + m + '">' +
            u.icon(G.MUSCLES[m].icon, 17) + '<span>' + u.esc(G.MUSCLES[m].name) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="chips">' + equips.map(function (e) {
          return '<button class="chip' + (filter.equip === e ? ' is-on' : '') + '" data-eq="' + u.esc(e) + '">' +
            u.icon(equipIcon(e), 15) + '<span>' + (e === 'all' ? 'Alle Geräte' : u.esc(e)) + '</span></button>';
        }).join('') + '</div>' +
        '</div></div>' +

        '<div class="row ex-results"><span class="small muted"><b>' + list.length + '</b> Übungen</span><span class="spacer"></span>' +
        '<span class="tiny dim ex-results__hint">Tippen für Ausführung, Muskelkarte und Technik</span></div>' +

        (list.length
          ? '<div class="grid grid--auto">' + list.map(card).join('') + '</div>'
          : '<div class="empty">' + u.icon('exercises', 40) + '<b>Nichts gefunden</b>' +
          '<p>Ändere Suchbegriff oder Filter.</p></div>') +

        '</div>';
    },
    mount: function (host) {
      var search = host.querySelector('#exSearch');
      if (search) search.addEventListener('input', u.debounce(function () {
        filter.q = search.value.trim();
        G.app.rerender(function () {
          var s2 = u.$('#exSearch');
          if (s2) { s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }
        });
      }, 260));

      u.on(host, 'click', '[data-m]', function (e, t) {
        filter.muscle = t.getAttribute('data-m');
        G.app.rerender();
      });
      u.on(host, 'click', '[data-eq]', function (e, t) {
        filter.equip = t.getAttribute('data-eq');
        G.app.rerender();
      });
      u.on(host, 'click', '[data-act="filters"]', function () {
        filtersOpen = !filtersOpen;
        G.app.rerender();
      });
      u.on(host, 'click', '[data-ex]', function (e, t) { openDetail(t.getAttribute('data-ex')); });
      u.on(host, 'keydown', '[data-ex]', function (e, t) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(t.getAttribute('data-ex')); }
      });
    },
    openDetail: openDetail
  };
})(GoFit);
