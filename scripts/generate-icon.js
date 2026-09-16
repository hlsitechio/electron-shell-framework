// Generates build/icon.png (256x256) + build/icon.ico (PNG-in-ICO)
// Zero-dep: pure Node (zlib for PNG). Logo = rounded steel-blue square
// with three white bars ("app shell" metaphor).
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const SIZE = 256
const BG = [96, 168, 216] // steel blue #60a8d8
const FG = [255, 255, 255]

// --- rounded-rect helper (distance-aware coverage, cheap supersample 2x2) ---
function inRoundedRect(x, y, s, r) {
  // normalized coords inside [0,s]
  const cx = Math.min(Math.max(x, r), s - r)
  const cy = Math.min(Math.max(y, r), s - r)
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function barIn(x, y, s, y0, y1, x0, x1, radius) {
  // rounded horizontal bar from x0..x1, y0..y1 (fraction of s)
  const bx0 = x0 * s,
    bx1 = x1 * s,
    by0 = y0 * s,
    by1 = y1 * s
  const brad = radius * s
  if (x < bx0 + brad && x > bx0 && !inRoundedRect(x, y - by0, brad, brad)) return false
  if (x > bx1 - brad && x < bx1 && !inRoundedRect(x - (bx1 - brad), y - by0, brad, brad))
    return false
  return x >= bx0 && x <= bx1 && y >= by0 && y <= by1
}

function pixel(x, y) {
  // supersample 2x2
  let hits = 0
  for (const [ox, oy] of [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75]
  ]) {
    const px2 = x + ox,
      py2 = y + oy
    if (!inRoundedRect(px2, py2, SIZE, 48)) continue
    // three bars (app shell): widths vary
    const bars = [
      [0.2, 0.8, 0.22, 0.35, 0.03],
      [0.26, 0.74, 0.43, 0.56, 0.03],
      [0.2, 0.8, 0.64, 0.77, 0.03]
    ]
    let fg = false
    for (const [a, b, c, d, r] of bars) {
      if (barIn(px2, py2, SIZE, c, d, a, b, r)) {
        fg = true
        break
      }
    }
    if (fg) hits++
  }
  return hits === 4 ? FG : hits > 0 ? blend() : BG
  function blend() {
    const t = hits / 4
    return [
      Math.round(BG[0] + (FG[0] - BG[0]) * t),
      Math.round(BG[1] + (FG[1] - BG[1]) * t),
      Math.round(BG[2] + (FG[2] - BG[2]) * t)
    ]
  }
}

// --- PNG encode ---
const rows = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  rows[y * (SIZE * 4 + 1)] = 0 // filter none
  for (let x = 0; x < SIZE; x++) {
    const [r, g, b] = pixel(x, y)
    const off = y * (SIZE * 4 + 1) + 1 + x * 4
    rows[off] = r
    rows[off + 1] = g
    rows[off + 2] = b
    rows[off + 3] = 255
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function crc32(buf) {
  let table = crc32.table
  if (!table) {
    table = crc32.table = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return c ^ 0xffffffff
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type RGBA
const idat = zlib.deflateSync(rows)
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
])

const buildDir = path.join(__dirname, '..', 'build')
fs.mkdirSync(buildDir, { recursive: true })
fs.writeFileSync(path.join(buildDir, 'icon.png'), png)

// --- ICO wrapping the PNG (256x256 entry) ---
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(1, 4) // count
const entry = Buffer.alloc(16)
entry[0] = 0 // width 256 -> 0
entry[1] = 0 // height 256 -> 0
entry[2] = 0 // colors
entry[3] = 0 // reserved
entry.writeUInt16LE(1, 4) // planes
entry.writeUInt16LE(32, 6) // bpp
entry.writeUInt32LE(png.length, 8)
entry.writeUInt32LE(22, 12) // offset (6 + 16)
fs.writeFileSync(path.join(buildDir, 'icon.ico'), Buffer.concat([header, entry, png]))

console.log('✓ build/icon.png + build/icon.ico generated (256x256)')
