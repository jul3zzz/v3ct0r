import type { VizDef } from '../../core/types';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, text, line, marker } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

const ZEROS = [14.134725, 21.02204, 25.010858, 30.424876, 32.935062, 37.586178, 40.918719, 43.327073, 48.005151, 49.773832, 52.970321, 56.446248, 59.347044];

/** Borwein's algorithm for η(s), then ζ(s) = η(s) / (1 − 2^{1−s}). Valid for Re(s) > 0. */
const NB = 64;
const dk: number[] = (() => {
  const n = NB;
  const d: number[] = [];
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    // term_i = n (n+i-1)! 4^i / ((n-i)! (2i)!)
    let lt = Math.log(n) + i * Math.log(4);
    for (let k = 2; k <= n + i - 1; k++) lt += Math.log(k);
    for (let k = 2; k <= n - i; k++) lt -= Math.log(k);
    for (let k = 2; k <= 2 * i; k++) lt -= Math.log(k);
    sum += Math.exp(lt);
    d.push(sum);
  }
  return d;
})();

export function zeta(sr: number, si: number): [number, number] {
  const n = NB;
  const dn = dk[n];
  let er = 0;
  let ei = 0;
  for (let k = 0; k < n; k++) {
    // (k+1)^{-s} = exp(-s ln(k+1))
    const l = Math.log(k + 1);
    const mag = Math.exp(-sr * l);
    const ang = -si * l;
    const c = ((k % 2 ? -1 : 1) * (dk[k] - dn)) / dn;
    er += c * mag * Math.cos(ang);
    ei += c * mag * Math.sin(ang);
  }
  er = -er;
  ei = -ei;
  // 1 − 2^{1−s}
  const l2 = Math.log(2);
  const m = Math.exp((1 - sr) * l2);
  const dr = 1 - m * Math.cos(-si * l2);
  const di = -m * Math.sin(-si * l2);
  const dd = dr * dr + di * di;
  return [(er * dr + ei * di) / dd, (ei * dr - er * di) / dd];
}

