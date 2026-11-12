import * as THREE from 'three';
import type { Formula, ModuleDef, Quality, QualitySetting, VizContext, VizDef, VizInstance } from './types';
import { settings, saveSettings } from './settings';
import { sfx } from './audio';
import { music } from './music';
import { buildLayout, type Layout } from '../shell/layout';
import { ViewportHud } from '../shell/viewport-hud';
import { UI } from '../hud/ui';
import { h, setText } from '../hud/dom';
import { barcode, hexId, icon } from '../hud/deco';
import { glitch, scramble } from '../hud/fx';
import { Palette, type Command } from '../shell/palette';
import { Dialog, SigmaSheet, keymapDialog, toast, type KeyDoc } from '../shell/overlays';
import { openChallenge } from '../shell/challenge';
import { TourPlayer, tourMinutes, type Tour } from '../shell/tour';
import { TOURS } from '../shell/tours';
import { resetUiRegistry, uiControl, uiOption } from '../hud/ui';
import { store } from './settings';
import { Progress, CINE_NEEDED } from './progress';
import { parseHudNumber, type TaskApi } from './study';
import { StudyTerminal, type TermView } from '../shell/terminal';
import { Learn } from '../learn/learn';
import { paintVideos } from '../shell/videos';
import { Atlas } from '../atlas/atlas';
import { COURSES, TRACKS, isReady } from '../learn/courses';
import { GAMES } from '../games/registry';
import { scoresOf } from '../games/engine';
import { gameById } from '../games/registry';
import { StoryProgress, storyState, type StoryState } from '../story/progress';
import { ACTS, CHAPTERS, chapterById } from '../story/data';
import { chapterDialog, journalDialog, type StoryHooks } from '../story/ui';
import { CAMERA } from '../gfx/panzoom';
import { CalcPanel } from '../shell/calc';
import { NotesPanel } from '../shell/notes';
import { cloud } from './cloud';
import { accountDialog, reloadAfterSync } from '../shell/account';
import { DL_KEY, INSTALLER_URL, downloadKind, type DownloadKind } from '../shell/welcome-steps';

/** pseudo-module hosting LEARN's own views (course tree, empty stage) */
const LEARN_MOD = { id: 'learn', code: 'L', title: 'LEARN', kanji: '学', tagline: 'Cours', vizs: [], challenges: [] } as unknown as ModuleDef;
const ATLAS_MOD = { id: 'atlas', code: 'A', title: 'ATLAS', kanji: '空間', tagline: 'Carte du logiciel', vizs: [], challenges: [] } as unknown as ModuleDef;

export const ATLAS_KEYS: KeyDoc[] = [
  { label: 'Piloter (avancer, tourner, freiner)', keys: ['Z', 'Q', 'S', 'D'] },
  { label: 'Monter / descendre', keys: ['A', 'E'] },
  { label: 'Tangage', keys: ['↑', '↓'] },
  { label: 'Boost', keys: ['Maj'] },
  { label: 'Viser à la souris (clic pour capturer)', keys: ['Clic'] },
  { label: 'Entrer : vitesse lumière, atterrir', keys: ['⏎'] },
  { label: 'Quitter le système', keys: ['Échap'] },
  { label: 'Menus classiques', keys: ['Tab'] },
  { label: 'Chercher (et y aller)', keys: ['Ctrl', 'K'] },
  { label: 'Sons on/off', keys: ['M'] },
  { label: 'Calculatrice et raccourcis de caractères', keys: ['='] },
  { label: 'Carnet de notes', keys: ['N'] },
  { label: 'Histoire : journal, frise, hangar', keys: ['J'] },
  { label: 'ATLAS : souris libre (maintenu)', keys: ['Ctrl gauche'] },
  { label: 'Histoire : compas d’Euclide (une fois obtenu)', keys: ['X'] },
];

export const LEARN_KEYS: KeyDoc[] = [
  { label: 'Lecture / pause', keys: ['Espace'] },
  { label: 'Reculer / avancer de 5 s', keys: ['←', '→'] },
  { label: 'Vitesse − / +', keys: ['<', '>'] },
  { label: 'Sous-titres', keys: ['C'] },
  { label: 'Bruitages des intros on/off', keys: ['B'] },
  { label: 'Plein écran', keys: ['F'] },
  { label: 'Ouvrir le cours sélectionné', keys: ['⏎'] },
  { label: 'Chercher un cours, un théorème…', keys: ['Ctrl', 'K'] },
  { label: 'Fermer l’exercice / retour à l’arbre', keys: ['Échap'] },
  { label: 'Sons on/off', keys: ['M'] },
  { label: 'Calculatrice et raccourcis de caractères', keys: ['='] },
  { label: 'Carnet de notes', keys: ['N'] },
];

interface Current {
  mod: ModuleDef;
  viz: VizDef;
  idx: number;
  inst: VizInstance | null;
  disposers: (() => void)[];
  errors: number;
  broken: boolean;
  formula: Formula;
}

const QUALITY_ORDER: QualitySetting[] = ['low', 'med', 'high', 'auto'];

/** Effective level used for per-view budgets (AUTO behaves like MED, only the resolution adapts). */
const effectiveQuality = (): Quality => (settings.quality === 'auto' ? 'med' : settings.quality);
const CINE_DURATION = 16;

export const KEYS: KeyDoc[] = [
  { label: 'Palette de commandes', keys: ['Ctrl', 'K'] },
  { label: 'Raccourcis (ce panneau)', keys: ['?'] },
  { label: 'Module 01 → 06', keys: ['1', '…', '6'] },
  { label: 'Vue précédente / suivante', keys: ['←', '→'] },
  { label: 'Formule Σ', keys: ['S'] },
  { label: 'Pause / reprise', keys: ['Espace'] },
  { label: 'Mode cinématique', keys: ['C'] },
  { label: 'Mode défi', keys: ['D'] },
  { label: 'Export PNG HD', keys: ['P'] },
  { label: 'Enregistrer WebM', keys: ['R'] },
  { label: 'Qualité LOW/MED/HIGH/AUTO', keys: ['Q'] },
  { label: 'Sons on/off', keys: ['M'] },
  { label: 'Scanlines', keys: ['L'] },
  { label: 'Masquer l’interface', keys: ['H'] },
  { label: 'Plein écran', keys: ['F'] },
  { label: 'Tuto interactif', keys: ['T'] },
  { label: 'Leçon + exercices', keys: ['E'] },
  { label: 'Parcours guidés', keys: ['G'] },
  { label: 'Calculatrice et raccourcis de caractères', keys: ['='] },
  { label: 'Carnet de notes', keys: ['N'] },
  { label: 'Fermer / quitter', keys: ['Échap'] },
];

export class App {
  private L: Layout;
  private renderer: THREE.WebGLRenderer;
  private g: CanvasRenderingContext2D;
  private hud: ViewportHud;
  private ui: UI;
  private palette: Palette;
  private sigma: SigmaSheet;
  private dialog: Dialog | null = null;
  readonly tour: TourPlayer;
  readonly progress: Progress;
  readonly learn: Learn;
  readonly atlas: Atlas;
  readonly calc: CalcPanel;
  readonly notes: NotesPanel;
  readonly story = new StoryProgress();
  /** story parts and restored beacons already announced */
  private storySeen = { parts: 0, restored: 0, acts: 0 };
  private term: StudyTerminal;
  private lastExplore = '4d/polytopes';
  private lastTouch = 0;
  private cur: Current | null = null;
  private w = 1;
  private h = 1;
  private pr = 1;
  /** AUTO quality: current render scale and frame-rate bookkeeping. */
  private auto = { pr: 1, acc: 0, n: 0, good: 0, cooldown: 0, ready: false };
  private dpr = 1;
  private t = 0;
  private paused = false;
  private last = performance.now();
  private bootAt = performance.now();
  private fpsAcc = 0;
  private fpsN = 0;
  private fpsLastPaint = 0;
  private cine: { list: [ModuleDef, VizDef][]; i: number; left: number } | null = null;
  private rec: { mr: MediaRecorder; canvas: HTMLCanvasElement; g: CanvasRenderingContext2D; chunks: Blob[]; t0: number; name: string } | null = null;

