// ATLAS geometry, white on black: planet emblems (each echoes its view: a tesseract, a torus,
// a Lorenz curve…), spiral galaxies of points, the star field, the speed dust, the ship.
import * as THREE from 'three';
import type { Emblem } from './world';

const WHITE = 0xffffff;
export const lineMat = (opacity = 1) => new THREE.LineBasicMaterial({ color: WHITE, transparent: opacity < 1, opacity });
const pointsMat = (size: number, opacity = 1, vertexColors = false) => new THREE.PointsMaterial({ color: WHITE, size, sizeAttenuation: true, transparent: true, opacity, vertexColors, depthWrite: false });

const edges = (g: THREE.BufferGeometry, opacity = 1) => new THREE.LineSegments(new THREE.EdgesGeometry(g), lineMat(opacity));
const wire = (g: THREE.BufferGeometry, opacity = 1) => new THREE.LineSegments(new THREE.WireframeGeometry(g), lineMat(opacity));
const loop = (pts: THREE.Vector3[], opacity = 1) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat(opacity));
const circle = (r: number, n = 96, y = 0) => Array.from({ length: n }, (_, i) => new THREE.Vector3(r * Math.cos((i / n) * Math.PI * 2), y, r * Math.sin((i / n) * Math.PI * 2)));

/** deterministic random */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** latitude / longitude sphere */
function gridSphere(r: number, lat = 6, lon = 10, opacity = 0.8): THREE.Group {
  const g = new THREE.Group();
  for (let i = 1; i < lat; i++) {
    const phi = (i / lat) * Math.PI;
    g.add(loop(circle(r * Math.sin(phi), 48, r * Math.cos(phi)), opacity));
  }
  for (let j = 0; j < lon; j++) {
    const a = (j / lon) * Math.PI;
    const pts = Array.from({ length: 49 }, (_, k) => {
      const t = (k / 48) * Math.PI * 2;
      return new THREE.Vector3(r * Math.sin(t) * Math.cos(a), r * Math.cos(t), r * Math.sin(t) * Math.sin(a));
    });
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(opacity * 0.7)));
  }
  return g;
}

/** points evenly spread on a sphere (Fibonacci) */
function fibSphere(r: number, n: number): THREE.BufferGeometry {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    p.set([r * rr * Math.cos(a), r * y, r * rr * Math.sin(a)], i * 3);
  }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3));
}

/** The planet of a view: a wireframe emblem of what the view shows. */
export function emblem(kind: Emblem, r: number): THREE.Group {
  const g = new THREE.Group();
  switch (kind) {
    case 'grid':
      g.add(gridSphere(r));
      break;
    case 'icosa':
      g.add(edges(new THREE.IcosahedronGeometry(r, 1)));
      g.add(edges(new THREE.IcosahedronGeometry(r * 0.45, 0), 0.6));
      break;
    case 'octa':
      g.add(edges(new THREE.OctahedronGeometry(r, 0), 0.55));
      break;
    case 'torus':
      g.add(wire(new THREE.TorusGeometry(r * 0.75, r * 0.3, 8, 22), 0.7));
      break;
    case 'knot':
      g.add(wire(new THREE.TorusKnotGeometry(r * 0.6, r * 0.13, 64, 5, 2, 3), 0.6));
      break;
    case 'cube':
      g.add(edges(new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4)));
      g.add(edges(new THREE.BoxGeometry(r * 0.5, r * 0.5, r * 0.5), 0.6));
      break;
    case 'tesseract': {
      // a cube inside a cube, the corners joined: the shadow of the 4D cube
      const a = r * 0.75;
      const b = r * 0.36;
      g.add(edges(new THREE.BoxGeometry(a * 2, a * 2, a * 2)));
      g.add(edges(new THREE.BoxGeometry(b * 2, b * 2, b * 2)));
      const seg: number[] = [];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) seg.push(sx * a, sy * a, sz * a, sx * b, sy * b, sz * b);
      g.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(seg, 3)), lineMat(0.7)));
      break;
    }
    case 'tetra': {
      // a Sierpiński tetrahedron, two levels
      const T = (c: THREE.Vector3, s: number, d: number) => {
        if (d === 0) {
          const t = edges(new THREE.TetrahedronGeometry(s, 0));
          t.position.copy(c);
          g.add(t);
          return;
        }
        const v = [
          [1, 1, 1],
          [-1, -1, 1],
          [-1, 1, -1],
          [1, -1, -1],
        ];
        for (const [x, y, z] of v) T(c.clone().add(new THREE.Vector3(x, y, z).multiplyScalar(s / Math.sqrt(3) / 2)), s / 2, d - 1);
      };
      T(new THREE.Vector3(), r * 1.2, 2);
      break;
    }
    case 'points':
      g.add(new THREE.Points(fibSphere(r, 700), pointsMat(0.35 + r * 0.03, 0.9)));
      break;
    case 'rings': {
      g.add(edges(new THREE.IcosahedronGeometry(r * 0.7, 1), 0.85));
      for (const [k, op] of [
        [1.25, 0.8],
        [1.55, 0.5],
        [1.8, 0.3],
      ] as const)
        g.add(loop(circle(r * k, 96), op));
      g.rotation.x = 0.35;
      break;
    }
    case 'spiral': {
      // a golden spiral disc
      const pts: THREE.Vector3[] = [];
      for (let t = 0; t < 4 * Math.PI; t += 0.05) {
        const rr = r * 0.08 * Math.exp(0.306 * t);
        pts.push(new THREE.Vector3(rr * Math.cos(t), 0, rr * Math.sin(t)));
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat()));
      g.add(loop(circle(r * 1.05, 96), 0.35));
      g.add(edges(new THREE.IcosahedronGeometry(r * 0.25, 0)));
      break;
    }
    case 'station': {
      // an orbital station: a core cube, a docking ring, solar wings
      g.add(edges(new THREE.BoxGeometry(r * 0.7, r * 0.7, r * 0.7)));
      g.add(loop(circle(r * 1.2, 48), 0.9));
      const ring2 = loop(circle(r * 0.9, 48), 0.5);
      ring2.rotation.z = Math.PI / 2;
      g.add(ring2);
      for (const s of [-1, 1]) {
        const wing = edges(new THREE.BoxGeometry(r * 1.1, r * 0.05, r * 0.5), 0.8);
        wing.position.x = s * r * 1.9;
        g.add(wing);
        const strut = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(s * r * 0.35, 0, 0), new THREE.Vector3(s * r * 1.35, 0, 0)]), lineMat(0.7));
        g.add(strut);
      }
      break;
    }
    case 'lorenz': {
      // a few thousand steps of the Lorenz system, scaled to the planet
      const pts: THREE.Vector3[] = [];
      let x = 0.1;
      let y = 0;
      let z = 0;
      for (let i = 0; i < 3000; i++) {
        const dt = 0.008;
        const dx = 10 * (y - x);
        const dy = x * (28 - z) - y;
        const dz = x * y - (8 / 3) * z;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        if (i > 100) pts.push(new THREE.Vector3(x, z - 25, y).multiplyScalar(r / 26));
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.8)));
      break;
    }
  }
  return g;
}

