import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { floorGrid, lineMat, occluderMat, paramGridLines, paramMesh } from '../../gfx/materials';
import { compile } from '../../math/parser';
import { UI } from '../../hud/ui';

type Fn = (u: number, v: number, P: Record<string, number>, out: THREE.Vector3) => void;

interface Param {
  key: string;
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
}

interface Surface {
  id: string;
  label: string;
  u: [number, number];
  v: [number, number];
  params: Param[];
  f: Fn;
  tex: string;
  chi: string;
  orientable: string;
  note: string;
}

const TAU = Math.PI * 2;
const S5 = Math.sqrt(5);

// Bryant–Kusner parametrization of Boy's surface, w = r e^{iθ} in the unit disk.
function boy(r: number, th: number, out: THREE.Vector3): void {
  const wr = r * Math.cos(th);
  const wi = r * Math.sin(th);
  // powers of w
  const pow = (n: number): [number, number] => {
    const rn = Math.pow(r, n);
    return [rn * Math.cos(n * th), rn * Math.sin(n * th)];
  };
  const [w3r, w3i] = pow(3);
  const [w4r, w4i] = pow(4);
  const [w6r, w6i] = pow(6);
  const dr = w6r + S5 * w3r - 1;
  const di = w6i + S5 * w3i;
  const dd = dr * dr + di * di;
  const div = (ar: number, ai: number): [number, number] => [(ar * dr + ai * di) / dd, (ai * dr - ar * di) / dd];
  // w(1 - w^4), w(1 + w^4), 1 + w^6
  const mul = (ar: number, ai: number, br: number, bi: number): [number, number] => [ar * br - ai * bi, ar * bi + ai * br];
  const [a1r, a1i] = mul(wr, wi, 1 - w4r, -w4i);
  const [a2r, a2i] = mul(wr, wi, 1 + w4r, w4i);
  const g1 = -1.5 * div(a1r, a1i)[1];
  const g2 = -1.5 * div(a2r, a2i)[0];
  const g3 = div(1 + w6r, w6i)[1] - 0.5;
  const g = g1 * g1 + g2 * g2 + g3 * g3;
  out.set(g1 / g, g3 / g, g2 / g);
}

