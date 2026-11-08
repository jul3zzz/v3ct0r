import { describe, expect, it } from 'vitest';
import { evaluate, formatNumber, formatResult, identify, newState, gamma, zeta, erf, isPrime, factorize, tanhSinh, derivative } from '../src/calc/engine';
import { MNEMONICS, convertAt, flushAt, typeString } from '../src/calc/mnemonics';
import { FN_DOCS } from '../src/calc/docs';

const calc = (src: string, st = newState()) => evaluate(src, st);
const num = (src: string, st = newState()): number => {
  const r = calc(src, st);
  if (!r.ok) throw new Error(`${src}: ${r.error}`);
  if (r.kind === 'num') return r.values[0];
  if (r.kind === 'assign') return r.value;
  throw new Error(`${src}: ${r.kind}`);
};
const close = (a: number, b: number, tol = 1e-10) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));

describe('mnemonics', () => {
  it('turns words into symbols when a delimiter follows', () => {
    expect(typeString('V3 27')).toBe('∛ 27');
    expect(typeString('V(2)')).toBe('√(2)');
    expect(typeString('V2+V5')).toBe('√2+√5');
    expect(typeString('2pi')).toBe('2π');
    expect(typeString('AA x in RR')).toBe('∀ x ∈ ℝ');
    expect(typeString('alpha+beta')).toBe('α+β');
    expect(typeString('sum(1/k^2, k, 1, inf)')).toBe('Σ(1/k², k, 1, ∞)');
    expect(typeString('!EE x')).toBe('∄ x');
  });
  it('keeps words that only contain a mnemonic', () => {
    expect(typeString('sin(x)')).toBe('sin(x)');
    expect(typeString('min(1, 2)')).toBe('min(1, 2)');
    expect(typeString('primepi(10)')).toBe('primepi(10)');
    expect(typeString('divisors(6)')).toBe('divisors(6)');
    expect(typeString('foo+1')).toBe('foo+1');
  });
  it('waits for the longest symbol sequence', () => {
    expect(typeString('a <= b')).toBe('a ≤ b');
    expect(typeString('P <=> Q')).toBe('P ⇔ Q');
    expect(typeString('x -> 0')).toBe('x → 0');
    expect(typeString('x |-> x')).toBe('x ↦ x');
    expect(typeString('a != b')).toBe('a ≠ b');
    expect(typeString('3+-2')).toBe('3±2');
    expect(typeString('|-3|')).toBe('|-3|');
    expect(typeString('a...b')).toBe('a…b');
  });
  it('writes superscripts and subscripts', () => {
    expect(typeString('x^2+1')).toBe('x²+1');
    expect(typeString('2^-1')).toBe('2⁻¹');
    expect(typeString('u_n+1')).toBe('uₙ+1');
    expect(typeString('e^(ix)')).toBe('e^(ix)');
    expect(typeString('2^3.5')).toBe('2^3.5');
  });
  it('flushes on Tab and keeps the caret', () => {
    expect(flushAt('2pi', 3)).toEqual({ text: '2π', caret: 2 });
    expect(flushAt('a<=', 3)).toEqual({ text: 'a≤', caret: 2 });
    expect(convertAt('pi', 2)).toEqual({ text: 'pi', caret: 2 });
  });
  it('has unique keys, and every key types its own symbol', () => {
    const keys = MNEMONICS.map((m) => m.k);
    expect(new Set(keys).size).toBe(keys.length);
    for (const m of MNEMONICS) {
      if (m.k === 'EE!' || m.k === '^12') continue;
      expect(typeString(` ${m.k} `).trim(), m.k).toBe(m.s);
    }
  });
});

