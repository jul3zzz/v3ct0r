// Calculator engine (pure, no DOM). Independent from the plotting parser (src/math/parser.ts):
// variables, user functions, ans, n!, %, °, ±, comparisons, Σ ∏ ∫ der lim solve, number theory,
// special functions, and recognition of exact forms (p/q, kπ/q, √, ln n…).

export type Angle = 'rad' | 'deg';

export interface CalcState {
  vars: Record<string, number>;
  fns: Record<string, { params: string[]; body: string }>;
  ans: number | null;
  angle: Angle;
}

export const newState = (): CalcState => ({ vars: {}, fns: {}, ans: null, angle: 'rad' });

export type CalcResult =
  | { ok: true; kind: 'num'; values: number[]; approx: boolean; notes: string[] }
  | { ok: true; kind: 'bool'; value: boolean; approx: boolean; notes: string[] }
  | { ok: true; kind: 'text'; text: string; notes: string[] }
  | { ok: true; kind: 'assign'; name: string; value: number; approx: boolean; notes: string[] }
  | { ok: true; kind: 'define'; name: string; params: string[]; body: string; shown: string; notes: string[] }
  | { ok: false; error: string };

export class CalcError extends Error {}
const fail = (m: string): never => {
  throw new CalcError(m);
};

// ── normalisation: typed symbols → names the parser knows ─────────────────────────────────────

const SUPS: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+', 'ⁿ': 'n', 'ⁱ': 'i' };
const SUBS: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₙ': 'n', 'ₖ': 'k', 'ᵢ': 'i', 'ⱼ': 'j' };
const REPL: Record<string, string> = {
  'π': ' pi ', 'τ': ' tau ', 'φ': ' phi ', 'ϕ': ' phi ', '∞': ' inf ', 'ℯ': ' e ', 'γ': ' euler ', 'Γ': ' gamma ',
  '√': ' sqrt ', '∛': ' cbrt ', '∜': ' root4 ', 'Σ': ' sum ', '∑': ' sum ', '∏': ' prod ', 'Π': ' prod ', '∫': ' int ', '∂': ' der ',
  '×': '*', '·': '*', '⋅': '*', '∙': '*', '÷': '/', '−': '-', '–': '-',
  '≤': '<=', '⩽': '<=', '≥': '>=', '⩾': '>=', '≠': '!=', '≈': '~=', '≡': '==', '≔': ':=',
  '‖': '|', '⌊': ' floor(', '⌋': ')', '⌈': ' ceil(', '⌉': ')', '′': "'", '″': "''", ' ': ' ', ' ': ' ', ' ': ' ',
};

export function normalize(src: string): string {
  // Greek letters that name a special function when called: γ(5) = Γ(5), ζ(2), β(2,3)
  const s0 = src.replace(/[γΓ]\s*\(/g, ' gamma(').replace(/ζ\s*\(/g, ' zeta(').replace(/β\s*\(/g, ' beta(');
  const ch = [...s0];
  let out = '';
  for (let i = 0; i < ch.length; i++) {
    if (SUPS[ch[i]]) {
      let run = '';
      while (i < ch.length && SUPS[ch[i]]) run += SUPS[ch[i++]];
      i--;
      out += `^(${run})`;
      continue;
    }
    if (SUBS[ch[i]]) {
      let run = '';
      while (i < ch.length && SUBS[ch[i]]) run += SUBS[ch[i++]];
      i--;
      out += `_${run}`;
      continue;
    }
    out += REPL[ch[i]] ?? ch[i];
  }
  return out;
}

// ── tokens and parser ─────────────────────────────────────────────────────────────────────────

type Tok = { t: 'num'; v: number; p: number } | { t: 'id'; v: string; p: number } | { t: 'op'; v: string; p: number };
const OPS2 = ['<=', '>=', '!=', '~=', '==', ':=', '**'];
const OPS1 = '+-*/^(),|!%°‰±∓<>=';
const ID0 = /[A-Za-z_Α-Ωα-ωϕϵ]/;
const IDN = /^[A-Za-z_Α-Ωα-ωϕϵ][A-Za-z0-9_Α-Ωα-ωϕϵ]*'*/;

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (!m) fail('nombre invalide');
      out.push({ t: 'num', v: parseFloat(m![0]), p: i });
      i += m![0].length;
      continue;
    }
    if (ID0.test(c)) {
      const m = IDN.exec(s.slice(i))!;
      out.push({ t: 'id', v: m[0], p: i });
      i += m[0].length;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (OPS2.includes(two)) {
      out.push({ t: 'op', v: two === '**' ? '^' : two, p: i });
      i += 2;
      continue;
    }
    if (OPS1.includes(c)) {
      out.push({ t: 'op', v: c, p: i });
      i++;
      continue;
    }
    fail(`« ${c} » n’est pas calculable (symbole d’écriture)`);
  }
  return out;
}

type BinOp = '+' | '-' | '*' | '/' | '^' | 'mod';
export type Node =
  | { k: 'num'; v: number }
  | { k: 'id'; name: string }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: BinOp; a: Node; b: Node }
  | { k: 'pm'; minusFirst: boolean; a: Node | null; b: Node; i: number }
  | { k: 'post'; op: string; a: Node }
  | { k: 'cmp'; op: string; a: Node; b: Node }
  | { k: 'call'; fn: string; args: Node[]; d: number }
  | { k: 'abs'; a: Node };

const CMP = ['<', '<=', '>', '>=', '=', '==', '!=', '~='];

