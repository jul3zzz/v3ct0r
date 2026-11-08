import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { Stage3D } from '../../gfx/stage3d';
import { lineMat, floorGrid } from '../../gfx/materials';
import { INK } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';
import { rng } from './common';

const A: [number, number] = [-1, -0.62];
const B: [number, number] = [1, -0.62];
const C: [number, number] = [0, 1.112];

export const sierpinskiView: VizDef = {
  id: 'sierpinski',
  title: 'TRIANGLE DE SIERPINSKI',
  subtitle: 'On retire le triangle central, puis on recommence dans chacun des trois restants — ou on joue au « jeu du chaos ».',
  stage: '2d',
  hausdorff: 'ln 3 / ln 2 ≈ 1,585',
  keywords: ['sierpinski', 'jeu du chaos', 'chaos game', 'triangle', 'autosimilaire'],
  formula: {
    tex: 'N = 3,\\ r=\\tfrac12 \\;\\Rightarrow\\; D=\\frac{\\ln N}{\\ln(1/r)}=\\frac{\\ln 3}{\\ln 2}\\approx 1{,}585,\\qquad \\text{aire}_n=\\left(\\tfrac34\\right)^n\\to 0',
    note: 'L’objet est fait de 3 copies de lui-même réduites de moitié : sa dimension de similarité vaut ln 3 / ln 2. Son aire tend vers 0 alors que son périmètre tend vers l’infini. Le jeu du chaos (aller à mi-chemin d’un sommet tiré au hasard, répéter) converge vers le même ensemble.',
  },
  create(ctx) {
    const pz = new PanZoom(ctx, { scale: 0.005, minScale: 1e-7 });
    pz.fit(-1.05, 1.05, -0.7, 1.17, 50);
    const st = { mode: 'rec', depth: 0, maxDepth: ctx.q(7, 8, 9), auto: true, timer: 0, grow: 1 };
    const buf = document.createElement('canvas');
    const bg = buf.getContext('2d')!;
    let chaosN = 0;
    let lastView = '';
    const rand = rng(7);
    let px = 0.1;
    let py = 0.1;

    ctx.ui.section('CONSTRUCTION');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'rec', label: 'RÉCURSIVE' },
        { id: 'chaos', label: 'JEU DU CHAOS' },
      ],
      value: 'rec',
      onChange: (v) => {
        st.mode = v;
        chaosN = 0;
        lastView = '';
      },
    });
    const dS = ctx.ui.slider({ label: 'PROFONDEUR n', min: 0, max: st.maxDepth, step: 1, value: 0, onInput: (v) => ((st.depth = v), (st.grow = 0)) });
    ctx.ui.toggle({ label: 'CONSTRUCTION AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('MESURES');
    const roT = ctx.ui.readout('TRIANGLES 3ⁿ');
    const roA = ctx.ui.readout('AIRE (3/4)ⁿ');
    const roP = ctx.ui.readout('PÉRIMÈTRE (3/2)ⁿ');
    const sN = ctx.hud.stat('n', '');
    const sCount = ctx.hud.stat('ÉLÉMENTS', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    const tri = (g: CanvasRenderingContext2D, a: number[], b: number[], c: number[], d: number) => {
      if (d === 0) {
        g.moveTo(pz.sx(a[0]), pz.sy(a[1]));
        g.lineTo(pz.sx(b[0]), pz.sy(b[1]));
        g.lineTo(pz.sx(c[0]), pz.sy(c[1]));
        g.closePath();
        return;
      }
      const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
      const ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
      tri(g, a, ab, ca, d - 1);
      tri(g, ab, b, bc, d - 1);
      tri(g, ca, bc, c, d - 1);
    };

    return {
      update(_t, dt) {
        pz.tick();
        const g = ctx.g;
        if (st.mode === 'rec') {
          if (st.auto) {
            st.timer += dt;
            if (st.timer > 1.4) {
              st.timer = 0;
              st.depth = st.depth >= st.maxDepth ? 0 : st.depth + 1;
              st.grow = 0;
              dS.set(st.depth, true);
            }
          }
          st.grow = Math.min(1, st.grow + dt * 2.5);
          if (st.depth > 0) {
            g.beginPath();
            tri(g, A, B, C, st.depth - 1);
            g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - st.grow) + 0.1})`;
            g.lineWidth = 1;
            g.stroke();
          }
          g.beginPath();
          tri(g, A, B, C, st.depth);
          g.strokeStyle = `rgba(255,255,255,${0.25 + 0.65 * st.grow})`;
          g.stroke();
          g.fillStyle = 'rgba(255,255,255,0.04)';
          g.fill();
        } else {
          const W = Math.round(ctx.width * ctx.dpr);
          const H = Math.round(ctx.height * ctx.dpr);
          const view = `${pz.cx}|${pz.cy}|${pz.scale}|${W}x${H}`;
          if (view !== lastView) {
            buf.width = W;
            buf.height = H;
            bg.fillStyle = '#000';
            bg.fillRect(0, 0, W, H);
            chaosN = 0;
            lastView = view;
          }
          bg.fillStyle = 'rgba(255,255,255,0.55)';
          const V = [A, B, C];
          const k = ctx.q(2000, 5000, 10000);
          for (let i = 0; i < k && chaosN < 2e6; i++) {
            const v = V[(rand() * 3) | 0];
            px = (px + v[0]) / 2;
            py = (py + v[1]) / 2;
            bg.fillRect(Math.round(pz.sx(px) * ctx.dpr), Math.round(pz.sy(py) * ctx.dpr), 1, 1);
            chaosN++;
          }
          g.drawImage(buf, 0, 0, ctx.width, ctx.height);
          // vertices
          g.fillStyle = INK.fg;
          for (const v of V) g.fillRect(Math.round(pz.sx(v[0])) - 2, Math.round(pz.sy(v[1])) - 2, 5, 5);
        }
        const n = st.depth;
        roT.set(fmtInt(3 ** n));
        roA.set(fmt(0.75 ** n, 5));
        roP.set(fmt(1.5 ** n, 3));
        sN(st.mode === 'rec' ? String(n) : '∞');
        sCount(st.mode === 'rec' ? `${fmtInt(3 ** n)} TRIANGLES` : `${fmtInt(chaosN)} POINTS`);
      },
      cinematic(t) {
        const m = Math.floor(t / 9) % 2 ? 'chaos' : 'rec';
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};

export const tetraView: VizDef = {
  id: 'sierpinski3d',
  title: 'TÉTRAÈDRE DE SIERPINSKI',
  subtitle: 'Version 3D : quatre copies demi-taille d’un tétraèdre. Sa dimension vaut exactement 2 — c’est pourtant un objet de l’espace.',
  stage: '3d',
  hausdorff: 'ln 4 / ln 2 = 2',
  keywords: ['sierpinski', 'tétraèdre', 'tetrix', '3d'],
  formula: {
    tex: 'N=4,\\ r=\\tfrac12\\ \\Rightarrow\\ D=\\frac{\\ln 4}{\\ln 2}=2,\\qquad V_n=\\left(\\tfrac12\\right)^n V_0',
    note: 'À chaque étape, chaque tétraèdre est remplacé par 4 tétraèdres deux fois plus petits : le volume est divisé par 2 à chaque étape et tend vers 0. La surface, elle, reste constante, ce qui est cohérent avec une dimension exactement égale à 2.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.2, 1.4, 2.6], fog: [2, 7] });
    stage.scene.add(floorGrid(3, 0.5, -1.1));
    const lines = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.7));
    stage.scene.add(lines);
    const st = { depth: 0, max: ctx.q(5, 6, 6), auto: true, timer: 0, grow: 1 };
    const v0 = [
      new THREE.Vector3(0, 1.1, 0),
      new THREE.Vector3(-1, -0.6, -0.577),
      new THREE.Vector3(1, -0.6, -0.577),
      new THREE.Vector3(0, -0.6, 1.155),
    ];
    const build = () => {
      const out: number[] = [];
      const rec = (p: THREE.Vector3[], d: number) => {
        if (d === 0) {
          for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) out.push(p[i].x, p[i].y, p[i].z, p[j].x, p[j].y, p[j].z);
          return;
        }
        for (let k = 0; k < 4; k++) rec(p.map((q) => q.clone().add(p[k]).multiplyScalar(0.5)), d - 1);
      };
      rec(v0, st.depth);
      lines.geometry.dispose();
      lines.geometry = new THREE.BufferGeometry();
      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
    };
    ctx.ui.section('CONSTRUCTION');
    const dS = ctx.ui.slider({ label: 'PROFONDEUR n', min: 0, max: st.max, step: 1, value: 0, onInput: (v) => ((st.depth = v), build()) });
    ctx.ui.toggle({ label: 'CONSTRUCTION AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('MESURES');
    const roT = ctx.ui.readout('TÉTRAÈDRES 4ⁿ');
    const roV = ctx.ui.readout('VOLUME (1/2)ⁿ');
    const roS = ctx.ui.readout('SURFACE');
    const sN = ctx.hud.stat('n', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');
    build();
    return {
      update(_t, dt) {
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.6) {
            st.timer = 0;
            st.depth = st.depth >= st.max ? 0 : st.depth + 1;
            dS.set(st.depth, true);
            build();
            st.grow = 0;
          }
        }
        st.grow = Math.min(1, st.grow + dt * 2);
        (lines.material as THREE.LineBasicMaterial).opacity = (0.25 + 0.6 * st.grow) * (st.depth > 4 ? 0.6 : 1);
        roT.set(fmtInt(4 ** st.depth));
        roV.set(fmt(0.5 ** st.depth, 5));
        roS.set('CONSTANTE');
        sN(String(st.depth));
        stage.render();
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => stage.dispose(),
    };
  },
};
