# G04Fit — Vorbereitung für Google Play

Diese Checkliste bereitet das Repository vor. Ein Upload in die Play Console ist erst
möglich, wenn ein Android-App-Bundle signiert, ein öffentlich erreichbarer Store-Eintrag
und eine echte Datenschutzseite vorhanden sind.

## Noch vom Betreiber einzutragen

* Rechteinhaber/Impressum: **[Name oder Firma]**
* Kontakt-E-Mail: **[Support-E-Mail]**
* Postanschrift: **[vollständige ladungsfähige Adresse]**
* Öffentliche Datenschutz-URL: **[https://…/datenschutz]**
* Support-URL: **[https://…/support]**
* Android-Paketname: **`com.g04fit.app`** (einmalig festlegen; danach nicht ändern)

Ohne diese Angaben darf die App nicht als fertiger Store-Release bezeichnet werden.

## Technischer Weg

Die aktuelle Anwendung ist eine installierbare PWA. Für Google Play wird sie als
signierte Android-App verpackt. Empfohlen ist eine Trusted Web Activity (TWA), sobald
die PWA unter einer stabilen HTTPS-Domain läuft. Alternativ kann Capacitor verwendet
werden, wenn später native Funktionen benötigt werden.

1. PWA unter HTTPS veröffentlichen und `start_url`, `scope` und Service Worker prüfen.
2. Eine TWA/Capacitor-Hülle mit Paketname `com.g04fit.app` erzeugen.
3. Android App Bundle (`.aab`) im Release-Modus bauen und für neue Apps/Updates
   mindestens Android 16 (API 36) als Target SDK setzen.
4. Keystore sicher außerhalb des Repositories speichern und Play App Signing aktivieren.
5. Digital Asset Links unter `/.well-known/assetlinks.json` veröffentlichen (bei TWA).
6. Auf mehreren Android-Versionen testen: Onboarding, Sprachwahl, Profil, Push, Offline,
   Datenexport, Datenlöschung und Zurücksetzen.

## Play-Console-Formulare

* **App-Zugriff:** keine Anmeldung erforderlich.
* **Werbung:** keine Werbung, sofern keine Werbe-SDKs ergänzt werden.
* **Datensicherheit:** lokal gespeicherte Profil- und Trainingsdaten; optional werden
  für Push eine Geräte-ID, Web-Push-Anmeldung, Trainingstage, Uhrzeit, Zeitzone und
  Sprache an den konfigurierten Push-Dienst übertragen. Keine Gesundheitsdiagnose,
  keine Konten, kein Verkauf von Daten.
* **Datenschutz:** die finale URL aus den Betreiberangaben eintragen.
* **Inhaltsbewertung:** ehrlich nach den Fragen der Play Console ausfüllen.
* **Zielgruppe:** keine Ausrichtung auf Kinder festlegen, solange keine gesonderte
  Kinder-Datenschutzprüfung erfolgt.
* **Gesundheit:** G04Fit ist kein Medizinprodukt und ersetzt keine ärztliche Beratung.

## Store-Texte

Die vorbereiteten deutschen und englischen Beschreibungen liegen in:

* [store-listing-de-DE.md](../play-store/store-listing-de-DE.md)
* [store-listing-en-US.md](../play-store/store-listing-en-US.md)

Vor dem Einreichen müssen Screenshots, Feature Graphic, App-Icon, Support-Adresse,
Datenschutz-URL und die tatsächliche Paket-ID ergänzt werden.
