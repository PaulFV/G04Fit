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
    'Vorgesehene Übungen': 'Planned exercises', 'Vorschläge des Coaches': 'Coach suggestions', 'Übungen wählen': 'Choose exercises', 'Übernehmen': 'Apply',
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
    'Füge die Notiz in Obsidian ein.': 'Paste the note into Obsidian.', 'Nicht möglich': 'Not possible', 'Der Download wurde vom Browser blockiert.': 'The browser blocked the download.',

    /* App chrome, dashboard and common dynamic phrases */
    'Guten Morgen': 'Good morning', 'Mahlzeit': 'Good afternoon', 'Guten Tag': 'Good day',
    'Guten Abend': 'Good evening', 'Noch wach': 'Still awake', 'Frei': 'Free', 'Tonnen': 'tons',
    'Menü schließen': 'Close menu', 'Menü öffnen': 'Open menu', 'Dunklen Modus aktivieren': 'Enable dark mode',
    'Hellen Modus aktivieren': 'Enable light mode', 'Trainingsserie:': 'Workout streak:',
    ' in Folge': ' in a row', 'Noch keine Serie – trainiere diese Woche, um zu starten.': 'No streak yet — train this week to get started.',
    'Einheit läuft': 'Workout in progress', ' von ': ' of ', ' erledigt': ' completed', 'Heute erledigt': 'Completed today',
    'Erholung ist Teil des Trainings.': 'Recovery is part of training.', 'Sätze 7 Tage': 'Sets in 7 days',
    'Rekorde 30 Tage': 'Records in 30 days', 'Benachrichtigungen sind aktiv.': 'Notifications are active.',
    'Benachrichtigungen sind ausgeschaltet.': 'Notifications are off.', 'Erinnerungen verwalten': 'Manage reminders',
    'Noch keine Bestleistungen erfasst. Nach der ersten abgeschlossenen Einheit erscheinen sie hier.': 'No personal bests yet. They will appear here after your first completed workout.',
    'Neueste Rekorde': 'Latest records', 'Trotzdem trainieren': 'Train anyway', 'Journey ansehen': 'View journey',

    /* Reminders */
    'Für Benachrichtigungen auf dem iPhone': 'For notifications on iPhone',
    'Öffne in Safari „Teilen“ und wähle „Zum Home-Bildschirm“. Starte G04Fit danach über das App-Symbol und erlaube die Benachrichtigungen.': 'In Safari, open “Share” and choose “Add to Home Screen”. Then start G04Fit from the app icon and allow notifications.',
    'Dieser Browser unterstützt keine Systembenachrichtigungen. G04Fit zeigt Erinnerungen stattdessen als Hinweis in der App an, solange sie geöffnet ist.': 'This browser does not support system notifications. G04Fit will show reminders inside the app while it is open instead.',
    'Systembenachrichtigungen sind erlaubt. G04Fit synchronisiert deine Trainingstage mit dem Push-Dienst und kann dich dadurch auch bei vollständig geschlossener App erinnern.': 'System notifications are allowed. G04Fit syncs your training days with the push service and can remind you even when the app is fully closed.',
    'Benachrichtigungen wurden im Browser blockiert. Du kannst das in den Website-Einstellungen wieder freigeben. Bis dahin erscheinen Erinnerungen nur innerhalb der App.': 'Notifications were blocked by the browser. You can allow them again in the website settings. Until then, reminders only appear inside the app.',
    'Systembenachrichtigungen erlauben': 'Allow system notifications',
    'Lege im Profil Trainingstage fest, dann erscheinen hier die nächsten Einheiten.': 'Set training days in your profile to see upcoming workouts here.',
    'Keine offenen Termine': 'No upcoming dates', 'Gilt für alle Trainingstage. Der Motivationstext wechselt automatisch.': 'Applies to all training days. The motivational message changes automatically.',
    'Sobald du die erste Einheit abgeschlossen hast, überwacht G04Fit deine Pausen.': 'Once you complete your first workout, G04Fit monitors your breaks.',
    'Der Wiedereinstiegsmodus greift, sobald der Coach die Auswertung übernehmen darf.': 'Return mode activates once the Coach is allowed to analyse your data.',
    'Deine Pausen sind im normalen Bereich. Es ist keine Anpassung nötig.': 'Your breaks are in the normal range. No adjustment is needed.',
    'G04Fit meldet Uhrzeit und Trainingstage verschlüsselt beim Push-Dienst an. Auf dem iPhone muss G04Fit dafür als Home-Bildschirm-App installiert und von dort geöffnet sein. Ohne Push-Unterstützung bleibt die lokale Erinnerung innerhalb der geöffneten App aktiv.': 'G04Fit sends the time and training days to the push service in encrypted form. On iPhone, G04Fit must be installed as a Home Screen app and opened from there. Without push support, local reminders remain active while the app is open.',
    'Lokale Erinnerung aktiv': 'Local reminder active', 'Hintergrund-Push ist noch nicht verfügbar.': 'Background push is not available yet.',
    'Hintergrund-Push ist nicht verfügbar.': 'Background push is not available.',

    /* Coach */
    'Damit G04Fit Vorschläge zu Gewicht und Progression machen kann, muss er deine Trainingsdaten auswerten dürfen. Dafür brauchst du die Einwilligung KI-Analyse.': 'To suggest weights and progression, G04Fit needs permission to analyse your workout data. This requires the AI analysis consent.',
    'G04Fit rechnet ausschließlich auf diesem Gerät. Es werden keine Daten an einen Server oder an einen KI-Dienst gesendet. Ausgewertet werden letzte Leistungen, Wiederholungsbereiche, Pausenlängen und der Abstand zwischen Einheiten.': 'G04Fit calculates exclusively on this device. No data is sent to a server or AI service. It analyses recent performance, rep ranges, rest periods and the time between workouts.',
    'Du hast <b>80 kg × 12</b> sauber geschafft. Erhöhe auf <b>82,5 kg</b> und bleib bei 8–12 Wiederholungen.': 'You completed <b>80 kg × 12</b> with good form. Increase to <b>82.5 kg</b> and stay in the 8–12 rep range.',
    'So sehen die Vorschläge aus, sobald die Auswertung aktiv ist.': 'This is what suggestions look like once analysis is enabled.',
    'bereit für mehr Gewicht': 'ready for more weight', 'Übung bereit für mehr Gewicht': 'exercise ready for more weight',
    'Übungen bereit für mehr Gewicht': 'exercises ready for more weight', 'Alle Berechnungen laufen lokal auf diesem Gerät.': 'All calculations run locally on this device.',
    'Empfehlungen je Übung': 'Recommendations by exercise', 'Absolviere eine Einheit, danach entstehen konkrete Vorschläge.': 'Complete a workout to get concrete suggestions.',
    'Sie sind ausdrücklich keine medizinischen Werte.': 'They are explicitly not medical values.',
    'Erreichst du in allen Sätzen die obere Grenze des Wiederholungsbereichs, wird das Gewicht um den kleinsten sinnvollen Schritt erhöht und der Bereich beginnt wieder unten. Bleibst du darunter oder markierst die Sätze als schwer, hält der Coach das Gewicht oder reduziert es. Nach längeren Pausen greift zusätzlich der Wiedereinstiegsmodus.': 'When you reach the upper rep limit in every set, the weight increases by the smallest sensible step and the range starts at the bottom again. If you fall short or mark sets as hard, the Coach keeps or reduces the weight. Return mode also applies after longer breaks.',
    'Die Auswertung läuft ab sofort – nur auf diesem Gerät.': 'Analysis is now active — on this device only.',

    /* Exercise library */
    'Für konkrete Vorschläge benötigt der Coach die Einwilligung <b>KI-Analyse</b>.': 'The Coach needs <b>AI analysis</b> consent for specific suggestions.',
    'Wiederholungen, ': 'reps, ', 'Sätze.': 'sets.', 'G04Fit startet dich dann nicht künstlich leicht.': 'G04Fit will not start you artificially light.',
    'Noch keine Daten zu dieser Übung. Nach der ersten Einheit erscheinen hier Rekord und Verlauf.': 'No data for this exercise yet. Records and history will appear after your first workout.',
    'Ändere Suchbegriff oder Filter.': 'Change the search term or filter.',
    'Tippen für Ausführung, Muskelkarte und Technik': 'Tap for form, muscle map and technique',

    /* Workout */
    'Wichtig: Wenn du bereits stark bist, startet G04Fit dich nicht künstlich leicht. Deine Stufe steuert die Richtwerte und die Übungsauswahl.': 'Important: if you are already strong, G04Fit will not start you artificially light. Your level controls recommendations and exercise selection.',
    'Vorgesehene Übungen': 'Planned exercises', 'Vorschläge des Coaches': 'Coach suggestions', 'Übung ansehen': 'View exercise',
    'Plan und Übungsauswahl': 'Plan and exercise selection', 'Keine Auswahl': 'No selection', 'Wähle mindestens eine Übung.': 'Choose at least one exercise.',
    '0 gewählt': '0 selected', 'gewählt': 'selected', 'Die laufende Einheit wird verworfen. Bereits abgehakte Sätze gehen verloren.': 'The current workout will be discarded. Completed sets will be lost.',
    'Der Coach erhöht beim nächsten Mal stärker.': 'The Coach will increase more next time.', 'Der Coach geht beim nächsten Mal vorsichtiger vor.': 'The Coach will be more cautious next time.',
    'Keine Sätze erledigt': 'No sets completed', 'Hake mindestens einen Satz ab.': 'Complete at least one set.',
    'Einheit abschließen': 'Finish workout', 'Es sind noch <b>': 'There are still <b>', ' Sätze offen. Nicht abgehakte Sätze werden nicht gewertet.': ' sets open. Uncompleted sets do not count.',
    'Trotzdem abschließen': 'Finish anyway', 'Als Markdown für Obsidian': 'As Markdown for Obsidian',

    /* Progress and Obsidian */
    'Volumen je Woche': 'Volume per week', 'Wiederholungen gesamt': 'Total reps', 'Kraftentwicklung': 'Strength development',
    'Historie': 'History', 'Leistungsprofil': 'Performance profile', 'Noch keine Trainingsdaten.': 'No workout data yet.',
    'Noch keine Daten.': 'No data yet.', 'Fortschritt wird nicht aufgezeichnet': 'Progress is not being recorded',
    'Trainingshistorie erlauben': 'Allow workout history', 'Sekundär beanspruchte Gruppen fließen anteilig ein.': 'Secondary muscle groups count proportionally.',
    'Es sind ausdrücklich keine medizinischen Werte</b> und keine Diagnose.': 'They are explicitly not medical values</b> and are not a diagnosis.',
    'Absolviere dieselbe Übung in mindestens zwei Einheiten, dann entsteht hier eine Kurve.': 'Complete the same exercise in at least two workouts to create a trend here.',
    'Sobald du eine Übung abschließt, merkt sich G04Fit deine beste Leistung.': 'Once you complete an exercise, G04Fit remembers your best performance.',
    'Abgeschlossene Trainings erscheinen hier mit allen Sätzen.': 'Completed workouts appear here with all sets.', 'Diese Einheit löschen': 'Delete this workout',
    'Die Einheit wurde entfernt.': 'The workout was removed.', 'Ab jetzt merkt sich G04Fit deine Einheiten – nur auf diesem Gerät.': 'G04Fit will now remember your workouts — on this device only.',
    'für deinen Vault erzeugen. Das passiert nur, wenn du dem ausdrücklich zustimmst.': 'for your vault. This only happens when you explicitly consent.',
    'Eine Übersichtsnotiz mit Level, Rekorden und den letzten Einheiten': 'An overview note with level, records and recent workouts',
    'Auf Wunsch die Empfehlungen des Coach für die nächste Einheit': 'Optionally, the Coach recommendations for the next workout',
    'Markdown für deinen Vault': 'Markdown for your vault', 'Empfehlungen und Beobachtungen erscheinen in der Notiz. Benötigt die Einwilligung KI-Analyse.': 'Recommendations and observations appear in the note. AI analysis consent is required.',
    'Ein direkter Schreibzugriff auf deinen Vault ist aus dem Browser heraus nicht möglich – und wäre ohne ausdrückliche Freigabe auch nicht wünschenswert. Für eine automatische Synchronisation braucht es später ein Obsidian-Plugin oder einen lokalen Dienst.': 'Direct write access to your vault is not possible from the browser — and would not be desirable without explicit permission. Automatic synchronisation will require an Obsidian plugin or local service later.',
    'Die Einwilligung für den Obsidian-Export wird widerrufen. Bereits exportierte Dateien in deinem Vault bleiben unberührt.': 'Obsidian export consent will be revoked. Files already exported to your vault remain untouched.',
    'Die Sicherung wurde übernommen.': 'The backup was imported.', 'Lokal gelöscht. Die Abmeldung beim Push-Dienst konnte nicht bestätigt werden.': 'Deleted locally. Unregistering from the push service could not be confirmed.', 'Alle Einwilligungen zurückgesetzt': 'All consents reset',
    'Profil-Speicherung ergänzt': 'Profile storage enabled', 'Die Historie braucht ein gespeichertes Profil.': 'History needs a saved profile.',
    'Exportiert': 'Exported', 'Eingelesen': 'Imported', 'Zurückgesetzt': 'Reset', 'Alle Daten wurden gelöscht.': 'All data was deleted.',
    'Kein lokaler Speicher': 'No local storage', 'Der Browser blockiert Website-Daten. G04Fit vergisst alles beim Schließen.': 'The browser blocks website data. G04Fit forgets everything when closed.',
    'Einheit fortsetzen': 'Continue workout', 'ist noch offen.': 'is still open.', 'Nächste:': 'Next:', 'Wiedereinstieg': 'Return mode',
    'Freies Training': 'Free workout', 'Keine Termine': 'No dates', 'Weitere Übung': 'More exercise', 'Alle zurücksetzen': 'Reset all',
    'eigener Wert': 'custom value', 'Richtwert': 'suggested value', 'gesetzt': 'set', 'Anderes Bild': 'Change picture',
    'Bild hochladen': 'Upload picture', 'Entfernen': 'Remove', 'eigenes Bild': 'custom picture', 'kein Bild': 'no picture',
    'Eintrag löschen': 'Delete entry', 'Eintragen': 'Add entry', 'Gewichtsverlauf': 'Weight history', 'Eintrag': 'entry', 'Einträge': 'entries',
    'Veränderung letzte 4 Wochen:': 'Change over the last 4 weeks:',
    'Trage dein Gewicht an mindestens zwei Tagen ein, dann zeigt G04Fit hier einen Verlauf statt nur des aktuellen Werts.': 'Enter your weight on at least two days and G04Fit will show a trend here instead of only the current value.',
    'Gespeichert wird der Verlauf mit derselben Einwilligung wie das übrige Profil. Das aktuelle Gewicht oben übernimmt automatisch den jeweils neuesten Eintrag.': 'Weight history is stored under the same consent as the rest of your profile. The current weight above automatically uses the latest entry.',
    'Trage ein, womit du tatsächlich arbeitest. G04Fit übernimmt diese Werte statt eines pauschalen Einsteigergewichts – der Coach baut die Progression darauf auf.': 'Enter the weights you actually use. G04Fit uses these instead of generic beginner weights — the Coach builds progression from them.',
    'Trainings-Avatar': 'Workout avatar', 'Dein Bild begleitet dich durch Dashboard, Profil und die Abschluss-Übersicht nach jeder Einheit. Ein Antippen des Avatars ändert es jederzeit.': 'Your picture follows you through the dashboard, profile and completion screen after every workout. Tap the avatar to change it anytime.',
    'Lade ein eigenes Bild hoch — es erscheint dann im Dashboard, im Profil und nach jeder abgeschlossenen Einheit. Ohne eigenes Bild zeigt G04Fit eine Platzhalter-Figur.': 'Upload your own picture — it will appear on the dashboard, profile and after every completed workout. Without a picture, G04Fit shows a placeholder figure.',

    'Ohne Einwilligung wird nichts gespeichert – du kannst das im Datenschutz ändern.':
      'Nothing is saved without consent — you can change that under Privacy.',
    'Dein Profil wird auf diesem Gerät gespeichert.': 'Your profile is stored on this device.',

    /* Übungsdetails: Hinweise, wenn eine Einwilligung fehlt. Die Texte stehen
       um <b>-Auszeichnungen herum und werden deshalb stückweise übersetzt. */
    '. Ohne sie zeigt G04Fit nur den allgemeinen Bereich: ': '. Without it, G04Fit only shows the general range: ',
    'Ohne die Einwilligung': 'Without the consent',
    'Trainingshistorie': 'Workout history',
    'speichert G04Fit keine vergangenen Sätze – deshalb gibt es hier keinen Verlauf.':
      'G04Fit does not store past sets — so there is no history here.',

    /* Regionsbeschreibungen der Weltkarte. Die Kacheln brechen nach dem ersten
       Satz um, deshalb steht jeder Satz auch einzeln in der Tabelle. */
    'Hier lernst du die Bewegungen sauber auszuführen.': 'Learn to perform the movements with good form.',
    'Gewichte sind zweitrangig.': 'Weight comes second.',
    'Die Grundübungen sitzen.': 'The basic lifts are solid.',
    'Jetzt wird planmäßig Gewicht aufgebaut.': 'Now build weight systematically.',
    'Längere Einheiten, mehr Sätze.': 'Longer workouts, more sets.',
    'Deine Kraftbasis wird breiter.': 'Your strength base is growing.',
    'Kurze Pausen, hohe Lasten.': 'Short rests, heavy loads.',
    'Erholung wird zum entscheidenden Faktor.': 'Recovery becomes the deciding factor.',
    'Fortschritt in kleinen Schritten.': 'Progress in small steps.',
    'Wer dranbleibt, gewinnt.': 'Consistency wins.',
    'Individuelle Feinsteuerung.': 'Fine-tuned individually.',
    'Der Coach arbeitet mit deinen echten Daten.': 'The Coach works with your real data.',
    'Beliebiges Bildformat. G04Fit verkleinert es automatisch auf 512 Pixel und schneidet für den runden Avatar mittig zu.': 'Any image format works. G04Fit automatically scales it to 512 pixels and crops the round avatar from the centre.',
    'Nur für die Begrüßung. Ein Fantasiename genügt.': 'Only used for greetings. A nickname is enough.', 'Fließt in die Vorsicht bei der Progression ein.': 'Used to make progression more cautious.',
    'Basis für Richtwerte bei Startgewichten. Wird beim Speichern zusätzlich in den Verlauf unten übernommen.': 'Basis for suggested starting weights. When saved, it is also added to the history below.',
    'Die Stufe beeinflusst die Richtwerte für Startgewichte und welche Übungen vorgeschlagen werden.': 'Your level affects suggested starting weights and which exercises are recommended.',
    'Ausgewählte Gruppen bekommen im Plan eine Übung mehr.': 'Selected muscle groups get one extra exercise in the plan.',
    'Vorschlag beim Start einer neuen Einheit (Freies Training oder Plan) — dort weiterhin änderbar.': 'Suggested when starting a new workout (free workout or plan) — still changeable there.',
    'Kein Gewicht angegeben': 'No weight entered', 'Trage einen Wert in Kilogramm ein.': 'Enter a value in kilograms.', 'Datum in der Zukunft': 'Date is in the future',
    'Wähle den heutigen oder einen vergangenen Tag.': 'Choose today or a past day.', 'Eingetragen': 'Added', 'Der Eintrag wurde entfernt.': 'The entry was removed.',
    'Startgewichte zurücksetzen': 'Reset starting weights', 'Alle eigenen Startgewichte werden entfernt. G04Fit verwendet dann wieder Richtwerte.': 'All custom starting weights will be removed. G04Fit will use suggested values again.',
    'Bild übernommen': 'Picture applied', 'Dein Avatar bleibt auf diesem Gerät gespeichert.': 'Your avatar stays stored on this device.',
    'Ohne die Einwilligung „Profil speichern“ ist er nach dem Schließen weg.': 'Without “Save profile” consent, it is removed when the app closes.',
    'Nicht erlaubt': 'Not allowed', 'Aktiviere zuerst die Einwilligung für Benachrichtigungen.': 'First enable notification consent.', 'iPhone-Push ist noch nicht verfügbar.': 'iPhone push is not available yet.',
    'Aktuelle Region': 'Current region', 'Weltkarte': 'World map', 'Schwierigkeit': 'Difficulty', 'hier': 'here', 'frei': 'unlocked', 'gesperrt': 'locked',
    'Grundlagen & Technik': 'Fundamentals & technique', 'Erste Kraftzuwächse': 'First strength gains', 'Volumen & Ausdauer': 'Volume & endurance',
    'Intensität': 'Intensity', 'Konstanz auf hohem Niveau': 'Consistency at a high level', 'Spitzenbereich': 'Elite range',
    'Hier lernst du die Bewegungen sauber auszuführen. Gewichte sind zweitrangig.': 'Learn to perform the movements with good form. Weight comes second.',
    'Die Grundübungen sitzen. Jetzt wird planmäßig Gewicht aufgebaut.': 'The basic lifts are solid. Now build weight systematically.',
    'Längere Einheiten, mehr Sätze. Deine Kraftbasis wird breiter.': 'Longer workouts, more sets. Your strength base is growing.',
    'Kurze Pausen, hohe Lasten. Erholung wird zum entscheidenden Faktor.': 'Short rests, heavy loads. Recovery becomes the deciding factor.',
    'Fortschritt in kleinen Schritten. Wer dranbleibt, gewinnt.': 'Progress in small steps. Consistency wins.', 'Individuelle Feinsteuerung. Der Coach arbeitet mit deinen echten Daten.': 'Fine-tuned individually. The Coach works with your real data.',
    'Sanfter Einstieg. Wenig Volumen, viel Erholung.': 'Gentle start. Low volume, plenty of recovery.', 'Ausgewogen. Der empfohlene Standard für die meisten.': 'Balanced. The recommended default for most people.',
    'Mehr Sätze, kürzere Pausen, schnellere Progression.': 'More sets, shorter rests, faster progression.', 'Hohes Volumen. Setzt saubere Technik und Routine voraus.': 'High volume. Requires good technique and a routine.',
    'Maximale Belastung. Nur mit sehr guter Erholung sinnvoll.': 'Maximum load. Only sensible with excellent recovery.', 'wirkt auf Sätze, Pausen und Progression': 'affects sets, rests and progression',
    'Level und XP sind ein Motivationssystem, kein Leistungsurteil. Die Einstufung sagt nichts über deine Gesundheit aus.': 'Levels and XP are a motivation system, not a performance judgement. The rating says nothing about your health.',
    'Erreicht. Titel auf dieser Stufe: <b>': 'Reached. Title at this level: <b>', 'Noch gesperrt. Benötigt insgesamt etwa <b>': 'Still locked. Requires about <b>', 'weiteren Einheiten.': 'more workouts.',
    'Rückseite': 'Back view', 'fett = primär': 'bold = primary', 'Animierte, schematische Übungsausführung': 'Animated exercise demonstration',
    'Animierte Ausführung:': 'Animated form:', 'Noch zu wenig Daten für einen Verlauf.': 'Not enough data for a trend yet.',
    'Körpergewichtsübung: erst die Wiederholungen steigern, dann Zusatzgewicht ergänzen.': 'Bodyweight exercise: increase reps first, then add weight.',
    'Richtwert aus Körpergewicht und Erfahrungsstufe. Nach dem ersten Satz anpassen.': 'Suggested from body weight and experience. Adjust after the first set.',
    'Letzte Einheit ohne abgeschlossene Sätze – gleiches Gewicht erneut versuchen.': 'Last workout had no completed sets — try the same weight again.',
    'Erhöhe auf ': 'Increase to ', ' Wiederholungen in jedem Satz. Sobald das steht, erhöht G04Fit das Gewicht.': ' reps in every set. Once that is solid, G04Fit increases the weight.',
    'Über drei Wochen Pause. Reduziere um etwa 20 % und lasse einen Satz je Übung weg.': 'More than three weeks off. Reduce by about 20% and remove one set per exercise.',
    'Längere Pause. Beginne mit rund einem Drittel weniger Gewicht und baue über drei Wochen auf.': 'Longer break. Start with about one third less weight and build back up over three weeks.',
    'Explosivität': 'Explosiveness', 'Absolviere die erste Einheit. Danach kann der Coach echte Vorschläge zu Gewicht und Progression machen.': 'Complete your first workout. The Coach can then make real suggestions for weight and progression.',
    'Nächste Steigerung': 'Next increase', 'Technik geht vor Gewicht. Eine saubere Wiederholung zählt mehr als zwei mit Schwung.': 'Form comes before weight. One clean rep is worth more than two with momentum.',
    'Zwei bis drei Sekunden zum Absenken bringen oft mehr als fünf Kilo mehr auf der Stange.': 'Taking two to three seconds on the way down often helps more than adding five kilos.',
    'Trinke über den Tag verteilt genug – Leistungsabfall im Training beginnt oft davor.': 'Drink enough throughout the day — performance drops in training often start before it.',
    'Notiere dein Gefühl je Satz. Der Coach kann damit deutlich präziser steuern.': 'Note how each set felt. The Coach can adjust much more precisely with that information.',
    'Die Auswertung findet ausschließlich auf diesem Gerät statt.': 'Analysis takes place exclusively on this device.',
    'Ein Training, ein Schritt, ein Erfolg. Heute zählt.': 'One workout, one step, one success. Today counts.', 'Motivation kommt beim Machen. Starte jetzt mit G04Fit.': 'Motivation comes from doing. Start with G04Fit now.',
    'Bitte eine Bilddatei auswählen.': 'Please choose an image file.', 'Bild ändern': 'Change picture', 'Trainings-Avatar ändern': 'Change workout avatar', 'Eigenes Bild hochladen': 'Upload custom picture',
    'Gesamtvolumen': 'Total volume', 'Muskelgruppen-Balance': 'Muscle group balance', 'Aktiv': 'Active', 'Wirkung': 'Effect',
    'Schwerpunkt-Muskelgruppen': 'Focus muscle groups', 'Weitere Übung': 'More exercise', 'Alarmton für Satzpausen': 'Set rest alarm sound',
    'G04Fit ersetzt keine ärztliche oder physiotherapeutische Beratung. Bei Vorerkrankungen, Schmerzen oder nach Verletzungen kläre dein Training vorher fachlich ab.': 'G04Fit does not replace medical or physiotherapy advice. If you have conditions, pain or injuries, get professional guidance before training.',
    'Deine Angaben bleiben auf diesem Gerät erhalten.': 'Your details stay on this device.', 'Ohne die Einwilligung „Profil speichern“ gelten die Angaben nur bis zum Schließen.': 'Without “Save profile” consent, your details only last until the app closes.',
    'Wähle mindestens eine Übung.': 'Choose at least one exercise.', 'Noch gesperrt.': 'Still locked.',

    /* Privacy and consent cards */
    'Gespeicherte Einheiten': 'Stored workouts', 'Belegter Speicher': 'Storage used', 'erteilt': 'granted', 'nicht erteilt': 'not granted',
    'Löschungen wirken sofort und lassen sich nicht rückgängig machen.': 'Deletions take effect immediately and cannot be undone.',
    'Trainingsdaten löschen': 'Delete workout data', 'Alles löschen und zurücksetzen': 'Delete everything and reset',
    'Öffentliche Datenschutzerklärung': 'Public privacy policy', 'Öffentliche Copyright-Hinweise': 'Public copyright notices',
    'Push-Dienst nur nach Einwilligung': 'Push service only after consent', 'Einwilligung zuletzt geändert:': 'Consent last changed:', 'nie': 'never',

    /* Exercise names (the database keeps stable German source labels so old
       plans remain compatible; the visible label is translated at render time) */
    'Negativ-Bankdrücken (Langhantel)': 'Decline barbell bench press', 'Bankdrücken Langhantel': 'Barbell bench press', 'Kurzhantel-Bankdrücken': 'Dumbbell bench press',
    'Schrägbankdrücken (Kurzhantel)': 'Incline dumbbell press', 'Kabel-Fliegende': 'Cable fly', 'Butterfly (Maschine)': 'Machine chest fly',
    'Butterfly 2 (Maschine)': 'Machine chest fly 2', 'Liegestütze': 'Push-up', 'Liegestütze eng': 'Close-grip push-up',
    'Liegestütze schwer': 'Decline push-up', 'Liegestütze leicht am Boden': 'Knee push-up', 'Positive Liegestütze': 'Incline push-up',
    'Dips (brustbetont)': 'Chest-focused dip', 'Dips schwer': 'Weighted dip', 'Klimmzüge': 'Pull-up', 'Klimmzüge Anfänger': 'Assisted pull-up',
    'Klimmzüge Obergriff eng': 'Close-grip overhand pull-up', 'Klimmzüge Obergriff breit': 'Wide-grip overhand pull-up',
    'Klimmzüge Obergriff breit Zusatzgewicht': 'Weighted wide-grip pull-up', 'Latziehen': 'Lat pulldown', 'Latzug zur Brust': 'Lat pulldown to chest',
    'Latzug eng zum Nacken': 'Close-grip pulldown behind neck', 'Latzug breit zur Brust': 'Wide-grip lat pulldown',
    'Latzug breit zum Nacken': 'Wide-grip pulldown behind neck', 'Langhantelrudern': 'Barbell row',
    'Langhantelrudern Untergriff Schrägbank': 'Underhand incline barbell row', 'Langhantelrudern Untergriff Multipresse': 'Smith-machine underhand row',
    'Kurzhantelrudern (einarmig)': 'Single-arm dumbbell row', 'Kabelrudern (sitzend)': 'Seated cable row', 'Überzüge (Pullover)': 'Pullover',
    'Pullover Kurzhantel Hammergriff': 'Dumbbell pullover, neutral grip', 'Pullover Kurzhantel Gymnastikball': 'Dumbbell pullover on stability ball',
    'Pullover am Kabelzug': 'Cable pullover', 'Pullover mit Langhantel': 'Barbell pullover', 'Schulterdrücken (Kurzhantel)': 'Dumbbell shoulder press',
    'Military Press (Langhantel)': 'Barbell military press', 'Seitheben': 'Lateral raise', 'Frontheben': 'Front raise',
    'Reverse Butterfly': 'Reverse fly', 'Butterfly Reverse Kurzhantel': 'Reverse dumbbell fly', 'Butterfly Reverse Kurzhantel Schrägbank': 'Incline reverse dumbbell fly',
    'Butterfly Reverse Kabelzug vorgebeugt': 'Bent-over cable reverse fly', 'Butterfly Reverse Kabelzug stehend': 'Standing cable reverse fly',
    'Butterfly Reverse Kabelzug liegend': 'Lying cable reverse fly', 'Nackenheben (Shrugs)': 'Shrug', 'Langhantel-Curl': 'Barbell curl',
    'Langhantelcurls Scottcurls': 'Scott preacher curl', 'Kurzhantel-Curl': 'Dumbbell curl', 'Kurzhantelcurls beidarmig Schrägbank': 'Incline dumbbell curl',
    'Kurzhantelcurls beidarmig gleichzeitig': 'Dumbbell curl, both arms', 'Scott-Curl (Preacher)': 'Preacher curl', 'Kabel-Curl': 'Cable curl',
    'Trizepsdrücken am Kabelzug liegend': 'Lying cable triceps extension', 'Trizepsdrücken am Kabelzug': 'Cable triceps pushdown', 'Trizepsdrücken Langhantel': 'Barbell triceps extension', 'Beinpresse': 'Leg press', 'Bank-Dips (Trizeps)': 'Bench dip', 'Trizeps-Bankdrücken mit Kurzhanteln': 'Close-grip dumbbell bench press',
    'Trizeps-Bankdrücken mit Langhantel': 'Close-grip barbell bench press', 'Stirndrücken (French Press)': 'Skull crusher', 'Überkopf-Trizepsdrücken': 'Overhead triceps extension',
    'Trizepsdrücken am Kabelzug einarmig über Kopf': 'Single-arm overhead cable extension', 'Trizeps-Kickback': 'Triceps kickback', 'Crunches': 'Crunch',
    'Sit-ups (gerade Bauchmuskeln)': 'Sit-up', 'Seitliche Crunches (schräge Bauchmuskeln)': 'Side crunch', 'Seitlicher Bauch': 'Side abs',
    'Beinheben (hängend)': 'Hanging leg raise', 'Hängendes Beinheben': 'Hanging leg raise', 'Unterarmstütz (Plank)': 'Forearm plank',
    'Unterarmstütz (Plank) mit Gewicht': 'Weighted forearm plank', 'Unterarmstütz seitlich ohne Hantel': 'Side plank',
    'Unterarmstütz seitlich mit Kurzhantel': 'Weighted side plank', 'Crunches am Kabelzug': 'Cable crunch',
    'Freies Training': 'Free workout', 'Eigenes Startgewicht': 'Custom starting weight', 'Gespeichert': 'Saved', 'Startgewicht aktualisiert.': 'Starting weight updated.',
    /* Text nodes around inline <b> tags are translated separately. */
    'Für konkrete Vorschläge benötigt der Coach die Einwilligung': 'The Coach needs', 'KI-Analyse': 'AI analysis',
    'Erreicht. Titel auf dieser Stufe: ': 'Reached. Title at this level: ', 'Noch gesperrt. Benötigt insgesamt etwa ': 'Still locked. Requires about ',
    'Es sind noch': 'There are still', 'Es sind ausdrücklich keine medizinischen Werte': 'They are explicitly not medical values',
    'Das Bild bleibt vollständig auf diesem Gerät. Es wird nicht hochgeladen, nicht analysiert und nicht an Dritte weitergegeben. Gespeichert wird es nur mit der Einwilligung': 'The picture stays entirely on this device. It is not uploaded, analysed or shared with third parties. It is stored only with',
    'Profil speichern': 'Save profile', 'Du hast': 'You completed', 'sauber geschafft. Erhöhe auf': 'with good form. Increase to',

    /* Nachgetragen 2.1.1 — Texte, die bisher nur Wort für Wort übersetzt wurden */
    'Hauptnavigation': 'Main navigation', 'Zum Inhalt springen': 'Skip to content', 'Trainingsserie': 'Workout streak',
    'Wochenplan': 'Weekly plan', 'geplant': 'planned', 'erledigt': 'completed', 'verpasst': 'missed', 'offen': 'open',
    'aktiv': 'active', 'automatisch aktiv': 'active automatically', 'nur temporär': 'temporary only', '… bis 999': '… up to 999',
    'wird gespeichert': 'is saved', 'Datum': 'Date', 'Jahre': 'years', 'Eigengewicht': 'Body weight', 'Empfehlung': 'Recommendation',
    'Speichern': 'Save', 'Schließen': 'Close', 'Abbrechen': 'Cancel', 'Fertig': 'Done', 'Vorschau': 'Preview', 'Alles': 'Everything',
    'kein Konto': 'no account', 'kein Tracking': 'no tracking', 'läuft': 'in progress', 'Laufende Einheit': 'Current workout',

    // Rangtitel aus js/data-journey.js (Einsteiger und Fortgeschritten stehen oben)
    'Neuling': 'Newcomer', 'Trainierender': 'Trainee', 'Aufsteiger': 'Climber', 'Athlet': 'Athlete',
    'Kraftpaket': 'Powerhouse', 'Veteran': 'Veteran', 'Titan': 'Titan', 'Meister': 'Master', 'Elite': 'Elite', 'Legende': 'Legend',
    'Profi': 'Pro',
    'Lerne die Bewegungen sauber auszuführen. Gewichte sind zweitrangig.': 'Learn to perform the movements with good form. Weight comes second.',
    'Erreicht. Titel auf dieser Stufe:': 'Reached. Title at this level:',
    'Noch gesperrt. Benötigt insgesamt etwa': 'Still locked. Requires about',

    // Dashboard, Profil und Einstellungen
    'Heute steht nichts im Plan. Erholung ist Teil des Trainings.': 'Nothing is planned for today. Recovery is part of training.',
    'noch kein Training': 'no workout yet', 'Dein Profil': 'Your profile', 'Angaben speichern': 'Save details',
    'Ein bis drei Jahre, Grundübungen sitzen.': 'One to three years; the basic lifts are familiar.',
    'Der Split richtet sich nach der Anzahl der Tage: 2 Tage Ganzkörper, 3 Tage Push/Pull/Schulter-Bauch-Beine, ab 4 Tagen einzelne Muskelgruppen.':
      'The split depends on the number of days: 2 days full body, 3 days push/pull/shoulders-abs-legs, 4 or more days individual muscle groups.',
    'Signal': 'Signal', 'Puls': 'Pulse', 'Glockenspiel': 'Chime', 'Trainingserfahrung': 'Training experience',
    'Trainings-Avatar hochladen': 'Upload workout avatar', 'Beste Serie': 'Best streak',
    'Trage hier ein, womit du realistisch arbeitest. G04Fit startet dich dann nicht künstlich leicht.':
      'Enter the weight you realistically work with. G04Fit will then not start you artificially light.',

    // Coach
    'Der Coach ist ausgeschaltet': 'The Coach is switched off', 'Auswertung ist ausgeschaltet': 'Analysis is switched off',
    'Auswertung erlauben': 'Allow analysis', 'Was passiert bei der Auswertung?': 'What happens during analysis?',
    'Damit G04Fit Vorschläge zu Gewicht und Progression machen kann, muss er deine Trainingsdaten auswerten dürfen. Dafür brauchst du die Einwilligung':
      'To suggest weights and progression, G04Fit needs permission to analyse your workout data. This requires the consent',
    'G04Fit rechnet ausschließlich auf diesem Gerät. Es werden keine Daten an einen Server oder an einen externen Dienst gesendet. Die Regeln sind nachvollziehbar: Wiederholungen, Gewichte, Pausenlängen und der Abstand zwischen Einheiten.':
      'G04Fit calculates on this device only. No data is sent to a server or an external service. The rules are transparent: reps, weights, rest times and the time between workouts.',
    'Der G04Fit Coach wertet erst aus, wenn du die Einwilligung "KI-Analyse" erteilst.': 'The G04Fit Coach only analyses once you grant the "AI analysis" consent.',
    'Fortschritt sichtbar': 'Visible progress', 'Frequenz unter Plan': 'Frequency below plan', 'Sehr konstant': 'Very consistent',
    'Ungleichgewicht': 'Imbalance', 'Noch keine Daten': 'No data yet', 'Noch keine Trainingsdaten': 'No workout data yet',
    'Kennzahlen': 'Metrics', 'Ausdauer': 'Endurance', 'Konstanz': 'Consistency', 'Erholung': 'Recovery', 'Beobachtungen': 'Observations',
    'Diese Kennzahlen sind ein spielerisches Profil aus deinen Trainingsdaten.': 'These metrics are a playful profile based on your workout data.',
    'Die Kennzahlen beschreiben nur dein Trainingsverhalten in G04Fit.': 'The metrics only describe your training behaviour in G04Fit.',
    'und keine Diagnose.': 'and are not a diagnosis.', 'Wie der Coach rechnet': 'How the Coach calculates',
    'Haltezeit steigern: pro Einheit etwa 5 Sekunden mehr anstreben.': 'Increase hold time: aim for about 5 seconds more per workout.',
    'Haltezeit': 'Hold time', 'steigern': 'increase', 'halten': 'hold', 'reduzieren': 'reduce',
    'Dein eingetragenes Startgewicht. Beginne mit sauberer Technik.': 'Your entered starting weight. Start with clean technique.',
    'Sehr lange Pause. Behandle die ersten Wochen wie einen Neustart – Technik vor Gewicht.': 'Very long break. Treat the first weeks like a fresh start — technique before weight.',
    'Schlaf ist der wirksamste Regenerationsfaktor, den du selbst steuern kannst.': 'Sleep is the most effective recovery factor you can control yourself.',

    // Fortschritt und Datenschutz
    'Aufzeichnung ist ausgeschaltet': 'Tracking is switched off',
    'G04Fit speichert Trainingshistorie und Rekorde nur, wenn du dem ausdrücklich zustimmst. Ohne diese Einwilligung bleiben abgeschlossene Einheiten nicht erhalten und es gibt keine Verlaufsdaten, die ausgewertet werden könnten.':
      'G04Fit only stores workout history and records if you explicitly agree. Without this consent, completed workouts are not kept and there is no history data to analyse.',
    'Die Daten bleiben ausschließlich auf diesem Gerät. Es findet keine Übertragung an einen Server statt. Du kannst die Einwilligung jederzeit widerrufen – die Daten werden dann sofort gelöscht.':
      'The data stays on this device only. Nothing is sent to a server. You can revoke consent at any time — the data is then deleted immediately.',
    'G04Fit speichert nichts, solange du nicht ausdrücklich zustimmst. Jede Einwilligung gilt einzeln und ist jederzeit widerrufbar. Profil-, Trainings- und Einstellungsdaten bleiben auf diesem Gerät; optionaler Push verwendet nur die unten beschriebenen technischen Daten.':
      'G04Fit stores nothing unless you explicitly agree. Each consent applies separately and can be revoked at any time. Profile, workout and settings data stay on this device; optional push only uses the technical data described below.',
    'Profil, Foto & Einstellungen speichern': 'Save profile, photo & settings',
    'Name, Alter, Größe, Gewicht, Erfahrungsstufe, Ziele, Trainingstage, Startgewichte und dein Trainings-Avatar bleiben auf diesem Gerät erhalten. Ohne diese Einwilligung sind alle Angaben nach dem Schließen weg.':
      'Name, age, height, weight, experience level, goals, training days, starting weights and your workout avatar are kept on this device. Without this consent, all details are gone when you close the app.',
    'Profildaten, Foto, App-Einstellungen, Level und XP': 'Profile data, photo, app settings, level and XP',
    'Abgeschlossene Einheiten mit Sätzen, Gewichten und Wiederholungen werden gespeichert. Nur damit gibt es Fortschritt, Bestleistungen und Verlaufskurven.':
      'Completed workouts are stored with sets, weights and reps. Progress, personal bests and history charts are only possible with this.',
    'Datum, Übungen, Sätze, Gewicht, Wiederholungen, Notizen': 'Date, exercises, sets, weight, reps, notes',
    'Trainingshistorie, Rekorde, Pausen zwischen Einheiten': 'Workout history, records, breaks between workouts',
    'Der Coach analysiert deine gespeicherten Trainingsdaten und leitet daraus Vorschläge für Gewicht, Wiederholungen, Progression und Wiedereinstieg ab. Die Berechnung läuft ausschließlich auf diesem Gerät.':
      'The Coach analyses your stored workout data and derives suggestions for weight, reps, progression and return mode. The calculation runs on this device only.',
    'Analyse deiner Trainingsdaten': 'Analysis of your workout data',
    'G04Fit erzeugt Markdown-Notizen für deinen Vault. Der Export erfolgt nur, wenn du ihn selbst auslöst.':
      'G04Fit creates Markdown notes for your vault. Export only happens when you trigger it yourself.',
    'Trainingsprotokolle, optional Coach-Auswertungen': 'Workout logs, optionally Coach analyses',
    'G04Fit erinnert an geplante Einheiten und meldet sich nach längeren Pausen. Systembenachrichtigungen benötigen zusätzlich die Erlaubnis des Browsers.':
      'G04Fit reminds you of planned workouts and checks in after longer breaks. System notifications also require the browser’s permission.',
    'Zufällige Geräte-ID, Push-Anmeldung, Trainingstage, Uhrzeit und Zeitzone': 'Random device ID, push registration, training days, time and time zone',
    'Erinnerungen & Benachrichtigungen': 'Reminders & notifications', 'Trainingsdaten lokal': 'Workout data stays local',
    'Exportiere alles als JSON-Datei – zur Sicherung oder zum Umzug auf ein anderes Gerät.': 'Export everything as a JSON file — as a backup or to move to another device.',
    'Verantwortlicher, Datenarten, Rechtsgrundlage, Speicherdauer, KI-Verarbeitung, Obsidian, Benachrichtigungen, Löschung, Widerruf und Betroffenenrechte.':
      'Controller, data types, legal basis, storage period, AI processing, Obsidian, notifications, deletion, revocation and data subject rights.',

    // Erinnerungen
    'Ohne die Einwilligung „Benachrichtigungen“ erinnert G04Fit dich nicht.': 'Without the “Notifications” consent, G04Fit will not remind you.',
    'Motivation auch bei geschlossener App': 'Motivation even when the app is closed',
    'Testerinnerung': 'Test reminder', 'Abschalten': 'Turn off',

    // Obsidian
    'Obsidian-Verbindung ist aus': 'Obsidian connection is off', 'Obsidian-Synchronisation': 'Obsidian sync',
    'G04Fit kann Trainingsprotokolle und Auswertungen als Markdown-Dateien für deinen Vault erzeugen. Das passiert nur, wenn du dem ausdrücklich zustimmst.':
      'G04Fit can create workout logs and analyses as Markdown files for your vault. This only happens if you explicitly agree.',
    'Was erzeugt wird': 'What gets created', 'Je Einheit eine Notiz mit Frontmatter, Satztabelle und Volumen': 'One note per workout with frontmatter, set table and volume',
    'Bereit zum Export': 'Ready to export', 'Verbindung trennen': 'Disconnect', 'Vault-Pfad': 'Vault path', 'Unterordner': 'Subfolder',
    'G04Fit erzeugt fertige Notizen. Kopiere sie in deinen Vault oder speichere sie direkt in den unten angegebenen Ordner.':
      'G04Fit creates ready-made notes. Copy them into your vault or save them directly to the folder below.',
    'Ziel im Vault': 'Destination in vault', 'Nur zur Anzeige – G04Fit schreibt nicht selbst in den Ordner.': 'For display only — G04Fit does not write to the folder itself.',
    'Coach-Auswertung mitschreiben': 'Include Coach analysis', 'Zielpfad der aktuellen Notiz:': 'Target path of the current note:',
    'In die Zwischenablage': 'Copy to clipboard', 'Alle Notizen als eine Datei': 'All notes as one file', 'Als .md speichern': 'Save as .md',
    'Einzelne Einheit': 'Single workout', 'Was ausgeben?': 'What to export?',

    // Übungen und laufende Einheit
    'Bewegungsablauf': 'Movement', 'Vorderseite': 'Front view', 'Technikhinweise': 'Technique tips', 'Beanspruchte Muskeln': 'Muscles worked',
    'Übung auswählen': 'Choose exercise', 'Übung suchen …': 'Search exercises …', 'Countdown in der Mitte nach jedem Satz': 'Countdown in the centre after each set',
    'Wdh.': 'reps', 'Satz': 'Set', 'Satz abhaken': 'Tick off set', 'Notiz zur Einheit': 'Workout note',
    'Wie lief das Training? Was ist aufgefallen?': 'How did the workout go? Anything you noticed?',
    'Volumen': 'Volume', 'War leicht': 'Felt easy', 'War schwer': 'Felt hard', 'Einheit abgeschlossen': 'Workout completed'
  };

  var WORDS = {
    'Montag': 'Monday', 'Dienstag': 'Tuesday', 'Mittwoch': 'Wednesday', 'Donnerstag': 'Thursday', 'Freitag': 'Friday', 'Samstag': 'Saturday', 'Sonntag': 'Sunday',
    'Mo': 'Mon', 'Di': 'Tue', 'Mi': 'Wed', 'Do': 'Thu', 'Fr': 'Fri', 'Sa': 'Sat', 'So': 'Sun',
    'Brust': 'Chest', 'Rücken': 'Back', 'Bauch': 'Abs', 'Schulter': 'Shoulders', 'Bizeps': 'Biceps', 'Trizeps': 'Triceps', 'Beine': 'Legs',
    'Kraft': 'Strength', 'Muskel': 'Muscle', 'Training': 'Workout', 'Übung': 'Exercise', 'Wiederholungen': 'reps', 'Wiederholung': 'rep',
    'Gewichte': 'weights', 'Startgewicht': 'starting weight', 'Körpergewicht': 'body weight', 'Eigengewicht': 'body weight',
    'Speichern': 'Save', 'Abbrechen': 'Cancel', 'Bestätigen': 'Confirm', 'Löschen': 'Delete', 'Bearbeiten': 'Edit', 'Schließen': 'Close',
    'Aktiv': 'Active', 'Inaktiv': 'Inactive', 'Heute': 'Today', 'Morgen': 'Tomorrow', 'geplant': 'planned', 'erledigt': 'done',
    'Normal': 'Normal', 'Leicht': 'Easy', 'Schwer': 'Hard', 'Pro': 'Pro', 'Beast': 'Beast', 'Level': 'Level',
    'Minute': 'minute', 'Minuten': 'minutes', 'Sekunden': 'seconds', 'Sek.': 'sec.', 'Kalorien': 'calories', 'Name': 'Name', 'Jahre': 'years', 'Jahr': 'year',
    'läuft': 'running', 'offen': 'open', 'offene': 'open', 'nächsten': 'next', 'nächste': 'next', 'letzten': 'last', 'Gilt': 'Applies',
    'für': 'for', 'mehr': 'more', 'weniger': 'less', 'anzeigen': 'view', 'suchen': 'search', 'Vorschläge': 'suggestions', 'wählen': 'choose',
    'gewählt': 'selected', 'Sicherung': 'backup', 'Daten': 'data', 'Datei': 'file', 'bereit': 'ready', 'Keine': 'No', 'Alle': 'All', 'alle': 'all',
    'Benachrichtigungen': 'notifications', 'Erinnerung': 'reminder', 'Erinnerungen': 'reminders', 'Einwilligung': 'consent',
    'Einheit': 'workout', 'Einheiten': 'workouts', 'Coach': 'Coach', 'Pausen': 'rests', 'Pause': 'rest', 'lokal': 'local',
    'Häufige': 'Common', 'Fehler': 'mistakes', 'Vorschlag': 'suggestion', 'Empfehlung': 'recommendation', 'Empfehlungen': 'recommendations',
    'Profilfoto': 'profile photo', 'Ausrüstung': 'equipment', 'Suche': 'search', 'Filter': 'filter', 'Ändere': 'Change',
    'Woche': 'week', 'Wochen': 'weeks', 'Tag': 'day', 'Tage': 'days', 'Monat': 'month', 'Monate': 'months',
    'Muskelgruppen': 'muscle groups', 'Langhantel': 'barbell', 'Kurzhanteln': 'dumbbells', 'Kabelzug': 'cable', 'Maschine': 'machine',
    'Körpergewicht': 'body weight', 'Barren': 'parallel bars', 'kein': 'no', 'Keine': 'No', 'Treffer': 'results', 'Termine': 'dates',
    'Wiedereinstieg': 'return mode', 'Eigenes': 'Custom', 'Startgewichte': 'Starting weights', 'Schwerpunkt': 'Focus', 'Speichern': 'Save'
  };

  var DATE_EN = { days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  var DATE_DE = { days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], daysLong: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'] };

  function locale() {
    var p = G.store && G.store.state && G.store.state.profile, value = p && p.locale;
    if (value !== 'en' && value !== 'de') { try { value = localStorage.getItem(STORAGE_KEY); } catch (e) {} }
    return value === 'de' ? 'de' : 'en';
  }

  /* Texte mit Zahlen oder Namen darin. Sie laufen vor der Tabelle, damit
     der ganze Satz in einem Stück übersetzt wird und nicht Wort für Wort. */
  var PATTERNS = [
    [/^(\d+) Sätze$/, '$1 sets'],
    [/^(\d+) Einheiten$/, '$1 workouts'],
    [/^(\d+) Einheiten ausgewertet$/, '$1 workouts analysed'],
    [/^(\d+) Einheiten · Serie (\d+) Wochen$/, '$1 workouts · streak $2 weeks'],
    [/^(\d+) Einträge$/, '$1 entries'],
    [/^(\d+) Übungen · (\d+) Muskelgruppen$/, '$1 exercises · $2 muscle groups'],
    [/^(\d+) Übungen · /, '$1 exercises · '],
    [/^(\d+) Üb\.$/, '$1 ex.'],
    [/^(\d+) von (\d+) empfohlen$/, '$1 of $2 recommended'],
    [/^(\d+) von (\d+) Einwilligungen erteilt$/, '$1 of $2 consents granted'],
    [/^(\d+)×\/Woche$/, '$1×/week'],
    [/^(\d+) s Pause$/, '$1 s rest'],
    [/^(\d+) Tage Pause$/, '$1 days off'],
    [/^([\d.,]+) kg Volumen$/, '$1 kg volume'],
    [/^([\d.,]+) kg Eigengewicht$/, '$1 kg body weight'],
    [/^(\d+) XP gesamt$/, '$1 XP total'],
    [/^(\d+) \/ (\d+) XP bis Level (\d+)$/, '$1 / $2 XP to level $3'],
    [/^(\d+) Jahre$/, '$1 years'],
    [/(\d+) Wdh\. · Pause (\d+) s/g, '$1 reps · $2 s rest'],
    [/(\d+(?:–\d+)?) Wdh\./g, '$1 reps'],
    [/^Richtwert ([\d.,]+) kg$/, 'Suggested $1 kg'],
    [/Eigengewicht \+ /g, 'Body weight + '],
    [/^Serie (\d+)$/, 'Streak $1'],
    [/^Trainingsserie: (\d+) Wochen? in Folge$/, 'Workout streak: $1 weeks in a row'],
    [/^Zuletzt trainiert: vor (\d+) Tagen$/, 'Last trained: $1 days ago'],
    [/^Zuletzt trainiert: vor (\d+) Wochen?$/, function (m, n) { return 'Last trained: ' + n + (n === '1' ? ' week' : ' weeks') + ' ago'; }],
    [/^letzte Einheit vor (\d+) Tagen$/, 'last workout $1 days ago'],
    [/^Beanspruchte Muskelgruppen: /, 'Muscle groups worked: '],
    [/^Noch (\d+) XP bis Level (\d+)\. Eine Einheit bringt je nach Umfang etwa (\d+)–(\d+) XP\.$/,
      '$1 XP to go until level $2. A workout earns about $3–$4 XP, depending on volume.'],
    [/^– das entspricht ungefähr (\d+) weiteren Einheiten\.$/, '— that is about $1 more workouts.'],
    // Coach-Sätze stehen im Dashboard mit "Titel: " davor, deshalb ohne ^-Anker.
    [/Bleib bei (.+?) und steigere auf ([\d–]+) Wiederholungen\. Danach geht es mit dem Gewicht weiter\./g,
      'Stay at $1 and work up to $2 reps. Then the weight goes up.'],
    [/Bleib bei (.+?) und schaffe (\d+) Wiederholungen in jedem Satz\. Sobald das steht, erhöht G04Fit das Gewicht\./g,
      'Stay at $1 and hit $2 reps in every set. Once that is solid, G04Fit increases the weight.'],
    [/Du hast (.+?) sauber geschafft\. Erhöhe auf (.+?) und arbeite dich wieder in Richtung (\d+) Wiederholungen\./g,
      'You completed $1 with good form. Increase to $2 and work back up towards $3 reps.'],
    [/^und arbeite dich wieder in Richtung (\d+) Wiederholungen\.$/, 'and work back up towards $1 reps.'],
    [/Zuletzt nur (\d+) Wiederholungen\. Nimm (.+?) herunter und baue die Technik wieder auf\./g,
      'Last time only $1 reps. Drop $2 and rebuild your technique.'],
    [/Zuletzt nur (\d+) Wiederholungen bei hoher Anstrengung\. Nimm (.+?) herunter und baue die Technik wieder auf\./g,
      'Last time only $1 reps with high effort. Drop $2 and rebuild your technique.'],
    [/In den letzten drei Wochen hast du dich bei (\d+) Übung(?:en)? verbessert – am deutlichsten bei (.+) \(\+([\d.,]+) kg geschätztes Maximum\)\./g,
      function (m, n, name, kg) {
        return 'Over the last three weeks you improved on ' + n + (n === '1' ? ' exercise' : ' exercises') +
          ' — most of all on ' + name + ' (+' + kg + ' kg estimated max).';
      }],
    [/Im Modus (\S+) sind (\d+) Einheiten pro Woche vorgesehen, erreicht hast du zuletzt etwa ([\d.,]+)\. Ein Wechsel in einen ruhigeren Modus ist oft nachhaltiger als ein Plan, der liegen bleibt\./g,
      '$1 mode plans $2 workouts per week; recently you managed about $3. Switching to a calmer mode is often more sustainable than a plan that gets dropped.'],
    [/Du hältst dein Pensum von (\d+) Einheiten pro Woche\. Genau das erzeugt langfristig den Fortschritt\./g,
      'You are keeping up your $1 workouts per week. That is exactly what drives long-term progress.'],
    [/(.+?) bekommt deutlich mehr Volumen als (.+?)\. Plane in den nächsten zwei Wochen eine zusätzliche Übung für (.+?) ein\./g,
      '$1 gets much more volume than $2. Plan one extra exercise for $3 over the next two weeks.'],
    [/ — und (\d+) weitere Übung(?:en)? sind bereit\./g,
      function (m, n) { return ' — and ' + n + (n === '1' ? ' more exercise is' : ' more exercises are') + ' ready.'; }],
    [/Rund (\d+) Tage Pause\. Starte mit etwa 10 % weniger Gewicht\./g, 'About $1 days off. Start with about 10% less weight.'],
    [/^Noch (\d+) XP bis Level (\d+)$/, '$1 XP to go until level $2'],
    [/^vor (\d+) Tagen$/, '$1 days ago'],
    [/^vor (\d+) Wochen?$/, function (m, n) { return n + (n === '1' ? ' week' : ' weeks') + ' ago'; }],
    [/G04Fit passt die Vorschläge in den nächsten (\d+) Woche(?:n)? automatisch an\./g,
      'G04Fit adjusts its suggestions automatically over the next $1 weeks.'],
    [/^Gewichte? auf (\d+) %$/, 'Weight at $1%'],
    [/^Einheit läuft · /, 'Workout in progress · '],
    [/^(.+) abgeschlossen$/, '$1 completed'],
    [/^G04Fit motiviert dich an deinen Trainingstagen um ([\d:]+) Uhr mit wechselnden Nachrichten\.$/,
      'G04Fit motivates you on your training days at $1 with changing messages.'],
    [/^Nach mehr als (\d+) Tagen ohne Training erinnert G04Fit gesondert und reduziert die Gewichte\.$/,
      'After more than $1 days without training, G04Fit sends a separate reminder and reduces the weights.'],
    [/^Auswertung vom (.+)$/, 'Analysis from $1'],
    [/^Stand: (.+) · G04Fit (.+)$/, 'As of $1 · G04Fit $2'],
    [/^© (\d+) G04Fit · Alle Rechte vorbehalten · Version (.+)$/, '© $1 G04Fit · All rights reserved · Version $2'],
    [/^G04Fit (.+) · Push-Dienst nur nach Einwilligung · Einwilligung zuletzt geändert: nie$/,
      'G04Fit $1 · Push service only after consent · Consent last changed: never'],
    [/^G04Fit (.+) · Push-Dienst nur nach Einwilligung · Einwilligung zuletzt geändert: (.+)$/,
      'G04Fit $1 · Push service only after consent · Consent last changed: $2'],
    [/(\S+)-Modus$/, '$1 mode'],
    [/ am ((?:Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day)/g, ' on $1']
  ];

  var LETTER = /[A-Za-zÄÖÜäöüß]/;
  var lookup = null, matcher = null;

  // Eine gemeinsame Tabelle und ein einziger regulärer Ausdruck, längster
  // Eintrag zuerst. Wird erst beim ersten Übersetzen und nach extend() gebaut.
  function build() {
    // Ohne Prototyp, sonst liefert lookup['constructor'] oder lookup['toString']
    // eine Funktion und ein Text wie "constructor" wird als Funktionscode ausgegeben.
    lookup = Object.create(null);
    Object.keys(WORDS).forEach(function (k) { lookup[k] = WORDS[k]; });
    Object.keys(EN).forEach(function (k) { lookup[k] = EN[k]; });
    var keys = Object.keys(lookup).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    matcher = new RegExp(keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
  }

  // Ersetzt Bausteine nur an Wortgrenzen. Früher wurde auch innerhalb von
  // Wörtern ersetzt – daraus wurden dann Formen wie „Weighte“ oder „daysn“.
  function replaceParts(text) {
    return text.replace(matcher, function (hit, offset, all) {
      var before = all.charAt(offset - 1), after = all.charAt(offset + hit.length);
      if (LETTER.test(hit.charAt(0)) && before && LETTER.test(before)) return hit;
      if (LETTER.test(hit.charAt(hit.length - 1)) && after && LETTER.test(after)) return hit;
      return lookup[hit];
    });
  }

  function translateText(text) {
    if (locale() !== 'en' || !text || !text.trim()) return text;
    if (!lookup) build();
    var lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], core = text.slice(lead.length, text.length - tail.length);
    if (lookup[core]) return lead + lookup[core] + tail;
    var out = core;
    PATTERNS.forEach(function (p) { out = out.replace(p[0], p[1]); });
    if (lookup[out]) return lead + lookup[out] + tail;
    return lead + replaceParts(out) + tail;
  }

  // Weitere Übersetzungen, z. B. aus js/i18n-exercises-en.js.
  function extend(map) {
    Object.keys(map).forEach(function (k) { EN[k] = map[k]; });
    lookup = null;
  }

  function setDateNames() {
    if (!G.u) return;
    var names = locale() === 'en' ? DATE_EN : DATE_DE;
    G.u.DAYS.splice.apply(G.u.DAYS, [0, G.u.DAYS.length].concat(names.days));
    G.u.DAYS_LONG.splice.apply(G.u.DAYS_LONG, [0, G.u.DAYS_LONG.length].concat(names.daysLong));
    G.u.MONTHS.splice.apply(G.u.MONTHS, [0, G.u.MONTHS.length].concat(names.months));
  }

  var ATTRS = ['placeholder', 'title', 'aria-label'];

  // PRE und CODE zeigen den Obsidian-Export. Der bleibt unverändert,
  // damit die Vorschau genau der Datei entspricht, die gespeichert wird.
  function skipped(node) {
    var p = node.parentNode;
    return !p || /^(SCRIPT|STYLE|TEXTAREA|PRE|CODE)$/i.test(p.nodeName);
  }

  /* Schon übersetzte Texte nicht erneut übersetzen: Der Beobachter sieht auch
     die eigenen Änderungen. Aus "Sprache / Language" wurde sonst im zweiten
     Durchlauf "Language / Language". Gemerkt wird je Knoten das zuletzt
     geschriebene Ergebnis; neuer Text wird wieder übersetzt. */
  var written = typeof WeakMap === 'function' ? new WeakMap() : null;

  function translateNode(node) {
    if (skipped(node)) return;
    if (written && written.get(node) === node.nodeValue) return;
    var next = translateText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
    if (written) written.set(node, next);
  }

  function translateAttrs(el) {
    ATTRS.forEach(function (attr) {
      if (!el.hasAttribute(attr)) return;
      var value = el.getAttribute(attr);
      var mark = written && written.get(el);
      if (mark && mark[attr] === value) return;
      var next = translateText(value);
      if (next !== value) el.setAttribute(attr, next);
      if (written) { mark = mark || {}; mark[attr] = next; written.set(el, mark); }
    });
  }

  function translateTree(root) {
    if (root.nodeType === 3) { translateNode(root); return; }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      return skipped(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }}), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(translateNode);
    if (root.nodeType === 1) translateAttrs(root);
    if (root.querySelectorAll) root.querySelectorAll('[placeholder], [title], [aria-label]').forEach(translateAttrs);
  }

  function apply(root) {
    setDateNames();
    if (document && document.documentElement) document.documentElement.lang = locale();
    if (!root || locale() !== 'en') return;
    translateTree(root);
  }

  /* Viele Anzeigen ändern sich nach dem Rendern (Satzzähler, Pausentimer,
     Übungsauswahl, Toasts). Der Beobachter übersetzt auch diese Texte, ohne
     dass jede Stelle im Code selbst an die Übersetzung denken muss. */
  var observer = null;
  function watch() {
    if (observer || typeof MutationObserver === 'undefined' || !document.body) return;
    observer = new MutationObserver(function (records) {
      if (locale() !== 'en') return;
      records.forEach(function (r) {
        if (r.type === 'characterData') translateNode(r.target);
        else if (r.type === 'attributes') translateAttrs(r.target);
        else r.addedNodes.forEach(function (node) { if (node.nodeType === 1 || node.nodeType === 3) translateTree(node); });
      });
      // Die eigenen Änderungen erzeugen neue Einträge – die werden verworfen,
      // sonst würde sich der Beobachter endlos selbst auslösen.
      observer.takeRecords();
    });
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
  }
  watch();

  function setLocale(next) {
    next = next === 'de' ? 'de' : 'en';
    if (G.store && G.store.state && G.store.state.profile) {
      G.store.state.profile.locale = next;
      if (G.store.commit) G.store.commit('language');
    }
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    // Tages- und Monatsnamen vor dem Neuzeichnen umstellen, sonst rendert
    // die Ansicht noch mit den Namen der vorherigen Sprache.
    setDateNames();
    // Falls Hintergrund-Push aktiv ist, soll auch der Worker sofort die neue
    // Sprache verwenden (Fehler bleiben für die lokale Umschaltung folgenlos).
    if (G.reminders && G.reminders.allowed && G.reminders.allowed() && G.reminders.syncPushSchedule) {
      G.reminders.syncPushSchedule().catch(function () {});
    }
    if (G.app && G.store && G.store.state && G.store.state.onboarded) G.app.rerender();
    else if (G.onboarding && G.onboarding.render) G.onboarding.render();
    else apply(document.body);
  }

  G.i18n = { locale: locale, setLocale: setLocale, translate: translateText, apply: apply, extend: extend };

  // Freies Training: Trainingszeit, Wiederholen (23.09.2026)
  extend({
    'Letztes Training wiederholen': 'Repeat last workout',
    'Trainingszeit': 'Workout time',
    ' Trainingszeit': ' workout time',
    ' wird wiederholt.': ' is being repeated.',
    'Erledigt': 'Done', 'Geplant': 'Planned', 'Verpasst': 'Missed', ', heute': ', today',
    'Letzte Einheit': 'Latest workout', 'Neuester Rekord': 'Latest record', 'Bestwert': 'Best'
  });
})(G04Fit);
