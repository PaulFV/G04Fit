# Exercise animation attribution

- The negative-bench reference was supplied by the project owner and bears the visible `fitundattraktiv.de` attribution. The original reference file is intentionally not redistributed in this repository.
- The machine chest fly animation (`butterfly-avatar-whiteclean.gif`, supplied by the
  project owner) carries the visible `fitundattraktiv.de` attribution at the bottom.
  The dark variant (`butterfly-avatar-dark.gif`) keeps that notice: the converter in
  `tools/dark-gifs.html` has a `NOTICE` entry for this file so the light grey text is
  redrawn on the dark background instead of being dropped with the white background.

## Wasserzeichen und Herkunftshinweis (25.09.2026)

- Die Übungs-GIFs sind unverändert, mit einer Ausnahme (siehe unten). Das Wasserzeichen (PF-Logo,
  `assets/exercises/watermark-logo.png`, von der Avatar-Hose nachgezeichnet, mit der Zeile
  "© 2026 G04Fit") liegt in der App als Ebene unten rechts in der Ecke des Bildfelds
  (`figure()` in `js/anim.js`, `.fig__mark` in `css/anim.css`). Größe und Schrift folgen der
  Feldbreite, deshalb passt es auf Desktop, iPhone und Android; in kleinen Kacheln der Übungsliste bleibt
  nur das Logo. Es ist nicht in die GIF-Dateien eingebrannt.
- Butterfly (Maschine, `butterfly-avatar`): Die Vorlage trug unten in der Bildmitte die Schrift
  "© fitundattraktiv.de". Sie ist aus beiden GIFs entfernt (hell: Bereich weiß gefüllt, dunkel: neu erzeugt
  mit `tools/dark-gifs.html`). Zunächst wurde sie als Beschriftung in der Ecke des Bildfelds weitergezeigt
  (`credit` in `js/data-exercises.js`, `watermark()` in `js/anim.js`); auf Wunsch des Projektinhabers am
  25.09.2026 wird sie nicht mehr angezeigt (`credit` auskommentiert). Die unveränderte Vorlage liegt lokal
  in `assets/exercises/sources/orig/` und in der Git-Historie.
- Die Animationen stammen ursprünglich von fitundattraktiv.de. Ob Wasserzeichen, Copyright-Zeile und der
  Wegfall des Herkunftshinweises erlaubt sind, muss der Projektinhaber mit dem Rechteinhaber klären, bevor die App
  veröffentlicht wird.

## Butterfly (Maschine): neue Animation (25.09.2026)

- "Butterfly (Maschine)" (`fly-machine`) nutzt jetzt `butterfly-machine-whiteclean.gif` und `butterfly-machine-dark.gif`
  (vom Projektinhaber geliefert, ohne eingebrannten Herkunftshinweis). Die dunkle Fassung ist mit
  `tools/dark-gifs.html` erzeugt (Eintrag `butterfly-machine` in `LIGHT_EDGE`).
- Die früheren Dateien `butterfly-avatar*.gif` (Vorlage mit "© fitundattraktiv.de") sind aus dem Repository entfernt;
  sie bleiben in der Git-Historie.
- Die Herkunft der neuen Animation ist vom Projektinhaber vor der Veröffentlichung zu klären.

## Kurzhantel-Bankdrücken: neue Animation (25.09.2026)

- "Kurzhantel-Bankdrücken" (`bench-db`) nutzt eine neue, vom Projektinhaber gelieferte Animation
  (`bench-db-whiteclean.gif`, `bench-db-dark.gif`). Die Vorlage hatte einen schwarzen Hintergrund; er ist in
  `tools/dark-gifs.html` freigestellt (`BLACK_BG`, `convertLight`), die helle Fassung hat weißen Grund.
- Die Herkunft der Animation ist vom Projektinhaber vor der Veröffentlichung zu klären. Die frühere Fassung liegt
  in der Git-Historie.

## Bankdrücken Langhantel: neue Übung (25.09.2026)

