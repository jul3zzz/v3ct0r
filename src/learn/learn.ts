// V3CT0R LEARN controller: home (3D course tree + course list + details), course player,
// transcript, exercises, COLLE, summary sheet, search commands, links with the explorer.
import './learn.css';
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { toast, type Dialog } from '../shell/overlays';
import type { Command } from '../shell/palette';
import type { VizDef } from '../core/types';
import { COURSES, TRACKS, compileCourse, isReady, resolveRef, validateWritten, type Course } from './courses';
import { Reader } from './reader';
import { readingMinutes, WRITTEN_LEVELS } from './written';
import { LearnProgress } from './progress';
import { Player, clock } from './player';
import type { SceneHost } from './scene';
import { renderTokens, rich, plain } from './rich';
import { exerciseCard } from './exercise';
import { printSheet } from './sheet';
import { colleDialog } from './colle';
import { graphViz } from './graph-view';
import { DEFAULT_FILTER, buildGraph, chapterNode, courseNode, nodeVisible, searchGraph, statementNode, courseVisible, type GNode, type Graph, type GraphFilter } from './graph';
import { layoutGraph, type Layout } from './layout';
import { FILIERES, FILIERES_1, FILIERES_2, LEVEL_LABEL, STATEMENT_LABEL, courseYear, filiereYear, type Filiere, type LessonMeta, type Level } from './types';
import { store } from '../core/settings';
import { MODULES } from '../modules/registry';
import { music } from '../core/music';
import { GAMES, gameById } from '../games/registry';
import { gameViz, scoresOf, type GameRun } from '../games/engine';
import { grade, type GameDef } from '../games/types';
import { touchScreen } from '../core/touch';

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

/** construction: plan only · locked: prerequisites missing · open · done */
export type CourseState = 'construction' | 'locked' | 'open' | 'done';

const FILTER_KEY = 'learn.filter';
const SHOWN_LEVELS: [Level, string][] = [['prepa', 'PRÉPA'], ['master', 'MASTER'], ['doctorat', 'DOCTORAT']];

/** the saved filter, checked field by field (an old or damaged value falls back to the default) */
function loadFilter(): GraphFilter {
  const f = store.get<Partial<GraphFilter>>(FILTER_KEY, {});
  const levels = Array.isArray(f.levels) ? f.levels.filter((l) => SHOWN_LEVELS.some(([x]) => x === l)) : [];
  return {
    filiere: f.filiere && (f.filiere === 'ALL' || FILIERES.includes(f.filiere)) ? f.filiere : DEFAULT_FILTER.filiere,
    levels: levels.length ? levels : [...DEFAULT_FILTER.levels],
    chapters: typeof f.chapters === 'boolean' ? f.chapters : DEFAULT_FILTER.chapters,
    statements: typeof f.statements === 'boolean' ? f.statements : DEFAULT_FILTER.statements,
  };
}

/** short tag of a graph node: COURS, CHAP, THÉO, DÉFI… */
const nodeTag = (n: GNode): string => (n.kind === 'course' ? 'COURS' : n.kind === 'chapter' ? 'CHAP' : STATEMENT_LABEL[n.stKind ?? 'remark'].slice(0, 4));

export class Learn {
  readonly progress = new LearnProgress();
  private player: Player | null = null;
  private reader: Reader | null = null;
  private selected = '';
  private tab: 'transcript' | 'exercises' | 'info' = 'transcript';
  private transcriptEls: HTMLElement[] = [];
  private chapterEls = new Map<string, HTMLElement>();
  private lastCue = -1;
  private lastChapter = '';
  private userScrolledAt = 0;
  private graphView: VizDef;
  // the home graph: built once, filtered and lit from the progress
  private g: Graph | null = null;
  private lay: Layout | null = null;
  private filter: GraphFilter = loadFilter();
  private vis = new Uint8Array(0);
  private bright = new Float32Array(0);
  private gver = 0;
  /** node selected in the graph (-1: none) */
  private focus = -1;
  private flight: number | null = null;
  private query = '';
  private listEl: HTMLElement | null = null;
  active = false;

