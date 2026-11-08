// L'ALGORITHME D'EUCLIDE (mode histoire, acte I): a rectangle a × b is cut into squares, the
// largest possible each time (Éléments, livre VII). The player says how many squares fit at each
// step; the last square is the GCD, and the counts are the continued fraction of a/b. Level 3 uses
// consecutive Fibonacci numbers, the slowest case (Lamé, 1844), and the golden rectangle.
import { type Box, type GameDef, type GameLogic, type RoundResult } from './types';

export interface EuclidStep {
  a: number;
  b: number;
  q: number;
  r: number;
}

/** a = q·b + r, down to r = 0 */
export function euclidSteps(a: number, b: number): EuclidStep[] {
  const out: EuclidStep[] = [];
  let [x, y] = a >= b ? [a, b] : [b, a];
  while (y > 0) {
    const q = Math.floor(x / y);
    const r = x - q * y;
    out.push({ a: x, b: y, q, r });
    [x, y] = [y, r];
  }
  return out;
}

export const gcdOf = (a: number, b: number): number => {
  const s = euclidSteps(a, b);
  return s.length ? s[s.length - 1].b : Math.max(a, b);
};

export const fib = (k: number): number => {
  let [x, y] = [0, 1];
  for (let i = 0; i < k; i++) [x, y] = [y, x + y];
  return x;
};

export function makeEuclidRound(level: number, r: () => number): [number, number] {
  const ri = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  for (let guard = 0; guard < 500; guard++) {
    let a: number;
    let b: number;
    if (level === 0) {
      const g = ri(2, 9);
      const m = ri(3, 9);
      const n = ri(2, m - 1);
      a = g * m;
      b = g * n;
    } else if (level === 1) {
      a = ri(120, 600);
      b = ri(40, a - 1);
    } else {
      const k = ri(9, 15);
      return [fib(k + 1), fib(k)];
    }
    const steps = euclidSteps(a, b);
    // every count fits on one key, and there is something to cut
    if (steps.every((s) => s.q <= 9) && steps.length >= (level === 0 ? 2 : 4) && steps.length <= 9 && a !== b) return [a, b];
  }
  return [84, 36];
}

class Euclid implements GameLogic {
  private a = 84;
  private b = 36;
  private steps: EuclidStep[] = [];
  private k = 0;
  private answers: { q: number; ok: boolean }[] = [];
  private flash = { text: '', until: 0 };
  private clock = 0;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private finished: RoundResult | null = null;
  private returned = false;
  private level = 0;

  start(level: number, _round: number, r: () => number): void {
    this.level = level;
    [this.a, this.b] = makeEuclidRound(level, r);
    this.steps = euclidSteps(this.a, this.b);
    this.k = 0;
    this.answers = [];
    this.finished = null;
    this.returned = false;
    this.clock = 0;
    this.flash = { text: '', until: 0 };
  }

  prompt(): string {
    const s = this.steps[this.k];
    if (!s) return `DÉCOUPAGE TERMINÉ · PGCD(${this.a}, ${this.b}) = ${gcdOf(this.a, this.b)}`;
    return `COMBIEN DE CARRÉS DE CÔTÉ ${s.b} TIENNENT DANS LE RECTANGLE ${s.a} × ${s.b} ?`;
  }

  controls(): string {
    return 'TOUCHES 1 À 9 (OU CLIC SUR UN CHIFFRE) : LE NOMBRE DE CARRÉS';
  }

  private answer(q: number): void {
    const s = this.steps[this.k];
    if (!s || this.finished) return;
    const ok = q === s.q;
    this.answers.push({ q, ok });
    this.flash = { text: ok ? `✓ ${s.a} = ${s.q} × ${s.b} + ${s.r}` : `✕ c’était ${s.q} : ${s.a} = ${s.q} × ${s.b} + ${s.r}`, until: this.clock + 1.6 };
    this.k++;
    if (this.k >= this.steps.length) this.finished = this.tally(false);
  }

  key(e: KeyboardEvent): boolean {
    if (!/^[1-9]$/.test(e.key)) return false;
    this.answer(Number(e.key));
    return true;
  }

