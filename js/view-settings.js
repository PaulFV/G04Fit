/* ============================================================
   G04Fit — Einstellungen
   Eine Übersichtsseite mit Kachel-Gruppen (22.10.2026):
   „Ich & Training“, „App“, „Daten & Hilfe“. Profil-Bereiche öffnen
   wie bisher ein Fenster; Coach, Erinnerungen, Datenschutz und
   Feedback öffnen eine Unterseite mit „‹ Einstellungen“ zurück.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var PAGES = {
    coach: 'Coach',
    reminders: 'Erinnerungen',
    privacy: 'Datenschutz & Sicherung',
    feedback: 'Feedback & Ideen'
  };
  var tab = 'home';

  function inner() {
    if (tab === 'home') return G.views.profile;
    if (tab === 'feedback') return G.views.profile && G.views.profile.feedback;
    return G.views[tab];
  }

  /** Kurzinfos für die Link-Kacheln (Coach, Erinnerungen …) */
  function pageSum(k) {
    if (k === 'feedback') return 'Fehler, Ideen, Wünsche';
    var v = G.views[k];
    var s = v && (typeof v.sub === 'function' ? v.sub() : v.sub);
    return u.esc(s || '');
  }
  function warnCount() {
    return G.coach && G.coach.allowed()
      ? G.coach.insights().filter(function (i) { return i.kind === 'warn'; }).length : 0;
  }
  /** Link-Kacheln, die profile.render() in die Gruppen einsetzt */
  function linkTile(k, color, icon, title) {
    var warn = k === 'coach' ? warnCount() : 0;
    return '<button type="button" class="set-tile card set-tile--' + color + '" data-st="' + k + '">' +
      '<span class="set-tile__top"><span class="set-tile__ic">' + u.icon(icon, 18) + '</span>' +
      (warn ? '<i class="settings-tabs__badge set-tile__badge">' + warn + '</i>' : '') + '</span>' +
      '<b class="set-tile__title">' + u.esc(title) + '</b>' +
      '<span class="set-tile__sum">' + pageSum(k) + '</span></button>';
  }

  G.views.settings = {
    title: 'Einstellungen',
    linkTile: linkTile,
    sub: function () {
      if (tab === 'home') return 'Profil, App und Daten';
      if (tab === 'feedback') return 'Fehler, Ideen, Wünsche';
      var v = inner();
      return v ? (typeof v.sub === 'function' ? v.sub() : (v.sub || '')) : '';
    },
    setTab: function (t) {
      if (t === 'profile' || t === 'home') { tab = 'home'; return; }
      if (PAGES[t]) tab = t;
    },
    render: function (params) {
      var v = inner();
      if (tab === 'home') return '<div class="view stack settings-view settings-home">' + (v ? v.render(params) : '') + '</div>';
      return '<div class="view stack settings-view">' +
        '<div class="set-back-bar"><button type="button" class="set-back" data-st="home">' + u.icon('chevron', 18) + '<span>Einstellungen</span></button>' +
        '<h2 class="set-back-bar__t">' + u.esc(PAGES[tab]) + '</h2></div>' +
        (v ? v.render(params) : '') + '</div>';
    },
    unmount: function () {
      var v = inner();
      if (v && v.unmount) v.unmount();
    },
    mount: function (host) {
      u.on(host, 'click', '[data-st]', function (e, t) {
        var v = inner();
        if (v && v.unmount) { try { v.unmount(); } catch (err) {} }
        tab = t.getAttribute('data-st');
        G.app.rerender();
        try { window.scrollTo(0, 0); } catch (err) {}
      });
      var v = inner();
      if (v && v.mount) v.mount(host);
    }
  };
})(G04Fit);
