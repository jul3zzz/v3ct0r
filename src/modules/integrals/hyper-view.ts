import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { axes, lineMat } from '../../gfx/materials';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, hatch, line, marker, text } from '../../gfx/plot2d';
import { compile } from '../../math/parser';
import { ballVolume } from '../../math/numeric';
import { fmt, fmtInt, fmtSci } from '../../hud/dom';
import { densityMaterial, randomCube, simpson3D } from './cloud';
import { rng } from '../fractals/common';
import { UI } from '../../hud/ui';

const PRESETS = [
  'exp(-5((x - 0.5cos(2pi t))^2 + (y - 0.5sin(2pi t))^2 + z^2))',
  '(1 + sin(2pi t)) exp(-3(x^2 + y^2 + z^2))',
  'exp(-6(x^2 + y^2 + (z - 1.6t + 0.8)^2))',
  '1 + cos(4x + 6t) cos(4y) cos(4z)',
];

function wireSphere(): Float32Array {
  const out: number[] = [];
  const seg = 48;
  for (let i = 1; i < 10; i++) {
    const phi = (Math.PI * i) / 10;
    const y = Math.cos(phi);
    const r = Math.sin(phi);
    for (let k = 0; k < seg; k++) {
      const a0 = (2 * Math.PI * k) / seg;
      const a1 = (2 * Math.PI * (k + 1)) / seg;
      out.push(r * Math.cos(a0), y, r * Math.sin(a0), r * Math.cos(a1), y, r * Math.sin(a1));
    }
  }
  for (let j = 0; j < 12; j++) {
    const a = (Math.PI * j) / 6;
    for (let k = 0; k < seg / 2; k++) {
      const p0 = (Math.PI * k) / (seg / 2);
      const p1 = (Math.PI * (k + 1)) / (seg / 2);
      out.push(Math.sin(p0) * Math.cos(a), Math.cos(p0), Math.sin(p0) * Math.sin(a), Math.sin(p1) * Math.cos(a), Math.cos(p1), Math.sin(p1) * Math.sin(a));
    }
  }
  return new Float32Array(out);
}