function parseTokens(toks: Tok[]): { node: Node; pm: number } {
  let i = 0;
  let abs = 0;
  let pm = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => toks[i]?.t === 'op' && toks[i].v === v;
  const expect = (v: string) => {
    if (!isOp(v)) fail(v === ')' ? 'parenthèse fermante manquante' : v === '|' ? 'barre | fermante manquante' : `« ${v} » attendu`);
    i++;
  };
  const startsPrimary = (): boolean => {
    const t = peek();
    if (!t) return false;
    if (t.t === 'num') return true;
    if (t.t === 'id') return t.v !== 'mod';
    return t.v === '(' || (t.v === '|' && abs === 0);
  };
  function cmp(): Node {
    const a = expr();
    const t = peek();
    if (t?.t === 'op' && CMP.includes(t.v)) {
      i++;
      return { k: 'cmp', op: t.v, a, b: expr() };
    }
    return a;
  }
  function expr(): Node {
    let a = term();
    for (;;) {
      if (isOp('+') || isOp('-')) {
        const op = toks[i++].v as '+' | '-';
        a = { k: 'bin', op, a, b: term() };
      } else if (isOp('±') || isOp('∓')) {
        const minusFirst = toks[i++].v === '∓';
        a = { k: 'pm', minusFirst, a, b: term(), i: pm++ };
      } else break;
    }
    return a;
  }
  function term(): Node {
    let a = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[i++].v as '*' | '/';
        a = { k: 'bin', op, a, b: unary() };
      } else if (peek()?.t === 'id' && peek()!.v === 'mod') {
        i++;
        a = { k: 'bin', op: 'mod', a, b: unary() };
      } else if (startsPrimary()) a = { k: 'bin', op: '*', a, b: power() };
      else break;
    }
    return a;
  }
  function unary(): Node {
    if (isOp('-')) {
      i++;
      return { k: 'neg', a: unary() };
    }
    if (isOp('+')) {
      i++;
      return unary();
    }
    if (isOp('±') || isOp('∓')) {
      const minusFirst = toks[i++].v === '∓';
      return { k: 'pm', minusFirst, a: null, b: unary(), i: pm++ };
    }
    return power();
  }
  function power(): Node {
    const base = postfix();
    if (isOp('^')) {
      i++;
      return { k: 'bin', op: '^', a: base, b: unary() };
    }
    return base;
  }
  function postfix(): Node {
    let a = primary();
    while (isOp('!') || isOp('%') || isOp('°') || isOp('‰')) a = { k: 'post', op: toks[i++].v as string, a };
    return a;
  }
  function primary(): Node {
    const t = peek();
    if (!t) return fail('expression incomplète');
    if (t.t === 'num') {
      i++;
      return { k: 'num', v: t.v };
    }
    if (t.t === 'id') {
      i++;
      const m = /^(.*?)('*)$/.exec(t.v)!;
      const name = m[1];
      const d = m[2].length;
      if (isOp('(')) {
        i++;
        const args: Node[] = [];
        if (!isOp(')')) {
          args.push(cmp());
          while (isOp(',')) {
            i++;
            args.push(cmp());
          }
        }
        expect(')');
        return { k: 'call', fn: name, args, d };
      }
      if (d) fail(`dérivée : écrire ${t.v}(a)`);
      if (NUMERIC[name] && NUMERIC[name].n[0] === 1 && startsPrimary()) return { k: 'call', fn: name, args: [power()], d: 0 };
      return { k: 'id', name };
    }
    if (t.v === '(') {
      i++;
      const e = cmp();
      expect(')');
      return e;
    }
    if (t.v === '|') {
      i++;
      abs++;
      const e = expr();
      abs--;
      expect('|');
      return { k: 'abs', a: e };
    }
    return fail(`« ${t.v} » inattendu`);
  }
  if (!toks.length) fail('expression vide');
  const node = cmp();
  if (i < toks.length) fail(`« ${(toks[i] as { v: string | number }).v} » inattendu`);
  return { node, pm };
}

const PARSED = new Map<string, Node>();
function parseCached(src: string): Node {
  let n = PARSED.get(src);
  if (!n) {
    const r = parseTokens(tokenize(src));
    if (r.pm) fail('± interdit dans une fonction définie');
    n = r.node;
    if (PARSED.size > 200) PARSED.clear();
    PARSED.set(src, n);
  }
  return n;
}

// ── numeric helpers ───────────────────────────────────────────────────────────────────────────

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

export function gamma(z: number): number {
  if (Number.isInteger(z)) {
    if (z <= 0) return NaN;
    if (z <= 171) {
      let r = 1;
      for (let k = 2; k < z; k++) r *= k;
      return r;
    }
    return Infinity;
  }
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  const x0 = z - 1;
  let x = LANCZOS[0];
  for (let k = 1; k < 9; k++) x += LANCZOS[k] / (x0 + k);
  const t = x0 + 7.5;
  const half = Math.pow(t, (x0 + 0.5) / 2);
  return Math.sqrt(2 * Math.PI) * half * (half * Math.exp(-t)) * x;
}

export function lgamma(z: number): number {
  if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lgamma(1 - z);
  const x0 = z - 1;
  let x = LANCZOS[0];
  for (let k = 1; k < 9; k++) x += LANCZOS[k] / (x0 + k);
  const t = x0 + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x0 + 0.5) * Math.log(t) - t + Math.log(x);
}

const factorial = (n: number): number => (n < 0 && Number.isInteger(n) ? NaN : gamma(n + 1));

export function binom(n: number, k: number): number {
  if (Number.isInteger(n) && Number.isInteger(k)) {
    if (k < 0 || (n >= 0 && k > n)) return 0;
    if (n >= 0 && k > n - k) k = n - k;
    let r = 1;
    for (let j = 1; j <= k; j++) r = (r * (n - k + j)) / j;
    return Math.round(r) === r || Math.abs(r) > 2 ** 53 ? r : Math.round(r);
  }
  return gamma(n + 1) / (gamma(k + 1) * gamma(n - k + 1));
}

/** erf with full double precision: positive series e^{-x²}Σ 2ⁿx^{2n+1}/(1·3…(2n+1)), continued fraction for erfc */
export function erf(x: number): number {
  const a = Math.abs(x);
  if (a > 6) return Math.sign(x);
  if (a > 2.5) return Math.sign(x) * (1 - erfcLarge(a));
  let term = a;
  let sum = a;
  for (let n = 1; n < 200; n++) {
    term *= (2 * a * a) / (2 * n + 1);
    sum += term;
    if (term < 1e-17 * sum) break;
  }
  return Math.sign(x) * ((2 / Math.sqrt(Math.PI)) * Math.exp(-a * a) * sum);
}

/** erfc(x) for x ≥ 2.5 by Lentz's continued fraction */
function erfcLarge(x: number): number {
  // erfc x = e^{-x²}/√π · 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + 2/(x + …)))))
  let f = x;
  let C = x;
  let D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = x + an * D;
    D = D === 0 ? 1e-300 : 1 / D;
    C = x + an / C;
    const delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
}

export const erfc = (x: number): number => (x >= 2.5 ? erfcLarge(x) : 1 - erf(x));

/** Riemann ζ: Borwein’s algorithm on η for s ≥ 0, functional equation below */
export function zeta(s: number): number {
  if (s === 1) return Infinity;
  if (s < 0) return 2 ** s * Math.PI ** (s - 1) * Math.sin((Math.PI * s) / 2) * gamma(1 - s) * zeta(1 - s);
  const n = 40;
  const d: number[] = [];
  let acc = 0;
  let t = 1 / n; // (n+j-1)! 4^j / ((n-j)! (2j)!) at j = 0 is (n-1)!/n! = 1/n
  for (let j = 0; j <= n; j++) {
    if (j > 0) t *= ((n + j - 1) * 4 * (n - j + 1)) / ((2 * j - 1) * (2 * j));
    acc += t;
    d.push(n * acc);
  }
  let sum = 0;
  for (let k = 0; k < n; k++) sum += ((k % 2 ? -1 : 1) * (d[k] - d[n])) / (k + 1) ** s;
  return -sum / (d[n] * (1 - 2 ** (1 - s)));
}

// integers: Miller–Rabin and Pollard–Brent on BigInt (exact up to 2^53)

function modpow(b: bigint, e: bigint, m: bigint): bigint {
  let r = 1n;
  b %= m;
  while (e > 0n) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) if (n % p === 0) return n === p;
  if (n < 1369) return true;
  const N = BigInt(n);
  let d = N - 1n;
  let s = 0;
  while (!(d & 1n)) {
    d >>= 1n;
    s++;
  }
  outer: for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
    let x = modpow(a, d, N);
    if (x === 1n || x === N - 1n) continue;
    for (let r = 1; r < s; r++) {
      x = (x * x) % N;
      if (x === N - 1n) continue outer;
    }
    return false;
  }
  return true;
}

