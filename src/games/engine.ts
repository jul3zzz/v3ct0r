// The shell of every leçon-jeu, drawn on the overlay canvas in the HUD style: an animated briefing
// (title that decodes itself, mission, levels with best grades), timed rounds, the reveal of the
// right answer after each round, then the result (grade S…D, record) and the debrief in the panel.
import type { VizContext, VizDef, VizInstance } from '../core/types';
import { sfx } from '../core/audio';
import { store } from '../core/settings';
import { grade, rng, type Box, type GameDef, type GameLogic, type RoundResult } from './types';
import { hashText } from '../learn/script';
import { music } from '../core/music';
import briefs from './briefs.json';

export interface GameScores {
  /** best average per level (0..100), null when never finished */
  best: (number | null)[];
  plays: number;
}

const KEY = 'games.v1';

// spoken briefings: text (src/games/briefs.json) and generated voice (courses/games/audio/<id>.mp3,
// next to index.html; its alignment is bundled, as for the courses)
const BRIEFS = briefs as unknown as Record<string, string>;
const BRIEF_ALIGN = import.meta.glob('../../courses/games/audio/*.json', { eager: true, import: 'default' }) as Record<string, { hash: string; duration: number }>;

/** the voice file of a game's briefing, when it matches the current text */
export function briefVoice(id: string): { url: string; duration: number } | null {
  const text = BRIEFS[id]?.trim();
  const al = BRIEF_ALIGN[`../../courses/games/audio/${id}.json`];
  return text && al && al.hash === hashText(text) ? { url: `courses/games/audio/${encodeURIComponent(id)}.mp3`, duration: al.duration } : null;
}

/** capitals for Latin letters only: Greek symbols keep their case (ε, δ are not Ε, Δ) */
const up = (s: string): string => s.replace(/[a-zà-ÿœ]/g, (c) => c.toUpperCase());

export function scoresOf(id: string, levels: number): GameScores {
  const all = store.get<Record<string, GameScores>>(KEY, {});
  const s = all[id];
  return { best: Array.from({ length: levels }, (_, i) => s?.best?.[i] ?? null), plays: s?.plays ?? 0 };
}

function saveScore(id: string, levels: number, level: number, avg: number): boolean {
  const all = store.get<Record<string, GameScores>>(KEY, {});
  const s = scoresOf(id, levels);
  const record = s.best[level] === null || avg > (s.best[level] ?? 0);
  if (record) s.best[level] = Math.round(avg);
  s.plays++;
  all[id] = s;
  store.set(KEY, all);
  return record;
}

export interface GameHooks {
  /** a level was finished (the panel reveals the theorem, the rail shows the grade) */
  finished(level: number, avg: number): void;
  home(): void;
}

type Phase = 'brief' | 'play' | 'reveal' | 'result';

