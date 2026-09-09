/* ============================================================
   G04Fit — Journey, Regionen, Schwierigkeitsmodi
   Konzept Abschnitt 4: spielerisches Fortschrittssystem mit
   Weltkarte, Level 1 als Start, Modi Easy → Beast.
   ============================================================ */
(function (G) {
  'use strict';

  /* ---------- Schwierigkeitsmodi ---------- */
  var MODES = [
    {
      key: 'easy', name: 'Easy', icon: '🌱', color: '#7DD3A0',
      desc: 'Sanfter Einstieg. Wenig Volumen, viel Erholung.',
      sets: 2, repShift: +2, restSec: 120, progRate: 0.5, weekly: 2, xpMult: 0.8
    },
    {
      key: 'normal', name: 'Normal', icon: '⚡', color: '#3DFF9E',
      desc: 'Ausgewogen. Der empfohlene Standard für die meisten.',
      sets: 3, repShift: 0, restSec: 90, progRate: 1.0, weekly: 3, xpMult: 1.0
    },
    {
      key: 'hard', name: 'Hard', icon: '🔥', color: '#FFC857',
      desc: 'Mehr Sätze, kürzere Pausen, schnellere Progression.',
      sets: 4, repShift: -1, restSec: 75, progRate: 1.3, weekly: 4, xpMult: 1.25
    },
    {
      key: 'pro', name: 'Pro', icon: '💠', color: '#22D3EE',
      desc: 'Hohes Volumen. Setzt saubere Technik und Routine voraus.',
      sets: 4, repShift: -2, restSec: 60, progRate: 1.5, weekly: 5, xpMult: 1.5
    },
    {
      key: 'beast', name: 'Beast', icon: '👹', color: '#FF5C7A',
      desc: 'Maximale Belastung. Nur mit sehr guter Erholung sinnvoll.',
      sets: 5, repShift: -2, restSec: 55, progRate: 1.7, weekly: 5, xpMult: 1.85
    }
  ];

  var MODE_BY_KEY = {};
  MODES.forEach(function (m) { MODE_BY_KEY[m.key] = m; });
  function mode(key) { return MODE_BY_KEY[key] || MODE_BY_KEY.normal; }

  /* ---------- Regionen der Weltkarte ---------- */
  var REGIONS = [
    {
      key: 'starter', name: 'Starter Valley', icon: '🌄', from: 1, to: 5,
      tag: 'Grundlagen & Technik',
      desc: 'Hier lernst du die Bewegungen sauber auszuführen. Gewichte sind zweitrangig.',
      color: '#7DD3A0'
    },
    {
      key: 'forest', name: 'Strength Forest', icon: '🌲', from: 6, to: 12,
      tag: 'Erste Kraftzuwächse',
      desc: 'Die Grundübungen sitzen. Jetzt wird planmäßig Gewicht aufgebaut.',
      color: '#3DFF9E'
    },
    {
      key: 'mountains', name: 'Iron Mountains', icon: '⛰️', from: 13, to: 20,
      tag: 'Volumen & Ausdauer',
      desc: 'Längere Einheiten, mehr Sätze. Deine Kraftbasis wird breiter.',
      color: '#22D3EE'
    },
    {
      key: 'volcano', name: 'Power Volcano', icon: '🌋', from: 21, to: 30,
      tag: 'Intensität',
      desc: 'Kurze Pausen, hohe Lasten. Erholung wird zum entscheidenden Faktor.',
      color: '#FFC857'
    },
    {
      key: 'glacier', name: 'Titan Glacier', icon: '🧊', from: 31, to: 42,
      tag: 'Konstanz auf hohem Niveau',
      desc: 'Fortschritt in kleinen Schritten. Wer dranbleibt, gewinnt.',
      color: '#A78BFA'
    },
    {
      key: 'elite', name: 'Elite City', icon: '🏙️', from: 43, to: 999,
      tag: 'Spitzenbereich',
      desc: 'Individuelle Feinsteuerung. Der Coach arbeitet mit deinen echten Daten.',
      color: '#FF8FA3'
    }
  ];

  /* ---------- XP-Kurve ---------- */
  /** Benötigte XP, um von `level` auf `level+1` zu kommen. */
  function xpForNext(level) {
    return Math.round(120 + (level - 1) * 46 + Math.pow(level, 1.6) * 7);
  }

  /** Gesamt-XP -> {level, into, need, pct} */
  function levelFromXp(xp) {
    var lvl = 1, rest = Math.max(0, xp || 0), need = xpForNext(1);
    while (rest >= need && lvl < 300) {
      rest -= need;
      lvl++;
      need = xpForNext(lvl);
    }
    return { level: lvl, into: rest, need: need, pct: need ? rest / need : 0 };
  }

  function regionForLevel(lvl) {
    for (var i = 0; i < REGIONS.length; i++) {
      if (lvl >= REGIONS[i].from && lvl <= REGIONS[i].to) return REGIONS[i];
    }
    return REGIONS[REGIONS.length - 1];
  }

  /**
   * XP für eine abgeschlossene Einheit.
   * Basis + Anteile für Sätze, Volumen und neue Rekorde.
   */
  function xpForSession(session, modeKey) {
    var sets = 0, vol = 0;
    (session.exercises || []).forEach(function (block) {
      (block.sets || []).forEach(function (s) {
        if (!s.done) return;
        sets++;
        vol += (+s.weight || 0) * (+s.reps || 0);
      });
    });
    if (!sets) return 0;
    var base = 40 + sets * 7 + Math.min(90, Math.round(vol / 260));
    var prBonus = (session.newRecords || 0) * 25;
    return Math.round((base + prBonus) * mode(modeKey).xpMult);
  }

  /* ---------- Titel je Level ---------- */
  var TITLES = [
    [1, 'Neuling'], [3, 'Einsteiger'], [6, 'Trainierender'], [9, 'Aufsteiger'],
    [13, 'Fortgeschritten'], [17, 'Athlet'], [21, 'Kraftpaket'], [26, 'Veteran'],
    [31, 'Titan'], [37, 'Meister'], [43, 'Elite'], [55, 'Legende']
  ];
  function titleFor(lvl) {
    var t = TITLES[0][1];
    TITLES.forEach(function (p) { if (lvl >= p[0]) t = p[1]; });
    return t;
  }

  G.MODES = MODES;
  G.REGIONS = REGIONS;
  G.journey = {
    mode: mode,
    xpForNext: xpForNext,
    levelFromXp: levelFromXp,
    regionForLevel: regionForLevel,
    xpForSession: xpForSession,
    titleFor: titleFor
  };
})(G04Fit);
