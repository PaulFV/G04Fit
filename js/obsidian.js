/* ============================================================
   G04Fit — Obsidian-Anbindung

   Konzept Abschnitt 9: Trainingsprotokolle und ausgewählte
   Auswertungen können als Markdown synchronisiert werden.
   Die Synchronisation darf ausschließlich nach ausdrücklicher
   Zustimmung aktiviert werden.

   Im Prototyp erzeugt G04Fit die Markdown-Dateien und stellt sie
   zum Kopieren bzw. Herunterladen bereit. Ein direkter
   Schreibzugriff auf den Vault ist ohne Backend bzw. ohne
   Obsidian-Plugin nicht möglich – und wäre ohne ausdrückliche
   Freigabe auch nicht wünschenswert.
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;
  function st() { return G.store.state; }
  function allowed() { return G.store.hasConsent('obsidian'); }

  function fm(obj) {
    var lines = ['---'];
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (Array.isArray(v)) lines.push(k + ': [' + v.join(', ') + ']');
      else lines.push(k + ': ' + v);
    });
    lines.push('---');
    return lines.join('\n');
  }

  /* ------------------------------------------------------------
     Eine Trainingseinheit als Markdown
     ------------------------------------------------------------ */
  function sessionNote(session) {
    var s = st();
    var d = session.day;
    var out = [];

    out.push(fm({
      titel: '"G04Fit ' + u.fmtDate(d) + ' – ' + session.title + '"',
      datum: d,
      typ: 'training',
      split: session.planKey,
      muskelgruppen: (session.muscles || []).map(function (m) { return G.MUSCLES[m].name; }),
      saetze: session.totalSets || 0,
      volumen_kg: session.volume || 0,
      rekorde: session.newRecords || 0,
      tags: ['gofit', 'training']
    }));
    out.push('');
    out.push('# ' + session.title);
    out.push('');
    out.push('**Datum:** ' + u.fmtDate(d) + ' (' + u.dayName(d, true) + ')  ');
    out.push('**Gesamtvolumen:** ' + u.fmt(session.volume) + ' kg  ');
    out.push('**Sätze:** ' + (session.totalSets || 0) +
      (session.newRecords ? '  \n**Neue Rekorde:** ' + session.newRecords : ''));
    if (session.reentry) {
      out.push('  \n**Wiedereinstieg:** nach ' + session.reentry.days + ' Tagen Pause, Gewichte auf ' +
        Math.round(session.reentry.factor * 100) + ' %');
    }
    out.push('');
    out.push('## Übungen');
    out.push('');

    (session.exercises || []).forEach(function (b) {
      var ex = G.ex.byId(b.exId);
      if (!ex) return;
      var done = (b.sets || []).filter(function (x) { return x.done; });
      if (!done.length) return;

      out.push('### ' + ex.name);
      out.push('');
      out.push('*' + G.MUSCLES[ex.muscle].name +
        (ex.sec.length ? ' · unterstützend: ' + ex.sec.map(function (m) { return G.MUSCLES[m].name; }).join(', ') : '') + '*');
      out.push('');
      out.push('| Satz | Gewicht | Wdh. | Gefühl |');
      out.push('|---:|---:|---:|:--|');
      done.forEach(function (x, i) {
        var rpe = x.rpe === 'easy' ? 'leicht' : x.rpe === 'hard' ? 'schwer' : 'passend';
        out.push('| ' + (i + 1) + ' | ' + (ex.time ? '–' : u.fmtSetWeight(ex, x.weight)) + ' | ' +
          (ex.time ? x.reps + ' s' : x.reps) + ' | ' + rpe + ' |');
      });
      out.push('');
      if (!ex.time) {
        out.push('Volumen: **' + u.fmt(u.volume(b.sets)) + ' kg**');
        out.push('');
      }
    });

    if (session.notes) {
      out.push('## Notizen');
      out.push('');
      out.push(session.notes);
      out.push('');
    }

    if (s.obsidian.includeAi && G.coach.allowed()) {
      var sug = (session.exercises || []).map(function (b) {
        var g = G.coach.suggestNext(b.exId);
        var ex = G.ex.byId(b.exId);
        if (!g || !ex) return null;
        return '- **' + ex.name + '** → ' + (ex.time ? u.fmtReps(g.reps, 's') :
          u.fmt(g.weight) + ' kg × ' + u.fmtReps(g.reps)) + ' — ' + g.reason;
      }).filter(Boolean);
      if (sug.length) {
        out.push('## Empfehlung für die nächste Einheit');
        out.push('');
        out = out.concat(sug);
        out.push('');
        out.push('> Auswertung des G04Fit Coach. Keine medizinische Beratung.');
        out.push('');
      }
    }

    out.push('---');
    out.push('*Erstellt mit G04Fit ' + G.VERSION + '*');
    return out.join('\n');
  }

  function sessionFilename(session) {
    return 'G04Fit ' + session.day + ' ' + session.title.replace(/[\\/:*?"<>|]/g, '-') + '.md';
  }

  /* ------------------------------------------------------------
     Übersichtsnotiz (Dashboard im Vault)
     ------------------------------------------------------------ */
  function overviewNote() {
    var s = st();
    var li = G.store.levelInfo();
    var out = [];

    out.push(fm({
      titel: '"G04Fit Übersicht"',
      aktualisiert: u.today(),
      typ: 'uebersicht',
      level: li.level,
      region: li.region.name,
      einheiten: s.journey.completed,
      tags: ['gofit', 'uebersicht']
    }));
    out.push('');
    out.push('# G04Fit Übersicht');
    out.push('');
    out.push('| Kennzahl | Wert |');
    out.push('|:--|--:|');
    out.push('| Level | ' + li.level + ' · ' + li.title + ' |');
    out.push('| Region | ' + li.region.icon + ' ' + li.region.name + ' |');
    out.push('| Modus | ' + G.journey.mode(s.profile.mode).name + ' |');
    out.push('| Einheiten gesamt | ' + s.journey.completed + ' |');
    out.push('| Serie (Wochen) | ' + s.journey.streak + ' |');
    out.push('| XP | ' + s.journey.xp + ' |');
    out.push('');

    var recIds = Object.keys(s.records);
    if (recIds.length) {
      out.push('## Persönliche Rekorde');
      out.push('');
      out.push('| Übung | Bestleistung | geschätztes 1RM | Datum |');
      out.push('|:--|--:|--:|:--|');
      recIds.sort(function (a, b) { return s.records[b].e1rm - s.records[a].e1rm; })
        .forEach(function (id) {
          var ex = G.ex.byId(id), r = s.records[id];
          if (!ex) return;
          out.push('| ' + ex.name + ' | ' + (ex.bw ? u.fmtSetWeight(ex, r.weight) : u.fmt(r.weight) + ' kg') + ' × ' + r.reps + ' | ' +
            u.fmt(r.e1rm, 1) + ' kg | ' + r.date + ' |');
        });
      out.push('');
    }

    if (s.obsidian.includeAi && G.coach.allowed()) {
      var ins = G.coach.insights();
      if (ins.length) {
        out.push('## Auswertung');
        out.push('');
        ins.forEach(function (i) { out.push('- **' + i.title + ':** ' + i.text); });
        out.push('');
        out.push('> Auswertung des G04Fit Coach. Keine medizinische Beratung.');
        out.push('');
      }
    }

    out.push('## Letzte Einheiten');
    out.push('');
    s.history.slice(-12).reverse().forEach(function (x) {
      out.push('- [[G04Fit ' + x.day + ' ' + x.title + ']] — ' + u.fmt(x.volume) + ' kg, ' + x.totalSets + ' Sätze');
    });
    out.push('');
    out.push('---');
    out.push('*Erstellt mit G04Fit ' + G.VERSION + '*');
    return out.join('\n');
  }

  /* ------------------------------------------------------------
     Ausgabe
     ------------------------------------------------------------ */
  function exportAllNotes() {
    if (!allowed()) return null;
    var s = st();
    var parts = [overviewNote()];
    s.history.forEach(function (x) {
      parts.push('\n\n<!-- Datei: ' + sessionFilename(x) + ' -->\n\n' + sessionNote(x));
    });
    return parts.join('\n');
  }

  function targetPath(session) {
    var s = st();
    var base = (s.obsidian.vault ? s.obsidian.vault.replace(/[\\/]+$/, '') + '\\' : '');
    var folder = (s.obsidian.folder || 'G04Fit').replace(/^[\\/]+|[\\/]+$/g, '');
    return base + folder + '\\' + (session ? sessionFilename(session) : 'G04Fit Übersicht.md');
  }

  function markSynced() {
    st().obsidian.lastSync = new Date().toISOString();
    G.store.commit('obsidian');
  }

  G.obsidian = {
    allowed: allowed,
    sessionNote: sessionNote,
    sessionFilename: sessionFilename,
    overviewNote: overviewNote,
    exportAllNotes: exportAllNotes,
    targetPath: targetPath,
    markSynced: markSynced
  };
})(G04Fit);
