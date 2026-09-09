/* ============================================================
   GoFit — Wochenplanung

   Konzept Abschnitt 1: GoFit erstellt Wochenpläne für die
   Schwerpunkte Brust, Rücken, Bauch, Bizeps, Trizeps, Schulter.
   Der Split richtet sich nach der Anzahl der Trainingstage.
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;
  function st() { return G.store.state; }

  /* ---------- Split-Vorlagen ---------- */
  var SPLITS = {
    2: [
      { key: 'full-a', name: 'Ganzkörper A', muscles: ['chest', 'back', 'abs'] },
      { key: 'full-b', name: 'Ganzkörper B', muscles: ['shoulders', 'biceps', 'triceps'] }
    ],
    3: [
      { key: 'push', name: 'Push · Brust & Trizeps', muscles: ['chest', 'triceps', 'shoulders'] },
      { key: 'pull', name: 'Pull · Rücken & Bizeps', muscles: ['back', 'biceps'] },
      { key: 'core', name: 'Schulter & Bauch', muscles: ['shoulders', 'abs'] }
    ],
    4: [
      { key: 'chest', name: 'Brust & Trizeps', muscles: ['chest', 'triceps'] },
      { key: 'back', name: 'Rücken & Bizeps', muscles: ['back', 'biceps'] },
      { key: 'shoulder', name: 'Schulter', muscles: ['shoulders'] },
      { key: 'core', name: 'Bauch & Arme', muscles: ['abs', 'biceps', 'triceps'] }
    ],
    5: [
      { key: 'chest', name: 'Brust', muscles: ['chest'] },
      { key: 'back', name: 'Rücken', muscles: ['back'] },
      { key: 'shoulder', name: 'Schulter', muscles: ['shoulders'] },
      { key: 'arms', name: 'Arme', muscles: ['biceps', 'triceps'] },
      { key: 'core', name: 'Bauch & Restvolumen', muscles: ['abs', 'chest'] }
    ],
    6: [
      { key: 'chest', name: 'Brust', muscles: ['chest'] },
      { key: 'back', name: 'Rücken', muscles: ['back'] },
      { key: 'shoulder', name: 'Schulter', muscles: ['shoulders'] },
      { key: 'biceps', name: 'Bizeps', muscles: ['biceps'] },
      { key: 'triceps', name: 'Trizeps', muscles: ['triceps'] },
      { key: 'abs', name: 'Bauch', muscles: ['abs'] }
    ]
  };

  function maxLevel(experience) {
    return experience === 'advanced' ? 3 : experience === 'intermediate' ? 2 : 1;
  }

  /** Grundübungen zuerst, danach Isolation */
  var COMPOUND = ['pressflat', 'pressover', 'row', 'pulldown', 'dip'];
  function isCompound(ex) { return COMPOUND.indexOf(ex.pattern) >= 0; }

  /**
   * Übungsauswahl für einen Trainingstag.
   * Schwerpunktgruppen aus dem Profil bekommen eine Übung mehr.
   */
  function pickExercises(dayTpl, opts) {
    opts = opts || {};
    var s = st();
    var lvl = maxLevel(s.profile.experience);
    var focus = s.profile.focus || [];
    var perMuscle = dayTpl.muscles.length >= 3 ? 2 : (dayTpl.muscles.length === 2 ? 3 : 4);
    var chosen = [];

    dayTpl.muscles.forEach(function (m, mi) {
      var pool = G.ex.byMuscle(m).filter(function (e) { return e.level <= lvl; });
      if (!pool.length) pool = G.ex.byMuscle(m);

      // Grundübungen nach vorn, innerhalb der Gruppen stabil rotieren
      pool.sort(function (a, b) {
        var d = (isCompound(b) ? 1 : 0) - (isCompound(a) ? 1 : 0);
        if (d) return d;
        return a.level - b.level;
      });

      var n = perMuscle + (focus.indexOf(m) >= 0 ? 1 : 0);
      // Rotationsversatz, damit nicht jede Woche identisch trainiert wird
      var off = (opts.rotate || 0 + mi) % Math.max(1, pool.length);
      var take = [];
      for (var i = 0; i < pool.length && take.length < n; i++) {
        var e = pool[(i + (i === 0 ? 0 : off)) % pool.length];
        if (take.indexOf(e) < 0) take.push(e);
      }
      chosen = chosen.concat(take);
    });

    // Doppelte entfernen, Grundübungen an den Anfang
    var seen = {}, out = [];
    chosen.forEach(function (e) { if (!seen[e.id]) { seen[e.id] = 1; out.push(e); } });
    out.sort(function (a, b) { return (isCompound(b) ? 1 : 0) - (isCompound(a) ? 1 : 0); });
    return out;
  }

  /* ------------------------------------------------------------
     Wochenplan
     ------------------------------------------------------------ */
  function weekPlan(weekStartIso, rotate) {
    var s = st();
    var days = (s.profile.trainingDays || []).slice().sort(function (a, b) { return a - b; });
    if (!days.length) days = [1, 3, 5];

    var tpl = SPLITS[u.clamp(days.length, 2, 6)] || SPLITS[3];
    var start = weekStartIso || u.weekStart();
    rotate = rotate == null ? weekIndex(start) : rotate;

    return days.map(function (wd, i) {
      var offset = (wd + 6) % 7; // Montag = 0
      var iso = u.addDays(start, offset);
      var t = tpl[i % tpl.length];
      return {
        day: iso,
        weekday: wd,
        key: t.key,
        name: t.name,
        muscles: t.muscles,
        exercises: pickExercises(t, { rotate: rotate + i }).map(function (e) { return e.id; })
      };
    });
  }

  /** Fortlaufende Wochennummer seit dem Profilbeginn – steuert die Rotation */
  function weekIndex(weekStartIso) {
    var created = st().createdAt ? u.isoDay(new Date(st().createdAt)) : u.today();
    var d = u.daysBetween(u.weekStart(created), weekStartIso || u.weekStart());
    return Math.max(0, Math.floor(d / 7));
  }

  /** Der Plan für heute, falls heute ein Trainingstag ist */
  function todayPlan() {
    var plan = weekPlan();
    var t = u.today();
    return plan.filter(function (p) { return p.day === t; })[0] || null;
  }

  /** Nächster geplanter Trainingstag ab heute (auch in der Folgewoche) */
  function nextPlan() {
    var t = u.today();
    var thisWeek = weekPlan().filter(function (p) { return p.day >= t; });
    if (thisWeek.length) return thisWeek[0];
    var next = weekPlan(u.addDays(u.weekStart(), 7));
    return next[0] || null;
  }

  /* ------------------------------------------------------------
     Einheit aus einem Tagesplan aufbauen
     ------------------------------------------------------------ */
  function buildSession(dayPlan, opts) {
    opts = opts || {};
    var s = st();
    var re = G.coach.allowed() ? G.coach.reentry() : null;
    var factor = (re && s.settings.reentry) ? re.factor : 1;

    var blocks = (dayPlan.exercises || []).map(function (exId) {
      var ex = G.ex.byId(exId);
      if (!ex) return null;
      var sug = G.coach.suggestNext(exId);
      var nSets = sug.sets - (re && re.weeks >= 2 && s.settings.reentry ? 1 : 0);
      nSets = Math.max(1, nSets);
      var w = ex.time ? 0 : u.roundWeight(sug.weight * factor, ex.inc || 2.5);

      var sets = [];
      for (var i = 0; i < nSets; i++) {
        sets.push({
          weight: w,
          reps: sug.reps[1],
          targetReps: sug.reps.slice(),
          done: false,
          rpe: null
        });
      }
      return {
        exId: exId,
        rest: sug.rest,
        hint: sug.reason,
        kind: sug.kind,
        sets: sets
      };
    }).filter(Boolean);

    // Eine einzige Satzpause für die ganze Einheit (statt je Übung
    // unterschiedlich) — Startwert ist die vom Nutzer hinterlegte
    // Einstellung (vor dem Start wählbar, Standard 90 s), in der
    // laufenden Einheit weiterhin frei änderbar (15–500 s).
    var restSeconds = u.clamp(s.settings.restSeconds || 90, 15, 500);

    return {
      id: u.uid(),
      day: opts.day || u.today(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
      planKey: dayPlan.key,
      title: dayPlan.name,
      muscles: dayPlan.muscles,
      reentry: re && s.settings.reentry ? { days: re.days, factor: re.factor } : null,
      exercises: blocks,
      restEnabled: s.settings.restTimer !== false,
      restSeconds: restSeconds,
      notes: '',
      newRecords: 0,
      totalSets: 0,
      volume: 0
    };
  }

  /** Freie Einheit aus selbst gewählten Übungen */
  function buildCustomSession(exIds, title) {
    return buildSession({
      key: 'custom',
      name: title || 'Freies Training',
      muscles: exIds.map(function (id) { var e = G.ex.byId(id); return e && e.muscle; }).filter(Boolean),
      exercises: exIds
    });
  }

  /* ------------------------------------------------------------
     Einheit abschließen
     ------------------------------------------------------------ */
  function finishSession(session) {
    var s = st();
    var totalSets = 0, totalReps = 0, vol = 0, records = 0;

    (session.exercises || []).forEach(function (b) {
      var done = (b.sets || []).filter(function (x) { return x.done; });
      totalSets += done.length;
      totalReps += u.sum(done, function (x) { return +x.reps || 0; });
      vol += u.volume(b.sets);
      if (done.length && G.store.hasConsent('history')) {
        if (G.store.checkRecord(b.exId, b.sets, session.day)) records++;
      }
    });

    session.finishedAt = new Date().toISOString();
    session.totalSets = totalSets;
    session.totalReps = totalReps;
    session.volume = Math.round(vol);
    session.newRecords = records;

    var xp = G.journey.xpForSession(session, s.profile.mode);
    var lvl = G.store.addXp(xp);

    s.journey.completed++;
    s.journey.lastWorkoutDay = session.day;

    if (G.store.hasConsent('history')) {
      s.history.push(session);
      s.history.sort(function (a, b) { return a.day < b.day ? -1 : 1; });
      G.store.recomputeStreak();
    }

    s.session = null;
    G.store.commit('session-finished');

    return { xp: xp, level: lvl, records: records, totalSets: totalSets, totalReps: totalReps, volume: Math.round(vol) };
  }

  G.planner = {
    SPLITS: SPLITS,
    weekPlan: weekPlan,
    weekIndex: weekIndex,
    todayPlan: todayPlan,
    nextPlan: nextPlan,
    pickExercises: pickExercises,
    buildSession: buildSession,
    buildCustomSession: buildCustomSession,
    finishSession: finishSession
  };
})(GoFit);
