import { h } from '../hud/dom';
import { barcode, icon, hexId } from '../hud/deco';
import { Sparkline } from '../hud/telemetry';
import { logoSymbol, animatedWordmark } from '../hud/logo';
import type { ModuleDef, ModuleId } from '../core/types';

export interface ModEls {
  root: HTMLElement;
  btn: HTMLButtonElement;
  vizBtns: HTMLButtonElement[];
  /** opens the 30-second intro of the module (hidden when the module has none) */
  introBtn: HTMLButtonElement;
}

export interface Layout {
  app: HTMLElement;
  crumbs: HTMLElement;
  hex: HTMLElement;
  uptime: HTMLElement;
  clock: HTMLElement;
  fps: HTMLElement;
  recTime: HTMLElement;
  btnPalette: HTMLButtonElement;
  btnQuality: HTMLButtonElement;
  btnSound: HTMLButtonElement;
  btnMusic: HTMLButtonElement;
  btnCalc: HTMLButtonElement;
  btnAccount: HTMLButtonElement;
  btnDownload: HTMLButtonElement;
  btnScan: HTMLButtonElement;
  btnHelp: HTMLButtonElement;
  mods: Map<ModuleId, ModEls>;
  btnChallenge: HTMLButtonElement;
  btnCinematic: HTMLButtonElement;
  btnTuto: HTMLButtonElement;
  btnLesson: HTMLButtonElement;
  railCount: HTMLElement;
  railBar: HTMLElement;
  railRank: HTMLElement;
  btnTours: HTMLButtonElement;
  viewport: HTMLElement;
  glCanvas: HTMLCanvasElement;
  overlay: HTMLCanvasElement;
  glitchLayer: HTMLElement;
  panelSys: HTMLElement;
  panelHex: HTMLElement;
  panelTitle: HTMLElement;
  panelSub: HTMLElement;
  btnSigma: HTMLButtonElement;
  btnPng: HTMLButtonElement;
  btnRec: HTMLButtonElement;
  btnPause: HTMLButtonElement;
  panelBody: HTMLElement;
  panelFootCode: HTMLElement;
  panelFootKanji: HTMLElement;
  panelBarcode: HTMLElement;
  /** YouTube suggestions for the current view (between the controls and the footer) */
  panelVideos: HTMLElement;
  statusSys: HTMLElement;
  statusView: HTMLElement;
  statusGl: HTMLElement;
  statusSpark: Sparkline;
  cineC1: HTMLElement;
  cineC2: HTMLElement;
  cineBar: HTMLElement;
  tabExplore: HTMLButtonElement;
  tabLearn: HTMLButtonElement;
  tabAtlas: HTMLButtonElement;
  learnRail: HTMLElement;
  learnPanel: HTMLElement;
  btnLearn: HTMLButtonElement;
}

const tbBtn = (label: string, ico: string, title: string): HTMLButtonElement =>
  h('button', { type: 'button', class: 'tb-btn', title, 'aria-label': title }, icon(ico), label ? h('span', { text: label }) : null);

