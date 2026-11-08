/** 4D linear algebra on row-major 4×4 matrices (Float64Array(16)). */

export type Vec4 = [number, number, number, number];
export type Mat4 = Float64Array;

export const PLANES = [
  ['XY', 0, 1],
  ['XZ', 0, 2],
  ['XW', 0, 3],
  ['YZ', 1, 2],
  ['YW', 1, 3],
  ['ZW', 2, 3],
] as const;
export type PlaneName = (typeof PLANES)[number][0];

export function identity4(): Mat4 {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

export function mul4(a: Mat4, b: Mat4, out: Mat4 = new Float64Array(16)): Mat4 {
  const r = new Float64Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[i * 4 + k] * b[k * 4 + j];
      r[i * 4 + j] = s;
    }
  out.set(r);
  return out;
}

/** Rotation by `theta` in the plane spanned by axes i and j. */
export function planeRotation(i: number, j: number, theta: number): Mat4 {
  const m = identity4();
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  m[i * 4 + i] = c;
  m[i * 4 + j] = -s;
  m[j * 4 + i] = s;
  m[j * 4 + j] = c;
  return m;
}

/** Compose the six plane rotations (XY, XZ, XW, YZ, YW, ZW) in that order. */
export function rotation6(angles: readonly number[]): Mat4 {
  let m = identity4();
  PLANES.forEach(([, i, j], k) => {
    if (angles[k]) m = mul4(planeRotation(i, j, angles[k]), m);
  });
  return m;
}

export function apply4(m: Mat4, v: ArrayLike<number>, out: Vec4 = [0, 0, 0, 0]): Vec4 {
  const x = v[0], y = v[1], z = v[2], w = v[3];
  out[0] = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
  out[1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
  out[2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
  out[3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w;
  return out;
}

export function dot4(a: ArrayLike<number>, b: ArrayLike<number>): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function norm4(a: ArrayLike<number>): number {
  return Math.sqrt(dot4(a, a));
}

/** Rotation in the plane span(d, target) taking unit vector d onto unit vector target. */
export function alignRotation(d: Vec4, target: Vec4 = [0, 0, 0, 1]): Mat4 {
  const n = norm4(d);
  const u: Vec4 = [d[0] / n, d[1] / n, d[2] / n, d[3] / n];
  const c = Math.max(-1, Math.min(1, dot4(u, target)));
  if (c > 1 - 1e-12) return identity4();
  const v: Vec4 = [target[0] - c * u[0], target[1] - c * u[1], target[2] - c * u[2], target[3] - c * u[3]];
  const vn = norm4(v);
  for (let k = 0; k < 4; k++) v[k] /= vn;
  const s = Math.sqrt(1 - c * c);
  const m = identity4();
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      m[i * 4 + j] += (c - 1) * (u[i] * u[j] + v[i] * v[j]) + s * (v[i] * u[j] - u[i] * v[j]);
    }
  return m;
}

/** Row-major → THREE.Matrix4.set argument order (also row-major). */
export function toArgs(m: Mat4): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] {
  return Array.from(m) as never;
}
