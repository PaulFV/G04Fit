/* Build a looping exercise GIF and individual PNG frames from an exact sprite grid.
   Usage: node build-exercise-gif.cjs <sheet> <output-base> [cols] [rows]
   Requires @napi-rs/canvas (provided by the Codex workspace runtime). */
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, GifEncoder } = require('@napi-rs/canvas');

async function main() {
  const sheetPath = path.resolve(process.argv[2]);
  const outputBase = path.resolve(process.argv[3]);
  const cols = Number(process.argv[4] || 3);
  const rows = Number(process.argv[5] || 2);
  const frameWidth = 512;
  const frameHeight = 512;
  // Langsamer Lehrmodus: Umkehrpunkte bewusst länger zeigen.
  const hold = [900, 550, 550, 900, 550, 550];

  fs.mkdirSync(path.dirname(outputBase), { recursive: true });
  fs.mkdirSync(outputBase + '-frames', { recursive: true });

  const sheet = await loadImage(sheetPath);
  const cellWidth = sheet.width / cols;
  const cellHeight = sheet.height / rows;
  const encoder = new GifEncoder(frameWidth, frameHeight, { repeat: 0, quality: 8 });

  for (let index = 0; index < cols * rows; index++) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const canvas = createCanvas(frameWidth, frameHeight);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Sprite-Zellen sind quadratisch. Seitenverhältnis beibehalten, damit
    // Geräte und Körper weder gestaucht noch zwischen Ansichten beschnitten werden.
    ctx.fillStyle = '#07090b';
    ctx.fillRect(0, 0, frameWidth, frameHeight);
    const scale = Math.min(frameWidth / cellWidth, frameHeight / cellHeight);
    const drawWidth = cellWidth * scale;
    const drawHeight = cellHeight * scale;
    ctx.drawImage(sheet, col * cellWidth, row * cellHeight, cellWidth, cellHeight,
      (frameWidth - drawWidth) / 2, (frameHeight - drawHeight) / 2, drawWidth, drawHeight);
    const framePath = path.join(outputBase + '-frames',
      String(index + 1).padStart(2, '0') + '.png');
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
    const pixels = ctx.getImageData(0, 0, frameWidth, frameHeight).data;
    const rgba = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
    encoder.addFrame(rgba, frameWidth, frameHeight, { delay: hold[index] || 170 });
  }

  fs.writeFileSync(outputBase + '.gif', encoder.finish());
  encoder.dispose();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
