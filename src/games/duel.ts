// DUEL ε-δ: the definition of a limit played as the game it is. Levels 1-2: the machine names ε,
// you answer with δ (the larger, the better, as long as it works). Level 3: the roles swap on
// functions WITHOUT a limit: you pick ε, then defeat every δ the machine tries with a counterexample.
import { fr, type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey } from './types';

export interface LimitFn {
  /** display (unicode) */
  label: string;
  f: (x: number) => number;
  a: number;
  /** the limit (levels 1-2) or the value the machine claims (level 3) */
  L: number;
  /** level 3: sup of |f − L| near a, attained arbitrarily close to a (any ε ≤ epsMax wins) */
  epsMax?: number;
}

export const PROVER_EASY: LimitFn[] = [
  { label: 'f(x) = 2x + 1', f: (x) => 2 * x + 1, a: 1, L: 3 },
  { label: 'f(x) = x²', f: (x) => x * x, a: 2, L: 4 },
  { label: 'f(x) = √x', f: (x) => Math.sqrt(x), a: 4, L: 2 },
  { label: 'f(x) = x³', f: (x) => x * x * x, a: 1, L: 1 },
  { label: 'f(x) = 1/x', f: (x) => 1 / x, a: 1, L: 1 },
];

export const PROVER_HARD: LimitFn[] = [
  { label: 'f(x) = 1/x', f: (x) => 1 / x, a: 0.5, L: 2 },
  { label: 'f(x) = sin(x)/x', f: (x) => Math.sin(x) / x, a: 0, L: 1 },
  { label: 'f(x) = x·sin(1/x)', f: (x) => x * Math.sin(1 / x), a: 0, L: 0 },
  { label: 'f(x) = (x² − 1)/(x − 1)', f: (x) => (x * x - 1) / (x - 1), a: 1, L: 2 },
  { label: 'f(x) = eˣ', f: (x) => Math.exp(x), a: 0, L: 1 },
];

export const REFUTE: LimitFn[] = [
  { label: 'f(x) = signe(x)', f: (x) => Math.sign(x), a: 0, L: 0, epsMax: 1 },
  { label: 'f(x) = ⌊x⌋', f: (x) => Math.floor(x), a: 1, L: 1, epsMax: 1 },
  { label: 'f(x) = sin(1/x)', f: (x) => Math.sin(1 / x), a: 0, L: 0, epsMax: 1 },
  { label: 'f(x) = x + 𝟙(x > 0)', f: (x) => x + (x > 0 ? 1 : 0), a: 0, L: 0.5, epsMax: 0.5 },
  { label: 'f(x) = cos(1/x)', f: (x) => Math.cos(1 / x), a: 0, L: 1, epsMax: 2 },
];

/** ε schedule of the prover levels, round by round */
const EPS = [
  [0.5, 0.3, 0.2, 0.1, 0.05],
  [0.2, 0.1, 0.05, 0.02, 0.01],
];

/** the machine's δ, as fractions of the window, at level 3 */
const MACHINE_DELTAS = [0.6, 0.15, 0.03, 0.006];

/** sup of |f(x) − L| over 0 < |x − a| < δ (sampled: uniform and geometric near a, both sides) */
export function maxDev(fn: LimitFn, delta: number, n = 3000): { dev: number; x: number } {
  let dev = 0;
  let at = fn.a + delta;
  const test = (x: number) => {
    const y = fn.f(x);
    const d = Number.isFinite(y) ? Math.abs(y - fn.L) : Infinity;
    if (d > dev || Number.isNaN(d)) {
      dev = Number.isNaN(d) ? Infinity : d;
      at = x;
    }
  };
  for (let i = 1; i <= n; i++) {
    const u = (i / n) * delta * (1 - 1e-9);
    const v = delta * Math.pow(1e-6, 1 - i / n);
    for (const s of [-1, 1]) {
      test(fn.a + s * u);
      if (v < delta) test(fn.a + s * v);
    }
  }
  return { dev, x: at };
}

