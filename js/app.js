/* ============================================================
   G04Fit v2.0.0 — Anwendung, Navigation, Start
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;

  /* Die zehn Bereiche aus dem Konzept, Abschnitt 13 */
  var NAV = [
    { k: 'dashboard', n: 'Dashboard', ic: 'dashboard', tab: true },
    { k: 'journey', n: 'Journey', ic: 'journey', tab: true },
    { k: 'workout', n: 'Workout', ic: 'workout', tab: true },
    { k: 'exercises', n: 'Übungen', ic: 'exercises', tab: true },
    { k: 'progress', n: 'Fortschritt', ic: 'progress', tab: true },
    { k: 'profile', n: 'Profil', ic: 'profile' },
    { k: 'coach', n: 'G04Fit Coach', ic: 'coach' },
    { k: 'reminders', n: 'Erinnerungen', ic: 'reminders' },
    { k: 'obsidian', n: 'Obsidian', ic: 'obsidian' },
    { k: 'privacy', n: 'Datenschutz', ic: 'privacy' }
  ];

  var current = 'dashboard';
  var currentParams = null;

  function themeIcon(theme) {
    if (theme === 'light') {
      return '<svg class="ui-icon icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M20.2 15.2A8 8 0 018.8 3.8 8.5 8.5 0 1020.2 15.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    }
    return '<svg class="ui-icon icon-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  function menuIcon(open) {
    return open
      ? '<svg class="ui-icon icon-close" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg class="ui-icon icon-menu" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  }

  function applyTheme(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F3F7F5' : '#05070A');
    var button = u.$('#themeBtn');
    if (button) {
      var isLight = theme === 'light';
      var label = isLight ? 'Dunklen Modus aktivieren' : 'Hellen Modus aktivieren';
      button.innerHTML = themeIcon(theme);
      button.title = label;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    }
    return theme;
  }

  function setTheme(theme) {
    var selected = applyTheme(theme);
    G.store.state.settings.theme = selected;
    G.store.commit('theme');
  }

  /* ------------------------------------------------------------
     Navigation aufbauen
     ------------------------------------------------------------ */
  function buildNav() {
    var s = G.store.state;

    u.$('#nav').innerHTML = NAV.map(function (v) {
      var badge = '';
      if (v.k === 'workout' && s.session) badge = '<span class="nav__badge">läuft</span>';
      if (v.k === 'coach' && G.coach.allowed()) {
        var n = G.coach.insights().filter(function (i) { return i.kind === 'warn'; }).length;
        if (n) badge = '<span class="nav__badge">' + n + '</span>';
      }
      return '<button class="nav__item" data-nav="' + v.k + '">' +
        u.icon(v.ic, 19) + '<span>' + u.esc(v.n) + '</span>' + badge + '</button>';
    }).join('');

    u.$('#tabbar').innerHTML = NAV.filter(function (v) { return v.tab; }).map(function (v) {
      return '<button class="tabbar__item" data-nav="' + v.k + '">' +
        u.icon(v.ic, 21) + '<span>' + u.esc(v.n) + '</span></button>';
    }).join('');

    markActive();
  }

  function markActive() {
    u.$$('[data-nav]').forEach(function (b) {
      var on = b.getAttribute('data-nav') === current;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------
     Kopfzeile und Seitenleiste
     ------------------------------------------------------------ */
  function updateChrome() {
    var s = G.store.state;
    var li = G.store.levelInfo();

    var chip = u.$('#streakChip');
    var streak = s.journey.streak;
    chip.innerHTML = u.icon('flame', 15) + ' ' + streak;
    chip.classList.toggle('is-hot', streak >= 3);
    var streakLabel = streak
      ? 'Trainingsserie: ' + streak + (streak === 1 ? ' Woche' : ' Wochen') + ' in Folge'
      : 'Noch keine Serie – trainiere diese Woche, um zu starten.';
    chip.title = streakLabel;
    chip.setAttribute('aria-label', streakLabel);

    u.$('#sideLevel').innerHTML =
      G.avatar.render(40, { ring: li.pct, level: li.level, action: true }) +
      '<div class="lvl-chip__meta" style="margin-left:6px"><b>' +
      u.esc(s.profile.name || 'Level ' + li.level) + '</b>' +
      '<span>' + u.esc(li.title) + ' · Level ' + li.level + '</span></div>';
  }

  /* ------------------------------------------------------------
     Ansicht wechseln
     ------------------------------------------------------------ */
  var lastView = null;

  function render(afterFn) {
    var view = G.views[current];
    if (!view) { current = 'dashboard'; view = G.views.dashboard; }

    if (lastView && lastView.unmount) {
      try { lastView.unmount(); } catch (e) { console.error(e); }
    }

    u.$('#viewTitle').textContent = typeof view.title === 'function' ? view.title() : view.title;
    var sub = typeof view.sub === 'function' ? view.sub() : (view.sub || '');
    u.$('#viewSub').textContent = sub;
    document.title = 'G04Fit — ' + (typeof view.title === 'function' ? view.title() : view.title);

    // #viewHost wird bei jedem render() durch einen frischen, leeren Klon
    // ersetzt (statt nur sein innerHTML zu ersetzen). Grund: mount() einer
    // View hängt per u.on(host, ...) Klick-/Input-Handler an genau dieses
    // Element; wäre es über die ganze App-Laufzeit dasselbe DOM-Element,
    // würden sich bei jedem erneuten Aufruf von render() (Tab-Wechsel,
    // "+ Satz", jede Aktion mit rerender()) weitere Handler dazu addieren,
    // ohne dass alte je entfernt werden — nach einigen Wechseln feuert dann
    // z. B. ein Klick mehrfach. Der Klon startet garantiert ohne jeden
    // zuvor angehängten Handler; die alten hängen zwar technisch noch am
    // alten (jetzt aus dem DOM entfernten) Knoten, bekommen aber nie wieder
    // ein echtes Klick-Event. Genau dieser Mechanismus stand hinter dem
    // Häkchen-Bug im Workout und betraf grundsätzlich jede View.
    var oldHost = u.$('#viewHost');
    var host = oldHost.cloneNode(false);
    host.innerHTML = view.render(currentParams) || '';
    oldHost.replaceWith(host);

    if (view.mount) {
      try { view.mount(host); } catch (e) { console.error(e); }
    }
    lastView = view;

    // Navigationsknöpfe innerhalb einer Ansicht
    u.on(host, 'click', '[data-go]', function (e, t) {
      go(t.getAttribute('data-go'));
    });

    buildNav();
    updateChrome();
    if (G.i18n) G.i18n.apply(document.body);
    if (afterFn) afterFn();
  }

  function go(key, params) {
    if (!G.views[key]) return;
    current = key;
    currentParams = params || null;
    closeMobileNav();
    if (location.hash !== '#' + key) {
      history.replaceState(null, '', '#' + key);
    }
    render();
    var main = u.$('#main');
    if (main) main.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function rerender(afterFn) {
    currentParams = null;
    render(afterFn);
  }

  /* ------------------------------------------------------------
     Mobile Navigation
     ------------------------------------------------------------ */
  function openMobileNav() {
    var sidebar = u.$('.sidebar');
    sidebar.classList.add('is-open');
    var menu = u.$('#mobileMenuBtn');
    menu.innerHTML = menuIcon(true);
    menu.setAttribute('aria-label', 'Menü schließen');
    menu.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    u.$('#scrim').hidden = false;
  }
  function closeMobileNav() {
    var sb = u.$('.sidebar');
    if (sb) sb.classList.remove('is-open');
    var menu = u.$('#mobileMenuBtn');
    if (menu) {
      menu.innerHTML = menuIcon(false);
      menu.setAttribute('aria-label', 'Menü öffnen');
      menu.setAttribute('aria-expanded', 'false');
    }
    if (u.$('#sheet').hidden) document.body.style.overflow = '';
    if (u.$('#sheet').hidden) u.$('#scrim').hidden = true;
  }

  /* ------------------------------------------------------------
     Start
     ------------------------------------------------------------ */
  function boot() {
    G.store.load();
    var s = G.store.state;

    applyTheme(s.settings.theme);
    if (s.settings.reduceMotion) document.body.classList.add('no-motion');
    G.store.recomputeStreak();

    // Globale Ereignisse
    document.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]');
      if (nav) { go(nav.getAttribute('data-nav')); return; }

      // Avatar antippen öffnet überall die Bildauswahl
      var av = e.target.closest('[data-avatar-pick]');
      if (av) { e.preventDefault(); G.avatar.choose(); return; }
    });

    u.$('#mobileMenuBtn').addEventListener('click', openMobileNav);
    u.$('#themeBtn').addEventListener('click', function () {
      setTheme(G.store.state.settings.theme === 'light' ? 'dark' : 'light');
    });
    u.$('#privacyBtn').addEventListener('click', function () { go('privacy'); });
    u.$('#sheetClose').addEventListener('click', u.closeSheet);
    u.$('#scrim').addEventListener('click', function () {
      if (!u.$('#sheet').hidden) u.closeSheet();
      closeMobileNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!u.$('#sheet').hidden) u.closeSheet();
        closeMobileNav();
      }
    });

    window.addEventListener('hashchange', function () {
      var k = location.hash.replace('#', '');
      if (k && G.views[k] && k !== current) go(k);
    });

    // Ersteinrichtung oder App
    if (!s.onboarded) {
      G.onboarding.start();
      return;
    }

    u.$('#app').hidden = false;
    var start = location.hash.replace('#', '');
    current = G.views[start] ? start : 'dashboard';
    render();

    if (G.store.hasConsent('push')) G.reminders.start();

    // Hinweis, falls der Browser nichts speichern darf
    if (!G.store.storageOk) {
      u.toast('Kein lokaler Speicher', 'Der Browser blockiert Website-Daten. G04Fit vergisst alles beim Schließen.', 'warn', 7000);
    }

    // Laufende Einheit aus einer früheren Sitzung
    if (s.session) {
      u.toast('Einheit fortsetzen', s.session.title + ' ist noch offen.', 'ok', 5000);
    }
  }

  /* ------------------------------------------------------------
     Service Worker (nur über http/https sinnvoll)
     ------------------------------------------------------------ */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;

    // Falls bereits eine ältere installierte G04Fit-Version läuft, übernimmt
    // der neue Worker sofort. Danach einmal neu laden, damit HTML, Daten und
    // Ansichten garantiert aus derselben Version stammen.
    var hadController = !!navigator.serviceWorker.controller;
    var reloadingForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController) return;
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      location.reload();
    });

    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (registration) {
      return registration.update();
    }).catch(function () { /* offline-Betrieb bleibt optional */ });
  }

  G.app = {
    NAV: NAV,
    go: go,
    rerender: rerender,
    setTheme: setTheme,
    get current() { return current; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); registerSW(); });
  } else {
    boot(); registerSW();
  }
})(G04Fit);
