import { describe, expect, it } from 'vitest';
import { attractingPeriod, bulbRoot, MANDEL, type MandelLogic } from '../src/games/mandel';
import { binomialBand, BUFFON, pCross, piEstimate, throwNeedles, type BuffonLogic } from '../src/games/buffon';
import { CARMICHAEL, factor, fermat2, isPrime, makeRound, PRIMES, PSP2, type PrimeLogic } from '../src/games/primes';
import { GAMES } from '../src/games/registry';
import { rng } from '../src/games/types';
import { hashText } from '../src/learn/script';
import briefs from '../src/games/briefs.json';

describe('Plongée Mandelbrot', () => {
  it('periods at known centres of components', () => {
    expect(attractingPeriod(0, 0)).toBe(1);
    expect(attractingPeriod(-1, 0)).toBe(2);
    expect(attractingPeriod(-0.122561, 0.744862)).toBe(3); // the rabbit
    expect(attractingPeriod(-1.754878, 0)).toBe(3); // the airplane mini-brot
    expect(attractingPeriod(0.282271, 0.530061)).toBe(4);
    expect(attractingPeriod(-1.310703, 0)).toBe(4);
    expect(attractingPeriod(0.3, 0)).toBe('escape');
    expect(attractingPeriod(-2.1, 0)).toBe('escape');
  });

  it('bulb roots on the main cardioid', () => {
    const [x2, y2] = bulbRoot(1, 2);
    expect(x2).toBeCloseTo(-0.75, 12);
    expect(y2).toBeCloseTo(0, 12);
    const [x0, y0] = bulbRoot(0, 1);
    expect(x0).toBeCloseTo(0.25, 12);
    expect(y0).toBeCloseTo(0, 12);
  });

  it('every target period can be found next to the root of its 1/q bulb', () => {
    for (const q of [5, 6, 7, 8, 9, 10, 11, 12, 13, 16]) {
      const [rx, ry] = bulbRoot(1, q);
      let found = false;
      for (const k of [0.3, 0.6, 1, 1.5, 2.2]) {
        for (let j = 0; j < 32 && !found; j++) {
          const a = (j / 32) * Math.PI * 2;
          const d = k / (q * q);
          found = attractingPeriod(rx + d * Math.cos(a), ry + d * Math.sin(a), 4000) === q;
        }
        if (found) break;
      }
      expect(found, `période ${q}`).toBe(true);
    }
  });

  it('a played round: the right period ends it, a wrong probe costs points', () => {
    const logic = MANDEL.make() as MandelLogic;
    logic.start(0, 1, rng(1)); // period 2
    logic.sound(0, 0); // period 1: wrong
    expect(logic.poll()).toBeNull();
    logic.tick(3);
    logic.sound(-1, 0);
    const r = logic.poll()!;
    expect(r.ok).toBe(true);
    expect(r.score).toBeLessThan(100);
    expect(r.score).toBeGreaterThanOrEqual(20);
  });
});

describe('Casino de Buffon', () => {
  it('the crossing frequency matches 2ℓ/(πd)', () => {
    for (const l of [0.3, 0.8, 1]) {
      const n = 200000;
      const k = throwNeedles(n, l, rng(Math.round(l * 100))).filter((x) => x.cross).length;
      const p = pCross(l, 1);
      expect(Math.abs(k / n - p), `ℓ = ${l}`).toBeLessThan(4 * Math.sqrt((p * (1 - p)) / n));
    }
  });

  it('the 95 % binomial band covers about 95 % of throws', () => {
    const p = pCross(0.5, 1);
    const [a, b] = binomialBand(100, p);
    const r = rng(11);
    let inside = 0;
    for (let k = 0; k < 3000; k++) {
      const c = throwNeedles(100, 0.5, r).filter((x) => x.cross).length;
      if (c >= a && c <= b) inside++;
    }
    expect(inside / 3000).toBeGreaterThan(0.92);
    expect(inside / 3000).toBeLessThan(0.975);
  });

  it('the delta method gives the spread of π̂', () => {
    const r = rng(23);
    const est: number[] = [];
    for (let k = 0; k < 1500; k++) est.push(piEstimate(400, throwNeedles(400, 0.8, r).filter((x) => x.cross).length, 0.8).pi);
    const m = est.reduce((s, x) => s + x, 0) / est.length;
    const sd = Math.sqrt(est.reduce((s, x) => s + (x - m) ** 2, 0) / est.length);
    const p = pCross(0.8, 1);
    const theory = Math.PI * Math.sqrt((1 - p) / (400 * p));
    expect(Math.abs(m - Math.PI)).toBeLessThan(0.03);
    expect(Math.abs(sd / theory - 1)).toBeLessThan(0.15);
  });

  it('played rounds: the exact odds score 100; an interval missing π scores 0', () => {
    const logic = BUFFON.make() as BuffonLogic;
    logic.start(0, 0, rng(2));
    logic.guess = pCross(logic.l, 1);
    expect(logic.submit(false).score).toBe(100);
    logic.start(2, 0, rng(3));
    logic.lo = 3.15;
    logic.hi = 3.3;
    expect(logic.submit(false).score).toBe(0);
    logic.lo = 3.0;
    logic.hi = 3.3;
    expect(logic.submit(false).ok).toBe(true);
  });
});

