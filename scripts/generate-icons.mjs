/* ============================================================================
 * generate-icons.mjs — 为 Deutsch Copy PWA 生成占位图标
 *
 * 用法：node scripts/generate-icons.mjs
 *
 * 生成：
 *   icons/icon-192.png — 192×192 PWA 图标
 *   icons/icon-512.png — 512×512 PWA 图标
 *
 * 设计：
 *   - 圆角方形背景，使用 BR-Theme accent 色 #C2513B
 *   - 中央白色 "DC" 字样（用像素块近似）
 *   - 无需第三方依赖
 * ============================================================================ */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ============================================================================
// PNG 构建工具
// ============================================================================

function crc32(buf) {
  // CRC-32 as used in PNG
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const combined = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcVal]);
}

// ============================================================================
// 图标绘制
// ============================================================================

// BR-Theme 颜色
const ACCENT = { r: 0xC2, g: 0x51, b: 0x3B };   // #C2513B
const LIGHTER = { r: 0xD9, g: 0x6E, b: 0x5A };    // lighter accent
const WHITE = { r: 255, g: 255, b: 255 };
const BG = { r: 0xF5, g: 0xF0, b: 0xE8 };         // #F5F0E8

function fillRect(pixels, w, x, y, rw, rh, color) {
  for (let py = y; py < y + rh && py < w; py++) {
    for (let px = x; px < x + rw && px < w; px++) {
      const i = (py * w + px) * 4;
      pixels[i] = color.r;
      pixels[i + 1] = color.g;
      pixels[i + 2] = color.b;
      pixels[i + 3] = 255;
    }
  }
}

function fillRoundedRect(pixels, w, x, y, rw, rh, radius, color) {
  // Simple rounded rect: just fill the whole rect, then clip corners
  // For simplicity at these resolutions, just draw a full rect
  fillRect(pixels, w, x, y, rw, rh, color);
  // Round corners by clearing corner pixels
  for (let py = 0; py < radius; py++) {
    for (let px = 0; px < radius; px++) {
      const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
      if (dist > radius) {
        // Top-left
        if (x + px < w && y + py < w) {
          const i = ((y + py) * w + (x + px)) * 4;
          pixels[i + 3] = 0;
        }
        // Top-right
        if (x + rw - 1 - px >= 0 && x + rw - 1 - px < w && y + py < w) {
          const i = ((y + py) * w + (x + rw - 1 - px)) * 4;
          pixels[i + 3] = 0;
        }
        // Bottom-left
        if (x + px < w && y + rh - 1 - py >= 0 && y + rh - 1 - py < w) {
          const i = (((y + rh - 1 - py) * w) + (x + px)) * 4;
          pixels[i + 3] = 0;
        }
        // Bottom-right
        if (x + rw - 1 - px >= 0 && x + rw - 1 - px < w && y + rh - 1 - py >= 0 && y + rh - 1 - py < w) {
          const i = (((y + rh - 1 - py) * w) + (x + rw - 1 - px)) * 4;
          pixels[i + 3] = 0;
        }
      }
    }
  }
}

// Draw letter "D" using pixel blocks
function drawLetterD(pixels, w, cx, cy, size, color) {
  const thick = Math.max(1, Math.floor(size / 5));
  const hw = Math.floor(size / 2);
  const hh = Math.floor(size * 0.7);
  // Vertical bar (left)
  fillRect(pixels, w, cx - hw, cy - hh, thick, hh * 2, color);
  // Top bar
  fillRect(pixels, w, cx - hw, cy - hh, hw, thick, color);
  // Bottom bar
  fillRect(pixels, w, cx - hw, cy + hh - thick, hw, thick, color);
  // Right bar (curved approximation with vertical line)
  fillRect(pixels, w, cx + hw - thick, cy - hh + thick, thick, hh * 2 - thick * 2, color);
}

// Draw letter "C" using pixel blocks
function drawLetterC(pixels, w, cx, cy, size, color) {
  const thick = Math.max(1, Math.floor(size / 5));
  const hw = Math.floor(size / 2);
  const hh = Math.floor(size * 0.7);
  // Left vertical bar
  fillRect(pixels, w, cx - hw, cy - hh + thick, thick, hh * 2 - thick * 2, color);
  // Top bar
  fillRect(pixels, w, cx - hw, cy - hh, hw, thick, color);
  // Bottom bar
  fillRect(pixels, w, cx - hw, cy + hh - thick, hw, thick, color);
}

function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4, 0);

  // Background: rounded rect with accent color
  const margin = Math.floor(size * 0.08);
  const radius = Math.floor(size * 0.16);
  fillRoundedRect(pixels, size, margin, margin, size - margin * 2, size - margin * 2, radius, ACCENT);

  // Inner subtle border highlight
  const innerMargin = margin + Math.floor(size * 0.03);
  const innerSize = size - innerMargin * 2;
  // Draw "DC" text in white, centered
  const fontSize = Math.floor(size * 0.32);
  const gap = Math.floor(size * 0.08);
  const totalWidth = fontSize * 2 + gap;
  const startX = Math.floor(size / 2) - Math.floor(totalWidth / 2);
  const centerY = Math.floor(size / 2);

  // D
  drawLetterD(pixels, size, startX + Math.floor(fontSize / 2), centerY, fontSize, WHITE);
  // C
  drawLetterC(pixels, size, startX + Math.floor(fontSize / 2) + fontSize + gap, centerY, fontSize, WHITE);

  return pixels;
}

function encodePng(pixels, width, height) {
  // Build raw image data with filter bytes
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter: none
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rawData.push(pixels[i]);     // R
      rawData.push(pixels[i + 1]); // G
      rawData.push(pixels[i + 2]); // B
      rawData.push(pixels[i + 3]); // A
    }
  }

  const compressed = deflateSync(Buffer.from(rawData));

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG signature

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = pngChunk('IHDR', ihdrData);
  const idat = pngChunk('IDAT', compressed);
  const iend = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// ============================================================================
// 主入口
// ============================================================================

function main() {
  const iconsDir = join(ROOT, 'icons');
  mkdirSync(iconsDir, { recursive: true });

  const sizes = [192, 512];

  for (const size of sizes) {
    console.log(`[生成] icon-${size}.png (${size}×${size})...`);
    const pixels = renderIcon(size);
    const png = encodePng(pixels, size, size);
    const filePath = join(iconsDir, `icon-${size}.png`);
    writeFileSync(filePath, png);
    console.log(`  ✅ 已保存: icons/icon-${size}.png (${png.length} bytes)`);
  }

  console.log('\nPWA 图标生成完成。');
}

main();
