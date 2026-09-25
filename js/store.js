/* ============================================================
   G04Fit — Zustand & Speicherung (Privacy First)

   Grundregel aus dem Konzept (Abschnitt 10):
   Es wird NICHTS dauerhaft gespeichert, solange die betreffende
   Einwilligung nicht ausdrücklich erteilt wurde.

     consent.profile   Profil & Einstellungen lokal sichern
     consent.history   Trainingshistorie & Rekorde sichern
     consent.ai        Auswertung durch den G04Fit Coach
     consent.obsidian  Markdown-Export für Obsidian
     consent.push      Erinnerungen / Benachrichtigungen

   Ohne Einwilligung lebt der jeweilige Datenbereich nur im
   Arbeitsspeicher und ist nach dem Schließen weg.
   ============================================================ */
(function (G) {
  'use strict';

  // Die Schlüssel bleiben trotz der Umbenennung auf "gofit.*". Ein neuer
  // Name würde bereits gespeicherte Profile unerreichbar machen.
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
        // Neue Installationen starten auf Englisch; die Auswahl ist im Profil änderbar.
        locale: 'en',
        startWeights: {},            // exId -> kg
        units: 'kg',

        // Körpergewichts-Verlauf: [{date:'YYYY-MM-DD', weight}], ein Eintrag
        // je Tag. "weight" oben bleibt der jeweils neueste Wert daraus,
        // siehe store.logWeight(). Gehört zur selben Einwilligung wie das
        // übrige Profil (consent.profile) — keine eigene Einwilligung nötig.
        weightLog: [],

        // Trainings-Avatar (siehe js/avatar.js) — jede Person lädt ihr
        // eigenes Bild hoch, G04Fit liefert keines mit.
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
        folder: 'G04Fit',
        includeAi: true,
        lastSync: null
      },

      settings: {
        theme: 'dark',
        reduceMotion: false,
        restTimer: true,
        restSeconds: 90,
        reentry: true,               // Wiedereinstiegsmodus
        soundless: true,
        alarmSound: 'signal'         // signal | pulse | chime
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
  var saveTimer = null;

  function save() {
    // Ein noch wartendes verzögertes Speichern ist mit diesem hier erledigt.
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
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

  /**
   * Verzögertes Speichern für Eingaben, die schnell aufeinander folgen (jeder
   * Tastendruck im Trainingsfeld). Speichert den ganzen Zustand samt Historie
   * und Avatar, das soll nicht bei jedem Zeichen geschehen. Beim Verlassen der
   * Seite oder Wechsel in den Hintergrund wird sofort gespeichert.
   */
  function saveSoon() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; save(); }, 400);
  }

  function flush() {
    if (saveTimer) save();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
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

    // Die Sprache darf auch ohne Profil-Einwilligung gemerkt werden, damit
    // die Auswahl im Onboarding beim nächsten Öffnen erhalten bleibt.
    if (!state.consent.profile) {
      try {
        var savedLocale = localStorage.getItem('gofit.locale');
        if (savedLocale === 'de' || savedLocale === 'en') state.profile.locale = savedLocale;
      } catch (e) { /* private mode */ }
      return state;
    }

    var raw = readRaw(KEY);
    if (!raw) return state;
    try {
      var d = JSON.parse(raw);
      state.createdAt = d.createdAt || state.createdAt;
      state.onboarded = !!d.onboarded || state.onboarded;
      Object.assign(state.profile, d.profile || {});
      if (!d.profile || !Object.prototype.hasOwnProperty.call(d.profile, 'locale')) {
        try {
          var storedLocale = localStorage.getItem('gofit.locale');
          if (storedLocale === 'de' || storedLocale === 'en') state.profile.locale = storedLocale;
        } catch (e) { /* private mode */ }
      }
      Object.assign(state.settings, d.settings || {});
      Object.assign(state.journey, d.journey || {});
      if (d.obsidian) Object.assign(state.obsidian, d.obsidian);
      if (state.consent.history) {
        state.history = Array.isArray(d.history) ? d.history : [];
        state.records = d.records || {};
      }
      state.session = d.session || null;
    } catch (e) {
      G.u.toast('Gespeicherte Daten unlesbar', 'G04Fit startet mit einem leeren Profil.', 'warn');
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

  /* ---------- Körpergewichts-Verlauf ---------- */
  /**
   * Trägt ein Gewicht für einen Tag ein (Standard: heute). Ein zweiter
   * Eintrag am selben Tag ersetzt den ersten, statt einen weiteren
   * anzulegen. Das aktuelle Profilgewicht (profile.weight) wird danach
   * immer auf den Eintrag mit dem jüngsten Datum gesetzt, damit Coach
   * und Startgewicht-Richtwerte automatisch mit dem Verlauf mitziehen.
   */
  function logWeight(weight, day) {
    var w = Math.round((+weight || 0) * 10) / 10;
    if (!w || w <= 0) return false;
    day = day || G.u.today();

    var log = state.profile.weightLog || (state.profile.weightLog = []);
    var existing = null;
    for (var i = 0; i < log.length; i++) {
      if (log[i].date === day) { existing = log[i]; break; }
    }
    if (existing) existing.weight = w; else log.push({ date: day, weight: w });
    log.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    state.profile.weight = log[log.length - 1].weight;
    commit('weight-log');
    return true;
  }

  /** Entfernt einen einzelnen Verlaufseintrag und passt das aktuelle
      Gewicht danach wieder auf den jüngsten verbleibenden Eintrag an. */
  function deleteWeightEntry(day) {
    var log = state.profile.weightLog || [];
    var next = log.filter(function (e) { return e.date !== day; });
    if (next.length === log.length) return false;
    state.profile.weightLog = next;
    if (next.length) state.profile.weight = next[next.length - 1].weight;
    commit('weight-log-delete');
    return true;
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
      app: 'G04Fit',
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

  /* ---------- Sicherung einlesen ----------
     Eine Sicherungsdatei kann beschädigt oder von Hand verändert sein. Sie wird
     deshalb nicht einfach übernommen: jedes Feld wird geprüft und auf erlaubte
     Werte beschränkt, ungültige Einheiten werden ausgelassen. Erst wenn alles
     geprüft ist, wird der Zustand ersetzt – ein Fehler lässt die bisherigen
     Daten unangetastet. */
  var DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  var ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
  var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  var MAX_SESSIONS = 5000;
  var MAX_IMAGE = 3 * 1024 * 1024;

  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function isNum(v, lo, hi) { return typeof v === 'number' && isFinite(v) && v >= lo && v <= hi; }
  function numOr(v, lo, hi, dflt) { return isNum(v, lo, hi) ? v : dflt; }
  function strOr(v, max, dflt) { return typeof v === 'string' ? v.slice(0, max) : dflt; }
  function dayOr(v, dflt) { return typeof v === 'string' && DAY_RE.test(v) && !isNaN(Date.parse(v)) ? v : dflt; }
  function oneOf(v, list, dflt) { return list.indexOf(v) >= 0 ? v : dflt; }
  function listOf(v, list) {
    return Array.isArray(v) ? v.filter(function (x, i) { return list.indexOf(x) >= 0 && v.indexOf(x) === i; }) : [];
  }
  function imageOr(v) {
    return typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length <= MAX_IMAGE ? v : null;
  }

  function cleanSet(s) {
    if (!isObj(s)) return null;
    var target = Array.isArray(s.targetReps) ? s.targetReps : [];
    return {
      weight: numOr(s.weight, 0, 1000, 0),
      reps: numOr(s.reps, 0, 1000, 0),
      targetReps: [numOr(target[0], 0, 1000, 8), numOr(target[1], 0, 1000, 12)],
      done: s.done === true,
      rpe: oneOf(s.rpe, ['easy', 'ok', 'hard'], null)
    };
  }

  function cleanSession(x) {
    if (!isObj(x)) return null;
    var day = dayOr(x.day, null);
    if (!day || !Array.isArray(x.exercises)) return null;
    var exercises = [];
    x.exercises.forEach(function (b) {
      if (!isObj(b) || typeof b.exId !== 'string' || !ID_RE.test(b.exId) || !Array.isArray(b.sets)) return;
      exercises.push({
        exId: b.exId,
        rest: numOr(b.rest, 0, 3600, 90),
        hint: strOr(b.hint, 300, ''),
        kind: strOr(b.kind, 20, 'hold'),
        sets: b.sets.slice(0, 50).map(cleanSet).filter(Boolean)
      });
    });
    var re = isObj(x.reentry)
      ? { days: numOr(x.reentry.days, 0, 10000, 0), factor: numOr(x.reentry.factor, 0.1, 1, 1) }
      : null;
    return {
      id: strOr(x.id, 40, G.u.uid()),
      day: day,
      startedAt: strOr(x.startedAt, 40, null),
      finishedAt: strOr(x.finishedAt, 40, null),
      planKey: strOr(x.planKey, 40, 'custom'),
      title: strOr(x.title, 80, 'Freies Training'),
      muscles: listOf(x.muscles, G.MUSCLE_ORDER),
      reentry: re,
      exercises: exercises,
      restEnabled: x.restEnabled !== false,
      restSeconds: numOr(x.restSeconds, 15, 500, 90),
      notes: strOr(x.notes, 2000, ''),
      newRecords: numOr(x.newRecords, 0, 1000, 0),
      totalSets: numOr(x.totalSets, 0, 100000, 0),
      totalReps: numOr(x.totalReps, 0, 1000000, 0),
      volume: numOr(x.volume, 0, 1e9, 0),
      duration: numOr(x.duration, 0, 86400 * 2, 0)
    };
  }

  function cleanRecord(r) {
    if (!isObj(r)) return null;
    var rec = {
      weight: numOr(r.weight, 0, 1000, 0),
      reps: numOr(r.reps, 0, 1000, 0),
      e1rm: numOr(r.e1rm, 0, 3000, 0),
      date: dayOr(r.date, G.u.today()),
      prev: null
    };
    if (isObj(r.prev)) {
      rec.prev = {
        weight: numOr(r.prev.weight, 0, 1000, 0),
        reps: numOr(r.prev.reps, 0, 1000, 0),
        e1rm: numOr(r.prev.e1rm, 0, 3000, 0)
      };
    }
    return rec;
  }

  function cleanProfile(p, base) {
    var out = JSON.parse(JSON.stringify(base));
    if (!isObj(p)) return out;
    out.name = strOr(p.name, 40, out.name);
    out.age = p.age === null ? null : numOr(p.age, 5, 120, out.age);
    out.height = p.height === null ? null : numOr(p.height, 50, 260, out.height);
    out.weight = p.weight === null ? null : numOr(p.weight, 20, 500, out.weight);
    out.experience = oneOf(p.experience, ['beginner', 'intermediate', 'advanced'], out.experience);
    out.mode = oneOf(p.mode, G.MODES.map(function (m) { return m.key; }), out.mode);
    out.goals = listOf(p.goals, ['muscle', 'strength', 'definition', 'health']);
    if (!out.goals.length) out.goals = ['muscle'];
    out.focus = listOf(p.focus, G.MUSCLE_ORDER);
    if (Array.isArray(p.trainingDays)) {
      out.trainingDays = p.trainingDays.filter(function (d, i, a) {
        return Number.isInteger(d) && d >= 0 && d <= 6 && a.indexOf(d) === i;
      });
    }
    if (!out.trainingDays.length) out.trainingDays = [1, 3, 5];
    if (typeof p.reminderTime === 'string' && TIME_RE.test(p.reminderTime)) out.reminderTime = p.reminderTime;
    out.locale = oneOf(p.locale, ['de', 'en'], out.locale);
    out.units = oneOf(p.units, ['kg'], out.units);
    out.startWeights = {};
    if (isObj(p.startWeights)) {
      Object.keys(p.startWeights).forEach(function (id) {
        if (ID_RE.test(id) && id !== '__proto__' && isNum(p.startWeights[id], 0, 1000)) out.startWeights[id] = p.startWeights[id];
      });
    }
    out.weightLog = [];
    if (Array.isArray(p.weightLog)) {
      var seen = {};
      p.weightLog.slice(0, 5000).forEach(function (e) {
        if (isObj(e) && dayOr(e.date, null) && isNum(e.weight, 20, 500) && !seen[e.date]) {
          seen[e.date] = 1;
          out.weightLog.push({ date: e.date, weight: e.weight });
        }
      });
      out.weightLog.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    }
    out.avatar = imageOr(p.avatar);
    out.avatarFull = imageOr(p.avatarFull);
    return out;
  }

  function cleanSettings(s, base) {
    var out = Object.assign({}, base);
    if (!isObj(s)) return out;
    out.theme = oneOf(s.theme, ['dark', 'light'], out.theme);
    ['reduceMotion', 'restTimer', 'reentry', 'soundless'].forEach(function (k) {
      if (typeof s[k] === 'boolean') out[k] = s[k];
    });
    out.restSeconds = numOr(s.restSeconds, 15, 500, out.restSeconds);
    out.alarmSound = oneOf(s.alarmSound, ['signal', 'pulse', 'chime'], out.alarmSound);
    return out;
  }

  function cleanJourney(j, base) {
    var out = Object.assign({}, base);
    if (!isObj(j)) return out;
    out.xp = numOr(j.xp, 0, 1e8, out.xp);
    out.completed = numOr(j.completed, 0, 1e6, out.completed);
    out.streak = numOr(j.streak, 0, 10000, out.streak);
    out.bestStreak = numOr(j.bestStreak, 0, 10000, out.bestStreak);
    out.lastWorkoutDay = j.lastWorkoutDay === null ? null : dayOr(j.lastWorkoutDay, out.lastWorkoutDay);
    return out;
  }

  function cleanObsidian(o, base) {
    var out = Object.assign({}, base);
    if (!isObj(o)) return out;
    out.vault = strOr(o.vault, 300, out.vault);
    out.folder = strOr(o.folder, 100, out.folder);
    if (typeof o.includeAi === 'boolean') out.includeAi = o.includeAi;
    out.lastSync = o.lastSync === null ? null : strOr(o.lastSync, 40, out.lastSync);
    return out;
  }

  /**
   * Liest eine Sicherung (JSON-Text) ein. Wirft bei einer ungültigen Datei und
   * ändert dann nichts. Gibt eine Übersicht zurück: übernommene und ausgelassene
   * Einheiten sowie ob die Historie dauerhaft auf dem Gerät gespeichert wird.
   */
  function importAll(json) {
    var d;
    try { d = JSON.parse(json); } catch (e) { throw new Error('Die Datei ist keine gültige Sicherung (kein lesbares JSON).'); }
    if (!isObj(d) || d.app !== 'G04Fit') throw new Error('Keine G04Fit-Sicherung.');
    if (d.history != null && !Array.isArray(d.history)) throw new Error('Die Sicherung ist beschädigt (Historie).');
    if (d.records != null && !isObj(d.records)) throw new Error('Die Sicherung ist beschädigt (Rekorde).');

    var profile = d.profile != null ? cleanProfile(d.profile, state.profile) : state.profile;
    var settings = d.settings != null ? cleanSettings(d.settings, state.settings) : state.settings;
    var journey = d.journey != null ? cleanJourney(d.journey, state.journey) : state.journey;
    var obsidian = d.obsidian != null ? cleanObsidian(d.obsidian, state.obsidian) : state.obsidian;

    var history = state.history, records = state.records, skipped = 0;
    if (Array.isArray(d.history)) {
      history = [];
      d.history.slice(0, MAX_SESSIONS).forEach(function (x) {
        var s = cleanSession(x);
        if (s) history.push(s); else skipped++;
      });
      skipped += Math.max(0, d.history.length - MAX_SESSIONS);
      history.sort(function (a, b) { return a.day < b.day ? -1 : a.day > b.day ? 1 : 0; });
    }
    if (isObj(d.records)) {
      records = {};
      Object.keys(d.records).forEach(function (id) {
        if (!ID_RE.test(id) || id === '__proto__') return;
        var r = cleanRecord(d.records[id]);
        if (r) records[id] = r;
      });
    }

    // Alles geprüft: erst jetzt den Zustand ersetzen.
    state.profile = profile;
    state.settings = settings;
    state.journey = journey;
    state.obsidian = obsidian;
    state.history = history;
    state.records = records;
    state.onboarded = true;
    recomputeStreak();
    commit('import');

    return {
      sessions: history.length,
      skipped: skipped,
      keptOnDevice: state.consent.history && state.consent.profile
    };
  }

  /** Alles löschen: Zustand, Einwilligungen und jeder Schlüssel "gofit.*" im
      Browser (auch Sprache und die Geräte-Kennung des Push-Dienstes). */
  function wipe() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    removeRaw(KEY);
    removeRaw(KEY_CONSENT);
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('gofit.') === 0) localStorage.removeItem(k);
      });
    } catch (e) { /* Speicher gesperrt: nichts zu löschen */ }
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
    logWeight: logWeight,
    deleteWeightEntry: deleteWeightEntry,
    lastSessionFor: lastSessionFor,
    daysSinceLastWorkout: daysSinceLastWorkout,
    sessionsInRange: sessionsInRange,
    recomputeStreak: recomputeStreak,
    exportAll: exportAll,
    importAll: importAll,
    saveSoon: saveSoon,
    flush: flush,
    wipe: wipe,
    deleteHistoryOnly: deleteHistoryOnly,
    get storageOk() { return storageOk; }
  };
})(G04Fit);