/** a spiral galaxy of points (arms = 0: a ring galaxy, for the ACADÉMIE) */
export function galaxy(radius: number, arms: number, seed: number, n = 2600): THREE.Group {
  const r = rng(seed);
  const p = new Float32Array(n * 3);
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x: number;
    let y: number;
    let z: number;
    if (arms === 0) {
      const ring = 0.35 + Math.floor(r() * 3) * 0.28;
      const a = r() * Math.PI * 2;
      const d = radius * (ring + (r() - 0.5) * 0.06);
      [x, y, z] = [d * Math.cos(a), (r() - 0.5) * radius * 0.04, d * Math.sin(a)];
    } else {
      const t = Math.pow(r(), 0.7);
      const arm = Math.floor(r() * arms);
      const a = (arm / arms) * Math.PI * 2 + t * 4.2 + (r() - 0.5) * (0.5 - t * 0.3);
      const d = radius * t;
      [x, y, z] = [d * Math.cos(a), (r() - 0.5) * radius * 0.08 * (1 - t), d * Math.sin(a)];
    }
    p.set([x, y, z], i * 3);
    const b = 0.35 + 0.65 * Math.pow(1 - Math.hypot(x, z) / radius, 1.5) + r() * 0.2;
    c.set([b, b, b], i * 3);
  }
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3)).setAttribute('color', new THREE.BufferAttribute(c, 3));
  const g = new THREE.Group();
  g.add(new THREE.Points(geo, pointsMat(1.6, 1, true)));
  // bright core
  g.add(new THREE.Points(fibSphere(radius * 0.06, 240), pointsMat(1.4, 0.9)));
  g.add(loop(circle(radius * 1.08, 128), 0.12));
  return g;
}

/** far stars on a large sphere (they move with the ship: infinite depth) */
export function starField(n: number, radius: number, seed = 1): THREE.Points {
  const r = rng(seed);
  const p = new Float32Array(n * 3);
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    p.set([radius * s * Math.cos(a), radius * u, radius * s * Math.sin(a)], i * 3);
    const b = 0.25 + Math.pow(r(), 3) * 0.75;
    c.set([b, b, b], i * 3);
  }
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3)).setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false });
  return new THREE.Points(geo, m);
}

