// CHASSEUR DE DIRECTIONS PROPRES: a 2 × 2 matrix deforms the plane. Turn the probe v with the
// mouse, watch Av, and lock the directions where Av stays on the line of v. Traps at level 3:
// a shear has a single direction, a rotation none, a homothety all of them.
import { fr, type Box, type GameDef, type GameLogic, type RoundResult } from './types';

export interface Mat2 {
  a: number;
  b: number;
  c: number;
  d: number;
}

export type EigenKind = 'two' | 'one' | 'none' | 'all';

const TOL = (6 * Math.PI) / 180;

/** angle of a line through the origin, in [0, π) */
const lineAngle = (x: number, y: number): number => {
  let t = Math.atan2(y, x);
  if (t < 0) t += Math.PI;
  if (t >= Math.PI) t -= Math.PI;
  return t;
};

/** distance between two line angles (mod π) */
export const lineGap = (p: number, q: number): number => {
  const d = Math.abs(p - q) % Math.PI;
  return Math.min(d, Math.PI - d);
};

/** real eigen directions of A (exact, from the characteristic polynomial) */
export function eigenDirs(m: Mat2): { kind: EigenKind; dirs: number[]; lambdas: number[] } {
  const { a, b, c, d } = m;
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 && Math.abs(a - d) < 1e-12) return { kind: 'all', dirs: [], lambdas: [a] };
  const dirOf = (l: number): number => (Math.abs(b) > 1e-12 ? lineAngle(b, l - a) : Math.abs(c) > 1e-12 ? lineAngle(l - d, c) : Math.abs(l - a) < 1e-12 ? 0 : Math.PI / 2);
  if (disc > 1e-9) {
    const s = Math.sqrt(disc);
    const ls = [(tr + s) / 2, (tr - s) / 2];
    return { kind: 'two', dirs: ls.map(dirOf), lambdas: ls };
  }
  if (disc >= -1e-9) return { kind: 'one', dirs: [dirOf(tr / 2)], lambdas: [tr / 2] };
  return { kind: 'none', dirs: [], lambdas: [tr / 2, Math.sqrt(-disc) / 2] };
}

/** a matrix of a given kind (integers, readable, |λ| ≤ 4) */
export function makeMatrix(kind: EigenKind | 'sym', r: () => number): Mat2 {
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const nz = (lo: number, hi: number) => {
    let v = 0;
    while (v === 0) v = int(lo, hi);
    return v;
  };
  for (let k = 0; k < 500; k++) {
    let m: Mat2;
    if (kind === 'sym') {
      const b = nz(-2, 2);
      m = { a: int(-2, 3), b, c: b, d: int(-2, 3) };
    } else if (kind === 'two') m = { a: int(-3, 3), b: nz(-3, 3), c: int(-3, 3), d: int(-3, 3) };
    else if (kind === 'one') {
      const l = nz(-2, 3);
      m = r() < 0.5 ? { a: l, b: nz(-2, 2), c: 0, d: l } : { a: l, b: 0, c: nz(-2, 2), d: l };
    } else if (kind === 'none') {
      const p = int(-2, 2);
      const q = nz(1, 3);
      m = { a: p, b: -q, c: q, d: p };
      if (r() < 0.5) m = { a: p + 1, b: -q - 1, c: q, d: p };
    } else {
      const l = nz(-2, 3);
      m = { a: l, b: 0, c: 0, d: l };
    }
    const e = eigenDirs(m);
    const want = kind === 'sym' ? 'two' : kind;
    if (e.kind !== want) continue;
    if (e.lambdas.some((l) => Math.abs(l) > 4 || (e.kind !== 'none' && Math.abs(l) < 0.3))) continue;
    if (e.kind === 'two' && lineGap(e.dirs[0], e.dirs[1]) < (18 * Math.PI) / 180) continue;
    if (e.kind === 'two' && e.dirs.some((t) => lineGap(t, 0) < 0.05 || lineGap(t, Math.PI / 2) < 0.05) && kind !== 'sym') continue;
    return m;
  }
  return { a: 2, b: 1, c: 1, d: 2 };
}

