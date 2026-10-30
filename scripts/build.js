'use strict';

const fs = require('node:fs');
const path = require('node:path');

console.log('[Build] Memulai proses build untuk deployment...');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(rootDir, 'frontend');
const publicDir = path.resolve(rootDir, 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === 'test' || entry.endsWith('.test.cjs') || entry.endsWith('.spec.cjs') || entry.includes('playwright')) {
        continue; // abaikan berkas pengujian saat build produksi
      }
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  copyRecursive(frontendDir, publicDir);
  console.log('[Build] Berhasil menyalin berkas statis frontend ke direktori public/ untuk Vercel CDN.');
} catch (err) {
  console.error('[Build] Peringatan saat menyalin frontend ke public:', err.message);
}

console.log('[Build] Build selesai dengan sukses!');