  constructor(host: HTMLElement, readonly modules: ModuleDef[], renderer: THREE.WebGLRenderer, layout: Layout) {
    this.L = layout;
    this.renderer = renderer;
    this.g = layout.overlay.getContext('2d')!;
    this.hud = new ViewportHud(layout.viewport);
    this.ui = new UI(layout.panelBody);
    this.sigma = new SigmaSheet(layout.viewport);
    this.palette = new Palette(() => this.commands());
    this.calc = new CalcPanel(document.body, (open) => layout.btnCalc.classList.toggle('on', open));
    this.notes = new NotesPanel(() => ({ where: document.title.replace(/\s+—\s+V3CT0R.*$/, '') || 'V3CT0R', hash: location.hash }), (open) => layout.btnNotes.classList.toggle('on', open));
    this.tour = new TourPlayer(layout.viewport, {
      go: (id) => void this.goId(id),
      view: () => (this.cur ? `${this.cur.mod.id}/${this.cur.viz.id}` : ''),
      pick: (label) => uiOption(label)?.(),
      set: (label, v) => uiControl(label)?.set(v),
      get: (label) => uiControl(label)?.get(),
      sigma: (open) => (open ? !this.sigma.isOpen && this.toggleSigma() : this.sigma.close()),
      sigmaOpen: () => this.sigma.isOpen,
      paletteOpen: () => this.palette.isOpen,
      pressed: (label) => Array.from(document.querySelectorAll('.panel .seg button[aria-pressed="true"]')).some((b) => b.textContent === label),
      touchedSince: (t) => this.lastTouch > t,
      termOpen: () => this.term.isOpen,
      app: () => ({
        mode: this.atlas.active ? 'atlas' : this.learn.active ? 'learn' : 'explore',
        uni: this.atlas.info()?.uni ?? null,
        calc: this.calc.debug().last,
        notes: this.notes.count(),
        course: this.learn.active ? (this.learn.reading?.course.meta.id ?? null) : null,
      }),
      tidy: () => {
        this.term.close(false);
        this.sigma.close();
        if (this.calc.isOpen) this.calc.close();
        if (this.notes.isOpen) this.notes.close();
        if (this.palette.isOpen) this.palette.toggle();
      },
    }, () => undefined);
    this.progress = new Progress(modules);
    const taskApi: TaskApi = {
      view: () => (this.cur ? `${this.cur.mod.id}/${this.cur.viz.id}` : ''),
      get: (label) => uiControl(label)?.get(),
      pressed: (label) => Array.from(document.querySelectorAll('.panel .seg button[aria-pressed="true"]')).some((b) => b.textContent === label),
      num: (label) => parseHudNumber(String(uiControl(`ro:${label}`)?.get() ?? '')),
      text: (label) => String(uiControl(`ro:${label}`)?.get() ?? ''),
    };
    this.term = new StudyTerminal(layout.viewport, this.progress, taskApi, (id) => this.onValidated(id));
    this.progress.onChange(() => (this.paintLocks(), this.learn?.refresh()));
    this.learn = new Learn({
      viewport: layout.viewport,
      rail: layout.learnRail,
      panel: layout.learnPanel,
      scene: {
        mount: (view) => this.mountScene(view),
        control: (label) => uiControl(label),
        option: (label) => uiOption(label),
        camera: () => CAMERA.current,
      },
      mountViz: (viz) => this.mount(LEARN_MOD, viz, false, false),
      openExplorer: (view) => this.openExplorer(view),
      fullscreen: () => this.fullscreen(),
      setCrumbs: (parts) => this.L.crumbs.replaceChildren(...parts.flatMap((p, i) => (i ? [h('span', { text: '▸' }), h('span', { class: i === parts.length - 1 ? 'hi' : '', text: p })] : [h('span', { text: p })]))),
      // free mode (saved) or a school trial (not saved): every course is open
      free: () => this.progress.open,
      openDialog: (d) => this.openDialog(d),
      setHash: (hash) => {
        try {
          history.replaceState(null, '', hash);
        } catch {
          /* file:// in some browsers */
        }
      },
    });
    this.atlas = new Atlas({
      input: () => ({
        modules: this.modules.map((m) => ({ id: m.id, code: m.code, title: m.title, kanji: m.kanji, tagline: m.tagline, vizs: m.vizs.map((v) => ({ id: v.id, title: v.title, subtitle: v.subtitle })) })),
        tracks: TRACKS.map((t) => ({
          id: t.id,
          title: t.title,
          courses: t.courses.flatMap((id) => {
            const c = COURSES.get(id);
            return c ? [{ id, title: c.meta.title, subtitle: c.meta.subtitle, minutes: c.meta.minutes, ready: isReady(c) }] : [];
          }),
        })),
        games: GAMES.map((gd) => ({ id: gd.id, module: gd.module, title: gd.title, sub: gd.subtitle })),
        story: { acts: ACTS.map((a) => ({ n: a.n, roman: a.roman, title: a.title })), chapters: CHAPTERS.map((c) => ({ id: c.id, code: c.code, title: c.title, sub: `${c.when} · ${c.place}`, year: c.year, act: c.act })) },
        intros: Object.fromEntries(this.modules.flatMap((m) => {
          const id = this.learn.introFor(m.id);
          return id ? [[m.id, id]] : [];
        })),
      }),
      state: (t) => {
        if (t.type === 'view') {
          const [m, v] = t.id.split('/');
          return this.progress.validated(t.id) ? 'done' : this.progress.unlocked(m, v) ? 'open' : 'locked';
        }
        if (t.type === 'game') {
          const gd = GAMES.find((x) => x.id === t.id);
          return gd && scoresOf(gd.id, gd.levels.length).best.some((b) => b !== null) ? 'done' : 'open';
        }
        if (t.type === 'chapter') return this.storyNow().chapters[t.id] ?? 'locked';
        if (t.type === 'course') {
          const s = this.learn.status(t.id);
          return s === 'construction' ? 'construction' : s === 'locked' ? 'locked' : s === 'done' ? 'done' : 'open';
        }
        return 'open';
      },
      progress: (u) => {
        if (u === 'story') {
          const s = this.storyNow();
          return [s.restored, s.playable];
        }
        if (u === 'learn') {
          const ready = [...COURSES.values()].filter((c) => c.meta.level !== 'intro' && isReady(c));
          return [ready.filter((c) => this.learn.status(c.meta.id) === 'done').length, ready.length];
        }
        const m = this.modules.find((x) => x.id === u);
        return m ? [m.vizs.filter((v) => this.progress.validated(`${m.id}/${v.id}`)).length, m.vizs.length] : [0, 0];
      },
      enter: (t) => {
        if (t.type === 'view') {
          const [m, v] = t.id.split('/');
          if (!this.progress.unlocked(m, v)) return '◇ VUE VERROUILLÉE — VALIDE D’ABORD LA PRÉCÉDENTE (TOUCHE E DANS L’EXPLORATEUR)';
          return this.goId(t.id) || 'VUE INTROUVABLE';
        }
        if (t.type === 'course') {
          if (this.learn.status(t.id) === 'locked') return `◇ COURS VERROUILLÉ — TERMINE D’ABORD : ${this.learn.missing(t.id).map((c) => c.meta.title).join(', ')}`;
          this.openLearn(t.id);
          return true;
        }
        if (t.type === 'game') {
          this.openLearn(`game:${t.id}`);
          return true;
        }
        if (t.type === 'intro') {
          this.openLearn(t.id, 0, true);
          return true;
        }
        if (t.type === 'chapter') return this.openChapter(t.id);
        return true;
      },
      menus: () => this.openExplorer(),
      sound: () => settings.sound,
      blocked: () => this.palette.isOpen || !!this.dialog?.isOpen,
      parts: () => this.storyNow().parts,
      entered: (uni) => {
        music.setMood(uni === 'story' ? 'story' : 'atlas');
        if (uni === 'story') this.storyArrival();
      },
      journal: () => this.openJournal(),
    });
    layout.overlay.addEventListener('pointerdown', () => (this.lastTouch = performance.now()));
    // narrow window: a press in the view closes the rail drawer
    layout.viewport.addEventListener('pointerdown', () => this.toggleRail(false));
    void host;
    this.wire();
    this.applySettings();
    new ResizeObserver(() => this.resize()).observe(layout.viewport);
    this.resize();
  }

