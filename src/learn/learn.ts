// V3CT0R LEARN controller: home (3D course tree + course list + details), course player,
// transcript, exercises, COLLE, summary sheet, search commands, links with the explorer.
import './learn.css';
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { toast, type Dialog } from '../shell/overlays';
import type { Command } from '../shell/palette';
import type { VizDef } from '../core/types';
import { COURSES, TRACKS, compileCourse, isReady, validateWritten, type Course } from './courses';
import { Reader } from './reader';
import { readingMinutes, WRITTEN_LEVELS } from './written';
import { LearnProgress } from './progress';
import { Player, clock } from './player';
import type { SceneHost } from './scene';
import { renderTokens, rich, plain } from './rich';
import { exerciseCard } from './exercise';
import { printSheet } from './sheet';
import { colleDialog } from './colle';
import { treeViz, type TreeNode } from './tree';
import { LEVEL_LABEL, STATEMENT_LABEL, type LessonMeta } from './types';
import { MODULES } from '../modules/registry';
import { music } from '../core/music';
import { GAMES, gameById } from '../games/registry';
import { gameViz, scoresOf, type GameRun } from '../games/engine';
import { grade, type GameDef } from '../games/types';

export interface LearnHost {
  viewport: HTMLElement;
  rail: HTMLElement;
  panel: HTMLElement;
  scene: SceneHost;
  mountViz(viz: VizDef): void;
  openExplorer(view?: string): void;
  fullscreen(): void;
  setCrumbs(parts: string[]): void;
  free(): boolean;
  openDialog(d: Dialog): void;
  setHash(hash: string): void;
}

const BLANK: VizDef = { id: 'blank', title: '', subtitle: '', stage: '2d', formula: { tex: '', note: '' }, create: () => ({ update() {} }) };

const SHORT = (title: string) => (title.length > 26 ? title.slice(0, 25) + '…' : title);

/** 30-second module intros (level "intro") live outside the curriculum tree */
const isIntro = (c: Course | undefined): boolean => c?.meta.level === 'intro';
const moduleOf = (m: LessonMeta) => MODULES.find((x) => x.id === m.module);
/** "≈ 45 MIN", or "30 S" for an intro */
const length = (m: LessonMeta): string => (m.minutes < 1 ? `${Math.round(m.minutes * 60)} S` : `≈ ${m.minutes} MIN`);

export class Learn {
  readonly progress = new LearnProgress();
  private player: Player | null = null;
  private reader: Reader | null = null;
  private selected = 'riemann';
  private tab: 'transcript' | 'exercises' | 'info' = 'transcript';
  private transcriptEls: HTMLElement[] = [];
  private chapterEls = new Map<string, HTMLElement>();
  private lastCue = -1;
  private lastChapter = '';
  private userScrolledAt = 0;
  private tree: VizDef;
  active = false;

  constructor(private host: LearnHost) {
    if (!COURSES.has(this.selected)) this.selected = [...COURSES.keys()][0] ?? '';
    this.tree = treeViz({
      nodes: () => this.nodes(),
      selected: () => this.selected,
      select: (id) => this.select(id),
      open: (id) => this.open(id),
    });
  }

  // ── status ───────────────────────────────────────────────────────────

  status(id: string): TreeNode['state'] {
    const c = COURSES.get(id);
    if (!c || !isReady(c)) return 'construction';
    if (this.progress.course(id).done) return 'done';
    if (this.host.free()) return 'open';
    const missing = this.missing(id);
    return missing.length ? 'locked' : 'open';
  }

  /** ready prerequisites not finished yet (prerequisites under construction do not block) */
  missing(id: string): Course[] {
    const c = COURSES.get(id);
    if (!c) return [];
    return c.meta.prerequisites
      .map((p) => COURSES.get(p))
      .filter((p): p is Course => !!p && isReady(p) && !this.progress.course(p.meta.id).done);
  }

  private nodes(): TreeNode[] {
    const out: TreeNode[] = [];
    for (const tr of TRACKS)
      for (const id of tr.courses) {
        const c = COURSES.get(id);
        if (!c) continue;
        out.push({ id, title: c.meta.title, short: SHORT(c.meta.title), level: c.meta.level, state: this.status(id), prerequisites: c.meta.prerequisites });
      }
    return out;
  }

  // ── navigation ───────────────────────────────────────────────────────

  enter(id?: string, t?: number, autoplay = false, back: { label: string; run: () => void } | null = null): void {
    this.active = true;
    if (id === 'intros') this.playIntros(0, autoplay);
    else if (id?.startsWith('game:') && gameById(id.slice(5))) this.openGame(id.slice(5), 0, back);
    else if (id && COURSES.has(id)) this.open(id, t, autoplay);
    else this.home();
  }

  leave(): void {
    this.active = false;
    this.stopQueue();
    this.player?.dispose();
    this.player = null;
    this.closeReader();
  }

  // ── the 6 intros one after the other ─────────────────────────────────

  /** intros in the explorer's module order */
  intros(): string[] {
    return MODULES.map((m) => this.introFor(m.id)).filter((id): id is string => !!id);
  }

  /** play every module intro in a row, from the k-th */
  playIntros(k = 0, autoplay = true): void {
    const all = this.intros();
    if (!all.length) return;
    this.queue = all.slice(Math.max(0, Math.min(k, all.length - 1)));
    this.open(this.queue[0], 0, autoplay);
  }

  private queue: string[] = [];
  private queueTimer: ReturnType<typeof setTimeout> | undefined;

  private stopQueue(): void {
    this.queue = [];
    clearTimeout(this.queueTimer);
  }