const SURFACES: Surface[] = [
  {
    id: 'torus',
    label: 'TORE',
    u: [0, TAU],
    v: [0, TAU],
    params: [
      { key: 'R', label: 'GRAND RAYON R', min: 0.6, max: 2, value: 1.1, step: 0.01 },
      { key: 'r', label: 'PETIT RAYON r', min: 0.05, max: 1.2, value: 0.45, step: 0.01 },
    ],
    f: (u, v, P, o) => o.set((P.R + P.r * Math.cos(v)) * Math.cos(u), P.r * Math.sin(v), (P.R + P.r * Math.cos(v)) * Math.sin(u)),
    tex: '\\mathbf{x}(u,v)=\\big((R+r\\cos v)\\cos u,\\;(R+r\\cos v)\\sin u,\\;r\\sin v\\big)',
    chi: '0',
    orientable: 'OUI',
    note: 'Produit de deux cercles. Caractéristique d’Euler χ = 0 : on peut le paver de carrés sans singularité. Quand r > R, le tore se recoupe lui-même (tore « croisé »).',
  },
  {
    id: 'mobius',
    label: 'MÖBIUS',
    u: [0, TAU],
    v: [-1, 1],
    params: [
      { key: 'w', label: 'LARGEUR', min: 0.1, max: 0.9, value: 0.45, step: 0.01 },
      { key: 'k', label: 'DEMI-TORSIONS', min: 1, max: 5, value: 1, step: 1 },
    ],
    f: (u, v, P, o) => {
      const s = v * P.w;
      const a = (P.k * u) / 2;
      o.set((1 + s * Math.cos(a)) * Math.cos(u), s * Math.sin(a), (1 + s * Math.cos(a)) * Math.sin(u));
    },
    tex: '\\mathbf{x}(u,v)=\\Big(\\big(1+v\\cos\\tfrac{ku}{2}\\big)\\cos u,\\;v\\sin\\tfrac{ku}{2},\\;\\big(1+v\\cos\\tfrac{ku}{2}\\big)\\sin u\\Big)',
    chi: '0',
    orientable: 'NON (k impair)',
    note: 'Un ruban qu’on recolle après une demi-torsion : une seule face et un seul bord. Avec un nombre pair de demi-torsions, il redevient orientable (deux faces). Coupé en son milieu, il ne se sépare pas.',
  },
  {
    id: 'klein',
    label: 'KLEIN',
    u: [0, Math.PI],
    v: [0, TAU],
    params: [],
    f: (u, v, _P, o) => {
      const cu = Math.cos(u);
      const su = Math.sin(u);
      const cv = Math.cos(v);
      const sv = Math.sin(v);
      const x = (-2 / 15) * cu * (3 * cv - 30 * su + 90 * cu ** 4 * su - 60 * cu ** 6 * su + 5 * cu * cv * su);
      const y =
        (-1 / 15) * su *
        (3 * cv - 3 * cu ** 2 * cv - 48 * cu ** 4 * cv + 48 * cu ** 6 * cv - 60 * su + 5 * cu * cv * su - 5 * cu ** 3 * cv * su - 80 * cu ** 5 * cv * su + 80 * cu ** 7 * cv * su);
      const z = (2 / 15) * (3 + 5 * cu * su) * sv;
      o.set(x, -y, z);
    },
    tex: '\\chi(K)=0,\\quad K = \\text{deux rubans de Möbius recollés par leur bord}',
    chi: '0',
    orientable: 'NON',
    note: 'Surface fermée sans intérieur ni extérieur. Dans ℝ³ elle doit se traverser elle-même (immersion) ; dans ℝ⁴ elle se plonge sans auto-intersection. Coupée en deux le long de sa symétrie, elle donne deux rubans de Möbius.',
  },
  {
    id: 'klein8',
    label: 'KLEIN « 8 »',
    u: [0, TAU],
    v: [0, TAU],
    params: [{ key: 'a', label: 'RAYON', min: 1.2, max: 3.5, value: 2, step: 0.01 }],
    f: (u, v, P, o) => {
      const h = P.a + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v);
      o.set(h * Math.cos(u), Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v), h * Math.sin(u));
    },
    tex: '\\mathbf{x}=\\big(h\\cos u,\\; \\sin\\tfrac u2\\sin v+\\cos\\tfrac u2\\sin 2v,\\; h\\sin u\\big),\\ h=a+\\cos\\tfrac u2\\sin v-\\sin\\tfrac u2\\sin 2v',
    chi: '0',
    orientable: 'NON',
    note: 'Immersion « en huit » de la bouteille de Klein : un tube dont la section en forme de 8 effectue un demi-tour en faisant le tour. Même surface topologique que la bouteille classique.',
  },
  {
    id: 'boy',
    label: 'BOY',
    u: [0, 1],
    v: [0, TAU],
    params: [],
    f: (r, th, _P, o) => boy(Math.min(r, 0.9999), th, o),
    tex: 'g_1=-\\tfrac32\\,\\mathrm{Im}\\!\\left[\\frac{w(1-w^4)}{w^6+\\sqrt5\\,w^3-1}\\right],\\ \\dots\\quad \\mathbf{x}=\\frac{(g_1,g_2,g_3)}{g_1^2+g_2^2+g_3^2}',
    chi: '1',
    orientable: 'NON',
    note: 'Immersion du plan projectif réel ℝP² (une sphère dont on identifie les points antipodaux) découverte par Werner Boy en 1901. Paramétrage de Bryant–Kusner, w dans le disque unité. Symétrie d’ordre 3, un unique point triple.',
  },
  {
    id: 'custom',
    label: 'PERSO',
    u: [0, TAU],
    v: [0, Math.PI],
    params: [],
    f: (_u, _v, _P, o) => o.set(0, 0, 0),
    tex: '\\mathbf{x}(u,v)=\\big(x(u,v),\\,y(u,v),\\,z(u,v)\\big)',
    chi: '?',
    orientable: '?',
    note: 'Surface paramétrée libre : saisis x(u,v), y(u,v) et z(u,v). Fonctions disponibles : sin, cos, tan, exp, ln, sqrt, abs, pi… Multiplication implicite acceptée (2u, u v).',
  },
];

const CUSTOM_PRESETS: { label: string; x: string; y: string; z: string; u: [number, number]; v: [number, number] }[] = [
  { label: 'SPHÈRE', x: 'cos(u)sin(v)', y: 'cos(v)', z: 'sin(u)sin(v)', u: [0, TAU], v: [0, Math.PI] },
  { label: 'HÉLICOÏDE', x: 'v cos(3u)', y: 'u/2 - 1.5', z: 'v sin(3u)', u: [0, 6], v: [-1, 1] },
  { label: 'SELLE', x: 'u', y: '(u^2 - v^2)/2', z: 'v', u: [-1.4, 1.4], v: [-1.4, 1.4] },
  { label: 'COQUILLAGE', x: '(1.2^u)(sin(v)^2)cos(u)/4', y: '(1.2^u)sin(v)cos(v)/4 + 0.3u/4', z: '(1.2^u)(sin(v)^2)sin(u)/4', u: [-6, 10], v: [0, Math.PI] },
  { label: 'ONDE', x: 'u', y: 'sin(3sqrt(u^2+v^2))/3', z: 'v', u: [-2, 2], v: [-2, 2] },
];

