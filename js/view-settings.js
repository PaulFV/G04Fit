/* ============================================================
   G04Fit — Einstellungen
   Ein Reiter für alles, was man nur selten braucht: Profil,
   Coach, Erinnerungen, Datenschutz und Feedback & Ideen.
   Die einzelnen Bereiche sind die bisherigen Ansichten; sie werden
   hier nur eingebettet (20.10.2026).
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var TABS = [
    { k: 'profile', n: 'Profil' },
    { k: 'coach', n: 'Coach' },
    { k: 'reminders', n: 'Erinnerungen' },
    { k: 'privacy', n: 'Datenschutz' },
    { k: 'feedback', n: 'Feedback' }
  ];
  var tab = 'profile';

  function inner() {
    if (tab === 'feedback') return G.views.profile && G.views.profile.feedback;
    return G.views[tab];
  }

  G.views.settings = {
    title: 'Einstellungen',
    sub: function () {
      var v = inner();
      if (!v || tab === 'feedback') return 'Fehler, Ideen, Wünsche';
      return typeof v.sub === 'function' ? v.sub() : (v.sub || '');
    },
    setTab: function (t) {
      for (var i = 0; i < TABS.length; i++) if (TABS[i].k === t) { tab = t; return; }
    },
    render: function (params) {
      var v = inner();
      var warn = G.coach && G.coach.allowed()
        ? G.coach.insights().filter(function (i) { return i.kind === 'warn'; }).length : 0;
      return '<div class="view stack settings-view">' +
        '<div class="tabs progress-tabs progress-tabs--5 settings-tabs" role="tablist">' + TABS.map(function (t) {
          return '<button class="tabs__b progress-tabs__button' + (tab === t.k ? ' is-on' : '') + '" data-st="' + t.k + '" role="tab" aria-selected="' + (tab === t.k) + '">' +
            u.esc(t.n) + (t.k === 'coach' && warn ? '<i class="settings-tabs__badge">' + warn + '</i>' : '') + '</button>';
        }).join('') + '</div>' +
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
      });
      var v = inner();
      if (v && v.mount) v.mount(host);
    }
  };
})(G04Fit);
