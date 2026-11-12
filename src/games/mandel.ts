// PLONGÉE MANDELBROT: find a parameter c whose critical orbit (the orbit of 0 under z ↦ z² + c)
// falls onto an attracting cycle of period p. Pan, zoom, probe: each probe draws the orbit and
// names its period. The bulbs on the main cardioid have every period (internal angle p/q → q);
// deeper levels need deeper dives. The set is rendered by a fragment shader (shared WebGL2).
import * as THREE from 'three';
import type { VizContext } from '../core/types';
import { fr, type Box, type GameDef, type GameLogic, type RoundResult, type TouchKey } from './types';

/** period of the attracting cycle that catches the orbit of 0; 'escape' if it leaves |z| ≤ 2;
 *  null when undecided after `maxIter` steps (very close to the boundary) */
export function attractingPeriod(cx: number, cy: number, maxIter = 6000): number | 'escape' | null {
  let x = 0;
  let y = 0;
  for (let i = 0; i < maxIter; i++) {
    const nx = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = nx;
    if (x * x + y * y > 4) return 'escape';
  }
  const x0 = x;
  const y0 = y;
  for (let p = 1; p <= 64; p++) {
    const nx = x * x - y * y + cx;
    y = 2 * x * y + cy;
    x = nx;
    if (Math.hypot(x - x0, y - y0) < 1e-7) return p;
  }
  return null;
}

/** where the bulb of internal angle a/q touches the main cardioid: c = μ/2 − μ²/4, μ = e^{2iπ a/q} */
export function bulbRoot(a: number, q: number): [number, number] {
  const t = (2 * Math.PI * a) / q;
  const mx = Math.cos(t);
  const my = Math.sin(t);
  return [mx / 2 - (mx * mx - my * my) / 4, my / 2 - (2 * mx * my) / 4];
}

const TARGETS = [
  [1, 2, 3, 4, 5],
  [6, 7, 5, 8, 9],
  [10, 11, 12, 13, 16],
];
const TIMES = [35, 45, 60];
const HOME = { x: -0.6, y: 0, s: 1.25 };

const FRAG = /* glsl */ `
uniform vec4 uView;
uniform vec4 uBox;
uniform int uIter;
void main() {
  vec2 p = (gl_FragCoord.xy - uBox.xy) / uBox.zw;
  if (p.x < 0.0 || p.y < 0.0 || p.x > 1.0 || p.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec2 c = vec2(mix(uView.x, uView.y, p.x), mix(uView.z, uView.w, p.y));
  vec2 z = vec2(0.0);
  float n = -1.0;
  for (int i = 0; i < 2000; i++) {
    if (i >= uIter) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 256.0) { n = float(i); break; }
  }
  if (n < 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  float sn = n + 1.0 - log2(0.5 * log2(dot(z, z)));
  float v = pow(clamp(sn / 60.0, 0.0, 1.0), 0.55);
  float band = 0.5 + 0.5 * cos(sn * 0.45);
  gl_FragColor = vec4(vec3(v * (0.45 + 0.55 * band)), 1.0);
}`;

class MandelDive implements GameLogic {
  target = 1;
  view = { ...HOME };
  private level = 0;
  private elapsed = 0;
  private wrongs = 0;
  private probe: { c: [number, number]; res: number | 'escape' | null; orbit: [number, number][] } | null = null;
  private done: RoundResult | null = null;
  private returned = false;
  private box: Box = { x: 0, y: 0, w: 1, h: 1 };
  private drag: { x: number; y: number; vx: number; vy: number; moved: boolean } | null = null;
  /** touch: the fingers on the play area, and the distance between two of them while they pinch */
  private fingers = new Map<number, [number, number]>();
  private pinchD = 0;
  private gl: { ctx: VizContext; scene: THREE.Scene; cam: THREE.OrthographicCamera; mat: THREE.ShaderMaterial } | null = null;

