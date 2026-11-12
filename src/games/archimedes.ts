// LES POLYGONES D'ARCHIMÈDE (mode histoire, acte I): π is squeezed between the perimeters of the
// regular polygons inscribed in and circumscribed about a circle of diameter 1. Doubling the number
// of sides is two means (Pfaff's form of Archimedes' recurrence): the new circumscribed perimeter
// is the HARMONIC mean of the old two, the new inscribed one the GEOMETRIC mean of the old inscribed
// and the new circumscribed. Level 3 adds Archimedes' care: every value rounded outwards.
import { type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey, fr } from './types';

export type Mean = 'A' | 'G' | 'H';
export const mean = (m: Mean, a: number, b: number): number => (m === 'A' ? (a + b) / 2 : m === 'G' ? Math.sqrt(a * b) : (2 * a * b) / (a + b));

/** perimeters (diameter 1) of the regular n-gons inscribed in and circumscribed about the circle */
export const inscribed = (n: number): number => n * Math.sin(Math.PI / n);
export const circumscribed = (n: number): number => n * Math.tan(Math.PI / n);

/** one doubling, exact */
export function doubling(p: number, P: number): { p: number; P: number } {
  const P2 = mean('H', p, P);
  return { P: P2, p: mean('G', p, P2) };
}

/** outward rounding to 6 decimals: lower bounds down, upper bounds up (with 4 decimals, the bounds
 *  cross after 9 doublings from the triangle: the precision of the arithmetic limits the result) */
export const roundDown = (x: number): number => Math.floor(x * 1e6) / 1e6;
export const roundUp = (x: number): number => Math.ceil(x * 1e6) / 1e6;

interface Decision {
  kind: 'P' | 'p' | 'rP' | 'rp';
  ok: boolean;
}

const START = [6, 4, 3];
const DOUBLINGS = [4, 6, 9];

class Archimedes implements GameLogic {
  private level = 0;
  private n = 6;
  private p = 3;
  private P = 2 * Math.sqrt(3);
  private nextP = 0;
  private pending: 'P' | 'p' | 'rP' | 'rp' = 'P';
  private order: Mean[] = ['A', 'G', 'H'];
  private decisions: Decision[] = [];
  private rows: { n: number; p: number; P: number }[] = [];
  private flash = { text: '', until: 0 };
  private clock = 0;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private finished: RoundResult | null = null;
  private returned = false;
  private rand: () => number = Math.random;

  start(level: number, _round: number, r: () => number): void {
    this.level = level;
    this.rand = r;
    this.n = START[level];
    this.p = inscribed(this.n);
    this.P = circumscribed(this.n);
    if (level === 2) {
      this.p = roundDown(this.p);
      this.P = roundUp(this.P);
    }
    this.pending = 'P';
    this.decisions = [];
    this.rows = [{ n: this.n, p: this.p, P: this.P }];
    this.finished = null;
    this.returned = false;
    this.clock = 0;
    this.flash = { text: '', until: 0 };
    this.shuffle();
  }