- "Bankdrücken Langhantel" (`bench-bb-flat`) nutzt eine vom Projektinhaber gelieferte Animation
  (`bench-bb-flat-whiteclean.gif`, `bench-bb-flat-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären.

## Trizeps-Bankdrücken mit Kurzhanteln: neue Animation (25.09.2026)

- "Trizeps-Bankdrücken mit Kurzhanteln" (`bench-db-triceps`, englisch "Close-grip dumbbell bench press") nutzt eine
  neue, vom Projektinhaber gelieferte Animation (`bench-db-triceps-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor
  der Veröffentlichung zu klären. Die frühere Fassung liegt in der Git-Historie.

## Liegestütze eng: neue Animation (25.09.2026)

- "Liegestütze eng" (`pushup-close`, englisch "Close-grip push-up") nutzt eine neue, vom Projektinhaber gelieferte
  Animation (`pushup-close-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären.
  Die frühere Fassung liegt in der Git-Historie.

## Kabel-Curl: neue Animation (25.09.2026)

- "Kabel-Curl" (`curl-cable`, englisch "Cable curl") nutzt eine neue, vom Projektinhaber gelieferte Animation
  (`curl-cable-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären. Die frühere
  Fassung liegt in der Git-Historie.

## Schrägbankdrücken (Kurzhantel): neue Animation (25.09.2026)

- "Schrägbankdrücken (Kurzhantel)" (`incline-db`, englisch "Incline dumbbell press") nutzt eine neue, vom
  Projektinhaber gelieferte Animation (`incline-db-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der
  Veröffentlichung zu klären. Die frühere Fassung liegt in der Git-Historie.

## Latzug breit zur Brust: neue Animation (25.09.2026)

- "Latzug breit zur Brust" (`latpull-wide-chest`, englisch "Wide-grip lat pulldown") nutzt eine neue, vom
  Projektinhaber gelieferte Animation (`latpull-wide-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der
  Veröffentlichung zu klären. Die frühere Fassung liegt in der Git-Historie.

## Langhantelrudern: neue Animation (25.09.2026)

- "Langhantelrudern" (`row-bb`, englisch "Barbell row") nutzt eine neue, vom Projektinhaber gelieferte Animation
  (`row-bb-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären. Die frühere Fassung
  liegt in der Git-Historie.

## Kurzhantelrudern (einarmig): neue Animation (25.09.2026)

- "Kurzhantelrudern (einarmig)" (`row-db`, englisch "Single-arm dumbbell row") nutzt eine neue, vom Projektinhaber
  gelieferte Animation (`row-db-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären.
  Die frühere Fassung liegt in der Git-Historie.

## Trizepsdrücken Langhantel: neue Übung (25.09.2026)

- "Trizepsdrücken Langhantel" (`triceps-bb-overhead`, englisch "Barbell triceps extension") nutzt eine vom
  Projektinhaber gelieferte Animation (`triceps-bb-overhead-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der
  Veröffentlichung zu klären.

## Klimmzüge: neue Animation (25.09.2026)

- "Klimmzüge" (`pullup`, englisch "Pull-up") nutzt eine neue, vom Projektinhaber gelieferte Animation
  (`pullup-whiteclean.gif`, `-dark.gif`). Am unteren Bildrand der Vorlage standen einzelne Pixel einer abgeschnittenen
  Textzeile; sie sind in `tools/dark-gifs.html` (`CLEAR_RECT`) entfernt. Die Herkunft ist vor der Veröffentlichung zu
  klären. Die frühere Fassung liegt in der Git-Historie.

## Beinpresse: neue Übung und neue Muskelgruppe "Beine" (25.09.2026)

- "Beinpresse" (`leg-press`, englisch "Leg press") nutzt eine vom Projektinhaber gelieferte Animation
  (`leg-press-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären.
- Mit ihr kommt die Muskelgruppe "Beine" (`legs`) dazu. Die Muskelkarte (Figur nur bis zu den Shorts) hat keine
  Beinzone; dort erscheint nur der Name in der Legende.

## Kabel-Fliegende: neue Animation (25.09.2026)

- "Kabel-Fliegende" (`fly-cable`, englisch "Cable fly") nutzt eine neue, vom Projektinhaber gelieferte Animation
  (`fly-cable-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu klären. Die frühere Fassung
  liegt in der Git-Historie.

## Hängendes Beinheben: neue Animation (25.09.2026)

- "Hängendes Beinheben" (`legraise-hanging-station`, Klimmzugstation, englisch "Hanging leg raise") nutzt eine neue,
  vom Projektinhaber gelieferte Animation (`legraise-hanging-station-whiteclean.gif`, `-dark.gif`). Die Herkunft ist
  vor der Veröffentlichung zu klären. Die frühere Fassung liegt in der Git-Historie. "Beinheben (hängend)"
  (`legraise`, Klimmzugstange) behält seine bisherige Animation.

## Crunches am Kabelzug stehend: neue Übung (25.09.2026)

- "Crunches am Kabelzug stehend" (`cable-crunch-standing`, englisch "Standing cable crunch") nutzt eine vom
  Projektinhaber gelieferte Animation (`crunch-cable-standing-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der
  Veröffentlichung zu klären. Die kniende Variante "Crunches am Kabelzug" (`cable-crunch`) bleibt unverändert.

## Rudern am Kabelzug (oberer Rücken): neue Übung (25.09.2026)

- "Rudern am Kabelzug (oberer Rücken)" (`row-cable-upper`, englisch "Cable row (upper back)") nutzt eine vom
  Projektinhaber gelieferte Animation (`row-cable-upper-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der
  Veröffentlichung zu klären. "Kabelrudern (sitzend)" (`row-cable`) bleibt unverändert.

## Stirndrücken am Kabelzug: neue Übung (25.09.2026)

- "Stirndrücken am Kabelzug" (`skullcrusher-cable`, englisch "Cable skull crusher") nutzt eine vom Projektinhaber
  gelieferte Animation (`skullcrusher-cable-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung
  zu klären. "Stirndrücken (French Press)" (`skullcrusher`) und "Trizepsdrücken am Kabelzug liegend" bleiben
  unverändert.


## Kabel-Fliegende (mittlere Brust): neue Übung (25.09.2026)

- "Kabel-Fliegende (mittlere Brust)" (`fly-cable-mid`, englisch "Cable fly (mid chest)") nutzt eine vom Projektinhaber
  gelieferte Animation (`fly-cable-mid-whiteclean.gif`, `-dark.gif`). Die Herkunft ist vor der Veröffentlichung zu
  klären. In `tools/dark-gifs.html` gibt es dafür `lineGrow` (Kabel wirken sonst gestrichelt).
