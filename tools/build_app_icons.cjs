/* ============================================================
   G04Fit — App-Icons aus einem Logo erzeugen
   ------------------------------------------------------------
   Erzeugt aus einer Vorlage die Icon-Groessen fuer Web-App,
   iPhone-Homescreen und Android (inklusive maskable).

   Bewusst ohne Fremdbibliothek: PNG wird mit dem eingebauten
   zlib gelesen und geschrieben. So laeuft das Werkzeug auf
   jedem Rechner, auf dem Node installiert ist.

     node tools/build_app_icons.cjs <quelle.png> <zielordner> [v4]
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- CRC32 fuer PNG-Chunks ---------- */

const CRC_TABLE = (function () {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/* ---------- PNG lesen ---------- */

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function decodePng(buf) {
  if (!buf.slice(0, 8).equals(SIGNATURE)) throw new Error('Keine PNG-Datei.');

  let width = 0, height = 0, depth = 0, colorType = 0, interlace = 0;
  let palette = null, transparency = null;
  const idat = [];

  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') transparency = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }

  if (depth !== 8) throw new Error('Nur 8 Bit je Kanal moeglich, gefunden: ' + depth);
  if (interlace !== 0) throw new Error('Interlaced PNG wird nicht unterstuetzt.');

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error('Unbekannter PNG-Farbtyp: ' + colorType);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);

  // Zeilenfilter zuruecknehmen (PNG-Spezifikation, Abschnitt 9).
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.slice(pos, pos + stride);
    pos += stride;
    const cur = pixels.slice(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.slice((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) {
        throw new Error('Unbekannter Zeilenfilter: ' + filter);
      }
      cur[x] = v & 0xff;
    }
  }

  // Alles auf RGBA vereinheitlichen.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    let r, g, b, a = 255;
    const s = i * bpp;
    if (colorType === 0) { r = g = b = pixels[s]; }
    else if (colorType === 2) { r = pixels[s]; g = pixels[s + 1]; b = pixels[s + 2]; }
    else if (colorType === 3) {
      const idx = pixels[s];
      r = palette[idx * 3]; g = palette[idx * 3 + 1]; b = palette[idx * 3 + 2];
      if (transparency && idx < transparency.length) a = transparency[idx];
    }
    else if (colorType === 4) { r = g = b = pixels[s]; a = pixels[s + 1]; }
    else { r = pixels[s]; g = pixels[s + 1]; b = pixels[s + 2]; a = pixels[s + 3]; }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }

  return { width: width, height: height, data: rgba };
}

/* ---------- PNG schreiben ---------- */

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.slice(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(img) {
  const width = img.width, height = img.height, data = img.data;
  const stride = width * 3;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // Filter 0 — die Flaechen sind ohnehin glatt.
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4;
      const d = y * (stride + 1) + 1 + x * 3;
      raw[d] = data[s]; raw[d + 1] = data[s + 1]; raw[d + 2] = data[s + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- Bildoperationen ---------- */

function crop(img, left, top, w, h) {
  const out = { width: w, height: h, data: Buffer.alloc(w * h * 4) };
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.max(0, top + y));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.max(0, left + x));
      const s = (sy * img.width + sx) * 4;
      img.data.copy(out.data, (y * w + x) * 4, s, s + 4);
    }
  }
  return out;
}

// Flaechenmittelung: liefert beim starken Verkleinern deutlich
// ruhigere Kanten als eine einfache Punktabtastung.
function resize(img, w, h) {
  const out = { width: w, height: h, data: Buffer.alloc(w * h * 4) };
  const sx = img.width / w, sy = img.height / h;
  for (let y = 0; y < h; y++) {
    const y0 = y * sy, y1 = (y + 1) * sy;
    for (let x = 0; x < w; x++) {
      const x0 = x * sx, x1 = (x + 1) * sx;
      let r = 0, g = 0, b = 0, a = 0, weight = 0;
      for (let iy = Math.floor(y0); iy < Math.min(img.height, Math.ceil(y1)); iy++) {
        const wy = Math.min(y1, iy + 1) - Math.max(y0, iy);
        if (wy <= 0) continue;
        for (let ix = Math.floor(x0); ix < Math.min(img.width, Math.ceil(x1)); ix++) {
          const wx = Math.min(x1, ix + 1) - Math.max(x0, ix);
          if (wx <= 0) continue;
          const k = wy * wx, s = (iy * img.width + ix) * 4;
          r += img.data[s] * k; g += img.data[s + 1] * k; b += img.data[s + 2] * k;
          a += img.data[s + 3] * k; weight += k;
        }
      }
      const d = (y * w + x) * 4;
      out.data[d] = Math.round(r / weight);
      out.data[d + 1] = Math.round(g / weight);
      out.data[d + 2] = Math.round(b / weight);
      out.data[d + 3] = Math.round(a / weight);
    }
  }
  return out;
}

