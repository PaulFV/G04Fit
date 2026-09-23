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

    var items = [
      { k: 'Einheiten gesamt', v: s.journey.completed, art: 'assets/nav/nav-workout.png', tone: '', graph: 'bars' },
      { k: 'Serie', v: s.journey.streak, d: s.journey.streak === 1 ? 'Woche' : 'Wochen', art: 'assets/progress/stat-streak.png', tone: 'gold', graph: 'dots' },
      { k: 'Volumen 7 Tage', v: vol >= 1000 ? u.fmt(vol / 1000, 1) : u.fmt(vol), d: vol >= 1000 ? 'Tonnen' : 'kg', art: 'assets/progress/stat-volume.png', tone: 'neon', graph: 'bars' },
      { k: 'Sätze 7 Tage', v: sets, art: 'assets/nav/nav-exercises.png', tone: '', graph: 'bars' },
      { k: 'Rekorde 30 Tage', v: prs, art: 'assets/progress/stat-records.png', tone: 'cyan', graph: 'dots', wide: true }
    ];

    return '<section class="dashboard-stats" aria-label="Kennzahlen">' + items.map(function (i) {
      var graph = '<span class="dashboard-stat__graph dashboard-stat__graph--' + i.graph + '">' +
        (i.graph === 'dots' ? '<i></i><i></i><i></i><i></i><i></i><i></i>' : '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>') +
        '</span>';
      return '<div class="dashboard-stat card ' + (i.tone ? 'dashboard-stat--' + i.tone + ' ' : '') + (i.wide ? 'dashboard-stat--wide' : '') + '">' +
        '<div class="dashboard-stat__icon"><img class="dashboard-stat__art" src="' + u.esc(i.art) + '?v=2.5.0" alt=""></div>' +
        '<div class="dashboard-stat__copy"><span class="dashboard-stat__k">' + u.esc(i.k) + '</span>' +
        '<span class="dashboard-stat__v">' + u.esc(String(i.v)) + (i.d ? '<span class="dashboard-stat__u">' + u.esc(i.d) + '</span>' : '') + '</span></div>' +
        graph +
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
      cta = '<button class="btn btn--primary btn--lg" data-act="start">' + u.icon('play', 18) + ' Training starten</button>' +
        '<button class="btn btn--lg" data-go="workout">Plan ansehen</button>';
    } else if (doneToday) {
      var t = s.history.filter(function (h) { return h.day === today; }).pop();
      body = '<h2 class="big">Heute erledigt ' + u.icon('check', 26) + '</h2>' +
        '<p class="muted">' + u.esc(t ? t.title : '') + ' · ' + (t ? u.fmt(t.volume) : '0') + ' kg Volumen, ' +
        (t ? t.totalSets : 0) + ' Sätze</p>' +
        (next ? '<p class="small dim" style="margin-top:8px">Als Nächstes: ' + u.esc(next.name) + ' am ' +
          u.esc(u.dayName(next.day, true)) + '</p>' : '');
      cta = '<button class="btn btn--lg" data-go="progress">Fortschritt ansehen</button>' +
        '<button class="btn btn--lg btn--ghost" data-act="free">Zusatzeinheit</button>';
    } else {
      body = '<h2 class="big">Ruhetag</h2>' +
        '<p class="muted">Heute steht nichts im Plan. Erholung ist Teil des Trainings.</p>' +
        (next ? '<p class="small dim" style="margin-top:8px">Nächste Einheit: ' + u.esc(next.name) + ' am ' +
          u.esc(u.dayName(next.day, true)) + ', ' + u.esc(u.fmtDateShort(next.day)) + '</p>' : '');
      cta = '<button class="btn btn--lg" data-act="free">' + u.icon('plus', 18) + ' Trotzdem trainieren</button>' +
        '<button class="btn btn--lg btn--ghost" data-go="journey">Journey ansehen</button>';
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

  function levelCard() {
    var s = G.store.state;
    var li = G.store.levelInfo();
    return '<section class="dashboard-journey card">' +
      '<div class="card__head dashboard-card__head">' + u.icon('journey', 18) + '<h3>Journey</h3><span class="spacer"></span>' +
      '<span class="pill pill--muted">' + u.esc(li.region.icon + ' ' + li.region.name) + '</span></div>' +
      '<div class="row dashboard-journey__body" style="gap:18px">' +
      G.charts.ring(li.pct, { size: 104, value: li.level, label: 'Level' }) +
      '<div style="flex:1;min-width:0">' +
      '<b style="font-size:16px">' + u.esc(li.title) + '</b>' +
      '<p class="small muted" style="margin:4px 0 12px">' + li.into + ' / ' + li.need + ' XP bis Level ' + (li.level + 1) + '</p>' +
      '<div class="bar"><span class="bar__fill" style="width:' + Math.round(li.pct * 100) + '%"></span></div>' +
      '<p class="tiny dim" style="margin-top:10px">' + u.esc(li.region.tag) + '</p>' +
      '</div></div>' +
      '<button class="btn btn--sm btn--block dashboard-card__action" style="margin-top:16px" data-go="journey">Weltkarte öffnen</button>' +
      '</section>';
  }

  function coachCard() {
    var tip = G.coach.dailyTip();
    return '<section class="dashboard-coach card">' +
      '<div class="card__head dashboard-card__head">' + u.icon('coach', 18) + '<h3>G04Fit Coach</h3></div>' +
      '<div class="coach dashboard-coach__body">' +
      '<div class="coach__av">' + u.icon(tip.locked ? 'lock' : 'coach', 20) + '</div>' +
      '<div class="coach__msg">' + u.esc(tip.text) + '</div>' +
      '</div>' +
      '<button class="btn btn--sm btn--block" style="margin-top:14px" data-go="coach">' +
      (tip.locked ? 'Einwilligung prüfen' : 'Alle Empfehlungen') + '</button>' +
      '</section>';
  }

  function reminderCard() {
    var next = G.reminders.nextReminder();
    var on = G.store.hasConsent('push');
    return '<section class="dashboard-reminder card">' +
      '<div class="card__head dashboard-card__head">' + u.icon('reminders', 18) + '<h3>Nächste Erinnerung</h3></div>' +
      (next
        ? '<div class="list__row" style="padding-top:0">' +
        '<div class="list__ic">' + u.icon('clock', 18) + '</div>' +
        '<div class="list__main"><b>' + u.esc(next.title) + '</b><span>' + u.esc(next.when) + '</span></div>' +
        '</div>'
        : '<p class="small muted">Kein offener Termin in den nächsten Tagen.</p>') +
      '<p class="tiny ' + (on ? 'neon' : 'dim') + '" style="margin-top:10px">' +
      (on ? 'Benachrichtigungen sind aktiv.' : 'Benachrichtigungen sind ausgeschaltet.') + '</p>' +
      '<button class="btn btn--sm btn--block" style="margin-top:12px" data-go="reminders">Erinnerungen verwalten</button>' +
      '</section>';
  }

  function recordsCard() {
    var s = G.store.state;
    var ids = Object.keys(s.records)
      .sort(function (a, b) { return s.records[b].date < s.records[a].date ? -1 : 1; })
      .slice(0, 4);

    if (!ids.length) {
      return '<section class="dashboard-records card"><div class="card__head dashboard-card__head">' + u.icon('medal', 18) + '<h3>Rekorde</h3></div>' +
        '<p class="small muted">Noch keine Bestleistungen erfasst. Nach der ersten abgeschlossenen Einheit erscheinen sie hier.</p></section>';
    }

    return '<section class="dashboard-records card"><div class="card__head dashboard-card__head">' + u.icon('medal', 18) + '<h3>Neueste Rekorde</h3></div>' +
      '<div class="stack" style="--sp:8px">' + ids.map(function (id) {
        var ex = G.ex.byId(id), r = s.records[id];
        if (!ex) return '';
        return '<div class="pr">' +
          '<div class="pr__medal">' + u.icon('medal', 16) + '</div>' +
          '<div class="pr__main"><b>' + u.esc(ex.name) + '</b><span>' + u.esc(u.relDay(r.date)) + '</span></div>' +
          '<div class="pr__v">' + (ex.time ? r.reps + ' s' : u.fmt(r.weight) + '×' + r.reps) + '</div>' +
          '</div>';
      }).join('') + '</div></section>';
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
        levelCard() + coachCard() + reminderCard() + recordsCard() +
        '</div>';
    },
    mount: function (host) {
      u.on(host, 'click', '[data-act="start"]', function () {
        var plan = G.planner.todayPlan();
        if (!plan) return;
        G.store.state.session = G.planner.buildSession(plan);
        G.store.commit('session-start');
        G.app.go('workout');
      });
      u.on(host, 'click', '[data-act="free"]', function () {
        G.app.go('workout', { free: true });
      });
    }
  };
})(G04Fit);
