import { describe, expect, it } from 'vitest';
import { MODULES } from '../src/modules/registry';
import { parseAnswer, parseHudNumber } from '../src/core/study';
import { Progress } from '../src/core/progress';

describe('lessons and exercises', () => {
  for (const mod of MODULES) {
    for (const viz of mod.vizs) {
      it(`${mod.id}/${viz.id} has a lesson and 3 well-formed exercises`, () => {
        const s = mod.study?.[viz.id];
        expect(s, 'missing study').toBeDefined();
        const { lesson, exercises } = s!;
        expect(lesson.objective.length).toBeGreaterThan(20);
        expect(lesson.notions.length).toBeGreaterThanOrEqual(3);
        expect(lesson.observe.length).toBeGreaterThanOrEqual(2);
        expect(lesson.formula.length).toBeGreaterThan(3);
        expect(lesson.fact.length).toBeGreaterThan(20);
        expect(exercises).toHaveLength(3);
        for (const ex of exercises) {
          expect(ex.q.length).toBeGreaterThan(5);
          expect(ex.hint.length).toBeGreaterThan(3);
          expect(ex.explain.length).toBeGreaterThan(3);
          if (ex.kind === 'qcm') {
            expect(ex.choices.length).toBeGreaterThanOrEqual(2);
            expect(ex.answer).toBeGreaterThanOrEqual(0);
            expect(ex.answer).toBeLessThan(ex.choices.length);
            expect(new Set(ex.choices).size).toBe(ex.choices.length);
          } else if (ex.kind === 'num') {
            expect(Number.isFinite(ex.answer)).toBe(true);
            expect(ex.tol).toBeGreaterThan(0);
          } else {
            expect(ex.uses.length).toBeGreaterThan(0);
          }
        }
      });
    }
    it(`${mod.id} has no study for an unknown view`, () => {
      const ids = new Set(mod.vizs.map((v) => v.id));
      for (const k of Object.keys(mod.study ?? {})) expect(ids.has(k), k).toBe(true);
    });
  }
});

describe('answer parsing', () => {
  it('reads HUD numbers', () => {
    expect(parseHudNumber('1 234,5')).toBeCloseTo(1234.5);
    expect(parseHudNumber('−4,20e−3')).toBeCloseTo(-0.0042);
    expect(parseHudNumber('99,76 %')).toBeCloseTo(99.76);
  });
  it('reads typed answers', () => {
    expect(parseAnswer('0,25')).toBeCloseTo(0.25);
    expect(parseAnswer('1/4')).toBeCloseTo(0.25);
    expect(parseAnswer('pi/2')).toBeCloseTo(Math.PI / 2);
    expect(parseAnswer('2^10')).toBe(1024);
  });
});

describe('progression', () => {
  // no localStorage under vitest: the store falls back to in-memory state
  it('unlocks the next view after 2 of 3 solved, ignoring revealed answers', () => {
    const p = new Progress(MODULES);
    const mod = MODULES[0];
    const [a, b] = mod.vizs;
    expect(p.unlocked(mod.id, a.id)).toBe(true);
    expect(p.unlocked(mod.id, b.id)).toBe(false);
    p.reveal(`${mod.id}/${a.id}`, 0);
    p.record(`${mod.id}/${a.id}`, 0, true);
    p.record(`${mod.id}/${a.id}`, 1, true);
    expect(p.unlocked(mod.id, b.id)).toBe(false);
    p.record(`${mod.id}/${a.id}`, 2, true);
    expect(p.unlocked(mod.id, b.id)).toBe(true);
    expect(p.validatedCount).toBe(1);
    expect(p.cinematicUnlocked()).toBe(false);
  });
});
