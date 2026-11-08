import * as THREE from 'three';
import type { VizDef } from '../../core/types';
import { EscapeRenderer } from '../../gfx/escape-time';
import { PanZoom } from '../../gfx/panzoom';
import { fmtSci } from '../../hud/dom';
import { FB, detectMisiurewicz, fromNumber, referenceOrbit, refineMisiurewicz, toDecimal, toNumber, type BigC } from '../../math/bigfixed';

const REF_W = 4096;

/** Compute shader: plain float32 iteration (shallow) or perturbation around a reference orbit
 *  with Zhuoran rebasing (deep). Output: r = smooth iteration (−1 inside), g = distance in px. */
export function mandelbrotFS(perturb: boolean): string {
  return /* glsl */ `
${perturb ? '#define PERTURB' : ''}
uniform vec2 uCenter;
uniform vec2 uDc0;
uniform vec2 uView;
uniform float uIter;
uniform sampler2D uRef;
uniform int uRefLen;
vec2 refAt(int m) { return texelFetch(uRef, ivec2(m % ${REF_W}, m / ${REF_W}), 0).xy; }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  vec2 off = uv * uView;
  float px = uView.x / uRes.x;
  vec2 der = vec2(0.0);
  vec2 z = vec2(0.0);
  float n = 0.0;
  float r2 = 0.0;
#ifdef PERTURB
  vec2 dc = uDc0 + off;
  vec2 dz = vec2(0.0);
  int m = 0;
  for (int i = 0; i < 30000; i++) {
    if (float(i) >= uIter) break;
    vec2 Z = refAt(m);
    z = Z + dz;
    der = 2.0 * vec2(z.x * der.x - z.y * der.y, z.x * der.y + z.y * der.x) + vec2(px, 0.0);
    dz = 2.0 * vec2(Z.x * dz.x - Z.y * dz.y, Z.x * dz.y + Z.y * dz.x) + vec2(dz.x * dz.x - dz.y * dz.y, 2.0 * dz.x * dz.y) + dc;
    m++;
    z = refAt(m) + dz;
    r2 = dot(z, z);
    n += 1.0;
    if (r2 > 65536.0) break;
    if (r2 < dot(dz, dz) || m >= uRefLen - 1) { dz = z; m = 0; }
  }
#else
  vec2 c = uCenter + off;
  for (int i = 0; i < 30000; i++) {
    if (float(i) >= uIter) break;
    der = 2.0 * vec2(z.x * der.x - z.y * der.y, z.x * der.y + z.y * der.x) + vec2(px, 0.0);
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    r2 = dot(z, z);
    n += 1.0;
    if (r2 > 65536.0) break;
  }
#endif
  if (r2 <= 65536.0) { gl_FragColor = vec4(-1.0, 0.0, 0.0, 1.0); return; }
  float lz = 0.5 * log(r2);
  float nu = n + 1.0 - log(lz / 0.6931472) / 0.6931472;
  float de = 0.5 * sqrt(r2) * lz / max(length(der), 1e-37);
  gl_FragColor = vec4(nu, de, 0.0, 1.0);
}`;
}

interface Preset {
  id: string;
  label: string;
  cx: number;
  cy: number;
  width: number;
  /** deepest scale (world units per CSS px) reachable by the automatic dive */
  deep?: number;
  /** refine as a Misiurewicz point (exact up to ~96 digits) */
  misiurewicz?: boolean;
  exact?: BigC;
}

export const PRESETS: Preset[] = [
  { id: 'global', label: 'VUE GLOBALE', cx: -0.6, cy: 0, width: 3.6 },
  { id: 'seahorse', label: 'HIPPOCAMPES', cx: -0.743643887037151, cy: 0.13182590420533, width: 0.02, deep: 1e-13 },
  { id: 'elephant', label: 'ÉLÉPHANTS', cx: 0.28175, cy: 0.0101, width: 0.03 },
  { id: 'spiral', label: 'SPIRALE', cx: -0.761574, cy: -0.0847596, width: 0.003 },
  { id: 'minibrot', label: 'MINIBROT', cx: -1.754877666246693, cy: 0, width: 0.06 },
  { id: 'misi-i', label: 'POINT i (∞)', cx: 0, cy: 1, width: 0.2, deep: 1e-30, exact: { x: 0n, y: 1n << BigInt(FB) } },
  { id: 'misi-31', label: 'M₃,₁ (∞)', cx: -1.5436890126920764, cy: 0, width: 0.05, deep: 1e-30, misiurewicz: true },
  { id: 'misi-c', label: 'M ANTENNE (∞)', cx: -0.1010963638456221, cy: 0.9562865108091415, width: 0.05, deep: 1e-30, misiurewicz: true },
];

