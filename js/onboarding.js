/* ============================================================
   G04Fit — Ersteinrichtung
   Beginnt bewusst mit dem Datenschutz: erst die Einwilligungen,
   dann die persönlichen Angaben.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;

  var step = 0;
  var STEPS = ['willkommen', 'datenschutz', 'person', 'erfahrung', 'plan', 'fertig'];

  function progress() {
    return '<div class="ob-progress">' + STEPS.map(function (s, i) {
      return '<i class="' + (i <= step ? 'on' : '') + '"></i>';
    }).join('') + '</div>';
  }

  function nav(backLabel, nextLabel, nextAttr) {
    return '<div class="btn-row" style="margin-top:6px">' +
      (step > 0 ? '<button class="btn btn--ghost" data-ob="back">' + u.esc(backLabel || 'Zurück') + '</button>' : '') +
      '<span class="spacer"></span>' +
      '<button class="btn btn--primary btn--lg" data-ob="' + (nextAttr || 'next') + '">' +
      u.esc(nextLabel || 'Weiter') + '</button></div>';
  }

  /* ---------- Schritte ---------- */

  function sWillkommen() {
    return '<div class="ob-step">' + progress() +
      '<div>' +
      '<h2 class="big">Willkommen bei G04Fit</h2>' +
      '<p class="muted" style="margin-top:10px">Dein Trainingsplaner für Brust, Rücken, Bauch, ' +
      'Bizeps, Trizeps und Schulter — mit Wochenplan, Journey und einem Coach, der mit deinen ' +
      'echten Zahlen arbeitet.</p></div>' +

      '<div class="grid grid--2" style="--sp:10px">' +
      feature('journey', 'Journey', 'Level, Regionen und Modi von Easy bis Beast.') +
      feature('coach', 'G04Fit Coach', 'Vorschläge zu Gewicht, Wiederholungen und Progression.') +
      feature('exercises', 'Übungen', 'Ausführung, Muskelkarte und Technikhinweise.') +
      feature('privacy', 'Privacy First', 'Nichts wird gespeichert ohne deine Zustimmung.') +
      '</div>' +

      nav(null, 'Los geht’s') + '</div>';
  }

  function feature(ic, t, d) {
    return '<div class="card card--pad-sm">' +
      '<div class="row" style="margin-bottom:6px"><span class="neon">' + u.icon(ic, 18) + '</span>' +
      '<b style="font-size:14px">' + u.esc(t) + '</b></div>' +
      '<span class="tiny muted">' + u.esc(d) + '</span></div>';
  }

  function sDatenschutz() {
    var s = G.store.state;
    var items = [
      ['profile', 'Profil & Einstellungen speichern',
        'Ohne diese Zustimmung ist nach dem Schließen alles weg.', true],
      ['history', 'Trainingshistorie & Rekorde',
        'Grundlage für Fortschritt, Bestleistungen und Verlaufskurven.', true],
      ['ai', 'Auswertung durch den G04Fit Coach',
        'Rechnet ausschließlich auf diesem Gerät. Keine Übertragung an Dienste.', true],
      ['push', 'Erinnerungen',
        'Hinweise an deinen Trainingstagen und nach längeren Pausen.', false],
      ['obsidian', 'Obsidian-Export',
        'Markdown-Notizen für deinen Vault. Kann später aktiviert werden.', false]
    ];

    return '<div class="ob-step">' + progress() +
      '<div><h2 class="big">Zuerst: dein Datenschutz</h2>' +
      '<p class="muted" style="margin-top:10px">G04Fit speichert nichts ohne deine ausdrückliche ' +
      'Zustimmung. Alles bleibt auf diesem Gerät — kein Konto und kein Tracking. Nur aktivierte ' +
      'Benachrichtigungen benötigen die technische Push-Anmeldung. ' +
      'Jede Einwilligung ist einzeln und jederzeit widerrufbar.</p></div>' +

      '<div class="stack" style="--sp:2px">' +
      items.map(function (i) {
        var on = G.store.hasConsent(i[0]);
        return '<label class="switch">' +
          '<input type="checkbox" data-oc="' + i[0] + '"' + (on ? ' checked' : '') + '>' +
          '<span class="switch__track"></span>' +
          '<span class="switch__label"><b>' + u.esc(i[1]) +
          (i[3] ? ' <span class="pill pill--neon tiny" style="vertical-align:middle">empfohlen</span>' : '') +
          '</b><span>' + u.esc(i[2]) + '</span></span></label>';
      }).join('') + '</div>' +

      '<div class="note">' + u.icon('info', 17) +
      '<div>Du kannst G04Fit auch ganz ohne Einwilligung ausprobieren. Dann funktioniert alles, ' +
      'aber nichts bleibt nach dem Schließen erhalten. ' +
      '<a href="#" data-ob="policy">Datenschutzerklärung lesen</a></div></div>' +

      nav(null, 'Weiter') + '</div>';
  }

  function sPerson() {
    var p = G.store.state.profile;
    return '<div class="ob-step">' + progress() +
      '<div><h2 class="big">Ein paar Angaben</h2>' +
      '<p class="muted" style="margin-top:10px">Alles freiwillig. Größe und Gewicht helfen G04Fit ' +
      'nur dabei, sinnvolle Richtwerte für Startgewichte vorzuschlagen.</p></div>' +

      '<div class="row" style="gap:18px;align-items:center">' +
      G.avatar.render(76, { hero: true, action: true }) +
      '<div style="flex:1;min-width:0">' +
      '<div class="field"><label>Wie sollen wir dich nennen?</label>' +
      '<input class="input" id="obName" type="text" placeholder="Name oder Spitzname" value="' +
      u.esc(p.name) + '" autocomplete="off"></div>' +
      '<p class="tiny dim" style="margin-top:8px">' +
      (G.avatar.has()
        ? 'Bild antippen, um es zu ändern.'
        : 'Bild antippen, um ein eigenes Foto als Trainings-Avatar zu wählen — freiwillig.') +
      '</p></div></div>' +

      '<div class="grid grid--3" style="--sp:12px">' +
      '<div class="field"><label>Alter</label>' +
      '<div class="input-suffix"><input class="input" id="obAge" type="number" inputmode="numeric" ' +
      'min="12" max="110" value="' + (p.age || '') + '" placeholder="–"><span>J.</span></div></div>' +
      '<div class="field"><label>Größe</label>' +
      '<div class="input-suffix"><input class="input" id="obHeight" type="number" inputmode="numeric" ' +
      'min="100" max="250" value="' + (p.height || '') + '" placeholder="–"><span>cm</span></div></div>' +
      '<div class="field"><label>Gewicht</label>' +
      '<div class="input-suffix"><input class="input" id="obWeight" type="number" inputmode="decimal" ' +
      'step="0.5" min="30" max="300" value="' + (p.weight || '') + '" placeholder="–"><span>kg</span></div></div>' +
      '</div>' +

      nav(null, 'Weiter') + '</div>';
  }

  function sErfahrung() {
    var p = G.store.state.profile;
    var EXP = [
      ['beginner', 'Einsteiger', 'Weniger als ein Jahr regelmäßiges Training.'],
      ['intermediate', 'Fortgeschritten', 'Ein bis drei Jahre, die Grundübungen sitzen.'],
      ['advanced', 'Erfahren', 'Mehrjährige Erfahrung, hohe Lasten gewohnt.']
    ];

    return '<div class="ob-step">' + progress() +
      '<div><h2 class="big">Wie weit bist du?</h2>' +
      '<p class="muted" style="margin-top:10px">Wichtig: Wenn du bereits stark bist, startet G04Fit dich ' +
      'nicht künstlich leicht. Deine Stufe steuert die Richtwerte und die Übungsauswahl.</p></div>' +

      '<div class="stack" style="--sp:10px">' +
      EXP.map(function (e) {
        var on = p.experience === e[0];
        return '<button class="card card--pad-sm card--click' + (on ? ' card--hl' : '') + '" data-oexp="' + e[0] + '" ' +
          'style="text-align:left;display:block;width:100%">' +
          '<div class="row"><b style="font-size:15px' + (on ? ';color:var(--neon)' : '') + '">' + u.esc(e[1]) + '</b>' +
          '<span class="spacer"></span>' + (on ? '<span class="neon">' + u.icon('check', 18) + '</span>' : '') + '</div>' +
          '<span class="tiny muted">' + u.esc(e[2]) + '</span></button>';
      }).join('') + '</div>' +

      '<div class="field"><label>Schwierigkeitsmodus</label>' +
      '<div class="chips" style="margin-top:6px">' +
      G.MODES.map(function (m) {
        return '<button class="chip' + (p.mode === m.key ? ' is-on' : '') + '" data-omode="' + m.key + '">' +
          m.icon + ' ' + u.esc(m.name) + '</button>';
      }).join('') + '</div>' +
      '<span class="field__hint" style="margin-top:8px">' +
      u.esc(G.journey.mode(p.mode).desc) + ' — ' + G.journey.mode(p.mode).sets + ' Sätze, ' +
      G.journey.mode(p.mode).restSec + ' s Pause, ' + G.journey.mode(p.mode).weekly + ' Einheiten pro Woche.</span></div>' +

      nav(null, 'Weiter') + '</div>';
  }

  function sPlan() {
    var p = G.store.state.profile;
    var GOALS = [['muscle', 'Muskelaufbau'], ['strength', 'Maximalkraft'],
    ['definition', 'Definition'], ['health', 'Gesundheit & Haltung']];

    return '<div class="ob-step">' + progress() +
      '<div><h2 class="big">Dein Wochenplan</h2>' +
      '<p class="muted" style="margin-top:10px">Wähle deine Trainingstage. G04Fit setzt daraus den ' +
      'passenden Split zusammen.</p></div>' +

      '<div class="field"><label>Trainingstage</label>' +
      '<div class="chips chips--days" style="margin-top:6px">' +
      [1, 2, 3, 4, 5, 6, 0].map(function (d) {
        return '<button class="chip' + ((p.trainingDays || []).indexOf(d) >= 0 ? ' is-on' : '') +
          '" data-oday="' + d + '">' + u.DAYS[d] + '</button>';
      }).join('') + '</div></div>' +

      '<div class="card card--pad-sm">' +
      '<p class="tiny dim" style="margin-bottom:10px">Ergebnis</p>' +
      '<div class="stack" style="--sp:8px">' +
      G.planner.weekPlan().map(function (x) {
        return '<div class="row" style="gap:10px">' +
          '<span class="pill pill--neon nowrap" style="min-width:50px;justify-content:center">' +
          u.dayName(x.day) + '</span>' +
          '<span class="small" style="flex:1">' + u.esc(x.name) + '</span>' +
          '<span class="tiny dim nowrap">' + x.exercises.length + ' Üb.</span></div>';
      }).join('') + '</div></div>' +

      '<div class="field"><label>Ziele</label>' +
      '<div class="chips" style="margin-top:6px">' +
      GOALS.map(function (g) {
        return '<button class="chip' + ((p.goals || []).indexOf(g[0]) >= 0 ? ' is-on' : '') +
          '" data-ogoal="' + g[0] + '">' + u.esc(g[1]) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="field"><label>Erinnerung um</label>' +
      '<input class="input" id="obTime" type="time" value="' + u.esc(p.reminderTime || '18:00') + '"></div>' +

      nav(null, 'Weiter') + '</div>';
  }

  function sFertig() {
    var s = G.store.state;
    var plan = G.planner.weekPlan();
    var next = G.planner.nextPlan();
    var given = ['profile', 'history', 'ai', 'push', 'obsidian']
      .filter(function (k) { return G.store.hasConsent(k); }).length;

    return '<div class="ob-step">' + progress() +
      '<div style="text-align:center">' +
      '<div style="display:grid;place-items:center">' +
      G.avatar.render(84, { level: 1, hero: true, action: true }) + '</div>' +
      '<h2 class="big" style="margin-top:10px">Alles bereit' +
      (s.profile.name ? ', ' + u.esc(s.profile.name) : '') + '</h2>' +
      '<p class="muted" style="margin-top:10px">Dein Plan steht. Level 1 in ' +
      G.REGIONS[0].icon + ' ' + G.REGIONS[0].name + ' — los geht die Journey.</p></div>' +

      '<div class="grid grid--3" style="--sp:10px">' +
      miniStat('Einheiten/Woche', plan.length) +
      miniStat('Modus', G.journey.mode(s.profile.mode).name) +
      miniStat('Einwilligungen', given + '/5') +
      '</div>' +

      (next ? '<div class="card card--pad-sm card--hl">' +
        '<p class="tiny dim">Erste Einheit</p>' +
        '<b style="font-size:16px;display:block;margin:4px 0">' + u.esc(next.name) + '</b>' +
        '<span class="small muted">' + u.esc(u.dayName(next.day, true) + ', ' + u.fmtDateShort(next.day)) +
        ' · ' + next.exercises.length + ' Übungen</span></div>' : '') +

      '<div class="note note--neon">' + u.icon('info', 17) +
      '<div>Deine Startgewichte kannst du jederzeit im Profil eintragen. ' +
      'Der Coach passt die Progression dann an deine echten Zahlen an.</div></div>' +

      nav('Zurück', 'G04Fit starten', 'finish') + '</div>';
  }

  function miniStat(k, v) {
    return '<div class="card card--pad-sm center"><div class="stat" style="align-items:center">' +
      '<span class="stat__k">' + u.esc(k) + '</span>' +
      '<span class="stat__v neon" style="font-size:21px">' + u.esc(String(v)) + '</span></div></div>';
  }

  /* ---------- Rendern ---------- */
  function render() {
    var host = u.$('#onboardingSteps');
    if (!host) return;
    var fn = [sWillkommen, sDatenschutz, sPerson, sErfahrung, sPlan, sFertig][step];
    host.innerHTML = fn();
  }

  function readPerson() {
    var p = G.store.state.profile;
    var g = function (id) { var e = u.$('#' + id); return e ? e.value : ''; };
    if (u.$('#obName')) p.name = g('obName').trim();
    if (u.$('#obAge')) p.age = g('obAge') === '' ? null : u.num(g('obAge'), null);
    if (u.$('#obHeight')) p.height = g('obHeight') === '' ? null : u.num(g('obHeight'), null);
    if (u.$('#obWeight')) p.weight = g('obWeight') === '' ? null : u.num(g('obWeight'), null);
    if (u.$('#obTime')) p.reminderTime = g('obTime') || '18:00';
  }

  function start() {
    var box = u.$('#onboarding');
    box.hidden = false;
    u.$('#app').hidden = true;
    step = 0;
    render();

    u.on(box, 'click', '[data-ob]', function (e, t) {
      e.preventDefault();
      var a = t.getAttribute('data-ob');

      if (a === 'policy') { G.views.privacy.openPolicy(); return; }

      if (a === 'back') {
        readPerson();
        step = Math.max(0, step - 1);
        render();
        return;
      }

      if (a === 'next') {
        readPerson();
        G.store.commit('onboarding');
        step = Math.min(STEPS.length - 1, step + 1);
        render();
        return;
      }

      if (a === 'finish') {
        readPerson();
        G.store.state.onboarded = true;
        G.store.commit('onboarded');
        box.hidden = true;
        u.$('#app').hidden = false;
        G.app.go('dashboard');
        if (G.store.hasConsent('push')) {
          G.reminders.enableBackgroundPush()
            .catch(function () { return G.reminders.requestPermission(); })
            .then(function () { G.reminders.start(); });
        }
        u.toast('Willkommen bei G04Fit',
          G.store.hasConsent('profile')
            ? 'Dein Profil wird auf diesem Gerät gespeichert.'
            : 'Ohne Einwilligung wird nichts gespeichert – du kannst das im Datenschutz ändern.',
          G.store.hasConsent('profile') ? 'ok' : 'warn', 5200);
      }
    });

    // Avatar innerhalb der Ersteinrichtung: danach diesen Schritt neu zeichnen,
    // nicht die Hauptansicht. stopPropagation verhindert den allgemeinen Handler.
    u.on(box, 'click', '[data-avatar-pick]', function (e) {
      e.preventDefault();
      e.stopPropagation();
      readPerson();
      G.avatar.choose(function () { render(); });
    });

    u.on(box, 'change', '[data-oc]', function (e, t) {
      var k = t.getAttribute('data-oc');
      G.store.setConsent(k, t.checked);
      if (k === 'history' && t.checked && !G.store.hasConsent('profile')) {
        G.store.setConsent('profile', true);
      }
      if (k === 'profile' && !t.checked) {
        ['history', 'ai', 'obsidian', 'push'].forEach(function (x) { G.store.setConsent(x, false); });
      }
      render();
    });

    u.on(box, 'click', '[data-oexp]', function (e, t) {
      readPerson();
      G.store.state.profile.experience = t.getAttribute('data-oexp');
      render();
    });

    u.on(box, 'click', '[data-omode]', function (e, t) {
      readPerson();
      var k = t.getAttribute('data-omode');
      G.store.state.profile.mode = k;
      // Trainingstage an die Empfehlung des Modus angleichen
      var weekly = G.journey.mode(k).weekly;
      var presets = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6] };
      G.store.state.profile.trainingDays = (presets[weekly] || [1, 3, 5]).slice();
      render();
    });

    u.on(box, 'click', '[data-oday]', function (e, t) {
      readPerson();
      var d = +t.getAttribute('data-oday');
      var arr = G.store.state.profile.trainingDays || [];
      var i = arr.indexOf(d);
      if (i >= 0) arr.splice(i, 1); else arr.push(d);
      if (!arr.length) arr.push(d);
      G.store.state.profile.trainingDays = arr;
      render();
    });

    u.on(box, 'click', '[data-ogoal]', function (e, t) {
      readPerson();
      var k = t.getAttribute('data-ogoal');
      var arr = G.store.state.profile.goals || [];
      var i = arr.indexOf(k);
      if (i >= 0) arr.splice(i, 1); else arr.push(k);
      G.store.state.profile.goals = arr;
      render();
    });
  }

  G.onboarding = { start: start };
})(G04Fit);
