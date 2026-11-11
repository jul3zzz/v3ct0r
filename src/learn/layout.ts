// Deterministic 3D layout of the LEARN graph. Each course is a cluster: the course at its centre,
// its chapters around it, their statements beyond, inside a ball of radius R (grows with the
// number of nodes). Clusters are placed by a small force simulation: they push each other apart,
// prerequisites and references pull them together, and a soft vertical order follows the level
// (prépa 1re année at the bottom, doctorat at the top). Seeded by the ids: same graph, same picture.
// Pure (no DOM, no three), checked by the tests.
import type { Graph } from './graph';

export interface Layout {
  /** x, y, z of every node, by node index */
  pos: Float32Array;
  /** centre and radius of each course cluster, by course id */
  clusters: Map<string, { x: number; y: number; z: number; r: number }>;
}

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** mulberry32 */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);

/** height of a course cluster by level and year */
const levelY = (level: string, year: number): number => (level === 'demo' ? -4.6 : level === 'prepa' ? (year === 2 ? 0.4 : -3.2) : level === 'master' ? 4.2 : level === 'doctorat' ? 7.8 : 0);

export const clusterRadius = (nodes: number): number => 0.5 + 0.17 * Math.sqrt(nodes);

export function layoutGraph(g: Graph): Layout {
  const pos = new Float32Array(g.nodes.length * 3);
  const courses = g.nodes.map((n, i) => (n.kind === 'course' ? i : -1)).filter((i) => i >= 0);
  const k = courses.length;
  const slot = new Map(courses.map((ni, s) => [g.nodes[ni].course, s]));
  const size = new Array(k).fill(0);
  for (const n of g.nodes) size[slot.get(n.course)!]++;
  const R = size.map(clusterRadius);
  const Y = courses.map((ni) => levelY(g.nodes[ni].level, g.nodes[ni].year));

  // ── clusters ──
  const P: V[] = courses.map((ni, s) => {
    const r = rng(hash(g.nodes[ni].id));
    const a = r() * Math.PI * 2;
    const d = 2 + 4 * r();
    return [d * Math.cos(a), Y[s] + (r() - 0.5), d * Math.sin(a)];
  });
  // links between clusters: prerequisites (strong), references (by count)
  const w = new Map<string, number>();
  for (const e of g.edges) {
    if (e.kind === 'member') continue;
    const a = slot.get(g.nodes[e.a].course)!;
    const b = slot.get(g.nodes[e.b].course)!;
    if (a === b) continue;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    w.set(key, Math.min(1.5, (w.get(key) ?? 0) + (e.kind === 'prereq' ? 1 : 0.25)));
  }
  const links = [...w].map(([key, wt]) => {
    const [a, b] = key.split(',').map(Number);
    return { a, b, wt };
  });
  const STEPS = 420;
  const F: V[] = P.map(() => [0, 0, 0]);
  for (let it = 0; it < STEPS; it++) {
    const temp = 1 - it / STEPS;
    for (const f of F) f[0] = f[1] = f[2] = 0;
    for (let a = 0; a < k; a++)
      for (let b = a + 1; b < k; b++) {
        const d = sub(P[b], P[a]);
        const dist = Math.max(1e-3, len(d));
        const min = R[a] + R[b] + 0.7;
        const rep = (1.1 * min * min) / (dist * dist + 0.05);
        for (let c = 0; c < 3; c++) {
          F[a][c] -= (d[c] / dist) * rep;
          F[b][c] += (d[c] / dist) * rep;
        }
      }
    for (const { a, b, wt } of links) {
      const d = sub(P[b], P[a]);
      const dist = Math.max(1e-3, len(d));
      const pull = 0.35 * wt * (dist - (R[a] + R[b] + 1.1));
      for (let c = 0; c < 3; c++) {
        F[a][c] += (d[c] / dist) * pull;
        F[b][c] -= (d[c] / dist) * pull;
      }
    }
    for (let s = 0; s < k; s++) {
      F[s][1] += 0.9 * (Y[s] - P[s][1]);
      F[s][0] -= 0.09 * P[s][0];
      F[s][2] -= 0.09 * P[s][2];
      const m = len(F[s]);
      const step = Math.min(m, 0.02 + 0.3 * temp);
      if (m > 1e-9) for (let c = 0; c < 3; c++) P[s][c] += (F[s][c] / m) * step;
    }
  }
  // no two clusters overlap
  for (let pass = 0; pass < 400; pass++) {
    let moved = false;
    for (let a = 0; a < k; a++)
      for (let b = a + 1; b < k; b++) {
        const d = sub(P[b], P[a]);
        const dist = len(d);
        const min = R[a] + R[b] + 0.25;
        if (dist >= min) continue;
        moved = true;
        const dir: V = dist > 1e-6 ? [d[0] / dist, d[1] / dist, d[2] / dist] : [1, 0, 0];
        const push = (min - dist) / 2 + 1e-4;
        for (let c = 0; c < 3; c++) {
          P[a][c] -= dir[c] * push;
          P[b][c] += dir[c] * push;
        }
      }
    if (!moved) break;
  }

  // ── inside each cluster ──
  const clusters = new Map<string, { x: number; y: number; z: number; r: number }>();
  const members = new Map<string, number[]>();
  g.nodes.forEach((n, i) => members.set(n.course, [...(members.get(n.course) ?? []), i]));
  for (const [s, ci] of courses.entries()) {
    const course = g.nodes[ci].course;
    const r = rng(hash(course) ^ 0x9e3779b9);
    const C = P[s];
    const Rc = R[s];
    clusters.set(course, { x: C[0], y: C[1], z: C[2], r: Rc });
    const list = members.get(course)!;
    const local = new Map<number, V>();
    local.set(ci, [0, 0, 0]);
    const chapters = list.filter((i) => g.nodes[i].kind === 'chapter');
    // chapters on a Fibonacci sphere, turned at random
    const rot = r() * Math.PI * 2;
    const tilt = (r() - 0.5) * 1.2;
    const dirOf = new Map<string, V>();
    chapters.forEach((i, q) => {
      const n = chapters.length;
      const yy = n === 1 ? 0 : 1 - (2 * (q + 0.5)) / n;
      const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
      const th = q * 2.399963 + rot;
      let v: V = [rr * Math.cos(th), yy * 0.8, rr * Math.sin(th)];
      v = [v[0], v[1] * Math.cos(tilt) - v[2] * Math.sin(tilt), v[1] * Math.sin(tilt) + v[2] * Math.cos(tilt)];
      dirOf.set(g.nodes[i].anchor!, v);
      local.set(i, [v[0] * 0.45 * Rc, v[1] * 0.45 * Rc, v[2] * 0.45 * Rc]);
    });
    // statements beyond their chapter, scattered in a cone
    for (const i of list) {
      const n = g.nodes[i];
      if (n.kind !== 'statement') continue;
      const base = (n.chapter && dirOf.get(n.chapter)) || ([r() - 0.5, r() - 0.5, r() - 0.5] as V);
      const j: V = [base[0] + (r() - 0.5) * 0.9, base[1] + (r() - 0.5) * 0.9, base[2] + (r() - 0.5) * 0.9];
      const l = len(j) || 1;
      const d = (0.72 + 0.22 * r()) * Rc;
      local.set(i, [(j[0] / l) * d, (j[1] / l) * d, (j[2] / l) * d]);
    }
    // relax: members push each other, springs to the parent, all inside the ball (the course stays at the centre)
    const pts = list.map((i) => local.get(i)!);
    const par = list.map((i) => {
      const n = g.nodes[i];
      const p = n.kind === 'statement' && n.chapter ? g.index.get(`ch:${course}/${n.chapter}`) : undefined;
      return list.indexOf(p ?? ci);
    });
    const centre = list.indexOf(ci);
    const f: V[] = list.map(() => [0, 0, 0]);
    for (let it = 0; it < 90; it++) {
      const temp = 1 - it / 90;
      for (const v of f) v[0] = v[1] = v[2] = 0;
      for (let x = 0; x < list.length; x++)
        for (let y = x + 1; y < list.length; y++) {
          const d = sub(pts[y], pts[x]);
          const dist = Math.max(1e-3, len(d));
          const rep = (0.02 * Rc * Rc) / (dist * dist + 0.01);
          for (let c = 0; c < 3; c++) {
            f[x][c] -= (d[c] / dist) * rep;
            f[y][c] += (d[c] / dist) * rep;
          }
        }
      for (let x = 0; x < list.length; x++) {
        if (x === centre) continue;
        const d = sub(pts[par[x]], pts[x]);
        const dist = Math.max(1e-3, len(d));
        const rest = g.nodes[list[x]].kind === 'chapter' ? 0.45 * Rc : par[x] === centre ? 0.7 * Rc : 0.32 * Rc;
        for (let c = 0; c < 3; c++) f[x][c] += (d[c] / dist) * 0.5 * (dist - rest);
      }
      for (let x = 0; x < list.length; x++) {
        if (x === centre) continue;
        const m = len(f[x]);
        const step = Math.min(m, (0.01 + 0.12 * temp) * Rc);
        const A = pts[x];
        if (m > 1e-9) for (let c = 0; c < 3; c++) A[c] += (f[x][c] / m) * step;
        const l = len(A);
        if (l > 0.96 * Rc) for (let c = 0; c < 3; c++) A[c] *= (0.96 * Rc) / l;
      }
    }
    for (const i of list) {
      const v = local.get(i)!;
      pos[i * 3] = C[0] + v[0];
      pos[i * 3 + 1] = C[1] + v[1];
      pos[i * 3 + 2] = C[2] + v[2];
    }
  }
  return { pos, clusters };
}
