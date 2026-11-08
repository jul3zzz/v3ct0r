import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { fmt, fmtInt } from '../../hud/dom';
import { boxCounting, rng } from './common';

/** Barnsley's four affine maps (a, b, c, d, e, f) with probabilities. */
const MAPS = [
  { m: [0, 0, 0, 0.16, 0, 0], p: 0.01 },
  { m: [0.85, 0.04, -0.04, 0.85, 0, 1.6], p: 0.85 },
  { m: [0.2, -0.26, 0.23, 0.22, 0, 1.6], p: 0.07 },
  { m: [-0.15, 0.28, 0.26, 0.24, 0, 0.44], p: 0.07 },
];

export const fernView: VizDef = {
  id: 'fern',
  title: 'FOUGÈRE DE BARNSLEY',
  subtitle: 'Quatre transformations affines tirées au hasard suffisent à dessiner une fougère : un système de fonctions itérées (IFS).',
  stage: '3d',
  keywords: ['barnsley', 'fougère', 'ifs', 'affine', 'box-counting'],
  formula: {
    tex: '\\begin{pmatrix}x\\\\y\\end{pmatrix}\\mapsto\\begin{pmatrix}a_i&b_i\\\\c_i&d_i\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}+\\begin{pmatrix}e_i\\\\f_i\\end{pmatrix},\\quad p=(0{,}01;\\,0{,}85;\\,0{,}07;\\,0{,}07)',
    note: 'Chaque point est envoyé par l’une des quatre applications, choisie avec sa probabilité : la tige (1 %), la fronde qui se répète (85 %), les deux premières folioles (7 % chacune). L’attracteur de cet IFS est la fougère. Sa dimension est estimée ici en direct par comptage de boîtes.',
  },
  create(ctx) {
    const N = ctx.q(200_000, 500_000, 1_000_000);
    const pos = new Float32Array(N * 3);
    const flat = new Float32Array(N * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(pts);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const pz = new PanZoom(ctx, { scale: 0.01, minScale: 1e-6 });
    pz.fit(-2.9, 2.9, -0.2, 10.2, 30);
    const st = { n: 0, bend: 0, speed: ctx.q(4000, 10000, 20000), x: 0, y: 0, dim: NaN, dimAt: 0 };
    let rand = rng(3);
    let maps = MAPS.map((m) => m.m.slice());

    const reset = () => {
      const c = Math.cos(st.bend);
      const s = Math.sin(st.bend);
      maps = MAPS.map((m) => m.m.slice());
      // bend the main frond map: rotate its linear part
      const [a, b, cc, d, e, f] = MAPS[1].m;
      maps[1] = [c * a - s * cc, c * b - s * d, s * a + c * cc, s * b + c * d, e, f];
      st.n = 0;
      st.x = 0;
      st.y = 0;
      st.dim = NaN;
      st.dimAt = 0;
      rand = rng(3);
      geo.setDrawRange(0, 0);
    };

    ctx.ui.section('SYSTÈME DE FONCTIONS ITÉRÉES');
    const bS = ctx.ui.slider({ label: 'COURBURE DE LA FRONDE', min: -0.12, max: 0.12, step: 0.001, value: 0, fmt: (v) => `${((v * 180) / Math.PI).toFixed(1).replace('.', ',')}°`, onInput: (v) => ((st.bend = v), reset()) });
    ctx.ui.slider({ label: 'POINTS PAR IMAGE', min: 500, max: 40000, step: 100, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.buttons([{ label: 'RECOMMENCER', icon: 'reset', onClick: reset }]);
    ctx.ui.section('MESURES');
    const roN = ctx.ui.readout('POINTS');
    const roD = ctx.ui.readout('DIM. BOX-COUNTING');
    ctx.ui.note('Le comptage de boîtes recouvre la fougère par des grilles de pas 2⁻ᵏ et mesure la pente de log N(k) en fonction de k.');
    const sN = ctx.hud.stat('POINTS', '');
    const tag = ctx.hud.tag('DIM. BOX-COUNTING ≈ …', true);
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    const cum = MAPS.map((_, i) => MAPS.slice(0, i + 1).reduce((s, m) => s + m.p, 0));
    let frame = 0;
    return {
      update() {
        pz.tick();
        const k = Math.min(st.speed, N - st.n);
        for (let i = 0; i < k; i++) {
          const r = rand();
          const m = maps[r < cum[0] ? 0 : r < cum[1] ? 1 : r < cum[2] ? 2 : 3];
          const x = m[0] * st.x + m[1] * st.y + m[4];
          const y = m[2] * st.x + m[3] * st.y + m[5];
          st.x = x;
          st.y = y;
          const j = st.n++;
          pos[j * 3] = x;
          pos[j * 3 + 1] = y;
          flat[j * 2] = x;
          flat[j * 2 + 1] = y;
        }
        if (k > 0) {
          geo.attributes.position.needsUpdate = true;
          geo.setDrawRange(0, st.n);
        }
        if (st.n >= 100_000 && st.n - st.dimAt >= Math.max(100_000, N / 3)) {
          st.dim = boxCounting(flat, 2, st.n, 4, 9).d;
          st.dimAt = st.n;
        }
        const W = ctx.width;
        const H = ctx.height;
        cam.left = pz.cx - (W / 2) * pz.scale;
        cam.right = pz.cx + (W / 2) * pz.scale;
        cam.top = pz.cy + (H / 2) * pz.scale;
        cam.bottom = pz.cy - (H / 2) * pz.scale;
        cam.updateProjectionMatrix();
        mat.size = Math.max(1, Math.min(3, 0.004 / pz.scale)) * ctx.renderer.getPixelRatio();
        ctx.renderer.render(scene, cam);
        if (frame++ % 6 === 0) {
          roN.set(fmtInt(st.n));
          sN(fmtInt(st.n));
          const d = Number.isFinite(st.dim) ? fmt(st.dim, 3) : 'calcul…';
          roD.set(d);
          tag(`DIM. BOX-COUNTING ≈ ${d}`);
        }
      },
      cinematic(t) {
        const b = 0.08 * Math.sin(t * 0.2);
        if (Math.abs(b - st.bend) > 0.02) {
          bS.set(b);
        }
      },
      dispose() {
        geo.dispose();
        mat.dispose();
      },
    };
  },
};
