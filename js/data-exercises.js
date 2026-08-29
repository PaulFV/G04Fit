/* ============================================================
   GoFit — Übungsdatenbank
   Schwerpunkt laut Konzept: Brust, Rücken, Bauch, Bizeps,
   Trizeps, Schulter.

   Felder je Übung:
     id        eindeutige Kennung
     name      Anzeigename
     muscle    Hauptmuskelgruppe
     sec[]     sekundär beanspruchte Gruppen
     equip     Ausrüstung
     pattern   Bewegungsmuster -> steuert die SVG-Animation
     level     1 Einsteiger · 2 Fortgeschritten · 3 Profi
     bw        true = Körpergewichtsübung (Zusatzgewicht optional)
     inc       kleinster sinnvoller Gewichtssprung in kg
     f         Richtwert Startlast als Anteil des Körpergewichts
     reps      empfohlener Wiederholungsbereich [min,max]
     cues[]    Technikhinweise (korrekte Ausführung)
     err[]     häufige Fehler
   ============================================================ */
(function (G) {
  'use strict';

  var MUSCLES = {
    chest:     { key: 'chest',     name: 'Brust',    icon: '🫀', color: 'var(--m-chest)' },
    back:      { key: 'back',      name: 'Rücken',   icon: '🔺', color: 'var(--m-back)' },
    abs:       { key: 'abs',       name: 'Bauch',    icon: '🧱', color: 'var(--m-abs)' },
    biceps:    { key: 'biceps',    name: 'Bizeps',   icon: '💪', color: 'var(--m-biceps)' },
    triceps:   { key: 'triceps',   name: 'Trizeps',  icon: '🦾', color: 'var(--m-triceps)' },
    shoulders: { key: 'shoulders', name: 'Schulter', icon: '🛡️', color: 'var(--m-shoulders)' }
  };

  var MUSCLE_ORDER = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs'];

  var EX = [
    /* ================= BRUST ================= */
    {
      id: 'bench-bb', name: 'Bankdrücken (Langhantel)', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Langhantel', pattern: 'pressflat',
      level: 2, inc: 2.5, f: 0.60, reps: [6, 10],
      cues: [
        'Schulterblätter fest zusammenziehen und nach unten fixieren',
        'Leichtes Hohlkreuz, Gesäß bleibt auf der Bank',
        'Stange kontrolliert zur unteren Brust führen, kurz berühren',
        'Ellenbogen etwa 45–60° zum Rumpf, nicht seitlich abspreizen'
      ],
      err: ['Stange abfedern lassen', 'Gesäß hebt ab', 'Ellenbogen komplett 90° nach außen']
    },
    {
      id: 'bench-db', name: 'Kurzhantel-Bankdrücken', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Kurzhanteln', pattern: 'pressflat',
      demo: 'assets/exercises/bench-db-anatomy.gif', demoStyle: 'anatomy',
      level: 1, inc: 2, f: 0.24, reps: [8, 12],
      cues: [
        'Hanteln auf Höhe der unteren Brust starten',
        'Am obersten Punkt nicht aneinanderstoßen',
        'Handgelenke bleiben gerade über den Ellenbogen',
        'Absenken langsam über 2–3 Sekunden'
      ],
      err: ['Zu tiefes Absenken mit Schulterschmerz', 'Hanteln kippen nach außen']
    },
    {
      id: 'incline-db', name: 'Schrägbankdrücken (Kurzhantel)', muscle: 'chest',
      sec: ['shoulders', 'triceps'], equip: 'Kurzhanteln', pattern: 'pressflat',
      level: 2, inc: 2, f: 0.20, reps: [8, 12],
      cues: [
        'Bank auf 30–40° einstellen – mehr belastet vor allem die Schulter',
        'Brust bleibt gehoben, Schulterblätter fixiert',
        'Druck aus der oberen Brust, nicht aus den Armen'
      ],
      err: ['Bank zu steil', 'Schultern rollen nach vorn']
    },
    {
      id: 'fly-cable', name: 'Kabel-Fliegende', muscle: 'chest',
      sec: ['shoulders'], equip: 'Kabelzug', pattern: 'fly',
      level: 1, inc: 2.5, f: 0.14, reps: [10, 15],
      cues: [
        'Ellenbogen leicht gebeugt und den ganzen Satz über konstant halten',
        'Bewegung kommt aus dem Schultergelenk, nicht aus dem Ellenbogen',
        'Am Endpunkt die Brust bewusst 1 Sekunde anspannen'
      ],
      err: ['Bewegung wird zur Drückbewegung', 'Zu viel Gewicht, Schwung aus dem Rumpf']
    },
    {
      id: 'fly-machine', name: 'Butterfly (Maschine)', muscle: 'chest',
      sec: [], equip: 'Maschine', pattern: 'fly',
      level: 1, inc: 5, f: 0.30, reps: [10, 15],
      cues: [
        'Sitzhöhe so wählen, dass die Griffe auf Brusthöhe liegen',
        'Rücken bleibt an der Lehne',
        'Langsam öffnen, aktiv schließen'
      ],
      err: ['Griffe zusammenschlagen', 'Schultern hochziehen']
    },
    {
      id: 'pushup', name: 'Liegestütze', muscle: 'chest',
      sec: ['triceps', 'shoulders', 'abs'], equip: 'Körpergewicht', pattern: 'dip',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [10, 20],
      cues: [
        'Körper bildet eine gerade Linie von Kopf bis Ferse',
        'Bauch und Gesäß aktiv anspannen',
        'Ellenbogen nach hinten-außen, nicht senkrecht zur Seite'
      ],
      err: ['Hüfte hängt durch', 'Kopf schiebt vor', 'Halbe Bewegungsamplitude']
    },
    {
      id: 'dip-chest', name: 'Dips (brustbetont)', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Barren', pattern: 'dip',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [6, 12],
      cues: [
        'Oberkörper bewusst nach vorne neigen',
        'Ellenbogen leicht nach außen führen',
        'Nur so tief, wie die Schulter es schmerzfrei zulässt'
      ],
      err: ['Zu tief mit rundem Schultergürtel', 'Schwung aus den Beinen']
    },

    /* ================= RÜCKEN ================= */
    {
      id: 'pullup', name: 'Klimmzüge', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange', pattern: 'pulldown',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [5, 10],
      cues: [
        'Aus dem Hang aktiv die Schulterblätter nach unten ziehen',
        'Brust zur Stange führen, nicht nur das Kinn',
        'Am Ende kontrolliert und vollständig absenken'
      ],
      err: ['Schwung aus der Hüfte (Kipping)', 'Halbe Wiederholungen']
    },
    {
      id: 'latpull', name: 'Latziehen', muscle: 'back',
      sec: ['biceps'], equip: 'Kabelzug', pattern: 'pulldown',
      level: 1, inc: 5, f: 0.55, reps: [8, 12],
      cues: [
        'Griff etwas weiter als schulterbreit',
        'Brust heraus, leichte Rücklage von etwa 10–15°',
        'Stange zur oberen Brust ziehen, Ellenbogen nach unten denken'
      ],
      err: ['Ziehen in den Nacken', 'Rumpf pendelt stark', 'Nur mit den Armen ziehen']
    },
    {
      id: 'row-bb', name: 'Langhantelrudern', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Langhantel', pattern: 'row',
      level: 3, inc: 2.5, f: 0.50, reps: [6, 10],
      cues: [
        'Hüfte nach hinten schieben, Oberkörper etwa 45° geneigt',
        'Rücken bleibt durchgehend gerade und angespannt',
        'Stange zum unteren Brustkorb / oberen Bauch ziehen'
      ],
      err: ['Runder unterer Rücken', 'Oberkörper richtet sich bei jeder Wiederholung auf']
    },
    {
      id: 'row-db', name: 'Kurzhantelrudern (einarmig)', muscle: 'back',
      sec: ['biceps'], equip: 'Kurzhantel', pattern: 'row',
      level: 1, inc: 2, f: 0.28, reps: [8, 12], uni: true,
      cues: [
        'Eine Hand und ein Knie stützen auf der Bank',
        'Hantel eng am Körper nach hinten-oben ziehen',
        'Schulter am Ende bewusst zurücknehmen'
      ],
      err: ['Rumpf rotiert mit', 'Zug wird zur Bizepsübung']
    },
    {
      id: 'row-cable', name: 'Kabelrudern (sitzend)', muscle: 'back',
      sec: ['biceps'], equip: 'Kabelzug', pattern: 'row',
      level: 1, inc: 5, f: 0.50, reps: [10, 14],
      cues: [
        'Aufrecht sitzen, Brust raus, Knie leicht gebeugt',
        'Griff zum Bauchnabel ziehen',
        'Schulterblätter am Endpunkt zusammenführen'
      ],
      err: ['Starkes Zurücklehnen', 'Schultern werden hochgezogen']
    },
    {
      id: 'pullover', name: 'Überzüge (Pullover)', muscle: 'back',
      sec: ['chest'], equip: 'Kurzhantel', pattern: 'pullover',
      level: 2, inc: 2.5, f: 0.18, reps: [10, 14],
      cues: [
        'Hantel mit beiden Händen über der Brust halten',
        'Arme fast gestreckt hinter den Kopf führen',
        'Bewegung nur so weit, wie die Schulter mitgeht'
      ],
      err: ['Zu weites Absenken', 'Ellenbogen knicken stark ein']
    },
    {
      id: 'facepull', name: 'Face Pull', muscle: 'back',
      sec: ['shoulders'], equip: 'Kabelzug', pattern: 'row',
      level: 1, inc: 2.5, f: 0.16, reps: [12, 18],
      cues: [
        'Seil auf Gesichtshöhe einstellen',
        'Zum Gesicht ziehen, Hände enden neben den Ohren',
        'Ellenbogen bleiben hoch'
      ],
      err: ['Zu schwer, dadurch Zug nach unten', 'Kopf schiebt nach vorne']
    },

    /* ================= SCHULTER ================= */
    {
      id: 'ohp-db', name: 'Schulterdrücken (Kurzhantel)', muscle: 'shoulders',
      sec: ['triceps'], equip: 'Kurzhanteln', pattern: 'pressover',
      level: 2, inc: 2, f: 0.20, reps: [8, 12],
      cues: [
        'Rumpf fest, Rippen nicht nach vorne kippen lassen',
        'Hanteln aus Ohrhöhe nach oben drücken',
        'Am obersten Punkt die Schulter leicht mit nach oben schieben'
      ],
      err: ['Starkes Hohlkreuz', 'Absenken nur bis Stirnhöhe']
    },
    {
      id: 'ohp-bb', name: 'Military Press (Langhantel)', muscle: 'shoulders',
      sec: ['triceps', 'abs'], equip: 'Langhantel', pattern: 'pressover',
      level: 3, inc: 2.5, f: 0.42, reps: [5, 8],
      cues: [
        'Enger Stand, Gesäß und Bauch fest anspannen',
        'Kopf leicht zurücknehmen, damit die Stange frei nach oben läuft',
        'Oben Kopf wieder "durchschieben"'
      ],
      err: ['Ausweichen ins Hohlkreuz', 'Stange läuft in einem Bogen nach vorne']
    },
    {
      id: 'lateral', name: 'Seitheben', muscle: 'shoulders',
      sec: [], equip: 'Kurzhanteln', pattern: 'raise',
      level: 1, inc: 1, f: 0.06, reps: [12, 18],
      cues: [
        'Leichte Vorneigung, Ellenbogen minimal gebeugt',
        'Bis maximal Schulterhöhe anheben',
        'Kleine Finger minimal höher als der Daumen'
      ],
      err: ['Zu schwer und mit Schwung', 'Schultern werden zum Ohr gezogen']
    },
    {
      id: 'front-raise', name: 'Frontheben', muscle: 'shoulders',
      sec: ['chest'], equip: 'Kurzhanteln', pattern: 'raise',
      level: 1, inc: 1, f: 0.07, reps: [10, 15],
      cues: [
        'Arme abwechselnd oder gleichzeitig nach vorne heben',
        'Nur bis Schulterhöhe',
        'Rumpf bleibt ruhig'
      ],
      err: ['Ausholen aus der Hüfte', 'Zu hohes Anheben über den Kopf']
    },
    {
      id: 'rear-fly', name: 'Reverse Butterfly', muscle: 'shoulders',
      sec: ['back'], equip: 'Maschine', pattern: 'fly',
      level: 1, inc: 2.5, f: 0.14, reps: [12, 18],
      cues: [
        'Brust an das Polster, Rücken gerade',
        'Arme nach hinten öffnen, Ellenbogen leicht gebeugt',
        'Fokus auf die hintere Schulter, nicht auf den oberen Rücken'
      ],
      err: ['Zu viel Gewicht', 'Bewegung wird zum Rudern']
    },
    {
      id: 'shrug', name: 'Nackenheben (Shrugs)', muscle: 'shoulders',
      sec: ['back'], equip: 'Kurzhanteln', pattern: 'shrug',
      level: 1, inc: 2.5, f: 0.35, reps: [12, 16],
      cues: [
        'Schultern gerade nach oben ziehen, nicht kreisen',
        'Oben 1 Sekunde halten',
        'Arme bleiben gestreckt'
      ],
      err: ['Schulterkreisen', 'Mitziehen mit dem Bizeps']
    },

    /* ================= BIZEPS ================= */
    {
      id: 'curl-bb', name: 'Langhantel-Curl', muscle: 'biceps',
      sec: [], equip: 'Langhantel', pattern: 'curl',
      level: 1, inc: 2.5, f: 0.28, reps: [8, 12],
      cues: [
        'Ellenbogen bleiben am Rumpf fixiert',
        'Oberkörper aufrecht, kein Zurücklehnen',
        'Oben kurz halten, langsam absenken'
      ],
      err: ['Schwung aus dem Rücken', 'Ellenbogen wandern nach vorne']
    },
    {
      id: 'curl-db', name: 'Kurzhantel-Curl', muscle: 'biceps',
      sec: [], equip: 'Kurzhanteln', pattern: 'curl',
      level: 1, inc: 2, f: 0.13, reps: [10, 14],
      cues: [
        'Handgelenk beim Hochführen leicht nach außen drehen',
        'Volle Streckung am unteren Punkt',
        'Beide Seiten gleich schnell bewegen'
      ],
      err: ['Nur halb absenken', 'Schulter zieht mit nach vorne']
    },
    {
      id: 'curl-hammer', name: 'Hammer-Curl', muscle: 'biceps',
      sec: [], equip: 'Kurzhanteln', pattern: 'curl',
      level: 1, inc: 2, f: 0.14, reps: [10, 14],
      cues: [
        'Neutraler Griff, Daumen zeigt nach oben',
        'Ellenbogen bleibt fixiert',
        'Trainiert zusätzlich den Unterarm'
      ],
      err: ['Hanteln rotieren', 'Schwung aus dem Rumpf']
    },
    {
      id: 'curl-preacher', name: 'Scott-Curl (Preacher)', muscle: 'biceps',
      sec: [], equip: 'Scottbank', pattern: 'curl',
      level: 2, inc: 2.5, f: 0.20, reps: [8, 12],
      cues: [
        'Achseln liegen fest am Polster',
        'Am untersten Punkt nicht vollständig entspannen',
        'Langsames Absenken, besonders wichtig für den Ellenbogen'
      ],
      err: ['Ruckartiges Strecken am unteren Punkt', 'Gesäß hebt vom Sitz ab']
    },
    {
      id: 'curl-cable', name: 'Kabel-Curl', muscle: 'biceps',
      sec: [], equip: 'Kabelzug', pattern: 'curl',
      level: 1, inc: 2.5, f: 0.24, reps: [12, 16],
      cues: [
        'Konstante Spannung über die gesamte Bewegung',
        'Leicht vor dem Gerät stehen',
        'Ellenbogen bleiben ruhig'
      ],
      err: ['Zurücklehnen für mehr Gewicht']
    },

    /* ================= TRIZEPS ================= */
    {
      id: 'pushdown', name: 'Trizepsdrücken am Kabel', muscle: 'triceps',
      sec: [], equip: 'Kabelzug', pattern: 'extension',
      level: 1, inc: 2.5, f: 0.30, reps: [10, 15],
      cues: [
        'Oberarme bleiben eng am Rumpf',
        'Nur der Unterarm bewegt sich',
        'Am unteren Punkt kurz vollständig strecken'
      ],
      err: ['Oberkörper drückt mit', 'Ellenbogen wandern nach hinten']
    },
    {
      id: 'bench-close', name: 'Enges Bankdrücken', muscle: 'triceps',
      sec: ['chest', 'shoulders'], equip: 'Langhantel', pattern: 'pressflat',
      level: 2, inc: 2.5, f: 0.45, reps: [6, 10],
      cues: [
        'Griff etwa schulterbreit, nicht enger',
        'Ellenbogen dicht am Rumpf führen',
        'Stange auf Höhe des unteren Brustbeins'
      ],
      err: ['Zu enger Griff belastet die Handgelenke', 'Ellenbogen spreizen ab']
    },
    {
      id: 'skullcrusher', name: 'Stirndrücken (French Press)', muscle: 'triceps',
      sec: [], equip: 'SZ-Stange', pattern: 'extension',
      level: 2, inc: 2.5, f: 0.22, reps: [8, 12],
      cues: [
        'Oberarme senkrecht oder leicht nach hinten geneigt',
        'Stange kontrolliert zur Stirn oder dahinter absenken',
        'Ellenbogen bleiben eng'
      ],
      err: ['Ellenbogen öffnen nach außen', 'Zu schnelles Absenken']
    },
    {
      id: 'ohext-db', name: 'Überkopf-Trizepsdrücken', muscle: 'triceps',
      sec: ['shoulders'], equip: 'Kurzhantel', pattern: 'extension',
      level: 1, inc: 2, f: 0.16, reps: [10, 14],
      cues: [
        'Hantel mit beiden Händen hinter dem Kopf halten',
        'Oberarme bleiben senkrecht',
        'Bauch anspannen, kein Hohlkreuz'
      ],
      err: ['Ellenbogen weichen nach außen', 'Rippenbogen kippt nach vorne']
    },
    {
      id: 'dip-triceps', name: 'Dips (trizepsbetont)', muscle: 'triceps',
      sec: ['chest', 'shoulders'], equip: 'Barren', pattern: 'dip',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [6, 12],
      cues: [
        'Oberkörper möglichst aufrecht halten',
        'Ellenbogen eng nach hinten führen',
        'Bis etwa 90° Ellenbogenwinkel absenken'
      ],
      err: ['Zu weites Absenken', 'Schulterblätter rollen nach vorne']
    },
    {
      id: 'kickback', name: 'Trizeps-Kickback', muscle: 'triceps',
      sec: [], equip: 'Kurzhantel', pattern: 'extension',
      level: 1, inc: 1, f: 0.08, reps: [12, 16], uni: true,
      cues: [
        'Oberkörper vorgeneigt, Oberarm parallel zum Rumpf',
        'Nur der Unterarm streckt nach hinten',
        'Am Endpunkt 1 Sekunde halten'
      ],
      err: ['Oberarm sinkt ab', 'Schwungbewegung']
    },

    /* ================= BAUCH ================= */
    {
      id: 'crunch', name: 'Crunches', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'crunch',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [15, 25],
      cues: [
        'Unterer Rücken bleibt am Boden',
        'Kinn nicht auf die Brust pressen',
        'Bewegung kommt aus dem Bauch, nicht aus den Armen'
      ],
      err: ['Ziehen am Nacken', 'Zu großer Bewegungsumfang aus der Hüfte']
    },
    {
      id: 'legraise', name: 'Beinheben (hängend)', muscle: 'abs',
      sec: ['back'], equip: 'Klimmzugstange', pattern: 'legraise',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Becken bewusst nach hinten kippen',
        'Beine gestreckt oder – leichter – angewinkelt heben',
        'Kein Pendeln, kontrolliert absenken'
      ],
      err: ['Schwung aus dem Körper', 'Nur Hüftbeuger arbeiten']
    },
    {
      id: 'legraise-floor', name: 'Beinheben (liegend)', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'legraise',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20],
      cues: [
        'Hände unter das Gesäß legen',
        'Unterer Rücken bleibt in Bodenkontakt',
        'Beine nicht ganz ablegen, Spannung halten'
      ],
      err: ['Hohlkreuz beim Absenken']
    },
    {
      id: 'plank', name: 'Unterarmstütz (Plank)', muscle: 'abs',
      sec: ['shoulders'], equip: 'Körpergewicht', pattern: 'plank',
      level: 1, bw: true, time: true, inc: 5, f: 0, reps: [30, 60],
      cues: [
        'Ellenbogen unter den Schultern',
        'Gerade Linie von Kopf bis Ferse',
        'Gesäß und Bauch aktiv anspannen, ruhig weiteratmen'
      ],
      err: ['Hüfte sinkt ab', 'Gesäß zu hoch', 'Luft anhalten']
    },
    {
      id: 'cable-crunch', name: 'Kabel-Crunch', muscle: 'abs',
      sec: [], equip: 'Kabelzug', pattern: 'crunch',
      level: 2, inc: 2.5, f: 0.30, reps: [12, 18],
      cues: [
        'Kniend, Seil neben dem Kopf halten',
        'Wirbelsäule von oben nach unten einrollen',
        'Hüftwinkel bleibt weitgehend konstant'
      ],
      err: ['Bewegung aus der Hüfte statt aus dem Bauch', 'Arme ziehen mit']
    },
    {
      id: 'russian-twist', name: 'Russian Twist', muscle: 'abs',
      sec: [], equip: 'Gewichtsscheibe', pattern: 'crunch',
      level: 2, inc: 2.5, f: 0.10, reps: [16, 24],
      cues: [
        'Oberkörper etwa 45° zurückgelehnt halten',
        'Rotation kommt aus dem Rumpf, Blick folgt den Händen',
        'Rücken bleibt lang'
      ],
      err: ['Nur die Arme bewegen sich', 'Runder Rücken']
    }
  ];

  /* ---------- Nachschlage-Index ---------- */
  var BY_ID = {};
  EX.forEach(function (e) {
    e.sec = e.sec || [];
    e.reps = e.reps || [8, 12];
    BY_ID[e.id] = e;
  });

  function byId(id) { return BY_ID[id] || null; }
  function byMuscle(m) { return EX.filter(function (e) { return e.muscle === m; }); }

  /**
   * Richtwert für das Startgewicht.
   * Berücksichtigt Körpergewicht und Erfahrungsstufe, damit erfahrene
   * Personen nicht künstlich leicht anfangen (Konzept, Abschnitt 2).
   */
  function suggestStart(ex, bodyWeight, experience) {
    if (ex.bw || ex.time) return 0;
    var bw = bodyWeight || 80;
    var mult = { beginner: 0.62, intermediate: 1.0, advanced: 1.38 }[experience] || 1.0;
    var raw = bw * (ex.f || 0.2) * mult;
    if (ex.uni) raw *= 1; // einarmige Werte sind bereits pro Hand gedacht
    return G.u.roundWeight(raw, ex.inc || 2.5);
  }

  G.MUSCLES = MUSCLES;
  G.MUSCLE_ORDER = MUSCLE_ORDER;
  G.EXERCISES = EX;
  G.ex = { byId: byId, byMuscle: byMuscle, suggestStart: suggestStart };
})(GoFit);