describe('calculator engine', () => {
  it('follows the usual precedence', () => {
    expect(num('2+3*4')).toBe(14);
    expect(num('-2^2')).toBe(-4);
    expect(num('2^3^2')).toBe(512);
    expect(num('2(3+4)')).toBe(14);
    expect(num('(1+2)(3+4)')).toBe(21);
    expect(num('6/2(1+2)')).toBe(9);
    expect(num('√16 + ∛27')).toBe(7);
    expect(num('2π')).toBeCloseTo(2 * Math.PI, 14);
    expect(num('x²', { ...newState(), vars: { x: 3 } })).toBe(9);
    expect(num('5!')).toBe(120);
    expect(num('(-8)^(1/3)')).toBeCloseTo(-2, 14);
  });
  it('keeps variables, functions and ans', () => {
    const st = newState();
    expect(num('a = 4', st)).toBe(4);
    expect(num('3a', st)).toBe(12);
    expect(num('*2', st)).toBe(24);
    expect(calc('f(x) = x² + a', st).ok).toBe(true);
    expect(num('f(3)', st)).toBe(13);
    expect(calc('g(x, y) = x y', st).ok).toBe(true);
    expect(num('g(2, 5)', st)).toBe(10);
    close(num("f'(3)", st), 6, 1e-9);
    close(num("f''(1)", st), 2, 1e-7);
    expect(num('x(x+1)', { ...newState(), vars: { x: 2 } })).toBe(6);
    const bad = calc('h(x) = x + zz', st);
    expect(bad.ok).toBe(false);
    expect(st.fns.h).toBeUndefined();
    expect(calc('pi = 3', st).ok).toBe(false);
  });
  it('compares and reports booleans', () => {
    expect(formatResult(calc('π² < 10'))).toBe('vrai');
    expect(formatResult(calc('0.1 + 0.2 = 0.3'))).toBe('vrai');
    expect(formatResult(calc('sin(π) = 0'))).toBe('vrai');
    expect(formatResult(calc('2 ≠ 2'))).toBe('faux');
  });
  it('gives both values of ±', () => {
    const r = calc('(-2 ± √16)/2');
    expect(r.ok && r.kind === 'num' && r.values).toEqual([1, -3]);
  });
  it('switches angle units', () => {
    const st = newState();
    st.angle = 'deg';
    expect(num('sin(30)', st)).toBeCloseTo(0.5, 14);
    expect(num('atan(1)', st)).toBeCloseTo(45, 12);
    expect(num('sin(30°)', newState())).toBeCloseTo(0.5, 14);
    expect(num('sin(π)')).toBe(0);
    expect(formatNumber(num('tan(π/2)'))).toBe('non défini');
  });
  it('sums series, finite and infinite', () => {
    expect(num('Σ(k, k, 1, 100)')).toBe(5050);
    close(num('Σ(1/k², k, 1, ∞)'), Math.PI ** 2 / 6, 1e-9);
    close(num('Σ(1/k!, k, 0, ∞)'), Math.E, 1e-14);
    close(num('Σ((-1)^(k+1)/k, k, 1, ∞)'), Math.LN2, 1e-9);
    expect(calc('Σ(1/k, k, 1, ∞)').ok).toBe(false);
    close(num('∏(1 - 1/k², k, 2, ∞)'), 0.5, 1e-8);
    expect(num('Σ(n², 1, 3)')).toBe(14);
  });
  it('integrates, with singular ends and infinite bounds', () => {
    close(num('∫(x², x, 0, 3)'), 9, 1e-12);
    close(num('∫(1/√x, x, 0, 1)'), 2, 1e-9);
    close(num('∫(e^(-x²), x, -∞, ∞)'), Math.sqrt(Math.PI), 1e-10);
    close(num('∫(1/x², x, 1, ∞)'), 1, 1e-10);
    close(num('∫(sin(x), 0, π)'), 2, 1e-12);
    close(num('∫(ln(x), x, 0, 1)'), -1, 1e-9);
    close(num('∫(x, x, 2, 0)'), -2, 1e-12);
    expect(tanhSinh((x) => 4 / (1 + x * x), 0, 1).v).toBeCloseTo(Math.PI, 13);
  });
  it('differentiates, takes limits and solves', () => {
    close(num('der(x³, x, 2)'), 12, 1e-9);
    close(num('der(sin(x), x, 0, 2)'), 0, 1e-7);
    close(derivative(Math.exp, 1, 1), Math.E, 1e-11);
    close(num('lim(sin(x)/x, x, 0)'), 1, 1e-9);
    close(num('lim((1+1/x)^x, x, ∞)'), Math.E, 1e-7);
    close(num('lim((1-cos(x))/x², x, 0)'), 0.5, 1e-7);
    expect(num('lim(x ln(x), x, 0)')).toBe(0);
    expect(num('lim(1/x², x, 0)')).toBe(Infinity);
    expect(calc('lim(1/x, x, 0)').ok).toBe(false);
    expect(calc('lim(sin(x), x, ∞)').ok).toBe(false);
    close(num('solve(x² = 2, x, 1)'), Math.SQRT2, 1e-14);
    close(num('solve(cos(x) - x, x, 0, 1)'), 0.7390851332151607, 1e-13);
    expect(calc('solve(x² + 1, x, 0)').ok).toBe(false);
  });
  it('handles number theory exactly', () => {
    expect(isPrime(2 ** 31 - 1)).toBe(true);
    expect(isPrime(2 ** 53 - 111)).toBe(true);
    expect(isPrime(561)).toBe(false);
    expect(factorize(2 ** 53 - 1)).toEqual([[6361, 1], [69431, 1], [20394401, 1]]);
    expect(formatResult(calc('factor(360)'))).toBe('2³ · 3² · 5');
    expect(num('gcd(84, 120, 36)')).toBe(12);
    expect(num('lcm(4, 6, 10)')).toBe(60);
    expect(num('prime(1000)')).toBe(7919);
    expect(num('primepi(10^6)')).toBe(78498);
    expect(num('totient(97)')).toBe(96);
    expect(num('fib(50)')).toBe(12586269025);
    expect(num('binom(52, 5)')).toBe(2598960);
  });
  it('computes special functions accurately', () => {
    close(gamma(0.5), Math.sqrt(Math.PI), 1e-14);
    close(gamma(5), 24, 1e-15);
    close(gamma(-1.5), (4 * Math.sqrt(Math.PI)) / 3, 1e-13);
    close(zeta(2), Math.PI ** 2 / 6, 1e-14);
    close(zeta(3), 1.2020569031595942, 1e-14);
    close(zeta(0), -0.5, 1e-14);
    close(zeta(-1), -1 / 12, 1e-13);
    expect(Math.abs(zeta(-2))).toBeLessThan(1e-15);
    close(erf(1), 0.8427007929497149, 1e-14);
    close(erf(3), 0.9999779095030014, 1e-15);
    close(1 - erf(4), 1.541725790028002e-8, 1e-6);
  });
  it('recognises exact forms', () => {
    expect(identify(0.75)).toBe('3/4');
    expect(identify(-Math.PI / 2)).toBe('−π/2');
    expect(identify(3 * Math.PI / 4)).toBe('3π/4');
    expect(identify(Math.SQRT1_2)).toBe('√2/2');
    expect(identify(Math.sqrt(8))).toBe('2√2');
    expect(identify(Math.PI ** 2 / 6)).toBe('π²/6');
    expect(identify((1 + Math.sqrt(5)) / 2)).toBe('(1 + √5)/2');
    expect(identify(Math.LN2)).toBe('ln 2');
    expect(identify(Math.E)).toBe('e');
    expect(identify(0.123456789)).toBeNull();
  });
  it('formats numbers for reading', () => {
    expect(formatNumber(3628800)).toBe('3 628 800');
    expect(formatNumber(1 / 3)).toBe('0.333333333333');
    expect(formatNumber(6.02214076e23)).toBe('6.02214076 × 10²³');
    expect(formatNumber(-1.5e-8)).toBe('−1.5 × 10⁻⁸');
    expect(formatNumber(Infinity)).toBe('∞');
  });
  it('reports errors in French', () => {
    for (const bad of ['2+', '(1+2', 'sin', 'zz + 1', '∀x', 'Σ(1/k, k, 1.5, 3)']) {
      const r = calc(bad);
      expect(r.ok, bad).toBe(false);
    }
  });
  it('runs every documented example', () => {
    const st = newState();
    for (const d of FN_DOCS) {
      const r = evaluate(typeString(d.ex), st);
      expect(r.ok ? formatResult(r).replace(/ /g, ' ') : r.error, d.ex).toBe(d.res);
    }
  });
});
