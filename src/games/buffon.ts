// CASINO DE BUFFON: needles of length ℓ dropped on a floor of planks of width d (ℓ ≤ d). Level 1,
// the odds: estimate the crossing probability 2ℓ/(πd). Level 2, the bet: an interval for the
// number of crossings out of 100 — narrow pays, missing loses. Level 3: from a real throw, an
// interval for π. Pure probability, scored against the binomial and the delta method.
import { fr, type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey } from './types';

/** P(a needle crosses a line) for ℓ ≤ d */
export const pCross = (l: number, d: number): number => (2 * l) / (Math.PI * d);

export interface Needle {
  x: number;
  y: number;
  a: number;
  cross: boolean;
}

/** drop n needles (in units of d: planks between y = k), centre uniform, angle uniform */
export function throwNeedles(n: number, l: number, r: () => number): Needle[] {
  const out: Needle[] = [];
  for (let i = 0; i < n; i++) {
    const x = r();
    const y = r() * 6;
    const a = r() * Math.PI;
    const dy = (l / 2) * Math.sin(a);
    out.push({ x, y, a, cross: Math.floor(y - dy) !== Math.floor(y + dy) });
  }
  return out;
}

/** 95 % interval of a binomial count (normal approximation) */
export function binomialBand(n: number, p: number): [number, number] {
  const sd = Math.sqrt(n * p * (1 - p));
  return [n * p - 1.96 * sd, n * p + 1.96 * sd];
}

/** π̂ = 2ℓn / (d k) and its standard deviation by the delta method, π √((1 − p) / (n p)) */
export function piEstimate(n: number, k: number, l: number): { pi: number; sd: number } {
  const p = k / n;
  const pi = (2 * l) / p;
  return { pi, sd: pi * Math.sqrt((1 - p) / (n * p)) };
}

const RATIOS = [1, 0.5, 0.8, 0.3, 0.65];

class Buffon implements GameLogic {
  level = 0;
  l = 1;
  /** level 1: the guess p̂; levels 2-3: the interval [a, b] */
  guess = 0.5;
  lo = 0;
  hi = 1;
  data: Needle[] = [];
  outcome: Needle[] = [];
  private r: () => number = Math.random;
  private axis: [number, number] = [0, 1];
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private drag: 'guess' | 'lo' | 'hi' | null = null;
  private result: RoundResult | null = null;

  start(level: number, round: number, r: () => number): void {
    this.level = level;
    this.r = r;
    this.result = null;
    this.outcome = [];
    this.l = level === 2 ? 0.8 : RATIOS[(round + Math.floor(r() * 5)) % 5];
    if (level === 0) {
      this.axis = [0, 1];
      this.guess = 0.5;
      this.data = throwNeedles(14, this.l, r);
    } else if (level === 1) {
      this.axis = [0, 100];
      this.lo = 30;
      this.hi = 70;
      this.data = throwNeedles(14, this.l, r);
    } else {
      this.axis = [2.4, 4];
      this.lo = 2.9;
      this.hi = 3.4;
      this.data = throwNeedles(400, this.l, r);
    }
  }

  get k(): number {
    return this.data.filter((n) => n.cross).length;
  }

  prompt(): string {
    const L = `ℓ = ${fr(this.l, 2)} d`;
    if (this.level === 0) return `${L} · QUELLE EST LA PROBABILITÉ QU’UNE AIGUILLE COUPE UNE LAME ?`;
    if (this.level === 1) return `${L} · 100 AIGUILLES VONT TOMBER · PARIE UN INTERVALLE POUR LE NOMBRE QUI COUPENT`;
    return `${L} · 400 AIGUILLES, ${this.k} COUPENT UNE LAME · DONNE UN INTERVALLE QUI CONTIENT π`;
  }

  controls(): string {
    return this.level === 0 ? 'GLISSER SUR LA RÈGLE : TON ESTIMATION · ← → AFFINER' : 'GLISSER LES DEUX BORNES · ← → / ↑ ↓ AFFINER';
  }