/** judge an answer: locked line angles, or a claim that there are none / all of them */
export function judge(m: Mat2, locks: number[], claim: 'none' | 'all' | null): RoundResult {
  const e = eigenDirs(m);
  const said: EigenKind | null = claim ?? (locks.length === 2 ? 'two' : locks.length === 1 ? 'one' : null);
  const truth =
    e.kind === 'two'
      ? `2 directions propres (λ = ${fr(e.lambdas[0], 2)} ; ${fr(e.lambdas[1], 2)})`
      : e.kind === 'one'
        ? `1 seule direction propre (λ = ${fr(e.lambdas[0], 2)} double, A ≠ λI)`
        : e.kind === 'none'
          ? `aucune direction réelle (λ = ${fr(e.lambdas[0], 2)} ± ${fr(e.lambdas[1], 2)} i)`
          : `toutes les directions (A = ${fr(e.lambdas[0], 0)} I)`;
  if (!said) return { ok: false, score: 0, detail: `PAS DE RÉPONSE · il y avait ${truth}` };
  if (said !== e.kind) return { ok: false, score: 0, detail: `IL Y AVAIT ${truth}` };
  if (said === 'none' || said === 'all') return { ok: true, score: 100, detail: truth };
  // match locks to true directions (1 or 2 of them: try both pairings)
  const pairs = e.dirs.length === 2 ? [[0, 1], [1, 0]] : [[0]];
  let best = Infinity;
  for (const p of pairs) best = Math.min(best, Math.max(...p.map((j, i) => lineGap(locks[i], e.dirs[j]))));
  const errs = e.dirs.length === 2 ? [0, 1].map((i) => Math.min(...e.dirs.map((t) => lineGap(locks[i], t)))) : [lineGap(locks[0], e.dirs[0])];
  const deg = (x: number) => fr((x * 180) / Math.PI, 1);
  if (best > TOL) return { ok: false, score: 0, detail: `ÉCART ${deg(best)}° > 6° · ${truth}` };
  const precision = errs.reduce((s, x) => s + Math.max(0, 1 - x / TOL), 0) / errs.length;
  return { ok: true, score: Math.round(40 + 60 * precision), detail: `écart max ${deg(best)}° · ${truth}` };
}

const LEVEL_KINDS: (EigenKind | 'sym')[][] = [
  ['sym', 'sym', 'sym', 'sym', 'sym'],
  ['two', 'two', 'two', 'two', 'two'],
  ['two', 'none', 'one', 'all', 'none'],
];

class EigenHunt implements GameLogic {
  m: Mat2 = { a: 2, b: 1, c: 1, d: 2 };
  locks: number[] = [];
  claim: 'none' | 'all' | null = null;
  private theta = 0.6;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private R = 100;

  start(level: number, round: number, r: () => number): void {
    const kinds = [...LEVEL_KINDS[level]];
    // level 3: shuffle the traps
    if (level === 2) kinds.sort(() => r() - 0.5);
    this.m = makeMatrix(kinds[round % kinds.length], r);
    this.locks = [];
    this.claim = null;
    this.theta = r() * Math.PI;
  }

  prompt(): string {
    const { a, b, c, d } = this.m;
    return `A = ( ${fr(a, 0)}  ${fr(b, 0)} ; ${fr(c, 0)}  ${fr(d, 0)} ) · VERROUILLE LES DIRECTIONS OÙ Av RESTE SUR LA DROITE DE v`;
  }

  controls(): string {
    return 'SOURIS : ORIENTER v · CLIC : VERROUILLER / RETIRER · N : AUCUNE · T : TOUTES';
  }

  private apply(x: number, y: number): [number, number] {
    return [this.m.a * x + this.m.b * y, this.m.c * x + this.m.d * y];
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    const cx = this.box.x + this.box.w / 2;
    const cy = this.box.y + this.box.h / 2;
    if (type === 'move' || type === 'down') this.theta = Math.atan2(cy - y, x - cx);
    if (type !== 'down') return;
    const t = lineAngle(Math.cos(this.theta), Math.sin(this.theta));
    const near = this.locks.findIndex((l) => lineGap(l, t) < (5 * Math.PI) / 180);
    this.claim = null;
    if (near >= 0) this.locks.splice(near, 1);
    else {
      this.locks.push(t);
      if (this.locks.length > 2) this.locks.shift();
    }
  }

