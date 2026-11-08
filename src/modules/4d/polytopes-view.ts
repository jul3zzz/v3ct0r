import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { floorGrid } from '../../gfx/materials';
import { POLYTOPES, polytope, type PolytopeId } from '../../math/polytopes';
import { PLANES, rotation6, toArgs } from '../../math/linalg4';
import { INK, text, line } from '../../gfx/plot2d';

const VS = /* glsl */ `
attribute float pw;
uniform mat4 uRot;
uniform float uMode;
uniform float uDist;
uniform float uScale;
uniform float uPointSize;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uFar;
varying float vA;
void main() {
  vec4 p = uRot * vec4(position, pw);
  vec3 q;
  float a = 1.0;
  if (uMode < 0.5) {
    q = p.xyz * (uDist / max(0.05, uDist - p.w));
  } else {
    vec4 n = normalize(p);
    q = n.xyz / max(1.0 - n.w, 1e-3);
    a = 1.0 - smoothstep(uFar * 0.45, uFar, length(q));
  }
  q *= uScale;
  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = clamp((-mv.z - uFadeNear) / (uFadeFar - uFadeNear), 0.0, 1.0);
  float wl = 0.5 + 0.5 * clamp(p.w, -1.0, 1.0);
  vA = a * mix(1.0, 0.4, depth) * mix(0.45, 1.0, wl);
  gl_PointSize = uPointSize * (0.6 + 0.9 * wl);
}`;

const FS = /* glsl */ `
uniform float uOpacity;
varying float vA;
void main() {
  gl_FragColor = vec4(vec3(1.0), uOpacity * vA);
}`;

