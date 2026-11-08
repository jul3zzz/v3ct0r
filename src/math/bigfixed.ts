/** Fixed-point arbitrary precision (BigInt scaled by 2^FB) for deep Mandelbrot zooms. */

export const FB = 320; // ≈ 96 decimal digits
const SCALE = 1n << BigInt(FB);
const TWO_FB = Math.pow(2, FB);

export type BigC = { x: bigint; y: bigint };

export function fromNumber(v: number): bigint {
  if (v === 0) return 0n;
  // exact: split the double into mantissa · 2^exp
  const s = v < 0 ? -1n : 1n;
  let a = Math.abs(v);
  let e = 0;
  while (a < 2 ** 52) {
    a *= 2;
    e--;
  }
  while (a >= 2 ** 53) {
    a /= 2;
    e++;
  }
  const m = BigInt(Math.round(a));
  const sh = e + FB;
  return s * (sh >= 0 ? m << BigInt(sh) : m >> BigInt(-sh));
}

export function toNumber(v: bigint): number {
  return Number(v) / TWO_FB;
}

/** Decimal string with `digits` decimals (truncated). */
export function toDecimal(v: bigint, digits: number): string {
  const neg = v < 0n;
  const a = neg ? -v : v;
  const ip = a >> BigInt(FB);
  const frac = a - (ip << BigInt(FB));
  const fd = ((frac * 10n ** BigInt(digits)) >> BigInt(FB)).toString().padStart(digits, '0');
  return `${neg ? '−' : ''}${ip}.${fd}`;
}

const mul = (a: bigint, b: bigint) => (a * b) >> BigInt(FB);

/** Reference orbit Z_0 = 0, Z_{n+1} = Z_n² + c, stored as float32 pairs; stops at |Z| > 2. */
export function referenceOrbit(c: BigC, maxIter: number, bits = FB): Float32Array {
  const sh = BigInt(FB - bits);
  const cx = c.x >> sh;
  const cy = c.y >> sh;
  const B = BigInt(bits);
  const four = 4n << B;
  const conv = Math.pow(2, bits);
  const out = new Float32Array((maxIter + 1) * 2);
  let x = 0n;
  let y = 0n;
  let n = 0;
  for (; n < maxIter; n++) {
    const x2 = (x * x) >> B;
    const y2 = (y * y) >> B;
    const xy = (x * y) >> B;
    x = x2 - y2 + cx;
    y = 2n * xy + cy;
    out[(n + 1) * 2] = Number(x) / conv;
    out[(n + 1) * 2 + 1] = Number(y) / conv;
    if (x2 + y2 > four) {
      n++;
      break;
    }
  }
  return out.subarray(0, (n + 1) * 2);
}

// ── Newton refinement of Misiurewicz points: f^{k+p}(0) = f^k(0) ─────────

const cm = (a: BigC, b: BigC): BigC => ({ x: mul(a.x, b.x) - mul(a.y, b.y), y: mul(a.x, b.y) + mul(a.y, b.x) });
const cdiv = (a: BigC, b: BigC): BigC => {
  const d = mul(b.x, b.x) + mul(b.y, b.y);
  if (d === 0n) return { x: 0n, y: 0n };
  const nx = mul(a.x, b.x) + mul(a.y, b.y);
  const ny = mul(a.y, b.x) - mul(a.x, b.y);
  return { x: (nx << BigInt(FB)) / d, y: (ny << BigInt(FB)) / d };
};

/** Smallest (k, p) such that c is (numerically) a Misiurewicz point M_{k,p}. */
export function detectMisiurewicz(cr: number, ci: number): [number, number] | null {
  const orbit: [number, number][] = [[0, 0]];
  let x = 0;
  let y = 0;
  for (let n = 0; n < 16; n++) {
    [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
    orbit.push([x, y]);
  }
  let best: [number, number] | null = null;
  let bestScore = Infinity;
  for (let k = 1; k <= 10; k++)
    for (let p = 1; p <= 4; p++) {
      const a = orbit[k + p];
      const b = orbit[k];
      const r = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (r < 1e-7 && k + p < bestScore) {
        best = [k, p];
        bestScore = k + p;
      }
    }
  return best;
}

export function refineMisiurewicz(cr: number, ci: number, k: number, p: number, iters = 14): { c: BigC; residual: number } {
  let c: BigC = { x: fromNumber(cr), y: fromNumber(ci) };
  const ONE: BigC = { x: SCALE, y: 0n };
  let residual = Infinity;
  for (let it = 0; it < iters; it++) {
    let z: BigC = { x: 0n, y: 0n };
    let d: BigC = { x: 0n, y: 0n };
    let zk: BigC = z;
    let dk: BigC = d;
    for (let n = 1; n <= k + p; n++) {
      d = cm({ x: 2n * z.x, y: 2n * z.y }, d);
      d = { x: d.x + ONE.x, y: d.y };
      z = cm(z, z);
      z = { x: z.x + c.x, y: z.y + c.y };
      if (n === k) {
        zk = z;
        dk = d;
      }
    }
    const g = { x: z.x - zk.x, y: z.y - zk.y };
    const gp = { x: d.x - dk.x, y: d.y - dk.y };
    const step = cdiv(g, gp);
    c = { x: c.x - step.x, y: c.y - step.y };
    residual = Math.hypot(toNumber(g.x), toNumber(g.y));
    if (step.x === 0n && step.y === 0n) break;
  }
  return { c, residual };
}
