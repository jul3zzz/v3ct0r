// PILOTE 4D: bring a tesseract onto a target silhouette by turning it in the planes of ℝ⁴ that
// contain the 4th axis (XW, YW, ZW), with held keys. One plane at level 1, two at level 2, three
// at level 3 — where the order of the turns matters: rotations of ℝ⁴ do not commute.
import { fr, type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey } from './types';

export type M4 = number[]; // 4×4, row-major
export type Plane = [number, number];

export const PLANES: Record<string, Plane> = { XW: [0, 3], YW: [1, 3], ZW: [2, 3], XY: [0, 1], XZ: [0, 2], YZ: [1, 2] };
export const ID4: M4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function mul4(a: M4, b: M4): M4 {
  const o = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
  return o;
}

/** rotation by θ in the plane (i, j) */
export function rot4([i, j]: Plane, t: number): M4 {
  const m = [...ID4];
  const c = Math.cos(t);
  const s = Math.sin(t);
  m[i * 4 + i] = c;
  m[j * 4 + j] = c;
  m[i * 4 + j] = -s;
  m[j * 4 + i] = s;
  return m;
}

/** the 16 vertices (±1)⁴ and the 32 edges (vertices differing in one coordinate) */
export const VERTS: number[][] = Array.from({ length: 16 }, (_, k) => [0, 1, 2, 3].map((b) => ((k >> b) & 1 ? 1 : -1)));
export const EDGES: [number, number][] = [];
for (let a = 0; a < 16; a++) for (let b = a + 1; b < 16; b++) if ([0, 1, 2, 3].filter((k) => VERTS[a][k] !== VERTS[b][k]).length === 1) EDGES.push([a, b]);

/** 4D → 3D perspective (eye on the w axis), then a fixed oblique view → 2D */
export function project(m: M4): [number, number][] {
  const cy = Math.cos(0.62);
  const sy = Math.sin(0.62);
  const cx = Math.cos(0.38);
  const sx = Math.sin(0.38);
  return VERTS.map((v) => {
    const p = [0, 1, 2, 3].map((i) => m[i * 4] * v[0] + m[i * 4 + 1] * v[1] + m[i * 4 + 2] * v[2] + m[i * 4 + 3] * v[3]);
    const s = 3 / (3 - p[3] * 0.9);
    let [x, y, z] = [p[0] * s, p[1] * s, p[2] * s];
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];
    [y, z] = [y * cx - z * sx, y * sx + z * cx];
    return [x, y] as [number, number];
  });
}

/** distance between two silhouettes, as vertex sets (symmetric Chamfer, relative to the size):
 *  a symmetry of the tesseract that permutes the vertices counts as the same picture */
export function silhouetteGap(p: [number, number][], q: [number, number][]): number {
  const near = (a: [number, number][], b: [number, number][]) => a.reduce((s, [x, y]) => s + Math.min(...b.map(([u, v]) => Math.hypot(x - u, y - v))), 0) / a.length;
  return (near(p, q) + near(q, p)) / 2 / 4;
}

const LEVEL_PLANES = [['XW'], ['XW', 'YW'], ['XW', 'YW', 'ZW']];
/** keys per plane: physical positions (Q/D, Z/S, A/E in AZERTY = A/D, W/S, Q/E in QWERTY) */
const KEYS: Record<string, [string, string]> = { XW: ['KeyA', 'KeyD'], YW: ['KeyW', 'KeyS'], ZW: ['KeyQ', 'KeyE'] };
const KEY_LABEL: Record<string, string> = { XW: 'Q/D', YW: 'Z/S', ZW: 'A/E' };

class Pilot4D implements GameLogic {
  m: M4 = [...ID4];
  target: M4 = [...ID4];
  private planes: string[] = ['XW'];
  private held = new Set<string>();
  private fine = false;
  private lockT = 0;
  private done: RoundResult | null = null;
  private returned = false;
  private targetPts: [number, number][] = [];

  start(level: number, _round: number, r: () => number): void {
    this.planes = LEVEL_PLANES[level];
    this.m = [...ID4];
    this.held.clear();
    this.done = null;
    this.returned = false;
    this.lockT = 0;
    // a target away from the start and from the quarter turns (that map the tesseract onto itself)
    for (let k = 0; k < 200; k++) {
      let t = [...ID4];
      for (const p of this.planes) {
        const q = Math.floor(r() * 4) * (Math.PI / 2);
        const a = q + 0.35 + r() * (Math.PI / 2 - 0.7);
        t = mul4(rot4(PLANES[p], a * (r() < 0.5 ? -1 : 1)), t);
      }
      this.target = t;
      this.targetPts = project(t);
      if (silhouetteGap(project(ID4), this.targetPts) > 0.12) break;
    }
  }