function gcdBig(a: bigint, b: bigint): bigint {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

function rho(n: bigint): bigint {
  if (n % 2n === 0n) return 2n;
  for (let c = 1n; c < 50n; c++) {
    let x = 2n;
    let y = 2n;
    let d = 1n;
    const f = (v: bigint) => (v * v + c) % n;
    while (d === 1n) {
      x = f(x);
      y = f(f(y));
      d = gcdBig(x - y, n);
    }
    if (d !== n) return d;
  }
  return n;
}

/** prime factorisation as [prime, exponent][], increasing */
export function factorize(n: number): [number, number][] {
  if (!Number.isInteger(n) || n < 2 || n > 2 ** 53) fail('factor : entier entre 2 et 2^53 attendu');
  const out = new Map<number, number>();
  const add = (p: number) => out.set(p, (out.get(p) ?? 0) + 1);
  let m = n;
  for (const p of [2, 3, 5, 7, 11, 13]) while (m % p === 0) (add(p), (m /= p));
  for (let p = 17; p * p <= m && p < 10000; p += 2) while (m % p === 0) (add(p), (m /= p));
  const stack = m > 1 ? [m] : [];
  while (stack.length) {
    const x = stack.pop()!;
    if (isPrime(x)) add(x);
    else {
      const d = Number(rho(BigInt(x)));
      stack.push(d, x / d);
    }
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]);
}

const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (s: string) => s.replace(/[0-9]/g, (d) => SUPD[Number(d)]).replace('-', '⁻').replace('+', '');

const gcd2 = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

const needInt = (name: string, ...xs: number[]) => {
  for (const x of xs) if (!Number.isInteger(x)) fail(`${name} : entiers attendus`);
};

let sieveCache: Uint8Array | null = null;
function sieve(limit: number): Uint8Array {
  if (sieveCache && sieveCache.length > limit) return sieveCache;
  const s = new Uint8Array(limit + 1).fill(1);
  s[0] = s[1] = 0;
  for (let p = 2; p * p <= limit; p++) if (s[p]) for (let q = p * p; q <= limit; q += p) s[q] = 0;
  return (sieveCache = s);
}

// numerical analysis

/** Ridders / Richardson extrapolation of g(h) → h = 0, error in powers of h^power; h divided by 1.4 */
function extrapolate(g: (h: number) => number, h0: number, power: 1 | 2): { v: number; err: number } {
  const CON = 1.4;
  const F = CON ** power;
  const N = 10;
  const a: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  let h = h0;
  let err = Infinity;
  let ans = NaN;
  a[0][0] = g(h);
  for (let i = 1; i < N; i++) {
    h /= CON;
    a[0][i] = g(h);
    let fac = F;
    for (let j = 1; j <= i; j++) {
      a[j][i] = (a[j - 1][i] * fac - a[j - 1][i - 1]) / (fac - 1);
      fac *= F;
      const e = Math.max(Math.abs(a[j][i] - a[j - 1][i]), Math.abs(a[j][i] - a[j - 1][i - 1]));
      if (e <= err) {
        err = e;
        ans = a[j][i];
      }
    }
    if (Math.abs(a[i][i] - a[i - 1][i - 1]) >= 2 * err) break;
  }
  return { v: ans, err };
}

export function derivative(f: (x: number) => number, x: number, order: number): number {
  if (order < 1 || order > 2) fail('dérivée : ordre 1 ou 2');
  let h0 = 0.1 * Math.max(1, Math.abs(x));
  for (let tries = 0; tries < 6; tries++, h0 /= 10) {
    if (!Number.isFinite(f(x + h0)) || !Number.isFinite(f(x - h0))) continue;
    const fx = order === 2 ? f(x) : 0;
    const g = order === 1 ? (h: number) => (f(x + h) - f(x - h)) / (2 * h) : (h: number) => (f(x + h) - 2 * fx + f(x - h)) / (h * h);
    const r = extrapolate(g, h0, 2);
    if (Number.isFinite(r.v)) return r.v;
  }
  return NaN;
}

/** tanh-sinh (double exponential) quadrature on ]a, b[ : never evaluates the end points */
export function tanhSinh(f: (x: number) => number, a: number, b: number): { v: number; ok: boolean } {
  const c = (a + b) / 2;
  const r = (b - a) / 2;
  const term = (t: number): number => {
    const s = (Math.PI / 2) * Math.sinh(t);
    const cs = Math.cosh(s);
    const w = ((Math.PI / 2) * Math.cosh(t)) / (cs * cs);
    if (!(w > 0)) return 0;
    const comp = 2 / (Math.exp(2 * s) + 1); // 1 − tanh s, without cancellation
    const xp = b - r * comp;
    const xm = a + r * comp;
    let sum = 0;
    for (const x of [xp, xm]) {
      if (!(x > a && x < b)) continue;
      const y = f(x);
      if (!Number.isFinite(y)) {
        if (w < 1e-200) continue;
        return NaN;
      }
      sum += y;
    }
    return w * sum;
  };
  const TMAX = 4;
  let h = 1;
  let S = (Math.PI / 2) * f(c);
  for (let k = 1; k * h <= TMAX; k++) S += term(k * h);
  let I = h * S * r;
  let prev = I;
  for (let level = 1; level <= 9; level++) {
    h /= 2;
    for (let k = 1; k * h <= TMAX; k += 2) S += term(k * h);
    I = h * S * r;
    if (Number.isNaN(I)) return { v: NaN, ok: false };
    if (level >= 4 && Math.abs(I - prev) <= 1e-11 * Math.max(1e-3, Math.abs(I))) return { v: I, ok: true };
    prev = I;
  }
  return { v: I, ok: Math.abs(I - prev) <= 1e-7 * Math.max(1, Math.abs(I)) };
}

// ── evaluation ────────────────────────────────────────────────────────────────────────────────

const CONST: Record<string, number> = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2, euler: 0.5772156649015329, inf: Infinity };

interface Flags {
  approx: boolean;
  notes: Set<string>;
  depth: number;
}
interface Ctx {
  st: CalcState;
  local: Record<string, number>;
  signs: number[];
  f: Flags;
}

const toRad = (x: number, c: Ctx) => (c.st.angle === 'deg' ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, c: Ctx) => (c.st.angle === 'deg' ? (x * 180) / Math.PI : x);
/** sin(π) is 1.2e-16 in floating point: show 0 */
const snap = (y: number, x: number) => (Math.abs(y) < 1e-15 * Math.max(1, Math.abs(x)) && Math.abs(x) > 1e-7 ? 0 : y);

interface NumFn {
  n: [number, number];
  f: (a: number[], c: Ctx) => number;
}
const fn1 = (f: (x: number, c: Ctx) => number): NumFn => ({ n: [1, 1], f: (a, c) => f(a[0], c) });
const sinR = (x: number, c: Ctx) => snap(Math.sin(toRad(x, c)), toRad(x, c));
const cosR = (x: number, c: Ctx) => snap(Math.cos(toRad(x, c)), toRad(x, c));
const tanR = (x: number, c: Ctx) => {
  const co = cosR(x, c);
  return co === 0 ? NaN : sinR(x, c) / co;
};

