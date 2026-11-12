// The shell of every leçon-jeu, drawn on the overlay canvas in the HUD style: an animated briefing
// (title that decodes itself, mission, levels with best grades), timed rounds, the reveal of the
// right answer after each round, then the result (grade S…D, record) and the debrief in the panel.
import type { VizContext, VizDef, VizInstance } from '../core/types';
import { sfx } from '../core/audio';
import { store } from '../core/settings';
import { grade, rng, type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey } from './types';
import { hashText } from '../learn/script';
import { music } from '../core/music';
import { h } from '../hud/dom';
import { touchScreen } from '../core/touch';
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
  /** touch screen: the bar of buttons under the play area (start, validate, the game's own keys…) */
  private touch = touchScreen();
  private bar: HTMLElement | null = null;
  private barSig = '';
  private barStop: (() => void)[] = [];
  /** where the level rows of the briefing start (drawBrief, used by the clicks too) */
  private rowsTop = -1;
  /** the prompt of the round, cut in lines that fit the width */
  private promptLines: string[] = [];

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
    // a touch taken over by the system (a scroll, a call) ends like a release
    ctx.listen(ctx.input, 'pointercancel', ptr('up'));
    if (this.touch) {
      this.bar = h('div', { class: 'game-touch', role: 'toolbar', 'aria-label': 'Commandes du jeu' });
      ctx.input.parentElement!.append(this.bar);
      ctx.onDispose(() => (this.releaseBar(), this.bar?.remove()));
    }
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
    this.paintBar();
    this.layoutPlay(W, H);
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

  // ── touch screen: the bar of buttons ───────────────────────────────────

  private barHeight(): number {
    return this.bar ? this.bar.offsetHeight : 0;
  }

  /** let go of the held buttons (and stop their repeats) before the bar changes */
  private releaseBar(): void {
    for (const stop of this.barStop.splice(0)) stop();
  }

  /** the buttons of the phase: start / back, the game's own keys and validate, next round, replay */
  private paintBar(): void {
    const bar = this.bar;
    if (!bar) return;
    const keys = this.phase === 'play' ? (this.logic.touchKeys?.() ?? []) : [];
    const sig = `${this.phase}|${this.level}|${this.round}|${keys.map((k) => k.label).join(',')}`;
    if (sig === this.barSig) return;
    this.barSig = sig;
    this.releaseBar();
    const btn = (label: string, title: string, cls = '') => h('button', { type: 'button', class: `gt-b${cls}`, title, 'aria-label': title, text: label });
    const tap = (label: string, title: string, fn: () => void, cls = '') => {
      const b = btn(label, title, cls);
      b.addEventListener('click', fn);
      return b;
    };
    const send = (k: TouchKey, down: boolean) => {
      const e = new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k.key, code: k.code ?? '', shiftKey: !!k.shift });
      if (down) this.logic.key?.(e);
      else this.logic.keyUp?.(e);
    };
    const gameKey = (k: TouchKey) => {
      const b = btn(k.label, k.title ?? k.label, ' gk');
      if (!k.hold && !k.repeat) {
        b.addEventListener('click', () => (send(k, true), send(k, false)));
        return b;
      }
      let timer = 0;
      let on = false;
      const stop = () => {
        if (!on) return;
        on = false;
        clearTimeout(timer);
        clearInterval(timer);
        b.classList.remove('on');
        if (k.hold) send(k, false);
      };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        on = true;
        b.classList.add('on');
        send(k, true);
        if (k.repeat) timer = window.setTimeout(() => (timer = window.setInterval(() => send(k, true), 60)), 320);
      });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) b.addEventListener(ev, stop);
      this.barStop.push(stop);
      return b;
    };
    const home = () => this.hooks.home();
    const n = this.def.levels.length;
    const L = this.def.levels[this.level];
    let kids: HTMLElement[];
    if (this.phase === 'brief') kids = [tap('◂ RETOUR', 'Retour à LEARN', home), tap(`▶ COMMENCER LE NIVEAU ${this.level + 1}`, 'Commencer le niveau choisi', () => this.begin(this.level), ' go')];
    else if (this.phase === 'play') kids = [...keys.map(gameKey), tap('✕', 'Abandonner la partie', () => this.setPhase('brief')), tap('✓ VALIDER', 'Valider', () => this.confirm(), ' go')];
    else if (this.phase === 'reveal') kids = [tap(this.round + 1 < L.rounds ? '▶ MANCHE SUIVANTE' : '▶ RÉSULTAT', 'Continuer', () => this.confirm(), ' go')];
    else kids = [tap('◂ RETOUR', 'Retour à LEARN', home), tap('↻ REJOUER', 'Rejouer ce niveau', () => this.begin(this.level)), ...(this.level + 1 < n ? [tap(`NIVEAU ${this.level + 2} ▶`, 'Niveau suivant', () => this.begin(this.level + 1), ' go')] : [])];
    bar.replaceChildren(...kids);
  }

  // ── drawing ────────────────────────────────────────────────────────────

  /** the play area and the prompt lines. Narrow screen: small margins, the prompt on up to three lines;
   *  touch screen: room for the bar of buttons. A wide window keeps the 28 px margins and one line. */
  private layoutPlay(W: number, H: number): void {
    const narrow = W < 560;
    const prompt = this.phase === 'play' || this.phase === 'reveal' ? this.logic.prompt() : '';
    if (narrow) {
      this.ctx.g.font = this.font(12);
      this.promptLines = this.lines(this.ctx.g, prompt, W - 28).slice(0, 3);
    } else this.promptLines = [prompt];
    const M = narrow ? 12 : 28;
    const top = narrow ? 50 + this.promptLines.length * 16 + 6 : 92;
    const bottom = this.touch ? this.barHeight() + 44 : 48;
    this.box = { x: M, y: top, w: W - 2 * M, h: Math.max(80, H - top - bottom) };
  }

  /** words cut in lines no wider than maxW (with the current font) */
  private lines(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const out: string[] = [];
    for (const w of text.split(/\s+/).filter(Boolean)) {
      const t = out.length ? `${out[out.length - 1]} ${w}` : w;
      if (out.length && g.measureText(t).width <= maxW) out[out.length - 1] = t;
      else out.push(w);
    }
    return out;
  }

  /** the text, cut with an ellipsis so that it fits maxW */
  private fit(g: CanvasRenderingContext2D, text: string, maxW: number): string {
    if (g.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && g.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
    return `${t.trimEnd()}…`;
  }

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
    const x = Math.max(W < 560 ? 14 : 28, W / 2 - 300);
    const top = this.rowsTop >= 0 ? this.rowsTop : this.ctx.height * 0.52;
    return this.def.levels.map((_, i) => ({ x, y: top + i * 46, w: Math.min(600, W - 2 * x), h: 38 }));
  }

  private drawBrief(g: CanvasRenderingContext2D, W: number, H: number): void {
    const d = this.def;
    const cx = W / 2;
    const narrow = W < 560;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    // the text types in with the voice when it plays, on its own clock otherwise
    const v = this.voice;
    const p = v && !v.paused && v.duration > 0 ? Math.min(1, (v.currentTime / v.duration) * 1.08) : v && v.ended ? 1 : Math.min(1, (this.clock - this.phaseAt - 0.5) / 2.2);
    const shown = d.brief.slice(0, Math.max(0, Math.floor(p * d.brief.length)));
    if (!narrow) {
      this.rowsTop = -1;
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
      this.wrap(g, shown, cx, H * 0.34, Math.min(760, W - 80), 20);
    } else {
      // narrow screen: everything in lines that fit, the levels right under the mission
      const maxW = W - 40;
      let y = Math.max(34, H * 0.07);
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.font = this.font(10);
      g.fillText(this.fit(g, `LEÇON-JEU · ${d.module.toUpperCase()} · ≈ ${d.minutes} MIN`, maxW), cx, y);
      y += 26;
      const title = up(d.title);
      let fs = Math.round(Math.min(26, W / 15));
      g.font = this.font(fs, true);
      while (fs > 13 && g.measureText(title).width > maxW) g.font = this.font(--fs, true);
      g.fillStyle = '#fff';
      for (const l of this.lines(g, title, maxW)) {
        g.fillText(this.decode(l, this.phaseAt), cx, y);
        y += Math.round(fs * 1.4);
      }
      g.font = this.font(12);
      g.fillStyle = 'rgba(255,255,255,0.75)';
      for (const l of this.lines(g, d.subtitle, maxW)) {
        g.fillText(l, cx, y);
        y += 17;
      }
      y += 8;
      // the mission keeps the room it will need once typed, and gives way to the levels on a short screen
      g.fillStyle = 'rgba(255,255,255,0.9)';
      const rows = d.levels.length * 46;
      const room = H - y - rows - (this.touch ? this.barHeight() + 18 : 46);
      const full = this.lines(g, d.brief, maxW);
      const max = Math.max(1, Math.floor(room / 17));
      const part = this.lines(g, shown, maxW).slice(0, max);
      if (full.length > max && part.length === max) part[max - 1] = this.fit(g, `${part[max - 1]} …`, maxW);
      part.forEach((l, i) => g.fillText(l, cx, y + i * 17));
      this.rowsTop = y + Math.min(full.length, max) * 17 + 10;
    }
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
      g.fillText(this.fit(g, `${i + 1} · ${L.title}`, r.w - 56), r.x + 12, r.y + 13);
      g.font = this.font(10);
      g.fillStyle = sel ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)';
      g.fillText(this.fit(g, `${L.brief} · ${L.rounds} manches · ${L.time} s`, r.w - 56), r.x + 12, r.y + 28);
      g.textAlign = 'right';
      g.font = this.font(18, true);
      const b = sc.best[i];
      g.fillStyle = sel ? '#000' : '#fff';
      g.fillText(b === null ? '—' : grade(b), r.x + r.w - 14, r.y + r.h / 2 + 1);
    });
    g.textAlign = 'center';
    g.font = this.font(11);
    g.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(this.clock * 4)})`;
    // touch screen: the bar says it (COMMENCER, RETOUR)
    if (!this.touch) g.fillText(`⏎ COMMENCER LE NIVEAU ${this.level + 1} · 1–${d.levels.length} CHOISIR · ÉCHAP RETOUR`, cx, H - 28);
    this.frame(g, 14, 14, W - 28, H - 28, 0.35);
  }

  private drawPlay(g: CanvasRenderingContext2D, W: number, H: number): void {
    const d = this.def;
    const L = d.levels[this.level];
    const b = this.box;
    // play area
    this.logic.draw(g, b, this.clock, this.phase === 'reveal' ? 'reveal' : 'play');
    this.frame(g, b.x, b.y, b.w, b.h, 0.4);
    const narrow = W < 560;
    const M = narrow ? 12 : 28;
    // top bar: level, round, score, timer (narrow screen: on two lines)
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.font = this.font(10);
    const total = this.results.reduce((s, x) => s + x.score, 0);
    const head = `${up(d.title)} · NIVEAU ${this.level + 1} · ${up(L.title)}`;
    const count = `MANCHE ${this.round + 1}/${L.rounds} · SCORE ${total}`;
    if (narrow) g.fillText(this.fit(g, head, W - 2 * M), M, 14);
    else g.fillText(head, 28, 22);
    g.textAlign = 'right';
    g.fillText(count, W - M, narrow ? 27 : 22);
    const tl = Math.max(0, this.left) / L.time;
    const ty = narrow ? 36 : 34;
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.strokeRect(M + 0.5, ty + 0.5, W - 2 * M - 1, 5);
    g.fillStyle = tl < 0.25 && this.phase === 'play' ? `rgba(255,255,255,${0.5 + 0.5 * Math.sin(this.clock * 16)})` : '#fff';
    g.fillRect(M + 1, ty + 1, (W - 2 * M - 2) * (this.phase === 'play' ? tl : 0), 4);
    // prompt
    g.textAlign = 'center';
    g.fillStyle = '#fff';
    if (narrow) {
      g.font = this.font(12);
      this.promptLines.forEach((l, i) => g.fillText(l, W / 2, 58 + i * 16));
    } else {
      // long prompts shrink to fit the width (never below 10 px)
      const prompt = this.promptLines[0] ?? '';
      let fs = 14;
      g.font = this.font(fs);
      while (fs > 10 && g.measureText(prompt).width > W - 60) g.font = this.font(--fs);
      g.fillText(prompt, W / 2, 64);
    }
    // controls (touch screen: in taps and drags, above the bar of buttons)
    g.font = this.font(10);
    g.fillStyle = 'rgba(255,255,255,0.45)';
    const ctl = this.phase === 'play' ? (this.touch ? (this.logic.touchControls?.() ?? this.logic.controls()) : `${this.logic.controls()} · ⏎ VALIDER · ÉCHAP ABANDONNER`) : this.touch ? '' : '⏎ MANCHE SUIVANTE';
    if (narrow || this.touch) {
      const cy = H - 22 - (this.touch ? this.barHeight() : 0);
      const ls = this.lines(g, ctl, W - 2 * M).slice(0, 2);
      ls.forEach((l, i) => g.fillText(l, W / 2, cy - (ls.length - 1 - i) * 13));
    } else g.fillText(ctl, W / 2, H - 22);
    // reveal banner
    if (this.phase === 'reveal' && this.last) {
      const r = this.last;
      const a = Math.min(1, (this.clock - this.phaseAt) / 0.25);
      g.font = this.font(narrow ? 10 : 11);
      const bw = narrow ? W - 2 * M : Math.min(W - 60, Math.max(560, g.measureText(r.detail).width + 40));
      const dl = narrow ? this.lines(g, r.detail, bw - 20) : [r.detail];
      const bh = 40 + dl.length * 14;
      const bx = W / 2 - bw / 2;
      const by = b.y + 14;
      g.fillStyle = `rgba(0,0,0,${0.85 * a})`;
      g.fillRect(bx, by, bw, bh);
      g.strokeStyle = `rgba(255,255,255,${a})`;
      g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      g.fillStyle = r.ok ? '#fff' : 'rgba(255,255,255,0.85)';
      g.font = this.font(16, true);
      g.fillText(r.ok ? `✓ RÉUSSI  +${r.score}` : `✕ RATÉ  +${r.score}`, W / 2, by + 18);
      g.font = this.font(narrow ? 10 : 11);
      g.fillStyle = 'rgba(255,255,255,0.8)';
      dl.forEach((l, i) => g.fillText(l, W / 2, by + 39 + i * 14));
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
    // phone (phone.css): the panel is the sheet under the view, DÉTAILS DU COURS
    g.fillText(W < 560 ? 'LE THÉORÈME : DÉTAILS DU COURS ↓' : 'LE THÉORÈME DERRIÈRE LE JEU EST DANS LE PANNEAU →', cx, H * 0.52 + 140);
    g.font = this.font(11);
    g.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(this.clock * 4)})`;
    const next = this.level + 1 < d.levels.length ? ` · → NIVEAU ${this.level + 2}` : '';
    if (!this.touch) g.fillText(`⏎ REJOUER${next} · ÉCHAP RETOUR`, cx, H - 28);
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