  gap(): number {
    return silhouetteGap(project(this.m), this.targetPts);
  }

  prompt(): string {
    return `AMÈNE LE TESSERACT SUR LA SILHOUETTE EN POINTILLÉS · PLANS : ${this.planes.map((p) => `${p} (${KEY_LABEL[p]})`).join(' · ')}`;
  }

  controls(): string {
    return `${this.planes.map((p) => `${KEY_LABEL[p]} : ${p}`).join(' · ')} · MAJ : PRÉCISION · LE VERROU SE FAIT TOUT SEUL SOUS 1 %`;
  }

  touchControls(): string {
    return 'MAINTIENS − / + D’UN PLAN POUR TOURNER · PRÉCIS : LENTEMENT · LE VERROU SE FAIT TOUT SEUL SOUS 1 %';
  }

  /** one button per sense of rotation of each active plane, held like its key, and PRÉCIS for Maj */
  touchKeys(): TouchKey[] {
    return [
      ...this.planes.flatMap((p) => [
        { label: `${p} −`, title: `Plan ${p}, sens −`, key: '', code: KEYS[p][0], hold: true },
        { label: `${p} +`, title: `Plan ${p}, sens +`, key: '', code: KEYS[p][1], hold: true },
      ]),
      { label: 'PRÉCIS', title: 'Rotation lente (Maj)', key: 'Shift', code: 'ShiftLeft', hold: true },
    ];
  }