export const NUMERIC: Record<string, NumFn> = {
  sin: fn1(sinR),
  cos: fn1(cosR),
  tan: fn1(tanR),
  cot: fn1((x, c) => 1 / tanR(x, c)),
  sec: fn1((x, c) => 1 / cosR(x, c)),
  csc: fn1((x, c) => 1 / sinR(x, c)),
  asin: fn1((x, c) => fromRad(Math.asin(x), c)),
  acos: fn1((x, c) => fromRad(Math.acos(x), c)),
  atan: fn1((x, c) => fromRad(Math.atan(x), c)),
  arcsin: fn1((x, c) => fromRad(Math.asin(x), c)),
  arccos: fn1((x, c) => fromRad(Math.acos(x), c)),
  arctan: fn1((x, c) => fromRad(Math.atan(x), c)),
  atan2: { n: [2, 2], f: (a, c) => fromRad(Math.atan2(a[0], a[1]), c) },
  sinh: fn1(Math.sinh),
  cosh: fn1(Math.cosh),
  tanh: fn1(Math.tanh),
  sh: fn1(Math.sinh),
  ch: fn1(Math.cosh),
  th: fn1(Math.tanh),
  asinh: fn1(Math.asinh),
  acosh: fn1(Math.acosh),
  atanh: fn1(Math.atanh),
  argsh: fn1(Math.asinh),
  argch: fn1(Math.acosh),
  argth: fn1(Math.atanh),
  exp: fn1(Math.exp),
  ln: fn1(Math.log),
  log: { n: [1, 2], f: (a) => (a.length === 2 ? Math.log(a[0]) / Math.log(a[1]) : Math.log10(a[0])) },
  log10: fn1(Math.log10),
  log2: fn1(Math.log2),
  sqrt: fn1(Math.sqrt),
  cbrt: fn1(Math.cbrt),
  root4: fn1((x) => Math.pow(x, 0.25)),
  root: { n: [2, 2], f: (a) => (a[0] < 0 && Number.isInteger(a[1]) && a[1] % 2 ? -Math.pow(-a[0], 1 / a[1]) : Math.pow(a[0], 1 / a[1])) },
  abs: fn1(Math.abs),
  floor: fn1(Math.floor),
  ent: fn1(Math.floor),
  ceil: fn1(Math.ceil),
  round: { n: [1, 2], f: (a) => (a.length === 2 ? Math.round(a[0] * 10 ** a[1]) / 10 ** a[1] : Math.round(a[0])) },
  trunc: fn1(Math.trunc),
  sign: fn1(Math.sign),
  fpart: fn1((x) => x - Math.floor(x)),
  hypot: { n: [2, 8], f: (a) => Math.hypot(...a) },
  min: { n: [1, 64], f: (a) => Math.min(...a) },
  max: { n: [1, 64], f: (a) => Math.max(...a) },
  mean: { n: [1, 64], f: (a) => a.reduce((s, x) => s + x, 0) / a.length },
  moy: { n: [1, 64], f: (a) => a.reduce((s, x) => s + x, 0) / a.length },
  todeg: fn1((x) => (x * 180) / Math.PI),
  torad: fn1((x) => (x * Math.PI) / 180),
  fact: fn1(factorial),
  gamma: fn1(gamma),
  lngamma: fn1(lgamma),
  beta: { n: [2, 2], f: (a) => Math.exp(lgamma(a[0]) + lgamma(a[1]) - lgamma(a[0] + a[1])) * (a[0] > 0 && a[1] > 0 ? 1 : NaN) },
  zeta: fn1(zeta),
  erf: fn1(erf),
  erfc: fn1(erfc),
  binom: { n: [2, 2], f: (a) => binom(a[0], a[1]) },
  arr: { n: [2, 2], f: (a) => (needInt('arr', a[0], a[1]), a[1] > a[0] || a[1] < 0 ? 0 : Math.round(gamma(a[0] + 1) / gamma(a[0] - a[1] + 1))) },
  gcd: { n: [1, 64], f: (a) => (needInt('gcd', ...a), a.reduce(gcd2)) },
  pgcd: { n: [1, 64], f: (a) => (needInt('pgcd', ...a), a.reduce(gcd2)) },
  lcm: { n: [1, 64], f: (a) => (needInt('lcm', ...a), a.reduce((x, y) => (x && y ? Math.abs((x / gcd2(x, y)) * y) : 0))) },
  ppcm: { n: [1, 64], f: (a) => (needInt('ppcm', ...a), a.reduce((x, y) => (x && y ? Math.abs((x / gcd2(x, y)) * y) : 0))) },
  isprime: fn1((x) => (isPrime(x) ? 1 : 0)),
  nextprime: fn1((x) => {
    let p = Math.max(2, Math.floor(x) + 1);
    while (!isPrime(p)) p++;
    return p;
  }),
  prevprime: fn1((x) => {
    let p = Math.ceil(x) - 1;
    while (p >= 2 && !isPrime(p)) p--;
    return p >= 2 ? p : NaN;
  }),
  prime: fn1((n) => {
    needInt('prime', n);
    if (n < 1 || n > 300000) fail('prime(n) : 1 ≤ n ≤ 300 000');
    const lim = n < 6 ? 15 : Math.ceil(n * (Math.log(n) + Math.log(Math.log(n))));
    const s = sieve(lim);
    for (let p = 2, k = 0; p <= lim; p++) if (s[p] && ++k === n) return p;
    return NaN;
  }),
  primepi: fn1((x) => {
    if (x > 2e7) fail('primepi(x) : x ≤ 20 000 000');
    const s = sieve(Math.max(2, Math.floor(x)));
    let k = 0;
    for (let p = 2; p <= x; p++) k += s[p];
    return k;
  }),
  totient: fn1((n) => {
    if (n === 1) return 1;
    return factorize(n).reduce((r, [p, e]) => r * (p - 1) * p ** (e - 1), 1);
  }),
  fib: fn1((n) => {
    needInt('fib', n);
    if (n < 0) return (n % 2 ? 1 : -1) * NUMERIC.fib.f([-n], null as unknown as Ctx);
    let a = 0;
    let b = 1;
    for (let k = 0; k < n && Number.isFinite(a); k++) [a, b] = [b, a + b];
    return a;
  }),
  rand: { n: [0, 0], f: () => Math.random() },
  randint: { n: [2, 2], f: (a) => (needInt('randint', a[0], a[1]), a[0] + Math.floor(Math.random() * (a[1] - a[0] + 1))) },
};

/** functions whose result is shown as vrai / faux */
const BOOL_FNS = new Set(['isprime']);
const SPECIAL = new Set(['sum', 'prod', 'int', 'der', 'lim', 'solve']);
const TEXT_FNS = new Set(['factor', 'divisors']);

const withLocal = (c: Ctx, name: string, v: number): Ctx => ({ ...c, local: { ...c.local, [name]: v } });

function freeIds(n: Node, c: Ctx, out = new Set<string>()): Set<string> {
  switch (n.k) {
    case 'id':
      if (!(n.name in c.local) && !(n.name in c.st.vars) && !(n.name in CONST) && n.name !== 'ans') out.add(n.name);
      break;
    case 'neg':
    case 'abs':
    case 'post':
      freeIds(n.a, c, out);
      break;
    case 'bin':
    case 'cmp':
      freeIds(n.a, c, out);
      freeIds(n.b, c, out);
      break;
    case 'pm':
      if (n.a) freeIds(n.a, c, out);
      freeIds(n.b, c, out);
      break;
    case 'call':
      // the bound variable of a nested Σ / ∫ is not free
      if (SPECIAL.has(n.fn) && n.args[1]?.k === 'id' && n.args.length >= 3) {
        const inner = freeIds(n.args[0], c);
        inner.delete((n.args[1] as { name: string }).name);
        inner.forEach((x) => out.add(x));
        n.args.slice(2).forEach((a) => freeIds(a, c, out));
      } else n.args.forEach((a) => freeIds(a, c, out));
      break;
  }
  return out;
}

