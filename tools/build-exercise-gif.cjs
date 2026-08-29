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
  const tweenCount = 3;

  fs.mkdirSync(path.dirname(outputBase), { recursive: true });
  fs.mkdirSync(outputBase + '-frames', { recursive: true });

  const sheet = await loadImage(sheetPath);
  const cellWidth = sheet.width / cols;
  const cellHeight = sheet.height / rows;
  const frames = [];

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
    frames.push(new Uint8Array(pixels.buffer.slice(
      pixels.byteOffset, pixels.byteOffset + pixels.byteLength)));
  }

  const encoder = new GifEncoder(frameWidth, frameHeight, { repeat: 0, quality: 10 });
  // Hin und zurück: Der Loop endet wieder im exakten Startbild. Damit entfällt
  // der harte Sprung zwischen zwei separat generierten Lockout-Posen.
  const order = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0];
  const endpoint = new Set([0, 3, 5]);

  function add(index, delay) {
    encoder.addFrame(frames[index], frameWidth, frameHeight, { delay: delay });
  }

  function addTween(from, to, amount) {
    const a = frames[from], b = frames[to];
    const mixed = new Uint8Array(a.length);
    for (let p = 0; p < a.length; p++) {
      mixed[p] = Math.round(a[p] + (b[p] - a[p]) * amount);
    }
    encoder.addFrame(mixed, frameWidth, frameHeight, { delay: 80 });
  }

  for (let step = 0; step < order.length - 1; step++) {
    const from = order[step], to = order[step + 1];
    add(from, endpoint.has(from) ? 650 : 220);
    for (let tween = 1; tween <= tweenCount; tween++) {
      addTween(from, to, tween / (tweenCount + 1));
    }
  }
  add(order[order.length - 1], 650);

  fs.writeFileSync(outputBase + '.gif', encoder.finish());
  encoder.dispose();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