  /** an intro of the queue just ended: the next one starts after a short beat */
  private advanceQueue(id: string): void {
    const i = this.queue.indexOf(id);
    const next = i >= 0 ? this.queue[i + 1] : undefined;
    if (!next) {
      if (i >= 0) this.stopQueue();
      return;
    }
    toast(`▶ INTRO SUIVANTE : ${COURSES.get(next)?.meta.title.replace('Intro · ', '').toUpperCase() ?? next}`, 2200);
    clearTimeout(this.queueTimer);
    this.queueTimer = setTimeout(() => {
      // still on the end card of that intro (the viewer did not go elsewhere)
      if (this.active && this.player?.course.meta.id === id && this.player.exerciseOpen) {
        this.queue = this.queue.slice(i + 1);
        this.open(next, 0, true);
      }
    }, 2400);
  }

  home(): void {
    this.stopQueue();
    if (this.active) music.setMood('learn');
    this.player?.dispose();
    this.player = null;
    this.closeReader();
    this.host.setHash('#/learn');
    this.host.mountViz(this.tree);
    this.host.setCrumbs(['LEARN', 'ARBRE DES COURS']);
    document.title = 'LEARN — V3CT0R';
    this.paintHomeRail();
    this.paintDetails();
  }

  select(id: string): void {
    if (!COURSES.has(id)) return;
    this.selected = id;
    sfx.tick();
    if (!this.player) {
      this.paintHomeRail();
      this.paintDetails();
    }
  }

  /** `autoplay`: start playing at once (a click on an intro); deep links open paused */
  open(id: string, t?: number, autoplay = false): void {
    const c = COURSES.get(id);
    if (!c) return;
    // opening anything outside the running sequence of intros ends that sequence
    if (!this.queue.includes(id)) this.stopQueue();
    this.selected = id;
    const st = this.status(id);
    if (st === 'construction') {
      toast('▲ COURS EN CONSTRUCTION — PLAN DÉTAILLÉ DANS LE PANNEAU', 2800);
      if (this.player) this.home();
      else this.paintDetails();
      return;
    }
    if (st === 'locked') {
      toast(`◇ VERROUILLÉ — TERMINE D’ABORD : ${this.missing(id).map((x) => x.meta.title).join(', ')}`, 3400);
      sfx.error();
      if (!this.player) this.paintDetails();
      return;
    }
    if (c.written) {
      this.openReader(c);
      return;
    }
    const compiled = compileCourse(id);
    if (!compiled) return;
    this.player?.dispose();
    this.closeReader();
    this.host.mountViz(BLANK);
    // an intro always starts from the beginning; a course resumes where it was left
    const start = t ?? (isIntro(c) ? 0 : (this.progress.course(id).pos ?? 0));
    if (!c.exercises.length && this.tab === 'exercises') this.tab = 'transcript';
    this.player = new Player(this.host.viewport, c, compiled, {
      scene: this.host.scene,
      progress: this.progress,
      onTime: (tt) => this.onTime(tt),
      onEnd: () => (this.paintPlayRail(), this.advanceQueue(id)),
      fullscreen: () => this.host.fullscreen(),
      sheet: () => this.sheet(),
      colle: () => this.colle(),
      home: () => this.home(),
      explore: () => this.exploreModule(c),
    }, start > c.meta.minutes * 60 ? 0 : start);
    if (this.player.errors.length) console.warn(`[learn] ${id}:\n` + this.player.errors.join('\n'));
    this.host.setHash(`#/learn/${id}`);
    document.title = `${c.meta.title} — V3CT0R LEARN`;
    this.lastCue = -1;
    this.lastChapter = '';
    this.paintPlayRail();
    this.paintPlayPanel();
    sfx.open();
    if (autoplay) this.player.play();
    music.setMood('learn');
  }

  get playing(): Player | null {
    return this.player;
  }

  // ── written courses ──────────────────────────────────────────────────

  /** a written course at a chapter, a statement ("st:<id>") or its exercises ("exercises") */
  openAt(id: string, at: string): void {
    const c = COURSES.get(id);
    if (!c?.written) return this.open(id);
    if (this.status(id) !== 'open' && this.status(id) !== 'done') return this.open(id);
    this.openReader(c, at);
  }

  private closeReader(): void {
    this.reader?.dispose();
    this.reader = null;
  }

  private openReader(c: Course, at?: string): void {
    const id = c.meta.id;
    this.player?.dispose();
    this.player = null;
    this.closeReader();
    this.host.mountViz(BLANK);
    const errs = validateWritten(c);
    if (errs.length) console.warn(`[learn] ${id}:\n` + errs.join('\n'));
    const r = new Reader(
      this.host.viewport,
      c,
      {
        progress: this.progress,
        onChapter: (ch) => this.onReadChapter(ch),
        onDone: () => (this.paintReadPanel(), toast('✓ COURS LU — À TOI LES EXERCICES', 2200)),
        sheet: () => this.sheet(id),
        colle: () => this.colle(),
        home: () => this.home(),
      },
      at || this.progress.course(id).done ? 0 : this.progress.course(id).pos,
    );
    this.reader = r;
    if (at) requestAnimationFrame(() => (at === 'exercises' ? r.scrollToExercises() : at.startsWith('st:') ? r.scrollToStatement(at.slice(3)) : r.scrollToChapter(at)));
    this.host.setHash(`#/learn/${id}`);
    this.host.setCrumbs(['LEARN', c.meta.title]);
    document.title = `${c.meta.title} — V3CT0R LEARN`;
    this.lastChapter = '';
    this.paintReadRail();
    this.paintReadPanel();
    sfx.open();
    music.setMood('learn');
  }

  /** test hook */
  get reading(): Reader | null {
    return this.reader;
  }

