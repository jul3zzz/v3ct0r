import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { axes, lineMat, occluderMat, paramGridLines } from '../../gfx/materials';
import { simpson2D } from '../../math/numeric';
import { fmt, fmtSci } from '../../hud/dom';

type F2 = (x: number, y: number) => number;

const PRESETS = ['1.2 exp(-(x^2 + y^2))', 'sin(x) cos(y) + 1.2', '1 + (x^2 - y^2)/4', '2 - sqrt(x^2 + y^2)', 'cos(x y) + 0.5', 'x^2 + y^2'];

/** Edges of n×n Riemann prisms of height f(sample point). */
function prismEdges(f: F2, a: number, b: number, n: number, k: number, mode: 'mid' | 'corner', grow: number): Float32Array {
  const out: number[] = [];
  const h = (b - a) / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const x0 = a + i * h;
      const y0 = a + j * h;
      const sx = mode === 'mid' ? x0 + h / 2 : x0;
      const sy = mode === 'mid' ? y0 + h / 2 : y0;
      let z = f(sx, sy);
      if (!Number.isFinite(z)) z = 0;
      z *= k * grow;
      const X = [x0 * k, (x0 + h) * k];
      const Z = [y0 * k, (y0 + h) * k];
      // scene: x → x, value → y (up), y → z
      const P = (ix: number, iz: number, top: boolean) => [X[ix], top ? z : 0, Z[iz]];
      const quad = (top: boolean) => {
        const c = [P(0, 0, top), P(1, 0, top), P(1, 1, top), P(0, 1, top)];
        for (let e = 0; e < 4; e++) out.push(...c[e], ...c[(e + 1) % 4]);
      };
      quad(true);
      if (n <= 24) quad(false);
      for (const [ix, iz] of [[0, 0], [1, 0], [1, 1], [0, 1]]) out.push(...P(ix, iz, false), ...P(ix, iz, true));
    }
  return new Float32Array(out);
}

