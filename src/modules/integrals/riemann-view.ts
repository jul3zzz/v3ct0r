import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, axes, dotGrid, plot, hatch, marker, text, line } from '../../gfx/plot2d';
import { adaptiveSimpson, riemann, range, METHOD_ORDER, type RiemannMethod } from '../../math/numeric';
import { fmt, fmtSci } from '../../hud/dom';

const METHODS: { id: RiemannMethod; label: string; tex: string }[] = [
  { id: 'left', label: 'GAUCHE', tex: 'S_n=h\\sum_{i=0}^{n-1} f(x_i)' },
  { id: 'right', label: 'DROITE', tex: 'S_n=h\\sum_{i=1}^{n} f(x_i)' },
  { id: 'mid', label: 'MILIEU', tex: 'S_n=h\\sum_{i=0}^{n-1} f\\!\\left(x_i+\\tfrac h2\\right)' },
  { id: 'trap', label: 'TRAPÈZES', tex: 'T_n=h\\left[\\tfrac{f(a)+f(b)}2+\\sum_{i=1}^{n-1}f(x_i)\\right]' },
  { id: 'simpson', label: 'SIMPSON', tex: 'S_n=\\tfrac h3\\left[f(a)+4\\!\\sum_{\\text{impairs}}\\!f(x_i)+2\\!\\sum_{\\text{pairs}}\\!f(x_i)+f(b)\\right]' },
];

export const PRESETS_1D = ['sin(x) + 1.5', 'x^2', 'exp(-x^2)', 'sqrt(x)', 'x^3 - 2x + 1', '1/x', 'abs(sin(3x))'];

