/* Baut das Wasserzeichen der Übungs-GIFs: PF-Logo mit Copyright-Zeile daneben.
   Aufruf: node tools/build-watermark.cjs ["© 2026 G04Fit"]
   Eingang: assets/exercises/watermark-logo.png (Logo, von der Avatar-Hose nachgezeichnet)
   Ausgang: assets/exercises/watermark.png (vierfache Auflösung, wird auf 26 px Höhe verkleinert)
   Benötigt: npm install @napi-rs/canvas */
const fs = require('fs'), path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const ROOT = path.join(__dirname, '..');
const TEXT = process.argv[2] || '\u00A9 2026 G04Fit';
(async () => {
  const logo = await loadImage(path.join(ROOT, 'assets/exercises/watermark-logo.png'));
  const H = 104, LW = Math.round(H * logo.width / logo.height), GAP = 18, FONT = 34;
  const probe = createCanvas(10, 10).getContext('2d');
  probe.font = 'bold ' + FONT + 'px Arial, sans-serif';
  const tw = Math.ceil(probe.measureText(TEXT).width);
  const c = createCanvas(LW + GAP + tw + 6, H), x = c.getContext('2d');
  x.drawImage(logo, 0, 0, LW, H);
  x.font = 'bold ' + FONT + 'px Arial, sans-serif';
  x.fillStyle = '#c4c5ca';
  x.textBaseline = 'middle';
  x.fillText(TEXT, LW + GAP, H * 0.56);
  fs.writeFileSync(path.join(ROOT, 'assets/exercises/watermark.png'), c.toBuffer('image/png'));
  console.log('watermark.png', c.width + 'x' + c.height, TEXT);
})();
