// CHASSEUR DE PREMIERS: numbers fall; shoot the primes, let the composites pass. Level 1 under 100,
// level 2 under 1 000 with semiprimes that dodge the easy rules (7 × 13, 17 × 19…), level 3 under
// 10 000 with a Fermat test shown on every number — and Carmichael numbers that fool it.
import { type Box, type GameDef, type GameLogic, type RoundResult } from './types';

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

export function factor(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let d = 2; d * d <= m; d++)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  if (m > 1) out.push(m);
  return out;
}

/** b^e mod m (exact for m < 2^26: products stay below 2^53) */
export function powmod(b: number, e: number, m: number): number {
  let r = 1;
  b %= m;
  while (e > 0) {
    if (e & 1) r = (r * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return r;
}

/** Fermat's test in base 2: 2^(n−1) ≡ 1 (mod n) — true for every odd prime, and for a few liars */
export const fermat2 = (n: number): boolean => n > 2 && n % 2 === 1 && powmod(2, n - 1, n) === 1;

/** Carmichael numbers below 10 000 (pseudoprimes in every base coprime to them) */
export const CARMICHAEL = [1105, 1729, 2465, 2821, 6601, 8911];
/** other base-2 pseudoprimes below 10 000 */
export const PSP2 = [1387, 1905, 2047, 2701, 3277, 4033, 4369, 4371, 4681, 5461, 7957, 8321];

const PRIMES_UNDER = (lo: number, hi: number) => Array.from({ length: hi - lo }, (_, i) => lo + i).filter(isPrime);

/** a round: about half primes, the rest composites that look prime */
export function makeRound(level: number, r: () => number, count = 14): number[] {
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];
  const out = new Set<number>();
  const [lo, hi] = level === 0 ? [11, 100] : level === 1 ? [100, 1000] : [1000, 10000];
  const primes = PRIMES_UNDER(lo, hi);
  const small = PRIMES_UNDER(7, 100);
  const composite = (): number => {
    if (level === 0) return pick([21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99]);
    if (level === 2 && r() < 0.35) return pick(CARMICHAEL.concat(PSP2));
    for (;;) {
      const p = pick(small);
      const q = pick(level === 1 ? small : PRIMES_UNDER(11, 900));
      const n = p * q;
      if (n >= lo && n < hi) return n;
    }
  };
  let guard = 0;
  while (out.size < count && guard++ < 1000) out.add(r() < 0.5 ? pick(primes) : composite());
  // level 3 always hides at least one liar
  if (level === 2 && ![...out].some((n) => CARMICHAEL.includes(n) || PSP2.includes(n))) {
    const first = [...out][0];
    out.delete(first);
    out.add(pick(CARMICHAEL));
  }
  return [...out].sort(() => r() - 0.5);
}

interface Falling {
  n: number;
  x: number;
  t0: number;
  /** null: still falling */
  fate: null | 'hit' | 'false' | 'missed' | 'passed';
  at: number;
}

const FALL = 6.5;
const GAP = 1.55;

class PrimeHunt implements GameLogic {
  level = 0;
  items: Falling[] = [];
  private clock = 0;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private result: RoundResult | null = null;
  private returned = false;

  start(level: number, _round: number, r: () => number): void {
    this.level = level;
    this.clock = 0;
    this.result = null;
    this.returned = false;
    this.items = makeRound(level, r).map((n, i) => ({ n, x: 0.08 + r() * 0.84, t0: 0.6 + i * GAP, fate: null, at: 0 }));
  }

  prompt(): string {
    const range = this.level === 0 ? 'SOUS 100' : this.level === 1 ? 'SOUS 1 000' : 'SOUS 10 000 · LE TEST DE FERMAT EST AFFICHÉ… MAIS IL PEUT MENTIR';
    return `TIRE SUR LES NOMBRES PREMIERS, LAISSE PASSER LES COMPOSÉS · ${range}`;
  }

  controls(): string {
    return 'CLIC SUR UN NOMBRE : TIRER (DÉFINITIF)';
  }

  touchControls(): string {
    return 'TOUCHE UN NOMBRE : TIRER (DÉFINITIF)';
  }

  private y(it: Falling): number {
    return this.box.y + 10 + ((this.clock - it.t0) / FALL) * (this.box.h - 40);
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    if (type !== 'down') return;
    for (const it of this.items) {
      if (it.fate || this.clock < it.t0) continue;
      const ix = this.box.x + it.x * this.box.w;
      const iy = this.y(it);
      if (Math.abs(x - ix) < 46 && Math.abs(y - iy) < 18) {
        it.fate = isPrime(it.n) ? 'hit' : 'false';
        it.at = this.clock;
        return;
      }
    }
  }

  tick(dt: number): void {
    this.clock += dt;
    for (const it of this.items)
      if (!it.fate && this.clock - it.t0 > FALL) {
        it.fate = isPrime(it.n) ? 'missed' : 'passed';
        it.at = this.clock;
      }
    if (!this.result && this.items.every((i) => i.fate)) this.result = this.tally(false);
  }

  private tally(timeout: boolean): RoundResult {
    const P = this.items.filter((i) => isPrime(i.n)).length;
    const tp = this.items.filter((i) => i.fate === 'hit').length;
    const fp = this.items.filter((i) => i.fate === 'false').length;
    const fn = this.items.filter((i) => i.fate === 'missed' || (!i.fate && isPrime(i.n))).length;
    const score = Math.round((100 * Math.max(0, tp - fp - 0.5 * fn)) / Math.max(1, P));
    const liars = this.items.filter((i) => i.fate === 'false' && (CARMICHAEL.includes(i.n) || PSP2.includes(i.n))).map((i) => i.n);
    return {
      ok: score >= 60,
      score,
      detail: `${tp}/${P} premiers touchés · ${fp} composé${fp > 1 ? 's' : ''} touché${fp > 1 ? 's' : ''} · ${fn} premier${fn > 1 ? 's' : ''} manqué${fn > 1 ? 's' : ''}${liars.length ? ` · piégé par ${liars.join(', ')} (Fermat ment)` : ''}${timeout ? ' · au temps' : ''}`,
    };
  }

  poll(): RoundResult | null {
    if (this.result && !this.returned) {
      this.returned = true;
      return this.result;
    }
    return null;
  }

  submit(timeout: boolean): RoundResult | null {
    if (!timeout) return null; // the round ends when every number has landed
    this.returned = true;
    return this.tally(true);
  }

  draw(g: CanvasRenderingContext2D, box: Box, _t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    g.save();
    g.beginPath();
    g.rect(box.x, box.y, box.w, box.h);
    g.clip();
    // the ground line
    g.strokeStyle = 'rgba(255,255,255,0.3)';
    g.setLineDash([6, 6]);
    g.beginPath();
    g.moveTo(box.x, box.y + box.h - 24);
    g.lineTo(box.x + box.w, box.y + box.h - 24);
    g.stroke();
    g.setLineDash([]);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const it of this.items) {
      if (this.clock < it.t0) continue;
      const age = it.fate ? this.clock - it.at : 0;
      if (it.fate && age > 2.6 && phase === 'play') continue;
      const x = box.x + it.x * box.w;
      const yy = it.fate ? box.y + 10 + ((it.at - it.t0) / FALL) * (box.h - 40) : this.y(it);
      const fade = it.fate ? Math.max(0.25, 1 - age / 2.6) : 1;
      const label = String(it.n);
      g.font = '15px "JetBrains Mono", monospace';
      const w = Math.max(60, g.measureText(label).width + 22);
      const filled = it.fate === 'hit';
      g.fillStyle = filled ? `rgba(255,255,255,${fade})` : `rgba(0,0,0,${0.75 * fade})`;
      g.fillRect(x - w / 2, yy - 15, w, 30);
      g.strokeStyle = `rgba(255,255,255,${(it.fate === 'passed' ? 0.3 : 0.85) * fade})`;
      g.strokeRect(x - w / 2 + 0.5, yy - 14.5, w - 1, 29);
      g.fillStyle = filled ? '#000' : `rgba(255,255,255,${fade})`;
      g.fillText(label, x, yy);
      g.font = '10px "JetBrains Mono", monospace';
      g.fillStyle = `rgba(255,255,255,${0.8 * fade})`;
      if (this.level === 2 && !it.fate) g.fillText(fermat2(it.n) ? '2ⁿ⁻¹ ≡ 1' : '2ⁿ⁻¹ ≢ 1', x, yy + 24);
      if (it.fate === 'false' || (phase === 'reveal' && !isPrime(it.n) && it.fate === 'passed')) g.fillText(`✕ ${it.n} = ${factor(it.n).join(' × ')}`, x, yy + 24);
      if (it.fate === 'missed') g.fillText(`raté : ${it.n} est premier`, x, yy + 24);
      if (it.fate === 'hit') g.fillText('✓ premier', x, yy + 24);
    }
    // counters
    const P = this.items.filter((i) => isPrime(i.n)).length;
    g.textAlign = 'left';
    g.font = '11px "JetBrains Mono", monospace';
    g.fillStyle = '#fff';
    g.fillText(`touchés ${this.items.filter((i) => i.fate === 'hit').length}/${P} · erreurs ${this.items.filter((i) => i.fate === 'false').length} · restants ${this.items.filter((i) => !i.fate).length}`, box.x + 12, box.y + box.h - 10);
    g.restore();
  }
}

