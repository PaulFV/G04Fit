/* ============================================================
   G04Fit — Journey / Weltkarte
   Konzept Abschnitt 4: Level 1 als Start, Regionen werden durch
   absolviertes Training freigeschaltet, Modi Easy bis Beast.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  function nodes(region, level) {
    var out = [];
    var to = Math.min(region.to, region.from + 11);
    for (var l = region.from; l <= to; l++) {
      var cls = 'node';
      if (l < level) cls += ' is-done';
      else if (l === level) cls += ' is-now';
      out.push('<div class="' + cls + '">' +
        '<button class="node__dot" data-level="' + l + '" title="Level ' + l + '">' +
        (l < level ? u.icon('check', 14) : l) + '</button>' +
        (l < to ? '<span class="node__link"></span>' : '') +
        '</div>');
    }
    if (region.to > to) {
      out.push('<div class="node"><span class="node__link"></span>' +
        '<span class="tiny dim nowrap" style="padding-left:8px">… bis ' + region.to + '</span></div>');
    }
    return '<div class="nodes">' + out.join('') + '</div>';
  }

  function regionRow(region, li) {
    var unlocked = li.level >= region.from;
    var current = li.level >= region.from && li.level <= region.to;
    var cls = 'region' + (unlocked ? '' : ' is-locked') + (current ? ' is-current' : '');
    var pct = current
      ? (li.level - region.from + li.pct) / (Math.min(region.to, 999) - region.from + 1)
      : (unlocked ? 1 : 0);

    var imagePosition = region.imagePosition || 'center';
    // On narrow screens keep the upper part of each atlas cell in view so the
    // avatar's face stays visible instead of being cropped at the card edge.
    var mobileImagePosition = region.mobileImagePosition || imagePosition
      .replace(/\s(?:20|80)%$/, ' 12%');
    var imageStyle = "background-image:url('" + region.image + "');--journey-image-position:" + imagePosition + ';--journey-image-position-mobile:' + mobileImagePosition + ';';
    return '<article class="journey-region region--' + region.key + ' ' + cls + '">' +
      '<span class="journey-region__timeline-marker" aria-hidden="true">' +
      (unlocked ? String(region.from) : u.icon('lock', 14)) + '</span>' +
      '<div class="journey-region__media" style="' + imageStyle + '" role="img" aria-label="' + u.esc(region.name) + '">' +
      '<span class="journey-region__media-bg" aria-hidden="true" style="background-image:url(\'' + region.image + '\')"></span>' +
      '<span class="journey-region__media-badge" style="--journey-color:' + region.color + '">' +
      (unlocked ? region.icon : u.icon('lock', 18)) + '</span>' +
      '<span class="journey-region__media-level">' + (current ? 'LEVEL ' + li.level : 'LEVEL ' + region.from) + '</span>' +
      '</div>' +
      '<div class="journey-region__content">' +
      '<div class="region__head">' +
      '<div class="region__badge" style="' + (unlocked ? 'border-color:' + region.color + '66;box-shadow:0 0 20px ' + region.color + '20' : '') + '">' +
      (unlocked ? region.icon : u.icon('lock', 18)) + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<b>' + u.esc(region.name) + '</b>' +
      '<span>Level ' + region.from + (region.to > 900 ? '+' : '–' + region.to) + ' · ' + u.esc(region.tag) + '</span>' +
      '</div>' +
      (current ? '<span class="pill pill--neon"><span class="pill__dot"></span>hier</span>'
        : unlocked ? '<span class="pill pill--muted">' + u.icon('check', 12) + ' frei</span>'
          : '<span class="pill pill--muted">gesperrt</span>') +
      '</div>' +
      '<p class="small muted journey-region__desc">' + u.esc(region.desc).replace(/\. /g, '.<br>') + '</p>' +
      nodes(region, li.level) +
      (current ? '<div class="bar bar--thin journey-region__progress"><span class="bar__fill" style="width:' +
        Math.round(u.clamp(pct, 0, 1) * 100) + '%"></span></div>' : '') +
      '</div>' +
      '</article>';
  }

  // Gleiche Pausentimer-Kurzsteuerung wie auf Dashboard und Workout, damit
  // sie auch von der Journey-Ansicht aus erreichbar ist (dort, wo ohnehin
  // die Satzpause je Modus angezeigt wird).
  function restCard() {
    var s = G.store.state;
    return '<div class="card">' +
      '<div class="card__head">' + u.icon('clock', 18) + '<h3>Pause zwischen Sätzen</h3></div>' +
      '<div class="row row--wrap" style="gap:10px;align-items:center">' +
      '<label class="switch" style="padding:0;flex:1;min-width:170px">' +
      '<input type="checkbox" id="restEnableJourney"' + (s.settings.restTimer !== false ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label"><b>Aktiv</b><span>Gilt für die nächste gestartete Einheit</span></span>' +
      '</label>' +
      '<div class="input-suffix" style="max-width:110px">' +
      '<input class="input" type="number" id="restSecondsJourney" min="15" max="500" step="5" ' +
      'value="' + (s.settings.restSeconds || 90) + '"' + (s.settings.restTimer === false ? ' disabled' : '') + '>' +
      '<span>s</span>' +
      '</div></div></div>';
  }

  function modeCards() {
    var s = G.store.state;
    return '<div class="grid grid--2 journey-mode-grid" style="--sp:12px">' + G.MODES.map(function (m) {
      var on = s.profile.mode === m.key;
      var modeIndex = G.MODES.indexOf(m);
      var modePos = (modeIndex * 25) + '% 50%';
      return '<button class="journey-mode card card--click' + (on ? ' card--hl' : '') + '" data-mode="' + m.key + '" type="button">' +
        '<span class="journey-mode__visual" style="--mode-pos:' + modePos + '" aria-hidden="true"></span>' +
        '<span class="journey-mode__body">' +
        '<span class="journey-mode__title" style="color:' + m.color + '">' + u.esc(m.name) + '</span>' +
        (on ? '<span class="pill pill--neon journey-mode__active">aktiv</span>' : '') +
        '<span class="small muted journey-mode__desc">' + u.esc(m.desc) + '</span>' +
        '<span class="journey-mode__pills">' +
        '<span class="pill">' + m.sets + ' Sätze</span>' +
        '<span class="pill">' + m.restSec + ' s Pause</span>' +
        '<span class="pill">' + m.weekly + '×/Woche</span>' +
        '<span class="pill">XP ×' + m.xpMult + '</span>' +
        '</span></span></button>';
    }).join('') + '</div>';
  }

  G.views.journey = {
    title: 'Journey',
    sub: function () {
      var li = G.store.levelInfo();
      return 'Level ' + li.level + ' · ' + li.title + ' · ' + li.region.name;
    },
    render: function () {
      var s = G.store.state;
      var li = G.store.levelInfo();

      return '<div class="view stack journey-view">' +

        '<section class="journey-hero card card--hero card--hl">' +
        '<div class="journey-hero__scene" style="background-image:url(\'' + li.region.image + '\');--journey-image-position:' + (li.region.imagePosition || 'center') + '" aria-hidden="true"></div>' +
        '<div class="journey-hero__content">' +
        '<div class="journey-hero__profile">' + G.avatar.render(88, { hero: true, action: true, fallback: 'assets/dashboard-profile.png?v=2.8.0' }) + '</div>' +
        '<div class="journey-hero__ring">' + G.charts.ring(li.pct, { size: 126, stroke: 7, value: li.level, label: 'Level' }) + '</div>' +
        '<div class="journey-hero__details">' +
        '<p class="muted small">Aktuelle Region</p>' +
        '<h2 class="big"><span class="journey-hero__region-icon">' + li.region.icon + '</span> ' + u.esc(li.region.name) + '</h2>' +
        '<p class="muted small">Lerne die Bewegungen sauber auszuführen. Gewichte sind zweitrangig.</p>' +
        '<div class="row row--wrap journey-hero__pills">' +
        '<span class="pill pill--neon">' + s.journey.xp + ' XP gesamt</span>' +
        '<span class="pill pill--gold">' + s.journey.completed + ' Einheiten</span>' +
        '<span class="pill pill--cyan">Serie ' + s.journey.streak + '</span>' +
        '</div></div></div>' +
        '<div class="journey-hero__progress"><div class="bar"><span class="bar__fill" style="width:' + Math.round(li.pct * 100) + '%"></span></div>' +
        '<p class="tiny dim">Noch ' + (li.need - li.into) + ' XP bis Level ' + (li.level + 1) + '. Eine Einheit bringt je nach Umfang etwa 60–200 XP.</p></div>' +
        '</section>' +

        '<div class="sec journey-section-title journey-map-title"><h2>Weltkarte</h2><span class="sec__line"></span><span class="journey-compass" aria-hidden="true">✦</span></div>' +
        '<div class="journey-map">' +
        G.REGIONS.map(function (r) { return regionRow(r, li); }).join('') +
        '</div>' +

        '<div class="sec journey-section-title"><h2>Schwierigkeit</h2><span class="sec__line"></span>' +
        '<span class="tiny dim">wirkt auf Sätze, Pausen und Progression</span></div>' +
        modeCards() +

        restCard() +

        '<div class="note note--neon" style="margin-top:4px">' + u.icon('info', 18) +
        '<div>Level und XP sind ein Motivationssystem, kein Leistungsurteil. ' +
        'Die Einstufung sagt nichts über deine Gesundheit aus.</div></div>' +

        '</div>';
    },
    mount: function (host) {
      u.on(host, 'click', '[data-mode]', function (e, t) {
        var key = t.getAttribute('data-mode');
        var m = G.journey.mode(key);
        G.store.state.profile.mode = key;
        G.store.commit('mode');
        u.toast('Modus: ' + m.name, m.sets + ' Sätze, ' + m.restSec + ' s Pause, ' + m.weekly + ' Einheiten pro Woche.', 'ok');
        G.app.rerender();
      });

      u.on(host, 'change', '#restEnableJourney', function (e, t) {
        G.store.state.settings.restTimer = t.checked;
        var secInput = host.querySelector('#restSecondsJourney');
        if (secInput) secInput.disabled = !t.checked;
        G.store.commit('settings');
      });

      u.on(host, 'change', '#restSecondsJourney', function (e, t) {
        var s = G.store.state;
        var v = u.clamp(u.num(t.value, s.settings.restSeconds || 90), 15, 500);
        t.value = v;
        s.settings.restSeconds = v;
        G.store.commit('settings');
      });

      u.on(host, 'click', '[data-level]', function (e, t) {
        var lvl = +t.getAttribute('data-level');
        var li = G.store.levelInfo();
        var r = G.journey.regionForLevel(lvl);
        var reached = lvl <= li.level;
        u.openSheet('Level ' + lvl, [
          '<div class="stack">',
          '<div class="row"><span class="region__badge">' + r.icon + '</span>',
          '<div><b>' + u.esc(r.name) + '</b><br><span class="small muted">' + u.esc(r.tag) + '</span></div></div>',
          '<div class="note ' + (reached ? 'note--neon' : '') + '">' + u.icon(reached ? 'check' : 'lock', 18) +
          '<div>' + (reached
            ? 'Erreicht. Titel auf dieser Stufe: <b>' + u.esc(G.journey.titleFor(lvl)) + '</b>.'
            : 'Noch gesperrt. Benötigt insgesamt etwa <b>' + estimateXp(lvl) + ' XP</b> – das entspricht ungefähr ' +
            Math.ceil((estimateXp(lvl) - G.store.state.journey.xp) / 130) + ' weiteren Einheiten.') + '</div></div>',
          '<p class="small muted">' + u.esc(r.desc) + '</p>',
          '</div>'
        ].join(''));
      });
    }
  };

  function estimateXp(level) {
    var total = 0;
    for (var l = 1; l < level; l++) total += G.journey.xpForNext(l);
    return total;
  }
})(G04Fit);
