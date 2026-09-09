/* ============================================================
   G04Fit — Obsidian
   Konzept Abschnitt 9: optionale Verbindung, Trainingsprotokolle
   und ausgewählte Auswertungen als Markdown; ausschließlich nach
   ausdrücklicher Zustimmung.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var preview = { mode: 'overview', sessionId: null };

  function lockedView() {
    return '<div class="view stack">' +
      '<div class="card card--hero">' +
      '<div class="row" style="gap:16px;align-items:flex-start">' +
      '<div class="coach__av" style="animation:none">' + u.icon('lock', 20) + '</div>' +
      '<div style="flex:1">' +
      '<h2 style="font-size:20px;margin-bottom:6px">Obsidian-Verbindung ist aus</h2>' +
      '<p class="muted small">G04Fit kann Trainingsprotokolle und Auswertungen als Markdown-Dateien ' +
      'für deinen Vault erzeugen. Das passiert nur, wenn du dem ausdrücklich zustimmst.</p>' +
      '<div class="btn-row" style="margin-top:18px">' +
      '<button class="btn btn--primary" data-act="enable">Obsidian-Export erlauben</button>' +
      '<button class="btn btn--ghost" data-go="privacy">Datenschutz öffnen</button>' +
      '</div></div></div></div>' +

      '<div class="card">' +
      '<div class="card__head">' + u.icon('obsidian', 18) + '<h3>Was erzeugt wird</h3></div>' +
      '<ul class="small muted" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px">' +
      '<li>Je Einheit eine Notiz mit Frontmatter, Satztabelle und Volumen</li>' +
      '<li>Eine Übersichtsnotiz mit Level, Rekorden und den letzten Einheiten</li>' +
      '<li>Auf Wunsch die Empfehlungen des Coach für die nächste Einheit</li>' +
      '</ul></div></div>';
  }

  function currentMarkdown() {
    var s = G.store.state;
    if (preview.mode === 'overview') return G.obsidian.overviewNote();
    if (preview.mode === 'all') return G.obsidian.exportAllNotes() || '';
    var sess = s.history.filter(function (x) { return x.id === preview.sessionId; })[0];
    return sess ? G.obsidian.sessionNote(sess) : G.obsidian.overviewNote();
  }

  function currentFilename() {
    var s = G.store.state;
    if (preview.mode === 'overview') return 'G04Fit Übersicht.md';
    if (preview.mode === 'all') return 'G04Fit Export ' + u.today() + '.md';
    var sess = s.history.filter(function (x) { return x.id === preview.sessionId; })[0];
    return sess ? G.obsidian.sessionFilename(sess) : 'G04Fit.md';
  }

  G.views.obsidian = {
    title: 'Obsidian',
    sub: function () {
      var s = G.store.state;
      if (!G.obsidian.allowed()) return 'Nicht verbunden';
      return s.obsidian.lastSync
        ? 'Zuletzt ausgegeben ' + u.relDay(u.isoDay(new Date(s.obsidian.lastSync)))
        : 'Bereit zum Export';
    },
    render: function (params) {
      if (!G.obsidian.allowed()) return lockedView();

      var s = G.store.state;
      if (params && params.session) {
        preview.mode = 'session';
        preview.sessionId = params.session.id;
      }

      var md = currentMarkdown();

      return '<div class="view stack">' +

        '<div class="card card--hero card--hl">' +
        '<div class="row" style="gap:16px;flex-wrap:wrap">' +
        '<div class="coach__av" style="animation:none;color:var(--cyan);border-color:rgba(34,211,238,.4)">' +
        u.icon('obsidian', 20) + '</div>' +
        '<div style="flex:1;min-width:200px">' +
        '<h2 style="font-size:20px">Markdown für deinen Vault</h2>' +
        '<p class="muted small" style="margin-top:5px">' +
        'G04Fit erzeugt fertige Notizen. Kopiere sie in deinen Vault oder speichere sie direkt ' +
        'in den unten angegebenen Ordner.</p></div>' +
        '<div class="btn-row">' +
        '<button class="btn btn--ghost" data-act="disable">Verbindung trennen</button>' +
        '</div></div></div>' +

        '<div class="grid grid--2">' +

        /* Einstellungen */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('profile', 18) + '<h3>Ziel im Vault</h3></div>' +
        '<div class="stack" style="--sp:14px">' +
        '<div class="field"><label>Vault-Pfad</label>' +
        '<input class="input" id="obVault" type="text" placeholder="C:\\Users\\...\\Obsidian\\MeinVault" value="' +
        u.esc(s.obsidian.vault) + '">' +
        '<span class="field__hint">Nur zur Anzeige – G04Fit schreibt nicht selbst in den Ordner.</span></div>' +
        '<div class="field"><label>Unterordner</label>' +
        '<input class="input" id="obFolder" type="text" placeholder="G04Fit" value="' + u.esc(s.obsidian.folder) + '">' +
        '</div>' +
        '<label class="switch"><input type="checkbox" id="obAi"' + (s.obsidian.includeAi ? ' checked' : '') + '>' +
        '<span class="switch__track"></span>' +
        '<span class="switch__label"><b>Coach-Auswertung mitschreiben</b>' +
        '<span>Empfehlungen und Beobachtungen erscheinen in der Notiz. Benötigt die Einwilligung KI-Analyse.</span></span></label>' +
        '<div class="note">' + u.icon('info', 17) +
        '<div>Zielpfad der aktuellen Notiz:<br><span class="mono tiny">' +
        u.esc(G.obsidian.targetPath(preview.mode === 'session'
          ? s.history.filter(function (x) { return x.id === preview.sessionId; })[0] : null)) +
        '</span></div></div>' +
        '</div></div>' +

        /* Auswahl */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('exercises', 18) + '<h3>Was ausgeben?</h3></div>' +
        '<div class="chips" style="margin-bottom:14px">' +
        '<button class="chip' + (preview.mode === 'overview' ? ' is-on' : '') + '" data-pm="overview">Übersicht</button>' +
        '<button class="chip' + (preview.mode === 'session' ? ' is-on' : '') + '" data-pm="session">Einzelne Einheit</button>' +
        '<button class="chip' + (preview.mode === 'all' ? ' is-on' : '') + '" data-pm="all">Alles</button>' +
        '</div>' +
        (preview.mode === 'session'
          ? (s.history.length
            ? '<select class="select" id="obSess">' + s.history.slice().reverse().map(function (x) {
              return '<option value="' + x.id + '"' + (x.id === preview.sessionId ? ' selected' : '') + '>' +
                u.esc(u.fmtDate(x.day) + ' — ' + x.title) + '</option>';
            }).join('') + '</select>'
            : '<p class="small muted">Noch keine gespeicherten Einheiten vorhanden.</p>')
          : '') +
        '<div class="stack" style="--sp:10px;margin-top:16px">' +
        '<button class="btn btn--primary btn--block" data-act="copy">' + u.icon('share', 17) + ' In die Zwischenablage</button>' +
        '<button class="btn btn--cyan btn--block" data-act="download">' + u.icon('download', 17) + ' Als .md speichern</button>' +
        (s.history.length > 1 ? '<button class="btn btn--block" data-act="download-all">' +
          u.icon('download', 17) + ' Alle Notizen als eine Datei</button>' : '') +
        '</div>' +
        (s.obsidian.lastSync ? '<p class="tiny dim" style="margin-top:12px">Zuletzt ausgegeben: ' +
          u.esc(new Date(s.obsidian.lastSync).toLocaleString('de-DE')) + '</p>' : '') +
        '</div></div>' +

        /* Vorschau */
        '<div class="card">' +
        '<div class="card__head">' + u.icon('obsidian', 18) + '<h3>Vorschau</h3>' +
        '<span class="spacer"></span><span class="pill pill--muted mono tiny">' + u.esc(currentFilename()) + '</span></div>' +
        '<div class="code">' + u.esc(md) + '</div>' +
        '</div>' +

        '<div class="note note--warn">' + u.icon('warn', 18) +
        '<div>Ein direkter Schreibzugriff auf deinen Vault ist aus dem Browser heraus nicht möglich – ' +
        'und wäre ohne ausdrückliche Freigabe auch nicht wünschenswert. Für eine automatische ' +
        'Synchronisation braucht es später ein Obsidian-Plugin oder einen lokalen Dienst.</div></div>' +

        '</div>';
    },
    mount: function (host) {
      var s = G.store.state;

      u.on(host, 'click', '[data-act="enable"]', function () {
        G.store.setConsent('obsidian', true);
        u.toast('Obsidian aktiv', 'G04Fit kann jetzt Markdown-Notizen erzeugen.', 'ok');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="disable"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Verbindung trennen',
          body: 'Die Einwilligung für den Obsidian-Export wird widerrufen. Bereits exportierte Dateien in deinem Vault bleiben unberührt.',
          ok: 'Trennen'
        });
        if (!ok) return;
        G.store.setConsent('obsidian', false);
        G.app.rerender();
      });

      u.on(host, 'click', '[data-pm]', function (e, t) {
        preview.mode = t.getAttribute('data-pm');
        if (preview.mode === 'session' && !preview.sessionId && s.history.length) {
          preview.sessionId = s.history[s.history.length - 1].id;
        }
        G.app.rerender();
      });

      var sel = host.querySelector('#obSess');
      if (sel) sel.addEventListener('change', function () {
        preview.sessionId = sel.value;
        G.app.rerender();
      });

      ['obVault', 'obFolder'].forEach(function (id) {
        var e = host.querySelector('#' + id);
        if (!e) return;
        e.addEventListener('input', u.debounce(function () {
          s.obsidian[id === 'obVault' ? 'vault' : 'folder'] = e.value;
          G.store.commit('obsidian');
        }, 400));
      });

      var ai = host.querySelector('#obAi');
      if (ai) ai.addEventListener('change', function () {
        s.obsidian.includeAi = ai.checked;
        G.store.commit('obsidian');
        if (ai.checked && !G.coach.allowed()) {
          u.toast('Hinweis', 'Die Auswertung erscheint erst, wenn auch die Einwilligung KI-Analyse erteilt ist.', 'warn', 5200);
        }
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="copy"]', async function () {
        var ok = await u.copy(currentMarkdown());
        if (ok) {
          G.obsidian.markSynced();
          u.toast('Kopiert', 'Füge die Notiz in Obsidian ein.', 'ok');
        } else {
          u.toast('Kopieren fehlgeschlagen', 'Markiere den Text in der Vorschau und kopiere ihn manuell.', 'warn');
        }
      });

      u.on(host, 'click', '[data-act="download"]', function () {
        var ok = u.download(currentFilename(), currentMarkdown(), 'text/markdown');
        if (ok) { G.obsidian.markSynced(); u.toast('Gespeichert', currentFilename(), 'ok'); }
        else u.toast('Nicht möglich', 'Der Download wurde vom Browser blockiert.', 'err');
      });

      u.on(host, 'click', '[data-act="download-all"]', function () {
        var all = G.obsidian.exportAllNotes();
        if (!all) return;
        var ok = u.download('G04Fit Export ' + u.today() + '.md', all, 'text/markdown');
        if (ok) { G.obsidian.markSynced(); u.toast('Gespeichert', 'Alle Notizen in einer Datei.', 'ok'); }
      });
    }
  };
})(G04Fit);