  private onReadChapter(id: string): void {
    const r = this.reader;
    if (!r) return;
    const order = [...r.course.written!.chapters.map((x) => x.id), 'exercises'];
    for (const [k, el] of this.chapterEls) {
      el.classList.toggle('active', k === id);
      el.classList.toggle('past', order.indexOf(k) < order.indexOf(id));
    }
    const ch = r.course.written!.chapters.find((x) => x.id === id);
    this.host.setCrumbs(['LEARN', r.course.meta.title, ch ? ch.title : 'Exercices']);
  }

  private paintReadRail(): void {
    const r = this.reader;
    if (!r) return;
    const c = r.course;
    const w = c.written!;
    this.chapterEls.clear();
    const list = h('div', { class: 'lr-list' });
    const entry = (id: string, n: string, title: string, go: () => void) => {
      const b = h('button', { type: 'button', class: 'lr-chap' }, h('span', { class: 'tm', text: n }), h('span', { class: 'tt', text: title }));
      b.addEventListener('click', () => (sfx.click(), go()));
      this.chapterEls.set(id, b);
      list.append(b);
    };
    w.chapters.forEach((ch, i) => entry(ch.id, String(i + 1).padStart(2, '0'), ch.title, () => r.scrollToChapter(ch.id)));
    entry('exercises', '✎', `Exercices (${c.exercises.length})`, () => r.scrollToExercises());
    const back = h('button', { type: 'button', class: 'lr-back' }, h('span', { text: '← LEARN' }));
    back.addEventListener('click', () => (sfx.click(), this.home()));
    this.host.rail.replaceChildren(
      h('div', { class: 'rail-head' }, back, h('span', { text: LEVEL_LABEL[c.meta.level] })),
      h('div', { class: 'lr-title' }, h('div', { class: 'tt', text: c.meta.title }), h('div', { class: 'mn', text: `COURS ÉCRIT · LECTURE ≈ ${readingMinutes(w)} MIN · ${c.exercises.length} EXERCICES` })),
      h('div', { class: 'lr-track', text: 'SOMMAIRE' }),
      list,
      this.railButtons(['FICHE RÉCAPITULATIVE (PDF)', 'download', () => this.sheet(c.meta.id)], ['COLLE', 'quiz', () => this.colle()]),
    );
    this.lastChapter = '';
  }

  private paintReadPanel(): void {
    const r = this.reader;
    if (!r) return;
    const c = r.course;
    const m = c.meta;
    const cs = this.progress.course(m.id);
    const body = h('div', { class: 'panel-body lp' });
    const solved = (lv: number) => c.exercises.filter((e) => e.level === lv && (this.progress.ex(m.id, e.id).solved || this.progress.ex(m.id, e.id).self === 'ok')).length;
    body.append(
      h('div', { class: 'ro' }, h('span', { class: 'k', text: 'LECTURE' }), h('span', { class: 'v', text: cs.done ? 'cours lu' : `≈ ${readingMinutes(c.written!)} min` })),
      ...WRITTEN_LEVELS.map((lv) => {
        const n = c.exercises.filter((e) => e.level === lv.level).length;
        return h('div', { class: 'ro' }, h('span', { class: 'k', text: `${lv.label} · ${lv.time}` }), h('span', { class: 'v', text: `${solved(lv.level)}/${n} réussis` }));
      }),
      h('div', { class: 'sec-title', text: 'ÉNONCÉS DU COURS' }),
      ...Object.entries(c.formulas.statements).map(([sid, s]) => {
        const b = h('button', { type: 'button', class: 'tr-cue' }, h('span', { class: 'tm', text: STATEMENT_LABEL[s.kind].slice(0, 4) }), h('span', { class: 'tx', text: s.title }));
        b.addEventListener('click', () => (sfx.click(), r.scrollToStatement(sid)));
        return b;
      }),
    );
    if (m.references?.length) body.append(h('div', { class: 'sec-title', text: 'RÉFÉRENCES' }), h('ul', { class: 'lp-ref' }, ...m.references.map((x) => h('li', { text: x }))));
    this.host.panel.replaceChildren(
      h('div', { class: 'panel-head' }, h('div', { class: 'panel-sys' }, h('span', { text: 'LEARN // LECTURE' }), h('span', { class: 'on', text: 'COURS ÉCRIT' })), h('div', { class: 'panel-title', text: m.title }), m.subtitle ? h('div', { class: 'panel-sub', text: m.subtitle }) : null),
      body,
    );
  }

  // ── frame & keys ─────────────────────────────────────────────────────

  tick(dt: number): void {
    this.player?.tick(dt);
  }

  /** LEARN shortcuts; returns true when handled */
  // ── leçons-jeux ────────────────────────────────────────────────────────

  /** the game being played (its shell runs on the overlay canvas) */
  game: GameRun | null = null;

  /** where Échap and the rail lead after a game launched from elsewhere (a story beacon) */
  private gameBack: { label: string; run: () => void } | null = null;

  openGame(id: string, level = 0, back: { label: string; run: () => void } | null = null): void {
    this.gameBack = back;
    music.setMood('game');
    const def = gameById(id);
    if (!def) return;
    this.stopQueue();
    this.player?.dispose();
    this.player = null;
    this.closeReader();
    this.host.mountViz(
      gameViz(
        def,
        {
          finished: () => (this.paintGameRail(def), this.paintGamePanel(def)),
          home: () => (this.gameBack ? this.gameBack.run() : this.home()),
        },
        level,
        (r) => (this.game = r),
      ),
    );
    this.host.setHash(`#/learn/game:${id}`);
    this.host.setCrumbs(['LEARN', 'JEUX · DÉFIS', def.title]);
    document.title = `${def.title} — V3CT0R LEARN`;
    this.paintGameRail(def);
    this.paintGamePanel(def);
    sfx.open();
  }