/** GPU material: 4D rotation (mat4) + perspective or stereographic projection in the vertex shader. */
export function make4DMaterial(opacity: number, pointSize = 0): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VS,
    fragmentShader: FS,
    uniforms: {
      uRot: { value: new THREE.Matrix4() },
      uMode: { value: 0 },
      uDist: { value: 3 },
      uScale: { value: 1 },
      uPointSize: { value: pointSize },
      uFadeNear: { value: 2.5 },
      uFadeFar: { value: 7 },
      uFar: { value: 11 },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Edge geometry with each edge subdivided (stereographic edges are curved). */
export function edgeGeometry(verts: Float64Array, edges: Uint32Array, sub: number): THREE.BufferGeometry {
  const E = edges.length / 2;
  const pos = new Float32Array(E * sub * 2 * 3);
  const pw = new Float32Array(E * sub * 2);
  let k = 0;
  for (let e = 0; e < E; e++) {
    const a = edges[2 * e] * 4;
    const b = edges[2 * e + 1] * 4;
    for (let s = 0; s < sub; s++) {
      for (const t of [s / sub, (s + 1) / sub]) {
        pos[k * 3] = verts[a] + (verts[b] - verts[a]) * t;
        pos[k * 3 + 1] = verts[a + 1] + (verts[b + 1] - verts[a + 1]) * t;
        pos[k * 3 + 2] = verts[a + 2] + (verts[b + 2] - verts[a + 2]) * t;
        pw[k] = verts[a + 3] + (verts[b + 3] - verts[a + 3]) * t;
        k++;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('pw', new THREE.BufferAttribute(pw, 1));
  return g;
}

function vertexGeometry(verts: Float64Array): THREE.BufferGeometry {
  const V = verts.length / 4;
  const pos = new Float32Array(V * 3);
  const pw = new Float32Array(V);
  for (let i = 0; i < V; i++) {
    pos.set([verts[i * 4], verts[i * 4 + 1], verts[i * 4 + 2]], i * 3);
    pw[i] = verts[i * 4 + 3];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('pw', new THREE.BufferAttribute(pw, 1));
  return g;
}

const AUTO_SPEED = [0.07, 0.0, 0.31, 0.05, 0.23, 0.17];
const deg = (r: number) => `${Math.round((r * 180) / Math.PI)}°`;

export const polytopesView: VizDef = {
  id: 'polytopes',
  title: 'POLYTOPES 4D',
  subtitle: 'Les six polytopes réguliers convexes de ℝ⁴, tournés dans les six plans puis projetés vers notre espace.',
  stage: '3d',
  keywords: ['tesseract', 'hypercube', '5-cell', '16-cell', '24-cell', '120-cell', '600-cell', 'rotation', 'projection', 'stéréographique'],
  formula: {
    tex: 'R_{xw}(\\theta)=\\begin{pmatrix}\\cos\\theta&0&0&-\\sin\\theta\\\\0&1&0&0\\\\0&0&1&0\\\\\\sin\\theta&0&0&\\cos\\theta\\end{pmatrix}\\qquad P(x,y,z,w)=\\frac{d}{d-w}\\,(x,y,z)',
    note: 'En 4D, on ne tourne pas autour d’un axe mais dans un plan : il y en a C(4,2) = 6 (XY, XZ, XW, YZ, YW, ZW). La projection perspective divise par la distance à l’œil le long de w, d’où le « cube dans le cube ». La stéréographique envoie la 3-sphère sur l’espace en conservant les angles : les arêtes deviennent des arcs de cercle.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [0.4, 1.1, 4.6], fog: false, rotateSpeed: 0.35 });
    stage.scene.add(floorGrid(4, 0.5, -1.9));
    const edgeMat = make4DMaterial(0.85);
    const ptMat = make4DMaterial(0.9, 4 * Math.min(2, ctx.dpr));
    const lines = new THREE.LineSegments(new THREE.BufferGeometry(), edgeMat);
    const points = new THREE.Points(new THREE.BufferGeometry(), ptMat);
    lines.frustumCulled = points.frustumCulled = false;
    stage.scene.add(lines, points);

    const state = { id: '8cell' as PolytopeId, mode: 0, dist: 2.6, auto: true, speed: 1, showPts: true, angles: [0, 0, 0, 0, 0, 0] };
    const sub = ctx.q(8, 14, 20);

    const build = () => {
      const p = polytope(state.id);
      lines.geometry.dispose();
      points.geometry.dispose();
      lines.geometry = edgeGeometry(p.vertices, p.edges, sub);
      points.geometry = vertexGeometry(p.vertices);
      const big = p.counts.v > 100;
      edgeMat.uniforms.uOpacity.value = big ? 0.6 : 1.0;
      ptMat.uniforms.uPointSize.value = (big ? 2 : 4) * Math.min(2, ctx.dpr);
      setInfo();
    };

    // ── controls
    ctx.ui.section('POLYTOPE');
    const sel = ctx.ui.segmented({
      options: POLYTOPES.map((p) => ({ id: p.id, label: p.name })),
      value: state.id,
      cols: 2,
      onChange: (id) => {
        state.id = id;
        build();
      },
    });
    const roS = ctx.ui.readout('SCHLÄFLI');
    const roC = ctx.ui.readout('S · A · F · C');
    const roCell = ctx.ui.readout('CELLULE');
    const roAlias = ctx.ui.readout('NOM');
    ctx.ui.section('PROJECTION 4D → 3D');
    const projSeg = ctx.ui.segmented({
      options: [
        { id: 'persp', label: 'PERSPECTIVE' },
        { id: 'stereo', label: 'STÉRÉOGRAPHIQUE' },
      ],
      value: 'persp',
      onChange: (v) => {
        state.mode = v === 'persp' ? 0 : 1;
        setInfo();
      },
    });
    ctx.ui.slider({ label: 'DISTANCE ŒIL (w)', min: 1.4, max: 6, step: 0.01, value: state.dist, onInput: (v) => (state.dist = v) });
    ctx.ui.section('ROTATIONS — 6 PLANS');
    const autoT = ctx.ui.toggle({ label: 'ROTATION AUTO', value: true, onChange: (v) => (state.auto = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0, max: 3, step: 0.01, value: 1, onInput: (v) => (state.speed = v) });
    const sliders = PLANES.map(([name], k) =>
      ctx.ui.slider({
        label: `PLAN ${name}`,
        min: -Math.PI,
        max: Math.PI,
        step: 0.001,
        value: 0,
        fmt: deg,
        onInput: (v) => (state.angles[k] = v),
      }),
    );
    ctx.ui.buttons([
      {
        label: 'RÉINITIALISER',
        icon: 'reset',
        onClick: () => {
          state.angles.fill(0);
          sliders.forEach((s) => s.set(0, true));
        },
      },
    ]);
    ctx.ui.section('AFFICHAGE');
    ctx.ui.toggle({ label: 'SOMMETS', value: true, onChange: (v) => (points.visible = state.showPts = v) });
    ctx.ui.note('Les arêtes proches de l’œil en <b>w</b> sont plus lumineuses : la luminosité code la 4ᵉ coordonnée.');

    const sProj = ctx.hud.stat('PROJECTION', 'PERSPECTIVE');
    const sSch = ctx.hud.stat('SCHLÄFLI', '');
    const sCount = ctx.hud.stat('S · A · F · C', '');
    const sPlane = ctx.hud.stat('PLANS ACTIFS', '');
    const tagName = ctx.hud.tag('TESSERACT', true);
    ctx.hud.hint('GLISSER : ORBITE 3D · MOLETTE : ZOOM · CLIC DROIT : DÉPLACER · DOUBLE-CLIC : RECENTRER');

    function setInfo() {
      const p = POLYTOPES.find((x) => x.id === state.id)!;
      const c = p.counts;
      roS.set(p.schlafli);
      roC.set(`${c.v} · ${c.e} · ${c.f} · ${c.c}`);
      roCell.set(`${c.c} × ${p.cell}`);
      roAlias.set(p.alias);
      sSch(p.schlafli);
      sCount(`${c.v} · ${c.e} · ${c.f} · ${c.c}`);
      sProj(state.mode ? 'STÉRÉOGRAPHIQUE' : 'PERSPECTIVE');
      tagName(p.name);
    }
    build();

    const rot = new THREE.Matrix4();
    const tmp = new THREE.Vector3();
    let frame = 0;
    let rotNow = rotation6(state.angles);

    const drawGizmo = () => {
      const g = ctx.g;
      const cx = ctx.width - 92;
      const cy = ctx.height - 120;
      const R = 36;
      g.strokeStyle = INK.f10;
      g.strokeRect(Math.round(cx - 52) + 0.5, Math.round(cy - 52) + 0.5, 104, 104);
      text(g, 'AXES 4D', cx - 50, cy - 57, { size: 9, color: INK.f40 });
      const view = stage.camera.matrixWorldInverse;
      ['X', 'Y', 'Z', 'W'].forEach((name, k) => {
        // column k of the 4D rotation = image of e_k
        tmp.set(rotNow[k], rotNow[4 + k], rotNow[8 + k]).transformDirection(view);
        const len = Math.hypot(rotNow[k], rotNow[4 + k], rotNow[8 + k]);
        const x = cx + tmp.x * R * len;
        const y = cy - tmp.y * R * len;
        line(g, cx, cy, x, y, name === 'W' ? INK.fg : INK.f60);
        g.fillStyle = name === 'W' ? INK.fg : INK.f60;
        g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
        text(g, name, x + (x >= cx ? 5 : -11), y + 3, { size: 9, color: name === 'W' ? INK.fg : INK.f60 });
      });
    };

    return {
      update(t, dt) {
        if (state.auto) {
          for (let k = 0; k < 6; k++) {
            state.angles[k] += AUTO_SPEED[k] * state.speed * dt;
            if (state.angles[k] > Math.PI) state.angles[k] -= 2 * Math.PI;
            if (state.angles[k] < -Math.PI) state.angles[k] += 2 * Math.PI;
          }
          if (frame++ % 4 === 0) sliders.forEach((s, k) => s.set(state.angles[k], true));
        }
        rotNow = rotation6(state.angles);
        rot.set(...toArgs(rotNow));
        for (const m of [edgeMat, ptMat]) {
          m.uniforms.uRot.value.copy(rot);
          m.uniforms.uMode.value = state.mode;
          m.uniforms.uDist.value = state.dist;
          m.uniforms.uScale.value = state.mode ? 0.85 : 1.25 * Math.min(1, (state.dist - 1) / state.dist + 0.25);
          const d = stage.camera.position.distanceTo(stage.controls.target);
          m.uniforms.uFadeNear.value = d - 1.5;
          m.uniforms.uFadeFar.value = d + 3;
        }
        if (frame % 15 === 0) sPlane(PLANES.filter((_, k) => Math.abs(state.angles[k]) > 0.01).map(([n]) => n).join(' ') || '—');
        stage.render();
        drawGizmo();
        void t;
      },
      cinematic(t) {
        const seq: [PolytopeId, number][] = [
          ['8cell', 0],
          ['24cell', 0],
          ['600cell', 1],
          ['16cell', 0],
          ['120cell', 1],
        ];
        const [id, mode] = seq[Math.floor(t / 6) % seq.length];
        if (id !== state.id) {
          sel.set(id);
          projSeg.set(mode ? 'stereo' : 'persp');
        }
        if (!state.auto) autoT.set(true);
      },
      resize(w, h) {
        stage.resize(w, h);
      },
      dispose() {
        stage.dispose();
      },
    };
  },
};
