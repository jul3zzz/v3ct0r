/** The six regular convex 4-polytopes: vertices (circumradius 1) and edges. */

export type PolytopeId = '5cell' | '8cell' | '16cell' | '24cell' | '120cell' | '600cell';

export interface PolytopeInfo {
  id: PolytopeId;
  name: string;
  alias: string;
  schlafli: string;
  counts: { v: number; e: number; f: number; c: number };
  cell: string;
}

export interface Polytope extends PolytopeInfo {
  vertices: Float64Array; // 4 * V
  edges: Uint32Array; // 2 * E
}

const PHI = (1 + Math.sqrt(5)) / 2;

export const POLYTOPES: PolytopeInfo[] = [
  { id: '5cell', name: '5-CELL', alias: 'pentachore · simplexe', schlafli: '{3,3,3}', counts: { v: 5, e: 10, f: 10, c: 5 }, cell: 'tétraèdre' },
  { id: '8cell', name: 'TESSERACT', alias: '8-cell · hypercube', schlafli: '{4,3,3}', counts: { v: 16, e: 32, f: 24, c: 8 }, cell: 'cube' },
  { id: '16cell', name: '16-CELL', alias: 'hexadécachore · orthoplexe', schlafli: '{3,3,4}', counts: { v: 8, e: 24, f: 32, c: 16 }, cell: 'tétraèdre' },
  { id: '24cell', name: '24-CELL', alias: 'icositétrachore', schlafli: '{3,4,3}', counts: { v: 24, e: 96, f: 96, c: 24 }, cell: 'octaèdre' },
  { id: '120cell', name: '120-CELL', alias: 'hécatonicosachore', schlafli: '{5,3,3}', counts: { v: 600, e: 1200, f: 720, c: 120 }, cell: 'dodécaèdre' },
  { id: '600cell', name: '600-CELL', alias: 'hexacosichore', schlafli: '{3,3,5}', counts: { v: 120, e: 720, f: 1200, c: 600 }, cell: 'tétraèdre' },
];

function permutations(n: number): { p: number[]; even: boolean }[] {
  const out: { p: number[]; even: boolean }[] = [];
  const rec = (arr: number[], k: number, parity: boolean) => {
    if (k === n) {
      out.push({ p: arr.slice(), even: parity });
      return;
    }
    for (let i = k; i < n; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      rec(arr, k + 1, i === k ? parity : !parity);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  rec(Array.from({ length: n }, (_, i) => i), 0, true);
  return out;
}

const PERMS = permutations(4);

/** All sign changes and (even or all) permutations of a coordinate pattern, deduplicated. */
function expand(patterns: { v: number[]; even?: boolean }[]): number[][] {
  const seen = new Set<string>();
  const out: number[][] = [];
  for (const pat of patterns) {
    for (const { p, even } of PERMS) {
      if (pat.even && !even) continue;
      const base = p.map((k) => pat.v[k]);
      for (let s = 0; s < 16; s++) {
        const v = base.map((x, i) => (s & (1 << i) ? -x : x));
        if (base.some((x, i) => x === 0 && s & (1 << i))) continue;
        const key = v.map((x) => x.toFixed(6)).join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v);
      }
    }
  }
  return out;
}

function simplex(): number[][] {
  // 5 basis vectors of R^5 centered, expressed in an orthonormal basis of the hyperplane Σx = 0
  const pts = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => (i === j ? 1 : 0) - 0.2));
  const basis: number[][] = [];
  for (let k = 0; k < 5 && basis.length < 4; k++) {
    let v = pts[k].slice();
    for (const b of basis) {
      const d = v.reduce((s, x, i) => s + x * b[i], 0);
      v = v.map((x, i) => x - d * b[i]);
    }
    const n = Math.hypot(...v);
    if (n > 1e-9) basis.push(v.map((x) => x / n));
  }
  return pts.map((p) => basis.map((b) => p.reduce((s, x, i) => s + x * b[i], 0)));
}

function rawVertices(id: PolytopeId): number[][] {
  switch (id) {
    case '5cell':
      return simplex();
    case '8cell':
      return expand([{ v: [1, 1, 1, 1] }]);
    case '16cell':
      return expand([{ v: [1, 0, 0, 0] }]);
    case '24cell':
      return expand([{ v: [1, 1, 0, 0] }]);
    case '600cell':
      return expand([{ v: [0.5, 0.5, 0.5, 0.5] }, { v: [1, 0, 0, 0] }, { v: [PHI / 2, 0.5, 1 / (2 * PHI), 0], even: true }]);
    case '120cell': {
      const s5 = Math.sqrt(5);
      const p2 = PHI * PHI;
      const pm1 = 1 / PHI;
      const pm2 = 1 / p2;
      return expand([
        { v: [0, 0, 2, 2] },
        { v: [1, 1, 1, s5] },
        { v: [pm2, PHI, PHI, PHI] },
        { v: [pm1, pm1, pm1, p2] },
        { v: [0, pm2, 1, p2], even: true },
        { v: [0, pm1, PHI, s5], even: true },
        { v: [pm1, 1, PHI, 2], even: true },
      ]);
    }
  }
}

const cache = new Map<PolytopeId, Polytope>();

export function polytope(id: PolytopeId): Polytope {
  const hit = cache.get(id);
  if (hit) return hit;
  const info = POLYTOPES.find((p) => p.id === id)!;
  const raw = rawVertices(id);
  const r = Math.hypot(...raw[0]);
  const V = raw.length;
  const vertices = new Float64Array(V * 4);
  raw.forEach((p, i) => p.forEach((x, k) => (vertices[i * 4 + k] = x / r)));
  // edges = pairs at minimal distance
  let dmin = Infinity;
  for (let j = 1; j < V; j++) {
    let d = 0;
    for (let k = 0; k < 4; k++) d += (vertices[k] - vertices[j * 4 + k]) ** 2;
    if (d > 1e-9 && d < dmin) dmin = d;
  }
  const edges: number[] = [];
  for (let i = 0; i < V; i++)
    for (let j = i + 1; j < V; j++) {
      let d = 0;
      for (let k = 0; k < 4; k++) d += (vertices[i * 4 + k] - vertices[j * 4 + k]) ** 2;
      if (Math.abs(d - dmin) < 1e-6) edges.push(i, j);
    }
  const p: Polytope = { ...info, vertices, edges: new Uint32Array(edges) };
  cache.set(id, p);
  return p;
}
