import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { axes, floorGrid, pointMat } from '../../gfx/materials';
import { fmt } from '../../hud/dom';
import { UI } from '../../hud/ui';
import { boxCounting } from './common';

type V3 = [number, number, number];

interface Attractor {
  id: string;
  label: string;
  params: { key: string; label: string; min: number; max: number; value: number }[];
  f: (p: V3, P: Record<string, number>, out: V3) => void;
  dt: number;
  /** maps model coordinates to scene (y up) */
  view: (p: V3, out: THREE.Vector3) => void;
  init: V3;
  ref: string;
  tex: string;
  note: string;
}

const ATTRACTORS: Attractor[] = [
  {
    id: 'lorenz',
    label: 'LORENZ',
    params: [
      { key: 's', label: 'σ', min: 1, max: 20, value: 10 },
      { key: 'r', label: 'ρ', min: 1, max: 60, value: 28 },
      { key: 'b', label: 'β', min: 0.5, max: 5, value: 8 / 3 },
    ],
    f: ([x, y, z], P, o) => {
      o[0] = P.s * (y - x);
      o[1] = x * (P.r - z) - y;
      o[2] = x * y - P.b * z;
    },
    dt: 0.004,
    view: ([x, y, z], o) => o.set(x / 16, (z - 25) / 16, y / 16),
    init: [1, 1, 1],
    ref: '≈ 2,06 (RÉF.)',
    tex: '\\dot x=\\sigma(y-x),\\quad \\dot y=x(\\rho-z)-y,\\quad \\dot z=xy-\\beta z',
    note: 'Edward Lorenz (1963) a simplifié un modèle de convection atmosphérique en trois équations. Pour σ = 10, ρ = 28, β = 8/3 les trajectoires ne se répètent jamais et deux départs très proches divergent exponentiellement : c’est l’« effet papillon ». L’attracteur a une dimension voisine de 2,06.',
  },
  {
    id: 'rossler',
    label: 'RÖSSLER',
    params: [
      { key: 'a', label: 'a', min: 0.05, max: 0.4, value: 0.2 },
      { key: 'b', label: 'b', min: 0.05, max: 2, value: 0.2 },
      { key: 'c', label: 'c', min: 2, max: 12, value: 5.7 },
    ],
    f: ([x, y, z], P, o) => {
      o[0] = -y - z;
      o[1] = x + P.a * y;
      o[2] = P.b + z * (x - P.c);
    },
    dt: 0.012,
    view: ([x, y, z], o) => o.set(x / 10, (z - 4) / 10, y / 10),
    init: [0.1, 0, 0],
    ref: '≈ 2,01 (RÉF.)',
    tex: '\\dot x=-y-z,\\quad \\dot y=x+ay,\\quad \\dot z=b+z(x-c)',
    note: 'Otto Rössler (1976) cherchait le système chaotique le plus simple : une seule non-linéarité (zx). La trajectoire tourne en spirale dans le plan xy puis est soulevée et repliée par z : un mécanisme d’étirement-repliement typique du chaos.',
  },
  {
    id: 'aizawa',
    label: 'AIZAWA',
    params: [
      { key: 'a', label: 'a', min: 0.5, max: 1.2, value: 0.95 },
      { key: 'c', label: 'c', min: 0.3, max: 0.9, value: 0.6 },
      { key: 'd', label: 'd', min: 2, max: 4.5, value: 3.5 },
    ],
    f: ([x, y, z], P, o) => {
      const b = 0.7;
      const e = 0.25;
      const ff = 0.1;
      o[0] = (z - b) * x - P.d * y;
      o[1] = P.d * x + (z - b) * y;
      o[2] = P.c + P.a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + ff * z * x * x * x;
    },
    dt: 0.008,
    view: ([x, y, z], o) => o.set(x * 0.9, (z - 0.6) * 0.9, y * 0.9),
    init: [0.1, 0, 0],
    ref: 'ESTIMÉE',
    tex: '\\dot x=(z-b)x-dy,\\ \\dot y=dx+(z-b)y,\\ \\dot z=c+az-\\tfrac{z^3}{3}-(x^2+y^2)(1+ez)+fzx^3',
    note: 'Un attracteur en forme de sphère percée d’un tube axial (b = 0,7 ; e = 0,25 ; f = 0,1). Les trajectoires enroulent la surface puis s’échappent par le tube central. Sa dimension n’est pas tabulée : elle est estimée ici par comptage de boîtes.',
  },
];

