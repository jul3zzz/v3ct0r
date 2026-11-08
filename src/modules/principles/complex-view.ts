import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { ShaderStage } from '../../gfx/shader-stage';
import { INK, axes } from '../../gfx/plot2d';
import { COMPLEX_GLSL, compileComplex, type C, type ComplexCompiled } from '../../math/complex';

const PRESETS = ['z^2', 'z^3 - 1', '1/z', 'exp(z)', 'sin(z)', '(z - 1)/(z + 1)', 'z + 1/z', 'sqrt(z)', '(z^2 - 1)/(z^2 + 1)'];

const FS = (expr: string) => /* glsl */ `
uniform vec2 uCenter;
uniform vec2 uView;
uniform float uFreq;
${COMPLEX_GLSL}
float iso(float v) { float w = fwidth(v); return 1.0 - smoothstep(0.0, w * 1.3, abs(fract(v + 0.5) - 0.5)); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  vec2 z = uCenter + uv * uView;
  vec2 w = ${expr};
  float lw = length(w);
  float m = log(lw) * uFreq;
  float a = atan(w.y, w.x) / 6.2831853 * 12.0;
  float v = max(iso(m) * 0.95, iso(a) * 0.55);
  // zeros and poles glow
  v = max(v, exp(-lw * 30.0) + exp(-1.0 / max(lw, 1e-6) * 30.0));
  if (!(v == v)) v = 0.0;
  gl_FragColor = vec4(vec3(clamp(v, 0.0, 1.0)), 1.0);
}`;

export const complexView: VizDef = {
  id: 'complex',
  title: 'NOMBRES COMPLEXES',
  subtitle: 'Une fonction complexe déforme le plan : la grille se plie en préservant les angles. Tape ta propre fonction f(z) ; en mode « lignes de niveau », |w| et arg w sur GPU.',
  stage: 'shader',
  keywords: ['complexe', 'transformation conforme', 'plan complexe', 'möbius', 'joukowski', 'coloration de domaine', 'f(z)'],
  formula: {
    tex: 'w=f(z),\\quad z=x+iy,\\qquad f\\ \\text{holomorphe}\\Rightarrow\\text{angles conservés}',
    note: 'Chaque point z du plan est envoyé sur w = f(z). On anime la déformation de la grille : z ↦ (1 − t)·z + t·f(z). Les fonctions holomorphes (dérivables au sens complexe) sont conformes : les petits carrés deviennent de petits carrés tournés et agrandis. Le mode lignes de niveau trace les courbes |w| = cte et arg w = cte : zéros et pôles apparaissent comme des points lumineux.',
  },
  create(ctx) {
    const first = compileComplex(PRESETS[0]);
    if (!first.ok) throw new Error(first.error);
    const st = { f: first.fn, mode: 'grid', t: 0, auto: true, density: 14 };
    const pz = new PanZoom(ctx, { scale: 0.01, coordLabels: ['RE', 'IM'] });
    pz.fit(-2.4, 2.4, -2.4, 2.4, 40);
    const uniforms = { uCenter: { value: [0, 0] as number[] }, uView: { value: [1, 1] as number[] }, uFreq: { value: 2 } };
    const shader = new ShaderStage(ctx, FS(first.glsl), uniforms);
    ctx.ui.section('FONCTION');
    const fIn = ctx.ui.formula<ComplexCompiled>({
      prefix: 'f(z) =',
      value: PRESETS[0],
      vars: ['z', 'i'],
      presets: PRESETS,
      compiler: compileComplex,
      onChange: (c) => {
        st.f = c.fn;
        shader.setFragment(FS(c.glsl));
        ctx.setFormula({ tex: `w=${c.tex}`, note: complexView.formula.note });
      },
    });
    ctx.ui.note('Variable <b>z</b>, unité imaginaire <b>i</b>. Fonctions : exp, ln, sqrt, sin, cos, tan, sinh, cosh, tanh, abs, re, im, conj, arg, puissances ^.');
    ctx.ui.segmented({
      label: 'RENDU',
      options: [
        { id: 'grid', label: 'GRILLE DÉFORMÉE' },
        { id: 'level', label: 'LIGNES DE NIVEAU' },
      ],
      value: 'grid',
      onChange: (v) => (st.mode = v),
    });
    ctx.ui.section('DÉFORMATION');
    const tS = ctx.ui.slider({ label: 'INTERPOLATION t', min: 0, max: 1, step: 0.001, value: 0, onInput: (v) => ((st.t = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'ANIMATION', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'DENSITÉ DE LA GRILLE', min: 4, max: 40, step: 1, value: st.density, onInput: (v) => (st.density = v) });
    const s1 = ctx.hud.stat('f', '');
    const s2 = ctx.hud.stat('t', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    let ph = 0;
    return {
      update(_t, dt) {
        pz.tick();
        const g = ctx.g;
        if (st.auto) {
          ph += dt * 0.35;
          st.t = Math.min(1, Math.max(0, 0.5 - 0.65 * Math.cos(ph)));
          tS.set(st.t, true);
        }
        if (st.mode === 'level') {
          uniforms.uCenter.value = [pz.cx, pz.cy];
          uniforms.uView.value = [pz.scale * ctx.width, pz.scale * ctx.height];
          shader.render(0);
        } else {
          ctx.renderer.setRenderTarget(null);
          ctx.renderer.clear();
          axes(g, pz, { color: INK.f20, labels: false });
          const f = st.f;
          const t = st.t;
          const R = 2.2;
          const n = st.density;
          const map = (x: number, y: number): [number, number] => {
            const w: C = f([x, y]);
            return [pz.sx((1 - t) * x + t * w[0]), pz.sy((1 - t) * y + t * w[1])];
          };
          const draw = (horiz: boolean, v: number, strong: boolean) => {
            g.strokeStyle = strong ? INK.fg : INK.f60;
            g.beginPath();
            let pen = false;
            let last: [number, number] = [0, 0];
            for (let i = 0; i <= 240; i++) {
              const u = -R + (2 * R * i) / 240;
              const [sx, sy] = horiz ? map(u, v) : map(v, u);
              const ok = Number.isFinite(sx) && Number.isFinite(sy) && Math.abs(sx) < 1e5 && Math.abs(sy) < 1e5;
              if (ok && pen && Math.hypot(sx - last[0], sy - last[1]) < 200) g.lineTo(sx, sy);
              else if (ok) g.moveTo(sx, sy);
              pen = ok;
              last = [sx, sy];
            }
            g.stroke();
          };
          for (let i = 0; i <= n; i++) {
            const v = -R + (2 * R * i) / n;
            draw(true, v, Math.abs(v) < 1e-9);
            draw(false, v, Math.abs(v) < 1e-9);
          }
        }
        s1(fIn.get());
        s2(st.t.toFixed(3).replace('.', ','));
      },
      cinematic(t) {
        const k = Math.floor(t / 8) % PRESETS.length;
        if (fIn.get() !== PRESETS[k]) fIn.set(PRESETS[k]);
      },
      dispose() {
        shader.dispose();
      },
    };
  },
};
