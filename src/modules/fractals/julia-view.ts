import type { VizDef } from '../../core/types';
import { EscapeRenderer } from '../../gfx/escape-time';
import { PanZoom } from '../../gfx/panzoom';
import { INK, text, line } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

const FS = /* glsl */ `
uniform vec2 uCenter;
uniform vec2 uView;
uniform vec2 uC;
uniform float uIter;
uniform vec4 uMap;
uniform vec4 uMapView;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  bool inMap = uv.x > uMap.x && uv.x < uMap.z && uv.y > uMap.y && uv.y < uMap.w;
  vec2 z; vec2 c; float px; float add;
  vec2 dz;
  if (inMap) {
    vec2 m = (uv - uMap.xy) / (uMap.zw - uMap.xy) - 0.5;
    c = uMapView.xy + m * uMapView.zw;
    z = vec2(0.0);
    dz = vec2(0.0);
    add = 1.0;
    px = uMapView.z / ((uMap.z - uMap.x) * uRes.x);
  } else {
    z = uCenter + (uv - 0.5) * uView;
    c = uC;
    dz = vec2(1.0, 0.0);
    add = 0.0;
    px = uView.x / uRes.x;
  }
  float n = 0.0;
  float r2 = dot(z, z);
  float lim = inMap ? 300.0 : uIter;
  for (int i = 0; i < 5000; i++) {
    if (float(i) >= lim) break;
    dz = 2.0 * vec2(z.x * dz.x - z.y * dz.y, z.x * dz.y + z.y * dz.x) + vec2(add, 0.0);
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    r2 = dot(z, z);
    n += 1.0;
    if (r2 > 65536.0) break;
  }
  if (r2 <= 65536.0) { gl_FragColor = vec4(-1.0, 0.0, 0.0, 1.0); return; }
  float lz = 0.5 * log(r2);
  float nu = n + 1.0 - log(lz / 0.6931472) / 0.6931472;
  float de = 0.5 * sqrt(r2) * lz / max(length(dz), 1e-30);
  gl_FragColor = vec4(nu, de / px, 0.0, 1.0);
}`;

const PRESETS: { id: string; label: string; c: [number, number] }[] = [
  { id: 'rabbit', label: 'LAPIN DE DOUADY', c: [-0.123, 0.745] },
  { id: 'basilica', label: 'BASILIQUE', c: [-1, 0] },
  { id: 'dendrite', label: 'DENDRITE (c = i)', c: [0, 1] },
  { id: 'siegel', label: 'DISQUE DE SIEGEL', c: [-0.390541, -0.586788] },
  { id: 'galaxy', label: 'GALAXIE', c: [-0.8, 0.156] },
  { id: 'dust', label: 'POUSSIÈRE', c: [0.45, 0.1428] },
];

function inM(cr: number, ci: number, n = 1500): boolean {
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    const nx = x * x - y * y + cr;
    y = 2 * x * y + ci;
    x = nx;
    if (x * x + y * y > 4) return false;
  }
  return true;
}

