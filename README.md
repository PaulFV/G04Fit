# G04Fit v2.1.0

Trainingsplaner für **Brust, Rücken, Bauch, Bizeps, Trizeps und Schulter** — mit Wochenplan,
Journey, regelbasiertem Coach, Fortschrittsauswertung, Obsidian-Export und einem
Datenschutzkonzept, das ohne Einwilligung nichts speichert.

Umgesetzt als eigenständige Web-App: läuft auf **Desktop, iPhone und Android**, offline,
ohne Backend, ohne Konto, ohne Tracking.

---

## Inhalt

| Bereich | Beschreibung |
|:--|:--|
| **Dashboard** | Begrüßung, Tagesplan, Wochenübersicht, Kennzahlen, Coach-Tipp, nächste Erinnerung |
| **Journey** | Weltkarte mit sechs Regionen, Level und XP, Modi von Easy bis Beast |
| **Workout** | Laufende Einheit mit Sätzen, Gewichten, Pausentimer und Coach-Hinweisen |
| **Übungen** | 37 Übungen mit animierter Ausführung, anatomischer Muskelkarte, Technikhinweisen und häufigen Fehlern |
| **Fortschritt** | Volumen, Kraftentwicklung, Rekorde, Muskelbalance, Leistungsprofil, Historie |
| **Profil** | Persönliche Angaben, Erfahrungsstufe, Ziele, Trainingstage, Startgewichte, Trainings-Avatar |
| **G04Fit Coach** | Vorschläge zu Gewicht, Wiederholungen, Progression und Wiedereinstieg |
| **Erinnerungen** | Trainingstage, Uhrzeit, Benachrichtigungen, Wiedereinstiegsmodus |
| **Obsidian** | Trainingsprotokolle und Übersicht als Markdown für deinen Vault |
| **Datenschutz** | Fünf einzelne Einwilligungen, Export, Löschung, Datenschutzerklärung und Copyright-Hinweise |

---

## Starten

### 1. Ohne alles — einfach doppelklicken

`index.html` im Browser öffnen. Funktioniert sofort, komplett offline.

**Einschränkung:** Beim Öffnen über `file://` erlaubt der Browser keine Systembenachrichtigungen
und keine Installation als App. Erinnerungen erscheinen dann als Hinweis in der App.

### 2. Visual Studio 2026 — als Desktop-Anwendung (empfohlen)

[G04Fit.sln](G04Fit.sln) öffnen, **G04Fit.Desktop** als Startprojekt setzen, **F5** drücken.

G04Fit öffnet sich in einem eigenen Fenster mit eigenem Icon — wie eine normale
Windows-Anwendung. Technisch ist es eine WPF-App, die die Oberfläche über WebView2 anzeigt.
Der Projektordner wird dabei als virtueller Host `https://g04fit.local` eingebunden, damit die
App als sicherer Kontext gilt: localStorage, Service Worker und Benachrichtigungen
funktionieren.

Es läuft **kein Webserver** und es gehen **keine Daten nach außen**. Änderungen an CSS und JS
sind nach **F5** im Fenster sofort sichtbar.

| Taste | Wirkung |
|:--|:--|
| **F5** | Oberfläche neu laden |
| **F12** | Entwicklerwerkzeuge öffnen |
| **F11** | Vollbild |

Voraussetzung ist die **WebView2-Laufzeitumgebung**. Die ist in Windows 11 bereits enthalten;
fehlt sie, zeigt die App einen Hinweis und die Server-Variante bleibt als Alternative.

Für eine weitergebbare Fassung:

```bash
dotnet publish src/G04Fit.Desktop/G04Fit.Desktop.csproj -c Release -o veroeffentlicht
```

Dabei wird die Weboberfläche automatisch nach `veroeffentlicht/app/` kopiert — der Ordner ist
dann eigenständig lauffähig.

### 3. Visual Studio 2026 — als lokaler Webserver

Startprojekt **G04Fit.Server** wählen und **F5** drücken. ASP.NET Core liefert die Oberfläche
über `https://localhost:7181` aus. Diese Variante brauchst du für den **Test auf dem Handy**
(siehe unten) und für die Installation als PWA im Browser.

