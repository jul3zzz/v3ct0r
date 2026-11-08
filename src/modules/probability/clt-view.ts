import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { rng } from '../fractals/common';

interface Dist {
  id: string;
  label: string;
  draw: (r: () => number) => number;
  mu: number;
  sigma: number;
  pdf: (x: number) => number;
  range: [number, number];
}

const DISTS: Dist[] = [
  { id: 'unif', label: 'UNIFORME [0,1]', draw: (r) => r(), mu: 0.5, sigma: Math.sqrt(1 / 12), pdf: (x) => (x >= 0 && x <= 1 ? 1 : 0), range: [-0.2, 1.2] },
  { id: 'exp', label: 'EXPONENTIELLE', draw: (r) => -Math.log(1 - r()), mu: 1, sigma: 1, pdf: (x) => (x >= 0 ? Math.exp(-x) : 0), range: [-0.3, 5] },
  { id: 'bern', label: 'BERNOULLI p = 0,2', draw: (r) => (r() < 0.2 ? 1 : 0), mu: 0.2, sigma: 0.4, pdf: () => 0, range: [-0.3, 1.3] },
  { id: 'die', label: 'DÉ', draw: (r) => 1 + Math.floor(r() * 6), mu: 3.5, sigma: Math.sqrt(35 / 12), pdf: () => 0, range: [0, 7] },
  { id: 'bimodal', label: 'BIMODALE', draw: (r) => (r() < 0.5 ? 0.15 : 0.85) + (r() - 0.5) * 0.2, mu: 0.5, sigma: Math.sqrt(0.35 * 0.35 + 0.2 * 0.2 / 12), pdf: (x) => (Math.abs(x - 0.15) < 0.1 || Math.abs(x - 0.85) < 0.1 ? 2.5 : 0), range: [-0.1, 1.1] },
];

const BINS = 64;

