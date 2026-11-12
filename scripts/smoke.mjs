// Smoke test: opens dist/index.html over file:// in the installed Microsoft Edge (headless,
// via playwright-core — no browser download), visits every view and fails on any console
// error or uncaught exception.
//   node scripts/smoke.mjs [--only=fractals] [--shots=<dir>] [--wait=900] [--headed]
import { chromium } from 'playwright-core';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, def) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}`));
  if (!a) return def;
  const v = a.split('=')[1];
  return v === undefined ? true : v;
};
const only = arg('only', '');
const shots = arg('shots', '');
const wait = Number(arg('wait', 900));
const headed = !!arg('headed', false);
const file = resolve(arg('file', 'dist/index.html'));
if (!existsSync(file)) {
  console.error(`✕ ${file} introuvable — lancer "npm run build" d'abord.`);
  process.exit(1);
}
const url = pathToFileURL(file).href;

// no secret in the build: a Supabase secret key (sb_secret_…) or a service_role JWT would bypass
// every rule of the database (docs/ADMIN.md); the public key (anon / publishable) is expected
{
  const html = await readFile(file, 'utf8');
  const roles = (html.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g) ?? []).map((j) => {
    try {
      return JSON.parse(Buffer.from(j.split('.')[1], 'base64url').toString()).role ?? null;
    } catch {
      return null;
    }
  });
  if (/sb_secret_/.test(html) || roles.includes('service_role')) {
    console.error('✕ une clé secrète Supabase se trouve dans le build : arrêt (elle ne va que dans .env.local, sans préfixe VITE_).');
    process.exit(1);
  }
}

const browser = await chromium.launch({
  channel: 'msedge',
  headless: !headed,
  args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true });