Der Server macht ausschließlich eines: statische Dateien ausliefern. Es gibt **keine Datenbank
und keine Serverspeicherung** — G04Fit hält alle Daten lokal im Browser.

### 4. Ohne Visual Studio

```bash
dotnet run --project src/G04Fit.Server/G04Fit.Server.csproj
```

Danach `http://localhost:5181` aufrufen.

---

## Auf dem iPhone oder Android installieren

### Weg 1 — im eigenen WLAN (schnell, zum Ausprobieren)

Am Rechner ausführen:

```bash
powershell -ExecutionPolicy Bypass -File Handy-Test-starten.ps1
```

Das Skript ermittelt die IP-Adresse des Rechners, richtet auf Wunsch die Firewall-Freigabe ein
und zeigt die Adresse an, die du am Handy eingibst — etwa `http://192.168.178.35:5181`.

Alternativ von Hand: Serverprofil **„G04Fit (im Netzwerk, für Handy-Test)"** in Visual Studio
starten, IP über `ipconfig` ablesen.

Dann am Handy:

* **iPhone:** **Safari** öffnen → Adresse eingeben → Teilen-Symbol → *Zum Home-Bildschirm*
* **Android:** Chrome öffnen → Adresse eingeben → Menü ⋮ → *App installieren*

G04Fit erscheint als Symbol auf dem Startbildschirm und startet im Vollbild ohne Adressleiste.

**Grenzen dieses Weges:** Die Verbindung läuft über `http://`, nicht `https://`. iOS behandelt
das nicht als sicheren Kontext — deshalb funktionieren **Offline-Betrieb und Benachrichtigungen
nicht**, und die App lädt nur, solange der Rechner läuft und beide im selben WLAN sind. Zum
Anschauen und Bedienen reicht es vollkommen.

### Weg 2 — dauerhaft, mit vollem Funktionsumfang

Damit G04Fit unabhängig vom Rechner läuft, offline funktioniert und Erinnerungen senden kann,
braucht es `https://`. Am einfachsten über einen kostenlosen Hoster für statische Seiten —
GitHub Pages, Netlify oder Cloudflare Pages. Hochgeladen werden nur:

```
index.html   manifest.webmanifest   sw.js   css/   js/   icons/
```

Die Ordner `src/`, `docs/` und `G04Fit.sln` werden **nicht** gebraucht.

Es liegen keine persönlichen Inhalte im Projekt — der Avatar wird erst in der App hochgeladen
und bleibt auf dem jeweiligen Gerät. Auf dem Server liegt ausschließlich das Programm selbst;
Trainingsdaten, Profil und Bild werden dort nie gespeichert.

### Weg 3 — echte App im App Store

Dafür wären ein Apple-Developer-Konto (99 $ pro Jahr) und eine Verpackung über Capacitor oder
Tauri nötig. Für die private Nutzung bringt das gegenüber Weg 2 keinen Vorteil.

### Desktop

* **Windows:** Projekt `G04Fit.Desktop` starten (siehe oben) — echtes Programmfenster
* **Chrome/Edge:** Installationssymbol in der Adressleiste

---

## Aufbau