/** Below this pixel size (world units per device pixel), switch to perturbation. */
const PERTURB_THRESHOLD = 5e-6;

export const mandelbrotView: VizDef = {
  id: 'mandelbrot',
  title: 'ENSEMBLE DE MANDELBROT',
  subtitle: 'zₙ₊₁ = zₙ² + c calculé sur GPU. Au-delà de ×10⁶ : théorie des perturbations autour d’une orbite de référence haute précision — zoom jusqu’à ~10³⁰.',
  stage: 'shader',
  hausdorff: '2 (BORD, SHISHIKURA 1998)',
  keywords: ['mandelbrot', 'zoom profond', 'complexe', 'itération', 'perturbation', 'misiurewicz', 'hippocampe'],
  formula: {
    tex: 'z_{n+1}=z_n^2+c,\\qquad \\delta_{n+1}=2Z_n\\delta_n+\\delta_n^2+\\delta c\\quad(z=Z+\\delta)',
    note: 'Chaque pixel est un nombre complexe c : si la suite z ↦ z² + c dépasse 2, elle s’échappe. Pour zoomer très profond, on calcule une seule orbite Z en très haute précision (BigInt, ~96 chiffres), puis chaque pixel ne suit que son petit écart δ en flottant sur GPU. Quand l’écart devient plus grand que l’orbite, on « rebase » (méthode de Zhuoran) : plus de glitchs. Les points de Misiurewicz offrent des détails à toutes les échelles.',
  },
  create(ctx) {
    // high-precision origin + local float view (PanZoom works in local coordinates)
    let origin: BigC = { x: fromNumber(-0.6), y: 0n };
    const pz = new PanZoom(ctx, { cx: 0, cy: 0, scale: 3.6 / Math.max(300, ctx.width), minScale: 1e-33, maxScale: 0.05, coordLabels: ['RE', 'IM'] });
    pz.fit(-1.8, 1.8, -1.25, 1.25, 30);
    ctx.hud.setMapper((px, py) => {
      const [x, y] = pz.toWorld(px, py);
      return [toNumber(origin.x) + x, toNumber(origin.y) + y];
    }, ['RE', 'IM']);
    const refTex = new THREE.DataTexture(new Float32Array(REF_W * 4), REF_W, 1, THREE.RGBAFormat, THREE.FloatType);
    refTex.minFilter = refTex.magFilter = THREE.NearestFilter;
    refTex.needsUpdate = true;
    const uniforms = {
      uCenter: { value: [0, 0] as number[] },
      uDc0: { value: [0, 0] as number[] },
      uView: { value: [1, 1] as number[] },
      uIter: { value: 300 },
      uRef: { value: refTex as THREE.Texture },
      uRefLen: { value: 1 },
    };
    let perturb = false;
    const er = new EscapeRenderer(ctx, mandelbrotFS(false), uniforms);
    const st = { style: 0, freq: 1, cycle: false, autoIter: true, iter: 400, maxIter: ctx.q(2000, 5000, 12000), dive: false, target: PRESETS[5] };
    // reference orbit bookkeeping (global BigInt point + scale at which it was computed)
    let ref: { c: BigC; scale: number; iter: number; len: number } | null = null;
    let tex: THREE.DataTexture = refTex;

    const setOrigin = (o: BigC) => {
      // keep the current view where it is, expressed relative to the new origin
      const dx = toNumber(o.x - origin.x);
      const dy = toNumber(o.y - origin.y);
      pz.translate(dx, dy);
      origin = o;
    };
    const presetPoint = (p: Preset): BigC => {
      if (p.exact) return p.exact;
      if (p.misiurewicz) {
        const kp = detectMisiurewicz(p.cx, p.cy);
        if (kp) {
          const r = refineMisiurewicz(p.cx, p.cy, kp[0], kp[1]);
          if (Number.isFinite(r.residual) && r.residual < 1e-60) return r.c;
        }
        p.deep = 1e-13; // could not be refined: limit the dive
      }
      return { x: fromNumber(p.cx), y: fromNumber(p.cy) };
    };
    const goPreset = (p: Preset) => {
      setOrigin(presetPoint(p));
      pz.flyTo(0, 0, p.width / ctx.width);
      if (p.deep && p.deep < 1e-13) st.target = p;
    };

    ctx.ui.section('NAVIGATION');
    ctx.ui.note('Glisser : déplacer · molette : zoomer au curseur · double-clic : vue d’ensemble. Les points <b>(∞)</b> sont calculés à ~96 chiffres : on peut y plonger jusqu’à ×10³⁰.');
    const presetSeg = ctx.ui.segmented({
      options: PRESETS.map((p) => ({ id: p.id, label: p.label })),
      value: 'global',
      cols: 2,
      onChange: (id) => goPreset(PRESETS.find((x) => x.id === id)!),
    });
    const diveT = ctx.ui.toggle({ label: 'PLONGÉE AUTOMATIQUE (×2 / s)', value: false, onChange: (v) => {
      st.dive = v;
      if (v) goPreset(st.target);
    } });
    ctx.ui.section('RENDU');
    const styleSeg = ctx.ui.segmented({
      options: [
        { id: '0', label: 'LIGNES' },
        { id: '1', label: 'DÉGRADÉ' },
        { id: '2', label: 'DISTANCE' },
      ],
      value: '0',
      onChange: (v) => (st.style = Number(v)),
    });
    ctx.ui.slider({ label: 'DENSITÉ DES NIVEAUX', min: 0.2, max: 4, step: 0.01, value: 1, onInput: (v) => (st.freq = v) });
    ctx.ui.toggle({ label: 'CYCLE DES NIVEAUX', value: false, onChange: (v) => (st.cycle = v) });
    ctx.ui.toggle({ label: 'ITÉRATIONS AUTO', value: true, onChange: (v) => ((st.autoIter = v), er.invalidate()) });
    const iterS = ctx.ui.slider({ label: 'ITÉRATIONS MAX', min: 50, max: st.maxIter, step: 10, value: 400, onInput: (v) => ((st.iter = v), (st.autoIter = false), er.invalidate()) });
    ctx.ui.section('ÉTAT');
    const roPrec = ctx.ui.readout('MÉTHODE', 'FLOAT32');
    const roRef = ctx.ui.readout('ORBITE DE RÉFÉRENCE');
    const roRe = ctx.ui.readout('RE(c)');
    const roIm = ctx.ui.readout('IM(c)');

    const sZoom = ctx.hud.stat('ZOOM', '');
    const sIter = ctx.hud.stat('ITÉRATIONS', '');
    const sPrec = ctx.hud.stat('MÉTHODE', '');
    const sProg = ctx.hud.stat('RENDU', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM AU CURSEUR · DOUBLE-CLIC : VUE D’ENSEMBLE');
    pz.setHomeTo(0, 0, pz.scale);

    const buildRef = (center: BigC, iter: number) => {
      const bits = Math.min(FB, Math.max(96, Math.ceil(-Math.log2(pz.scale)) + 64));
      const orbit = referenceOrbit(center, iter, bits);
      const len = orbit.length / 2;
      const rows = Math.ceil(len / REF_W);
      const data = new Float32Array(REF_W * rows * 4);
      for (let i = 0; i < len; i++) {
        data[i * 4] = orbit[i * 2];
        data[i * 4 + 1] = orbit[i * 2 + 1];
      }
      tex.dispose();
      tex = new THREE.DataTexture(data, REF_W, rows, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      uniforms.uRef.value = tex;
      uniforms.uRefLen.value = len;
      ref = { c: center, scale: pz.scale, iter, len };
    };

    let lastKey = '';
    let frame = 0;
    let phase = 0;
    return {
      update(_t, dt) {
        pz.tick();
        if (st.dive) {
          const k = Math.exp(-dt * Math.log(2));
          pz.cx *= Math.max(0, 1 - dt * 3);
          pz.cy *= Math.max(0, 1 - dt * 3);
          pz.scale *= k;
          if (pz.scale < (st.target.deep ?? 1e-13)) {
            st.dive = false;
            diveT.set(false, true);
            goPreset(PRESETS[0]);
          }
        }
        // rebase the high-precision origin when the local offset grows (keeps float64 exact)
        if (!pz.animating && !pz.dragging && (Math.abs(pz.cx) > pz.scale * 1e4 || Math.abs(pz.cy) > pz.scale * 1e4) && pz.scale < 1e-8) {
          setOrigin({ x: origin.x + fromNumber(pz.cx), y: origin.y + fromNumber(pz.cy) });
        }
        const pr = ctx.renderer.getPixelRatio();
        const pxWorld = pz.scale / pr;
        const needP = pxWorld < PERTURB_THRESHOLD;
        if (needP !== perturb) {
          perturb = needP;
          er.setFragment(mandelbrotFS(perturb));
          ref = null;
        }
        const zoom = 3.6 / (pz.scale * ctx.width);
        const iter = st.autoIter ? Math.min(st.maxIter, Math.round(220 + 110 * Math.max(0, Math.log10(zoom)) ** 1.4)) : st.iter;
        const center: BigC = { x: origin.x + fromNumber(pz.cx), y: origin.y + fromNumber(pz.cy) };
        if (perturb) {
          const viewW = pz.scale * ctx.width;
          const off = ref ? Math.hypot(toNumber(center.x - ref.c.x), toNumber(center.y - ref.c.y)) : Infinity;
          if (!ref || off > viewW * 0.75 || pz.scale < ref.scale / 4 || pz.scale > ref.scale * 4 || iter > ref.iter) buildRef(center, iter);
          uniforms.uDc0.value = [toNumber(center.x - ref!.c.x), toNumber(center.y - ref!.c.y)];
        } else {
          uniforms.uCenter.value = [toNumber(center.x), toNumber(center.y)];
        }
        er.usePreview = perturb && iter > 1200;
        er.bands = perturb ? (iter > 4000 ? 12 : 6) : 1;
        uniforms.uView.value = [pz.scale * ctx.width, pz.scale * ctx.height];
        uniforms.uIter.value = iter;
        const key = `${toDecimal(center.x, 40)}|${toDecimal(center.y, 40)}|${pz.scale}|${iter}|${ctx.width}x${ctx.height}|${perturb}`;
        if (key !== lastKey) {
          er.invalidate();
          lastKey = key;
        }
        if (st.cycle) phase += dt * 0.15;
        er.display.uniforms.uStyle.value = st.style;
        er.display.uniforms.uFreq.value = st.freq;
        er.display.uniforms.uPhase.value = phase;
        er.render(0);
        if (frame++ % 6 === 0) {
          const digits = Math.min(90, Math.max(15, Math.ceil(-Math.log10(pz.scale)) + 4));
          sZoom(`×${fmtSci(zoom, 2)}`);
          sIter(String(iter));
          sPrec(perturb ? 'PERTURBATION + REBASAGE' : 'FLOAT32');
          sProg(er.progress >= 1 ? '100 %' : `${Math.round(er.progress * 100)} %`);
          roPrec.set(perturb ? 'PERTURBATION' : 'FLOAT32');
          roRef.set(perturb && ref ? `${ref.len} PTS · ${Math.min(FB, Math.max(96, Math.ceil(-Math.log2(ref.scale)) + 64))} BITS` : '—');
          roRe.set(toDecimal(center.x, Math.min(digits, 34)));
          roIm.set(toDecimal(center.y, Math.min(digits, 34)));
          if (st.autoIter) iterS.set(iter, true);
        }
      },
      cinematic(t) {
        if (!st.dive && t > 0.5) {
          const deep = PRESETS.filter((p) => p.deep && p.deep < 1e-13);
          st.target = deep[Math.floor(t / 30) % deep.length];
          diveT.set(true);
          if (st.style !== 0) styleSeg.set('0');
        }
        void presetSeg;
      },
      dispose() {
        er.dispose();
        tex.dispose();
        refTex.dispose();
      },
    };
  },
};
