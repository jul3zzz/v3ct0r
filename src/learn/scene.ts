// Drives explorer views as course scenes: {{scene:module/view key=value OPTION}} mounts a view
// and sets its controls (by label, through the UI registry), {{scene:set key=value dur=2}} tweens
// them, {{anim:camera x=a,b y=c,d dur=1.5}} moves the 2D camera. State is computed from the
// course time, so seeking re-creates the right scene.
import type { TimedEvent } from './clips';
import type { Handle } from '../hud/ui';

/** Short names for the controls of the views used by courses. Unknown keys are used as labels. */
export const SCENE_ALIASES: Record<string, Record<string, string>> = {
  'integrals/riemann': { f: 'f(x) =', a: 'BORNE a', b: 'BORNE b', n: 'SUBDIVISIONS n', auto: 'CONVERGENCE AUTOMATIQUE (n × 2)' },
  'integrals/ftc': { f: 'f(x) =', a: 'BORNE a', b: 'BORNE b', x: 'POSITION x', auto: 'BALAYAGE AUTOMATIQUE', speed: 'VITESSE' },
  'principles/linear': { a: 'a', b: 'b', c: 'c', d: 'd', t: 'INTERPOLATION I → A', auto: 'ANIMATION' },
  'principles/limits': { f: 'f(x) =', a: 'POINT a', eps: 'ε (MARGE VERTICALE)', auto: 'ε DÉCROÎT AUTOMATIQUEMENT' },
  'principles/fourier': { n: 'NOMBRE DE CERCLES', speed: 'VITESSE' },
  'principles/cantor': {},
  'principles/taylor': { f: 'f(x) =', a: 'CENTRE a', n: 'ORDRE n', auto: 'AJOUT AUTOMATIQUE DES TERMES' },
  // module intros (courses/intro-*)
  'fractals/mandelbrot': { dive: 'PLONGÉE AUTOMATIQUE (×2 / s)' },
  'fractals/koch': { n: 'ÉTAPE n', auto: 'CONSTRUCTION AUTOMATIQUE' },
  'fractals/attractors': { speed: 'VITESSE' },
  'constants/phi': { n: 'CARRÉS', auto: 'CONSTRUCTION AUTOMATIQUE' },
  'probability/galton': { rate: 'BILLES / SECONDE' },
};

export interface SceneHost {
  /** mount an explorer view by id (null: empty stage); returns false if unknown */
  mount(view: string | null): boolean;
  control(label: string): Handle<unknown> | undefined;
  option(label: string): (() => void) | undefined;
  /** 2D camera of the mounted view, if any */
  camera(): { fit(x0: number, x1: number, y0: number, y1: number, margin?: number, setHome?: boolean): void; toWorld(px: number, py: number): [number, number]; readonly width: number; readonly height: number } | null;
}

interface SceneSpan {
  t: number;
  view: string | null;
  ev: TimedEvent;
  sets: TimedEvent[];
  cams: TimedEvent[];
}

const parseValue = (v: string): unknown => {
  if (v === 'on' || v === 'true') return true;
  if (v === 'off' || v === 'false') return false;
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) ? n : v;
};
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const RESERVED = new Set(['dur', 'id']);

export class SceneDriver {
  private spans: SceneSpan[] = [];
  private cur: SceneSpan | null | undefined = undefined;
  private applied = new Map<string, unknown>();
  private camHome: [number, number, number, number] | null = null;
  private camApplied = '';
  readonly errors: string[] = [];

  constructor(
    events: TimedEvent[],
    private host: SceneHost,
  ) {
    for (const e of events) {
      if (e.m.kind === 'scene' && e.m.name !== 'set') this.spans.push({ t: e.t, view: e.m.name === 'none' ? null : e.m.name, ev: e, sets: [], cams: [] });
      else if (e.m.kind === 'scene' && e.m.name === 'set') this.spans[this.spans.length - 1]?.sets.push(e);
      else if (e.m.kind === 'anim' && e.m.name === 'camera') this.spans[this.spans.length - 1]?.cams.push(e);
    }
  }

  get views(): string[] {
    return [...new Set(this.spans.map((s) => s.view).filter((v): v is string => !!v))];
  }