  private paintGameRail(def: GameDef): void {
    const sc = scoresOf(def.id, def.levels.length);
    const gb = this.gameBack;
    const back = h('button', { type: 'button', class: 'lr-back' }, h('span', { text: gb ? `← ${gb.label}` : '← LEARN' }));
    back.addEventListener('click', () => (sfx.click(), gb ? gb.run() : this.home()));
    const list = h('div', { class: 'lr-list' });
    def.levels.forEach((L, i) => {
      const b = sc.best[i];
      const btn = h('button', { type: 'button', class: 'lr-chap', title: `Jouer le niveau ${i + 1}` }, h('span', { class: 'tm', text: b === null ? '—' : grade(b) }), h('span', { class: 'tt', text: `${i + 1} · ${L.title}` }));
      btn.addEventListener('click', () => (sfx.click(), this.game?.begin(i)));
      list.append(btn);
    });
    const links: [string, string, () => void][] = [];
    if (def.view) links.push(['VOIR LA VUE DANS L’EXPLORATEUR', 'target', () => this.host.openExplorer(def.view)]);
    if (def.course && COURSES.has(def.course)) links.push([`COURS : ${SHORT(COURSES.get(def.course)!.meta.title).toUpperCase()}`, 'play', () => this.open(def.course!)]);
    this.host.rail.replaceChildren(
      h('div', { class: 'rail-head' }, back, h('span', { text: gb ? 'MISSION' : 'LEÇON-JEU' })),
      h('div', { class: 'lr-title' }, h('div', { class: 'tt', text: def.title }), h('div', { class: 'mn', text: `≈ ${def.minutes} MIN · ${def.levels.length} NIVEAUX · ${sc.plays} PARTIE${sc.plays > 1 ? 'S' : ''}` })),
      h('div', { class: 'lr-track', text: 'NIVEAUX (MEILLEURE NOTE)' }),
      list,
      gb ? this.railButtons([gb.label, 'target', () => gb.run()], ...links) : this.railButtons(...links),
    );
  }

  private paintGamePanel(def: GameDef): void {
    const sc = scoresOf(def.id, def.levels.length);
    const unlocked = sc.best.some((b) => b !== null);
    const th = def.theorem;
    this.host.panel.replaceChildren(
      h('div', { class: 'panel-head' }, h('div', { class: 'panel-sys' }, h('span', { text: 'LEARN // LEÇON-JEU' }), h('span', { class: 'on', text: unlocked ? 'THÉORÈME DÉVOILÉ' : 'EN JEU' })), h('div', { class: 'panel-title', text: def.title }), h('div', { class: 'panel-sub', text: def.subtitle })),
      h(
        'div',
        { class: 'panel-body lp' },
        h('div', { class: 'sec-title', text: 'MISSION' }),
        rich(def.brief, 'rich'),
        h('div', { class: 'sec-title', text: 'RÈGLES' }),
        h('ul', { class: 'lp-ref' }, ...def.rules.map((r) => h('li', {}, rich(r, 'inl rich')))),
        h('div', { class: 'sec-title', text: 'LE THÉORÈME EN JEU' }),
        unlocked
          ? h('div', { class: 'lx-box game-thm' }, h('div', { class: 'lx-box-head' }, h('span', { class: 'kd', text: STATEMENT_LABEL[th.kind] }), h('span', { class: 'tt', text: th.title })), rich(th.body, 'rich'))
          : h('div', { class: 'dim', text: 'Termine un niveau pour le dévoiler : on le comprend mieux après l’avoir joué.' }),
        ...(def.references?.length ? [h('div', { class: 'sec-title', text: 'RÉFÉRENCES' }), h('ul', { class: 'lp-ref' }, ...def.references.map((r) => h('li', { text: r })))] : []),
      ),
    );
  }

  key(e: KeyboardEvent): boolean {
    if (this.game) return this.game.key(e);
    const p = this.player;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (this.reader) {
      if (k === 'Escape') {
        this.home();
        return true;
      }
      if (k === 'f') {
        this.host.fullscreen();
        return true;
      }
      return false;
    }
    if (!p) {
      if (k === 'Enter') {
        this.open(this.selected);
        return true;
      }
      return false;
    }
    switch (k) {
      case ' ':
        p.toggle();
        return true;
      case 'ArrowLeft':
        p.skip(-5);
        return true;
      case 'ArrowRight':
        p.skip(5);
        return true;
      case 'c':
        p.toggleCC();
        return true;
      case 'b': {
        const on = p.toggleSfx();
        if (on === null) return false;
        toast(on ? 'BRUITAGES ACTIVÉS' : 'BRUITAGES COUPÉS', 1000);
        return true;
      }
      case 'f':
        this.host.fullscreen();
        return true;
      case '<':
        p.cycleRate(-1);
        toast(`VITESSE ${String(p.rate).replace('.', ',')}×`, 1000);
        return true;
      case '>':
        p.cycleRate(1);
        toast(`VITESSE ${String(p.rate).replace('.', ',')}×`, 1000);
        return true;
      case 'Escape':
        if (p.exerciseOpen) p.closeCard(false);
        else this.home();
        return true;
    }
    return false;
  }

  // ── rail ─────────────────────────────────────────────────────────────

  private railButtons(...b: [string, string, () => void][]): HTMLElement {
    return h(
      'div',
      { class: 'lr-foot' },
      ...b.map(([label, ico, fn]) => {
        const x = h('button', { type: 'button', class: 'btn' }, icon(ico), h('span', { text: label }));
        x.addEventListener('click', () => (sfx.click(), fn()));
        return x;
      }),
    );
  }