/** the largest δ that answers ε (bisection; capped at `cap`) */
export function optimalDelta(fn: LimitFn, eps: number, cap = 4): number {
  if (maxDev(fn, cap, 1500).dev < eps) return cap;
  let lo = 0;
  let hi = cap;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (maxDev(fn, mid, 1500).dev < eps) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** level 3: the best counterexample within `tol` (data units) of a clicked x, inside 0 < |x − a| < δ */
export function counterexample(fn: LimitFn, x: number, tol: number, delta: number, eps: number): { ok: boolean; x: number; dev: number } {
  let best = { ok: false, x, dev: -1 };
  for (let k = -40; k <= 40; k++) {
    const t = x + (k / 40) * tol;
    if (t === fn.a || Math.abs(t - fn.a) >= delta) continue;
    const y = fn.f(t);
    const dev = Number.isFinite(y) ? Math.abs(y - fn.L) : Infinity;
    if (dev > best.dev) best = { ok: dev >= eps, x: t, dev };
  }
  return best;
}

class Duel implements GameLogic {
  private level = 0;
  private fn: LimitFn = PROVER_EASY[0];
  private eps = 0.1;
  private delta = 0.05;
  private dStar = 0.1;
  private x0 = 0;
  private x1 = 1;
  private y0 = 0;
  private y1 = 1;
  private dragging = false;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  // level 3
  private step = 0;
  private wins = 0;
  private picks: { x: number; ok: boolean }[] = [];
  private done: RoundResult | null = null;
  private result: RoundResult | null = null;
  private miss: number | null = null;

  start(level: number, round: number, r: () => number): void {
    this.level = level;
    this.done = null;
    this.result = null;
    this.miss = null;
    this.step = 0;
    this.wins = 0;
    this.picks = [];
    if (level < 2) {
      const list = level === 0 ? PROVER_EASY : PROVER_HARD;
      // every function once per level, in a shuffled order
      const order = list.map((_, i) => i).sort((p, q) => ((p * 7 + 3) % 5) - ((q * 7 + 3) % 5));
      this.fn = list[order[(round + Math.floor(r() * 5)) % list.length]];
      this.eps = EPS[level][round] ?? EPS[level][EPS[level].length - 1];
      this.dStar = optimalDelta(this.fn, this.eps);
      const half = this.dStar * (2.2 + r() * 1.6);
      this.window(half, this.eps * 3.2);
      this.delta = half * 0.12;
    } else {
      this.fn = REFUTE[round % REFUTE.length];
      this.eps = (this.fn.epsMax ?? 1) * 0.4;
      this.window(1, (this.fn.epsMax ?? 1) * 1.8);
    }
  }

  private window(halfX: number, halfY: number): void {
    this.x0 = this.fn.a - halfX;
    this.x1 = this.fn.a + halfX;
    this.y0 = this.fn.L - halfY;
    this.y1 = this.fn.L + halfY;
  }

  private get half(): number {
    return (this.x1 - this.x0) / 2;
  }

  prompt(): string {
    const f = this.fn;
    if (this.level < 2) return `${f.label} · a = ${fr(f.a, 1)} · L = ${fr(f.L, 1)} · LA MACHINE DIT ε = ${fr(this.eps, 2)} → TON δ ?`;
    if (this.step === 0) return `${f.label} N’A PAS DE LIMITE EN ${fr(f.a, 0)} — LA MACHINE PRÉTEND L = ${fr(f.L, 1)} · CHOISIS ε POUR LA CONTREDIRE`;
    return `ε = ${fr(this.eps, 2)} · LA MACHINE PROPOSE δ = ${this.mDelta().toExponential(1).replace('.', ',')} · CLIQUE UN x AVEC 0 < |x − a| < δ ET |f(x) − L| ≥ ε`;
  }

  controls(): string {
    if (this.level < 2) return 'GLISSER : RÉGLER δ · MOLETTE : AFFINER · ← → ±2 %';
    return this.step === 0 ? 'GLISSER VERTICALEMENT : RÉGLER ε · ↑ ↓ ±2 %' : 'CLIC : CONTRE-EXEMPLE';
  }

  touchControls(): string {
    if (this.level < 2) return 'GLISSER : RÉGLER δ · ◀ ▶ : AFFINER (±2 %)';
    return this.step === 0 ? 'GLISSER VERTICALEMENT : RÉGLER ε · ▼ ▲ : AFFINER (±2 %)' : 'TOUCHER LE GRAPHE : CONTRE-EXEMPLE';
  }

  touchKeys(): TouchKey[] {
    if (this.level < 2)
      return [
        { label: '◀ δ', title: 'δ −2 %', key: 'ArrowLeft', repeat: true },
        { label: 'δ ▶', title: 'δ +2 %', key: 'ArrowRight', repeat: true },
      ];
    return this.step === 0
      ? [
          { label: '▼ ε', title: 'ε −2 %', key: 'ArrowDown', repeat: true },
          { label: 'ε ▲', title: 'ε +2 %', key: 'ArrowUp', repeat: true },
        ]
      : [];
  }

  private mDelta(): number {
    return MACHINE_DELTAS[this.step - 1] ?? MACHINE_DELTAS[MACHINE_DELTAS.length - 1];
  }

  // ── coordinates ────────────────────────────────────────────────────────

  private X(x: number): number {
    return this.box.x + ((x - this.x0) / (this.x1 - this.x0)) * this.box.w;
  }
  private Y(y: number): number {
    return this.box.y + (1 - (y - this.y0) / (this.y1 - this.y0)) * this.box.h;
  }
  private dataX(px: number): number {
    return this.x0 + ((px - this.box.x) / this.box.w) * (this.x1 - this.x0);
  }
  private dataY(py: number): number {
    return this.y0 + (1 - (py - this.box.y) / this.box.h) * (this.y1 - this.y0);
  }

  // ── input ──────────────────────────────────────────────────────────────

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number, e: PointerEvent | WheelEvent): void {
    if (type === 'wheel') {
      const k = Math.pow(1.04, -(e as WheelEvent).deltaY / 100);
      if (this.level < 2) this.delta = Math.min(this.half, this.delta * k);
      else if (this.step === 0) this.eps = Math.min(this.y1 - this.fn.L, this.eps * k);
      return;
    }
    if (type === 'up') {
      this.dragging = false;
      return;
    }
    if (type === 'down') this.dragging = true;
    if (!this.dragging) return;
    if (this.level < 2) this.delta = Math.max(this.half * 0.002, Math.min(this.half, Math.abs(this.dataX(x) - this.fn.a)));
    else if (this.step === 0) this.eps = Math.max(0.01, Math.min(this.y1 - this.fn.L, Math.abs(this.dataY(y) - this.fn.L)));
    else if (type === 'down') this.pick(this.dataX(x));
  }

  key(e: KeyboardEvent): boolean {
    const k = e.key;
    if (this.level < 2 && (k === 'ArrowLeft' || k === 'ArrowRight')) {
      this.delta = Math.max(this.half * 0.002, Math.min(this.half, this.delta * (k === 'ArrowRight' ? 1.02 : 1 / 1.02)));
      return true;
    }
    if (this.level === 2 && this.step === 0 && (k === 'ArrowUp' || k === 'ArrowDown')) {
      this.eps = Math.max(0.01, this.eps * (k === 'ArrowUp' ? 1.02 : 1 / 1.02));
      return true;
    }
    return false;
  }

  /** level 3: a click in the zoomed window of the machine's δ */
  private pick(x: number): void {
    const d = this.mDelta();
    const tol = ((this.x1 - this.x0) / this.box.w) * 3;
    const c = counterexample(this.fn, x, tol, d, this.eps);
    this.picks.push({ x: c.x, ok: c.ok });
    if (c.ok) {
      this.wins++;
      if (this.step >= MACHINE_DELTAS.length) return this.finishRefute();
      this.step++;
      this.window(this.mDelta() * 1.25, (this.fn.epsMax ?? 1) * 1.8);
    } else {
      this.miss = c.x;
      this.finishRefute();
    }
  }

  private finishRefute(): void {
    const em = this.fn.epsMax ?? 1;
    const score = Math.round(40 * Math.min(1, this.eps / em) + 15 * this.wins);
    const all = this.wins === MACHINE_DELTAS.length;
    this.done = {
      ok: all,
      score: all ? score : Math.round(score * 0.5),
      detail: all ? `ε = ${fr(this.eps, 2)} (ε max = ${fr(em, 2)}) · 4 δ battus : la limite ${fr(this.fn.L, 1)} est réfutée` : `x = ${fr(this.miss ?? 0, 5)} ne contredit pas : |f(x) − L| < ε · ${this.wins}/4 δ battus`,
    };
  }

  poll(): RoundResult | null {
    const d = this.done;
    if (d && !this.result) {
      this.result = d;
      return d;
    }
    return null;
  }

  submit(timeout: boolean): RoundResult | null {
    if (this.level < 2) {
      const m = maxDev(this.fn, this.delta, 20000);
      const ok = m.dev < this.eps;
      if (!ok) this.miss = m.x;
      const ratio = Math.min(1, this.delta / this.dStar);
      this.result = ok
        ? { ok, score: Math.round(100 * ratio), detail: `δ = ${fr(this.delta, 4)} · optimum δ* ≈ ${fr(this.dStar, 4)} (${Math.round(ratio * 100)} %)${timeout ? ' · au temps' : ''}` }
        : { ok, score: 0, detail: `CONTRE-EXEMPLE x = ${fr(m.x, 4)} : |f(x) − L| = ${fr(m.dev, 4)} ≥ ε · δ* ≈ ${fr(this.dStar, 4)}` };
      return this.result;
    }
    if (this.step === 0) {
      const em = this.fn.epsMax ?? 1;
      if (this.eps > em) {
        const dd = (this.eps - em) / 4;
        this.result = { ok: false, score: 0, detail: `ε = ${fr(this.eps, 2)} > ${fr(em, 2)} : avec δ = ${dd.toExponential(1).replace('.', ',')} la machine gagne (aucun contre-exemple)` };
        return this.result;
      }
      if (timeout) {
        this.result = { ok: false, score: 0, detail: 'TEMPS ÉCOULÉ AVANT DE CHOISIR ε' };
        return this.result;
      }
      this.step = 1;
      this.window(this.mDelta() * 1.25, em * 1.8);
      return null;
    }
    if (timeout) {
      this.miss = null;
      this.finishRefute();
      const d = this.done!;
      this.result = { ...d, detail: `TEMPS ÉCOULÉ · ${this.wins}/4 δ battus` };
      return this.result;
    }
    return null;
  }

  // ── drawing ────────────────────────────────────────────────────────────

  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void {
    this.box = { x: box.x + 40, y: box.y + 20, w: box.w - 80, h: box.h - 40 };
    const B = this.box;
    const f = this.fn;
    g.save();
    g.beginPath();
    g.rect(box.x, box.y, box.w, box.h);
    g.clip();
    g.lineWidth = 1;
    g.font = '10px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    // axes through (a, L)
    g.strokeStyle = 'rgba(255,255,255,0.2)';
    g.beginPath();
    g.moveTo(B.x, this.Y(f.L));
    g.lineTo(B.x + B.w, this.Y(f.L));
    g.moveTo(this.X(f.a), B.y);
    g.lineTo(this.X(f.a), B.y + B.h);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.textAlign = 'left';
    g.fillText(`L = ${fr(f.L, 2)}`, B.x + 4, this.Y(f.L) - 9);
    g.textAlign = 'center';
    g.fillText(`a = ${fr(f.a, 2)}`, this.X(f.a), B.y + B.h + 12);
    // ε band
    const eps = this.eps;
    const yTop = this.Y(f.L + eps);
    const yBot = this.Y(f.L - eps);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(B.x, yTop, B.w, yBot - yTop);
    g.save();
    g.beginPath();
    g.rect(B.x, yTop, B.w, yBot - yTop);
    g.clip();
    g.strokeStyle = 'rgba(255,255,255,0.07)';
    g.beginPath();
    for (let k = -B.h; k < B.w; k += 12) {
      g.moveTo(B.x + k, yBot);
      g.lineTo(B.x + k + (yBot - yTop), yTop);
    }
    g.stroke();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.7)';
    g.setLineDash([5, 4]);
    g.beginPath();
    g.moveTo(B.x, yTop);
    g.lineTo(B.x + B.w, yTop);
    g.moveTo(B.x, yBot);
    g.lineTo(B.x + B.w, yBot);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#fff';
    g.textAlign = 'right';
    g.fillText(`L + ε`, B.x + B.w - 4, yTop - 8);
    g.fillText(`L − ε`, B.x + B.w - 4, yBot + 8);
    // δ band (yours at levels 1-2, the machine's at level 3)
    const delta = this.level < 2 ? this.delta : this.step > 0 ? this.mDelta() : 0;
    if (delta > 0) {
      const xl = this.X(f.a - delta);
      const xr = this.X(f.a + delta);
      g.strokeStyle = '#fff';
      g.beginPath();
      g.moveTo(xl, B.y);
      g.lineTo(xl, B.y + B.h);
      g.moveTo(xr, B.y);
      g.lineTo(xr, B.y + B.h);
      g.stroke();
      g.textAlign = 'center';
      g.fillStyle = '#fff';
      g.fillText(`a − δ`, xl, B.y - 8);
      g.fillText(`a + δ`, xr, B.y - 8);
      g.fillText(`δ = ${delta < 0.01 ? delta.toExponential(2).replace('.', ',') : fr(delta, 4)}`, (xl + xr) / 2, B.y + 10);
    }
    // the optimum, at the reveal
    if (phase === 'reveal' && this.level < 2) {
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.setLineDash([2, 3]);
      g.beginPath();
      for (const s of [-1, 1]) {
        g.moveTo(this.X(f.a + s * this.dStar), B.y);
        g.lineTo(this.X(f.a + s * this.dStar), B.y + B.h);
      }
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.fillText('δ*', this.X(f.a + this.dStar) + 10, B.y + B.h - 10);
    }
    // the curve: min-max per pixel column (honest for sin(1/x))
    g.strokeStyle = '#fff';
    g.lineWidth = 1.5;
    g.beginPath();
    let pen = false;
    for (let px = 0; px <= B.w; px++) {
      let lo = Infinity;
      let hi = -Infinity;
      for (let s = 0; s < 4; s++) {
        const x = this.dataX(B.x + px + s / 4);
        if (x === f.a) continue;
        const y = f.f(x);
        if (!Number.isFinite(y)) continue;
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      if (lo === Infinity) {
        pen = false;
        continue;
      }
      const yl = Math.max(B.y - 50, Math.min(B.y + B.h + 50, this.Y(lo)));
      const yh = Math.max(B.y - 50, Math.min(B.y + B.h + 50, this.Y(hi)));
      if (!pen) g.moveTo(B.x + px, yl);
      g.lineTo(B.x + px, yl);
      if (Math.abs(yh - yl) > 1) g.lineTo(B.x + px, yh);
      pen = true;
    }
    g.stroke();
    g.lineWidth = 1;
    // the (claimed) limit point: a hole
    g.fillStyle = '#000';
    g.strokeStyle = '#fff';
    g.beginPath();
    g.arc(this.X(f.a), this.Y(f.L), 4, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    // clicks (level 3) and the counterexample
    for (const p of this.picks) this.cross(g, this.X(p.x), this.Y(f.f(p.x)), p.ok ? 1 : 0.5);
    if (phase === 'reveal' && this.miss !== null && Number.isFinite(f.f(this.miss))) {
      const mx = this.X(this.miss);
      const my = this.Y(f.f(this.miss));
      this.cross(g, mx, my, 1, 9);
      g.setLineDash([3, 3]);
      g.strokeStyle = '#fff';
      g.beginPath();
      g.moveTo(mx, my);
      g.lineTo(mx, this.Y(f.L));
      g.stroke();
      g.setLineDash([]);
    }
    // pulse on the δ handles to invite the drag
    if (phase === 'play' && this.level < 2) {
      g.strokeStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 5)})`;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.arc(this.X(f.a + s * this.delta), B.y + B.h / 2, 7, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.restore();
  }

  private cross(g: CanvasRenderingContext2D, x: number, y: number, a: number, s = 5): void {
    g.strokeStyle = `rgba(255,255,255,${a})`;
    g.beginPath();
    g.moveTo(x - s, y - s);
    g.lineTo(x + s, y + s);
    g.moveTo(x + s, y - s);
    g.lineTo(x - s, y + s);
    g.stroke();
  }

  // tests
  state() {
    return { fn: this.fn.label, eps: this.eps, delta: this.delta, dStar: this.dStar, step: this.step };
  }
  setDelta(d: number): void {
    this.delta = d;
  }
}

export const DUEL: GameDef = {
  id: 'duel-eps',
  title: 'Duel ε-δ',
  subtitle: 'La définition de la limite, jouée comme le duel qu’elle est.',
  module: 'principles',
  view: 'principles/limits',
  course: 'riemann',
  minutes: 8,
  brief:
    'La machine nomme une tolérance ε. Tu dois répondre par un δ : tant que x reste à moins de δ de a, f(x) doit rester à moins de ε de L. Le plus grand δ qui marche vaut le plus de points. Au niveau 3, les rôles s’inversent : à toi de démolir une fausse limite.',
  rules: [
    'Niveaux 1 et 2 : glisse pour régler δ. Score = δ / δ* (le meilleur δ possible), si ton δ marche ; 0 s’il existe un contre-exemple.',
    'Niveau 3 : choisis ε, puis la machine propose des δ de plus en plus petits ; à chaque fois, clique un x à moins de δ de a où |f(x) − L| ≥ ε. Score : ε élevé (jusqu’au maximum possible) et δ battus.',
    'À la fin d’une manche, la machine montre l’optimum δ* ou le contre-exemple.',
  ],
  levels: [
    { title: 'Fonctions sages', brief: 'continues, ε de 0,5 à 0,05', rounds: 5, time: 25 },
    { title: 'Asymétries et trous', brief: '1/x, sin x / x, x·sin(1/x)…, ε jusqu’à 0,01', rounds: 5, time: 25 },
    { title: 'Inversion des rôles', brief: 'réfuter une limite qui n’existe pas', rounds: 5, time: 40 },
  ],
  theorem: {
    kind: 'definition',
    title: 'Limite d’une fonction en un point',
    body: '$f$ admet la limite $L$ en $a$ si $$\\forall \\varepsilon > 0,\\ \\exists \\delta > 0,\\ \\forall x,\\quad 0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon.$$ C’est exactement un jeu à deux : l’adversaire choisit $\\varepsilon$, tu réponds $\\delta$, il choisit $x$. **$L$ est la limite si et seulement si tu as une stratégie gagnante** (sémantique des jeux de Hintikka). La négation se joue en sens inverse : $$\\exists \\varepsilon > 0,\\ \\forall \\delta > 0,\\ \\exists x,\\quad 0 < |x - a| < \\delta \\text{ et } |f(x) - L| \\ge \\varepsilon$$ — c’est le niveau 3.',
  },
  references: ['W. Rudin, Principles of Mathematical Analysis, chap. 4', 'J. Hintikka, Logic, Language-Games and Information (1973)'],
  make: () => new Duel(),
};

export type DuelLogic = Duel;
