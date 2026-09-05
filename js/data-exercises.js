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
    chest:     { key: 'chest',     name: 'Brust',    icon: 'muscleChest', color: 'var(--m-chest)' },
    back:      { key: 'back',      name: 'Rücken',   icon: 'muscleBack', color: 'var(--m-back)' },
    abs:       { key: 'abs',       name: 'Bauch',    icon: 'muscleAbs', color: 'var(--m-abs)' },
    biceps:    { key: 'biceps',    name: 'Bizeps',   icon: 'muscleBiceps', color: 'var(--m-biceps)' },
    triceps:   { key: 'triceps',   name: 'Trizeps',  icon: 'muscleTriceps', color: 'var(--m-triceps)' },
    shoulders: { key: 'shoulders', name: 'Schulter', icon: 'muscleShoulders', color: 'var(--m-shoulders)' }
  };

  var MUSCLE_ORDER = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs'];

  var EX = [
    /* ================= BRUST ================= */
    {
      id: 'bench-bb', name: 'Negativ-Bankdrücken (Langhantel)', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Langhantel', pattern: 'pressflat',
      demo: 'assets/exercises/gifs/bench-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/bench-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/incline-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/fly-cable-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/butterfly-avatar-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.30, reps: [10, 15],
      cues: [
        'Sitzhöhe so wählen, dass die Griffe auf Brusthöhe liegen',
        'Rücken bleibt an der Lehne',
        'Langsam öffnen, aktiv schließen'
      ],
      err: ['Griffe zusammenschlagen', 'Schultern hochziehen']
    },
    {
      id: 'fly-machine-2', name: 'Butterfly 2 (Maschine)', muscle: 'chest',
      sec: ['shoulders'], equip: 'Maschine', pattern: 'fly',
      demo: 'assets/exercises/gifs/butterfly2-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.30, reps: [10, 15],
      cues: [
        'Sitzhöhe so einstellen, dass die Griffe auf Brusthöhe liegen',
        'Rücken und Kopf bleiben an der Lehne',
        'Arme kontrolliert öffnen und ohne Schwung schließen'
      ],
      err: ['Schultern hochziehen', 'Gewichte am Endpunkt ablegen']
    },
    {
      id: 'pushup', name: 'Liegestütze', muscle: 'chest',
      sec: ['triceps', 'shoulders', 'abs'], equip: 'Körpergewicht', pattern: 'dip',
      demo: 'assets/exercises/gifs/pushup-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [10, 20],
      cues: [
        'Körper bildet eine gerade Linie von Kopf bis Ferse',
        'Bauch und Gesäß aktiv anspannen',
        'Ellenbogen nach hinten-außen, nicht senkrecht zur Seite'
      ],
      err: ['Hüfte hängt durch', 'Kopf schiebt vor', 'Halbe Bewegungsamplitude']
    },
    {
      id: 'pushup-close', name: 'Liegestütze eng', muscle: 'chest',
      sec: ['triceps', 'shoulders', 'abs'], equip: 'Körpergewicht', pattern: 'dip',
      demo: 'assets/exercises/gifs/pushup-close-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Hände enger als schulterbreit unter der Brust aufsetzen',
        'Ellenbogen nah am Körper nach hinten führen',
        'Körper bleibt von Kopf bis Ferse in einer Linie'
      ],
      err: ['Ellenbogen weit nach außen', 'Hüfte hängt durch', 'Schultern hochziehen']
    },
    {
      id: 'pushup-decline', name: 'Liegestütze schwer', muscle: 'chest',
      sec: ['triceps', 'shoulders', 'abs'], equip: 'Körpergewicht', pattern: 'dip',
      demo: 'assets/exercises/gifs/pushup-decline-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, bw: true, inc: 2.5, f: 0, reps: [6, 12],
      cues: [
        'Füße erhöht und Hände stabil unter den Schultern platzieren',
        'Rumpf und Beine bilden eine gerade Linie',
        'Brust kontrolliert zum Boden absenken und kraftvoll hochdrücken'
      ],
      err: ['Hüfte kippt ab', 'Schultern wandern zu den Ohren', 'Zu schnelle Wiederholungen']
    },
    {
      id: 'pushup-knee', name: 'Liegestütze leicht am Boden', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Körpergewicht', pattern: 'dip',
      demo: 'assets/exercises/gifs/pushup-knee-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [10, 20],
      cues: [
        'Knie am Boden ablegen und Füße locker anheben',
        'Körper von Knie bis Kopf gerade halten',
        'Brust langsam absenken und mit stabilem Rumpf zurückdrücken'
      ],
      err: ['Gesäß nach hinten schieben', 'Hüfte hängt durch', 'Ellenbogen weit nach außen']
    },
    {
      id: 'pushup-positive', name: 'Positive Liegestütze', muscle: 'chest',
      sec: ['triceps', 'shoulders', 'abs'], equip: 'Körpergewicht', pattern: 'dip',
      demo: 'assets/exercises/gifs/pushup-positive-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Hände erhöht auf einer stabilen Box oder Bank aufsetzen',
        'Körper bleibt von Kopf bis Ferse in einer Linie',
        'Brust kontrolliert absenken und aktiv nach oben drücken'
      ],
      err: ['Unterlage ist instabil', 'Hüfte hängt durch', 'Schultern hochziehen']
    },
    {
      id: 'dip-chest', name: 'Dips (brustbetont)', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Barren', pattern: 'dip',
      demo: 'assets/exercises/gifs/dip-chest-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [6, 12],
      cues: [
        'Oberkörper bewusst nach vorne neigen',
        'Ellenbogen leicht nach außen führen',
        'Nur so tief, wie die Schulter es schmerzfrei zulässt'
      ],
      err: ['Zu tief mit rundem Schultergürtel', 'Schwung aus den Beinen']
    },
    {
      id: 'dip-heavy', name: 'Dips schwer', muscle: 'chest',
      sec: ['triceps', 'shoulders'], equip: 'Barren', pattern: 'dip',
      demo: 'assets/exercises/gifs/dip-heavy-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [5, 10],
      cues: [
        'Zusatzgewicht sicher am Gürtel befestigen',
        'Oberkörper leicht nach vorn neigen und Schultern tief halten',
        'Kontrolliert absenken und ohne Schwung hochdrücken'
      ],
      err: ['Gewicht schwingt', 'Zu tiefe Position mit runden Schultern', 'Halbe Wiederholungen']
    },

    /* ================= RÜCKEN ================= */
    {
      id: 'pullup', name: 'Klimmzüge', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/pullup-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [5, 10],
      cues: [
        'Aus dem Hang aktiv die Schulterblätter nach unten ziehen',
        'Brust zur Stange führen, nicht nur das Kinn',
        'Am Ende kontrolliert und vollständig absenken'
      ],
      err: ['Schwung aus der Hüfte (Kipping)', 'Halbe Wiederholungen']
    },
    {
      id: 'pullup-assisted', name: 'Klimmzüge Anfänger', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/pullup-assisted-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [6, 12],
      cues: [
        'Ein Fuß unterstützt leicht auf einer stabilen Bank',
        'Schulterblätter zuerst nach unten ziehen',
        'Kontrolliert absenken und die Unterstützung nur so stark wie nötig nutzen'
      ],
      err: ['Mit dem Bein abspringen', 'Schwung aus der Hüfte', 'Nur halbe Wiederholungen']
    },
    {
      id: 'pullup-close-overhand', name: 'Klimmzüge Obergriff eng', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/pullup-close-overhand-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, bw: true, inc: 2.5, f: 0, reps: [5, 10],
      cues: [
        'Stange im engen Obergriff greifen',
        'Brust zur Stange ziehen und Ellenbogen nach unten führen',
        'Aus dem Hang vollständig und kontrolliert absenken'
      ],
      err: ['Handgelenke knicken ab', 'Schwung holen', 'Kinn nur nach vorn schieben']
    },
    {
      id: 'pullup-wide-overhand', name: 'Klimmzüge Obergriff breit', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/pullup-wide-overhand-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [4, 8],
      cues: [
        'Stange deutlich breiter als schulterbreit im Obergriff greifen',
        'Brust nach oben zur Stange ziehen und Ellenbogen nach unten führen',
        'Ohne Schwung vollständig absenken'
      ],
      err: ['Zu weiter Griff mit Schulterstress', 'Schwung holen', 'Kinn nur nach vorn schieben']
    },
    {
      id: 'pullup-wide-weighted', name: 'Klimmzüge Obergriff breit Zusatzgewicht', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Klimmzugstange + Gewicht', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/pullup-wide-weighted-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [3, 8],
      cues: [
        'Zusatzgewicht sicher am Gürtel befestigen',
        'Breiten Obergriff stabil halten und die Brust zur Stange führen',
        'Ohne Schwung vollständig absenken'
      ],
      err: ['Gewicht schwingt', 'Schwung aus der Hüfte', 'Zu weiter Griff mit Schulterstress']
    },
    {
      id: 'latpull', name: 'Latziehen', muscle: 'back',
      sec: ['biceps'], equip: 'Kabelzug', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/latpull-close-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.55, reps: [8, 12],
      cues: [
        'Griff etwas weiter als schulterbreit',
        'Brust heraus, leichte Rücklage von etwa 10–15°',
        'Stange zur oberen Brust ziehen, Ellenbogen nach unten denken'
      ],
      err: ['Ziehen in den Nacken', 'Rumpf pendelt stark', 'Nur mit den Armen ziehen']
    },
    {
      id: 'latpull-chest', name: 'Latzug zur Brust', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Kabelzug', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/latpull-chest-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.55, reps: [8, 12],
      cues: [
        'Obergriff etwa schulterbreit wählen',
        'Brust anheben und Stange kontrolliert zur Brust ziehen',
        'Ellenbogen nach unten führen und langsam zurücklassen'
      ],
      err: ['Stange hinter den Kopf ziehen', 'Rumpf pendelt stark', 'Schultern hochziehen']
    },
    {
      id: 'latpull-close-neck', name: 'Latzug eng zum Nacken', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Kabelzug', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/latpull-neck-close-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.50, reps: [8, 12],
      cues: [
        'Engen Griff kontrolliert hinter den Kopf führen',
        'Aufrechte Haltung und ruhigen Nacken beibehalten',
        'Stange nur so weit absenken, wie die Schulter es schmerzfrei zulässt'
      ],
      err: ['Stange ruckartig ziehen', 'Kopf nach vorn schieben', 'Zu tief in den Nacken ziehen']
    },
    {
      id: 'latpull-wide-chest', name: 'Latzug breit zur Brust', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Kabelzug', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/latpull-wide-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 5, f: 0.55, reps: [8, 12],
      cues: [
        'Breiten Obergriff etwas außerhalb der Schultern greifen',
        'Brust heben und Stange zur oberen Brust ziehen',
        'Ellenbogen nach unten führen und langsam lösen'
      ],
      err: ['Ziehen hinter den Kopf', 'Rumpf pendelt stark', 'Nur mit den Armen ziehen']
    },
    {
      id: 'latpull-wide-neck', name: 'Latzug breit zum Nacken', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Kabelzug', pattern: 'pulldown',
      demo: 'assets/exercises/gifs/latpull-wide-neck-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 5, f: 0.50, reps: [8, 12],
      cues: [
        'Breiten Obergriff stabil halten und aufrecht sitzen',
        'Stange kontrolliert hinter den Kopf absenken',
        'Nur im schmerzfreien Bewegungsbereich trainieren'
      ],
      err: ['Kopf nach vorn schieben', 'Schwung aus dem Oberkörper', 'Zu tief in den Nacken ziehen']
    },
    {
      id: 'row-bb', name: 'Langhantelrudern', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Langhantel', pattern: 'row',
      demo: 'assets/exercises/gifs/row-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, inc: 2.5, f: 0.50, reps: [6, 10],
      cues: [
        'Hüfte nach hinten schieben, Oberkörper etwa 45° geneigt',
        'Rücken bleibt durchgehend gerade und angespannt',
        'Stange zum unteren Brustkorb / oberen Bauch ziehen'
      ],
      err: ['Runder unterer Rücken', 'Oberkörper richtet sich bei jeder Wiederholung auf']
    },
    {
      id: 'row-bb-underhand-incline', name: 'Langhantelrudern Untergriff Schrägbank', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Langhantel + Schrägbank', pattern: 'row',
      demo: 'assets/exercises/gifs/row-bb-underhand-incline-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.40, reps: [8, 12],
      cues: [
        'Brust auf der Schrägbank ablegen und Untergriff schulterbreit wählen',
        'Stange kontrolliert zum unteren Brustkorb ziehen',
        'Rumpf bleibt ruhig an der Bank und die Schultern tief'
      ],
      err: ['Brust hebt von der Bank ab', 'Handgelenke knicken ab', 'Schwung aus dem Oberkörper']
    },
    {
      id: 'row-smith-underhand', name: 'Langhantelrudern Untergriff Multipresse', muscle: 'back',
      sec: ['biceps', 'shoulders'], equip: 'Multipresse', pattern: 'row',
      demo: 'assets/exercises/gifs/row-smith-underhand-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.45, reps: [8, 12],
      cues: [
        'Stange im schulterbreiten Untergriff greifen',
        'Rücken neutral halten und Stange zum Bauch ziehen',
        'Bewegung kontrolliert zurückführen'
      ],
      err: ['Runder Rücken', 'Knie blockieren', 'Oberkörper richtet sich bei jeder Wiederholung auf']
    },
    {
      id: 'row-db', name: 'Kurzhantelrudern (einarmig)', muscle: 'back',
      sec: ['biceps'], equip: 'Kurzhantel', pattern: 'row',
      demo: 'assets/exercises/gifs/row-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/row-cable-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/pullover-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.18, reps: [10, 14],
      cues: [
        'Hantel mit beiden Händen über der Brust halten',
        'Arme fast gestreckt hinter den Kopf führen',
        'Bewegung nur so weit, wie die Schulter mitgeht'
      ],
      err: ['Zu weites Absenken', 'Ellenbogen knicken stark ein']
    },
    {
      id: 'pullover-db-hammer', name: 'Pullover Kurzhantel Hammergriff', muscle: 'back',
      sec: ['chest', 'triceps'], equip: 'Kurzhanteln', pattern: 'pullover',
      demo: 'assets/exercises/gifs/pullover-db-hammer-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2, f: 0.16, reps: [10, 14],
      cues: [
        'Kurzhanteln im neutralen Hammergriff über der Brust halten',
        'Arme leicht gebeugt kontrolliert hinter den Kopf führen',
        'Rippen unten und Rücken stabil auf der Bank halten'
      ],
      err: ['Hanteln zu weit absenken', 'Ellenbogen stark beugen', 'Hohlkreuz verstärken']
    },
    {
      id: 'pullover-db-ball', name: 'Pullover Kurzhantel Gymnastikball', muscle: 'back',
      sec: ['chest', 'triceps', 'abs'], equip: 'Kurzhantel + Gymnastikball', pattern: 'pullover',
      demo: 'assets/exercises/gifs/pullover-db-ball-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2, f: 0.14, reps: [10, 14],
      cues: [
        'Schulterblätter sicher auf dem Ball positionieren',
        'Hüfte oben und den gesamten Rumpf fest halten',
        'Hantel langsam hinter den Kopf und wieder über die Brust führen'
      ],
      err: ['Hüfte sinkt ab', 'Ball rollt während der Bewegung', 'Zu großer Bewegungsumfang']
    },
    {
      id: 'pullover-cable', name: 'Pullover am Kabelzug', muscle: 'back',
      sec: ['chest', 'triceps'], equip: 'Kabelzug + Bank', pattern: 'pullover',
      demo: 'assets/exercises/gifs/pullover-cable-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.18, reps: [10, 15],
      cues: [
        'Bank stabil zum Kabelzug ausrichten',
        'Arme leicht gebeugt und den Griff kontrolliert über den Kopf führen',
        'Rumpf bleibt während der gesamten Bewegung angespannt'
      ],
      err: ['Kabel zieht den Körper von der Bank', 'Ellenbogen stark beugen', 'Zu schnelles Zurückführen']
    },
    {
      id: 'pullover-bb', name: 'Pullover mit Langhantel', muscle: 'back',
      sec: ['chest', 'triceps'], equip: 'Langhantel', pattern: 'pullover',
      demo: 'assets/exercises/gifs/pullover-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.22, reps: [8, 12],
      cues: [
        'Langhantel schulterbreit über der Brust halten',
        'Arme leicht gebeugt kontrolliert hinter den Kopf führen',
        'Schultern und Rücken stabil auf der Bank halten'
      ],
      err: ['Griff zu breit', 'Hantel zu weit absenken', 'Starkes Hohlkreuz']
    },
    /* ================= SCHULTER ================= */
    {
      id: 'ohp-db', name: 'Schulterdrücken (Kurzhantel)', muscle: 'shoulders',
      sec: ['triceps'], equip: 'Kurzhanteln', pattern: 'pressover',
      demo: 'assets/exercises/gifs/ohp-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/ohp-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/lateral-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/front-raise-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/reverse-fly-machine-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2.5, f: 0.14, reps: [12, 18],
      cues: [
        'Brust an das Polster, Rücken gerade',
        'Arme nach hinten öffnen, Ellenbogen leicht gebeugt',
        'Fokus auf die hintere Schulter, nicht auf den oberen Rücken'
      ],
      err: ['Zu viel Gewicht', 'Bewegung wird zum Rudern']
    },
    {
      id: 'rear-fly-db', name: 'Butterfly Reverse Kurzhantel', muscle: 'shoulders',
      sec: ['back'], equip: 'Kurzhanteln + Bank', pattern: 'fly',
      demo: 'assets/exercises/gifs/reverse-fly-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 1, f: 0.08, reps: [12, 18],
      cues: [
        'Vorgebeugt auf der Bank sitzen und Rücken neutral halten',
        'Arme mit leicht gebeugten Ellenbogen seitlich öffnen',
        'Bewegung aus der hinteren Schulter führen'
      ],
      err: ['Schwung aus dem Oberkörper', 'Hanteln zu hoch heben', 'Bewegung wird zum Rudern']
    },
    {
      id: 'rear-fly-db-incline', name: 'Butterfly Reverse Kurzhantel Schrägbank', muscle: 'shoulders',
      sec: ['back'], equip: 'Kurzhanteln + Schrägbank', pattern: 'fly',
      demo: 'assets/exercises/gifs/reverse-fly-db-incline-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 1, f: 0.08, reps: [12, 18],
      cues: [
        'Brust stabil auf der Schrägbank ablegen',
        'Arme mit leicht gebeugten Ellenbogen nach außen öffnen',
        'Schulterblätter kontrolliert zusammenführen'
      ],
      err: ['Brust hebt von der Bank ab', 'Zu schweres Gewicht', 'Schultern zu den Ohren ziehen']
    },
    {
      id: 'rear-fly-cable-bent', name: 'Butterfly Reverse Kabelzug vorgebeugt', muscle: 'shoulders',
      sec: ['back'], equip: 'Kabelzug', pattern: 'fly',
      demo: 'assets/exercises/gifs/reverse-fly-cable-bent-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.10, reps: [12, 18],
      cues: [
        'Hüfte nach hinten schieben und Rücken neutral halten',
        'Kabel mit leicht gebeugten Armen seitlich auseinanderziehen',
        'Rumpf bleibt während der Bewegung ruhig'
      ],
      err: ['Runder Rücken', 'Schwung aus der Hüfte', 'Ellenbogen stark beugen']
    },
    {
      id: 'rear-fly-cable-standing', name: 'Butterfly Reverse Kabelzug stehend', muscle: 'shoulders',
      sec: ['back'], equip: 'Kabelzug', pattern: 'fly',
      demo: 'assets/exercises/gifs/reverse-fly-cable-standing-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2.5, f: 0.10, reps: [12, 18],
      cues: [
        'Aufrecht und stabil vor dem Kabelzug stehen',
        'Arme auf Schulterhöhe kontrolliert nach außen führen',
        'Ellenbogen leicht gebeugt und Schultern tief halten'
      ],
      err: ['Zurücklehnen', 'Schultern hochziehen', 'Zu schnelles Zurückführen']
    },
    {
      id: 'rear-fly-cable-lying', name: 'Butterfly Reverse Kabelzug liegend', muscle: 'shoulders',
      sec: ['back'], equip: 'Kabelzug + Bank', pattern: 'fly',
      demo: 'assets/exercises/gifs/reverse-fly-cable-lying-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.10, reps: [12, 18],
      cues: [
        'Mittig und stabil auf der Bank liegen',
        'Kabel über Kreuz mit leicht gebeugten Armen nach außen führen',
        'Schulterblätter kontrolliert in Richtung Bank bewegen'
      ],
      err: ['Arme stark beugen', 'Schultern hochziehen', 'Zu großer Bewegungsumfang']
    },
    {
      id: 'shrug', name: 'Nackenheben (Shrugs)', muscle: 'shoulders',
      sec: ['back'], equip: 'Kurzhanteln', pattern: 'shrug',
      demo: 'assets/exercises/gifs/shrug-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/curl-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2.5, f: 0.28, reps: [8, 12],
      cues: [
        'Ellenbogen bleiben am Rumpf fixiert',
        'Oberkörper aufrecht, kein Zurücklehnen',
        'Oben kurz halten, langsam absenken'
      ],
      err: ['Schwung aus dem Rücken', 'Ellenbogen wandern nach vorne']
    },
    {
      id: 'curl-bb-scott', name: 'Langhantelcurls Scottcurls', muscle: 'biceps',
      sec: [], equip: 'Langhantel + Scottbank', pattern: 'curl',
      demo: 'assets/exercises/gifs/curl-bb-scott-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.22, reps: [8, 12],
      cues: [
        'Oberarme vollständig am Scottpolster ablegen',
        'Langhantel kontrolliert anheben und langsam absenken',
        'Handgelenke in einer neutralen Linie halten'
      ],
      err: ['Oberarme vom Polster lösen', 'Ellenbogen vollständig durchdrücken', 'Schwung aus dem Oberkörper']
    },
    {
      id: 'curl-db', name: 'Kurzhantel-Curl', muscle: 'biceps',
      sec: [], equip: 'Kurzhanteln', pattern: 'curl',
      demo: 'assets/exercises/gifs/curl-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2, f: 0.13, reps: [10, 14],
      cues: [
        'Handgelenk beim Hochführen leicht nach außen drehen',
        'Volle Streckung am unteren Punkt',
        'Beide Seiten gleich schnell bewegen'
      ],
      err: ['Nur halb absenken', 'Schulter zieht mit nach vorne']
    },
    {
      id: 'curl-db-incline-bilateral', name: 'Kurzhantelcurls beidarmig Schrägbank', muscle: 'biceps',
      sec: [], equip: 'Kurzhanteln + Schrägbank', pattern: 'curl',
      demo: 'assets/exercises/gifs/curl-db-incline-bilateral-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2, f: 0.12, reps: [8, 12],
      cues: [
        'Rücken und Kopf stabil an der Schrägbank halten',
        'Beide Hanteln gleichzeitig ohne Schwung anheben',
        'Arme unten kontrolliert fast vollständig strecken'
      ],
      err: ['Schultern rollen nach vorn', 'Ellenbogen wandern vor', 'Zu schnelles Absenken']
    },
    {
      id: 'curl-db-bilateral', name: 'Kurzhantelcurls beidarmig gleichzeitig', muscle: 'biceps',
      sec: [], equip: 'Kurzhanteln', pattern: 'curl',
      demo: 'assets/exercises/gifs/curl-db-bilateral-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2, f: 0.13, reps: [10, 14],
      cues: [
        'Beide Kurzhanteln gleichzeitig kontrolliert anheben',
        'Ellenbogen bleiben eng und ruhig am Rumpf',
        'Oberkörper aufrecht und ohne Schwung halten'
      ],
      err: ['Zurücklehnen', 'Ellenbogen wandern nach vorn', 'Hanteln nur halb absenken']
    },
    {
      id: 'curl-preacher', name: 'Scott-Curl (Preacher)', muscle: 'biceps',
      sec: [], equip: 'Scottbank', pattern: 'curl',
      demo: 'assets/exercises/gifs/curl-preacher-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/curl-cable-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      id: 'triceps-cable-lying', name: 'Trizepsdrücken am Kabelzug liegend', muscle: 'triceps',
      sec: ['shoulders'], equip: 'Kabelzug + Bank', pattern: 'extension',
      demo: 'assets/exercises/gifs/triceps-cable-lying-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.20, reps: [10, 15],
      cues: [
        'Mittig auf der Bank liegen und Oberarme ruhig halten',
        'Griff kontrolliert über die Ellenbogen strecken',
        'Kabelspannung während des gesamten Satzes halten'
      ],
      err: ['Oberarme bewegen sich stark', 'Ellenbogen spreizen ab', 'Gewicht wird ruckartig gestreckt']
    },
    {
      id: 'bench-dip-triceps', name: 'Bank-Dips (Trizeps)', muscle: 'triceps',
      sec: ['chest', 'shoulders'], equip: 'Bank', pattern: 'dip',
      demo: 'assets/exercises/gifs/triceps-bench-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Hände schulterbreit an der vorderen Bankkante platzieren',
        'Rücken nah an der Bank führen und Ellenbogen nach hinten beugen',
        'Aus dem Trizeps kontrolliert zurück in die Streckung drücken'
      ],
      err: ['Schultern nach vorn kippen', 'Zu tief absenken', 'Mit den Beinen nachhelfen']
    },
    {
      id: 'bench-db-triceps', name: 'Trizeps-Bankdrücken mit Kurzhanteln', muscle: 'triceps',
      sec: ['chest', 'shoulders'], equip: 'Kurzhanteln', pattern: 'pressflat',
      demo: 'assets/exercises/gifs/bench-db-triceps-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2, f: 0.18, reps: [8, 12],
      cues: [
        'Kurzhanteln eng und neutral über der Brust halten',
        'Ellenbogen dicht am Rumpf kontrolliert absenken',
        'Aus dem Trizeps gleichmäßig nach oben drücken'
      ],
      err: ['Ellenbogen spreizen weit ab', 'Hanteln kippen', 'Schultern rollen nach vorn']
    },
    {
      id: 'bench-bb-triceps', name: 'Trizeps-Bankdrücken mit Langhantel', muscle: 'triceps',
      sec: ['chest', 'shoulders'], equip: 'Langhantel', pattern: 'pressflat',
      demo: 'assets/exercises/gifs/bench-bb-triceps-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.42, reps: [6, 10],
      cues: [
        'Stange etwa schulterbreit greifen und Handgelenke gerade halten',
        'Ellenbogen eng am Körper zur unteren Brust führen',
        'Schulterblätter bleiben fest auf der Bank'
      ],
      err: ['Griff zu eng', 'Ellenbogen spreizen ab', 'Stange wird auf der Brust abgefedert']
    },
    {
      id: 'skullcrusher', name: 'Stirndrücken (French Press)', muscle: 'triceps',
      sec: [], equip: 'SZ-Stange', pattern: 'extension',
      demo: 'assets/exercises/gifs/skullcrusher-bb-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/triceps-overhead-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 2, f: 0.16, reps: [10, 14],
      cues: [
        'Hantel mit beiden Händen hinter dem Kopf halten',
        'Oberarme bleiben senkrecht',
        'Bauch anspannen, kein Hohlkreuz'
      ],
      err: ['Ellenbogen weichen nach außen', 'Rippenbogen kippt nach vorne']
    },
    {
      id: 'triceps-cable-overhead-onearm', name: 'Trizepsdrücken am Kabelzug einarmig über Kopf', muscle: 'triceps',
      sec: ['shoulders'], equip: 'Kabelzug', pattern: 'extension',
      demo: 'assets/exercises/gifs/triceps-cable-overhead-onearm-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, inc: 1, f: 0.08, reps: [10, 15], uni: true,
      cues: [
        'Oberarm dicht am Kopf und Ellenbogen nach oben halten',
        'Unterarm gegen den Kabelzug vollständig strecken',
        'Rumpf fest halten und beide Seiten gleich trainieren'
      ],
      err: ['Oberarm fällt nach außen', 'Rücken weicht ins Hohlkreuz', 'Schwung aus dem Oberkörper']
    },
    {
      id: 'kickback', name: 'Trizeps-Kickback', muscle: 'triceps',
      sec: [], equip: 'Kurzhantel', pattern: 'extension',
      demo: 'assets/exercises/gifs/kickback-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
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
      demo: 'assets/exercises/gifs/crunch-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [15, 25],
      cues: [
        'Unterer Rücken bleibt am Boden',
        'Kinn nicht auf die Brust pressen',
        'Bewegung kommt aus dem Bauch, nicht aus den Armen'
      ],
      err: ['Ziehen am Nacken', 'Zu großer Bewegungsumfang aus der Hüfte']
    },
    {
      id: 'situp-straight', name: 'Sit-ups (gerade Bauchmuskeln)', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'crunch',
      demo: 'assets/exercises/gifs/situp-straight-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20],
      cues: [
        'Füße stabil aufstellen und unteren Rücken kontrolliert abrollen',
        'Oberkörper aus der Bauchspannung anheben',
        'Langsam und Wirbel für Wirbel zurück zum Boden bewegen'
      ],
      err: ['Am Nacken ziehen', 'Mit Schwung hochkommen', 'Füße heben vom Boden ab']
    },
    {
      id: 'crunch-side', name: 'Seitliche Crunches (schräge Bauchmuskeln)', muscle: 'abs',
      sec: [], equip: 'Körpergewicht', pattern: 'crunch',
      demo: 'assets/exercises/gifs/crunch-side-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20], uni: true,
      cues: [
        'Schultern leicht anheben und den Oberkörper kontrolliert zur Seite drehen',
        'Bewegung aus den schrägen Bauchmuskeln führen',
        'Beide Seiten gleichmäßig trainieren'
      ],
      err: ['Am Kopf ziehen', 'Nur den Ellenbogen bewegen', 'Mit Schwung rotieren']
    },
    {
      id: 'abs-side-bench', name: 'Seitlicher Bauch', muscle: 'abs',
      sec: [], equip: 'Bank', pattern: 'crunch',
      demo: 'assets/exercises/gifs/abs-side-bench-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, inc: 2.5, f: 0, reps: [12, 20], uni: true,
      cues: [
        'Unterschenkel stabil auf der Bank ablegen',
        'Becken ruhig halten und den Oberkörper kontrolliert seitlich einrollen',
        'Beide Seiten gleichmäßig trainieren'
      ],
      err: ['Schwung aus den Beinen', 'Am Kopf ziehen', 'Becken dreht stark mit']
    },
    {
      id: 'legraise', name: 'Beinheben (hängend)', muscle: 'abs',
      sec: ['back'], equip: 'Klimmzugstange', pattern: 'legraise',
      demo: 'assets/exercises/gifs/legraise-hanging-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 3, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Becken bewusst nach hinten kippen',
        'Beine gestreckt oder – leichter – angewinkelt heben',
        'Kein Pendeln, kontrolliert absenken'
      ],
      err: ['Schwung aus dem Körper', 'Nur Hüftbeuger arbeiten']
    },
    {
      id: 'legraise-hanging-station', name: 'Hängendes Beinheben', muscle: 'abs',
      sec: ['back', 'shoulders'], equip: 'Klimmzugstation', pattern: 'legraise',
      demo: 'assets/exercises/gifs/legraise-hanging-station-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, bw: true, inc: 2.5, f: 0, reps: [8, 15],
      cues: [
        'Schultern aktiv nach unten ziehen und ruhig hängen',
        'Becken einrollen und Beine kontrolliert anheben',
        'Ohne Pendeln langsam in die Ausgangsposition zurückkehren'
      ],
      err: ['Schwung aus dem Körper', 'Schultern vollständig aushängen', 'Beine unkontrolliert fallen lassen']
    },
    {
      id: 'plank', name: 'Unterarmstütz (Plank)', muscle: 'abs',
      sec: ['shoulders'], equip: 'Körpergewicht', pattern: 'plank',
      demo: 'assets/exercises/gifs/plank-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, time: true, inc: 5, f: 0, reps: [30, 60],
      cues: [
        'Ellenbogen unter den Schultern',
        'Gerade Linie von Kopf bis Ferse',
        'Gesäß und Bauch aktiv anspannen, ruhig weiteratmen'
      ],
      err: ['Hüfte sinkt ab', 'Gesäß zu hoch', 'Luft anhalten']
    },
    {
      id: 'plank-weighted', name: 'Unterarmstütz (Plank) mit Gewicht', muscle: 'abs',
      sec: ['shoulders', 'back'], equip: 'Gewichtsscheibe', pattern: 'plank',
      demo: 'assets/exercises/gifs/plank-weighted-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, bw: true, time: true, inc: 2.5, f: 0, reps: [20, 45],
      cues: [
        'Gewichtsscheibe sicher mittig auf dem oberen Rücken platzieren',
        'Körper von Kopf bis Ferse in einer Linie halten',
        'Bauch und Gesäß fest anspannen und ruhig weiteratmen'
      ],
      err: ['Gewicht liegt auf der Lendenwirbelsäule', 'Hüfte sinkt ab', 'Luft anhalten']
    },
    {
      id: 'side-plank', name: 'Unterarmstütz seitlich ohne Hantel', muscle: 'abs',
      sec: ['shoulders'], equip: 'Körpergewicht', pattern: 'plank',
      demo: 'assets/exercises/gifs/side-plank-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 1, bw: true, time: true, inc: 5, f: 0, reps: [20, 45], uni: true,
      cues: [
        'Ellenbogen direkt unter der Schulter platzieren',
        'Hüfte anheben und den Körper seitlich in einer Linie halten',
        'Beide Körperseiten gleich lang trainieren'
      ],
      err: ['Hüfte sinkt ab', 'Schulter fällt nach vorn', 'Oberkörper dreht sich']
    },
    {
      id: 'side-plank-db', name: 'Unterarmstütz seitlich mit Kurzhantel', muscle: 'abs',
      sec: ['shoulders'], equip: 'Kurzhantel', pattern: 'plank',
      demo: 'assets/exercises/gifs/side-plank-db-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, bw: true, time: true, inc: 1, f: 0, reps: [15, 40], uni: true,
      cues: [
        'Kurzhantel sicher auf der oberen Hüfte halten',
        'Ellenbogen direkt unter der Schulter und Hüfte oben halten',
        'Beide Seiten kontrolliert und gleich lang trainieren'
      ],
      err: ['Hantel rutscht', 'Hüfte sinkt ab', 'Oberkörper dreht nach vorn']
    },
    {
      id: 'cable-crunch', name: 'Crunches am Kabelzug', muscle: 'abs',
      sec: [], equip: 'Kabelzug', pattern: 'crunch',
      demo: 'assets/exercises/gifs/crunch-cable-kneeling-whiteclean.gif?v=1', demoStyle: 'reference-gif',
      level: 2, inc: 2.5, f: 0.30, reps: [12, 18],
      cues: [
        'Kniend, Seil neben dem Kopf halten',
        'Wirbelsäule von oben nach unten einrollen',
        'Hüftwinkel bleibt weitgehend konstant'
      ],
      err: ['Bewegung aus der Hüfte statt aus dem Bauch', 'Arme ziehen mit']
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
