// LEARN home: the curriculum as a 3D graph, in the manner of Obsidian's graph view. Courses are
// wireframe icosahedra, chapters rings, statements dots (shape by kind); membership, prerequisites
// and [[references]] are 1px lines (references dashed). Hovering a node lights it with its
// neighbours and dims the rest; a click selects it (its card goes to the panel), a double-click
// opens it, a double-click on empty space recenters. Brightness follows progress.
import * as THREE from 'three';
import { Stage3D } from '../gfx/stage3d';
import type { VizDef } from '../core/types';
import type { Graph, GNode } from './graph';
import type { Layout } from './layout';
import { STATEMENT_LABEL, type StatementKind } from './types';

export interface GraphHooks {
  graph(): Graph;
  layout(): Layout;
  /** 1 when the node passes the filters */
  visible(): Uint8Array;
  /** brightness of each node from progress (construction 0.35 … done 1) */
  brightness(): Float32Array;
  /** state of a course node: drawn as an icosahedron (ready) or an octahedron (construction), with a core when done */
  courseState(course: string): 'construction' | 'locked' | 'open' | 'done';
  /** bumps when visibility, progress or selection change */
  version(): number;
  /** selected node index, -1 for none */
  selected(): number;
  select(i: number): void;
  open(i: number): void;
  /** a camera flight asked from outside (search, rail, panel), taken once */
  takeFlight(): number | null;
}

/** point shapes: 0 ring, 1 disc, 2 small ring, 3 diamond, 4 small disc */
const SHAPE: Record<StatementKind, number> = { definition: 2, theorem: 1, proposition: 1, lemma: 1, corollary: 1, method: 3, remark: 4, example: 4, proof: 4 };
const SIZE = [12, 8, 8, 8, 5.5];
const PICK = { course: 18, chapter: 11, statement: 8 };
const TAG = (n: GNode): string => (n.kind === 'chapter' ? 'CHAP' : n.stKind ? STATEMENT_LABEL[n.stKind].slice(0, 4) : '');

const VERT = /* glsl */ `
attribute float size;
attribute float alpha;
attribute float shape;
uniform float dpr;
uniform vec2 fogRange;
varying float vA;
varying float vShape;
varying float vSize;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float f = 1.0 - smoothstep(fogRange.x, fogRange.y, depth);
  float s = size * clamp(16.0 / depth, 1.0, 2.0);
  gl_PointSize = s * dpr;
  vSize = s * dpr;
  vShape = shape;
  vA = alpha * (0.2 + 0.8 * f);
}`;

const FRAG = /* glsl */ `
varying float vA;
varying float vShape;
varying float vSize;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float px = 2.0 / max(vSize, 1.0);
  float a;
  if (vShape < 0.5 || (vShape > 1.5 && vShape < 2.5)) {
    float r = length(p);
    a = 1.0 - smoothstep(0.0, px * 1.1, abs(r - (1.0 - px * 1.6)) - px * 0.55);
  } else if (vShape > 2.5 && vShape < 3.5) {
    a = 1.0 - smoothstep(1.0 - px * 1.6, 1.0, abs(p.x) + abs(p.y));
  } else {
    a = 1.0 - smoothstep(1.0 - px * 1.6, 1.0, length(p));
  }
  a *= vA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}`;

