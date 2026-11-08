import { describe, expect, it } from 'vitest';
import { FB, detectMisiurewicz, fromNumber, referenceOrbit, refineMisiurewicz, toDecimal, toNumber } from '../src/math/bigfixed';

describe('high-precision fixed point', () => {
  it('round-trips doubles exactly', () => {
    for (const v of [0, 1, -0.75, 0.13182590420533, -1.754877666246693, 1e-30]) expect(toNumber(fromNumber(v))).toBe(v);
  });
  it('formats decimals', () => {
    expect(toDecimal(fromNumber(-0.5), 4)).toBe('−0.5000');
    expect(toDecimal(1n << BigInt(FB), 3)).toBe('1.000');
  });
  it('reference orbit matches float iteration', () => {
    const cr = -0.743643887037151;
    const ci = 0.13182590420533;
    const orbit = referenceOrbit({ x: fromNumber(cr), y: fromNumber(ci) }, 40);
    let x = 0;
    let y = 0;
    for (let n = 1; n <= 20; n++) {
      [x, y] = [x * x - y * y + cr, 2 * x * y + ci];
      expect(orbit[n * 2]).toBeCloseTo(x, 4);
      expect(orbit[n * 2 + 1]).toBeCloseTo(y, 4);
    }
  });
});

describe('Misiurewicz points', () => {
  it('detects c = i as M(2,2) and c = −2 as M(2,1)', () => {
    expect(detectMisiurewicz(0, 1)).toEqual([2, 2]);
    expect(detectMisiurewicz(-2, 0)).toEqual([2, 1]);
  });
  it('refines the real point M(3,1) ≈ −1.5436890126920764 to ~90 digits', () => {
    const kp = detectMisiurewicz(-1.5436890126920764, 0);
    expect(kp).not.toBeNull();
    const r = refineMisiurewicz(-1.5436890126920764, 0, kp![0], kp![1]);
    expect(r.residual).toBeLessThan(1e-60);
    expect(toDecimal(r.c.x, 20).startsWith('−1.54368901269207636')).toBe(true);
  });
  it('refines the antenna point near −0,1011 + 0,9563 i', () => {
    const kp = detectMisiurewicz(-0.1010963638456221, 0.9562865108091415);
    expect(kp).not.toBeNull();
    const r = refineMisiurewicz(-0.1010963638456221, 0.9562865108091415, kp![0], kp![1]);
    expect(r.residual).toBeLessThan(1e-60);
  });
});
