import type { VizDef } from '../../core/types';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString } from './data';

const GAMMA = 0.5772156649015329;

export const gammaView: VizDef = {
  id: 'gamma',
  title: 'γ — EULER-MASCHERONI',
  subtitle: 'L’écart entre la série harmonique et le logarithme : les petits morceaux entre l’escalier et la courbe 1/x, empilés dans un carré.',
  stage: '2d',
  keywords: ['gamma', 'γ', 'euler-mascheroni', 'harmonique', 'logarithme', 'escalier'],
  formula: {
    tex: '\\gamma=\\lim_{n\\to\\infty}\\left(\\sum_{k=1}^{n}\\frac1k-\\ln n\\right)=\\int_1^{\\infty}\\left(\\frac1{\\lfloor x\\rfloor}-\\frac1x\\right)dx',
    note: 'Les rectangles de hauteur 1/k ont pour aire totale Hₙ = 1 + 1/2 + … + 1/n ; sous la courbe 1/x, l’aire vaut ln n. Leur différence est la somme des petits « triangles courbes ». Glissés vers la gauche, ils tiennent tous dans le carré unité et en remplissent ≈ 57,7 % : c’est γ. On ignore encore si γ est irrationnel.',
  },
  create(ctx) {
    const st = { n: 8, phase: 0, speed: 0.25 };
    ctx.ui.section('CONSTRUCTION');
    ctx.ui.slider({ label: 'MORCEAUX n', min: 2, max: 40, step: 1, value: st.n, onInput: (v) => (st.n = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.05, max: 1, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.section('VALEUR');
    ctx.ui.readout('γ', DIGITS.gamma.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('gamma'), 9));
    const roH = ctx.ui.readout('Hₙ − ln(n+1)');
    ctx.ui.note('Si γ était une fraction p/q, son dénominateur dépasserait 10²⁴²⁰⁸⁰ (calculs de fraction continue).');
    const s1 = ctx.hud.stat('Hₙ', '');
    const s2 = ctx.hud.stat('ln(n+1)', '');
    const s3 = ctx.hud.stat('DIFFÉRENCE', '');
    ctx.hud.tag('IRRATIONALITÉ NON PROUVÉE');
    const fr = new Frame2D(0, 0, 1, 1, 0, 10, 0, 1.15);
    return {
      update(_t, dt) {
        st.phase = (st.phase + dt * st.speed) % 2;
        const slide = Math.min(1, Math.max(0, (st.phase - 0.4) / 0.8));
        const e = slide < 0.5 ? 2 * slide * slide : 1 - Math.pow(-2 * slide + 2, 2) / 2;
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const n = st.n;
        const narrow = W < NARROW_VIEW;
        if (narrow) fr.set(...narrowPlot(W, H, 3)).world(-0.4, Math.min(n + 1.6, 8), 0, 1.15);
        else fr.set(80, 150, W - 160, H - 300).world(-0.4, Math.min(n + 1.6, 14), 0, 1.15);
        fr.box(g, 'ESCALIER 1/⌊x⌋ ET COURBE 1/x', false);
        fr.axes(g, { xName: 'x', yName: 'y', xTicks: narrow ? 6 : 12 });
        // unit square target
        g.strokeStyle = INK.f60;
        g.setLineDash([3, 3]);
        g.strokeRect(fr.sx(0), fr.sy(1), fr.sx(1) - fr.sx(0), fr.sy(0) - fr.sy(1));
        g.setLineDash([]);
        // stairs
        for (let k = 1; k <= n; k++) {
          if (fr.sx(k) > fr.x + fr.w) break;
          g.strokeStyle = INK.f20;
          g.strokeRect(fr.sx(k), fr.sy(1 / k), fr.sx(k + 1) - fr.sx(k), fr.sy(0) - fr.sy(1 / k));
        }
        fr.plot(g, (x) => 1 / x, { x0: 0.85 });
        // curved pieces between 1/k (top) and 1/x on [k, k+1], sliding to x ∈ [0, 1]
        let total = 0;
        for (let k = 1; k <= n; k++) {
          const dx = -k * e;
          const p = new Path2D();
          const m = 24;
          p.moveTo(fr.sx(k + dx), fr.sy(1 / k));
          p.lineTo(fr.sx(k + 1 + dx), fr.sy(1 / k));
          for (let j = m; j >= 0; j--) {
            const x = k + j / m;
            p.lineTo(fr.sx(x + dx), fr.sy(1 / x));
          }
          p.closePath();
          g.fillStyle = k % 2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)';
          if (fr.sx(k + dx) < fr.x + fr.w) g.fill(p);
          g.strokeStyle = INK.fg;
          g.stroke(p);
          total += 1 / k - Math.log((k + 1) / k);
        }
        line(g, fr.sx(0), fr.sy(1 - GAMMA), fr.sx(1) + 30, fr.sy(1 - GAMMA), INK.f40, [2, 3]);
        text(g, narrow ? `γ ≈ ${fmt(GAMMA, 4)}` : `γ ≈ ${fmt(GAMMA, 4)} DE L’AIRE DU CARRÉ`, fr.sx(1) + 36, fr.sy(1 - GAMMA) + 4, { color: INK.f80 });
        let Hn = 0;
        for (let k = 1; k <= n; k++) Hn += 1 / k;
        roH.set(fmt(total, 8));
        s1(fmt(Hn, 6));
        s2(fmt(Math.log(n + 1), 6));
        s3(`${fmt(total, 6)} → γ`);
      },
    };
  },
};
