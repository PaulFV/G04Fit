# G04Fit — Datenschutzerklärung

**Entwurf für den Prototyp · Version 1.0.0**

> Dieser Text ist ein Arbeitsentwurf. Vor einer Veröffentlichung muss er mit den tatsächlich
> eingesetzten Diensten abgeglichen und rechtlich geprüft werden — insbesondere, sobald
> Backend, Benutzerkonten oder externe Push-Dienste hinzukommen.

---

## 1. Verantwortlicher

G04Fit läuft in dieser Fassung vollständig auf dem Gerät der nutzenden Person. Es gibt keinen
Serverbetrieb und keine Benutzerkonten. Verantwortlich für die Verarbeitung ist damit die
Person, die die App auf ihrem Gerät nutzt.

Sobald eine spätere Version ein Backend erhält, ist hier der Betreiber mit Anschrift und
Kontaktmöglichkeit einzutragen.

## 2. Welche Daten verarbeitet werden

* **Profilangaben:** Name oder Spitzname, Alter, Größe, Körpergewicht, Erfahrungsstufe, Ziele
* **Trainings-Avatar:** ein optionales Profilfoto
* **Trainingsdaten:** Datum, Übungen, Sätze, Gewichte, Wiederholungen, Anstrengungsbewertung, Notizen
* **Abgeleitete Werte:** Volumen, geschätztes Einwiederholungsmaximum, Level, XP, Trainingsserien
* **App-Einstellungen:** Trainingstage, Erinnerungszeit, Schwierigkeitsmodus, Anzeigeoptionen

Es werden **keine Gesundheitsdaten im Sinne einer medizinischen Diagnose** erhoben.

## 3. Rechtsgrundlage

Die Verarbeitung erfolgt ausschließlich auf Grundlage der Einwilligung nach
**Art. 6 Abs. 1 lit. a DSGVO**. Die Einwilligungen sind nach Zweck getrennt und einzeln
erteilbar:

| Einwilligung | Zweck |
|:--|:--|
| Profil, Foto & Einstellungen speichern | Persönliche Angaben über die Sitzung hinaus erhalten |
| Trainingshistorie & Rekorde | Fortschritt, Bestleistungen, Verlaufskurven |
| Auswertung durch den G04Fit Coach | Vorschläge zu Gewicht, Wiederholungen, Progression |
| Obsidian-Export | Erzeugung von Markdown-Notizen |
| Erinnerungen & Benachrichtigungen | Hinweise an Trainingstagen und nach Pausen |

Ohne die jeweilige Einwilligung wird der betreffende Datenbereich **nicht dauerhaft
gespeichert**. Er existiert dann nur im Arbeitsspeicher und ist nach dem Schließen der App weg.

## 4. Speicherort und Speicherdauer

Alle Daten liegen im lokalen Speicher des Browsers (`localStorage`) auf dem jeweiligen Gerät.
Es findet **keine Übertragung an Dritte** statt. Die Daten bleiben erhalten, bis sie gelöscht
werden, die Einwilligung widerrufen wird oder die Browserdaten entfernt werden.

## 5. Verarbeitung durch den G04Fit Coach

Der Coach ist ein **regelbasiertes Verfahren**, das auf dem Gerät rechnet. Es werden keine
Daten an einen KI-Dienst gesendet. Die Regeln — Wiederholungsbereiche, Gewichtsschritte,
Pausenlängen, Abstände zwischen Einheiten — sind in der App dokumentiert.

Sollte in einer späteren Version ein externer KI-Dienst hinzukommen, ist dafür eine
**gesonderte Einwilligung** erforderlich.

## 6. Trainings-Avatar (Foto)

Das Foto wird ausschließlich im lokalen Speicher des Browsers abgelegt und nur zur Anzeige in
der App verwendet. Es findet **keine Gesichtserkennung, keine biometrische Auswertung und keine
Übertragung** statt.

Das Foto kann jederzeit im Profil ausgetauscht, entfernt oder die Anzeige ganz abgeschaltet
werden. Beim Löschen der Daten wird es mit entfernt.

## 7. Obsidian

Der Export erzeugt Markdown-Dateien, die selbst kopiert oder gespeichert werden. G04Fit greift
**nicht eigenständig auf das Dateisystem zu**. Was nach dem Export im Vault geschieht, liegt in
der Verantwortung der nutzenden Person.

## 8. Benachrichtigungen

Erinnerungen werden lokal ausgelöst, solange die App geöffnet ist. Für Systembenachrichtigungen
ist zusätzlich die Erlaubnis des Browsers nötig. Es werden **keine Geräte-Kennungen an einen
Push-Dienst übermittelt**.

## 9. Rechte der betroffenen Person

* **Auskunft (Art. 15):** Alle gespeicherten Daten sind in der App einsehbar.
* **Datenübertragbarkeit (Art. 20):** Export als JSON-Datei unter *Datenschutz*.
* **Löschung (Art. 17):** Einzeln (Trainingsdaten) oder vollständig (alles zurücksetzen).
* **Widerruf (Art. 7 Abs. 3):** Jede Einwilligung ist jederzeit mit Wirkung für die Zukunft
  widerrufbar. Ein Widerruf löscht die betroffenen Daten in G04Fit unmittelbar.
* **Berichtigung, Einschränkung, Widerspruch (Art. 16, 18, 21):** bestehen unabhängig davon.

## 10. Keine medizinische Beratung

G04Fit ist **kein Medizinprodukt**. Kennzahlen wie Kraft, Ausdauer, Explosivität, Konstanz und
Erholung sind ein spielerisches Profil aus den Trainingsdaten und **ausdrücklich keine
medizinischen Werte**. Bei Beschwerden, Vorerkrankungen oder nach Verletzungen ist ärztlicher
Rat einzuholen.

## 11. Offene Punkte vor einer Veröffentlichung

- [ ] Verantwortlichen mit Anschrift und Kontakt eintragen
- [ ] Auftragsverarbeiter benennen, sobald ein Hosting hinzukommt
- [ ] Rechtsgrundlage prüfen, falls Benutzerkonten eingeführt werden
- [ ] Push-Dienst und dessen Datenverarbeitung dokumentieren
- [ ] Speicherdauer festlegen, sobald serverseitig gespeichert wird
- [ ] Rechtliche Prüfung durch eine fachkundige Person

---

*Stand: Version 1.0.0 · Prototyp ohne Backend*