export function graphViz(hooks: GraphHooks): VizDef {
  return {
    id: 'learn-graph',
    title: 'GRAPHE DES COURS',
    subtitle: 'Chaque point est un cours, un chapitre ou un énoncé ; chaque trait un lien.',
    stage: '3d',
    formula: { tex: '', note: '' },
    create(ctx) {
      const g = hooks.graph();
      const L = hooks.layout();
      const N = g.nodes.length;
      const P = (i: number) => new THREE.Vector3(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]);

      // home: slightly from above, at the distance where every node fits the viewport
      const lo = [Infinity, Infinity, Infinity];
      const hi = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < N; i++)
        for (let c = 0; c < 3; c++) {
          lo[c] = Math.min(lo[c], L.pos[i * 3 + c]);
          hi[c] = Math.max(hi[c], L.pos[i * 3 + c]);
        }
      const centre = new THREE.Vector3((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2);
      const view = new THREE.Vector3(0.6, 0.32, 0.73).normalize();
      const fit = (aspect: number): number => {
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), view).normalize();
        const up = new THREE.Vector3().crossVectors(view, right);
        const tv = Math.tan((45 * Math.PI) / 360);
        // a pane not laid out yet (0 px wide) is framed as a landscape one; resize() frames it again
        const th = tv * (aspect > 0.05 ? aspect : 1.6);
        let d = 4;
        const rel = new THREE.Vector3();
        for (let i = 0; i < N; i++) {
          rel.set(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]).sub(centre);
          const z = rel.dot(view);
          d = Math.max(d, z + Math.abs(rel.dot(right)) / th, z + Math.abs(rel.dot(up)) / tv);
        }
        return d * 1.08;
      };
      const D = fit(ctx.width / Math.max(1, ctx.height));
      const homeAt = (d: number): [number, number, number] => [centre.x + view.x * d, centre.y + view.y * d, centre.z + view.z * d];
      const fogAt = (d: number): [number, number] => [d * 0.6, d * 1.9];
      const fog = fogAt(D);
      const st = new Stage3D(ctx, { position: homeAt(D), target: [centre.x, centre.y, centre.z], fog, rotateSpeed: 0.25, maxDistance: D * 1.8, minDistance: 0.6, dblclickRecenter: false });

      // ── courses: wireframe solids ──
      const geo = {
        ready: new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.26, 0)),
        construction: new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.2, 0)),
        core: new THREE.OctahedronGeometry(0.09, 0),
      };
      const courses: { i: number; obj: THREE.LineSegments; mat: THREE.LineBasicMaterial; core?: THREE.Mesh; coreMat?: THREE.MeshBasicMaterial }[] = [];
      g.nodes.forEach((n, i) => {
        if (n.kind !== 'course') return;
        const s = hooks.courseState(n.course);
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
        const obj = new THREE.LineSegments(s === 'construction' ? geo.construction : geo.ready, mat);
        obj.position.copy(P(i));
        st.scene.add(obj);
        let core: THREE.Mesh | undefined;
        let coreMat: THREE.MeshBasicMaterial | undefined;
        if (s === 'done') {
          coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
          core = new THREE.Mesh(geo.core, coreMat);
          core.position.copy(obj.position);
          st.scene.add(core);
        }
        courses.push({ i, obj, mat, core, coreMat });
      });

      // ── chapters and statements: one cloud of points ──
      const pts = g.nodes.map((n, i) => i).filter((i) => g.nodes[i].kind !== 'course');
      const pPos = new Float32Array(pts.length * 3);
      const pSize = new Float32Array(pts.length);
      const pAlpha = new Float32Array(pts.length);
      const pShape = new Float32Array(pts.length);
      pts.forEach((i, k) => {
        pPos.set(L.pos.subarray(i * 3, i * 3 + 3), k * 3);
        const n = g.nodes[i];
        pShape[k] = n.kind === 'chapter' ? 0 : SHAPE[n.stKind ?? 'remark'];
        pSize[k] = SIZE[pShape[k]];
      });
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pg.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
      const alphaAttr = new THREE.BufferAttribute(pAlpha, 1);
      pg.setAttribute('alpha', alphaAttr);
      pg.setAttribute('shape', new THREE.BufferAttribute(pShape, 1));
      const pmat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: { dpr: { value: ctx.renderer.getPixelRatio() }, fogRange: { value: new THREE.Vector2(...fog) } },
        transparent: true,
        depthWrite: false,
      });
      st.scene.add(new THREE.Points(pg, pmat));

      // ── edges: membership, prerequisites, references (dashed) ──
      const lines = (['member', 'prereq', 'ref'] as const).map((kind) => {
        const list = g.edges.filter((e) => e.kind === kind);
        const pos = new Float32Array(list.length * 6);
        list.forEach((e, k) => {
          pos.set(L.pos.subarray(e.a * 3, e.a * 3 + 3), k * 6);
          pos.set(L.pos.subarray(e.b * 3, e.b * 3 + 3), k * 6 + 3);
        });
        const lg = new THREE.BufferGeometry();
        lg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const col = new THREE.BufferAttribute(new Float32Array(list.length * 8).fill(1), 4);
        lg.setAttribute('color', col);
        const mat = kind === 'ref' ? new THREE.LineDashedMaterial({ vertexColors: true, transparent: true, dashSize: 0.1, gapSize: 0.07, depthWrite: false }) : new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
        const obj = new THREE.LineSegments(lg, mat);
        if (kind === 'ref') obj.computeLineDistances();
        st.scene.add(obj);
        return { kind, list, col };
      });

      // selection halo, facing the camera
      const halo = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2).getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0))),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
      );
      st.scene.add(halo);

      // ── state → alphas, recomputed only when something changes ──
      let hover = -1;
      let lastKey = '';
      let focusSet: Set<number> | null = null;
      const nodeAlpha = new Float32Array(N);
      const refresh = () => {
        const vis = hooks.visible();
        const br = hooks.brightness();
        const sel = hooks.selected();
        const f = hover >= 0 ? hover : sel;
        focusSet = f >= 0 && vis[f] ? new Set([f, ...g.adj[f]]) : null;
        for (let i = 0; i < N; i++) {
          const n = g.nodes[i];
          const base = br[i] * (n.kind === 'statement' ? 0.7 : n.kind === 'chapter' ? 0.8 : 1);
          // hovering dims the rest strongly; a lasting selection only a little
          nodeAlpha[i] = !vis[i] ? 0 : focusSet ? (focusSet.has(i) ? Math.max(0.75, br[i]) : base * (hover >= 0 ? 0.15 : 0.55)) : base;
        }
        pts.forEach((i, k) => (pAlpha[k] = nodeAlpha[i]));
        alphaAttr.needsUpdate = true;
        for (const c of courses) {
          c.mat.opacity = nodeAlpha[c.i];
          c.obj.visible = c.mat.opacity > 0;
          if (c.core && c.coreMat) {
            c.coreMat.opacity = nodeAlpha[c.i];
            c.core.visible = c.obj.visible;
          }
        }
        const BASE = { member: 0.13, prereq: 0.4, ref: 0.32 };
        const HOT = { member: 0.55, prereq: 0.95, ref: 0.95 };
        for (const l of lines) {
          const a = l.col.array as Float32Array;
          l.list.forEach((e, k) => {
            const on = vis[e.a] && vis[e.b];
            const hot = focusSet && f >= 0 && (e.a === f || e.b === f);
            const v = !on ? 0 : hot ? HOT[l.kind] : focusSet && hover >= 0 ? 0.035 : BASE[l.kind] * Math.min(br[e.a], br[e.b]) ** 0.5 * (focusSet ? 0.6 : 1);
            a[k * 8 + 3] = a[k * 8 + 7] = v;
          });
          l.col.needsUpdate = true;
        }
      };

      // ── picking in screen space ──
      const tmp = new THREE.Vector3();
      const screen = new Float32Array(N * 3);
      const project = () => {
        for (let i = 0; i < N; i++) {
          tmp.set(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]);
          const [x, y, front] = st.project(tmp, tmp);
          screen[i * 3] = x;
          screen[i * 3 + 1] = y;
          screen[i * 3 + 2] = front ? 1 : 0;
        }
      };
      const nearest = (x: number, y: number): number => {
        const vis = hooks.visible();
        let best = -1;
        let bd = 1;
        for (let i = 0; i < N; i++) {
          if (!vis[i] || !screen[i * 3 + 2]) continue;
          const d = Math.hypot(screen[i * 3] - x, screen[i * 3 + 1] - y) / PICK[g.nodes[i].kind];
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        return best;
      };
      const local = (e: MouseEvent): [number, number] => {
        const r = ctx.input.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
      };
      let down: [number, number] | null = null;
      ctx.listen(ctx.input, 'pointerdown', (e: PointerEvent) => (down = local(e)));
      ctx.listen(ctx.input, 'pointerup', (e: PointerEvent) => {
        if (!down) return;
        const [x, y] = local(e);
        if (Math.hypot(x - down[0], y - down[1]) < 5) {
          const i = nearest(x, y);
          if (i >= 0) hooks.select(i);
        }
        down = null;
      });
      ctx.listen(ctx.input, 'dblclick', (e: MouseEvent) => {
        const [x, y] = local(e);
        const i = nearest(x, y);
        if (i >= 0) hooks.open(i);
        else st.recenter();
      });
      ctx.listen(ctx.input, 'pointermove', (e: PointerEvent) => {
        if (e.buttons) return;
        const [x, y] = local(e);
        hover = nearest(x, y);
        ctx.input.style.cursor = hover >= 0 ? 'pointer' : '';
      });
      ctx.listen(ctx.input, 'pointerleave', () => (hover = -1));
      ctx.onDispose(() => (ctx.input.style.cursor = ''));

      const label = (text: string, x: number, y: number, alpha: number, bold = false) => {
        const G = ctx.g;
        G.font = `${bold ? '600 ' : ''}10px "JetBrains Mono", monospace`;
        G.lineWidth = 3;
        G.strokeStyle = `rgba(0,0,0,${Math.min(0.9, alpha + 0.2)})`;
        G.strokeText(text, x, y);
        G.fillStyle = `rgba(255,255,255,${alpha})`;
        G.fillText(text, x, y);
      };

      return {
        update(t) {
          const fl = hooks.takeFlight();
          if (fl !== null && fl >= 0) {
            const n = g.nodes[fl];
            st.flyTo(P(fl), n.kind === 'course' ? Math.min(st.distance, (L.clusters.get(n.course)?.r ?? 1) * 6 + 3) : Math.min(st.distance, 5.5));
          }
          const key = `${hooks.version()}|${hover}`;
          if (key !== lastKey) {
            lastKey = key;
            refresh();
          }
          const sel = hooks.selected();
          for (const c of courses) {
            const hot = c.i === sel || c.i === hover;
            c.obj.rotation.y = t * (c.i === sel ? 0.9 : 0.22);
            c.obj.rotation.x = t * 0.15;
            c.obj.scale.setScalar(hot ? 1.3 + (c.i === sel ? 0.06 * Math.sin(t * 3) : 0) : 1);
            if (c.core) c.core.rotation.y = -t;
          }
          halo.visible = sel >= 0 && nodeAlpha[sel] > 0;
          if (halo.visible) {
            halo.position.copy(P(sel));
            halo.quaternion.copy(st.camera.quaternion);
            const k = g.nodes[sel].kind;
            halo.scale.setScalar((k === 'course' ? 0.44 : k === 'chapter' ? 0.17 : 0.12) * (1 + 0.06 * Math.sin(t * 4)));
          }
          st.render();
          project();

          // labels: the hovered / selected node, its neighbours, the courses, then what is close to the
          // camera; a label that would overlap one already placed is left out
          const G = ctx.g;
          G.textBaseline = 'middle';
          const cam = st.camera.position;
          const cand: { i: number; d: number; rank: number; text: string; a: number }[] = [];
          for (let i = 0; i < N; i++) {
            if (!nodeAlpha[i] || !screen[i * 3 + 2]) continue;
            const n = g.nodes[i];
            const x = screen[i * 3];
            const y = screen[i * 3 + 1];
            if (x < -40 || y < -20 || x > ctx.width + 40 || y > ctx.height + 20) continue;
            const hot = i === sel || i === hover;
            const lit = !!focusSet?.has(i);
            const d = cam.distanceTo(tmp.set(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]));
            const cut = (s: string, k: number) => (hot || s.length <= k ? s : s.slice(0, k - 1) + '…');
            if (n.kind === 'course') {
              const s = hooks.courseState(n.course);
              const tag = s === 'done' ? '✓ ' : s === 'locked' ? '◇ ' : s === 'construction' ? '▲ ' : '● ';
              const a = hot ? 1 : lit ? 0.95 : focusSet && hover >= 0 ? 0.25 : Math.min(0.9, 0.3 + nodeAlpha[i] * 0.65);
              cand.push({ i, d, rank: hot ? 0 : lit ? 1 : 2, text: tag + cut(n.title, lit ? 60 : 26), a });
              continue;
            }
            const reach = n.kind === 'chapter' ? 9 : 5;
            if (!hot && !lit && d >= reach) continue;
            const a = hot ? 1 : lit ? 0.85 : Math.max(0.25, Math.min(0.75, (reach - d) * 0.45));
            cand.push({ i, d, rank: hot ? 0 : lit ? 1 : 3, text: (n.kind === 'chapter' ? '' : `${TAG(n)} `) + cut(n.title, 44), a });
          }
          cand.sort((p, q) => p.rank - q.rank || p.d - q.d);
          const placed: [number, number, number, number][] = [];
          let shown = 0;
          for (const c of cand) {
            if (shown >= 70) break;
            const n = g.nodes[c.i];
            const gap = n.kind === 'course' ? 14 : 9;
            const y = screen[c.i * 3 + 1];
            G.font = `${c.rank === 0 ? '600 ' : ''}10px "JetBrains Mono", monospace`;
            const w = G.measureText(c.text).width;
            const free = (x: number): [number, number, number, number] | null => {
              const box: [number, number, number, number] = [x - 2, y - 7, x + w + 2, y + 7];
              return c.rank === 0 || !placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]) ? box : null;
            };
            // right of the node, else (courses) on its left
            const right = screen[c.i * 3] + gap;
            const left = screen[c.i * 3] - gap - w;
            const box = free(right) ?? (n.kind === 'course' ? free(left) : null);
            if (!box) continue;
            placed.push(box);
            label(c.text, box[0] + 2, y, c.a, c.rank === 0);
            shown++;
          }

          // legend, bottom left
          const lx = 16;
          let ly = ctx.height - 18;
          G.font = '9px "JetBrains Mono", monospace';
          const item = (draw: (x: number, y: number) => void, text: string) => {
            draw(lx + 5, ly);
            G.fillStyle = 'rgba(255,255,255,.5)';
            G.fillText(text, lx + 16, ly);
            ly -= 14;
          };
          G.strokeStyle = 'rgba(255,255,255,.7)';
          G.fillStyle = 'rgba(255,255,255,.7)';
          G.lineWidth = 1;
          item((x, y) => (G.setLineDash([3, 2]), G.beginPath(), G.moveTo(x - 5, y), G.lineTo(x + 6, y), G.stroke(), G.setLineDash([])), 'RENVOI');
          item((x, y) => (G.strokeStyle = 'rgba(255,255,255,.7)', G.beginPath(), G.moveTo(x - 5, y), G.lineTo(x + 6, y), G.stroke()), 'PRÉREQUIS');
          item((x, y) => (G.fillStyle = 'rgba(255,255,255,.7)', G.beginPath(), G.moveTo(x, y - 3.5), G.lineTo(x + 3.5, y), G.lineTo(x, y + 3.5), G.lineTo(x - 3.5, y), G.fill()), 'MÉTHODE');
          item((x, y) => (G.beginPath(), G.arc(x, y, 3, 0, Math.PI * 2), G.stroke()), 'DÉFINITION');
          item((x, y) => (G.fillStyle = 'rgba(255,255,255,.7)', G.beginPath(), G.arc(x, y, 3.2, 0, Math.PI * 2), G.fill()), 'THÉORÈME, PROPOSITION');
          item((x, y) => (G.beginPath(), G.arc(x, y, 5, 0, Math.PI * 2), G.stroke()), 'CHAPITRE');
        },
        resize(w, h) {
          st.resize(w, h);
          // at the new size: the recenter (double-click on empty space) frames the whole graph again,
          // zooming out may reach it, and the fog fades from the same distance
          const d = fit(w / Math.max(1, h));
          st.setHome(homeAt(d), [centre.x, centre.y, centre.z]);
          st.controls.maxDistance = d * 1.8;
          const [near, far] = fogAt(d);
          if (st.scene.fog instanceof THREE.Fog) [st.scene.fog.near, st.scene.fog.far] = [near, far];
          pmat.uniforms.fogRange.value.set(near, far);
          pmat.uniforms.dpr.value = ctx.renderer.getPixelRatio();
        },
        dispose() {
          st.dispose();
        },
      };
    },
  };
}
