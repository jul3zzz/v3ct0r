// PEINTRE DE FOURIER: a closed curve is a sum of turning circles, one per frequency n. With a budget
// of K circles, pick the frequencies that redraw the target best. Parseval says how good a choice
// is (the energy left out), and that the best K are the K largest coefficients. Level 3, blind:
// no preview — read the frequencies off the symmetry of the figure (n ≡ 1 mod k).
import { fr, type Box, type GameDef, type GameLogic, type RoundResult } from './types';

export const NMAX = 10;
/** frequencies offered: −10…−1, 1…10 (the centre, n = 0, is fixed) */
export const FREQS = [...Array.from({ length: NMAX }, (_, i) => -NMAX + i), ...Array.from({ length: NMAX }, (_, i) => i + 1)];

/** Fourier coefficients c_n of a closed curve, n ≠ 0 */
export type Spectrum = Map<number, [number, number]>;

export const amp2 = (c: [number, number]): number => c[0] * c[0] + c[1] * c[1];

/** energy captured by a set of frequencies, as a fraction of the total (Parseval) */
export function captured(spec: Spectrum, S: number[]): number {
  let all = 0;
  let got = 0;
  for (const [n, c] of spec) {
    all += amp2(c);
    if (S.includes(n)) got += amp2(c);
  }
  return all ? got / all : 0;
}

/** the best K frequencies: the K largest |c_n| */
export function bestSet(spec: Spectrum, K: number): number[] {
  return [...spec.entries()]
    .sort((p, q) => amp2(q[1]) - amp2(p[1]))
    .slice(0, K)
    .map(([n]) => n);
}

/** point of the curve made of the frequencies S, at t ∈ [0, 1) */
export function curveAt(spec: Spectrum, S: number[] | null, t: number): [number, number] {
  let x = 0;
  let y = 0;
  for (const [n, [re, im]] of spec) {
    if (S && !S.includes(n)) continue;
    const a = 2 * Math.PI * n * t;
    x += re * Math.cos(a) - im * Math.sin(a);
    y += re * Math.sin(a) + im * Math.cos(a);
  }
  return [x, y];
}

const polar = (r: number, phi: number): [number, number] => [r * Math.cos(phi), r * Math.sin(phi)];

/** the heart curve, its coefficients computed by a discrete Fourier transform */
function heart(): Spectrum {
  const M = 512;
  const pts: [number, number][] = [];
  for (let k = 0; k < M; k++) {
    const t = (2 * Math.PI * k) / M;
    pts.push([16 * Math.sin(t) ** 3 / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]);
  }
  const spec: Spectrum = new Map();
  for (const n of FREQS) {
    let re = 0;
    let im = 0;
    for (let k = 0; k < M; k++) {
      const a = (-2 * Math.PI * n * k) / M;
      re += pts[k][0] * Math.cos(a) - pts[k][1] * Math.sin(a);
      im += pts[k][0] * Math.sin(a) + pts[k][1] * Math.cos(a);
    }
    spec.set(n, [re / M, im / M]);
  }
  return spec;
}

/** a random spectrum: `big` dominant frequencies, then small ones; the K-th and (K+1)-th largest
 *  differ by a clear factor so the optimum can be seen */
export function randomSpectrum(r: () => number, big: number, allowed: number[] = FREQS): Spectrum {
  for (let tries = 0; tries < 200; tries++) {
    const pool = [...allowed].sort(() => r() - 0.5);
    const spec: Spectrum = new Map();
    // the fundamental (n = 1) keeps the curve a single loop around the centre
    const chosen = [1, ...pool.filter((n) => n !== 1)].slice(0, big + 3).filter((n) => allowed.includes(n));
    chosen.forEach((n, i) => {
      const a = i === 0 ? 1 : i < big ? 0.55 * Math.pow(0.72, i - 1) * (0.85 + r() * 0.3) : 0.05 + r() * 0.05;
      spec.set(n, polar(a, r() * Math.PI * 2));
    });
    for (const n of FREQS) if (!spec.has(n)) spec.set(n, [0, 0]);
    const amps = [...spec.values()].map(amp2).sort((p, q) => q - p);
    if (amps[big - 1] > amps[big] * 1.7) return spec;
  }
  return heart();
}

/** a curve with k-fold rotational symmetry: only n ≡ 1 (mod k) */
export function symmetricSpectrum(r: () => number, k: number, K: number): Spectrum {
  const allowed = FREQS.filter((n) => (((n - 1) % k) + k) % k === 0);
  return randomSpectrum(r, Math.min(K, allowed.length), allowed);
}

const LEVEL = [
  { K: 3, blind: false },
  { K: 5, blind: false },
  { K: 4, blind: true },
];