  attach(ctx: VizContext): void {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({ fragmentShader: FRAG, vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }', uniforms: { uView: { value: new THREE.Vector4() }, uBox: { value: new THREE.Vector4() }, uIter: { value: 200 } }, depthTest: false });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    scene.add(quad);
    this.gl = { ctx, scene, cam, mat };
    ctx.onDispose(() => {
      quad.geometry.dispose();
      mat.dispose();
    });
  }

  start(level: number, round: number, _r?: () => number): void {
    this.level = level;
    this.target = TARGETS[level][round % 5];
    this.view = { ...HOME };
    this.elapsed = 0;
    this.wrongs = 0;
    this.probe = null;
    this.done = null;
    this.returned = false;
  }

  prompt(): string {
    return `TROUVE UN c DONT L’ORBITE DE 0 TOMBE SUR UN CYCLE DE PÉRIODE ${this.target}`;
  }

  controls(): string {
    return 'GLISSER : DÉPLACER · MOLETTE : ZOOMER · CLIC : SONDER c · R : VUE INITIALE';
  }

  touchControls(): string {
    return 'GLISSER : DÉPLACER · DEUX DOIGTS : ZOOMER · TOUCHER : SONDER c';
  }

  touchKeys(): TouchKey[] {
    return [{ label: 'VUE INITIALE', title: 'Revenir à la vue de départ (R)', key: 'r' }];
  }

  // view: centre (x, y), half-height s; the box keeps its aspect
  private range(): [number, number, number, number] {
    const hw = this.view.s * (this.box.w / Math.max(1, this.box.h));
    return [this.view.x - hw, this.view.x + hw, this.view.y - this.view.s, this.view.y + this.view.s];
  }
  private toC(px: number, py: number): [number, number] {
    const [x0, x1, y0, y1] = this.range();
    return [x0 + ((px - this.box.x) / this.box.w) * (x1 - x0), y1 - ((py - this.box.y) / this.box.h) * (y1 - y0)];
  }
  private toPx(cx: number, cy: number): [number, number] {
    const [x0, x1, y0, y1] = this.range();
    return [this.box.x + ((cx - x0) / (x1 - x0)) * this.box.w, this.box.y + ((y1 - cy) / (y1 - y0)) * this.box.h];
  }

  /** zoom by k (< 1: closer) keeping the point under (x, y) in place */
  private zoomAt(x: number, y: number, k: number): void {
    const [cx, cy] = this.toC(x, y);
    const s = Math.max(2e-5, Math.min(HOME.s * 1.5, this.view.s * k));
    this.view = { x: cx + (this.view.x - cx) * (s / this.view.s), y: cy + (this.view.y - cy) * (s / this.view.s), s };
  }

  pointer(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number, e: PointerEvent | WheelEvent): void {
    if (type === 'wheel') {
      this.zoomAt(x, y, Math.pow(1.0015, (e as WheelEvent).deltaY));
      return;
    }
    // touch: two fingers pinch to zoom; a pinch neither drags nor probes
    const pe = e as PointerEvent;
    if (pe.pointerType === 'touch') {
      if (type === 'up') {
        this.fingers.delete(pe.pointerId);
        if (this.pinchD) {
          if (this.fingers.size < 2) {
            this.pinchD = 0;
            this.drag = null;
          }
          return;
        }
      } else if (type === 'down' || this.fingers.has(pe.pointerId)) this.fingers.set(pe.pointerId, [x, y]);
      if (this.fingers.size >= 2) {
        const [a, b] = [...this.fingers.values()];
        const d = Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1]));
        if (!this.pinchD) this.drag = null;
        else this.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, this.pinchD / d);
        this.pinchD = d;
        return;
      }
    }
    if (type === 'down') {
      this.drag = { x, y, vx: this.view.x, vy: this.view.y, moved: false };
      return;
    }
    if (!this.drag) return;
    const per = (2 * this.view.s) / this.box.h;
    if (Math.hypot(x - this.drag.x, y - this.drag.y) > 4) this.drag.moved = true;
    if (this.drag.moved) this.view = { ...this.view, x: this.drag.vx - (x - this.drag.x) * per, y: this.drag.vy + (y - this.drag.y) * per };
    if (type === 'up') {
      if (!this.drag.moved) this.sound(...this.toC(x, y));
      this.drag = null;
    }
  }

  /** probe c: orbit, period, verdict */
  sound(cx: number, cy: number): void {
    if (this.done) return;
    const res = attractingPeriod(cx, cy);
    const orbit: [number, number][] = [];
    let zx = 0;
    let zy = 0;
    for (let i = 0; i < 120 && zx * zx + zy * zy < 16; i++) {
      orbit.push([zx, zy]);
      const nx = zx * zx - zy * zy + cx;
      zy = 2 * zx * zy + cy;
      zx = nx;
    }
    this.probe = { c: [cx, cy], res, orbit };
    if (res === this.target) {
      const T = TIMES[this.level];
      const score = Math.max(20, Math.round(100 - (50 * this.elapsed) / T - 10 * this.wrongs));
      this.done = { ok: true, score, detail: `c = ${fr(cx, 5)} ${cy < 0 ? '−' : '+'} ${fr(Math.abs(cy), 5)} i · période ${res} en ${fr(this.elapsed, 1)} s · ${this.wrongs} sonde${this.wrongs > 1 ? 's' : ''} fausse${this.wrongs > 1 ? 's' : ''} · zoom ×${fr(HOME.s / this.view.s, 0)}` };
    } else if (res !== null) this.wrongs++;
  }

  key(e: KeyboardEvent): boolean {
    if (e.key.toLowerCase() === 'r') {
      this.view = { ...HOME };
      return true;
    }
    return false;
  }

  tick(dt: number): void {
    this.elapsed += dt;
  }

  poll(): RoundResult | null {
    if (this.done && !this.returned) {
      this.returned = true;
      return this.done;
    }
    return null;
  }

  submit(timeout: boolean): RoundResult | null {
    if (!timeout) return null; // the round ends when the right period is found
    const [rx, ry] = bulbRoot(1, this.target);
    return { ok: false, score: 0, detail: `période ${this.target} non trouvée · piste : le bourgeon d’angle interne 1/${this.target} touche le cardioïde en c ≈ ${fr(rx, 3)} ${ry < 0 ? '−' : '+'} ${fr(Math.abs(ry), 3)} i` };
  }

  draw(g: CanvasRenderingContext2D, box: Box, _t: number, phase: 'play' | 'reveal'): void {
    this.box = box;
    // the set, on the GPU (GL canvas under the HUD)
    if (this.gl) {
      const { ctx, scene, cam, mat } = this.gl;
      const r = ctx.renderer.domElement.width / Math.max(1, ctx.width);
      const [x0, x1, y0, y1] = this.range();
      mat.uniforms.uView.value.set(x0, x1, y0, y1);
      mat.uniforms.uBox.value.set(box.x * r, (ctx.height - box.y - box.h) * r, box.w * r, box.h * r);
      mat.uniforms.uIter.value = Math.round(Math.min(1800, 180 + 90 * Math.log2(HOME.s / this.view.s + 1)));
      ctx.renderer.render(scene, cam);
    }
    g.save();
    g.beginPath();
    g.rect(box.x, box.y, box.w, box.h);
    g.clip();
    g.lineWidth = 1;
    // the main cardioid and the period-2 disc, exact, at the reveal (and as a faint guide at level 1)
    if (phase === 'reveal' || this.level === 0) {
      g.strokeStyle = `rgba(255,255,255,${phase === 'reveal' ? 0.6 : 0.18})`;
      g.setLineDash([4, 4]);
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const [cx, cy] = bulbRoot(k, 200);
        const [px, py] = this.toPx(cx, cy);
        if (k) g.lineTo(px, py);
        else g.moveTo(px, py);
      }
      g.stroke();
      const [ox, oy] = this.toPx(-1, 0);
      const [ex] = this.toPx(-0.75, 0);
      g.beginPath();
      g.arc(ox, oy, Math.abs(ex - ox), 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
    }
    if (phase === 'reveal' && !this.done) {
      const [px, py] = this.toPx(...bulbRoot(1, this.target));
      g.strokeStyle = '#fff';
      g.beginPath();
      g.arc(px, py, 9, 0, Math.PI * 2);
      g.stroke();
    }
    // last probe: its orbit
    const p = this.probe;
    if (p) {
      g.strokeStyle = 'rgba(255,255,255,0.75)';
      g.beginPath();
      p.orbit.forEach(([x, y], i) => {
        const [px, py] = this.toPx(x, y);
        if (i) g.lineTo(px, py);
        else g.moveTo(px, py);
      });
      g.stroke();
      g.fillStyle = '#fff';
      for (const [x, y] of p.orbit.slice(-24)) {
        const [px, py] = this.toPx(x, y);
        g.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
      const [cx, cy] = this.toPx(...p.c);
      g.strokeStyle = '#fff';
      g.beginPath();
      g.moveTo(cx - 8, cy);
      g.lineTo(cx + 8, cy);
      g.moveTo(cx, cy - 8);
      g.lineTo(cx, cy + 8);
      g.stroke();
    }
    // readouts
    g.font = '11px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillStyle = 'rgba(0,0,0,0.7)';
    g.fillRect(box.x + 8, box.y + 8, 420, 44);
    g.fillStyle = '#fff';
    g.fillText(`zoom ×${fr(HOME.s / this.view.s, HOME.s / this.view.s < 10 ? 1 : 0)} · centre ${fr(this.view.x, 5)} ${this.view.y < 0 ? '−' : '+'} ${fr(Math.abs(this.view.y), 5)} i`, box.x + 16, box.y + 20);
    const verdict = !p ? 'clique pour sonder un c' : p.res === 'escape' ? 's’échappe : c n’est pas dans M' : p.res === null ? 'indécis : trop près du bord, zoome' : p.res === this.target ? `période ${p.res} ✓` : `période ${p.res} — il faut ${this.target}`;
    g.fillText(`sonde : ${verdict}`, box.x + 16, box.y + 38);
    g.restore();
  }
}

