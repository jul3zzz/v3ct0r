import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, marker, line } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString } from './data';

const PHI = (1 + Math.sqrt(5)) / 2;

interface Sq {
  x: number;
  y: number;
  s: number;
  cx: number;
  cy: number;
  a0: number;
}

/** Fibonacci squares spiralling counterclockwise, with the quarter-arc of each square. */
function fibSquares(n: number): Sq[] {
  const out: Sq[] = [{ x: 0, y: 0, s: 1, cx: 1, cy: 1, a0: Math.PI }];
  let x0 = 0, y0 = 0, x1 = 1, y1 = 1;
  let a = 1, b = 1;
  for (let i = 1; i < n; i++) {
    const s = b;
    const dir = (i - 1) % 4;
    let sq: Sq;
    if (dir === 0) { sq = { x: x1, y: y0, s, cx: x1, cy: y0 + s, a0: -Math.PI / 2 }; x1 += s; }
    else if (dir === 1) { sq = { x: x0, y: y1, s, cx: x0, cy: y1, a0: 0 }; y1 += s; }
    else if (dir === 2) { sq = { x: x0 - s, y: y0, s, cx: x0, cy: y0, a0: Math.PI / 2 }; x0 -= s; }
    else { sq = { x: x0, y: y0 - s, s, cx: x0 + s, cy: y0, a0: Math.PI }; y0 -= s; }
    out.push(sq);
    [a, b] = [b, a + b];
  }
  return out;
}