class FourierPainter implements GameLogic {
  spec: Spectrum = new Map();
  picks: number[] = [];
  private level = 0;
  private K = 3;
  private blind = false;
  private sym = 0;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private btn: Box[] = [];
  private flash = 0;

  start(level: number, round: number, r: () => number): void {
    this.level = level;
    this.K = LEVEL[level].K;
    this.blind = LEVEL[level].blind;
    this.picks = [];
    this.sym = 0;
    if (level === 2) {
      this.sym = [3, 4, 5, 6, 3][round % 5];
      this.spec = symmetricSpectrum(r, this.sym, this.K);
    } else if (level === 1 && round === 2) {
      this.spec = heart();
    } else this.spec = randomSpectrum(r, this.K);
  }

  prompt(): string {
    if (this.blind) return `À L’AVEUGLE · CHOISIS ${this.K} FRÉQUENCES POUR CETTE FIGURE (AUCUN APERÇU AVANT DE VALIDER)`;
    return `REDESSINE LA FIGURE AVEC ${this.K} CERCLES : CHOISIS LEURS FRÉQUENCES · ${this.picks.length}/${this.K}`;
  }

  controls(): string {
    return 'CLIC SUR UNE FRÉQUENCE : AJOUTER / RETIRER';
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    if (type !== 'down') return;
    const i = this.btn.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
    if (i < 0) return;
    const n = FREQS[i];
    const at = this.picks.indexOf(n);
    if (at >= 0) this.picks.splice(at, 1);
    else if (this.picks.length < this.K) this.picks.push(n);
    else this.flash = 0.6;
  }

  tick(dt: number): void {
    this.flash = Math.max(0, this.flash - dt);
  }

  submit(timeout: boolean): RoundResult {
    const best = bestSet(this.spec, this.K);
    const opt = captured(this.spec, best);
    const got = captured(this.spec, this.picks);
    const score = Math.round((100 * got) / opt);
    const err = Math.sqrt(1 - got);
    const errOpt = Math.sqrt(1 - opt);
    const sorted = (s: number[]) => [...s].sort((p, q) => p - q).join(', ');
    return {
      ok: score >= 80,
      score,
      detail: `énergie captée ${fr(got * 100, 1)} % (optimum ${fr(opt * 100, 1)} %) · erreur L² relative ${fr(err, 3)} vs ${fr(errOpt, 3)} · meilleures : ${sorted(best)}${timeout ? ' · au temps' : ''}`,
    };
  }

  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    const stripH = 46;
    const area = { x: box.x, y: box.y, w: box.w, h: box.h - stripH - 10 };
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    let rmax = 0;
    for (let k = 0; k < 256; k++) {
      const [x, y] = curveAt(this.spec, null, k / 256);
      rmax = Math.max(rmax, Math.hypot(x, y));
    }
    const R = (Math.min(area.w, area.h) * 0.42) / Math.max(1e-6, rmax);
    const P = (x: number, y: number): [number, number] => [cx + x * R, cy - y * R];
    const path = (S: number[] | null) => {
      g.beginPath();
      for (let k = 0; k <= 400; k++) {
        const [x, y] = curveAt(this.spec, S, k / 400);
        const [px, py] = P(x, y);
        if (k) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
    };
    g.save();
    g.lineWidth = 1;
    // target
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.setLineDash([5, 4]);
    path(null);
    g.stroke();
    g.setLineDash([]);
    const show = !this.blind || phase === 'reveal';
    if (show && this.picks.length) {
      // your curve, and its epicycles turning
      g.strokeStyle = '#fff';
      g.lineWidth = 1.6;
      path(this.picks);
      g.stroke();
      g.lineWidth = 1;
      const tt = (t * 0.1) % 1;
      const order = [...this.picks].sort((p, q) => amp2(this.spec.get(q)!) - amp2(this.spec.get(p)!));
      let x = 0;
      let y = 0;
      for (const n of order) {
        const [re, im] = this.spec.get(n)!;
        const a = 2 * Math.PI * n * tt;
        const nx = x + re * Math.cos(a) - im * Math.sin(a);
        const ny = y + re * Math.sin(a) + im * Math.cos(a);
        const [px, py] = P(x, y);
        g.strokeStyle = 'rgba(255,255,255,0.22)';
        g.beginPath();
        g.arc(px, py, Math.sqrt(amp2([re, im])) * R, 0, Math.PI * 2);
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(...P(nx, ny));
        g.stroke();
        x = nx;
        y = ny;
      }
      const [px, py] = P(x, y);
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(px, py, 3, 0, Math.PI * 2);
      g.fill();
    }
    if (phase === 'reveal') {
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.setLineDash([2, 3]);
      path(bestSet(this.spec, this.K));
      g.stroke();
      g.setLineDash([]);
    }
    // frequency strip: at the reveal, bar heights are the |c_n|
    const best = phase === 'reveal' ? bestSet(this.spec, this.K) : [];
    const amax = Math.max(...[...this.spec.values()].map((c) => Math.sqrt(amp2(c))));
    const bw = (box.w - 20) / FREQS.length;
    this.btn = FREQS.map((n, i) => ({ x: box.x + 10 + i * bw + 2, y: box.y + box.h - stripH, w: bw - 4, h: stripH - 4 }));
    g.font = '11px "JetBrains Mono", monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    FREQS.forEach((n, i) => {
      const b = this.btn[i];
      const on = this.picks.includes(n);
      if (phase === 'reveal') {
        const h = (Math.sqrt(amp2(this.spec.get(n)!)) / amax) * 60;
        g.fillStyle = best.includes(n) ? '#fff' : 'rgba(255,255,255,0.3)';
        g.fillRect(b.x + b.w * 0.25, b.y - 6 - h, b.w * 0.5, h);
      }
      g.fillStyle = on ? '#fff' : 'rgba(0,0,0,0.7)';
      g.fillRect(b.x, b.y, b.w, b.h);
      g.strokeStyle = this.flash > 0 && !on ? `rgba(255,255,255,${0.3 + this.flash})` : 'rgba(255,255,255,0.45)';
      g.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      g.fillStyle = on ? '#000' : '#fff';
      g.fillText(n > 0 ? `+${n}` : `−${-n}`, b.x + b.w / 2, b.y + b.h / 2);
    });
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillText(`CERCLES ${this.picks.length}/${this.K}${this.blind && phase === 'play' ? ' · APERÇU MASQUÉ' : ''}`, box.x + 14, box.y + 18);
    if (phase === 'reveal' && this.sym) g.fillText(`symétrie d’ordre ${this.sym} : seules les fréquences n ≡ 1 (mod ${this.sym}) existent`, box.x + 14, box.y + 36);
    g.restore();
  }
}