/** (expr, var, ...rest) or (expr, ...rest) with the variable inferred */
function bound(fn: string, args: Node[], full: number, c: Ctx, dflt: string): { e: Node; v: string; rest: Node[] } {
  if (args.length === full) {
    if (args[1].k !== 'id') fail(`${fn} : le 2e argument doit être la variable (ex. ${dflt})`);
    return { e: args[0], v: (args[1] as { name: string }).name, rest: args.slice(2) };
  }
  if (args.length === full - 1) {
    const free = [...freeIds(args[0], c)];
    if (free.length > 1) fail(`${fn} : préciser la variable (${free.join(', ')} ?)`);
    return { e: args[0], v: free[0] ?? dflt, rest: args.slice(1) };
  }
  return fail(`${fn} : ${full - 1} ou ${full} arguments`);
}

function lookup(name: string, c: Ctx): number {
  if (name in c.local) return c.local[name];
  if (name in c.st.vars) return c.st.vars[name];
  if (name === 'ans') {
    if (c.st.ans === null) fail('ans : aucun résultat précédent');
    return c.st.ans!;
  }
  if (name in CONST) return CONST[name];
  // a product of known names written without spaces: xy, pir, 2ab
  const known = [...Object.keys(c.local), ...Object.keys(c.st.vars), ...Object.keys(CONST)].sort((a, b) => b.length - a.length);
  const split = (s: string): string[] | null => {
    if (!s) return [];
    for (const k of known)
      if (s.startsWith(k)) {
        const r = split(s.slice(k.length));
        if (r) return [k, ...r];
      }
    return null;
  };
  const parts = name.length <= 12 ? split(name) : null;
  if (parts && parts.length > 1) return parts.reduce((p, q) => p * lookup(q, c), 1);
  if (NUMERIC[name] || SPECIAL.has(name) || name in c.st.fns) fail(`« ${name} » est une fonction : ${name}(…)`);
  return fail(`« ${name} » inconnu (le définir : ${name} = …)`);
}

function power(a: number, b: number): number {
  if (a < 0 && !Number.isInteger(b)) {
    const q = 1 / b;
    if (Math.abs(q - Math.round(q)) < 1e-9 && Math.round(q) % 2) return -Math.pow(-a, b);
  }
  return Math.pow(a, b);
}

function ev(n: Node, c: Ctx): number {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'id':
      return lookup(n.name, c);
    case 'neg':
      return -ev(n.a, c);
    case 'abs':
      return Math.abs(ev(n.a, c));
    case 'bin': {
      const a = ev(n.a, c);
      const b = ev(n.b, c);
      switch (n.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '^': return power(a, b);
        case 'mod': return ((a % b) + b) % b;
      }
      return NaN;
    }
    case 'pm': {
      const s = c.signs[n.i] * (n.minusFirst ? -1 : 1);
      return (n.a ? ev(n.a, c) : 0) + s * ev(n.b, c);
    }
    case 'post': {
      const a = ev(n.a, c);
      if (n.op === '!') return factorial(a);
      if (n.op === '%') return a / 100;
      if (n.op === '‰') return a / 1000;
      return c.st.angle === 'deg' ? a : (a * Math.PI) / 180;
    }
    case 'cmp': {
      const a = ev(n.a, c);
      const b = ev(n.b, c);
      const tol = 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));
      switch (n.op) {
        case '<': return a < b - tol ? 1 : 0;
        case '<=': return a <= b + tol ? 1 : 0;
        case '>': return a > b + tol ? 1 : 0;
        case '>=': return a >= b - tol ? 1 : 0;
        case '=':
        case '==': return Math.abs(a - b) <= tol ? 1 : 0;
        case '!=': return Math.abs(a - b) > tol ? 1 : 0;
        case '~=': return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b)) ? 1 : 0;
      }
      return NaN;
    }
    case 'call':
      return call(n, c);
  }
}

/** a 1-variable function of the user (f) or a built-in (sin), for derivatives f'(a) */
function asFunction(name: string, c: Ctx): (x: number) => number {
  const u = c.st.fns[name];
  if (u) {
    if (u.params.length !== 1) fail(`${name}′ : fonction d’une variable attendue`);
    return (x) => applyFn(name, [x], c);
  }
  const b = NUMERIC[name];
  if (b && b.n[0] <= 1 && b.n[1] >= 1) return (x) => b.f([x], c);
  return fail(`« ${name} » : fonction inconnue`);
}

function applyFn(name: string, vals: number[], c: Ctx): number {
  const u = c.st.fns[name];
  if (u) {
    if (vals.length !== u.params.length) fail(`${name} attend ${u.params.length} argument(s)`);
    const local: Record<string, number> = {};
    u.params.forEach((p, j) => (local[p] = vals[j]));
    return ev(parseCached(u.body), { ...c, local });
  }
  const b = NUMERIC[name];
  if (!b) return fail(`fonction inconnue « ${name} »`);
  if (vals.length < b.n[0] || vals.length > b.n[1]) fail(`« ${name} » attend ${b.n[0] === b.n[1] ? b.n[0] : `${b.n[0]} à ${b.n[1]}`} argument(s)`);
  return b.f(vals, c);
}

function call(n: Extract<Node, { k: 'call' }>, c: Ctx): number {
  if (++c.f.depth > 400) fail('récursion trop profonde');
  try {
    if (n.d > 0) {
      if (n.args.length !== 1) fail(`${n.fn}${"'".repeat(n.d)}(a) : un argument`);
      c.f.approx = true;
      c.f.notes.add('dérivée numérique (Ridders)');
      return derivative(asFunction(n.fn, c), ev(n.args[0], c), n.d);
    }
    if (TEXT_FNS.has(n.fn)) fail(`${n.fn}(…) donne un texte : l’utiliser seul`);
    switch (n.fn) {
      case 'sum':
      case 'prod':
        if (c.st.fns[n.fn]) break;
        return series(n, c);
      case 'int':
        if (c.st.fns[n.fn]) break;
        return integral(n, c);
      case 'der': {
        if (c.st.fns[n.fn]) break;
        const nArgs = n.args.length;
        const { e, v, rest } = nArgs === 4 ? { e: n.args[0], v: (n.args[1] as { name: string }).name, rest: n.args.slice(2) } : bound('der', n.args, 3, c, 'x');
        const at = ev(rest[0], c);
        const order = rest[1] ? ev(rest[1], c) : 1;
        c.f.approx = true;
        c.f.notes.add('dérivée numérique (Ridders)');
        return derivative((x) => ev(e, withLocal(c, v, x)), at, order);
      }
      case 'lim':
        if (c.st.fns[n.fn]) break;
        return limit(n, c);
      case 'solve':
        if (c.st.fns[n.fn]) break;
        return solve(n, c);
    }
    // x(x+1), π(2): a value followed by parentheses is a product
    if (!c.st.fns[n.fn] && !NUMERIC[n.fn] && n.args.length === 1) return lookup(n.fn, c) * ev(n.args[0], c);
    return applyFn(n.fn, n.args.map((a) => ev(a, c)), c);
  } finally {
    c.f.depth--;
  }
}

