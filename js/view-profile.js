/* ============================================================
   GoFit — Profil
   Konzept Abschnitt 2: Trainingslevel, Alter, Größe, Gewicht,
   Ziele und eigene Startgewichte. Erfahrene Personen sollen
   nicht automatisch mit sehr leichten Gewichten beginnen.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var EXPERIENCE = [
    { k: 'beginner', n: 'Einsteiger', d: 'Weniger als ein Jahr regelmäßiges Training.' },
    { k: 'intermediate', n: 'Fortgeschritten', d: 'Ein bis drei Jahre, Grundübungen sitzen.' },
    { k: 'advanced', n: 'Erfahren', d: 'Mehrjährige Erfahrung, hohe Lasten gewohnt.' }
  ];

  var GOALS = [
    { k: 'muscle', n: 'Muskelaufbau' },
    { k: 'strength', n: 'Maximalkraft' },
    { k: 'definition', n: 'Definition' },
    { k: 'health', n: 'Gesundheit & Haltung' }
  ];

  function field(label, inner, hint) {
    return '<div class="field"><label>' + u.esc(label) + '</label>' + inner +
      (hint ? '<span class="field__hint">' + u.esc(hint) + '</span>' : '') + '</div>';
  }

  function numInput(id, value, unit, opts) {
    opts = opts || {};
    return '<div class="input-suffix"><input class="input" id="' + id + '" type="number" inputmode="' +
      (opts.decimal ? 'decimal' : 'numeric') + '" step="' + (opts.step || 1) + '"' +
      (opts.min != null ? ' min="' + opts.min + '"' : '') +
      (opts.max != null ? ' max="' + opts.max + '"' : '') +
      ' value="' + (value == null ? '' : value) + '"' +
      (opts.placeholder ? ' placeholder="' + u.esc(opts.placeholder) + '"' : '') +
      '><span>' + u.esc(unit) + '</span></div>';
  }

  /* ------------------------------------------------------------
     Startgewichte
     ------------------------------------------------------------ */
  function startWeightsCard() {
    var s = G.store.state;
    var set = Object.keys(s.profile.startWeights);

    // Die wichtigsten Grundübungen zuerst anbieten
    var key = ['bench-bb', 'bench-db', 'latpull', 'row-bb', 'ohp-db', 'curl-bb', 'pushdown', 'bench-close'];
    var list = key.map(G.ex.byId).filter(Boolean);
    set.forEach(function (id) {
      if (key.indexOf(id) < 0 && G.ex.byId(id)) list.push(G.ex.byId(id));
    });

    return '<div class="card">' +
      '<div class="card__head">' + u.icon('dumbbell', 18) + '<h3>Startgewichte</h3>' +
      '<span class="spacer"></span><span class="pill pill--muted">' + set.length + ' gesetzt</span></div>' +
      '<div class="note note--neon" style="margin-bottom:16px">' + u.icon('info', 17) +
      '<div>Trage ein, womit du tatsächlich arbeitest. GoFit übernimmt diese Werte statt eines ' +
      'pauschalen Einsteigergewichts – der Coach baut die Progression darauf auf.</div></div>' +
      '<div class="list">' +
      list.map(function (ex) {
        var own = s.profile.startWeights[ex.id];
        var sug = G.ex.suggestStart(ex, s.profile.weight, s.profile.experience);
        return '<div class="list__row">' +
          '<div class="list__ic"><i class="mdot m-' + ex.muscle + '"></i></div>' +
          '<div class="list__main"><b>' + u.esc(ex.name) + '</b>' +
          '<span>' + (own != null ? 'eigener Wert' : 'Richtwert ' + u.fmt(sug) + ' kg') + '</span></div>' +
          '<div class="list__end" style="width:110px">' +
          '<div class="input-suffix"><input class="input" style="padding:7px 9px;text-align:center" ' +
          'type="number" inputmode="decimal" step="' + (ex.inc || 2.5) + '" min="0" ' +
          'data-sw="' + ex.id + '" value="' + (own != null ? own : '') + '" placeholder="' + sug + '"><span>kg</span></div>' +
          '</div></div>';
      }).join('') +
      '</div>' +
      '<div class="btn-row" style="margin-top:14px">' +
      '<button class="btn btn--sm" data-act="sw-more">' + u.icon('plus', 15) + ' Weitere Übung</button>' +
      (set.length ? '<button class="btn btn--sm btn--ghost" data-act="sw-clear">Alle zurücksetzen</button>' : '') +
      '</div></div>';
  }

  /* ------------------------------------------------------------
     Trainings-Avatar
     ------------------------------------------------------------ */
  function avatarCard() {
    var li = G.store.levelInfo();
    var has = G.avatar.has();
    var kb = G.avatar.sizeKb();

    return '<div class="card">' +
      '<div class="card__head">' + u.icon('profile', 18) + '<h3>Trainings-Avatar</h3>' +
      '<span class="spacer"></span>' +
      '<span class="pill ' + (has ? 'pill--neon' : 'pill--muted') + '">' +
      (has ? 'eigenes Bild' : 'kein Bild') + '</span></div>' +

      '<div class="row" style="gap:20px;align-items:flex-start;flex-wrap:wrap">' +

      '<div class="row" style="gap:16px;align-items:center">' +
      G.avatar.render(88, { ring: li.pct, level: li.level, hero: true, action: true }) +
      (has && G.avatar.fullSrc() ? G.avatar.renderPortrait(130) : '') +
      '</div>' +

      '<div style="flex:1;min-width:230px">' +
      '<p class="small muted">' + (has
        ? 'Dein Bild begleitet dich durch Dashboard, Profil, Journey und die Abschluss-Übersicht ' +
        'nach jeder Einheit. Ein Antippen des Avatars ändert es jederzeit.'
        : 'Lade ein eigenes Bild hoch — es erscheint dann im Dashboard, im Profil, in der Journey ' +
        'und nach jeder abgeschlossenen Einheit. Ohne Bild zeigt GoFit deine Initialen.') + '</p>' +

      '<div class="btn-row" style="margin-top:16px">' +
      '<button class="btn btn--primary btn--sm" data-act="av-pick">' +
      u.icon(has ? 'refresh' : 'plus', 15) + (has ? ' Anderes Bild' : ' Bild hochladen') + '</button>' +
      (has ? '<button class="btn btn--sm btn--ghost" data-act="av-remove">' +
        u.icon('trash', 15) + ' Entfernen</button>' : '') +
      '</div>' +

      '<p class="tiny dim" style="margin-top:10px">Beliebiges Bildformat. GoFit verkleinert es ' +
      'automatisch auf 512 Pixel und schneidet für den runden Avatar mittig zu.</p>' +

      '<div class="note" style="margin-top:14px">' + u.icon('privacy', 17) +
      '<div>Das Bild bleibt vollständig auf diesem Gerät. Es wird nicht hochgeladen, nicht ' +
      'analysiert und nicht an Dritte weitergegeben. Gespeichert wird es nur mit der Einwilligung ' +
      '<b>Profil speichern</b>' +
      (has && kb ? ' — aktuell rund <b>' + kb + ' KB</b> im lokalen Speicher' : '') + '.</div></div>' +

      '</div></div></div>';
  }

  /* ------------------------------------------------------------
     Trainingstage
     ------------------------------------------------------------ */
  function daysCard() {
    var s = G.store.state;
    var m = G.journey.mode(s.profile.mode);
    var sel = s.profile.trainingDays || [];
    var order = [1, 2, 3, 4, 5, 6, 0];

    return '<div class="card">' +
      '<div class="card__head">' + u.icon('clock', 18) + '<h3>Trainingstage</h3>' +
      '<span class="spacer"></span><span class="pill ' + (sel.length === m.weekly ? 'pill--neon' : 'pill--muted') + '">' +
      sel.length + ' von ' + m.weekly + ' empfohlen</span></div>' +
      '<div class="chips" style="margin-bottom:16px">' +
      order.map(function (d) {
        return '<button class="chip' + (sel.indexOf(d) >= 0 ? ' is-on' : '') + '" data-day="' + d + '">' +
          u.DAYS[d] + '</button>';
      }).join('') + '</div>' +
      '<p class="small muted">Der Split richtet sich nach der Anzahl der Tage: ' +
      '2 Tage Ganzkörper, 3 Tage Push/Pull/Schulter-Bauch, ab 4 Tagen einzelne Muskelgruppen.</p>' +
      '<div class="stack" style="--sp:10px;margin-top:16px">' +
      G.planner.weekPlan().map(function (p) {
        return '<div class="row" style="gap:10px">' +
          '<span class="pill pill--neon nowrap" style="min-width:52px;justify-content:center">' +
          u.dayName(p.day) + '</span>' +
          '<span class="small" style="flex:1">' + u.esc(p.name) + '</span>' +
          '<span class="tiny dim nowrap">' + p.exercises.length + ' Übungen</span>' +
          '</div>';
      }).join('') + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     View
     ------------------------------------------------------------ */
  G.views.profile = {
    title: 'Profil',
    sub: function () {
      var s = G.store.state;
      var e = EXPERIENCE.filter(function (x) { return x.k === s.profile.experience; })[0];
      return (s.profile.name || 'Ohne Namen') + ' · ' + (e ? e.n : '') + ' · ' + G.journey.mode(s.profile.mode).name;
    },
    render: function () {
      var s = G.store.state;
      var p = s.profile;
      var li = G.store.levelInfo();

      return '<div class="view stack">' +

        /* Kopf */
        '<div class="card card--hero">' +
        '<div class="row" style="gap:18px;flex-wrap:wrap">' +
        G.avatar.render(92, { ring: li.pct, level: li.level, hero: true, action: true }) +
        '<div style="flex:1;min-width:190px">' +
        '<h2 style="font-size:21px">' + u.esc(p.name || 'Dein Profil') + '</h2>' +
        '<p class="muted small" style="margin-top:4px">' + u.esc(li.title) + ' · ' +
        li.region.icon + ' ' + u.esc(li.region.name) + '</p>' +
        '<div class="row row--wrap" style="gap:7px;margin-top:12px">' +
        (p.age ? '<span class="pill">' + p.age + ' Jahre</span>' : '') +
        (p.height ? '<span class="pill">' + p.height + ' cm</span>' : '') +
        (p.weight ? '<span class="pill">' + u.fmt(p.weight) + ' kg</span>' : '') +
        (p.height && p.weight ? '<span class="pill pill--muted">BMI ' +
          u.fmt(p.weight / Math.pow(p.height / 100, 2), 1) + '</span>' : '') +
        '</div></div></div></div>' +

        /* Persönliche Daten */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('profile', 18) + '<h3>Persönliche Angaben</h3>' +
        '<span class="spacer"></span>' +
        '<span class="consent-state ' + (G.store.hasConsent('profile') ? 'on' : 'off') + '">' +
        u.icon(G.store.hasConsent('profile') ? 'check' : 'lock', 13) +
        (G.store.hasConsent('profile') ? 'wird gespeichert' : 'nur temporär') + '</span></div>' +

        '<div class="grid grid--2" style="--sp:14px">' +
        field('Name oder Spitzname',
          '<input class="input" id="pName" type="text" value="' + u.esc(p.name) + '" placeholder="optional" autocomplete="off">',
          'Nur für die Begrüßung. Ein Fantasiename genügt.') +
        field('Alter', numInput('pAge', p.age, 'Jahre', { min: 12, max: 110, placeholder: '–' }),
          'Fließt in die Vorsicht bei der Progression ein.') +
        field('Größe', numInput('pHeight', p.height, 'cm', { min: 100, max: 250, placeholder: '–' })) +
        field('Körpergewicht', numInput('pWeight', p.weight, 'kg', { decimal: true, step: 0.5, min: 30, max: 300, placeholder: '–' }),
          'Basis für Richtwerte bei Startgewichten.') +
        '</div>' +

        '<div class="field" style="margin-top:18px"><label>Trainingserfahrung</label>' +
        '<div class="grid grid--3" style="--sp:10px;margin-top:6px">' +
        EXPERIENCE.map(function (e) {
          var on = p.experience === e.k;
          return '<button class="card card--pad-sm card--click' + (on ? ' card--hl' : '') + '" data-exp="' + e.k + '" ' +
            'style="text-align:left">' +
            '<b style="font-size:14px;display:block;margin-bottom:4px' + (on ? ';color:var(--neon)' : '') + '">' +
            u.esc(e.n) + '</b>' +
            '<span class="tiny muted">' + u.esc(e.d) + '</span></button>';
        }).join('') + '</div>' +
        '<span class="field__hint" style="margin-top:8px">Die Stufe beeinflusst die Richtwerte für Startgewichte ' +
        'und welche Übungen vorgeschlagen werden.</span></div>' +

        '<div class="field" style="margin-top:18px"><label>Ziele</label>' +
        '<div class="chips" style="margin-top:6px">' +
        GOALS.map(function (g) {
          return '<button class="chip' + ((p.goals || []).indexOf(g.k) >= 0 ? ' is-on' : '') +
            '" data-goal="' + g.k + '">' + u.esc(g.n) + '</button>';
        }).join('') + '</div></div>' +

        '<div class="field" style="margin-top:18px"><label>Schwerpunkt-Muskelgruppen</label>' +
        '<div class="chips" style="margin-top:6px">' +
        G.MUSCLE_ORDER.map(function (m) {
          return '<button class="chip' + ((p.focus || []).indexOf(m) >= 0 ? ' is-on' : '') +
            '" data-focus="' + m + '">' + G.MUSCLES[m].icon + ' ' + u.esc(G.MUSCLES[m].name) + '</button>';
        }).join('') + '</div>' +
        '<span class="field__hint" style="margin-top:8px">Ausgewählte Gruppen bekommen im Plan eine Übung mehr.</span></div>' +

        '<div class="btn-row" style="margin-top:20px">' +
        '<button class="btn btn--primary" data-act="save">' + u.icon('check', 17) + ' Angaben speichern</button>' +
        '</div></div>' +

        avatarCard() +
        daysCard() +
        startWeightsCard() +

        /* Einstellungen */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('refresh', 18) + '<h3>App-Einstellungen</h3></div>' +
        sw('setLight', 'Heller Modus', 'Wechselt zwischen dem dunklen und hellen GoFit-Design.', s.settings.theme === 'light') +
        sw('setRest', 'Pausentimer', 'Nach jedem abgehakten Satz startet automatisch eine Pause.', s.settings.restTimer) +
        sw('setReentry', 'Wiedereinstiegsmodus', 'Nach längeren Pausen reduziert GoFit Gewicht und Volumen automatisch.', s.settings.reentry) +
        sw('setMotion', 'Animationen reduzieren', 'Schaltet Bewegungseffekte weitgehend ab.', s.settings.reduceMotion) +
        sw('setSilent', 'Benachrichtigungen stumm', 'Erinnerungen ohne Ton zustellen.', s.settings.soundless) +
        '</div>' +

        '<div class="note note--warn">' + u.icon('warn', 18) +
        '<div>GoFit ersetzt keine ärztliche oder physiotherapeutische Beratung. ' +
        'Bei Vorerkrankungen, Schmerzen oder nach Verletzungen kläre dein Training vorher fachlich ab.</div></div>' +

        '</div>';
    },
    mount: function (host) {
      var s = G.store.state;

      function readFields() {
        var g = function (id) { var e = host.querySelector('#' + id); return e ? e.value : ''; };
        s.profile.name = g('pName').trim();
        s.profile.age = g('pAge') === '' ? null : u.num(g('pAge'), null);
        s.profile.height = g('pHeight') === '' ? null : u.num(g('pHeight'), null);
        s.profile.weight = g('pWeight') === '' ? null : u.num(g('pWeight'), null);
      }

      u.on(host, 'click', '[data-act="save"]', function () {
        readFields();
        G.store.commit('profile');
        u.toast('Gespeichert', G.store.hasConsent('profile')
          ? 'Deine Angaben bleiben auf diesem Gerät erhalten.'
          : 'Ohne die Einwilligung „Profil speichern“ gelten die Angaben nur bis zum Schließen.',
          G.store.hasConsent('profile') ? 'ok' : 'warn');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-exp]', function (e, t) {
        readFields();
        s.profile.experience = t.getAttribute('data-exp');
        G.store.commit('profile');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-goal]', function (e, t) {
        readFields();
        var k = t.getAttribute('data-goal');
        var i = (s.profile.goals || []).indexOf(k);
        if (i >= 0) s.profile.goals.splice(i, 1); else s.profile.goals.push(k);
        G.store.commit('profile');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-focus]', function (e, t) {
        readFields();
        var k = t.getAttribute('data-focus');
        s.profile.focus = s.profile.focus || [];
        var i = s.profile.focus.indexOf(k);
        if (i >= 0) s.profile.focus.splice(i, 1); else s.profile.focus.push(k);
        G.store.commit('profile');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-day]', function (e, t) {
        var d = +t.getAttribute('data-day');
        var arr = s.profile.trainingDays || [];
        var i = arr.indexOf(d);
        if (i >= 0) arr.splice(i, 1); else arr.push(d);
        if (!arr.length) { arr.push(d); u.toast('Mindestens ein Tag', 'Ein Trainingstag muss bestehen bleiben.', 'warn'); }
        s.profile.trainingDays = arr;
        G.store.commit('days');
        G.app.rerender();
      });

      u.on(host, 'change', '[data-sw]', function (e, t) {
        var id = t.getAttribute('data-sw');
        var ex = G.ex.byId(id);
        if (t.value === '') delete s.profile.startWeights[id];
        else s.profile.startWeights[id] = u.roundWeight(u.num(t.value, 0), ex ? ex.inc : 2.5);
        G.store.commit('start-weights');
      });

      /* Trainings-Avatar */
      u.on(host, 'click', '[data-act="av-pick"]', function () {
        G.avatar.choose();
      });

      u.on(host, 'click', '[data-act="av-remove"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Bild entfernen',
          body: 'Dein Avatar-Bild wird gelöscht. GoFit zeigt danach wieder deine Initialen. ' +
            'Die Bilddatei auf deinem Gerät bleibt unberührt.',
          ok: 'Entfernen'
        });
        if (!ok) return;
        G.avatar.remove();
        u.toast('Entfernt', 'Du kannst jederzeit ein neues Bild hochladen.', 'ok');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="sw-more"]', function () {
        G.views.workout.openPicker(function (ids) {
          ids.forEach(function (id) {
            if (s.profile.startWeights[id] == null) {
              var ex = G.ex.byId(id);
              s.profile.startWeights[id] = G.ex.suggestStart(ex, s.profile.weight, s.profile.experience);
            }
          });
          G.store.commit('start-weights');
          G.app.rerender();
        }, Object.keys(s.profile.startWeights));
      });

      u.on(host, 'click', '[data-act="sw-clear"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Startgewichte zurücksetzen',
          body: 'Alle eigenen Startgewichte werden entfernt. GoFit verwendet dann wieder Richtwerte.',
          ok: 'Zurücksetzen'
        });
        if (!ok) return;
        s.profile.startWeights = {};
        G.store.commit('start-weights');
        G.app.rerender();
      });

      /* Einstellungen */
      bindSwitch(host, 'setLight', function (v) { G.app.setTheme(v ? 'light' : 'dark'); }, false);
      bindSwitch(host, 'setRest', function (v) { s.settings.restTimer = v; });
      bindSwitch(host, 'setReentry', function (v) { s.settings.reentry = v; });
      bindSwitch(host, 'setSilent', function (v) { s.settings.soundless = v; });
      bindSwitch(host, 'setMotion', function (v) {
        s.settings.reduceMotion = v;
        document.body.classList.toggle('no-motion', v);
      });
    }
  };

  function sw(id, title, desc, on) {
    return '<label class="switch"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label"><b>' + u.esc(title) + '</b><span>' + u.esc(desc) + '</span></span></label>';
  }

  function bindSwitch(host, id, fn, commit) {
    var e = host.querySelector('#' + id);
    if (!e) return;
    e.addEventListener('change', function () {
      fn(e.checked);
      if (commit !== false) G.store.commit('settings');
    });
  }
})(GoFit);