function rk4(A: Attractor, p: V3, P: Record<string, number>, dt: number): void {
  const k1: V3 = [0, 0, 0];
  const k2: V3 = [0, 0, 0];
  const k3: V3 = [0, 0, 0];
  const k4: V3 = [0, 0, 0];
  const t: V3 = [0, 0, 0];
  A.f(p, P, k1);
  for (let i = 0; i < 3; i++) t[i] = p[i] + (dt / 2) * k1[i];
  A.f(t, P, k2);
  for (let i = 0; i < 3; i++) t[i] = p[i] + (dt / 2) * k2[i];
  A.f(t, P, k3);
  for (let i = 0; i < 3; i++) t[i] = p[i] + dt * k3[i];
  A.f(t, P, k4);
  for (let i = 0; i < 3; i++) p[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
}

export const attractorsView: VizDef = {
  id: 'attractors',
  title: 'ATTRACTEURS ÉTRANGES',
  subtitle: 'Lorenz, Rössler, Aizawa intégrés en temps réel (Runge-Kutta 4) : des trajectoires qui ne se répètent jamais.',
  stage: '3d',
  keywords: ['lorenz', 'rössler', 'rossler', 'aizawa', 'chaos', 'papillon', 'attracteur'],
  formula: { tex: ATTRACTORS[0].tex, note: ATTRACTORS[0].note },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.4, 1.3, 2.8], fog: [2.5, 8], rotateSpeed: 0.4 });
    stage.scene.add(floorGrid(3, 0.5, -1.4), axes(1.2, 0.2, 0.12));
    const P_COUNT = ctx.q(6, 10, 16);
    const L = ctx.q(1500, 3000, 5000);
    const st = { id: 'lorenz', P: {} as Record<string, number>, speed: 1, spread: 1e-3 };
    for (const a of ATTRACTORS) for (const p of a.params) st.P[a.id + p.key] = p.value;
    const trails: { p: V3; buf: Float32Array; n: number; line: THREE.Line }[] = [];
    const heads = new THREE.Points(new THREE.BufferGeometry(), pointMat(4, 1));
    heads.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P_COUNT * 3), 3));
    heads.frustumCulled = false;
    stage.scene.add(heads);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < P_COUNT; i++) {
      const buf = new Float32Array(L * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
      geo.setDrawRange(0, 0);
      const op = 0.25 + 0.55 * (1 - i / P_COUNT);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
      line.frustumCulled = false;
      stage.scene.add(line);
      trails.push({ p: [0, 0, 0], buf, n: 0, line });
    }
    const cur = () => ATTRACTORS.find((a) => a.id === st.id)!;
    const params = () => {
      const a = cur();
      const out: Record<string, number> = {};
      for (const p of a.params) out[p.key] = st.P[a.id + p.key];
      return out;
    };
    let dimText = 'calcul…';
    let dimTimer = 0;
    const estimate = () => {
      const a = cur();
      const P = params();
      const p: V3 = [...a.init];
      for (let i = 0; i < 3000; i++) rk4(a, p, P, a.dt);
      const n = ctx.q(30000, 60000, 90000);
      const pts = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        rk4(a, p, P, a.dt * 2);
        if (!Number.isFinite(p[0] + p[1] + p[2])) {
          dimText = 'DIVERGE';
          return;
        }
        pts.set(p, i * 3);
      }
      const d = boxCounting(pts, 3, n, 3, 6).d;
      dimText = Number.isFinite(d) ? fmt(d, 2) : '—';
    };
    const reset = () => {
      const a = cur();
      trails.forEach((t, i) => {
        t.p = [a.init[0] + i * st.spread, a.init[1], a.init[2]];
        t.n = 0;
        t.line.geometry.setDrawRange(0, 0);
      });
      dimText = 'calcul…';
      dimTimer = 0.3;
      ctx.setFormula({ tex: a.tex, note: a.note });
    };

    ctx.ui.section('SYSTÈME');
    const sel = ctx.ui.segmented({
      options: ATTRACTORS.map((a) => ({ id: a.id, label: a.label })),
      value: st.id,
      onChange: (id) => {
        st.id = id;
        buildParams();
        reset();
      },
    });
    const box = ctx.ui.custom(document.createElement('div'));
    const sub = new UI(box);
    ctx.ui.section('SIMULATION');
    ctx.ui.slider({ label: 'VITESSE', min: 0.1, max: 4, step: 0.01, value: 1, onInput: (v) => (st.speed = v) });
    ctx.ui.slider({ label: 'ÉCART INITIAL (LOG)', min: 1e-9, max: 0.5, log: true, value: st.spread, fmt: (v) => v.toExponential(0).replace('e', 'e'), onInput: (v) => ((st.spread = v), reset()) });
    ctx.ui.note(`${P_COUNT} trajectoires partent de points voisins : l’écart initial grandit de façon exponentielle (sensibilité aux conditions initiales).`);
    ctx.ui.buttons([{ label: 'RELANCER', icon: 'reset', onClick: reset }]);
    const roD = ctx.ui.readout('DIM. BOX-COUNTING');
    const roRef = ctx.ui.readout('DIMENSION RÉF.');
    const sSys = ctx.hud.stat('SYSTÈME', '');
    const sSep = ctx.hud.stat('ÉCART 1 ↔ 2', '');
    const tag = ctx.hud.tag('', true);
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    function buildParams() {
      const a = cur();
      sub.clear();
      sub.section('PARAMÈTRES');
      for (const p of a.params)
        sub.slider({
          label: p.label,
          min: p.min,
          max: p.max,
          step: 0.001,
          value: st.P[a.id + p.key],
          onInput: (v) => {
            st.P[a.id + p.key] = v;
            dimTimer = 0.6;
            dimText = 'calcul…';
          },
        });
      sSys(a.label);
      roRef.set(a.ref);
    }
    buildParams();
    reset();

    const hp = heads.geometry.attributes.position as THREE.BufferAttribute;
    let frame = 0;
    return {
      update(_t, dt) {
        const a = cur();
        const P = params();
        const steps = Math.max(1, Math.round(st.speed * 3 * (dt > 0 ? Math.min(dt * 60, 3) : 0)));
        for (const tr of trails) {
          for (let s = 0; s < steps; s++) {
            rk4(a, tr.p, P, a.dt);
            if (!Number.isFinite(tr.p[0] + tr.p[1] + tr.p[2]) || Math.abs(tr.p[0]) > 1e4) tr.p = [...a.init] as V3;
            a.view(tr.p, tmp);
            if (tr.n < L) {
              tr.buf.set([tmp.x, tmp.y, tmp.z], tr.n * 3);
              tr.n++;
            } else {
              tr.buf.copyWithin(0, 3);
              tr.buf.set([tmp.x, tmp.y, tmp.z], (L - 1) * 3);
            }
          }
          tr.line.geometry.setDrawRange(0, tr.n);
          tr.line.geometry.attributes.position.needsUpdate = true;
        }
        trails.forEach((tr, i) => {
          const k = Math.max(0, tr.n - 1) * 3;
          hp.setXYZ(i, tr.buf[k], tr.buf[k + 1], tr.buf[k + 2]);
        });
        hp.needsUpdate = true;
        if (dimTimer > 0) {
          dimTimer -= dt || 0.016;
          if (dimTimer <= 0) estimate();
        }
        if (frame++ % 8 === 0) {
          const p0 = trails[0].p;
          const p1 = trails[1].p;
          sSep(Math.hypot(p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]).toExponential(2).replace('.', ','));
          roD.set(dimText);
          tag(`DIM. BOX-COUNTING ≈ ${dimText} · ${a.ref}`);
        }
        stage.render();
      },
      cinematic(t) {
        const id = ATTRACTORS[Math.floor(t / 8) % ATTRACTORS.length].id;
        if (id !== st.id) sel.set(id);
      },
      resize: (w, h) => stage.resize(w, h),
      dispose: () => stage.dispose(),
    };
  },
};
