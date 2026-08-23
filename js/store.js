/* ============================================================
   GoFit — Zustand & Speicherung (Privacy First)

   Grundregel aus dem Konzept (Abschnitt 10):
   Es wird NICHTS dauerhaft gespeichert, solange die betreffende
   Einwilligung nicht ausdrücklich erteilt wurde.

     consent.profile   Profil & Einstellungen lokal sichern
     consent.history   Trainingshistorie & Rekorde sichern
     consent.ai        Auswertung durch den GoFit Coach
     consent.obsidian  Markdown-Export für Obsidian
     consent.push      Erinnerungen / Benachrichtigungen

   Ohne Einwilligung lebt der jeweilige Datenbereich nur im
   Arbeitsspeicher und ist nach dem Schließen weg.
   ============================================================ */
(function (G) {
  'use strict';

  var KEY = 'gofit.v1';
  var KEY_CONSENT = 'gofit.v1.consent';

  var listeners = [];
  var storageOk = true;

  /* ---------- Ausgangszustand ---------- */
  function blank() {
    return {
      version: G.VERSION,
      createdAt: new Date().toISOString(),
      onboarded: false,

      consent: {
        profile: false,
        history: false,
        ai: false,
        obsidian: false,
        push: false,
        decidedAt: null
      },

      profile: {
        name: '',
        age: null,
        height: null,
        weight: null,
        experience: 'beginner',      // beginner | intermediate | advanced
        mode: 'normal',              // easy | normal | hard | pro | beast
        goals: ['muscle'],           // muscle | strength | definition | health
        focus: [],                   // bevorzugte Muskelgruppen
        trainingDays: [1, 3, 5],     // 0=So … 6=Sa
        reminderTime: '18:00',
        startWeights: {},            // exId -> kg
        units: 'kg',

        // Trainings-Avatar (siehe js/avatar.js) — jede Person lädt ihr
        // eigenes Bild hoch, GoFit liefert keines mit.
        avatar: null,                // quadratischer Ausschnitt als Data-URL
        avatarFull: null             // Hochformat als Data-URL
      },

      journey: {
        xp: 0,
        completed: 0,                // abgeschlossene Einheiten insgesamt
        streak: 0,
        bestStreak: 0,
        lastWorkoutDay: null
      },

      history: [],                   // abgeschlossene Sessions
      records: {},                   // exId -> {weight, reps, e1rm, date}

      session: null,                 // laufende Einheit

      obsidian: {
        vault: '',
        folder: 'GoFit',
        includeAi: true,
        lastSync: null
      },

      settings: {
        reduceMotion: false,
        restTimer: true,
        reentry: true,               // Wiedereinstiegsmodus
        soundless: true
      }
    };
  }

  var state = blank();

  /* ---------- Persistenz ---------- */
  function readRaw(key) {
    try { return localStorage.getItem(key); }
    catch (e) { storageOk = false; return null; }
  }
  function writeRaw(key, val) {
    try { localStorage.setItem(key, val); return true; }
    catch (e) { storageOk = false; return false; }
  }
  function removeRaw(key) {
    try { localStorage.removeItem(key); } catch (e) { /* egal */ }
  }

  /**
   * Speichert genau die Bereiche, für die eine Einwilligung vorliegt.
   * Die Einwilligungen selbst werden getrennt abgelegt – sonst könnte
   * sich die App die Entscheidung nicht merken.
   */
  function save() {
    writeRaw(KEY_CONSENT, JSON.stringify({
      consent: state.consent,
      onboarded: state.onboarded,
      version: state.version
    }));

    if (!state.consent.profile) {
      removeRaw(KEY);
      return;
    }

    var out = {
      version: state.version,
      createdAt: state.createdAt,
      onboarded: state.onboarded,
      profile: state.profile,
      settings: state.settings,
      journey: state.journey,
      obsidian: state.consent.obsidian ? state.obsidian : null,
      history: state.consent.history ? state.history : [],
      records: state.consent.history ? state.records : {},
      session: state.session
    };
    writeRaw(KEY, JSON.stringify(out));
  }

  function load() {
    var c = readRaw(KEY_CONSENT);
    if (c) {
      try {
        var parsed = JSON.parse(c);
        Object.assign(state.consent, parsed.consent || {});
        state.onboarded = !!parsed.onboarded;
      } catch (e) { /* beschädigt – ignorieren */ }
    }

    if (!state.consent.profile) return state;

    var raw = readRaw(KEY);
    if (!raw) return state;
    try {
      var d = JSON.parse(raw);
      state.createdAt = d.createdAt || state.createdAt;
      state.onboarded = !!d.onboarded || state.onboarded;
      Object.assign(state.profile, d.profile || {});
      Object.assign(state.settings, d.settings || {});
      Object.assign(state.journey, d.journey || {});
      if (d.obsidian) Object.assign(state.obsidian, d.obsidian);
      if (state.consent.history) {
        state.history = Array.isArray(d.history) ? d.history : [];
        state.records = d.records || {};
      }
      state.session = d.session || null;
    } catch (e) {
      G.u.toast('Gespeicherte Daten unlesbar', 'GoFit startet mit einem leeren Profil.', 'warn');
    }
    return state;
  }

  /* ---------- Änderungen ---------- */
  function emit(reason) {
    listeners.forEach(function (fn) {
      try { fn(state, reason); } catch (e) { console.error(e); }
    });
  }

  function commit(reason) {
    save();
    emit(reason || 'change');
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* ---------- Einwilligungen ---------- */
  function setConsent(key, value) {
    if (!(key in state.consent)) return;
    var was = state.consent[key];
    state.consent[key] = !!value;
    state.consent.decidedAt = new Date().toISOString();

    // Widerruf löscht die betroffenen Daten unmittelbar.
    if (was && !value) {
      if (key === 'profile') {
        removeRaw(KEY);
        G.u.toast('Profil nicht mehr gespeichert', 'Deine Daten bleiben nur bis zum Schließen erhalten.', 'warn');
      }
      if (key === 'history') {
        state.history = [];
        state.records = {};
        G.u.toast('Trainingshistorie gelöscht', 'Rekorde und vergangene Einheiten wurden entfernt.', 'warn');
      }
      if (key === 'obsidian') {
        state.obsidian.lastSync = null;
      }
    }
    commit('consent');
  }

  function hasConsent(key) { return !!state.consent[key]; }

  /* ---------- Journey / XP ---------- */
  function addXp(amount) {
    var before = G.journey.levelFromXp(state.journey.xp).level;
    state.journey.xp += Math.max(0, Math.round(amount));
    var after = G.journey.levelFromXp(state.journey.xp).level;
    return { before: before, after: after, leveled: after > before };
  }

  function levelInfo() {
    var li = G.journey.levelFromXp(state.journey.xp);
    li.region = G.journey.regionForLevel(li.level);
    li.title = G.journey.titleFor(li.level);
    return li;
  }

  /* ---------- Rekorde ---------- */
  /** Prüft die Sätze einer Übung auf neue Bestleistung. Gibt true zurück, wenn neu. */
  function checkRecord(exId, sets, day) {
    var best = null;
    (sets || []).forEach(function (s) {
      if (!s.done) return;
      var w = +s.weight || 0, r = +s.reps || 0;
      if (!r) return;
      var e = G.u.e1rm(w, r);
      if (!best || e > best.e1rm) best = { weight: w, reps: r, e1rm: e };
    });
    if (!best) return false;

    var cur = state.records[exId];
    if (!cur || best.e1rm > cur.e1rm + 0.01) {
      state.records[exId] = {
        weight: best.weight, reps: best.reps,
        e1rm: Math.round(best.e1rm * 10) / 10,
        date: day || G.u.today(),
        prev: cur ? { weight: cur.weight, reps: cur.reps, e1rm: cur.e1rm } : null
      };
      return true;
    }
    return false;
  }

  /* ---------- Historie-Abfragen ---------- */
  function lastSessionFor(exId) {
    for (var i = state.history.length - 1; i >= 0; i--) {
      var s = state.history[i];
      var block = (s.exercises || []).filter(function (b) { return b.exId === exId; })[0];
      if (block) return { session: s, block: block };
    }
    return null;
  }

  function daysSinceLastWorkout() {
    var last = state.journey.lastWorkoutDay;
    if (!last) return null;
    return G.u.daysBetween(last, G.u.today());
  }

  function sessionsInRange(fromIso, toIso) {
    return state.history.filter(function (s) {
      return s.day >= fromIso && s.day <= toIso;
    });
  }

  function recomputeStreak() {
    // Serie = aufeinanderfolgende Kalenderwochen mit mindestens einer Einheit
    var days = state.history.map(function (s) { return s.day; }).sort();
    if (!days.length) { state.journey.streak = 0; return 0; }
    var weeks = {};
    days.forEach(function (d) { weeks[G.u.weekStart(d)] = true; });
    var w = G.u.weekStart(G.u.today());
    // Falls diese Woche noch leer ist, ab der Vorwoche zählen
    if (!weeks[w]) w = G.u.addDays(w, -7);
    var n = 0;
    while (weeks[w]) { n++; w = G.u.addDays(w, -7); }
    state.journey.streak = n;
    state.journey.bestStreak = Math.max(state.journey.bestStreak || 0, n);
    return n;
  }

  /* ---------- Export / Löschen ---------- */
  function exportAll() {
    return JSON.stringify({
      app: 'GoFit',
      version: state.version,
      exportedAt: new Date().toISOString(),
      consent: state.consent,
      profile: state.profile,
      settings: state.settings,
      journey: state.journey,
      obsidian: state.obsidian,
      history: state.history,
      records: state.records
    }, null, 2);
  }

  function importAll(json) {
    var d = JSON.parse(json);
    if (!d || d.app !== 'GoFit') throw new Error('Keine GoFit-Sicherung.');
    if (d.profile) Object.assign(state.profile, d.profile);
    if (d.settings) Object.assign(state.settings, d.settings);
    if (d.journey) Object.assign(state.journey, d.journey);
    if (d.obsidian) Object.assign(state.obsidian, d.obsidian);
    if (Array.isArray(d.history)) state.history = d.history;
    if (d.records) state.records = d.records;
    state.onboarded = true;
    recomputeStreak();
    commit('import');
  }

  function wipe() {
    removeRaw(KEY);
    removeRaw(KEY_CONSENT);
    state = blank();
    emit('wipe');
  }

  function deleteHistoryOnly() {
    state.history = [];
    state.records = {};
    state.journey.xp = 0;
    state.journey.completed = 0;
    state.journey.streak = 0;
    state.journey.bestStreak = 0;
    state.journey.lastWorkoutDay = null;
    commit('delete-history');
  }

  /* ---------- Öffentliche Schnittstelle ---------- */
  G.store = {
    get state() { return state; },
    blank: blank,
    load: load,
    save: save,
    commit: commit,
    subscribe: subscribe,
    setConsent: setConsent,
    hasConsent: hasConsent,
    addXp: addXp,
    levelInfo: levelInfo,
    checkRecord: checkRecord,
    lastSessionFor: lastSessionFor,
    daysSinceLastWorkout: daysSinceLastWorkout,
    sessionsInRange: sessionsInRange,
    recomputeStreak: recomputeStreak,
    exportAll: exportAll,
    importAll: importAll,
    wipe: wipe,
    deleteHistoryOnly: deleteHistoryOnly,
    get storageOk() { return storageOk; }
  };
})(GoFit);