// the first-run tutorial prompt would capture the keyboard: mark it as already seen;
// free mode so that every view is reachable (locks are tested on a separate page below)
// e2e: no way in (download offer, required account) before the app
await page.addInitScript(() => {
  localStorage.setItem('vector-math.e2e', 'true');
  localStorage.setItem('vector-math.intro.seen', 'true');
  localStorage.setItem('vector-math.progress.v1', JSON.stringify({ free: true, views: {} }));
});
const errors = [];
let current = 'boot';
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[${current}] console.error: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[${current}] pageerror: ${e.message}`));
page.on('requestfailed', (r) => {
  if (!r.url().startsWith('data:') && !r.url().startsWith('blob:')) errors.push(`[${current}] request failed: ${r.url()}`);
});

const t0 = Date.now();
await page.goto(url);
await page.waitForTimeout(300);
await page.keyboard.press('Space'); // skip boot
await page.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
const gl = await page.evaluate(() => {
  const c = document.createElement('canvas');
  const g = c.getContext('webgl2');
  return g ? 'webgl2' : 'none';
});
console.log(`◇ loaded ${url} (${Date.now() - t0} ms) — ${gl}`);
if (shots) await mkdir(shots, { recursive: true });

const views = (await page.evaluate(() => window.__vm.views())).filter((v) => !only || v.startsWith(only));
// controls that only exist once an option is picked (checked from the default state of the view)
const CONDITIONAL = { '4d/surfaces': ['DEMI-TORSIONS'] };
const timings = [];
let videoLinks = 0;
for (const id of views) {
  current = id;
  const before = errors.length;
  const ok = await page.evaluate((v) => window.__vm.go(v), id);
  if (!ok) errors.push(`[${id}] route not found`);
  const f0 = await page.evaluate(() => performance.now());
  await page.waitForTimeout(wait);
  const fps = await page.evaluate(() => document.querySelector('.topbar .meta > span:last-child')?.textContent ?? '');
  const broken = await page.evaluate(() => document.querySelector('.vp-error')?.textContent ?? '');
  if (broken) errors.push(`[${id}] view error: ${broken}`);
  // every control a manipulation exercise reads must exist under its exact label
  const missing = (await page.evaluate(() => window.__vm.missingLabels())).filter((l) => !(CONDITIONAL[id] ?? []).includes(l));
  if (missing.length) errors.push(`[${id}] exercise labels not found: ${missing.join(' | ')}`);
  // YouTube suggestions: 1 to 3 plain links (never an embedded player)
  const vids = await page.evaluate(() => ({ links: [...document.querySelectorAll('.panel-vids a.vid')].map((a) => a.getAttribute('href') ?? ''), iframes: document.querySelectorAll('iframe').length }));
  if (vids.links.length < 1 || vids.links.length > 3 || vids.iframes || vids.links.some((u) => !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(u))) errors.push(`[${id}] vidéos ${JSON.stringify(vids)}`);
  videoLinks += vids.links.length;
  // layout: the rail, the view and the panel are what is drawn at their centre (nothing fixed or
  // absolute covering them — a CSS class shared by two components once covered the rail)
  const covered = await page.evaluate(() =>
    ['#app > .rail', '.viewport', '#app > .panel'].flatMap((sel) => {
      const box = document.querySelector(sel);
      const r = box?.getBoundingClientRect();
      if (!box || !r || r.width < 40 || getComputedStyle(box).visibility === 'hidden') return [];
      const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height * 0.6);
      return t && box.contains(t) ? [] : [`${sel} couvert par ${t ? `${t.tagName.toLowerCase()}.${[...t.classList].join('.')}` : '—'}`];
    }),
  );
  if (covered.length) errors.push(`[${id}] ${covered.join(' · ')}`);
  if (shots) await page.screenshot({ path: join(shots, `${id.replace('/', '__')}.png`) });
  const m = /(\d+) FPS/.exec(fps);
  timings.push(`${id.padEnd(34)} ${m ? m[1].padStart(3) : '  ?'} fps ${errors.length > before ? '✕' : '✓'}`);
  void f0;
}

// ATLAS: fly forward, light speed into a system, land on a planet (opens its view)
current = 'atlas';
await page.evaluate(() => window.__vm.atlas(''));
await page.waitForTimeout(800);
const at0 = await page.evaluate(() => window.__vm.atlasState());
await page.keyboard.down('KeyW');
await page.waitForTimeout(900);
await page.keyboard.up('KeyW');
const at1 = await page.evaluate(() => window.__vm.atlasState());
// mouse aim: moving the mouse over the view turns the camera, the ship banks round to follow
const vpBox = await page.evaluate(() => { const r = document.querySelector('.viewport').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await page.mouse.move(vpBox[0], vpBox[1]);
await page.mouse.move(vpBox[0] + 260, vpBox[1], { steps: 12 });
await page.waitForTimeout(700);
const atMouse = await page.evaluate(() => window.__vm.atlasState());
const mouseOk = !!atMouse && Math.abs(atMouse.yaw - at1.yaw) > 0.2;
if (!mouseOk) errors.push(`[atlas] la souris ne dirige pas le vaisseau (yaw ${at1?.yaw} → ${atMouse?.yaw})`);
// Ctrl gauche held: the cursor is free and does not steer; released: it steers again
await page.waitForTimeout(900);
await page.keyboard.down('ControlLeft');
await page.waitForTimeout(150);
const freeOn = await page.evaluate(() => !!document.querySelector('.atlas-input.free'));
const yawFree0 = (await page.evaluate(() => window.__vm.atlasState())).yaw;
await page.mouse.move(vpBox[0] - 200, vpBox[1], { steps: 12 });
await page.waitForTimeout(500);
const yawFree1 = (await page.evaluate(() => window.__vm.atlasState())).yaw;
await page.keyboard.up('ControlLeft');
await page.waitForTimeout(150);
const freeOff = await page.evaluate(() => !document.querySelector('.atlas-input.free'));
const ctrlOk = freeOn && freeOff && Math.abs(yawFree1 - yawFree0) < 0.05;
if (!ctrlOk) errors.push(`[atlas] Ctrl gauche : libre ${freeOn} · relâché ${freeOff} · yaw ${yawFree0} → ${yawFree1}`);
await page.evaluate(() => window.__vm.atlas('integrals'));
await page.waitForTimeout(2300);
const at2 = await page.evaluate(() => window.__vm.atlasState());
const atNear = await page.evaluate(() => window.__vm.atlasApproach('integrals/ftc'));
await page.evaluate(() => window.__vm.atlasEnter());
await page.waitForTimeout(1900);
const atLanded = await page.evaluate(() => ({ hash: location.hash, atlas: document.body.classList.contains('atlas') }));
const atlasOk = at0?.level === 'galaxy' && at1 && at1.pos[2] < at0.pos[2] - 5 && at2?.level === 'system' && at2.uni === 'integrals' && at2.items === 6 && atNear && atLanded.hash === '#/integrals/ftc' && !atLanded.atlas;
if (!atlasOk) errors.push(`[atlas] ${JSON.stringify({ at0, at1, at2, atNear, atLanded })}`);
const atlasReport = (`ATLAS souris ${mouseOk ? '✓' : '✕'} · CTRL GAUCHE souris libre ${ctrlOk ? '✓' : '✕'} · vol ${at1 ? (at0.pos[2] - at1.pos[2]).toFixed(0) : '?'} u · vitesse lumière → ${at2?.uni} (${at2?.items} corps) · atterrissage ${atLanded.hash} ${atlasOk ? '✓' : '✕'}`);

// shell interactions
current = 'shell';
await page.keyboard.press('Control+k');
await page.waitForTimeout(200);
await page.keyboard.type('dimensions');
await page.waitForTimeout(150);
const palItems = await page.evaluate(() => document.querySelectorAll('.pal-item').length);
await page.keyboard.press('Escape');
await page.keyboard.press('?');
await page.waitForTimeout(150);
const keymapOpen = await page.evaluate(() => !!document.querySelector('.keymap'));
await page.keyboard.press('Escape');
await page.keyboard.press('s');
await page.waitForTimeout(200);
const sigmaOpen = await page.evaluate(() => !!document.querySelector('.sigma .katex'));
await page.keyboard.press('Escape');
await page.keyboard.press('d');
await page.waitForTimeout(150);
const quizOpen = await page.evaluate(() => !!document.querySelector('.dlg'));
await page.keyboard.press('Escape');
if (!palItems) errors.push('[shell] palette shows no results');
if (!keymapOpen) errors.push('[shell] keymap did not open');
if (!sigmaOpen) errors.push('[shell] sigma sheet did not render KaTeX');
if (!quizOpen) errors.push('[shell] challenge dialog did not open');

// calculator: '=' opens it, mnemonics typed key by key become symbols, ⏎ evaluates, Échap closes
current = 'calc';
await page.keyboard.press('=');
await page.waitForTimeout(150);
await page.keyboard.type('V3 27 + 2^10');
await page.keyboard.press('Enter');
await page.keyboard.type('sum(1/k^2, k, 1, inf)');
await page.keyboard.press('Enter');
await page.keyboard.type('AA eps');
await page.keyboard.press('Tab');
const calc = await page.evaluate(() => ({
  line: document.querySelector('.cx-in')?.value,
  srcs: [...document.querySelectorAll('.cx-src')].map((e) => e.textContent),
  outs: [...document.querySelectorAll('.cx-out')].map((e) => e.textContent),
  forms: [...document.querySelectorAll('.cx-form')].map((e) => e.textContent),
  rows: document.querySelectorAll('.cx-row').length,
}));
await page.keyboard.press('Escape');
const calcClosed = await page.evaluate(() => !document.querySelector('.cx'));
const calcOk = calc.srcs[0] === '∛ 27 + 2¹⁰' && calc.outs[0] === '=1027' && calc.outs[1]?.startsWith('≈1.64493406685') && calc.forms.includes('forme reconnue : π²/6') && calc.line === '∀ ε' && calc.rows >= 140 && calcClosed;
if (!calcOk) errors.push(`[calc] ${JSON.stringify({ ...calc, calcClosed })}`);
// background music: started by the first gesture, its mood follows the zone
const mus = await page.evaluate(() => window.__vm.musicState());
const musicOk = mus.playing && mus.mood === 'explore' && !mus.ducked;
if (!musicOk) errors.push(`[music] ${JSON.stringify(mus)}`);
// account: the COMPTE button exists only in a build configured for Supabase; its form has 2 fields,
// and a school code field (CODE D'ÉCOLE) follows
current = 'account';
const acc = await page.evaluate(() => ({ ...window.__vm.account(), shown: getComputedStyle([...document.querySelectorAll('.tb-btn')].find((b) => b.textContent.includes('COMPTE'))).display !== 'none' }));
await page.keyboard.press('Escape');
const accOk = acc.enabled ? acc.shown && acc.inputs === 2 && acc.code : !acc.shown;
if (!accOk) errors.push(`[compte] ${JSON.stringify(acc)}`);
// TÉLÉCHARGER: only online; this smoke runs the downloaded version (file://), where it is hidden
const dlShown = await page.evaluate(() => getComputedStyle([...document.querySelectorAll('.tb-btn')].find((b) => b.textContent.includes('TÉLÉCHARGER'))).display !== 'none');
if (dlShown) errors.push('[télécharger] bouton visible dans la version hors ligne');

// features: PNG export, WebM recording, quality switch, cinematic tour
const features = [];
features.push(atlasReport);
features.push(`CALC ∛27 + 2¹⁰ = 1027 · Σ1/k² ≈ π²/6 · ${calc.rows} raccourcis ${calcOk ? '✓' : '✕'} · MUSIQUE ${mus.mood} ${musicOk ? '✓' : '✕'} · COMPTE ${acc.enabled ? 'configuré' : 'non configuré (bouton masqué)'} ${accOk ? '✓' : '✕'} · TÉLÉCHARGER masqué hors ligne ${dlShown ? '✕' : '✓'}`);
current = 'features';
await page.evaluate(() => window.__vm.go('4d/polytopes'));
await page.waitForTimeout(400);
try {
  const [png] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.keyboard.press('p')]);
  features.push(`PNG ${png.suggestedFilename()}`);
} catch {
  errors.push('[features] PNG export produced no download');
}
try {
  await page.keyboard.press('r');
  await page.waitForTimeout(1500);
  const [webm] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.keyboard.press('r')]);
  features.push(`WEBM ${webm.suggestedFilename()}`);
} catch {
  errors.push('[features] WebM recording produced no download');
}
await page.keyboard.press('q');
await page.waitForTimeout(500);
const q1 = await page.evaluate(() => document.querySelector('.statusbar')?.textContent?.match(/LOW|MED|HIGH/)?.[0]);
await page.keyboard.press('q');
await page.keyboard.press('q');
await page.waitForTimeout(400);
features.push(`QUALITÉ → ${q1}`);
await page.keyboard.press('m');
await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector('.mod-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
await page.waitForTimeout(300);
await page.keyboard.press('m');
features.push('SONS on/off');
await page.keyboard.press('c');
await page.waitForTimeout(600);
const cineOn = await page.evaluate(() => document.body.classList.contains('cinematic'));
await page.evaluate(() => {
  // fast-forward the tour: 3 transitions
  for (let i = 0; i < 3; i++) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
});
await page.waitForTimeout(600);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const cineOff = await page.evaluate(() => !document.body.classList.contains('cinematic'));
if (!cineOn || !cineOff) errors.push(`[features] cinematic toggle failed (on=${cineOn}, off=${cineOff})`);
features.push(`CINÉ ${cineOn && cineOff ? 'ok' : 'KO'}`);

// exercises: the instruction in bold with « À TOI », the controls of the manipulation lit in the panel
current = 'spotlight';
await page.evaluate(() => window.__vm.go('4d/polytopes'));
await page.waitForTimeout(600);
await page.keyboard.press('e');
await page.waitForTimeout(1200);
const spot = await page.evaluate(() => ({
  consignes: document.querySelectorAll('.term .ex-consigne').length,
  todo: document.querySelectorAll('.term .ex-do').length,
  chips: [...document.querySelectorAll('.term .ex-chip')].map((c) => c.textContent),
  lit: [...document.querySelectorAll('.panel .ex-lit')].map((e) => e.textContent?.trim().slice(0, 20)),
  dim: document.querySelectorAll('.panel .ex-dim').length,
}));
await page.locator('.term .ex-chip').first().click();
await page.waitForTimeout(300);
const flashed = await page.evaluate(() => document.querySelectorAll('.panel .ex-flash').length);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const litAfter = await page.evaluate(() => document.querySelectorAll('.ex-lit, .ex-dim').length);
const spotOk = spot.consignes === 3 && spot.todo === 3 && spot.chips.length >= 2 && spot.lit.length === 3 && spot.dim > 0 && flashed === 1 && litAfter === 0;
if (!spotOk) errors.push(`[spotlight] ${JSON.stringify({ ...spot, flashed, litAfter })}`);
features.push(`EXERCICES consigne + À TOI ×${spot.consignes} · réglages éclairés ${spot.lit.length} (${spot.lit.join(', ')}) · étiquettes ${spot.chips.length} ${spotOk ? '✓' : '✕'}`);

// tutorial played with real user actions: each validated step must auto-advance
current = 'tuto';
const state = () => page.evaluate(() => window.__vm.tourState());
const waitStep = async (k, ms = 5000) => {
  const t = Date.now();
  while (Date.now() - t < ms) {
    if ((await state()) === `tuto:${k}`) return true;
    await page.waitForTimeout(100);
  }
  return false;
};
await page.keyboard.press('t');
await page.waitForTimeout(300);
const tutoSteps = [];
await page.evaluate(() => window.__vm.tourNext()); // 0 → 1 (welcome)
tutoSteps.push(await waitStep(1));
await page.keyboard.press('2'); // change module
tutoSteps.push(await waitStep(2));
const vc = await page.evaluate(() => { const r = document.querySelector('canvas.ov2d').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await page.mouse.move(vc[0], vc[1]);
await page.mouse.down();
await page.mouse.move(vc[0] + 120, vc[1] + 40, { steps: 8 });
await page.mouse.up();
tutoSteps.push(await waitStep(3));
await page.getByRole('button', { name: '24-CELL', exact: true }).click();
await page.getByRole('button', { name: 'STÉRÉOGRAPHIQUE', exact: true }).click();
tutoSteps.push(await waitStep(4));
await page.keyboard.press('s');
tutoSteps.push(await waitStep(5));
await page.locator('.field input').first().fill('x^3 - x');
await page.locator('.field input').first().press('Enter');
tutoSteps.push(await waitStep(6));
await page.keyboard.press('Control+k');
await page.waitForTimeout(200);
await page.keyboard.type('mandelbrot');
await page.keyboard.press('Enter');
tutoSteps.push(await waitStep(7));
await page.keyboard.press('e'); // open the lesson terminal
tutoSteps.push(await waitStep(8));
// calculator: V3 is typed as ∛, ∛(27) = 3
await page.waitForTimeout(150);
await page.keyboard.press('=');
await page.waitForTimeout(200);
await page.keyboard.type('V3(27)');
await page.keyboard.press('Enter');
tutoSteps.push(await waitStep(9));
// notebook: a line typed is kept
await page.waitForTimeout(150);
await page.keyboard.press('n');
await page.waitForTimeout(200);
await page.keyboard.type('note du tuto smoke');
await page.keyboard.press('Enter');
tutoSteps.push(await waitStep(10));
const noteKept = await page.evaluate(() => (localStorage.getItem('vector-math.notes.v1') ?? '').includes('note du tuto smoke'));
if (!noteKept) errors.push('[tuto] the note typed in the notebook is not stored');
features.push(`NOTES ${noteKept ? 'gardée' : 'KO'}`);
// LEARN tab (the tutorial stays on), then a written course from Ctrl+K
const tourShown = () => page.evaluate(() => { const t = document.querySelector('.tour'); return !!t && getComputedStyle(t).display !== 'none' && t.getBoundingClientRect().width > 0; });
await page.locator('[data-act="tab-learn"]').click();
tutoSteps.push(await waitStep(11));
if (!(await tourShown())) errors.push('[tuto] the tutorial card is hidden in LEARN');
await page.keyboard.press('Control+k');
await page.waitForTimeout(200);
await page.keyboard.type('suites et séries');
await page.waitForTimeout(150);
await page.keyboard.press('Enter');
tutoSteps.push(await waitStep(12, 8000));
await page.evaluate(() => window.__vm.tourNext()); // games: text only
tutoSteps.push(await waitStep(13));
// ATLAS tab, then the story mode from Ctrl+K
await page.locator('[data-act="tab-atlas"]').click();
tutoSteps.push(await waitStep(14, 8000));
if (!(await tourShown())) errors.push('[tuto] the tutorial card is hidden in the ATLAS');
await page.keyboard.press('Control+k');
await page.waitForTimeout(200);
await page.keyboard.type('grande entropie');
await page.waitForTimeout(150);
await page.keyboard.press('Enter');
tutoSteps.push(await waitStep(15, 20000));
await page.evaluate(() => window.__vm.tourNext()); // top bar: text only
tutoSteps.push(await waitStep(16));
const tutoLastView = await page.evaluate(() => (document.body.classList.contains('atlas') || document.body.classList.contains('learn') ? 'other' : 'explore'));
if (tutoLastView !== 'explore') errors.push('[tuto] the last step does not bring back the explorer');
await page.evaluate(() => window.__vm.tourNext());
await page.waitForTimeout(200);
const tutoEnd = await state();
const tutoOk = tutoSteps.every(Boolean) && tutoEnd === 'off';
if (!tutoOk) errors.push(`[tuto] steps validated: ${tutoSteps.map((b) => (b ? '✓' : '✕')).join('')} · end=${tutoEnd}`);
features.push(`TUTO ${tutoSteps.filter(Boolean).length}/${tutoSteps.length} étapes validées par l’action`);

// guided stories: play every step
for (const id of ['cercle', 'dim4', 'chaos']) {
  current = `parcours:${id}`;
  await page.evaluate((x) => window.__vm.tour(x), id);
  let n = 0;
  while ((await state()) !== 'off' && n < 20) {
    await page.waitForTimeout(450);
    await page.evaluate(() => window.__vm.tourNext());
    n++;
  }
  features.push(`${id.toUpperCase()} ${n} étapes`);
}

// LEARN: home tree, every ready course scrubbed end to end, exercise pause, keys, search, links,
// summary sheet, colle (main page is in free mode, so every course is open)
current = 'learn';
await page.evaluate(() => window.__vm.learn());
await page.waitForTimeout(600);
const learnHome = await page.evaluate(() => ({ courses: document.querySelectorAll('.lrail .lr-course').length, ready: [...document.querySelectorAll('.lrail .lr-course')].filter((b) => !b.classList.contains('s-construction')).map((b) => b.querySelector('.tt').textContent), learn: document.body.classList.contains('learn') }));
if (!learnHome.learn || learnHome.courses < 20) errors.push(`[learn] home: ${JSON.stringify(learnHome)}`);
// the home graph: every node shown, a filière narrows it, the search finds a statement, its card
// (with the courses citing it), then a [[reference]] clicked in a written course opens its target
current = 'learn:graph';
const gr0 = await page.evaluate(() => window.__vm.learnGraph());
const gr1 = await page.evaluate(() => window.__vm.learnGraph({ filiere: 'PT' }));
const gr2 = await page.evaluate(() => window.__vm.learnGraph({ filiere: 'ALL', search: 'bolzano' }));
const gr3 = await page.evaluate(() => window.__vm.learnGraph({ search: '', pick: 'st:suites-series/thm-bw' }));
const grCited = await page.evaluate(() => [...document.querySelectorAll('.lpanel .sec-title')].some((x) => x.textContent === 'CITÉ PAR'));
await page.mouse.move(800, 450);
await page.waitForTimeout(300);
await page.evaluate(() => window.__vm.learn('topologie-evn'));
await page.waitForTimeout(500);
const xrefs = await page.evaluate(() => document.querySelectorAll('.lw a.xref').length);
await page.click('.lw a.xref[data-ref="suites-series#thm-bw"]');
await page.waitForTimeout(700);
const grJump = await page.evaluate(() => ({ hash: location.hash, box: !!document.querySelector('.lw #lw-st-thm-bw') }));
const graphOk = gr0.nodes > 250 && gr0.visible === gr0.nodes && gr0.refs >= 5 && gr1.visible < gr0.visible && gr1.rows < gr0.rows && gr2.hits >= 1 && gr3.focus === 'st:suites-series/thm-bw' && gr3.panel.includes('Bolzano') && grCited && xrefs >= 2 && grJump.hash === '#/learn/suites-series' && grJump.box;
if (!graphOk) errors.push(`[learn] graphe ${JSON.stringify({ gr0, gr1: { visible: gr1.visible, rows: gr1.rows }, hits: gr2.hits, gr3: { focus: gr3.focus, panel: gr3.panel }, grCited, xrefs, grJump })}`);
await page.evaluate(() => window.__vm.learnGraph({ filiere: 'ALL', search: '' }));
features.push(`GRAPHE LEARN ${gr0.nodes} nœuds · ${gr0.edges} liens (${gr0.refs} renvois) · filtre PT ${gr1.visible} · renvoi cliqué ${graphOk ? '✓' : '✕'}`);
const introIds =['intro-integrals', 'intro-4d', 'intro-fractals', 'intro-constants', 'intro-principles', 'intro-probability'];
const readyIds = ['demo', 'riemann', 'reduction', 'riemann-lebesgue', ...introIds];
const learnReport = [];
for (const id of readyIds) {
  current = `learn:${id}`;
  await page.evaluate((c) => window.__vm.learn(c, 0), id);
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => window.__vm.learnState());
  if (st.course !== id) {
    errors.push(`[learn] ${id} did not open (${st.course})`);
    continue;
  }
  if (st.errors.length) errors.push(`[learn] ${id}: ${st.errors.slice(0, 5).join(' | ')}`);
  let shown = 0;
  for (let k = 1; k <= 12; k++) {
    await page.evaluate((x) => window.__vm.learnSeek(x), (st.duration * k) / 13);
    await page.waitForTimeout(140);
    shown = Math.max(shown, await page.evaluate(() => window.__vm.learnState().objects));
  }
  const after = await page.evaluate(() => window.__vm.learnState());
  if (after.errors.length > st.errors.length) errors.push(`[learn] ${id} while seeking: ${after.errors.slice(st.errors.length, st.errors.length + 5).join(' | ')}`);
  if (!shown) errors.push(`[learn] ${id}: no animation object ever shown`);
  // automatic pause before the first exercise, then resume with Space
  let pauseOk = !st.pauses.length;
  if (st.pauses.length) {
    await page.evaluate((x) => window.__vm.learnSeek(x), st.pauses[0] - 0.4);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1200);
    const card = await page.evaluate(() => ({ s: window.__vm.learnState(), timer: document.querySelector('.lx-card .lx-timer')?.textContent ?? '' }));
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    const resumed = await page.evaluate(() => window.__vm.learnState());
    pauseOk = card.s.card && !card.s.playing && /\d\d:\d\d/.test(card.timer) && !resumed.card && resumed.playing;
    if (!pauseOk) errors.push(`[learn] ${id}: exercise pause ${JSON.stringify({ card: card.s.card, timer: card.timer, resumed: resumed.playing })}`);
    await page.keyboard.press('Space');
  }
  learnReport.push(`${id} ${st.duration < 120 ? `${Math.round(st.duration)} s` : `${Math.round(st.duration / 60)} min`} ${shown} obj${pauseOk && st.pauses.length ? ' pause✓' : ''}`);
}
current = 'learn:keys';
await page.evaluate(() => window.__vm.learn('riemann', 0));
await page.waitForTimeout(400);
await page.evaluate(() => window.__vm.learnSeek(30));
const k0 = await page.evaluate(() => window.__vm.learnState());
await page.keyboard.press('ArrowRight');
await page.keyboard.press('c');
await page.keyboard.press('>');
await page.waitForTimeout(150);
const k1 = await page.evaluate(() => window.__vm.learnState());
if (Math.abs(k1.t - k0.t - 5) > 0.6 || k1.cc || k1.rate !== 1.25) errors.push(`[learn] keys: t ${k0.t.toFixed(1)}→${k1.t.toFixed(1)}, cc ${k1.cc}, rate ${k1.rate}`);
await page.keyboard.press('c');
await page.keyboard.press('<');
// Ctrl+K: a theorem opens its course at the right moment
current = 'learn:search';
await page.keyboard.press('Control+k');
await page.waitForTimeout(200);
await page.keyboard.type('cayley');
await page.waitForTimeout(150);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
const found = await page.evaluate(() => window.__vm.learnState());
if (found.course !== 'reduction' || found.t < 60) errors.push(`[learn] Ctrl+K "cayley" → ${found.course} at ${found.t.toFixed(0)} s`);
// summary sheet and colle
current = 'learn:sheet';
await page.evaluate(() => {
  window.print = () => undefined;
  window.__vm.learnSheet();
});
await page.waitForTimeout(300);
const sheet = await page.evaluate(() => ({ h1: document.querySelector('#print-root h1')?.textContent ?? '', st: document.querySelectorAll('#print-root .ps-st').length, eq: document.querySelectorAll('#print-root .ps-eq .katex').length }));
if (!sheet.h1 || sheet.st < 5 || sheet.eq < 3) errors.push(`[learn] summary sheet ${JSON.stringify(sheet)}`);
await page.evaluate(() => document.body.classList.remove('printing'));
current = 'learn:colle';
await page.evaluate(() => window.__vm.learnColle());
await page.waitForTimeout(300);
const colle = await page.evaluate(() => !!document.querySelector('.dlg .lx-colle .lx-ex-title'));
if (!colle) errors.push('[learn] colle dialog did not open');
await page.keyboard.press('Escape');
// explorer → LEARN link and back
current = 'learn:link';
await page.evaluate(() => window.__vm.go('integrals/riemann'));
await page.waitForTimeout(400);
const linkVisible = await page.evaluate(() => getComputedStyle(document.querySelector('[data-act="learn"]')).display !== 'none' && !document.body.classList.contains('learn'));
await page.click('[data-act="learn"]');
await page.waitForTimeout(500);
const linked = await page.evaluate(() => ({ learn: document.body.classList.contains('learn'), course: window.__vm.learnState().course }));
if (!linkVisible || !linked.learn || !linked.course) errors.push(`[learn] → LEARN link ${JSON.stringify({ linkVisible, ...linked })}`);
// module intro from the explorer rail: plays at once, ends on a card that leads back to the module
current = 'learn:intro';
await page.evaluate(() => window.__vm.go('fractals/koch'));
await page.waitForTimeout(400);
const introBtns = await page.evaluate(() => [...document.querySelectorAll('.viz-btn.intro')].filter((b) => !b.hidden).length);
await page.click('.mod.active .viz-btn.intro');
await page.waitForTimeout(3400); // the voice starts after the 2.4 s title
const introSt = await page.evaluate(() => ({ learn: document.body.classList.contains('learn'), ...window.__vm.learnState(), music: window.__vm.musicState() }));
await page.evaluate((x) => window.__vm.learnSeek(x), introSt.duration - 0.6);
await page.waitForTimeout(1600);
const introEnd = await page.evaluate(() => ({ card: document.querySelector('.lx-end .big')?.textContent ?? '', btn: !!document.querySelector('.lx-end .btn.on') }));
if (introEnd.btn) await page.click('.lx-end .btn.on');
await page.waitForTimeout(600);
const introBack = await page.evaluate(() => ({ learn: document.body.classList.contains('learn'), hash: location.hash }));
const introOk = introBtns === 6 && introSt.learn && introSt.course === 'intro-fractals' && introSt.playing && introSt.music?.ducked && introSt.music.mood === 'learn' && introSt.sfx?.on && introSt.sfx.fired >= 2 && introSt.voice?.failed === 0 && (!introSt.voice.key || (!introSt.voice.paused && introSt.voice.time > 0)) && introEnd.card.includes('INTRO') && !introBack.learn && introBack.hash.startsWith('#/fractals/');
if (!introOk) errors.push(`[learn] intro depuis le rail ${JSON.stringify({ introBtns, course: introSt.course, playing: introSt.playing, music: introSt.music, sfx: introSt.sfx, voice: introSt.voice, end: introEnd, back: introBack })}`);
// leçons-jeux: a full level of the Duel ε-δ (5 rounds → grade, theorem revealed), a round of the hunter
current = 'games';
// opened with a click (a real gesture), the briefing is read aloud
await page.evaluate(() => window.__vm.learn());
await page.waitForTimeout(500);
await page.click('.lrail .lr-game');
await page.waitForTimeout(1500);
const gBrief = await page.evaluate(() => window.__vm.gameState());
const briefVoiceOk = gBrief?.game === 'duel-eps' && gBrief.phase === 'brief' && !!gBrief.voice && gBrief.voice.t > 0.3 && !gBrief.voice.paused;
if (!briefVoiceOk) errors.push(`[jeux] briefing sans voix ${JSON.stringify(gBrief)}`);
await page.waitForTimeout(700);
await page.keyboard.press('Enter');
for (let k = 0; k < 5; k++) {
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');
}
await page.waitForTimeout(500);
const gDuel = await page.evaluate(() => ({ s: window.__vm.gameState(), thm: !!document.querySelector('.lpanel .game-thm .katex'), levels: document.querySelectorAll('.lrail .lr-chap').length }));
await page.evaluate(() => window.__vm.learn('game:eigen-hunt'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('n');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const gEigen = await page.evaluate(() => window.__vm.gameState());
// Peintre de Fourier: one round; Pilote 4D: hold a key (physical position), then validate
await page.evaluate(() => window.__vm.learn('game:fourier-painter'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const gFourier = await page.evaluate(() => window.__vm.gameState());
await page.evaluate(() => window.__vm.learn('game:pilot-4d'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.down('KeyD');
await page.waitForTimeout(500);
await page.keyboard.up('KeyD');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const gPilot = await page.evaluate(() => window.__vm.gameState());
// Plongée Mandelbrot: probe c = 0 (period 1, the first target) in the home view; it ends the round
await page.evaluate(() => window.__vm.learn('game:mandel-dive'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const mBox = await page.evaluate(() => { const r = document.querySelector('.viewport').getBoundingClientRect(); return { x: r.x + 28, y: r.y + 92, w: r.width - 56, h: r.height - 140 }; });
const mHw = (1.25 * mBox.w) / mBox.h;
await page.mouse.click(mBox.x + ((0 - (-0.6 - mHw)) / (2 * mHw)) * mBox.w, mBox.y + mBox.h / 2);
await page.waitForTimeout(400);
const gMandel = await page.evaluate(() => window.__vm.gameState());
// Casino de Buffon: one bet; Chasseur de premiers: numbers start falling
await page.evaluate(() => window.__vm.learn('game:buffon-casino'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const gBuffon = await page.evaluate(() => window.__vm.gameState());
await page.evaluate(() => window.__vm.learn('game:prime-hunt'));
await page.waitForTimeout(600);
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
const gPrimes = await page.evaluate(() => window.__vm.gameState());
await page.keyboard.press('Escape');
const gamesOk = gDuel.s?.phase === 'result' && gDuel.s.scores.length === 5 && gDuel.thm && gDuel.levels === 3 && gEigen?.phase === 'reveal' && gEigen.scores.length === 1 && gFourier?.phase === 'reveal' && gPilot?.phase === 'reveal' && gMandel?.phase === 'reveal' && gMandel.scores[0] > 0 && gBuffon?.phase === 'reveal' && gPrimes?.phase === 'play';
if (!gamesOk) errors.push(`[jeux] ${JSON.stringify({ gDuel, gEigen, gFourier, gPilot, gMandel, gBuffon, gPrimes })}`);
features.push(`JEUX briefing lu ${briefVoiceOk ? "✓" : "✕"} · duel ${gDuel.s?.scores?.join('/')} → ${gDuel.s?.phase} · chasseur ${gEigen?.phase} · fourier ${gFourier?.phase} · pilote 4D ${gPilot?.phase} · mandelbrot ${gMandel?.phase} +${gMandel?.scores?.[0]} · buffon ${gBuffon?.phase} · premiers ${gPrimes?.phase} ${gamesOk ? '✓' : '✕'}`);

// STORY MODE: the region of LA GRANDE ENTROPIE, a beacon's card, its mission played for real (the
// tablet: click the middle of the ruler, three steps per round), back to the ship, the beacon
// restored, the ship part earned, the next beacons open
current = 'story';
await page.evaluate(() => window.__vm.atlas('story'));
await page.waitForTimeout(2800);
const sv0 = await page.evaluate(() => ({ at: window.__vm.atlasState(), st: window.__vm.story() }));
const sCard = await page.evaluate(() => {
  const r = window.__vm.story('babylone');
  return { r: r.opened, title: document.querySelector('.st-title')?.textContent ?? '', mission: !!document.querySelector('.st-card .btn.on'), katex: document.querySelectorAll('.st-log .katex').length };
});
await page.click('.st-card .btn.on');
await page.waitForTimeout(700);
const sBack = await page.evaluate(() => document.querySelector('.lr-back')?.textContent ?? '');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
const sBox = await page.evaluate(() => { const r = document.querySelector('.viewport').getBoundingClientRect(); return { x: r.x + 28, y: r.y + 92, w: r.width - 56, h: r.height - 140 }; });
for (let round = 0; round < 4; round++) {
  for (let step = 0; step < 3; step++) {
    await page.mouse.click(sBox.x + sBox.w * 0.76 - 15, sBox.y + sBox.h * 0.42);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}
const gBab = await page.evaluate(() => window.__vm.gameState());
await page.click('.lr-back');
await page.waitForTimeout(1800);
const sv1 = await page.evaluate(() => ({ at: window.__vm.atlasState(), st: window.__vm.story() }));
const storyOk = sv0.at?.uni === 'story' && sv0.at.items === Object.keys(sv0.st.chapters).length && sCard.r === true && sCard.title === 'La tablette YBC 7289' && sCard.mission && sCard.katex > 3 && sBack.includes('RETOUR AU VAISSEAU') && gBab?.phase === 'result' && gBab.scores.every((x) => x >= 90) && sv1.at?.uni === 'story' && sv1.st.chapters.babylone === 'done' && sv1.st.chapters.euclide === 'open' && sv1.st.parts.includes('sexagesimal');
if (!storyOk) errors.push(`[histoire] ${JSON.stringify({ at0: sv0.at, card: sCard, back: sBack, game: gBab, at1: sv1.at, babylone: sv1.st.chapters.babylone, euclide: sv1.st.chapters.euclide, parts: sv1.st.parts })}`);
// the end of act I: the other games passed, every beacon read, Diophantus shows « À SUIVRE »
await page.evaluate(() => {
  const k = 'vector-math.games.v1';
  const all = JSON.parse(localStorage.getItem(k) || '{}');
  for (const id of ['euclid', 'eratosthenes', 'prime-hunt', 'archimedes']) all[id] = { best: [80, null, null], plays: 1 };
  localStorage.setItem(k, JSON.stringify(all));
  for (const id of ['rhind', 'zenon', 'euclide', 'eratosthene', 'crible', 'archimede']) window.__vm.story(id);
});
const sEnd = await page.evaluate(() => {
  const r = window.__vm.story('diophante');
  return { opened: r.opened, act1: r.acts[1], act2: r.acts[2], act4: r.acts[4], suivre: document.querySelector('.st-suivre .st-suivre-t')?.textContent ?? '' };
});
await page.keyboard.press('Escape');
const endOk = sEnd.opened === true && sEnd.act1 === 'done' && sEnd.act2 === 'open' && sEnd.act4 === 'open' && sEnd.suivre === 'À SUIVRE…';
if (!endOk) errors.push(`[histoire] fin de l’acte I ${JSON.stringify(sEnd)}`);
features.push(`HISTOIRE ${sv0.at?.items} balises · YBC 7289 jouée ${gBab?.scores?.join('/')} → restaurée ${sv1.st.chapters.babylone === 'done' ? '✓' : '✕'} · pièce ${sv1.st.parts.join(', ') || '—'} · ${sv1.st.restored}/${sv1.st.playable} ${storyOk ? '✓' : '✕'} · fin de l’acte I « À SUIVRE » ${endOk ? '✓' : '✕'}`);
await page.evaluate(() => window.__vm.go('4d/polytopes'));
await page.waitForTimeout(300);

// the 6 intros in a row: the next one starts on its own after the end card
current = 'learn:intros';
await page.evaluate(() => window.__vm.learn());
await page.waitForTimeout(500);
await page.click('.lrail .lr-all');
await page.waitForTimeout(700);
const iq0 = await page.evaluate(() => window.__vm.learnState());
await page.evaluate((x) => window.__vm.learnSeek(x), iq0.duration - 0.5);
await page.waitForTimeout(4200);
const iq1 = await page.evaluate(() => window.__vm.learnState());
const queueOk = iq0.course === 'intro-integrals' && iq0.playing && iq1.course === 'intro-4d' && iq1.playing;
if (!queueOk) errors.push(`[learn] intros à la suite : ${iq0.course} (${iq0.playing}) → ${iq1.course} (${iq1.playing})`);
// written course: the reader shows the text, its statements and the exercises by length;
// reaching the exercises marks the course as read
current = 'learn:written';
await page.evaluate(() => window.__vm.learn('suites-series'));
await page.waitForTimeout(700);
const wr0 = await page.evaluate(() => ({
  hash: location.hash,
  boxes: document.querySelectorAll('.lw-st').length,
  katex: document.querySelectorAll('.lw .katex').length,
  katexErr: document.querySelectorAll('.lw .katex-error').length,
  levels: [...document.querySelectorAll('.lw-lv .kd')].map((e) => e.textContent),
  cards: document.querySelectorAll('.lw .lx-ex').length,
  toc: document.querySelectorAll('.lr-list .lr-chap').length,
}));
await page.click('.lr-list .lr-chap:last-child');
await page.waitForTimeout(1500);
const wr1 = await page.evaluate(() => ({ active: document.querySelector('.lr-chap.active .tt')?.textContent ?? '', read: document.querySelector('.lpanel .ro .v')?.textContent ?? '' }));
const writtenOk = wr0.hash === '#/learn/suites-series' && wr0.boxes >= 30 && wr0.katex > 300 && wr0.katexErr === 0 && wr0.levels.join(',') === 'SIMPLE,MOYEN,COMPLEXE' && wr0.cards >= 8 && wr0.toc === 5 && wr1.active.startsWith('Exercices') && wr1.read === 'cours lu';
if (!writtenOk) errors.push(`[learn] cours écrit ${JSON.stringify({ ...wr0, ...wr1 })}`);
await page.evaluate(() => window.__vm.go('4d/polytopes'));
await page.waitForTimeout(300);
features.push(`INTROS À LA SUITE ${queueOk ? '✓' : '✕'}`);
features.push(`COURS ÉCRIT suites-series ${wr0.boxes} énoncés · ${wr0.katex} formules · ${wr0.cards} exercices (${wr0.levels.join('/')}) · lu ${writtenOk ? '✓' : '✕'}`);
features.push(`LEARN ${learnReport.join(' · ')} · Ctrl+K ✓ · fiche ${sheet.st} énoncés · colle ${colle ? '✓' : '✕'} · lien → LEARN ${linked.course} · intro rail ${introOk ? '✓' : '✕'} (voix ${introSt.voice?.key ? `✓ ${introSt.voice.key}` : 'non générée'}, ${introSt.sfx?.fired ?? 0} bruitages)`);
features.push(`VIDÉOS ${videoLinks} liens YouTube sur ${views.length} vues`);

// progression on a fresh profile: locks, lesson terminal, exercises, unlock
current = 'progression';
const lp = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await lp.addInitScript(() => {
  localStorage.setItem('vector-math.e2e', 'true');
  localStorage.setItem('vector-math.intro.seen', 'true');
});
lp.on('pageerror', (e) => errors.push(`[progression] pageerror: ${e.message}`));
lp.on('console', (m) => m.type() === 'error' && errors.push(`[progression] console.error: ${m.text()}`));
await lp.goto(url);
await lp.waitForTimeout(300);
await lp.keyboard.press('Space');
await lp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
// a fresh profile lands in the ATLAS; a locked planet refuses the landing
await lp.waitForTimeout(600);
const atlasHome = await lp.evaluate(() => document.body.classList.contains('atlas') && location.hash === '#/atlas');
await lp.evaluate(() => window.__vm.atlas('fractals'));
await lp.waitForTimeout(2300);
const lockedNear = await lp.evaluate(() => window.__vm.atlasApproach('fractals/julia'));
await lp.evaluate(() => window.__vm.atlasEnter());
await lp.waitForTimeout(1900);
const refused = await lp.evaluate(() => ({ atlas: document.body.classList.contains('atlas'), hash: location.hash }));
const atlasLockOk = atlasHome && lockedNear && refused.atlas && refused.hash === '#/atlas';
if (!atlasLockOk) errors.push(`[progression] ATLAS accueil / planète verrouillée ${JSON.stringify({ atlasHome, lockedNear, refused })}`);
features.push(`ATLAS ACCUEIL + VERROU ${atlasLockOk ? 'ok' : 'KO'}`);
const lockedAtStart = await lp.evaluate(() => document.querySelectorAll('.viz-btn.locked').length);
const totalViews = views.length && !only ? views.length : await lp.evaluate(() => window.__vm.views().length);
const modulesCount = await lp.evaluate(() => new Set(window.__vm.views().map((v) => v.split('/')[0])).size);
if (lockedAtStart !== totalViews - modulesCount) errors.push(`[progression] ${lockedAtStart} locked views at start, expected ${totalViews - modulesCount}`);
await lp.evaluate(() => window.__vm.go('integrals/riemann'));
await lp.waitForTimeout(300);
await lp.evaluate(() => window.__vm.go('integrals/ftc')); // locked: must stay on riemann
await lp.waitForTimeout(300);
const hashLocked = await lp.evaluate(() => location.hash);
if (!hashLocked.endsWith('integrals/riemann')) errors.push(`[progression] locked view opened (${hashLocked})`);
await lp.keyboard.press('c'); // cinematic is locked before 10 validated views
await lp.waitForTimeout(300);
if (await lp.evaluate(() => document.body.classList.contains('cinematic'))) errors.push('[progression] cinematic opened while locked');
await lp.keyboard.press('e');
await lp.waitForTimeout(300);
const exCount = await lp.locator('.term .ex').count();
if (exCount !== 3) errors.push(`[progression] terminal shows ${exCount} exercise(s)`);
const answers = await lp.evaluate(() => window.__vm.answers());
let solvedHere = 0;
for (let k = 0; k < answers.length && solvedHere < 2; k++) {
  const a = answers[k];
  const block = lp.locator('.term .ex').nth(k);
  if (typeof a === 'string' && a.length === 1) {
    // wrong answer first: the hint must show up
    const wrong = 'ABCD'[('ABCD'.indexOf(a) + 1) % 2];
    await block.locator('button.ans', { hasText: `${wrong})` }).first().click();
    const fb = await block.locator('.ex-fb').textContent();
    if (!fb.includes('INDICE')) errors.push('[progression] no hint after a wrong answer');
    await block.locator('button.ans', { hasText: `${a})` }).first().click();
    solvedHere++;
  } else if (typeof a === 'number') {
    await block.locator('input').fill(String(a).replace('.', ','));
    await block.locator('input').press('Enter');
    solvedHere++;
  }
}
await lp.waitForTimeout(300);
const prog = await lp.evaluate(() => window.__vm.progress());
const lockedAfter = await lp.evaluate(() => document.querySelectorAll('.viz-btn.locked').length);
const railCount = await lp.evaluate(() => document.querySelector('.rp-n')?.textContent ?? '');
await lp.evaluate(() => window.__vm.go('integrals/ftc'));
await lp.waitForTimeout(400);
const hashOpen = await lp.evaluate(() => location.hash);
const termFollows = await lp.evaluate(() => document.querySelector('.term')?.getAttribute('aria-label') ?? '');
const progOk = prog.startsWith('1/') && lockedAfter === lockedAtStart - 1 && hashOpen.endsWith('integrals/ftc');
if (!progOk) errors.push(`[progression] after 2 answers: ${prog}, locked ${lockedAtStart}→${lockedAfter}, ${hashOpen}`);
if (!railCount.includes('1')) errors.push(`[progression] rail counter not updated (${railCount})`);
features.push(`PROGRESSION verrous ${lockedAtStart} → ${lockedAfter} · ${prog} · terminal ${termFollows ? 'suit la vue' : 'fermé'}`);
// LEARN locks: Riemann needs the written course « Suites et séries » first, the master course needs Riemann
await lp.evaluate(() => window.__vm.learn('riemann'));
await lp.waitForTimeout(400);
const lockedCourse = await lp.evaluate(() => window.__vm.learnState().course);
if (lockedCourse) errors.push(`[progression] locked LEARN course opened (${lockedCourse})`);
await lp.evaluate(() => window.__vm.learn('suites-series'));
await lp.waitForTimeout(500);
await lp.click('.lr-list .lr-chap:last-child');
await lp.waitForTimeout(1500);
await lp.evaluate(() => window.__vm.learn('riemann-lebesgue'));
await lp.waitForTimeout(400);
const stillLocked = await lp.evaluate(() => window.__vm.learnState().course);
if (stillLocked) errors.push(`[progression] locked LEARN course opened (${stillLocked})`);
await lp.evaluate(() => window.__vm.learn('riemann'));
await lp.waitForTimeout(400);
const openCourse = await lp.evaluate(() => window.__vm.learnState().course);
if (openCourse !== 'riemann') errors.push(`[progression] open LEARN course refused after reading its prerequisite (${openCourse})`);
features.push(`LEARN VERROUS ${!lockedCourse && openCourse === 'riemann' ? 'ok' : 'KO'}`);
await lp.close();

// narrow window (the desktop app's minimum, 960 × 600): the rail is a drawer, the view keeps its room
current = 'narrow';
{
  const np = await browser.newPage({ viewport: { width: 960, height: 600 } });
  await np.addInitScript(() => {
    localStorage.setItem('vector-math.e2e', 'true');
    localStorage.setItem('vector-math.intro.seen', 'true');
    localStorage.setItem('vector-math.progress.v1', JSON.stringify({ free: true, views: {} }));
  });
  np.on('pageerror', (e) => errors.push(`[narrow] pageerror: ${e.message}`));
  np.on('console', (m) => m.type() === 'error' && errors.push(`[narrow] console.error: ${m.text()}`));
  await np.goto(url);
  await np.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
  await np.evaluate(() => window.__vm.go('constants/euler'));
  await np.waitForTimeout(800);
  const vpW = await np.evaluate(() => document.querySelector('.viewport').getBoundingClientRect().width);
  const hidden = await np.evaluate(() => getComputedStyle(document.querySelector('#app > .rail')).visibility === 'hidden');
  await np.locator('.rail-toggle').click();
  await np.waitForTimeout(400);
  const drawer = await np.evaluate(() => {
    const r = document.querySelector('#app > .rail').getBoundingClientRect();
    const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return document.querySelector('#app > .rail').contains(t);
  });
  await np.keyboard.press('Escape');
  await np.waitForTimeout(400);
  const closed = await np.evaluate(() => !document.body.classList.contains('rail-open'));
  const narrowOk = vpW >= 600 && hidden && drawer && closed;
  if (!narrowOk) errors.push(`[narrow] vue ${vpW} px · rail replié ${hidden} · tiroir ${drawer} · fermé ${closed}`);
  features.push(`FENÊTRE 960 vue ${Math.round(vpW)} px · tiroir MODULES ${narrowOk ? 'ok' : 'KO'}`);
  await np.close();
}

// school keys (docs/ECOLES.md, phases 1 and 1b). The default theme stays black and white (checked on
// the main page, no key). The keys run on dist-smoke/ (npm run build:smoke: accounts configured with a
// fake server, .env.smoke), whose server is simulated with page.route (key_open / key_ping, no network):
// a key in the address → the school's card → its start route, every lock open, badge and accent; an
// ended trial → the blocking screen (contact, new key field); a new key reopens the app; an unknown key
// → « Clé refusée », then CONTINUER SANS CLÉ. Then the licence set on a PC by the installation kit
// (window.v3ct0rDesktop, as electron/preload.cjs gives it): no card, LICENCE, the notice of the last
// days; every seat taken → blocking screen; the server out of reach → RÉESSAYER, or go on without it.
current = 'school';
{
  const theme = await page.evaluate(() => {
    const b = document.createElement('button');
    b.className = 'btn on';
    document.body.append(b);
    const c = getComputedStyle(b);
    const r = { accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), bg: c.backgroundColor, color: c.color, border: c.borderTopColor, enabled: window.__vm.school().enabled };
    b.remove();
    return r;
  });
  const themeOk = theme.bg === 'rgb(255, 255, 255)' && theme.color === 'rgb(0, 0, 0)' && theme.border === 'rgb(255, 255, 255)';
  if (!themeOk) errors.push(`[école] thème par défaut modifié ${JSON.stringify(theme)}`);
  const schoolFile = resolve('dist-smoke/index.html');
  if (!existsSync(schoolFile)) features.push(`ÉCOLE non testée (dist-smoke absent : npm run build:smoke) · thème par défaut ${themeOk ? 'ok' : 'KO'}`);
  else {
    const surl = pathToFileURL(schoolFile).href;
    const KEY = 'AAAAABBBBBCCCCCDDDDD';
    const LOGO = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#2255cc"/><path d="M3 7 5 2 7 7z" fill="#fff"/></svg>').toString('base64')}`;
    const srv = { state: 'active', kind: 'trial', seats: 0, used: 0, days: 20, offline: false, opens: 0, pings: 0, devices: new Set() };
    const row = (key) =>
      key === KEY
        ? { state: srv.state, kind: srv.kind, school_name: 'Lycée Smoke', logo: LOGO, accent: '#2255cc', start_route: '#/learn/riemann', ends_at: new Date(Date.now() + (srv.state === 'expired' ? -1 : srv.days) * 86_400_000 - 3_600_000).toISOString(), seats: srv.seats, seats_used: srv.used, server_now: new Date().toISOString() }
        : { state: 'unknown', kind: null, school_name: null, logo: null, accent: null, start_route: null, ends_at: null, seats: null, seats_used: null, server_now: new Date().toISOString() };
    // a browser context of its own: the key kept by these pages never reaches the other pages;
    // `desktop`: what electron/preload.cjs hands the page (the licence of the PC, its device id)
    const schoolPage = async (desktop = null) => {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 850 } });
      const p = await ctx.newPage();
      await p.addInitScript((d) => {
        localStorage.setItem('vector-math.e2e', 'true');
        localStorage.setItem('vector-math.intro.seen', 'true');
        if (d) Object.defineProperty(window, 'v3ct0rDesktop', { value: Object.freeze(d) });
      }, desktop);
      p.on('pageerror', (e) => errors.push(`[école] pageerror: ${e.message}`));
      p.on('console', (m) => m.type() === 'error' && !(srv.offline && /ERR_FAILED|Failed to load resource/.test(m.text())) && errors.push(`[école] console.error: ${m.text()}`));
      await p.route('**/rest/v1/rpc/key_open', (r) => {
        if (srv.offline) return r.abort('internetdisconnected');
        srv.opens++;
        const a = JSON.parse(r.request().postData() || '{}');
        if (a.p_device) srv.devices.add(a.p_device);
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([row(a.p_key)]) });
      });
      await p.route('**/rest/v1/rpc/key_ping', (r) => {
        if (srv.offline) return r.abort('internetdisconnected');
        srv.pings++;
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ state: srv.state, ends_at: row(KEY).ends_at, server_now: new Date().toISOString() }]) });
      });
      return { ctx, p };
    };
    let { ctx, p: sp } = await schoolPage();
    const boot = async (u) => {
      await sp.goto(u);
      await sp.waitForTimeout(300);
      await sp.keyboard.press('Space');
    };
    // 1. the link of the mail
    await boot(`${surl}?essai=aaaaa-bbbbb-ccccc-ddddd`);
    await sp.waitForSelector('.wl-card.sc-card .sc-head', { timeout: 15000 });
    const card = await sp.evaluate(() => ({ title: document.querySelector('.sc-card .wl-title')?.textContent ?? '', logo: !!document.querySelector('.sc-card img.sc-logo'), border: getComputedStyle(document.querySelector('.sc-card')).borderTopColor, notice: document.querySelector('.sc-card')?.textContent?.includes('compte les ouvertures') ?? false, url: location.href }));
    if (shots) await sp.screenshot({ path: join(shots, 'school__1-trial-card.png') });
    await sp.locator('.sc-card button', { hasText: 'COMMENCER L’ESSAI' }).click();
    await sp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
    await sp.waitForTimeout(1500);
    const run = await sp.evaluate(() => {
      const b = document.querySelector('.sc-badge');
      const tab = document.querySelector('.tabs .tab[aria-selected="true"]');
      return { ...window.__vm.school(), hash: location.hash, course: window.__vm.learnState().course, badge: b && getComputedStyle(b).display !== 'none' ? b.textContent : '', tabBg: tab ? getComputedStyle(tab).backgroundColor : '', url: location.href };
    });
    if (shots) await sp.screenshot({ path: join(shots, 'school__2-running.png') });
    const enabled = await sp.evaluate(() => window.__vm.school().enabled);
    if (!enabled) errors.push('[école] dist-smoke sans comptes configurés (.env.smoke)');
    const startOk = card.title === 'Lycée Smoke' && card.logo && card.border === 'rgb(34, 85, 204)' && card.notice && !card.url.includes('essai=');
    const runOk = run.state === 'active' && run.course === 'riemann' && run.badge.includes('Lycée Smoke') && run.accent === '#2255cc' && run.tabBg === 'rgb(34, 85, 204)' && srv.opens === 1;
    if (!startOk) errors.push(`[école] carte d’essai ${JSON.stringify(card)}`);
    if (!runOk) errors.push(`[école] essai en cours ${JSON.stringify({ ...run, opens: srv.opens })}`);
    // the same trial on a phone (src/hud/phone.css): the badge fits on the first row with the sections
    await sp.setViewportSize({ width: 375, height: 812 });
    await sp.waitForTimeout(500);
    const phone = await sp.evaluate(() => {
      const bar = document.querySelector('.topbar').getBoundingClientRect();
      const b = document.querySelector('.sc-badge').getBoundingClientRect();
      const tabs = [...document.querySelectorAll('.tabs .tab')].map((t) => t.getBoundingClientRect());
      return { bar: Math.round(bar.height), badge: b.width > 0 && b.right <= innerWidth, row: tabs.every((t) => Math.abs(t.top - b.top) < 12 && t.right <= innerWidth + 0.5), page: document.documentElement.scrollWidth <= innerWidth };
    });
    if (shots) await sp.screenshot({ path: join(shots, 'school__4-phone.png') });
    const phoneOk = phone.bar === 66 && phone.badge && phone.row && phone.page;
    if (!phoneOk) errors.push(`[école] badge sur téléphone ${JSON.stringify(phone)}`);
    await sp.setViewportSize({ width: 1400, height: 850 });
    // 2. the trial ends: next opening → the blocking screen
    srv.state = 'expired';
    await boot(surl);
    await sp.waitForSelector('.wl-card.sc-card input.sc-input', { timeout: 15000 });
    const ended = await sp.evaluate(() => ({ text: document.querySelector('.sc-card')?.textContent ?? '', mail: !!document.querySelector('.sc-card a.sc-mail'), field: !!document.querySelector('.sc-card input.sc-input') }));
    if (shots) await sp.screenshot({ path: join(shots, 'school__3-ended.png') });
    const endedOk = ended.text.includes('ESSAI TERMINÉ') && ended.text.includes('Lycée Smoke') && ended.field && (ended.mail || ended.text.includes('contacte la personne'));
    if (!endedOk) errors.push(`[école] écran de fin ${JSON.stringify(ended)}`);
    // 3. a new key reopens the app
    srv.state = 'active';
    await sp.fill('.sc-card input.sc-input', 'AAAAA-BBBBB-CCCCC-DDDDD');
    // accepted while the app runs: the page reloads to read the new trial everywhere
    await Promise.all([sp.waitForEvent('load', { timeout: 15000 }), sp.locator('.sc-card button', { hasText: 'VALIDER' }).click()]);
    await sp.waitForTimeout(300);
    await sp.keyboard.press('Space');
    await sp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
    const reopened = await sp.evaluate(() => window.__vm.school().state);
    if (reopened !== 'active') errors.push(`[école] nouvelle clé : ${reopened}`);
    // 4. an unknown key, on a fresh profile: refused, then the app without a trial (e2e skips the account)
    await ctx.close();
    ({ ctx, p: sp } = await schoolPage());
    await boot(`${surl}?essai=ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ`);
    await sp.waitForSelector('.wl-card .sc-code', { timeout: 15000 });
    const refused = await sp.evaluate(() => document.querySelector('.wl-card .wl-title')?.textContent ?? '');
    await sp.locator('.wl-card button', { hasText: 'CONTINUER SANS CLÉ' }).click();
    await sp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
    const after = await sp.evaluate(() => ({ ...window.__vm.school(), badge: getComputedStyle(document.querySelector('.sc-badge')).display }));
    const refusedOk = refused === 'Clé refusée' && after.state === null && after.badge === 'none' && after.accent === '#fff';
    if (!refusedOk) errors.push(`[école] clé inconnue ${JSON.stringify({ refused, ...after })}`);
    const trialOpens = srv.opens;
    // 5. the licence set on the PC by the installation kit: checked with no card, every lock open,
    //    LICENCE in the badge, the PC's device id sent for the seats, the notice of the last 3 days
    await ctx.close();
    Object.assign(srv, { state: 'active', kind: 'licence', seats: 30, used: 3, days: 3, opens: 0 });
    const DEVICE = 'a'.repeat(64);
    ({ ctx, p: sp } = await schoolPage({ machineKey: 'aaaaa-bbbbb-ccccc-ddddd', device: DEVICE }));
    await boot(surl);
    await sp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
    await sp.waitForTimeout(3000);
    const lic = await sp.evaluate(() => ({ ...window.__vm.school(), card: !!document.querySelector('.wl-card'), badge: document.querySelector('.sc-badge')?.textContent ?? '', toast: document.querySelector('.toast')?.textContent ?? '' }));
    if (shots) await sp.screenshot({ path: join(shots, 'school__5-licence.png') });
    const licOk = lic.state === 'active' && lic.kind === 'licence' && lic.source === 'machine' && lic.seats === '3/30' && !lic.card && lic.badge.includes('LICENCE') && lic.badge.includes('J-3') && /LA LICENCE SE TERMINE DANS 3 JOURS/.test(lic.toast) && srv.devices.has(DEVICE) && srv.opens === 1;
    if (!licOk) errors.push(`[école] licence du poste ${JSON.stringify({ ...lic, opens: srv.opens, devices: [...srv.devices].map((d) => d.slice(0, 8)) })}`);
    // 6. every seat of the licence taken by other PCs: the blocking screen says so
    await ctx.close();
    Object.assign(srv, { state: 'full', used: 30, days: 200 });
    ({ ctx, p: sp } = await schoolPage({ machineKey: 'aaaaa-bbbbb-ccccc-ddddd', device: 'b'.repeat(64) }));
    await boot(surl);
    await sp.waitForSelector('.wl-card.sc-card input.sc-input', { timeout: 15000 });
    const full = await sp.evaluate(() => document.querySelector('.sc-card')?.textContent ?? '');
    if (shots) await sp.screenshot({ path: join(shots, 'school__6-full.png') });
    const fullOk = full.includes('POSTES COMPLETS') && full.includes('30 postes') && full.includes('référent numérique');
    if (!fullOk) errors.push(`[école] postes complets : ${full.slice(0, 160)}`);
    // 7. the server out of reach on the first opening of a PC: RÉESSAYER, or go on without the licence
    await ctx.close();
    Object.assign(srv, { state: 'active', offline: true });
    ({ ctx, p: sp } = await schoolPage({ machineKey: 'aaaaa-bbbbb-ccccc-ddddd', device: 'c'.repeat(64) }));
    await boot(surl);
    await sp.waitForSelector('.wl-card.sc-card button', { timeout: 15000 });
    await sp.waitForFunction(() => /RÉESSAYER/.test(document.querySelector('.wl-card')?.textContent ?? ''), null, { timeout: 15000 });
    const off = await sp.evaluate(() => document.querySelector('.wl-card')?.textContent ?? '');
    if (shots) await sp.screenshot({ path: join(shots, 'school__7-offline.png') });
    await sp.locator('.wl-card button', { hasText: 'CONTINUER SANS LA LICENCE' }).click();
    await sp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
    const offAfter = await sp.evaluate(() => window.__vm.school().state);
    const offOk = off.includes('Serveur de licence injoignable') && off.includes('référent numérique') && offAfter === null;
    if (!offOk) errors.push(`[école] serveur injoignable : ${JSON.stringify({ card: off.slice(0, 120), after: offAfter })}`);
    srv.offline = false;
    features.push(`ÉCOLE carte ${startOk ? 'ok' : 'KO'} · vue de départ + verrous + badge + accent ${runOk ? 'ok' : 'KO'} · badge téléphone ${phoneOk ? 'ok' : 'KO'} · fin d’essai ${endedOk ? 'ok' : 'KO'} · nouvelle clé ${reopened === 'active' ? 'ok' : 'KO'} · clé inconnue ${refusedOk ? 'ok' : 'KO'} · thème par défaut ${themeOk ? 'ok' : 'KO'} (${trialOpens} key_open simulés) · LICENCE DU POSTE sans carte + avis J-3 ${licOk ? 'ok' : 'KO'} · postes complets ${fullOk ? 'ok' : 'KO'} · serveur injoignable ${offOk ? 'ok' : 'KO'}`);
    await ctx.close();
  }
}

