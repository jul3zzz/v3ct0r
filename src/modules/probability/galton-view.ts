import type { VizDef } from '../../core/types';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { rng } from '../fractals/common';

interface Ball {
  path: Uint8Array;
  t: number;
}

function binom(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export const galtonView: VizDef = {
  id: 'galton',
  title: 'PLANCHE DE GALTON',
  subtitle: 'Chaque bille rebondit à gauche ou à droite à chaque rangée de clous. Leur répartition dessine la loi binomiale, puis la cloche de Gauss.',
  stage: '2d',
  keywords: ['galton', 'binomiale', 'gauss', 'loi normale', 'billes', 'quinconce'],
  formula: {
    tex: 'P(X=k)=\\binom nk p^k(1-p)^{n-k},\\qquad \\frac{X-np}{\\sqrt{np(1-p)}}\\xrightarrow[n\\to\\infty]{}\\mathcal N(0,1)',
    note: 'Une bille traverse n rangées de clous ; à chaque clou elle part à droite avec une probabilité p. Le numéro de la case finale compte ses rebonds à droite : il suit la loi binomiale B(n, p). Quand n grandit, la forme des colonnes s’approche de la courbe en cloche de moyenne np et de variance np(1 − p) : c’est le théorème de Moivre-Laplace.',
  },
  create(ctx) {
    const st = { n: 12, p: 0.5, rate: 40, balls: [] as Ball[], bins: new Float64Array(13), total: 0, acc: 0, curve: true };
    const r = rng(17);
    const reset = () => {
      st.balls = [];
      st.bins = new Float64Array(st.n + 1);
      st.total = 0;
    };
    const spawn = () => {
      const path = new Uint8Array(st.n);
      for (let i = 0; i < st.n; i++) path[i] = r() < st.p ? 1 : 0;
      st.balls.push({ path, t: 0 });
    };
    const land = (b: Ball) => {
      let k = 0;
      for (const v of b.path) k += v;
      st.bins[k]++;
      st.total++;
    };
    ctx.ui.section('PLANCHE');
    ctx.ui.slider({ label: 'RANGÉES DE CLOUS n', min: 4, max: 24, step: 1, value: st.n, onInput: (v) => ((st.n = v), reset()) });
    ctx.ui.slider({ label: 'PROBABILITÉ DROITE p', min: 0.05, max: 0.95, step: 0.01, value: st.p, onInput: (v) => ((st.p = v), reset()) });
    ctx.ui.slider({ label: 'BILLES / SECONDE', min: 1, max: 400, step: 1, log: true, value: st.rate, onInput: (v) => (st.rate = v) });
    ctx.ui.buttons([
      {
        label: '+ 1 000 BILLES',
        onClick: () => {
          for (let i = 0; i < 1000; i++) {
            const path = new Uint8Array(st.n);
            for (let j = 0; j < st.n; j++) path[j] = r() < st.p ? 1 : 0;
            land({ path, t: 1 });
          }
        },
      },
      { label: 'VIDER', icon: 'reset', onClick: reset },
    ]);
    ctx.ui.toggle({ label: 'COURBE DE GAUSS', value: true, onChange: (v) => (st.curve = v) });
    ctx.ui.section('MESURES');
    const roN = ctx.ui.readout('BILLES');
    const roM = ctx.ui.readout('MOYENNE (np)');
    const roV = ctx.ui.readout('VARIANCE (np(1−p))');
    const s1 = ctx.hud.stat('BILLES', '');
    const s2 = ctx.hud.stat('MOYENNE', '');
    const s3 = ctx.hud.stat('THÉORIE', '');
    let frame = 0;
    return {
      update(_t, dt) {
        st.acc += dt * st.rate;
        while (st.acc >= 1) {
          st.acc--;
          if (st.balls.length < 600) spawn();
        }
        const speed = 2.2 + st.rate / 60;
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const n = st.n;
        const top = 130;
        const boardH = (H - top - 60) * 0.5;
        const binTop = top + boardH + 24;
        const binH = H - binTop - 60;
        const dx = Math.min(36, (W - 200) / (n + 2));
        const dy = boardH / n;
        const cx = W / 2 - 40;
        // pegs
        g.fillStyle = INK.f60;
        for (let row = 0; row < n; row++)
          for (let k = 0; k <= row; k++) g.fillRect(Math.round(cx + (k - row / 2) * dx) - 1, Math.round(top + row * dy) - 1, 3, 3);
        // balls
        const alive: Ball[] = [];
        g.fillStyle = INK.fg;
        for (const b of st.balls) {
          b.t += dt * speed;
          if (b.t >= n) {
            land(b);
            continue;
          }
          alive.push(b);
          const row = Math.floor(b.t);
          const f = b.t - row;
          let k = 0;
          for (let i = 0; i < row; i++) k += b.path[i];
          const x0 = k - row / 2;
          const x1 = k + b.path[row] - (row + 1) / 2;
          const e = f * f * (3 - 2 * f);
          const x = cx + (x0 + (x1 - x0) * e) * dx;
          const y = top + (row + f) * dy - Math.sin(f * Math.PI) * dy * 0.35;
          g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
        }
        st.balls = alive;
        // bins
        const max = Math.max(1, ...st.bins);
        const mean = n * st.p;
        const sd = Math.sqrt(n * st.p * (1 - st.p));
        const peak = Math.max(max, st.total * binom(n, Math.round(mean)) * Math.pow(st.p, Math.round(mean)) * Math.pow(1 - st.p, n - Math.round(mean)));
        for (let k = 0; k <= n; k++) {
          const x = cx + (k - n / 2) * dx;
          const h = (st.bins[k] / peak) * binH;
          g.strokeStyle = INK.f40;
          g.strokeRect(Math.round(x - dx * 0.42) + 0.5, Math.round(binTop + binH - h) + 0.5, Math.round(dx * 0.84), Math.round(h));
          g.fillStyle = INK.f20;
          g.fillRect(Math.round(x - dx * 0.42), Math.round(binTop + binH - h), Math.round(dx * 0.84), Math.round(h));
          text(g, String(k), x, binTop + binH + 14, { align: 'center', size: 10, color: INK.f60 });
        }
        line(g, cx - (n / 2 + 1) * dx, binTop + binH, cx + (n / 2 + 1) * dx, binTop + binH, INK.f40);
        if (st.curve && st.total > 0) {
          g.strokeStyle = INK.fg;
          g.beginPath();
          for (let i = 0; i <= 200; i++) {
            const k = -1 + ((n + 2) * i) / 200;
            const dens = (Math.exp(-((k - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))) * st.total;
            const x = cx + (k - n / 2) * dx;
            const y = binTop + binH - (dens / peak) * binH;
            i ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.stroke();
        }
        let m = 0;
        let v = 0;
        for (let k = 0; k <= n; k++) m += k * st.bins[k];
        m /= Math.max(1, st.total);
        for (let k = 0; k <= n; k++) v += (k - m) ** 2 * st.bins[k];
        v /= Math.max(1, st.total);
        if (frame++ % 6 === 0) {
          roN.set(fmtInt(st.total));
          roM.set(`${fmt(m, 3)} (${fmt(mean, 3)})`);
          roV.set(`${fmt(v, 3)} (${fmt(sd * sd, 3)})`);
          s1(fmtInt(st.total));
          s2(fmt(m, 3));
          s3(`B(${n} ; ${fmt(st.p, 2)}) · μ = ${fmt(mean, 2)}`);
        }
      },
    };
  },
};