  private shuffle(): void {
    const o: Mean[] = ['A', 'G', 'H'];
    for (let i = 2; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    this.order = o;
  }

  private total(): number {
    return DOUBLINGS[this.level] * (this.level === 2 ? 4 : 2);
  }

  prompt(): string {
    const n2 = this.n * 2;
    if (this.finished) return `${this.n} CÔTÉS : ${fr(this.p, 5)} < π < ${fr(this.P, 5)}`;
    if (this.pending === 'P') return `DOUBLEMENT ${this.n} → ${n2} : QUELLE MOYENNE DONNE LE NOUVEAU POLYGONE CIRCONSCRIT P₂ₙ ?`;
    if (this.pending === 'p') return `DOUBLEMENT ${this.n} → ${n2} : QUELLE MOYENNE DONNE LE NOUVEAU POLYGONE INSCRIT p₂ₙ ?`;
    return this.pending === 'rP' ? 'ARRONDIR P₂ₙ À 6 DÉCIMALES : VERS LE HAUT OU VERS LE BAS ?' : 'ARRONDIR p₂ₙ À 6 DÉCIMALES : VERS LE HAUT OU VERS LE BAS ?';
  }

  controls(): string {
    return this.pending === 'rP' || this.pending === 'rp' ? '↑ ARRONDI SUPÉRIEUR · ↓ ARRONDI INFÉRIEUR (OU CLIC)' : 'TOUCHES 1 · 2 · 3 (OU CLIC) : CHOISIR LA MOYENNE';
  }

  touchControls(): string {
    return this.pending === 'rP' || this.pending === 'rp' ? 'CHOISIS L’ARRONDI : SUPÉRIEUR OU INFÉRIEUR' : 'TOUCHE UNE MOYENNE POUR LA CHOISIR';
  }

  touchKeys(): TouchKey[] {
    if (this.pending !== 'rP' && this.pending !== 'rp') return [];
    return [
      { label: '▲ SUPÉRIEUR', title: 'Arrondi supérieur', key: 'ArrowUp' },
      { label: '▼ INFÉRIEUR', title: 'Arrondi inférieur', key: 'ArrowDown' },
    ];
  }

  /** the two numbers the pending mean is taken of */
  private pair(): [number, number] {
    return this.pending === 'P' ? [this.p, this.P] : [this.p, this.nextP];
  }

  private say(text: string): void {
    this.flash = { text, until: this.clock + 1.8 };
  }

  private chooseMean(m: Mean): void {
    if (this.finished || (this.pending !== 'P' && this.pending !== 'p')) return;
    const [a, b] = this.pair();
    const want: Mean = this.pending === 'P' ? 'H' : 'G';
    const ok = m === want;
    this.decisions.push({ kind: this.pending, ok });
    const value = mean(want, a, b);
    const names = { A: 'arithmétique', G: 'géométrique', H: 'harmonique' };
    this.say(ok ? `✓ moyenne ${names[want]}` : `✕ c’était la moyenne ${names[want]}`);
    if (this.pending === 'P') {
      this.nextP = value;
      this.pending = this.level === 2 ? 'rP' : 'p';
      if (this.level !== 2) this.shuffle();
    } else {
      this.commitInscribed(value);
    }
  }

  private commitInscribed(p2: number): void {
    if (this.level === 2) {
      this.p = p2;
      this.pending = 'rp';
      return;
    }
    this.p = p2;
    this.advance();
  }

  private chooseRound(up: boolean): void {
    if (this.finished || (this.pending !== 'rP' && this.pending !== 'rp')) return;
    if (this.pending === 'rP') {
      const ok = up;
      this.decisions.push({ kind: 'rP', ok });
      this.nextP = up ? roundUp(this.nextP) : roundDown(this.nextP);
      this.say(ok ? '✓ une borne supérieure s’arrondit vers le haut' : '✕ arrondie vers le bas, la borne supérieure peut passer sous π');
      this.pending = 'p';
      this.shuffle();
    } else {
      const ok = !up;
      this.decisions.push({ kind: 'rp', ok });
      this.p = up ? roundUp(this.p) : roundDown(this.p);
      this.say(ok ? '✓ une borne inférieure s’arrondit vers le bas' : '✕ arrondie vers le haut, la borne inférieure peut passer au-dessus de π');
      this.advance();
    }
  }

  private advance(): void {
    this.P = this.nextP;
    this.n *= 2;
    this.rows.push({ n: this.n, p: this.p, P: this.P });
    this.pending = 'P';
    this.shuffle();
    if (this.decisions.length >= this.total()) this.finished = this.tally(false);
  }

  private tally(timeout: boolean): RoundResult {
    const good = this.decisions.filter((d) => d.ok).length;
    const valid = this.p < Math.PI && Math.PI < this.P;
    const score = Math.round((100 * good) / this.total()) - (valid ? 0 : 30);
    return {
      ok: score >= 60,
      score: Math.max(0, score),
      detail: `${good}/${this.total()} choix justes · ${this.n} côtés : ${fr(this.p, 5)} < π < ${fr(this.P, 5)}${valid ? '' : ' · BORNES FAUSSES'}${timeout ? ' · au temps' : ''}`,
    };
  }

  key(e: KeyboardEvent): boolean {
    if (this.pending === 'rP' || this.pending === 'rp') {
      if (e.key === 'ArrowUp') return this.chooseRound(true), true;
      if (e.key === 'ArrowDown') return this.chooseRound(false), true;
      return false;
    }
    if (/^[1-3]$/.test(e.key)) {
      this.chooseMean(this.order[Number(e.key) - 1]);
      return true;
    }
    return false;
  }

  /** a narrow play area (phone): the buttons one under the other, the table under the circle */
  private get narrow(): boolean {
    return this.box.w > 1 && this.box.w < 520;
  }

  private buttons(): { label: string; act: () => void; x: number; y: number; w: number; h: number }[] {
    const b = this.box;
    const narrow = this.narrow;
    const y = b.y + b.h - 48;
    if (this.pending === 'rP' || this.pending === 'rp') {
      if (narrow) {
        const w = b.w - 32;
        return [
          { label: '↑ arrondi supérieur', act: () => this.chooseRound(true), x: b.x + 16, y: b.y + b.h - 92, w, h: 36 },
          { label: '↓ arrondi inférieur', act: () => this.chooseRound(false), x: b.x + 16, y: b.y + b.h - 48, w, h: 36 },
        ];
      }
      const w = 220;
      return [
        { label: '↑ arrondi supérieur', act: () => this.chooseRound(true), x: b.x + b.w / 2 - w - 8, y, w, h: 36 },
        { label: '↓ arrondi inférieur', act: () => this.chooseRound(false), x: b.x + b.w / 2 + 8, y, w, h: 36 },
      ];
    }
    const [a, c] = this.pair();
    const names = { A: 'arithmétique (a+b)/2', G: 'géométrique √(ab)', H: 'harmonique 2ab/(a+b)' };
    if (narrow) return this.order.map((m, i) => ({ label: `${i + 1} · ${names[m]} = ${fr(mean(m, a, c), 6)}`, act: () => this.chooseMean(m), x: b.x + 16, y: b.y + b.h - 136 + i * 44, w: b.w - 32, h: 36 }));
    const w = Math.min(300, (b.w - 60) / 3);
    return this.order.map((m, i) => ({ label: `${i + 1} · ${names[m]} = ${fr(mean(m, a, c), 6)}`, act: () => this.chooseMean(m), x: b.x + 20 + i * (w + 10), y, w, h: 36 }));
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number): void {
    if (type !== 'down' || this.finished) return;
    for (const bt of this.buttons()) if (x >= bt.x && x <= bt.x + bt.w && y >= bt.y && y <= bt.y + bt.h) return bt.act();
  }

  tick(dt: number): void {
    this.clock += dt;
  }

  poll(): RoundResult | null {
    if (this.finished && !this.returned && this.clock >= this.flash.until - 0.8) {
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
    // left (narrow: top): circle, inscribed and circumscribed polygons
    const narrow = this.narrow;
    const R = narrow ? Math.min(46, box.w * 0.16) : Math.min(box.w * 0.2, (box.h - 110) * 0.45);
    const cx = box.x + 30 + R * 1.2;
    const cy = box.y + (narrow ? 12 : 20) + R * 1.2;
    const poly = (n: number, rad: number, dash: boolean) => {
      g.setLineDash(dash ? [3, 3] : []);
      g.beginPath();
      for (let k = 0; k <= n; k++) {
        const a = -Math.PI / 2 + (k / n) * Math.PI * 2;
        const px = cx + rad * Math.cos(a);
        const py = cy + rad * Math.sin(a);
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
      g.setLineDash([]);
    };
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
    const n = Math.min(this.n, 192);
    g.strokeStyle = '#fff';
    poly(n, R, false);
    g.strokeStyle = 'rgba(255,255,255,0.7)';
    poly(n, R / Math.cos(Math.PI / n), true);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.textAlign = 'center';
    if (narrow) {
      g.textAlign = 'left';
      g.fillText(`${this.n} côtés`, cx + R * 1.35, cy - 8);
      g.fillText('diamètre 1', cx + R * 1.35, cy + 10);
    } else g.fillText(`${this.n} côtés · diamètre 1`, cx, cy + R * 1.25 + 10);
    // right (narrow: under the circle): the table and the interval
    const tx = narrow ? box.x + 14 : box.x + box.w * 0.48;
    let ty = narrow ? cy + R * 1.25 + 18 : box.y + 20;
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillText('côtés      inscrit pₙ     circonscrit Pₙ', tx, ty);
    for (const row of this.rows.slice(narrow ? -5 : -8)) {
      ty += 18;
      g.fillStyle = '#fff';
      g.fillText(`${String(row.n).padEnd(9)}  ${fr(row.p, 6).padEnd(12)}  ${fr(row.P, 6)}`, tx, ty);
    }
    if (this.pending !== 'P' && !this.finished) {
      ty += 18;
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.fillText(`${String(this.n * 2).padEnd(9)}  ${this.pending === 'rp' ? fr(this.p, 6).padEnd(12) : '?'.padEnd(12)}  ${fr(this.nextP, 6)}`, tx, ty);
    }
    // the interval [p, P] on a ruler; π shown at the reveal
    const lo = Math.min(this.p, Math.PI) - 0.02 * (this.P - this.p + 1e-9);
    const hi = Math.max(this.P, Math.PI) + 0.02 * (this.P - this.p + 1e-9);
    const rx0 = narrow ? box.x + 24 : tx;
    const rx1 = box.x + box.w - 30;
    const ry = box.y + box.h - (narrow ? (this.pending === 'rP' || this.pending === 'rp' ? 128 : 172) : 104);
    const X = (v: number) => rx0 + ((v - lo) / (hi - lo)) * (rx1 - rx0);
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.beginPath();
    g.moveTo(rx0, ry);
    g.lineTo(rx1, ry);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(X(this.p), ry - 6, X(this.P) - X(this.p), 12);
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.fillText(fr(this.p, 5), X(this.p), ry + 18);
    g.fillText(fr(this.P, 5), X(this.P), ry - 18);
    if (phase === 'reveal' || this.finished) {
      g.strokeStyle = '#fff';
      g.beginPath();
      g.moveTo(X(Math.PI), ry - 14);
      g.lineTo(X(Math.PI), ry + 14);
      g.stroke();
      g.fillText('π', X(Math.PI), ry + 34);
      if (this.level === 0) {
        g.textAlign = 'left';
        g.fillStyle = 'rgba(255,255,255,0.75)';
        if (narrow) {
          g.fillText(`Archimède : 3 + 10/71 = ${fr(3 + 10 / 71, 5)}`, rx0, ry - 52);
          g.fillText(`< π < 3 + 1/7 = ${fr(3 + 1 / 7, 5)}`, rx0, ry - 36);
        } else g.fillText(`Archimède : 3 + 10/71 = ${fr(3 + 10 / 71, 5)} < π < 3 + 1/7 = ${fr(3 + 1 / 7, 5)}`, rx0, ry - 40);
      }
    }
    if (this.clock < this.flash.until) {
      g.textAlign = 'left';
      g.fillStyle = '#fff';
      g.font = narrow ? '12px "JetBrains Mono", monospace' : '14px "JetBrains Mono", monospace';
      g.fillText(this.flash.text, box.x + (narrow ? 14 : 20), narrow ? ry - 44 : box.y + box.h - 66);
      g.font = '12px "JetBrains Mono", monospace';
    }
    if (phase === 'play' && !this.finished)
      for (const bt of this.buttons()) {
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.strokeRect(bt.x + 0.5, bt.y + 0.5, bt.w, bt.h);
        g.fillStyle = '#fff';
        g.textAlign = 'center';
        g.fillText(bt.label, bt.x + bt.w / 2, bt.y + bt.h / 2);
      }
    g.restore();
  }
}

export const ARCHIMEDES: GameDef = {
  id: 'archimedes',
  title: 'Les polygones d’Archimède',
  subtitle: 'Coincer π entre deux polygones, en doublant les côtés.',
  module: 'constants',
  view: 'constants/pi',
  minutes: 8,
  brief:
    'Un cercle de diamètre un, un polygone inscrit et un polygone circonscrit : leurs périmètres encadrent pi. Pour doubler le nombre de côtés, il suffit de deux moyennes. Laquelle donne le nouveau polygone circonscrit, laquelle le nouveau polygone inscrit ? De l’hexagone à 96 côtés, comme Archimède.',
  rules: [
    'Touches 1, 2, 3 (ou clic) : choisir la moyenne. L’ordre des choix change à chaque fois. Un mauvais choix est corrigé et compté comme erreur.',
    'Niveau 3 : chaque nouvelle valeur est arrondie à 6 décimales, vers le haut (↑) ou vers le bas (↓). Un mauvais arrondi peut rendre une borne fausse (−30 points). Avec 4 décimales seulement, même des arrondis prudents finiraient par croiser π : la précision des calculs limite celle du résultat.',
    'Score = choix justes / choix à faire. Réussi à partir de 60.',
  ],
  levels: [
    { title: 'L’hexagone', brief: '6 → 96 côtés, 4 doublements', rounds: 3, time: 60 },
    { title: 'Le carré', brief: '4 → 256 côtés, 6 doublements', rounds: 3, time: 60 },
    { title: 'Les arrondis prudents', brief: '3 → 1 536 côtés, 9 doublements, arrondis à 6 décimales', rounds: 3, time: 120 },
  ],
  theorem: {
    kind: 'proposition',
    title: 'Le doublement d’Archimède en deux moyennes',
    body: 'Soient $p_n = n \\sin\\frac{\\pi}{n}$ et $P_n = n \\tan\\frac{\\pi}{n}$ les périmètres des $n$-gones réguliers inscrit et circonscrit à un cercle de diamètre $1$, de sorte que $p_n < \\pi < P_n$. Alors $P_{2n} = \\frac{2 p_n P_n}{p_n + P_n}$ (moyenne **harmonique**) et $p_{2n} = \\sqrt{p_n P_{2n}}$ (moyenne **géométrique**). À partir de l’hexagone ($p_6 = 3$, $P_6 = 2\\sqrt3$), quatre doublements donnent $p_{96} \\approx 3{,}14103 < \\pi < 3{,}14271 \\approx P_{96}$ ; Archimède, en arrondissant prudemment, énonce $3 + \\frac{10}{71} < \\pi < 3 + \\frac17$. L’écart $P_n - p_n$ décroît comme $\\frac{\\pi^3}{2n^2}$ : chaque doublement le divise environ par $4$.',
  },
  references: ['Archimède, La mesure du cercle (trad. C. Mugler, Les Belles Lettres)', 'J. M. Borwein, P. B. Borwein, Pi and the AGM (Wiley, 1987)'],
  make: () => new Archimedes(),
};
