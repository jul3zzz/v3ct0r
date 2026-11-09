import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line, marker } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { floatingTeX } from './common';

export const eulerView: VizDef = {
  id: 'euler',
  title: 'IDENTITÉ D’EULER',
  subtitle: 'e^{iθ} parcourt le cercle unité ; à θ = π on arrive en −1. Et (1 + iπ/n)ⁿ, une suite de petites rotations, y converge.',
  stage: '2d',
  keywords: ['euler', 'identité', 'e^iπ', 'cercle unité', 'exponentielle complexe', 'cos', 'sin'],
  formula: {
    tex: 'e^{i\\theta}=\\cos\\theta+i\\sin\\theta \\;\\Longrightarrow\\; e^{i\\pi}+1=0,\\qquad \\left(1+\\frac{i\\pi}{n}\\right)^{n}\\xrightarrow[n\\to\\infty]{}-1',
    note: 'Multiplier par e^{iθ} fait tourner d’un angle θ sans changer la longueur. Aller jusqu’à θ = π, c’est faire un demi-tour : on arrive en −1, d’où e^{iπ} + 1 = 0, qui relie e, i, π, 1 et 0. La suite (1 + iπ/n)ⁿ réalise ce demi-tour par n petits pas presque tangents au cercle.',
  },
  create(ctx) {
    const st = { mode: 'circle', theta: 0, n: 1, auto: true, timer: 0 };
    const big = floatingTeX(ctx, 'e^{i\\pi}+1=0', 'right:330px;top:120px;font-size:30px;opacity:.95');
    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'circle', label: 'CERCLE UNITÉ' },
        { id: 'limit', label: '(1 + iπ/n)ⁿ' },
      ],
      value: 'circle',
      onChange: (v) => (st.mode = v),
    });
    const thS = ctx.ui.slider({ label: 'ANGLE θ', min: 0, max: 2 * Math.PI, step: 0.001, value: 0, fmt: (v) => `${fmt(v / Math.PI, 3)} π`, onInput: (v) => ((st.theta = v), (st.auto = false)) });
    const nS = ctx.ui.slider({ label: 'PAS n', min: 1, max: 512, step: 1, log: true, value: 1, onInput: (v) => ((st.n = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'ANIMATION', value: true, onChange: (v) => (st.auto = v) });
    const roZ = ctx.ui.readout('POINT');
    const s1 = ctx.hud.stat('', '');
    const s2 = ctx.hud.stat('', '');
    const fr = new Frame2D(0, 0, 1, 1, -1.7, 1.7, -1.7, 1.7);
    return {
      update(_t, dt) {
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        // a narrow viewport (small window): the circle takes the whole width, never a negative size
        const side = W > 760 ? 420 : 40;
        const size = Math.max(60, Math.min(W - side, H - 190));
        fr.set(side === 420 ? 60 + (W - 420 - size) / 2 : (W - size) / 2, 110 + Math.max(0, H - 190 - size) / 2, size, size);
        fr.axes(g, { xName: 'RE', yName: 'IM' });
        g.strokeStyle = INK.f40;
        g.beginPath();
        g.arc(fr.sx(0), fr.sy(0), fr.sx(1) - fr.sx(0), 0, Math.PI * 2);
        g.stroke();
        marker(g, fr.sx(-1), fr.sy(0), 7, false);
        text(g, '−1', fr.sx(-1) - 22, fr.sy(0) - 8, { color: INK.fg, size: 12 });
        text(g, '1', fr.sx(1) + 6, fr.sy(0) - 8, { color: INK.f60 });
        big.style.opacity = st.mode === 'circle' && st.theta > Math.PI - 0.02 && st.theta < Math.PI + 0.3 ? '1' : '0.35';
        if (st.mode === 'circle') {
          if (st.auto) {
            st.theta += dt * 0.6;
            if (st.theta > Math.PI && st.theta < Math.PI + dt * 0.6 + 1e-9) st.timer = 1.4;
            if (st.timer > 0) {
              st.timer -= dt;
              st.theta = Math.PI;
            }
            if (st.theta > 2 * Math.PI) st.theta = 0;
            thS.set(st.theta, true);
          }
          const th = st.theta;
          const x = Math.cos(th);
          const y = Math.sin(th);
          // swept arc
          g.strokeStyle = INK.fg;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(fr.sx(0), fr.sy(0), fr.sx(1) - fr.sx(0), 0, -th, true);
          g.stroke();
          g.lineWidth = 1;
          line(g, fr.sx(0), fr.sy(0), fr.sx(x), fr.sy(y), INK.fg);
          line(g, fr.sx(x), fr.sy(0), fr.sx(x), fr.sy(y), INK.f40, [3, 3]);
          line(g, fr.sx(0), fr.sy(y), fr.sx(x), fr.sy(y), INK.f40, [3, 3]);
          marker(g, fr.sx(x), fr.sy(y), 7, true);
          text(g, `cos θ = ${fmt(x, 3)}`, fr.sx(x), fr.sy(0) + 18, { align: 'center', color: INK.f80, size: 10 });
          text(g, `sin θ = ${fmt(y, 3)}`, fr.sx(0) - 8, fr.sy(y) - 6, { align: 'right', color: INK.f80, size: 10 });
          roZ.set(`${fmt(x, 4)} ${y >= 0 ? '+' : '−'} ${fmt(Math.abs(y), 4)} i`);
          s1(`θ = ${fmt(th / Math.PI, 3)} π`);
          s2(`e^{iθ} = ${fmt(x, 4)} ${y >= 0 ? '+' : '−'} ${fmt(Math.abs(y), 4)} i`);
        } else {
          if (st.auto) {
            st.timer += dt;
            if (st.timer > 1.2) {
              st.timer = 0;
              st.n = st.n >= 256 ? 1 : st.n * 2;
              nS.set(st.n, true);
            }
          }
          const n = st.n;
          let zr = 1;
          let zi = 0;
          const ar = 1;
          const ai = Math.PI / n;
          g.strokeStyle = INK.fg;
          g.beginPath();
          g.moveTo(fr.sx(1), fr.sy(0));
          for (let k = 0; k < n; k++) {
            [zr, zi] = [zr * ar - zi * ai, zr * ai + zi * ar];
            g.lineTo(fr.sx(zr), fr.sy(zi));
          }
          g.stroke();
          if (n <= 32) {
            let pr = 1;
            let pi = 0;
            for (let k = 0; k <= n; k++) {
              marker(g, fr.sx(pr), fr.sy(pi), 4, k === n);
              [pr, pi] = [pr * ar - pi * ai, pr * ai + pi * ar];
            }
          } else marker(g, fr.sx(zr), fr.sy(zi), 6, true);
          roZ.set(`${fmt(zr, 5)} ${zi >= 0 ? '+' : '−'} ${fmt(Math.abs(zi), 5)} i`);
          s1(`n = ${n}`);
          s2(`(1 + iπ/n)ⁿ = ${fmt(zr, 4)} ${zi >= 0 ? '+' : '−'} ${fmt(Math.abs(zi), 4)} i`);
        }
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'limit' : 'circle';
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
