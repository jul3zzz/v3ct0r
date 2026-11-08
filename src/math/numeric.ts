/** Numerical integration helpers. */

export type Fn1 = (x: number) => number;
export type RiemannMethod = 'left' | 'right' | 'mid' | 'trap' | 'simpson';

/** Adaptive Simpson quadrature (reference value). */
export function adaptiveSimpson(f: Fn1, a: number, b: number, eps = 1e-11, maxDepth = 40): number {
  const fa = f(a);
  const fb = f(b);
  const m = (a + b) / 2;
  const fm = f(m);
  const whole = ((b - a) / 6) * (fa + 4 * fm + fb);
  const rec = (a: number, b: number, fa: number, fm: number, fb: number, whole: number, eps: number, depth: number): number => {
    const m = (a + b) / 2;
    const lm = (a + m) / 2;
    const rm = (m + b) / 2;
    const flm = f(lm);
    const frm = f(rm);
    const left = ((m - a) / 6) * (fa + 4 * flm + fm);
    const right = ((b - m) / 6) * (fm + 4 * frm + fb);
    const delta = left + right - whole;
    if (depth <= 0 || Math.abs(delta) <= 15 * eps || !Number.isFinite(delta)) return left + right + delta / 15;
    return rec(a, m, fa, flm, fm, left, eps / 2, depth - 1) + rec(m, b, fm, frm, fb, right, eps / 2, depth - 1);
  };
  return rec(a, b, fa, fm, fb, whole, eps, maxDepth);
}

/** Riemann-type sums with n subintervals. Simpson needs n even (rounded up). */
export function riemann(f: Fn1, a: number, b: number, n: number, method: RiemannMethod): number {
  if (method === 'simpson') {
    const m = n % 2 ? n + 1 : n;
    const h = (b - a) / m;
    let s = f(a) + f(b);
    for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return (s * h) / 3;
  }
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    switch (method) {
      case 'left': s += f(x0); break;
      case 'right': s += f(x0 + h); break;
      case 'mid': s += f(x0 + h / 2); break;
      case 'trap': s += (f(x0) + f(x0 + h)) / 2; break;
    }
  }
  return s * h;
}

export const METHOD_ORDER: Record<RiemannMethod, string> = {
  left: 'O(1/n)',
  right: 'O(1/n)',
  mid: 'O(1/n²)',
  trap: 'O(1/n²)',
  simpson: 'O(1/n⁴)',
};

/** Composite Simpson in 2D on [ax,bx]×[ay,by] (reference for double integrals). */
export function simpson2D(f: (x: number, y: number) => number, ax: number, bx: number, ay: number, by: number, n = 200): number {
  const m = n % 2 ? n + 1 : n;
  const hx = (bx - ax) / m;
  const hy = (by - ay) / m;
  let s = 0;
  for (let i = 0; i <= m; i++) {
    const wi = i === 0 || i === m ? 1 : i % 2 ? 4 : 2;
    const x = ax + i * hx;
    for (let j = 0; j <= m; j++) {
      const wj = j === 0 || j === m ? 1 : j % 2 ? 4 : 2;
      const v = f(x, ay + j * hy);
      if (Number.isFinite(v)) s += wi * wj * v;
    }
  }
  return (s * hx * hy) / 9;
}

/** Volume of the n-ball of radius r: π^{n/2} r^n / Γ(n/2 + 1). */
export function ballVolume(n: number, r = 1): number {
  // Γ(n/2+1) for integer n via recurrence
  let g: number;
  if (n % 2 === 0) {
    g = 1;
    for (let k = 2; k <= n / 2; k++) g *= k;
  } else {
    g = Math.sqrt(Math.PI);
    for (let k = 1; k <= n; k += 2) g *= k / 2;
  }
  return (Math.pow(Math.PI, n / 2) * Math.pow(r, n)) / g;
}

/** Sample min/max of f on [a,b] (robust to NaN/∞). */
export function range(f: Fn1, a: number, b: number, n = 400): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= n; i++) {
    const y = f(a + ((b - a) * i) / n);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) continue;
    if (y < lo) lo = y;
    if (y > hi) hi = y;
  }
  if (!Number.isFinite(lo)) return [-1, 1];
  if (hi - lo < 1e-9) return [lo - 1, hi + 1];
  return [lo, hi];
}