export const surfacesView: VizDef = {
  id: 'surfaces',
  title: 'SURFACES 3D',
  subtitle: 'Tore, ruban de Möbius, bouteille de Klein, surface de Boy et surfaces paramétrées libres, en fil de fer.',
  stage: '3d',
  keywords: ['tore', 'möbius', 'mobius', 'klein', 'boy', 'paramétrique', 'surface', 'topologie', 'non orientable'],
  formula: { tex: SURFACES[0].tex, note: SURFACES[0].note },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.6, 2.0, 3.0], fog: [2.5, 8], rotateSpeed: 0.5 });
    stage.scene.add(floorGrid(3, 0.5, -1.7));
    const group = new THREE.Group();
    stage.scene.add(group);
    const wire = new THREE.LineSegments(new THREE.BufferGeometry(), lineMat(0.6));
    const occ = new THREE.Mesh(new THREE.BufferGeometry(), occluderMat());
    occ.visible = false;
    group.add(occ, wire);

    const st = { id: 'torus', P: {} as Record<string, number>, occlude: false, animate: false, animT: 0 };
    const custom = { x: CUSTOM_PRESETS[0].x, y: CUSTOM_PRESETS[0].y, z: CUSTOM_PRESETS[0].z, u: [...CUSTOM_PRESETS[0].u] as [number, number], v: [...CUSTOM_PRESETS[0].v] as [number, number] };
    let customFns: [(u: number, v: number) => number, (u: number, v: number) => number, (u: number, v: number) => number] | null = null;
    const N = ctx.q(22, 36, 56);

    const sChi = ctx.hud.stat('χ (EULER)', '');
    const sOr = ctx.hud.stat('ORIENTABLE', '');
    const sLines = ctx.hud.stat('LIGNES', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · CLIC DROIT : DÉPLACER · DOUBLE-CLIC : RECENTRER');

    const current = () => SURFACES.find((s) => s.id === st.id)!;

    const rebuild = () => {
      const s = current();
      let f: (u: number, v: number, o: THREE.Vector3) => void;
      let u = s.u;
      let v = s.v;
      if (s.id === 'custom') {
        if (!customFns) return;
        const [fx, fy, fz] = customFns;
        f = (a, b, o) => o.set(fx(a, b), fy(a, b), fz(a, b));
        u = custom.u;
        v = custom.v;
      } else {
        const P = { ...st.P };
        if (st.animate && s.params[0]) {
          const p0 = s.params[0];
          P[p0.key] = p0.min + (p0.max - p0.min) * (0.5 + 0.5 * Math.sin(st.animT));
          if (p0.step >= 1) P[p0.key] = Math.round(P[p0.key]);
        }
        f = (a, b, o) => s.f(a, b, P, o);
      }
      // fit to radius ~1.5
      const box = new THREE.Box3();
      const p = new THREE.Vector3();
      for (let i = 0; i <= 24; i++)
        for (let j = 0; j <= 24; j++) {
          f(u[0] + ((u[1] - u[0]) * i) / 24, v[0] + ((v[1] - v[0]) * j) / 24, p);
          if (Number.isFinite(p.x + p.y + p.z)) box.expandByPoint(p);
        }
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const k = 3 / Math.max(1e-6, size.x, size.y, size.z);
      const g = (a: number, b: number, o: THREE.Vector3) => {
        f(a, b, o);
        o.sub(center).multiplyScalar(k);
      };
      const ratio = s.id === 'mobius' ? 0.35 : s.id === 'boy' ? 0.5 : 1;
      const data = paramGridLines(g, u[0], u[1], v[0], v[1], N, Math.max(6, Math.round(N * ratio)), 4);
      wire.geometry.dispose();
      wire.geometry = new THREE.BufferGeometry();
      wire.geometry.setAttribute('position', new THREE.BufferAttribute(data, 3));
      occ.geometry.dispose();
      occ.geometry = paramMesh(g, u[0], u[1], v[0], v[1], N * 2, Math.max(8, Math.round(N * 2 * ratio)));
      occ.visible = st.occlude;
      (wire.material as THREE.LineBasicMaterial).opacity = st.occlude ? 0.9 : 0.55;
      (wire.material as THREE.LineBasicMaterial).blending = st.occlude ? THREE.NormalBlending : THREE.AdditiveBlending;
      (wire.material as THREE.LineBasicMaterial).needsUpdate = true;
      sLines(String(data.length / 6));
    };

    // ── controls
    ctx.ui.section('SURFACE');
    const surfSeg = ctx.ui.segmented({
      options: SURFACES.map((s) => ({ id: s.id, label: s.label })),
      value: st.id,
      cols: 3,
      onChange: (id) => {
        st.id = id;
        buildParams();
        rebuild();
      },
    });
    const paramBox = ctx.ui.custom(document.createElement('div'));
    ctx.ui.section('RENDU');
    ctx.ui.toggle({
      label: 'OCCLUSION (LIGNES CACHÉES)',
      value: false,
      onChange: (v) => {
        st.occlude = v;
        rebuild();
      },
    });
    const animT = ctx.ui.toggle({ label: 'ANIMER LE 1ᵉʳ PARAMÈTRE', value: false, onChange: (v) => (st.animate = v) });

    const sub = new UI(paramBox);
    function buildParams() {
      const s = current();
      sub.clear();
      sChi(s.chi);
      sOr(s.orientable);
      ctx.setFormula({ tex: s.tex, note: s.note });
      if (s.id === 'custom') {
        sub.section('PARAMÉTRAGE x(u,v), y(u,v), z(u,v)');
        const fields = (['x', 'y', 'z'] as const).map((axis) =>
          sub.formula({
            prefix: `${axis}(u,v) =`,
            value: custom[axis],
            vars: ['u', 'v'],
            onChange: () => {
              custom[axis] = fields[(['x', 'y', 'z'] as const).indexOf(axis)].get();
              compileCustom();
              rebuild();
            },
          }),
        );
        const ranges = [
          sub.slider({ label: 'u MIN', min: -10, max: 10, step: 0.01, value: custom.u[0], onInput: (x) => ((custom.u[0] = x), rebuild()) }),
          sub.slider({ label: 'u MAX', min: -10, max: 10, step: 0.01, value: custom.u[1], onInput: (x) => ((custom.u[1] = x), rebuild()) }),
          sub.slider({ label: 'v MIN', min: -10, max: 10, step: 0.01, value: custom.v[0], onInput: (x) => ((custom.v[0] = x), rebuild()) }),
          sub.slider({ label: 'v MAX', min: -10, max: 10, step: 0.01, value: custom.v[1], onInput: (x) => ((custom.v[1] = x), rebuild()) }),
        ];
        sub.section('EXEMPLES');
        sub.buttons(
          CUSTOM_PRESETS.slice(0, 3).map((p) => ({
            label: p.label,
            onClick: () => applyPreset(p),
          })),
        );
        sub.buttons(CUSTOM_PRESETS.slice(3).map((p) => ({ label: p.label, onClick: () => applyPreset(p) })));
        function applyPreset(p: (typeof CUSTOM_PRESETS)[number]) {
          custom.x = p.x;
          custom.y = p.y;
          custom.z = p.z;
          custom.u = [...p.u];
          custom.v = [...p.v];
          fields[0].set(p.x, true);
          fields[1].set(p.y, true);
          fields[2].set(p.z, true);
          ranges[0].set(p.u[0], true);
          ranges[1].set(p.u[1], true);
          ranges[2].set(p.v[0], true);
          ranges[3].set(p.v[1], true);
          compileCustom();
          rebuild();
        }
        compileCustom();
        return;
      }
      if (s.params.length) sub.section('PARAMÈTRES');
      for (const p of s.params) {
        st.P[p.key] = st.P[p.key] ?? p.value;
        sub.slider({
          label: p.label,
          min: p.min,
          max: p.max,
          step: p.step,
          value: st.P[p.key],
          onInput: (x) => {
            st.P[p.key] = x;
            rebuild();
          },
        });
      }
      sub.note(`χ = <b>${s.chi}</b> · orientable : <b>${s.orientable.toLowerCase()}</b>`);
    }
    function compileCustom() {
      const cs = [custom.x, custom.y, custom.z].map((src) => compile(src, ['u', 'v']));
      if (cs.every((c) => c.ok)) customFns = cs.map((c) => (c.ok ? (c.fn as (u: number, v: number) => number) : () => 0)) as never;
    }

    for (const s of SURFACES) for (const p of s.params) st.P[p.key] = p.value;
    buildParams();
    rebuild();

    let acc = 0;
    return {
      update(_t, dt) {
        if (st.animate && current().params.length) {
          st.animT += dt * 0.8;
          acc += dt;
          if (acc > 1 / 20) {
            acc = 0;
            rebuild();
          }
        }
        stage.render();
      },
      cinematic(t) {
        const seq = ['torus', 'mobius', 'klein', 'boy', 'klein8'];
        const id = seq[Math.floor(t / 5) % seq.length];
        if (id !== st.id) surfSeg.set(id);
        if (!st.animate) animT.set(true);
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