// phone (375 × 812, touch): one column, the top bar on two rows, the panel as a sheet under the view
// (src/hud/phone.css). Every step is done with real taps and a real touch drag, then checked for horizontal overflow.
current = 'phone';
{
  const pp = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pp.addInitScript(() => {
    localStorage.setItem('vector-math.e2e', 'true');
    localStorage.setItem('vector-math.intro.seen', 'true');
    localStorage.setItem('vector-math.progress.v1', JSON.stringify({ free: true, views: {} }));
  });
  pp.on('pageerror', (e) => errors.push(`[phone] pageerror: ${e.message}`));
  pp.on('console', (m) => m.type() === 'error' && errors.push(`[phone] console.error: ${m.text()}`));
  const bad = [];
  const shot = async (name) => shots && (await pp.screenshot({ path: join(shots, `phone-${name}.png`) }));
  // what sticks out sideways: the page, the top bar, the tools strip, a tab cut by the edge
  const overflow = (where) =>
    pp.evaluate((where) => {
      const W = innerWidth;
      const els = { page: document.documentElement, topbar: document.querySelector('.topbar'), tools: document.querySelector('.tb-tools'), reader: document.querySelector('.lw') };
      const out = Object.entries(els).filter(([, e]) => e && e.scrollWidth > e.clientWidth + 1).map(([k, e]) => `${k} ${e.scrollWidth}>${e.clientWidth}`);
      for (const t of document.querySelectorAll('.tabs .tab')) {
        const b = t.getBoundingClientRect();
        if (b.width === 0 || b.left < 0 || b.right > W + 0.5) out.push(`onglet ${t.textContent} coupé`);
      }
      // the open sheet: no text cut by its right edge (display formulas scroll on their own)
      const sheet = [...document.querySelectorAll('#app > .panel')].find((p) => p.offsetParent && !document.body.classList.contains('sheet-min'));
      if (sheet) {
        const R = sheet.getBoundingClientRect().right;
        for (const e of sheet.querySelectorAll('*')) {
          if (!e.getClientRects().length || e.closest('.katex-display') || (e instanceof SVGElement && e.closest('.katex'))) continue;
          if (e.getBoundingClientRect().right > R + 0.5) {
            out.push(`panneau : « ${(e.textContent ?? '').trim().slice(0, 40)} » coupé`);
            break;
          }
        }
      }
      return out.map((x) => `${where} : ${x}`);
    }, where);
  const box = (sel) => pp.evaluate((sel) => {
    const e = document.querySelector(sel);
    if (!e || !e.offsetParent) return { w: 0, h: 0 };
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  }, sel);
  const mode = () => pp.evaluate(() => (document.body.classList.contains('atlas') ? 'atlas' : document.body.classList.contains('learn') ? 'learn' : 'explore'));
  await pp.goto(url);
  await pp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
  await pp.waitForTimeout(600);
  if ((await mode()) !== 'atlas') bad.push(`accueil ${await mode()} au lieu de l’ATLAS`);
  bad.push(...(await overflow('ATLAS')));
  await shot('atlas');
  // real touches (CDP): one finger held on an element (optionally sliding by dx), two fingers that spread
  const cdp = await pp.context().newCDPSession(pp);
  const press = async (sel, ms, dx = 0) => {
    const b = await pp.locator(sel).boundingBox();
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let k = 1; k <= Math.ceil(ms / 50); k++) {
      if (dx) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * Math.min(1, k / 4), y }] });
      await pp.waitForTimeout(50);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const spread = async (sel) => {
    const b = await pp.locator(sel).boundingBox();
    const x = b.x + b.width / 2;
    const y = b.y + b.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 20, y, id: 1 }, { x: x + 20, y, id: 2 }] });
    for (let k = 1; k <= 8; k++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 20 - 12 * k, y, id: 1 }, { x: x + 20 + 12 * k, y, id: 2 }] });
      await pp.waitForTimeout(30);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };

  // ATLAS by touch (atlas.ts buildTouch): AVANCER held moves the ship, the pad turns it
  const at0 = await pp.evaluate(() => window.__vm.atlasState());
  const pad = await pp.locator('.atlas-touch .at-stick').count();
  await press('.at-pad .at-b:nth-child(2)', 1200);
  await press('.atlas-touch .at-stick', 800, 50);
  await pp.waitForTimeout(300);
  const at1 = await pp.evaluate(() => window.__vm.atlasState());
  const moved = Math.hypot(at1.pos[0] - at0.pos[0], at1.pos[1] - at0.pos[1], at1.pos[2] - at0.pos[2]);
  if (!pad || moved < 1 || Math.abs(at1.yaw - at0.yaw) < 0.01) bad.push(`ATLAS au doigt : pad ${pad} · déplacement ${moved.toFixed(1)} · cap ${(at1.yaw - at0.yaw).toFixed(3)}`);
  const atlasTouch = `${moved.toFixed(0)} u`;

  // EXPLORER, then a view picked in the MODULES drawer
  await pp.tap('.tabs .tab:nth-child(2)');
  await pp.waitForTimeout(900);
  if ((await mode()) !== 'explore') bad.push('onglet EXPLORER sans effet');
  await pp.tap('.rail-toggle');
  await pp.waitForTimeout(400);
  const drawer = await pp.evaluate(() => document.body.classList.contains('rail-open'));
  const target = pp.locator('#app > .rail .mod.active .viz-btn:not(.intro)').nth(1);
  const viewTitle = (await target.textContent())?.trim() ?? '';
  await target.tap();
  await pp.waitForTimeout(900);
  const opened = await pp.evaluate(() => ({ title: document.querySelector('.panel-title')?.textContent ?? '', closed: !document.body.classList.contains('rail-open') }));
  if (!drawer || !opened.closed || opened.title.trim() !== viewTitle) bad.push(`vue « ${viewTitle} » par le tiroir : ouvert ${drawer} · ouverte « ${opened.title} » · refermé ${opened.closed}`);
  const vp = await box('.viewport');
  const sheet = await box('#app > .panel:not(.lpanel)');
  if (vp.w < 375 || vp.h < 250 || sheet.h < 250) bad.push(`explorateur : vue ${vp.w}×${vp.h} · feuille ${sheet.h} px`);
  bad.push(...(await overflow('EXPLORER')));
  await shot('explorer');
  // the grip folds the sheet (the view gets the height) and opens it again
  await pp.tap('.sheet-grip');
  await pp.waitForTimeout(500);
  const folded = await box('.viewport');
  await pp.tap('.sheet-grip');
  await pp.waitForTimeout(500);
  const reopened = await box('#app > .panel:not(.lpanel)');
  if (folded.h < vp.h + 200 || reopened.h < 250) bad.push(`poignée : vue repliée ${folded.h} px · feuille rouverte ${reopened.h} px`);
  // two fingers zoom a 2D view (gfx/panzoom.ts): the ZOOM read-out of Mandelbrot changes
  await pp.evaluate(() => window.__vm.go('fractals/mandelbrot'));
  await pp.waitForTimeout(700);
  const zoomOf = () => pp.evaluate(() => [...document.querySelectorAll('.vp-stats .k')].find((k) => k.textContent === 'ZOOM')?.nextElementSibling?.textContent ?? '');
  const z0 = await zoomOf();
  await spread('.viewport canvas.ov2d');
  await pp.waitForTimeout(300);
  const z1 = await zoomOf();
  if (!z0 || z0 === z1) bad.push(`deux doigts sur Mandelbrot : zoom ${z0} → ${z1}`);
  // every view at phone size: no error (narrow layouts), the page never wider than the screen
  const allViews = await pp.evaluate(() => window.__vm.views());
  for (const v of allViews) {
    await pp.evaluate((v) => window.__vm.go(v), v);
    await pp.waitForTimeout(220);
  }
  bad.push(...(await overflow('46 vues')));
  // AIDE on a touch screen: the gestures, not the keys
  await pp.tap('.tb-tools .tb-btn:last-child');
  await pp.waitForTimeout(300);
  const aide = await pp.evaluate(() => ({ touch: !!document.querySelector('.dlg .keymap.touch'), rows: document.querySelectorAll('.dlg .keymap .row').length }));
  if (!aide.touch || aide.rows < 5) bad.push(`AIDE au doigt : ${JSON.stringify(aide)}`);
  await pp.keyboard.press('Escape');
  await pp.waitForTimeout(200);

  // LEARN: the graph turns under one finger (OrbitControls: .grabbing while the drag lasts)
  await pp.tap('[data-act=tab-learn]');
  await pp.waitForTimeout(1200);
  if ((await mode()) !== 'learn') bad.push('onglet LEARN sans effet');
  const graph = await box('.viewport');
  if (graph.w < 375 || graph.h < 250) bad.push(`graphe LEARN ${graph.w}×${graph.h}`);
  const gb = await pp.locator('.viewport canvas.ov2d').boundingBox();
  const tx = gb.x + gb.width * 0.25;
  const ty = gb.y + gb.height * 0.5;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] });
  for (let k = 1; k <= 10; k++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx + 18 * k, y: ty + 3 * k }] });
    await pp.waitForTimeout(16);
  }
  const grabbing = await pp.evaluate(() => document.querySelector('.viewport canvas.ov2d').classList.contains('grabbing'));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await pp.waitForTimeout(200);
  const released = await pp.evaluate(() => !document.querySelector('.viewport canvas.ov2d').classList.contains('grabbing'));
  const touchAction = await pp.evaluate(() => getComputedStyle(document.querySelector('.viewport canvas.ov2d')).touchAction);
  if (!grabbing || !released || touchAction !== 'none') bad.push(`graphe au doigt : glissé ${grabbing} · relâché ${released} · touch-action ${touchAction}`);
  bad.push(...(await overflow('LEARN')));
  await shot('learn');

  // a written course, opened from the sheet: the reader takes the whole width and height, the sheet folds
  await pp.evaluate(() => window.__vm.learnGraph({ pick: 'c:nombres-complexes' }));
  await pp.waitForTimeout(500);
  await pp.tap('.lpanel .panel-actions .btn.on');
  await pp.waitForTimeout(900);
  const reader = await box('.lw');
  const min = await pp.evaluate(() => document.body.classList.contains('sheet-min'));
  if (reader.w < 375 || reader.h < 600 || !min) bad.push(`cours écrit : lecteur ${reader.w}×${reader.h} · feuille repliée ${min}`);
  await pp.evaluate(() => document.querySelector('.lw').scrollTo(0, 4000));
  await pp.waitForTimeout(200);
  bad.push(...(await overflow('cours écrit')));
  await shot('reader');

  // the video player: its transport bar fits in its own height
  await pp.evaluate(() => window.__vm.learn('riemann'));
  await pp.waitForTimeout(900);
  const bar = await pp.evaluate(() => {
    const b = document.querySelector('.lx-bar');
    if (!b) return 'absente';
    const r = b.getBoundingClientRect();
    const out = [...b.children].filter((e) => e.offsetParent && (e.getBoundingClientRect().top < r.top - 0.5 || e.getBoundingClientRect().bottom > r.bottom + 0.5 || e.getBoundingClientRect().right > r.right + 0.5));
    return out.map((e) => e.className).join(', ');
  });
  if (bar) bad.push(`barre de lecture : ${bar} hors de la barre`);
  bad.push(...(await overflow('cours vidéo')));
  await shot('player');
  // the scenes on a portrait stage (stage.ts PORTRAIT_SLOTS): every formula inside its slot, every object inside the stage
  for (const [c, t] of [['demo', 30], ['reduction', 300], ['riemann', 200]]) {
    await pp.evaluate(([c, t]) => window.__vm.learn(c, t), [c, t]);
    await pp.waitForTimeout(1400);
    const out = await pp.evaluate(() => {
      const st = document.querySelector('.lx').getBoundingClientRect();
      const bad = [];
      for (const e of document.querySelectorAll('.lx-eq')) {
        const s = e.getBoundingClientRect();
        const i = e.querySelector('.lx-eq-in').getBoundingClientRect();
        if (i.left < s.left - 2 || i.right > s.right + 2) bad.push(`formule ${Math.round(i.left)}…${Math.round(i.right)} hors de ${Math.round(s.left)}…${Math.round(s.right)}`);
      }
      for (const e of document.querySelectorAll('.lx-obj')) {
        const r = e.getBoundingClientRect();
        if (r.left < st.left - 1 || r.right > st.right + 1) bad.push(`${e.getAttribute('class')} hors de la scène`);
      }
      return bad;
    });
    for (const b of out) bad.push(`cours ${c} à ${t} s : ${b}`);
  }
  // the 11 leçons-jeux by taps: COMMENCER, the game's own buttons (engine.ts touchKeys), ✕ back to the briefing
  const GK = { 'duel-eps': 2, 'eigen-hunt': 4, 'fourier-painter': 0, 'pilot-4d': 3, 'mandel-dive': 1, 'buffon-casino': 2, 'prime-hunt': 0, babylon: 4, euclid: 0, eratosthenes: 4, archimedes: 0 };
  for (const [g, n] of Object.entries(GK)) {
    await pp.evaluate((g) => window.__vm.learn(`game:${g}`), g);
    await pp.waitForTimeout(700);
    // the panel gives the touch rules (GameDef.touchRules): no key, click or wheel left in them
    const rules = await pp.evaluate(() => [...document.querySelectorAll('.panel .sec-title')].find((e) => e.textContent === 'RÈGLES')?.nextElementSibling?.textContent ?? '');
    if (!rules || /\bclic|\bclique|molette|\bmaj\b|⏎|←|→|↑|↓|touches? (maintenues|\d)/i.test(rules)) bad.push(`jeu ${g} : règles au clavier sur téléphone « ${rules.slice(0, 80)} »`);
    await pp.tap('.game-touch .gt-b.go');
    await pp.waitForTimeout(400);
    const s = await pp.evaluate(() => ({ phase: window.__vm.gameState()?.phase, keys: document.querySelectorAll('.game-touch .gt-b.gk').length, h: Math.round(document.querySelector('.viewport').getBoundingClientRect().height) }));
    if (s.phase !== 'play' || s.keys !== n || s.h < 600) bad.push(`jeu ${g} au doigt : ${JSON.stringify(s)} (attendu ${n} bouton(s), vue pleine hauteur)`);
    if (g === 'duel-eps') {
      await pp.tap('.game-touch .gt-b.go');
      await pp.waitForTimeout(300);
      const p = await pp.evaluate(() => window.__vm.gameState()?.phase);
      if (p !== 'reveal') bad.push(`jeu duel-eps : VALIDER → ${p}`);
    } else {
      await pp.tap('.game-touch .gt-b:not(.gk):not(.go)');
      await pp.waitForTimeout(250);
      const p = await pp.evaluate(() => window.__vm.gameState()?.phase);
      if (p !== 'brief') bad.push(`jeu ${g} : ✕ → ${p}`);
    }
    bad.push(...(await overflow(`jeu ${g}`)));
  }
  await shot('game');
  await pp.close();

  // tablet (768 × 1024): the tools strip of the top bar scrolls instead of being cut by the edge
  const tp = await browser.newPage({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true });
  await tp.addInitScript(() => {
    localStorage.setItem('vector-math.e2e', 'true');
    localStorage.setItem('vector-math.intro.seen', 'true');
  });
  tp.on('pageerror', (e) => errors.push(`[tablet] pageerror: ${e.message}`));
  await tp.goto(url);
  await tp.waitForFunction(() => window.__vm?.ready === true, null, { timeout: 15000 });
  await tp.evaluate(() => window.__vm.go('constants/euler'));
  await tp.waitForTimeout(800);
  const tab = await tp.evaluate(() => {
    const t = document.querySelector('.topbar');
    const tools = document.querySelector('.tb-tools');
    tools.scrollLeft = tools.scrollWidth;
    const help = [...tools.querySelectorAll('.tb-btn')].pop().getBoundingClientRect();
    return { top: t.scrollWidth <= t.clientWidth, help: help.right <= innerWidth + 0.5 && help.width > 0, vp: Math.round(document.querySelector('.viewport').getBoundingClientRect().width) };
  });
  if (!tab.top || !tab.help || tab.vp < 440) bad.push(`tablette 768 : barre ${tab.top ? 'ok' : 'coupée'} · AIDE atteignable ${tab.help} · vue ${tab.vp} px`);
  await tp.close();

  for (const b of bad) errors.push(`[phone] ${b}`);
  features.push(`TÉLÉPHONE 375 onglets · tiroir · feuille · ATLAS au doigt ${atlasTouch} · zoom à deux doigts · 46 vues · gestes · graphe au doigt · cours écrit · scènes portrait · 11 jeux au tap et règles tactiles ${bad.length ? `KO (${bad.length})` : 'ok'} · TABLETTE 768 vue ${tab.vp} px`);
}

