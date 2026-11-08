import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { ShaderStage } from '../../gfx/shader-stage';
import { INK, text } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';

/** Ulam spiral on the GPU: each pixel → integer cell → n (closed form) → trial-division test. */
const FS = /* glsl */ `
uniform vec2 uCenter;
uniform vec2 uView;
uniform float uMode;
int ulam(int x, int y) {
  int k = max(abs(x), abs(y));
  if (k == 0) return 1;
  int m = (2 * k - 1) * (2 * k - 1);
  if (x == k && y > -k) return m + (y + k);
  if (y == k) return m + 2 * k + (k - x);
  if (x == -k) return m + 4 * k + (k - y);
  return m + 6 * k + (x + k);
}
bool isPrime(int n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 == 0) return false;
  for (int d = 3; d < 46341; d += 2) {
    if (d * d > n) break;
    if (n % d == 0) return false;
  }
  return true;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes - 0.5;
  vec2 w = uCenter + uv * uView;
  int x = int(floor(w.x + 0.5));
  int y = int(floor(w.y + 0.5));
  int n = ulam(x, y);
  float cell = uRes.x / uView.x;
  vec2 f = abs(fract(w + 0.5) - 0.5);
  float v = 0.0;
  if (isPrime(n)) {
    v = 1.0;
    if (cell > 6.0) v *= 1.0 - smoothstep(0.32, 0.42, max(f.x, f.y));
  } else if (uMode > 0.5 && cell > 6.0) {
    v = 0.12 * (1.0 - smoothstep(0.44, 0.5, max(f.x, f.y)));
  }
  if (n == 1) v = max(v, 0.5);
  gl_FragColor = vec4(vec3(v), 1.0);
}`;

function ulam(x: number, y: number): number {
  const k = Math.max(Math.abs(x), Math.abs(y));
  if (k === 0) return 1;
  const m = (2 * k - 1) ** 2;
  if (x === k && y > -k) return m + (y + k);
  if (y === k) return m + 2 * k + (k - x);
  if (x === -k) return m + 4 * k + (k - y);
  return m + 6 * k + (x + k);
}

export const primesView: VizDef = {
  id: 'primes',
  title: 'NOMBRES PREMIERS',
  subtitle: 'La spirale d’Ulam : les entiers enroulés en carré, les premiers allumés. Des diagonales apparaissent — calcul de primalité sur GPU.',
  stage: 'shader',
  keywords: ['premiers', 'ulam', 'spirale', 'crible', 'diagonales', 'euler n² + n + 41'],
  formula: {
    tex: '\\pi(N)\\sim\\frac{N}{\\ln N},\\qquad n^2+n+41\\ \\text{premier pour}\\ 0\\le n\\le 39',
    note: 'Stanisław Ulam (1963), s’ennuyant en conférence, écrit les entiers en spirale et entoure les premiers : ils s’alignent sur des diagonales, qui correspondent à des polynômes du second degré riches en premiers (comme n² + n + 41 d’Euler). Le théorème des nombres premiers dit qu’il y en a environ N/ln N jusqu’à N : ils se raréfient lentement.',
  },
  create(ctx) {
    const uniforms = { uCenter: { value: [0, 0] as number[] }, uView: { value: [1, 1] as number[] }, uMode: { value: 1 } };
    const sh = new ShaderStage(ctx, FS, uniforms);
    const pz = new PanZoom(ctx, { scale: 0.25, minScale: 0.01, maxScale: 30 });
    pz.fit(-60, 60, -45, 45, 20);
    let grid = true;
    let labels = true;
    ctx.ui.section('AFFICHAGE');
    ctx.ui.toggle({ label: 'CASES DES COMPOSÉS', value: true, onChange: (v) => (grid = v) });
    ctx.ui.toggle({ label: 'NUMÉROS (ZOOM PROCHE)', value: true, onChange: (v) => (labels = v) });
    ctx.ui.buttons([
      { label: 'PROCHE', onClick: () => pz.flyTo(0, 0, 0.04) },
      { label: 'MOYEN', onClick: () => pz.flyTo(0, 0, 0.25) },
      { label: 'LOIN', onClick: () => pz.flyTo(0, 0, 2) },
    ]);
    ctx.ui.section('COMPTAGE');
    const roN = ctx.ui.readout('ENTIERS VISIBLES ≤ N');
    const roP = ctx.ui.readout('π(N)');
    const roA = ctx.ui.readout('N / ln N');
    ctx.ui.note('Le zoom profond reste rapide : chaque pixel teste la primalité de son entier par divisions successives directement dans le shader.');
    const s1 = ctx.hud.stat('N', '');
    const s2 = ctx.hud.stat('π(N)', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    ctx.hud.setMapper((px, py) => {
      const [x, y] = pz.toWorld(px, py);
      const n = ulam(Math.round(x), Math.round(y));
      return [n, 0];
    }, ['n', '·']);
    let lastN = 0;
    let sieve: Uint8Array | null = null;
    let piN = 0;
    return {
      update() {
        pz.tick();
        uniforms.uCenter.value = [pz.cx, pz.cy];
        uniforms.uView.value = [pz.scale * ctx.width, pz.scale * ctx.height];
        uniforms.uMode.value = grid ? 1 : 0;
        sh.render(0);
        const g = ctx.g;
        const cell = 1 / pz.scale;
        if (labels && cell > 24) {
          const [x0, y1] = pz.toWorld(0, 0);
          const [x1, y0] = pz.toWorld(ctx.width, ctx.height);
          for (let x = Math.ceil(x0); x <= x1; x++)
            for (let y = Math.ceil(y0); y <= y1; y++) {
              const n = ulam(x, y);
              text(g, String(n), pz.sx(x), pz.sy(y) + 4, { align: 'center', size: Math.min(14, cell / 3.2), color: 'rgba(128,128,128,0.9)' });
            }
        }
        // count primes up to the largest visible n (corner)
        const half = Math.max(Math.abs(pz.cx) + (ctx.width / 2) * pz.scale, Math.abs(pz.cy) + (ctx.height / 2) * pz.scale);
        const N = Math.min(4e7, (2 * Math.ceil(half) + 1) ** 2);
        if (N !== lastN) {
          if (!sieve || sieve.length < N + 1) {
            sieve = new Uint8Array(Math.min(4e7, Math.max(N + 1, 1000)) + 1);
            for (let i = 2; i * i < sieve.length; i++) if (!sieve[i]) for (let j = i * i; j < sieve.length; j += i) sieve[j] = 1;
          }
          piN = 0;
          for (let i = 2; i <= N; i++) if (!sieve[i]) piN++;
          lastN = N;
          roN.set(fmtInt(N));
          roP.set(fmtInt(piN));
          roA.set(fmtInt(N / Math.log(N)));
          s1(fmtInt(N));
          s2(`${fmtInt(piN)} (${fmt((100 * piN) / N, 2)} %)`);
        }
        void INK;
      },
      dispose() {
        sh.dispose();
      },
    };
  },
};
