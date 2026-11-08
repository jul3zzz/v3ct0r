import * as THREE from 'three';
import type { VizContext } from '../core/types';

const VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/** Declarations of the built-in uniforms, prepended to every fragment shader. */
const HEADER = /* glsl */ `
uniform vec2 uRes;
uniform float uTime;
uniform float uPx;
`;

/** Fullscreen fragment-shader pass rendered with the shared WebGL2 renderer.
 *  Built-in uniforms: uRes (drawing-buffer pixels), uTime (s), uPx (device px per CSS px). */
export class ShaderStage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly material: THREE.ShaderMaterial;
  readonly uniforms: Record<string, THREE.IUniform>;
  private mesh: THREE.Mesh;

  constructor(private ctx: VizContext, fragmentShader: string, uniforms: Record<string, THREE.IUniform> = {}) {
    this.uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uPx: { value: 1 },
      ...uniforms,
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: VS,
      fragmentShader: HEADER + fragmentShader,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setFragment(src: string): void {
    this.material.fragmentShader = HEADER + src;
    this.material.needsUpdate = true;
  }

  render(t: number, target: THREE.WebGLRenderTarget | null = null): void {
    const r = this.ctx.renderer;
    const res = this.uniforms.uRes.value as THREE.Vector2;
    if (target) res.set(target.width, target.height);
    else r.getDrawingBufferSize(res);
    this.uniforms.uTime.value = t;
    this.uniforms.uPx.value = res.x / Math.max(1, this.ctx.width);
    r.setRenderTarget(target);
    r.render(this.scene, this.camera);
    r.setRenderTarget(null);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

/** Split a float64 into hi/lo float32 parts for double-single (df64) shader arithmetic. */
export function splitDouble(x: number): [number, number] {
  const hi = Math.fround(x);
  return [hi, Math.fround(x - hi)];
}
