/**
 * Truncated Taylor-series arithmetic ("jets"): evaluates a parsed expression as the series of
 * its Taylor coefficients at x0, up to order K. Exact automatic differentiation — no finite
 * differences, no radius-of-convergence assumption. Coefficient k equals f^(k)(x0) / k!.
 */
import { CONSTANTS, type Node } from './parser';

type S = Float64Array;

export function taylorCoefficients(ast: Node, x0: number, K: number, varName = 'x'): Float64Array {
  const N = K + 1;
  const cst = (v: number): S => {
    const s = new Float64Array(N);
    s[0] = v;
    return s;
  };
  const isConst = (a: S) => a.every((v, i) => i === 0 || v === 0);
  const add = (a: S, b: S): S => a.map((v, i) => v + b[i]);
  const sub = (a: S, b: S): S => a.map((v, i) => v - b[i]);
  const scale = (a: S, k: number): S => a.map((v) => v * k);
  const mul = (a: S, b: S): S => {
    const c = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      let s = 0;
      for (let j = 0; j <= k; j++) s += a[j] * b[k - j];
      c[k] = s;
    }
    return c;
  };
  const div = (a: S, b: S): S => {
    const c = new Float64Array(N);
    for (let k = 0; k < N; k++) {
      let s = a[k];
      for (let j = 1; j <= k; j++) s -= b[j] * c[k - j];
      c[k] = s / b[0];
    }
    return c;
  };
  const exp = (a: S): S => {
    const e = new Float64Array(N);
    e[0] = Math.exp(a[0]);
    for (let k = 1; k < N; k++) {
      let s = 0;
      for (let j = 1; j <= k; j++) s += j * a[j] * e[k - j];
      e[k] = s / k;
    }
    return e;
  };
  const log = (a: S): S => {
    const l = new Float64Array(N);
    l[0] = Math.log(a[0]);
    for (let k = 1; k < N; k++) {
      let s = 0;
      for (let j = 1; j < k; j++) s += j * l[j] * a[k - j];
      l[k] = (a[k] - s / k) / a[0];
    }
    return l;
  };
  const sincos = (a: S, hyper = false): [S, S] => {
    const s = new Float64Array(N);
    const c = new Float64Array(N);
    s[0] = hyper ? Math.sinh(a[0]) : Math.sin(a[0]);
    c[0] = hyper ? Math.cosh(a[0]) : Math.cos(a[0]);
    for (let k = 1; k < N; k++) {
      let ss = 0;
      let cc = 0;
      for (let j = 1; j <= k; j++) {
        ss += j * a[j] * c[k - j];
        cc += j * a[j] * s[k - j];
      }
      s[k] = ss / k;
      c[k] = (hyper ? cc : -cc) / k;
    }
    return [s, c];
  };
  const powReal = (a: S, r: number): S => {
    const p = new Float64Array(N);
    p[0] = Math.pow(a[0], r);
    for (let k = 1; k < N; k++) {
      let s = 0;
      for (let j = 1; j <= k; j++) s += (j * (r + 1) - k) * a[j] * p[k - j];
      p[k] = s / (k * a[0]);
    }
    return p;
  };
  const powInt = (a: S, n: number): S => {
    let r = cst(1);
    let p = a;
    let k = Math.abs(n);
    while (k) {
      if (k & 1) r = mul(r, p);
      p = mul(p, p);
      k >>= 1;
    }
    return n < 0 ? div(cst(1), r) : r;
  };
  const deriv = (a: S): S => {
    const d = new Float64Array(N);
    for (let k = 0; k < K; k++) d[k] = (k + 1) * a[k + 1];
    return d;
  };
  const integ = (q: S, c0: number): S => {
    const t = new Float64Array(N);
    t[0] = c0;
    for (let k = 1; k < N; k++) t[k] = q[k - 1] / k;
    return t;
  };

  const ev = (n: Node): S => {
    switch (n.k) {
      case 'num': return cst(n.v);
      case 'const': return cst(CONSTANTS[n.name]);
      case 'var': {
        if (n.name !== varName) return cst(0);
        const s = cst(x0);
        if (K >= 1) s[1] = 1;
        return s;
      }
      case 'neg': return scale(ev(n.a), -1);
      case 'bin': {
        const a = ev(n.a);
        if (n.op === '^') {
          if (n.b.k === 'num' && Number.isInteger(n.b.v) && Math.abs(n.b.v) <= 64) return powInt(a, n.b.v);
          const b = ev(n.b);
          if (isConst(b)) return Number.isInteger(b[0]) && Math.abs(b[0]) <= 64 ? powInt(a, b[0]) : powReal(a, b[0]);
          return exp(mul(b, log(a)));
        }
        const b = ev(n.b);
        if (n.op === '+') return add(a, b);
        if (n.op === '-') return sub(a, b);
        if (n.op === '*') return mul(a, b);
        return div(a, b);
      }
      case 'call': {
        const A = n.args.map(ev);
        const a = A[0];
        switch (n.fn) {
          case 'sin': return sincos(a)[0];
          case 'cos': return sincos(a)[1];
          case 'tan': { const [s, c] = sincos(a); return div(s, c); }
          case 'sec': return div(cst(1), sincos(a)[1]);
          case 'csc': return div(cst(1), sincos(a)[0]);
          case 'cot': { const [s, c] = sincos(a); return div(c, s); }
          case 'sinh': return sincos(a, true)[0];
          case 'cosh': return sincos(a, true)[1];
          case 'tanh': { const [s, c] = sincos(a, true); return div(s, c); }
          case 'exp': return exp(a);
          case 'ln':
          case 'log': return log(a);
          case 'log10': return scale(log(a), 1 / Math.LN10);
          case 'log2': return scale(log(a), 1 / Math.LN2);
          case 'sqrt': return powReal(a, 0.5);
          case 'cbrt': return a[0] < 0 ? scale(powReal(scale(a, -1), 1 / 3), -1) : powReal(a, 1 / 3);
          case 'abs': return a[0] < 0 ? scale(a, -1) : a;
          case 'atan':
          case 'arctan': return integ(div(deriv(a), add(cst(1), mul(a, a))), Math.atan(a[0]));
          case 'asin':
          case 'arcsin': return integ(div(deriv(a), powReal(sub(cst(1), mul(a, a)), 0.5)), Math.asin(a[0]));
          case 'acos':
          case 'arccos': return integ(scale(div(deriv(a), powReal(sub(cst(1), mul(a, a)), 0.5)), -1), Math.acos(a[0]));
          case 'pow': {
            const b = A[1];
            if (isConst(b)) return Number.isInteger(b[0]) && Math.abs(b[0]) <= 64 ? powInt(a, b[0]) : powReal(a, b[0]);
            return exp(mul(b, log(a)));
          }
          case 'atan2': {
            const q = div(a, A[1]);
            const t = integ(div(deriv(q), add(cst(1), mul(q, q))), 0);
            t[0] = Math.atan2(a[0], A[1][0]);
            return t;
          }
          case 'min': return A.reduce((m, x) => (x[0] < m[0] ? x : m));
          case 'max': return A.reduce((m, x) => (x[0] > m[0] ? x : m));
          case 're':
          case 'conj': return a;
          case 'im': return cst(0);
          case 'mod': return sub(a, scale(A[1], Math.floor(a[0] / A[1][0])));
          case 'floor': return cst(Math.floor(a[0]));
          case 'ceil': return cst(Math.ceil(a[0]));
          case 'round': return cst(Math.round(a[0]));
          case 'sign': return cst(Math.sign(a[0]));
          case 'step': return cst(a[0] >= 0 ? 1 : 0);
          case 'arg': return cst(a[0] >= 0 ? 0 : Math.PI);
        }
        return cst(NaN);
      }
    }
  };
  return ev(ast);
}

/** Root-test estimate of the radius of convergence from the tail of the coefficients. */
export function radiusEstimate(c: ArrayLike<number>): number {
  const K = c.length - 1;
  const rootMax = (k0: number, k1: number) => {
    let best = 0;
    for (let k = Math.max(1, k0); k <= k1; k++) {
      const a = Math.abs(c[k]);
      if (a > 0 && Number.isFinite(a)) best = Math.max(best, Math.pow(a, 1 / k));
    }
    return best;
  };
  const late = rootMax(Math.floor(K / 2), K);
  const early = rootMax(Math.floor(K / 4), Math.floor(K / 2));
  // |c_k|^(1/k) still shrinking with k (like e/k for e^x): entire function, infinite radius
  if (late < 1e-6 || (early > 0 && late < 0.75 * early)) return Infinity;
  return 1 / late;
}