function series(n: Extract<Node, { k: 'call' }>, c: Ctx): number {
  const isSum = n.fn === 'sum';
  const { e, v, rest } = bound(isSum ? 'Σ' : '∏', n.args, 4, c, 'k');
  const lo = ev(rest[0], c);
  const hi = ev(rest[1], c);
  if (!Number.isInteger(lo) || (!Number.isInteger(hi) && hi !== Infinity)) fail(`${isSum ? 'Σ' : '∏'} : bornes entières attendues (la fin peut être ∞)`);
  const f = (k: number) => ev(e, withLocal(c, v, k));
  if (hi < lo) return isSum ? 0 : 1;
  if (hi !== Infinity) {
    if (hi - lo > 2e6) fail('trop de termes (plus de 2 millions)');
    if (!isSum) {
      let p = 1;
      for (let k = lo; k <= hi; k++) p *= f(k);
      return p;
    }
    let s = 0;
    let comp = 0;
    for (let k = lo; k <= hi; k++) {
      const y = f(k) - comp;
      const t = s + y;
      comp = t - s - y;
      s = t;
    }
    return s;
  }
  // infinite: partial sums (or log-products) up to 2^18 terms, then Aitken on S(2^16), S(2^17), S(2^18)
  c.f.approx = true;
  let s = 0;
  let comp = 0;
  let small = 0;
  const marks: number[] = [];
  let last = 0;
  for (let j = 0; j < 2 ** 18; j++) {
    const t = f(lo + j);
    if (!Number.isFinite(t)) fail(`${isSum ? 'Σ' : '∏'} : terme non défini pour ${v} = ${lo + j}`);
    const x = isSum ? t : Math.log(Math.abs(t));
    if (!isSum && t <= 0) fail('∏ infini : facteurs strictement positifs attendus');
    last = isSum ? t : t - 1;
    const y = x - comp;
    const u = s + y;
    comp = u - s - y;
    s = u;
    if (j > 20 && Math.abs(x) <= 1e-17 * Math.max(1e-300, Math.abs(s))) {
      if (++small > 40) {
        c.f.notes.add(`série convergée en ${j + 1} termes`);
        return isSum ? s : Math.exp(s);
      }
    } else small = 0;
    if (j + 1 === 2 ** 15 || j + 1 === 2 ** 16 || j + 1 === 2 ** 17 || j + 1 === 2 ** 18) marks.push(s);
  }
  if (Math.abs(last) > 1e-3 * Math.max(1, Math.abs(s))) fail(`${isSum ? 'la série' : 'le produit'} semble diverger (terme encore grand après 2¹⁸ termes)`);
  // error ≈ a·N^-p + b·N^-(p+1): Aitken on two triples of partial sums, then one Richardson step
  const [s1, s2, s3, s4] = marks;
  const d1 = s2 - s1;
  const d2 = s3 - s2;
  const d3 = s4 - s3;
  let lim = s4;
  if (d3 !== 0 && d2 !== 0) {
    const ra = d1 / d2;
    const rb = d2 / d3;
    if (!(rb > 1.05)) fail(`${isSum ? 'la série' : 'le produit'} semble diverger (somme partielle après 2¹⁸ termes : ${formatNumber(isSum ? s4 : Math.exp(s4))})`);
    const a1 = s3 + d2 / (ra - 1);
    const a2 = s4 + d3 / (rb - 1);
    lim = Number.isFinite(a1) ? (2 * rb * a2 - a1) / (2 * rb - 1) : a2;
    c.f.notes.add('2¹⁸ termes + extrapolation (Aitken puis Richardson)');
  }
  return isSum ? lim : Math.exp(lim);
}

function integral(n: Extract<Node, { k: 'call' }>, c: Ctx): number {
  const { e, v, rest } = bound('∫', n.args, 4, c, 'x');
  let a = ev(rest[0], c);
  let b = ev(rest[1], c);
  if (Number.isNaN(a) || Number.isNaN(b)) fail('∫ : bornes non définies');
  if (a === b) return 0;
  let sign = 1;
  if (a > b) {
    [a, b] = [b, a];
    sign = -1;
  }
  const f = (x: number) => ev(e, withLocal(c, v, x));
  let r: { v: number; ok: boolean };
  if (Number.isFinite(a) && Number.isFinite(b)) r = tanhSinh(f, a, b);
  else if (!Number.isFinite(a) && !Number.isFinite(b)) r = tanhSinh((u) => (f(u / (1 - u * u)) * (1 + u * u)) / (1 - u * u) ** 2, -1, 1);
  else if (!Number.isFinite(b)) r = tanhSinh((u) => f(a + u / (1 - u)) / (1 - u) ** 2, 0, 1);
  else r = tanhSinh((u) => f(b - u / (1 - u)) / (1 - u) ** 2, 0, 1);
  c.f.approx = true;
  c.f.notes.add(r.ok ? 'quadrature tanh-sinh' : 'quadrature tanh-sinh : convergence incertaine (intégrale impropre ou oscillante ?)');
  return sign * r.v;
}

function limit(n: Extract<Node, { k: 'call' }>, c: Ctx): number {
  const { e, v, rest } = bound('lim', n.args, 3, c, 'x');
  const a = ev(rest[0], c);
  const f = (x: number) => ev(e, withLocal(c, v, x));
  c.f.approx = true;
  c.f.notes.add('limite estimée numériquement (extrapolation de Richardson)');
  const snap0 = (x: number) => (Math.abs(x) < 1e-9 ? 0 : x);
  const side = (dir: 1 | -1): number => {
    // g(h) → the limit as h → 0+
    const g = Number.isFinite(a) ? (h: number) => f(a + dir * h * Math.max(1, Math.abs(a))) : (h: number) => f(Math.sign(a) / h);
    const near = g(1e-9);
    const far = g(1e-6);
    if (near === Infinity || near === -Infinity) return near;
    if (Math.abs(near) > 1e7 && Math.abs(near) > 10 * Math.abs(far) && Math.sign(near) === Math.sign(far)) return Math.sign(near) * Infinity;
    // smooth case (removable singularity, rational in h): Richardson
    const r = extrapolate(g, Number.isFinite(a) ? 1e-2 : 1e-3, 1);
    if (Number.isFinite(r.v) && r.err <= 1e-7 * Math.max(1, Math.abs(r.v))) return snap0(r.v);
    // otherwise (h ln h, hʰ…): the tail g(10⁻⁶) … g(10⁻¹²) must settle
    const t = [6, 7, 8, 9, 10, 11, 12].map((k) => g(10 ** -k));
    if (t.every(Number.isFinite)) {
      const dFirst = Math.abs(t[1] - t[0]);
      const dLast = Math.abs(t[6] - t[5]);
      if (dLast <= 1e-6 * Math.max(1, Math.abs(t[6])) && dLast <= dFirst) return snap0(t[6]);
    }
    return fail('limite non trouvée numériquement (oscillation ou divergence lente ?)');
  };
  if (!Number.isFinite(a)) return side(1);
  // a side where the function is not defined (ln x at 0⁻) does not count
  const defined = (dir: 1 | -1) => [1e-9, 1e-6, 1e-3].some((h) => !Number.isNaN(f(a + dir * h * Math.max(1, Math.abs(a)))));
  const dl = defined(-1);
  const dr = defined(1);
  if (!dl && !dr) fail('fonction non définie près de ce point');
  if (!dl || !dr) {
    c.f.notes.add(dr ? 'limite à droite (non définie à gauche)' : 'limite à gauche (non définie à droite)');
    return side(dr ? 1 : -1);
  }
  const L = side(1);
  const R = side(-1);
  const same = L === R || (Number.isFinite(L) && Number.isFinite(R) && Math.abs(L - R) <= 1e-6 * Math.max(1, Math.abs(L), Math.abs(R)));
  if (!same) fail(`pas de limite : à droite ≈ ${formatNumber(L, 8)}, à gauche ≈ ${formatNumber(R, 8)}`);
  return Number.isFinite(L) ? (L + R) / 2 : L;
}

