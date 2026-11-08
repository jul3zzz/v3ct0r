import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { lineMat, occluderMat, floorGrid } from '../../gfx/materials';
import { fmt, fmtInt } from '../../hud/dom';

/** Centers of the sub-cubes of the Menger sponge at level n (cube [-1,1]^3). */
function mengerCubes(level: number): { c: number[]; s: number } {
  let cubes = [[0, 0, 0]];
  let s = 2;
  for (let l = 0; l < level; l++) {
    s /= 3;
    const next: number[][] = [];
    for (const [x, y, z] of cubes)
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++)
          for (let k = -1; k <= 1; k++) {
            if ((i === 0 ? 1 : 0) + (j === 0 ? 1 : 0) + (k === 0 ? 1 : 0) >= 2) continue;
            next.push([x + i * s, y + j * s, z + k * s]);
          }
    cubes = next;
  }
  return { c: cubes.flat(), s };
}

const EDGES = [
  [0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];

export const mengerView: VizDef = {
  id: 'menger',
  title: 'ÉPONGE DE MENGER',
  subtitle: 'On divise le cube en 27, on retire le centre et les centres des faces, et on recommence : volume nul, surface infinie.',
  stage: '3d',
  hausdorff: 'ln 20 / ln 3 ≈ 2,727',
  keywords: ['menger', 'éponge', 'cube', 'sierpinski 3d', 'tapis'],
  formula: {
    tex: 'N=20,\\ r=\\tfrac13\\ \\Rightarrow\\ D=\\frac{\\ln 20}{\\ln 3}\\approx 2{,}7268,\\qquad V_n=\\left(\\tfrac{20}{27}\\right)^n\\to 0',
    note: 'Chaque cube est remplacé par 20 cubes trois fois plus petits (on retire les 7 cubes centraux). Le volume est multiplié par 20/27 à chaque étape et tend vers 0, alors que la surface tend vers l’infini. Chaque face de l’éponge est un tapis de Sierpinski. Karl Menger (1926) l’a introduite comme « courbe universelle ».',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.6, 2.0, 3.1], fog: [2.6, 8], rotateSpeed: 0.5 });
    stage.scene.add(floorGrid(3, 0.5, -1.5));
    const group = new THREE.Group();
    stage.scene.add(group);
    const lines = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.75, false));
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    let inst: THREE.InstancedMesh | null = null;
    const occMat = occluderMat();
    const st = { level: 2, max: ctx.q(2, 3, 3), occlude: true };
    group.add(lines);

    const build = () => {
      const { c, s } = mengerCubes(st.level);
      const n = c.length / 3;
      const h = s / 2;
      const v = new Float32Array(n * 12 * 6);
      let k = 0;
      for (let i = 0; i < n; i++) {
        const corner = (m: number) => [c[i * 3] + (m & 1 ? h : -h), c[i * 3 + 1] + (m & 2 ? h : -h), c[i * 3 + 2] + (m & 4 ? h : -h)];
        for (const [a, b] of EDGES) {
          v.set(corner(a), k);
          v.set(corner(b), k + 3);
          k += 6;
        }
      }
      lines.geometry.dispose();
      lines.geometry = new THREE.BufferGeometry();
      lines.geometry.setAttribute('position', new THREE.BufferAttribute(v, 3));
      if (inst) {
        group.remove(inst);
        inst.dispose();
      }
      inst = new THREE.InstancedMesh(boxGeo, occMat, n);
      const m = new THREE.Matrix4();
      for (let i = 0; i < n; i++) {
        m.makeScale(s * 0.999, s * 0.999, s * 0.999).setPosition(c[i * 3], c[i * 3 + 1], c[i * 3 + 2]);
        inst.setMatrixAt(i, m);
      }
      inst.visible = st.occlude;
      group.add(inst);
      roC.set(fmtInt(n));
      roV.set(fmt((20 / 27) ** st.level, 5));
      roS.set(fmt((2 * Math.pow(20 / 9, st.level) + 4 * Math.pow(8 / 9, st.level)) / 6, 3));
      sN(String(st.level));
      sC(fmtInt(n));
    };

    ctx.ui.section('CONSTRUCTION');
    ctx.ui.slider({ label: 'NIVEAU n', min: 0, max: st.max, step: 1, value: st.level, onInput: (v) => ((st.level = v), build()) });
    ctx.ui.toggle({
      label: 'OCCLUSION (LIGNES CACHÉES)',
      value: true,
      onChange: (v) => {
        st.occlude = v;
        if (inst) inst.visible = v;
        (lines.material as THREE.LineBasicMaterial).blending = v ? THREE.NormalBlending : THREE.AdditiveBlending;
        (lines.material as THREE.LineBasicMaterial).opacity = v ? 0.75 : 0.3;
      },
    });
    ctx.ui.section('MESURES');
    const roC = ctx.ui.readout('CUBES 20ⁿ');
    const roV = ctx.ui.readout('VOLUME (20/27)ⁿ');
    const roS = ctx.ui.readout('SURFACE / S₀');
    ctx.ui.note(`Niveau maximal : ${st.max} (qualité ${ctx.quality.toUpperCase()}). Niveau 3 = 8 000 cubes, 96 000 arêtes.`);
    const sN = ctx.hud.stat('NIVEAU', '');
    const sC = ctx.hud.stat('CUBES', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');
    build();
    return {
      update() {
        stage.render();
      },
      resize: (w, h) => stage.resize(w, h),
      dispose() {
        stage.dispose();
        boxGeo.dispose();
        inst?.dispose();
      },
    };
  },
};
