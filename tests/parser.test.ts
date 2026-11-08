import { describe, expect, it } from 'vitest';
import { compile } from '../src/math/parser';

const ev = (src: string, vars: string[], ...args: number[]) => {
  const c = compile(src, vars);
  if (!c.ok) throw new Error(c.error);
  return c.fn(...args);
};

describe('math parser', () => {
  it('respects precedence and associativity', () => {
    expect(ev('1+2*3', [])).toBe(7);
    expect(ev('2^3^2', [])).toBe(512);
    expect(ev('-x^2', ['x'], 3)).toBe(-9);
    expect(ev('(1+2)*3', [])).toBe(9);
    expect(ev('8/2/2', [])).toBe(2);
  });
  it('supports implicit multiplication', () => {
    expect(ev('2x', ['x'], 4)).toBe(8);
    expect(ev('2(x+1)', ['x'], 1)).toBe(4);
    expect(ev('(x+1)(x-1)', ['x'], 3)).toBe(8);
    expect(ev('xy', ['x', 'y'], 2, 5)).toBe(10);
    expect(ev('2pi', [])).toBeCloseTo(2 * Math.PI);
    expect(ev('3sin(x)', ['x'], Math.PI / 2)).toBeCloseTo(3);
  });
  it('knows functions, constants and unicode', () => {
    expect(ev('sqrt(16)+abs(-2)', [])).toBe(6);
    expect(ev('√2', [])).toBeCloseTo(Math.SQRT2);
    expect(ev('π', [])).toBeCloseTo(Math.PI);
    expect(ev('x²', ['x'], 3)).toBe(9);
    expect(ev('ln(e)', [])).toBeCloseTo(1);
    expect(ev('|x|', ['x'], -3)).toBe(3);
    expect(ev('max(1,5,3)', [])).toBe(5);
    expect(ev('mod(-1,3)', [])).toBe(2);
    expect(ev('e^x', ['x'], 1)).toBeCloseTo(Math.E);
  });
  it('reports errors in French with a position', () => {
    const a = compile('sin(x', ['x']);
    expect(a.ok).toBe(false);
    if (!a.ok) expect(a.error).toMatch(/Parenthèse/);
    const b = compile('foo(x)', ['x']);
    expect(b.ok).toBe(false);
    if (!b.ok) expect(b.error).toMatch(/inconnue/);
    const c = compile('q+1', ['x']);
    expect(c.ok).toBe(false);
  });
  it('emits GLSL with float literals and safe pow', () => {
    const c = compile('x^3 + 2y', ['x', 'y']);
    expect(c.ok).toBe(true);
    if (c.ok) {
      expect(c.glsl).toContain('vm_pow(x,3.0)');
      expect(c.glsl).toContain('2.0');
    }
    const d = compile('x^2', ['x']);
    if (d.ok) expect(d.glsl).toBe('((x)*(x))');
  });
  it('emits LaTeX', () => {
    const c = compile('sqrt(x)/2', ['x']);
    if (c.ok) expect(c.tex).toBe('\\frac{\\sqrt{x}}{2}');
  });
});