  static create(host: HTMLElement, modules: ModuleDef[]): App {
    const layout = buildLayout(host, modules);
    const renderer = new THREE.WebGLRenderer({ canvas: layout.glCanvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 1);
    return new App(host, modules, renderer, layout);
  }

  // ── navigation ──────────────────────────────────────────────────────

  start(): void {
    // the rail locks are painted even when the app opens on the ATLAS or LEARN
    this.paintLocks();
    const learn = /^#\/learn(?:\/([^/?]+))?/.exec(location.hash);
    const fromHash = this.parseHash();
    const atlas = /^#\/atlas(?:\/([^/?]+))?/.exec(location.hash);
    if (learn) this.openLearn(learn[1]);
    else if (fromHash && !atlas) this.go(fromHash[0], fromHash[1], false);
    // no route (or #/atlas): the ATLAS is the home of the software
    else this.openAtlas(atlas?.[1]);
    window.addEventListener('hashchange', () => {
      const at = /^#\/atlas(?:\/([^/?]+))?/.exec(location.hash);
      if (at) {
        if (!this.atlas.active) this.openAtlas(at[1]);
        return;
      }
      const lr = /^#\/learn(?:\/([^/?]+))?/.exec(location.hash);
      if (lr) {
        if (!this.learn.active || (lr[1] && lr[1] !== this.learn.playing?.course.meta.id)) this.openLearn(lr[1]);
        return;
      }
      const r = this.parseHash();
      if (r && (r[0] !== this.cur?.mod || r[1] !== this.cur?.viz)) this.go(r[0], r[1]);
    });
    requestAnimationFrame(this.frame);
    // background music: the first gesture starts it (browsers forbid audio before one)
    this.moodNow();
    this.paintAccount();
    this.paintDownload();
    cloud.onChange(() => this.paintAccount());
    // the account's progress may have moved on another device
    if (cloud.enabled && cloud.email) setTimeout(() => void cloud.sync().then((changed) => changed && reloadAfterSync(), () => undefined), 1500);
    for (const ev of ['pointerdown', 'keydown'] as const) window.addEventListener(ev, () => settings.music && music.wake(), { capture: true });
    setInterval(() => this.tickClock(), 1000);
    if (!store.get<boolean>('intro.seen', false)) setTimeout(() => this.firstRun(), 600);
    this.tickClock();
  }

  private parseHash(): [ModuleDef, VizDef] | null {
    const m = /^#\/([^/]+)\/([^/?]+)/.exec(location.hash);
    if (!m) return null;
    const mod = this.modules.find((x) => x.id === m[1]);
    const viz = mod?.vizs.find((v) => v.id === m[2]);
    return mod && viz ? [mod, viz] : null;
  }

  allViews(): [ModuleDef, VizDef][] {
    return this.modules.flatMap((m) => m.vizs.map((v) => [m, v] as [ModuleDef, VizDef]));
  }

  goId(fullId: string): boolean {
    const [mid, vid] = fullId.split('/');
    const mod = this.modules.find((m) => m.id === mid);
    const viz = mod?.vizs.find((v) => v.id === vid);
    if (!mod || !viz) return false;
    this.go(mod, viz);
    return true;
  }

  private termView(): TermView | null {
    const c = this.cur;
    if (!c) return null;
    return { id: `${c.mod.id}/${c.viz.id}`, code: `${c.mod.code}.${String(c.idx + 1).padStart(2, '0')}`, title: c.viz.title, study: c.mod.study?.[c.viz.id] };
  }

  toggleTerm(): void {
    const v = this.termView();
    if (v) this.term.toggle(v);
  }

  private lockedNotice(mod: ModuleDef, viz: VizDef): void {
    const pre = this.progress.prerequisite(mod.id, viz.id);
    toast(pre ? `◇ VERROUILLÉ — VALIDE D’ABORD ${pre.code} ${pre.title} (2 EXERCICES SUR 3, TOUCHE E)` : '◇ VERROUILLÉ', 3200);
    sfx.error();
  }

  private onValidated(id: string): void {
    const [mid, vid] = id.split('/');
    const m = this.modules.find((x) => x.id === mid)!;
    const i = m.vizs.findIndex((v) => v.id === vid);
    const next = m.vizs[i + 1];
    const r = this.progress.rank;
    toast(next ? `✓ VUE VALIDÉE — DÉBLOQUÉ : ${m.code}.${String(i + 2).padStart(2, '0')} ${next.title}` : `✓ VUE VALIDÉE — MODULE ${m.code} TERMINÉ`, 3600);
    sfx.confirm();
    if (this.progress.validatedCount === CINE_NEEDED) setTimeout(() => toast('◆ MODE CINÉMATIQUE DÉBLOQUÉ (TOUCHE C)', 3600), 3800);
    if (this.progress.validatedCount === (r.index > 0 ? [0, 3, 8, 16, 28, 46][r.index] : -1)) setTimeout(() => toast(`◆ NOUVEAU RANG : ${r.name}`, 3600), 1800);
    this.paintLocks();
  }

  paintLocks(): void {
    const L = this.L;
    for (const m of this.modules) {
      const els = L.mods.get(m.id)!;
      m.vizs.forEach((v, i) => {
        const b = els.vizBtns[i];
        const id = `${m.id}/${v.id}`;
        const open = this.progress.unlocked(m.id, v.id);
        b.classList.toggle('locked', !open);
        b.classList.toggle('done', this.progress.validated(id));
        const pre = this.progress.prerequisite(m.id, v.id);
        b.title = open ? `${v.title} — ${this.progress.score(id)}/3 exercices` : `VERROUILLÉ — valide « ${pre?.title} » (2 exercices sur 3)`;
      });
    }
    const n = this.progress.validatedCount;
    const tot = this.progress.total;
    setText(L.railCount, this.progress.free ? 'MODE LIBRE' : `${n}/${tot} VALIDÉES`);
    L.railBar.style.width = `${((100 * n) / tot).toFixed(1)}%`;
    const r = this.progress.rank;
    setText(L.railRank, `RANG ${r.index} · ${r.name}${r.next !== null ? ` · → ${r.next} VUES` : ''}`);
  }

  goModule(i: number): void {
    const m = this.modules[i];
    if (!m || !m.vizs.length) return;
    if (this.cur?.mod === m) return;
    this.go(m, m.vizs[0]);
  }

  step(dir: number): void {
    const all = this.allViews();
    let k = all.findIndex(([m, v]) => m === this.cur?.mod && v === this.cur?.viz);
    for (let n = 0; n < all.length; n++) {
      k = (k + dir + all.length) % all.length;
      const [m, v] = all[k];
      if (this.progress.unlocked(m.id, v.id)) {
        this.go(m, v);
        return;
      }
    }
  }

  /** narrow window: the rail (modules, or LEARN courses) as a drawer over the view */
  toggleRail(open = !document.body.classList.contains('rail-open')): void {
    document.body.classList.toggle('rail-open', open);
    this.L.btnRail.classList.toggle('on', open);
  }

  go(mod: ModuleDef, viz: VizDef, fx = true): void {
    this.toggleRail(false);
    if (this.learn.active || this.atlas.active) this.setMode('explore', false);
    if (!this.progress.unlocked(mod.id, viz.id)) {
      this.lockedNotice(mod, viz);
      if (this.cur && this.cur.mod !== LEARN_MOD && this.progress.unlocked(this.cur.mod.id, this.cur.viz.id)) return;
      viz = mod.vizs[0];
    }
    try {
      history.replaceState(null, '', `#/${mod.id}/${viz.id}`);
    } catch {
      /* file:// in some browsers */
    }
    this.lastExplore = `${mod.id}/${viz.id}`;
    this.mount(mod, viz, fx, true);
  }

  /** LEARN scene: an explorer view without its chrome, whatever the explorer locks */
  mountScene(view: string | null): boolean {
    if (!view) {
      this.mount(LEARN_MOD, { id: 'blank', title: '', subtitle: '', stage: '2d', formula: { tex: '', note: '' }, create: () => ({ update() {} }) }, false, false);
      return true;
    }
    const [mid, vid] = view.split('/');
    const mod = this.modules.find((m) => m.id === mid);
    const viz = mod?.vizs.find((v) => v.id === vid);
    if (!mod || !viz) return false;
    this.mount(mod, viz, true, false);
    return true;
  }

  setMode(mode: 'learn' | 'explore' | 'atlas', restore = true): void {
    const cur = this.atlas.active ? 'atlas' : this.learn.active ? 'learn' : 'explore';
    if (mode === cur) return;
    document.body.classList.toggle('learn', mode === 'learn');
    document.body.classList.toggle('atlas', mode === 'atlas');
    this.L.tabLearn.setAttribute('aria-selected', String(mode === 'learn'));
    this.L.tabExplore.setAttribute('aria-selected', String(mode === 'explore'));
    this.L.tabAtlas.setAttribute('aria-selected', String(mode === 'atlas'));
    this.toggleRail(false);
    this.L.btnRail.replaceChildren(icon('menu'), h('span', { text: mode === 'learn' ? 'COURS' : 'MODULES' }));
    if (cur === 'learn') this.learn.leave();
    if (cur === 'atlas') this.atlas.leave();
    if (mode !== 'explore') {
      if (this.cine) this.toggleCinematic();
      if (!this.tour.current?.crossMode) this.tour.stop();
      this.term.close(false);
      this.sigma.close();
      this.paused = false;
      if (mode === 'learn') this.learn.active = true;
      else this.atlas.active = true;
    } else if (restore && !this.goId(this.lastExplore)) this.go(this.modules[0], this.modules[0].vizs[0]);
    sfx.glitch();
    this.moodNow();
  }

  /** V3CT0R ATLAS: the whole software as a space to fly through (optionally straight into a system) */
  openAtlas(uni?: string): void {
    if (uni !== undefined) this.atlas.goTo(uni || null);
    if (this.atlas.active && this.atlas.run) return;
    this.setMode('atlas');
    this.mount(ATLAS_MOD, this.atlas.viz(), true, false);
    try {
      history.replaceState(null, '', '#/atlas');
    } catch {
      /* file:// in some browsers */
    }
    this.L.crumbs.replaceChildren(h('span', { text: 'ATLAS' }), h('span', { text: '▸' }), h('span', { class: 'hi', text: 'CARTE DU LOGICIEL' }));
    document.title = 'ATLAS — V3CT0R';
    if (this.atlas.saved.uni === 'story') setTimeout(() => this.storyNews(), 400);
  }

  // ── story mode (STORY.md) ──────────────────────────────────────────────

  /** the derived state of the story: passed games + logs read */
  storyNow(): StoryState {
    return storyState({
      gameDone: (id) => {
        const gd = gameById(id);
        return !!gd && scoresOf(id, gd.levels.length).best.some((b) => b !== null && b >= 30);
      },
      read: this.story.readSet,
    });
  }

  private storyHooks(): StoryHooks {
    return {
      state: () => this.storyNow(),
      game: (id) => {
        const def = gameById(id);
        return def ? { def, best: scoresOf(id, def.levels.length).best } : null;
      },
      play: (id) => this.openLearn(`game:${id}`, undefined, false, { label: 'RETOUR AU VAISSEAU', run: () => this.openAtlas() }),
      view: (id) => this.openExplorer(id),
      course: (id) => this.openLearn(id),
      chapter: (id) => void this.openChapter(id),
    };
  }

  /** a beacon: its card (and the log is read, which restores a narrative beacon) */
  openChapter(id: string): true | string {
    const c = chapterById(id);
    if (!c) return 'BALISE INCONNUE';
    const state = this.storyNow().chapters[id];
    if (state === 'locked') return '◇ BALISE NOYÉE DANS LE BRUIT — RESTAURE D’ABORD LES BALISES OUVERTES';
    if (c.ready && this.story.markRead(id)) setTimeout(() => this.storyNews(), 50);
    this.openDialog(chapterDialog(c, this.storyHooks(), () => this.dialog?.close()));
    return true;
  }

  openJournal(tab: 'journal' | 'frise' | 'hangar' = 'journal'): void {
    if (this.dialog?.isOpen) this.dialog.close();
    this.openDialog(journalDialog(this.storyHooks(), this.story.readSet, tab));
  }

  /** announce what changed since last time: beacons restored, ship parts, acts opened */
  private storyNews(): void {
    const s = this.storyNow();
    if (s.restored > this.storySeen.restored && this.storySeen.restored + this.storySeen.parts > 0) toast(`✓ BALISE RESTAURÉE · ${s.restored}/${s.playable}`, 2400);
    if (s.parts.length > this.storySeen.parts && this.storySeen.restored + this.storySeen.parts > 0) setTimeout(() => toast(`PIÈCE DU VAISSEAU : ${s.parts[s.parts.length - 1].toUpperCase()}`, 2600), 900);
    const actsDone = ACTS.filter((a) => s.acts[a.n] === 'done');
    if (actsDone.length > this.storySeen.acts && this.storySeen.restored + this.storySeen.parts > 0) {
      const last = actsDone[actsDone.length - 1];
      setTimeout(() => toast(`FIN DE L’ACTE ${last.roman} · ${last.title.toUpperCase()} — À SUIVRE…`, 3600), 1800);
    }
    this.storySeen = { parts: s.parts.length, restored: s.restored, acts: actsDone.length };
    this.atlas.run?.refresh();
  }

  private storyArrival(): void {
    const s = this.storyNow();
    const open = ACTS.filter((a) => s.acts[a.n] === 'open').map((a) => a.roman);
    toast(`LA GRANDE ENTROPIE · ${s.restored}/${s.playable} BALISES RESTAURÉES · ACTE${open.length > 1 ? 'S' : ''} ${open.join(', ')} OUVERT${open.length > 1 ? 'S' : ''} · J : JOURNAL`, 3600);
    this.storySeen = { parts: s.parts.length, restored: s.restored, acts: ACTS.filter((a) => s.acts[a.n] === 'done').length };
  }

  openLearn(id?: string, t?: number, autoplay = false, back: { label: string; run: () => void } | null = null): void {
    this.setMode('learn');
    this.learn.enter(id, t, autoplay, back);
  }

  openExplorer(view?: string): void {
    this.setMode('explore', false);
    if (view) {
      const [mid, vid] = view.split('/');
      if (this.progress.unlocked(mid, vid) && this.goId(view)) return;
      toast('◇ CETTE VUE EST ENCORE VERROUILLÉE DANS L’EXPLORATEUR', 2600);
    }
    if (!this.goId(this.lastExplore)) this.go(this.modules[0], this.modules[0].vizs[0]);
  }

  private paintLearnLink(mod: ModuleDef, viz: VizDef): void {
    const link = this.learn.courseForView(`${mod.id}/${viz.id}`);
    const b = this.L.btnLearn;
    b.style.display = link ? '' : 'none';
    if (link) {
      b.title = `Cours associé : ${link.title}`;
      b.dataset.course = link.id;
      b.dataset.t = String(link.t);
    }
  }

  /** (re)create a view in the viewport; `chrome` paints the explorer rail, panel and locks */
  mount(mod: ModuleDef, viz: VizDef, fx: boolean, chrome: boolean): void {
    const sameModule = this.cur?.mod === mod;
    this.teardown();
    const idx = mod.vizs.indexOf(viz);
    const code = `${mod.code}.${String(idx + 1).padStart(2, '0')}`;
    this.t = 0;
    this.ui.clear();
    this.hud.reset(`${code} // ${hexId(mod.id + viz.id)} // ${mod.kanji}`, viz.title, viz.subtitle);
    void scramble(this.hud.titleEl, viz.title, 380);
    if (viz.hausdorff) this.hud.tag(`DIM. HAUSDORFF ${viz.hausdorff}`, true);
    if (chrome) {
      this.paintChrome(mod, viz, code);
      this.paintLocks();
      this.paintLearnLink(mod, viz);
      paintVideos(this.L.panelVideos, `${mod.id}/${viz.id}`);
    }
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.autoClear = true;
    this.renderer.clear();
    resetUiRegistry();
    this.cur = { mod, viz, idx, inst: null, disposers: [], errors: 0, broken: false, formula: viz.formula };
    const ctx = this.makeCtx(this.cur);
    try {
      this.cur.inst = viz.create(ctx);
    } catch (e) {
      console.error(e);
      this.cur.broken = true;
      this.hud.error(e instanceof Error ? e.message : String(e));
    }
    if (chrome && this.sigma.isOpen) this.sigma.update(viz.title, this.cur.formula);
    const tv = chrome ? this.termView() : null;
    if (tv) this.term.follow(tv);
    if (fx) {
      glitch(this.L.viewport, this.L.glitchLayer, sameModule ? 140 : 200);
      sfx.glitch();
    }
  }

  private teardown(): void {
    const c = this.cur;
    if (!c) return;
    try {
      c.inst?.dispose?.();
    } catch (e) {
      console.error(e);
    }
    for (const d of c.disposers.reverse()) {
      try {
        d();
      } catch (e) {
        console.error(e);
      }
    }
    this.cur = null;
  }

  private makeCtx(cur: Current): VizContext {
    const app = this;
    return {
      renderer: this.renderer,
      glCanvas: this.L.glCanvas,
      overlay: this.L.overlay,
      g: this.g,
      input: this.L.overlay,
      get width() {
        return app.w;
      },
      get height() {
        return app.h;
      },
      get dpr() {
        return app.dpr;
      },
      quality: effectiveQuality(),
      q: <T,>(lo: T, med: T, hi: T) => {
        const e = effectiveQuality();
        return e === 'low' ? lo : e === 'high' ? hi : med;
      },
      ui: this.ui,
      hud: this.hud,
      get cinematic() {
        return !!app.cine;
      },
      setFormula: (f) => {
        cur.formula = f;
        if (app.sigma.isOpen && app.cur === cur) app.sigma.update(cur.viz.title, f);
      },
      onDispose: (fn) => cur.disposers.push(fn),
      listen: (target, type, fn, opts) => {
        target.addEventListener(type, fn, opts);
        cur.disposers.push(() => target.removeEventListener(type, fn, opts));
      },
    };
  }

  private paintChrome(mod: ModuleDef, viz: VizDef, code: string): void {
    const L = this.L;
    for (const m of this.modules) {
      const els = L.mods.get(m.id)!;
      els.root.classList.toggle('active', m === mod);
      m.vizs.forEach((v, i) => els.vizBtns[i].classList.toggle('active', v === viz));
    }
    L.crumbs.replaceChildren(h('span', { text: `${mod.code} // ${mod.title}` }), h('span', { text: '▸' }), h('span', { class: 'hi', text: viz.title }));
    setText(L.hex, hexId(viz.id, 4));
    L.panelSys.replaceChildren(h('span', { text: `SYS.MODULE_${mod.code} // ` }), h('span', { class: 'on', text: 'ACTIVE' }));
    setText(L.panelHex, code);
    void scramble(L.panelTitle, viz.title, 420);
    setText(L.panelSub, viz.subtitle);
    L.panelBarcode.replaceChildren(barcode(mod.id + '/' + viz.id, 110, 16));
    setText(L.panelFootCode, `${hexId(viz.id, 8)} · ${mod.tagline}`);
    setText(L.panelFootKanji, mod.kanji);
    setText(L.statusSys, `SYS.MODULE_${mod.code} // ACTIVE`);
    setText(L.statusView, `VUE ${code}`);
    document.title = `${viz.title} — V3CT0R`;
  }

  // ── frame loop ──────────────────────────────────────────────────────

  private frame = (now: number): void => {
    requestAnimationFrame(this.frame);
    const real = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.fpsAcc += real;
    this.fpsN++;
    if (now - this.fpsLastPaint > 500) {
      const fps = this.fpsN / Math.max(1e-3, this.fpsAcc);
      setText(this.L.fps, `${Math.round(fps)} FPS`);
      this.fpsAcc = 0;
      this.fpsN = 0;
      this.fpsLastPaint = now;
    }
    this.L.statusSpark.push(real * 1000);
    if (settings.quality === 'auto') this.adaptQuality(real);
    if (this.cine) this.tickCinematic(real);
    this.tour.tick(real);
    this.term.tick(real);
    if (this.learn.active) this.learn.tick(real);
    const dt = this.paused && !this.learn.active && !this.atlas.active ? 0 : real;
    this.t += dt;
    this.renderFrame(dt);
    if (this.rec) this.captureFrame();
  };

  private renderFrame(dt: number): void {
    const c = this.cur;
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.L.overlay.width, this.L.overlay.height);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!c || !c.inst || c.broken) return;
    try {
      if (this.cine) c.inst.cinematic?.(this.t, dt);
      c.inst.update(this.t, dt);
      c.errors = 0;
    } catch (e) {
      c.errors++;
      console.error(e);
      if (c.errors > 2) {
        c.broken = true;
        this.hud.error(e instanceof Error ? e.message : String(e));
      }
    }
  }

  private resize(): void {
    const r = this.L.viewport.getBoundingClientRect();
    this.w = Math.max(1, Math.round(r.width));
    this.h = Math.max(1, Math.round(r.height));
    const dev = window.devicePixelRatio || 1;
    if (!this.auto.ready) {
      this.auto.pr = Math.min(dev, 1.25);
      this.auto.ready = true;
    }
    this.pr =
      settings.quality === 'auto'
        ? this.auto.pr
        : settings.quality === 'low'
          ? Math.min(dev, 1) * 0.75
          : settings.quality === 'med'
            ? Math.min(dev, 1.25)
            : Math.min(dev, 2);
    this.dpr = Math.min(dev, 2);
    this.renderer.setPixelRatio(this.pr);
    this.renderer.setSize(this.w, this.h, false);
    const ov = this.L.overlay;
    ov.width = Math.round(this.w * this.dpr);
    ov.height = Math.round(this.h * this.dpr);
    const buf = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    setText(this.L.statusGl, `WEBGL2 · ${buf.x}×${buf.y} · ${settings.quality.toUpperCase()}${settings.quality === 'auto' ? ` ${this.pr.toFixed(2).replace('.', ',')}×` : ''}`);
    try {
      this.cur?.inst?.resize?.(this.w, this.h);
    } catch (e) {
      console.error(e);
    }
    if (this.cur?.inst && !this.cur.broken) this.renderFrame(0);
  }

  /** AUTO quality: lower the render scale when the frame rate drops under ~48 fps, raise it back
   *  slowly when frames are comfortably fast. Only the resolution changes: views are not rebuilt. */
  private adaptQuality(dt: number): void {
    const a = this.auto;
    if (document.hidden || dt > 0.25 || this.rec) return;
    a.cooldown = Math.max(0, a.cooldown - dt);
    a.acc += dt;
    a.n++;
    if (a.acc < 1.2) return;
    const fps = a.n / a.acc;
    a.acc = 0;
    a.n = 0;
    if (a.cooldown > 0) return;
    const dev = window.devicePixelRatio || 1;
    const max = Math.min(dev, 2);
    let next = a.pr;
    if (fps < 48 && a.pr > 0.5) {
      next = Math.max(0.5, a.pr * 0.8);
      a.good = 0;
    } else if (fps > 57) {
      a.good++;
      if (a.good >= 4 && a.pr < max) {
        next = Math.min(max, a.pr * 1.12);
        a.good = 0;
      }
    } else a.good = 0;
    if (Math.abs(next - a.pr) > 1e-3) {
      a.pr = next;
      a.cooldown = 1.5;
      this.resize();
    }
  }

  private tickClock(): void {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    setText(this.L.clock, `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    const s = Math.floor((performance.now() - this.bootAt) / 1000);
    setText(this.L.uptime, `T+${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`);
    if (this.rec) {
      const r = Math.floor((performance.now() - this.rec.t0) / 1000);
      setText(this.L.recTime, `REC ${p(Math.floor(r / 60))}:${p(r % 60)}`);
    }
  }

  // ── settings ────────────────────────────────────────────────────────

  private applySettings(): void {
    document.body.classList.toggle('scan', settings.scanlines);
    this.L.btnScan.classList.toggle('on', settings.scanlines);
    this.L.btnSound.replaceChildren(icon(settings.sound ? 'sound' : 'mute'), h('span', { text: settings.sound ? 'SON ON' : 'SON' }));
    this.L.btnSound.classList.toggle('on', settings.sound);
    this.L.btnMusic.replaceChildren(icon(settings.music ? 'sound' : 'mute'), h('span', { text: settings.music ? `MUSIQUE ${Math.round(settings.musicVolume * 100)} %` : 'MUSIQUE' }));
    this.L.btnMusic.classList.toggle('on', settings.music);
    music.setVolume(settings.musicVolume);
    music.setEnabled(settings.music);
    this.L.btnQuality.replaceChildren(icon('quality'), h('span', { text: settings.quality.toUpperCase() }));
  }

  setQuality(q: QualitySetting): void {
    settings.quality = q;
    saveSettings();
    this.applySettings();
    this.resize();
    if (this.cur) this.go(this.cur.mod, this.cur.viz, false);
    toast(`QUALITÉ ${q.toUpperCase()}`);
  }

  toggleSound(): void {
    settings.sound = !settings.sound;
    saveSettings();
    if (settings.sound) {
      sfx.prime();
      sfx.confirm();
    }
    this.applySettings();
    toast(settings.sound ? 'SONS ACTIVÉS' : 'SONS COUPÉS');
  }

  toggleMusic(): void {
    settings.music = !settings.music;
    saveSettings();
    this.applySettings();
    if (settings.music) music.wake();
    toast(settings.music ? 'MUSIQUE ACTIVÉE' : 'MUSIQUE COUPÉE');
  }

  /** right click on MUSIQUE: 25 → 50 → 75 → 100 % */
  cycleMusicVolume(): void {
    const steps = [0.25, 0.5, 0.75, 1];
    const i = steps.findIndex((s) => Math.abs(s - settings.musicVolume) < 0.01);
    settings.musicVolume = steps[(i + 1) % steps.length];
    if (!settings.music) settings.music = true;
    saveSettings();
    this.applySettings();
    music.wake();
    toast(`MUSIQUE ${Math.round(settings.musicVolume * 100)} %`);
  }

  /** mood of the background music for the current zone */
  private moodNow(): void {
    music.setMood(this.atlas.active ? (this.atlas.saved.uni === 'story' ? 'story' : 'atlas') : this.learn.active ? (this.learn.game ? 'game' : 'learn') : 'explore');
  }

  toggleScan(): void {
    settings.scanlines = !settings.scanlines;
    saveSettings();
    this.applySettings();
    sfx.click();
  }

  togglePause(): void {
    this.paused = !this.paused;
    this.L.btnPause.querySelector('svg')?.replaceWith(icon(this.paused ? 'play' : 'pause'));
    this.L.btnPause.classList.toggle('on', this.paused);
    toast(this.paused ? 'PAUSE' : 'LECTURE');
  }

  toggleChrome(force?: boolean): void {
    const off = force ?? !document.body.classList.contains('chrome-off');
    document.body.classList.toggle('chrome-off', off);
  }

  // ── cinematic ───────────────────────────────────────────────────────

  toggleCinematic(): void {
    if (!this.cine && !this.progress.cinematicUnlocked()) {
      toast(`◇ CINÉMATIQUE VERROUILLÉE — ${CINE_NEEDED} VUES VALIDÉES REQUISES (${this.progress.validatedCount}/${CINE_NEEDED})`, 3200);
      sfx.error();
      return;
    }
    if (!this.cine) this.tour.stop();
    if (this.cine) {
      this.cine = null;
      document.body.classList.remove('cinematic');
      this.toggleChrome(false);
      toast('MODE CINÉMATIQUE — FIN');
      return;
    }
    const list = this.allViews().filter(([m, v]) => !v.noCinematic && this.progress.unlocked(m.id, v.id));
    let i = list.findIndex(([m, v]) => m === this.cur?.mod && v === this.cur?.viz);
    if (i < 0) i = 0;
    this.cine = { list, i, left: CINE_DURATION };
    document.body.classList.add('cinematic');
    this.toggleChrome(true);
    this.dialog?.close();
    this.sigma.close();
    const [m, v] = list[i];
    if (this.cur?.viz !== v) this.go(m, v);
    else this.go(m, v, false);
    this.paintCineCaption();
    toast('MODE CINÉMATIQUE — ÉCHAP POUR QUITTER', 2400);
  }

  private paintCineCaption(): void {
    if (!this.cine) return;
    const [m, v] = this.cine.list[this.cine.i];
    setText(this.L.cineC1, `${m.code}.${String(m.vizs.indexOf(v) + 1).padStart(2, '0')} // ${m.title} // ${m.kanji}`);
    void scramble(this.L.cineC2, v.title, 600);
  }

  private tickCinematic(dt: number): void {
    const c = this.cine!;
    c.left -= dt;
    this.L.cineBar.style.width = `${(100 * (1 - c.left / CINE_DURATION)).toFixed(2)}%`;
    if (c.left <= 0) {
      c.i = (c.i + 1) % c.list.length;
      c.left = CINE_DURATION;
      const [m, v] = c.list[c.i];
      this.go(m, v);
      this.paintCineCaption();
    }
  }

  // ── capture ─────────────────────────────────────────────────────────

  private fileStem(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const id = this.cur ? `${this.cur.mod.id}-${this.cur.viz.id}` : 'view';
    return `v3ct0r_${id}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  private download(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  private composite(target: CanvasRenderingContext2D, W: number, H: number, label: boolean): void {
    target.fillStyle = '#000';
    target.fillRect(0, 0, W, H);
    if (this.cur?.viz.stage !== '2d') target.drawImage(this.L.glCanvas, 0, 0, W, H);
    target.drawImage(this.L.overlay, 0, 0, W, H);
    if (label && this.cur) {
      const s = Math.max(1, W / 1600);
      target.font = `${Math.round(11 * s)}px "JetBrains Mono", monospace`;
      target.fillStyle = 'rgba(255,255,255,0.6)';
      target.textBaseline = 'bottom';
      const code = `${this.cur.mod.code}.${String(this.cur.idx + 1).padStart(2, '0')}`;
      target.fillText(`V3CT0R · ${code} ${this.cur.viz.title} · ${new Date().toISOString().slice(0, 10)}`, 18 * s, H - 14 * s);
    }
  }

  exportPNG(): void {
    if (!this.cur?.inst) return;
    const max = this.renderer.capabilities.maxTextureSize;
    const scale = Math.max(1, Math.min(4, 3840 / (this.w * this.pr), max / (this.w * this.pr), max / (this.h * this.pr)));
    const prevPr = this.pr;
    const prevDpr = this.dpr;
    try {
      this.pr = prevPr * scale;
      this.dpr = prevDpr * scale;
      this.renderer.setPixelRatio(this.pr);
      this.renderer.setSize(this.w, this.h, false);
      this.L.overlay.width = Math.round(this.w * this.dpr);
      this.L.overlay.height = Math.round(this.h * this.dpr);
      this.renderFrame(0);
      const buf = this.renderer.getDrawingBufferSize(new THREE.Vector2());
      const out = document.createElement('canvas');
      out.width = buf.x;
      out.height = buf.y;
      this.composite(out.getContext('2d')!, out.width, out.height, true);
      const name = `${this.fileStem()}.png`;
      out.toBlob((b) => {
        if (b) {
          this.download(b, name);
          toast(`PNG ${out.width}×${out.height} EXPORTÉ`);
          sfx.confirm();
        }
      }, 'image/png');
    } finally {
      this.pr = prevPr;
      this.dpr = prevDpr;
      this.resize();
    }
  }

  toggleRecord(): void {
    if (this.rec) {
      this.rec.mr.stop();
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      toast('⚠ ENREGISTREMENT NON SUPPORTÉ');
      return;
    }
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) {
      toast('⚠ WEBM NON SUPPORTÉ');
      return;
    }
    const buf = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const canvas = document.createElement('canvas');
    canvas.width = buf.x - (buf.x % 2);
    canvas.height = buf.y - (buf.y % 2);
    const g = canvas.getContext('2d')!;
    const stream = canvas.captureStream(60);
    const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
    const chunks: Blob[] = [];
    const name = `${this.fileStem()}.webm`;
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      this.download(new Blob(chunks, { type: 'video/webm' }), name);
      this.rec = null;
      document.body.classList.remove('recording');
      this.L.btnRec.classList.remove('on');
      toast('WEBM EXPORTÉ');
      sfx.confirm();
    };
    mr.start(250);
    this.rec = { mr, canvas, g, chunks, t0: performance.now(), name };
    document.body.classList.add('recording');
    this.L.btnRec.classList.add('on');
    toast('● ENREGISTREMENT — R POUR ARRÊTER');
  }

  private captureFrame(): void {
    const r = this.rec!;
    this.composite(r.g, r.canvas.width, r.canvas.height, false);
  }

  // ── overlays ────────────────────────────────────────────────────────

  private openDialog(d: Dialog): void {
    this.dialog?.close();
    this.dialog = d;
    const prev = d.onClose;
    d.onClose = () => {
      prev?.();
      if (this.dialog === d) this.dialog = null;
    };
    d.open();
  }

  toggleSigma(): void {
    if (!this.cur) return;
    this.sigma.toggle(this.cur.viz.title, this.cur.formula);
  }

  openChallenge(): void {
    if (!this.cur) return;
    this.openDialog(openChallenge(this.cur.mod, this.modules));
  }

  private tourLock(t: Tour): string | null {
    if (t.kind === 'tuto' || this.progress.open) return null;
    for (const s of t.steps) {
      if (!s.view) continue;
      const [mid, vid] = s.view.split('/');
      if (!this.progress.unlocked(mid, vid)) {
        const m = this.modules.find((x) => x.id === mid);
        const v = m?.vizs.find((x) => x.id === vid);
        return `débloque d’abord « ${v?.title ?? s.view} »`;
      }
    }
    return null;
  }

  startTour(id: string): void {
    const t = TOURS.find((x) => x.id === id);
    if (!t) return;
    const lock = this.tourLock(t);
    if (lock) {
      toast(`◇ PARCOURS VERROUILLÉ — ${lock.toUpperCase()}`, 3400);
      sfx.error();
      return;
    }
    if (this.cine) this.toggleCinematic();
    this.dialog?.close();
    // every tour starts in the explorer (the first-run prompt shows over the ATLAS)
    if (this.atlas.active || this.learn.active) this.setMode('explore');
    this.tour.start(t);
  }

  openTours(): void {
    const d = new Dialog('PARCOURS GUIDÉS', { center: true, width: 640 });
    const list = h('div', { class: 'tour-list' });
    for (const t of TOURS) {
      const b = h(
        'button',
        { type: 'button', class: 'tour-item' },
        h('span', { class: 'tt', text: `${t.kind === 'tuto' ? 'TUTO' : 'PARCOURS'} · ${t.title}` }),
        h('span', { class: 'tm', text: `≈ ${tourMinutes(t)} MIN · ${t.steps.length} ÉTAPES` }),
        h('span', { class: 'ts', text: this.tourLock(t) ? `◇ VERROUILLÉ : ${this.tourLock(t)}.` : t.summary }),
      );
      if (this.tourLock(t)) b.classList.add('locked');
      b.addEventListener('click', () => {
        d.close();
        this.startTour(t.id);
      });
      list.append(b);
    }
    d.body.append(list);
    d.foot.append(h('span', { text: 'T : TUTO · G : CE MENU · ÉCHAP : QUITTER UNE VISITE' }));
    this.openDialog(d);
  }

  private firstRun(): void {
    store.set('intro.seen', true);
    if (this.dialog?.isOpen || this.tour.active) return;
    const tuto = TOURS[0];
    const d = new Dialog('PREMIÈRE VISITE', { center: true, width: 520 });
    const go = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: `LANCER LE TUTO (≈ ${tourMinutes(tuto)} MIN)` }));
    const later = h('button', { type: 'button', class: 'btn' }, h('span', { text: 'PLUS TARD' }));
    go.addEventListener('click', () => {
      d.close();
      this.startTour('tuto');
    });
    later.addEventListener('click', () => d.close());
    d.body.append(
      h('div', { class: 'quiz-q', text: 'Bienvenue dans V3CT0R. Un tuto interactif de quelques minutes te montre comment tout utiliser.' }),
      h('div', { style: 'display:flex;gap:8px;margin-top:6px' }, go, later),
    );
    d.foot.append(h('span', { text: 'RELANCER À TOUT MOMENT : TOUCHE T' }));
    this.openDialog(d);
    go.focus();
  }

  openAccount(): void {
    this.openDialog(accountDialog());
  }

  /** size of the zip, for the way in (« 6,4 Mo »); the installer is on GitHub (no size: cross-origin) */
  async downloadSize(): Promise<string | null> {
    if (!location.hostname.endsWith('github.io') || downloadKind(navigator.userAgent) === 'installer') return null;
    try {
      const r = await fetch(this.downloadUrl(), { method: 'HEAD' });
      const n = Number(r.headers.get('content-length') ?? 0);
      return r.ok && n > 0 ? `${(n / 1e6).toFixed(1).replace('.', ',')} Mo` : null;
    } catch {
      return null;
    }
  }

  /** where the offline version is: next to the site on GitHub Pages, else the latest release */
  private downloadUrl(): string {
    return location.hostname.endsWith('github.io') ? 'V3CT0R.zip' : 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R.zip';
  }

  /** the TÉLÉCHARGER button exists only online (the downloaded version is already offline) */
  private paintDownload(): void {
    const b = this.L.btnDownload;
    const online = location.protocol === 'https:' || location.protocol === 'http:';
    b.style.display = online ? '' : 'none';
    // « non » to the offer of the way in: a download icon stays in the status bar
    this.L.sbDownload.style.display = online && store.get<string | null>(DL_KEY, null) === 'no' ? '' : 'none';
    if (!online) return;
    if (downloadKind(navigator.userAgent) === 'installer') {
      b.title = b.ariaLabel = 'Télécharger V3CT0R pour Windows : l’installeur met l’app sur le bureau, hors ligne (V3CT0R-Setup.exe)';
      return;
    }
    if (!location.hostname.endsWith('github.io')) return;
    void fetch(this.downloadUrl(), { method: 'HEAD' })
      .then((r) => {
        const n = Number(r.headers.get('content-length') ?? 0);
        if (r.ok && n > 0) b.replaceChildren(icon('download'), h('span', { text: `TÉLÉCHARGER · ${(n / 1e6).toFixed(1).replace('.', ',')} Mo` }));
      })
      .catch(() => undefined);
  }

  /** Windows: the installer (V3CT0R on the desktop and in the Start menu); elsewhere, or on request, the zip */
  downloadApp(kind: DownloadKind = downloadKind(navigator.userAgent)): void {
    const a = document.createElement('a');
    a.href = kind === 'installer' ? INSTALLER_URL : this.downloadUrl();
    a.download = kind === 'installer' ? 'V3CT0R-Setup.exe' : 'V3CT0R.zip';
    document.body.append(a);
    a.click();
    a.remove();
    if (kind === 'installer') toast('TÉLÉCHARGEMENT DE V3CT0R-SETUP.EXE — OUVRE-LE : V3CT0R S’INSTALLE ET APPARAÎT SUR TON BUREAU. SI WINDOWS AVERTIT : INFORMATIONS COMPLÉMENTAIRES → EXÉCUTER QUAND MÊME', 7000);
    else toast('TÉLÉCHARGEMENT DE V3CT0R.ZIP — DÉZIPPER PUIS OUVRIR INDEX.HTML (HORS LIGNE)', 4200);
  }

  private paintAccount(): void {
    const b = this.L.btnAccount;
    b.style.display = cloud.enabled ? '' : 'none';
    b.classList.toggle('on', !!cloud.email);
    b.title = cloud.email ? `Compte : ${cloud.email} (progression synchronisée)` : 'Compte : ta progression sur tous tes appareils';
  }

  openKeymap(): void {
    if (this.dialog?.isOpen) {
      this.dialog.close();
      return;
    }
    this.openDialog(keymapDialog(this.atlas.active ? ATLAS_KEYS : this.learn.active ? LEARN_KEYS : KEYS));
  }

  private commands(): Command[] {
    const out: Command[] = [];
    for (const m of this.modules) {
      out.push({ id: `mod:${m.id}`, label: `${m.code} // ${m.title}`, group: 'MODULE', keywords: m.tagline, run: () => this.goModule(this.modules.indexOf(m)) });
    }
    out.push({ id: 'atlas', label: 'ATLAS · LA GALAXIE V3CT0R', group: 'ATLAS', keywords: 'atlas vaisseau espace carte galaxie zqsd jeu', run: () => this.openAtlas('') });
    for (const u of this.atlas.universes())
      out.push({ id: `atlas:${u.id}`, label: `ATLAS · SYSTÈME ${u.code} ${u.title}`, group: 'ATLAS', keywords: `atlas vaisseau planètes ${u.tagline}`, run: () => this.openAtlas(u.id) });
    for (const [m, v] of this.allViews()) {
      const open = this.progress.unlocked(m.id, v.id);
      out.push({ id: `viz:${m.id}/${v.id}`, label: open ? v.title : `◇ ${v.title}`, group: open ? `${m.code} ${m.title}` : 'VERROUILLÉ', keywords: `${v.subtitle} ${(v.keywords ?? []).join(' ')}`, run: () => this.go(m, v) });
    }
    const act = (id: string, label: string, run: () => void, keywords = '') => out.push({ id, label: label.toUpperCase(), group: 'ACTION', keywords, run });
    act('cine', 'Mode cinématique', () => this.toggleCinematic(), 'visite automatique fond d’écran');
    act('lesson', 'Leçon et exercices de la vue', () => this.toggleTerm(), 'cours exercices terminal étudier');
    act('free', this.progress.free ? 'Mode progression (verrous actifs)' : 'Mode libre : tout débloquer', () => this.confirmFree(), 'débloquer verrous libre');
    act('reset-progress', 'Réinitialiser la progression', () => this.confirmReset(), 'effacer recommencer'); 
    for (const t of TOURS) out.push({ id: `tour:${t.id}`, label: `${t.kind === 'tuto' ? 'TUTO' : 'PARCOURS'} · ${t.title}`, group: `≈ ${tourMinutes(t)} MIN`, keywords: `${t.summary} visite guidée tutoriel`, run: () => this.startTour(t.id) });
    act('defi', 'Mode défi (quiz)', () => this.openChallenge(), 'questions quiz');
    act('sigma', 'Afficher la formule Σ', () => this.toggleSigma(), 'katex explication');
    act('png', 'Exporter PNG haute résolution', () => this.exportPNG(), 'capture image');
    act('rec', 'Enregistrer / arrêter WebM', () => this.toggleRecord(), 'video');
    for (const q of QUALITY_ORDER) act(`q:${q}`, `Qualité ${q.toUpperCase()}`, () => this.setQuality(q), 'performance');
    act('sound', 'Sons on/off', () => this.toggleSound(), 'audio');
    act('scan', 'Scanlines on/off', () => this.toggleScan(), 'crt');
    act('keymap', 'Raccourcis clavier', () => this.openKeymap(), 'aide help');
    if (location.protocol.startsWith('http')) {
      act('download', downloadKind(navigator.userAgent) === 'installer' ? 'Installer V3CT0R sur Windows (app de bureau)' : 'Télécharger V3CT0R (version hors ligne)', () => this.downloadApp(), 'télécharger installer installeur app bureau windows exe hors ligne offline');
      act('download-zip', 'Télécharger la version zip (tous systèmes, sans installation)', () => this.downloadApp('zip'), 'télécharger zip index.html mac linux portable hors ligne');
    }
    act('account', 'Compte : connexion et synchro de la progression', () => this.openAccount(), 'compte connexion inscription créer email mot de passe synchroniser cloud');
    act('notes', 'Notes : carnet façon terminal', () => this.notes.open(), 'notes carnet noter écrire terminal mémo');
    act('calc', 'Calculatrice', () => this.calc.open(), 'calcul calculer intégrale somme dérivée racine factorielle');
    act('story', 'Histoire : entrer dans la Grande Entropie', () => this.openAtlas('story'), 'mode histoire récit chronologie babylone euclide archimède entropie vaisseau');
    act('story-book', 'Histoire : journal, frise, hangar', () => (this.openAtlas(), this.openJournal()), 'mode histoire journal de bord frise chronologique pièces');
    act('calc-keys', 'Raccourcis de caractères (√ ∛ π ≤ ∀ ∫…)', () => this.calc.open('keys'), 'symboles caractères unicode taper écrire alpha grec racine cubique');
    act('calc-fns', 'Fonctions de la calculatrice', () => this.calc.open('fns'), 'calculatrice aide syntaxe');
    act('chrome', 'Masquer / afficher l’interface', () => this.toggleChrome(), 'ui');
    act('full', 'Plein écran', () => this.fullscreen(), 'fullscreen');
    act('explore', 'Explorateur (les 46 vues)', () => this.openExplorer(), 'explorer visualisations');
    out.push(
      ...this.learn.commands((fn) => {
        if (!this.learn.active) this.openLearn();
        fn();
      }),
    );
    return out;
  }

  /** test hooks: answers of the current view’s exercises, and task labels absent from the panel */
  debugAnswers(): (number | string)[] {
    const s = this.cur?.mod.study?.[this.cur.viz.id];
    return s ? s.exercises.map((e) => (e.kind === 'qcm' ? 'ABCD'[e.answer] : e.kind === 'num' ? e.answer : 'task')) : [];
  }

  debugMissingLabels(): string[] {
    const s = this.cur?.mod.study?.[this.cur.viz.id];
    if (!s) return ['(no study)'];
    const out: string[] = [];
    for (const e of s.exercises)
      if (e.kind === 'task')
        for (const l of e.uses) if (!uiControl(l) && !uiOption(l) && !uiControl(`ro:${l}`)) out.push(l);
    return out;
  }

  private confirmFree(): void {
    if (this.progress.free) {
      this.progress.setFree(false);
      toast('MODE PROGRESSION — LES VERROUS SONT ACTIFS');
      return;
    }
    const d = new Dialog('MODE LIBRE', { center: true, width: 520 });
    const ok = h('button', { type: 'button', class: 'btn on', text: 'TOUT DÉBLOQUER' });
    const no = h('button', { type: 'button', class: 'btn', text: 'ANNULER' });
    ok.addEventListener('click', () => {
      d.close();
      this.progress.setFree(true);
      toast('◆ MODE LIBRE — TOUTES LES VUES SONT OUVERTES');
    });
    no.addEventListener('click', () => d.close());
    d.body.append(h('div', { class: 'quiz-q', text: 'Toutes les vues, le mode cinématique et les parcours seront accessibles sans exercices. Ta progression est conservée ; tu peux revenir au mode progression depuis Ctrl+K.' }), h('div', { style: 'display:flex;gap:8px' }, ok, no));
    this.openDialog(d);
  }

  private confirmReset(): void {
    const d = new Dialog('RÉINITIALISER', { center: true, width: 520 });
    const ok = h('button', { type: 'button', class: 'btn on', text: 'EFFACER MA PROGRESSION' });
    const no = h('button', { type: 'button', class: 'btn', text: 'ANNULER' });
    ok.addEventListener('click', () => {
      d.close();
      this.progress.reset();
      const c = this.cur;
      if (c && !this.progress.unlocked(c.mod.id, c.viz.id)) this.go(c.mod, c.mod.vizs[0]);
      toast('PROGRESSION EFFACÉE');
    });
    no.addEventListener('click', () => d.close());
    d.body.append(h('div', { class: 'quiz-q', text: 'Tous les exercices réussis seront oubliés et les vues reverrouillées. Cette action est définitive.' }), h('div', { style: 'display:flex;gap:8px' }, ok, no));
    this.openDialog(d);
  }

  private fullscreen(): void {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => toast('⚠ PLEIN ÉCRAN REFUSÉ'));
  }

  // ── input wiring ────────────────────────────────────────────────────

  private wire(): void {
    const L = this.L;
    this.modules.forEach((m, mi) => {
      const els = L.mods.get(m.id)!;
      els.btn.addEventListener('click', () => {
        sfx.click();
        this.goModule(mi);
      });
      m.vizs.forEach((v, vi) =>
        els.vizBtns[vi].addEventListener('click', () => {
          sfx.click();
          if (this.cur?.viz !== v) this.go(m, v);
        }),
      );
      const intro = this.learn.introFor(m.id);
      els.introBtn.hidden = !intro;
      if (intro)
        els.introBtn.addEventListener('click', () => {
          sfx.click();
          this.openLearn(intro, 0, true);
        });
    });
    const on = (b: HTMLElement, fn: () => void) => b.addEventListener('click', () => (sfx.click(), fn()));
    on(L.btnPalette, () => this.palette.toggle());
    on(L.btnQuality, () => this.setQuality(QUALITY_ORDER[(QUALITY_ORDER.indexOf(settings.quality) + 1) % QUALITY_ORDER.length]));
    on(L.btnSound, () => this.toggleSound());
    on(L.btnMusic, () => this.toggleMusic());
    L.btnMusic.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.cycleMusicVolume();
    });
    on(L.btnCalc, () => this.calc.toggle());
    on(L.btnNotes, () => this.notes.toggle());
    on(L.btnAccount, () => this.openAccount());
    on(L.btnDownload, () => this.downloadApp());
    on(L.btnRail, () => this.toggleRail());
    on(L.sbDownload, () => this.downloadApp());
    on(L.btnScan, () => this.toggleScan());
    on(L.btnHelp, () => this.openKeymap());
    on(L.btnChallenge, () => this.openChallenge());
    on(L.btnCinematic, () => this.toggleCinematic());
    on(L.btnTuto, () => this.startTour('tuto'));
    on(L.btnTours, () => this.openTours());
    on(L.btnSigma, () => this.toggleSigma());
    on(L.btnLesson, () => this.toggleTerm());
    on(L.btnPng, () => this.exportPNG());
    on(L.btnRec, () => this.toggleRecord());
    on(L.btnPause, () => this.togglePause());
    on(L.btnLearn, () => this.openLearn(L.btnLearn.dataset.course, Number(L.btnLearn.dataset.t ?? 0) + 0.01));
    on(L.tabLearn, () => (this.learn.active ? this.learn.home() : this.openLearn()));
    on(L.tabExplore, () => (this.learn.active || this.atlas.active) && this.openExplorer());
    on(L.tabAtlas, () => this.openAtlas());

    window.addEventListener('keydown', (e) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName;
      const isText = tag === 'TEXTAREA' || (tag === 'INPUT' && (tgt as HTMLInputElement).type !== 'range');
      const key = e.key;
      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!this.palette.isOpen) this.dialog?.close();
        this.palette.toggle();
        return;
      }
      if (isText || e.ctrlKey || e.metaKey || e.altKey) return;
      if (key === 'Escape' && document.body.classList.contains('rail-open') && !this.dialog?.isOpen && !this.palette.isOpen) {
        this.toggleRail(false);
        return;
      }
      if (key === '=' && !this.palette.isOpen && !this.dialog?.isOpen) {
        e.preventDefault();
        this.calc.toggle();
        return;
      }
      // N: the notebook (a game in LEARN reads its own keys first)
      if (key.toLowerCase() === 'n' && !this.palette.isOpen && !this.dialog?.isOpen && !(this.learn.active && this.learn.game)) {
        e.preventDefault();
        this.notes.toggle();
        return;
      }
      if (this.atlas.active) {
        // the ship reads its own keys (Z Q S D, A E, Maj, ⏎, Échap, Tab); only global ones here
        if (key === 'Escape' && this.dialog?.isOpen) return this.dialog.close();
        if (this.palette.isOpen || this.dialog?.isOpen) {
          if (key === '?') this.openKeymap();
          return;
        }
        if (key === '?') this.openKeymap();
        else if (key.toLowerCase() === 'm') this.toggleSound();
        else if (key.toLowerCase() === 'f') this.fullscreen();
        else return;
        e.preventDefault();
        return;
      }
      if (this.learn.active) {
        if (key === 'Escape' && this.dialog?.isOpen) return this.dialog.close();
        if (this.palette.isOpen || this.dialog?.isOpen) {
          if (key === '?') this.openKeymap();
          return;
        }
        if (tgt && tgt.closest('.lx-ex') && key !== 'Escape') return;
        const k = key.length === 1 ? key.toLowerCase() : key;
        // a game reads its keys first (the 4D pilot flies with Z Q S D A E)
        if (this.learn.game && k !== '?' && this.learn.key(e)) {
          e.preventDefault();
          return;
        }
        if (k === '?') this.openKeymap();
        else if (k === 'm') this.toggleSound();
        else if (k === 'q') this.setQuality(QUALITY_ORDER[(QUALITY_ORDER.indexOf(settings.quality) + 1) % QUALITY_ORDER.length]);
        else if (!this.learn.key(e)) return;
        e.preventDefault();
        return;
      }
      if (key === 'Escape') {
        if (this.dialog?.isOpen) this.dialog.close();
        else if (this.term.isOpen) this.term.close();
        else if (this.sigma.isOpen) this.sigma.close();
        else if (this.tour.active) this.tour.stop();
        else if (this.cine) this.toggleCinematic();
        else if (document.body.classList.contains('chrome-off')) this.toggleChrome(false);
        return;
      }
      if (this.palette.isOpen || this.dialog?.isOpen) {
        if (key === '?') this.openKeymap();
        return;
      }
      if (tag === 'INPUT' && key.startsWith('Arrow')) return;
      const k = key.length === 1 ? key.toLowerCase() : key;
      const handled = (() => {
        if (k >= '1' && k <= '9' && Number(k) <= this.modules.length) {
          if (this.cine) this.toggleCinematic();
          this.goModule(Number(k) - 1);
          return true;
        }
        switch (k) {
          case 'ArrowRight': this.step(1); return true;
          case 'ArrowLeft': this.step(-1); return true;
          case '?': this.openKeymap(); return true;
          case 's': this.toggleSigma(); return true;
          case ' ': this.togglePause(); return true;
          case 'c': this.toggleCinematic(); return true;
          case 'd': this.openChallenge(); return true;
          case 'p': this.exportPNG(); return true;
          case 'r': this.toggleRecord(); return true;
          case 'q': this.setQuality(QUALITY_ORDER[(QUALITY_ORDER.indexOf(settings.quality) + 1) % QUALITY_ORDER.length]); return true;
          case 'm': this.toggleSound(); return true;
          case 'l': this.toggleScan(); return true;
          case 'h': this.toggleChrome(); return true;
          case 'f': this.fullscreen(); return true;
          case 't': this.startTour('tuto'); return true;
          case 'g': this.openTours(); return true;
          case 'e': this.toggleTerm(); return true;
        }
        return false;
      })();
      if (handled) e.preventDefault();
    });
  }
}
