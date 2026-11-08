import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString } from './data';
import { rng } from '../fractals/common';

const Z3 = 1.2020569031595942;

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

export const zeta3View: VizDef = {
  id: 'zeta3',
  title: 'ζ(3) — CONSTANTE D’APÉRY',
  subtitle: 'La somme des inverses des cubes, et la probabilité que trois entiers tirés au hasard soient premiers entre eux : 1/ζ(3).',
  stage: '2d',
  keywords: ['zeta', 'ζ(3)', 'apéry', 'cubes', 'premiers entre eux', 'probabilité'],
  formula: {
    tex: '\\zeta(3)=\\sum_{n=1}^{\\infty}\\frac{1}{n^3}=\\frac52\\sum_{k=1}^{\\infty}\\frac{(-1)^{k+1}}{k^3\\binom{2k}{k}},\\qquad P(\\mathrm{pgcd}(a,b,c)=1)=\\frac1{\\zeta(3)}',
    note: 'On sait depuis Euler que ζ(2) = π²/6, mais aucune formule fermée n’est connue pour ζ(3). Roger Apéry a démontré en 1978 son irrationalité, à la surprise générale, grâce à la série accélérée ci-dessus. Trois entiers pris au hasard n’ont aucun facteur premier commun avec une probabilité 1/ζ(3) ≈ 83,19 %.',
  },
  create(ctx) {
    const st = { n: 1, timer: 0, co: 0, tot: 0, recent: [] as boolean[] };
    const r = rng(33);
    ctx.ui.section('VALEUR');
    ctx.ui.readout('ζ(3)', DIGITS.zeta3.slice(0, 22).replace('.', ','));
    ctx.ui.readout('1/ζ(3)', fmt(1 / Z3, 10));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('zeta3'), 9));
    ctx.ui.section('MONTE-CARLO');
    const roP = ctx.ui.readout('TRIPLETS PREMIERS ENTRE EUX');
    const roN = ctx.ui.readout('TIRAGES');
    const spark = ctx.ui.spark('FRÉQUENCE OBSERVÉE', { size: 160 });
    const s1 = ctx.hud.stat('Σ 1/n³ (n termes)', '');
    const s2 = ctx.hud.stat('P(COPREMIERS)', '');
    ctx.hud.tag('IRRATIONNEL (APÉRY 1978)');
    const fr = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1.3);
    let frame = 0;
    return {
      update(_t, dt) {
        st.timer += dt;
        if (st.timer > 0.35) {
          st.timer = 0;
          st.n = st.n >= 30 ? 1 : st.n + 1;
        }
        for (let i = 0; i < 300; i++) {
          const a = 1 + Math.floor(r() * 1e6);
          const b = 1 + Math.floor(r() * 1e6);
          const c = 1 + Math.floor(r() * 1e6);
          const ok = gcd(gcd(a, b), c) === 1;
          if (ok) st.co++;
          st.tot++;
          if (i < 4) {
            st.recent.push(ok);
            if (st.recent.length > 600) st.recent.shift();
          }
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        // left: stacked cubes column
        const colW = Math.min(260, (W - 120) * 0.35);
        fr.set(80, 140, colW, H - 290).world(0, 1, 0, 1.3);
        fr.box(g, 'Σ 1/n³ EMPILÉE', false);
        let s = 0;
        for (let k = 1; k <= st.n; k++) {
          const t = 1 / (k * k * k);
          const y0 = fr.sy(s);
          const y1 = fr.sy(s + t);
          const w = fr.w * Math.max(0.08, Math.cbrt(t));
          g.strokeStyle = INK.f80;
          g.strokeRect(fr.x + (fr.w - w) / 2 + 0.5, y1 + 0.5, w, Math.max(1, y0 - y1));
          if (k <= 4) text(g, `1/${k}³`, fr.x + fr.w / 2, (y0 + y1) / 2 + 4, { align: 'center', size: 10, color: INK.fg });
          s += t;
        }
        line(g, fr.x - 6, fr.sy(Z3), fr.x + fr.w + 6, fr.sy(Z3), INK.fg, [4, 3]);
        text(g, 'ζ(3)', fr.x + fr.w + 10, fr.sy(Z3) + 4, { color: INK.fg });
        // right: grid of recent triplets
        const gx = fr.x + fr.w + 90;
        const gw = W - gx - 330;
        const cols = 30;
        const cell = Math.max(4, Math.min(16, gw / cols));
        text(g, 'TRIPLETS RÉCENTS (■ = PREMIERS ENTRE EUX)', gx, 132, { size: 9, color: INK.f40 });
        st.recent.forEach((ok, i) => {
          const x = gx + (i % cols) * cell;
          const y = 140 + Math.floor(i / cols) * cell;
          if (y > H - 160) return;
          if (ok) {
            g.fillStyle = INK.f80;
            g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
          } else {
            g.strokeStyle = INK.f20;
            g.strokeRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
          }
        });
        const p = st.co / Math.max(1, st.tot);
        if (frame++ % 8 === 0) {
          spark.push(p);
          roP.set(`${fmt(100 * p, 3)} %`);
          roN.set(fmtInt(st.tot));
        }
        s1(`${fmt(s, 8)} (${st.n})`);
        s2(`${fmt(100 * p, 3)} % → ${fmt(100 / Z3, 3)} %`);
      },
    };
  },
};
