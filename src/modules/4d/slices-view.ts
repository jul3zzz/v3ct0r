import * as THREE from 'three';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { axes, lineMat, pointMat, floorGrid } from '../../gfx/materials';
import { polytope, type PolytopeId } from '../../math/polytopes';
import { alignRotation, apply4, mul4, planeRotation, type Mat4, type Vec4 } from '../../math/linalg4';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

type ObjId = 'sphere' | PolytopeId;

const OBJECTS: { id: ObjId; label: string }[] = [
  { id: 'sphere', label: 'HYPERSPHÈRE' },
  { id: '8cell', label: 'TESSERACT' },
  { id: '16cell', label: '16-CELL' },
  { id: '24cell', label: '24-CELL' },
  { id: '5cell', label: '5-CELL' },
  { id: '600cell', label: '600-CELL' },
  { id: '120cell', label: '120-CELL' },
];

const ORIENT: { id: string; label: string; d: Vec4 }[] = [
  { id: 'cell', label: 'CELLULE', d: [0, 0, 0, 1] },
  { id: 'face', label: 'FACE', d: [0, 0, 1, 1] },
  { id: 'edge', label: 'ARÊTE', d: [0, 1, 1, 1] },
  { id: 'vertex', label: 'SOMMET', d: [1, 1, 1, 1] },
];

const MAX_SEG = 6000;

function wireSphere(lat = 12, lon = 18, seg = 64): Float32Array {
  const out: number[] = [];
  for (let i = 1; i < lat; i++) {
    const phi = (Math.PI * i) / lat;
    const y = Math.cos(phi);
    const r = Math.sin(phi);
    for (let k = 0; k < seg; k++) {
      const a0 = (2 * Math.PI * k) / seg;
      const a1 = (2 * Math.PI * (k + 1)) / seg;
      out.push(r * Math.cos(a0), y, r * Math.sin(a0), r * Math.cos(a1), y, r * Math.sin(a1));
    }
  }
  for (let j = 0; j < lon; j++) {
    const a = (2 * Math.PI * j) / lon;
    for (let k = 0; k < seg / 2; k++) {
      const p0 = (Math.PI * k) / (seg / 2);
      const p1 = (Math.PI * (k + 1)) / (seg / 2);
      out.push(Math.sin(p0) * Math.cos(a), Math.cos(p0), Math.sin(p0) * Math.sin(a), Math.sin(p1) * Math.cos(a), Math.cos(p1), Math.sin(p1) * Math.sin(a));
    }
  }
  return new Float32Array(out);
}

