import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, marker } from '../../gfx/plot2d';
import { fmtInt } from '../../hud/dom';

function orbit(n: number): number[] {
  const out = [n];
  while (n !== 1 && out.length < 2000) {
    n = n % 2 ? 3 * n + 1 : n / 2;
    out.push(n);
  }
  return out;
}

export const collatzView: VizDef = {
  id: 'collatz',
  title: 'CONJECTURE DE COLLATZ',
  subtitle: 'Si n est pair on le divise par 2, sinon on calcule 3n + 1. Toutes les suites testées retombent sur 1 — personne ne sait pourquoi.',
  stage: '2d',
  keywords: ['collatz', 'syracuse', '3n+1', 'conjecture', 'temps de vol', 'corail'],
  formula: {
    tex: 'n\\mapsto\\begin{cases} n/2 & n\\ \\text{pair}\\\\ 3n+1 & n\\ \\text{impair}\\end{cases}\\qquad \\forall n\\ge1,\\ \\exists k:\\ T^k(n)=1\\ ?',
    note: 'La suite de Syracuse monte et descend de façon chaotique : 27 grimpe jusqu’à 9 232 et met 111 étapes à revenir à 1. Vérifiée par ordinateur au-delà de 2⁶⁸, la conjecture reste ouverte ; Paul Erdős disait que « les mathématiques ne sont pas prêtes » pour ce problème. Le « corail » trace les trajectoires à rebours, en tournant d’un angle différent selon la parité.',
  },
  create(ctx) {
    const st = { mode: 'coral', n: 27, N: ctx.q(800, 2000, 4000), grow: 0, even: 0.11, odd: -0.21 };
    const pz = new PanZoom(ctx, { scale: 0.5, minScale: 1e-3 });
    let coral: Path2D[] = [];
    let built = '';
    const buildCoral = () => {
      // each start value: walk its orbit backwards from 1 (reverse) and turn by parity
      const paths: Path2D[] = Array.from({ length: 6 }, () => new Path2D());
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      const segs: [number, number, number, number, number][] = [];
      for (let s = 2; s <= st.N; s++) {
        const o = orbit(s).reverse();
        let x = 0;
        let y = 0;
        let a = Math.PI / 2;
        for (let i = 1; i < o.length; i++) {
          a += o[i] % 2 ? st.odd : st.even;
          const nx = x + Math.cos(a);
          const ny = y + Math.sin(a);
          segs.push([x, y, nx, ny, Math.min(5, Math.floor(i / 12))]);
          x = nx;
          y = ny;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
      }
      pz.fit(x0, x1, y0, y1, 40);
      coral = paths;
      return segs;
    };
    let segs: [number, number, number, number, number][] = [];
    ctx.ui.section('VUE');
    ctx.ui.segmented({
      options: [
        { id: 'coral', label: 'CORAIL' },
        { id: 'orbit', label: 'TRAJECTOIRE' },
        { id: 'stats', label: 'TEMPS DE VOL' },
      ],
      value: 'coral',
      onChange: (v) => (st.mode = v),
    });
    ctx.ui.slider({ label: 'DÉPART n (TRAJECTOIRE)', min: 1, max: 10000, step: 1, log: true, value: st.n, onInput: (v) => (st.n = Math.round(v)) });
    ctx.ui.slider({ label: 'VALEURS (CORAIL)', min: 100, max: ctx.q(2000, 5000, 10000), step: 10, log: true, value: st.N, onInput: (v) => ((st.N = Math.round(v)), (built = '')) });
    ctx.ui.slider({ label: 'ANGLE PAIR', min: -0.4, max: 0.4, step: 0.001, value: st.even, onInput: (v) => ((st.even = v), (built = '')) });
    ctx.ui.slider({ label: 'ANGLE IMPAIR', min: -0.4, max: 0.4, step: 0.001, value: st.odd, onInput: (v) => ((st.odd = v), (built = '')) });
    const roL = ctx.ui.readout('TEMPS DE VOL');
    const roM = ctx.ui.readout('ALTITUDE MAX');
    const s1 = ctx.hud.stat('n', '');
    const s2 = ctx.hud.stat('ÉTAPES', '');
    const s3 = ctx.hud.stat('MAX', '');
    const fr = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    const stops = new Float32Array(10001);
    for (let n = 1; n <= 10000; n++) stops[n] = orbit(n).length - 1;
    return {
      update(_t, dt) {
        pz.tick();
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const o = orbit(st.n);
        if (st.mode === 'coral') {
          const key = `${st.N}|${st.even}|${st.odd}`;
          if (key !== built) {
            segs = buildCoral();
            built = key;
            st.grow = 0;
          }
          st.grow = Math.min(1, st.grow + dt * 0.35);
          const k = Math.floor(segs.length * st.grow);
          const byL: Path2D[] = coral.map(() => new Path2D());
          for (let i = 0; i < k; i++) {
            const [a, b, c, d, l] = segs[i];
            byL[l].moveTo(pz.sx(a), pz.sy(b));
            byL[l].lineTo(pz.sx(c), pz.sy(d));
          }
          byL.forEach((p, i) => {
            g.strokeStyle = `rgba(255,255,255,${(0.08 + 0.05 * (5 - i)).toFixed(3)})`;
            g.stroke(p);
          });
        } else if (st.mode === 'orbit') {
          const mx = Math.max(...o);
          fr.set(80, 140, W - 420, H - 290).world(0, Math.max(10, o.length - 1), 0, mx * 1.1);
          fr.box(g, `TRAJECTOIRE DE ${st.n}`, false);
          fr.axes(g, { xName: 'étape', yName: 'valeur' });
          g.strokeStyle = INK.fg;
          g.beginPath();
          o.forEach((v, i) => (i ? g.lineTo(fr.sx(i), fr.sy(v)) : g.moveTo(fr.sx(i), fr.sy(v))));
          g.stroke();
          if (o.length < 160) o.forEach((v, i) => marker(g, fr.sx(i), fr.sy(v), 3, v % 2 === 1));
          const im = o.indexOf(mx);
          text(g, `MAX ${fmtInt(mx)}`, fr.sx(im) + 6, fr.sy(mx) - 6, { color: INK.fg });
        } else {
          fr.set(80, 140, W - 420, H - 290).world(0, 10000, 0, 270);
          fr.box(g, 'TEMPS DE VOL DE 1 À 10 000', false);
          fr.axes(g, { xName: 'n', yName: 'étapes' });
          g.fillStyle = INK.f60;
          for (let n = 1; n <= 10000; n++) g.fillRect(fr.sx(n), fr.sy(stops[n]), 1, 1);
          marker(g, fr.sx(st.n), fr.sy(stops[Math.min(10000, st.n)]), 6, false);
        }
        roL.set(`${o.length - 1} ÉTAPES`);
        roM.set(fmtInt(Math.max(...o)));
        s1(fmtInt(st.n));
        s2(String(o.length - 1));
        s3(fmtInt(Math.max(...o)));
      },
    };
  },
};
