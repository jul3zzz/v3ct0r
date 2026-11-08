import { DIGITS } from '../../data/digits';
import { continuedFraction } from '../../math/contfrac';

export type ConstId = keyof typeof DIGITS;

export interface ConstInfo {
  id: ConstId;
  sym: string;
  name: string;
  value: number;
  digits: string;
  def: string;
  nature: string;
  seriesLabel: string;
  /** n-th approximation of a classic series / sequence */
  approx: (n: number) => number;
}

const memo = <T,>(f: (n: number) => T) => {
  const c = new Map<number, T>();
  return (n: number) => {
    if (!c.has(n)) c.set(n, f(n));
    return c.get(n)!;
  };
};

export const CONSTANTS: ConstInfo[] = [
  {
    id: 'pi',
    sym: 'π',
    name: 'PI',
    value: Math.PI,
    digits: DIGITS.pi,
    def: '\\pi = \\frac{\\text{périmètre}}{\\text{diamètre}}',
    nature: 'TRANSCENDANT (LINDEMANN 1882)',
    seriesLabel: 'LEIBNIZ 4Σ(−1)ᵏ/(2k+1)',
    approx: memo((n) => {
      let s = 0;
      for (let k = 0; k < n; k++) s += (k % 2 ? -1 : 1) / (2 * k + 1);
      return 4 * s;
    }),
  },
  {
    id: 'phi',
    sym: 'φ',
    name: 'NOMBRE D’OR',
    value: (1 + Math.sqrt(5)) / 2,
    digits: DIGITS.phi,
    def: '\\varphi=\\frac{1+\\sqrt5}{2},\\quad \\varphi^2=\\varphi+1',
    nature: 'ALGÉBRIQUE DE DEGRÉ 2',
    seriesLabel: 'FIBONACCI Fₙ₊₁/Fₙ',
    approx: memo((n) => {
      let a = 1;
      let b = 1;
      for (let k = 1; k < n; k++) [a, b] = [b, a + b];
      return b / a;
    }),
  },
  {
    id: 'sqrt2',
    sym: '√2',
    name: 'RACINE DE DEUX',
    value: Math.SQRT2,
    digits: DIGITS.sqrt2,
    def: '\\sqrt2 = \\text{diagonale du carré unité}',
    nature: 'ALGÉBRIQUE IRRATIONNEL',
    seriesLabel: 'PELL pₙ/qₙ',
    approx: memo((n) => {
      let p = 1;
      let q = 1;
      for (let k = 1; k < n; k++) [p, q] = [p + 2 * q, p + q];
      return p / q;
    }),
  },
  {
    id: 'e',
    sym: 'e',
    name: 'NOMBRE D’EULER',
    value: Math.E,
    digits: DIGITS.e,
    def: 'e=\\lim_{n\\to\\infty}\\left(1+\\tfrac1n\\right)^n=\\sum_{k\\ge0}\\frac1{k!}',
    nature: 'TRANSCENDANT (HERMITE 1873)',
    seriesLabel: 'Σ 1/k!',
    approx: memo((n) => {
      let s = 0;
      let t = 1;
      for (let k = 0; k < n; k++) {
        s += t;
        t /= k + 1;
      }
      return s;
    }),
  },
  {
    id: 'gamma',
    sym: 'γ',
    name: 'EULER-MASCHERONI',
    value: 0.5772156649015329,
    digits: DIGITS.gamma,
    def: '\\gamma=\\lim_{n\\to\\infty}\\Big(\\sum_{k=1}^n\\frac1k-\\ln n\\Big)',
    nature: 'IRRATIONALITÉ NON PROUVÉE',
    seriesLabel: 'Hₙ − ln n',
    approx: memo((n) => {
      let h = 0;
      for (let k = 1; k <= n; k++) h += 1 / k;
      return h - Math.log(n);
    }),
  },
  {
    id: 'zeta3',
    sym: 'ζ(3)',
    name: 'CONSTANTE D’APÉRY',
    value: 1.2020569031595942,
    digits: DIGITS.zeta3,
    def: '\\zeta(3)=\\sum_{n\\ge1}\\frac1{n^3}',
    nature: 'IRRATIONNEL (APÉRY 1978)',
    seriesLabel: 'Σ 1/n³',
    approx: memo((n) => {
      let s = 0;
      for (let k = 1; k <= n; k++) s += 1 / (k * k * k);
      return s;
    }),
  },
  {
    id: 'ln2',
    sym: 'ln 2',
    name: 'LOGARITHME DE 2',
    value: Math.LN2,
    digits: DIGITS.ln2,
    def: '\\ln 2=\\int_1^2\\frac{dx}{x}=\\sum_{k\\ge1}\\frac{(-1)^{k+1}}{k}',
    nature: 'TRANSCENDANT',
    seriesLabel: 'Σ (−1)ᵏ⁺¹/k',
    approx: memo((n) => {
      let s = 0;
      for (let k = 1; k <= n; k++) s += (k % 2 ? 1 : -1) / k;
      return s;
    }),
  },
];

export const byId = (id: ConstId): ConstInfo => CONSTANTS.find((c) => c.id === id)!;

const cfCache = new Map<ConstId, number[]>();
export function cfOf(id: ConstId, terms = 24): number[] {
  if (!cfCache.has(id)) cfCache.set(id, continuedFraction(byId(id).digits, 60));
  return cfCache.get(id)!.slice(0, terms);
}

export function cfString(cf: number[], n = 10): string {
  const [a0, ...rest] = cf;
  return `[${a0}; ${rest.slice(0, n - 1).join(', ')}${rest.length > n - 1 ? ', …' : ''}]`;
}

/** Number of correct decimals of x compared to the reference digit string. */
export function correctDigits(x: number, ref: string): number {
  const s = x.toFixed(15);
  let i = 0;
  while (i < s.length && s[i] === ref[i]) i++;
  const dot = ref.indexOf('.');
  return Math.max(0, i - dot - 1);
}