/** Dust around the ship: drawn as streaks along the velocity (speed lines, light speed). */
export class Dust {
  readonly lines: THREE.LineSegments;
  private pos: Float32Array;
  private seg: Float32Array;
  private col: Float32Array;
  constructor(
    readonly n: number,
    readonly box: number,
    seed = 3,
  ) {
    const r = rng(seed);
    this.pos = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) this.pos[i] = (r() - 0.5) * box;
    this.seg = new Float32Array(n * 6);
    this.col = new Float32Array(n * 6);
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(this.seg, 3)).setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, fog: false }));
    this.lines.frustumCulled = false;
  }

  /** Wrap the dust around `center`; each grain is a streak of length |vel|·stretch along −vel. */
  update(center: THREE.Vector3, vel: THREE.Vector3, stretch: number, bright: number): void {
    const h = this.box / 2;
    const L = Math.min(this.box * 0.9, vel.length() * stretch);
    const dir = vel.lengthSq() > 1e-6 ? vel.clone().normalize() : new THREE.Vector3(0, 0, -1);
    for (let i = 0; i < this.n; i++) {
      for (let k = 0; k < 3; k++) {
        const c = k === 0 ? center.x : k === 1 ? center.y : center.z;
        let v = this.pos[i * 3 + k];
        v = ((((v - c + h) % this.box) + this.box) % this.box) - h + c;
        this.pos[i * 3 + k] = v;
      }
      const x = this.pos[i * 3];
      const y = this.pos[i * 3 + 1];
      const z = this.pos[i * 3 + 2];
      this.seg.set([x, y, z, x - dir.x * L, y - dir.y * L, z - dir.z * L], i * 6);
      // fade with distance to the ship (no hard edge at the box border)
      const d = Math.hypot(x - center.x, y - center.y, z - center.z) / h;
      const b = Math.max(0, 1 - d) * bright;
      this.col.set([b, b, b, b * 0.15, b * 0.15, b * 0.15], i * 6);
    }
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
  }
}

/** The ship: an arcade wireframe fighter. Nose towards −z. Returns the group and its nozzles. */
export function ship(): { group: THREE.Group; nozzles: THREE.Vector3[]; flame: THREE.Points } {
  const g = new THREE.Group();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const nose = V(0, 0, -3.2);
  const top = V(0, 0.55, 0.4);
  const bottom = V(0, -0.35, 0.6);
  const tailL = V(-0.55, 0.05, 1.6);
  const tailR = V(0.55, 0.05, 1.6);
  const wingL = V(-2.4, -0.1, 1.4);
  const wingR = V(2.4, -0.1, 1.4);
  const finTop = V(0, 1.25, 1.7);
  const seg = (...pairs: [THREE.Vector3, THREE.Vector3][]) => {
    const arr: number[] = [];
    for (const [a, b] of pairs) arr.push(a.x, a.y, a.z, b.x, b.y, b.z);
    return new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)), lineMat());
  };
  g.add(
    seg(
      [nose, top],
      [nose, bottom],
      [nose, tailL],
      [nose, tailR],
      [top, tailL],
      [top, tailR],
      [bottom, tailL],
      [bottom, tailR],
      [tailL, tailR],
      // wings
      [V(-0.4, -0.05, -0.6), wingL],
      [wingL, tailL],
      [V(0.4, -0.05, -0.6), wingR],
      [wingR, tailR],
      [wingL, V(-2.4, 0.35, 1.0)],
      [wingR, V(2.4, 0.35, 1.0)],
      // fin
      [top, finTop],
      [finTop, V(0, 0.3, 1.65)],
      // cockpit
      [V(-0.22, 0.32, -0.7), V(0.22, 0.32, -0.7)],
      [V(-0.22, 0.32, -0.7), V(0, 0.5, 0.1)],
      [V(0.22, 0.32, -0.7), V(0, 0.5, 0.1)],
    ),
  );
  const nozzles = [V(-0.32, 0.02, 1.65), V(0.32, 0.02, 1.65)];
  for (const n of nozzles) {
    const ring = loop(Array.from({ length: 12 }, (_, i) => V(n.x + 0.18 * Math.cos((i / 12) * Math.PI * 2), n.y + 0.18 * Math.sin((i / 12) * Math.PI * 2), n.z)), 0.9);
    g.add(ring);
  }
  const flame = new THREE.Points(new THREE.BufferGeometry().setFromPoints(nozzles.map((n) => n.clone().add(V(0, 0, 0.25)))), new THREE.PointsMaterial({ color: WHITE, size: 7, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false }));
  g.add(flame);
  return { group: g, nozzles, flame };
}

/** Engine trail: particles emitted at the nozzles, left behind, fading to black. */
export class Trail {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private col: Float32Array;
  private age: Float32Array;
  private next = 0;
  constructor(readonly n = 360) {
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.age = new Float32Array(n).fill(99);
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(this.pos, 3)).setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false }));
    this.points.frustumCulled = false;
  }
  emit(p: THREE.Vector3, count: number, jitter: number, r: () => number): void {
    for (let k = 0; k < count; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.n;
      this.pos.set([p.x + (r() - 0.5) * jitter, p.y + (r() - 0.5) * jitter, p.z + (r() - 0.5) * jitter], i * 3);
      this.age[i] = 0;
    }
  }
  update(dt: number, life: number): void {
    for (let i = 0; i < this.n; i++) {
      this.age[i] += dt;
      const b = Math.max(0, 1 - this.age[i] / life);
      this.col.set([b, b, b], i * 3);
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}