export const PRIMES: GameDef = {
  id: 'prime-hunt',
  title: 'Chasseur de premiers',
  subtitle: 'Reconnaître un nombre premier, vite — et ne pas croire Fermat sur parole.',
  module: 'principles',
  view: 'principles/primes',
  minutes: 8,
  brief:
    'Des nombres tombent. Tire sur les premiers, laisse passer les composés. Sous 100 c’est un échauffement ; sous 1 000 les composés esquivent les critères faciles (91 = 7 × 13, 323 = 17 × 19). Sous 10 000, chaque nombre affiche le test de Fermat en base 2… qui se trompe parfois.',
  rules: [
    'Clic sur un nombre : tirer (définitif). Un premier touché : bien. Un composé touché : sa factorisation s’affiche, c’est une erreur. Un premier qui touche le sol : manqué.',
    'Score = (premiers touchés − composés touchés − ½ premiers manqués) / nombre de premiers. Réussi à partir de 60.',
    'Niveau 3 : « 2ⁿ⁻¹ ≡ 1 » est vrai pour tout premier impair, mais aussi pour quelques composés (1 105, 1 729, 2 047…).',
  ],
  touchRules: [
    'Touche un nombre : tirer (définitif). Un premier touché : bien. Un composé touché : sa factorisation s’affiche, c’est une erreur. Un premier qui touche le sol : manqué.',
    'Score = (premiers touchés − composés touchés − ½ premiers manqués) / nombre de premiers. Réussi à partir de 60.',
    'Niveau 3 : « 2ⁿ⁻¹ ≡ 1 » est vrai pour tout premier impair, mais aussi pour quelques composés (1 105, 1 729, 2 047…).',
  ],
  levels: [
    { title: 'Sous 100', brief: 'les impairs qui trompent : 51, 57, 87, 91…', rounds: 5, time: 35 },
    { title: 'Sous 1 000', brief: 'produits de deux premiers ≥ 7', rounds: 5, time: 35 },
    { title: 'Sous 10 000', brief: 'avec le test de Fermat… et ses menteurs', rounds: 5, time: 35 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Petit théorème de Fermat, et ses menteurs',
    body: '**Fermat** : si $p$ est premier et $p \\nmid a$, alors $a^{p-1} \\equiv 1 \\pmod p$. La réciproque est fausse : $341 = 11 \\times 31$ vérifie $2^{340} \\equiv 1 \\pmod{341}$ (pseudo-premier en base 2). Pire, les **nombres de Carmichael** sont des composés $n$ tels que $a^{n-1} \\equiv 1 \\pmod n$ pour **tout** $a$ premier avec $n$. **Critère de Korselt** : $n$ composé est de Carmichael si et seulement si $n$ est sans facteur carré et $p - 1 \\mid n - 1$ pour tout premier $p \\mid n$ — par exemple $561 = 3 \\times 11 \\times 17$, $1729 = 7 \\times 13 \\times 19$. Il en existe une infinité (Alford, Granville, Pomerance, 1994). Un test fiable se construit autrement (Miller-Rabin, ou AKS en temps polynomial).',
  },
  references: ['G. H. Hardy, E. M. Wright, An Introduction to the Theory of Numbers (Oxford)', 'W. R. Alford, A. Granville, C. Pomerance, There are infinitely many Carmichael numbers, Annals of Math. 139 (1994)'],
  make: () => new PrimeHunt(),
};

export type PrimeLogic = PrimeHunt;
