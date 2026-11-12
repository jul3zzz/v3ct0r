// Builds V3CT0R.zip next to the project folder:
//   index.html   — the single-file application (double-click, offline)
//   courses/<id>/audio/*.mp3 — LEARN voice-overs, when generated (played next to index.html)
//   README.md, LICENSES.md
//   source/      — full source code (without node_modules / dist / .env / MP3)
// Run `npm run build` first (npm run package does both).
import { zipSync, strToU8 } from 'fflate';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'index.html');
if (!existsSync(dist)) {
  console.error('✕ dist/index.html introuvable — lancer "npm run build".');
  process.exit(1);
}
const out = join(root, '..', 'V3CT0R.zip');
const SKIP = new Set(['node_modules', 'dist', 'release', '.git', '.vite', 'voice-samples', '.temp', '.branches', 'dist-smoke']);
const files = {};
const add = (abs, rel) => (files[rel] = [readFileSync(abs), { level: 9 }]);

add(dist, 'index.html');
add(join(root, 'README.md'), 'README.md');
add(join(root, 'LICENSES.md'), 'LICENSES.md');

// LEARN voice-overs: next to index.html (courses/<id>/audio/*.mp3), stored without recompression
let mp3 = 0;
const distCourses = join(root, 'dist', 'courses');
if (existsSync(distCourses))
  for (const id of readdirSync(distCourses)) {
    const dir = join(distCourses, id, 'audio');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir))
      if (f.endsWith('.mp3')) {
        files[`courses/${id}/audio/${f}`] = [readFileSync(join(dir, f)), { level: 0 }];
        mp3++;
      }
  }

// never ship secrets: .env, .env.local… (only .env.example, which has no value)
const secret = (name) => name.startsWith('.env') && name !== '.env.example';
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.endsWith('.zip') || secret(name)) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs);
    // the MP3 are already at the root of the zip; source/ keeps their alignment JSON
    else if (!name.endsWith('.mp3')) add(abs, 'source/' + relative(root, abs).split(sep).join('/'));
  }
};
walk(root);
if (Object.keys(files).some((k) => /(^|\/)\.env(\.local)?$/.test(k))) {
  console.error('✕ un fichier .env se retrouverait dans le zip : arrêt.');
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
files['LISEZ-MOI.txt'] = [
  strToU8(
    // BOM: lets older Windows viewers detect UTF-8 (accents)
    `﻿V3CT0R — ${stamp}\r\n\r\n` +
      `Double-cliquez sur index.html pour lancer l'application (hors ligne, aucun serveur).\r\n` +
      `Navigateurs : Chrome, Edge ou Firefox récents (WebGL2).\r\n` +
      `Code source complet dans le dossier source/ (voir README.md).\r\n`,
  ),
  { level: 9 },
];
const zip = zipSync(files);
writeFileSync(out, zip);
const n = Object.keys(files).length;
console.log(`✓ ${out} — ${n} fichiers (${mp3} voix off MP3), ${(zip.length / 1024 / 1024).toFixed(2)} Mo`);