```
G04Fit/
├── index.html                  Grundgerüst und Skript-Einbindung
├── manifest.webmanifest        Installation als App
├── sw.js                       Service Worker (Offline-Betrieb)
├── G04Fit.sln                  Visual-Studio-Solution
├── Handy-Test-starten.ps1      Server fürs WLAN starten, Adresse anzeigen
│
├── css/
│   ├── theme.css               Farben, Typografie, Glaseffekt
│   ├── layout.css              Shell, Navigation, Responsive
│   ├── components.css          Karten, Formulare, Listen, Avatar
│   └── anim.css                Übungsanimationen, Muskelkarte
│
├── js/
│   ├── util.js                 Hilfsfunktionen, Icons, Toasts, Sheets
│   ├── data-exercises.js       Übungsdatenbank (37 Übungen)
│   ├── data-journey.js         Regionen, Modi, XP-Kurve
│   ├── store.js                Zustand und Speicherung (Privacy First)
│   ├── anim.js                 SVG-Figuren und Muskelkarte
│   ├── charts.js               Ring, Kurve, Netzdiagramm, Säulen
│   ├── avatar.js               Trainings-Avatar
│   ├── coach.js                Progressionsregeln und Auswertung
│   ├── planner.js              Wochenplan und Einheiten
│   ├── reminders.js            Erinnerungen
│   ├── obsidian.js             Markdown-Erzeugung
│   ├── view-*.js               Die zehn Bereiche
│   ├── onboarding.js           Ersteinrichtung
│   └── app.js                  Router und Start
│
├── icons/                      App-Icons
│
└── src/
    ├── G04Fit.Desktop/         Windows-Anwendung (WPF + WebView2, .NET 10)
    └── G04Fit.Server/          Lokaler Webserver (ASP.NET Core, .NET 10)
```

Alle Skripte sind klassische `<script>`-Dateien mit einem gemeinsamen `G04Fit`-Namensraum —
bewusst ohne ES-Module, damit die App auch per Doppelklick über `file://` startet.
Es gibt keine externen Abhängigkeiten, kein npm, keinen Build-Schritt.

---

## Muskelkarte

Bei **jeder** Übung ist zu sehen, welche Muskeln arbeiten — in der Übungsliste, im laufenden
Training, in den Coach-Empfehlungen und im Wochenplan.

Die Darstellung ist ein anatomischer Körper in Vorder- und Rückansicht:

| Ansicht | Sichtbare Gruppen |
|:--|:--|
| Vorderseite | Schulter, Brust, Bizeps, Bauch |
| Rückseite | Schulter, Rücken, Trizeps |

Die **primäre** Gruppe leuchtet kräftig in ihrer Farbe, **unterstützende** Gruppen erscheinen
gedämpft. In kleinen Kacheln wird automatisch die Ansicht gewählt, auf der die Hauptgruppe
liegt, und auf den Oberkörper zugeschnitten. Im Übungsdetail sind beide Ansichten nebeneinander
zu sehen, darunter die Beschriftung mit den Muskelnamen.

Die Farben sind durchgängig dieselben wie in der Muskelgruppen-Balance unter *Fortschritt*:

| Gruppe | Farbe |
|:--|:--|
| Brust | Neongrün |
| Rücken | Cyan |
| Bauch | Gold |
| Bizeps | Violett |
| Trizeps | Rosé |
| Schulter | Türkis |

---

## Wie der Coach rechnet

Regelbasiert und nachvollziehbar, vollständig auf dem Gerät:

| Situation | Reaktion |
|:--|:--|
| Obere Grenze des Wiederholungsbereichs in **allen** Sätzen erreicht | Gewicht um den kleinsten sinnvollen Schritt erhöhen, Bereich beginnt wieder unten |
| Alle Sätze als *leicht* markiert | Doppelter Gewichtsschritt |
| Untere Grenze deutlich verfehlt oder überwiegend *schwer* | Gewicht um rund 8 % reduzieren |
| Innerhalb des Bereichs | Gewicht halten, Wiederholungen steigern |
| Über 10 Tage Pause | Wiedereinstieg: 10–45 % weniger Gewicht, ein Satz weniger, Aufbau über 1–4 Wochen |

Beispiel aus dem Konzept: nach **80 kg × 12** sauberen Wiederholungen folgt eine Empfehlung
Richtung **82,5 kg × 8–10**.

Der Schwierigkeitsmodus steuert Sätze, Pausenlänge, Wiederholungsbereich, Progressionstempo
und XP-Faktor:

| Modus | Sätze | Pause | Einheiten/Woche | XP |
|:--|--:|--:|--:|--:|
| 🌱 Easy | 2 | 120 s | 2 | ×0,8 |
| ⚡ Normal | 3 | 90 s | 3 | ×1,0 |
| 🔥 Hard | 4 | 75 s | 4 | ×1,25 |
| 💠 Pro | 4 | 60 s | 5 | ×1,5 |
| 👹 Beast | 5 | 55 s | 5 | ×1,85 |