export class GameRun implements VizInstance {
  phase: Phase = 'brief';
  level = 0;
  round = 0;
  results: RoundResult[] = [];
  private logic: GameLogic;
  private clock = 0;
  private phaseAt = 0;
  private left = 0;
  private last: RoundResult | null = null;
  private record = false;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };

  constructor(
    private ctx: VizContext,
    readonly def: GameDef,
    private hooks: GameHooks,
    level = 0,
  ) {
    this.logic = def.make();
    this.logic.attach?.(ctx);
    this.level = Math.max(0, Math.min(def.levels.length - 1, level));
    const local = (e: MouseEvent): [number, number] => {
      const r = ctx.input.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const ptr = (type: 'move' | 'down' | 'up') => (e: PointerEvent) => {
      if (this.phase === 'brief' && type === 'down') return this.briefClick(...local(e));
      if (this.phase === 'result' && type === 'down') return this.begin(this.level);
      if (this.phase !== 'play') return;
      this.logic.pointer?.(type, ...local(e), e);
    };
    ctx.listen(ctx.input, 'pointermove', ptr('move'));
    ctx.listen(ctx.input, 'pointerdown', ptr('down'));
    ctx.listen(ctx.input, 'pointerup', ptr('up'));
    ctx.listen(
      ctx.input,
      'wheel',
      (e: WheelEvent) => {
        if (this.phase !== 'play') return;
        e.preventDefault();
        this.logic.pointer?.('wheel', ...local(e), e);
      },
      { passive: false },
    );
    ctx.listen(window, 'keyup', (e: KeyboardEvent) => this.logic.keyUp?.(e));
    ctx.listen(window, 'blur', () => this.logic.keyUp?.(null));
    ctx.input.classList.add('game-input');
    ctx.onDispose(() => (ctx.input.classList.remove('game-input'), this.stopBrief()));
    this.playBrief();
  }

  // ── spoken briefing ────────────────────────────────────────────────────

  /** the voice reading the briefing (null: none generated, or text changed since) */
  voice: HTMLAudioElement | null = null;
  private briefDuck = false;

  private playBrief(): void {
    const b = briefVoice(this.def.id);
    if (!b) return;
    const a = new Audio(b.url);
    a.volume = 0.9;
    this.voice = a;
    music.duck(true);
    this.briefDuck = true;
    a.addEventListener('ended', () => {
      if (!this.briefDuck) return;
      this.briefDuck = false;
      music.duck(false);
    });
    // refused without a user gesture (deep link): the text then types in on its own
    void a.play().catch(() => undefined);
  }

  private stopBrief(): void {
    const a = this.voice;
    if (this.briefDuck) {
      this.briefDuck = false;
      music.duck(false);
    }
    if (!a) return;
    a.pause();
    a.removeAttribute('src');
    a.load();
    this.voice = null;
  }

  // ── flow ───────────────────────────────────────────────────────────────

  begin(level: number): void {
    this.stopBrief();
    this.level = Math.max(0, Math.min(this.def.levels.length - 1, level));
    this.results = [];
    this.round = 0;
    this.record = false;
    sfx.open();
    this.startRound();
  }

  private startRound(): void {
    this.logic.start(this.level, this.round, rng((Date.now() ^ (this.round * 7919)) >>> 0));
    this.left = this.def.levels[this.level].time;
    this.setPhase('play');
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    this.phaseAt = this.clock;
  }

  private finishRound(r: RoundResult): void {
    this.last = r;
    this.results.push(r);
    if (r.ok) sfx.confirm();
    else sfx.error();
    this.setPhase('reveal');
  }

  private afterReveal(): void {
    const L = this.def.levels[this.level];
    if (this.round + 1 < L.rounds) {
      this.round++;
      this.startRound();
      return;
    }
    const avg = this.results.reduce((s, x) => s + x.score, 0) / this.results.length;
    this.record = saveScore(this.def.id, this.def.levels.length, this.level, avg);
    this.setPhase('result');
    this.hooks.finished(this.level, avg);
  }

  /** ⏎ / Espace: start, validate, skip the reveal, replay */
  confirm(): void {
    if (this.phase === 'brief') this.begin(this.level);
    else if (this.phase === 'play') {
      const r = this.logic.submit(false);
      if (r) this.finishRound(r);
      else sfx.tick();
    } else if (this.phase === 'reveal') this.afterReveal();
    else this.begin(this.level);
  }

  key(e: KeyboardEvent): boolean {
    const k = e.key;
    if (k === 'Enter' || (k === ' ' && this.phase !== 'play')) {
      this.confirm();
      return true;
    }
    if (this.phase === 'play' && this.logic.key?.(e)) return true;
    if (this.phase === 'play' && k === ' ') {
      this.confirm();
      return true;
    }
    if ((this.phase === 'brief' || this.phase === 'result') && /^[1-9]$/.test(k) && Number(k) <= this.def.levels.length) {
      if (this.phase === 'result') this.begin(Number(k) - 1);
      else {
        this.level = Number(k) - 1;
        sfx.tick();
      }
      return true;
    }
    if (this.phase === 'result' && (k === 'ArrowRight' || k === 'n') && this.level + 1 < this.def.levels.length) {
      this.begin(this.level + 1);
      return true;
    }
    if (k === 'Escape') {
      if (this.phase === 'play' || this.phase === 'reveal') this.setPhase('brief');
      else this.hooks.home();
      return true;
    }
    return false;
  }

  private briefClick(x: number, y: number): void {
    const rows = this.levelRows();
    const hit = rows.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (hit >= 0) {
      if (hit === this.level) this.begin(hit);
      else {
        this.level = hit;
        sfx.tick();
      }
    }
  }

  // ── frame ──────────────────────────────────────────────────────────────

  update(_t: number, dt: number): void {
    this.clock += dt;
    const W = this.ctx.width;
    const H = this.ctx.height;
    this.box = { x: 28, y: 92, w: W - 56, h: H - 140 };
    if (this.phase === 'play') {
      this.left -= dt;
      this.logic.tick?.(dt);
      const auto = this.logic.poll?.();
      if (auto) this.finishRound(auto);
      else if (this.left <= 0) {
        const r = this.logic.submit(true) ?? { ok: false, score: 0, detail: 'TEMPS ÉCOULÉ' };
        this.finishRound(r);
      }
    } else if (this.phase === 'reveal' && this.clock - this.phaseAt > 3.2) this.afterReveal();
    // the GL canvas under the HUD: black, unless the game draws on it this frame
    this.ctx.renderer.setRenderTarget(null);
    this.ctx.renderer.clear();
    const g = this.ctx.g;
    g.save();
    if (this.phase === 'brief') this.drawBrief(g, W, H);
    else if (this.phase === 'result') this.drawResult(g, W, H);
    else this.drawPlay(g, W, H);
    g.restore();
  }

  // ── drawing ────────────────────────────────────────────────────────────

  private font(px: number, display = false): string {
    return display ? `${px}px Michroma, sans-serif` : `${px}px "JetBrains Mono", ui-monospace, monospace`;
  }

  private wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number): number {
    const words = text.split(/\s+/);
    let line = '';
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (g.measureText(t).width > maxW && line) {
        g.fillText(line, x, y);
        y += lh;
        line = w;
      } else line = t;
    }
    if (line) g.fillText(line, x, y);
    return y + lh;
  }

  /** a title that decodes itself (glyph scramble) */
  private decode(text: string, since: number): string {
    const p = Math.min(1, (this.clock - since) / 0.9);
    const n = Math.floor(p * text.length);
    const G = '#%&/<>_=+*01ΣΔΛΞ∂∫';
    return text.slice(0, n) + [...text.slice(n)].map((c, i) => (c === ' ' ? ' ' : G[(Math.floor(this.clock * 24) + i * 7) % G.length])).join('');
  }

  private frame(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a = 0.5): void {
    g.strokeStyle = `rgba(255,255,255,${a})`;
    g.lineWidth = 1;
    const k = 10;
    g.beginPath();
    for (const [sx, sy] of [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]) {
      const cx = x + sx * w;
      const cy = y + sy * h;
      g.moveTo(cx + (sx ? -k : k), cy);
      g.lineTo(cx, cy);
      g.lineTo(cx, cy + (sy ? -k : k));
    }
    g.stroke();
  }

  private levelRows(): Box[] {
    const W = this.ctx.width;
    const x = Math.max(28, W / 2 - 300);
    return this.def.levels.map((_, i) => ({ x, y: this.ctx.height * 0.52 + i * 46, w: Math.min(600, W - 56), h: 38 }));
  }

  private drawBrief(g: CanvasRenderingContext2D, W: number, H: number): void {
    const d = this.def;
    const cx = W / 2;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.font = this.font(11);
    g.fillText(`LEÇON-JEU · ${d.module.toUpperCase()} · ≈ ${d.minutes} MIN`, cx, H * 0.14);
    g.fillStyle = '#fff';
    g.font = this.font(Math.round(Math.min(40, W / 22)), true);
    g.fillText(this.decode(up(d.title), this.phaseAt), cx, H * 0.21);
    g.font = this.font(13);
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.fillText(d.subtitle, cx, H * 0.27);
    // mission, typed in
    g.font = this.font(13);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    // the text types in with the voice when it plays, on its own clock otherwise
    const v = this.voice;
    const p = v && !v.paused && v.duration > 0 ? Math.min(1, (v.currentTime / v.duration) * 1.08) : v && v.ended ? 1 : Math.min(1, (this.clock - this.phaseAt - 0.5) / 2.2);
    const shown = d.brief.slice(0, Math.max(0, Math.floor(p * d.brief.length)));
    this.wrap(g, shown, cx, H * 0.34, Math.min(760, W - 80), 20);
    // levels
    const sc = scoresOf(d.id, d.levels.length);
    this.levelRows().forEach((r, i) => {
      const L = d.levels[i];
      const sel = i === this.level;
      g.fillStyle = sel ? '#fff' : 'rgba(0,0,0,0.6)';
      g.fillRect(r.x, r.y, r.w, r.h);
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      g.fillStyle = sel ? '#000' : '#fff';
      g.textAlign = 'left';
      g.font = this.font(12);
      g.fillText(`${i + 1} · ${L.title}`, r.x + 12, r.y + 13);
      g.font = this.font(10);
      g.fillStyle = sel ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)';
      g.fillText(`${L.brief} · ${L.rounds} manches · ${L.time} s`, r.x + 12, r.y + 28);
      g.textAlign = 'right';
      g.font = this.font(18, true);
      const b = sc.best[i];
      g.fillStyle = sel ? '#000' : '#fff';
      g.fillText(b === null ? '—' : grade(b), r.x + r.w - 14, r.y + r.h / 2 + 1);
    });
    g.textAlign = 'center';
    g.font = this.font(11);
    g.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(this.clock * 4)})`;
    g.fillText(`⏎ COMMENCER LE NIVEAU ${this.level + 1} · 1–${d.levels.length} CHOISIR · ÉCHAP RETOUR`, cx, H - 28);
    this.frame(g, 14, 14, W - 28, H - 28, 0.35);
  }

  private drawPlay(g: CanvasRenderingContext2D, W: number, H: number): void {
    const d = this.def;
    const L = d.levels[this.level];
    const b = this.box;
    // play area
    this.logic.draw(g, b, this.clock, this.phase === 'reveal' ? 'reveal' : 'play');
    this.frame(g, b.x, b.y, b.w, b.h, 0.4);
    // top bar: level, round, score, timer
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.font = this.font(10);
    g.fillText(`${up(d.title)} · NIVEAU ${this.level + 1} · ${up(L.title)}`, 28, 22);
    g.textAlign = 'right';
    const total = this.results.reduce((s, x) => s + x.score, 0);
    g.fillText(`MANCHE ${this.round + 1}/${L.rounds} · SCORE ${total}`, W - 28, 22);
    const tl = Math.max(0, this.left) / L.time;
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.strokeRect(28.5, 34.5, W - 57, 5);
    g.fillStyle = tl < 0.25 && this.phase === 'play' ? `rgba(255,255,255,${0.5 + 0.5 * Math.sin(this.clock * 16)})` : '#fff';
    g.fillRect(29, 35, (W - 58) * (this.phase === 'play' ? tl : 0), 4);
    // prompt
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    g.font = this.font(14);
    // long prompts shrink to fit the width (never below 10 px)
    const prompt = this.logic.prompt();
    let fs = 14;
    g.font = this.font(fs);
    while (fs > 10 && g.measureText(prompt).width > W - 60) g.font = this.font(--fs);
    g.fillText(prompt, W / 2, 64);
    // controls
    g.font = this.font(10);
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.fillText(this.phase === 'play' ? `${this.logic.controls()} · ⏎ VALIDER · ÉCHAP ABANDONNER` : '⏎ MANCHE SUIVANTE', W / 2, H - 22);
    // reveal banner
    if (this.phase === 'reveal' && this.last) {
      const r = this.last;
      const a = Math.min(1, (this.clock - this.phaseAt) / 0.25);
      g.font = this.font(11);
      const bw = Math.min(W - 60, Math.max(560, g.measureText(r.detail).width + 40));
      const bx = W / 2 - bw / 2;
      const by = b.y + 14;
      g.fillStyle = `rgba(0,0,0,${0.85 * a})`;
      g.fillRect(bx, by, bw, 54);
      g.strokeStyle = `rgba(255,255,255,${a})`;
      g.strokeRect(bx + 0.5, by + 0.5, bw - 1, 53);
      g.fillStyle = r.ok ? '#fff' : 'rgba(255,255,255,0.85)';
      g.font = this.font(16, true);
      g.fillText(r.ok ? `✓ RÉUSSI  +${r.score}` : `✕ RATÉ  +${r.score}`, W / 2, by + 18);
      g.font = this.font(11);
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.fillText(r.detail, W / 2, by + 39);
    }
  }

  private drawResult(g: CanvasRenderingContext2D, W: number, H: number): void {
    const d = this.def;
    const avg = this.results.reduce((s, x) => s + x.score, 0) / Math.max(1, this.results.length);
    const G = grade(avg);
    const cx = W / 2;
    const t = this.clock - this.phaseAt;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.font = this.font(11);
    g.fillText(`${up(d.title)} · NIVEAU ${this.level + 1} TERMINÉ`, cx, H * 0.16);
    // the grade lands with a little overshoot
    const s = t < 0.35 ? 2.4 - (t / 0.35) * 1.5 : 0.9 + 0.1 * Math.min(1, (t - 0.35) / 0.2);
    g.save();
    g.translate(cx, H * 0.32);
    g.scale(s, s);
    g.fillStyle = '#fff';
    g.font = this.font(84, true);
    g.fillText(G, 0, 0);
    g.restore();
    g.font = this.font(14);
    g.fillText(`SCORE MOYEN ${Math.round(avg)} / 100${this.record ? ' · NOUVEAU RECORD' : ''}`, cx, H * 0.45);
    // round bars
    const n = this.results.length;
    const bw = Math.min(64, (W - 120) / n);
    const x0 = cx - (n * bw) / 2;
    this.results.forEach((r, i) => {
      const h = (r.score / 100) * 90;
      g.strokeStyle = 'rgba(255,255,255,0.4)';
      g.strokeRect(x0 + i * bw + 6.5, H * 0.52 + 0.5, bw - 12, 90);
      g.fillStyle = r.ok ? '#fff' : 'rgba(255,255,255,0.25)';
      g.fillRect(x0 + i * bw + 7, H * 0.52 + 90 - h * Math.min(1, t * 2), bw - 13, h * Math.min(1, t * 2));
      g.font = this.font(10);
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.fillText(String(r.score), x0 + i * bw + bw / 2, H * 0.52 + 104);
    });
    g.font = this.font(12);
    g.fillStyle = '#fff';
    g.fillText('LE THÉORÈME DERRIÈRE LE JEU EST DANS LE PANNEAU →', cx, H * 0.52 + 140);
    g.font = this.font(11);
    g.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(this.clock * 4)})`;
    const next = this.level + 1 < d.levels.length ? ` · → NIVEAU ${this.level + 2}` : '';
    g.fillText(`⏎ REJOUER${next} · ÉCHAP RETOUR`, cx, H - 28);
    this.frame(g, 14, 14, W - 28, H - 28, 0.35);
  }

  info() {
    return { game: this.def.id, phase: this.phase, level: this.level, round: this.round, scores: this.results.map((r) => r.score), prompt: this.phase === 'play' ? this.logic.prompt() : '', voice: this.voice ? { t: this.voice.currentTime, paused: this.voice.paused } : null };
  }

  /** tests: the logic of the current round */
  get logicRef(): GameLogic {
    return this.logic;
  }
}

export function gameViz(def: GameDef, hooks: GameHooks, level: number, onRun: (r: GameRun | null) => void): VizDef {
  return {
    id: `game-${def.id}`,
    title: def.title,
    subtitle: def.subtitle,
    stage: '2d',
    noCinematic: true,
    formula: { tex: '', note: '' },
    create(ctx) {
      const run = new GameRun(ctx, def, hooks, level);
      onRun(run);
      ctx.onDispose(() => onRun(null));
      return run;
    },
  };
}
