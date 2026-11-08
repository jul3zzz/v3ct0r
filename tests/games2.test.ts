import { describe, expect, it } from 'vitest';
import { amp2, bestSet, captured, curveAt, FOURIER, FREQS, randomSpectrum, symmetricSpectrum, type FourierLogic, type Spectrum } from '../src/games/fourier';
import { ID4, mul4, PLANES, PILOT4D, project, rot4, silhouetteGap, type M4, type Pilot4DLogic } from '../src/games/pilot4d';
import { rng } from '../src/games/types';

/** ∫₀¹ |γ − γ_S|² dt, sampled */
const l2gap = (spec: Spectrum, S: number[]) => {
  let s = 0;
  const N = 2048;
  for (let k = 0; k < N; k++) {
    const [x, y] = curveAt(spec, null, k / N);
    const [u, v] = curveAt(spec, S, k / N);
    s += (x - u) ** 2 + (y - v) ** 2;
  }
  return s / N;
};

describe('Peintre de Fourier', () => {
  it('Parseval: the squared L² error is the energy of the frequencies left out', () => {
    for (let seed = 1; seed < 8; seed++) {
      const spec = randomSpectrum(rng(seed), 3);
      const S = bestSet(spec, 2);
      const left = [...spec.entries()].filter(([n]) => !S.includes(n)).reduce((s, [, c]) => s + amp2(c), 0);
      expect(l2gap(spec, S)).toBeCloseTo(left, 8);
    }
  });

  it('the K largest coefficients beat every other choice of K frequencies', () => {
    const spec = randomSpectrum(rng(42), 5);
    const best = captured(spec, bestSet(spec, 5));
    const r = rng(7);
    for (let k = 0; k < 300; k++) {
      const S = [...FREQS].sort(() => r() - 0.5).slice(0, 5);
      expect(captured(spec, S)).toBeLessThanOrEqual(best + 1e-12);
    }
  });

  it('the dominant frequencies are clearly separated (the optimum can be seen)', () => {
    for (let seed = 1; seed < 30; seed++) {
      const spec = randomSpectrum(rng(seed), 3);
      const a = [...spec.values()].map(amp2).sort((p, q) => q - p);
      expect(a[2], `seed ${seed}`).toBeGreaterThan(a[3] * 1.7);
    }
  });

  it('k-fold symmetry: only n ≡ 1 (mod k), and γ(t + 1/k) = e^{2iπ/k} γ(t)', () => {
    for (const k of [3, 4, 5, 6]) {
      const spec = symmetricSpectrum(rng(k), k, 4);
      for (const [n, c] of spec) if (amp2(c) > 0) expect((((n - 1) % k) + k) % k, `k=${k} n=${n}`).toBe(0);
      for (const t of [0.1, 0.37, 0.8]) {
        const [x, y] = curveAt(spec, null, t);
        const [u, v] = curveAt(spec, null, t + 1 / k);
        const a = (2 * Math.PI) / k;
        expect(u).toBeCloseTo(x * Math.cos(a) - y * Math.sin(a), 9);
        expect(v).toBeCloseTo(x * Math.sin(a) + y * Math.cos(a), 9);
      }
    }
  });

  it('the heart: its 20 coefficients redraw it exactly (a trigonometric curve of degree 4)', () => {
    const logic = FOURIER.make() as FourierLogic;
    logic.start(1, 2, rng(1));
    for (let k = 0; k < 64; k++) {
      const t = (2 * Math.PI * k) / 64;
      const [x, y] = curveAt(logic.spec, null, k / 64);
      expect(x).toBeCloseTo((16 * Math.sin(t) ** 3) / 17, 9);
      expect(y).toBeCloseTo((13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17, 9);
    }
  });

  it('a played round: the best set scores 100, a poor set less', () => {
    const logic = FOURIER.make() as FourierLogic;
    logic.start(0, 0, rng(3));
    logic.picks = bestSet(logic.spec, 3);
    expect(logic.submit(false).score).toBe(100);
    logic.picks = [...FREQS].filter((n) => !bestSet(logic.spec, 3).includes(n)).slice(0, 3);
    const poor = logic.submit(false);
    expect(poor.score).toBeLessThan(50);
    expect(poor.ok).toBe(false);
  });
});

const close = (a: M4, b: M4) => a.every((x, i) => Math.abs(x - b[i]) < 1e-12);

describe('Pilote 4D', () => {
  it('plane rotations are orthogonal', () => {
    for (const p of Object.values(PLANES)) {
      const r = rot4(p, 0.7);
      const rt = [0, 1, 2, 3].flatMap((i) => [0, 1, 2, 3].map((j) => r[j * 4 + i]));
      expect(close(mul4(r, rt), ID4)).toBe(true);
    }
  });

  it('XW then YW differs from YW then XW; XY and ZW (orthogonal planes) commute', () => {
    const a = rot4(PLANES.XW, 0.8);
    const b = rot4(PLANES.YW, 0.5);
    expect(close(mul4(a, b), mul4(b, a))).toBe(false);
    const c = rot4(PLANES.XY, 0.8);
    const d = rot4(PLANES.ZW, 0.5);
    expect(close(mul4(c, d), mul4(d, c))).toBe(true);
  });

  it('a quarter turn maps the tesseract onto itself: same silhouette, gap 0', () => {
    expect(silhouetteGap(project(ID4), project(rot4(PLANES.XW, Math.PI / 2)))).toBeLessThan(1e-9);
    expect(silhouetteGap(project(ID4), project(rot4(PLANES.XW, 0.6)))).toBeGreaterThan(0.05);
  });

  it('targets start far from the identity, and reaching the target wins with 100', () => {
    for (let level = 0; level < 3; level++)
      for (let seed = 1; seed < 6; seed++) {
        const logic = PILOT4D.make() as Pilot4DLogic;
        logic.start(level, 0, rng(seed * 13 + level));
        expect(logic.gap(), `level ${level + 1} seed ${seed}`).toBeGreaterThan(0.1);
        logic.m = [...logic.target];
        expect(logic.gap()).toBeLessThan(1e-9);
        expect(logic.submit(false).score).toBe(100);
      }
  });

  it('holding a key turns the tesseract (and the auto-lock fires on the target)', () => {
    const logic = PILOT4D.make() as Pilot4DLogic;
    logic.start(0, 0, rng(1));
    const g0 = logic.gap();
    logic.key({ code: 'KeyD' } as KeyboardEvent);
    logic.tick(0.3);
    expect(logic.gap()).not.toBeCloseTo(g0, 6);
    logic.keyUp(null);
    logic.m = [...logic.target];
    logic.tick(0.2);
    logic.tick(0.2);
    expect(logic.poll()?.score).toBe(100);
  });
});
