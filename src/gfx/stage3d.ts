import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { VizContext } from '../core/types';

export interface Stage3DOptions {
  fov?: number;
  position?: [number, number, number];
  target?: [number, number, number];
  /** Linear fog to black = depth cueing for white lines. [near, far] or false. */
  fog?: [number, number] | false;
  autoRotate?: boolean;
  rotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  enablePan?: boolean;
  /** double-click recenters the camera (default true; off when the view uses double-click itself) */
  dblclickRecenter?: boolean;
}

/** Scene + perspective camera + orbit controls (drag: orbit, wheel: zoom, right-drag: pan,
 *  double-click: recenter). Rotates slowly when idle. */
export class Stage3D {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private homePos: THREE.Vector3;
  private homeTarget: THREE.Vector3;
  private idleAt = 0;
  private anim: { t0: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; ms: number } | null = null;
  autoRotate: boolean;

  constructor(private ctx: VizContext, opts: Stage3DOptions = {}) {
    this.camera = new THREE.PerspectiveCamera(opts.fov ?? 45, ctx.width / Math.max(1, ctx.height), 0.01, 500);
    const p = opts.position ?? [3.2, 2.2, 3.2];
    const t = opts.target ?? [0, 0, 0];
    this.camera.position.set(...p);
    this.homePos = new THREE.Vector3(...p);
    this.homeTarget = new THREE.Vector3(...t);
    this.controls = new OrbitControls(this.camera, ctx.input);
    this.controls.target.copy(this.homeTarget);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.enablePan = opts.enablePan ?? true;
    this.controls.minDistance = opts.minDistance ?? 0.3;
    this.controls.maxDistance = opts.maxDistance ?? 60;
    this.autoRotate = opts.autoRotate ?? true;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = opts.rotateSpeed ?? 0.55;
    this.controls.update();
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
      this.anim = null;
      ctx.input.classList.add('grabbing');
    });
    this.controls.addEventListener('end', () => {
      this.idleAt = performance.now();
      ctx.input.classList.remove('grabbing');
    });
    if (opts.fog !== false) {
      const [near, far] = opts.fog ?? [p.length ? Math.hypot(...p) * 0.6 : 3, Math.hypot(...p) * 2.2];
      this.scene.fog = new THREE.Fog(0x000000, near, far);
    }
    ctx.input.classList.add('grab');
    if (opts.dblclickRecenter !== false) ctx.listen(ctx.input, 'dblclick', () => this.recenter());
    ctx.onDispose(() => {
      ctx.input.classList.remove('grab', 'grabbing');
    });
  }

  recenter(): void {
    this.anim = { t0: performance.now(), fromP: this.camera.position.clone(), fromT: this.controls.target.clone(), toP: this.homePos.clone(), toT: this.homeTarget.clone(), ms: 650 };
  }

  /** glide the orbit centre to `target`, the camera keeping its direction, at `distance` (default: the current one) */
  flyTo(target: THREE.Vector3, distance?: number, ms = 900): void {
    const dir = this.camera.position.clone().sub(this.controls.target);
    const d = distance ?? dir.length();
    dir.normalize().multiplyScalar(d);
    this.controls.autoRotate = false;
    this.idleAt = performance.now();
    this.anim = { t0: performance.now(), fromP: this.camera.position.clone(), fromT: this.controls.target.clone(), toP: target.clone().add(dir), toT: target.clone(), ms };
  }

  /** distance from the camera to the orbit centre */
  get distance(): number {
    return this.camera.position.distanceTo(this.controls.target);
  }

  setHome(pos: [number, number, number], target: [number, number, number] = [0, 0, 0]): void {
    this.homePos.set(...pos);
    this.homeTarget.set(...target);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  /** Project a world point to viewport CSS pixels. */
  project(v: THREE.Vector3, out: THREE.Vector3 = new THREE.Vector3()): [number, number, boolean] {
    out.copy(v).project(this.camera);
    return [(out.x * 0.5 + 0.5) * this.ctx.width, (-out.y * 0.5 + 0.5) * this.ctx.height, out.z < 1];
  }

  render(): void {
    this.updateControls();
    this.ctx.renderer.render(this.scene, this.camera);
  }

  /** Advance recenter animation, idle auto-rotation and damping (without rendering the scene). */
  updateControls(): void {
    const now = performance.now();
    if (this.anim) {
      const k = Math.min(1, (now - this.anim.t0) / this.anim.ms);
      const e = 1 - Math.pow(1 - k, 3);
      this.camera.position.lerpVectors(this.anim.fromP, this.anim.toP, e);
      this.controls.target.lerpVectors(this.anim.fromT, this.anim.toT, e);
      if (k >= 1) {
        this.anim = null;
        this.idleAt = now;
      }
    }
    if (!this.controls.autoRotate && this.autoRotate && !this.anim && now - this.idleAt > 4000) this.controls.autoRotate = true;
    if (!this.autoRotate) this.controls.autoRotate = false;
    this.controls.update();
    this.camera.updateMatrixWorld();
  }

  dispose(): void {
    this.controls.dispose();
    disposeTree(this.scene);
  }
}

export function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose?.();
  });
}