export const cltView: VizDef = {
  id: 'clt',
  title: 'THÉORÈME CENTRAL LIMITE',
  subtitle: 'Additionnez n tirages de n’importe quelle loi (de variance finie) : la somme, recentrée et réduite, prend la forme d’une cloche.',
  stage: '2d',
  keywords: ['théorème central limite', 'tcl', 'gauss', 'somme', 'loi normale', 'convergence en loi'],
  formula: {
    tex: 'Z_n=\\frac{X_1+\\cdots+X_n-n\\mu}{\\sigma\\sqrt n}\\xrightarrow[n\\to\\infty]{\\text{loi}}\\mathcal N(0,1),\\qquad \\varphi(z)=\\frac{e^{-z^2/2}}{\\sqrt{2\\pi}}',
    note: 'Peu importe la forme de départ — plate, asymétrique, à deux bosses — tant que la variance est finie. L’histogramme des sommes normalisées converge vers la densité gaussienne (trait plein). C’est pourquoi la loi normale apparaît partout : erreurs de mesure, tailles, bruits… sont des sommes de nombreuses petites contributions.',
  },
  create(ctx) {
    const st = { d: 0, n: 1, auto: true, timer: 0, hist: new Float64Array(BINS), count: 0, m1: 0, m2: 0, m3: 0, m4: 0 };
    const r = rng(41);
    const reset = () => {
      st.hist = new Float64Array(BINS);
      st.count = 0;
      st.m1 = st.m2 = st.m3 = st.m4 = 0;
    };
    ctx.ui.section('LOI DE DÉPART');
    const sel = ctx.ui.segmented({ options: DISTS.map((d, i) => ({ id: String(i), label: d.label })), value: '0', cols: 2, onChange: (v) => ((st.d = Number(v)), reset()) });
    ctx.ui.section('SOMME');
    const nS = ctx.ui.slider({ label: 'NOMBRE DE TERMES n', min: 1, max: 60, step: 1, value: 1, onInput: (v) => ((st.n = v), (st.auto = false), reset()) });
    ctx.ui.toggle({ label: 'n AUGMENTE AUTOMATIQUEMENT', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('MESURES');
    const roC = ctx.ui.readout('ÉCHANTILLONS');
    const roS = ctx.ui.readout('ASYMÉTRIE (→ 0)');
    const roK = ctx.ui.readout('KURTOSIS (→ 3)');
    const s1 = ctx.hud.stat('n', '');
    const s2 = ctx.hud.stat('ASYMÉTRIE', '');
    const main = new Frame2D(0, 0, 1, 1, -4, 4, 0, 0.5);
    const inset = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    let frame = 0;
    return {
      update(_t, dt) {
        const D = DISTS[st.d];
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.8) {
            st.timer = 0;
            st.n = st.n >= 40 ? 1 : st.n < 5 ? st.n + 1 : Math.min(40, st.n * 2);
            nS.set(st.n, true);
            reset();
          }
        }
        const per = Math.max(200, Math.floor(30000 / st.n));
        for (let i = 0; i < per; i++) {
          let s = 0;
          for (let j = 0; j < st.n; j++) s += D.draw(r);
          const z = (s - st.n * D.mu) / (D.sigma * Math.sqrt(st.n));
          const b = Math.floor(((z + 4) / 8) * BINS);
          if (b >= 0 && b < BINS) st.hist[b]++;
          st.count++;
          st.m1 += z;
          st.m2 += z * z;
          st.m3 += z * z * z;
          st.m4 += z * z * z * z;
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        main.set(80, 150, W - 420, H - 300).world(-4, 4, 0, 0.55);
        main.box(g, 'HISTOGRAMME DE Zₙ ET DENSITÉ DE GAUSS', false);
        const bw = 8 / BINS;
        for (let b = 0; b < BINS; b++) {
          const dens = st.hist[b] / Math.max(1, st.count) / bw;
          const x0 = main.sx(-4 + b * bw);
          const x1 = main.sx(-4 + (b + 1) * bw);
          const y = main.sy(Math.min(0.55, dens));
          g.fillStyle = INK.f20;
          g.fillRect(x0 + 1, y, x1 - x0 - 1, main.sy(0) - y);
          g.fillStyle = INK.f80;
          g.fillRect(x0 + 1, y, x1 - x0 - 1, 1);
        }
        main.axes(g, { xName: 'z' });
        main.plot(g, (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), { color: INK.fg });
        // inset: the starting distribution
        inset.set(W - 300, 150, 240, 140).world(D.range[0], D.range[1], 0, D.id === 'exp' ? 1.1 : D.id === 'bimodal' ? 2.8 : 1.3);
        inset.box(g, 'LOI DE DÉPART');
        if (D.id === 'bern' || D.id === 'die') {
          const pts = D.id === 'bern' ? [[0, 0.8], [1, 0.2]] : [1, 2, 3, 4, 5, 6].map((k) => [k, 1 / 6]);
          const top = D.id === 'bern' ? 1.3 : 0.25;
          inset.world(D.range[0], D.range[1], 0, top);
          for (const [x, p] of pts) {
            g.fillStyle = INK.fg;
            g.fillRect(inset.sx(x) - 1, inset.sy(p), 3, inset.sy(0) - inset.sy(p));
          }
        } else inset.plot(g, D.pdf, { n: 400 });
        const c = Math.max(1, st.count);
        const mean = st.m1 / c;
        const v = st.m2 / c - mean * mean;
        const skew = (st.m3 / c - 3 * mean * v - mean ** 3) / Math.pow(Math.max(1e-12, v), 1.5);
        const kurt = (st.m4 / c - 4 * mean * (st.m3 / c) + 6 * mean * mean * (st.m2 / c) - 3 * mean ** 4) / (v * v);
        text(g, `n = ${st.n}`, main.x + 10, main.y + 18, { color: INK.fg, size: 14 });
        if (frame++ % 6 === 0) {
          roC.set(fmtInt(st.count));
          roS.set(fmt(skew, 3));
          roK.set(fmt(kurt, 3));
          s1(String(st.n));
          s2(fmt(skew, 3));
        }
      },
      cinematic(t) {
        const k = Math.floor(t / 12) % DISTS.length;
        if (k !== st.d) sel.set(String(k));
      },
    };
  },
};
