import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line, marker } from '../../gfx/plot2d';
import { fmt, fmtInt, fmtSci } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString, correctDigits } from './data';

const STEPS = [1, 2, 4, 12, 52, 365, 8760, 525600];
const STEP_LABEL = ['ANNUEL', 'SEMESTRIEL', 'TRIMESTRIEL', 'MENSUEL', 'HEBDOMADAIRE', 'QUOTIDIEN', 'HORAIRE', 'À LA MINUTE'];

export const eView: VizDef = {
  id: 'e',
  title: 'e — NOMBRE D’EULER',
  subtitle: 'Des intérêts de 100 % composés de plus en plus souvent, et la série Σ 1/k! qui converge à une vitesse foudroyante.',
  stage: '2d',
  keywords: ['e', 'euler', 'intérêts composés', 'exponentielle', 'factorielle', 'série'],
  formula: {
    tex: 'e=\\lim_{n\\to\\infty}\\left(1+\\frac1n\\right)^n=\\sum_{k=0}^{\\infty}\\frac{1}{k!}=2{,}71828\\ldots',
    note: 'Placer 1 € à 100 % par an donne 2 € ; en composant deux fois (50 % + 50 %) on obtient 2,25 € ; mensuellement 2,613 € ; à la limite, e ≈ 2,71828 €. La même constante est la somme des inverses des factorielles : 1 + 1 + 1/2 + 1/6 + 1/24… L’erreur de (1 + 1/n)ⁿ décroît en e/(2n) ; celle de la série, plus vite que toute puissance.',
  },
  create(ctx) {
    const st = { mode: 'interest', i: 0, auto: true, timer: 0, terms: 1 };
    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'interest', label: 'INTÉRÊTS COMPOSÉS' },
        { id: 'series', label: 'SÉRIE Σ 1/k!' },
      ],
      value: 'interest',
      onChange: (v) => (st.mode = v),
    });
    const iS = ctx.ui.slider({ label: 'FRÉQUENCE', min: 0, max: STEPS.length - 1, step: 1, value: 0, fmt: (v) => `${STEP_LABEL[v]} (n = ${fmtInt(STEPS[v])})`, onInput: (v) => ((st.i = v), (st.auto = false)) });
    const tS = ctx.ui.slider({ label: 'TERMES DE LA SÉRIE', min: 1, max: 18, step: 1, value: 1, onInput: (v) => ((st.terms = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'PROGRESSION AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('VALEUR');
    ctx.ui.readout('e', DIGITS.e.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('e'), 12));
    ctx.ui.note('Motif de la fraction continue : [2; 1, 2k, 1, …] — régulier, alors que e est transcendant (Hermite, 1873).');
    const s1 = ctx.hud.stat('', '');
    const s2 = ctx.hud.stat('', '');
    const s3 = ctx.hud.stat('', '');
    ctx.hud.tag('TRANSCENDANT (HERMITE 1873)');
    const fr = new Frame2D(0, 0, 1, 1, 0, 1, 0.9, 2.85);
    return {
      update(_t, dt) {
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.5) {
            st.timer = 0;
            if (st.mode === 'interest') {
              st.i = (st.i + 1) % STEPS.length;
              iS.set(st.i, true);
            } else {
              st.terms = st.terms >= 18 ? 1 : st.terms + 1;
              tS.set(st.terms, true);
            }
          }
        }
        fr.set(80, 140, W - 420, H - 290);
        if (st.mode === 'interest') {
          const n = STEPS[st.i];
          fr.world(0, 1, 0.9, 2.85);
          fr.box(g, 'CAPITAL AU COURS DE L’ANNÉE (TAUX 100 %)', false);
          fr.axes(g, { xName: 't (ans)', yName: 'C' });
          fr.plot(g, Math.exp, { color: INK.f40, dash: [4, 4] });
          // staircase
          g.strokeStyle = INK.fg;
          g.beginPath();
          const k = Math.min(n, 2000);
          let c = 1;
          g.moveTo(fr.sx(0), fr.sy(1));
          for (let j = 1; j <= k; j++) {
            const t = j / k;
            g.lineTo(fr.sx(t), fr.sy(c));
            c = Math.pow(1 + 1 / n, (j * n) / k);
            g.lineTo(fr.sx(t), fr.sy(c));
          }
          g.stroke();
          const v = Math.pow(1 + 1 / n, n);
          line(g, fr.x, fr.sy(Math.E), fr.x + fr.w, fr.sy(Math.E), INK.f20, [2, 4]);
          text(g, 'e', fr.x + fr.w + 6, fr.sy(Math.E) + 4, { color: INK.fg, size: 12 });
          marker(g, fr.sx(1), fr.sy(v), 6, true);
          text(g, `${fmt(v, 6)} €`, fr.sx(1) - 8, fr.sy(v) - 10, { align: 'right', color: INK.fg });
          text(g, 'e^t (CONTINU)', fr.sx(0.55), fr.sy(Math.exp(0.55)) - 10, { color: INK.f40, size: 9 });
          s1(`n = ${fmtInt(n)} · ${STEP_LABEL[st.i]}`);
          s2(`(1 + 1/n)ⁿ = ${fmt(v, 8)}`);
          s3(`ÉCART À e ${fmtSci(Math.E - v, 2)} ≈ e/2n = ${fmtSci(Math.E / (2 * n), 2)}`);
        } else {
          // stacked bars of 1/k!
          fr.world(0, 20, 0, 2.95);
          fr.box(g, 'Σ 1/k! — CHAQUE TERME AJOUTE UN BLOC', false);
          fr.axes(g, { xName: 'k', yName: 'Sₖ', xTicks: 10 });
          let s = 0;
          let f = 1;
          for (let j = 0; j < st.terms; j++) {
            const term = 1 / f;
            const x0 = fr.sx(j + 0.15);
            const x1 = fr.sx(j + 0.85);
            g.strokeStyle = INK.f60;
            g.strokeRect(x0, fr.sy(s + term), x1 - x0, fr.sy(s) - fr.sy(s + term));
            g.fillStyle = INK.f10;
            g.fillRect(x0, fr.sy(s + term), x1 - x0, fr.sy(s) - fr.sy(s + term));
            g.fillStyle = INK.fg;
            g.fillRect(x0, fr.sy(s + term), x1 - x0, 1);
            if (j < 7) text(g, j < 2 ? '1' : `1/${f}`, (x0 + x1) / 2, fr.sy(s + term) - 5, { align: 'center', size: 9, color: INK.f60 });
            s += term;
            f *= j + 1;
          }
          line(g, fr.x, fr.sy(Math.E), fr.x + fr.w, fr.sy(Math.E), INK.f40, [3, 3]);
          text(g, 'e', fr.x + fr.w + 6, fr.sy(Math.E) + 4, { color: INK.fg, size: 12 });
          s1(`${st.terms} TERME(S)`);
          s2(`Sₙ = ${fmt(s, 12)}`);
          s3(`${correctDigits(s, DIGITS.e)} DÉCIMALES EXACTES`);
        }
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'series' : 'interest';
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
