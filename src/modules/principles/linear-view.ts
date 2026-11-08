import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { INK, dotGrid, line, text, hatch, marker } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

const PRESETS: { label: string; m: [number, number, number, number] }[] = [
  { label: 'ROTATION 45°', m: [Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2] },
  { label: 'CISAILLEMENT', m: [1, 1, 0, 1] },
  { label: 'DILATATION', m: [2, 0, 0, 0.5] },
  { label: 'SYMÉTRIE', m: [0, 1, 1, 0] },
  { label: 'PROJECTION', m: [1, 0, 0, 0] },
  { label: 'MATRICE SYMÉTRIQUE', m: [2, 1, 1, 2] },
];

export const linearView: VizDef = {
  id: 'linear',
  title: 'VECTEURS & MATRICES',
  subtitle: 'Une matrice 2×2 déplace toute la grille : ses colonnes sont les images des vecteurs de base, son déterminant l’aire du carré unité.',
  stage: '2d',
  keywords: ['matrice', 'transformation linéaire', 'déterminant', 'vecteurs propres', 'valeurs propres', 'algèbre linéaire'],
  formula: {
    tex: 'A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix},\\quad A\\vec e_1=\\binom{a}{c},\\ A\\vec e_2=\\binom{b}{d},\\quad \\det A=ad-bc,\\quad A\\vec v=\\lambda\\vec v',
    note: 'Une application linéaire est entièrement décrite par ce qu’elle fait aux deux vecteurs de base : leurs images forment les colonnes de la matrice. Les droites restent droites et parallèles, l’origine fixe. Le carré unité devient un parallélogramme d’aire |det A| (négatif : l’orientation s’inverse). Les vecteurs propres sont les directions seulement étirées, d’un facteur λ.',
  },
  create(ctx) {
    const st = { m: [1, 1, 0, 1] as [number, number, number, number], t: 0, auto: true, ph: 0 };
    const pz = new PanZoom(ctx, { scale: 0.01 });
    pz.fit(-4, 4, -3, 3, 40);
    ctx.ui.section('MATRICE A');
    const sl = (['a', 'b', 'c', 'd'] as const).map((k, i) =>
      ctx.ui.slider({ label: k, min: -3, max: 3, step: 0.01, value: st.m[i], onInput: (v) => (st.m[i] = v) }),
    );
    ctx.ui.section('EXEMPLES');
    ctx.ui.segmented({
      options: PRESETS.map((p, i) => ({ id: String(i), label: p.label })),
      value: '1',
      cols: 2,
      onChange: (v) => {
        st.m = [...PRESETS[Number(v)].m];
        sl.forEach((s, i) => s.set(st.m[i], true));
      },
    });
    const tS = ctx.ui.slider({ label: 'INTERPOLATION I → A', min: 0, max: 1, step: 0.001, value: 0, onInput: (v) => ((st.t = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'ANIMATION', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('INVARIANTS');
    const roDet = ctx.ui.readout('DÉTERMINANT');
    const roTr = ctx.ui.readout('TRACE');
    const roEig = ctx.ui.readout('VALEURS PROPRES');
    const s1 = ctx.hud.stat('det A', '');
    const s2 = ctx.hud.stat('λ', '');
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.ph += dt * 0.5;
          st.t = Math.min(1, Math.max(0, 0.5 - 0.7 * Math.cos(st.ph)));
          tS.set(st.t, true);
        }
        const [a, b, c, d] = st.m;
        const t = st.t;
        const M = [1 + (a - 1) * t, b * t, c * t, 1 + (d - 1) * t];
        const T = (x: number, y: number): [number, number] => [pz.sx(M[0] * x + M[1] * y), pz.sy(M[2] * x + M[3] * y)];
        const g = ctx.g;
        dotGrid(g, pz, 1, INK.f10);
        // original grid faint
        for (let k = -8; k <= 8; k++) {
          line(g, pz.sx(k), 0, pz.sx(k), ctx.height, INK.f05);
          line(g, 0, pz.sy(k), ctx.width, pz.sy(k), INK.f05);
        }
        // transformed grid
        for (let k = -8; k <= 8; k++) {
          const p0 = T(k, -8);
          const p1 = T(k, 8);
          const q0 = T(-8, k);
          const q1 = T(8, k);
          line(g, p0[0], p0[1], p1[0], p1[1], k === 0 ? INK.fg : INK.f40);
          line(g, q0[0], q0[1], q1[0], q1[1], k === 0 ? INK.fg : INK.f40);
        }
        // unit square image
        const sq = new Path2D();
        [T(0, 0), T(1, 0), T(1, 1), T(0, 1)].forEach(([x, y], i) => (i ? sq.lineTo(x, y) : sq.moveTo(x, y)));
        sq.closePath();
        hatch(g, sq, 5, INK.f40);
        g.strokeStyle = INK.fg;
        g.stroke(sq);
        // basis vectors
        const o = T(0, 0);
        const e1 = T(1, 0);
        const e2 = T(0, 1);
        g.lineWidth = 2;
        line(g, o[0], o[1], e1[0], e1[1], INK.fg);
        line(g, o[0], o[1], e2[0], e2[1], INK.fg);
        g.lineWidth = 1;
        marker(g, e1[0], e1[1], 6, true);
        marker(g, e2[0], e2[1], 6, false);
        text(g, 'A·e₁', e1[0] + 8, e1[1] - 6, { color: INK.fg });
        text(g, 'A·e₂', e2[0] + 8, e2[1] - 6, { color: INK.fg });
        // eigenvectors of the full matrix A
        const tr = a + d;
        const det = a * d - b * c;
        const disc = tr * tr - 4 * det;
        let eig = 'COMPLEXES (ROTATION)';
        if (disc >= -1e-12) {
          const r = Math.sqrt(Math.max(0, disc));
          const l1 = (tr + r) / 2;
          const l2 = (tr - r) / 2;
          eig = `λ₁ = ${fmt(l1, 3)} · λ₂ = ${fmt(l2, 3)}`;
          for (const l of [l1, l2]) {
            let vx = b;
            let vy = l - a;
            if (Math.abs(vx) + Math.abs(vy) < 1e-9) {
              vx = l - d;
              vy = c;
            }
            if (Math.abs(vx) + Math.abs(vy) < 1e-9) {
              vx = 1;
              vy = 0;
            }
            const n = Math.hypot(vx, vy);
            line(g, pz.sx((-8 * vx) / n), pz.sy((-8 * vy) / n), pz.sx((8 * vx) / n), pz.sy((8 * vy) / n), INK.f60, [6, 4]);
          }
        }
        const detT = M[0] * M[3] - M[1] * M[2];
        roDet.set(fmt(det, 3));
        roTr.set(fmt(tr, 3));
        roEig.set(eig);
        s1(`${fmt(detT, 3)} (t = ${fmt(t, 2)})`);
        s2(eig);
      },
    };
  },
};