  private paintHomeRail(): void {
    const r = this.host.rail;
    const ready = [...COURSES.values()].filter((c) => isReady(c) && !isIntro(c));
    const done = ready.filter((c) => this.progress.course(c.meta.id).done).length;
    const watched = ready.reduce((s, c) => s + this.progress.course(c.meta.id).watched, 0);
    const list = h('div', { class: 'lr-list' });
    const intros = this.intros();
    const groups = [...(intros.length ? [{ id: 'intros', title: 'INTROS · 30 S', courses: intros }] : []), ...TRACKS];
    for (const tr of groups) {
      list.append(h('div', { class: 'lr-track', text: tr.title }));
      if (tr.id === 'intros') {
        const all = h('button', { type: 'button', class: 'lr-course lr-all', title: `Les ${intros.length} intros à la suite, environ 3 minutes` }, h('span', { class: 'ic', text: '▶' }), h('span', { class: 'tt', text: `TOUTES À LA SUITE` }), h('span', { class: 'mn', text: `${intros.length} × 30″` }));
        all.addEventListener('click', () => (sfx.click(), this.playIntros(0)));
        list.append(all);
        // the leçons-jeux, right after the intros
        list.append(h('div', { class: 'lr-track', text: 'JEUX · DÉFIS' }));
        for (const gdef of GAMES) {
          const sc = scoresOf(gdef.id, gdef.levels.length);
          const best = sc.best.filter((b): b is number => b !== null);
          const gb = h('button', { type: 'button', class: 'lr-course lr-game', title: `${gdef.title} — leçon-jeu, ${gdef.levels.length} niveaux` }, h('span', { class: 'ic', text: '◆' }), h('span', { class: 'tt', text: gdef.title }), h('span', { class: 'mn', text: best.length ? grade(Math.max(...best)) : `${gdef.minutes}′` }));
          gb.addEventListener('click', () => (sfx.click(), this.openGame(gdef.id)));
          list.append(gb);
        }
      }
      for (const id of tr.courses) {
        const c = COURSES.get(id);
        if (!c) continue;
        const st = this.status(id);
        const b = h(
          'button',
          { type: 'button', class: `lr-course s-${st}${id === this.selected ? ' sel' : ''}`, 'aria-pressed': String(id === this.selected), title: `${c.meta.title} — ${st === 'construction' ? 'en construction' : st === 'locked' ? 'verrouillé' : st === 'done' ? 'terminé' : 'disponible'}` },
          h('span', { class: 'ic', text: st === 'done' ? '✓' : st === 'locked' ? '◇' : st === 'construction' ? '▲' : '●' }),
          h('span', { class: 'tt', text: c.meta.title }),
          h('span', { class: 'mn', text: st === 'construction' ? '…' : c.meta.minutes < 1 ? `${Math.round(c.meta.minutes * 60)}″` : `${c.meta.minutes}′` }),
        );
        b.addEventListener('click', () => this.select(id));
        b.addEventListener('dblclick', () => this.open(id));
        list.append(b);
      }
    }
    r.replaceChildren(
      h('div', { class: 'rail-head' }, h('span', { text: '[ LEARN ]' }), h('span', { text: String(COURSES.size).padStart(2, '0') })),
      h('div', { class: 'rail-prog' }, h('div', { class: 'rp-top' }, h('span', { text: 'COURS TERMINÉS' }), h('span', { class: 'rp-n', text: `${done}/${ready.length}` })), h('div', { class: 'rp-bar' }, h('i', { style: `width:${ready.length ? (100 * done) / ready.length : 0}%` })), h('div', { class: 'rp-rank', text: `TEMPS D’ÉTUDE ${clock(watched)}` })),
      list,
      this.railButtons(['COLLE', 'quiz', () => this.colle()], ['EXPLORER', 'target', () => this.host.openExplorer()]),
    );
  }

  private paintPlayRail(): void {
    const p = this.player;
    if (!p) return;
    const c = p.course;
    this.chapterEls.clear();
    const list = h('div', { class: 'lr-list' });
    for (const ch of p.c.timeline.chapters) {
      const b = h('button', { type: 'button', class: 'lr-chap' }, h('span', { class: 'tm', text: clock(ch.t) }), h('span', { class: 'tt', text: ch.title }));
      b.addEventListener('click', () => {
        sfx.click();
        p.seek(ch.t + 0.01);
      });
      this.chapterEls.set(ch.id, b);
      list.append(b);
    }
    const intro = isIntro(c);
    const back = h('button', { type: 'button', class: 'lr-back' }, h('span', { text: intro ? '← EXPLORER' : '← LEARN' }));
    back.addEventListener('click', () => (sfx.click(), intro ? this.exploreModule(c) : this.home()));
    const sceneBtn: [string, string, () => void][] = p.driver.views.length ? [['OUVRIR LA SCÈNE DANS L’EXPLORATEUR', 'target', () => this.openSceneInExplorer()]] : [];
    const voice = c.voiced ? 'VOIX OFF' : 'SOUS-TITRES (VOIX NON GÉNÉRÉE)';
    this.host.rail.replaceChildren(
      h('div', { class: 'rail-head' }, back, h('span', { text: LEVEL_LABEL[c.meta.level] })),
      h('div', { class: 'lr-title' }, h('div', { class: 'tt', text: c.meta.title }), h('div', { class: 'mn', text: intro ? `${length(c.meta)} · ${p.driver.views.length} VUES À L’ÉCRAN · ${voice}` : `${length(c.meta)} · ${p.c.timeline.chapters.length} CHAPITRES · ${voice}` })),
      h('div', { class: 'lr-track', text: 'CHAPITRES' }),
      list,
      intro
        ? this.railButtons([`EXPLORER LE MODULE ${moduleOf(c.meta)?.title ?? ''}`.trim(), 'target', () => this.exploreModule(c)], ...sceneBtn)
        : this.railButtons(['FICHE RÉCAPITULATIVE (PDF)', 'download', () => this.sheet()], ['COLLE', 'quiz', () => this.colle()], ...sceneBtn),
    );
    this.lastChapter = '';
  }

