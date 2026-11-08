import { describe, expect, it } from 'vitest';
import { DIGITS } from '../src/data/digits';
import { continuedFraction } from '../src/math/contfrac';
import { adaptiveSimpson, ballVolume, riemann } from '../src/math/numeric';

const REF: Record<keyof typeof DIGITS, string> = {
  pi: '3.14159265358979323846264338327950288419716939937510',
  e: '2.71828182845904523536028747135266249775724709369995',
  phi: '1.61803398874989484820458683436563811772030917980576',
  sqrt2: '1.41421356237309504880168872420969807856967187537694',
  ln2: '0.69314718055994530941723212145817656807550013436025',
  zeta3: '1.20205690315959428539973816151144999076498629234049',
  gamma: '0.57721566490153286060651209008240243104215933593992',
};

describe('embedded decimals', () => {
  for (const k of Object.keys(REF) as (keyof typeof DIGITS)[]) {
    it(`${k} matches the 50-decimal reference and has 10 000 decimals`, () => {
      expect(DIGITS[k].startsWith(REF[k])).toBe(true);
      expect(DIGITS[k].split('.')[1].length).toBe(10000);
    });
  }
  it('π contains the Feynman point (six 9s from decimal 762)', () => {
    expect(DIGITS.pi.split('.')[1].slice(761, 767)).toBe('999999');
  });
});

describe('continued fractions', () => {
  it('φ = [1; 1, 1, 1, …]', () => {
    expect(continuedFraction(DIGITS.phi, 20)).toEqual(Array(20).fill(1));
  });
  it('√2 = [1; 2, 2, 2, …]', () => {
    expect(continuedFraction(DIGITS.sqrt2, 20)).toEqual([1, ...Array(19).fill(2)]);
  });
  it('e = [2; 1, 2, 1, 1, 4, 1, 1, 6, …]', () => {
    expect(continuedFraction(DIGITS.e, 12)).toEqual([2, 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8]);
  });
  it('π = [3; 7, 15, 1, 292, …]', () => {
    expect(continuedFraction(DIGITS.pi, 10)).toEqual([3, 7, 15, 1, 292, 1, 1, 1, 2, 1]);
  });
});

describe('numeric integration', () => {
  it('adaptive Simpson integrates sin on [0, π] to 2', () => {
    expect(adaptiveSimpson(Math.sin, 0, Math.PI)).toBeCloseTo(2, 10);
  });
  it('Riemann methods converge with the expected order', () => {
    const f = (x: number) => Math.exp(x);
    const I = Math.E - 1;
    const err = (m: Parameters<typeof riemann>[4], n: number) => Math.abs(riemann(f, 0, 1, n, m) - I);
    expect(err('left', 100) / err('left', 200)).toBeCloseTo(2, 1);
    expect(err('trap', 100) / err('trap', 200)).toBeCloseTo(4, 1);
    expect(err('simpson', 20) / err('simpson', 40)).toBeCloseTo(16, 0);
  });
  it('unit 4-ball volume is π²/2 and V5 is the maximum', () => {
    expect(ballVolume(4)).toBeCloseTo(Math.PI ** 2 / 2, 12);
    const v = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ballVolume(n));
    expect(Math.max(...v)).toBe(v[4]);
  });
});

import { zeta } from '../src/modules/principles/zeta-view';
describe('Riemann zeta (Borwein)', () => {
  it('ζ(2) = π²/6', () => {
    const [re, im] = zeta(2, 0);
    expect(re).toBeCloseTo(Math.PI ** 2 / 6, 9);
    expect(im).toBeCloseTo(0, 9);
  });
  it('vanishes at the first non-trivial zero ½ + 14,1347i', () => {
    const [re, im] = zeta(0.5, 14.134725141734693);
    expect(Math.hypot(re, im)).toBeLessThan(1e-6);
  });
});
