/* ============================================================
   G04Fit — einfache, lokale Sprachumschaltung
   Englisch ist die Standardsprache für neue Installationen.
   ============================================================ */
(function (G) {
  'use strict';

  var STORAGE_KEY = 'gofit.locale';
  var EN = {
    'Willkommen bei G04Fit': 'Welcome to G04Fit',
    'Dein Trainingsplaner für Brust, Rücken, Bauch, Bizeps, Trizeps und Schulter — mit Wochenplan, Journey und einem Coach, der mit deinen echten Zahlen arbeitet.': 'Your training planner for chest, back, abs, biceps, triceps and shoulders — with a weekly plan, journey and a coach that works with your real numbers.',
    'Level, Regionen und Modi von Easy bis Beast.': 'Levels, regions and modes from Easy to Beast.',
    'Vorschläge zu Gewicht, Wiederholungen und Progression.': 'Suggestions for weight, reps and progression.',
    'Ausführung, Muskelkarte und Technikhinweise.': 'Form tips, muscle maps and technique guidance.',
    'Nichts wird gespeichert ohne deine Zustimmung.': 'Nothing is saved without your consent.',
    'Los geht’s': 'Get started',
    'Zuerst: dein Datenschutz': 'First: your privacy',
    'G04Fit speichert nichts ohne deine ausdrückliche Zustimmung. Alles bleibt auf diesem Gerät — kein Konto und kein Tracking. Nur aktivierte Benachrichtigungen benötigen die technische Push-Anmeldung. Jede Einwilligung ist einzeln und jederzeit widerrufbar.': 'G04Fit saves nothing without your explicit consent. Everything stays on this device — no account and no tracking. Only enabled notifications require technical push registration. Each consent can be revoked at any time.',
    'Profil & Einstellungen speichern': 'Save profile & settings',
    'Ohne diese Zustimmung ist nach dem Schließen alles weg.': 'Without this consent, everything is gone when you close the app.',
    'Trainingshistorie & Rekorde': 'Workout history & records',
    'Grundlage für Fortschritt, Bestleistungen und Verlaufskurven.': 'Used for progress, personal bests and history charts.',
    'Auswertung durch den G04Fit Coach': 'Analysis by the G04Fit Coach',
    'Rechnet ausschließlich auf diesem Gerät. Keine Übertragung an Dienste.': 'Calculated only on this device. Nothing is sent to external services.',
    'Erinnerungen': 'Reminders',
    'Hinweise an deinen Trainingstagen und nach längeren Pausen.': 'Prompts on training days and after longer breaks.',
    'Obsidian-Export': 'Obsidian export',
    'Markdown-Notizen für deinen Vault. Kann später aktiviert werden.': 'Markdown notes for your vault. Can be enabled later.',
    'empfohlen': 'recommended',
    'Du kannst G04Fit auch ganz ohne Einwilligung ausprobieren. Dann funktioniert alles, aber nichts bleibt nach dem Schließen erhalten.': 'You can try G04Fit without giving consent. Everything works, but nothing is kept after closing the app.',
    'Datenschutzerklärung lesen': 'Read privacy policy',
    'Weiter': 'Next', 'Zurück': 'Back',
    'Ein paar Angaben': 'A few details',
    'Alles freiwillig. Größe und Gewicht helfen G04Fit nur dabei, sinnvolle Richtwerte für Startgewichte vorzuschlagen.': 'Everything is optional. Height and weight only help G04Fit suggest sensible starting weights.',
    'Wie sollen wir dich nennen?': 'What should we call you?',
    'Name oder Spitzname': 'Name or nickname',
    'Bild antippen, um es zu ändern.': 'Tap the picture to change it.',
    'Bild antippen, um ein eigenes Foto als Trainings-Avatar zu wählen — freiwillig.': 'Tap the picture to choose a training avatar — optional.',
    'Alter': 'Age', 'Größe': 'Height', 'Gewicht': 'Weight',
    'Wie weit bist du?': 'How experienced are you?',
    'Wichtig: Wenn du bereits stark bist, startet G04Fit dich nicht künstlich leicht. Deine Stufe steuert die Richtwerte und die Übungsauswahl.': 'Important: if you are already strong, G04Fit will not start you artificially light. Your level controls recommendations and exercise selection.',
    'Einsteiger': 'Beginner', 'Weniger als ein Jahr regelmäßiges Training.': 'Less than one year of regular training.',
    'Fortgeschritten': 'Intermediate', 'Ein bis drei Jahre, die Grundübungen sitzen.': 'One to three years; the basic lifts are familiar.',
    'Erfahren': 'Advanced', 'Mehrjährige Erfahrung, hohe Lasten gewohnt.': 'Several years of experience and comfortable with heavy loads.',
    'Schwierigkeitsmodus': 'Difficulty mode', 'Sätze': 'sets', 'Pause': 'rest', 'Einheiten pro Woche.': 'workouts per week.',
    'Dein Wochenplan': 'Your weekly plan',
    'Wähle deine Trainingstage. G04Fit setzt daraus den passenden Split zusammen.': 'Choose your training days. G04Fit builds the right split from them.',
    'Trainingstage': 'Training days', 'Ergebnis': 'Result', 'Üb.': 'ex.',
    'Ziele': 'Goals', 'Muskelaufbau': 'Muscle gain', 'Maximalkraft': 'Maximum strength',
    'Definition': 'Definition', 'Gesundheit & Haltung': 'Health & posture', 'Erinnerung um': 'Reminder at',
    'Alles bereit': 'All set', 'Dein Plan steht. Level 1 in': 'Your plan is ready. Level 1 in', ' — los geht die Journey.': ' — your journey begins.',
    'Einheiten/Woche': 'Workouts/week', 'Modus': 'Mode', 'Einwilligungen': 'Consents', 'Erste Einheit': 'First workout',
    ' Übungen': ' exercises',
    'Deine Startgewichte kannst du jederzeit im Profil eintragen. Der Coach passt die Progression dann an deine echten Zahlen an.': 'You can add your starting weights in your profile at any time. The coach will then adapt progression to your real numbers.',
    'G04Fit starten': 'Start G04Fit',
    'Dashboard': 'Dashboard', 'Übungen': 'Exercises', 'Fortschritt': 'Progress', 'Profil': 'Profile', 'Datenschutz': 'Privacy',
    'Journey': 'Journey', 'Coach': 'Coach', 'App-Einstellungen': 'App settings',
    'Heller Modus': 'Light mode', 'Wechselt zwischen dem dunklen und hellen G04Fit-Design.': 'Switch between the dark and light G04Fit design.',
    'Pausentimer': 'Rest timer', 'Nach jedem abgehakten Satz startet automatisch eine Pause.': 'A rest starts automatically after each completed set.',
    'Pausendauer': 'Rest duration', 'Wiedereinstiegsmodus': 'Return mode', 'Nach längeren Pausen reduziert G04Fit Gewicht und Volumen automatisch.': 'After a longer break, G04Fit automatically reduces weight and volume.',
    'Animationen reduzieren': 'Reduce animations', 'Schaltet Bewegungseffekte weitgehend ab.': 'Reduce most motion effects.',
    'Trainingsmotivation aufs iPhone': 'Workout motivation on iPhone', 'Sendet an deinen Trainingstagen wechselnde motivierende Push-Nachrichten.': 'Sends changing motivational push notifications on your training days.',
    'Benachrichtigungen stumm': 'Mute notifications', 'Erinnerungen ohne Ton zustellen.': 'Deliver reminders without sound.',
    'Alarmton für Satzpausen': 'Set rest alarm sound', 'Anhören': 'Preview', 'Der Ton wird abgespielt, wenn eine Satzpause endet.': 'The sound plays when a set rest ends.',
    'Sprache / Language': 'Language / Sprache', 'Sprache': 'Language', 'Deutsch': 'German', 'Englisch': 'English',
    'Einstellungen gespeichert': 'Settings saved', 'Erinnerungen sind aktiv': 'Reminders are active', 'Erinnerungen sind aus': 'Reminders are off',
    'Zeitpunkt': 'Time', 'Uhrzeit der Erinnerung': 'Reminder time', 'Nächste Termine': 'Upcoming dates', 'Keine Termine': 'No dates',
    'heute': 'today', 'gestern': 'yesterday', 'vorgestern': 'the day before yesterday', 'Trotzdem trainieren': 'Train anyway', 'Ruhetag': 'Rest day',
    'Training starten': 'Start workout', 'Weiter trainieren': 'Continue workout', 'Einheit läuft': 'Workout in progress', 'Heute erledigt': 'Completed today',
    'Diese Woche': 'This week', 'Einheiten gesamt': 'Total workouts', 'Serie': 'Streak', 'Volumen 7 Tage': '7-day volume', 'Rekorde': 'Records',
    'Fortschritt ansehen': 'View progress', 'Plan ansehen': 'View plan', 'Zusatzeinheit': 'Extra workout', 'Gespeicherte Daten': 'Stored data',
    'Daten mitnehmen': 'Take your data with you', 'Als Datei exportieren': 'Export as file', 'Sicherung einlesen': 'Import backup', 'Daten löschen': 'Delete data',
    'Persönliche Angaben': 'Personal details', 'Keine Einwilligung': 'No consent', 'Woche': 'week', 'Wochen': 'weeks', 'Tag': 'day', 'Tage': 'days', 'Monat': 'month', 'Monate': 'months',
    'Späte Runde': 'Late round', 'Pause zwischen Sätzen': 'Rest between sets', 'Gilt für die nächste gestartete Einheit': 'Applies to the next workout',
    'Weltkarte öffnen': 'Open world map', 'Einwilligung prüfen': 'Check consent', 'Alle Empfehlungen': 'All recommendations', 'Nächste Erinnerung': 'Next reminder',
    'Kein offener Termin in den nächsten Tagen.': 'No upcoming date in the next few days.', 'Als Nächstes:': 'Next:', 'Nächste Einheit:': 'Next workout:',
    'Ausführung ansehen': 'View form', 'Häufige Fehler': 'Common mistakes', 'Zur Einheit hinzufügen': 'Add to workout', 'Hinzugefügt': 'Added',
    'Teil der laufenden Einheit.': 'is part of the current workout.', 'Übung suchen': 'Search exercises', 'Alle Geräte': 'All equipment',
    'Tippen für Ausführung, Muskelkarte und Technik': 'Tap for form, muscle map and technique', 'Ändere Suchbegriff oder Filter.': 'Change the search term or filter.',
    'Vorgesehene Übungen': 'Planned exercises', 'Vorschläge des Coach': 'Coach suggestions', 'Übungen wählen': 'Choose exercises', 'Übernehmen': 'Apply',
    'Keine Auswahl': 'No selection', 'Wähle mindestens eine Übung.': 'Choose at least one exercise.', 'Abschließen': 'Finish', 'Übung ergänzen': 'Add exercise',
    'Überspringen': 'Skip', 'Pause vorbei — antippen für den nächsten Satz': 'Rest over — tap for the next set', 'Heute im Plan': 'Today\'s plan',
    'Nächste geplante Einheit': 'Next planned workout', 'Wähle die Übungen selbst aus.': 'Choose the exercises yourself.', 'Trainingstage ändern': 'Change training days',
    'Beispiel für eine Empfehlung': 'Example recommendation', 'Empfehlungen je Übung': 'Recommendations by exercise', 'Aufbau über': 'Build-up over',
    'Absolviere eine Einheit, danach entstehen konkrete Vorschläge.': 'Complete a workout to get concrete suggestions.', 'Überblick': 'Overview',
    'Sätze gesamt': 'Total sets', 'Volumen = Summe aus Gewicht × Wiederholungen aller abgehakten Sätze.': 'Volume = the sum of weight × reps for all completed sets.',
    'Beste Haltezeit': 'Best hold time', 'Geschätztes 1RM': 'Estimated 1RM', 'Veränderung': 'Change', 'Abgeschlossene Trainings erscheinen hier mit allen Sätzen.': 'Completed workouts appear here with all sets.',
    'Einheit löschen': 'Delete workout', 'Die Einheit wurde entfernt.': 'The workout was removed.', 'Aufzeichnung aktiv': 'Tracking active',
    'G04Fit Coach': 'G04Fit Coach', 'Beispiel für eine Empfehlung': 'Example recommendation', 'Coach aktiv': 'Coach active',
    'Datenschutz öffnen': 'Open privacy', 'Datenschutzerklärung': 'Privacy policy', 'Entwurf': 'Draft', 'Vollständig lesen': 'Read in full',
    'Als Markdown speichern': 'Save as Markdown', 'Copyright & Lizenzen': 'Copyright & Licenses', 'Copyright & Lizenzen lesen': 'Read copyright & licenses',
    'Urheberrecht': 'Copyright', 'Alle Rechte vorbehalten': 'All rights reserved', 'Eigene Inhalte': 'Original content',
    'Drittanbieter': 'Third-party software', 'Veröffentlichung': 'Release', 'Übersicht': 'Overview', 'Kopiert': 'Copied',
    'Urheberrecht, eigene Inhalte und Hinweise zu verwendeten Drittanbieter-Paketen.': 'Copyright, original content and notices for third-party packages.',
    'Öffentliche Datenschutzerklärung': 'Public privacy policy', 'Öffentliche Copyright-Hinweise': 'Public copyright notices',
    'Füge die Notiz in Obsidian ein.': 'Paste the note into Obsidian.', 'Nicht möglich': 'Not possible', 'Der Download wurde vom Browser blockiert.': 'The browser blocked the download.'
  };

  var WORDS = {
    'Montag': 'Monday', 'Dienstag': 'Tuesday', 'Mittwoch': 'Wednesday', 'Donnerstag': 'Thursday', 'Freitag': 'Friday', 'Samstag': 'Saturday', 'Sonntag': 'Sunday',
    'Mo': 'Mon', 'Di': 'Tue', 'Mi': 'Wed', 'Do': 'Thu', 'Fr': 'Fri', 'Sa': 'Sat', 'So': 'Sun',
    'Brust': 'Chest', 'Rücken': 'Back', 'Bauch': 'Abs', 'Schulter': 'Shoulders', 'Bizeps': 'Biceps', 'Trizeps': 'Triceps',
    'Kraft': 'Strength', 'Muskel': 'Muscle', 'Training': 'Workout', 'Übung': 'Exercise', 'Wiederholungen': 'reps', 'Wiederholung': 'rep',
    'Gewichte': 'weights', 'Startgewicht': 'starting weight', 'Körpergewicht': 'body weight', 'Eigengewicht': 'body weight',
    'Speichern': 'Save', 'Abbrechen': 'Cancel', 'Bestätigen': 'Confirm', 'Löschen': 'Delete', 'Bearbeiten': 'Edit', 'Schließen': 'Close',
    'Aktiv': 'Active', 'Inaktiv': 'Inactive', 'Heute': 'Today', 'Morgen': 'Tomorrow', 'geplant': 'planned', 'erledigt': 'done',
    'Normal': 'Normal', 'Leicht': 'Easy', 'Schwer': 'Hard', 'Pro': 'Pro', 'Beast': 'Beast', 'Level': 'Level',
    'Minute': 'minute', 'Minuten': 'minutes', 'Sekunden': 'seconds', 'Sek.': 'sec.', 'Kalorien': 'calories', 'Name': 'Name', 'Jahre': 'years', 'Jahr': 'year',
    'läuft': 'running', 'offen': 'open', 'offene': 'open', 'nächsten': 'next', 'nächste': 'next', 'letzten': 'last', 'Gilt': 'Applies',
    'für': 'for', 'mehr': 'more', 'weniger': 'less', 'anzeigen': 'view', 'suchen': 'search', 'Vorschläge': 'suggestions', 'wählen': 'choose',
    'gewählt': 'selected', 'Sicherung': 'backup', 'Daten': 'data', 'Datei': 'file', 'bereit': 'ready', 'Keine': 'No', 'Alle': 'All', 'alle': 'all'
  };

  var DATE_EN = { days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  var DATE_DE = { days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], daysLong: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'] };

  function locale() {
    var p = G.store && G.store.state && G.store.state.profile, value = p && p.locale;
    if (value !== 'en' && value !== 'de') { try { value = localStorage.getItem(STORAGE_KEY); } catch (e) {} }
    return value === 'de' ? 'de' : 'en';
  }

  function translateText(text) {
    if (locale() !== 'en' || !text || !text.trim()) return text;
    var lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], core = text.slice(lead.length, text.length - tail.length);
    if (EN[core]) return lead + EN[core] + tail;
    var out = core;
    Object.keys(EN).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) { if (out.indexOf(key) >= 0) out = out.split(key).join(EN[key]); });
    Object.keys(WORDS).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) {
      var escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp('(^|[^A-Za-zÄÖÜäöüß])' + escaped + '(?=$|[^A-Za-zÄÖÜäöüß])', 'g'), '$1' + WORDS[key]);
    });
    return lead + out + tail;
  }

  function setDateNames() {
    if (!G.u) return;
    var names = locale() === 'en' ? DATE_EN : DATE_DE;
    G.u.DAYS.splice.apply(G.u.DAYS, [0, G.u.DAYS.length].concat(names.days));
    G.u.DAYS_LONG.splice.apply(G.u.DAYS_LONG, [0, G.u.DAYS_LONG.length].concat(names.daysLong));
    G.u.MONTHS.splice.apply(G.u.MONTHS, [0, G.u.MONTHS.length].concat(names.months));
  }

  function apply(root) {
    setDateNames();
    if (document && document.documentElement) document.documentElement.lang = locale();
    if (!root || locale() !== 'en') return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      var p = node.parentNode;
      return !p || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(p.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }}), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) { node.nodeValue = translateText(node.nodeValue); });
    if (root.querySelectorAll) root.querySelectorAll('input[placeholder], [title], [aria-label]').forEach(function (el) {
      ['placeholder', 'title', 'aria-label'].forEach(function (attr) { if (el.hasAttribute(attr)) el.setAttribute(attr, translateText(el.getAttribute(attr))); });
    });
  }

  function setLocale(next) {
    next = next === 'de' ? 'de' : 'en';
    if (G.store && G.store.state && G.store.state.profile) {
      G.store.state.profile.locale = next;
      if (G.store.commit) G.store.commit('language');
    }
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    // Falls Hintergrund-Push aktiv ist, soll auch der Worker sofort die neue
    // Sprache verwenden (Fehler bleiben für die lokale Umschaltung folgenlos).
    if (G.reminders && G.reminders.allowed && G.reminders.allowed() && G.reminders.syncPushSchedule) {
      G.reminders.syncPushSchedule().catch(function () {});
    }
    if (G.app && G.store && G.store.state && G.store.state.onboarded) G.app.rerender();
    else if (G.onboarding && G.onboarding.render) G.onboarding.render();
    else apply(document.body);
  }

  G.i18n = { locale: locale, setLocale: setLocale, translate: translateText, apply: apply };
})(G04Fit);
