import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line, DISPLAY } from '../../gfx/plot2d';
import { CONSTANTS, cfOf } from './data';
import { DigitStream } from './common';

export const compareView: VizDef = {
  id: 'compare',
  title: 'COMPARAISON',
  subtitle: 'Les constantes côte à côte : valeurs, flux de décimales, fractions continues et vitesse de convergence de leurs séries.',
  stage: '2d',
  keywords: ['comparaison', 'fraction continue', 'convergence', 'décimales', 'côte à côte'],
  formula: {
    tex: 'x=a_0+\\cfrac{1}{a_1+\\cfrac{1}{a_2+\\cdots}}=[a_0;a_1,a_2,\\ldots]',
    note: 'La fraction continue d’un nombre révèle sa nature : finie pour un rationnel, périodique pour un irrationnel quadratique (φ = [1;1,1,…], √2 = [1;2,2,…]), à motif pour e, sans motif connu pour π. Le graphe compare la vitesse de convergence des séries classiques : Σ 1/k! gagne des décimales à chaque terme, la série de Leibniz pour π en gagne à peine une par décade.',
  },
  create(ctx) {
    const active = new Set(CONSTANTS.map((c) => c.id));
    const streams = new Map(CONSTANTS.map((c) => {
      const s = new DigitStream(c.digits, 10);
      s.pos = 240;
      return [c.id, s];
    }));
    let speed = 10;
    ctx.ui.section('CONSTANTES');
    for (const c of CONSTANTS) {
      ctx.ui.toggle({
        label: `${c.sym} — ${c.name}`,
        value: true,
        onChange: (v) => (v ? active.add(c.id) : active.delete(c.id)),
      });
    }
    ctx.ui.section('FLUX');
    ctx.ui.slider({ label: 'DÉCIMALES / SECONDE', min: 1, max: 200, step: 1, value: speed, log: true, onInput: (v) => (speed = v) });
    ctx.ui.note('i n’apparaît pas : ce n’est pas un nombre réel, il n’a pas de développement décimal (voir la vue i).');
    const graph = new Frame2D(0, 0, 1, 1, 1, 60, -16, 0.5);
    return {
      update(_t, dt) {
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const list = CONSTANTS.filter((c) => active.has(c.id));
        if (!list.length) return;
        // narrow view (phone): one line per constant (symbol, value, continued fraction), the graph under them
        if (W < 560) {
          const top = 64;
          const rh = 20;
          list.forEach((c, i) => {
            const y = top + i * rh;
            const cf = cfOf(c.id, 7);
            text(g, c.sym, 14, y + 14, { size: 14, family: DISPLAY, color: INK.fg });
            text(g, c.digits.slice(0, 11).replace('.', ','), 62, y + 13, { size: 11, color: INK.f80 });
            text(g, `[${cf[0]}; ${cf.slice(1).join(',')}…]`, W - 14, y + 13, { size: 9, color: INK.f60, align: 'right' });
            line(g, 14, y + rh, W - 14, y + rh, INK.f10);
          });
          const gy = top + list.length * rh + 34;
          graph.set(44, gy, W - 60, Math.max(60, H - gy - 34)).world(1, 60, -16, 0.5);
          graph.box(g, 'CONVERGENCE · log₁₀ |ERREUR| SELON n', false);
          graph.axes(g, { xName: 'n', yName: 'log₁₀ ε', xTicks: 6, yTicks: 4 });
          list.forEach((c, i) => {
            g.strokeStyle = i % 2 ? INK.f60 : INK.fg;
            g.setLineDash(i % 3 === 1 ? [3, 3] : i % 3 === 2 ? [1, 3] : []);
            g.beginPath();
            for (let n = 1; n <= 60; n++) {
              const e = Math.abs(c.approx(n) - c.value);
              const p: [number, number] = [graph.sx(n), graph.sy(Math.max(-16, Math.log10(Math.max(1e-17, e))))];
              n > 1 ? g.lineTo(...p) : g.moveTo(...p);
            }
            g.stroke();
            g.setLineDash([]);
          });
          return;
        }
        const top = 120;
        const colsH = Math.max(180, (H - top) * 0.52);
        const cw = (W - 60) / list.length;
        list.forEach((c, i) => {
          const x = 30 + i * cw;
          const s = streams.get(c.id)!;
          s.speed = speed;
          g.strokeStyle = INK.f10;
          g.strokeRect(Math.round(x) + 0.5, top + 0.5, Math.round(cw - 8), Math.round(colsH));
          text(g, c.sym, x + 10, top + 34, { size: 24, family: DISPLAY, color: INK.fg });
          text(g, c.name, x + 10, top + 52, { size: 8, color: INK.f40 });
          text(g, c.digits.slice(0, 12).replace('.', ','), x + 10, top + 70, { size: 11, color: INK.f80 });
          const cf = cfOf(c.id, 9);
          const cfs = `[${cf[0]}; ${cf.slice(1).join(',')}…]`;
          text(g, cfs.length > cw / 6.2 ? cfs.slice(0, Math.floor(cw / 6.2)) + '…' : cfs, x + 10, top + 88, { size: 9, color: INK.f60 });
          line(g, x + 10, top + 98, x + cw - 18, top + 98, INK.f10);
          s.draw(g, x + 10, top + 106, cw - 28, colsH - 116, dt);
          text(g, `#${s.index + 1}`, x + cw - 18, top + colsH - 6, { size: 8, color: INK.f40, align: 'right' });
        });
        // convergence graph
        const gy = top + colsH + 36;
        graph.set(70, gy, W - 140, H - gy - 60).world(1, 60, -16, 0.5);
        graph.box(g, 'CONVERGENCE DES SÉRIES · log₁₀ |ERREUR| EN FONCTION DU NOMBRE DE TERMES', false);
        graph.axes(g, { xName: 'n', yName: 'log₁₀ ε', xTicks: 12, yTicks: 8 });
        const labels: { y: number; x: number; s: string }[] = [];
        list.forEach((c, i) => {
          g.strokeStyle = i % 2 ? INK.f60 : INK.fg;
          g.setLineDash(i % 3 === 1 ? [3, 3] : i % 3 === 2 ? [1, 3] : []);
          g.beginPath();
          let last: [number, number] | null = null;
          for (let n = 1; n <= 60; n++) {
            const e = Math.abs(c.approx(n) - c.value);
            const le = Math.max(-16, Math.log10(Math.max(1e-17, e)));
            const p: [number, number] = [graph.sx(n), graph.sy(le)];
            n > 1 ? g.lineTo(...p) : g.moveTo(...p);
            last = p;
          }
          g.stroke();
          g.setLineDash([]);
          if (last) labels.push({ x: last[0] - 6, y: last[1] - 4, s: `${c.sym} ${c.seriesLabel}` });
        });
        // de-overlap end labels vertically
        labels.sort((p, q) => p.y - q.y);
        for (let k = 1; k < labels.length; k++) labels[k].y = Math.max(labels[k].y, labels[k - 1].y + 11);
        for (const l of labels) text(g, l.s, l.x, l.y, { size: 9, color: INK.f80, align: 'right' });
      },
    };
  },
};