  constructor(private host: LearnHost) {
    // first selection: the first course of the curriculum that can be read now (not the demo)
    const curriculum = TRACKS.filter((t) => t.id !== 'demo').flatMap((t) => t.courses);
    this.selected = curriculum.find((id) => this.status(id) === 'open') ?? curriculum.find((id) => COURSES.has(id)) ?? [...COURSES.keys()][0] ?? '';
    this.graphView = graphViz({
      graph: () => this.graph(),
      layout: () => this.layout(),
      visible: () => this.vis,
      brightness: () => this.bright,
      courseState: (c) => this.status(c),
      version: () => this.gver,
      selected: () => this.focus,
      select: (i) => this.pickNode(i),
      open: (i) => this.openNode(i),
      takeFlight: () => {
        const f = this.flight;
        this.flight = null;
        return f;
      },
    });
    // [[course#anchor]] links, wherever a course text is shown (reader, panel, exercises)
    document.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest?.('a.xref') as HTMLElement | null;
      if (!a) return;
      e.preventDefault();
      if (this.active && a.dataset.ref) this.followRef(a.dataset.ref);
    });
  }

  // ── the graph ────────────────────────────────────────────────────────

  graph(): Graph {
    return (this.g ??= buildGraph());
  }

  private layout(): Layout {
    return (this.lay ??= layoutGraph(this.graph()));
  }

  /** visibility (filters) and brightness (progress) of every node */
  private recompute(): void {
    const g = this.graph();
    const B: Record<CourseState, number> = { construction: 0.4, locked: 0.6, open: 0.85, done: 1 };
    const states = new Map<string, CourseState>();
    this.vis = new Uint8Array(g.nodes.length);
    this.bright = new Float32Array(g.nodes.length);
    g.nodes.forEach((n, i) => {
      this.vis[i] = nodeVisible(n, this.filter) ? 1 : 0;
      let s = states.get(n.course);
      if (!s) states.set(n.course, (s = this.status(n.course)));
      this.bright[i] = B[s];
    });
    this.gver++;
  }

  /** select a node of the graph (its card goes to the panel); `fly`: the camera goes to it */
  private pickNode(i: number, fly = false): void {
    const n = this.graph().nodes[i];
    if (!n) return;
    this.focus = i;
    this.selected = n.course;
    this.gver++;
    if (fly) this.flight = i;
    sfx.tick();
    if (!this.player && !this.reader && !this.game) {
      this.markSelected();
      this.paintDetails();
    }
  }

  /** open a node: the course, the chapter, or the statement in its course */
  private openNode(i: number): void {
    const n = this.graph().nodes[i];
    if (!n) return;
    const c = COURSES.get(n.course);
    if (!c) return;
    const st = this.status(n.course);
    if (n.kind === 'course' || st === 'construction' || st === 'locked') return this.open(n.course);
    if (c.written) return this.openAt(n.course, n.kind === 'chapter' ? n.anchor! : `st:${n.anchor}`);
    // a video course: the start of the chapter, or the moment the statement is shown
    const tl = compileCourse(n.course)?.timeline;
    const t = n.kind === 'chapter' ? tl?.chapters.find((x) => x.id === n.anchor)?.t : tl?.events.find((e) => e.m.kind === 'box' && e.m.name === n.anchor)?.t;
    this.open(n.course, t !== undefined ? t + 0.01 : undefined);
  }

  /** a [[course#anchor]] link was clicked */
  followRef(key: string): void {
    const [course, anchor] = key.split('#');
    const tg = resolveRef({ course, ...(anchor ? { anchor } : {}) });
    if (!tg) return;
    sfx.click();
    const st = this.status(course);
    const c = COURSES.get(course)!;
    // a statement not drawn in the graph (a proof) still opens in its course
    if (tg.kind === 'statement' && c.written && (st === 'open' || st === 'done')) return this.openAt(course, `st:${anchor}`);
    const g = this.graph();
    const i = g.index.get(tg.kind === 'course' ? courseNode(course) : tg.kind === 'chapter' ? chapterNode(course, anchor) : statementNode(course, anchor)) ?? g.index.get(courseNode(course));
    if (i === undefined) return this.open(course);
    if (st === 'construction' || st === 'locked') {
      // nothing to read yet: show it in the graph
      this.home();
      this.pickNode(i, true);
      return;
    }
    this.openNode(i);
  }

  // ── status ───────────────────────────────────────────────────────────

  status(id: string): CourseState {
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
    this.recompute();
    const g = this.graph();
    // the graph keeps the node last selected (a chapter, a statement) when it belongs to the selected course
    if (this.focus < 0 || g.nodes[this.focus]?.course !== this.selected) this.focus = g.index.get(courseNode(this.selected)) ?? -1;
    this.host.mountViz(this.graphView);
    this.host.setCrumbs(['LEARN', 'GRAPHE DES COURS']);
    document.title = 'LEARN — V3CT0R';
    this.paintHomeRail();
    this.paintDetails();
  }

  /** select a course (rail, Ctrl+K): the graph flies to it */
  select(id: string): void {
    if (!COURSES.has(id)) return;
    const i = this.graph().index.get(courseNode(id));
    if (i !== undefined) return this.pickNode(i, true);
    this.selected = id;
    sfx.tick();
    if (!this.player && !this.reader) {
      this.markSelected();
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
    const r = this.reader;
    // already reading that course: just scroll
    if (r && r.course.meta.id === id) return at === 'exercises' ? r.scrollToExercises() : at.startsWith('st:') ? r.scrollToStatement(at.slice(3)) : r.scrollToChapter(at);
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
        h('ul', { class: 'lp-ref' }, ...((touchScreen() && def.touchRules) || def.rules).map((r) => h('li', {}, rich(r, 'inl rich')))),
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
        if (this.focus >= 0) this.openNode(this.focus);
        else this.open(this.selected);
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
    this.listEl = h('div', { class: 'lr-list' });
    // search: courses, chapters and statements of the graph
    const search = h('input', { type: 'search', class: 'lr-search', placeholder: 'Chercher un cours, un théorème…', 'aria-label': 'Chercher dans le graphe des cours', spellcheck: 'false', autocomplete: 'off' }) as HTMLInputElement;
    search.value = this.query;
    search.addEventListener('input', () => {
      this.query = search.value;
      this.paintHomeList();
    });
    search.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const first = this.listEl?.querySelector<HTMLButtonElement>('.lr-hit');
        first?.click();
      } else if (e.key === 'Escape') {
        this.query = search.value = '';
        this.paintHomeList();
      }
    });
    r.replaceChildren(
      h('div', { class: 'rail-head' }, h('span', { text: '[ LEARN ]' }), h('span', { text: String(COURSES.size).padStart(2, '0') })),
      h('div', { class: 'rail-prog' }, h('div', { class: 'rp-top' }, h('span', { text: 'COURS TERMINÉS' }), h('span', { class: 'rp-n', text: `${done}/${ready.length}` })), h('div', { class: 'rp-bar' }, h('i', { style: `width:${ready.length ? (100 * done) / ready.length : 0}%` })), h('div', { class: 'rp-rank', text: `TEMPS D’ÉTUDE ${clock(watched)}` })),
      h('div', { class: 'lr-find' }, search),
      this.filterBar(),
      this.listEl,
      this.railButtons(['COLLE', 'quiz', () => this.colle()], ['EXPLORER', 'target', () => this.host.openExplorer()]),
    );
    this.paintHomeList();
  }

  /** filière (one, or all), levels, chapters and statements shown */
  private filterBar(): HTMLElement {
    const f = this.filter;
    const chip = (label: string, on: boolean, title: string, fn: () => void) => {
      const b = h('button', { type: 'button', class: `lr-chip${on ? ' on' : ''}`, 'aria-pressed': String(on), title, text: label });
      b.addEventListener('click', () => {
        sfx.click();
        fn();
        store.set(FILTER_KEY, this.filter);
        this.recompute();
        this.paintHomeRail();
      });
      return b;
    };
    const fil = (x: Filiere) => chip(x, f.filiere === x, `Seulement les cours du programme ${x} (${filiereYear(x)}${filiereYear(x) === 1 ? 're' : 'e'} année)`, () => (this.filter = { ...f, filiere: f.filiere === x ? 'ALL' : x }));
    const toggle = <K extends 'chapters' | 'statements'>(k: K, label: string, title: string) => chip(label, f[k], title, () => (this.filter = { ...f, [k]: !f[k] }));
    // at least one level stays shown (an empty graph would look broken)
    const level = ([lv, label]: [Level, string]) => chip(label, f.levels.includes(lv), `Montrer les cours ${LEVEL_LABEL[lv]}`, () => (this.filter = { ...f, levels: !f.levels.includes(lv) ? [...f.levels, lv] : f.levels.length > 1 ? f.levels.filter((x) => x !== lv) : f.levels }));
    return h(
      'div',
      { class: 'lr-filters', role: 'group', 'aria-label': 'Filtres du graphe' },
      h('div', { class: 'lr-frow' }, h('span', { class: 'k', text: 'FILIÈRE' }), chip('TOUTES', f.filiere === 'ALL', 'Tous les cours de prépa', () => (this.filter = { ...f, filiere: 'ALL' }))),
      h('div', { class: 'lr-frow' }, h('span', { class: 'k', text: '1re' }), ...FILIERES_1.map(fil)),
      h('div', { class: 'lr-frow' }, h('span', { class: 'k', text: '2e' }), ...FILIERES_2.map(fil)),
      h('div', { class: 'lr-frow' }, h('span', { class: 'k', text: 'VOIR' }), ...SHOWN_LEVELS.map(level)),
      h('div', { class: 'lr-frow' }, h('span', { class: 'k' }), toggle('chapters', 'CHAPITRES', 'Montrer les chapitres dans le graphe'), toggle('statements', 'ÉNONCÉS', 'Montrer les énoncés (définitions, théorèmes…) dans le graphe')),
    );
  }

  /** the selected course, highlighted in the list without rebuilding it */
  private markSelected(): void {
    for (const b of this.host.rail.querySelectorAll<HTMLElement>('.lr-course[data-id]')) {
      const on = b.dataset.id === this.selected;
      b.classList.toggle('sel', on);
      b.setAttribute('aria-pressed', String(on));
    }
    for (const b of this.host.rail.querySelectorAll<HTMLElement>('.lr-hit')) b.classList.toggle('sel', Number(b.dataset.node) === this.focus);
  }

  /** search results, or the courses grouped by year and filière */
  private paintHomeList(): void {
    const list = this.listEl;
    if (!list) return;
    list.replaceChildren();
    const g = this.graph();
    if (this.query.trim()) {
      // only what the graph shows (a hidden node could not be lit or reached), 40 at most
      const found = searchGraph(g, this.query, (i) => !!this.vis[i], 41);
      const hits = found.slice(0, 40);
      list.append(h('div', { class: 'lr-track', text: hits.length ? `${found.length > 40 ? '40+' : hits.length} RÉSULTAT${hits.length > 1 ? 'S' : ''}` : 'AUCUN RÉSULTAT' }));
      const courseTitle = (id: string) => SHORT(COURSES.get(id)?.meta.title ?? id);
      for (const i of hits) {
        const n = g.nodes[i];
        const b = h('button', { type: 'button', class: `lr-hit${i === this.focus ? ' sel' : ''}`, 'data-node': String(i), title: `${n.title} — ${COURSES.get(n.course)?.meta.title ?? ''}` }, h('span', { class: 'tg', text: nodeTag(n) }), h('span', { class: 'tt', text: n.title }), n.kind === 'course' ? null : h('span', { class: 'mn', text: courseTitle(n.course) }));
        b.addEventListener('click', () => this.pickNode(i, true));
        b.addEventListener('dblclick', () => this.openNode(i));
        list.append(b);
      }
      return;
    }
    const intros = this.intros();
    const f = this.filter;
    // prépa split by year (or the chosen filière); other levels as in the curriculum
    const groups: { id: string; title: string; courses: string[] }[] = [];
    if (intros.length) groups.push({ id: 'intros', title: 'INTROS · 30 S', courses: intros });
    for (const tr of TRACKS) {
      const shown = tr.courses.filter((id) => {
        const m = COURSES.get(id)?.meta;
        return !!m && courseVisible({ level: m.level, filieres: m.filieres ?? [] }, f);
      });
      if (tr.id !== 'prepa') {
        if (shown.length) groups.push({ ...tr, courses: shown });
        continue;
      }
      if (f.filiere !== 'ALL') {
        groups.push({ id: 'prepa', title: `PRÉPA · ${f.filiere} (${filiereYear(f.filiere)}${filiereYear(f.filiere) === 1 ? 're' : 'e'} année)`, courses: shown });
        continue;
      }
      for (const y of [1, 2] as const) {
        const ids = shown.filter((id) => courseYear(COURSES.get(id)!.meta) === y);
        if (ids.length) groups.push({ id: `prepa-${y}`, title: `PRÉPA · ${y === 1 ? '1re' : '2e'} ANNÉE`, courses: ids });
      }
    }
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
        const m = c.meta;
        const fiche = m.depth === 'fiche';
        const b = h(
          'button',
          { type: 'button', 'data-id': id, class: `lr-course s-${st}${fiche ? ' fiche' : ''}${id === this.selected ? ' sel' : ''}`, 'aria-pressed': String(id === this.selected), title: `${m.title} — ${st === 'construction' ? 'en construction' : st === 'locked' ? 'verrouillé' : st === 'done' ? 'terminé' : 'disponible'}${fiche ? ' · fiche' : ''}${m.filieres?.length ? ` · ${m.filieres.join(' ')}` : ''}` },
          h('span', { class: 'ic', text: st === 'done' ? '✓' : st === 'locked' ? '◇' : st === 'construction' ? '▲' : '●' }),
          h('span', { class: 'tt', text: m.title }),
          h('span', { class: 'mn', text: st === 'construction' ? '…' : fiche ? 'FICHE' : m.minutes < 1 ? `${Math.round(m.minutes * 60)}″` : `${m.minutes}′` }),
        );
        b.addEventListener('click', () => this.select(id));
        b.addEventListener('dblclick', () => this.open(id));
        list.append(b);
      }
    }
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
    const fn = this.g?.nodes[this.focus];
    if (fn && fn.course === this.selected && fn.kind !== 'course') return this.paintNodeCard(this.focus);
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
        c.written ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'FORMAT' }), h('span', { class: 'v', text: m.depth === 'fiche' ? 'fiche : énoncés, méthodes, 3 exercices' : 'cours écrit, à lire à son rythme' })) : null,
        m.filieres?.length ? h('div', { class: 'ro' }, h('span', { class: 'k', text: 'FILIÈRES' }), h('span', { class: 'v', text: m.filieres.join(' · ') })) : null,
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

  /** card of a chapter or a statement selected in the graph */
  private paintNodeCard(i: number): void {
    const g = this.graph();
    const n = g.nodes[i];
    const c = COURSES.get(n.course)!;
    const st = this.status(n.course);
    const can = st === 'open' || st === 'done';
    const btn = (label: string, ico: string, fn: () => void, cls = 'btn') => {
      const b = h('button', { type: 'button', class: cls }, icon(ico), h('span', { text: label }));
      b.addEventListener('click', () => (sfx.click(), fn()));
      return b;
    };
    const link = (j: number) => {
      const x = g.nodes[j];
      const b = h('button', { type: 'button', class: 'tr-cue', title: x.kind === 'course' ? x.title : `${x.title} — ${COURSES.get(x.course)?.meta.title ?? ''}` }, h('span', { class: 'tm', text: nodeTag(x) }), h('span', { class: 'tx', text: x.course === n.course || x.kind === 'course' ? x.title : `${x.title} · ${SHORT(COURSES.get(x.course)?.meta.title ?? '')}` }));
      b.addEventListener('click', () => this.pickNode(j, true));
      b.addEventListener('dblclick', () => this.openNode(j));
      return b;
    };
    const ci = g.index.get(courseNode(n.course))!;
    const action = btn(st === 'construction' ? 'EN CONSTRUCTION' : st === 'locked' ? 'VERROUILLÉ' : n.kind === 'chapter' ? 'LIRE CE CHAPITRE' : 'OUVRIR DANS LE COURS', 'play', () => this.openNode(i), 'btn on');
    (action as HTMLButtonElement).disabled = !can;
    action.append(h('span', { class: 'k', text: '⏎' }));
    const body = h('div', { class: 'panel-body lp' });
    body.append(h('div', { class: 'sec-title', text: 'COURS' }), link(ci));
    if (n.kind === 'statement') {
      const s = c.formulas.statements[n.anchor!];
      const chi = n.chapter ? g.index.get(chapterNode(n.course, n.chapter)) : undefined;
      if (chi !== undefined) body.append(h('div', { class: 'sec-title', text: 'CHAPITRE' }), link(chi));
      if (s) body.append(h('div', { class: 'lx-box lp-st' }, h('div', { class: 'lx-box-head' }, h('span', { class: 'kd', text: STATEMENT_LABEL[s.kind] }), h('span', { class: 'tt', text: s.title })), rich(s.body, 'rich')));
    } else {
      const inside = g.adj[i].filter((j) => g.nodes[j].kind === 'statement' && g.nodes[j].chapter === n.anchor && g.nodes[j].course === n.course);
      if (inside.length) body.append(h('div', { class: 'sec-title', text: `ÉNONCÉS DU CHAPITRE (${inside.length})` }), ...inside.map(link));
      // a course under construction: the plan of that section
      const sec = /^plan-(\d+)$/.exec(n.anchor ?? '');
      const plan = sec ? c.meta.plan?.[Number(sec[1]) - 1] : undefined;
      if (plan) body.append(h('div', { class: 'sec-title', text: 'PLAN' }), h('ul', { class: 'lp-ref' }, ...plan.items.map((x) => h('li', {}, rich(x, 'inl rich')))));
    }
    const out = g.edges.filter((e) => e.kind === 'ref' && e.a === i).map((e) => e.b);
    const into = g.edges.filter((e) => e.kind === 'ref' && e.b === i).map((e) => e.a);
    if (out.length) body.append(h('div', { class: 'sec-title', text: 'RENVOIE À' }), ...out.map(link));
    if (into.length) body.append(h('div', { class: 'sec-title', text: 'CITÉ PAR' }), ...into.map(link));
    if (!out.length && !into.length && n.kind === 'statement') body.append(h('div', { class: 'dim', text: 'Aucun renvoi pour l’instant.' }));
    this.host.panel.replaceChildren(
      h(
        'div',
        { class: 'panel-head' },
        h('div', { class: 'panel-sys' }, h('span', { text: `LEARN // ${n.kind === 'chapter' ? 'CHAPITRE' : STATEMENT_LABEL[n.stKind ?? 'remark']}` }), h('span', { class: 'on', text: st === 'construction' ? 'EN CONSTRUCTION' : st === 'locked' ? 'VERROUILLÉ' : st === 'done' ? 'COURS TERMINÉ' : 'DISPONIBLE' })),
        h('div', { class: 'panel-title', text: n.title }),
        h('div', { class: 'panel-sub', text: c.meta.title }),
        h('div', { class: 'panel-actions' }, action, btn('VOIR LE COURS', 'target', () => this.pickNode(ci, true))),
      ),
      body,
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
    out.push({ id: 'learn:home', label: 'LEARN · GRAPHE DES COURS', group: 'LEARN', keywords: 'cours accueil cursus arbre graphe filière MPSI PCSI PTSI MP2I MP PC PSI PT MPI', run: () => go(() => this.home()) });
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
    else if (!this.game) {
      this.recompute();
      this.paintHomeRail();
      this.paintDetails();
    }
  }

  /** test hook: the home graph; optionally set the filière, search, select or open a node (by id) */
  graphDebug(cmd: { filiere?: Filiere | 'ALL'; search?: string; pick?: string; open?: string } = {}): { nodes: number; visible: number; edges: number; refs: number; focus: string; rows: number; hits: number; panel: string; katex: number } {
    const g = this.graph();
    if (cmd.filiere) {
      this.filter = { ...this.filter, filiere: cmd.filiere };
      this.recompute();
      if (!this.player && !this.reader) this.paintHomeRail();
    }
    if (cmd.search !== undefined) {
      this.query = cmd.search;
      const input = this.host.rail.querySelector<HTMLInputElement>('.lr-search');
      if (input) input.value = cmd.search;
      this.paintHomeList();
    }
    const at = (id?: string) => (id ? g.index.get(id) : undefined);
    if (at(cmd.pick) !== undefined) this.pickNode(at(cmd.pick)!, true);
    if (at(cmd.open) !== undefined) this.openNode(at(cmd.open)!);
    const P = this.host.panel;
    return {
      nodes: g.nodes.length,
      visible: this.vis.reduce((s, v) => s + v, 0),
      edges: g.edges.length,
      refs: g.edges.filter((e) => e.kind === 'ref').length,
      focus: g.nodes[this.focus]?.id ?? '',
      rows: this.host.rail.querySelectorAll('.lr-course').length,
      hits: this.host.rail.querySelectorAll('.lr-hit').length,
      panel: P.querySelector('.panel-title')?.textContent ?? '',
      katex: P.querySelectorAll('.katex').length,
    };
  }
}

const plainBody = (s: string) => plain([{ t: 'text', s }]).slice(0, 200);