/** Points uniformly in [-1,1]^4; the shader shows those inside the 4-ball near the slice w ≈ w0. */
function hyperPointsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
attribute float pw;
uniform float uW;
uniform float uSize;
varying float vA;
void main() {
  float r2 = dot(position, position) + pw * pw;
  float inside = r2 <= 1.0 ? 1.0 : 0.0;
  float near = 1.0 - smoothstep(0.02, 0.07, abs(pw - uW));
  vA = inside * (0.04 + 0.96 * near);
  gl_PointSize = uSize * (0.6 + near);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: /* glsl */ `
varying float vA;
void main() { if (vA < 0.01) discard; gl_FragColor = vec4(vec3(1.0), vA); }`,
    uniforms: { uW: { value: 0 }, uSize: { value: 2 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

export const hyperView: VizDef = {
  id: 'hyper',
  title: 'INTÉGRALE 4D',
  subtitle: 'Une fonction f(x, y, z, t) vue tranche par tranche dans le temps, et l’hypervolume de la 3-sphère calculé en direct.',
  stage: '3d',
  keywords: ['4d', 'hypervolume', 'hypersphère', 'tranches', 'quadruple', 'monte-carlo'],
  formula: {
    tex: '\\iiiint f\\,dV\\,dt=\\int_0^1 I(t)\\,dt,\\qquad V_4(R)=\\int_{-R}^{R}\\tfrac43\\pi\\left(R^2-w^2\\right)^{3/2}dw=\\frac{\\pi^2}{2}R^4',
    note: 'On ne peut pas voir un nuage 4D, mais on peut le parcourir : à chaque instant t, la tranche est une densité 3D d’intégrale I(t). L’intégrale 4D est l’aire sous la courbe I(t). Pour la boule unité de ℝ⁴, chaque tranche w = cte est une boule 3D de rayon √(1 − w²) : sommer leurs volumes donne π²/2 ≈ 4,9348.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.6, 1.9, 3.0], fog: false, rotateSpeed: 0.4 });
    stage.scene.add(axes(1.4, 0.25, 0.15));
    const st = { mode: 'sphere' as 'func' | 'sphere', t: 0, auto: true, speed: 0.18, fn: (() => 0) as (x: number, y: number, z: number, t: number) => number, It: new Float64Array(65), total: 0, fmax: 1, mcIn: 0, mcN: 0 };
    const r = rng(9);
    // function mode
    const N = ctx.q(60_000, 150_000, 300_000);
    const cubeGeo = randomCube(N, 21);
    let dmat = densityMaterial('0.0');
    const cloud = new THREE.Points(cubeGeo, dmat);
    cloud.frustumCulled = false;
    // sphere mode
    const M = ctx.q(80_000, 200_000, 400_000);
    const hp = new Float32Array(M * 3);
    const hw = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      hp[i * 3] = r() * 2 - 1;
      hp[i * 3 + 1] = r() * 2 - 1;
      hp[i * 3 + 2] = r() * 2 - 1;
      hw[i] = r() * 2 - 1;
    }
    const hgeo = new THREE.BufferGeometry();
    hgeo.setAttribute('position', new THREE.BufferAttribute(hp, 3));
    hgeo.setAttribute('pw', new THREE.BufferAttribute(hw, 1));
    const hmat = hyperPointsMaterial();
    const hpts = new THREE.Points(hgeo, hmat);
    hpts.frustumCulled = false;
    const sphere = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(wireSphere(), 3)), lineMat(0.6));
    stage.scene.add(cloud, hpts, sphere);

    const analyze = () => {
      const K = st.It.length - 1;
      let mx = 0;
      for (let k = 0; k <= K; k++) {
        const t = k / K;
        st.It[k] = simpson3D((x, y, z) => st.fn(x, y, z, t), 1, false, 16);
      }
      for (let i = 0; i < 8000; i++) {
        const v = Math.abs(st.fn(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r()));
        if (Number.isFinite(v)) mx = Math.max(mx, v);
      }
      st.fmax = mx || 1;
      let s = st.It[0] + st.It[K];
      for (let k = 1; k < K; k++) s += (k % 2 ? 4 : 2) * st.It[k];
      st.total = (s / K) / 3;
    };

    ctx.ui.section('MODE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'sphere', label: 'HYPERSPHÈRE' },
        { id: 'func', label: 'f(x, y, z, t)' },
      ],
      value: st.mode,
      onChange: (v) => setMode(v),
    });
    const fBox = ctx.ui.custom(document.createElement('div'));
    const sBox = ctx.ui.custom(document.createElement('div'));
    const tS = ctx.ui.slider({ label: 'TRANCHE (t OU w)', min: 0, max: 1, step: 0.001, value: 0.5, onInput: (v) => ((st.t = v), (st.auto = false), autoT.set(false, true)) });
    const autoT = ctx.ui.toggle({ label: 'BALAYAGE AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.02, max: 0.6, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.section('BOULES UNITÉ Vₙ');
    for (const n of [1, 2, 3, 4, 5, 6, 8, 10]) ctx.ui.readout(`V${String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])}`, fmt(ballVolume(n), 5) + (n === 5 ? '  ◆ MAX' : ''));
    ctx.ui.note('Le volume de la boule unité est maximal en dimension 5, puis tend vers 0 quand la dimension augmente.');

    // function-mode controls
    const fUI = new UI(fBox);
    fUI.section('FONCTION 4D');
    fUI.formula({
      prefix: 'f(x,y,z,t) =',
      value: PRESETS[0],
      vars: ['x', 'y', 'z', 't'],
      presets: PRESETS,
      onChange: (c) => {
        st.fn = c.fn as never;
        const next = densityMaterial(c.glsl);
        cloud.material = next;
        dmat.dispose();
        dmat = next;
        analyze();
      },
    });
    fUI.note('Domaine : (x, y, z) ∈ [−1, 1]³, t ∈ [0, 1].');
    const roI = fUI.readout('I(t) = ∭ f dV');
    const roT = fUI.readout('∫ I(t) dt (4D)');
    const sUI = new UI(sBox);
    sUI.section('3-SPHÈRE (BOULE UNITÉ DE ℝ⁴)');
    const roR = sUI.readout('RAYON DE LA TRANCHE');
    const roV3 = sUI.readout('VOLUME DE LA TRANCHE');
    const roMC = sUI.readout('MONTE-CARLO V₄');
    const roEx = sUI.readout('EXACT π²/2');
    const roNN = sUI.readout('TIRAGES 4D');

    const s1 = ctx.hud.stat('TRANCHE', '');
    const s2 = ctx.hud.stat('VOLUME 3D', '');
    const s3 = ctx.hud.stat('HYPERVOLUME', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    const first = compile(PRESETS[0], ['x', 'y', 'z', 't']);
    if (first.ok) {
      st.fn = first.fn as never;
      const m0 = densityMaterial(first.glsl);
      cloud.material = m0;
      dmat.dispose();
      dmat = m0;
    }
    analyze();

    function setMode(m: 'func' | 'sphere') {
      st.mode = m;
      fBox.style.display = m === 'func' ? '' : 'none';
      sBox.style.display = m === 'sphere' ? '' : 'none';
      cloud.visible = m === 'func';
      hpts.visible = sphere.visible = m === 'sphere';
      ctx.setFormula(hyperView.formula);
    }
    setMode(st.mode);

    const graph = new Frame2D(0, 0, 260, 140, 0, 1, 0, 1);
    let frame = 0;
    let dir = 1;
    return {
      update(_t, dt) {
        if (st.auto) {
          st.t += dir * dt * st.speed;
          if (st.t > 1) { st.t = 1; dir = -1; }
          if (st.t < 0) { st.t = 0; dir = 1; }
          if (frame % 4 === 0) tS.set(st.t, true);
        }
        const g = ctx.g;
        // narrow view (phone): a smaller graph at the top right, clear of the HUD stats
        if (ctx.width < NARROW_VIEW) graph.set(ctx.width - 166, 96, 150, 72);
        else graph.set(ctx.width - 290, ctx.height - 205, 260, 140);
        if (st.mode === 'func') {
          const u = dmat.uniforms;
          u.uT.value = st.t;
          u.uMax.value = st.fmax;
          u.uSize.value = 2 * ctx.renderer.getPixelRatio();
          u.uOpacity.value = ctx.q(0.75, 0.55, 0.4);
          const K = st.It.length - 1;
          let lo = 0;
          let hi = 0;
          for (const v of st.It) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
          graph.world(0, 1, lo, hi * 1.15 || 1);
          const It = (t: number) => {
            const x = t * K;
            const i = Math.min(K - 1, Math.floor(x));
            return st.It[i] + (st.It[i + 1] - st.It[i]) * (x - i);
          };
          stage.render();
          graph.box(g, 'I(t) = ∭ f(x,y,z,t) dV — AIRE = INTÉGRALE 4D');
          const p = new Path2D();
          p.moveTo(graph.sx(0), graph.sy(0));
          for (let k = 0; k <= 100; k++) p.lineTo(graph.sx((k / 100) * st.t), graph.sy(It((k / 100) * st.t)));
          p.lineTo(graph.sx(st.t), graph.sy(0));
          p.closePath();
          hatch(g, p, 5, INK.f20);
          graph.axes(g, { xName: 't', labels: true });
          graph.plot(g, It);
          marker(g, graph.sx(st.t), graph.sy(It(st.t)), 5, true);
          if (frame++ % 5 === 0) {
            roI.set(fmt(It(st.t), 5));
            roT.set(fmt(st.total, 5));
            s1(`t = ${fmt(st.t, 3)}`);
            s2(`I(t) = ${fmt(It(st.t), 4)}`);
            s3(`∫ I dt = ${fmt(st.total, 4)}`);
          }
        } else {
          const w = st.t * 2 - 1;
          const rad = Math.sqrt(Math.max(0, 1 - w * w));
          sphere.scale.setScalar(Math.max(1e-4, rad));
          hmat.uniforms.uW.value = w;
          hmat.uniforms.uSize.value = 1.6 * ctx.renderer.getPixelRatio();
          for (let i = 0; i < 20000; i++) {
            const a = r() * 2 - 1;
            const b = r() * 2 - 1;
            const c = r() * 2 - 1;
            const d = r() * 2 - 1;
            st.mcN++;
            if (a * a + b * b + c * c + d * d <= 1) st.mcIn++;
          }
          stage.render();
          const V3 = (x: number) => (4 / 3) * Math.PI * Math.pow(Math.max(0, 1 - x * x), 1.5);
          graph.world(-1, 1, 0, 4.6);
          graph.box(g, 'VOLUME DES TRANCHES V₃(w) — AIRE TOTALE = π²/2');
          const p = new Path2D();
          p.moveTo(graph.sx(-1), graph.sy(0));
          for (let k = 0; k <= 120; k++) {
            const x = -1 + ((w + 1) * k) / 120;
            p.lineTo(graph.sx(x), graph.sy(V3(x)));
          }
          p.lineTo(graph.sx(w), graph.sy(0));
          p.closePath();
          hatch(g, p, 5, INK.f20);
          graph.axes(g, { xName: 'w' });
          graph.plot(g, V3);
          marker(g, graph.sx(w), graph.sy(V3(w)), 5, true);
          line(g, graph.sx(w), graph.y, graph.sx(w), graph.y + graph.h, INK.f20, [2, 3]);
          // accumulated integral ∫_{-1}^{w} V3
          let acc = 0;
          const K = 200;
          for (let k = 0; k < K; k++) {
            const x0 = -1 + ((w + 1) * k) / K;
            const x1 = -1 + ((w + 1) * (k + 1)) / K;
            acc += ((V3(x0) + 4 * V3((x0 + x1) / 2) + V3(x1)) / 6) * (x1 - x0);
          }
          text(g, `∫ = ${fmt(acc, 4)}`, graph.x + graph.w - 6, graph.y + 14, { align: 'right', color: INK.fg, size: 10 });
          if (frame++ % 5 === 0) {
            const est = (16 * st.mcIn) / st.mcN;
            roR.set(fmt(rad, 4));
            roV3.set(fmt(V3(w), 5));
            roMC.set(`${fmt(est, 5)} (${fmtSci(Math.abs(est - Math.PI ** 2 / 2), 1)})`);
            roEx.set(fmt(Math.PI ** 2 / 2, 6));
            roNN.set(fmtInt(st.mcN));
            s1(`w = ${fmt(w, 3)} · r = ${fmt(rad, 3)}`);
            s2(fmt(V3(w), 4));
            s3(`MC ${fmt(est, 4)} → π²/2 = ${fmt(Math.PI ** 2 / 2, 4)}`);
          }
        }
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'func' : 'sphere';
        if (m !== st.mode) modeSeg.set(m);
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => {
        stage.dispose();
        cubeGeo.dispose();
        hgeo.dispose();
      },
    };
  },
};