export function buildLayout(host: HTMLElement, modules: ModuleDef[]): Layout {
  // top bar
  const wm = animatedWordmark('V3CT0R');
  const brand = h('div', { class: 'brand', title: 'V3CT0R' }, logoSymbol(20), wm.el);
  brand.addEventListener('pointerenter', () => wm.burst());
  const tabExplore = h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': 'true', title: 'Explorateur : les 46 visualisations' }, h('span', { text: 'EXPLORER' }));
  const tabLearn = h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': 'false', title: 'Cours de la prépa au doctorat' }, h('span', { text: 'LEARN' }), h('span', { class: 'kanji', text: '学' }));
  const tabAtlas = h('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': 'false', title: 'ATLAS : tout le logiciel en vaisseau spatial (ZQSD)' }, h('span', { text: 'ATLAS' }), h('span', { class: 'kanji', text: '空間' }));
  const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Sections' }, tabAtlas, tabExplore, tabLearn);
  const crumbs = h('div', { class: 'crumbs' });
  const hex = h('span', { class: 'hi', style: 'text-transform:none', text: '0x0000' });
  const uptime = h('span', { text: 'T+00:00:00' });
  const clock = h('span', { class: 'hi', text: '--:--:--' });
  const fps = h('span', { class: 'hi', text: '-- FPS' });
  const recTime = h('span', { text: 'REC 00:00' });
  const btnPalette = tbBtn('CTRL+K', 'cmd', 'Palette de commandes (Ctrl+K)');
  btnPalette.dataset.act = 'palette';
  const btnQuality = tbBtn('MED', 'quality', 'Qualité de rendu (Q)');
  const btnSound = tbBtn('SON', 'mute', 'Sons (M)');
  const btnMusic = tbBtn('MUSIQUE', 'sound', 'Musique de fond (clic droit : volume)');
  const btnCalc = tbBtn('CALC', 'calc', 'Calculatrice et raccourcis de caractères (=)');
  const btnAccount = tbBtn('COMPTE', 'user', 'Compte : ta progression sur tous tes appareils');
  const btnDownload = tbBtn('TÉLÉCHARGER', 'download', 'Télécharger V3CT0R pour l’utiliser hors ligne (zip : index.html à ouvrir d’un double-clic)');
  const btnScan = tbBtn('SCAN', 'grid', 'Scanlines (L)');
  const btnHelp = tbBtn('AIDE', 'help', 'Raccourcis clavier (?)');
  const top = h(
    'header',
    { class: 'topbar' },
    brand,
    tabs,
    crumbs,
    h('div', { class: 'spacer' }),
    h('div', { class: 'meta' }, h('span', { class: 'rec-dot' }, h('i'), recTime), hex, uptime, clock, fps),
    btnPalette,
    btnQuality,
    btnSound,
    btnMusic,
    btnCalc,
    btnAccount,
    btnDownload,
    btnScan,
    btnHelp,
  );

  // rail
  const mods = new Map<ModuleId, ModEls>();
  const railCount = h('span', { class: 'rp-n', text: '0/0' });
  const railBar = h('i');
  const railRank = h('div', { class: 'rp-rank', text: 'RANG 0 · RECRUE' });
  const rail = h(
    'nav',
    { class: 'rail', 'aria-label': 'Modules' },
    h('div', { class: 'rail-head' }, h('span', { text: '[ MODULES ]' }), h('span', { text: String(modules.length).padStart(2, '0') })),
    h('div', { class: 'rail-prog', title: 'Valide 2 exercices sur 3 dans une vue pour débloquer la suivante (touche E)' }, h('div', { class: 'rp-top' }, h('span', { text: 'PROGRESSION' }), railCount), h('div', { class: 'rp-bar' }, railBar), railRank),
  );
  for (const m of modules) {
    const btn = h('button', { type: 'button', class: 'mod-btn' }, h('span', { class: 'code', text: m.code }), h('span', { text: m.title }), h('span', { class: 'kanji', text: m.kanji }));
    const introBtn = h('button', { type: 'button', class: 'viz-btn intro', title: `Intro animée du module ${m.title}, 30 s avec voix off` }, h('span', { class: 'pl', text: '▶' }), h('span', { text: 'INTRO · 30 S' }));
    const list = h('div', { class: 'viz-list' }, introBtn);
    const vizBtns = m.vizs.map((v) => {
      const b = h('button', { type: 'button', class: 'viz-btn', title: v.title }, h('span', { text: v.title }));
      list.append(b);
      return b;
    });
    const root = h('div', { class: 'mod', 'data-mod': m.id }, btn, list);
    rail.append(root);
    mods.set(m.id, { root, btn, vizBtns, introBtn });
  }
  const btnChallenge = h('button', { type: 'button', class: 'btn' }, icon('quiz'), h('span', { text: 'DÉFI' }), h('span', { class: 'k', text: 'D' }));
  const btnCinematic = h('button', { type: 'button', class: 'btn' }, icon('film'), h('span', { text: 'CINÉ' }), h('span', { class: 'k', text: 'C' }));
  const btnTuto = h('button', { type: 'button', class: 'btn' }, icon('help'), h('span', { text: 'TUTO' }), h('span', { class: 'k', text: 'T' }));
  const btnTours = h('button', { type: 'button', class: 'btn' }, icon('target'), h('span', { text: 'PARCOURS' }), h('span', { class: 'k', text: 'G' }));
  rail.append(
    h(
      'div',
      { class: 'rail-foot' },
      h('div', { class: 'row' }, btnTuto, btnTours),
      h('div', { class: 'row' }, btnChallenge, btnCinematic),
      h('div', { class: 'rail-deco' }, h('div', {}, barcode('V3CT0R', 92, 22), h('div', { style: 'margin-top:4px;font-size:9px;letter-spacing:.1em', text: 'SYS.NAV // 5 MOD' })), h('div', { class: 'kanji', text: '数学無限次元' })),
    ),
  );

  // viewport
  const glCanvas = h('canvas', { class: 'gl', 'aria-hidden': 'true' });
  const overlay = h('canvas', { class: 'ov2d', tabindex: '-1', 'aria-label': 'Vue interactive' });
  const glitchLayer = h('div', { class: 'glitch-layer' });
  const viewport = h('main', { class: 'viewport' }, glCanvas, overlay, glitchLayer);

  // panel
  const panelSys = h('span');
  const panelHex = h('span');
  const panelTitle = h('div', { class: 'panel-title' });
  const panelSub = h('div', { class: 'panel-sub' });
  const mk = (label: string, ico: string, _key: string, title: string) =>
    h('button', { type: 'button', class: 'btn', title }, icon(ico), label ? h('span', { text: label }) : null);
  const btnLesson = mk('LEÇON', 'quiz', 'E', 'Leçon et exercices (E)');
  btnLesson.dataset.act = 'lesson';
  const btnSigma = mk('FORMULE', 'sigma', 'S', 'Formule et explication (S)');
  btnSigma.dataset.act = 'sigma';
  const btnPng = mk('PNG', 'download', 'P', 'Exporter la vue en PNG haute résolution (P)');
  const btnRec = mk('REC', 'rec', 'R', 'Enregistrer en WebM (R)');
  const btnPause = mk('', 'pause', '␣', 'Pause (Espace)');
  const btnLearn = mk('→ LEARN', 'target', '', 'Le cours associé à cette vue');
  btnLearn.dataset.act = 'learn';
  btnLearn.style.display = 'none';
  const panelBody = h('div', { class: 'panel-body' });
  const panelFootCode = h('div', { style: 'font-size:9px;letter-spacing:.1em;margin-top:4px' });
  const panelFootKanji = h('div', { class: 'kanji', style: 'font-size:22px;color:var(--fg-10)' });
  const panelBarcode = h('div');
  const panelVideos = h('div', { class: 'panel-vids' });
  const panel = h(
    'aside',
    { class: 'panel', 'aria-label': 'Paramètres' },
    h('div', { class: 'panel-head' }, h('div', { class: 'panel-sys' }, panelSys, panelHex), panelTitle, panelSub, h('div', { class: 'panel-actions' }, btnLesson, btnSigma, btnPng, btnRec, btnPause, btnLearn)),
    panelBody,
    panelVideos,
    h('div', { class: 'panel-foot' }, h('div', {}, panelBarcode, panelFootCode), panelFootKanji),
  );

  // status bar
  const statusSys = h('span', { class: 'on' });
  const statusView = h('span');
  const statusGl = h('span');
  const statusSpark = new Sparkline(60, { min: 0, max: 40 }, 'spark-status');
  const status = h(
    'footer',
    { class: 'statusbar' },
    statusSys,
    statusView,
    h('span', { text: 'FRAME' }),
    statusSpark.el,
    statusGl,
    h('span', { class: 'spacer' }),
    barcode('SYS.STATUS', 80, 10),
    h('span', { text: 'CTRL+K COMMANDES · ? KEYMAP · H MASQUER' }),
  );
  statusSpark.el.style.width = '90px';
  statusSpark.el.style.height = '14px';

  // cinematic caption
  const cineC1 = h('div', { class: 'c1' });
  const cineC2 = h('div', { class: 'c2' });
  const cineBar = h('i');
  const cineCap = h('div', { class: 'cine-cap' }, cineC1, cineC2, h('div', { class: 'bar' }, cineBar));

  // LEARN occupies the rail and panel areas while its tab is active
  const learnRail = h('nav', { class: 'rail lrail', 'aria-label': 'Cours' });
  const learnPanel = h('aside', { class: 'panel lpanel', 'aria-label': 'Détails du cours' });

  const app = host;
  app.replaceChildren(top, rail, learnRail, viewport, panel, learnPanel, status);
  document.body.append(cineCap, h('div', { class: 'scanlines', 'aria-hidden': 'true' }), h('div', { id: 'print-root' }));

  return {
    app,
    crumbs,
    hex,
    uptime,
    clock,
    fps,
    recTime,
    btnPalette,
    btnQuality,
    btnSound,
    btnMusic,
    btnCalc,
    btnAccount,
    btnDownload,
    btnScan,
    btnHelp,
    mods,
    btnChallenge,
    btnCinematic,
    btnTuto,
    btnLesson,
    railCount,
    railBar,
    railRank,
    btnTours,
    viewport,
    glCanvas,
    overlay,
    glitchLayer,
    panelSys,
    panelHex,
    panelTitle,
    panelSub,
    btnSigma,
    btnPng,
    btnRec,
    btnPause,
    panelBody,
    panelFootCode,
    panelFootKanji,
    panelBarcode,
    panelVideos,
    statusSys,
    statusView,
    statusGl,
    statusSpark,
    cineC1,
    cineC2,
    cineBar,
    tabExplore,
    tabLearn,
    tabAtlas,
    learnRail,
    learnPanel,
    btnLearn,
  };
}

export { hexId };
