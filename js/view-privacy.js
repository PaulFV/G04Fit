/* ============================================================
   GoFit — Datenschutz (Privacy First)
   Konzept Abschnitt 10 und 11: getrennte Einwilligungen,
   Export, Löschung, jederzeitiger Widerruf, Entwurf der
   Datenschutzerklärung.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  G.views = G.views || {};

  var CONSENTS = [
    {
      k: 'profile', t: 'Profil, Foto & Einstellungen speichern',
      d: 'Name, Alter, Größe, Gewicht, Erfahrungsstufe, Ziele, Trainingstage, Startgewichte und dein ' +
        'Trainings-Avatar bleiben auf diesem Gerät erhalten. Ohne diese Einwilligung sind alle Angaben ' +
        'nach dem Schließen weg.',
      data: 'Profildaten, Foto, App-Einstellungen, Level und XP'
    },
    {
      k: 'history', t: 'Trainingshistorie & Rekorde',
      d: 'Abgeschlossene Einheiten mit Sätzen, Gewichten und Wiederholungen werden gespeichert. ' +
        'Nur damit gibt es Fortschritt, Bestleistungen und Verlaufskurven.',
      data: 'Datum, Übungen, Sätze, Gewicht, Wiederholungen, Notizen'
    },
    {
      k: 'ai', t: 'Auswertung durch den GoFit Coach',
      d: 'Der Coach analysiert deine gespeicherten Trainingsdaten und leitet daraus Vorschläge für Gewicht, ' +
        'Wiederholungen, Progression und Wiedereinstieg ab. Die Berechnung läuft ausschließlich auf diesem Gerät.',
      data: 'Trainingshistorie, Rekorde, Pausen zwischen Einheiten'
    },
    {
      k: 'obsidian', t: 'Obsidian-Synchronisation',
      d: 'GoFit erzeugt Markdown-Notizen für deinen Vault. Der Export erfolgt nur, wenn du ihn selbst auslöst.',
      data: 'Trainingsprotokolle, optional Coach-Auswertungen'
    },
    {
      k: 'push', t: 'Erinnerungen & Benachrichtigungen',
      d: 'GoFit erinnert an geplante Einheiten und meldet sich nach längeren Pausen. ' +
        'Systembenachrichtigungen benötigen zusätzlich die Erlaubnis des Browsers.',
      data: 'Zufällige Geräte-ID, Push-Anmeldung, Trainingstage, Uhrzeit und Zeitzone'
    }
  ];

  function consentCard(c) {
    var on = G.store.hasConsent(c.k);
    return '<div class="card' + (on ? ' card--hl' : '') + '">' +
      '<label class="switch" style="padding:0">' +
      '<input type="checkbox" data-consent="' + c.k + '"' + (on ? ' checked' : '') + '>' +
      '<span class="switch__track"></span>' +
      '<span class="switch__label">' +
      '<b>' + u.esc(c.t) + '</b>' +
      '<span>' + u.esc(c.d) + '</span>' +
      '</span></label>' +
      '<div class="row row--wrap" style="gap:7px;margin-top:14px;padding-left:55px">' +
      '<span class="pill ' + (on ? 'pill--neon' : 'pill--muted') + '">' +
      u.icon(on ? 'check' : 'lock', 12) + (on ? 'erteilt' : 'nicht erteilt') + '</span>' +
      '<span class="pill pill--muted tiny">' + u.esc(c.data) + '</span>' +
      '</div></div>';
  }

  function storageInfo() {
    var s = G.store.state;
    var size = 0;
    try { size = (localStorage.getItem('gofit.v1') || '').length; } catch (e) { /* egal */ }
    return '<div class="grid grid--3" style="--sp:12px">' +
      statCard('Gespeicherte Einheiten', s.history.length) +
      statCard('Rekorde', Object.keys(s.records).length) +
      statCard('Belegter Speicher', size ? (size / 1024).toFixed(1).replace('.', ',') + ' KB' : '0 KB') +
      '</div>';
  }

  function statCard(k, v) {
    return '<div class="card card--pad-sm"><div class="stat">' +
      '<span class="stat__k">' + u.esc(k) + '</span>' +
      '<span class="stat__v">' + u.esc(String(v)) + '</span></div></div>';
  }

  /* ------------------------------------------------------------
     Datenschutzerklärung (Entwurf, Konzept Abschnitt 11)
     ------------------------------------------------------------ */
  var POLICY = [
    ['Verantwortlicher',
      'GoFit läuft in dieser Fassung vollständig auf deinem Gerät. Es gibt keinen Serverbetrieb und keine ' +
      'Benutzerkonten. Verantwortlich für die Verarbeitung ist damit die Person, die die App auf ihrem Gerät ' +
      'nutzt. Sobald eine spätere Version ein Backend erhält, ist hier der Betreiber mit Anschrift und ' +
      'Kontaktmöglichkeit einzutragen.'],
    ['Welche Daten verarbeitet werden',
      'Profilangaben (Name oder Spitzname, Alter, Größe, Gewicht, Erfahrungsstufe, Ziele), ein optionales ' +
      'Profilfoto als Trainings-Avatar, Trainingsdaten (Datum, Übungen, Sätze, Gewichte, Wiederholungen, ' +
      'Notizen), abgeleitete Werte (Volumen, geschätztes Maximum, Level, XP, Serien) sowie App-Einstellungen. ' +
      'Es werden keine Gesundheitsdaten im Sinne einer medizinischen Diagnose erhoben.'],
    ['Trainings-Avatar (Foto)',
      'Das Foto wird ausschließlich im lokalen Speicher dieses Browsers abgelegt und nur zur Anzeige ' +
      'in der App verwendet. Es findet keine Gesichtserkennung, keine biometrische Auswertung und keine ' +
      'Übertragung statt. Du kannst es jederzeit im Profil austauschen, entfernen oder die Anzeige ganz ' +
      'abschalten; beim Löschen der Daten wird es mit entfernt.'],
    ['Rechtsgrundlage',
      'Die Verarbeitung erfolgt ausschließlich auf Grundlage deiner Einwilligung nach Art. 6 Abs. 1 lit. a ' +
      'DSGVO. Die Einwilligungen sind nach Zweck getrennt und einzeln erteilbar.'],
    ['Speicherort und Speicherdauer',
      'Profil, Foto und Trainingsdaten liegen im lokalen Speicher deines Browsers (localStorage) auf dem ' +
      'jeweiligen Gerät. Nur bei aktivierten Benachrichtigungen werden die unter „Benachrichtigungen“ ' +
      'genannten technischen Daten an den Push-Dienst übertragen. Die Daten bleiben erhalten, bis du sie ' +
      'löschst, die jeweilige Einwilligung widerrufst oder die Browserdaten entfernst.'],
    ['Verarbeitung durch den GoFit Coach',
      'Der Coach ist ein regelbasiertes Verfahren, das auf deinem Gerät rechnet. Es werden keine Daten an ' +
      'einen KI-Dienst gesendet. Die Regeln (Wiederholungsbereiche, Gewichtsschritte, Pausenlängen, ' +
      'Wiedereinstieg) sind in der App dokumentiert. Sollte in einer späteren Version ein externer ' +
      'KI-Dienst hinzukommen, ist dafür eine gesonderte Einwilligung nötig.'],
    ['Obsidian',
      'Der Export erzeugt Markdown-Dateien, die du selbst kopierst oder speicherst. GoFit greift nicht ' +
      'eigenständig auf dein Dateisystem zu. Was nach dem Export in deinem Vault passiert, liegt in deiner ' +
      'Verantwortung.'],
    ['Benachrichtigungen',
      'Nach deiner Einwilligung werden eine zufällige Geräte-ID, die technische Web-Push-Anmeldung, ' +
      'Trainingstage, Erinnerungszeit und Zeitzone an den GoFit Push-Dienst auf Cloudflare übertragen. ' +
      'Name, Profil, Trainingsverlauf, Gewichte und Fotos werden nicht übertragen. Beim Widerruf werden ' +
      'die Push-Anmeldung und der zugehörige Zeitplan auf dem Dienst gelöscht.'],
    ['Deine Rechte',
      'Du kannst deine Daten jederzeit als Datei exportieren (Recht auf Datenübertragbarkeit), einzeln oder ' +
      'vollständig löschen (Recht auf Löschung) und jede Einwilligung mit Wirkung für die Zukunft widerrufen. ' +
      'Ein Widerruf löscht die betroffenen Daten in GoFit unmittelbar. Weitere Betroffenenrechte nach ' +
      'Art. 15 bis 21 DSGVO bestehen unabhängig davon.'],
    ['Keine medizinische Beratung',
      'GoFit ist kein Medizinprodukt. Kennzahlen wie Kraft, Ausdauer, Explosivität, Konstanz und Erholung ' +
      'sind ein spielerisches Profil aus deinen Trainingsdaten und ausdrücklich keine medizinischen Werte. ' +
      'Bei Beschwerden oder Vorerkrankungen ist ärztlicher Rat einzuholen.'],
    ['Stand und offene Punkte',
      'Dieser Text ist ein Entwurf für den Prototyp. Vor einer Veröffentlichung ist er mit den tatsächlich ' +
      'eingesetzten Diensten abzugleichen und rechtlich prüfen zu lassen – insbesondere hinsichtlich des ' +
      'Cloudflare Push-Dienstes und möglicher künftiger Benutzerkonten.']
  ];

  function openPolicy() {
    u.openSheet('Datenschutzerklärung', '<div class="stack">' +
      '<div class="note note--warn">' + u.icon('warn', 17) +
      '<div>Entwurf für den Prototyp. Vor einer Veröffentlichung rechtlich prüfen lassen.</div></div>' +
      POLICY.map(function (p, i) {
        return '<div class="card card--pad-sm">' +
          '<h3 style="font-size:14.5px;margin-bottom:8px" class="neon">' + (i + 1) + '. ' + u.esc(p[0]) + '</h3>' +
          '<p class="small muted">' + u.esc(p[1]) + '</p></div>';
      }).join('') +
      '<p class="tiny dim center">Stand: ' + u.fmtDate(u.today()) + ' · GoFit ' + G.VERSION + '</p>' +
      '</div>');
  }

  G.views.privacy = {
    title: 'Datenschutz',
    sub: function () {
      var n = CONSENTS.filter(function (c) { return G.store.hasConsent(c.k); }).length;
      return n + ' von ' + CONSENTS.length + ' Einwilligungen erteilt';
    },
    render: function () {
      var s = G.store.state;
      var given = CONSENTS.filter(function (c) { return G.store.hasConsent(c.k); }).length;

      return '<div class="view stack">' +

        '<div class="card card--hero card--hl">' +
        '<div class="row" style="gap:18px;flex-wrap:wrap">' +
        G.charts.ring(given / CONSENTS.length, {
          size: 96, stroke: 9, value: given + '/' + CONSENTS.length, label: 'aktiv'
        }) +
        '<div style="flex:1;min-width:220px">' +
        '<h2 style="font-size:21px">Privacy First</h2>' +
        '<p class="muted small" style="margin-top:6px">GoFit speichert nichts, solange du nicht ' +
        'ausdrücklich zustimmst. Jede Einwilligung gilt einzeln und ist jederzeit widerrufbar. ' +
        'Alle Daten bleiben auf diesem Gerät.</p>' +
        '<div class="row row--wrap" style="gap:7px;margin-top:14px">' +
        '<span class="pill pill--neon">kein Konto</span>' +
        '<span class="pill pill--neon">kein Server</span>' +
        '<span class="pill pill--neon">kein Tracking</span>' +
        '<span class="pill pill--neon">offline nutzbar</span>' +
        '</div></div></div></div>' +

        (!G.store.storageOk
          ? '<div class="note note--warn">' + u.icon('warn', 18) +
          '<div>Der Browser erlaubt hier keinen lokalen Speicher. GoFit funktioniert, vergisst aber alles ' +
          'beim Schließen. Im privaten Modus oder bei blockierten Website-Daten ist das normal.</div></div>'
          : '') +

        '<div class="sec"><h2>Einwilligungen</h2><span class="sec__line"></span></div>' +
        '<div class="stack" style="--sp:12px">' + CONSENTS.map(consentCard).join('') + '</div>' +

        '<div class="sec"><h2>Gespeicherte Daten</h2><span class="sec__line"></span></div>' +
        storageInfo() +

        '<div class="grid grid--2">' +
        '<div class="card">' +
        '<div class="card__head">' + u.icon('download', 18) + '<h3>Daten mitnehmen</h3></div>' +
        '<p class="small muted" style="margin-bottom:14px">Exportiere alles als JSON-Datei – ' +
        'zur Sicherung oder zum Umzug auf ein anderes Gerät.</p>' +
        '<div class="stack" style="--sp:10px">' +
        '<button class="btn btn--block" data-act="export">' + u.icon('download', 17) + ' Als Datei exportieren</button>' +
        '<button class="btn btn--block btn--ghost" data-act="import">Sicherung einlesen</button>' +
        '<input type="file" id="impFile" accept="application/json,.json" hidden>' +
        '</div></div>' +

        '<div class="card">' +
        '<div class="card__head" style="color:var(--danger)">' + u.icon('trash', 18) + '<h3>Daten löschen</h3></div>' +
        '<p class="small muted" style="margin-bottom:14px">Löschungen wirken sofort und lassen sich ' +
        'nicht rückgängig machen.</p>' +
        '<div class="stack" style="--sp:10px">' +
        '<button class="btn btn--danger btn--block" data-act="del-history">' +
        u.icon('trash', 16) + ' Trainingsdaten löschen</button>' +
        '<button class="btn btn--danger btn--block" data-act="del-all">' +
        u.icon('trash', 16) + ' Alles löschen und zurücksetzen</button>' +
        '</div></div></div>' +

        '<div class="card">' +
        '<div class="card__head">' + u.icon('privacy', 18) + '<h3>Datenschutzerklärung</h3>' +
        '<span class="spacer"></span><span class="pill pill--muted">Entwurf</span></div>' +
        '<p class="small muted" style="margin-bottom:14px">Verantwortlicher, Datenarten, Rechtsgrundlage, ' +
        'Speicherdauer, KI-Verarbeitung, Obsidian, Benachrichtigungen, Löschung, Widerruf und Betroffenenrechte.</p>' +
        '<div class="btn-row">' +
        '<button class="btn" data-act="policy">Vollständig lesen</button>' +
        '<button class="btn btn--ghost" data-act="policy-md">Als Markdown speichern</button>' +
        '</div></div>' +

        '<p class="tiny dim center" style="padding:10px 0 4px">GoFit ' + G.VERSION +
        ' · Push-Dienst nur nach Einwilligung · Einwilligung zuletzt geändert: ' +
        (s.consent.decidedAt ? u.esc(new Date(s.consent.decidedAt).toLocaleString('de-DE')) : 'nie') + '</p>' +

        '</div>';
    },
    mount: function (host) {
      var s = G.store.state;

      u.on(host, 'change', '[data-consent]', async function (e, t) {
        var k = t.getAttribute('data-consent');
        var want = t.checked;

        if (!want) {
          var c = CONSENTS.filter(function (x) { return x.k === k; })[0];
          var extra = k === 'history'
            ? ' <b>Alle gespeicherten Einheiten und Rekorde werden dabei gelöscht.</b>'
            : k === 'profile'
              ? ' <b>Deine Profildaten werden vom Gerät entfernt.</b>'
              : '';
          var ok = await u.confirmSheet({
            title: 'Einwilligung widerrufen',
            body: 'Du widerrufst: <b>' + u.esc(c.t) + '</b>.' + extra,
            ok: 'Widerrufen'
          });
          if (!ok) { t.checked = true; return; }
        }

        if (!want && (k === 'push' || (k === 'profile' && G.store.hasConsent('push')))) {
          try { await G.reminders.disableBackgroundPush(); } catch (e) { /* Widerruf lokal fortsetzen */ }
        }

        G.store.setConsent(k, want);

        // Folgeabhängigkeiten sichtbar machen
        if (k === 'profile' && !want) {
          ['history', 'ai', 'obsidian', 'push'].forEach(function (x) {
            if (G.store.hasConsent(x)) G.store.setConsent(x, false);
          });
          u.toast('Alle Einwilligungen zurückgesetzt',
            'Ohne gespeichertes Profil kann GoFit die übrigen Bereiche nicht dauerhaft führen.', 'warn', 6000);
        }
        if (k === 'history' && want && !G.store.hasConsent('profile')) {
          G.store.setConsent('profile', true);
          u.toast('Profil-Speicherung ergänzt', 'Die Historie braucht ein gespeichertes Profil.', 'ok');
        }
        if (k === 'push' && want) {
          try {
            await G.reminders.enableBackgroundPush();
            u.toast('Push aktiv', 'GoFit erinnert dich auch bei geschlossener App.', 'ok');
          } catch (e) {
            u.toast('Lokale Erinnerung aktiv', e.message || 'Hintergrund-Push ist nicht verfügbar.', 'warn', 7000);
          }
          G.reminders.start();
        }
        if (k === 'push' && !want) G.reminders.stop();

        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="export"]', function () {
        var ok = u.download('GoFit-Sicherung-' + u.today() + '.json', G.store.exportAll(), 'application/json');
        u.toast(ok ? 'Exportiert' : 'Nicht möglich',
          ok ? 'Die Datei wurde gespeichert.' : 'Der Download wurde blockiert.', ok ? 'ok' : 'err');
      });

      u.on(host, 'click', '[data-act="import"]', function () {
        host.querySelector('#impFile').click();
      });

      var f = host.querySelector('#impFile');
      if (f) f.addEventListener('change', function () {
        var file = f.files && f.files[0];
        if (!file) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            G.store.importAll(String(r.result));
            u.toast('Eingelesen', 'Die Sicherung wurde übernommen.', 'ok');
            G.app.rerender();
          } catch (err) {
            u.toast('Fehler beim Einlesen', String(err.message || err), 'err', 6000);
          }
        };
        r.readAsText(file);
        f.value = '';
      });

      u.on(host, 'click', '[data-act="del-history"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Trainingsdaten löschen',
          body: 'Alle gespeicherten Einheiten, Rekorde, XP und Serien werden entfernt. ' +
            'Profil und Einstellungen bleiben erhalten.',
          ok: 'Endgültig löschen'
        });
        if (!ok) return;
        G.store.deleteHistoryOnly();
        u.toast('Gelöscht', 'Die Trainingsdaten wurden entfernt.', 'ok');
        G.app.rerender();
      });

      u.on(host, 'click', '[data-act="del-all"]', async function () {
        var ok = await u.confirmSheet({
          title: 'Alles löschen',
          body: 'GoFit wird vollständig zurückgesetzt: Profil, Trainingsdaten, Rekorde, Einstellungen ' +
            'und alle Einwilligungen. Danach startet die App wieder mit der Ersteinrichtung.',
          ok: 'Alles löschen'
        });
        if (!ok) return;

        // Vollständiger Reset schließt auch die Push-Anmeldung beim GoFit
        // Push-Dienst ein — sonst bliebe die Erinnerung serverseitig aktiv,
        // obwohl lokal alles gelöscht wurde (siehe "Deine Rechte" in der
        // Datenschutzerklärung: ein Widerruf/Löschen wirkt sofort und überall).
        if (G.store.hasConsent('push')) {
          try { await G.reminders.disableBackgroundPush(); } catch (e) { /* lokal trotzdem zurücksetzen */ }
        }

        G.store.wipe();
        G.reminders.stop();
        u.toast('Zurückgesetzt', 'Alle Daten wurden gelöscht.', 'ok');
        setTimeout(function () { location.reload(); }, 900);
      });

      u.on(host, 'click', '[data-act="policy"]', openPolicy);

      u.on(host, 'click', '[data-act="policy-md"]', function () {
        var md = '# GoFit — Datenschutzerklärung (Entwurf)\n\n' +
          'Stand: ' + u.fmtDate(u.today()) + ' · Version ' + G.VERSION + '\n\n' +
          '> Entwurf für den Prototyp. Vor einer Veröffentlichung rechtlich prüfen lassen.\n\n' +
          POLICY.map(function (p, i) {
            return '## ' + (i + 1) + '. ' + p[0] + '\n\n' + p[1] + '\n';
          }).join('\n');
        u.download('GoFit Datenschutzerklaerung.md', md, 'text/markdown');
      });
    },
    openPolicy: openPolicy,
    POLICY: POLICY
  };
})(GoFit);
