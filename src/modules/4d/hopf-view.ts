import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { floorGrid } from '../../gfx/materials';
import { rotation6, toArgs } from '../../math/linalg4';
import { make4DMaterial } from './polytopes-view';
import { INK, text } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';

/** Closed 4D loops → line-segment geometry (xyz in `position`, w in `pw`). */
function loopsGeometry(loops: number[][][]): THREE.BufferGeometry {
  let n = 0;
  for (const l of loops) n += l.length;
  const pos = new Float32Array(n * 2 * 3);
  const pw = new Float32Array(n * 2);
  let k = 0;
  for (const l of loops)
    for (let i = 0; i < l.length; i++) {
      for (const p of [l[i], l[(i + 1) % l.length]]) {
        pos[k * 3] = p[0];
        pos[k * 3 + 1] = p[1];
        pos[k * 3 + 2] = p[2];
        pw[k] = p[3];
        k++;
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('pw', new THREE.BufferAttribute(pw, 1));
  return g;
}

/** Hopf fiber over the point of S² with polar angle θ = 2η and longitude φ. */
function fiber(eta: number, phi: number, samples: number): number[][] {
  const out: number[][] = [];
  const ce = Math.cos(eta);
  const se = Math.sin(eta);
  for (let i = 0; i < samples; i++) {
    const t = (2 * Math.PI * i) / samples;
    out.push([ce * Math.cos(t), ce * Math.sin(t), se * Math.cos(t + phi), se * Math.sin(t + phi)]);
  }
  return out;
}

export const hopfView: VizDef = {
  id: 'hopf',
  title: 'FIBRATION DE HOPF',
  subtitle: 'La 3-sphère découpée en cercles qui s’enlacent tous deux à deux. Chaque cercle correspond à un point de la sphère ordinaire.',
  stage: '3d',
  keywords: ['hopf', 'fibration', 'clifford', 'tore', '3-sphère', 'villarceau', 'cercles enlacés', 'quaternions'],
  formula: {
    tex: 'h:S^3\\to S^2,\\quad h(z_1,z_2)=\\big(2z_1\\overline{z_2},\\ |z_1|^2-|z_2|^2\\big),\\qquad h^{-1}(p)\\simeq S^1',
    note: 'On voit S³ comme les couples (z₁, z₂) de complexes avec |z₁|² + |z₂|² = 1. L’application de Hopf (1931) envoie chaque point sur la sphère S² ; tous les points d’une même fibre forment un grand cercle. Deux fibres quelconques sont enlacées une fois. Les fibres au-dessus d’un parallèle de S² remplissent un tore de Clifford, ici projeté stéréographiquement.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [0.6, 1.6, 4.4], fog: false, rotateSpeed: 0.3 });
    stage.scene.add(floorGrid(4, 0.5, -2));
    const fiberMat = make4DMaterial(0.85);
    const gridMat = make4DMaterial(0.22);
    const fibers = new THREE.LineSegments(new THREE.BufferGeometry(), fiberMat);
    const grid = new THREE.LineSegments(new THREE.BufferGeometry(), gridMat);
    fibers.frustumCulled = grid.frustumCulled = false;
    stage.scene.add(grid, fibers);
    const st = { mode: 'fibration', rings: 4, per: 16, spread: 0.6, speed: 0.6, angles: [0, 0, 0, 0, 0, 0] };
    const S = ctx.q(64, 96, 140);
    let count = 0;
    let base: [number, number][] = [];

    const build = () => {
      const loops: number[][][] = [];
      base = [];
      if (st.mode === 'fibration') {
        for (let r = 0; r < st.rings; r++) {
          const theta = Math.PI / 2 + (st.rings === 1 ? 0 : (r / (st.rings - 1) - 0.5) * Math.PI * st.spread);
          for (let k = 0; k < st.per; k++) {
            const phi = (2 * Math.PI * k) / st.per + r * 0.3;
            loops.push(fiber(theta / 2, phi, S));
            base.push([theta, phi]);
          }
        }
        grid.visible = false;
      } else {
        // Clifford torus |z1| = |z2| = 1/√2 : grid in (α, β) + Villarceau fibers α = t, β = t + φ
        const g: number[][][] = [];
        const r = Math.SQRT1_2;
        const m = 24;
        for (let a = 0; a < m; a++) {
          const al = (2 * Math.PI * a) / m;
          g.push(Array.from({ length: S }, (_, i) => {
            const be = (2 * Math.PI * i) / S;
            return [r * Math.cos(al), r * Math.sin(al), r * Math.cos(be), r * Math.sin(be)];
          }));
          g.push(Array.from({ length: S }, (_, i) => {
            const be = (2 * Math.PI * i) / S;
            return [r * Math.cos(be), r * Math.sin(be), r * Math.cos(al), r * Math.sin(al)];
          }));
        }
        grid.geometry.dispose();
        grid.geometry = loopsGeometry(g);
        grid.visible = true;
        for (let k = 0; k < st.per; k++) {
          const phi = (2 * Math.PI * k) / st.per;
          loops.push(fiber(Math.PI / 4, phi, S));
          base.push([Math.PI / 2, phi]);
        }
      }
      fibers.geometry.dispose();
      fibers.geometry = loopsGeometry(loops);
      count = loops.length;
      sN(fmtInt(count));
    };

    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'fibration', label: 'FIBRATION' },
        { id: 'clifford', label: 'TORE DE CLIFFORD' },
      ],
      value: st.mode,
      onChange: (v) => {
        st.mode = v;
        build();
      },
    });
    ctx.ui.section('FIBRES');
    ctx.ui.slider({ label: 'PARALLÈLES SUR S²', min: 1, max: 7, step: 1, value: st.rings, onInput: (v) => ((st.rings = v), build()) });
    ctx.ui.slider({ label: 'FIBRES PAR PARALLÈLE', min: 3, max: 48, step: 1, value: st.per, onInput: (v) => ((st.per = v), build()) });
    ctx.ui.slider({ label: 'ÉCART DES PARALLÈLES', min: 0.1, max: 0.98, step: 0.01, value: st.spread, onInput: (v) => ((st.spread = v), build()) });
    ctx.ui.section('ROTATION 4D');
    ctx.ui.slider({ label: 'VITESSE', min: 0, max: 2, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.note('Chaque cercle est une fibre : un seul point de S² (médaillon). Les fibres d’un même parallèle tracent un tore ; deux fibres sont toujours enlacées.');
    const sN = ctx.hud.stat('FIBRES', '');
    const sA = ctx.hud.stat('ROTATION', '');
    ctx.hud.tag('PROJECTION STÉRÉOGRAPHIQUE S³ → ℝ³', true);
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');
    build();

    const rot = new THREE.Matrix4();
    let frame = 0;
    return {
      update(_t, dt) {
        st.angles[1] += dt * 0.11 * st.speed; // XZ
        st.angles[4] += dt * 0.11 * st.speed; // YW (isoclinic with XZ: preserves the fibration)
        st.angles[2] += dt * 0.04 * st.speed; // XW: slow drift
        rot.set(...toArgs(rotation6(st.angles)));
        const d = stage.camera.position.distanceTo(stage.controls.target);
        for (const m of [fiberMat, gridMat]) {
          m.uniforms.uRot.value.copy(rot);
          m.uniforms.uMode.value = 1;
          m.uniforms.uScale.value = 0.85;
          m.uniforms.uFar.value = 4.2;
          m.uniforms.uFadeNear.value = d - 1.5;
          m.uniforms.uFadeFar.value = d + 4;
        }
        stage.render();
        // base S² inset
        const g = ctx.g;
        const cx = ctx.width - 100;
        const cy = ctx.height - 130;
        const R = 46;
        g.strokeStyle = INK.f40;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
        g.strokeStyle = INK.f20;
        g.stroke();
        text(g, 'ESPACE DE BASE S²', cx - R, cy - R - 10, { size: 10, color: INK.f80 });
        const spin = st.angles[1];
        for (const [theta, phi] of base) {
          const x = Math.sin(theta) * Math.cos(phi + spin);
          const y = Math.cos(theta);
          const z = Math.sin(theta) * Math.sin(phi + spin);
          const front = z > -0.2;
          g.fillStyle = front ? INK.fg : INK.f40;
          g.fillRect(Math.round(cx + x * R) - 1, Math.round(cy - (y * 0.96 + z * 0.28) * R) - 1, front ? 3 : 2, front ? 3 : 2);
        }
        if (frame++ % 10 === 0) sA(`${fmt(((st.angles[1] * 180) / Math.PI) % 360, 0)}°`);
      },
      cinematic(t) {
        const m = Math.floor(t / 8) % 2 ? 'clifford' : 'fibration';
        if (m !== st.mode) modeSeg.set(m);
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => stage.dispose(),
    };
  },
};