export const doubleView: VizDef = {
  id: 'double',
  title: 'INTÉGRALE DOUBLE',
  subtitle: 'Le volume sous la surface z = f(x, y) approché par n × n prismes dont la base s’affine.',
  stage: '3d',
  keywords: ['intégrale double', 'volume', 'prismes', 'fubini', 'surface', '3d'],
  formula: {
    tex: '\\iint_{D} f(x,y)\\,dA=\\lim_{n\\to\\infty}\\sum_{i,j=1}^{n} f(x_i^*,y_j^*)\\,\\Delta x\\,\\Delta y',
    note: 'Chaque prisme a pour base un petit carré ΔA = Δx·Δy et pour hauteur la valeur de f en un point du carré (centre ou coin). En raffinant la grille, la somme des volumes converge vers l’intégrale double. Par le théorème de Fubini, on peut aussi l’obtenir comme deux intégrales simples emboîtées.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [3.4, 2.6, 3.6], target: [0, 0.4, 0], fog: [3, 10], rotateSpeed: 0.35 });
    stage.scene.add(axes(1.8, 0.25, 0.2));
    const st = { f: ((x: number, y: number) => 1.2 * Math.exp(-(x * x + y * y))) as F2, a: -1.5, b: 1.5, n: 4, mode: 'mid' as 'mid' | 'corner', auto: true, timer: 0, grow: 1, solid: true, exact: 0 };
    const k = 1;
    const surf = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.45));
    const prisms = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.8, false));
    const occ = new THREE.Mesh(new THREE.BufferGeometry(), occluderMat());
    const base = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.25));
    stage.scene.add(occ, surf, prisms, base);

    const buildSurface = () => {
      const f = st.f;
      const data = paramGridLines((u, v, o) => o.set(u * k, (Number.isFinite(f(u, v)) ? f(u, v) : 0) * k, v * k), st.a, st.b, st.a, st.b, ctx.q(24, 36, 48), ctx.q(24, 36, 48), 3);
      surf.geometry.dispose();
      surf.geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(data, 3));
      const sq = [st.a, st.b];
      const bl: number[] = [];
      for (let i = 0; i < 4; i++) {
        const p = [[sq[0], sq[0]], [sq[1], sq[0]], [sq[1], sq[1]], [sq[0], sq[1]]];
        const q0 = p[i];
        const q1 = p[(i + 1) % 4];
        bl.push(q0[0], 0, q0[1], q1[0], 0, q1[1]);
      }
      base.geometry.dispose();
      base.geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(bl, 3));
      st.exact = simpson2D(f, st.a, st.b, st.a, st.b, 240);
    };
    const buildPrisms = () => {
      const data = prismEdges(st.f, st.a, st.b, st.n, k, st.mode, st.grow);
      prisms.geometry.dispose();
      prisms.geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(data, 3));
      // occluder: top faces + sides as boxes
      const geos: number[] = [];
      const idx: number[] = [];
      const h = (st.b - st.a) / st.n;
      let v = 0;
      for (let i = 0; i < st.n; i++)
        for (let j = 0; j < st.n; j++) {
          const x0 = st.a + i * h;
          const y0 = st.a + j * h;
          const sx = st.mode === 'mid' ? x0 + h / 2 : x0;
          const sy = st.mode === 'mid' ? y0 + h / 2 : y0;
          let z = st.f(sx, sy);
          if (!Number.isFinite(z)) z = 0;
          z *= st.grow;
          const xs = [x0, x0 + h];
          const ys = [y0, y0 + h];
          for (const zz of [0, z]) for (const yy of ys) for (const xx of xs) geos.push(xx, zz, yy);
          const faces = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
          for (const [p, q, r, s] of faces) idx.push(v + p, v + q, v + r, v + p, v + r, v + s);
          v += 8;
        }
      occ.geometry.dispose();
      occ.geometry = new THREE.BufferGeometry();
      occ.geometry.setAttribute('position', new THREE.Float32BufferAttribute(geos, 3));
      occ.geometry.setIndex(idx);
      occ.visible = st.solid;
    };

    ctx.ui.section('FONCTION');
    ctx.ui.formula({
      prefix: 'f(x,y) =',
      value: PRESETS[0],
      vars: ['x', 'y'],
      presets: PRESETS,
      onChange: (c) => {
        st.f = c.fn as F2;
        buildSurface();
        buildPrisms();
      },
    });
    ctx.ui.slider({ label: 'DOMAINE [−L, L]²', min: 0.5, max: 3, step: 0.01, value: 1.5, onInput: (v) => ((st.a = -v), (st.b = v), buildSurface(), buildPrisms()) });
    ctx.ui.section('PRISMES DE RIEMANN');
    const nS = ctx.ui.slider({ label: 'GRILLE n × n', min: 1, max: ctx.q(32, 48, 64), step: 1, value: st.n, onInput: (v) => ((st.n = v), (st.grow = 0)) });
    ctx.ui.segmented({
      options: [
        { id: 'mid', label: 'CENTRE' },
        { id: 'corner', label: 'COIN' },
      ],
      value: 'mid',
      onChange: (v) => ((st.mode = v), buildPrisms()),
    });
    ctx.ui.toggle({ label: 'RAFFINEMENT AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.toggle({ label: 'OCCLUSION', value: true, onChange: (v) => ((st.solid = v), (occ.visible = v)) });
    ctx.ui.section('VOLUME');
    const roS = ctx.ui.readout('Σ f ΔA');
    const roI = ctx.ui.readout('∬ f (RÉF.)');
    const roE = ctx.ui.readout('ERREUR');
    const sS = ctx.hud.stat('Σ f ΔA', '');
    const sI = ctx.hud.stat('∬ f dA', '');
    const sN = ctx.hud.stat('PRISMES', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · CLIC DROIT : DÉPLACER · DOUBLE-CLIC : RECENTRER');

    buildSurface();
    buildPrisms();
    const seq = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32];
    let si = 3;
    let lastN = -1;
    let lastGrow = -1;
    return {
      update(_t, dt) {
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.3) {
            st.timer = 0;
            si = (si + 1) % seq.length;
            st.n = Math.min(seq[si], ctx.q(32, 48, 64));
            st.grow = 0;
            nS.set(st.n, true);
          }
        }
        st.grow = Math.min(1, st.grow + dt * 3);
        if (st.n !== lastN || st.grow !== lastGrow) {
          buildPrisms();
          lastN = st.n;
          lastGrow = st.grow;
        }
        const h = (st.b - st.a) / st.n;
        let S = 0;
        for (let i = 0; i < st.n; i++)
          for (let j = 0; j < st.n; j++) {
            const x = st.a + (i + (st.mode === 'mid' ? 0.5 : 0)) * h;
            const y = st.a + (j + (st.mode === 'mid' ? 0.5 : 0)) * h;
            const v = st.f(x, y);
            if (Number.isFinite(v)) S += v * h * h;
          }
        roS.set(fmt(S, 6));
        roI.set(fmt(st.exact, 6));
        roE.set(fmtSci(Math.abs(S - st.exact), 2));
        sS(fmt(S, 5));
        sI(fmt(st.exact, 5));
        sN(`${st.n} × ${st.n} = ${st.n * st.n}`);
        stage.render();
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => stage.dispose(),
    };
  },
};