function solve(n: Extract<Node, { k: 'call' }>, c: Ctx): number {
  const args = n.args;
  let e = args[0];
  if (e.k === 'cmp' && (e.op === '=' || e.op === '==')) e = { k: 'bin', op: '-', a: e.a, b: e.b };
  const hasVar = args[1]?.k === 'id' && !(args[1].name in c.st.vars) && !(args[1].name in CONST);
  const v = hasVar ? (args[1] as { name: string }).name : ([...freeIds(e, c)][0] ?? 'x');
  const rest = hasVar ? args.slice(2) : args.slice(1);
  if (rest.length < 1 || rest.length > 2) fail('solve(équation, x, a) ou solve(équation, x, a, b)');
  const F = (x: number) => ev(e, withLocal(c, v, x));
  c.f.approx = true;
  let x: number;
  if (rest.length === 2) {
    let a = ev(rest[0], c);
    let b = ev(rest[1], c);
    let fa = F(a);
    let fb = F(b);
    if (fa === 0) return a;
    if (fb === 0) return b;
    if (Math.sign(fa) === Math.sign(fb)) fail('solve : pas de changement de signe sur [a, b]');
    c.f.notes.add('dichotomie + sécante (Illinois)');
    let side = 0;
    x = a;
    for (let k = 0; k < 200; k++) {
      x = (a * fb - b * fa) / (fb - fa);
      const fx = F(x);
      if (fx === 0 || Math.abs(b - a) < 1e-15 * Math.max(1, Math.abs(x))) break;
      if (Math.sign(fx) === Math.sign(fb)) {
        b = x;
        fb = fx;
        if (side === -1) fa /= 2;
        side = -1;
      } else {
        a = x;
        fa = fx;
        if (side === 1) fb /= 2;
        side = 1;
      }
    }
  } else {
    x = ev(rest[0], c);
    c.f.notes.add('méthode de Newton');
    for (let k = 0; k < 100; k++) {
      const fx = F(x);
      const h = 1e-7 * Math.max(1, Math.abs(x));
      const d = (F(x + h) - F(x - h)) / (2 * h);
      if (!Number.isFinite(fx) || !Number.isFinite(d) || d === 0) break;
      const nx = x - fx / d;
      if (Math.abs(nx - x) <= 1e-15 * Math.max(1, Math.abs(x))) {
        x = nx;
        break;
      }
      x = nx;
    }
  }
  const res = Math.abs(F(x));
  if (!(res <= 1e-8 * Math.max(1, Math.abs(x)))) fail('solve : pas de solution trouvée près du point de départ');
  return Math.abs(x) < 1e-14 ? 0 : x;
}

function textFn(n: Extract<Node, { k: 'call' }>, c: Ctx): string {
  if (n.args.length !== 1) fail(`${n.fn}(n) : un argument`);
  const x = ev(n.args[0], c);
  if (n.fn === 'factor') {
    if (x === 1) return '1';
    if (x < 0) return `−1 · ${textFn({ ...n, args: [{ k: 'num', v: -x }] }, c)}`;
    return factorize(x)
      .map(([p, e]) => (e > 1 ? `${p}${sup(String(e))}` : String(p)))
      .join(' · ');
  }
  // divisors
  if (!Number.isInteger(x) || x < 1 || x > 1e15) fail('divisors : entier entre 1 et 10^15');
  let ds = [1];
  if (x > 1) for (const [p, e] of factorize(x)) ds = ds.flatMap((d) => Array.from({ length: e + 1 }, (_, j) => d * p ** j));
  ds.sort((a, b) => a - b);
  const shown = ds.length > 120 ? [...ds.slice(0, 60), '…', ...ds.slice(-20)] : ds;
  return `${shown.join(', ')}  (${ds.length} diviseurs)`;
}

// ── statements ────────────────────────────────────────────────────────────────────────────────

const RESERVED = (name: string) => name in CONST || name in NUMERIC || SPECIAL.has(name) || TEXT_FNS.has(name) || name === 'ans' || name === 'mod';

