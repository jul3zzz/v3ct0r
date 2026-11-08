import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, MONO, text, line } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { rng } from '../fractals/common';

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

export const cantorView: VizDef = {
  id: 'cantor',
  title: 'INFINI & CARDINALITÉ',
  subtitle: 'ℕ et ℚ ont « autant » d’éléments, mais ℝ en a strictement plus : l’argument diagonal de Cantor, et l’ensemble de Cantor.',
  stage: '2d',
  keywords: ['cantor', 'infini', 'cardinalité', 'diagonale', 'dénombrable', 'rationnels', 'ensemble de cantor'],
  formula: {
    tex: '|\\mathbb N|=|\\mathbb Q|=\\aleph_0\\;<\\;|\\mathbb R|=2^{\\aleph_0},\\qquad \\dim_H C=\\frac{\\ln 2}{\\ln 3}',
    note: 'Deux ensembles ont même cardinal s’il existe une bijection entre eux. Le parcours en zigzag numérote toutes les fractions : ℚ est dénombrable. Mais toute liste de réels de [0, 1] en oublie un : on construit un nombre dont la k-ième décimale diffère de celle du k-ième réel de la liste (diagonale). L’ensemble de Cantor (on retire les tiers centraux) est de mesure nulle et pourtant non dénombrable.',
  },
  create(ctx) {
    const st = { mode: 'diag', t: 0, rows: 12, seed: 1 };
    let r = rng(st.seed);
    let list: string[] = [];
    const regen = () => {
      r = rng(++st.seed);
      list = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => (r() < 0.5 ? '0' : '1')).join(''));
      st.t = 0;
    };
    regen();
    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'diag', label: 'DIAGONALE' },
        { id: 'q', label: 'ℕ ↔ ℚ' },
        { id: 'set', label: 'ENSEMBLE DE CANTOR' },
      ],
      value: 'diag',
      onChange: (v) => ((st.mode = v), (st.t = 0)),
    });
    ctx.ui.buttons([{ label: 'NOUVELLE LISTE', icon: 'reset', onClick: regen }]);
    const s1 = ctx.hud.stat('', '');
    const s2 = ctx.hud.stat('', '');
    const fr = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    return {
      update(_t, dt) {
        st.t += dt;
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        if (st.mode === 'diag') {
          const n = Math.min(14, Math.floor((H - 260) / 30));
          const k = Math.min(n, Math.floor(st.t / 0.6));
          const x0 = 80;
          const y0 = 150;
          g.font = `400 15px ${MONO}`;
          for (let i = 0; i < n; i++) {
            text(g, `r${String(i + 1).padStart(2, '0')} = 0,`, x0, y0 + i * 30, { size: 13, color: INK.f40 });
            for (let j = 0; j < n; j++) {
              const isD = i === j;
              const ch = list[i][j];
              const x = x0 + 110 + j * 24;
              const y = y0 + i * 30;
              if (isD && i < k) {
                g.strokeStyle = INK.fg;
                g.strokeRect(x - 5.5, y - 15.5, 21, 22);
              }
              text(g, ch, x, y, { size: 15, color: isD ? INK.fg : INK.f60 });
            }
            text(g, '…', x0 + 110 + n * 24, y0 + i * 30, { size: 15, color: INK.f20 });
          }
          const yD = y0 + n * 30 + 26;
          line(g, x0, yD - 22, x0 + 110 + n * 24 + 20, yD - 22, INK.f20);
          text(g, 'd   = 0,', x0, yD, { size: 13, color: INK.fg });
          for (let j = 0; j < k; j++) {
            const flip = list[j][j] === '0' ? '1' : '0';
            text(g, flip, x0 + 110 + j * 24, yD, { size: 15, color: INK.fg });
          }
          text(g, k >= n ? 'd DIFFÈRE DE CHAQUE rₖ À LA k-IÈME DÉCIMALE : d N’EST PAS DANS LA LISTE.' : 'ON INVERSE LA k-IÈME DÉCIMALE DU k-IÈME NOMBRE…', x0, yD + 40, { size: 12, color: INK.f80 });
          if (st.t > n * 0.6 + 5) regen();
          s1(`${k} / ${n} DÉCIMALES`);
          s2('ℝ N’EST PAS DÉNOMBRABLE');
        } else if (st.mode === 'q') {
          const N = 9;
          const size = Math.min(W - 420, H - 220);
          fr.set(80, 140, size, size).world(0.5, N + 0.5, 0.5, N + 0.5);
          // grid of p/q
          for (let p = 1; p <= N; p++)
            for (let q = 1; q <= N; q++) {
              const red = gcd(p, q) === 1;
              text(g, `${p}/${q}`, fr.sx(p), fr.sy(N + 1 - q) + 4, { align: 'center', size: 11, color: red ? INK.f60 : INK.f20 });
            }
          // zigzag along anti-diagonals, skipping non-reduced fractions
          const path: [number, number][] = [];
          for (let s = 2; s <= 2 * N && path.length < 400; s++) {
            const cells: [number, number][] = [];
            for (let p = 1; p < s; p++) {
              const q = s - p;
              if (p <= N && q <= N) cells.push([p, q]);
            }
            if (s % 2) cells.reverse();
            path.push(...cells);
          }
          const k = Math.min(path.length, Math.floor(st.t * 4));
          let idx = 0;
          g.strokeStyle = INK.f40;
          g.beginPath();
          for (let i = 0; i < k; i++) {
            const [p, q] = path[i];
            const x = fr.sx(p);
            const y = fr.sy(N + 1 - q);
            i ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.stroke();
          for (let i = 0; i < k; i++) {
            const [p, q] = path[i];
            if (gcd(p, q) !== 1) continue;
            idx++;
            g.strokeStyle = INK.fg;
            g.strokeRect(fr.sx(p) - 17.5, fr.sy(N + 1 - q) - 9.5, 35, 18);
            if (i === k - 1) text(g, `n = ${idx}`, fr.sx(p) + 22, fr.sy(N + 1 - q) + 4, { color: INK.fg });
          }
          if (st.t > path.length / 4 + 3) st.t = 0;
          s1(`${idx} FRACTIONS NUMÉROTÉES`);
          s2('ℚ EST DÉNOMBRABLE');
        } else {
          const levels = 7;
          const w = W - 420;
          const x0 = 80;
          const shown = Math.min(levels, 1 + Math.floor(st.t / 0.9));
          let segs: [number, number][] = [[0, 1]];
          for (let l = 0; l < shown; l++) {
            const y = 160 + l * 44;
            for (const [a, b] of segs) {
              g.fillStyle = INK.fg;
              g.fillRect(x0 + a * w, y, Math.max(1, (b - a) * w), 8);
            }
            text(g, `n = ${l} · ${2 ** l} segments · longueur ${fmt((2 / 3) ** l, 4)}`, x0, y - 6, { size: 9, color: INK.f40 });
            segs = segs.flatMap(([a, b]) => {
              const d = (b - a) / 3;
              return [[a, a + d], [b - d, b]] as [number, number][];
            });
          }
          if (st.t > levels * 0.9 + 4) st.t = 0;
          s1('MESURE (2/3)ⁿ → 0');
          s2('CARDINAL = |ℝ| · DIM ln2/ln3 ≈ 0,631');
        }
      },
      cinematic(t) {
        const m = (['diag', 'q', 'set'] as const)[Math.floor(t / 9) % 3];
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
