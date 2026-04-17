#!/usr/bin/env node
/* Generate the Electron app icon as a 256x256 PNG using pure Node (no deps).
 * Called once at install-time; the resulting `icon.png` is committed.
 */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const W = 256;
const H = 256;

function crc32(buf) {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const dx = x - W / 2;
    const dy = y - H / 2;
    const d = Math.sqrt(dx * dx + dy * dy);
    const ring = Math.exp(-Math.pow((d - 96) / 6, 2));
    const coreGlow = Math.exp(-Math.pow(d / 40, 2));
    const energy = Math.max(ring, coreGlow * 0.9);

    const r = Math.min(255, Math.round(110 * energy + 12));
    const g = Math.min(255, Math.round(240 * energy + 14));
    const b = Math.min(255, Math.round(255 * energy + 24));

    const off = y * (W * 4 + 1) + 1 + x * 4;
    raw[off] = r;
    raw[off + 1] = g;
    raw[off + 2] = b;
    raw[off + 3] = 255;
  }
}

const idat = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync(path.join(__dirname, 'icon.png'), png);
console.log('✓ wrote icon.png', png.length, 'bytes');