  /** the scene visible at time T */
  at(T: number): SceneSpan | null {
    let s: SceneSpan | null = null;
    for (const x of this.spans) if (x.t <= T) s = x;
    return s;
  }

  /** first time a view is used as a scene */
  firstUse(view: string): number | null {
    return this.spans.find((s) => s.view === view)?.t ?? null;
  }

  label(view: string, key: string): string {
    return SCENE_ALIASES[view]?.[key] ?? key;
  }

  update(T: number): void {
    const span = this.at(T);
    if (span !== this.cur) {
      const view = span?.view ?? null;
      if (!(this.cur && span && this.cur.view === view && this.cur.view !== null)) {
        if (!this.host.mount(view) && view) this.errors.push(`scène inconnue « ${view} »`);
      }
      this.cur = span;
      this.applied.clear();
      this.camHome = null;
      this.camApplied = '';
      if (span?.view) {
        // options (flags) once per scene
        for (const f of span.ev.m.flags) {
          const opt = this.host.option(f);
          if (opt) opt();
          else this.errors.push(`option « ${f} » introuvable dans ${span.view}`);
        }
      }
    }
    if (!span?.view) return;
    const view = span.view;
    // static values, then tweens / later sets
    const values = new Map<string, unknown>();
    for (const [k, v] of Object.entries(span.ev.m.args)) if (!RESERVED.has(k)) values.set(this.label(view, k), parseValue(v));
    for (const s of span.sets) {
      if (s.t > T) break;
      const dur = Number(s.m.args.dur ?? 0);
      const p = dur > 0 ? ease(Math.min(1, (T - s.t) / dur)) : 1;
      for (const [k, raw] of Object.entries(s.m.args)) {
        if (RESERVED.has(k)) continue;
        const label = this.label(view, k);
        const to = parseValue(raw);
        const from = values.get(label) ?? this.host.control(label)?.get();
        values.set(label, typeof to === 'number' && typeof from === 'number' ? from + (to - from) * p : p >= 1 ? to : from);
      }
      for (const f of s.m.flags) if (p >= 1) values.set(`opt:${f}`, true);
    }
    for (const [label, v] of values) {
      if (label.startsWith('opt:')) {
        if (!this.applied.has(label)) {
          this.host.option(label.slice(4))?.();
          this.applied.set(label, true);
        }
        continue;
      }
      const prev = this.applied.get(label);
      if (prev === v) continue;
      const c = this.host.control(label);
      if (!c) {
        if (prev === undefined) this.errors.push(`contrôle « ${label} » introuvable dans ${view}`);
        this.applied.set(label, v);
        continue;
      }
      const cur = c.get();
      // integer sliders: avoid re-setting the same rounded value every frame
      const val = typeof v === 'number' && typeof cur === 'number' && Number.isInteger(cur) && label.endsWith(' n') ? Math.round(v) : v;
      if (cur !== val) c.set(val);
      this.applied.set(label, v);
    }
    this.camera(span, T);
  }

  private camera(span: SceneSpan, T: number): void {
    if (!span.cams.length) return;
    const cam = this.host.camera();
    if (!cam) return;
    if (!this.camHome) {
      const [x0, y1] = cam.toWorld(0, 0);
      const [x1, y0] = cam.toWorld(cam.width, cam.height);
      this.camHome = [x0, x1, y0, y1];
    }
    let box = this.camHome;
    for (const c of span.cams) {
      if (c.t > T) break;
      const x = (c.m.args.x ?? '').split(',').map(Number);
      const y = (c.m.args.y ?? '').split(',').map(Number);
      const target: [number, number, number, number] = [x[0] ?? box[0], x[1] ?? box[1], y[0] ?? box[2], y[1] ?? box[3]];
      const dur = Number(c.m.args.dur ?? 1.5);
      const p = ease(Math.min(1, (T - c.t) / Math.max(1e-6, dur)));
      box = box.map((v, i) => v + (target[i] - v) * p) as [number, number, number, number];
    }
    const key = box.map((v) => v.toFixed(5)).join(',');
    if (key === this.camApplied) return;
    this.camApplied = key;
    cam.fit(box[0], box[1], box[2], box[3], 0, false);
  }

  /** the scene changed under us (remounted elsewhere): forget the applied state */
  reset(): void {
    this.cur = undefined;
    this.applied.clear();
  }
}