export function evaluate(src: string, st: CalcState): CalcResult {
  try {
    let s = normalize(src).trim();
    if (!s) fail('expression vide');
    if (/^[+*/^!]/.test(s) && st.ans !== null) s = `ans${s}`;
    const toks = tokenize(s);
    // f(x, y) = body
    const eqAt = toks.findIndex((t) => t.t === 'op' && (t.v === '=' || t.v === ':='));
    if (toks[0]?.t === 'id' && toks[1]?.t === 'op' && toks[1].v === '(' && eqAt > 3 && toks[eqAt - 1].t === 'op' && toks[eqAt - 1].v === ')') {
      const inner = toks.slice(2, eqAt - 1);
      const params: string[] = [];
      let okDef = inner.length > 0;
      inner.forEach((t, j) => {
        if (j % 2 === 0) t.t === 'id' && !/'/.test(t.v) ? params.push(t.v) : (okDef = false);
        else if (!(t.t === 'op' && t.v === ',')) okDef = false;
      });
      const name = toks[0].v as string;
      // sin(π) = 0 or f(π) = 3 are comparisons, not definitions
      if (okDef && inner.length % 2 === 1 && !RESERVED(name) && !/'/.test(name) && !params.some((p) => p in CONST)) {
        if (new Set(params).size !== params.length) fail('paramètres en double');
        const body = s.slice(toks[eqAt].p + String(toks[eqAt].v).length).trim();
        if (!body) fail('corps de la fonction vide');
        PARSED.delete(body);
        const prev = st.fns[name];
        st.fns[name] = { params, body };
        try {
          const node = parseCached(body);
          // unknown names surface now (a trial evaluation); domain errors do not matter here
          const probe: Ctx = { st, local: Object.fromEntries(params.map((p) => [p, 0.5])), signs: [], f: { approx: false, notes: new Set(), depth: 0 } };
          try {
            ev(node, probe);
          } catch (err) {
            if (err instanceof CalcError && /inconnu/.test(err.message)) fail(`dans ${name} : ${err.message.replace(/ \(le définir.*$/, '')} (paramètres : ${params.join(', ')})`);
            if (!(err instanceof CalcError) && !(err instanceof RangeError)) throw err;
          }
        } catch (err) {
          if (prev) st.fns[name] = prev;
          else delete st.fns[name];
          throw err;
        }
        const shown = src.slice(src.search(/[=≔]/) + 1).replace(/^=/, '').trim();
        return { ok: true, kind: 'define', name, params, body, shown, notes: [] };
      }
    }
    let assignTo: string | null = null;
    let body = toks;
    if (toks.length > 2 && toks[0].t === 'id' && toks[1].t === 'op' && (toks[1].v === '=' || toks[1].v === ':=')) {
      assignTo = toks[0].v as string;
      if (RESERVED(assignTo) || /'/.test(assignTo)) fail(`« ${assignTo} » est réservé (constante ou fonction)`);
      body = toks.slice(2);
    }
    const { node, pm } = parseTokens(body);
    if (pm > 4) fail('au plus 4 signes ± dans une expression');
    const flags: Flags = { approx: false, notes: new Set(), depth: 0 };
    const ctx: Ctx = { st, local: {}, signs: [], f: flags };
    if (node.k === 'call' && TEXT_FNS.has(node.fn)) {
      if (assignTo) fail(`${node.fn}(…) donne un texte, pas un nombre`);
      return { ok: true, kind: 'text', text: textFn(node, ctx), notes: [] };
    }
    const values: number[] = [];
    for (let m = 0; m < 1 << pm; m++) {
      ctx.signs = Array.from({ length: pm }, (_, j) => (m >> j) & 1 ? -1 : 1);
      const v = ev(node, ctx);
      if (!values.some((w) => w === v || Math.abs(w - v) <= 1e-14 * Math.max(1, Math.abs(v)))) values.push(v);
    }
    const notes = [...flags.notes];
    if (node.k === 'cmp' || (node.k === 'call' && BOOL_FNS.has(node.fn))) {
      if (values.length !== 1) fail('comparaison avec ± : ambigu');
      return { ok: true, kind: 'bool', value: values[0] === 1, approx: flags.approx, notes };
    }
    if (assignTo) {
      if (values.length !== 1) fail('affectation : une seule valeur attendue (pas de ±)');
      st.vars[assignTo] = values[0];
      st.ans = values[0];
      return { ok: true, kind: 'assign', name: assignTo, value: values[0], approx: flags.approx, notes };
    }
    if (values.length === 1 && Number.isFinite(values[0])) st.ans = values[0];
    return { ok: true, kind: 'num', values, approx: flags.approx, notes };
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, error: e.message };
    if (e instanceof RangeError) return { ok: false, error: 'calcul trop profond (récursion ?)' };
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** evaluate without touching the state (live preview) */
export function preview(src: string, st: CalcState): CalcResult {
  const copy: CalcState = { vars: { ...st.vars }, fns: { ...st.fns }, ans: st.ans, angle: st.angle };
  return evaluate(src, copy);
}

// ── display ───────────────────────────────────────────────────────────────────────────────────

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** human display: 1 307 674 368 000, 0.333333333333, 6.02214076 × 10²³, ∞, non défini */
export function formatNumber(v: number, digits = 12): string {
  if (Number.isNaN(v)) return 'non défini';
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  if (v === 0) return '0';
  const sgn = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (Number.isInteger(a) && a < 1e15) return sgn + (a >= 1e4 ? group(String(a)) : String(a));
  if (a >= 1e-5 && a < 1e15) {
    const s = a.toPrecision(digits);
    if (!s.includes('e')) return sgn + (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
  }
  const [m, e] = a.toExponential(digits - 1).split('e');
  const mant = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m;
  return `${sgn}${mant} × 10${sup(e)}`;
}

/** text that the parser reads back (copy, ans): 15 significant digits, e notation */
export function plainNumber(v: number): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'NaN' : v > 0 ? '∞' : '-∞';
  const s = Number(v.toPrecision(15)).toString();
  return s.replace('e+', 'e');
}

/** exact form recognised from a float (≈ 1e-11 relative): 3/4, π/6, √2/2, π²/6, (1+√5)/2, ln 2 … */
export function identify(v: number, tol = 1e-11): string | null {
  if (!Number.isFinite(v) || Number.isInteger(v) || Math.abs(v) > 1e6 || Math.abs(v) < 1e-6) return null;
  const close = (x: number, y: number) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x));
  const rat = (x: number, maxQ: number): [number, number] | null => {
    let h0 = 0;
    let h1 = 1;
    let k0 = 1;
    let k1 = 0;
    let y = x;
    for (let i = 0; i < 24; i++) {
      const a = Math.floor(y);
      const h2 = a * h1 + h0;
      const k2 = a * k1 + k0;
      if (k2 > maxQ) break;
      if (close(h2 / k2, x)) return [h2, k2];
      [h0, h1, k0, k1] = [h1, h2, k1, k2];
      const fr = y - a;
      if (fr < 1e-15) break;
      y = 1 / fr;
    }
    return null;
  };
  const minus = (p: number) => (p < 0 ? '−' : '');
  const frac = (p: number, q: number, sym: string) => {
    const ap = Math.abs(p);
    const num = sym ? (ap === 1 ? sym : `${ap}${sym}`) : String(ap);
    return `${minus(p)}${num}${q > 1 ? `/${q}` : ''}`;
  };
  const r = rat(v, 1000);
  if (r && r[1] > 1) return frac(r[0], r[1], '');
  const rp = rat(v / Math.PI, 60);
  if (rp && Math.abs(rp[0]) <= 200) return frac(rp[0], rp[1], 'π');
  const rp2 = rat(v / Math.PI ** 2, 200);
  if (rp2 && Math.abs(rp2[0]) <= 200) return frac(rp2[0], rp2[1], 'π²');
  // √ forms: v² = p/q → v = s√r / q'
  const r2 = rat(v * v, 100);
  if (r2 && r2[0] <= 10000) {
    const [p, q] = r2;
    let n = p * q;
    let s = 1;
    for (let f = 2; f * f <= n; f++) while (n % (f * f) === 0) (n /= f * f, (s *= f));
    if (n > 1) {
      const g = gcd2(s, q);
      const S = s / g;
      const Q = q / g;
      return `${v < 0 ? '−' : ''}${S > 1 ? S : ''}√${n}${Q > 1 ? `/${Q}` : ''}`;
    }
  }
  // quadratic surds (a ± √b)/c, golden ratio included
  for (let c = 1; c <= 12; c++)
    for (let b = 2; b <= 60; b++) {
      if ([4, 9, 16, 25, 36, 49].some((sq) => b % sq === 0)) continue;
      for (const sg of [1, -1]) {
        const a = v * c - sg * Math.sqrt(b);
        const ai = Math.round(a);
        if (Math.abs(ai) <= 50 && close(a, ai) && ai !== 0) {
          const g = gcd2(ai, c);
          if (g !== 1 && c > 1) continue;
          const body = `${ai < 0 ? '−' : ''}${Math.abs(ai)} ${sg > 0 ? '+' : '−'} √${b}`;
          return c > 1 ? `(${body})/${c}` : body.replace(/^−?\d+ /, (m) => m);
        }
      }
    }
  const re = rat(v / Math.E, 12);
  if (re && Math.abs(re[0]) <= 24) return frac(re[0], re[1], 'e');
  const ex = Math.exp(v);
  for (let k = 2; k <= 1000; k++) if (close(ex, k) && Math.abs(ex - k) <= 1e-9 * k) return `ln ${k}`;
  return null;
}

/** the result line as shown in the panel (and checked by the documented examples) */
export function formatResult(r: CalcResult): string {
  if (!r.ok) return r.error;
  switch (r.kind) {
    case 'num':
      return r.values.map((v) => formatNumber(v)).join(' ; ');
    case 'bool':
      return r.value ? 'vrai' : 'faux';
    case 'text':
      return r.text;
    case 'assign':
      return `${r.name} = ${formatNumber(r.value)}`;
    case 'define':
      return `${r.name}(${r.params.join(', ')}) = ${r.shown}`;
  }
}
