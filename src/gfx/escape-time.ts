import * as THREE from 'three';
import type { VizContext } from '../core/types';
import { ShaderStage } from './shader-stage';

/** Monochrome palettes for escape-time data (r = smooth iteration, -1 inside; g = distance in pixels). */
const DISPLAY_FS = /* glsl */ `
uniform sampler2D uTex;
uniform float uStyle;
uniform float uFreq;
uniform float uPhase;
varying vec2 vUv;
void main() {
  vec4 d = texture2D(uTex, vUv);
  float nu = d.r;
  if (nu < 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  float v;
  if (uStyle < 0.5) {
    // iso-iteration contour lines (1px) over a faint fill
    float f = log2(nu + 1.0) * uFreq * 4.0 + uPhase;
    float w = fwidth(f);
    float dd = abs(fract(f + 0.5) - 0.5);
    float l = 1.0 - smoothstep(0.0, w * 1.2, dd);
    // fade contour lines where they get closer than ~3 px (deep zooms), keep a faint texture instead
    float fade = 1.0 - smoothstep(0.12, 0.45, w);
    float edge = (1.0 - smoothstep(0.0, 1.1, d.g)) * 0.7;
    v = max(l * 0.85 * fade, edge) + 0.035 + (1.0 - fade) * 0.08;
  } else if (uStyle < 1.5) {
    float f = log2(nu + 1.0) * uFreq + uPhase;
    v = 0.5 + 0.5 * cos(6.2831853 * f);
    v = 0.06 + 0.9 * pow(v, 1.6);
  } else {
    float edge = 1.0 - smoothstep(0.0, 2.2, d.g);
    float glow = exp(-d.g * 0.04) * 0.35;
    v = max(edge, glow);
  }
  gl_FragColor = vec4(vec3(clamp(v, 0.0, 1.0)), 1.0);
}`;

/** Renders an escape-time compute shader into a float texture on demand (only when the view
 *  changes), optionally with a quick low-res preview and band-by-band full-res refinement, then
 *  colors it every frame with a cheap display pass. */
export class EscapeRenderer {
  readonly compute: ShaderStage;
  readonly display: ShaderStage;
  private rt: THREE.WebGLRenderTarget;
  private preview: THREE.WebGLRenderTarget;
  private dirty = true;
  private changedAt = 0;
  private band = 0;
  private showFull = false;
  bands = 1;
  usePreview = false;
  settleMs = 120;
  previewScale = 1 / 3;

  constructor(private ctx: VizContext, computeFS: string, uniforms: Record<string, THREE.IUniform>) {
    const opts = { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false } as const;
    this.rt = new THREE.WebGLRenderTarget(2, 2, opts);
    this.preview = new THREE.WebGLRenderTarget(2, 2, opts);
    this.compute = new ShaderStage(ctx, computeFS, uniforms);
    this.display = new ShaderStage(ctx, DISPLAY_FS, {
      uTex: { value: this.rt.texture },
      uStyle: { value: 0 },
      uFreq: { value: 1 },
      uPhase: { value: 0 },
    });
  }

  get progress(): number {
    return this.showFull ? 1 : this.band / this.bands;
  }

  invalidate(): void {
    this.dirty = true;
    this.changedAt = performance.now();
  }

  setFragment(src: string): void {
    this.compute.setFragment(src);
    this.invalidate();
  }

  private ensureSize(): void {
    const buf = this.ctx.renderer.getDrawingBufferSize(new THREE.Vector2());
    if (this.rt.width !== buf.x || this.rt.height !== buf.y) {
      this.rt.setSize(buf.x, buf.y);
      this.preview.setSize(Math.max(2, Math.round(buf.x * this.previewScale)), Math.max(2, Math.round(buf.y * this.previewScale)));
      this.invalidate();
    }
  }

  render(t: number): void {
    this.ensureSize();
    const r = this.ctx.renderer;
    const now = performance.now();
    if (this.dirty) {
      this.dirty = false;
      this.band = 0;
      this.showFull = false;
      if (this.usePreview) {
        this.compute.render(t, this.preview);
      } else {
        this.rt.scissorTest = false;
        this.compute.render(t, this.rt);
        this.band = this.bands;
        this.showFull = true;
      }
    }
    if (!this.showFull && now - this.changedAt > this.settleMs) {
      // refine one horizontal band per frame
      const h = Math.ceil(this.rt.height / this.bands);
      this.rt.scissor.set(0, this.band * h, this.rt.width, h);
      this.rt.scissorTest = true;
      this.compute.render(t, this.rt);
      this.rt.scissorTest = false;
      this.band++;
      if (this.band >= this.bands) this.showFull = true;
    }
    this.display.uniforms.uTex.value = this.showFull ? this.rt.texture : this.preview.texture;
    r.setRenderTarget(null);
    this.display.render(t);
  }

  dispose(): void {
    this.rt.dispose();
    this.preview.dispose();
    this.compute.dispose();
    this.display.dispose();
  }
}