  // ── panel ────────────────────────────────────────────────────────────

  private paintDetails(): void {
    const c = COURSES.get(this.selected);
    const P = this.host.panel;
    if (!c) {
      P.replaceChildren();
      return;
    }
    const m = c.meta;
    const st = this.status(m.id);
    const cs = this.progress.course(m.id);
    const intro = isIntro(c);
    const mod = moduleOf(m);
    const action = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: intro ? `LANCER L’INTRO (${length(m)})` : st === 'construction' ? 'EN CONSTRUCTION' : st === 'locked' ? 'VERROUILLÉ' : c.written ? (cs.done ? 'RELIRE LE COURS' : cs.pos > 1 ? `REPRENDRE LA LECTURE (${Math.round(cs.pos)} %)` : 'LIRE LE COURS') : cs.pos > 5 && !cs.done ? `REPRENDRE À ${clock(cs.pos)}` : cs.done ? 'REVOIR LE COURS' : 'COMMENCER LE COURS' }), h('span', { class: 'k', text: '⏎' }));
    action.disabled = st === 'construction' || st === 'locked';
    action.addEventListener('click', () => this.open(m.id, cs.done || intro ? 0 : undefined, intro));
    const sheet = h('button', { type: 'button', class: 'btn' }, icon(intro ? 'target' : 'download'), h('span', { text: intro ? 'EXPLORER LE MODULE' : 'FICHE PDF' }));
    sheet.disabled = st === 'construction';
    sheet.addEventListener('click', () => (intro ? this.exploreModule(c) : this.sheet(m.id)));
    const pre = m.prerequisites.map((id) => {
      const p = COURSES.get(id);
      const s = this.status(id);
      return h('li', { class: `s-${s}` }, h('span', { text: `${s === 'done' ? '✓' : s === 'construction' ? '▲' : '◇'} ${p?.meta.title ?? id}` }));
    });
    const plan = (m.plan ?? []).map((sec) => h('div', { class: 'lp-sec' }, h('div', { class: 'lp-sec-t', text: sec.title }), h('ul', {}, ...sec.items.map((x) => h('li', {}, rich(x, 'inl rich'))))));
    P.replaceChildren(
      h(
        'div',
        { class: 'panel-head' },
        h('div', { class: 'panel-sys' }, h('span', { text: `LEARN // ${LEVEL_LABEL[m.level]}` }), h('span', { class: 'on', text: st === 'construction' ? 'EN CONSTRUCTION' : st === 'locked' ? 'VERROUILLÉ' : st === 'done' ? 'TERMINÉ' : 'DISPONIBLE' })),
        h('div', { class: 'panel-title', text: m.title }),
        m.subtitle ? h('div', { class: 'panel-sub', text: m.subtitle }) : null,
        h('div', { class: 'panel-actions' }, action, sheet),
      ),
      h(
        'div',
        { class: 'panel-body lp' },
        h('div', { class: 'ro' }, h('span', { class: 'k', text: 'DURÉE' }), h('span', { class: 'v', text: m.minutes < 1 ? `${Math.round(m.minutes * 60)} s` : c.written ? `lecture ≈ ${m.minutes} min · ${c.exercises.length} exercices (10 min à 1 h+)` : `≈ ${m.minutes} min` })),
        c.written ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'FORMAT' }), h('span', { class: 'v', text: 'cours écrit, à lire à son rythme' })) : null,
        intro && mod ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'MODULE' }), h('span', { class: 'v', text: `${mod.code} · ${mod.title} · ${mod.vizs.length} vues` })) : null,
        intro ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'VOIX' }), h('span', { class: 'v', text: c.voiced ? 'voix off' : 'sous-titres (voix non générée)' })) : null,
        st !== 'construction' && !intro ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'PROGRESSION' }), h('span', { class: 'v', text: cs.done ? 'terminé' : c.written ? (cs.pos > 1 ? `${Math.round(cs.pos)} % lus` : 'pas commencé') : cs.pos > 5 ? `${clock(cs.pos)} vues` : 'pas commencé' })) : null,
        st !== 'construction' && !intro ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'EXERCICES' }), h('span', { class: 'v', text: `${this.progress.solvedCount(m.id)}/${c.exercises.length} réussis` })) : null,
        intro ? null : h('div', { class: 'sec-title', text: 'PRÉREQUIS' }),
        intro ? null : pre.length ? h('ul', { class: 'lp-pre' }, ...pre) : h('div', { class: 'dim', text: 'aucun' }),
        intro && mod ? h('div', { class: 'sec-title', text: 'VUES DU MODULE' }) : null,
        intro && mod ? h('ol', { class: 'lp-ch' }, ...mod.vizs.map((v) => h('li', { text: v.title }))) : null,
        m.chapters.length && st !== 'construction' && !intro ? h('div', { class: 'sec-title', text: 'CHAPITRES' }) : null,
        m.chapters.length && st !== 'construction' && !intro ? h('ol', { class: 'lp-ch' }, ...m.chapters.map((x) => h('li', { text: x.title }))) : null,
        plan.length ? h('div', { class: 'sec-title', text: st === 'construction' ? 'PLAN DÉTAILLÉ' : 'PLAN' }) : null,
        ...plan,
        m.tags.length ? h('div', { class: 'lp-tags' }, ...m.tags.map((t) => h('span', { text: t }))) : null,
        m.references?.length ? h('div', { class: 'sec-title', text: 'RÉFÉRENCES' }) : null,
        m.references?.length ? h('ul', { class: 'lp-ref' }, ...m.references.map((r) => h('li', { text: r }))) : null,
      ),
    );
  }

  private paintPlayPanel(): void {
    const p = this.player;
    if (!p) return;
    const P = this.host.panel;
    const kinds = p.course.exercises.length ? (['transcript', 'exercises', 'info'] as const) : (['transcript', 'info'] as const);
    const tabs = kinds.map((k) => {
      const b = h('button', { type: 'button', role: 'tab', 'aria-selected': String(this.tab === k), text: k === 'transcript' ? 'TRANSCRIPTION' : k === 'exercises' ? `EXERCICES (${p.course.exercises.length})` : 'INFOS' });
      b.addEventListener('click', () => {
        sfx.click();
        this.tab = k;
        this.paintPlayPanel();
      });
      return b;
    });
    const body = h('div', { class: 'panel-body lp' });
    body.addEventListener('wheel', () => (this.userScrolledAt = performance.now()), { passive: true });
    this.transcriptEls = [];
    if (this.tab === 'transcript') {
      const cues = p.c.timeline.cues;
      let ch = '';
      cues.forEach((q, i) => {
        if (q.chapter !== ch) {
          ch = q.chapter;
          const title = p.c.timeline.chapters.find((x) => x.id === ch)?.title ?? ch;
          body.append(h('div', { class: 'tr-ch', text: title }));
        }
        const el = h('button', { type: 'button', class: 'tr-cue', title: `Aller à ${clock(q.t0)}` }, h('span', { class: 'tm', text: clock(q.t0) }), renderTokens(q.tokens, h('span', { class: 'tx' })));
        el.addEventListener('click', () => p.seek(q.t0 + 0.01));
        this.transcriptEls.push(el);
        body.append(el);
      });
    } else if (this.tab === 'exercises') {
      const cid = p.course.meta.id;
      for (const ex of p.course.exercises) body.append(exerciseCard(ex, { state: this.progress.ex(cid, ex.id), update: (x) => this.progress.updateEx(cid, ex.id, x) }));
    } else if (isIntro(p.course)) {
      const mod = moduleOf(p.course.meta);
      body.append(h('div', { class: 'sec-title', text: 'VUES DU MODULE' }));
      for (const [i, v] of (mod?.vizs ?? []).entries()) {
        const id = `${mod!.id}/${v.id}`;
        const shown = p.driver.views.includes(id);
        const b = h('button', { type: 'button', class: 'tr-cue', title: `Ouvrir ${v.title} dans l’explorateur` }, h('span', { class: 'tm', text: `${mod!.code}.${String(i + 1).padStart(2, '0')}` }), h('span', { class: 'tx', text: `${v.title}${shown ? ' · à l’écran' : ''}` }));
        b.addEventListener('click', () => {
          sfx.click();
          p.pause();
          this.host.openExplorer(id);
        });
        body.append(b);
      }
    } else {
      const m = p.course.meta;
      const stm = Object.entries(p.course.formulas.statements);
      body.append(
        h('div', { class: 'sec-title', text: 'ÉNONCÉS DU COURS' }),
        ...stm.map(([id, s]) => {
          const b = h('button', { type: 'button', class: 'tr-cue' }, h('span', { class: 'tm', text: STATEMENT_LABEL[s.kind].slice(0, 4) }), h('span', { class: 'tx', text: s.title }));
          b.addEventListener('click', () => {
            const ev = p.c.timeline.events.find((e) => e.m.kind === 'box' && e.m.name === id);
            if (ev) p.seek(ev.t + 0.01);
          });
          return b;
        }),
      );
      if (m.references?.length) body.append(h('div', { class: 'sec-title', text: 'RÉFÉRENCES' }), h('ul', { class: 'lp-ref' }, ...m.references.map((r) => h('li', { text: r }))));
    }
    P.replaceChildren(
      h('div', { class: 'panel-head' }, h('div', { class: 'panel-sys' }, h('span', { text: 'LEARN // LECTURE' }), h('span', { class: 'on', text: p.course.voiced ? 'VOIX' : 'SOUS-TITRES' })), h('div', { class: 'panel-title', text: p.course.meta.title }), h('div', { class: 'lp-tabs', role: 'tablist' }, ...tabs)),
      body,
    );
    this.lastCue = -1;
  }

  private onTime(t: number): void {
    const p = this.player;
    if (!p) return;
    const ch = [...p.c.timeline.chapters].reverse().find((x) => x.t <= t + 1e-6);
    if (ch && ch.id !== this.lastChapter) {
      this.lastChapter = ch.id;
      for (const [id, el] of this.chapterEls) {
        el.classList.toggle('active', id === ch.id);
        el.classList.toggle('past', p.c.timeline.chapters.findIndex((x) => x.id === id) < p.c.timeline.chapters.findIndex((x) => x.id === ch.id));
      }
      this.host.setCrumbs(['LEARN', p.course.meta.title, ch.title]);
    }
    const k = p.cueIndex;
    if (k !== this.lastCue && this.transcriptEls.length) {
      this.transcriptEls[this.lastCue]?.classList.remove('on');
      const el = this.transcriptEls[k];
      if (el) {
        el.classList.add('on');
        if (performance.now() - this.userScrolledAt > 4000) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      this.lastCue = k;
    }
  }

  // ── actions ──────────────────────────────────────────────────────────

  sheet(id = this.player?.course.meta.id ?? this.reader?.course.meta.id ?? this.selected): void {
    const c = COURSES.get(id);
    if (!c) return;
    this.player?.pause();
    printSheet(c, compileCourse(id));
  }

  colle(): void {
    this.player?.pause();
    const pool = [...COURSES.values()].filter((c) => c.exercises.length && (this.status(c.meta.id) === 'open' || this.status(c.meta.id) === 'done'));
    const d = colleDialog(pool, this.progress, (id) => this.open(id));
    if (d) this.host.openDialog(d);
  }

  private openSceneInExplorer(): void {
    const p = this.player;
    if (!p) return;
    const v = p.driver.at(p.t)?.view ?? p.driver.views[0];
    p.pause();
    if (v) this.host.openExplorer(v);
  }

  /** the 30-second intro of an explorer module, if any */
  introFor(module: string): string | null {
    const id = `intro-${module}`;
    const c = COURSES.get(id);
    return c && isIntro(c) && c.meta.module === module && c.hasScript ? id : null;
  }

  /** back from an intro: the first view of its module in the explorer */
  private exploreModule(c: Course): void {
    const mod = moduleOf(c.meta);
    this.player?.pause();
    this.host.openExplorer(mod ? `${mod.id}/${mod.vizs[0].id}` : undefined);
  }

  /** a ready course using this explorer view as a scene, and when (intros excluded) */
  courseForView(view: string): { id: string; t: number; title: string } | null {
    for (const c of COURSES.values()) {
      if (isIntro(c) || !c.scenes.includes(view) || this.status(c.meta.id) === 'construction') continue;
      const comp = compileCourse(c.meta.id);
      const ev = comp?.timeline.events.find((e) => e.m.kind === 'scene' && e.m.name === view);
      if (ev) return { id: c.meta.id, t: ev.t, title: c.meta.title };
    }
    return null;
  }

  /** Ctrl+K entries: courses, chapters, statements (theorems, definitions…) */
  commands(go: (fn: () => void) => void): Command[] {
    const out: Command[] = [];
    out.push({ id: 'learn:home', label: 'LEARN · ARBRE DES COURS', group: 'LEARN', keywords: 'cours accueil cursus', run: () => go(() => this.home()) });
    out.push({ id: 'learn:colle', label: 'LEARN · COLLE (EXERCICE CHRONOMÉTRÉ)', group: 'LEARN', keywords: 'colle oral exercice note', run: () => go(() => this.colle()) });
    out.push({ id: 'learn:intros', label: '▶ LES 6 INTROS À LA SUITE (≈ 3 MIN)', group: 'INTROS 30 S', keywords: 'intro intros toutes suite enchaîner playlist vidéos bande-annonce', run: () => go(() => this.playIntros(0)) });
    for (const gdef of GAMES) out.push({ id: `learn:game:${gdef.id}`, label: `◆ JEU · ${gdef.title}`, group: 'JEUX · DÉFIS', keywords: `jeu défi leçon-jeu ${gdef.subtitle} ${gdef.theorem.title}`, run: () => go(() => this.openGame(gdef.id)) });
    for (const c of COURSES.values()) {
      const m = c.meta;
      if (isIntro(c)) {
        const mod = moduleOf(m);
        out.push({ id: `learn:${m.id}`, label: `▶ INTRO 30 S · ${mod?.title ?? m.title}`, group: 'INTROS 30 S', keywords: `intro introduction vidéo présentation bande-annonce module ${mod?.title ?? ''} ${m.tags.join(' ')}`, run: () => go(() => this.open(m.id, 0, true)) });
        continue;
      }
      const st = this.status(m.id);
      const tag = st === 'construction' ? '▲ ' : st === 'locked' ? '◇ ' : '';
      out.push({ id: `learn:${m.id}`, label: `${tag}${m.title}`, group: `COURS · ${LEVEL_LABEL[m.level]}`, keywords: `${m.tags.join(' ')} ${m.subtitle ?? ''} cours`, run: () => go(() => (st === 'construction' ? (this.home(), this.select(m.id)) : this.open(m.id))) });
      if (st === 'construction') continue;
      if (c.written) {
        for (const ch of c.written.chapters) out.push({ id: `learn:${m.id}:${ch.id}`, label: ch.title, group: `CHAPITRE · ${SHORT(m.title)}`, keywords: m.title, run: () => go(() => this.openAt(m.id, ch.id)) });
        out.push({ id: `learn:${m.id}:exercises`, label: `EXERCICES · ${m.title}`, group: `CHAPITRE · ${SHORT(m.title)}`, keywords: 'exercices simple moyen complexe entraînement', run: () => go(() => this.openAt(m.id, 'exercises')) });
        for (const [sid, s] of Object.entries(c.formulas.statements))
          out.push({ id: `learn:${m.id}:${sid}`, label: `${STATEMENT_LABEL[s.kind]} · ${s.title}`, group: SHORT(m.title), keywords: `${plainBody(s.body)} ${m.title}`, run: () => go(() => this.openAt(m.id, `st:${sid}`)) });
        continue;
      }
      const comp = c.hasScript ? compileCourse(m.id) : null;
      for (const ch of comp?.timeline.chapters ?? [])
        out.push({ id: `learn:${m.id}:${ch.id}`, label: `${ch.title}`, group: `CHAPITRE · ${SHORT(m.title)}`, keywords: m.title, run: () => go(() => this.open(m.id, ch.t + 0.01)) });
      for (const [sid, s] of Object.entries(c.formulas.statements)) {
        const ev = comp?.timeline.events.find((e) => e.m.kind === 'box' && e.m.name === sid);
        out.push({ id: `learn:${m.id}:${sid}`, label: `${STATEMENT_LABEL[s.kind]} · ${s.title}`, group: SHORT(m.title), keywords: `${plainBody(s.body)} ${m.title}`, run: () => go(() => this.open(m.id, ev ? ev.t + 0.01 : undefined)) });
      }
    }
    return out;
  }

  refresh(): void {
    if (!this.active) return;
    if (this.player) this.paintPlayRail();
    else if (this.reader) this.paintReadPanel();
    else {
      this.paintHomeRail();
      this.paintDetails();
    }
  }
}

const plainBody = (s: string) => plain([{ t: 'text', s }]).slice(0, 200);