  /** the digit buttons under the drawing */
  private buttons(): { q: number; x: number; y: number; w: number; h: number }[] {
    const b = this.box;
    const w = Math.min(46, (b.w - 40) / 9 - 6);
    const y = b.y + b.h - 44;
    const x0 = b.x + (b.w - 9 * (w + 6)) / 2;
    return Array.from({ length: 9 }, (_, i) => ({ q: i + 1, x: x0 + i * (w + 6), y, w, h: 34 }));
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    if (type !== 'down') return;
    for (const bt of this.buttons()) if (x >= bt.x && x <= bt.x + bt.w && y >= bt.y && y <= bt.y + bt.h) return this.answer(bt.q);
  }

  tick(dt: number): void {
    this.clock += dt;
  }

  private tally(timeout: boolean): RoundResult {
    const good = this.answers.filter((x) => x.ok).length;
    const total = this.steps.length;
    const score = Math.round((100 * good) / total);
    const cf = this.steps.map((s) => s.q);
    return {
      ok: score >= 60,
      score,
      detail: `${good}/${total} découpes justes · PGCD = ${gcdOf(this.a, this.b)} · ${this.a}/${this.b} = [${cf[0]}; ${cf.slice(1).join(', ')}]${timeout ? ' · au temps' : ''}`,
    };
  }

  poll(): RoundResult | null {
    if (this.finished && !this.returned && this.clock >= this.flash.until - 0.6) {
      this.returned = true;
      return this.finished;
    }
    return null;
  }

  submit(timeout: boolean): RoundResult | null {
    if (!timeout) return null;
    this.returned = true;
    return this.tally(true);
  }

  draw(g: CanvasRenderingContext2D, box: Box, _t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    g.save();
    g.font = '12px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    // the rectangle, scaled to fit above the buttons
    const W = this.a;
    const H = this.b;
    const s = Math.min((box.w * 0.62) / W, (box.h - 120) / H);
    const ox = box.x + 20;
    const oy = box.y + 20;
    g.strokeStyle = '#fff';
    g.strokeRect(ox + 0.5, oy + 0.5, W * s, H * s);
    // squares already cut: alternate cutting horizontally and vertically
    let x = ox;
    let y = oy;
    let w = W;
    let h = H;
    const shown = phase === 'reveal' ? this.steps.length : this.k;
    for (let i = 0; i < this.steps.length; i++) {
      const st = this.steps[i];
      const side = st.b;
      const horizontal = w >= h;
      const cut = i < shown;
      for (let j = 0; j < st.q; j++) {
        const sx = horizontal ? x + j * side * s : x;
        const sy = horizontal ? y : y + j * side * s;
        if (cut) {
          g.fillStyle = i % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.18)';
          g.fillRect(sx, sy, side * s, side * s);
          g.strokeStyle = 'rgba(255,255,255,0.85)';
          g.strokeRect(sx + 0.5, sy + 0.5, side * s, side * s);
          if (side * s > 26) {
            g.fillStyle = '#fff';
            g.textAlign = 'center';
            g.fillText(String(side), sx + (side * s) / 2, sy + (side * s) / 2);
          }
        }
      }
      if (i === this.k && phase === 'play') {
        // the rectangle to cut now
        g.strokeStyle = '#fff';
        g.lineWidth = 2;
        g.strokeRect(x + 1, y + 1, w * s - 2, h * s - 2);
        g.lineWidth = 1;
      }
      if (horizontal) {
        x += st.q * side * s;
        w -= st.q * side;
      } else {
        y += st.q * side * s;
        h -= st.q * side;
      }
    }
    // the equations so far
    const tx = box.x + box.w * 0.68;
    let ty = box.y + 26;
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillText(`a = ${this.a}, b = ${this.b}`, tx, ty);
    for (let i = 0; i < shown; i++) {
      const st = this.steps[i];
      ty += 20;
      const ans = this.answers[i];
      g.fillStyle = ans && !ans.ok ? 'rgba(255,255,255,0.55)' : '#fff';
      g.fillText(`${st.a} = ${st.q} × ${st.b} + ${st.r}${ans && !ans.ok ? `   (tu as dit ${ans.q})` : ''}`, tx, ty);
    }
    if (this.k >= this.steps.length || phase === 'reveal') {
      ty += 30;
      g.fillStyle = '#fff';
      g.fillText(`PGCD = ${gcdOf(this.a, this.b)} : le dernier carré`, tx, ty);
      const cf = this.steps.map((st) => st.q);
      ty += 20;
      g.fillText(`${this.a}/${this.b} = [${cf[0]}; ${cf.slice(1).join(', ')}]`, tx, ty);
      if (this.level === 2) {
        ty += 20;
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.fillText(`que des 1 : ${this.a}/${this.b} ≈ ${(this.a / this.b).toFixed(6).replace('.', ',')} ≈ φ`, tx, ty);
      }
    }
    if (this.clock < this.flash.until) {
      g.fillStyle = '#fff';
      g.textAlign = 'left';
      g.font = '14px "JetBrains Mono", monospace';
      g.fillText(this.flash.text, box.x + 20, box.y + box.h - 66);
      g.font = '12px "JetBrains Mono", monospace';
    }
    // digit buttons
    if (phase === 'play')
      for (const bt of this.buttons()) {
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.strokeRect(bt.x + 0.5, bt.y + 0.5, bt.w, bt.h);
        g.fillStyle = '#fff';
        g.textAlign = 'center';
        g.font = '16px "JetBrains Mono", monospace';
        g.fillText(String(bt.q), bt.x + bt.w / 2, bt.y + bt.h / 2);
      }
    g.restore();
  }
}

