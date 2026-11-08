import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { Stage3D } from '../../gfx/stage3d';
import { ShaderStage } from '../../gfx/shader-stage';
import { fmt } from '../../hud/dom';

const FS = /* glsl */ `
uniform vec3 uCamPos;
uniform mat3 uCamRot;
uniform float uTanHalf;
uniform float uPower;
uniform float uIter;
uniform float uSteps;
uniform float uStyle;
uniform float uCut;

float DE(vec3 wp, out float trap) {
  vec3 p = vec3(wp.x, wp.z, wp.y);
  vec3 z = p;
  float dr = 1.0;
  float r = length(z);
  trap = 1e9;
  for (int i = 0; i < 16; i++) {
    if (float(i) >= uIter) break;
    r = length(z);
    if (r > 2.0) break;
    float theta = acos(clamp(z.z / max(r, 1e-9), -1.0, 1.0)) * uPower;
    float phi = atan(z.y, z.x) * uPower;
    dr = pow(r, uPower - 1.0) * uPower * dr + 1.0;
    z = pow(r, uPower) * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + p;
    trap = min(trap, dot(z, z));
  }
  float d = 0.5 * log(max(r, 1e-9)) * r / dr;
  // optional cut-away half space (y > uCut is removed)
  if (uCut < 1.5) d = max(d, wp.z - uCut);
  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  float aspect = uRes.x / uRes.y;
  vec3 rd = normalize(uCamRot * vec3(uv.x * uTanHalf * aspect, uv.y * uTanHalf, -1.0));
  vec3 ro = uCamPos;
  // bounding sphere
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.44;
  float h = b * b - c;
  float glow = 0.0;
  float v = 0.0;
  if (h > 0.0) {
    h = sqrt(h);
    float t = max(0.0, -b - h);
    float tEnd = -b + h;
    float trap = 0.0;
    float steps = 0.0;
    bool hit = false;
    for (int i = 0; i < 400; i++) {
      if (float(i) >= uSteps) break;
      vec3 p = ro + rd * t;
      float d = DE(p, trap);
      glow += exp(-d * 60.0) * 0.012;
      if (d < 0.0006 * t) { hit = true; break; }
      t += d * 0.9;
      steps += 1.0;
      if (t > tEnd) break;
    }
    if (hit) {
      vec3 p = ro + rd * t;
      float e = 0.0008 * t;
      float tr;
      vec3 n = normalize(vec3(
        DE(p + vec3(e, 0, 0), tr) - DE(p - vec3(e, 0, 0), tr),
        DE(p + vec3(0, e, 0), tr) - DE(p - vec3(0, e, 0), tr),
        DE(p + vec3(0, 0, e), tr) - DE(p - vec3(0, 0, e), tr)));
      vec3 L = normalize(vec3(0.6, 0.8, 0.4));
      float diff = clamp(dot(n, L), 0.0, 1.0);
      float ao = clamp(1.0 - steps / uSteps, 0.0, 1.0);
      float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
      if (uStyle < 0.5) {
        v = (0.08 + 0.85 * diff) * pow(ao, 1.4) + rim * 0.35;
      } else if (uStyle < 1.5) {
        float f = sqrt(trap) * 9.0;
        float w = fwidth(f);
        float l = 1.0 - smoothstep(0.0, w * 1.3, abs(fract(f + 0.5) - 0.5));
        v = l * 0.95 * (0.35 + 0.65 * ao) + 0.06 * diff;
      } else {
        v = glow * 0.9 + rim * 0.25;
      }
    } else if (uStyle > 1.5) {
      v = glow * 0.9;
    }
  }
  gl_FragColor = vec4(vec3(clamp(v, 0.0, 1.0)), 1.0);
}`;

const BLIT = /* glsl */ `
uniform sampler2D uTex;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(uTex, vUv); }`;

