// RACINE DE BABYLONE (mode histoire, acte I): a rectangle of area N must become a square. At each
// step the player chooses the new side between x and N/x; the best choice is their mean (Heron's
// method, a reconstruction of how the scribe of YBC 7289 may have found √2 = 1;24,51,10). Level 3
// works on a box x × x × N/x² towards ∛N: the best point is then (2x + N/x²)/3 — Newton's method.
import { type Box, type GameDef, type GameLogic, type RoundResult, fr } from './types';

/** x in base 60 with `places` sexagesimal places, rounded: √2 → "1;24,51,10" */
export function sexagesimal(x: number, places = 3): string {
  let ip = Math.floor(x);
  let f = x - ip;
  const digits: number[] = [];
  for (let k = 0; k < places; k++) {
    f *= 60;
    const d = Math.floor(f);
    digits.push(d);
    f -= d;
  }
  if (f >= 0.5) {
    let k = places - 1;
    digits[k]++;
    while (k > 0 && digits[k] === 60) {
      digits[k] = 0;
      digits[--k]++;
    }
    if (digits[0] === 60) {
      digits[0] = 0;
      ip++;
    }
  }
  return `${ip};${digits.join(',')}`;
}

/** the other side: N/x (square root) or the height N/x² (cube root) */
export const otherSide = (x: number, n: number, cube: boolean): number => (cube ? n / (x * x) : n / x);
/** the optimal next side: Heron (mean) or Newton for the cube root */
export const heron = (x: number, n: number, cube: boolean): number => (cube ? (2 * x + n / (x * x)) / 3 : (x + n / x) / 2);
export const rootOf = (n: number, cube: boolean): number => (cube ? Math.cbrt(n) : Math.sqrt(n));

/** relative error after `steps` optimal steps from x0 */
export function bestError(n: number, x0: number, steps: number, cube: boolean): number {
  let x = x0;
  for (let k = 0; k < steps; k++) x = heron(x, n, cube);
  return Math.abs(x - rootOf(n, cube)) / rootOf(n, cube);
}

/** score: 100 when the final error is as small as the optimal one, on a logarithmic scale */
export function babylonScore(err: number, best: number): number {
  const e = Math.max(err, 1e-16);
  const b = Math.max(best, 1e-15);
  if (e <= b) return 100;
  if (e >= 1) return 0;
  return Math.round(Math.max(0, Math.min(100, (100 * Math.log(e)) / Math.log(b))));
}

const sci = (e: number): string => {
  if (e === 0) return '0';
  const k = Math.floor(Math.log10(e));
  const m = e / 10 ** k;
  const sup = String(k).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return `${m.toFixed(1).replace('.', ',')}·10${sup}`;
};

interface Round {
  n: number;
  x0: number;
  steps: number;
  cube: boolean;
}

