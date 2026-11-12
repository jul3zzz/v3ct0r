import { describe, expect, it } from 'vitest';
import { counterexample, maxDev, optimalDelta, PROVER_EASY, PROVER_HARD, REFUTE, DUEL, type DuelLogic, type LimitFn } from '../src/games/duel';
import { eigenDirs, judge, lineGap, makeMatrix, EIGEN, type EigenLogic } from '../src/games/eigen';
import { GAMES, STORY_GAMES } from '../src/games/registry';
import { grade, rng } from '../src/games/types';

const fnByLabel = (list: LimitFn[], label: string, a?: number) => list.find((f) => f.label === label && (a === undefined || f.a === a))!;
const deg = (d: number) => (d * Math.PI) / 180;

describe('Duel ε-δ: the optimal δ is the one found by hand', () => {
  it('2x + 1 at 1: δ* = ε / 2', () => expect(optimalDelta(fnByLabel(PROVER_EASY, 'f(x) = 2x + 1'), 0.1)).toBeCloseTo(0.05, 4));
  it('x² at 2: δ* = √(4 + ε) − 2 (the steep side is on the right)', () => expect(optimalDelta(fnByLabel(PROVER_EASY, 'f(x) = x²'), 0.1)).toBeCloseTo(Math.sqrt(4.1) - 2, 4));
  it('1/x at 1/2: δ* = 1/2 − 1/(2 + ε)', () => expect(optimalDelta(fnByLabel(PROVER_HARD, 'f(x) = 1/x', 0.5), 0.2)).toBeCloseTo(0.5 - 1 / 2.2, 4));
  it('eˣ at 0: δ* = −ln(1 − ε)… the smaller side, ln(1 + ε)', () => expect(optimalDelta(fnByLabel(PROVER_HARD, 'f(x) = eˣ'), 0.01)).toBeCloseTo(Math.log(1.01), 4));
  it('x·sin(1/x) at 0: δ = ε always works (|f(x)| ≤ |x|), the optimum is a bit larger', () => {
    const fn = fnByLabel(PROVER_HARD, 'f(x) = x·sin(1/x)');
    expect(maxDev(fn, 0.05, 20000).dev).toBeLessThan(0.05);
    expect(optimalDelta(fn, 0.05)).toBeGreaterThanOrEqual(0.05);
  });

  it('every prover round is winnable, and a too large δ is caught with a counterexample', () => {
    for (const fn of [...PROVER_EASY, ...PROVER_HARD])
      for (const eps of [0.5, 0.1, 0.01]) {
        const d = optimalDelta(fn, eps);
        expect(d, `${fn.label} ε=${eps}`).toBeGreaterThan(0);
        expect(maxDev(fn, d * 0.98, 20000).dev, `${fn.label} ε=${eps}`).toBeLessThan(eps);
        if (d < 3.9) expect(maxDev(fn, d * 1.05, 20000).dev, `${fn.label} ε=${eps}`).toBeGreaterThanOrEqual(eps);
      }
  });

  it('level 3 is winnable: for ε = 0,9 × ε max, every δ of the machine has a counterexample near a sampled point', () => {
    for (const fn of REFUTE)
      for (const delta of [0.6, 0.15, 0.03, 0.006]) {
        const eps = (fn.epsMax ?? 1) * 0.9;
        let found = false;
        for (let k = 1; k < 4000 && !found; k++) {
          const x = fn.a + (k % 2 ? 1 : -1) * delta * (k / 4000);
          found = counterexample(fn, x, delta / 400, delta, eps).ok;
        }
        expect(found, `${fn.label} δ=${delta}`).toBe(true);
      }
  });

  it('a played prover round: near-optimal δ scores ≥ 95, a δ above the optimum scores 0', () => {
    const logic = DUEL.make() as DuelLogic;
    logic.start(0, 2, rng(5));
    const s = logic.state();
    logic.setDelta(s.dStar * 0.98);
    const ok = logic.submit(false)!;
    expect(ok.ok).toBe(true);
    expect(ok.score).toBeGreaterThanOrEqual(95);
    logic.setDelta(s.dStar * 1.3);
    const ko = logic.submit(false)!;
    expect(ko.ok).toBe(false);
    expect(ko.score).toBe(0);
  });
});

