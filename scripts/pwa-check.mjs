// The website installed on a phone (PWA): serves dist/ over http (vite preview, a free port), then in Edge
// headless checks the manifest and its icons, the service worker and what it keeps, and that the app opens and
// plays a course voice with the network cut. The smoke runs in file://, where none of this exists.
//   node scripts/pwa-check.mjs
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const server = await preview({ preview: { port: 0, host: '127.0.0.1' }, logLevel: 'silent' });
const url = server.resolvedUrls?.local?.[0];
if (!url) throw new Error('vite preview: no URL');
const errors = [];
const out = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  // an Android phone: TÉLÉCHARGER becomes INSTALLER, the way in offers the install steps
  const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';
  {
    const first = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, userAgent: ANDROID });
    const p = await first.newPage();
    p.on('pageerror', (e) => errors.push(`[accueil] pageerror: ${e.message}`));
    await p.goto(url);
    await p.waitForSelector('.wl-card .in-steps li', { timeout: 20000 });
    const wl = await p.evaluate(() => ({ title: document.querySelector('.wl-title')?.textContent ?? '', steps: document.querySelectorAll('.wl-card .in-steps li').length, tabs: [...document.querySelectorAll('.wl-card .in-tab')].map((t) => t.textContent) }));
    if (!/téléphone/.test(wl.title) || wl.steps !== 4 || wl.tabs.join('|') !== 'ANDROID|IPHONE · IPAD') errors.push(`accueil téléphone : ${JSON.stringify(wl)}`);
    out.push(`accueil « ${wl.title} » · ${wl.steps} étapes`);
    await first.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, userAgent: ANDROID });
  await ctx.addInitScript(() => {
    localStorage.setItem('vector-math.e2e', 'true');
    localStorage.setItem('vector-math.intro.seen', 'true');
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console.error: ${m.text()}`));
  await page.goto(url);
  await page.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 20000 });

  // the manifest: linked over http, valid, its icons served
  const man = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return { error: 'no <link rel="manifest">' };
    const m = await (await fetch(link.href)).json();
    const icons = await Promise.all(m.icons.map(async (i) => ({ src: i.src, sizes: i.sizes, purpose: i.purpose, ok: (await fetch(new URL(i.src, link.href))).ok })));
    const apple = document.querySelector('link[rel="apple-touch-icon"]');
    return { name: m.name, display: m.display, start: m.start_url, icons, apple: apple ? (await fetch(apple.href)).ok : false };
  });
  if (man.error) errors.push(`manifest: ${man.error}`);
  else {
    if (man.name !== 'V3CT0R' || man.display !== 'standalone' || man.start !== './') errors.push(`manifest: ${JSON.stringify(man)}`);
    if (!man.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable') || !man.icons.some((i) => i.sizes === '192x192') || man.icons.some((i) => !i.ok)) errors.push(`manifest icons: ${JSON.stringify(man.icons)}`);
    if (!man.apple) errors.push('apple-touch-icon not served');
    out.push(`manifeste ${man.name} · ${man.icons.length} icônes · apple-touch ok`);
  }

  // INSTALLER (top bar): the tutorial, Android first, then the iPhone / iPad steps
  const tb = await page.evaluate(() => document.querySelector('.tb-dl')?.textContent ?? '');
  await page.tap('.tb-dl');
  await page.waitForSelector('.dlg .in-steps li', { timeout: 5000 });
  const android = await page.evaluate(() => [...document.querySelectorAll('.dlg .in-steps li')].map((l) => l.textContent).join(' '));
  await page.tap('.dlg .in-tab:nth-child(2)');
  const ios = await page.evaluate(() => [...document.querySelectorAll('.dlg .in-steps li')].map((l) => l.textContent).join(' '));
  const fits = await page.evaluate(() => {
    const d = document.querySelector('.dlg').getBoundingClientRect();
    return d.left >= 0 && d.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth;
  });
  if (tb !== 'INSTALLER' || !/⋮/.test(android) || !/Safari.*Partager/.test(ios) || !fits) errors.push(`tuto d'installation : bouton « ${tb} » · android ${/⋮/.test(android)} · iphone ${/Safari.*Partager/.test(ios)} · tient dans l'écran ${fits}`);
  out.push(`bouton ${tb} → tuto Android + iPhone`);
  await page.keyboard.press('Escape');

  // the service worker: active, controlling the page, every file kept
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => window.__vm?.ready === true && !!navigator.serviceWorker.controller, null, { timeout: 20000 });
  const kept = await page.evaluate(async () => {
    const names = await caches.keys();
    const c = await caches.open(names.find((n) => n.startsWith('v3ct0r-')));
    const keys = (await c.keys()).map((r) => new URL(r.url).pathname);
    return { caches: names, n: keys.length, mp3: keys.filter((k) => k.endsWith('.mp3')).length, page: keys.some((k) => k.endsWith('/')) };
  });
  if (kept.n < 30 || !kept.page || kept.mp3 < 20) errors.push(`service worker cache: ${JSON.stringify(kept)}`);
  out.push(`service worker actif · ${kept.n} fichiers gardés (${kept.mp3} voix)`);

  // offline: the app opens, a voice comes in ranges, the explorer and LEARN work
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 20000 });
  const off = await page.evaluate(async () => {
    const mp3 = (await (await caches.open((await caches.keys()).find((n) => n.startsWith('v3ct0r-')))).keys()).map((r) => r.url).find((u) => u.endsWith('.mp3'));
    const r = await fetch(mp3, { headers: { Range: 'bytes=0-99' } });
    const full = await fetch(mp3);
    window.__vm.go('fractals/mandelbrot');
    await new Promise((res) => setTimeout(res, 600));
    const view = document.querySelector('.panel-title')?.textContent ?? '';
    window.__vm.learn();
    await new Promise((res) => setTimeout(res, 800));
    return { status: r.status, bytes: (await r.arrayBuffer()).byteLength, range: r.headers.get('content-range'), full: full.status, view, learn: document.body.classList.contains('learn') };
  });
  if (off.status !== 206 || off.bytes !== 100 || off.full !== 200 || !off.view || !off.learn) errors.push(`offline: ${JSON.stringify(off)}`);
  out.push(`hors ligne : app ouverte · voix 206 (${off.range}) · vue « ${off.view} » · LEARN ${off.learn ? 'ok' : 'KO'}`);
  await ctx.setOffline(false);
  await ctx.close();
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
console.log(`pwa: ${out.join(' · ')}`);
if (errors.length) {
  console.error(`\n✕ ${errors.length} erreur(s) PWA :\n${errors.join('\n')}`);
  process.exit(1);
}
console.log('✓ PWA installable et hors ligne.');