export function makeBabylonRound(level: number, round: number, r: () => number): Round {
  if (level === 0) {
    if (round === 0) return { n: 2, x0: 1.5, steps: 3, cube: false };
    const pool = [3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
    const n = pool[Math.floor(r() * pool.length)];
    return { n, x0: Math.max(1, Math.round(Math.sqrt(n))), steps: 3, cube: false };
  }
  if (level === 1) {
    let n = 0;
    do n = 20 + Math.floor(r() * 980);
    while (Number.isInteger(Math.sqrt(n)));
    return { n, x0: Math.max(5, Math.round(Math.sqrt(n) / 5) * 5), steps: 4, cube: false };
  }
  let n = 0;
  do n = 10 + Math.floor(r() * 990);
  while (Number.isInteger(Math.round(Math.cbrt(n) * 1e9) / 1e9));
  return { n, x0: Math.max(2, Math.round(Math.cbrt(n))), steps: 4, cube: true };
}

class Babylon implements GameLogic {
  private rd: Round = { n: 2, x0: 1.5, steps: 3, cube: false };
  private x = 1.5;
  private cand = 1.5;
  private done = 0;
  private hist: { x: number; err: number }[] = [];
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private dragging = false;
  private level = 0;

  start(level: number, round: number, r: () => number): void {
    this.level = level;
    this.rd = makeBabylonRound(level, round, r);
    this.x = this.rd.x0;
    this.done = 0;
    this.hist = [];
    this.cand = (this.lo() + this.hi()) / 2 + (this.hi() - this.lo()) * 0.3;
  }

  private lo(): number {
    return Math.min(this.x, otherSide(this.x, this.rd.n, this.rd.cube));
  }

  private hi(): number {
    return Math.max(this.x, otherSide(this.x, this.rd.n, this.rd.cube));
  }

  private err(x: number): number {
    const t = rootOf(this.rd.n, this.rd.cube);
    return Math.abs(x - t) / t;
  }

  prompt(): string {
    const left = this.rd.steps - this.done;
    return this.rd.cube
      ? `RENDS LA BOÎTE CUBIQUE : BASE x × x, HAUTEUR N/x² · VOLUME ${this.rd.n} · ${left} ÉTAPE${left > 1 ? 'S' : ''}`
      : `RENDS LE RECTANGLE CARRÉ : CÔTÉS x ET ${this.rd.n}/x · AIRE ${this.rd.n} · ${left} ÉTAPE${left > 1 ? 'S' : ''}`;
  }

  controls(): string {
    return 'GLISSER SUR LA RÈGLE : NOUVEAU CÔTÉ · ← → AJUSTER (MAJ : FIN) · ⏎ VALIDER L’ÉTAPE';
  }

  /** the ruler, in the right half of the box */
  private ruler(): { x0: number; x1: number; y: number } {
    const b = this.box;
    return { x0: b.x + b.w * 0.52, x1: b.x + b.w - 30, y: b.y + b.h * 0.42 };
  }

  private setFromX(px: number): void {
    const R = this.ruler();
    const t = Math.max(0, Math.min(1, (px - R.x0) / (R.x1 - R.x0)));
    const lo = this.lo();
    const hi = this.hi();
    let c = lo + t * (hi - lo);
    // a small magnet on the best point: aiming at it is the skill, not the last pixel
    const best = heron(this.x, this.rd.n, this.rd.cube);
    if (Math.abs(c - best) < 0.02 * (hi - lo)) c = best;
    this.cand = c;
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    const R = this.ruler();
    if (type === 'down' && x >= R.x0 - 20 && x <= R.x1 + 20 && Math.abs(y - R.y) < 60) {
      this.dragging = true;
      this.setFromX(x);
    } else if (type === 'move' && this.dragging) this.setFromX(x);
    else if (type === 'up') this.dragging = false;
  }

  key(e: KeyboardEvent): boolean {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
    const w = this.hi() - this.lo();
    const d = (e.key === 'ArrowLeft' ? -1 : 1) * w * (e.shiftKey ? 0.0005 : 0.005);
    this.cand = Math.max(this.lo(), Math.min(this.hi(), this.cand + d));
    return true;
  }

  submit(timeout: boolean): RoundResult | null {
    if (!timeout) {
      this.x = this.cand;
      this.done++;
      this.hist.push({ x: this.x, err: this.err(this.x) });
      const lo = this.lo();
      const hi = this.hi();
      this.cand = lo + (hi - lo) * 0.8;
      if (this.done < this.rd.steps) return null;
    }
    const best = bestError(this.rd.n, this.rd.x0, this.rd.steps, this.rd.cube);
    const e = this.err(this.x);
    const score = babylonScore(e, best);
    const tablet = this.rd.n === 2 && !this.rd.cube && Math.abs(this.x - Math.SQRT2) <= Math.abs(1 + 24 / 60 + 51 / 3600 + 10 / 216000 - Math.SQRT2);
    return {
      ok: score >= 50,
      score,
      detail: `${this.rd.cube ? '∛' : '√'}${this.rd.n} ≈ ${fr(this.x, 9)} · erreur ${sci(e)} (optimum ${sci(best)})${tablet ? ' · aussi précis que la tablette' : ''}${timeout ? ' · au temps' : ''}`,
    };
  }

  draw(g: CanvasRenderingContext2D, box: Box, _t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    const { n, cube } = this.rd;
    const other = otherSide(this.x, n, cube);
    const root = rootOf(n, cube);
    g.save();
    g.font = '12px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    // left: the rectangle (or the side view of the box) and the square it should become
    const areaW = box.w * 0.44;
    const areaH = box.h * 0.78;
    const s = Math.min(areaW / Math.max(this.x, root * 1.05), areaH / Math.max(other, root * 1.05));
    const ox = box.x + 24;
    const oy = box.y + box.h - 40;
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.setLineDash([5, 5]);
    g.strokeRect(ox + 0.5, oy - root * s + 0.5, root * s, root * s);
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.fillRect(ox, oy - other * s, this.x * s, other * s);
    g.strokeStyle = '#fff';
    g.strokeRect(ox + 0.5, oy - other * s + 0.5, this.x * s, other * s);
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.fillText(`x = ${fr(this.x, 6)}`, ox + (this.x * s) / 2, oy + 16);
    g.save();
    g.translate(ox + this.x * s + 14, oy - (other * s) / 2);
    g.rotate(-Math.PI / 2);
    g.fillText(`${cube ? `${n}/x²` : `${n}/x`} = ${fr(other, 6)}`, 0, 0);
    g.restore();
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillText(cube ? `vue de côté : base x × x, hauteur ${n}/x² ; en pointillés, le cube de volume ${n}` : `en pointillés : le carré d’aire ${n}`, ox, box.y + 14);
    // right: the ruler from min to max of the two sides
    const R = this.ruler();
    const lo = this.lo();
    const hi = this.hi();
    g.strokeStyle = '#fff';
    g.beginPath();
    g.moveTo(R.x0, R.y);
    g.lineTo(R.x1, R.y);
    for (let k = 0; k <= 10; k++) {
      const px = R.x0 + (k / 10) * (R.x1 - R.x0);
      g.moveTo(px, R.y - (k % 5 === 0 ? 10 : 5));
      g.lineTo(px, R.y + (k % 5 === 0 ? 10 : 5));
    }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.textAlign = 'center';
    g.fillText(fr(lo, 7), R.x0, R.y + 24);
    g.fillText(fr(hi, 7), R.x1, R.y + 24);
    const cx = R.x0 + ((this.cand - lo) / Math.max(1e-300, hi - lo)) * (R.x1 - R.x0);
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(cx, R.y - 14);
    g.lineTo(cx - 7, R.y - 26);
    g.lineTo(cx + 7, R.y - 26);
    g.closePath();
    g.fill();
    g.font = '16px "JetBrains Mono", monospace';
    g.fillText(`x′ = ${fr(this.cand, 9)}`, (R.x0 + R.x1) / 2, R.y - 52);
    g.font = '12px "JetBrains Mono", monospace';
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.fillText(`en base 60 : ${sexagesimal(this.cand)}`, (R.x0 + R.x1) / 2, R.y - 34 - 0);
    if (phase === 'reveal') {
      const bx = R.x0 + ((heron(this.x, n, cube) - lo) / Math.max(1e-300, hi - lo)) * (R.x1 - R.x0);
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(bx, R.y - 30);
      g.lineTo(bx, R.y + 30);
      g.stroke();
      g.setLineDash([]);
    }
    // history
    g.textAlign = 'left';
    let y = R.y + 56;
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillText(`départ x₀ = ${fr(this.rd.x0, 4)} · erreur ${sci(this.err(this.rd.x0))}`, R.x0, y);
    for (const [i, h] of this.hist.entries()) {
      y += 20;
      g.fillStyle = '#fff';
      g.fillText(`étape ${i + 1} : x = ${fr(h.x, 9)} · erreur ${sci(h.err)}`, R.x0, y);
    }
    if (phase === 'reveal') {
      y += 26;
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.fillText(cube ? `meilleur choix : (2x + N/x²)/3, la méthode de Newton` : `meilleur choix : la moyenne (x + N/x)/2`, R.x0, y);
      if (n === 2 && !cube) g.fillText(`la tablette YBC 7289 : 1;24,51,10 = ${fr(1 + 24 / 60 + 51 / 3600 + 10 / 216000, 8)}`, R.x0, y + 18);
    }
    g.restore();
    void this.level;
  }
}

export const BABYLON: GameDef = {
  id: 'babylon',
  title: 'Racine de Babylone',
  subtitle: 'Rendre un rectangle carré, en base 60, comme le scribe de la tablette YBC 7289.',
  module: 'constants',
  view: 'constants/sqrt2',
  minutes: 8,
  brief:
    'Un rectangle d’aire N a pour côtés x et N/x. S’il était carré, son côté serait racine de N. À chaque étape, choisis un nouveau côté entre x et N/x : l’autre côté s’ajuste pour garder l’aire. Trois étapes pour retrouver racine de deux avec la précision de la tablette.',
  rules: [
    'Glisser sur la règle (ou ← →) : choisir le nouveau côté x′, entre x et N/x. ⏎ : valider l’étape. L’autre côté devient N/x′.',
    'Le score compare l’erreur finale à celle de la meilleure stratégie, sur une échelle logarithmique : chaque décimale exacte compte.',
    'Niveau 3 : une boîte de base x × x et de hauteur N/x² doit devenir un cube ; le meilleur point n’est plus le milieu.',
  ],
  levels: [
    { title: 'La tablette', brief: '√2 depuis 1;30, puis d’autres racines · 3 étapes', rounds: 4, time: 60 },
    { title: 'Grands carrés', brief: 'aires de 20 à 999, départ grossier · 4 étapes', rounds: 4, time: 70 },
    { title: 'Le cube', brief: 'racines cubiques : la méthode de Newton · 4 étapes', rounds: 4, time: 80 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Méthode de Héron : convergence quadratique',
    body: 'Pour $N > 0$ et $x_0 > 0$, la suite $x_{k+1} = \\frac12\\left(x_k + \\frac{N}{x_k}\\right)$ converge vers $\\sqrt N$, et $x_{k+1} - \\sqrt N = \\frac{(x_k - \\sqrt N)^2}{2 x_k}$ : à chaque étape, le nombre de décimales exactes double environ. C’est la méthode de Newton appliquée à $f(x) = x^2 - N$ ; pour $f(x) = x^3 - N$, elle donne $x_{k+1} = \\frac{2x_k + N/x_k^2}{3}$. La valeur $1;24,51,10$ de la tablette YBC 7289 vaut $1{,}414\\,212\\,96\\ldots$, à moins de $10^{-6}$ de $\\sqrt 2$ ; la méthode employée par le scribe n’est pas connue, celle-ci en est une reconstruction plausible.',
  },
  references: ['D. Fowler, E. Robson, Square Root Approximations in Old Babylonian Mathematics: YBC 7289 in Context, Historia Mathematica 25 (1998)', 'Héron d’Alexandrie, Metrica, livre I'],
  make: () => new Babylon(),
};
