import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { rng } from '../fractals/common';

interface Exp {
  id: string;
  label: string;
  draw: (r: () => number) => number;
  mu: number;
  sigma: number;
  yr: [number, number];
}

const EXPS: Exp[] = [
  { id: 'coin', label: 'PIÈCE (PILE = 1)', draw: (r) => (r() < 0.5 ? 1 : 0), mu: 0.5, sigma: 0.5, yr: [0, 1] },
  { id: 'die', label: 'DÉ À 6 FACES', draw: (r) => 1 + Math.floor(r() * 6), mu: 3.5, sigma: Math.sqrt(35 / 12), yr: [1, 6] },
  { id: 'cauchy', label: 'CAUCHY (CONTRE-EXEMPLE)', draw: (r) => Math.tan(Math.PI * (r() - 0.5)), mu: NaN, sigma: NaN, yr: [-6, 6] },
];

export const llnView: VizDef = {
  id: 'lln',
  title: 'LOI DES GRANDS NOMBRES',
  subtitle: 'La moyenne de n tirages se rapproche de l’espérance quand n grandit — sauf si l’espérance n’existe pas (loi de Cauchy).',
  stage: '2d',
  keywords: ['loi des grands nombres', 'moyenne', 'espérance', 'convergence', 'cauchy', 'pile ou face'],
  formula: {
    tex: '\\overline{X}_n=\\frac1n\\sum_{k=1}^n X_k \\xrightarrow[n\\to\\infty]{\\text{p.s.}} \\mathbb E[X],\\qquad \\operatorname{écart}\\approx\\frac{\\sigma}{\\sqrt n}',
    note: 'Chaque courbe est une expérience : la moyenne des n premiers tirages, en fonction de n (échelle logarithmique). Toutes finissent par se coller à l’espérance, dans un entonnoir de largeur σ/√n. Avec la loi de Cauchy, qui n’a pas d’espérance, la moyenne ne se stabilise jamais : un tirage géant suffit à la faire sauter.',
  },
  create(ctx) {
    const K = 8;
    const NMAX = 100_000;
    const st = { k: 0, n: 0, speed: 1, series: [] as Float64Array[], sums: new Float64Array(K) };
    const rs = Array.from({ length: K }, (_, i) => rng(100 + i));
    const reset = () => {
      st.n = 0;
      st.series = Array.from({ length: K }, () => new Float64Array(NMAX));
      st.sums = new Float64Array(K);
    };
    reset();
    ctx.ui.section('EXPÉRIENCE');
    const sel = ctx.ui.segmented({ options: EXPS.map((e, i) => ({ id: String(i), label: e.label })), value: '0', cols: 1, onChange: (v) => ((st.k = Number(v)), reset()) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.2, max: 5, step: 0.01, value: 1, onInput: (v) => (st.speed = v) });
    ctx.ui.buttons([{ label: 'RELANCER', icon: 'reset', onClick: reset }]);
    ctx.ui.section('MESURES');
    const roN = ctx.ui.readout('TIRAGES n');
    const roMu = ctx.ui.readout('ESPÉRANCE');
    const roSp = ctx.ui.readout('DISPERSION DES MOYENNES');
    const s1 = ctx.hud.stat('n', '');
    const s2 = ctx.hud.stat('MOYENNES', '');
    const fr = new Frame2D(0, 0, 1, 1, 0, 5, 0, 1);
    let tl = 0;
    return {
      update(_t, dt) {
        const e = EXPS[st.k];
        // logarithmic growth of n: ~0.6 decade per second
        tl += dt * st.speed * 0.6;
        const target = Math.min(NMAX, Math.floor(Math.pow(10, Math.min(5, tl))));
        while (st.n < target) {
          for (let j = 0; j < K; j++) {
            st.sums[j] += e.draw(rs[j]);
            st.series[j][st.n] = st.sums[j] / (st.n + 1);
          }
          st.n++;
        }
        if (st.n >= NMAX && tl > 5.6) {
          reset();
          tl = 0;
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        fr.set(80, 140, W - 160, H - 290).world(0, 5, e.yr[0], e.yr[1]);
        fr.box(g, 'MOYENNE EMPIRIQUE EN FONCTION DE n (ÉCHELLE LOG)', false);
        for (let d = 0; d <= 5; d++) {
          line(g, fr.sx(d), fr.y, fr.sx(d), fr.y + fr.h, INK.f10);
          text(g, `10${'⁰¹²³⁴⁵'[d]}`, fr.sx(d), fr.y + fr.h + 14, { align: 'center', color: INK.f60 });
        }
        if (Number.isFinite(e.mu)) {
          line(g, fr.x, fr.sy(e.mu), fr.x + fr.w, fr.sy(e.mu), INK.fg, [5, 4]);
          text(g, `E[X] = ${fmt(e.mu, 2)}`, fr.x + fr.w - 6, fr.sy(e.mu) - 6, { align: 'right', color: INK.fg });
          // σ/√n funnel
          g.strokeStyle = INK.f40;
          for (const sgn of [-1, 1]) {
            g.beginPath();
            for (let i = 0; i <= 200; i++) {
              const ln = (5 * i) / 200;
              const v = e.mu + (sgn * 2 * e.sigma) / Math.sqrt(Math.pow(10, ln));
              const y = fr.sy(Math.max(e.yr[0], Math.min(e.yr[1], v)));
              i ? g.lineTo(fr.sx(ln), y) : g.moveTo(fr.sx(ln), y);
            }
            g.stroke();
          }
        }
        g.save();
        g.beginPath();
        g.rect(fr.x, fr.y, fr.w, fr.h);
        g.clip();
        st.series.forEach((s, j) => {
          g.strokeStyle = j === 0 ? INK.fg : INK.f60;
          g.beginPath();
          const step = Math.max(1, Math.floor(st.n / 1500));
          let first = true;
          for (let i = 0; i < st.n; i += i < 200 ? 1 : step) {
            const x = fr.sx(Math.log10(i + 1));
            const y = fr.sy(Math.max(e.yr[0] - 1, Math.min(e.yr[1] + 1, s[i])));
            first ? g.moveTo(x, y) : g.lineTo(x, y);
            first = false;
          }
          g.stroke();
        });
        g.restore();
        fr.axes(g, { labels: false });
        const last = st.series.map((s) => s[Math.max(0, st.n - 1)]);
        const lo = Math.min(...last);
        const hi = Math.max(...last);
        roN.set(fmtInt(st.n));
        roMu.set(Number.isFinite(e.mu) ? fmt(e.mu, 3) : 'N’EXISTE PAS');
        roSp.set(fmt(hi - lo, 4));
        s1(fmtInt(st.n));
        s2(`${fmt(lo, 3)} … ${fmt(hi, 3)}`);
      },
      cinematic(t) {
        const k = Math.floor(t / 9) % 2;
        if (k !== st.k) sel.set(String(k));
      },
    };
  },
};