describe('Chasseur de premiers', () => {
  it('primes and factorizations', () => {
    expect([2, 3, 5, 97, 7919].every(isPrime)).toBe(true);
    expect([1, 91, 221, 561, 7917].some(isPrime)).toBe(false);
    expect(factor(1729)).toEqual([7, 13, 19]);
  });

  it('Carmichael numbers: composite, squarefree, Korselt, and they pass Fermat in base 2', () => {
    for (const n of CARMICHAEL) {
      const f = factor(n);
      expect(f.length, `${n}`).toBeGreaterThanOrEqual(3);
      expect(new Set(f).size, `${n} sans facteur carré`).toBe(f.length);
      for (const p of f) expect((n - 1) % (p - 1), `${n} Korselt ${p}`).toBe(0);
      expect(fermat2(n)).toBe(true);
    }
  });

  it('the other liars are composite base-2 pseudoprimes; every odd prime passes the test', () => {
    for (const n of PSP2) {
      expect(isPrime(n), `${n}`).toBe(false);
      expect(fermat2(n), `${n}`).toBe(true);
    }
    for (let n = 3; n < 10000; n += 2) if (isPrime(n)) expect(fermat2(n)).toBe(true);
  });

  it('rounds: numbers in range, a fair mix, level 3 hides a liar', () => {
    const ranges = [
      [11, 100],
      [100, 1000],
      [1000, 10000],
    ];
    for (let level = 0; level < 3; level++)
      for (let s = 1; s < 20; s++) {
        const round = makeRound(level, rng(s * 7 + level));
        expect(round.length).toBe(14);
        for (const n of round) {
          expect(n).toBeGreaterThanOrEqual(ranges[level][0]);
          expect(n).toBeLessThan(ranges[level][1]);
        }
        const share = round.filter(isPrime).length / round.length;
        expect(share, `niveau ${level + 1} graine ${s}`).toBeGreaterThan(0.2);
        expect(share).toBeLessThan(0.8);
        if (level === 2) expect(round.some((n) => CARMICHAEL.includes(n) || PSP2.includes(n))).toBe(true);
      }
  });

  it('a perfect round scores 100', () => {
    const logic = PRIMES.make() as PrimeLogic;
    logic.start(1, 0, rng(4));
    for (const it of logic.items) {
      it.fate = isPrime(it.n) ? 'hit' : 'passed';
      it.at = 0;
    }
    logic.tick(0.01);
    expect(logic.poll()?.score).toBe(100);
  });

  it('the registry has the 7 leçons-jeux', () => {
    expect(GAMES.map((g) => g.id)).toEqual(['duel-eps', 'eigen-hunt', 'fourier-painter', 'pilot-4d', 'mandel-dive', 'buffon-casino', 'prime-hunt']);
  });
});

describe('spoken briefings', () => {
  it('every game has a spoken briefing, and its generated voice matches the current text', () => {
    const texts = briefs as unknown as Record<string, string>;
    const aligns = import.meta.glob('../courses/games/audio/*.json', { eager: true, import: 'default' }) as Record<string, { hash: string }>;
    for (const g of GAMES) {
      expect(texts[g.id]?.length ?? 0, g.id).toBeGreaterThan(100);
      const al = aligns[`../courses/games/audio/${g.id}.json`];
      // a voice that no longer matches its text is skipped by the app: regenerate it (npm run voice)
      if (al) expect(al.hash, `${g.id} : voix à régénérer`).toBe(hashText(texts[g.id].trim()));
    }
  });
});
