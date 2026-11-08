import type { VizDef } from '../../core/types';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt, fmtInt, fmtSci } from '../../hud/dom';
import { rng } from '../fractals/common';

export const buffonView: VizDef = {
  id: 'buffon',
  title: 'AIGUILLE DE BUFFON',
  subtitle: 'Des aiguilles lâchées au hasard sur un parquet : la proportion de celles qui coupent une lame donne π.',
  stage: '2d',
  keywords: ['buffon', 'aiguille', 'pi', 'π', 'géométrie aléatoire', 'monte-carlo'],
  formula: {
    tex: 'P(\\text{croise})=\\frac{2\\ell}{\\pi d}\\quad(\\ell\\le d)\\qquad\\Longrightarrow\\qquad \\pi\\approx\\frac{2\\ell\\,N}{d\\,C}',
    note: 'Georges-Louis Leclerc de Buffon (1777) : une aiguille de longueur ℓ tombe sur des lignes parallèles espacées de d. Sa position (distance du centre à la ligne) et son angle sont uniformes ; l’aiguille croise une ligne avec probabilité 2ℓ/(πd). En comptant C croisements sur N lancers, on estime π — lentement : l’erreur décroît en 1/√N.',
  },
  create(ctx) {
    const st = { l: 0.8, rate: 30, N: 0, C: 0, recent: [] as [number, number, number, number, boolean][] };
    const r = rng(29);
    const d = 1;
    ctx.ui.section('EXPÉRIENCE');
    ctx.ui.slider({ label: 'LONGUEUR ℓ / d', min: 0.1, max: 1, step: 0.01, value: st.l, onInput: (v) => ((st.l = v), (st.N = 0), (st.C = 0), (st.recent = [])) });
    ctx.ui.slider({ label: 'AIGUILLES / IMAGE', min: 1, max: 2000, step: 1, log: true, value: st.rate, onInput: (v) => (st.rate = v) });
    ctx.ui.buttons([{ label: 'RELANCER', icon: 'reset', onClick: () => ((st.N = 0), (st.C = 0), (st.recent = [])) }]);
    ctx.ui.section('ESTIMATION');
    const roN = ctx.ui.readout('LANCERS N');
    const roC = ctx.ui.readout('CROISEMENTS C');
    const roP = ctx.ui.readout('π ≈ 2ℓN / dC');
    const roE = ctx.ui.readout('ERREUR');
    const spark = ctx.ui.spark('ESTIMATION AU FIL DES LANCERS', { size: 160 });
    const s1 = ctx.hud.stat('N', '');
    const s2 = ctx.hud.stat('π ≈', '');
    let frame = 0;
    return {
      update() {
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const x0 = 60;
        const y0 = 130;
        const w = W - 120;
        const h = H - 250;
        const lanes = 7;
        const u = h / lanes; // pixels per unit d
        for (let i = 0; i < st.rate; i++) {
          const cx = r() * (w / u);
          const cy = r() * lanes;
          const a = r() * Math.PI;
          const dy = (st.l / 2) * Math.sin(a);
          const dx = (st.l / 2) * Math.cos(a);
          const ya = cy - dy;
          const yb = cy + dy;
          const cross = Math.floor(ya / d) !== Math.floor(yb / d);
          st.N++;
          if (cross) st.C++;
          st.recent.push([cx - dx, ya, cx + dx, yb, cross]);
        }
        if (st.recent.length > 500) st.recent.splice(0, st.recent.length - 500);
        for (let k = 0; k <= lanes; k++) line(g, x0, y0 + k * u, x0 + w, y0 + k * u, INK.f40);
        for (const [ax, ay, bx, by, cr] of st.recent) line(g, x0 + ax * u, y0 + ay * u, x0 + bx * u, y0 + by * u, cr ? INK.fg : INK.f20);
        text(g, 'd', x0 - 14, y0 + u / 2 + 4, { color: INK.f80 });
        const est = st.C ? (2 * st.l * st.N) / (d * st.C) : NaN;
        if (frame++ % 6 === 0) {
          roN.set(fmtInt(st.N));
          roC.set(fmtInt(st.C));
          roP.set(Number.isFinite(est) ? fmt(est, 6) : '—');
          roE.set(Number.isFinite(est) ? fmtSci(Math.abs(est - Math.PI), 2) : '—');
          if (Number.isFinite(est)) spark.push(est);
          s1(fmtInt(st.N));
          s2(Number.isFinite(est) ? fmt(est, 5) : '—');
        }
      },
    };
  },
};
