import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { ACTS, CHAPTERS, EVENTS, PARTS, lastOfAct } from '../src/story/data';
import { storyState, type StoryInput } from '../src/story/progress';
import { GAMES, STORY_GAMES, gameById } from '../src/games/registry';
import { MODULES } from '../src/modules/registry';
import { COURSES } from '../src/learn/courses';
import { tokenize } from '../src/learn/script';
import { sexagesimal, heron, bestError, babylonScore, makeBabylonRound } from '../src/games/babylon';
import { euclidSteps, gcdOf, fib, makeEuclidRound } from '../src/games/euclid';
import { circumference } from '../src/games/eratosthenes';
import { doubling, inscribed, circumscribed, roundDown, roundUp, mean } from '../src/games/archimedes';
import { rng } from '../src/games/types';

const views = new Set(MODULES.flatMap((m) => m.vizs.map((v) => `${m.id}/${v.id}`)));

function texErrors(src: string): string[] {
  const out: string[] = [];
  for (const t of tokenize(src).tokens)
    if (t.t === 'math')
      try {
        katex.renderToString(t.tex, { displayMode: t.display, throwOnError: true, strict: 'ignore' });
      } catch (e) {
        out.push(`${t.tex}: ${(e as Error).message.slice(0, 120)}`);
      }
  return out;
}

describe('story data', () => {
  it('has unique ids and valid links', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(CHAPTERS.map((c) => c.code)).size).toBe(CHAPTERS.length);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
    for (const c of CHAPTERS) {
      expect(ACTS.some((a) => a.n === c.act), c.id).toBe(true);
      expect(c.code.startsWith(`${ACTS.find((a) => a.n === c.act)!.roman}.`), c.id).toBe(true);
      if (c.game) expect(gameById(c.game), `${c.id} → ${c.game}`).toBeDefined();
      if (c.view) expect(views.has(c.view), `${c.id} → ${c.view}`).toBe(true);
      if (c.course) expect(COURSES.has(c.course), `${c.id} → ${c.course}`).toBe(true);
      if (c.reward) expect(PARTS.some((p) => p.id === c.reward), `${c.id} → ${c.reward}`).toBe(true);
    }
    for (const e of EVENTS) expect(ids, e.id).toContain(e.chapter);
    for (const p of PARTS) expect(CHAPTERS.some((c) => c.reward === p.id), p.id).toBe(true);
  });

  it('acts open in a coherent order and every act has beacons', () => {
    for (const a of ACTS) {
      for (const b of a.after) expect(b).toBeLessThan(a.n);
      expect(CHAPTERS.filter((c) => c.act === a.n).length, a.title).toBeGreaterThanOrEqual(4);
    }
    // act I is fully playable
    expect(CHAPTERS.filter((c) => c.act === 1).every((c) => c.ready)).toBe(true);
  });

  it('dates follow the acts', () => {
    const range: Record<number, [number, number]> = { 1: [-1800, 300], 2: [1600, 1900], 3: [1850, 1950], 4: [1654, 1933], 5: [1890, 1980], 6: [1900, 1936], 7: [1822, 2003] };
    for (const c of CHAPTERS) {
      expect(c.year, c.id).toBeGreaterThanOrEqual(range[c.act][0]);
      expect(c.year, c.id).toBeLessThanOrEqual(range[c.act][1]);
    }
    for (const e of EVENTS) {
      expect(e.year).toBeGreaterThanOrEqual(-1800);
      expect(e.year).toBeLessThanOrEqual(2003);
    }
    expect(Math.min(...EVENTS.map((e) => e.year))).toBe(-1800);
    expect(Math.max(...EVENTS.map((e) => e.year))).toBe(2003);
  });

  it('logs are written and their formulas compile', () => {
    const errs: string[] = [];
    for (const c of CHAPTERS) {
      if (c.ready) expect(c.log.length, c.id).toBeGreaterThan(300);
      errs.push(...texErrors(c.log).map((x) => `${c.id}: ${x}`));
    }
    for (const e of EVENTS) errs.push(...texErrors(e.text).map((x) => `${e.id}: ${x}`));
    for (const a of ACTS) errs.push(...texErrors(a.intro));
    for (const a of ACTS) if (a.end) errs.push(...texErrors(a.end));
    expect(errs).toEqual([]);
  });

  it('act I ends on Diophantus with an « à suivre »', () => {
    expect(lastOfAct(1)?.id).toBe('diophante');
    expect(ACTS[0].end?.length ?? 0).toBeGreaterThan(200);
  });

  it('period games are full leçons-jeux', () => {
    for (const g of STORY_GAMES) {
      expect(g.levels).toHaveLength(3);
      expect(g.rules.length).toBeGreaterThanOrEqual(2);
      expect(g.references?.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(texErrors(g.theorem.body)).toEqual([]);
      expect(GAMES.some((x) => x.id === g.id)).toBe(false);
    }
  });
});

