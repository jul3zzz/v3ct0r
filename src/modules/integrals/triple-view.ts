import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { axes, lineMat } from '../../gfx/materials';
import { compile } from '../../math/parser';
import { fmt, fmtInt, fmtSci } from '../../hud/dom';
import { densityMaterial, randomCube, simpson3D } from './cloud';
import { rng } from '../fractals/common';

const PRESETS = ['exp(-3(x^2 + y^2 + z^2))', '1 + sin(3x) sin(3y) sin(3z)', 'x^2 + y^2 + z^2', 'exp(-8(sqrt(x^2 + y^2) - 0.6)^2 - 8z^2)', '1', 'abs(x y z)'];

function cubeEdges(L: number): Float32Array {
  const out: number[] = [];
  for (let m = 0; m < 8; m++)
    for (let a = 0; a < 3; a++) {
      if (m & (1 << a)) continue;
      const p = [0, 1, 2].map((k) => (m & (1 << k) ? L : -L));
      const q = p.slice();
      q[a] = L;
      out.push(p[0], p[2], p[1], q[0], q[2], q[1]);
    }
  return new Float32Array(out);
}

export const tripleView: VizDef = {
  id: 'triple',
  title: 'INTÉGRALE TRIPLE',
  subtitle: 'Une densité f(x, y, z) rendue en nuage de points sur GPU. Son intégrale (la « masse ») est estimée par Monte-Carlo.',
  stage: '3d',
  keywords: ['intégrale triple', 'densité', 'masse', 'monte-carlo', 'nuage de points', 'volume'],
  formula: {
    tex: 'M=\\iiint_{V} f(x,y,z)\\,dV \\approx \\frac{|V|}{N}\\sum_{k=1}^{N} f(\\mathbf{p}_k),\\qquad \\sigma_M\\propto \\frac{1}{\\sqrt N}',
    note: 'Chaque point du nuage est tiré uniformément dans le domaine et son opacité vaut f/fₘₐₓ : on « voit » la densité. La moyenne de f sur N points aléatoires, multipliée par le volume, estime l’intégrale. L’erreur décroît en 1/√N, quelle que soit la dimension — c’est pourquoi Monte-Carlo sert en grande dimension.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.8, 2.0, 3.2], fog: false, rotateSpeed: 0.4 });
    const N = ctx.q(60_000, 150_000, 300_000);
    const geo = randomCube(N);
    let mat = densityMaterial('exp(-3.0*(x*x+y*y+z*z))');
    const cloud = new THREE.Points(geo, mat);
    cloud.frustumCulled = false;
    const box = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(cubeEdges(1), 3)), lineMat(0.35));
    stage.scene.add(axes(1.4, 0.25, 0.15), box, cloud);
    const st = { fn: (x: number, y: number, z: number) => Math.exp(-3 * (x * x + y * y + z * z)), glsl: '', L: 1, ball: false, slice: false, z0: 0, sweep: true, n: 0, sum: 0, sum2: 0, ref: 0, fmax: 1 };
    const r = rng(5);

    const reset = () => {
      st.n = 0;
      st.sum = 0;
      st.sum2 = 0;
      let mx = 0;
      for (let i = 0; i < 6000; i++) {
        const v = Math.abs(st.fn((r() * 2 - 1) * st.L, (r() * 2 - 1) * st.L, (r() * 2 - 1) * st.L));
        if (Number.isFinite(v)) mx = Math.max(mx, v);
      }
      st.fmax = mx || 1;
      st.ref = simpson3D(st.fn, st.L, st.ball, ctx.q(24, 32, 40));
      spark.reset();
    };
    const setGLSL = (glsl: string) => {
      const next = densityMaterial(glsl);
      cloud.material = next;
      mat.dispose();
      mat = next;
    };

    ctx.ui.section('DENSITÉ');
    ctx.ui.formula({
      prefix: 'f(x,y,z) =',
      value: PRESETS[0],
      vars: ['x', 'y', 'z'],
      presets: PRESETS,
      onChange: (c) => {
        st.fn = c.fn as (x: number, y: number, z: number) => number;
        setGLSL(c.glsl);
        reset();
      },
    });
    ctx.ui.segmented({
      label: 'DOMAINE',
      options: [
        { id: 'cube', label: 'CUBE [−L, L]³' },
        { id: 'ball', label: 'BOULE r ≤ L' },
      ],
      value: 'cube',
      onChange: (v) => {
        st.ball = v === 'ball';
        box.visible = !st.ball;
        reset();
      },
    });
    ctx.ui.slider({ label: 'L', min: 0.3, max: 2, step: 0.01, value: 1, onInput: (v) => ((st.L = v), box.scale.setScalar(v), reset()) });
    ctx.ui.section('COUPE');
    ctx.ui.toggle({ label: 'TRANCHE z = z₀', value: false, onChange: (v) => (st.slice = v) });
    const zS = ctx.ui.slider({ label: 'z₀', min: -1, max: 1, step: 0.001, value: 0, onInput: (v) => ((st.z0 = v), (st.sweep = false)) });
    ctx.ui.toggle({ label: 'BALAYER z₀', value: true, onChange: (v) => (st.sweep = v) });
    ctx.ui.section('MONTE-CARLO');
    const roN = ctx.ui.readout('ÉCHANTILLONS N');
    const roM = ctx.ui.readout('ESTIMATION');
    const roS = ctx.ui.readout('ÉCART-TYPE');
    const roR = ctx.ui.readout('RÉFÉRENCE (SIMPSON)');
    const spark = ctx.ui.spark('ESTIMATION AU FIL DES ÉCHANTILLONS', { size: 160 });
    ctx.ui.note(`${fmtInt(N)} points GPU · opacité = |f| / fₘₐₓ (densité négative affichée en valeur absolue).`);
    const sM = ctx.hud.stat('∭ f dV ≈', '');
    const sR = ctx.hud.stat('RÉF.', '');
    const sN = ctx.hud.stat('N', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    const first = compile(PRESETS[0], ['x', 'y', 'z']);
    if (first.ok) setGLSL(first.glsl);
    reset();
    let frame = 0;
    let ph = 0;
    return {
      update(_t, dt) {
        if (st.sweep && st.slice) {
          ph += dt * 0.5;
          st.z0 = Math.sin(ph) * st.L;
          if (frame % 4 === 0) zS.set(st.z0 / st.L, true);
        }
        const u = mat.uniforms;
        u.uMax.value = st.fmax;
        u.uL.value = st.L;
        u.uBall.value = st.ball ? 1 : 0;
        u.uSliceOn.value = st.slice ? 1 : 0;
        u.uSlice.value = st.z0;
        u.uSize.value = 2 * ctx.renderer.getPixelRatio();
        u.uOpacity.value = st.slice ? 0.9 : ctx.q(0.75, 0.55, 0.4);
        // Monte-Carlo samples
        const V = st.ball ? (4 / 3) * Math.PI * st.L ** 3 : (2 * st.L) ** 3;
        for (let i = 0; i < 4000; i++) {
          const x = (r() * 2 - 1) * st.L;
          const y = (r() * 2 - 1) * st.L;
          const z = (r() * 2 - 1) * st.L;
          if (st.ball && x * x + y * y + z * z > st.L * st.L) continue;
          const v = st.fn(x, y, z);
          if (!Number.isFinite(v)) continue;
          st.n++;
          st.sum += v;
          st.sum2 += v * v;
        }
        const mean = st.sum / Math.max(1, st.n);
        const est = V * mean;
        const sd = V * Math.sqrt(Math.max(0, st.sum2 / Math.max(1, st.n) - mean * mean) / Math.max(1, st.n));
        if (frame++ % 6 === 0) {
          spark.push(est);
          roN.set(fmtInt(st.n));
          roM.set(fmt(est, 6));
          roS.set(`± ${fmtSci(sd, 2)}`);
          roR.set(fmt(st.ref, 6));
          sM(`${fmt(est, 5)} ± ${fmtSci(sd, 1)}`);
          sR(fmt(st.ref, 5));
          sN(fmtInt(st.n));
        }
        stage.render();
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => {
        stage.dispose();
        geo.dispose();
      },
    };
  },
};
