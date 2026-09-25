# Exercise animation attribution

- The negative-bench reference was supplied by the project owner and bears the visible `fitundattraktiv.de` attribution. The original reference file is intentionally not redistributed in this repository.
- The machine chest fly animation (`butterfly-avatar-whiteclean.gif`, supplied by the
  project owner) carries the visible `fitundattraktiv.de` attribution at the bottom.
  The dark variant (`butterfly-avatar-dark.gif`) keeps that notice: the converter in
  `tools/dark-gifs.html` has a `NOTICE` entry for this file so the light grey text is
  redrawn on the dark background instead of being dropped with the white background.

## Wasserzeichen (25.09.2026)

- Alle hellen und dunklen Übungs-GIFs tragen unten rechts in der Ecke ein Wasserzeichen aus PF-Logo und der Zeile
  "© 2026 G04Fit" (`assets/exercises/watermark.png`, gebaut mit `tools/build-watermark.cjs`; das Logo ist
  von der Avatar-Hose nachgezeichnet, `assets/exercises/watermark-logo.png`). Beim Chest Fly (butterfly-avatar)
  sitzt es direkt über dem Herkunftshinweis der Vorlage, damit der lesbar bleibt (`tools/watermark-corners.json`).
  Die Figuren selbst sind unverändert.
- Die Vorlagen ohne Wasserzeichen liegen lokal in `assets/exercises/sources/master/` (nicht im
  Repository, siehe `.gitignore`) und in der Git-Historie. Reihenfolge zum Neuerzeugen:
  `node tools/watermark-gifs.cjs` (hell), danach `tools/dark-gifs.html` mit
  `&src=../assets/exercises/sources/master/` (dunkel; liest die Ecken aus `tools/watermark-corners.json`).
- Die Animationen stammen ursprünglich von fitundattraktiv.de. Ob das Wasserzeichen mit eigenem
  Logo und Copyright darauf erlaubt ist, muss der Projektinhaber mit dem Rechteinhaber klären, bevor
  die App veröffentlicht wird.
