// LEARN home: the curriculum as a 3D wireframe graph. One ring per level, one node per course,
// prerequisites as edges. Click a node to select it, double-click to open the course.
import * as THREE from 'three';
import { Stage3D } from '../gfx/stage3d';
import type { VizDef } from '../core/types';
import type { Level } from './types';

export interface TreeNode {
  id: string;
  title: string;
  short: string;
  level: Level;
  /** construction: plan only · locked: prerequisites missing · open · done */
  state: 'construction' | 'locked' | 'open' | 'done';
  prerequisites: string[];
}

export interface TreeHooks {
  nodes(): TreeNode[];
  selected(): string;
  select(id: string): void;
  open(id: string): void;
}

// intros are not part of the tree (they live in the rail list); their entries are never used
const LEVEL_Y: Record<Level, number> = { intro: -3.3, demo: -3.3, prepa: -1.9, master: 0.5, doctorat: 2.9 };
const LEVEL_R: Record<Level, number> = { intro: 0, demo: 0, prepa: 3.9, master: 3.4, doctorat: 2.5 };
const LEVEL_NAME: Record<Level, string> = { intro: '', demo: '', prepa: 'PRÉPA MPSI/MP', master: 'LICENCE / MASTER', doctorat: 'DOCTORAT' };

export function treeViz(hooks: TreeHooks): VizDef {
  return {
    id: 'tree',
    title: 'ARBRE DES COURS',
    subtitle: 'Chaque nœud est un cours, chaque arête un prérequis.',
    stage: '3d',
    formula: { tex: '', note: '' },
    create(ctx) {
      const st = new Stage3D(ctx, { position: [7.5, 3.2, 7.5], target: [0, -0.2, 0], fog: [6, 22], rotateSpeed: 0.35, maxDistance: 26 });
      const nodes = hooks.nodes();
      const byLevel = new Map<Level, TreeNode[]>();
      for (const n of nodes) byLevel.set(n.level, [...(byLevel.get(n.level) ?? []), n]);
      const pos = new Map<string, THREE.Vector3>();
      for (const [lv, list] of byLevel) {
        list.forEach((n, i) => {
          const r = LEVEL_R[lv];
          const a = (i / list.length) * Math.PI * 2 + (lv === 'master' ? 0.4 : lv === 'doctorat' ? 0.9 : 0);
          pos.set(n.id, new THREE.Vector3(r * Math.cos(a), LEVEL_Y[lv], r * Math.sin(a)));
        });
        if (LEVEL_R[lv] > 0) {
          const ring = new THREE.EllipseCurve(0, 0, LEVEL_R[lv], LEVEL_R[lv], 0, Math.PI * 2).getPoints(128);
          const g = new THREE.BufferGeometry().setFromPoints(ring.map((p) => new THREE.Vector3(p.x, LEVEL_Y[lv], p.y)));
          st.scene.add(new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })));
        }
      }
      // central spine
      const spine = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.6, 0), new THREE.Vector3(0, 3.6, 0)]);
      st.scene.add(new THREE.Line(spine, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })));

      const geo = {
        ready: new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.24, 0)),
        construction: new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.2, 0)),
        core: new THREE.OctahedronGeometry(0.09, 0),
      };
      const meshes = new Map<string, { obj: THREE.LineSegments; mat: THREE.LineBasicMaterial; core?: THREE.Mesh }>();
      for (const n of nodes) {
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
        const obj = new THREE.LineSegments(n.state === 'construction' ? geo.construction : geo.ready, mat);
        obj.position.copy(pos.get(n.id)!);
        st.scene.add(obj);
        let core: THREE.Mesh | undefined;
        if (n.state === 'done') {
          core = new THREE.Mesh(geo.core, new THREE.MeshBasicMaterial({ color: 0xffffff }));
          core.position.copy(obj.position);
          st.scene.add(core);
        }
        meshes.set(n.id, { obj, mat, core });
      }
      const edges: { a: string; b: string; mat: THREE.LineBasicMaterial }[] = [];
      for (const n of nodes)
        for (const p of n.prerequisites) {
          const A = pos.get(p);
          const B = pos.get(n.id);
          if (!A || !B) continue;
          const mid = A.clone().add(B).multiplyScalar(0.5).multiplyScalar(0.82);
          const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
          const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
          st.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)), mat));
          edges.push({ a: p, b: n.id, mat });
        }
      const halo = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 0.42, 0.42, 0, Math.PI * 2).getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0))), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
      st.scene.add(halo);

      // picking in screen space
      const tmp = new THREE.Vector3();
      const nearest = (x: number, y: number): string | null => {
        let best: string | null = null;
        let bd = 28;
        for (const [id, p] of pos) {
          const [sx, sy, vis] = st.project(p, tmp);
          const d = Math.hypot(sx - x, sy - y);
          if (vis && d < bd) {
            bd = d;
            best = id;
          }
        }
        return best;
      };
      let down: [number, number] | null = null;
      let hover: string | null = null;
      const local = (e: MouseEvent): [number, number] => {
        const r = ctx.input.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
      };
      ctx.listen(ctx.input, 'pointerdown', (e: PointerEvent) => (down = local(e)));
      ctx.listen(ctx.input, 'pointerup', (e: PointerEvent) => {
        if (!down) return;
        const [x, y] = local(e);
        if (Math.hypot(x - down[0], y - down[1]) < 5) {
          const id = nearest(x, y);
          if (id) hooks.select(id);
        }
        down = null;
      });
      ctx.listen(ctx.input, 'dblclick', (e: MouseEvent) => {
        const [x, y] = local(e);
        const id = nearest(x, y);
        if (id) hooks.open(id);
      });
      ctx.listen(ctx.input, 'pointermove', (e: PointerEvent) => {
        const [x, y] = local(e);
        hover = nearest(x, y);
        ctx.input.style.cursor = hover ? 'pointer' : '';
      });
      ctx.onDispose(() => (ctx.input.style.cursor = ''));

      return {
        update(t) {
          const sel = hooks.selected();
          const related = new Set<string>([sel]);
          for (const e of edges) if (e.a === sel || e.b === sel) related.add(e.a === sel ? e.b : e.a);
          for (const n of nodes) {
            const m = meshes.get(n.id)!;
            const base = n.state === 'construction' ? 0.3 : n.state === 'locked' ? 0.45 : 1;
            m.mat.opacity = related.has(n.id) || n.id === hover ? Math.max(base, 0.9) : base * 0.85;
            m.obj.rotation.y = t * (n.id === sel ? 0.9 : 0.25);
            m.obj.rotation.x = t * 0.17;
            const s = n.id === sel ? 1.35 + 0.08 * Math.sin(t * 3) : n.id === hover ? 1.2 : 1;
            m.obj.scale.setScalar(s);
            if (m.core) m.core.rotation.y = -t;
          }
          for (const e of edges) e.mat.opacity = e.a === sel || e.b === sel ? 0.85 : 0.16;
          const sp = pos.get(sel);
          halo.visible = !!sp;
          if (sp) {
            halo.position.copy(sp);
            halo.quaternion.copy(st.camera.quaternion);
            halo.scale.setScalar(1 + 0.06 * Math.sin(t * 4));
          }
          st.render();
          // labels
          const g = ctx.g;
          g.font = '10px "JetBrains Mono", monospace';
          g.textBaseline = 'middle';
          for (const n of nodes) {
            const [x, y, vis] = st.project(pos.get(n.id)!, tmp);
            if (!vis) continue;
            const hot = n.id === sel || n.id === hover;
            g.fillStyle = hot ? '#fff' : n.state === 'construction' ? 'rgba(255,255,255,.38)' : n.state === 'locked' ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.78)';
            const tag = n.state === 'done' ? '✓ ' : n.state === 'locked' ? '◇ ' : n.state === 'construction' ? '▲ ' : '● ';
            g.fillText(tag + (hot ? n.title : n.short), x + 14, y);
          }
          g.font = '9px "JetBrains Mono", monospace';
          g.fillStyle = 'rgba(255,255,255,.42)';
          for (const lv of ['prepa', 'master', 'doctorat'] as Level[]) {
            const [x, y, vis] = st.project(new THREE.Vector3(LEVEL_R[lv] + 0.2, LEVEL_Y[lv] + 0.32, 0), tmp);
            if (vis) g.fillText(`[ ${LEVEL_NAME[lv]} ]`, x, y);
          }
        },
        resize(w, h) {
          st.resize(w, h);
        },
        dispose() {
          st.dispose();
        },
      };
    },
  };
}
