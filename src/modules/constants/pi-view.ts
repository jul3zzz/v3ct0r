import type { VizDef } from '../../core/types';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, line, text } from '../../gfx/plot2d';
import { fmt, fmtInt, fmtSci } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { DigitStream } from './common';
import { cfOf, cfString } from './data';
import { rng } from '../fractals/common';

/** Archimedes' π-free recursion: half-perimeters of inscribed (a) and circumscribed (b) n-gons. */
export function archimedes(steps: number): { n: number; a: number; b: number }[] {
  let n = 6;
  let a = 3;
  let b = 2 * Math.sqrt(3);
  const out = [{ n, a, b }];
  for (let i = 0; i < steps; i++) {
    b = (2 * a * b) / (a + b);
    a = Math.sqrt(a * b);
    n *= 2;
    out.push({ n, a, b });
  }
  return out;
}

export const piView: VizDef = {
  id: 'pi',
  title: 'π — PI',
  subtitle: 'Encadré par Archimède avec des polygones à 6·2ᵏ côtés, puis estimé au hasard par Monte-Carlo.',
  stage: '2d',
  keywords: ['pi', 'π', 'archimède', 'polygones', 'monte-carlo', 'cercle'],
  formula: {
    tex: 'n\\sin\\frac{\\pi}{n}<\\pi<n\\tan\\frac{\\pi}{n},\\qquad \\pi\\approx 4\\cdot\\frac{N_{\\text{dans le disque}}}{N}',
    note: 'Archimède (−250) encadre le cercle entre deux polygones réguliers : un inscrit, un circonscrit. En doublant le nombre de côtés à partir de l’hexagone (moyennes harmonique puis géométrique, sans jamais utiliser π), il obtient 223/71 < π < 22/7 à 96 côtés. Monte-Carlo : la proportion de points tombés dans le disque vaut π/4.',
  },
  create(ctx) {
    const st = { mode: 'arch', k: 0, maxK: 8, auto: true, timer: 0, inside: 0, total: 0, speed: ctx.q(500, 1500, 3000) };
    const seq = archimedes(12);
    const stream = new DigitStream(DIGITS.pi, 14);
    const buf = document.createElement('canvas');
    const bg = buf.getContext('2d')!;
    const r = rng(2);
    let bufKey = '';

    ctx.ui.section('MÉTHODE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'arch', label: 'ARCHIMÈDE' },
        { id: 'mc', label: 'MONTE-CARLO' },
      ],
      value: 'arch',
      onChange: (v) => (st.mode = v),
    });
    const kS = ctx.ui.slider({ label: 'CÔTÉS 6·2ᵏ', min: 0, max: st.maxK, step: 1, value: 0, fmt: (v) => String(6 * 2 ** v), onInput: (v) => ((st.k = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'DOUBLEMENT AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'POINTS / IMAGE (MC)', min: 10, max: 10000, step: 10, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.buttons([{ label: 'RELANCER MC', icon: 'reset', onClick: () => { st.inside = 0; st.total = 0; bufKey = ''; } }]);
    ctx.ui.section('VALEUR');
    ctx.ui.readout('π', DIGITS.pi.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('pi'), 8));
    ctx.ui.readout('APPROX. 22/7', fmt(22 / 7, 6));
    ctx.ui.readout('APPROX. 355/113', fmt(355 / 113, 8));
    const roLo = ctx.ui.readout('BORNE INF.');
    const roHi = ctx.ui.readout('BORNE SUP.');
    const spark = ctx.ui.spark('ESTIMATION MONTE-CARLO', { size: 160 });
    const s1 = ctx.hud.stat('', '');
    const s2 = ctx.hud.stat('', '');
    const s3 = ctx.hud.stat('', '');
    ctx.hud.tag('TRANSCENDANT (LINDEMANN 1882)');

    const fr = new Frame2D(0, 0, 1, 1, -1.25, 1.25, -1.25, 1.25);
    let frame = 0;
    return {
      update(_t, dt) {
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        if (W < NARROW_VIEW) {
          // narrow view (phone): the square on top, the decimals under it when the view is tall enough
          const size = Math.max(80, Math.min(W - 48, H - 200));
          fr.set((W - size) / 2, 88, size, size);
          const sy = 88 + size + 26;
          const sh = H - sy - 96;
          if (sh > 26) {
            text(g, 'DÉCIMALES DE π', 24, sy - 8, { size: 9, color: INK.f40 });
            stream.draw(g, 24, sy, W - 48, sh, dt);
          }
        } else {
          const size = Math.min(W - 360, H - 200);
          fr.set(60 + (W - 360 - size) / 2, 120 + (H - 200 - size) / 2, size, size);
          // digit stream column on the right
          text(g, 'DÉCIMALES DE π', W - 270, 130, { size: 9, color: INK.f40 });
          stream.draw(g, W - 270, 140, 240, H - 340, dt);
        }
        const size = fr.w;
        const R = (fr.sx(1) - fr.sx(0));
        const cx = fr.sx(0);
        const cy = fr.sy(0);
        if (st.mode === 'arch') {
          if (st.auto) {
            st.timer += dt;
            if (st.timer > 1.6) {
              st.timer = 0;
              st.k = st.k >= st.maxK ? 0 : st.k + 1;
              kS.set(st.k, true);
            }
          }
          const { n, a, b } = seq[st.k];
          g.strokeStyle = INK.f60;
          g.beginPath();
          g.arc(cx, cy, R, 0, Math.PI * 2);
          g.stroke();
          const poly = (rad: number, dash: number[]) => {
            g.setLineDash(dash);
            g.beginPath();
            for (let i = 0; i <= n; i++) {
              const th = (2 * Math.PI * i) / n + Math.PI / 2;
              const x = cx + rad * Math.cos(th);
              const y = cy - rad * Math.sin(th);
              i ? g.lineTo(x, y) : g.moveTo(x, y);
            }
            g.strokeStyle = INK.fg;
            g.stroke();
            g.setLineDash([]);
          };
          poly(R, []);
          poly(R / Math.cos(Math.PI / n), [4, 3]);
          if (n <= 48) {
            line(g, cx, cy, cx, cy - R, INK.f40);
            for (let i = 0; i < n; i++) {
              const th = (2 * Math.PI * i) / n + Math.PI / 2;
              g.fillStyle = INK.fg;
              g.fillRect(Math.round(cx + R * Math.cos(th)) - 1, Math.round(cy - R * Math.sin(th)) - 1, 3, 3);
            }
          }
          s1(`${fmtInt(n)} CÔTÉS`);
          s2(`${fmt(a, 8)} < π < ${fmt(b, 8)}`);
          s3(`ÉCART ${fmtSci(b - a, 2)}`);
          if (frame % 6 === 0) {
            roLo.set(fmt(a, 10));
            roHi.set(fmt(b, 10));
          }
        } else {
          const key = `${Math.round(fr.x)}|${Math.round(fr.y)}|${Math.round(size)}|${ctx.dpr}`;
          const dpr = ctx.dpr;
          if (key !== bufKey) {
            buf.width = Math.round(size * dpr);
            buf.height = Math.round(size * dpr);
            bg.clearRect(0, 0, buf.width, buf.height);
            st.inside = 0;
            st.total = 0;
            bufKey = key;
            spark.reset();
          }
          for (let i = 0; i < st.speed; i++) {
            const x = r() * 2 - 1;
            const y = r() * 2 - 1;
            const inC = x * x + y * y <= 1;
            if (inC) st.inside++;
            st.total++;
            bg.fillStyle = inC ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.22)';
            bg.fillRect(Math.floor(((x * 1) / 1.25 + 1) * 0.5 * buf.width), Math.floor((1 - ((y * 1) / 1.25 + 1) * 0.5) * buf.height), 1, 1);
          }
          g.drawImage(buf, fr.x, fr.y, size, size);
          g.strokeStyle = INK.fg;
          g.beginPath();
          g.arc(cx, cy, R, 0, Math.PI * 2);
          g.stroke();
          g.strokeRect(Math.round(fr.sx(-1)) + 0.5, Math.round(fr.sy(1)) + 0.5, Math.round(2 * R), Math.round(2 * R));
          const est = (4 * st.inside) / Math.max(1, st.total);
          s1(`N = ${fmtInt(st.total)}`);
          s2(`π ≈ 4 × ${fmtInt(st.inside)} / N = ${fmt(est, 6)}`);
          s3(`ERREUR ${fmtSci(Math.abs(est - Math.PI), 2)} · ATTENDUE ~${fmtSci(1.64 / Math.sqrt(Math.max(1, st.total)), 1)}`);
          if (frame % 10 === 0) spark.push(est);
        }
        frame++;
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'mc' : 'arch';
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