export const riemannView: VizDef = {
  id: 'riemann',
  title: 'SOMMES DE RIEMANN',
  subtitle: 'L’aire sous la courbe approchée par n rectangles, trapèzes ou arcs de paraboles. L’erreur s’affiche en direct.',
  stage: '2d',
  keywords: ['riemann', 'aire', 'rectangles', 'trapèzes', 'simpson', 'intégrale', 'convergence'],
  formula: {
    tex: '\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty} \\frac{b-a}{n}\\sum_{i=0}^{n-1} f\\!\\left(a+i\\,\\frac{b-a}{n}\\right)',
    note: 'On découpe [a, b] en n bandes de largeur h = (b − a)/n et on additionne des aires simples. Rectangles à gauche ou à droite : erreur en 1/n. Milieu et trapèzes : en 1/n². Simpson, qui remplace la courbe par des paraboles : en 1/n⁴. Le graphe en médaillon montre ces pentes en échelle log-log.',
  },
  create(ctx) {
    const st = { src: 'sin(x) + 1.5', f: (x: number) => Math.sin(x) + 1.5, a: 0, b: 4, n: 4, method: 'mid' as RiemannMethod, auto: true, timer: 0, exact: 0, grow: 1 };
    const pz = new PanZoom(ctx, { scale: 0.01, minScale: 1e-5 });
    const refit = () => {
      const [lo, hi] = range(st.f, st.a, st.b);
      const y0 = Math.min(0, lo);
      const y1 = Math.max(0, hi);
      const padX = (st.b - st.a) * 0.12;
      pz.fit(st.a - padX, st.b + padX, y0 - (y1 - y0) * 0.15, y1 + (y1 - y0) * 0.25, 70);
    };
    const recompute = () => {
      st.exact = adaptiveSimpson(st.f, st.a, st.b);
    };

    ctx.ui.section('FONCTION');
    ctx.ui.formula({
      prefix: 'f(x) =',
      value: st.src,
      vars: ['x'],
      presets: PRESETS_1D,
      onChange: (c) => {
        st.src = c.src;
        st.f = c.fn as (x: number) => number;
        recompute();
        refit();
      },
    });
    ctx.ui.slider({ label: 'BORNE a', min: -6, max: 6, step: 0.01, value: st.a, onInput: (v) => ((st.a = Math.min(v, st.b - 0.01)), recompute()) });
    ctx.ui.slider({ label: 'BORNE b', min: -6, max: 6, step: 0.01, value: st.b, onInput: (v) => ((st.b = Math.max(v, st.a + 0.01)), recompute()) });
    ctx.ui.buttons([{ label: 'RECADRER', icon: 'target', onClick: refit }]);
    ctx.ui.section('MÉTHODE');
    const mSeg = ctx.ui.segmented({
      options: METHODS.map((m) => ({ id: m.id, label: m.label })),
      value: st.method,
      cols: 3,
      onChange: (id) => {
        st.method = id;
        const m = METHODS.find((x) => x.id === id)!;
        ctx.setFormula({ tex: m.tex, note: riemannView.formula.note });
      },
    });
    const nS = ctx.ui.slider({ label: 'SUBDIVISIONS n', min: 1, max: 512, step: 1, log: true, value: st.n, onInput: (v) => ((st.n = v), (st.grow = 0)) });
    ctx.ui.toggle({ label: 'CONVERGENCE AUTOMATIQUE (n × 2)', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('RÉSULTAT');
    const roS = ctx.ui.readout('SOMME Sₙ');
    const roI = ctx.ui.readout('INTÉGRALE (RÉF.)');
    const roE = ctx.ui.readout('ERREUR |Sₙ − I|');
    const roO = ctx.ui.readout('ORDRE');
    const sS = ctx.hud.stat('Sₙ', '');
    const sI = ctx.hud.stat('∫ f', '');
    const sE = ctx.hud.stat('ERREUR', '');
    const sN = ctx.hud.stat('n', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');

    recompute();
    refit();
    const conv = new Frame2D(0, 0, 250, 150, 0, 10, -16, 1);

    const drawShapes = (g: CanvasRenderingContext2D) => {
      const { a, b, n, f } = st;
      const h = (b - a) / n;
      const path = new Path2D();
      const outline = new Path2D();
      const y0 = pz.sy(0);
      if (st.method === 'simpson') {
        const m = n % 2 ? n + 1 : n;
        const hh = (b - a) / m;
        for (let i = 0; i < m; i += 2) {
          const x0 = a + i * hh;
          const x1 = x0 + hh;
          const x2 = x0 + 2 * hh;
          const f0 = f(x0);
          const f1 = f(x1);
          const f2 = f(x2);
          // Lagrange parabola through the 3 nodes
          const P = (x: number) => f0 * ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) + f1 * ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) + f2 * ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
          path.moveTo(pz.sx(x0), y0);
          outline.moveTo(pz.sx(x0), y0);
          const k = 24;
          for (let j = 0; j <= k; j++) {
            const x = x0 + ((x2 - x0) * j) / k;
            const yy = pz.sy(P(x) * st.grow);
            path.lineTo(pz.sx(x), yy);
            outline.lineTo(pz.sx(x), yy);
          }
          path.lineTo(pz.sx(x2), y0);
          outline.lineTo(pz.sx(x2), y0);
          path.closePath();
          if (m <= 64) [x0, x1, x2].forEach((x) => marker(g, pz.sx(x), pz.sy(f(x)), 4, true));
        }
      } else {
        for (let i = 0; i < n; i++) {
          const x0 = a + i * h;
          const x1 = x0 + h;
          const X0 = pz.sx(x0);
          const X1 = pz.sx(x1);
          if (st.method === 'trap') {
            const Y0 = pz.sy(f(x0) * st.grow);
            const Y1 = pz.sy(f(x1) * st.grow);
            path.moveTo(X0, y0);
            path.lineTo(X0, Y0);
            path.lineTo(X1, Y1);
            path.lineTo(X1, y0);
            path.closePath();
          } else {
            const xs = st.method === 'left' ? x0 : st.method === 'right' ? x1 : x0 + h / 2;
            const v = f(xs);
            const Y = pz.sy((Number.isFinite(v) ? v : 0) * st.grow);
            path.rect(X0, Math.min(Y, y0), X1 - X0, Math.abs(Y - y0));
            if (n <= 64) marker(g, pz.sx(xs), Y, 4, true);
          }
        }
        outline.addPath(path);
      }
      hatch(g, path, 6, INK.f10);
      g.strokeStyle = `rgba(255,255,255,${n > 128 ? 0.25 : 0.55})`;
      g.lineWidth = 1;
      g.stroke(st.method === 'simpson' ? outline : path);
    };

    const drawConvergence = (g: CanvasRenderingContext2D) => {
      const W = ctx.width;
      const H = ctx.height;
      // narrow view (phone): no room for the inset, which would cover the curve (the panel gives the error and the order)
      if (W < NARROW_VIEW) return;
      conv.set(W - 250 - 30, H - 150 - 60, 250, 150);
      const pts: Record<string, [number, number][]> = {};
      let lo = 0;
      for (const m of METHODS) {
        pts[m.id] = [];
        for (let k = 0; k <= 10; k++) {
          const n = 2 ** k;
          const e = Math.abs(riemann(st.f, st.a, st.b, n, m.id) - st.exact);
          const le = Math.log10(Math.max(1e-16, e));
          pts[m.id].push([k, le]);
          lo = Math.min(lo, le);
        }
      }
      conv.world(0, 10, Math.max(-16, Math.floor(lo)) - 0.5, 1);
      conv.box(g, 'CONVERGENCE · log₁₀ ERREUR vs log₂ n');
      g.save();
      g.beginPath();
      g.rect(conv.x, conv.y, conv.w, conv.h);
      g.clip();
      for (let e = Math.ceil(conv.ymin); e <= 0; e += 2) {
        line(g, conv.x, conv.sy(e), conv.x + conv.w, conv.sy(e), INK.f05);
        text(g, `1e${e}`, conv.x + 3, conv.sy(e) - 2, { size: 8, color: INK.f20 });
      }
      for (const m of METHODS) {
        const cur = m.id === st.method;
        g.strokeStyle = cur ? INK.fg : INK.f20;
        g.setLineDash(m.id === 'right' ? [2, 3] : []);
        g.beginPath();
        pts[m.id].forEach(([k, e], i) => (i ? g.lineTo(conv.sx(k), conv.sy(e)) : g.moveTo(conv.sx(k), conv.sy(e))));
        g.stroke();
        g.setLineDash([]);
        const [k, e] = pts[m.id][10];
        text(g, m.label.slice(0, 4), conv.sx(k) - 3, conv.sy(e) + 3, { size: 8, color: cur ? INK.fg : INK.f40, align: 'right' });
      }
      const kx = Math.log2(st.n);
      const e = Math.log10(Math.max(1e-16, Math.abs(riemann(st.f, st.a, st.b, st.n, st.method) - st.exact)));
      marker(g, conv.sx(kx), conv.sy(e), 5, false);
      g.restore();
    };

    let frame = 0;
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.1) {
            st.timer = 0;
            st.n = st.n >= 256 ? 1 : st.n * 2;
            st.grow = 0;
            nS.set(st.n, true);
          }
        }
        st.grow = Math.min(1, st.grow + dt * 4);
        const g = ctx.g;
        dotGrid(g, pz);
        axes(g, pz, { xName: 'x', yName: 'y' });
        drawShapes(g);
        plot(g, pz, st.f, { color: INK.fg });
        line(g, pz.sx(st.a), 0, pz.sx(st.a), ctx.height, INK.f20, [3, 4]);
        line(g, pz.sx(st.b), 0, pz.sx(st.b), ctx.height, INK.f20, [3, 4]);
        text(g, 'a', pz.sx(st.a) + 4, 50, { color: INK.f60 });
        text(g, 'b', pz.sx(st.b) + 4, 50, { color: INK.f60 });
        drawConvergence(g);
        if (frame++ % 4 === 0) {
          const S = riemann(st.f, st.a, st.b, st.n, st.method);
          const err = Math.abs(S - st.exact);
          roS.set(fmt(S, 8));
          roI.set(fmt(st.exact, 8));
          roE.set(fmtSci(err, 2));
          roO.set(METHOD_ORDER[st.method]);
          sS(fmt(S, 6));
          sI(fmt(st.exact, 6));
          sE(`${fmtSci(err, 2)} (${fmtSci(Math.abs(err / (st.exact || 1)) * 100, 1)} %)`);
          sN(st.method === 'simpson' && st.n % 2 ? `${st.n} → ${st.n + 1} (PAIR)` : String(st.n));
        }
      },
      cinematic(t) {
        const m = METHODS[Math.floor(t / 5.5) % METHODS.length].id;
        if (m !== st.method) mSeg.set(m);
      },
    };
  },
};