  key(e: KeyboardEvent): boolean {
    const k = e.key.toLowerCase();
    if (k === 'n' || k === 't') {
      const c = k === 'n' ? 'none' : 'all';
      this.claim = this.claim === c ? null : c;
      if (this.claim) this.locks = [];
      return true;
    }
    if (k === 'arrowleft' || k === 'arrowright') {
      this.theta += (k === 'arrowleft' ? 1 : -1) * 0.004;
      return true;
    }
    return false;
  }

  submit(): RoundResult {
    return judge(this.m, this.locks, this.claim);
  }

  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    // scale: the image of the unit circle must fit
    let smax = 1;
    for (let k = 0; k < 64; k++) {
      const [x, y] = this.apply(Math.cos((k / 64) * Math.PI * 2), Math.sin((k / 64) * Math.PI * 2));
      smax = Math.max(smax, Math.hypot(x, y));
    }
    const R = (this.R = (Math.min(box.w, box.h) * 0.44) / smax);
    const P = (x: number, y: number): [number, number] => [cx + x * R, cy - y * R];
    g.save();
    g.beginPath();
    g.rect(box.x, box.y, box.w, box.h);
    g.clip();
    g.lineWidth = 1;
    // deformed grid
    g.strokeStyle = 'rgba(255,255,255,0.07)';
    g.beginPath();
    for (let k = -6; k <= 6; k++) {
      for (const [ux, uy, vx, vy] of [
        [k / 2, -3, k / 2, 3],
        [-3, k / 2, 3, k / 2],
      ]) {
        const [x1, y1] = this.apply(ux, uy);
        const [x2, y2] = this.apply(vx, vy);
        g.moveTo(...P(x1, y1));
        g.lineTo(...P(x2, y2));
      }
    }
    g.stroke();
    // unit circle and its image
    g.strokeStyle = 'rgba(255,255,255,0.3)';
    g.setLineDash([4, 4]);
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.beginPath();
    for (let k = 0; k <= 128; k++) {
      const [x, y] = this.apply(Math.cos((k / 128) * Math.PI * 2), Math.sin((k / 128) * Math.PI * 2));
      const [px, py] = P(x, y);
      if (k) g.lineTo(px, py);
      else g.moveTo(px, py);
    }
    g.stroke();
    // locked lines
    const line = (ang: number, a: number, dash: number[], label?: string) => {
      const dx = Math.cos(ang) * Math.max(box.w, box.h);
      const dy = Math.sin(ang) * Math.max(box.w, box.h);
      g.strokeStyle = `rgba(255,255,255,${a})`;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(cx - dx, cy + dy);
      g.lineTo(cx + dx, cy - dy);
      g.stroke();
      g.setLineDash([]);
      if (label) {
        g.fillStyle = '#fff';
        g.font = '11px "JetBrains Mono", monospace';
        g.textAlign = 'left';
        g.fillText(label, cx + Math.cos(ang) * R * 1.15 + 6, cy - Math.sin(ang) * R * 1.15 - 6);
      }
    };
    for (const l of this.locks) line(l, 0.9, [6, 4], 'verrou');
    if (phase === 'reveal') {
      const e = eigenDirs(this.m);
      e.dirs.forEach((d, i) => line(d, 1, [], `λ = ${fr(e.lambdas[i], 2)}`));
      if (e.kind === 'all') for (let k = 0; k < 12; k++) line((k / 12) * Math.PI, 0.35, []);
    }
    // probe v and its image Av
    const v: [number, number] = [Math.cos(this.theta), Math.sin(this.theta)];
    const av = this.apply(...v);
    const arrow = (x: number, y: number, a: number, w: number, label: string) => {
      const [px, py] = P(x, y);
      g.strokeStyle = `rgba(255,255,255,${a})`;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(px, py);
      const ang = Math.atan2(py - cy, px - cx);
      g.lineTo(px - 10 * Math.cos(ang - 0.4), py - 10 * Math.sin(ang - 0.4));
      g.moveTo(px, py);
      g.lineTo(px - 10 * Math.cos(ang + 0.4), py - 10 * Math.sin(ang + 0.4));
      g.stroke();
      g.lineWidth = 1;
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.font = '12px "JetBrains Mono", monospace';
      g.textAlign = 'center';
      g.fillText(label, px + 14 * Math.cos(ang), py + 14 * Math.sin(ang));
    };
    arrow(...v, 0.8, 1.5, 'v');
    arrow(...av, 1, 2.5, 'Av');
    // angle between the line of v and Av
    const gap = lineGap(lineAngle(...v), lineAngle(...av));
    const aligned = gap < (2 * Math.PI) / 180;
    g.fillStyle = aligned ? '#fff' : 'rgba(255,255,255,0.7)';
    g.font = '12px "JetBrains Mono", monospace';
    g.textAlign = 'left';
    g.fillText(`∠(v, Av) mod 180° = ${fr((gap * 180) / Math.PI, 1)}°${aligned ? '  ◆ ALIGNÉS' : ''}`, box.x + 16, box.y + 20);
    g.fillText(`|Av| / |v| = ${fr(Math.hypot(...av), 2)}`, box.x + 16, box.y + 38);
    if (this.claim) {
      g.font = '14px Michroma, sans-serif';
      g.textAlign = 'center';
      g.fillStyle = `rgba(255,255,255,${0.7 + 0.3 * Math.sin(t * 5)})`;
      g.fillText(this.claim === 'none' ? 'RÉPONSE : AUCUNE DIRECTION PROPRE' : 'RÉPONSE : TOUTES LES DIRECTIONS', cx, box.y + box.h - 24);
    }
    g.restore();
  }
}