export const slicesView: VizDef = {
  id: 'slices',
  title: 'COUPES 4D',
  subtitle: 'Un objet 4D traverse notre espace : on ne voit que sa coupe par l’hyperplan w = c, comme une sphère qui traverse Flatland.',
  stage: '3d',
  keywords: ['coupe', 'section', 'hyperplan', 'flatland', 'hypersphère', 'tesseract', 'traversée'],
  formula: {
    tex: 'H_c=\\{x\\in\\mathbb{R}^4 : \\langle x,n\\rangle=c\\}\\qquad S^3\\cap H_c = S^2\\!\\left(\\sqrt{1-c^2}\\right)',
    note: 'Un être de Flatland voit une sphère qui traverse son plan comme un cercle qui naît, grandit puis disparaît. De même, une hypersphère qui traverse notre espace apparaît comme une sphère de rayon √(1−c²). Un tesseract coupé « par une cellule » donne un cube ; coupé « par un sommet », un tétraèdre qui devient octaèdre.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [2.6, 1.8, 3.2], fog: [3, 9], rotateSpeed: 0.4 });
    stage.scene.add(axes(1.4, 0.25, 0.18), floorGrid(3, 0.5, -1.4));
    const segGeo = new THREE.BufferGeometry();
    const segPos = new Float32Array(MAX_SEG * 6);
    segGeo.setAttribute('position', new THREE.BufferAttribute(segPos, 3));
    const segs = new THREE.LineSegments(segGeo, lineMat(0.95, false));
    const ptGeo = new THREE.BufferGeometry();
    const ptPos = new Float32Array(4096 * 3);
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
    const pts = new THREE.Points(ptGeo, pointMat(4, 1));
    const sphere = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(wireSphere(), 3)), lineMat(0.55));
    segs.frustumCulled = pts.frustumCulled = sphere.frustumCulled = false;
    stage.scene.add(segs, pts, sphere);

    const st = { obj: '8cell' as ObjId, orient: 'cell', c: 0, sweep: true, speed: 0.35, free: false, freeT: 0, phase: 0 };
    let wMin = -1;
    let wMax = 1;
    let stats = { v: 0, e: 0, f: 0, vol: 0 };

    ctx.ui.section('OBJET 4D');
    const objSeg = ctx.ui.segmented({ options: OBJECTS, value: st.obj, cols: 2, onChange: (v) => (st.obj = v) });
    ctx.ui.section('ORIENTATION DE LA COUPE');
    const orSeg = ctx.ui.segmented({ options: ORIENT, value: 'cell', cols: 4, onChange: (v) => (st.orient = v) });
    ctx.ui.note('Direction du 4ᵉ axe par rapport à l’objet : face d’une cellule, d’une face carrée, d’une arête ou d’un sommet en premier.');
    ctx.ui.section('POSITION DE L’HYPERPLAN');
    const cS = ctx.ui.slider({ label: 'w = c', min: -1, max: 1, step: 0.001, value: 0, onInput: (v) => (st.c = v) });
    const sweepT = ctx.ui.toggle({ label: 'TRAVERSÉE AUTOMATIQUE', value: true, onChange: (v) => (st.sweep = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.05, max: 1.5, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.toggle({ label: 'ROTATION LIBRE (XW + YW)', value: false, onChange: (v) => (st.free = v) });
    ctx.ui.section('COUPE OBSERVÉE');
    const roV = ctx.ui.readout('SOMMETS');
    const roE = ctx.ui.readout('ARÊTES');
    const roF = ctx.ui.readout('FACES');
    const roX = ctx.ui.readout('EULER V − A + F');
    const roVol = ctx.ui.readout('VOLUME 3D');

    const sC = ctx.hud.stat('HYPERPLAN', '');
    const sShape = ctx.hud.stat('COUPE', '');
    const sVol = ctx.hud.stat('VOLUME', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    const hull = new ConvexHull();
    const rv: Vec4 = [0, 0, 0, 0];
    let lastKey = '';

    const shapeName = (v: number, e: number, f: number): string => {
      if (v === 0) return '∅ (hors de l’objet)';
      if (v === 1) return 'POINT';
      if (v === 2) return 'SEGMENT';
      if (f <= 1) return `POLYGONE À ${v} CÔTÉS`;
      const known: Record<string, string> = { '4,6,4': 'TÉTRAÈDRE', '8,12,6': 'CUBE / PAVÉ', '6,12,8': 'OCTAÈDRE', '6,9,5': 'PRISME TRIANGULAIRE', '12,18,8': 'OCTAÈDRE TRONQUÉ (PARTIEL)', '24,36,14': 'CUBOCTAÈDRE TRONQUÉ', '12,24,14': 'CUBOCTAÈDRE', '24,48,26': 'RHOMBICUBOCTAÈDRE', '20,30,12': 'DODÉCAÈDRE', '12,30,20': 'ICOSAÈDRE' };
      return known[`${v},${e},${f}`] ?? `POLYÈDRE ${v}·${e}·${f}`;
    };

    const compute = () => {
      const isSphere = st.obj === 'sphere';
      sphere.visible = isSphere;
      segs.visible = pts.visible = !isSphere;
      if (isSphere) {
        wMin = -1;
        wMax = 1;
        const r = Math.sqrt(Math.max(0, 1 - st.c * st.c));
        sphere.scale.setScalar(Math.max(1e-4, r));
        sphere.visible = r > 1e-3;
        stats = { v: 0, e: 0, f: 0, vol: (4 / 3) * Math.PI * r ** 3 };
        return;
      }
      const p = polytope(st.obj as PolytopeId);
      const d = ORIENT.find((o) => o.id === st.orient)!.d;
      let M: Mat4 = alignRotation(d);
      if (st.free) M = mul4(mul4(planeRotation(1, 3, st.freeT * 0.6), planeRotation(0, 3, st.freeT)), M);
      const V = p.vertices.length / 4;
      const rw = new Float64Array(V * 4);
      wMin = Infinity;
      wMax = -Infinity;
      for (let i = 0; i < V; i++) {
        apply4(M, p.vertices.subarray(i * 4, i * 4 + 4), rv);
        rw.set(rv, i * 4);
        wMin = Math.min(wMin, rv[3]);
        wMax = Math.max(wMax, rv[3]);
      }
      const c = st.c;
      const found: THREE.Vector3[] = [];
      const seen = new Map<string, THREE.Vector3>();
      const add = (x: number, y: number, z: number) => {
        const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
        if (seen.has(key)) return;
        const v = new THREE.Vector3(x, y, z);
        seen.set(key, v);
        found.push(v);
      };
      const E = p.edges.length / 2;
      for (let e = 0; e < E; e++) {
        const a = p.edges[2 * e] * 4;
        const b = p.edges[2 * e + 1] * 4;
        const wa = rw[a + 3] - c;
        const wb = rw[b + 3] - c;
        if (Math.abs(wa) < 1e-9) add(rw[a], rw[a + 1], rw[a + 2]);
        if (Math.abs(wb) < 1e-9) add(rw[b], rw[b + 1], rw[b + 2]);
        if (wa * wb < 0) {
          const t = wa / (wa - wb);
          add(rw[a] + (rw[b] - rw[a]) * t, rw[a + 1] + (rw[b + 1] - rw[a + 1]) * t, rw[a + 2] + (rw[b + 2] - rw[a + 2]) * t);
        }
      }
      // edges of the section
      let ns = 0;
      const pushSeg = (a: THREE.Vector3, b: THREE.Vector3) => {
        if (ns >= MAX_SEG) return;
        segPos.set([a.x, a.y, a.z, b.x, b.y, b.z], ns * 6);
        ns++;
      };
      let F = 0;
      let vol = 0;
      if (found.length >= 4 && !coplanar(found)) {
        hull.setFromPoints(found);
        const faces = hull.faces;
        const index = new Map(faces.map((f, i) => [f, i]));
        const planes = new Set<string>();
        const o = new THREE.Vector3();
        found.forEach((v) => o.add(v));
        o.divideScalar(found.length);
        const ab = new THREE.Vector3();
        const ac = new THREE.Vector3();
        for (const f of faces) {
          const n = f.normal;
          planes.add(`${Math.round(n.x * 1e3)},${Math.round(n.y * 1e3)},${Math.round(n.z * 1e3)},${Math.round(f.constant * 1e3)}`);
          let he = f.edge;
          const a = he.tail().point;
          const b = he.head().point;
          const cc = he.next.head().point;
          ab.subVectors(b, o);
          ac.subVectors(cc, o);
          vol += Math.abs(a.clone().sub(o).dot(ab.clone().cross(ac))) / 6;
          do {
            const tw = he.twin;
            if (tw && index.get(f)! < index.get(tw.face)! && n.dot(tw.face.normal) < 0.9999) pushSeg(he.tail().point, he.head().point);
            he = he.next;
          } while (he !== f.edge);
        }
        F = planes.size;
      } else if (found.length >= 3) {
        const ordered = orderPolygon(found);
        ordered.forEach((p0, i) => pushSeg(p0, ordered[(i + 1) % ordered.length]));
        F = 1;
      } else if (found.length === 2) pushSeg(found[0], found[1]);
      segGeo.setDrawRange(0, ns * 2);
      segGeo.attributes.position.needsUpdate = true;
      const np = Math.min(found.length, 4096);
      for (let i = 0; i < np; i++) ptPos.set([found[i].x, found[i].y, found[i].z], i * 3);
      ptGeo.setDrawRange(0, np);
      ptGeo.attributes.position.needsUpdate = true;
      stats = { v: found.length, e: found.length <= 2 ? found.length - 1 : found.length === 3 && F === 1 ? 3 : ns, f: F, vol };
    };

    const drawFlatland = () => {
      const g = ctx.g;
      const W = ctx.width;
      const H = ctx.height;
      const bw = 236;
      const bh = 128;
      const x0 = W - bw - 26;
      const y0 = H - bh - 70;
      g.fillStyle = 'rgba(0,0,0,0.72)';
      g.fillRect(x0, y0, bw, bh);
      g.strokeStyle = INK.f20;
      g.strokeRect(x0 + 0.5, y0 + 0.5, bw, bh);
      text(g, 'ANALOGIE 3D → FLATLAND', x0 + 8, y0 + 14, { size: 9, color: INK.f40 });
      const range = Math.max(Math.abs(wMin), Math.abs(wMax), 1e-6);
      const k = Math.max(-1, Math.min(1, st.c / range));
      const R = 36;
      const cx = x0 + 60;
      const cy = y0 + 72;
      g.strokeStyle = INK.f60;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.stroke();
      const py = cy - k * R;
      line(g, cx - R - 14, py, cx + R + 14, py, INK.fg);
      const half = Math.sqrt(Math.max(0, 1 - k * k)) * R;
      g.fillStyle = INK.fg;
      g.fillRect(Math.round(cx - half), Math.round(py) - 1, Math.round(2 * half), 3);
      text(g, 'SPHÈRE / PLAN', cx, y0 + bh - 8, { size: 9, align: 'center', color: INK.f40 });
      const fx = x0 + 172;
      g.strokeStyle = INK.fg;
      g.beginPath();
      if (half > 0.5) g.arc(fx, cy, half, 0, Math.PI * 2);
      g.stroke();
      line(g, fx - R - 6, cy, fx + R + 6, cy, INK.f10);
      text(g, 'CE QUE VOIT FLATLAND', fx, y0 + bh - 8, { size: 9, align: 'center', color: INK.f40 });
      // w gauge
      const gx = x0 - 18;
      line(g, gx, y0, gx, y0 + bh, INK.f20);
      for (let i = 0; i <= 10; i++) line(g, gx - 2, y0 + (bh * i) / 10, gx + 2, y0 + (bh * i) / 10, INK.f20);
      const gy = y0 + bh / 2 - (st.c / 1.05) * (bh / 2);
      line(g, gx - 8, gy, gx + 8, gy, INK.fg);
      text(g, 'w', gx - 3, y0 - 6, { size: 9, color: INK.f60 });
    };

    let frame = 0;
    return {
      update(t, dt) {
        if (st.sweep) {
          st.phase += dt * st.speed;
          const ext = st.obj === 'sphere' ? 1 : Math.max(Math.abs(wMin), Math.abs(wMax));
          st.c = Math.sin(st.phase) * ext * 1.02;
          if (frame % 3 === 0) cS.set(st.c, true);
        }
        if (st.free) st.freeT += dt * 0.25;
        const key = `${st.obj}|${st.orient}|${st.c.toFixed(5)}|${st.free ? st.freeT.toFixed(4) : 0}`;
        if (key !== lastKey) {
          compute();
          lastKey = key;
        }
        if (frame++ % 6 === 0) {
          const isS = st.obj === 'sphere';
          roV.set(isS ? '∞ (SPHÈRE)' : String(stats.v));
          roE.set(isS ? '—' : String(stats.e));
          roF.set(isS ? '—' : String(stats.f));
          roX.set(isS ? '2' : stats.f > 1 ? String(stats.v - stats.e + stats.f) : '—');
          roVol.set(fmt(stats.vol, 4));
          sC(`w = ${fmt(st.c, 3)}`);
          sShape(isS ? (stats.vol > 0 ? `SPHÈRE r = ${fmt(Math.sqrt(Math.max(0, 1 - st.c * st.c)), 3)}` : '∅') : shapeName(stats.v, stats.e, stats.f));
          sVol(fmt(stats.vol, 4));
        }
        stage.render();
        drawFlatland();
        void t;
      },
      cinematic(t) {
        const seq: [ObjId, string][] = [
          ['sphere', 'cell'],
          ['8cell', 'cell'],
          ['8cell', 'vertex'],
          ['24cell', 'cell'],
          ['600cell', 'vertex'],
        ];
        const [o, or] = seq[Math.floor(t / 6) % seq.length];
        if (o !== st.obj) objSeg.set(o);
        if (or !== st.orient) orSeg.set(or);
        if (!st.sweep) sweepT.set(true);
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

function coplanar(p: THREE.Vector3[]): boolean {
  const a = p[0];
  let n: THREE.Vector3 | null = null;
  for (let i = 1; i < p.length && !n; i++)
    for (let j = i + 1; j < p.length && !n; j++) {
      const c = new THREE.Vector3().subVectors(p[i], a).cross(new THREE.Vector3().subVectors(p[j], a));
      if (c.lengthSq() > 1e-10) n = c.normalize();
    }
  if (!n) return true;
  return p.every((q) => Math.abs(new THREE.Vector3().subVectors(q, a).dot(n!)) < 1e-6);
}

function orderPolygon(p: THREE.Vector3[]): THREE.Vector3[] {
  const c = new THREE.Vector3();
  p.forEach((v) => c.add(v));
  c.divideScalar(p.length);
  const u = new THREE.Vector3().subVectors(p[0], c).normalize();
  let n = new THREE.Vector3();
  for (let i = 1; i < p.length; i++) {
    n = new THREE.Vector3().subVectors(p[i], c).cross(u);
    if (n.lengthSq() > 1e-10) break;
  }
  n.normalize();
  const v = new THREE.Vector3().crossVectors(n, u);
  return p
    .map((q) => {
      const d = new THREE.Vector3().subVectors(q, c);
      return { q, a: Math.atan2(d.dot(v), d.dot(u)) };
    })
    .sort((x, y) => x.a - y.a)
    .map((x) => x.q);
}