// first-run prompt on a fresh profile
current = 'first-run';
const fresh = await browser.newPage({ viewport: { width: 1400, height: 850 } });
await fresh.addInitScript(() => localStorage.setItem('vector-math.e2e', 'true'));
fresh.on('pageerror', (e) => errors.push(`[first-run] pageerror: ${e.message}`));
await fresh.goto(url);
await fresh.waitForTimeout(300);
await fresh.keyboard.press('Space');
await fresh.waitForTimeout(1800);
const prompt = await fresh.evaluate(() => document.querySelector('.dlg')?.textContent ?? '');
if (!prompt.includes('PREMIÈRE VISITE')) errors.push('[first-run] tutorial prompt not shown');
features.push(`INVITATION 1ʳᵉ VISITE ${prompt.includes('PREMIÈRE VISITE') ? 'ok' : 'KO'}`);

await browser.close();
console.log(timings.join('\n'));
console.log(`shell: palette ${palItems} item(s) · keymap ${keymapOpen ? 'ok' : 'KO'} · Σ ${sigmaOpen ? 'ok' : 'KO'} · défi ${quizOpen ? 'ok' : 'KO'}`);
console.log(`features: ${features.join(' · ')}`);
if (errors.length) {
  console.error(`\n✕ ${errors.length} erreur(s):\n` + errors.slice(0, 60).join('\n'));
  process.exit(1);
}
console.log(`\n✓ ${views.length} vue(s) sans erreur console.`);
