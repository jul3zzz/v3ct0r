// App icons from the logo (src/assets/logo/v3ct0r-icon.svg, 256×256 viewBox): each size is rendered by Edge (no
// resampling, crisp 1px lines), then packed into build/icon.ico (Windows: desktop, taskbar,
// installer) plus build/icon.png (512) and the favicon of index.html (the SVG itself, inlined).
// npm run icons
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SVG = readFileSync('src/assets/logo/v3ct0r-icon.svg', 'utf8').trim();
// 24 px and below: the same drawing with thicker lines (legible in the taskbar and the favicon)
const SMALL = readFileSync('src/assets/logo/v3ct0r-icon-small.svg', 'utf8').trim();
const SMALL_MAX = 24;
const SIZES = [16, 20, 24, 32, 40, 48, 64, 128, 256];

mkdirSync('build', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const render = async (n) => {
  await page.setViewportSize({ width: n, height: n });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:#000}svg{display:block;width:${n}px;height:${n}px}</style>${n <= SMALL_MAX ? SMALL : SVG}`);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: n, height: n } });
};
const pngs = [];
for (const n of SIZES) pngs.push(await render(n));
writeFileSync('build/icon.png', await render(512));
// the website installed on a phone (PWA, public/manifest.webmanifest): 192 and 512 px, a « maskable » 512 px
// whose logo stays inside the safe circle (80 %), and the 180 px icon of the iPhone home screen
mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', await render(192));
writeFileSync('public/icons/icon-512.png', await render(512));
writeFileSync('public/icons/apple-touch-icon.png', await render(180));
await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(`<!doctype html><style>html,body{margin:0;background:#000}body{display:grid;place-items:center;width:512px;height:512px}svg{display:block;width:410px;height:410px}</style>${SVG}`);
writeFileSync('public/icons/icon-maskable-512.png', await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 512, height: 512 } }));
await browser.close();

// ICO with PNG entries (Windows Vista and later)
const head = Buffer.alloc(6 + 16 * SIZES.length);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(SIZES.length, 4);
let offset = head.length;
SIZES.forEach((n, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(n >= 256 ? 0 : n, e);
  head.writeUInt8(n >= 256 ? 0 : n, e + 1);
  head.writeUInt8(0, e + 2);
  head.writeUInt8(0, e + 3);
  head.writeUInt16LE(1, e + 4);
  head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(pngs[i].length, e + 8);
  head.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync('build/icon.ico', Buffer.concat([head, ...pngs]));

// favicon: the logo inlined in index.html (single-file build, works over file://)
const html = readFileSync('index.html', 'utf8');
const uri = `data:image/svg+xml,${encodeURIComponent(SMALL.replace(/\s*\n\s*/g, ' '))}`;
const next = html.replace(/<link rel="icon" href="[^"]*" \/>/, `<link rel="icon" href="${uri}" />`);
if (next === html && !html.includes(uri)) throw new Error('index.html: <link rel="icon" …/> not found');
writeFileSync('index.html', next);
console.log(`build/icon.ico (${SIZES.join(', ')} px) · build/icon.png (512 px) · public/icons (PWA : 192, 512, maskable, apple-touch 180) · favicon index.html`);
