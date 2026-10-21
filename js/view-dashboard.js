/* ============================================================
   G04Fit — Dashboard
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return 'Noch wach';
    if (h < 11) return 'Guten Morgen';
    if (h < 14) return 'Mahlzeit';
    if (h < 18) return 'Guten Tag';
    if (h < 22) return 'Guten Abend';
    return 'Späte Runde';
  }

  function weekStrip() {
    var s = G.store.state;
    var start = u.weekStart();
    var plan = G.planner.weekPlan();
    var planDays = {};
    plan.forEach(function (p) { planDays[p.day] = p; });
    var today = u.today();

    var cells = [];
    for (var i = 0; i < 7; i++) {
      var iso = u.addDays(start, i);
      var done = s.history.some(function (h) { return h.day === iso; });
      var isPlan = !!planDays[iso];
      var cls = ['dashboard-week-cell'];
      if (isPlan) cls.push('is-plan');
      if (done) cls.push('is-done');
      if (iso === today) cls.push('is-today');
      if (isPlan && !done && iso < today) { cls.push('is-miss'); }
      var miss = isPlan && !done && iso < today;
      var state = done ? 'erledigt' : miss ? 'verpasst' : isPlan ? 'geplant' : 'Ruhetag';
      var marker = '<em class="dashboard-week-cell__marker is-' + (done ? 'done' : miss ? 'miss' : isPlan ? 'plan' : 'free') + '" aria-hidden="true"></em>';
      cells.push(
        '<div class="' + cls.join(' ') + '" title="' + u.esc((isPlan ? planDays[iso].name + ' · ' : '') + state) + '"' +
        ' aria-label="' + u.esc(u.dayName(iso, true) + ': ' + state + (iso === today ? ', heute' : '')) + '">' +
        '<b>' + u.DAYS[u.parseDay(iso).getDay()] + '</b>' +
        '<span>' + u.parseDay(iso).getDate() + '</span>' +
        marker +
        '</div>'
      );
    }
    return '<div class="dashboard-week-strip">' + cells.join('') + '</div>' +
      '<div class="dashboard-week-legend">' +
      '<span><i class="lg lg--done"></i>Erledigt</span>' +
      '<span><i class="lg lg--plan"></i>Geplant</span>' +
      '<span><i class="lg lg--miss"></i>Verpasst</span>' +
      '<span><i class="lg lg--today"></i>Heute</span>' +
      '</div>';
  }

  function quickStats() {
    var s = G.store.state;
    var today = u.today();
    var week = s.history.filter(function (h) { return u.daysBetween(h.day, today) < 7; });
    var vol = u.sum(week, function (h) { return h.volume || 0; });
    var sets = u.sum(week, function (h) { return h.totalSets || 0; });
    var prs = Object.keys(s.records).filter(function (id) {
      return u.daysBetween(s.records[id].date, today) <= 30;
    }).length;

    // Kompakt in einer Reihe: kleines Bild, Zahl, Beschriftung.
    var items = [
      { k: 'Einheiten gesamt', v: s.journey.completed, art: 'assets/nav/nav-workout.png', tone: '' },
      { k: 'Serie (Wochen)', v: s.journey.streak, art: 'assets/progress/stat-streak.png', tone: 'gold' },
      { k: 'Volumen 7 Tage', v: vol >= 1000 ? u.fmt(vol / 1000, 1) : u.fmt(vol), d: vol >= 1000 ? 't' : 'kg', art: 'assets/progress/stat-volume.png', tone: 'neon' },
      { k: 'Sätze 7 Tage', v: sets, art: 'assets/nav/nav-exercises.png', tone: '' },
      { k: 'Rekorde 30 Tage', v: prs, art: 'assets/progress/stat-records.png', tone: 'cyan' }
    ];

    return '<section class="dashboard-stats dashboard-stats--row" aria-label="Kennzahlen">' + items.map(function (i) {
      return '<div class="dashboard-stat card' + (i.tone ? ' dashboard-stat--' + i.tone : '') + '">' +
        '<img class="dashboard-stat__art" src="' + u.esc(i.art) + '?v=2.5.0" alt="">' +
        '<span class="dashboard-stat__v">' + u.esc(String(i.v)) + (i.d ? '<span class="dashboard-stat__u">' + u.esc(i.d) + '</span>' : '') + '</span>' +
        '<span class="dashboard-stat__k">' + u.esc(i.k) + '</span>' +
        '</div>';
    }).join('') + '</section>';
  }

  /** "2 von 3 erledigt" für die Kopfzeile der Wochenkarte */
  function weekCount() {
    var s = G.store.state;
    var plan = G.planner.weekPlan();
    var start = u.weekStart(), end = u.addDays(start, 6);
    var done = {};
    s.history.forEach(function (h) { if (h.day >= start && h.day <= end) done[h.day] = 1; });
    return Object.keys(done).length + ' von ' + plan.length + ' erledigt';
  }

  function heroCard() {
    var s = G.store.state;
    var today = u.today();
    var running = s.session;
    var plan = G.planner.todayPlan();
    var doneToday = s.history.some(function (h) { return h.day === today; });
    var next = G.planner.nextPlan();

    var name = s.profile.name ? ', ' + s.profile.name : '';
    var head = '<div class="row" style="margin-bottom:6px">' +
      '<span class="pill pill--neon"><span class="pill__dot"></span>' + u.esc(u.dayName(today, true)) + '</span>' +
      '<span class="pill pill--muted">' + u.esc(G.journey.mode(s.profile.mode).icon + ' ' + G.journey.mode(s.profile.mode).name) + '</span>' +
      '</div>';

    var body, cta;

    if (running) {
      var doneSets = u.sum(running.exercises, function (b) {
        return b.sets.filter(function (x) { return x.done; }).length;
      });
      var allSets = u.sum(running.exercises, function (b) { return b.sets.length; });
      body = '<h2 class="big">Einheit läuft</h2>' +
        '<p class="muted">' + u.esc(running.title) + ' · ' + doneSets + ' von ' + allSets + ' Sätzen erledigt</p>' +
        '<div class="bar" style="margin-top:14px"><span class="bar__fill" style="width:' +
        Math.round(allSets ? doneSets / allSets * 100 : 0) + '%"></span></div>';
      cta = '<button class="btn btn--primary btn--lg" data-go="workout">' + u.icon('play', 18) + ' Weiter trainieren</button>';
    } else if (plan && !doneToday) {
      var exNames = plan.exercises.slice(0, 3).map(function (id) {
        var e = G.ex.byId(id); return e ? e.name : '';
      }).filter(Boolean);
      body = '<h2 class="big">' + u.esc(plan.name) + '</h2>' +
        '<p class="muted">' + plan.exercises.length + ' Übungen · ' +
        u.esc(plan.muscles.map(function (m) { return G.MUSCLES[m].name; }).join(', ')) + '</p>' +
        '<p class="small dim dashboard-hero__exlist">' + u.esc(exNames.join(' · ')) +
        (plan.exercises.length > 3 ? ' …' : '') + '</p>';
      cta = '<button class="btn btn--primary btn--lg btn--glass-green" data-act="start">' + u.icon('play', 18) + ' Training starten</button>' +
        '<button class="btn btn--lg btn--free" data-act="free">' + u.icon('plus', 18) + ' Freies Training</button>';
    } else if (doneToday) {
      var t = s.history.filter(function (h) { return h.day === today; }).pop();
      body = '<h2 class="big">Heute erledigt ' + u.icon('check', 26) + '</h2>' +
        '<p class="muted">' + u.esc(t ? t.title : '') + ' · ' + (t ? u.fmt(t.volume) : '0') + ' kg Volumen, ' +
        (t ? t.totalSets : 0) + ' Sätze</p>' +
        (next ? '<p class="small dim" style="margin-top:8px">Als Nächstes: ' + u.esc(next.name) + ' am ' +
          u.esc(u.dayName(next.day, true)) + '</p>' : '');
      cta = '<button class="btn btn--lg" data-go="progress">Fortschritt ansehen</button>' +
        '<button class="btn btn--lg btn--free" data-act="free">' + u.icon('plus', 18) + ' Freies Training</button>';
    } else {
      body = '<h2 class="big">Ruhetag</h2>' +
        '<p class="muted">Heute steht nichts im Plan. Lust auf Training? Starte ein freies Training.</p>' +
        (next ? '<p class="small dim" style="margin-top:8px">Nächste Einheit: ' + u.esc(next.name) + ' am ' +
          u.esc(u.dayName(next.day, true)) + ', ' + u.esc(u.fmtDateShort(next.day)) + '</p>' : '');
      // Ruhetag: der Hauptknopf wird automatisch zu „Freies Training“
      cta = '<button class="btn btn--primary btn--lg btn--glass-green dashboard-hero__main" data-act="free">' +
        u.icon('play', 18) + ' Freies Training</button>';
    }

    var li = G.store.levelInfo();

    // Die Satzpause wird im Workout-Reiter (vor dem Start und während der
    // Einheit) eingestellt — auf dem Dashboard bewusst nicht mehr.

    return '<section class="dashboard-hero card card--hero card--hl">' +
      '<div class="dashboard-hero__content">' +
      '<div class="dashboard-hero__profile">' +
      G.avatar.render(78, { ring: li.pct, level: li.level, hero: true, action: true, fallback: 'assets/dashboard-profile.png?v=2.6.0' }) +
      '</div>' +
      '<div class="dashboard-hero__copy">' +
      '<p class="dashboard-hero__greeting muted small">' + u.esc(greeting() + name) + '</p>' +
      head + body +
      '</div></div>' +
      '<div class="btn-row dashboard-hero__actions">' + cta + '</div>' +
      '</section>';
  }

  /* ------------------------------------------------------------
     Einklappbare Karten unter den Kennzahlen (20.10.2026):
     Kopf zeigt das Wichtigste, Antippen klappt auf. Zustand bleibt
     beim Neuzeichnen erhalten (laufende Sitzung).
     ------------------------------------------------------------ */
  var FOLD = { journey: false, coach: false, records: false };
  function foldHead(key, icon, title, summary, extra) {
    return '<button type="button" class="card__head dashboard-card__head fold__head" data-fold="' + key + '" aria-expanded="' + !!FOLD[key] + '">' +
      u.icon(icon, 18) +
      '<span class="fold__title"><h3>' + u.esc(title) + '</h3>' +
      (summary ? '<span class="fold__sum">' + summary + '</span>' : '') + '</span>' +
      '<span class="spacer"></span>' + (extra || '') +
      '<span class="fold__chev">' + u.icon('chevron', 18) + '</span></button>';
  }
  function foldOpen(key) { return FOLD[key] ? ' is-open' : ''; }

  function levelCard() {
    var li = G.store.levelInfo();
    return '<section class="dashboard-journey card fold' + foldOpen('journey') + '">' +
      foldHead('journey', 'journey', 'Journey',
        '<b>Level ' + li.level + '</b> · ' + u.esc(li.title) + ' · ' + li.into + ' / ' + li.need + ' XP',
        '<span class="pill pill--muted fold__pill">' + u.esc(li.region.icon + ' ' + li.region.name) + '</span>') +
      '<div class="fold__body">' +
      '<div class="row dashboard-journey__body" style="gap:18px">' +
      G.charts.ring(li.pct, { size: 104, value: li.level, label: 'Level' }) +
      '<div style="flex:1;min-width:0">' +
      '<b style="font-size:16px">' + u.esc(li.title) + '</b>' +
      '<p class="small muted" style="margin:4px 0 12px">' + li.into + ' / ' + li.need + ' XP bis Level ' + (li.level + 1) + '</p>' +
      '<div class="bar"><span class="bar__fill" style="width:' + Math.round(li.pct * 100) + '%"></span></div>' +
      '<p class="tiny dim" style="margin-top:10px">' + u.esc(li.region.tag) + '</p>' +
      '</div></div>' +
      '<button class="btn btn--sm btn--block dashboard-card__action" style="margin-top:16px" data-go="journey">Weltkarte öffnen</button>' +
      '</div></section>';
  }

  function coachCard() {
    var tip = G.coach.dailyTip();
    return '<section class="dashboard-coach card fold' + foldOpen('coach') + '">' +
      foldHead('coach', 'coach', 'G04Fit Coach',
        '<span class="fold__sum-line">' + u.esc(tip.text) + '</span>') +
      '<div class="fold__body">' +
      '<div class="coach dashboard-coach__body">' +
      '<div class="coach__av">' + u.icon(tip.locked ? 'lock' : 'coach', 20) + '</div>' +
      '<div class="coach__msg">' + u.esc(tip.text) + '</div>' +
      '</div>' +
      '<button class="btn btn--sm btn--block" style="margin-top:14px" data-go="coach">' +
      (tip.locked ? 'Einwilligung prüfen' : 'Alle Empfehlungen') + '</button>' +
      '</div></section>';
  }

  function recordsCard() {
    var s = G.store.state;
    var all = Object.keys(s.records).filter(function (id) { return G.ex.byId(id); })
      .sort(function (a, b) { return s.records[b].date < s.records[a].date ? -1 : 1; });
    var ids = all.slice(0, 4);
    function val(ex, r) { return ex.time ? r.reps + ' s' : u.fmt(r.weight) + '×' + r.reps; }

    var sum = 'Noch keine Bestleistungen';
    if (ids.length) {
      var ex0 = G.ex.byId(ids[0]), r0 = s.records[ids[0]];
      sum = '<span>Zuletzt:</span> <b>' + u.esc(ex0.name) + ' ' + val(ex0, r0) + '</b>';
    }

    return '<section class="dashboard-records card fold' + foldOpen('records') + '">' +
      foldHead('records', 'medal', ids.length ? 'Neueste Rekorde' : 'Rekorde', sum) +
      '<div class="fold__body">' +
      (ids.length
        ? '<div class="stack" style="--sp:8px">' + ids.map(function (id) {
          var ex = G.ex.byId(id), r = s.records[id];
          return '<div class="pr">' +
            '<div class="pr__medal">' + u.icon('medal', 16) + '</div>' +
            '<div class="pr__main"><b>' + u.esc(ex.name) + '</b><span>' + u.esc(u.relDay(r.date)) + '</span></div>' +
            '<div class="pr__v">' + val(ex, r) + '</div>' +
            '</div>';
        }).join('') + '</div>'
        : '<p class="small muted">Noch keine Bestleistungen erfasst. Nach der ersten abgeschlossenen Einheit erscheinen sie hier.</p>') +
      '</div></section>';
  }

  G.views.dashboard = {
    title: 'G04Fit',
    sub: function () {
      var s = G.store.state;
      return u.fmtDate(u.today()) + ' · ' + G.journey.mode(s.profile.mode).name + '-Modus';
    },
    render: function () {
      return '<div class="view stack dashboard-view">' +
        heroCard() +
        '<section class="dashboard-week card"><div class="card__head dashboard-card__head">' + u.icon('dashboard', 18) + '<h3>Diese Woche</h3>' +
        '<span class="spacer"></span><span class="pill pill--muted dashboard-week__count">' + weekCount() + '</span></div>' +
        weekStrip() + '</section>' +
        quickStats() +
        levelCard() + coachCard() + recordsCard() +
        '</div>';
    },
    mount: function (host) {
      /* Karten auf- und zuklappen, ohne neu zu zeichnen */
      u.on(host, 'click', '[data-fold]', function (e, t) {
        var key = t.getAttribute('data-fold');
        FOLD[key] = !FOLD[key];
        var card = t.closest('.fold');
        if (card) card.classList.toggle('is-open', FOLD[key]);
        t.setAttribute('aria-expanded', String(FOLD[key]));
      });
      u.on(host, 'click', '[data-act="start"]', function () {
        var plan = G.planner.todayPlan();
        if (!plan) return;
        G.views.workout.restDialog(plan.name, function () {
          G.store.state.session = G.planner.buildSession(plan);
          G.store.commit('session-start');
          G.app.go('workout');
        });
      });
      u.on(host, 'click', '[data-act="free"]', function () {
        G.app.go('workout', { free: true });
      });
    }
  };
})(G04Fit);
