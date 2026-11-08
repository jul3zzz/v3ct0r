import * as THREE from 'three';
import { GLSL_PRELUDE } from '../../math/parser';
import { rng } from '../fractals/common';

/** GPU density cloud: uniform random points in [-L,L]^3; the vertex shader evaluates the
 *  user's density f(x,y,z,t) (compiled to GLSL) and turns it into point opacity. */
export function densityMaterial(glsl: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
${GLSL_PRELUDE}
uniform float uT;
uniform float uMax;
uniform float uL;
uniform float uBall;
uniform float uSize;
uniform float uSliceOn;
uniform float uSlice;
varying float vA;
void main() {
  vec3 p = position * uL;
  float x = p.x; float y = p.y; float z = p.z; float t = uT;
  float d = abs(${glsl});
  float a = clamp(d / max(uMax, 1e-9), 0.0, 1.0);
  if (uBall > 0.5 && dot(p, p) > uL * uL) a = 0.0;
  if (uSliceOn > 0.5 && abs(p.z - uSlice) > 0.05 * uL) a *= 0.06;
  if (!(a == a)) a = 0.0;
  vA = a;
  gl_PointSize = uSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p.x, p.z, p.y, 1.0);
}`,
    fragmentShader: /* glsl */ `
uniform float uOpacity;
varying float vA;
void main() {
  if (vA < 0.004) discard;
  gl_FragColor = vec4(vec3(1.0), vA * uOpacity);
}`,
    uniforms: {
      uT: { value: 0 },
      uMax: { value: 1 },
      uL: { value: 1 },
      uBall: { value: 0 },
      uSize: { value: 2 },
      uSliceOn: { value: 0 },
      uSlice: { value: 0 },
      uOpacity: { value: 0.6 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

export function randomCube(n: number, seed = 11): THREE.BufferGeometry {
  const r = rng(seed);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = r() * 2 - 1;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
}

/** Composite Simpson over the cube [-L,L]^3 or (spherical coordinates) the ball of radius L. */
export function simpson3D(f: (x: number, y: number, z: number) => number, L: number, ball: boolean, n = 32): number {
  const m = n % 2 ? n + 1 : n;
  const w = (i: number) => (i === 0 || i === m ? 1 : i % 2 ? 4 : 2);
  let s = 0;
  if (!ball) {
    const h = (2 * L) / m;
    for (let i = 0; i <= m; i++)
      for (let j = 0; j <= m; j++)
        for (let k = 0; k <= m; k++) {
          const v = f(-L + i * h, -L + j * h, -L + k * h);
          if (Number.isFinite(v)) s += w(i) * w(j) * w(k) * v;
        }
    return (s * h * h * h) / 27;
  }
  const hr = L / m;
  const ht = Math.PI / m;
  const hp = (2 * Math.PI) / m;
  for (let i = 0; i <= m; i++) {
    const r = i * hr;
    for (let j = 0; j <= m; j++) {
      const th = j * ht;
      const st = Math.sin(th);
      const ct = Math.cos(th);
      for (let k = 0; k <= m; k++) {
        const ph = k * hp;
        const v = f(r * st * Math.cos(ph), r * st * Math.sin(ph), r * ct);
        if (Number.isFinite(v)) s += w(i) * w(j) * w(k) * v * r * r * st;
      }
    }
  }
  return (s * hr * ht * hp) / 27;
}