export const MANDEL: GameDef = {
  id: 'mandel-dive',
  title: 'Plongée Mandelbrot',
  subtitle: 'Chasser les cycles attractifs dans l’ensemble de Mandelbrot.',
  module: 'fractals',
  view: 'fractals/mandelbrot',
  minutes: 10,
  brief:
    'Pour chaque c, on itère z ↦ z² + c à partir de 0. Dans les régions noires, l’orbite finit capturée par un cycle : de période 1 dans le grand cardioïde, 2 dans le disque voisin, puis 3, 4, 5… dans des bourgeons de plus en plus petits. Trouve un c de la période demandée : glisse, zoome, sonde.',
  rules: [
    'Clic (sans glisser) : sonder c — l’orbite de 0 se dessine et sa période s’affiche. Glisser : déplacer. Molette : zoomer sur le curseur. R : vue initiale.',
    'La manche se termine dès que la bonne période est trouvée. Score : de 100 à 20, selon le temps pris et les sondes fausses (−10 chacune).',
    'Piste : le bourgeon attaché au cardioïde à l’angle interne a/q a la période q ; plus q est grand, plus il est petit.',
  ],
  levels: [
    { title: 'Grands bourgeons', brief: 'périodes 1 à 5, guide du cardioïde', rounds: 5, time: 35 },
    { title: 'Bourgeons fins', brief: 'périodes 5 à 9, il faut zoomer', rounds: 5, time: 45 },
    { title: 'Plongée profonde', brief: 'périodes 10 à 16', rounds: 5, time: 60 },
  ],
  theorem: {
    kind: 'theorem',
    title: 'Cycles attractifs et composantes de l’ensemble de Mandelbrot',
    body: '$M = \\{ c \\in \\mathbb{C} : (f_c^{\\,n}(0))_n \\text{ bornée} \\}$ avec $f_c(z) = z^2 + c$ ; si $|f_c^{\\,n}(0)| > 2$ pour un $n$, l’orbite tend vers l’infini. **Fatou** : tout cycle attractif d’un polynôme attire un point critique ; $f_c$ n’en a qu’un, $0$, donc $f_c$ a **au plus un** cycle attractif, et s’il existe, l’orbite de $0$ converge vers lui. Le cardioïde principal $\\{ \\tfrac{\\mu}{2} - \\tfrac{\\mu^2}{4} : |\\mu| < 1 \\}$ est l’ensemble des $c$ à point fixe attractif ; le disque $|c + 1| < \\tfrac14$, celui des $c$ à cycle attractif de période $2$. Au point $\\tfrac{\\mu}{2} - \\tfrac{\\mu^2}{4}$ avec $\\mu = e^{2i\\pi a/q}$ ($a/q$ irréductible) s’attache une composante de période $q$ : le cardioïde porte des bourgeons de **toutes** les périodes.',
  },
  references: ['A. Douady, J. H. Hubbard, Étude dynamique des polynômes complexes (Publications d’Orsay, 1984-1985)', 'J. Milnor, Dynamics in One Complex Variable (Princeton), chap. 8-9'],
  make: () => new MandelDive(),
};

export type MandelLogic = MandelDive;
