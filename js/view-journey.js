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

    var imageStyle = "background-image:url('" + region.image + "');--journey-image-position:" + (region.imagePosition || 'center') + ';';
    // Der Kreis der Zeitleiste sitzt außerhalb der Kachel: deren Pfeilform
    // (clip-path) würde ihn sonst anschneiden.
    return '<div class="journey-stop' + (unlocked ? '' : ' is-locked') + (current ? ' is-current' : '') + '">' +
      '<span class="journey-region__timeline-marker" aria-hidden="true">' +
      (unlocked ? String(region.from) : u.icon('lock', 14)) + '</span>' +
      '<article class="journey-region region--' + region.key + ' journey-region--' + (region.layout || 'bands') + ' ' + cls +
      '" data-region="' + region.key + '">' +
      '<div class="journey-region__media" style="' + imageStyle + '" role="img" aria-label="' + u.esc(region.name) + '">' +
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
      '</div>' +
      // Eigenes Element statt Teil des Kopfs: auf dem Handy wandert der
      // Status je nach Bild an eine freie Stelle.
      '<span class="journey-region__status">' +
      (current ? '<span class="pill pill--neon"><span class="pill__dot"></span>hier</span>'
        : unlocked ? '<span class="pill pill--muted">' + u.icon('check', 12) + ' frei</span>'
          : '<span class="pill pill--muted">gesperrt</span>') +
      '</span>' +
      '<p class="small muted journey-region__desc">' + u.esc(region.desc).replace(/\. /g, '.<br>') + '</p>' +
      nodes(region, li.level) +
      (current ? '<div class="bar bar--thin journey-region__progress"><span class="bar__fill" style="width:' +
        Math.round(u.clamp(pct, 0, 1) * 100) + '%"></span></div>' : '') +
      '</div>' +
      '</article></div>';
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

  /* ------------------------------------------------------------
     Bildausschnitt der Regionsbilder
     ------------------------------------------------------------
     Alle Regionen teilen sich einen Atlas aus 3 × 2 quadratischen Szenen.
     frame() wählt Zoom und Position so, dass die Person (region.focus)
     auf dem Zielpunkt steht und die Szene die Fläche trotzdem ganz füllt –
     am Rand blitzt also nie eine Nachbarszene auf. Die Kacheln werden
     dafür bei Bedarf höher, bis Person und Text nebeneinander Platz haben. */
  var ATLAS_COLS = 3, ATLAS_ROWS = 2;
  var GAP = 10;            // Mindestabstand zwischen Text und Person
  var PAD = 14;            // Innenabstand der Kacheln auf dem Handy
  var MIN_SIDE = 92;       // schmalere Textspalten werden unleserlich

  function regionByKey(key) {
    for (var i = 0; i < G.REGIONS.length; i++) if (G.REGIONS[i].key === key) return G.REGIONS[i];
    return null;
  }

  // Kantenlänge einer Szene in Pixeln, damit die Personenmitte auf (cx, cy)
  // liegen kann, ohne dass die Szene die Fläche W × H verlässt.
  function sceneSize(W, H, f, cx, cy) {
    var fx = (f[0] + f[2]) / 2, fy = (f[1] + f[3]) / 2;
    return Math.max(W, H, cx / fx, (W - cx) / (1 - fx), cy / fy, (H - cy) / (1 - fy));
  }

  function personBox(W, H, f, cx, cy) {
    var S = sceneSize(W, H, f, cx, cy);
    var x = cx - (f[0] + f[2]) / 2 * S, y = cy - (f[1] + f[3]) / 2 * S;
    return { S: S, x: x, y: y, left: x + f[0] * S, top: y + f[1] * S, right: x + f[2] * S, bottom: y + f[3] * S };
  }

  function frame(el, region, W, H, cx, cy) {
    var b = personBox(W, H, region.focus, cx, cy);
    el.style.backgroundSize = (b.S * ATLAS_COLS).toFixed(1) + 'px ' + (b.S * ATLAS_ROWS).toFixed(1) + 'px';
    el.style.backgroundPosition = (b.x - region.cell[0] * b.S).toFixed(1) + 'px ' +
      (b.y - region.cell[1] * b.S).toFixed(1) + 'px';
    return b;
  }

  function isPhone() { return window.matchMedia('(max-width:760px)').matches; }

  // Kanten in Pixeln ab der Innenkante von ref – unabhängig davon, welches
  // Element im CSS gerade positioniert ist.
  function edge(el, ref, side) {
    if (!el) return 0;
    return el.getBoundingClientRect()[side] - ref.getBoundingClientRect().top - ref.clientTop;
  }
  function bottomOf(el, ref) { return edge(el, ref, 'bottom'); }
  function topOf(el, ref) { return edge(el, ref, 'top'); }

  /* Handy, Text oben und unten: Titel und Status im oberen Band,
     Beschreibung und Level-Punkte im unteren. Die Person steht mittig im
     Streifen dazwischen. Liefert die nötige Höhe. */
  function planBands(tile, region, W, minH) {
    var top = Math.max(bottomOf(tile.querySelector('.region__head'), tile),
      bottomOf(tile.querySelector('.journey-region__status'), tile)) + GAP;
    var bottom = tile.clientHeight - topOf(tile.querySelector('.journey-region__desc'), tile) + GAP;
    var f = region.focus;
    for (var H = minH; H < W * 2; H += 2) {
      var free = H - top - bottom;
      var b = personBox(W, H, f, W / 2, top + free / 2);
      if (b.bottom - b.top <= free) break;
    }
    return { H: H, top: top, bottom: bottom };
  }

  /* Handy, Text links und rechts: Titel und Beschreibung links, Status und
     Level-Punkte rechts, die Person steht mittig dazwischen. Ist das Handy
     zu schmal für lesbare Spalten, liefert die Funktion null. */
  function planSides(tile, region, W, minH) {
    var f = region.focus;
    for (var H = minH; H < W * 2; H += 2) {
      var b = personBox(W, H, f, W / 2, H / 2);
      var side = Math.floor(Math.min(b.left, W - b.right) - PAD - GAP);
      if (side < MIN_SIDE) return null;
      tile.style.setProperty('--side', side + 'px');
      var left = bottomOf(tile.querySelector('.journey-region__desc'), tile);
      var nodes = tile.querySelector('.nodes');
      var right = bottomOf(tile.querySelector('.journey-region__status'), tile) + GAP + nodes.offsetHeight;
      if (b.bottom - b.top <= H - 8 && left <= H - PAD && right <= H - PAD) return { H: H, side: side };
    }
    return null;
  }

  function fitMap(host) {
    var tiles = [].slice.call(host.querySelectorAll('.journey-region'));
    if (!tiles.length) return;
    var phone = isPhone();
    var plans = [], maxH = 0;

    tiles.forEach(function (tile) {
      var region = regionByKey(tile.getAttribute('data-region'));
      var media = tile.querySelector('.journey-region__media');
      tile.style.height = '';
      tile.style.minHeight = '';
      if (!phone) {
        // Desktop: Bild links in eigener Spalte, Text daneben. Nur so hoch,
        // dass die Person vollständig ins Bildfeld passt.
        var W = media.clientWidth, H = tile.clientHeight;
        while (H < W * 2) {
          var b = personBox(W, H, region.focus, W / 2, H / 2);
          if (b.bottom - b.top <= H - 16) break;
          H += 2;
        }
        plans.push({ tile: tile, region: region, media: media, layout: 'desktop' });
        maxH = Math.max(maxH, H);
        return;
      }
      var Wt = tile.clientWidth, minH = Math.round(Wt * 0.62);
      var layout = region.layout || 'bands';
      tile.classList.remove('journey-region--bands', 'journey-region--sides');
      tile.classList.add('journey-region--' + layout);
      var plan = layout === 'sides' ? planSides(tile, region, Wt, minH) : null;
      if (!plan) {
        // Zu schmal für Spalten: der Text weicht nach oben und unten aus.
        layout = 'bands';
        tile.classList.remove('journey-region--sides');
        tile.classList.add('journey-region--bands');
        tile.style.removeProperty('--side');
        plan = planBands(tile, region, Wt, minH);
      }
      plan.layout = layout;
      plan.tile = tile;
      plan.region = region;
      plan.media = media;
      plans.push(plan);
      maxH = Math.max(maxH, plan.H);
    });

    // Alle Kacheln gleich hoch – die Weltkarte wirkt so ruhiger.
    plans.forEach(function (p) {
      var tile = p.tile;
      if (p.layout === 'desktop') {
        tile.style.minHeight = maxH + 'px';
        frame(p.media, p.region, p.media.clientWidth, p.media.clientHeight,
          p.media.clientWidth / 2, p.media.clientHeight / 2);
        return;
      }
      tile.style.height = maxH + 'px';
      var W = tile.clientWidth;
      if (p.layout === 'sides') {
        frame(p.media, p.region, W, maxH, W / 2, maxH / 2);
      } else {
        var free = maxH - p.top - p.bottom;
        frame(p.media, p.region, W, maxH, W / 2, p.top + free / 2);
        tile.style.setProperty('--band-top', p.top + 'px');
        tile.style.setProperty('--band-bottom', p.bottom + 'px');
      }
    });

    placeRail(host);
  }

  // Zeitleiste (Tablet/Desktop): genau von der Mitte des ersten bis zur
  // Mitte des letzten Kreises, egal wie hoch die Kacheln gerade sind.
  function placeRail(host) {
    var map = host.querySelector('.journey-map');
    var tiles = host.querySelectorAll('.journey-region');
    if (!map || !tiles.length || isPhone()) return;
    var m = map.getBoundingClientRect();
    var first = tiles[0].getBoundingClientRect(), last = tiles[tiles.length - 1].getBoundingClientRect();
    map.style.setProperty('--line-top', (first.top + first.height / 2 - m.top).toFixed(1) + 'px');
    map.style.setProperty('--line-bottom', (m.bottom - last.top - last.height / 2).toFixed(1) + 'px');
  }

  /* Kopfkarte „Aktuelle Region“: Auf dem Handy liegt der Text oben und
     unten, auf dem Desktop links neben dem Bild. */
  function fitHero(host) {
    var hero = host.querySelector('.journey-hero');
    var scene = hero && hero.querySelector('.journey-hero__scene');
    if (!scene) return;
    // Eingeklappt: nur die kompakte Zeile, keine Bildberechnung
    if (hero.classList.contains('is-collapsed')) { hero.style.minHeight = ''; return; }
    var region = regionByKey(hero.getAttribute('data-region'));
    hero.style.minHeight = '';
    scene.style.height = '';
    var W = scene.clientWidth, H = scene.clientHeight, f = region.focus;

    if (!isPhone()) {
      while (H < W * 2) {
        var d = personBox(W, H, f, W / 2, H / 2);
        if (d.bottom - d.top <= H - 20) break;
        H += 2;
      }
      hero.style.minHeight = H + 'px';
      frame(scene, region, W, scene.clientHeight, W / 2, scene.clientHeight / 2);
      return;
    }

    // Der Fuß (Beschreibung, Werte, Fortschritt) ist zu hoch, als dass das
    // Bild noch dahinter reichen könnte – sonst müsste es so stark zoomen,
    // dass die Person nicht mehr passt. Das Bild endet deshalb kurz unter dem
    // Personenstreifen und läuft in den dunklen Fuß aus (Maske im CSS).
    var FADE = 36;
    var top = Math.max(bottomOf(hero.querySelector('.journey-hero__details h2'), hero),
      bottomOf(hero.querySelector('.journey-hero__ring'), hero)) + GAP;
    var bottom = hero.clientHeight - topOf(hero.querySelector('.journey-hero__foot'), hero) + GAP;
    for (H = Math.round(W * 0.62); H < W * 2; H += 2) {
      var free = H - top - bottom;
      var b = personBox(W, H - bottom + FADE, f, W / 2, top + free / 2);
      if (b.bottom - b.top <= free) break;
    }
    hero.style.minHeight = H + 'px';
    H = hero.clientHeight;
    free = H - top - bottom;
    var sceneH = H - bottom + FADE;
    scene.style.height = sceneH + 'px';
    frame(scene, region, W, sceneH, W / 2, top + free / 2);
    hero.style.setProperty('--band-top', top + 'px');
    hero.style.setProperty('--band-bottom', bottom + 'px');
  }

  var resizeWatch = null, railWatch = null;
  function fitAll(host) {
    if (!host.isConnected) return;
    fitHero(host);
    fitMap(host);
  }

  function watchSize(host) {
    if (resizeWatch) resizeWatch.disconnect();
    var run = function () { fitAll(host); };
    // Erst nach der Übersetzung rechnen – englische Texte sind anders lang.
    requestAnimationFrame(run);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', run); return; }
    var lastWidth = 0;
    resizeWatch = new ResizeObserver(function (entries) {
      var w = Math.round(entries[0].contentRect.width);
      if (w === lastWidth) return;   // eigene Höhenänderungen ignorieren
      lastWidth = w;
      run();
    });
    resizeWatch.observe(host);

    // Ändert sich nur die Höhe der Karte (Schrift geladen, Text umgebrochen),
    // reicht es, die Zeitleiste nachzuführen. Die Linie selbst ändert keine
    // Höhe, eine Schleife ist damit ausgeschlossen.
    if (railWatch) railWatch.disconnect();
    var map = host.querySelector('.journey-map');
    if (map) {
      railWatch = new ResizeObserver(function () { placeRail(host); });
      railWatch.observe(map);
    }
  }

  /* Hauptkachel ein-/ausklappen. Standard: eingeklappt; die Wahl bleibt
     auf diesem Gerät gespeichert. */
  var HERO_KEY = 'g04fit.journeyHeroOpen';
  function heroOpen() {
    try { return localStorage.getItem(HERO_KEY) === '1'; } catch (e) { return false; }
  }
  function setHeroOpen(v) {
    try { localStorage.setItem(HERO_KEY, v ? '1' : '0'); } catch (e) {}
  }

  function heroSummary(li) {
    return '<button class="journey-hero__summary" type="button" data-act="hero-toggle" aria-expanded="false">' +
      '<span class="journey-hero__sum-ring">' + G.charts.ring(li.pct, { size: 58, stroke: 5, value: li.level, label: 'Level' }) + '</span>' +
      '<span class="journey-hero__sum-copy">' +
      '<span class="journey-hero__sum-eyebrow">Aktuelle Region</span>' +
      '<b><span class="journey-hero__region-icon">' + li.region.icon + '</span> ' + u.esc(li.region.name) + '</b>' +
      '<span class="journey-hero__sum-bar"><span style="width:' + Math.round(li.pct * 100) + '%"></span></span>' +
      '<span class="journey-hero__sum-meta">Noch ' + (li.need - li.into) + ' XP bis Level ' + (li.level + 1) + '</span>' +
      '</span>' +
      '<span class="journey-hero__sum-more"><span>Details</span>' + u.icon('chevron', 18) + '</span>' +
      '</button>';
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

        '<section class="journey-hero card card--hero card--hl' + (heroOpen() ? '' : ' is-collapsed') + '" data-region="' + li.region.key + '"' +
        // url() in einer CSS-Variablen gilt relativ zum Stylesheet (css/), nicht zur Seite: daher "../".
        ' style="--journey-sum-image:url(\'../' + li.region.image + '\');--journey-image-position:' + (li.region.imagePosition || 'center') + '">' +
        heroSummary(li) +
        '<div class="journey-hero__scene" style="background-image:url(\'' + li.region.image + '\');--journey-image-position:' + (li.region.imagePosition || 'center') + '" aria-hidden="true"></div>' +
        // Kopf: Ring und Titel. Fuß: Beschreibung, Werte und Fortschritt.
        // Dazwischen bleibt die Person im Bild frei (siehe fitHero()).
        '<div class="journey-hero__ring">' + G.charts.ring(li.pct, { size: 126, stroke: 7, value: li.level, label: 'Level' }) + '</div>' +
        '<div class="journey-hero__details">' +
        '<p class="muted small">Aktuelle Region</p>' +
        '<h2 class="big"><span class="journey-hero__region-icon">' + li.region.icon + '</span> ' + u.esc(li.region.name) + '</h2>' +
        '</div>' +
        '<div class="journey-hero__foot">' +
        '<p class="muted small journey-hero__desc">' + u.esc(li.region.desc) + '</p>' +
        '<div class="row row--wrap journey-hero__pills">' +
        '<span class="pill pill--neon">' + s.journey.xp + ' XP gesamt</span>' +
        '<span class="pill pill--gold">' + s.journey.completed + ' Einheiten</span>' +
        '<span class="pill pill--cyan">Serie ' + s.journey.streak + '</span>' +
        '</div>' +
        '<div class="journey-hero__progress"><div class="bar"><span class="bar__fill" style="width:' + Math.round(li.pct * 100) + '%"></span></div>' +
        '<p class="tiny dim">Noch ' + (li.need - li.into) + ' XP bis Level ' + (li.level + 1) + '. Eine Einheit bringt je nach Umfang etwa 60–200 XP.</p></div>' +
        '<button class="btn btn--sm btn--ghost journey-hero__less" type="button" data-act="hero-toggle" aria-expanded="true">' +
        u.icon('chevron', 16) + ' Weniger anzeigen</button>' +
        '</div>' +
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
      watchSize(host);

      // Direkt an die (bei jedem Rendern neue) Kachel gebunden, damit sich
      // bei erneutem mount() keine doppelten Klick-Handler ansammeln.
      var hero = host.querySelector('.journey-hero');
      if (hero) hero.addEventListener('click', function (e) {
        if (!e.target.closest('[data-act="hero-toggle"]')) return;
        var open = hero.classList.toggle('is-collapsed') === false;
        setHeroOpen(open);
        hero.querySelectorAll('[data-act="hero-toggle"]').forEach(function (b) {
          b.setAttribute('aria-expanded', b.classList.contains('journey-hero__summary') ? 'false' : 'true');
        });
        fitAll(host);
        if (!open) hero.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });

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