export const EIGEN: GameDef = {
  id: 'eigen-hunt',
  title: 'Chasseur de directions propres',
  subtitle: 'Où une application linéaire ne fait que dilater.',
  module: 'principles',
  view: 'principles/linear',
  course: 'reduction',
  minutes: 8,
  brief:
    'Une matrice déforme le plan. Oriente la sonde v à la souris : son image Av tourne et s’étire. Là où Av retombe sur la droite de v, tu tiens une direction propre. Verrouille-les toutes, au degré près. Attention : certaines matrices n’en ont qu’une, d’autres aucune, d’autres toutes.',
  rules: [
    'Clic : verrouiller la direction de v (re-clic dessus : la retirer). Deux verrous au plus.',
    'N : déclarer qu’il n’y a aucune direction propre réelle. T : déclarer que toutes les directions le sont.',
    'Réussi si le nombre de directions est juste et chaque verrou à moins de 6° ; le score monte avec la précision.',
  ],
  levels: [
    { title: 'Matrices symétriques', brief: 'deux directions, orthogonales', rounds: 5, time: 30 },
    { title: 'Matrices quelconques', brief: 'deux directions, obliques, λ négatives', rounds: 5, time: 30 },
    { title: 'Pièges', brief: 'une, aucune, toutes, ou deux', rounds: 5, time: 30 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Directions propres d’une matrice réelle 2 × 2',
    body: '$v \\ne 0$ est un vecteur propre de $A$ si $Av = \\lambda v$ : $v$ et $Av$ sont colinéaires. Les valeurs propres sont les racines de $$\\chi_A(\\lambda) = \\lambda^2 - \\operatorname{tr}(A)\\,\\lambda + \\det A,\\qquad \\Delta = \\operatorname{tr}(A)^2 - 4\\det A.$$\n- $\\Delta > 0$ : deux valeurs propres réelles distinctes, **deux directions propres** ;\n- $\\Delta = 0$ : une valeur propre double $\\lambda$ ; **une seule direction** si $A \\ne \\lambda I$ (cisaillement), **toutes** si $A = \\lambda I$ ;\n- $\\Delta < 0$ : valeurs propres complexes conjuguées, **aucune direction propre réelle**.\n\nSi $A$ est symétrique, $\\Delta = (a - d)^2 + 4b^2 \\ge 0$ et ses directions propres sont orthogonales (théorème spectral).',
  },
  references: ['X. Gourdon, Les maths en tête — Algèbre (Ellipses), réduction des endomorphismes', 'S. Axler, Linear Algebra Done Right, chap. 5 et 7'],
  make: () => new EigenHunt(),
};

export type EigenLogic = EigenHunt;
