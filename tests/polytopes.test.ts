import { describe, expect, it } from 'vitest';
import { POLYTOPES, polytope } from '../src/math/polytopes';
import { alignRotation, apply4, dot4, rotation6 } from '../src/math/linalg4';

describe('regular 4-polytopes', () => {
  for (const info of POLYTOPES) {
    it(`${info.name} has V=${info.counts.v}, E=${info.counts.e} and Euler characteristic 0`, () => {
      const p = polytope(info.id);
      expect(p.vertices.length / 4).toBe(info.counts.v);
      expect(p.edges.length / 2).toBe(info.counts.e);
      const { v, e, f, c } = info.counts;
      expect(v - e + f - c).toBe(0);
      for (let i = 0; i < p.vertices.length; i += 4) {
        expect(Math.hypot(p.vertices[i], p.vertices[i + 1], p.vertices[i + 2], p.vertices[i + 3])).toBeCloseTo(1, 9);
      }
    });
  }
});

describe('4D rotations', () => {
  it('rotation6 is orthogonal', () => {
    const m = rotation6([0.3, -1.1, 0.7, 2.2, -0.4, 1.9]);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const rowI = [m[i * 4], m[i * 4 + 1], m[i * 4 + 2], m[i * 4 + 3]];
        const rowJ = [m[j * 4], m[j * 4 + 1], m[j * 4 + 2], m[j * 4 + 3]];
        expect(dot4(rowI, rowJ)).toBeCloseTo(i === j ? 1 : 0, 12);
      }
  });
  it('alignRotation maps the direction onto e_w', () => {
    const d: [number, number, number, number] = [0.5, 0.5, 0.5, 0.5];
    const r = apply4(alignRotation(d), d);
    expect(r[3]).toBeCloseTo(1, 12);
    expect(Math.hypot(r[0], r[1], r[2])).toBeCloseTo(0, 12);
  });
});
