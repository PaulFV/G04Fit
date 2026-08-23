/* ============================================================
   GoFit — Übungsdatenbank

   Ab v2.0.0 Ganzkörper: Brust, Rücken, Schulter, Trapez, Bizeps,
   Trizeps, Bauch, Beine, Po und Waden.

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
     img       Anzahl vorhandener Ausführungsfotos (0, 1 oder 2);
               wird unten aus PHOTOS gesetzt, nicht je Übung gepflegt
   ============================================================ */
(function (G) {
  'use strict';

  var MUSCLES = {
    chest:     { key: 'chest',     name: 'Brust',    icon: '🫀', color: 'var(--m-chest)' },
    back:      { key: 'back',      name: 'Rücken',   icon: '🔺', color: 'var(--m-back)' },
    abs:       { key: 'abs',       name: 'Bauch',    icon: '🧱', color: 'var(--m-abs)' },
    biceps:    { key: 'biceps',    name: 'Bizeps',   icon: '💪', color: 'var(--m-biceps)' },
    triceps:   { key: 'triceps',   name: 'Trizeps',  icon: '🦾', color: 'var(--m-triceps)' },
    shoulders: { key: 'shoulders', name: 'Schulter', icon: '🛡️', color: 'var(--m-shoulders)' },
    traps:     { key: 'traps',     name: 'Trapez',   icon: '🗻', color: 'var(--m-traps)' },
    legs:      { key: 'legs',      name: 'Beine',    icon: '🦵', color: 'var(--m-legs)' },
    glutes:    { key: 'glutes',    name: 'Po',       icon: '🍑', color: 'var(--m-glutes)' },
    calves:    { key: 'calves',    name: 'Waden',    icon: '🦶', color: 'var(--m-calves)' }
  };

  var MUSCLE_ORDER = [
    'chest', 'back', 'shoulders', 'traps', 'biceps', 'triceps',
    'abs', 'legs', 'glutes', 'calves'
  ];

  /** Gruppen des Unterkörpers – steuert Muskelkarte und Split-Planung */
  var LOWER_BODY = ['legs', 'glutes', 'calves'];

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
      id: 'shrug', name: 'Nackenheben (Shrugs)', muscle: 'traps',
      sec: ['shoulders'], equip: 'Kurzhanteln', pattern: 'shrug',
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
    },
    {
      id: 'reverse-crunch', name: 'Reverse Crunch', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'crunch',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20],
      cues: [
        'Becken anheben, Knie zur Brust ziehen',
        'Unteren Rücken bewusst abrollen',
        'Langsam absenken, Spannung halten'
      ],
      err: ['Schwung aus den Beinen', 'Becken bleibt liegen']
    },
    {
      id: 'side-plank', name: 'Seitstütz (Side Plank)', muscle: 'abs',
      sec: ['shoulders'], equip: 'Körpergewicht', pattern: 'plank',
      level: 1, bw: true, time: true, inc: 5, f: 0, reps: [30, 45], uni: true,
      cues: [
        'Ellenbogen genau unter der Schulter',
        'Hüfte anheben, Körper in einer Linie',
        'Seitliche Bauchmuskeln bewusst spüren'
      ],
      err: ['Hüfte sinkt ab', 'Schulter drückt nach vorn']
    },
    {
      id: 'ab-wheel', name: 'Ab Wheel Rollout', muscle: 'abs',
      sec: ['shoulders', 'back'], equip: 'Bauchroller', pattern: 'plank',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Rolle kontrolliert nach vorn ausrollen',
        'Körper bleibt stabil, Bauch fest angespannt',
        'Nur so weit, wie die Spannung sauber hält'
      ],
      err: ['Hohlkreuz beim Ausrollen', 'Zu weit für das eigene Niveau']
    },
    {
      id: 'vup', name: 'V-Ups', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'crunch',
      level: 2, bw: true, inc: 2.5, f: 0, reps: [10, 20],
      cues: [
        'Arme und Beine gleichzeitig anheben',
        'In der Mitte zusammenführen',
        'Bauchmuskeln oben maximal anspannen'
      ],
      err: ['Schwung statt Kontrolle', 'Beine bleiben angewinkelt']
    },

    /* ================= TRAPEZ ================= */
    {
      id: 'shrug-bb', name: 'Schulterziehen (Langhantel)', muscle: 'traps',
      sec: ['shoulders'], equip: 'Langhantel', pattern: 'shrug',
      level: 1, inc: 5, f: 0.70, reps: [8, 12],
      cues: [
        'Schultern maximal nach oben ziehen',
        'Oben kurz halten',
        'Langsam und vollständig absenken'
      ],
      err: ['Zu viel Schwung', 'Schultern nach vorn rollen']
    },
    {
      id: 'shrug-trapbar', name: 'Trap-Bar Shrug', muscle: 'traps',
      sec: ['back'], equip: 'Trap Bar', pattern: 'shrug',
      level: 2, inc: 5, f: 0.90, reps: [8, 12],
      cues: [
        'Neutraler Griff, Arme hängen gestreckt',
        'Schultern nach oben ziehen und maximal kontrahieren',
        'Kontrolliert absenken'
      ],
      err: ['Zu schwere Gewichte', 'Bewegung nicht vollständig ausführen']
    },
    {
      id: 'shrug-incline', name: 'Schrägbank Shrug (vorgelehnt)', muscle: 'traps',
      sec: ['back'], equip: 'Kurzhanteln', pattern: 'shrug',
      level: 2, inc: 2, f: 0.16, reps: [10, 15],
      cues: [
        'Vorne über die Schrägbank lehnen',
        'Schulterblätter nach hinten und oben ziehen',
        'Oben halten, dann kontrolliert senken'
      ],
      err: ['Mitziehen mit den Armen', 'Kopf in den Nacken legen']
    },
    {
      id: 'uprightrow-bb', name: 'Upright Row (Langhantel)', muscle: 'traps',
      sec: ['shoulders', 'biceps'], equip: 'Langhantel', pattern: 'shrug',
      level: 2, inc: 2.5, f: 0.35, reps: [8, 12],
      cues: [
        'Langhantel eng greifen',
        'Hantel bis auf Kinnhöhe ziehen',
        'Ellenbogen führen die Bewegung nach oben'
      ],
      err: ['Ellenbogen zu weit nach vorn', 'Zu schwer, dadurch Schwung']
    },
    {
      id: 'uprightrow-cable', name: 'Upright Row weit (Kabel)', muscle: 'traps',
      sec: ['shoulders'], equip: 'Kabelzug', pattern: 'shrug',
      level: 1, inc: 2.5, f: 0.30, reps: [10, 15],
      cues: [
        'Breiter Griff an der Kabelstange',
        'Zug bis auf Kinnhöhe',
        'Seitlichen Trapez bewusst fokussieren'
      ],
      err: ['Schulterhochziehen ohne Zug', 'Zu enger Griff bei zu viel Gewicht']
    },

    /* ================= BEINE ================= */
    {
      id: 'squat-bb', name: 'Kniebeugen (Langhantel)', muscle: 'legs',
      sec: ['glutes', 'abs'], equip: 'Langhantel', pattern: 'squat',
      level: 2, inc: 5, f: 0.75, reps: [6, 12],
      cues: [
        'Langhantel auf dem oberen Rücken ablegen',
        'Brust raus, Rumpf fest anspannen',
        'Hüfte nach hinten, Knie in Richtung Fußspitzen beugen',
        'Mindestens bis zur Parallele absenken'
      ],
      err: ['Knie fallen nach innen', 'Runder Rücken', 'Fersen heben ab']
    },
    {
      id: 'legpress', name: 'Beinpresse', muscle: 'legs',
      sec: ['glutes'], equip: 'Maschine', pattern: 'legmachine',
      level: 1, inc: 10, f: 1.40, reps: [8, 12],
      cues: [
        'Füße schulterbreit auf der Plattform',
        'Rücken bleibt an der Lehne',
        'Beine nicht ganz durchstrecken',
        'Langsam absenken'
      ],
      err: ['Knie zum Brustkorb einklappen', 'Gesäß hebt von der Lehne ab']
    },
    {
      id: 'legpress-narrow', name: 'Beinpresse (enger Stand)', muscle: 'legs',
      sec: [], equip: 'Maschine', pattern: 'legmachine',
      level: 2, inc: 10, f: 1.20, reps: [8, 12],
      cues: [
        'Füße enger und tiefer auf der Plattform platzieren',
        'Mehr Belastung auf den Quadrizeps',
        'Explosiv nach oben drücken, nicht durchstrecken'
      ],
      err: ['Knie kippen nach innen', 'Zu kurze Bewegungsamplitude']
    },
    {
      id: 'legext', name: 'Beinstrecker', muscle: 'legs',
      sec: [], equip: 'Maschine', pattern: 'legmachine',
      level: 1, inc: 5, f: 0.35, reps: [10, 15],
      cues: [
        'Aufrecht sitzen, Polster über den Knöcheln',
        'Beine nach oben strecken',
        'Oben kurz anspannen, langsam absenken'
      ],
      err: ['Schwung aus der Hüfte', 'Gewicht knallt zurück']
    },
    {
      id: 'legcurl', name: 'Beinbeuger (liegend)', muscle: 'legs',
      sec: ['glutes'], equip: 'Maschine', pattern: 'legmachine',
      level: 1, inc: 5, f: 0.28, reps: [10, 15],
      cues: [
        'Bauchlage, Füße unter das Polster',
        'Fersen zum Gesäß ziehen',
        'Gesäß bleibt am Polster',
        'Kurz halten, langsam absenken'
      ],
      err: ['Hüfte hebt ab', 'Nur halbe Bewegung']
    },
    {
      id: 'lunge-db', name: 'Ausfallschritte (Kurzhanteln)', muscle: 'legs',
      sec: ['glutes'], equip: 'Kurzhanteln', pattern: 'lunge',
      level: 2, inc: 2, f: 0.18, reps: [10, 14], uni: true,
      cues: [
        'Aufrecht stehen, Brust raus',
        'Großen Schritt nach vorne setzen',
        'Vorderes Knie bis etwa 90° beugen',
        'Über die Ferse zurückdrücken'
      ],
      err: ['Oberkörper kippt nach vorn', 'Zu kurzer Schritt']
    },
    {
      id: 'split-squat-bul', name: 'Bulgarian Split Squat', muscle: 'legs',
      sec: ['glutes'], equip: 'Kurzhanteln', pattern: 'lunge',
      level: 3, inc: 2, f: 0.15, reps: [8, 12], uni: true,
      cues: [
        'Hinteren Fuß auf einer Bank ablegen',
        'Aufrecht bleiben, tief gehen',
        'Über die Ferse hochdrücken',
        'Gesäß und Quadrizeps aktiv anspannen'
      ],
      err: ['Zu geringer Abstand zur Bank', 'Knie fällt nach innen']
    },
    {
      id: 'rdl-bb', name: 'Rumänisches Kreuzheben', muscle: 'legs',
      sec: ['glutes', 'back'], equip: 'Langhantel', pattern: 'hinge',
      level: 2, inc: 5, f: 0.60, reps: [8, 12],
      cues: [
        'Langhantel dicht vor den Oberschenkeln führen',
        'Leichte Beugung in den Knien halten',
        'Hüfte nach hinten schieben, Rücken neutral',
        'Dehnung in den Beinbeugern spüren'
      ],
      err: ['Runder Rücken', 'Hantel wandert vom Körper weg']
    },
    {
      id: 'deadlift-sumo', name: 'Sumo-Kreuzheben', muscle: 'legs',
      sec: ['glutes', 'back'], equip: 'Langhantel', pattern: 'hinge',
      level: 3, inc: 5, f: 0.85, reps: [6, 10],
      cues: [
        'Breiter Stand, Zehen nach außen',
        'Hände zwischen die Beine greifen',
        'Brust raus, Rücken gerade',
        'Hüfte nach vorn oben treiben'
      ],
      err: ['Hüfte schießt zuerst hoch', 'Runder oberer Rücken']
    },
    {
      id: 'hacksquat', name: 'Hackenschmidt-Kniebeuge', muscle: 'legs',
      sec: ['glutes'], equip: 'Maschine', pattern: 'squat',
      level: 2, inc: 10, f: 0.70, reps: [8, 12],
      cues: [
        'Schultern unter die Polster',
        'Füße schulterbreit',
        'Knie beugen, tief gehen',
        'Über die Fersen hochdrücken, nicht durchstrecken'
      ],
      err: ['Fersen heben ab', 'Nur Teilbewegung']
    },

    /* ================= PO ================= */
    {
      id: 'hipthrust', name: 'Hip Thrust (Langhantel)', muscle: 'glutes',
      sec: ['legs'], equip: 'Langhantel', pattern: 'hipthrust',
      level: 2, inc: 5, f: 0.80, reps: [8, 12],
      cues: [
        'Schulterblätter auf der Bank ablegen',
        'Am obersten Punkt maximal anspannen',
        'Kinn einziehen, Rippen unten halten'
      ],
      err: ['Ins Hohlkreuz drücken', 'Nur halbe Streckung']
    },
    {
      id: 'glute-bridge', name: 'Glute Bridge (einbeinig)', muscle: 'glutes',
      sec: ['legs'], equip: 'Körpergewicht', pattern: 'hipthrust',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20], uni: true,
      cues: [
        'Rückenlage, ein Bein gestreckt anheben',
        'Hüfte hochdrücken, Po maximal anspannen',
        'Nicht ins Hohlkreuz fallen'
      ],
      err: ['Hüfte kippt zur Seite', 'Bewegung aus dem unteren Rücken']
    },
    {
      id: 'glute-kickback', name: 'Kabel-Kickbacks', muscle: 'glutes',
      sec: ['legs'], equip: 'Kabelzug', pattern: 'legkick',
      level: 1, inc: 2.5, f: 0.12, reps: [12, 20], uni: true,
      cues: [
        'Leicht nach vorne lehnen, Po anspannen',
        'Bein kontrolliert nach hinten strecken',
        'Am Endpunkt kurz halten'
      ],
      err: ['Schwungbewegung', 'Ausweichen ins Hohlkreuz']
    },
    {
      id: 'hip-abduction', name: 'Abduktion (Maschine)', muscle: 'glutes',
      sec: [], equip: 'Maschine', pattern: 'legmachine',
      level: 1, inc: 5, f: 0.35, reps: [15, 20],
      cues: [
        'Aufrecht sitzen, Rücken an der Lehne',
        'Langsam und kontrolliert nach außen drücken',
        'Obere Position kurz halten'
      ],
      err: ['Mit Schwung arbeiten', 'Oberkörper wippt mit']
    },
    {
      id: 'stepup', name: 'Step Ups (hoch)', muscle: 'glutes',
      sec: ['legs'], equip: 'Kurzhanteln', pattern: 'lunge',
      level: 2, inc: 2, f: 0.20, reps: [10, 15], uni: true,
      cues: [
        'Ganz über die Ferse hochdrücken',
        'Hüfte oben komplett strecken',
        'Kontrolliert wieder absenken'
      ],
      err: ['Abdrücken mit dem hinteren Bein', 'Zu niedrige Stufe']
    },

    /* ================= WADEN ================= */
    {
      id: 'calf-standing', name: 'Wadenheben (stehend)', muscle: 'calves',
      sec: [], equip: 'Maschine', pattern: 'calf',
      level: 1, inc: 5, f: 0.50, reps: [8, 15],
      cues: [
        'Aufrecht stehen, Knie gestreckt',
        'Fersen maximal anheben',
        'Oben kurz halten',
        'Langsam absenken, Dehnung spüren'
      ],
      err: ['Wippen aus dem Knie', 'Zu kurzer Bewegungsradius']
    },
    {
      id: 'calf-seated', name: 'Wadenheben (sitzend)', muscle: 'calves',
      sec: [], equip: 'Maschine', pattern: 'calf',
      level: 1, inc: 5, f: 0.30, reps: [10, 20],
      cues: [
        'Im Sitzen, Knie gebeugt – trainiert den Soleus',
        'Fersen anheben und Waden kontrahieren',
        'Langsam absenken, volle Dehnung'
      ],
      err: ['Nur Teilbewegung', 'Schwung statt Kontrolle']
    },
    {
      id: 'calf-legpress', name: 'Wadenheben an der Beinpresse', muscle: 'calves',
      sec: [], equip: 'Maschine', pattern: 'legmachine',
      level: 1, inc: 10, f: 0.90, reps: [12, 20],
      cues: [
        'Nur die Fußballen auf die Plattform stellen',
        'Fersen anheben, Waden maximal spannen',
        'Langsam absenken'
      ],
      err: ['Knie durchdrücken', 'Zu schweres Gewicht ohne volle Amplitude']
    },
    {
      id: 'calf-smith', name: 'Wadenheben (Smith Machine)', muscle: 'calves',
      sec: [], equip: 'Maschine', pattern: 'calf',
      level: 2, inc: 5, f: 0.50, reps: [8, 15],
      cues: [
        'Langhantel auf den Schultern ablegen',
        'Fersen anheben, oben kurz halten',
        'Langsam absenken'
      ],
      err: ['Zu wenig Bewegungsradius', 'Instabiler Stand']
    },
    {
      id: 'calf-single', name: 'Einbeiniges Wadenheben', muscle: 'calves',
      sec: [], equip: 'Körpergewicht', pattern: 'calf',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [10, 15], uni: true,
      cues: [
        'Auf einem Bein stehen',
        'Ferse anheben, Wade kontrahieren',
        'Langsam absenken, volle Dehnung'
      ],
      err: ['Festhalten und mitziehen', 'Zu schnelles Tempo']
    },
    {
      id: 'calf-jump', name: 'Sprung-Wadenheben', muscle: 'calves',
      sec: ['legs'], equip: 'Körpergewicht', pattern: 'calf',
      level: 2, bw: true, inc: 2.5, f: 0, reps: [15, 25],
      cues: [
        'Explosiv auf die Zehenspitzen springen',
        'Weich landen',
        'Für Power und Reaktivkraft'
      ],
      err: ['Harte Landung mit gestreckten Knien', 'Zu hohes Volumen am Anfang']
    },

    /* ============ ERGÄNZUNGEN OBERKÖRPER ============ */
    {
      id: 'incline-bb', name: 'Schrägbankdrücken (Langhantel)', muscle: 'chest',
      sec: ['shoulders', 'triceps'], equip: 'Langhantel', pattern: 'pressflat',
      level: 2, inc: 2.5, f: 0.50, reps: [6, 10],
      cues: [
        'Hantel im oberen Brustbereich absenken',
        'Ellenbogen etwa 45° zum Körper',
        'Obere Brust bewusst anspannen'
      ],
      err: ['Zu steile Bank – wird zur Schulterübung', 'Ellenbogen zu weit abgespreizt']
    },
    {
      id: 'decline-bb', name: 'Negativbankdrücken', muscle: 'chest',
      sec: ['triceps'], equip: 'Langhantel', pattern: 'pressflat',
      level: 2, inc: 2.5, f: 0.60, reps: [6, 10],
      cues: [
        'Bank auf Decline stellen',
        'Hantel zur unteren Brust führen',
        'Langsam absenken (3–5 Sek.), explosiv drücken'
      ],
      err: ['Abfedern auf der Brust', 'Zu kurze Bewegung']
    },
    {
      id: 'fly-db', name: 'Fliegende (Kurzhanteln)', muscle: 'chest',
      sec: ['shoulders'], equip: 'Kurzhanteln', pattern: 'fly',
      level: 1, inc: 2, f: 0.16, reps: [10, 15],
      cues: [
        'Leicht gebeugte Arme, Winkel bleibt konstant',
        'Brust weit dehnen',
        'Mit Gefühl zur Mitte zusammenführen'
      ],
      err: ['Arme durchstrecken', 'Zu tief für die Schulter']
    },
    {
      id: 'fly-incline', name: 'Schrägbank-Fliegende', muscle: 'chest',
      sec: ['shoulders'], equip: 'Kurzhanteln', pattern: 'fly',
      level: 2, inc: 2, f: 0.14, reps: [10, 15],
      cues: [
        'Ellenbogen leicht gebeugt halten',
        'Dehnung im oberen Brustbereich spüren',
        'Langsame Ausführung'
      ],
      err: ['Zu schweres Gewicht', 'Bewegung wird zum Drücken']
    },
    {
      id: 'press-machine', name: 'Brustpresse (Maschine)', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Maschine', pattern: 'pressflat',
      level: 1, inc: 5, f: 0.50, reps: [8, 12],
      cues: [
        'Rücken anlehnen, Griffe auf Brusthöhe',
        'Kontrolliert nach vorn drücken',
        'Volle Kontraktion im Brustmuskel'
      ],
      err: ['Schultern rollen nach vorn', 'Ellenbogen komplett durchdrücken']
    },
    {
      id: 'row-machine', name: 'Rudern an der Maschine', muscle: 'back',
      sec: ['biceps'], equip: 'Maschine', pattern: 'row',
      level: 1, inc: 5, f: 0.50, reps: [8, 12],
      cues: [
        'Brust an das Polster, Rücken gerade',
        'Schulterblätter zusammenziehen',
        'Kontrolliert zurückführen'
      ],
      err: ['Nur mit den Armen ziehen', 'Oberkörper pendelt']
    },
    {
      id: 'tbar-row', name: 'T-Bar Rudern', muscle: 'back',
      sec: ['biceps', 'traps'], equip: 'Langhantel', pattern: 'row',
      level: 2, inc: 5, f: 0.50, reps: [8, 12],
      cues: [
        'Oberkörper nach vorne beugen, Rücken gerade',
        'Neutraler Griff, zum Bauch ziehen',
        'Schulterblätter zusammenziehen'
      ],
      err: ['Runder Rücken', 'Schwung aus den Beinen']
    },
    {
      id: 'straight-arm-pd', name: 'Straight Arm Pushdown', muscle: 'back',
      sec: ['triceps'], equip: 'Kabelzug', pattern: 'extension',
      level: 1, inc: 2.5, f: 0.22, reps: [12, 15],
      cues: [
        'Arme gestreckt nach unten drücken',
        'Lat anspannen und Kontraktion halten',
        'Oberkörper bleibt ruhig'
      ],
      err: ['Bewegung aus dem Ellenbogen', 'Zu viel Gewicht']
    },
    {
      id: 'lateral-incline', name: 'Schrägbank-Seitheben', muscle: 'shoulders',
      sec: [], equip: 'Kurzhanteln', pattern: 'raise',
      level: 2, inc: 2, f: 0.08, reps: [12, 15], uni: true,
      cues: [
        'Auf der Schrägbank seitlich liegend heben',
        'Fokus auf die mittlere Schulter',
        'Langsam absenken'
      ],
      err: ['Schwung aus dem Rumpf', 'Zu großes Gewicht']
    },
    {
      id: 'lateral-cable', name: 'Kabelzug-Seitheben', muscle: 'shoulders',
      sec: [], equip: 'Kabelzug', pattern: 'raise',
      level: 1, inc: 2.5, f: 0.07, reps: [12, 20], uni: true,
      cues: [
        'Einarmig am Kabelzug, leicht nach vorn geneigt',
        'Konstante Spannung über die ganze Bewegung',
        'Bis Schulterhöhe heben'
      ],
      err: ['Mitreißen mit dem Oberkörper', 'Ellenbogen führt zu hoch']
    },
    {
      id: 'rear-delt-row', name: 'Bent Over Rear Delt Row', muscle: 'shoulders',
      sec: ['back', 'traps'], equip: 'Kurzhanteln', pattern: 'row',
      level: 2, inc: 2.5, f: 0.25, reps: [10, 15],
      cues: [
        'Oberkörper weit nach vorne beugen',
        'Ellenbogen nach außen ziehen',
        'Hintere Schulter maximieren'
      ],
      err: ['Zu enge Ellenbogenführung', 'Aufrichten während des Satzes']
    },
    {
      id: 'arnold-press', name: 'Arnold Press', muscle: 'shoulders',
      sec: ['triceps'], equip: 'Kurzhanteln', pattern: 'pressover',
      level: 2, inc: 2, f: 0.22, reps: [8, 12],
      cues: [
        'Hanteln vor der Brust starten',
        'Beim Drücken nach außen drehen',
        'Volle Bewegung, volle Kontrolle'
      ],
      err: ['Zu schnelles Drehen', 'Ins Hohlkreuz ausweichen']
    },
    {
      id: 'curl-concentration', name: 'Konzentrationscurl', muscle: 'biceps',
      sec: [], equip: 'Kurzhantel', pattern: 'curl',
      level: 1, inc: 2, f: 0.12, reps: [10, 15], uni: true,
      cues: [
        'Ellenbogen auf dem Oberschenkel abstützen',
        'Langsam nach oben curlen',
        'Bizeps oben maximal anspannen'
      ],
      err: ['Schwung aus der Schulter', 'Ellenbogen rutscht weg']
    },
    {
      id: 'ohext-cable', name: 'Überkopf-Trizepsdrücken am Kabel', muscle: 'triceps',
      sec: [], equip: 'Kabelzug', pattern: 'extension',
      level: 2, inc: 2.5, f: 0.25, reps: [12, 15],
      cues: [
        'Seil über Kopf fassen, Ellenbogen stabil halten',
        'Arme vollständig strecken',
        'Trizeps in der Dehnung bewusst spüren'
      ],
      err: ['Ellenbogen wandern nach außen', 'Ins Hohlkreuz fallen']
    }
  ];

  /* ------------------------------------------------------------
     Ausführungsfotos

     Für die meisten Übungen liegen zwei Aufnahmen vor
     (Start- und Endposition) – daraus entsteht in der Anzeige eine
     Überblendung. Fehlt ein Bild, zeigt GoFit die gezeichnete
     Silhouette. Die Dateien liegen unter
     assets/uebungen/<id>-1.jpg bzw. -2.jpg.
     ------------------------------------------------------------ */
  var PHOTOS = {
    'ab-wheel': 2, 'arnold-press': 2, 'bench-bb': 2, 'bench-close': 2,
    'cable-crunch': 2, 'calf-jump': 2, 'calf-legpress': 2, 'calf-seated': 2,
    'calf-single': 2, 'calf-smith': 2, 'calf-standing': 2, 'crunch': 2,
    'curl-bb': 2, 'curl-cable': 2, 'curl-concentration': 2, 'curl-db': 2,
    'curl-hammer': 2, 'curl-preacher': 2, 'deadlift-sumo': 2, 'decline-bb': 2,
    'dip-chest': 2, 'dip-triceps': 2, 'facepull': 2, 'fly-cable': 2,
    'fly-db': 2, 'fly-incline': 2, 'fly-machine': 2, 'front-raise': 2,
    'glute-bridge': 2, 'glute-kickback': 2, 'hacksquat': 2, 'hip-abduction': 2,
    'hipthrust': 2, 'incline-bb': 2, 'incline-db': 2, 'kickback': 2,
    'lateral': 2, 'lateral-cable': 2, 'lateral-incline': 2, 'latpull': 2,
    'legcurl': 2, 'legext': 2, 'legpress': 2, 'legpress-narrow': 2,
    'legraise': 2, 'legraise-floor': 2, 'lunge-db': 2, 'ohext-cable': 2,
    'ohp-bb': 2, 'plank': 1, 'press-machine': 2, 'pullover': 2,
    'pullup': 2, 'pushdown': 2, 'pushup': 2, 'rdl-bb': 2,
    'rear-delt-row': 2, 'rear-fly': 2, 'reverse-crunch': 2, 'row-bb': 2,
    'row-cable': 2, 'row-db': 2, 'row-machine': 2, 'russian-twist': 2,
    'shrug': 2, 'shrug-bb': 2, 'shrug-incline': 2, 'shrug-trapbar': 2,
    'side-plank': 1, 'skullcrusher': 2, 'split-squat-bul': 2, 'squat-bb': 2,
    'stepup': 2, 'straight-arm-pd': 2, 'tbar-row': 2, 'uprightrow-bb': 2,
    'uprightrow-cable': 2, 'vup': 2
  };

  /* ---------- Nachschlage-Index ---------- */
  var BY_ID = {};
  EX.forEach(function (e) {
    e.sec = e.sec || [];
    e.reps = e.reps || [8, 12];
    e.img = PHOTOS[e.id] || 0;
    BY_ID[e.id] = e;
  });

  /** Pfad zu einer Aufnahme (1 = Start, 2 = Endposition) */
  function photo(id, n) { return 'assets/uebungen/' + id + '-' + (n || 1) + '.jpg'; }

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
  G.LOWER_BODY = LOWER_BODY;
  G.EXERCISES = EX;
  G.ex = { byId: byId, byMuscle: byMuscle, suggestStart: suggestStart, photo: photo };
})(GoFit);