function filled(size, rgb) {
  const out = { width: size, height: size, data: Buffer.alloc(size * size * 4) };
  for (let i = 0; i < size * size; i++) {
    out.data[i * 4] = rgb[0]; out.data[i * 4 + 1] = rgb[1];
    out.data[i * 4 + 2] = rgb[2]; out.data[i * 4 + 3] = 255;
  }
  return out;
}

function paste(target, src, left, top) {
  for (let y = 0; y < src.height; y++) {
    const ty = top + y;
    if (ty < 0 || ty >= target.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = left + x;
      if (tx < 0 || tx >= target.width) continue;
      const s = (y * src.width + x) * 4, d = (ty * target.width + tx) * 4;
      const a = src.data[s + 3] / 255;
      for (let c = 0; c < 3; c++) {
        target.data[d + c] = Math.round(src.data[s + c] * a + target.data[d + c] * (1 - a));
      }
      target.data[d + 3] = 255;
    }
  }
  return target;
}

// Begrenzungsrahmen des sichtbaren Motivs. Das Logo steht auf
// Schwarz, deshalb zaehlt jedes Pixel oberhalb der Schwelle.
function contentBox(img, threshold) {
  let minX = img.width, minY = img.height, maxX = -1, maxY = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const s = (y * img.width + x) * 4;
      if (img.data[s + 3] < 8) continue;
      const lum = 0.299 * img.data[s] + 0.587 * img.data[s + 1] + 0.114 * img.data[s + 2];
      if (lum < threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { left: 0, top: 0, width: img.width, height: img.height };
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

// Quadratischer Ausschnitt um das Motiv, Rand in Anteilen der Motivkante.
function squareAroundContent(img, padding) {
  const box = contentBox(img, 24);
  const edge = Math.round(Math.max(box.width, box.height) * (1 + padding * 2));
  const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  return crop(img, Math.round(cx - edge / 2), Math.round(cy - edge / 2), edge, edge);
}

/* ---------- Ablauf ---------- */

function main() {
  const source = process.argv[2];
  const output = process.argv[3];
  const tag = process.argv[4] || 'v4';

  if (!source || !output) {
    console.error('Aufruf: node tools/build_app_icons.cjs <quelle.png> <zielordner> [v4]');
    process.exit(1);
  }
  fs.mkdirSync(output, { recursive: true });

  const src = decodePng(fs.readFileSync(source));
  console.log('Quelle: ' + src.width + 'x' + src.height);

  // Das Logo bringt viel schwarzen Rand mit. Eng am Motiv geschnitten
  // wirkt es auf dem Homescreen so kraeftig wie die Vorgaengerversion.
  const tight = squareAroundContent(src, 0.035);
  const master = resize(tight, 1024, 1024);

  function write(name, img) {
    const file = path.join(output, name);
    fs.writeFileSync(file, encodePng(img));
    console.log('  ' + name + '  ' + img.width + 'x' + img.height +
      '  ' + Math.round(fs.statSync(file).size / 1024) + ' kB');
  }

  write('g04fit-icon-master-' + tag + '.png', master);
  write('icon-' + tag + '-180.png', resize(master, 180, 180));
  write('icon-' + tag + '-192.png', resize(master, 192, 192));
  write('icon-' + tag + '-512.png', resize(master, 512, 512));

  // Android schneidet bei adaptiven Icons bis zu 20 Prozent am Rand weg.
  // Das Motiv bleibt deshalb in der inneren Schutzzone, der Rest ist
  // schwarz wie der Logohintergrund.
  const safe = 336; // 512 * 0.656 — Motiv vollstaendig im Kreisausschnitt
  const maskable = paste(filled(512, [0, 0, 0]), resize(master, safe, safe),
    Math.round((512 - safe) / 2), Math.round((512 - safe) / 2));
  write('icon-' + tag + '-maskable-512.png', maskable);
}

main();
