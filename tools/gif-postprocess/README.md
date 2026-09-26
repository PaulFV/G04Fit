# GIF-Nachbearbeitung (dunkle Übungs-GIFs)

Node-Skripte ohne Abhängigkeiten. Sie lesen und schreiben GIFs verlustfrei (gleiche Farben, gleiche Anzeigedauer).

- `clean-dust.cjs [maxPixel] [write]` – setzt winzige, vom Rest getrennte Bildpunkte in allen `assets/exercises/gifs/*-dark.gif`
  auf durchsichtig. Ohne `write` nur Probelauf.
- `pockets.cjs in out minPixel grow lo hi` – setzt einfarbig hellgraue Flächen (Grauwert `lo` bis `hi`, ab `minPixel` Pixeln)
  samt hellem Rand auf durchsichtig. Damit werden eingeschlossene weiße Hintergrundtaschen entfernt, die der Konverter
  `tools/dark-gifs.html` stehen lässt (z. B. `mountain-climber`: 228–232, ab 170 Pixeln; `deadlift-smith`: 226–233, ab 40 Pixeln).
- `spurs.cjs in out minTransparentNachbarn [Durchgänge]` – entfernt hellgraue, fast farblose Randpixel, die von mindestens
  `minTransparentNachbarn` der 8 Nachbarn umgeben sind (ausgefranste helle Kanten). Beispiel: `pullup-wide-overhand` und
  `latpull-wide` mit 5 und 2 Durchgängen.