  touchControls(): string {
    return this.level === 0 ? 'GLISSER SUR LA RÈGLE : TON ESTIMATION · ◀ ▶ : AFFINER' : 'GLISSER LES DEUX BORNES · ◀ ▶ BORNE BASSE · ▼ ▲ BORNE HAUTE';
  }

  touchKeys(): TouchKey[] {
    const lr: TouchKey[] = [
      { label: this.level === 0 ? '◀' : 'MIN ◀', title: 'Affiner vers la gauche', key: 'ArrowLeft', repeat: true },
      { label: this.level === 0 ? '▶' : 'MIN ▶', title: 'Affiner vers la droite', key: 'ArrowRight', repeat: true },
    ];
    if (this.level === 0) return lr;
    return [...lr, { label: 'MAX ▼', title: 'Baisser la borne haute', key: 'ArrowDown', repeat: true }, { label: 'MAX ▲', title: 'Monter la borne haute', key: 'ArrowUp', repeat: true }];
  }

  private ruler(): { x: number; y: number; w: number } {
    return { x: this.box.x + 60, y: this.box.y + this.box.h - 40, w: this.box.w - 120 };
  }
  private toVal(px: number): number {
    const R = this.ruler();
    const t = Math.max(0, Math.min(1, (px - R.x) / R.w));
    return this.axis[0] + t * (this.axis[1] - this.axis[0]);
  }
  private toPx(v: number): number {
    const R = this.ruler();
    return R.x + ((v - this.axis[0]) / (this.axis[1] - this.axis[0])) * R.w;
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    if (type === 'up') {
      this.drag = null;
      return;
    }
    if (type === 'down') {
      if (y < this.ruler().y - 50) return;
      if (this.level === 0) this.drag = 'guess';
      else this.drag = Math.abs(x - this.toPx(this.lo)) <= Math.abs(x - this.toPx(this.hi)) ? 'lo' : 'hi';
    }
    if (!this.drag || (type !== 'move' && type !== 'down')) return;
    const v = this.toVal(x);
    const snap = this.level === 1 ? Math.round(v) : v;
    if (this.drag === 'guess') this.guess = snap;
    else if (this.drag === 'lo') this.lo = Math.min(snap, this.hi);
    else this.hi = Math.max(snap, this.lo);
  }

  key(e: KeyboardEvent): boolean {
    const step = this.level === 0 ? 0.002 : this.level === 1 ? 1 : 0.005;
    const k = e.key;
    if (this.level === 0 && (k === 'ArrowLeft' || k === 'ArrowRight')) {
      this.guess = Math.max(0, Math.min(1, this.guess + (k === 'ArrowRight' ? step : -step)));
      return true;
    }
    if (this.level > 0 && (k === 'ArrowLeft' || k === 'ArrowRight')) {
      this.lo = Math.min(this.hi, this.lo + (k === 'ArrowRight' ? step : -step));
      return true;
    }
    if (this.level > 0 && (k === 'ArrowUp' || k === 'ArrowDown')) {
      this.hi = Math.max(this.lo, this.hi + (k === 'ArrowUp' ? step : -step));
      return true;
    }
    return false;
  }