export const phiView: VizDef = {
  id: 'phi',
  title: 'φ — NOMBRE D’OR',
  subtitle: 'Rectangle d’or, spirale de Fibonacci, et le rapport Fₙ₊₁/Fₙ qui converge vers φ en oscillant.',
  stage: '2d',
  keywords: ['phi', 'φ', 'nombre d’or', 'fibonacci', 'spirale', 'rectangle d’or'],
  formula: {
    tex: '\\varphi=\\frac{1+\\sqrt5}{2}=1+\\cfrac{1}{1+\\cfrac{1}{1+\\cdots}},\\qquad \\frac{F_{n+1}}{F_n}\\xrightarrow[n\\to\\infty]{}\\varphi',
    note: 'φ est le seul nombre positif tel que φ² = φ + 1 : un rectangle de côtés φ × 1 privé d’un carré redonne un rectangle d’or. Sa fraction continue ne contient que des 1 : c’est le nombre « le plus irrationnel », le plus mal approché par des fractions. Les quotients de nombres de Fibonacci consécutifs en sont les meilleures approximations.',
  },
  create(ctx) {
    const st = { mode: 'spiral', n: 1, max: 14, auto: true, timer: 0, grow: 1 };
    const pz = new PanZoom(ctx, { scale: 0.05, minScale: 1e-4 });
    const graph = new Frame2D(0, 0, 300, 150, 1, 16, 1, 2.05);
    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'spiral', label: 'SPIRALE' },
        { id: 'ratio', label: 'Fₙ₊₁ / Fₙ' },
      ],
      value: 'spiral',
      onChange: (v) => (st.mode = v),
    });
    const nS = ctx.ui.slider({ label: 'CARRÉS', min: 1, max: st.max, step: 1, value: 1, onInput: (v) => ((st.n = v), (st.auto = false), (st.grow = 0)) });
    ctx.ui.toggle({ label: 'CONSTRUCTION AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('VALEUR');
    ctx.ui.readout('φ', DIGITS.phi.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('phi'), 10));
    ctx.ui.readout('1/φ = φ − 1', fmt(1 / PHI, 10));
    ctx.ui.readout('φ² = φ + 1', fmt(PHI * PHI, 10));
    const roF = ctx.ui.readout('Fₙ₊₁ / Fₙ');
    const s1 = ctx.hud.stat('Fₙ', '');
    const s2 = ctx.hud.stat('Fₙ₊₁ / Fₙ', '');
    const s3 = ctx.hud.stat('ÉCART À φ', '');
    ctx.hud.tag('ALGÉBRIQUE · x² − x − 1 = 0');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    const fib = [1, 1];
    for (let i = 2; i < 40; i++) fib.push(fib[i - 1] + fib[i - 2]);
    let lastFit = -1;
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.0) {
            st.timer = 0;
            st.n = st.n >= st.max ? 1 : st.n + 1;
            st.grow = 0;
            nS.set(st.n, true);
          }
        }
        st.grow = Math.min(1, st.grow + dt * 2.5);
        const g = ctx.g;
        const sqs = fibSquares(st.n);
        if (st.mode === 'spiral') {
          if (lastFit !== st.n && !pz.dragging) {
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            for (const q of sqs) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x + q.s); y1 = Math.max(y1, q.y + q.s); }
            const prevScale = pz.scale;
            const prev = { cx: pz.cx, cy: pz.cy };
            pz.fit(x0, x1, y0, y1, 80);
            const target = { cx: pz.cx, cy: pz.cy, s: pz.scale };
            pz.cx = prev.cx; pz.cy = prev.cy; pz.scale = lastFit < 0 ? target.s : prevScale;
            pz.flyTo(target.cx, target.cy, target.s);
            lastFit = st.n;
          }
          sqs.forEach((q, i) => {
            const last = i === sqs.length - 1;
            const al = last ? st.grow : 1;
            g.strokeStyle = `rgba(255,255,255,${(0.35 * al).toFixed(3)})`;
            g.strokeRect(pz.sx(q.x), pz.sy(q.y + q.s), q.s / pz.scale, q.s / pz.scale);
            if (q.s / pz.scale > 22) text(g, String(q.s), pz.sx(q.x + q.s / 2), pz.sy(q.y + q.s / 2) + 4, { align: 'center', size: Math.min(28, 8 + q.s / pz.scale / 12), color: `rgba(255,255,255,${(0.4 * al).toFixed(3)})` });
            g.strokeStyle = INK.fg;
            g.lineWidth = 1;
            g.beginPath();
            const k = 40;
            const end = last ? st.grow : 1;
            for (let j = 0; j <= k * end; j++) {
              const a = q.a0 + (Math.PI / 2) * (j / k);
              const x = pz.sx(q.cx + q.s * Math.cos(a));
              const y = pz.sy(q.cy + q.s * Math.sin(a));
              j ? g.lineTo(x, y) : g.moveTo(x, y);
            }
            g.stroke();
          });
        } else {
          const W = ctx.width;
          const H = ctx.height;
          graph.set(80, 150, W - 160, H - 300).world(0.5, st.max + 0.5, 0.9, 2.1);
          graph.box(g, 'RAPPORTS DE FIBONACCI CONSÉCUTIFS', false);
          graph.axes(g, { xName: 'n', yName: 'Fₙ₊₁/Fₙ', xTicks: st.max });
          line(g, graph.x, graph.sy(PHI), graph.x + graph.w, graph.sy(PHI), INK.f40, [4, 4]);
          text(g, 'φ = 1,6180339887…', graph.x + graph.w - 6, graph.sy(PHI) - 6, { align: 'right', color: INK.f80 });
          g.strokeStyle = INK.fg;
          g.beginPath();
          for (let i = 1; i <= st.n; i++) {
            const v = fib[i] / fib[i - 1];
            i > 1 ? g.lineTo(graph.sx(i), graph.sy(v)) : g.moveTo(graph.sx(i), graph.sy(v));
          }
          g.stroke();
          for (let i = 1; i <= st.n; i++) {
            const v = fib[i] / fib[i - 1];
            marker(g, graph.sx(i), graph.sy(v), 5, i === st.n);
            if (i <= 9) text(g, `${fib[i]}/${fib[i - 1]}`, graph.sx(i), graph.sy(v) + (i % 2 ? -10 : 18), { align: 'center', size: 9, color: INK.f60 });
          }
        }
        const r = fib[st.n] / fib[st.n - 1];
        roF.set(`${fib[st.n]}/${fib[st.n - 1]} = ${fmt(r, 10)}`);
        s1(`${fib[st.n - 1]} → ${fib[st.n]}`);
        s2(fmt(r, 10));
        s3(Math.abs(r - PHI).toExponential(2).replace('.', ','));
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'ratio' : 'spiral';
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