export const zetaView: VizDef = {
  id: 'zeta',
  title: 'ZÊTA DE RIEMANN',
  subtitle: 'ζ(½ + it) parcourt le plan complexe et repasse par 0 à chaque zéro non trivial. Hors de la droite critique, la courbe évite l’origine.',
  stage: '2d',
  keywords: ['zêta', 'zeta', 'riemann', 'hypothèse de riemann', 'zéros', 'droite critique'],
  formula: {
    tex: '\\zeta(s)=\\sum_{n\\ge1}\\frac1{n^s}=\\prod_{p\\ \\text{premier}}\\frac{1}{1-p^{-s}},\\qquad \\zeta\\!\\left(\\tfrac12+it\\right)=0\\ ?',
    note: 'La série de Dirichlet ne converge que pour Re(s) > 1 ; on la prolonge (ici via la fonction η d’Euler et l’algorithme de Borwein). Le produit d’Euler la relie aux nombres premiers. L’hypothèse de Riemann (1859), toujours ouverte, affirme que tous les zéros non triviaux sont sur la droite Re(s) = ½ : ici la courbe passe par l’origine aux hauteurs t ≈ 14,13 ; 21,02 ; 25,01…',
  },
  create(ctx) {
    const st = { sigma: 0.5, T: 0, max: 60, speed: 4, auto: true };
    ctx.ui.section('DROITE s = σ + it');
    ctx.ui.slider({ label: 'σ (PARTIE RÉELLE)', min: 0.3, max: 0.9, step: 0.001, value: 0.5, onInput: (v) => ((st.sigma = v), (st.T = 0)) });
    const tS = ctx.ui.slider({ label: 'HAUTEUR t', min: 0, max: st.max, step: 0.01, value: 0, onInput: (v) => ((st.T = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'PARCOURS AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.5, max: 12, step: 0.1, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.section('ZÉROS NON TRIVIAUX');
    ZEROS.slice(0, 6).forEach((z, i) => ctx.ui.readout(`ρ${'₁₂₃₄₅₆'[i]}`, `½ + ${fmt(z, 6)} i`));
    const s1 = ctx.hud.stat('s', '');
    const s2 = ctx.hud.stat('ζ(s)', '');
    const s3 = ctx.hud.stat('|ζ(s)|', '');
    ctx.hud.tag('HYPOTHÈSE DE RIEMANN : NON DÉMONTRÉE', true);
    const plane = new Frame2D(0, 0, 1, 1, -1.5, 3.5, -2.2, 2.2);
    const mod = new Frame2D(0, 0, 1, 1, 0, 60, 0, 4);
    let cacheKey = '';
    let samples: [number, number][] = [];
    return {
      update(_t, dt) {
        if (st.auto) {
          st.T += dt * st.speed;
          if (st.T > st.max) st.T = 0;
          tS.set(st.T, true);
        }
        const key = `${st.sigma}`;
        if (key !== cacheKey) {
          samples = [];
          for (let i = 0; i <= 6000; i++) samples.push(zeta(st.sigma, (st.max * i) / 6000));
          cacheKey = key;
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const ps = Math.min(W * 0.5, H - 200);
        // narrow view (phone): the plane of ζ(s) above the graph of |ζ|
        const nb = W < NARROW_VIEW ? narrowPlot(W, H, 3) : null;
        const nph = nb ? Math.max(50, Math.min(nb[2] * (4.4 / 5), (nb[3] - 34) * 0.55)) : 0;
        if (nb) plane.set(nb[0] + (nb[2] - nph * (5 / 4.4)) / 2, nb[1], nph * (5 / 4.4), nph).world(-1.5, 3.5, -2.2, 2.2);
        else plane.set(60, 120, ps * (5 / 4.4), ps).world(-1.5, 3.5, -2.2, 2.2);
        plane.box(g, 'PLAN DE ζ(s)', false);
        plane.axes(g, { xName: 'RE', yName: 'IM' });
        const k = Math.min(samples.length - 1, Math.floor((st.T / st.max) * 6000));
        g.strokeStyle = INK.f20;
        g.beginPath();
        samples.forEach(([x, y], i) => (i ? g.lineTo(plane.sx(x), plane.sy(y)) : g.moveTo(plane.sx(x), plane.sy(y))));
        g.stroke();
        g.strokeStyle = INK.fg;
        g.beginPath();
        for (let i = 0; i <= k; i++) {
          const [x, y] = samples[i];
          i ? g.lineTo(plane.sx(x), plane.sy(y)) : g.moveTo(plane.sx(x), plane.sy(y));
        }
        g.stroke();
        g.strokeStyle = INK.fg;
        g.strokeRect(Math.round(plane.sx(0)) - 4.5, Math.round(plane.sy(0)) - 4.5, 9, 9);
        const [zr, zi] = samples[k];
        marker(g, plane.sx(zr), plane.sy(zi), 6, true);
        // |ζ| along t
        const mx = plane.x + plane.w + 50;
        if (nb) mod.set(nb[0], nb[1] + nph + 34, nb[2], Math.max(40, nb[3] - nph - 34)).world(0, st.max, 0, 4);
        else mod.set(mx, 120, W - mx - 330, ps).world(0, st.max, 0, 4);
        mod.box(g, nb ? '|ζ(σ + it)|' : '|ζ(σ + it)| — ZÉROS SUR LA DROITE CRITIQUE', false);
        mod.axes(g, { xName: 't', yName: '|ζ|', xTicks: 6 });
        g.strokeStyle = INK.f60;
        g.beginPath();
        samples.forEach(([x, y], i) => {
          const t = (st.max * i) / 6000;
          const v = Math.min(4, Math.hypot(x, y));
          i ? g.lineTo(mod.sx(t), mod.sy(v)) : g.moveTo(mod.sx(t), mod.sy(v));
        });
        g.stroke();
        line(g, mod.sx(st.T), mod.y, mod.sx(st.T), mod.y + mod.h, INK.fg);
        for (const z of ZEROS) {
          if (z > st.max) break;
          line(g, mod.sx(z), mod.sy(0) - 6, mod.sx(z), mod.sy(0) + 6, INK.fg);
          if (z < 26) text(g, fmt(z, 2), mod.sx(z), mod.sy(0) - 10, { align: 'center', size: 8, color: INK.f60 });
        }
        s1(`${fmt(st.sigma, 3)} + ${fmt(st.T, 3)} i`);
        s2(`${fmt(zr, 4)} ${zi >= 0 ? '+' : '−'} ${fmt(Math.abs(zi), 4)} i`);
        s3(fmt(Math.hypot(zr, zi), 5));
      },
    };
  },
};