  submit(timeout: boolean): RoundResult {
    const p = pCross(this.l, 1);
    const t = timeout ? ' · au temps' : '';
    if (this.level === 0) {
      this.outcome = throwNeedles(2000, this.l, this.r);
      const freq = this.outcome.filter((n) => n.cross).length / 2000;
      const err = Math.abs(this.guess - p);
      this.result = { ok: err <= 0.02, score: Math.round(100 * Math.max(0, 1 - err / 0.06)), detail: `p = 2ℓ/(πd) = ${fr(p, 4)} · ton estimation ${fr(this.guess, 3)} · 2 000 aiguilles : ${fr(freq, 4)}${t}` };
      return this.result;
    }
    if (this.level === 1) {
      this.outcome = throwNeedles(100, this.l, this.r);
      const k = this.outcome.filter((n) => n.cross).length;
      const [a, b] = binomialBand(100, p);
      const ok = this.lo <= k && k <= this.hi;
      const width = this.hi - this.lo + 1;
      const ideal = b - a + 1;
      this.result = { ok, score: ok ? Math.round(100 * Math.min(1, ideal / width)) : 0, detail: `${k} aiguilles coupent · ton pari [${this.lo} ; ${this.hi}] · 95 % : [${fr(a, 1)} ; ${fr(b, 1)}] autour de np = ${fr(100 * p, 1)}${t}` };
      return this.result;
    }
    const est = piEstimate(400, this.k, this.l);
    const ok = this.lo <= Math.PI && Math.PI <= this.hi;
    const ideal = 2 * 1.96 * est.sd;
    this.result = { ok, score: ok ? Math.round(100 * Math.min(1, ideal / Math.max(1e-9, this.hi - this.lo))) : 0, detail: `π̂ = 2ℓn/(dk) = ${fr(est.pi, 4)} · écart-type ≈ ${fr(est.sd, 3)} · ton intervalle [${fr(this.lo, 3)} ; ${fr(this.hi, 3)}] ${ok ? 'contient' : 'manque'} π${t}` };
    return this.result;
  }

  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    const floor = { x: box.x + 20, y: box.y + 20, w: box.w - 40, h: box.h - 120 };
    const d = floor.h / 6;
    g.save();
    g.beginPath();
    g.rect(floor.x, floor.y, floor.w, floor.h);
    g.clip();
    // the planks
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 1;
    g.beginPath();
    for (let k = 0; k <= 6; k++) {
      g.moveTo(floor.x, floor.y + k * d);
      g.lineTo(floor.x + floor.w, floor.y + k * d);
    }
    g.stroke();
    // needles: the data (level 3), a sample (levels 1-2), then the throw at the reveal
    const shown = phase === 'reveal' && this.outcome.length ? this.outcome : this.data;
    const count = shown.length;
    const L = this.l * d;
    shown.slice(0, Math.min(count, 600)).forEach((n) => {
      const cx = floor.x + n.x * floor.w;
      const cy = floor.y + n.y * d;
      const dx = (L / 2) * Math.cos(n.a);
      const dy = (L / 2) * Math.sin(n.a);
      g.strokeStyle = n.cross ? '#fff' : 'rgba(255,255,255,0.3)';
      g.lineWidth = n.cross ? 1.5 : 1;
      g.beginPath();
      g.moveTo(cx - dx, cy - dy);
      g.lineTo(cx + dx, cy + dy);
      g.stroke();
    });
    g.restore();
    // scale: d and ℓ
    g.strokeStyle = '#fff';
    g.fillStyle = '#fff';
    g.font = '11px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.beginPath();
    g.moveTo(floor.x + floor.w + 8, floor.y);
    g.lineTo(floor.x + floor.w + 8, floor.y + d);
    g.stroke();
    g.fillText('d', floor.x + floor.w + 12, floor.y + d / 2);
    g.fillStyle = 'rgba(0,0,0,0.75)';
    g.fillRect(floor.x + 8, floor.y + 8, 280, 22);
    g.fillStyle = '#fff';
    const crossing = shown.filter((n) => n.cross).length;
    g.fillText(phase === 'reveal' && this.outcome.length ? `${this.outcome.length} aiguilles · ${crossing} coupent (${fr(crossing / this.outcome.length, 3)})` : this.level === 2 ? `n = 400 · k = ${this.k} coupent` : `aiguille ℓ = ${fr(this.l, 2)} d`, floor.x + 14, floor.y + 19);
    // the ruler
    const R = this.ruler();
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.beginPath();
    g.moveTo(R.x, R.y);
    g.lineTo(R.x + R.w, R.y);
    for (let k = 0; k <= 10; k++) {
      const x = R.x + (k / 10) * R.w;
      g.moveTo(x, R.y - 4);
      g.lineTo(x, R.y + 4);
    }
    g.stroke();
    g.textAlign = 'center';
    g.fillStyle = 'rgba(255,255,255,0.6)';
    for (let k = 0; k <= 10; k += 2) g.fillText(fr(this.axis[0] + (k / 10) * (this.axis[1] - this.axis[0]), this.level === 1 ? 0 : 2), R.x + (k / 10) * R.w, R.y + 16);
    g.fillStyle = '#fff';
    if (this.level === 0) {
      const x = this.toPx(this.guess);
      g.fillRect(x - 1, R.y - 14, 2, 28);
      g.fillText(`p̂ = ${fr(this.guess, 3)}`, x, R.y - 22);
    } else {
      const a = this.toPx(this.lo);
      const b = this.toPx(this.hi);
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(a, R.y - 10, b - a, 20);
      g.fillStyle = '#fff';
      g.fillRect(a - 1, R.y - 14, 2, 28);
      g.fillRect(b - 1, R.y - 14, 2, 28);
      g.fillText(this.level === 1 ? `[${this.lo} ; ${this.hi}]` : `[${fr(this.lo, 3)} ; ${fr(this.hi, 3)}]`, (a + b) / 2, R.y - 22);
    }
    if (phase === 'reveal') {
      const truth = this.level === 0 ? pCross(this.l, 1) : this.level === 1 ? this.outcome.filter((n) => n.cross).length : Math.PI;
      const x = this.toPx(truth);
      g.strokeStyle = '#fff';
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(x, R.y - 34);
      g.lineTo(x, R.y + 8);
      g.stroke();
      g.setLineDash([]);
      g.fillText(this.level === 0 ? 'p' : this.level === 1 ? 'k' : 'π', x, R.y - 40);
    }
  }
}