export const juliaView: VizDef = {
  id: 'julia',
  title: 'ENSEMBLES DE JULIA',
  subtitle: 'Même itération z ↦ z² + c, mais c est fixé et z parcourt le plan. Survoler la carte de Mandelbrot change c en direct.',
  stage: 'shader',
  keywords: ['julia', 'fatou', 'lapin de douady', 'dendrite', 'basilique', 'connexe'],
  formula: {
    tex: 'z_{n+1}=z_n^2+c,\\quad J_c=\\partial\\{z_0 : (z_n)\\ \\text{bornée}\\},\\qquad c\\in M \\iff J_c\\ \\text{connexe}',
    note: 'Pour chaque c, l’ensemble de Julia sépare les points qui s’échappent de ceux qui restent bornés. Si c est dans l’ensemble de Mandelbrot, J_c est d’un seul tenant (connexe) ; sinon, c’est une poussière de Cantor. La carte en médaillon est donc un catalogue de tous les ensembles de Julia.',
  },
  create(ctx) {
    const pz = new PanZoom(ctx, {
      cx: 0,
      cy: 0,
      scale: 3.4 / Math.max(300, ctx.width),
      minScale: 1e-6,
      maxScale: 0.05,
      coordLabels: ['RE', 'IM'],
      onDrag: (_x, _y, e, phase) => {
        if (phase === 'start') {
          const r = ctx.input.getBoundingClientRect();
          const mx = e.clientX - r.left;
          const my = e.clientY - r.top;
          if (inMap(mx, my)) {
            st.locked = !st.locked;
            setC(...mapToC(mx, my));
            lockT.set(st.locked, true);
            return true;
          }
        }
        return false;
      },
    });
    pz.fit(-1.7, 1.7, -1.15, 1.15, 30);
    const map = { x: 26, y: 132, w: 280, h: 210, cx: -0.6, cy: 0, ww: 3.1 };
    const inMap = (x: number, y: number) => x >= map.x && x <= map.x + map.w && y >= map.y && y <= map.y + map.h;
    const mapToC = (x: number, y: number): [number, number] => {
      const wh = (map.ww * map.h) / map.w;
      return [map.cx + ((x - map.x) / map.w - 0.5) * map.ww, map.cy - ((y - map.y) / map.h - 0.5) * wh];
    };
    const cToMap = (cr: number, ci: number): [number, number] => {
      const wh = (map.ww * map.h) / map.w;
      return [map.x + ((cr - map.cx) / map.ww + 0.5) * map.w, map.y + (0.5 - (ci - map.cy) / wh) * map.h];
    };
    const uniforms = {
      uCenter: { value: [0, 0] as number[] },
      uView: { value: [1, 1] as number[] },
      uC: { value: [-0.123, 0.745] as number[] },
      uIter: { value: 400 },
      uMap: { value: [0, 0, 0, 0] as number[] },
      uMapView: { value: [0, 0, 1, 1] as number[] },
    };
    const er = new EscapeRenderer(ctx, FS, uniforms);
    const st = { c: [-0.123, 0.745] as [number, number], locked: false, auto: false, autoT: 0, style: 0, iter: ctx.q(250, 450, 800) };

    const setC = (cr: number, ci: number) => {
      st.c = [cr, ci];
      er.invalidate();
    };

    ctx.listen(ctx.input, 'pointermove', (e: PointerEvent) => {
      if (st.locked || st.auto) return;
      const r = ctx.input.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      if (inMap(mx, my)) setC(...mapToC(mx, my));
    });

    ctx.ui.section('PARAMÈTRE c');
    ctx.ui.note('Survoler la <b>carte</b> (médaillon) fait suivre c à la souris. Un clic sur la carte verrouille / déverrouille c.');
    const lockT = ctx.ui.toggle({ label: 'c VERROUILLÉ', value: false, onChange: (v) => (st.locked = v) });
    const autoT = ctx.ui.toggle({ label: 'c PARCOURT LE BORD DE LA CARDIOÏDE', value: false, onChange: (v) => (st.auto = v) });
    ctx.ui.segmented({
      options: PRESETS.map((p) => ({ id: p.id, label: p.label })),
      value: 'rabbit',
      cols: 2,
      onChange: (id) => {
        const p = PRESETS.find((x) => x.id === id)!;
        st.locked = true;
        lockT.set(true, true);
        setC(...p.c);
      },
    });
    const roC = ctx.ui.readout('c');
    const roConn = ctx.ui.readout('J_c');
    ctx.ui.section('RENDU');
    ctx.ui.segmented({
      options: [
        { id: '0', label: 'LIGNES' },
        { id: '1', label: 'DÉGRADÉ' },
        { id: '2', label: 'DISTANCE' },
      ],
      value: '0',
      onChange: (v) => (st.style = Number(v)),
    });
    ctx.ui.slider({ label: 'ITÉRATIONS', min: 50, max: 2000, step: 10, value: st.iter, onInput: (v) => ((st.iter = v), er.invalidate()) });

    const sC = ctx.hud.stat('c', '');
    const sConn = ctx.hud.stat('TOPOLOGIE', '');
    const sZoom = ctx.hud.stat('ZOOM', '');
    ctx.hud.tag('DIM. HAUSDORFF ∈ [1, 2] · DÉPEND DE c', true);
    ctx.hud.hint('SURVOLER LA CARTE : CHANGER c · CLIC SUR LA CARTE : VERROUILLER · GLISSER : DÉPLACER · MOLETTE : ZOOM');

    let lastKey = '';
    let frame = 0;
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.autoT += dt * 0.12;
          const a = st.autoT;
          const k = 1.015;
          setC(k * (Math.cos(a) / 2 - Math.cos(2 * a) / 4), k * (Math.sin(a) / 2 - Math.sin(2 * a) / 4));
        }
        const W = ctx.width;
        const H = ctx.height;
        uniforms.uCenter.value = [pz.cx, pz.cy];
        uniforms.uView.value = [pz.scale * W, pz.scale * H];
        uniforms.uC.value = st.c;
        uniforms.uIter.value = st.iter;
        uniforms.uMap.value = [map.x / W, 1 - (map.y + map.h) / H, (map.x + map.w) / W, 1 - map.y / H];
        uniforms.uMapView.value = [map.cx, map.cy, map.ww, (map.ww * map.h) / map.w];
        const key = `${pz.cx}|${pz.cy}|${pz.scale}|${st.c}|${st.iter}|${W}x${H}`;
        if (key !== lastKey) {
          er.invalidate();
          lastKey = key;
        }
        er.display.uniforms.uStyle.value = st.style;
        er.render(0);
        // map frame + marker
        const g = ctx.g;
        g.strokeStyle = INK.f60;
        g.strokeRect(map.x + 0.5, map.y + 0.5, map.w, map.h);
        text(g, 'CARTE DE MANDELBROT — c', map.x, map.y - 6, { size: 9, color: INK.f60 });
        const [mx, my] = cToMap(st.c[0], st.c[1]);
        line(g, mx, map.y, mx, map.y + map.h, INK.f40);
        line(g, map.x, my, map.x + map.w, my, INK.f40);
        g.strokeStyle = INK.fg;
        g.strokeRect(Math.round(mx) - 4.5, Math.round(my) - 4.5, 9, 9);
        text(g, st.locked ? '◆ VERROUILLÉ' : '◇ SUIT LA SOURIS', map.x + map.w, map.y - 6, { size: 9, color: INK.f40, align: 'right' });
        if (frame++ % 6 === 0) {
          const cs = `${fmt(st.c[0], 4)} ${st.c[1] >= 0 ? '+' : '−'} ${fmt(Math.abs(st.c[1]), 4)} i`;
          const conn = inM(st.c[0], st.c[1]) ? 'CONNEXE (c ∈ M)' : 'POUSSIÈRE DE CANTOR (c ∉ M)';
          sC(cs);
          roC.set(cs);
          sConn(conn);
          roConn.set(conn.split(' (')[0]);
          sZoom(`×${fmt(3.4 / (pz.scale * W), 1)}`);
        }
      },
      cinematic() {
        if (!st.auto) autoT.set(true);
      },
      dispose() {
        er.dispose();
      },
    };
  },
};
