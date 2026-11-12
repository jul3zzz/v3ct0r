import type { VizDef } from '../../core/types';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, text, line, marker, hatch } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString } from './data';

export const ln2View: VizDef = {
  id: 'ln2',
  title: 'ln 2 — LOGARITHME DE DEUX',
  subtitle: 'L’aire sous l’hyperbole 1/x entre 1 et 2, et la série harmonique alternée qui l’encadre en zigzag.',
  stage: '2d',
  keywords: ['ln 2', 'logarithme', 'hyperbole', 'série harmonique alternée', 'demi-vie', 'doublement'],
  formula: {
    tex: '\\ln 2=\\int_1^2\\frac{dx}{x}=1-\\frac12+\\frac13-\\frac14+\\cdots=\\sum_{k\\ge1}\\frac{1}{k\\,2^k}',
    note: 'ln 2 est l’aire sous la courbe 1/x entre 1 et 2. La série alternée converge très lentement (erreur ≈ 1/2n) en oscillant autour de la limite ; la série Σ 1/(k·2ᵏ) gagne un bit par terme. ln 2 règle les doublements : un capital à r % double en ≈ 69,3/r ans, une substance de demi-vie T décroît comme 2^(−t/T).',
  },
  create(ctx) {
    const st = { n: 1, timer: 0 };
    ctx.ui.section('VALEUR');
    ctx.ui.readout('ln 2', DIGITS.ln2.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('ln2'), 10));
    ctx.ui.readout('RÈGLE DE 70', '69,3 / r % ANS');
    const roA = ctx.ui.readout('SÉRIE ALTERNÉE Sₙ');
    const roB = ctx.ui.readout('Σ 1/(k·2ᵏ)');
    const s1 = ctx.hud.stat('n', '');
    const s2 = ctx.hud.stat('ALTERNÉE', '');
    const s3 = ctx.hud.stat('Σ 1/(k 2ᵏ)', '');
    ctx.hud.tag('TRANSCENDANT');
    const area = new Frame2D(0, 0, 1, 1, 0, 3, 0, 1.4);
    const ser = new Frame2D(0, 0, 1, 1, 0, 40, 0.4, 1.05);
    return {
      update(_t, dt) {
        st.timer += dt;
        if (st.timer > 0.3) {
          st.timer = 0;
          st.n = st.n >= 40 ? 1 : st.n + 1;
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const half = (W - 420) / 2;
        // narrow view (phone): the area above the series
        const nb = W < NARROW_VIEW ? narrowPlot(W, H, 3) : null;
        const nh = nb ? (nb[3] - 34) / 2 : 0;
        if (nb) area.set(nb[0], nb[1], nb[2], nh).world(0, 3, 0, 1.4);
        else area.set(80, 160, half - 40, H - 320).world(0, 3, 0, 1.4);
        area.box(g, 'AIRE SOUS 1/x ENTRE 1 ET 2', false);
        area.axes(g, { xName: 'x', yName: 'y' });
        const p = new Path2D();
        p.moveTo(area.sx(1), area.sy(0));
        for (let i = 0; i <= 60; i++) p.lineTo(area.sx(1 + i / 60), area.sy(1 / (1 + i / 60)));
        p.lineTo(area.sx(2), area.sy(0));
        p.closePath();
        hatch(g, p, 5, INK.f40);
        g.strokeStyle = INK.fg;
        g.stroke(p);
        area.plot(g, (x) => 1 / x, { x0: 0.72 });
        text(g, `AIRE = ln 2 = ${fmt(Math.LN2, 5)}`, area.sx(1.05), area.sy(0.25), { color: INK.fg });
        if (nb) ser.set(nb[0], nb[1] + nh + 34, nb[2], nh).world(0, 41, 0.45, 1.05);
        else ser.set(80 + half + 20, 160, half - 20, H - 320).world(0, 41, 0.45, 1.05);
        ser.box(g, 'SÉRIE ALTERNÉE vs Σ 1/(k·2ᵏ)', false);
        ser.axes(g, { xName: 'n', xTicks: 8 });
        line(g, ser.x, ser.sy(Math.LN2), ser.x + ser.w, ser.sy(Math.LN2), INK.f40, [4, 4]);
        let a = 0;
        let b = 0;
        g.strokeStyle = INK.fg;
        g.beginPath();
        for (let k = 1; k <= st.n; k++) {
          a += (k % 2 ? 1 : -1) / k;
          k > 1 ? g.lineTo(ser.sx(k), ser.sy(a)) : g.moveTo(ser.sx(k), ser.sy(a));
        }
        g.stroke();
        g.strokeStyle = INK.f60;
        g.setLineDash([2, 2]);
        g.beginPath();
        for (let k = 1; k <= st.n; k++) {
          b += 1 / (k * 2 ** k);
          k > 1 ? g.lineTo(ser.sx(k), ser.sy(b)) : g.moveTo(ser.sx(k), ser.sy(b));
        }
        g.stroke();
        g.setLineDash([]);
        marker(g, ser.sx(st.n), ser.sy(a), 5, true);
        marker(g, ser.sx(st.n), ser.sy(b), 5, false);
        text(g, 'ln 2', ser.x + ser.w - 6, ser.sy(Math.LN2) - 6, { align: 'right', color: INK.f80 });
        roA.set(fmt(a, 8));
        roB.set(fmt(b, 10));
        s1(String(st.n));
        s2(`${fmt(a, 6)} (ERR ${fmt(Math.abs(a - Math.LN2), 5)})`);
        s3(`${fmt(b, 8)} (ERR ${Math.abs(b - Math.LN2).toExponential(1).replace('.', ',')})`);
      },
    };
  },
};