export const BUFFON: GameDef = {
  id: 'buffon-casino',
  title: 'Casino de Buffon',
  subtitle: 'Parier juste sur des aiguilles qui tombent.',
  module: 'probability',
  view: 'probability/buffon',
  minutes: 9,
  brief:
    'Des aiguilles de longueur ℓ tombent au hasard sur un parquet de lames de largeur d. Estime d’abord la cote : la probabilité qu’une aiguille coupe une lame. Puis parie un intervalle pour le nombre d’aiguilles qui coupent : étroit, il paie gros ; s’il rate, il ne paie rien. Enfin, à partir d’un vrai lancer, encadre π.',
  rules: [
    'Niveau 1 : glisse sur la règle (← → pour affiner). Score plein si tu es à moins de 0,02 de la vraie probabilité.',
    'Niveaux 2 et 3 : glisse les deux bornes de ton intervalle. Si la valeur tombe dedans, le score monte quand l’intervalle se rapproche de l’intervalle à 95 % ; sinon 0.',
    'Le hasard est réel : un intervalle à 95 % rate une fois sur vingt.',
  ],
  levels: [
    { title: 'La cote', brief: 'estimer 2ℓ/(πd)', rounds: 5, time: 25 },
    { title: 'Le pari', brief: 'intervalle pour 100 aiguilles', rounds: 5, time: 30 },
    { title: 'Encadrer π', brief: '400 aiguilles, la méthode delta', rounds: 5, time: 40 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'L’aiguille de Buffon, et ce que le hasard en dit',
    body: '**Buffon (1777)** : une aiguille de longueur $\\ell \\le d$ lâchée au hasard (centre et angle uniformes) coupe une lame avec probabilité $$p = \\frac{2\\ell}{\\pi d}.$$ Sur $n$ aiguilles indépendantes, le nombre $K$ qui coupent suit la loi binomiale $\\mathcal{B}(n, p)$ : $\\mathbb{E}K = np$, $\\operatorname{Var} K = np(1 - p)$, et par le théorème central limite $[\\,np \\pm 1{,}96\\sqrt{np(1-p)}\\,]$ contient $K$ avec une probabilité proche de $95\\,\\%$. L’estimateur $\\hat\\pi = \\frac{2\\ell n}{dK}$ converge presque sûrement vers $\\pi$ (loi forte des grands nombres) ; par la méthode delta, son écart-type vaut environ $\\pi\\sqrt{\\frac{1 - p}{np}}$.',
  },
  references: ['G.-L. Leclerc de Buffon, Essai d’arithmétique morale (1777)', 'W. Feller, An Introduction to Probability Theory and Its Applications, vol. I'],
  make: () => new Buffon(),
};

export type BuffonLogic = Buffon;
