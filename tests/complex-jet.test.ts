import { describe, expect, it } from 'vitest';
import { compileComplex } from '../src/math/complex';
import { compile } from '../src/math/parser';
import { taylorCoefficients, radiusEstimate } from '../src/math/jet';

const coeffs = (src: string, x0 = 0, K = 8) => {
  const c = compile(src, ['x']);
  if (!c.ok) throw new Error(c.error);
  return Array.from(taylorCoefficients(c.ast, x0, K));
};
const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));

describe('complex compilation', () => {
  it('evaluates z² + i and Euler’s identity', () => {
    const f = compileComplex('z^2 + i');
    expect(f.ok).toBe(true);
    if (f.ok) {
      const [re, im] = f.fn([1, 1]);
      expect(re).toBeCloseTo(0);
      expect(im).toBeCloseTo(3);
    }
    const g = compileComplex('exp(i pi) + 1');
    if (g.ok) {
      const [re, im] = g.fn([0, 0]);
      expect(Math.hypot(re, im)).toBeLessThan(1e-12);
    }
  });
  it('emits GLSL with complex helpers', () => {
    const f = compileComplex('(z - 1)/(z + 1)');
    expect(f.ok && f.glsl.includes('c_div')).toBe(true);
    const g = compileComplex('z^3');
    expect(g.ok && g.glsl.includes('c_powi(z,3)')).toBe(true);
  });
  it('rejects real-only functions', () => {
    expect(compileComplex('floor(z)').ok).toBe(false);
  });
});

describe('Taylor jets (automatic differentiation)', () => {
  it('sin, exp, 1/(1−x), ln(1+x), atan, sqrt(1+x) at 0', () => {
    const near = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 12));
    near(coeffs('sin(x)'), [0, 1, 0, -1 / 6, 0, 1 / 120, 0, -1 / 5040, 0]);
    near(coeffs('exp(x)'), Array.from({ length: 9 }, (_, k) => 1 / fact(k)));
    near(coeffs('1/(1-x)'), Array(9).fill(1));
    near(coeffs('ln(1+x)'), [0, 1, -1 / 2, 1 / 3, -1 / 4, 1 / 5, -1 / 6, 1 / 7, -1 / 8]);
    near(coeffs('atan(x)'), [0, 1, 0, -1 / 3, 0, 1 / 5, 0, -1 / 7, 0]);
    near(coeffs('sqrt(1+x)', 0, 3), [1, 1 / 2, -1 / 8, 1 / 16]);
  });
  it('gives exact derivatives away from 0', () => {
    const c = coeffs('x^3', 2, 3);
    expect(c).toEqual([8, 12, 6, 1]);
  });
  it('estimates the radius of convergence', () => {
    expect(radiusEstimate(coeffs('1/(1+25x^2)', 0, 30))).toBeCloseTo(0.2, 1);
    expect(radiusEstimate(coeffs('exp(x)', 0, 30))).toBe(Infinity);
  });
});