export const mandelbulbView: VizDef = {
  id: 'mandelbulb',
  title: 'MANDELBULB 3D',
  subtitle: 'Analogue 3D de Mandelbrot en coordonnées sphériques (puissance n), rendu par ray-marching avec estimateur de distance.',
  stage: 'shader',
  hausdorff: 'NON ÉTABLIE',
  keywords: ['mandelbulb', 'ray marching', 'raymarching', '3d', 'white nottale', 'puissance'],
  formula: {
    tex: '\\mathbf{z}\\mapsto \\mathbf{z}^{\\,n}+\\mathbf{c},\\quad (r,\\theta,\\varphi)^n=r^n\\big(\\sin n\\theta\\cos n\\varphi,\\ \\sin n\\theta\\sin n\\varphi,\\ \\cos n\\theta\\big)',
    note: 'Il n’existe pas de « nombres complexes 3D », alors on élève un point à la puissance n en multipliant ses angles sphériques par n et son rayon à la puissance n (White & Nylander, 2009). Pour chaque pixel, on avance le long du rayon d’une distance sûre donnée par l’estimateur 0,5·r·ln r / |dr|.',
  },
  create(ctx) {
    const stage = new Stage3D(ctx, { position: [1.9, 1.0, 2.2], fog: false, minDistance: 1.3, maxDistance: 6, enablePan: false, rotateSpeed: 0.45 });
    const scale = ctx.q(0.5, 0.75, 1);
    const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const uniforms = {
      uCamPos: { value: new THREE.Vector3() },
      uCamRot: { value: new THREE.Matrix3() },
      uTanHalf: { value: Math.tan((stage.camera.fov * Math.PI) / 360) },
      uPower: { value: 8 },
      uIter: { value: ctx.q(6, 8, 10) },
      uSteps: { value: ctx.q(90, 140, 220) },
      uStyle: { value: 0 },
      uCut: { value: 2 },
    };
    const march = new ShaderStage(ctx, FS, uniforms);
    const blit = new ShaderStage(ctx, BLIT, { uTex: { value: rt.texture } });
    const st = { power: 8, animate: true, t: 0, cut: false };

    ctx.ui.section('FORMULE');
    const pS = ctx.ui.slider({ label: 'PUISSANCE n', min: 2, max: 12, step: 0.01, value: 8, onInput: (v) => (st.power = v) });
    const animT = ctx.ui.toggle({ label: 'FAIRE VARIER n', value: true, onChange: (v) => (st.animate = v) });
    ctx.ui.slider({ label: 'ITÉRATIONS', min: 3, max: 14, step: 1, value: uniforms.uIter.value, onInput: (v) => (uniforms.uIter.value = v) });
    ctx.ui.slider({ label: 'PAS DE MARCHE', min: 40, max: 360, step: 1, value: uniforms.uSteps.value, onInput: (v) => (uniforms.uSteps.value = v) });
    ctx.ui.section('RENDU');
    ctx.ui.segmented({
      options: [
        { id: '0', label: 'OMBRÉ' },
        { id: '1', label: 'ORBITES' },
        { id: '2', label: 'NUAGE' },
      ],
      value: '0',
      onChange: (v) => (uniforms.uStyle.value = Number(v)),
    });
    ctx.ui.toggle({ label: 'COUPE (MOITIÉ RETIRÉE)', value: false, onChange: (v) => (st.cut = v) });
    ctx.ui.note(`Rendu à ${Math.round(scale * 100)} % de la résolution (qualité ${ctx.quality.toUpperCase()}).`);

    const sN = ctx.hud.stat('PUISSANCE n', '');
    const sDist = ctx.hud.stat('DISTANCE CAMÉRA', '');
    ctx.hud.hint('GLISSER : ORBITE · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    let frame = 0;
    return {
      update(_t, dt) {
        if (st.animate) {
          st.t += dt;
          st.power = 8 + 3 * Math.sin(st.t * 0.18);
          if (frame % 5 === 0) pS.set(st.power, true);
        }
        stage.updateControls();
        const buf = ctx.renderer.getDrawingBufferSize(new THREE.Vector2());
        const w = Math.max(2, Math.round(buf.x * scale));
        const h = Math.max(2, Math.round(buf.y * scale));
        if (rt.width !== w || rt.height !== h) rt.setSize(w, h);
        uniforms.uCamPos.value.copy(stage.camera.position);
        uniforms.uCamRot.value.setFromMatrix4(stage.camera.matrixWorld);
        uniforms.uPower.value = st.power;
        uniforms.uCut.value = st.cut ? 0 : 2;
        march.render(0, rt);
        blit.render(0);
        if (frame++ % 6 === 0) {
          sN(fmt(st.power, 3));
          sDist(fmt(stage.camera.position.length(), 2));
        }
      },
      cinematic() {
        if (!st.animate) animT.set(true);
      },
      resize(w, h) {
        stage.resize(w, h);
      },
      dispose() {
        stage.dispose();
        rt.dispose();
        march.dispose();
        blit.dispose();
      },
    };
  },
};