---

## Datenschutz

G04Fit speichert **nichts**, solange keine ausdrückliche Einwilligung vorliegt. Es gibt fünf
getrennte Einwilligungen, jede einzeln erteilbar und jederzeit widerrufbar:

1. **Profil, Foto & Einstellungen speichern**
2. **Trainingshistorie & Rekorde**
3. **Auswertung durch den G04Fit Coach**
4. **Obsidian-Export**
5. **Erinnerungen & Benachrichtigungen**

Ein Widerruf löscht die betroffenen Daten sofort. Die meisten Daten liegen im lokalen Speicher des
Browsers (`localStorage`). Wenn Push-Erinnerungen aktiviert werden, überträgt G04Fit ausschließlich
die dafür nötigen technischen Daten an den konfigurierten Push-Dienst; Name, Foto, Profil und
Trainingsverlauf werden nicht übertragen.

Unter *Datenschutz* lassen sich alle Daten als JSON exportieren, wieder einlesen sowie einzeln
oder vollständig löschen. Dort stehen außerdem die Copyright- und Lizenzhinweise. Die öffentliche
Datenschutzseite liegt unter [privacy.html](privacy.html), die Copyright-Seite unter
[copyright.html](copyright.html); englische Fassungen liegen unter [privacy-en.html](privacy-en.html)
und [copyright-en.html](copyright-en.html). Zusätzlich gibt es eine [Support-Seite](support.html).
Alle Texte müssen vor einer Veröffentlichung mit der finalen Hosting-/Push-Konfiguration abgeglichen
und rechtlich geprüft werden.

**Kennzahlen wie Kraft, Ausdauer, Explosivität, Konstanz und Erholung sind ein spielerisches
Profil aus deinen Trainingsdaten — ausdrücklich keine medizinischen Werte.**

### Trainings-Avatar

G04Fit wird **ohne vorgegebenes Bild** ausgeliefert. Jede Person lädt ihr eigenes hoch — im
Profil unter *Trainings-Avatar* oder durch Antippen des Avatars an beliebiger Stelle
(Dashboard, Journey, Seitenleiste, Ersteinrichtung).

Solange kein Bild gewählt wurde, zeigt G04Fit die Initialen des eingetragenen Namens,
sonst ein neutrales Symbol.

Das gewählte Bild wird im Browser auf 512 Pixel verkleinert, mittig zugeschnitten und als Teil
der Profildaten lokal abgelegt — rund 30–80 KB. Keine Erkennung, keine Analyse, keine
Übertragung. Es lässt sich jederzeit austauschen oder entfernen und wird beim Löschen der Daten
mit entfernt.

Weil kein Bild mitgeliefert wird, kann das Projekt bedenkenlos weitergegeben oder
veröffentlicht werden.

## Google Play Store

Die PWA ist für eine Android-Verpackung vorbereitet. Die Store-Texte und die technische sowie
rechtliche Checkliste liegen unter [play-store/](play-store/) und
[docs/Play-Store-Vorbereitung.md](docs/Play-Store-Vorbereitung.md). Vor dem Upload müssen GitHub
Pages aktiviert und geprüft, ein Android-App-Bundle mit Signatur erstellt, Digital Asset Links (bei
TWA) veröffentlicht sowie die Angaben in der Play Console ausgefüllt werden.

---

## Nächste Schritte

Das Konzept sieht für spätere Versionen vor:

* Portierung auf React, TypeScript, Tailwind CSS und Framer Motion
* Optionales Benutzerkonto für die Synchronisation zwischen mehreren Geräten
* 3D-Avatar mit hervorgehobenen Muskelgruppen
* Obsidian-Plugin für die direkte Synchronisation in den Vault
* Erweiterung um Beine und Ganzkörperübungen

Die Fachlogik liegt bereits getrennt von der Oberfläche (`store.js`, `coach.js`, `planner.js`,
`data-*.js`) und lässt sich für eine React-Fassung übernehmen.

---

*G04Fit ist kein Medizinprodukt und ersetzt keine ärztliche oder physiotherapeutische Beratung.*
