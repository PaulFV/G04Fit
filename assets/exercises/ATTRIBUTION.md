# Exercise animation attribution

- The negative-bench reference was supplied by the project owner and bears the visible `fitundattraktiv.de` attribution. The original reference file is intentionally not redistributed in this repository.
- The machine chest fly animation (`butterfly-avatar-whiteclean.gif`, supplied by the
  project owner) carries the visible `fitundattraktiv.de` attribution at the bottom.
  The dark variant (`butterfly-avatar-dark.gif`) keeps that notice: the converter in
  `tools/dark-gifs.html` has a `NOTICE` entry for this file so the light grey text is
  redrawn on the dark background instead of being dropped with the white background.

## Wasserzeichen (25.09.2026)

- Die Übungs-GIFs sind unverändert. Das Wasserzeichen (PF-Logo, `assets/exercises/watermark-logo.png`,
  von der Avatar-Hose nachgezeichnet, mit der Zeile "© 2026 G04Fit") liegt in der App als Ebene unten rechts
  in der Ecke des Bildfelds (`figure()` in `js/anim.js`, `.fig__mark` in `css/anim.css`). Größe und
  Schrift folgen der Feldbreite, deshalb passt es auf Desktop, iPhone und Android; in kleinen Kacheln
  der Übungsliste bleibt nur das Logo. Es ist nicht in die GIF-Dateien eingebrannt.
- Die Animationen stammen ursprünglich von fitundattraktiv.de. Ob das Wasserzeichen mit eigenem
  Logo und Copyright darauf erlaubt ist, muss der Projektinhaber mit dem Rechteinhaber klären, bevor
  die App veröffentlicht wird.