describe('Chasseur de directions propres', () => {
  it('exact eigen directions of the classic cases', () => {
    const sym = eigenDirs({ a: 2, b: 1, c: 1, d: 2 });
    expect(sym.kind).toBe('two');
    expect(sym.lambdas).toEqual([3, 1]);
    expect(Math.min(...sym.dirs.map((t) => lineGap(t, deg(45))))).toBeLessThan(1e-9);
    expect(Math.min(...sym.dirs.map((t) => lineGap(t, deg(135))))).toBeLessThan(1e-9);
    expect(eigenDirs({ a: 1, b: 1, c: 0, d: 1 }).kind).toBe('one');
    expect(eigenDirs({ a: 0, b: -1, c: 1, d: 0 }).kind).toBe('none');
    expect(eigenDirs({ a: 2, b: 0, c: 0, d: 2 }).kind).toBe('all');
  });

  it('A·v is parallel to v along every reported direction', () => {
    for (let s = 1; s < 60; s++) {
      const m = makeMatrix(s % 2 ? 'two' : 'sym', rng(s));
      for (const t of eigenDirs(m).dirs) {
        const [x, y] = [Math.cos(t), Math.sin(t)];
        const ax = m.a * x + m.b * y;
        const ay = m.c * x + m.d * y;
        expect(Math.abs(x * ay - y * ax), JSON.stringify(m)).toBeLessThan(1e-9);
      }
    }
  });

  it('the generator gives each kind of matrix, readable (|λ| ≤ 4)', () => {
    for (const kind of ['sym', 'two', 'one', 'none', 'all'] as const)
      for (let s = 1; s < 40; s++) {
        const m = makeMatrix(kind, rng(s * 31 + 7));
        const e = eigenDirs(m);
        expect(e.kind, `${kind} ${JSON.stringify(m)}`).toBe(kind === 'sym' ? 'two' : kind);
        for (const v of Object.values(m)) expect(Number.isInteger(v)).toBe(true);
      }
  });

  it('judging: exact locks 100, within 6° a lower score, beyond 6° or a wrong count 0', () => {
    const m = { a: 2, b: 1, c: 1, d: 2 };
    expect(judge(m, [deg(45), deg(135)], null).score).toBe(100);
    const close = judge(m, [deg(49), deg(133)], null);
    expect(close.ok).toBe(true);
    expect(close.score).toBeLessThan(100);
    expect(judge(m, [deg(52), deg(135)], null).ok).toBe(false);
    expect(judge(m, [deg(45)], null).ok).toBe(false);
    expect(judge(m, [], 'none').ok).toBe(false);
    expect(judge({ a: 0, b: -1, c: 1, d: 0 }, [], 'none').score).toBe(100);
    expect(judge({ a: 3, b: 0, c: 0, d: 3 }, [], 'all').score).toBe(100);
    expect(judge({ a: 1, b: 1, c: 0, d: 1 }, [0], null).score).toBe(100);
  });

  it('level 3 serves every trap once among its rounds', () => {
    const logic = EIGEN.make() as EigenLogic;
    const kinds = new Set<string>();
    for (let k = 0; k < 5; k++) {
      logic.start(2, k, rng(99));
      kinds.add(eigenDirs(logic.m).kind);
    }
    expect([...kinds].sort()).toEqual(['all', 'none', 'one', 'two']);
  });
});

describe('games registry', () => {
  it('each game: 3 levels, rules, a theorem, a known module', () => {
    for (const g of GAMES) {
      expect(g.levels.length).toBe(3);
      expect(g.rules.length).toBeGreaterThanOrEqual(2);
      expect(g.theorem.body.length).toBeGreaterThan(100);
      expect(['integrals', '4d', 'fractals', 'constants', 'principles', 'probability']).toContain(g.module);
    }
  });
  it('touch rules: given as soon as the rules name a key, a click or the wheel, and name none of them', () => {
    // words (any case) and key names (exact case) that only make sense with a keyboard or a mouse
    const device = (s: string) => /\bclic|\bclique|molette|\bmaj\b|⏎|←|→|↑|↓|touches? (maintenues|\d)/i.test(s) || /\b[A-Z]\/[A-Z]\b|(^|[.;] )[A-Z] : /.test(s);
    for (const g of [...GAMES, ...STORY_GAMES]) {
      if (!g.rules.some(device)) continue;
      expect(g.touchRules, g.id).toBeDefined();
      expect(g.touchRules!.length, g.id).toBe(g.rules.length);
      for (const r of g.touchRules!) expect(device(r), `${g.id}: ${r}`).toBe(false);
    }
    // every game's desktop rules name a key or a click today: the check above really ran on all 11
    expect([...GAMES, ...STORY_GAMES].filter((g) => g.rules.some(device)).length).toBe(11);
    expect([...GAMES, ...STORY_GAMES].filter((g) => g.touchRules).length).toBe(11);
  });
  it('grades', () => {
    expect([95, 80, 60, 40, 10].map(grade)).toEqual(['S', 'A', 'B', 'C', 'D']);
  });
});
