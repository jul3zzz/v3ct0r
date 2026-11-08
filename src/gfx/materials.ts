import * as THREE from 'three';

/** White 1px lines, additive so overlaps read as density; fog fades them with depth. */
export function lineMat(opacity = 0.75, additive = true): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    fog: true,
  });
}

/** Square white points of constant pixel size. */
export function pointMat(size = 2, opacity = 0.85): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    sizeAttenuation: false,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
}

/** Black occluder for "hidden line" rendering: surfaces hide the lines behind them. */
export function occluderMat(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

/** Faint XZ floor grid made of dots + axis ticks. */
export function floorGrid(size = 4, step = 0.5, y = -1.2): THREE.Group {
  const g = new THREE.Group();
  const pts: number[] = [];
  for (let x = -size; x <= size + 1e-9; x += step) for (let z = -size; z <= size + 1e-9; z += step) pts.push(x, y, z);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.Points(geo, pointMat(1.5, 0.35)));
  return g;
}

/** Axis triad with graduated ticks. */
export function axes(len = 1.5, ticks = 0.25, opacity = 0.35): THREE.LineSegments {
  const v: number[] = [];
  for (let a = 0; a < 3; a++) {
    const p = [0, 0, 0];
    const q = [0, 0, 0];
    p[a] = -len;
    q[a] = len;
    v.push(...p, ...q);
    for (let t = -len; t <= len + 1e-9; t += ticks) {
      if (Math.abs(t) < 1e-9) continue;
      const b = (a + 1) % 3;
      const c0 = [0, 0, 0];
      const c1 = [0, 0, 0];
      c0[a] = t;
      c1[a] = t;
      c0[b] = -0.025;
      c1[b] = 0.025;
      v.push(...c0, ...c1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return new THREE.LineSegments(geo, lineMat(opacity));
}

/** Build a LineSegments object from a flat [x,y,z,x,y,z,…] pair list. */
export function segments(data: number[] | Float32Array, opacity = 0.75): THREE.LineSegments {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(data instanceof Float32Array ? data : new Float32Array(data), 3));
  return new THREE.LineSegments(geo, lineMat(opacity));
}

/** Wireframe of a parametric surface drawn as iso-u and iso-v polylines (cleaner than triangle edges). */
export function paramGridLines(
  f: (u: number, v: number, out: THREE.Vector3) => void,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  nu: number,
  nv: number,
  sub = 4,
): Float32Array {
  const out: number[] = [];
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  const push = (a: THREE.Vector3, b: THREE.Vector3) => {
    if (![a.x, a.y, a.z, b.x, b.y, b.z].every(Number.isFinite)) return;
    if (a.distanceToSquared(b) > 4) return; // skip singular jumps
    out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };
  for (let i = 0; i <= nu; i++) {
    const u = u0 + ((u1 - u0) * i) / nu;
    const m = nv * sub;
    f(u, v0, p);
    for (let j = 1; j <= m; j++) {
      f(u, v0 + ((v1 - v0) * j) / m, q);
      push(p, q);
      p.copy(q);
    }
  }
  for (let j = 0; j <= nv; j++) {
    const v = v0 + ((v1 - v0) * j) / nv;
    const m = nu * sub;
    f(u0, v, p);
    for (let i = 1; i <= m; i++) {
      f(u0 + ((u1 - u0) * i) / m, v, q);
      push(p, q);
      p.copy(q);
    }
  }
  return new Float32Array(out);
}

/** Triangle mesh of a parametric surface (used only as an occluder). */
export function paramMesh(
  f: (u: number, v: number, out: THREE.Vector3) => void,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  nu: number,
  nv: number,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= nu; i++)
    for (let j = 0; j <= nv; j++) {
      f(u0 + ((u1 - u0) * i) / nu, v0 + ((v1 - v0) * j) / nv, p);
      pos.push(Number.isFinite(p.x) ? p.x : 0, Number.isFinite(p.y) ? p.y : 0, Number.isFinite(p.z) ? p.z : 0);
    }
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = a + nv + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  return geo;
}
