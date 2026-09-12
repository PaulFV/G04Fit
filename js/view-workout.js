/* ============================================================
   G04Fit — Workout (laufende Einheit)
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var rest = { left: 0, timer: null, exId: null, endAt: 0, finished: false };

  // mount() wird bei jedem Rerender der laufenden Einheit erneut aufgerufen
  // (Tab verlassen & zurück, "+ Satz", "Übung ergänzen" …). unmount() bleibt
  // absichtlich leer, damit der Pausentimer weiterläuft — deshalb müssen die
  // Klick-/Input-Handler selbst aufräumen, sonst hängen nach jedem Remount
  // zusätzliche Handler am immer gleichen #viewHost und jeder Klick (z. B.
  // "Satz abhaken") feuert mehrfach, wodurch sich Häkchen wieder aufheben.
  var mountAbort = null;

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
    G.reminders.prepareAlarm();

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

    var head = '<div class="card card--hero">' +
      '<p class="muted small">' + (isToday ? 'Heute im Plan' : 'Nächste geplante Einheit') + '</p>' +
      '<h2 class="big" style="margin:4px 0 6px">' + u.esc(show ? show.name : 'Freies Training') + '</h2>' +
      '<p class="muted small">' + (show
        ? u.dayName(show.day, true) + ', ' + u.fmtDateShort(show.day) + ' · ' +
        show.muscles.map(function (m) { return G.MUSCLES[m].name; }).join(', ')
        : 'Wähle die Übungen selbst aus.') + '</p>' +
      '<div class="btn-row btn-row--even" style="margin-top:18px">' +
      (show ? '<button class="btn btn--primary btn--lg" data-act="start-plan">' + u.icon('play', 16) + ' Einheit starten</button>' : '') +
      '<button class="btn btn--lg" data-act="open-free">' + u.icon('plus', 16) + ' Freies Training</button>' +
      '</div>' +

      '<div class="row row--wrap" style="gap:12px;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--glass-br)">' +
      '<label class="switch" style="padding:0;flex:1;min-width:190px">' +
      '<input type="checkbox" id="restEnablePreset"' + (s.settings.restTimer !== false ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label"><b>Pause zwischen Sätzen</b>' +
      '<span>Gilt für die nächste gestartete Einheit</span></span>' +
      '</label>' +
      '<div class="input-suffix" style="max-width:120px">' +
      '<input class="input" type="number" id="restSecondsPreset" min="15" max="500" step="5" ' +
      'value="' + (s.settings.restSeconds || 90) + '"' + (s.settings.restTimer === false ? ' disabled' : '') + '>' +
      '<span>s</span>' +
      '</div></div>' +
      '</div>';

    var list = '';
    if (show) {
      list = '<div class="card"><div class="card__head">' + u.icon('exercises', 18) +
        '<h3>Vorgesehene Übungen</h3><span class="spacer"></span>' +
        '<span class="tiny dim">Vorschläge des Coaches</span></div><div class="list">' +
        show.exercises.map(function (id, i) {
          var ex = G.ex.byId(id);
          if (!ex) return '';
          var sug = G.coach.suggestNext(id);
          return '<div class="list__row list__row--click" data-ex="' + id + '">' +
            '<div class="list__ic list__ic--map">' +
            G.anim.muscleMap(ex.muscle, ex.sec, { view: 'auto' }) + '</div>' +
            '<div class="list__main"><b>' + u.esc(ex.name) + '</b>' +
            '<span>' + u.esc(G.MUSCLES[ex.muscle].name) +
            (ex.sec.length ? ' + ' + u.esc(ex.sec.map(function (m) { return G.MUSCLES[m].name; }).join(', ')) : '') +
            ' · ' + sug.sets + ' Sätze</span></div>' +
            '<div class="list__end"><b class="mono small' + (sug.kind === 'up' ? ' neon' : '') + '">' +
            (ex.time ? u.fmtReps(sug.reps, 's') : u.fmtSetWeight(ex, sug.weight)) + '</b>' +
            '<br><span class="tiny dim">' + (ex.time ? 'Haltezeit' : u.fmtReps(sug.reps, 'Wdh.')) + '</span></div>' +
            '</div>';
        }).join('') + '</div></div>';
    }

    var week = '<div class="card"><div class="card__head">' + u.icon('dashboard', 18) +
      '<h3>Wochenplan</h3><span class="spacer"></span><span class="tiny dim">' +
      G.planner.weekPlan().length + ' Einheiten</span></div><div class="list">' +
      G.planner.weekPlan().map(function (p) {
        var done = s.history.some(function (h) { return h.day === p.day; });
        var past = p.day < u.today();
        return '<div class="list__row">' +
          '<div class="list__ic" style="' + (done ? 'border-color:var(--neon-line);color:var(--neon)' : '') + '">' +
          u.icon(done ? 'check' : 'dumbbell', 17) + '</div>' +
          '<div class="list__main"><b>' + u.esc(p.name) + '</b><span>' +
          u.esc(u.dayName(p.day, true) + ', ' + u.fmtDateShort(p.day)) + '</span></div>' +
          '<div class="list__end"><span class="pill ' + (done ? 'pill--neon' : past ? 'pill--danger' : 'pill--muted') + '">' +
          (done ? 'erledigt' : past ? 'verpasst' : 'offen') + '</span></div>' +
          '</div>';
      }).join('') + '</div>' +
      '<button class="btn btn--sm btn--block" style="margin-top:12px" data-go="profile">Trainingstage ändern</button>' +
      '</div>';

    return '<div class="view stack">' + head +
      '<div class="grid grid--2">' + list + week + '</div></div>';
  }

  /* ------------------------------------------------------------
     Laufende Einheit
     ------------------------------------------------------------ */
  function setRow(bi, si, set, ex) {
    return '<div class="set-row' + (set.done ? ' is-done' : '') + '" data-b="' + bi + '" data-s="' + si + '">' +
      '<span class="set-row__n">' + (si + 1) + '</span>' +
      (ex.time
        ? '<span class="small dim center">Halten</span>'
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

    return '<div class="card" data-block="' + bi + '">' +
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
      '</div>' +

      (b.hint ? '<div class="coach" style="margin-bottom:14px">' +
        '<div class="coach__av" style="width:32px;height:32px;border-radius:10px">' + u.icon('coach', 16) + '</div>' +
        '<div class="coach__msg small">' + u.esc(b.hint) + '</div></div>' : '') +

      '<div class="set-head"><span>#</span><span>' + (ex.time ? '' : 'Gewicht') + '</span><span>' +
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

  function activeSession(sess) {
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
      '<span class="pill pill--neon" id="sessVol">' + u.fmt(vol) + ' kg Volumen</span>' +
      '<span class="pill pill--muted">' + sess.exercises.length + ' Übungen</span>' +
      (sess.reentry ? '<span class="pill pill--gold">Wiedereinstieg ' + Math.round(sess.reentry.factor * 100) + ' %</span>' : '') +
      '</div></div>' +
      '<div class="btn-row">' +
      '<button class="btn btn--primary" data-act="finish">' + u.icon('check', 17) + ' Abschließen</button>' +
      '<button class="btn btn--ghost" data-act="abort">Abbrechen</button>' +
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
      '</div>' +

      '<div id="restHost"></div>' +

      sess.exercises.map(block).join('') +

      '<div class="card">' +
      '<div class="card__head">' + u.icon('exercises', 18) + '<h3>Notiz zur Einheit</h3></div>' +
      '<textarea class="textarea" id="sessNotes" placeholder="Wie lief das Training? Was ist aufgefallen?">' +
      u.esc(sess.notes || '') + '</textarea>' +
      '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn btn--sm" data-act="add-ex">' + u.icon('plus', 15) + ' Übung ergänzen</button>' +
      '</div></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     Übungsauswahl (freies Training / Übung ergänzen)
     ------------------------------------------------------------ */
  function pickerHtml(selected) {
    selected = selected || [];
    return '<div class="stack">' +
      '<div class="tabs" id="pickTabs">' +
      '<button class="tabs__b is-on" data-m="all">Alle</button>' +
      G.MUSCLE_ORDER.map(function (m) {
        return '<button class="tabs__b" data-m="' + m + '">' + u.esc(G.MUSCLES[m].name) + '</button>';
      }).join('') + '</div>' +
      '<div class="list" id="pickList"></div>' +
      '<div class="btn-row" style="position:sticky;bottom:0;padding-top:10px;background:linear-gradient(180deg,transparent,rgba(11,17,24,.9) 40%)">' +
      '<span class="pill pill--neon" id="pickCount">0 gewählt</span>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn--primary" data-act="pick-ok">Übernehmen</button>' +
      '</div></div>';
  }

  function renderPickList(host, muscle, selected) {
    var list = muscle === 'all' ? G.EXERCISES : G.ex.byMuscle(muscle);
    host.innerHTML = list.map(function (ex) {
      var on = selected.indexOf(ex.id) >= 0;
      return '<div class="list__row list__row--click" data-pick="' + ex.id + '" style="' +
        (on ? 'background:var(--neon-dim);border-radius:12px' : '') + '">' +
        '<div class="list__ic"><i class="mdot m-' + ex.muscle + '"></i></div>' +
        '<div class="list__main"><b>' + u.esc(ex.name) + '</b><span>' +
        u.esc(G.MUSCLES[ex.muscle].name + ' · ' + ex.equip) + '</span></div>' +
        '<div class="list__end">' + (on ? '<span class="neon">' + u.icon('check', 18) + '</span>' : u.icon('plus', 16)) + '</div>' +
        '</div>';
    }).join('');
  }

  function openPicker(onDone, preselect) {
    var selected = (preselect || []).slice();
    u.openSheet('Übungen wählen', pickerHtml(selected), function (body) {
      var list = body.querySelector('#pickList');
      var count = body.querySelector('#pickCount');
      var cur = 'all';

      function refresh() {
        renderPickList(list, cur, selected);
        count.textContent = selected.length + ' gewählt';
      }
      refresh();

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

    if (G.obsidian.allowed()) {
      lines.push('<button class="btn btn--cyan btn--block" data-act="to-obsidian">' +
        u.icon('obsidian', 17) + ' Als Markdown für Obsidian</button>');
    }

    lines.push('<button class="btn btn--primary btn--block" data-act="sum-close">Fertig</button>');
    lines.push('</div>');

    u.openSheet('Einheit abgeschlossen', lines.join(''), function (body) {
      body.querySelector('[data-act="sum-close"]').onclick = function () {
        u.closeSheet(); G.app.go('dashboard');
      };
      var ob = body.querySelector('[data-act="to-obsidian"]');
      if (ob) ob.onclick = function () {
        u.closeSheet();
        G.app.go('obsidian', { session: sess });
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
  G.views.workout = {
    title: 'Workout',
    sub: function () {
      var s = G.store.state;
      return s.session ? 'Einheit läuft · ' + s.session.title : 'Plan und Übungsauswahl';
    },
    render: function (params) {
      var s = G.store.state;
      if (s.session) return activeSession(s.session);
      if (params && params.free) {
        setTimeout(function () {
          openPicker(function (ids) {
            s.session = G.planner.buildCustomSession(ids);
            G.store.commit('session-start');
            G.app.rerender();
          });
        }, 60);
      }
      return planPreview();
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

      /* --- Start --- */
      u.on(host, 'click', '[data-act="start-plan"]', function () {
        var plan = G.planner.todayPlan() || G.planner.nextPlan();
        if (!plan) return;
        s.session = G.planner.buildSession(plan, { day: u.today() });
        G.store.commit('session-start');
        u.toast('Los geht’s', plan.name + ' gestartet.', 'ok');
        G.app.rerender();
      }, signal);

      u.on(host, 'click', '[data-act="open-free"]', function () {
        openPicker(function (ids) {
          s.session = G.planner.buildCustomSession(ids);
          G.store.commit('session-start');
          G.app.rerender();
        });
      }, signal);

      /* --- Satzpause vor dem Start: an/aus + Sekunden ---
         Wirkt auf die globale Einstellung (s.settings), die buildSession()
         als Startwert für die nächste Einheit verwendet. */
      u.on(host, 'change', '#restEnablePreset', function (e, t) {
        s.settings.restTimer = t.checked;
        var secInput = host.querySelector('#restSecondsPreset');
        if (secInput) secInput.disabled = !t.checked;
        G.store.commit('settings');
      }, signal);

      u.on(host, 'change', '#restSecondsPreset', function (e, t) {
        var v = u.clamp(u.num(t.value, s.settings.restSeconds || 90), 15, 500);
        t.value = v;
        s.settings.restSeconds = v;
        G.store.commit('settings');
      }, signal);

      u.on(host, 'click', '[data-ex]', function (e, t) {
        if (t.getAttribute('data-act') === 'info' || t.hasAttribute('data-ex')) {
          var id = t.getAttribute('data-ex');
          if (G.views.exercises && G.views.exercises.openDetail) G.views.exercises.openDetail(id);
        }
      }, signal);

      if (!s.session) return;

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
        s.session.exercises[bi].sets[si][f] = u.num(t.value, 0);
        refreshHero();
        if (f === 'reps') refreshRepsTotal(host, bi);
        G.store.save();
      }, signal);

      /* --- Satz abhaken --- */
      u.on(host, 'click', '[data-act="toggle"]', function (e, t) {
        var row = t.closest('.set-row');
        var bi = +row.getAttribute('data-b'), si = +row.getAttribute('data-s');
        var set = s.session.exercises[bi].sets[si];
        set.done = !set.done;
        row.classList.toggle('is-done', set.done);

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
          startRest(s.session.restSeconds, s.session.exercises[bi].exId);
        } else {
          stopRest();
        }
        refreshHero();
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
      u.on(host, 'click', '[data-act="add-ex"]', function () {
        openPicker(function (ids) {
          var add = G.planner.buildCustomSession(ids).exercises;
          s.session.exercises = s.session.exercises.concat(add);
          G.store.commit('ex-added');
          G.app.rerender();
        });
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
        s.session = null;
        G.store.commit('session-abort');
        G.app.rerender();
      }, signal);

      /* --- Abschließen --- */
      u.on(host, 'click', '[data-act="finish"]', async function () {
        var sess = s.session;
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
          if (!ok) return;
        }
        stopRest();
        var res = G.planner.finishSession(sess);
        showSummary(res, sess);
      }, signal);
    },
    openPicker: openPicker
  };
})(G04Fit);