export const FOURIER: GameDef = {
  id: 'fourier-painter',
  title: 'Peintre de Fourier',
  subtitle: 'Redessiner une figure avec un nombre limité de cercles.',
  module: 'principles',
  view: 'principles/fourier',
  minutes: 8,
  brief:
    'Toute courbe fermée est une somme de cercles qui tournent, un par fréquence. Tu n’as droit qu’à quelques cercles : choisis les fréquences qui redessinent le mieux la figure en pointillés. Au niveau 3, plus d’aperçu : lis les fréquences dans la symétrie de la figure.',
  rules: [
    'Clique les fréquences (de −10 à +10) : ta courbe et ses cercles s’affichent en direct (sauf au niveau 3).',
    'Score = énergie captée / meilleure énergie possible avec autant de cercles (égalité de Parseval). Réussi à partir de 80.',
    'À la fin de la manche : la meilleure courbe en pointillés et le spectre complet (hauteur = |cₙ|).',
  ],
  levels: [
    { title: 'Trois cercles', brief: 'trois fréquences dominantes', rounds: 5, time: 40 },
    { title: 'Cinq cercles', brief: 'dont un cœur, calculé par transformée de Fourier', rounds: 5, time: 50 },
    { title: 'À l’aveugle', brief: 'symétries d’ordre 3 à 6, quatre cercles, sans aperçu', rounds: 5, time: 45 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Meilleure approximation et égalité de Parseval',
    body: 'Une courbe fermée $\\gamma : [0, 1] \\to \\mathbb{C}$ de carré intégrable s’écrit $\\gamma(t) = \\sum_n c_n e^{2i\\pi n t}$ avec $c_n = \\int_0^1 \\gamma(t)\\, e^{-2i\\pi n t}\\, dt$ (convergence dans $L^2$). Pour un ensemble de fréquences $S$, la somme $\\gamma_S = \\sum_{n \\in S} c_n e^{2i\\pi n t}$ est la projection orthogonale de $\\gamma$ : c’est **la meilleure** courbe à fréquences dans $S$, et $$\\int_0^1 |\\gamma - \\gamma_S|^2 = \\sum_{n \\notin S} |c_n|^2 \\quad \\text{(Parseval)}.$$ Avec $K$ cercles, le meilleur choix est donc celui des $K$ plus grands $|c_n|$. **Symétrie** : si $\\gamma(t + \\tfrac1k) = e^{2i\\pi/k}\\,\\gamma(t)$, alors $c_n = 0$ sauf si $n \\equiv 1 \\pmod k$.',
  },
  references: ['Y. Katznelson, An Introduction to Harmonic Analysis (Cambridge)', 'J.-P. Kahane, P.-G. Lemarié-Rieusset, Séries de Fourier et ondelettes (Cassini)'],
  make: () => new FourierPainter(),
};

export type FourierLogic = FourierPainter;
