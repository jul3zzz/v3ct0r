/** Box-counting dimension estimate of a 2D or 3D point cloud normalized to [0,1]^d. */
export function boxCounting(points: Float32Array | Float64Array, dim: 2 | 3, count: number, kMin = 3, kMax = 8): { d: number; samples: [number, number][] } {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < count; i++)
    for (let a = 0; a < dim; a++) {
      const v = points[i * dim + a];
      if (v < lo[a]) lo[a] = v;
      if (v > hi[a]) hi[a] = v;
    }
  const span = Math.max(...[0, 1, 2].slice(0, dim).map((a) => hi[a] - lo[a])) || 1;
  const samples: [number, number][] = [];
  for (let k = kMin; k <= kMax; k++) {
    const n = 1 << k;
    const cells = dim === 2 ? n * n : n * n * n;
    if (cells > 1 << 22) break;
    const grid = new Uint8Array(cells);
    let occ = 0;
    for (let i = 0; i < count; i++) {
      let idx = 0;
      let mul = 1;
      for (let a = 0; a < dim; a++) {
        const c = Math.min(n - 1, Math.floor(((points[i * dim + a] - lo[a]) / span) * n));
        idx += c * mul;
        mul *= n;
      }
      if (!grid[idx]) {
        grid[idx] = 1;
        occ++;
      }
    }
    samples.push([k, Math.log2(occ)]);
  }
  // least-squares slope of log2 N vs k
  const m = samples.length;
  const sx = samples.reduce((s, p) => s + p[0], 0);
  const sy = samples.reduce((s, p) => s + p[1], 0);
  const sxx = samples.reduce((s, p) => s + p[0] * p[0], 0);
  const sxy = samples.reduce((s, p) => s + p[0] * p[1], 0);
  const d = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  return { d, samples };
}

/** Seeded PRNG (mulberry32) so fractal point sets are reproducible. */
export function rng(seed = 1): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
