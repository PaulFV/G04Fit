/* ============================================================
   GoFit Coach — regelbasierte Trainingsanalyse

   Konzept Abschnitt 6: Der Coach wertet Trainingsdaten aus und
   schlägt Gewicht, Wiederholungen, Progression und den
   Wiedereinstieg nach Pausen vor.
   Beispiel aus dem Konzept: nach 80 kg × 12 sauberen Wiederholungen
   folgt eine Empfehlung Richtung 82,5 kg × 8–10.

   Wichtig: Die Auswertung läuft vollständig auf diesem Gerät.
   Ohne die Einwilligung "KI-Analyse" wird nichts ausgewertet.
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;

  function st() { return G.store.state; }
  function allowed() { return G.store.hasConsent('ai'); }

  /* ------------------------------------------------------------
     Wiederholungsbereich unter Berücksichtigung des Modus
     ------------------------------------------------------------ */
  function repRange(ex, modeKey) {
    var m = G.journey.mode(modeKey || st().profile.mode);
    var lo = u.clamp(ex.reps[0] + m.repShift, ex.time ? 15 : 3, 60);
    var hi = u.clamp(ex.reps[1] + m.repShift, lo + 1, 90);
    return [Math.round(lo), Math.round(hi)];
  }

  function setCount(ex, modeKey) {
    var m = G.journey.mode(modeKey || st().profile.mode);
    return ex.time ? Math.max(2, m.sets - 1) : m.sets;
  }

  function restFor(ex, modeKey) {
    var m = G.journey.mode(modeKey || st().profile.mode);
    // Grundübungen brauchen mehr Pause als Isolationsübungen
    var heavy = ['pressflat', 'pressover', 'row', 'pulldown', 'dip'].indexOf(ex.pattern) >= 0;
    return Math.round(m.restSec * (heavy ? 1.25 : 1));
  }

  /* ------------------------------------------------------------
     Ausgangsgewicht für eine Übung
     Reihenfolge: eingetragenes Startgewicht → letzte Einheit →
     Richtwert aus Körpergewicht und Erfahrung
     ------------------------------------------------------------ */
  function baseWeight(ex) {
    var s = st();
    var last = G.store.lastSessionFor(ex.id);
    if (last) {
      var done = (last.block.sets || []).filter(function (x) { return x.done && +x.weight >= 0; });
      if (done.length) {
        return done.reduce(function (m, x) { return Math.max(m, +x.weight || 0); }, 0);
      }
    }
    if (s.profile.startWeights[ex.id] != null) return +s.profile.startWeights[ex.id];
    return G.ex.suggestStart(ex, s.profile.weight, s.profile.experience);
  }

  /* ------------------------------------------------------------
     Kernregel: Vorschlag für die nächste Einheit
     ------------------------------------------------------------ */
  function suggestNext(exId) {
    var ex = G.ex.byId(exId);
    if (!ex) return null;

    var s = st();
    var m = G.journey.mode(s.profile.mode);
    var range = repRange(ex);
    var inc = (ex.inc || 2.5) * (m.progRate >= 1.3 ? 2 : 1);
    var last = G.store.lastSessionFor(exId);
    var cur = baseWeight(ex);

    var out = {
      exId: exId,
      weight: cur,
      reps: range,
      sets: setCount(ex),
      rest: restFor(ex),
      change: 0,
      kind: 'hold',
      reason: ''
    };

    if (ex.time) {
      out.weight = 0;
      out.reason = 'Haltezeit steigern: pro Einheit etwa 5 Sekunden mehr anstreben.';
      if (last) {
        var bestT = Math.max.apply(null, (last.block.sets || []).map(function (x) { return +x.reps || 0; }).concat([0]));
        out.reps = [bestT + 5, bestT + 12];
        out.kind = 'up';
      }
      return out;
    }

    if (ex.bw) {
      out.reason = 'Körpergewichtsübung: erst die Wiederholungen steigern, dann Zusatzgewicht ergänzen.';
    }

    if (!last) {
      out.reason = s.profile.startWeights[exId] != null
        ? 'Dein eingetragenes Startgewicht. Beginne mit sauberer Technik.'
        : 'Richtwert aus Körpergewicht und Erfahrungsstufe. Nach dem ersten Satz anpassen.';
      out.kind = 'start';
      return out;
    }

    var sets = (last.block.sets || []).filter(function (x) { return x.done; });
    if (!sets.length) { out.reason = 'Letzte Einheit ohne abgeschlossene Sätze – gleiches Gewicht erneut versuchen.'; return out; }

    var topWeight = sets.reduce(function (a, x) { return Math.max(a, +x.weight || 0); }, 0);
    var repsAtTop = sets.filter(function (x) { return (+x.weight || 0) >= topWeight - 0.01; })
      .map(function (x) { return +x.reps || 0; });
    var minTop = Math.min.apply(null, repsAtTop);
    var avgTop = u.sum(repsAtTop) / repsAtTop.length;
    var hardCount = sets.filter(function (x) { return x.rpe === 'hard'; }).length;
    var easyCount = sets.filter(function (x) { return x.rpe === 'easy'; }).length;

    out.weight = topWeight;

    // 1) Obergrenze in allen Sätzen erreicht -> Gewicht erhöhen
    if (minTop >= range[1] && hardCount === 0) {
      var step = inc * (easyCount >= repsAtTop.length ? 2 : 1);
      out.weight = u.roundWeight(topWeight + step, ex.inc || 2.5);
      out.change = out.weight - topWeight;
      out.reps = [range[0], Math.min(range[1], range[0] + 2)];
      out.kind = 'up';
      out.reason = 'Du hast ' + u.fmtKg(topWeight) + ' × ' + minTop + ' sauber geschafft. ' +
        'Erhöhe auf ' + u.fmtKg(out.weight) + ' und arbeite dich wieder in Richtung ' + range[1] + ' Wiederholungen.';
      return out;
    }

    // 2) Untergrenze deutlich verfehlt -> Gewicht reduzieren
    if (minTop < range[0] - 1 || hardCount >= Math.ceil(sets.length * 0.7)) {
      out.weight = u.roundWeight(topWeight * 0.92, ex.inc || 2.5);
      if (out.weight >= topWeight) out.weight = Math.max(0, topWeight - (ex.inc || 2.5));
      out.change = out.weight - topWeight;
      out.kind = 'down';
      out.reps = range;
      out.reason = 'Zuletzt nur ' + minTop + ' Wiederholungen bei hoher Anstrengung. ' +
        'Nimm ' + u.fmtKg(Math.abs(out.change)) + ' herunter und baue die Technik wieder auf.';
      return out;
    }

    // 3) Im Bereich -> Gewicht halten, Wiederholungen steigern
    out.kind = 'hold';
    out.reps = [Math.min(range[1], Math.ceil(avgTop) + 1), range[1]];

    out.reason = out.reps[0] >= range[1]
      ? 'Bleib bei ' + u.fmtKg(topWeight) + ' und schaffe ' + range[1] +
        ' Wiederholungen in jedem Satz. Sobald das steht, erhöht GoFit das Gewicht.'
      : 'Bleib bei ' + u.fmtKg(topWeight) + ' und steigere auf ' + u.fmtReps(out.reps) +
        ' Wiederholungen. Danach geht es mit dem Gewicht weiter.';
    return out;
  }

  /* ------------------------------------------------------------
     Wiedereinstieg nach längerer Pause (Konzept Abschnitt 8)
     ------------------------------------------------------------ */
  function reentry() {
    var days = G.store.daysSinceLastWorkout();
    if (days == null) return null;
    if (days < 10) return null;

    var factor, text, weeks;
    if (days < 21) { factor = 0.90; weeks = 1; text = 'Rund ' + days + ' Tage Pause. Starte mit etwa 10 % weniger Gewicht.'; }
    else if (days < 45) { factor = 0.80; weeks = 2; text = 'Über drei Wochen Pause. Reduziere um etwa 20 % und lasse einen Satz je Übung weg.'; }
    else if (days < 120) { factor = 0.68; weeks = 3; text = 'Längere Pause. Beginne mit rund einem Drittel weniger Gewicht und baue über drei Wochen auf.'; }
    else { factor = 0.55; weeks = 4; text = 'Sehr lange Pause. Behandle die ersten Wochen wie einen Neustart – Technik vor Gewicht.'; }

    return { days: days, factor: factor, weeks: weeks, text: text };
  }

  /* ------------------------------------------------------------
     Leistungsprofil — ausdrücklich keine medizinischen Werte
     ------------------------------------------------------------ */
  function metrics() {
    var s = st();
    var hist = s.history;
    var today = u.today();

    var last8w = hist.filter(function (x) { return u.daysBetween(x.day, today) <= 56; });
    var last4w = hist.filter(function (x) { return u.daysBetween(x.day, today) <= 28; });

    /* Kraft: bestes geschätztes 1RM im Verhältnis zum Körpergewicht */
    var bw = s.profile.weight || 80;
    var relBest = 0;
    Object.keys(s.records).forEach(function (id) {
      var ex = G.ex.byId(id);
      if (!ex || ex.bw || ex.time) return;
      relBest = Math.max(relBest, (s.records[id].e1rm || 0) / bw);
    });
    var kraft = u.clamp(relBest / 1.5, 0, 1);

    /* Ausdauer: durchschnittliche Wiederholungen und Sätze je Einheit */
    var setsPerSession = last8w.length
      ? u.sum(last8w, function (x) { return x.totalSets || 0; }) / last8w.length : 0;
    var ausdauer = u.clamp(setsPerSession / 22, 0, 1);

    /* Explosivität: Anteil schwerer Sätze mit niedrigen Wiederholungen */
    var heavy = 0, total = 0;
    last8w.forEach(function (sess) {
      (sess.exercises || []).forEach(function (b) {
        (b.sets || []).forEach(function (x) {
          if (!x.done) return;
          total++;
          if ((+x.reps || 0) <= 6 && (+x.weight || 0) > 0) heavy++;
        });
      });
    });
    var explosiv = u.clamp(total ? (heavy / total) * 3.2 : 0, 0, 1);

    /* Konstanz: Einheiten je Woche im Verhältnis zum Plan */
    var target = G.journey.mode(s.profile.mode).weekly;
    var perWeek = last4w.length / 4;
    var konstanz = u.clamp(perWeek / target, 0, 1);

    /* Erholung: Abstand zwischen Einheiten, weder zu dicht noch zu selten */
    var gaps = [];
    for (var i = 1; i < hist.length; i++) gaps.push(u.daysBetween(hist[i - 1].day, hist[i].day));
    var avgGap = gaps.length ? u.sum(gaps) / gaps.length : 0;
    var erholung = gaps.length
      ? u.clamp(1 - Math.abs(avgGap - 2.2) / 4.5, 0.05, 1)
      : 0.5;

    return [
      { key: 'kraft', label: 'Kraft', value: kraft },
      { key: 'ausdauer', label: 'Ausdauer', value: ausdauer },
      { key: 'explosiv', label: 'Explosivität', value: explosiv },
      { key: 'konstanz', label: 'Konstanz', value: konstanz },
      { key: 'erholung', label: 'Erholung', value: erholung }
    ];
  }

  /* ------------------------------------------------------------
     Muskelgruppen-Balance über die letzten 8 Wochen
     ------------------------------------------------------------ */
  function balance() {
    var s = st(), today = u.today();
    var vol = {};
    G.MUSCLE_ORDER.forEach(function (m) { vol[m] = 0; });

    s.history.forEach(function (sess) {
      if (u.daysBetween(sess.day, today) > 56) return;
      (sess.exercises || []).forEach(function (b) {
        var ex = G.ex.byId(b.exId);
        if (!ex) return;
        var v = u.volume(b.sets);
        // Körpergewichtsübungen mit Näherungswert einrechnen
        if (ex.bw) {
          v = u.sum(b.sets, function (x) { return x.done ? ((s.profile.weight || 80) * 0.6 + (+x.weight || 0)) * (+x.reps || 0) : 0; });
        }
        vol[ex.muscle] = (vol[ex.muscle] || 0) + v;
        ex.sec.forEach(function (m) { vol[m] = (vol[m] || 0) + v * 0.35; });
      });
    });

    var max = Math.max.apply(null, G.MUSCLE_ORDER.map(function (m) { return vol[m]; }).concat([1]));
    return G.MUSCLE_ORDER.map(function (m) {
      return {
        key: m,
        label: G.MUSCLES[m].name,
        raw: vol[m],
        pct: vol[m] / max,
        value: vol[m] >= 1000 ? Math.round(vol[m] / 1000) + ' t' : Math.round(vol[m]) + '',
        color: G.anim.MCOLOR[m]
      };
    });
  }

  /* ------------------------------------------------------------
     Hinweise / Empfehlungen
     ------------------------------------------------------------ */
  function insights() {
    var s = st(), out = [];
    var today = u.today();

    var re = reentry();
    if (re) {
      out.push({
        kind: 'warn', icon: 'refresh', title: 'Wiedereinstieg',
        text: re.text + ' GoFit passt die Vorschläge in den nächsten ' + re.weeks +
          (re.weeks === 1 ? ' Woche' : ' Wochen') + ' automatisch an.'
      });
    }

    if (!s.history.length) {
      out.push({
        kind: 'info', icon: 'info', title: 'Noch keine Daten',
        text: 'Absolviere die erste Einheit. Danach kann der Coach echte Vorschläge zu Gewicht und Progression machen.'
      });
      return out;
    }

    // Balance
    var bal = balance().filter(function (b) { return b.raw > 0; });
    if (bal.length >= 3) {
      var sorted = bal.slice().sort(function (a, b) { return a.raw - b.raw; });
      var low = sorted[0], high = sorted[sorted.length - 1];
      if (high.raw > low.raw * 2.4) {
        out.push({
          kind: 'warn', icon: 'target', title: 'Ungleichgewicht',
          text: high.label + ' bekommt deutlich mehr Volumen als ' + low.label +
            '. Plane in den nächsten zwei Wochen eine zusätzliche Übung für ' + low.label + ' ein.'
        });
      }
    }

    // Steigerungen
    var ups = [];
    Object.keys(s.records).forEach(function (id) {
      var r = s.records[id], ex = G.ex.byId(id);
      if (!ex || !r.prev) return;
      if (u.daysBetween(r.date, today) <= 21) {
        ups.push({ name: ex.name, delta: r.e1rm - r.prev.e1rm });
      }
    });
    if (ups.length) {
      ups.sort(function (a, b) { return b.delta - a.delta; });
      out.push({
        kind: 'ok', icon: 'arrowUp', title: 'Fortschritt sichtbar',
        text: 'In den letzten drei Wochen hast du dich bei ' + ups.length +
          (ups.length === 1 ? ' Übung' : ' Übungen') + ' verbessert – am deutlichsten bei ' +
          ups[0].name + ' (+' + u.fmt(ups[0].delta, 1) + ' kg geschätztes Maximum).'
      });
    }

    // Frequenz
    var m4 = s.history.filter(function (x) { return u.daysBetween(x.day, today) <= 28; }).length;
    var target = G.journey.mode(s.profile.mode).weekly * 4;
    if (m4 > 0 && m4 < target * 0.6) {
      out.push({
        kind: 'warn', icon: 'clock', title: 'Frequenz unter Plan',
        text: 'Im Modus ' + G.journey.mode(s.profile.mode).name + ' sind ' + G.journey.mode(s.profile.mode).weekly +
          ' Einheiten pro Woche vorgesehen, erreicht hast du zuletzt etwa ' + u.fmt(m4 / 4, 1) +
          '. Ein Wechsel in einen ruhigeren Modus ist oft nachhaltiger als ein Plan, der liegen bleibt.'
      });
    } else if (m4 >= target) {
      out.push({
        kind: 'ok', icon: 'flame', title: 'Sehr konstant',
        text: 'Du hältst dein Pensum von ' + G.journey.mode(s.profile.mode).weekly +
          ' Einheiten pro Woche. Genau das erzeugt langfristig den Fortschritt.'
      });
    }

    // Nächste konkrete Progression
    var upNext = [];
    Object.keys(u.groupBy(
      s.history.slice(-6).reduce(function (acc, sess) {
        return acc.concat((sess.exercises || []).map(function (b) { return b.exId; }));
      }, []), function (x) { return x; }
    )).forEach(function (id) {
      var sg = suggestNext(id);
      if (sg && sg.kind === 'up') upNext.push({ id: id, s: sg });
    });
    if (upNext.length) {
      var e0 = G.ex.byId(upNext[0].id);
      out.push({
        kind: 'ok', icon: 'dumbbell', title: 'Nächste Steigerung',
        text: e0.name + ': ' + u.fmtKg(upNext[0].s.weight) + ' × ' + u.fmtReps(upNext[0].s.reps) +
          (upNext.length > 1 ? ' — und ' + (upNext.length - 1) + ' weitere Übung' + (upNext.length > 2 ? 'en' : '') + ' sind bereit.' : '')
      });
    }

    return out;
  }

  /* ------------------------------------------------------------
     Kurzer Tipp für das Dashboard
     ------------------------------------------------------------ */
  var GENERIC = [
    'Technik geht vor Gewicht. Eine saubere Wiederholung zählt mehr als zwei mit Schwung.',
    'Zwei bis drei Sekunden zum Absenken bringen oft mehr als fünf Kilo mehr auf der Stange.',
    'Trinke über den Tag verteilt genug – Leistungsabfall im Training beginnt oft davor.',
    'Schlaf ist der wirksamste Regenerationsfaktor, den du selbst steuern kannst.',
    'Notiere dein Gefühl je Satz. Der Coach kann damit deutlich präziser steuern.'
  ];

  function dailyTip() {
    if (!allowed()) {
      return {
        locked: true,
        text: 'Der GoFit Coach wertet erst aus, wenn du die Einwilligung "KI-Analyse" erteilst. ' +
          'Die Auswertung findet ausschließlich auf diesem Gerät statt.'
      };
    }
    var ins = insights();
    if (ins.length) return { locked: false, text: ins[0].title + ': ' + ins[0].text };
    var seed = parseInt(u.today().replace(/-/g, ''), 10);
    return { locked: false, text: u.pick(GENERIC, seed) };
  }

  G.coach = {
    allowed: allowed,
    repRange: repRange,
    setCount: setCount,
    restFor: restFor,
    baseWeight: baseWeight,
    suggestNext: suggestNext,
    reentry: reentry,
    metrics: metrics,
    balance: balance,
    insights: insights,
    dailyTip: dailyTip
  };
})(GoFit);
