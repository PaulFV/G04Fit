/* ============================================================
   G04Fit — Workout (laufende Einheit)
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  /* Statische, realistische Übungsbilder für Vorschau und Auswahl. Einige
     Übungen teilen sich bewusst ein Motiv, damit die Kacheln sofort laden.
     Die animierte Demonstration im Detailfenster bleibt davon unberührt. */
  var PHOTO_BY_ID = {
    'bench-bb': 'bench-bb', 'bench-bb-flat': 'bench-bb', 'bench-db': 'bench-db', 'incline-db': 'incline-db', 'fly-db-incline': 'incline-db',
    'fly-cable': 'fly-cable', 'fly-cable-mid': 'fly-cable', 'fly-machine': 'fly-machine-v2-dark', 'fly-machine-2': 'fly-machine-v2-dark',
    'pushup': 'pushup', 'pushup-close': 'pushup-v2', 'pushup-decline': 'pushup-v2',
    'pushup-knee': 'pushup-v2', 'pushup-positive': 'pushup-v2', 'dip-chest': 'dip-chest', 'dip-heavy': 'dip-chest',
    'pullup': 'pullup', 'pullup-assisted': 'pullup', 'pullup-machine-kneeling': 'pullup', 'pullup-close-overhand': 'pullup', 'pullup-close-underhand': 'pullup',
    'pullup-wide-overhand': 'pullup', 'pullup-wide-weighted': 'pullup',
    'latpull': 'latpull', 'latpull-close-neck': 'latpull',
    'latpull-wide-chest': 'latpull', 'latpull-machine': 'latpull', 'latpull-wide-neck': 'latpull',
    'row-bb': 'row-bb', 'row-bb-underhand-incline': 'row-bb', 'row-smith-underhand': 'row-bb',
    'row-db': 'row-db', 'deadlift-smith': 'row-bb', 'row-cable': 'row-cable', 'row-machine-underhand': 'row-cable', 'chest-press-machine': 'bench-bb', 'bench-machine': 'bench-bb', 'row-cable-upper': 'row-cable',
    'pullover': 'pullover', 'pullover-db-hammer': 'pullover', 'pullover-db-ball': 'pullover',
    'pullover-cable': 'pullover', 'pullover-bb': 'pullover',
    'ohp-db': 'ohp-db', 'ohp-bb': 'ohp-bb', 'lateral': 'lateral', 'lateral-seated': 'lateral', 'front-raise': 'front-raise',
    'rear-fly': 'rear-fly', 'rear-fly-db': 'rear-fly', 'rear-fly-db-incline': 'rear-fly',
    'rear-fly-cable-bent': 'rear-fly', 'rear-fly-cable-standing': 'rear-fly', 'rear-fly-cable-lying': 'rear-fly', 'rear-fly-cable-crossed': 'rear-fly', 'rear-fly-db-standing': 'rear-fly',
    'shrug': 'shrug', 'shrug-back-ez': 'shrug', 'shrug-back-cable': 'shrug', 'curl-bb': 'curl-bb', 'curl-bb-scott': 'curl-bb', 'curl-db': 'curl-db',
    'curl-db-incline-bilateral': 'curl-db', 'curl-db-bilateral': 'curl-db', 'curl-preacher': 'curl-preacher',
    'curl-cable': 'curl-cable', 'triceps-cable-lying': 'pushdown', 'triceps-pushdown': 'pushdown', 'bench-dip-triceps': 'dip-triceps',
    'bench-db-triceps': 'bench-db', 'bench-bb-triceps': 'bench-bb', 'skullcrusher': 'skullcrusher', 'skullcrusher-db-onearm': 'skullcrusher', 'skullcrusher-cable': 'skullcrusher', 'triceps-bb-overhead': 'ohext-db',
    'ohext-db': 'ohext-db', 'triceps-cable-overhead-onearm': 'ohext-db', 'kickback': 'kickback',
    'crunch': 'crunch', 'crunch-reverse': 'crunch', 'crunch-crisscross': 'crunch', 'situp-straight': 'crunch', 'crunch-side': 'crunch', 'sidebend-db': 'crunch', 'abs-side-bench': 'crunch',
    'legraise': 'legraise', 'legraise-hanging-station': 'legraise', 'kneeraise-station': 'legraise', 'plank': 'plank',
    'plank-weighted': 'plank', 'mountain-climber': 'plank', 'side-plank': 'plank', 'side-plank-db': 'plank', 'cable-crunch': 'cable-crunch', 'cable-crunch-standing': 'cable-crunch'
  };

  function exercisePhoto(ex) {
    var base = PHOTO_BY_ID[ex.id] || ex.id;
    return 'assets/exercises/anatomy/' + base + '.webp';
  }

  var rest = { left: 0, timer: null, exId: null, endAt: 0, finished: false };

  /* Trainingszeit: läuft ab "Start" (session.startedAt; beim freien Training
     erst nach Tipp auf den Start-Knopf) und steht, sobald der letzte Satz
     abgehakt ist (session.stoppedAt). Gerechnet wird immer aus dem
     Startzeitpunkt, damit die Uhr auch nach Tab-Wechsel, Neuladen oder
     gesperrtem Bildschirm stimmt. */
  var clockTimer = null;
  function sessionElapsed(sess) {
    var t = Date.parse(sess && sess.startedAt);
    if (!isFinite(t)) return 0;
    var end = sess.stoppedAt ? Date.parse(sess.stoppedAt) : Date.now();
    return isFinite(end) ? Math.max(0, (end - t) / 1000) : 0;
  }
  /** Uhr an den Abhak-Stand anpassen: stehen lassen, wenn alle Sätze erledigt
      sind; wieder anlaufen (ohne die Standzeit zu zählen), wenn danach ein
      Satz zurückgenommen oder ergänzt wird. */
  function allSetsDone(sess) {
    return !!sess && sess.exercises.length > 0 && sess.exercises.every(function (b) {
      return b.sets.length > 0 && b.sets.every(function (x) { return x.done; });
    });
  }
  /** Die nächste Übung (erste mit offenen Sätzen) dauerhaft farbig/pulsierend
      markieren; sind alle Sätze erledigt, ist keine mehr markiert. */
  function markNextBlock(host) {
    var sess = G.store.state.session;
    if (!sess) return;
    var next = -1;
    for (var i = 0; i < sess.exercises.length; i++) {
      if (sess.exercises[i].sets.some(function (x) { return !x.done; })) { next = i; break; }
    }
    host.querySelectorAll('[data-block]').forEach(function (card) {
      card.classList.toggle('is-up-next', +card.getAttribute('data-block') === next);
    });
    // Innerhalb dieser Übung zusätzlich den nächsten offenen Satz animieren.
    var nextSet = next >= 0 ? sess.exercises[next].sets.findIndex(function (x) { return !x.done; }) : -1;
    host.querySelectorAll('.set-row').forEach(function (row) {
      row.classList.toggle('is-next-set',
        +row.getAttribute('data-b') === next && +row.getAttribute('data-s') === nextSet);
    });
  }
  /** Sind alle Sätze erledigt, blinkt "Abschließen" (ganz unten); mit scroll
      springt die Ansicht dorthin. Sonst blinkt nichts. */
  function updateFinishCue(host, scroll) {
    markNextBlock(host);
    var btn = host.querySelector('[data-act="finish"]');
    if (!btn) return;
    var all = allSetsDone(G.store.state.session);
    btn.classList.toggle('btn--blink', all);
    if (all && scroll) {
      setTimeout(function () { btn.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 350);
    }
  }
  function syncClock(sess) {
    if (!sess || !sess.startedAt) return;
    var all = allSetsDone(sess);
    if (all && !sess.stoppedAt) {
      sess.stoppedAt = new Date().toISOString();
    } else if (!all && sess.stoppedAt) {
      var idle = Date.now() - Date.parse(sess.stoppedAt);
      sess.startedAt = new Date(Date.parse(sess.startedAt) + (isFinite(idle) ? idle : 0)).toISOString();
      sess.stoppedAt = null;
    }
    tickClock();
  }
  function tickClock() {
    var sess = G.store.state.session;
    var el = document.getElementById('sessTimeV');
    if (!sess || !el) { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } return; }
    el.textContent = u.fmtDuration(sessionElapsed(sess));
  }
  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(tickClock, 1000);
    tickClock();
  }

  /** Nach der letzten erledigten Serie einer Übung: zur nächsten Übung mit
      offenen Sätzen scrollen und sie kurz hervorheben. */
  function focusNextBlock(host, bi) {
    var sess = G.store.state.session;
    if (!sess) return;
    var n = sess.exercises.length, target = -1;
    for (var k = 1; k < n; k++) {
      var j = (bi + k) % n;
      if (sess.exercises[j].sets.some(function (x) { return !x.done; })) { target = j; break; }
    }
    if (target < 0) return;
    var card = host.querySelector('[data-block="' + target + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.classList.remove('is-next');
    void card.offsetWidth;
    card.classList.add('is-next');
    setTimeout(function () { card.classList.remove('is-next'); }, 2600);
  }

  // mount() wird bei jedem Rerender der laufenden Einheit erneut aufgerufen
  // (Tab verlassen & zurück, "+ Satz", "Übung ergänzen" …). unmount() bleibt
  // absichtlich leer, damit der Pausentimer weiterläuft — deshalb müssen die
  // Klick-/Input-Handler selbst aufräumen, sonst hängen nach jedem Remount
  // zusätzliche Handler am immer gleichen #viewHost und jeder Klick (z. B.
  // "Satz abhaken") feuert mehrfach, wodurch sich Häkchen wieder aufheben.
  var mountAbort = null;

  // Eingaben nicht bei jedem Tastendruck speichern; beim Verlassen der Seite sofort.
  var saveSoon = u.debounce(function () { G.store.save(); }, 400);
  window.addEventListener('pagehide', function () { if (G.store.state.session) G.store.save(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && G.store.state.session) G.store.save();
  });

  function stopRest() {
    if (rest.timer) clearInterval(rest.timer);
    if (rest.autoDismiss) clearTimeout(rest.autoDismiss);
    G.reminders.stopRingAlarm();
    rest.timer = null; rest.autoDismiss = null;
    rest.left = 0; rest.exId = null; rest.endAt = 0; rest.finished = false;
    var el = u.$('#restBox');
    if (el) el.remove();
  }

  /** Zeigt die Satzpause zentriert als Overlay — entweder den laufenden
      Countdown oder, sobald er abgelaufen ist, den "fertig"-Zustand zum
      Antippen (rest.finished). Wird auch beim erneuten mount() aufgerufen,
      damit der aktuelle Stand nach einem Tab-Wechsel wieder erscheint. */
  function showRestBox() {
    if (!rest.endAt) return;
    var old = u.$('#restBox');
    if (old) old.remove();

    var body = rest.finished
      ? '<div class="timer-overlay__card timer-overlay__card--done">' +
        '<span style="color:var(--neon)">' + u.icon('check', 26) + '</span>' +
        '<div class="timer-overlay__v" id="restV" style="color:var(--neon)">00:00</div>' +
        '<span class="tiny muted">Pause vorbei — antippen für den nächsten Satz</span>' +
        '</div>'
      : '<div class="timer-overlay__card">' +
        '<span style="color:var(--cyan)">' + u.icon('clock', 24) + '</span>' +
        '<div class="timer-overlay__v" id="restV">' + u.mmss(rest.left) + '</div>' +
        '<span class="tiny muted">Satzpause</span>' +
        '<div class="btn-row">' +
        '<button class="btn btn--sm" data-act="rest-skip">Überspringen</button>' +
        '<button class="btn btn--sm" data-act="rest-plus">+30 s</button>' +
        '</div></div>';

    // Im "fertig"-Zustand macht das ganze Overlay (inkl. Hintergrund) den
    // vorhandenen "rest-skip"-Handler antippbar — bewusst nur dann, damit
    // während des normalen Countdowns nichts aus Versehen übersprungen wird.
    //
    // Wird direkt an document.body gehängt (nicht an #restHost innerhalb
    // der View): .view hat eine "both"-gefüllte Eintritts-Animation, die
    // transform animiert — dadurch bleibt transform dauerhaft auf einer
    // (visuell unsichtbaren) Identitätsmatrix stehen statt auf "none", und
    // genau das erzeugt laut CSS-Spezifikation einen neuen Containing
    // Block für alle position:fixed-Nachfahren. Das Overlay wäre dadurch
    // nicht mehr am Bildschirm zentriert, sondern an der (oft sehr viel
    // größeren) Höhe der gesamten Ansicht — bei längeren Einheiten landet
    // der Countdown dann weit unterhalb des sichtbaren Bereichs. Direkt an
    // body gehängt umgeht dieses Problem unabhängig von der jeweiligen
    // View-Struktur.
    document.body.appendChild(u.el(
      '<div class="timer-overlay" id="restBox"' + (rest.finished ? ' data-act="rest-skip"' : '') + '>' +
      body + '</div>'
    ));
  }

  function startRest(seconds, exId) {
    var sess = G.store.state.session;
    if (!sess || !sess.restEnabled) return;
    stopRest();
    rest.left = seconds; rest.exId = exId;
    rest.endAt = Date.now() + seconds * 1000;
    rest.finished = false;
    G.reminders.prepareAlarm(G.reminders.restSoundOn());

    showRestBox();

    function updateRest() {
      rest.left = Math.max(0, Math.ceil((rest.endAt - Date.now()) / 1000));
      var v = u.$('#restV');
      if (v && !rest.finished) v.textContent = u.mmss(rest.left);
      if (rest.left <= 0 && !rest.finished) {
        rest.finished = true;
        if (rest.timer) { clearInterval(rest.timer); rest.timer = null; }
        showRestBox();
        G.reminders.restFinished();
        // Klingelt ca. 10 s (respektiert die Stumm-Einstellung) oder bis
        // man antippt; danach wird notfalls automatisch weitergemacht.
        G.reminders.ringAlarm(10000);
        rest.autoDismiss = setTimeout(stopRest, 10000);
      }
    }

    rest.timer = setInterval(updateRest, 500);
    updateRest();
  }

  // Überspringen/+30s/Antippen-zum-Weitermachen: einmalig an document
  // gebunden, nicht an den jeweiligen View-Host — das Pausen-Overlay hängt
  // jetzt direkt an document.body (siehe showRestBox) und ist damit kein
  // Nachfahre von host mehr. Da dies nur EINMAL beim Laden des Moduls
  // passiert (nicht bei jedem mount()), gibt es hier keine
  // Mehrfach-Anmeldung von Handlern.
  u.on(document, 'click', '[data-act="rest-skip"]', function () { stopRest(); });
  u.on(document, 'click', '[data-act="rest-plus"]', function () {
    rest.endAt += 30000;
    rest.left = Math.max(0, Math.ceil((rest.endAt - Date.now()) / 1000));
    var v = u.$('#restV');
    if (v) v.textContent = u.mmss(rest.left);
  });

  /* ------------------------------------------------------------
     Kein Training aktiv: Auswahl anzeigen
     ------------------------------------------------------------ */
  function planPreview() {
    var s = G.store.state;
    var plan = G.planner.todayPlan();
    var next = G.planner.nextPlan();
    var show = plan || next;
    var isToday = !!plan;

    var lastSess = G.store.hasConsent('history') ? G.planner.lastFinished() : null;
    var repeatBtn = '';
    if (lastSess) {
      var nEx = (lastSess.exercises || []).filter(function (b) { return G.ex.byId(b.exId); }).length;
      var dur = u.sessionDuration(lastSess);
      repeatBtn = '<button class="btn btn--block workout-preview__repeat" data-act="repeat-last">' +
        u.icon('refresh', 17) + '<span class="workout-preview__repeat-copy"><b>Letztes Training wiederholen</b>' +
        '<span>' + u.esc(lastSess.title) + ' · ' + u.esc(u.fmtDateShort(lastSess.day)) + ' · ' + nEx + ' Übungen' +
        (dur ? ' · ' + u.fmtDuration(dur) : '') + '</span></span></button>';
    }

    var head = '<section class="workout-preview__hero card card--hero">' +
      '<div class="workout-preview__hero-copy">' +
      '<p class="workout-preview__eyebrow muted small">' + (isToday ? 'Heute im Plan' : 'Nächste geplante Einheit') + '</p>' +
      '<h2 class="workout-preview__title">' + u.esc(show ? show.name : 'Freies Training') + '</h2>' +
      '<p class="workout-preview__meta">' + (show
        ? u.dayName(show.day, true) + ', ' + u.fmtDateShort(show.day) + ' · ' +
        show.muscles.map(function (m) { return G.MUSCLES[m].name; }).join(', ')
        : 'Wähle die Übungen selbst aus.') + '</p>' +
      '<div class="workout-preview__actions">' +
      (show ? '<button class="btn btn--primary btn--lg btn--glass-green" data-act="start-plan">' + u.icon('play', 16) + ' Training starten</button>' : '') +
      '<button class="btn btn--lg btn--free" data-act="open-free">' + u.icon('plus', 16) + ' Freies Training</button>' +
      '</div>' + repeatBtn +
      '</div>' +
      '<div class="workout-preview__hero-art" aria-hidden="true">' +
      '<span class="workout-preview__art-glow"></span>' +
      '<img src="assets/exercises/anatomy/bench-bb.webp" alt="">' +
      '</div>' +
      '</section>';

    var list = '';
    if (show) {
      list = '<section class="workout-preview__panel card"><div class="card__head workout-preview__panel-head">' + u.icon('dumbbell', 20) +
        '<h3>Vorgesehene Übungen</h3><span class="spacer"></span>' +
        '<span class="tiny dim">Vorschläge des Coaches</span></div><div class="workout-preview__exercise-list">' +
        show.exercises.map(function (id, i) {
          var ex = G.ex.byId(id);
          if (!ex) return '';
          var sug = G.coach.suggestNext(id);
          return '<div class="workout-preview__exercise list__row--click" data-ex="' + id + '">' +
            '<div class="workout-preview__exercise-thumb list__ic--map">' +
            G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</div>' +
            '<div class="workout-preview__exercise-main list__main"><b>' + u.esc(ex.name) + '</b>' +
            '<span>' + u.esc(G.MUSCLES[ex.muscle].name) +
            (ex.sec.length ? ' + ' + u.esc(ex.sec.map(function (m) { return G.MUSCLES[m].name; }).join(', ')) : '') +
            ' · ' + sug.sets + ' Sätze</span></div>' +
            '<div class="workout-preview__exercise-value list__end"><b class="mono small' + (sug.kind === 'up' ? ' neon' : '') + '">' +
            (ex.time ? u.fmtReps(sug.reps, 's') : u.fmtSetWeight(ex, sug.weight)) + '</b>' +
            '<span class="tiny dim">' + (ex.time ? 'Haltezeit' : u.fmtReps(sug.reps, 'Wdh.')) + '</span></div>' +
            '<span class="workout-preview__exercise-arrow">' + u.icon('chevron', 19) + '</span>' +
            '</div>';
        }).join('') + '</div></section>';
    }

    var week = '<section class="workout-preview__panel workout-preview__week-panel card"><div class="card__head workout-preview__panel-head">' + u.icon('dashboard', 20) +
      '<h3>Wochenplan</h3><span class="spacer"></span><span class="tiny dim">' +
      G.planner.weekPlan().length + ' Einheiten</span></div><div class="workout-preview__week-list">' +
      G.planner.weekPlan().map(function (p) {
        var done = s.history.some(function (h) { return h.day === p.day; });
        var past = p.day < u.today();
        var weekEx = p.exercises && p.exercises.length ? G.ex.byId(p.exercises[0]) : null;
        var weekMap = weekEx
          ? G.anim.muscleMap(weekEx.muscle, weekEx.sec, { view: 'auto' })
          : G.anim.muscleMap('chest', [], { view: 'auto' });
        return '<div class="workout-preview__week-item">' +
          '<span class="workout-preview__week-dot ' + (done ? 'is-done' : past ? 'is-past' : '') + '"></span>' +
          '<div class="workout-preview__week-thumb" aria-hidden="true">' + weekMap + '</div>' +
          '<div class="workout-preview__week-main"><b>' + u.esc(p.name) + '</b><span>' +
          u.esc(u.dayName(p.day, true) + ', ' + u.fmtDateShort(p.day)) + '</span></div>' +
          '<span class="pill workout-preview__week-status ' + (done ? 'pill--neon' : past ? 'pill--danger' : 'pill--muted') + '">' +
          (done ? 'erledigt' : past ? 'verpasst' : 'offen') + '</span>' +
          '</div>';
      }).join('') + '</div>' +
      '<button class="btn btn--sm btn--block workout-preview__week-change" data-go="profile">Trainingstage ändern</button>' +
      '</section>';

    return '<div class="view stack workout-preview">' + head +
      '<div class="workout-preview__columns">' + list + week + '</div></div>';
  }

  /* ------------------------------------------------------------
     Laufende Einheit
     ------------------------------------------------------------ */
  /** Liegestütze: kein Gewichtsfeld, stattdessen steht das eigene Körpergewicht
      (Profil) da — es wird nur angezeigt, nicht eingegeben. */
  function ownWeightOnly(ex) { return /^pushup/.test(ex.id); }
  function ownWeightCell() {
    var bw = G.store.state.profile.weight;
    return '<div class="input-suffix"><input class="input" type="text" readonly tabindex="-1" value="' +
      (bw ? u.esc(u.fmt(bw)) : '–') + '" aria-label="Eigengewicht"><span>kg</span></div>';
  }
  function setRow(bi, si, set, ex) {
    return '<div class="set-row' + (set.done ? ' is-done' : '') + '" data-b="' + bi + '" data-s="' + si + '">' +
      '<span class="set-row__n">' + (si + 1) + '</span>' +
      (ex.time
        ? '<span class="small dim center">Halten</span>'
        : ownWeightOnly(ex) ? ownWeightCell()
        : '<div class="input-suffix"><input class="input" type="number" inputmode="decimal" step="' +
        (ex.inc || 2.5) + '" min="0" value="' + set.weight + '" data-f="weight" aria-label="Gewicht"><span>kg</span></div>') +
      '<div class="input-suffix"><input class="input" type="number" inputmode="numeric" step="1" min="0" value="' +
      set.reps + '" data-f="reps" aria-label="' + (ex.time ? 'Sekunden' : 'Wiederholungen') + '"><span>' +
      (ex.time ? 's' : '×') + '</span></div>' +
      '<button class="set-check" data-act="toggle" aria-label="Satz abhaken">' + u.icon('check', 18) + '</button>' +
      '</div>';
  }

  /** Summe der Wiederholungen (bzw. Sekunden bei Halte-Übungen) aller
      bereits abgehakten Sätze einer Übung — live während des Trainings. */
  function repsDoneLabel(b, ex) {
    var reps = u.sum(b.sets, function (x) { return x.done ? (+x.reps || 0) : 0; });
    return reps + ' ' + (ex.time ? 's' : 'Wdh.');
  }

  /** Text für die Pausenanzeige in der Fußzeile einer Übungs-Karte —
      eine einzige, für die ganze Einheit gültige Pausenzeit. */
  function pauseLabel(sess) {
    return sess.restEnabled ? 'Pause ' + sess.restSeconds + ' s' : 'Pause aus';
  }

  function block(b, bi) {
    var ex = G.ex.byId(b.exId);
    if (!ex) return '';
    var done = b.sets.filter(function (x) { return x.done; }).length;
    var all = b.sets.length;
    var mv = G.MUSCLES[ex.muscle];

    return '<div class="card' + (done ? ' has-done' : '') + '" data-block="' + bi + '">' +
      '<div class="card__head">' +
      '<span class="map-chip" style="width:44px;height:46px" title="Beanspruchte Muskeln">' +
      G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</span>' +
      '<div style="min-width:0;flex:1">' +
      '<h3>' + u.esc(ex.name) + '</h3>' +
      '<span class="tiny dim" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
      u.esc(G.MUSCLES[ex.muscle].name) +
      (ex.sec.length ? ' · ' + u.esc(ex.sec.map(function (m) { return G.MUSCLES[m].name; }).join(', ')) : '') +
      '</span></div>' +
      '<span class="spacer"></span>' +
      '<span class="pill ' + (done === all ? 'pill--neon' : 'pill--muted') + '">' + done + '/' + all + '</span>' +
      '<button class="icon-btn" data-act="info" data-ex="' + ex.id + '" title="Übung ansehen" style="width:32px;height:32px">' +
      u.icon('info', 16) + '</button>' +
      (G.store.state.session.exercises.length > 1
        ? '<button class="icon-btn ex-remove" data-act="del-ex" data-b="' + bi + '" title="Übung entfernen" aria-label="Übung entfernen" style="width:32px;height:32px">' +
          u.icon('trash', 16) + '</button>' : '') +
      '</div>' +

      (b.hint ? '<div class="coach" style="margin-bottom:14px">' +
        '<div class="coach__av" style="width:32px;height:32px;border-radius:10px">' + u.icon('coach', 16) + '</div>' +
        '<div class="coach__msg small">' + u.esc(b.hint) + '</div></div>' : '') +

      '<div class="set-head"><span>#</span><span>' + (ex.time ? '' : ownWeightOnly(ex) ? 'Eigengewicht' : 'Gewicht') + '</span><span>' +
      (ex.time ? 'Sekunden' : 'Wdh.') + '</span><span></span></div>' +
      b.sets.map(function (s, si) { return setRow(bi, si, s, ex); }).join('') +

      '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn btn--sm" data-act="add-set" data-b="' + bi + '">' + u.icon('plus', 15) + ' Satz</button>' +
      '<button class="btn btn--sm" data-act="rpe" data-b="' + bi + '" data-v="easy">War leicht</button>' +
      '<button class="btn btn--sm" data-act="rpe" data-b="' + bi + '" data-v="hard">War schwer</button>' +
      '<span class="spacer"></span>' +
      '<span class="tiny dim nowrap" data-reps-total="' + bi + '">' +
      u.esc(repsDoneLabel(b, ex) + ' · ' + pauseLabel(G.store.state.session)) + '</span>' +
      '</div>' +
      '</div>';
  }

  /** Wiederholungszähler + Pausenanzeige einer Übung (Fußzeile der Karte)
      ohne Neuaufbau der Seite aktualisieren. */
  function refreshRepsTotal(host, bi) {
    var sess = G.store.state.session;
    var b = sess.exercises[bi];
    var ex = b && G.ex.byId(b.exId);
    if (!ex) return;
    var el = host.querySelector('[data-reps-total="' + bi + '"]');
    if (el) el.textContent = repsDoneLabel(b, ex) + ' · ' + pauseLabel(sess);
  }

  /** Aktualisiert die Fußzeile aller Übungs-Karten (nach Änderung der
      Pauseneinstellungen in der Kopfkarte). */
  function refreshAllRepsTotals(host) {
    var sess = G.store.state.session;
    if (!sess) return;
    sess.exercises.forEach(function (b, bi) { refreshRepsTotal(host, bi); });
  }

  /** Kopfbereich der laufenden Einheit ohne Neuaufbau der Seite aktualisieren */
  function refreshHero() {
    var sess = G.store.state.session;
    if (!sess) return;
    var done = u.sum(sess.exercises, function (b) { return b.sets.filter(function (x) { return x.done; }).length; });
    var all = u.sum(sess.exercises, function (b) { return b.sets.length; });
    var vol = u.sum(sess.exercises, function (b) { return u.volume(b.sets); });

    var mid = u.$('#sessHero .ring-wrap__mid b');
    if (mid) mid.textContent = done + '/' + all;

    var fill = u.$('#sessHero .ring__fill');
    if (fill) {
      var c = parseFloat(fill.getAttribute('stroke-dasharray')) || 0;
      fill.setAttribute('stroke-dashoffset', (c * (1 - (all ? done / all : 0))).toFixed(2));
    }

    var volPill = u.$('#sessVol');
    if (volPill) volPill.textContent = u.fmt(vol) + ' kg Volumen';
  }

  /* Notiz-Karte: eingeklappt, solange noch keine Notiz da ist. Der Zustand
     bleibt über Neuaufbauten der Ansicht ("+ Satz" …) erhalten. */
  var noteState = { id: null, open: false };
  function noteIsOpen(sess) {
    if (noteState.id !== sess.id) noteState = { id: sess.id, open: !!(sess.notes && sess.notes.trim()) };
    return noteState.open;
  }

  function activeSession(sess) {
    var noteOpen = noteIsOpen(sess);
    // Sessions aus einer früheren Sitzung (vor diesem Feature gestartet)
    // bekommen sinnvolle Standardwerte statt undefined.
    if (sess.restSeconds == null) sess.restSeconds = 90;
    if (sess.restEnabled == null) sess.restEnabled = true;

    var doneSets = u.sum(sess.exercises, function (b) { return b.sets.filter(function (x) { return x.done; }).length; });
    var allSets = u.sum(sess.exercises, function (b) { return b.sets.length; });
    var vol = u.sum(sess.exercises, function (b) { return u.volume(b.sets); });
    var pct = allSets ? doneSets / allSets : 0;

    return '<div class="view stack">' +
      '<div class="card card--hero card--hl" id="sessHero">' +
      '<div class="row row--wrap" style="gap:18px">' +
      G.charts.ring(pct, { size: 96, stroke: 9, value: doneSets + '/' + allSets, label: 'Sätze' }) +
      '<div style="flex:1;min-width:180px">' +
      '<p class="muted small">Laufende Einheit</p>' +
      '<h2 style="font-size:22px;margin:2px 0 6px">' + u.esc(sess.title) + '</h2>' +
      '<div class="row row--wrap" style="gap:7px">' +
      '<span class="pill pill--cyan sess-time" title="Trainingszeit">' + u.icon('clock', 14) +
      '<b id="sessTimeV">' + u.fmtDuration(sessionElapsed(sess)) + '</b></span>' +
      (sess.startedAt ? '' : '<span class="pill pill--muted" id="sessStartHint">Zeit startet mit „Start“</span>') +
      '<span class="pill pill--neon" id="sessVol">' + u.fmt(vol) + ' kg Volumen</span>' +
      '<span class="pill pill--muted">' + sess.exercises.length + ' Übungen</span>' +
      (sess.reentry ? '<span class="pill pill--gold">Wiedereinstieg ' + Math.round(sess.reentry.factor * 100) + ' %</span>' : '') +
      '</div></div>' +
      '<div class="btn-row' + (sess.startedAt ? '' : ' btn-row--wide') + '">' +
      (sess.startedAt ? '' : '<button class="btn btn--primary btn--blink btn--wide" data-act="clock-start">' + u.icon('play', 16) + ' Start</button>') +
      '<button class="btn btn--danger" data-act="abort">Abbrechen</button>' +
      '</div>' +
      '</div>' +

      '<div class="row row--wrap" style="gap:12px;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--glass-br)">' +
      '<label class="switch" style="padding:0;flex:1;min-width:190px">' +
      '<input type="checkbox" id="restToggle"' + (sess.restEnabled ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label"><b>Pause zwischen Sätzen</b>' +
      '<span>Countdown in der Mitte nach jedem Satz</span></span>' +
      '</label>' +
      '<div class="input-suffix" style="max-width:120px">' +
      '<input class="input" type="number" id="restSecondsInput" min="15" max="500" step="5" ' +
      'value="' + sess.restSeconds + '"' + (sess.restEnabled ? '' : ' disabled') + '>' +
      '<span>s</span>' +
      '</div>' +
      '</div>' +
      '<label class="switch workout-rest-sound">' +
      '<input type="checkbox" id="restSoundToggle"' + (G.reminders.restSoundOn() ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label"><b>Ton am Ende der Pause</b>' +
      '<span>Signalton, wenn die Zeit abgelaufen ist</span></span>' +
      '</label>' +
      '</div>' +

      '<div id="restHost"></div>' +

      sess.exercises.map(block).join('') +

      '<button class="btn btn--block btn--add-ex" data-act="add-ex">' + u.icon('plus', 17) + ' Übung ergänzen</button>' +

      '<div class="card note-card' + (noteOpen ? ' is-open' : '') + '">' +
      '<button type="button" class="card__head note-card__toggle" data-act="note-toggle" aria-expanded="' + noteOpen + '">' +
      u.icon('exercises', 18) + '<h3>Notiz zur Einheit</h3><span class="spacer"></span>' +
      '<span class="note-card__hint" id="noteHint"' + (sess.notes && sess.notes.trim() ? '' : ' hidden') + '>Notiz vorhanden</span>' +
      '<span class="note-card__chev">' + u.icon('chevron', 18) + '</span></button>' +
      '<div class="note-card__body"' + (noteOpen ? '' : ' hidden') + '>' +
      '<textarea class="textarea" id="sessNotes" placeholder="Wie lief das Training? Was ist aufgefallen?">' +
      u.esc(sess.notes || '') + '</textarea></div>' +
      '</div>' +

      // "Abschließen" steht ganz unten und gibt es erst nach dem Start (vorher
      // nur versteckt, damit der automatische Start durch den ersten Haken es
      // einblenden kann).
      '<button class="btn btn--primary btn--finish" data-act="finish"' + (sess.startedAt ? '' : ' hidden') + '>' +
      u.icon('check', 17) + ' Abschließen</button>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     Übungsauswahl (freies Training / Übung ergänzen)
     ------------------------------------------------------------ */
  function pickerHtml(selected, activeMuscle, okLabel) {
    selected = selected || [];
    activeMuscle = activeMuscle || 'all';
    return '<div class="stack picker">' +
      '<label class="ex-search picker__search" aria-label="Übung suchen">' + u.icon('search', 18) +
      '<input class="input" id="pickSearch" type="search" placeholder="Übung suchen …" autocomplete="off"></label>' +
      '<div class="tabs picker__tabs" id="pickTabs">' +
      '<button class="tabs__b' + (activeMuscle === 'sel' ? ' is-on' : '') + '" data-m="sel">' + u.icon('check', 14) + ' Gewählt</button>' +
      '<button class="tabs__b' + (activeMuscle === 'all' ? ' is-on' : '') + '" data-m="all">Alle</button>' +
      G.MUSCLE_ORDER.map(function (m) {
        return '<button class="tabs__b' + (activeMuscle === m ? ' is-on' : '') + '" data-m="' + m + '">' + u.esc(G.MUSCLES[m].name) + '</button>';
      }).join('') + '</div>' +
      '<div class="list" id="pickList"></div>' +
      '<div class="btn-row picker__foot" style="position:sticky;bottom:0;padding-top:10px;background:linear-gradient(180deg,transparent,rgba(11,17,24,.9) 40%)">' +
      '<span class="pill pill--neon" id="pickCount">0 gewählt</span>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn--primary" data-act="pick-ok">' + u.esc(okLabel || 'Übernehmen') + '</button>' +
      '</div></div>';
  }

  function pickNorm(t) {
    return String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  }

  function renderPickList(host, muscle, selected, q) {
    var list = muscle === 'sel'
      ? selected.map(function (id) { return G.ex.byId(id); }).filter(Boolean)
      : muscle === 'all' ? G.EXERCISES : G.ex.byMuscle(muscle);
    var words = pickNorm(q).split(/\s+/).filter(Boolean);
    if (words.length) list = list.filter(function (ex) {
      var hay = pickNorm(ex.name + ' ' + ex.equip + ' ' + G.MUSCLES[ex.muscle].name);
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    if (!list.length) {
      host.innerHTML = '<p class="muted small" style="padding:14px 4px">' +
        (muscle === 'sel' ? 'Noch keine Übung gewählt. Tippe bei einer Übung auf ＋.' : 'Keine passende Übung gefunden.') + '</p>';
      return;
    }
    host.innerHTML = list.map(function (ex) {
      var on = selected.indexOf(ex.id) >= 0;
      return '<div class="list__row workout-picker__row" style="' +
        (on ? 'background:var(--neon-dim);border-radius:12px' : '') + '">' +
        '<div class="workout-picker__exercise-info" data-pick-info="' + ex.id + '" role="button" tabindex="0" aria-label="Übung ansehen: ' + u.esc(ex.name) + '">' +
        '<div class="list__ic list__ic--map workout-picker__exercise-thumb">' +
        G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</div>' +
        '<div class="list__main"><b>' + u.esc(ex.name) + '</b><span>' +
        u.esc(G.MUSCLES[ex.muscle].name + ' · ' + ex.equip) + '</span></div>' +
        '</div>' +
        '<button type="button" class="icon-btn workout-picker__exercise-toggle' + (on ? ' is-on' : '') + '" data-pick="' + ex.id + '" aria-label="' + (on ? 'Übung abwählen' : 'Übung auswählen') + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        u.icon(on ? 'check' : 'plus', 18) + '</button>' +
        '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------
     Pausen-Dialog vor jedem Trainingsstart (20.10.2026):
     Pause an/aus, Dauer, Ton am Ende an/aus und Klang. Die Wahl
     wird als neuer Standard gespeichert und gilt für die Einheit.
     ------------------------------------------------------------ */
  var REST_CHIPS = [30, 60, 90, 120, 180];
  function restDialog(title, onGo) {
    var s = G.store.state;
    var on = s.settings.restTimer !== false;
    var sec = u.clamp(s.settings.restSeconds || 90, 15, 500);
    var snd = s.settings.restSound !== false;
    var kind = s.settings.alarmSound || 'signal';
    function mmss(v) { return Math.floor(v / 60) + ':' + ('0' + (v % 60)).slice(-2); }
    var body =
      '<div class="rest-dlg">' +
      '<div class="rest-dlg__title">' + u.icon('dumbbell', 16) + '<span>' + u.esc(title) + '</span></div>' +

      /* 1 — Pause */
      '<section class="rest-dlg__sec rest-dlg__sec--pause">' +
      '<div class="rest-dlg__head"><span class="rest-dlg__num">1</span>' +
      '<div class="rest-dlg__htxt"><b>Pause zwischen Sätzen</b><span>Startet nach jedem abgehakten Satz.</span></div>' +
      '<label class="switch rest-dlg__toggle"><input type="checkbox" id="rdOn"' + (on ? ' checked' : '') + '><span class="switch__track"></span></label></div>' +
      '<div class="rest-dlg__time"' + (on ? '' : ' hidden') + ' id="rdTime">' +
      '<div class="rest-dlg__dial">' +
      '<button type="button" class="rest-dlg__step rest-dlg__step--minus" data-rs-step="-15" aria-label="15 Sekunden weniger">−15 s</button>' +
      '<div class="rest-dlg__big"><b id="rdVal">' + mmss(sec) + '</b><span>Minuten</span></div>' +
      '<button type="button" class="rest-dlg__step rest-dlg__step--plus" data-rs-step="15" aria-label="15 Sekunden mehr">+15 s</button>' +
      '</div>' +
      '<div class="rest-dlg__chips">' + REST_CHIPS.map(function (v) {
        return '<button type="button" class="rest-dlg__chip' + (v === sec ? ' is-on' : '') + '" data-rs="' + v + '">' + mmss(v) + '</button>';
      }).join('') + '</div>' +
      '</div></section>' +

      /* 2 — Ton */
      '<section class="rest-dlg__sec rest-dlg__sec--sound">' +
      '<div class="rest-dlg__head"><span class="rest-dlg__num">2</span>' +
      '<div class="rest-dlg__htxt"><b>Ton am Ende der Pause</b><span>Signal, wenn die Pause vorbei ist.</span></div>' +
      '<label class="switch rest-dlg__toggle"><input type="checkbox" id="rdSnd"' + (snd ? ' checked' : '') + '><span class="switch__track"></span></label></div>' +
      '<div class="rest-dlg__sound"' + (snd ? '' : ' hidden') + ' id="rdSound">' +
      '<select class="select" id="rdKind">' +
      '<option value="signal"' + (kind === 'signal' ? ' selected' : '') + '>Signal</option>' +
      '<option value="pulse"' + (kind === 'pulse' ? ' selected' : '') + '>Puls</option>' +
      '<option value="chime"' + (kind === 'chime' ? ' selected' : '') + '>Glockenspiel</option>' +
      '</select><button type="button" class="btn rest-dlg__test" data-act="rd-test">' + u.icon('play', 14) + ' Anhören</button></div>' +
      '</section>' +

      '<button type="button" class="btn btn--primary btn--lg btn--block rest-dlg__go" data-act="rd-go">' + u.icon('play', 18) + ' Los geht’s</button>' +
      '<button type="button" class="rest-dlg__cancel" data-act="rd-cancel">Abbrechen</button>' +
      '</div>';

    u.openSheet('Pause einstellen', body, function (root) {
      var val = root.querySelector('#rdVal');
      function setSec(v) {
        sec = u.clamp(v, 15, 500);
        val.textContent = mmss(sec);
        val.classList.remove('is-bump'); void val.offsetWidth; val.classList.add('is-bump');
        root.querySelectorAll('[data-rs]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-rs') === sec); });
      }
      root.querySelector('#rdOn').onchange = function (e) { on = e.target.checked; root.querySelector('#rdTime').hidden = !on; };
      root.querySelector('#rdSnd').onchange = function (e) { snd = e.target.checked; root.querySelector('#rdSound').hidden = !snd; };
      root.querySelectorAll('[data-rs]').forEach(function (b) { b.onclick = function () { setSec(+b.getAttribute('data-rs')); }; });
      root.querySelectorAll('[data-rs-step]').forEach(function (b) { b.onclick = function () { setSec(sec + (+b.getAttribute('data-rs-step'))); }; });
      root.querySelector('#rdKind').onchange = function (e) { kind = e.target.value; s.settings.alarmSound = kind; G.reminders.playAlarm(true); };
      root.querySelector('[data-act="rd-test"]').onclick = function () { s.settings.alarmSound = kind; G.reminders.playAlarm(true); };
      root.querySelector('[data-act="rd-cancel"]').onclick = function () { u.closeSheet(); };
      root.querySelector('[data-act="rd-go"]').onclick = function () {
        s.settings.restTimer = on;
        s.settings.restSeconds = sec;
        s.settings.restSound = snd;
        s.settings.alarmSound = kind;
        G.store.commit('settings');
        if (snd) G.reminders.prepareAlarm(true);
        u.closeSheet();
        onGo();
      };
    });
  }

  /** Freies Training in zwei Tipps: Muskelgruppe wählen → Einheit läuft.
      „Selbst auswählen“ öffnet wie bisher die volle Übungsliste. */
  function startCustom(preselect, prefilter, title) {
    openPicker(function (ids) {
      restDialog((title || 'Freies Training') + ' · ' + ids.length + ' Übungen', function () {
        G.store.state.session = G.planner.buildCustomSession(ids, title);
        G.store.commit('session-start');
        u.toast('Los geht’s', (title || 'Freies Training') + ' · ' + ids.length + ' Übungen', 'ok');
        G.app.go('workout');
      });
    }, preselect, prefilter, { title: title || 'Freies Training', okLabel: 'Weiter' });
  }

  function openQuickFree() {
    var s = G.store.state;
    var m = G.journey.mode(s.profile.mode);
    var perEx = (m.sets || 3) * (40 + (s.settings.restSeconds || m.restSec || 90)) / 60;
    var tiles = G.planner.QUICK.map(function (q) {
      var ids = G.planner.quickPick(q.key);
      if (!ids.length) return '';
      var groups = Object.keys(q.take);
      var color = q.key === 'full' ? 'linear-gradient(90deg,var(--neon),var(--cyan))' : G.MUSCLES[groups[0]].color;
      var sub = q.key === 'full' ? 'je 1 Übung aus ' + groups.length + ' Gruppen' : ids.length + ' Übungen';
      return '<button class="quick-tile' + (q.key === 'full' ? ' quick-tile--wide' : '') + '" type="button" data-quick="' + q.key + '">' +
        '<b><i style="background:' + color + '"></i>' + u.esc(q.name) + '</b>' +
        '<span>' + u.esc(sub) + ' · ca. ' + Math.max(10, Math.round(ids.length * perEx / 5) * 5) + ' min</span></button>';
    }).join('');
    u.openSheet('Freies Training',
      '<button class="quick-own" type="button" data-quick="custom">' + u.icon('exercises', 22) +
      '<span><b>Übungen selbst auswählen</b><span>Aus allen ' + G.EXERCISES.length + ' Übungen frei zusammenstellen</span></span>' +
      u.icon('chevron', 18) + '</button>' +
      '<p class="muted small quick-lead">Oder eine Muskelgruppe – der Coach schlägt Übungen vor, du kannst sie vor dem Start ändern.</p>' +
      '<div class="quick-grid">' + tiles + '</div>',
      function (body) {
        body.addEventListener('click', function (e) {
          var t = e.target.closest('[data-quick]');
          if (!t) return;
          var key = t.getAttribute('data-quick');
          u.closeSheet();
          if (key === 'custom') { setTimeout(function () { startCustom([], 'all'); }, 60); return; }
          // Vorschlag des Coaches vorausgewählt, Liste auf die Gruppe gefiltert —
          // hinzufügen, abwählen, dann „Training starten“
          var q = G.planner.QUICK.filter(function (x) { return x.key === key; })[0];
          var groups = Object.keys(q.take);
          setTimeout(function () {
            startCustom(G.planner.quickPick(key), groups.length === 1 ? groups[0] : 'sel', 'Freies Training · ' + q.name);
          }, 60);
        });
      });
  }

  function openPicker(onDone, preselect, prefilter, opts) {
    opts = opts || {};
    var selected = (preselect || []).slice();
    var initialMuscle = prefilter || 'all';
    u.openSheet(opts.title || 'Übungen wählen', pickerHtml(selected, initialMuscle, opts.okLabel), function (body) {
      var list = body.querySelector('#pickList');
      var count = body.querySelector('#pickCount');
      var search = body.querySelector('#pickSearch');
      var cur = initialMuscle;

      function refresh() {
        renderPickList(list, cur, selected, search ? search.value : '');
        count.textContent = selected.length + ' gewählt';
        if (G.i18n) G.i18n.apply(body);
      }
      refresh();
      if (search) search.addEventListener('input', u.debounce(refresh, 150));

      u.on(body, 'click', '[data-pick-info]', function (e, t) {
        e.preventDefault();
        var id = t.getAttribute('data-pick-info');
        if (G.views.exercises && G.views.exercises.openDetail) {
          G.views.exercises.openDetail(id, function () { openPicker(onDone, selected, cur, opts); });
        }
      });

      u.on(body, 'keydown', '[data-pick-info]', function (e, t) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        var id = t.getAttribute('data-pick-info');
        if (G.views.exercises && G.views.exercises.openDetail) {
          G.views.exercises.openDetail(id, function () { openPicker(onDone, selected, cur, opts); });
        }
      });

      u.on(body, 'click', '[data-m]', function (e, t) {
        body.querySelectorAll('#pickTabs .tabs__b').forEach(function (b) { b.classList.remove('is-on'); });
        t.classList.add('is-on');
        cur = t.getAttribute('data-m');
        refresh();
      });

      u.on(body, 'click', '[data-pick]', function (e, t) {
        var id = t.getAttribute('data-pick');
        var i = selected.indexOf(id);
        if (i >= 0) selected.splice(i, 1); else selected.push(id);
        refresh();
      });

      body.querySelector('[data-act="pick-ok"]').onclick = function () {
        if (!selected.length) { u.toast('Keine Auswahl', 'Wähle mindestens eine Übung.', 'warn'); return; }
        u.closeSheet();
        onDone(selected);
      };
    });
  }

  /* ------------------------------------------------------------
     Abschluss-Zusammenfassung
     ------------------------------------------------------------ */
  function showSummary(res, sess) {
    var lines = [
      '<div class="stack">',
      '<div class="card card--hero card--hl" style="text-align:center">',
      (G.avatar.has()
        ? '<div style="display:grid;place-items:center;margin-bottom:6px">' +
        G.avatar.render(74, { level: res.level.after, hero: true }) + '</div>'
        : '<div style="font-size:44px;line-height:1">' + (res.records ? '🏆' : '✅') + '</div>'),
      // Hinweis auf den Avatar nur einmal, solange keiner gesetzt ist
      (!G.avatar.has() && G.store.state.journey.completed <= 3
        ? '<p class="tiny dim" style="margin-top:6px">Tipp: Im Profil kannst du ein eigenes Bild als Trainings-Avatar hochladen.</p>'
        : ''),
      '<h2 class="big" style="margin:8px 0 4px">+' + res.xp + ' XP</h2>',
      '<p class="muted small">' + u.esc(sess.title) + ' abgeschlossen</p>',
      (res.duration ? '<p class="sum-time">' + u.icon('clock', 16) + '<span>Trainingszeit</span> <b>' +
        u.fmtDuration(res.duration) + '</b></p>' : ''),
      '</div>',
      '<div class="grid grid--4" style="--sp:10px">',
      stat('Sätze', res.totalSets),
      stat('Wiederholungen', res.totalReps),
      stat('Volumen', u.fmt(res.volume) + ' kg'),
      stat('Rekorde', res.records),
      '</div>'
    ];

    if (res.level.leveled) {
      var r = G.journey.regionForLevel(res.level.after);
      lines.push('<div class="note note--neon">' + u.icon('arrowUp', 18) +
        '<div><b>Level ' + res.level.after + ' erreicht</b><br>' +
        'Titel: ' + u.esc(G.journey.titleFor(res.level.after)) + ' · Region ' + r.icon + ' ' + u.esc(r.name) + '</div></div>');
    }

    if (!G.store.hasConsent('history')) {
      lines.push('<div class="note note--warn">' + u.icon('warn', 18) +
        '<div>Die Einwilligung <b>Trainingshistorie</b> ist nicht erteilt. ' +
        'Diese Einheit wird deshalb nicht gespeichert und erscheint nicht im Fortschritt.</div></div>');
    }

    lines.push('<button class="btn btn--primary btn--block" data-act="sum-close">Fertig</button>');
    lines.push('</div>');

    u.openSheet('Einheit abgeschlossen', lines.join(''), function (body) {
      body.querySelector('[data-act="sum-close"]').onclick = function () {
        u.closeSheet(); G.app.go('dashboard');
      };
    });

    if (res.level.leveled) u.levelUpFx(res.level.after, G.journey.titleFor(res.level.after));
  }

  function stat(k, v) {
    return '<div class="card card--pad-sm"><div class="stat stat--neon">' +
      '<span class="stat__k">' + u.esc(k) + '</span>' +
      '<span class="stat__v">' + u.esc(String(v)) + '</span></div></div>';
  }

  /* ------------------------------------------------------------
     View
     ------------------------------------------------------------ */
  /* Reiter „Training“ (Start, Wochenplan) und „Übungen“ (Bibliothek).
     Die Reiter sind nur sichtbar, solange keine Einheit läuft. */
  var wtab = 'plan';
  function subTabs() {
    return '<div class="tabs progress-tabs progress-tabs--2 workout-tabs" role="tablist">' +
      [['plan', 'Training'], ['uebungen', 'Übungen']].map(function (t) {
        return '<button class="tabs__b progress-tabs__button' + (wtab === t[0] ? ' is-on' : '') + '" data-wt="' + t[0] + '" role="tab" aria-selected="' + (wtab === t[0]) + '">' + t[1] + '</button>';
      }).join('') + '</div>';
  }

  G.views.workout = {
    title: 'Training',
    sub: function () {
      var s = G.store.state;
      return s.session ? 'Einheit läuft · ' + s.session.title : (wtab === 'uebungen' ? 'Übungen mit Ausführung und Muskelkarte' : 'Plan und freies Training');
    },
    setTab: function (t) { wtab = t === 'uebungen' ? 'uebungen' : 'plan'; },
    render: function (params) {
      var s = G.store.state;
      if (s.session) return activeSession(s.session);
      if (params && params.free) {
        wtab = 'plan';
        setTimeout(openQuickFree, 60);
      }
      return '<div class="view stack workout-tabs-view">' + subTabs() +
        (wtab === 'uebungen' ? G.views.exercises.render(params) : planPreview()) + '</div>';
    },
    // Der Pausentimer gehört zur laufenden Einheit und läuft auch weiter,
    // wenn innerhalb von G04Fit eine andere Ansicht geöffnet wird.
    unmount: function () {},
    mount: function (host) {
      var s = G.store.state;

      // Alte Handler eines früheren mount() zuerst abmelden (siehe Hinweis
      // bei mountAbort oben) — nur die DOM-Handler, nicht den Pausentimer.
      if (mountAbort) mountAbort.abort();
      mountAbort = new AbortController();
      var signal = mountAbort.signal;

      showRestBox();

      if (!s.session) {
        u.on(host, 'click', '[data-wt]', function (e, t) {
          wtab = t.getAttribute('data-wt');
          G.app.rerender();
        }, signal);
        if (wtab === 'uebungen') {
          if (G.views.exercises.mount) G.views.exercises.mount(host);
          return;
        }
      }

      /* --- Start --- */
      u.on(host, 'click', '[data-act="start-plan"]', function () {
        var plan = G.planner.todayPlan() || G.planner.nextPlan();
        if (!plan) return;
        restDialog(plan.name, function () {
          s.session = G.planner.buildSession(plan, { day: u.today() });
          G.store.commit('session-start');
          u.toast('Los geht’s', plan.name + ' gestartet.', 'ok');
          G.app.rerender();
        });
      }, signal);

      u.on(host, 'click', '[data-act="open-free"]', function () {
        openQuickFree();
      }, signal);

      u.on(host, 'click', '[data-ex]', function (e, t) {
        if (t.getAttribute('data-act') === 'info' || t.hasAttribute('data-ex')) {
          var id = t.getAttribute('data-ex');
          if (G.views.exercises && G.views.exercises.openDetail) G.views.exercises.openDetail(id);
        }
      }, signal);

      u.on(host, 'click', '[data-act="repeat-last"]', function () {
        var prev = G.planner.lastFinished();
        if (!prev) return;
        restDialog(prev.title, function () {
          s.session = G.planner.buildRepeatSession(prev);
          G.store.commit('session-start');
          u.toast('Los geht’s', prev.title + ' wird wiederholt.', 'ok');
          G.app.rerender();
        });
      }, signal);

      if (!s.session) { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } return; }
      startClock();
      updateFinishCue(host, false);

      u.on(host, 'change', '#restSoundToggle', function (e, t) {
        s.settings.restSound = t.checked;
        G.store.save();
        if (t.checked) G.reminders.playAlarm(true);
      }, signal);

      /* --- Zeit starten (freies Training) --- */
      u.on(host, 'click', '[data-act="clock-start"]', function () {
        if (!s.session || s.session.startedAt) return;
        s.session.startedAt = new Date().toISOString();
        s.session.stoppedAt = null;
        G.store.commit('session-clock-start');
        G.app.rerender();
      }, signal);

      /* --- Satzpause: an/aus + Sekunden --- */
      u.on(host, 'change', '#restToggle', function (e, t) {
        s.session.restEnabled = t.checked;
        var secInput = host.querySelector('#restSecondsInput');
        if (secInput) secInput.disabled = !t.checked;
        if (!t.checked) stopRest();
        refreshAllRepsTotals(host);
        G.store.save();
      }, signal);

      u.on(host, 'change', '#restSecondsInput', function (e, t) {
        var v = u.clamp(u.num(t.value, s.session.restSeconds), 15, 500);
        t.value = v;
        s.session.restSeconds = v;
        refreshAllRepsTotals(host);
        G.store.save();
      }, signal);

      /* --- Werte ändern --- */
      u.on(host, 'input', '.set-row input', function (e, t) {
        var row = t.closest('.set-row');
        var bi = +row.getAttribute('data-b'), si = +row.getAttribute('data-s');
        var f = t.getAttribute('data-f');
        s.session.exercises[bi].sets[si][f] = u.clamp(u.num(t.value, 0), 0, 1000);
        refreshHero();
        if (f === 'reps') refreshRepsTotal(host, bi);
        saveSoon();
      }, signal);

      /* --- Satz abhaken --- */
      u.on(host, 'click', '[data-act="toggle"]', function (e, t) {
        var row = t.closest('.set-row');
        var bi = +row.getAttribute('data-b'), si = +row.getAttribute('data-s');
        var set = s.session.exercises[bi].sets[si];
        var blockEl = host.querySelector('[data-block="' + bi + '"]');
        var wasComplete = s.session.exercises[bi].sets.every(function (x) { return x.done; });
        set.done = !set.done;
        // Entfernen-Knopf nur, solange in dieser Übung kein Satz abgehakt ist
        if (blockEl) blockEl.classList.toggle('has-done', s.session.exercises[bi].sets.some(function (x) { return x.done; }));
        row.classList.toggle('is-done', set.done);

        // Wer den ersten Satz abhakt, ohne Start gedrückt zu haben, startet
        // die Zeit damit automatisch (sonst gäbe es keine Trainingszeit).
        var autoStarted = set.done && !s.session.startedAt;
        if (autoStarted) s.session.startedAt = new Date().toISOString();
        syncClock(s.session);
        if (autoStarted) {
          var startBtn = host.querySelector('[data-act="clock-start"]');
          if (startBtn) {
            startBtn.closest('.btn-row').classList.remove('btn-row--wide');
            startBtn.remove();
          }
          var startHint = host.querySelector('#sessStartHint');
          if (startHint) startHint.remove();
          var fin = host.querySelector('[data-act="finish"]');
          if (fin) fin.hidden = false;
          startClock();
        }

        var head = host.querySelector('[data-block="' + bi + '"] .pill');
        if (head) {
          var b = s.session.exercises[bi];
          var d = b.sets.filter(function (x) { return x.done; }).length;
          head.textContent = d + '/' + b.sets.length;
          head.className = 'pill ' + (d === b.sets.length ? 'pill--neon' : 'pill--muted');
        }
        refreshRepsTotal(host, bi);

        if (set.done) {
          var r = t.getBoundingClientRect();
          u.xpPop(Math.round(7 * G.journey.mode(s.profile.mode).xpMult), r.left, r.top);
          // Nach dem allerletzten Satz keine Pause mehr — es geht zu "Abschließen".
          if (allSetsDone(s.session)) stopRest();
          else startRest(s.session.restSeconds, s.session.exercises[bi].exId);
          if (!wasComplete && s.session.exercises[bi].sets.every(function (x) { return x.done; })) {
            setTimeout(function () { focusNextBlock(host, bi); }, 350);
          }
        } else {
          stopRest();
        }
        refreshHero();
        updateFinishCue(host, set.done);
        G.store.save();
      }, signal);

      /* --- Satz ergänzen --- */
      u.on(host, 'click', '[data-act="add-set"]', function (e, t) {
        var bi = +t.getAttribute('data-b');
        var b = s.session.exercises[bi];
        var last = b.sets[b.sets.length - 1];
        b.sets.push({
          weight: last ? last.weight : 0,
          reps: last ? last.reps : 10,
          targetReps: last ? last.targetReps : [8, 12],
          done: false, rpe: null
        });
        syncClock(s.session);
        G.store.commit('set-added');
        G.app.rerender();
      }, signal);

      /* --- Anstrengung markieren --- */
      u.on(host, 'click', '[data-act="rpe"]', function (e, t) {
        var bi = +t.getAttribute('data-b'), v = t.getAttribute('data-v');
        s.session.exercises[bi].sets.forEach(function (x) { if (x.done) x.rpe = v; });
        G.store.save();
        u.toast('Notiert', v === 'easy'
          ? 'Der Coach erhöht beim nächsten Mal stärker.'
          : 'Der Coach geht beim nächsten Mal vorsichtiger vor.', 'ok', 2600);
      }, signal);

      /* --- Übung ergänzen --- */
      /* --- Übung entfernen (nur ohne abgehakten Satz) --- */
      u.on(host, 'click', '[data-act="del-ex"]', async function (e, t) {
        e.stopPropagation();
        var bi = +t.getAttribute('data-b');
        var b = s.session.exercises[bi];
        if (!b || b.sets.some(function (x) { return x.done; }) || s.session.exercises.length < 2) return;
        var ex = G.ex.byId(b.exId);
        var ok = await u.confirmSheet({
          title: 'Übung entfernen',
          body: '„' + u.esc(ex ? ex.name : '') + '“ wird aus dieser Einheit entfernt.',
          ok: 'Entfernen'
        });
        if (!ok || !s.session) return;
        s.session.exercises.splice(bi, 1);
        G.store.commit('ex-removed');
        u.toast('Entfernt', (ex ? ex.name : 'Übung') + ' ist nicht mehr in dieser Einheit.', 'ok', 2400);
        G.app.rerender();
      }, signal);

      u.on(host, 'click', '[data-act="add-ex"]', function () {
        openPicker(function (ids) {
          var add = G.planner.buildCustomSession(ids).exercises;
          s.session.exercises = s.session.exercises.concat(add);
          syncClock(s.session);
          G.store.commit('ex-added');
          G.app.rerender();
        });
      }, signal);

      /* --- Notiz ein-/ausklappen --- */
      u.on(host, 'click', '[data-act="note-toggle"]', function (e, t) {
        var card = t.closest('.note-card');
        var open = !noteIsOpen(s.session);
        noteState.open = open;
        card.classList.toggle('is-open', open);
        t.setAttribute('aria-expanded', open);
        card.querySelector('.note-card__body').hidden = !open;
        card.querySelector('#noteHint').hidden = !(s.session.notes && s.session.notes.trim());
        if (open) card.querySelector('#sessNotes').focus();
      }, signal);

      /* --- Notizen --- */
      var notes = host.querySelector('#sessNotes');
      if (notes) notes.addEventListener('input', u.debounce(function () {
        s.session.notes = notes.value;
        G.store.save();
      }, 400), { signal: signal });

      /* --- Abbrechen --- */
      u.on(host, 'click', '[data-act="abort"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Einheit abbrechen',
          body: 'Die laufende Einheit wird verworfen. Bereits abgehakte Sätze gehen verloren.',
          ok: 'Verwerfen'
        });
        if (!ok) return;
        stopRest();
        if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
        s.session = null;
        G.store.commit('session-abort');
        G.app.rerender();
      }, signal);

      /* --- Abschließen --- */
      u.on(host, 'click', '[data-act="finish"]', async function () {
        var sess = s.session;
        if (!sess) return;
        var done = u.sum(sess.exercises, function (b) { return b.sets.filter(function (x) { return x.done; }).length; });
        if (!done) {
          u.toast('Keine Sätze erledigt', 'Hake mindestens einen Satz ab.', 'warn');
          return;
        }
        var open = u.sum(sess.exercises, function (b) { return b.sets.filter(function (x) { return !x.done; }).length; });
        if (open) {
          var ok = await u.confirmSheet({
            title: 'Einheit abschließen',
            body: 'Es sind noch <b>' + open + '</b> Sätze offen. Nicht abgehakte Sätze werden nicht gewertet.',
            ok: 'Trotzdem abschließen', danger: false
          });
          if (!ok || s.session !== sess) return;
        }
        stopRest();
        if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
        var res = G.planner.finishSession(sess);
        showSummary(res, sess);
      }, signal);
    },
    openPicker: openPicker,
    restDialog: restDialog,
    openQuickFree: openQuickFree
  };
})(G04Fit);