export const EUCLID: GameDef = {
  id: 'euclid',
  title: 'L’algorithme d’Euclide',
  subtitle: 'Découper un rectangle en carrés : le dernier carré est le PGCD.',
  module: 'principles',
  view: 'principles/primes',
  minutes: 8,
  brief:
    'Un rectangle de côtés a et b. Découpe-le en carrés, le plus grand possible à chaque fois : combien de carrés de côté b tiennent dedans ? Il reste un rectangle plus petit, et l’on recommence. Le dernier carré mesure le plus grand diviseur commun de a et b.',
  rules: [
    'Touche 1 à 9 (ou clic) : le nombre de carrés à découper. Une réponse fausse est corrigée et comptée comme erreur.',
    'Score = découpes justes / découpes nécessaires. Réussi à partir de 60.',
    'À la fin, les nombres de carrés forment la fraction continue de a/b. Niveau 3 : les nombres de Fibonacci, le cas le plus lent.',
  ],
  levels: [
    { title: 'Petits rectangles', brief: 'côtés jusqu’à 81, un PGCD à trouver', rounds: 4, time: 40 },
    { title: 'Grands rectangles', brief: 'côtés de 40 à 600', rounds: 4, time: 45 },
    { title: 'Le rectangle d’or', brief: 'deux Fibonacci consécutifs : que des 1', rounds: 4, time: 45 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Algorithme d’Euclide, fractions continues, théorème de Lamé',
    body: 'Si $a = qb + r$ avec $0 \\le r < b$, alors $\\operatorname{pgcd}(a, b) = \\operatorname{pgcd}(b, r)$ : en itérant, le dernier reste non nul est le PGCD (Euclide, *Éléments*, livre VII, propositions 1 et 2). Les quotients successifs $q_0, q_1, \\ldots$ sont les termes de la fraction continue $\\frac ab = q_0 + \\cfrac{1}{q_1 + \\cfrac{1}{q_2 + \\cdots}}$. **Lamé (1844)** : le nombre de divisions ne dépasse pas cinq fois le nombre de chiffres décimaux du plus petit des deux nombres ; le pire cas est celui de deux nombres de Fibonacci consécutifs, dont tous les quotients valent $1$, et dont le rapport tend vers $\\varphi = \\frac{1 + \\sqrt5}{2}$.',
  },
  references: ['Euclide, Les Éléments, livre VII (trad. B. Vitrac, PUF)', 'D. E. Knuth, The Art of Computer Programming, vol. 2, §4.5.3 (Addison-Wesley)'],
  make: () => new Euclid(),
};
