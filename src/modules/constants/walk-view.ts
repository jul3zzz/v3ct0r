import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, text } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { CONSTANTS, type ConstId, byId } from './data';
import { rng } from '../fractals/common';

const DIRS = Array.from({ length: 10 }, (_, d) => [Math.cos((d * Math.PI) / 5), Math.sin((d * Math.PI) / 5)] as const);

function walk(digits: string, n: number): Float64Array {
  const out = new Float64Array((n + 1) * 2);
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    const d = digits.charCodeAt(i) - 48;
    x += DIRS[d][0];
    y += DIRS[d][1];
    out[(i + 1) * 2] = x;
    out[(i + 1) * 2 + 1] = y;
  }
  return out;
}

export const walkView: VizDef = {
  id: 'walk',
  title: 'MARCHE DES DÉCIMALES',
  subtitle: 'Chaque décimale est une direction (0 → 0°, 1 → 36°, …) : la marche de π ressemble-t-elle à une marche au hasard ?',
  stage: '2d',
  keywords: ['marche aléatoire', 'décimales', 'normalité', 'hasard', 'pi', 'chi2'],
  formula: {
    tex: '\\mathbf{p}_{k+1}=\\mathbf{p}_k+\\big(\\cos\\tfrac{2\\pi d_k}{10},\\ \\sin\\tfrac{2\\pi d_k}{10}\\big),\\qquad \\chi^2=\\sum_{d=0}^{9}\\frac{(N_d-N/10)^2}{N/10}',
    note: 'Un nombre est dit « normal » si tous les blocs de chiffres y apparaissent avec la même fréquence. On conjecture que π, e et √2 sont normaux, sans l’avoir prouvé. Leur marche ressemble à une marche aléatoire (distance ~ √N), et l’histogramme des chiffres reste plat : le χ² sur 9 degrés de liberté vaut en moyenne 9.',
  },
  create(ctx) {
    const st = { id: 'pi' as ConstId, n: 0, max: 10000, speed: 40, compare: true };
    const pz = new PanZoom(ctx, { scale: 0.5, minScale: 1e-3 });
    const r = rng(8);
    let rnd = '';
    for (let i = 0; i < 10000; i++) rnd += String(Math.floor(r() * 10));
    let pts = walk(byId('pi').digits.split('.')[1], st.max);
    const rpts = walk(rnd, st.max);
    ctx.ui.section('CONSTANTE');
    ctx.ui.segmented({
      options: CONSTANTS.map((c) => ({ id: c.id, label: c.sym })),
      value: 'pi',
      cols: 4,
      onChange: (id) => {
        st.id = id;
        pts = walk(byId(id).digits.split('.')[1], st.max);
        st.n = 0;
      },
    });
    ctx.ui.slider({ label: 'PAS / SECONDE', min: 5, max: 3000, step: 1, log: true, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.toggle({ label: 'COMPARER À UN VRAI HASARD', value: true, onChange: (v) => (st.compare = v) });
    ctx.ui.buttons([{ label: 'RECOMMENCER', icon: 'reset', onClick: () => (st.n = 0) }]);
    const roChi = ctx.ui.readout('χ² (9 DDL)');
    const roD = ctx.ui.readout('DISTANCE / √N');
    const s1 = ctx.hud.stat('DÉCIMALES', '');
    const s2 = ctx.hud.stat('DISTANCE', '');
    const s3 = ctx.hud.stat('χ²', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    const hist = new Frame2D(0, 0, 220, 110, -0.5, 9.5, 0, 0.16);
    let acc = 0;
    let fitAt = -1;
    return {
      update(_t, dt) {
        pz.tick();
        acc += dt * st.speed;
        const step = Math.floor(acc);
        acc -= step;
        st.n = Math.min(st.max, st.n + step);
        if (st.n >= st.max) st.n = st.max;
        const n = Math.max(1, st.n);
        // auto-fit while walking
        if (!pz.dragging && (fitAt < 0 || n - fitAt > 50)) {
          let x0 = -5, x1 = 5, y0 = -5, y1 = 5;
          for (const P of st.compare ? [pts, rpts] : [pts])
            for (let i = 0; i <= n; i++) {
              x0 = Math.min(x0, P[i * 2]);
              x1 = Math.max(x1, P[i * 2]);
              y0 = Math.min(y0, P[i * 2 + 1]);
              y1 = Math.max(y1, P[i * 2 + 1]);
            }
          pz.fit(x0, x1, y0, y1, 120);
          fitAt = n;
        }
        const g = ctx.g;
        const draw = (P: Float64Array, color: string) => {
          g.strokeStyle = color;
          g.beginPath();
          for (let i = 0; i <= n; i++) {
            const x = pz.sx(P[i * 2]);
            const y = pz.sy(P[i * 2 + 1]);
            i ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.stroke();
        };
        if (st.compare) draw(rpts, INK.f20);
        draw(pts, INK.fg);
        g.fillStyle = INK.fg;
        g.fillRect(Math.round(pz.sx(pts[n * 2])) - 2, Math.round(pz.sy(pts[n * 2 + 1])) - 2, 5, 5);
        g.strokeStyle = INK.f60;
        g.strokeRect(Math.round(pz.sx(0)) - 3.5, Math.round(pz.sy(0)) - 3.5, 7, 7);
        // histogram
        const digits = byId(st.id).digits.split('.')[1];
        const counts = new Array(10).fill(0);
        for (let i = 0; i < n; i++) counts[digits.charCodeAt(i) - 48]++;
        let chi = 0;
        for (const c of counts) chi += (c - n / 10) ** 2 / (n / 10);
        // narrow view (phone): a smaller histogram in the bottom right corner, beside the HUD stats
        const narrow = ctx.width < NARROW_VIEW;
        if (narrow) hist.set(ctx.width - 148, ctx.height - 118, 134, 62);
        else hist.set(ctx.width - 260, ctx.height - 190, 220, 110);
        hist.box(g, narrow ? 'CHIFFRES 0–9' : 'FRÉQUENCE DES CHIFFRES 0–9');
        counts.forEach((c, d) => {
          const f = c / n;
          const x0 = hist.sx(d - 0.35);
          const x1 = hist.sx(d + 0.35);
          g.fillStyle = INK.f60;
          g.fillRect(x0, hist.sy(f), x1 - x0, hist.sy(0) - hist.sy(f));
          text(g, String(d), (x0 + x1) / 2, hist.y + hist.h + 11, { align: 'center', size: 8, color: INK.f40 });
        });
        g.strokeStyle = INK.fg;
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(hist.x, hist.sy(0.1));
        g.lineTo(hist.x + hist.w, hist.sy(0.1));
        g.stroke();
        g.setLineDash([]);
        const dist = Math.hypot(pts[n * 2], pts[n * 2 + 1]);
        roChi.set(fmt(chi, 2));
        roD.set(fmt(dist / Math.sqrt(n), 3));
        s1(`${fmtInt(n)} / ${fmtInt(st.max)}`);
        s2(`${fmt(dist, 1)} (√N = ${fmt(Math.sqrt(n), 1)})`);
        s3(fmt(chi, 2));
      },
    };
  },
};