describe('story progression', () => {
  const input = (done: string[], read: string[] = []): StoryInput => ({ gameDone: (id) => done.includes(id), read: new Set(read) });
  it('starts with act I open on its first beacon only', () => {
    const s = storyState(input([]));
    expect(s.acts[1]).toBe('open');
    expect(s.acts[2]).toBe('locked');
    expect(s.chapters.babylone).toBe('open');
    expect(s.chapters.euclide).toBe('locked');
  });
  it('opens act I after the tablet, then acts II and IV after act I', () => {
    const s1 = storyState(input(['babylon'], ['babylone']));
    expect(s1.chapters.babylone).toBe('done');
    expect(s1.chapters.euclide).toBe('open');
    expect(s1.parts).toContain('sexagesimal');
    const all = storyState(input(['babylon', 'euclid', 'eratosthenes', 'prime-hunt', 'archimedes'], ['babylone', 'rhind', 'zenon', 'euclide', 'eratosthene', 'crible', 'archimede', 'diophante']));
    expect(storyState(input(['babylon'])).chapters.babylone, 'a game alone is not enough: the beacon must be visited').toBe('open');
    expect(all.acts[1]).toBe('done');
    expect(all.acts[2]).toBe('open');
    expect(all.acts[4]).toBe('open');
    expect(all.acts[3]).toBe('locked');
    expect(all.chapters.cauchy).toBe('open');
    expect(all.chapters.napier).toBe('construction');
    expect(all.events.length).toBeGreaterThan(10);
  });
});

describe('period games: the mathematics', () => {
  it('Babylon: base 60 and Heron', () => {
    expect(sexagesimal(Math.SQRT2)).toBe('1;24,51,10');
    expect(sexagesimal(1.5)).toBe('1;30,0,0');
    expect(Math.abs(1 + 24 / 60 + 51 / 3600 + 10 / 216000 - Math.SQRT2)).toBeLessThan(1e-6);
    expect(heron(1.5, 2, false)).toBeCloseTo(17 / 12, 14);
    expect(bestError(2, 1.5, 3, false)).toBeLessThan(1e-11);
    expect(heron(2, 10, true)).toBeCloseTo((4 + 10 / 4) / 3, 14);
    expect(babylonScore(1e-12, 1e-12)).toBe(100);
    expect(babylonScore(1e-6, 1e-12)).toBe(50);
    expect(babylonScore(2, 1e-12)).toBe(0);
    const r = rng(7);
    for (let lv = 0; lv < 3; lv++)
      for (let k = 0; k < 4; k++) {
        const rd = makeBabylonRound(lv, k, r);
        const root = rd.cube ? Math.cbrt(rd.n) : Math.sqrt(rd.n);
        expect(Math.abs(rd.x0 - root), `${lv}/${k}`).toBeGreaterThan(1e-9);
      }
  });
  it('Euclid: quotients, GCD, Fibonacci worst case', () => {
    expect(euclidSteps(84, 36).map((s) => s.q)).toEqual([2, 3]);
    expect(gcdOf(84, 36)).toBe(12);
    expect(gcdOf(1071, 462)).toBe(21);
    expect(euclidSteps(fib(12), fib(11)).every((s, i, a) => s.q === 1 || i === a.length - 1)).toBe(true);
    const r = rng(11);
    for (let lv = 0; lv < 3; lv++)
      for (let k = 0; k < 20; k++) {
        const [a, b] = makeEuclidRound(lv, r);
        const st = euclidSteps(a, b);
        expect(st.every((s) => s.q >= 1 && s.q <= 9), `${a}, ${b}`).toBe(true);
        expect(st[st.length - 1].r).toBe(0);
      }
  });
  it('Eratosthenes: one fiftieth of a circle', () => {
    expect(circumference(7.2, 5000)).toBeCloseTo(250000, 6);
    expect(Math.abs(circumference(9.67, 1075) - 40000) / 40000).toBeLessThan(0.002);
  });
  it('Archimedes: harmonic then geometric mean doubles the polygons', () => {
    let p = 3;
    let P = 2 * Math.sqrt(3);
    for (let k = 0; k < 4; k++) ({ p, P } = doubling(p, P));
    expect(p).toBeCloseTo(inscribed(96), 12);
    expect(P).toBeCloseTo(circumscribed(96), 12);
    expect(3 + 10 / 71).toBeLessThan(p);
    expect(P).toBeLessThan(3 + 1 / 7);
    // outward rounding keeps valid bounds for 9 doublings from the triangle
    let q = roundDown(inscribed(3));
    let Q = roundUp(circumscribed(3));
    for (let k = 0; k < 9; k++) {
      Q = roundUp(mean('H', q, Q));
      q = roundDown(mean('G', q, Q));
      expect(q).toBeLessThan(Math.PI);
      expect(Q).toBeGreaterThan(Math.PI);
    }
  });
});