  key(e: KeyboardEvent): boolean {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.fine = true;
      return true;
    }
    for (const p of this.planes)
      if (KEYS[p].includes(e.code)) {
        this.held.add(e.code);
        return true;
      }
    return false;
  }

  keyUp(e: KeyboardEvent | null): void {
    if (!e) {
      this.held.clear();
      this.fine = false;
      return;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.fine = false;
    this.held.delete(e.code);
  }

  tick(dt: number): void {
    const w = (this.fine ? 0.25 : 1) * 0.9 * dt;
    for (const p of this.planes) {
      const [neg, pos] = KEYS[p];
      const d = (this.held.has(pos) ? 1 : 0) - (this.held.has(neg) ? 1 : 0);
      if (d) this.m = mul4(rot4(PLANES[p], d * w), this.m);
    }
    if (this.gap() < 0.01) this.lockT += dt;
    else this.lockT = 0;
    if (this.lockT > 0.35 && !this.done) this.done = { ok: true, score: 100, detail: `silhouettes confondues · écart ${fr(this.gap() * 100, 2)} %` };
  }

  poll(): RoundResult | null {
    if (this.done && !this.returned) {
      this.returned = true;
      return this.done;
    }
    return null;
  }

  submit(timeout: boolean): RoundResult {
    const g = this.gap();
    const ok = g < 0.04;
    this.returned = true;
    return { ok, score: ok ? Math.round(50 + 50 * (1 - g / 0.04)) : 0, detail: `écart ${fr(g * 100, 2)} % (réussi sous 4 %, verrou automatique sous 1 %)${timeout ? ' · au temps' : ''}` };
  }

  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2 + 10;
    const S = Math.min(box.w, box.h) * 0.16;
    const P = ([x, y]: [number, number]): [number, number] => [cx + x * S, cy - y * S];
    const edges = (pts: [number, number][], a: number, dash: number[], w = 1) => {
      g.strokeStyle = `rgba(255,255,255,${a})`;
      g.lineWidth = w;
      g.setLineDash(dash);
      g.beginPath();
      for (const [i, j] of EDGES) {
        g.moveTo(...P(pts[i]));
        g.lineTo(...P(pts[j]));
      }
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 1;
    };
    g.save();
    edges(this.targetPts, 0.45, [5, 4]);
    const cur = project(this.m);
    edges(cur, 1, [], 1.4);
    g.fillStyle = '#fff';
    for (const p of cur) {
      const [x, y] = P(p);
      g.fillRect(x - 2, y - 2, 4, 4);
    }
    if (phase === 'reveal') edges(project(this.target), 0.8, [2, 3]);
    // gap gauge
    const gap = this.gap();
    const bx = box.x + 16;
    const by = box.y + 16;
    g.font = '11px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillStyle = '#fff';
    g.fillText(`ÉCART ${fr(gap * 100, 2)} %${gap < 0.04 ? '  ◆ DANS LA CIBLE' : ''}`, bx, by + 4);
    g.strokeStyle = 'rgba(255,255,255,0.4)';
    g.strokeRect(bx + 0.5, by + 14.5, 200, 6);
    g.fillRect(bx + 1, by + 15, 199 * Math.max(0, Math.min(1, 1 - gap / 0.3)), 5);
    // held planes
    this.planes.forEach((p, i) => {
      const [neg, pos] = KEYS[p];
      const on = this.held.has(neg) || this.held.has(pos);
      g.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.5)';
      g.fillText(`${on ? '▸' : '·'} ${p}  ${KEY_LABEL[p]}`, bx, by + 40 + i * 16);
    });
    if (this.lockT > 0) {
      g.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 20)})`;
      g.strokeRect(box.x + 4.5, box.y + 4.5, box.w - 9, box.h - 9);
    }
    g.restore();
  }
}

export const PILOT4D: GameDef = {
  id: 'pilot-4d',
  title: 'Pilote 4D',
  subtitle: 'Tourner un hypercube dans les plans de ℝ⁴.',
  module: '4d',
  view: '4d/polytopes',
  minutes: 8,
  brief:
    'En dimension 4, on ne tourne pas autour d’un axe mais dans un plan. Amène le tesseract sur la silhouette en pointillés en le faisant tourner dans les plans XW, YW et ZW, touches maintenues. Au niveau 3, l’ordre des rotations compte : elles ne commutent pas.',
  rules: [
    'Touches maintenues : Q/D tourne dans le plan XW, Z/S dans YW, A/E dans ZW (W/A/S/D/Q/E en QWERTY, mêmes positions). Maj : rotation lente, pour la précision.',
    'Sous 1 % d’écart, la silhouette se verrouille toute seule (100 points). ⏎ valide plus tôt : réussi sous 4 %.',
    'L’écart compare les ensembles de sommets : une symétrie du tesseract qui les permute donne la même image et compte comme juste.',
  ],
  touchRules: [
    'Maintiens XW − ou XW + pour tourner dans le plan XW, de même YW et ZW aux niveaux suivants. PRÉCIS, maintenu d’un autre doigt : rotation lente, pour la précision.',
    'Sous 1 % d’écart, la silhouette se verrouille toute seule (100 points). ✓ VALIDER valide plus tôt : réussi sous 4 %.',
    'L’écart compare les ensembles de sommets : une symétrie du tesseract qui les permute donne la même image et compte comme juste.',
  ],
  levels: [
    { title: 'Un plan', brief: 'XW seulement', rounds: 5, time: 30 },
    { title: 'Deux plans', brief: 'XW et YW', rounds: 5, time: 45 },
    { title: 'Trois plans', brief: 'XW, YW, ZW : l’ordre compte', rounds: 5, time: 60 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Rotations de ℝ⁴',
    body: 'Une rotation de $\\mathbb{R}^4$ agit dans des **plans** : il y a $\\binom{4}{2} = 6$ plans de coordonnées ($XY, XZ, XW, YZ, YW, ZW$) et le groupe $SO(4)$ est de dimension $6$. Deux rotations dans des plans qui partagent un axe ne commutent pas en général (par exemple $XW$ puis $YW$ diffère de $YW$ puis $XW$), alors que deux rotations dans des plans orthogonaux ($XY$ et $ZW$) commutent. **Forme normale** : toute rotation de $\\mathbb{R}^4$ s’écrit, dans une base orthonormée adaptée, $$\\begin{pmatrix} R(\\theta_1) & 0 \\\\ 0 & R(\\theta_2) \\end{pmatrix}, \\qquad R(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix},$$ c’est-à-dire deux rotations simultanées dans deux plans orthogonaux.',
  },
  references: ['H. S. M. Coxeter, Regular Polytopes (Dover), chap. 7 et 12', 'M. Audin, Géométrie (EDP Sciences), isométries de l’espace euclidien'],
  make: () => new Pilot4D(),
};

export type Pilot4DLogic = Pilot4D;
