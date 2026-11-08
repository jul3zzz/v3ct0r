// LEARN animation layer. Objects (equations, statements, plots, grids, highlights, arrows, titles)
// are compiled from the timeline into specs with a lifetime [t0, tEnd); their look is a pure
// function of the course time T, so play, pause, speed changes and scrubbing are exact.
import { h } from '../hud/dom';
import { reducedMotion } from '../hud/fx';
import { compile } from '../math/parser';
import { rich, tex } from './rich';
import type { Course } from './courses';
import type { Timeline } from './clips';
import { STATEMENT_LABEL, type Marker } from './types';

const SVGNS = 'http://www.w3.org/2000/svg';
type Attrs = Record<string, string | number>;
const sv = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element): SVGElementTagNameMap[K] => {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.append(e);
  return e;
};

/** Stage regions as fractions of the stage box: [x0, y0, x1, y1]. */
export const SLOTS: Record<string, [number, number, number, number]> = {
  c: [0.1, 0.14, 0.9, 0.74],
  n: [0.05, 0.05, 0.95, 0.36],
  s: [0.06, 0.5, 0.94, 0.8],
  w: [0.03, 0.06, 0.49, 0.8],
  e: [0.51, 0.06, 0.97, 0.8],
  nw: [0.03, 0.05, 0.49, 0.42],
  ne: [0.51, 0.05, 0.97, 0.42],
  sw: [0.03, 0.44, 0.49, 0.8],
  se: [0.51, 0.44, 0.97, 0.8],
  full: [0.03, 0.05, 0.97, 0.8],
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const num = (s: string | undefined, d: number): number => {
  if (s === undefined || s === '') return d;
  const v = Number(s);
  return Number.isFinite(v) ? v : d;
};
const nums = (s: string | undefined, d: number[]): number[] => (s ? s.split(',').map((x) => Number(x.trim())) : d);

interface Tween {
  t: number;
  dur: number;
  args: Record<string, string>;
}

export interface Spec {
  id: string;
  kind: string;
  m: Marker;
  t0: number;
  tEnd: number;
  dur: number;
  slot: string;
  /** plot children (curve, area…) */
  children: Spec[];
  parent?: Spec;
  /** highlight / arrow targets */
  targets: Spec[];
  tweens: Tween[];
  /** morph: the equation it transforms */
  from?: Spec;
}

const PLOT_ITEMS = new Set(['curve', 'area', 'darboux', 'lebesgue', 'point', 'vline', 'hline', 'segment']);
export const DEFAULT_DUR: Record<string, number> = { write: 1.6, morph: 1.3, box: 1.2, title: 1.1, word: 0.9, wipe: 0.8, text: 0.6, axes: 0.9, grid: 2, highlight: 0.5, arrow: 0.7, curve: 1.6, area: 1.2, darboux: 1.4, lebesgue: 1.6, point: 0.4, vline: 0.5, hline: 0.5, segment: 0.6 };

/** Compile timeline events into object specs (lifetimes, tweens, targets). */
export function compileSpecs(tl: Timeline, course: Course, errors: string[]): Spec[] {
  const all: Spec[] = [];
  const live = new Map<string, Spec>();
  const bySlot = new Map<string, Spec>();
  /** titles and words: fixed lifetime, outside `live`, but cut short by a wipe */
  const floating: Spec[] = [];
  let lastEq: Spec | undefined;
  let auto = 0;
  let chapter = tl.chapters[0]?.id;
  const close = (s: Spec | undefined, t: number) => {
    if (!s || s.tEnd <= t) return;
    s.tEnd = t;
    live.delete(s.id);
    if (bySlot.get(s.slot) === s) bySlot.delete(s.slot);
    for (const c of s.children) close(c, t);
  };
  const closeAll = (t: number) => [...live.values()].forEach((s) => close(s, t));
  const make = (m: Marker, kind: string, t: number, slot: string): Spec => {
    const id = m.args.id ?? `${kind}-${auto++}`;
    close(live.get(id), t);
    const s: Spec = { id, kind, m, t0: t, tEnd: Infinity, dur: num(m.args.dur, DEFAULT_DUR[kind] ?? 1), slot, children: [], targets: [], tweens: [] };
    live.set(id, s);
    all.push(s);
    return s;
  };
  const occupy = (s: Spec, t: number) => {
    if (!SLOTS[s.slot]) errors.push(`emplacement inconnu « ${s.slot} » (${s.m.raw})`);
    close(bySlot.get(s.slot), t);
    bySlot.set(s.slot, s);
  };
  for (const e of tl.events) {
    if (e.chapter !== chapter) {
      const ch = tl.chapters.find((c) => c.id === e.chapter);
      closeAll(ch ? ch.t : e.t);
      lastEq = undefined;
      chapter = e.chapter;
    }
    const m = e.m;
    const t = e.t;
    if (m.kind === 'box') {
      const s = make(m, 'box', t, m.args.slot ?? 'c');
      occupy(s, t);
      continue;
    }
    if (m.kind !== 'anim') continue;
    const k = m.name;
    if (k === 'write') {
      const s = make(m, 'write', t, m.args.slot ?? 'c');
      occupy(s, t);
      lastEq = s;
    } else if (k === 'morph') {
      const src = m.args.from ? live.get(m.args.from) : m.args.slot ? bySlot.get(m.args.slot) : lastEq && live.has(lastEq.id) ? lastEq : undefined;
      const s = make(m, 'morph', t, src?.slot ?? m.args.slot ?? 'c');
      if (src && (src.kind === 'write' || src.kind === 'morph')) {
        s.from = src;
        close(src, t);
      } else errors.push(`morph sans équation de départ (${m.raw})`);
      bySlot.set(s.slot, s);
      lastEq = s;
    } else if (k === 'text' || k === 'axes' || k === 'grid') {
      const s = make(m, k, t, m.args.slot ?? (k === 'text' ? 's' : 'e'));
      occupy(s, t);
    } else if (k === 'title' || k === 'word') {
      const s = make(m, k, t, k === 'title' ? 'full' : (m.args.slot ?? 'c'));
      if (!SLOTS[s.slot]) errors.push(`emplacement inconnu « ${s.slot} » (${m.raw})`);
      s.tEnd = t + s.dur + num(m.args.hold, k === 'title' ? 2.6 : 1.6);
      live.delete(s.id);
      floating.push(s);
    } else if (k === 'wipe') {
      // centred on the marker: the curtain fully covers the stage when the next scene mounts,
      // and everything shown before it (equations, texts, titles, words) is gone behind it
      const dur = num(m.args.dur, DEFAULT_DUR.wipe);
      closeAll(t);
      for (const f of floating) f.tEnd = Math.min(f.tEnd, t);
      lastEq = undefined;
      const s = make(m, 'wipe', t - dur / 2, 'full');
      s.tEnd = s.t0 + dur;
      live.delete(s.id);
    } else if (PLOT_ITEMS.has(k)) {
      const plot = live.get(m.args.on ?? '') ?? [...live.values()].reverse().find((x) => x.kind === 'axes');
      if (!plot || plot.kind !== 'axes') {
        errors.push(`${k} sans repère (on=…) (${m.raw})`);
        continue;
      }
      const s = make(m, k, t, plot.slot);
      s.parent = plot;
      plot.children.push(s);
    } else if (k === 'highlight' || k === 'arrow') {
      const ids = k === 'highlight' ? [m.args.on] : [m.args.from, m.args.to];
      const targets = ids.map((x) => (x ? live.get(x.split(':')[0]) : lastEq && live.has(lastEq.id) ? lastEq : undefined));
      if (targets.some((x) => !x)) {
        errors.push(`${k} : cible introuvable (${m.raw})`);
        continue;
      }
      const s = make(m, k, t, 'full');
      s.targets = targets as Spec[];
    } else if (k === 'tween') {
      const target = live.get(m.args.id ?? '');
      if (!target) {
        errors.push(`tween : objet « ${m.args.id} » introuvable (${m.raw})`);
        continue;
      }
      const args = { ...m.args };
      delete args.id;
      delete args.dur;
      target.tweens.push({ t, dur: num(m.args.dur, 1.5), args });
    } else if (k === 'fade') {
      if (m.args.id) close(live.get(m.args.id), t);
      else if (m.args.slot) close(bySlot.get(m.args.slot), t);
      else closeAll(t);
    } else if (k === 'clear') closeAll(t);
    else if (k !== 'camera') errors.push(`animation inconnue « ${k} » (${m.raw})`);
  }
  // dependents die with their targets / parents
  for (const s of all) {
    for (const tg of s.targets) s.tEnd = Math.min(s.tEnd, tg.tEnd);
    if (s.parent) s.tEnd = Math.min(s.tEnd, s.parent.tEnd);
  }
  void course;
  return all;
}

/** Value of a numeric argument at time T, following its tweens. */
function argAt(s: Spec, key: string, T: number, d: number): number {
  let v = num(s.m.args[key], d);
  for (const tw of s.tweens) {
    if (T < tw.t || tw.args[key] === undefined) continue;
    const to = num(tw.args[key], v);
    v = v + (to - v) * ease(clamp01((T - tw.t) / Math.max(1e-6, tw.dur)));
  }
  return v;
}

function argsAt(s: Spec, key: string, T: number, d: number[]): number[] {
  let v = nums(s.m.args[key], d);
  for (const tw of s.tweens) {
    if (T < tw.t || tw.args[key] === undefined) continue;
    const to = nums(tw.args[key], v);
    const e = ease(clamp01((T - tw.t) / Math.max(1e-6, tw.dur)));
    v = v.map((x, i) => x + ((to[i] ?? x) - x) * e);
  }
  return v;
}

// ── objects ─────────────────────────────────────────────────────────────

abstract class Obj {
  el!: HTMLElement | SVGElement;
  constructor(
    readonly s: Spec,
    readonly st: Stage,
  ) {}
  abstract build(): void;
  layout(): void {}
  abstract update(T: number): void;
  /** for highlights and arrows: a term's box in stage coordinates */
  termRect(_key?: string): DOMRect | null {
    return this.box();
  }
  box(): DOMRect | null {
    return this.st.local((this.el as HTMLElement).getBoundingClientRect());
  }
  prog(T: number, t0 = this.s.t0, dur = this.s.dur): number {
    if (T < t0) return 0;
    return this.st.reduced ? 1 : clamp01((T - t0) / Math.max(1e-6, dur));
  }
  placeInSlot(el: HTMLElement | SVGElement): DOMRect {
    const r = this.st.rect(this.s.slot);
    const st = (el as HTMLElement).style;
    st.left = `${r.x}px`;
    st.top = `${r.y}px`;
    st.width = `${r.width}px`;
    st.height = `${r.height}px`;
    return r;
  }
}

/** leaf elements of a KaTeX rendering, in reading order (glyphs, fraction bars, radicals) */
function atoms(root: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (el: Element) => {
    if (el.classList.contains('strut') || el.classList.contains('vlist-s') || el.classList.contains('pstrut') || el.classList.contains('katex-mathml')) return;
    if (el.tagName.toLowerCase() === 'svg') {
      out.push(el as unknown as HTMLElement);
      return;
    }
    const kids = [...el.children];
    const lineLike = /frac-line|overline-line|underline-line|hline|rule/.test(el.className);
    if (!kids.length) {
      if (lineLike || (el.textContent ?? '').trim()) out.push(el as HTMLElement);
      return;
    }
    kids.forEach(walk);
  };
  walk(root);
  return out;
}

class EqObj extends Obj {
  private to!: HTMLElement;
  private fromEl: HTMLElement | null = null;
  private toAtoms: HTMLElement[] = [];
  private fromAtoms: HTMLElement[] = [];
  private moving: { el: HTMLElement; partner: HTMLElement; dx: number; dy: number }[] = [];
  private shown = -1;
  private k = 1;

  build(): void {
    const c = this.st.course;
    const src = this.s.kind === 'morph' ? this.s.m.args.to : this.s.m.args.eq;
    this.el = h('div', { class: `lx-obj lx-eq ${this.s.m.args.size ? 'sz-' + this.s.m.args.size : ''}` });
    this.to = tex(h('div', { class: 'lx-eq-in' }), c.formulas.eq[src] ?? `\\text{?${src}}`, true);
    if (this.s.from) {
      const f = this.s.from;
      const fsrc = f.kind === 'morph' ? f.m.args.to : f.m.args.eq;
      this.fromEl = tex(h('div', { class: 'lx-eq-in from' }), c.formulas.eq[fsrc] ?? '', true);
      this.el.append(this.fromEl);
    }
    this.el.append(this.to);
    const matched = new Set<Element>();
    if (this.fromEl) {
      for (const el of this.to.querySelectorAll<HTMLElement>('[data-m]')) {
        const partner = this.fromEl.querySelector<HTMLElement>(`[data-m="${el.dataset.m}"]`);
        if (!partner) continue;
        el.style.display = 'inline-block';
        partner.style.display = 'inline-block';
        this.moving.push({ el, partner, dx: 0, dy: 0 });
        matched.add(el);
        matched.add(partner);
      }
      const inMatched = (a: Element) => [...matched].some((m) => m.contains(a));
      this.fromAtoms = atoms(this.fromEl).filter((a) => !inMatched(a));
      this.toAtoms = atoms(this.to).filter((a) => !inMatched(a));
    } else this.toAtoms = atoms(this.to);
    if (this.s.m.flags.includes('key')) this.el.classList.add('key');
  }

  layout(): void {
    const r = this.placeInSlot(this.el);
    const el = this.el as HTMLElement;
    el.style.setProperty('--k', '1');
    const w = Math.max(this.to.scrollWidth, this.fromEl?.scrollWidth ?? 0);
    const hh = Math.max(this.to.scrollHeight, this.fromEl?.scrollHeight ?? 0);
    this.k = Math.min(1, (r.width - 16) / Math.max(1, w), (r.height - 16) / Math.max(1, hh));
    el.style.setProperty('--k', String(this.k));
    // write in reading order (left to right, then top to bottom), not in KaTeX's DOM order
    const pos = new Map(this.toAtoms.map((a) => [a, a.getBoundingClientRect()] as const));
    this.toAtoms.sort((a, b) => {
      const ra = pos.get(a)!;
      const rb = pos.get(b)!;
      return Math.abs(ra.left - rb.left) > 2 ? ra.left - rb.left : ra.top - rb.top;
    });
    // FLIP: offset of each moving term from its old position (local, unscaled units)
    for (const mv of this.moving) {
      mv.el.style.transform = '';
      const a = mv.el.getBoundingClientRect();
      const b = mv.partner.getBoundingClientRect();
      mv.dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / this.k;
      mv.dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / this.k;
    }
    this.shown = -1;
  }

  update(T: number): void {
    const p = this.prog(T);
    if (!this.fromEl) {
      const n = Math.ceil(p * this.toAtoms.length);
      if (n !== this.shown) {
        this.toAtoms.forEach((a, i) => (a.style.opacity = i < n ? '1' : '0'));
        this.shown = n;
      }
      return;
    }
    const e = ease(p);
    this.fromEl.style.visibility = p >= 1 ? 'hidden' : 'visible';
    for (const a of this.fromAtoms) a.style.opacity = String(1 - e);
    for (const a of this.toAtoms) a.style.opacity = String(e);
    for (const mv of this.moving) {
      mv.partner.style.opacity = '0';
      mv.el.style.transform = p >= 1 ? '' : `translate(${(mv.dx * (1 - e)).toFixed(2)}px, ${(mv.dy * (1 - e)).toFixed(2)}px)`;
    }
  }

  termRect(key?: string): DOMRect | null {
    if (!key || key === 'all') return this.st.local(this.to.getBoundingClientRect());
    const t = this.to.querySelector(`[data-m="${key}"]`);
    return t ? this.st.local(t.getBoundingClientRect()) : null;
  }
}

class BoxObj extends Obj {
  build(): void {
    const id = this.s.kind === 'box' ? this.s.m.name : '';
    const stm = this.st.course.formulas.statements[id];
    const kind = stm ? STATEMENT_LABEL[stm.kind] : 'REMARQUE';
    this.el = h(
      'div',
      { class: `lx-obj lx-box k-${stm?.kind ?? 'remark'}` },
      h('div', { class: 'lx-box-head' }, h('span', { class: 'kd', text: kind }), h('span', { class: 'tt', text: stm?.title ?? id })),
      rich(stm?.body ?? '', 'lx-box-body rich'),
    );
  }
  layout(): void {
    const r = this.placeInSlot(this.el);
    const el = this.el as HTMLElement;
    el.style.height = 'auto';
    el.style.maxHeight = `${r.height}px`;
    el.classList.remove('dense', 'denser');
    if (el.scrollHeight > r.height) el.classList.add('dense');
    if (el.scrollHeight > r.height) el.classList.add('denser');
  }
  update(T: number): void {
    const p = ease(this.prog(T));
    (this.el as HTMLElement).style.clipPath = p >= 1 ? '' : `inset(0 0 ${((1 - p) * 100).toFixed(1)}% 0)`;
  }
}

const GLYPHS = '#%&/\\<>_=+*01ΣΔΛΞ∂∫';
class TitleObj extends Obj {
  private main!: HTMLElement;
  private sub!: HTMLElement;
  build(): void {
    this.main = h('div', { class: 'lx-title-main' });
    this.sub = h('div', { class: 'lx-title-sub' });
    this.el = h('div', { class: 'lx-obj lx-title' }, h('div', { class: 'lx-title-kicker', text: this.s.m.args.kicker ?? '' }), this.main, this.sub);
  }
  layout(): void {
    this.placeInSlot(this.el);
  }
  update(T: number): void {
    const text = this.s.m.args.text ?? '';
    const p = this.prog(T);
    const n = Math.ceil(p * text.length);
    let s = text.slice(0, n);
    if (p < 1 && !this.st.reduced)
      s += [...Array(Math.min(3, text.length - n))].map((_, i) => GLYPHS[(Math.floor(T * 24) + i * 7) % GLYPHS.length]).join('');
    if (this.main.textContent !== s) this.main.textContent = s;
    const sub = this.s.m.args.sub ?? '';
    const ps = this.prog(T, this.s.t0 + this.s.dur * 0.6, 0.6);
    this.sub.textContent = sub;
    this.sub.style.opacity = String(ps);
    (this.el as HTMLElement).style.opacity = String(clamp01((this.s.tEnd - T) / 0.5));
  }
}

/** marker texts write line breaks as \n (a backslash-n not followed by a letter, so \neq stays LaTeX) */
export const markerText = (s: string): string => s.replace(/\\n(?![a-zA-Z])/g, '\n');

class TextObj extends Obj {
  build(): void {
    this.el = rich(markerText(this.s.m.args.text ?? ''), 'lx-obj lx-text rich');
  }
  layout(): void {
    const r = this.placeInSlot(this.el);
    (this.el as HTMLElement).style.height = 'auto';
    (this.el as HTMLElement).style.maxHeight = `${r.height}px`;
  }
  update(T: number): void {
    const p = ease(this.prog(T));
    const st = (this.el as HTMLElement).style;
    st.opacity = String(p);
    st.transform = `translateY(${((1 - p) * 10).toFixed(1)}px)`;
  }
}

/** {{anim:word text="CHAOS" sub="…" slot=c hold=1.6}}: a large keyword, letters falling into
 *  place while the tracking tightens, then it lifts away (kinetic typography). */
class WordObj extends Obj {
  private letters: HTMLElement[] = [];
  private main!: HTMLElement;
  private sub: HTMLElement | null = null;
  build(): void {
    const text = markerText(this.s.m.args.text ?? '');
    this.main = h('div', { class: 'lx-word-main' });
    this.letters = [...text].map((ch) => h('span', { text: ch === ' ' ? ' ' : ch }));
    this.main.append(...this.letters);
    const sub = this.s.m.args.sub;
    this.sub = sub ? h('div', { class: 'lx-word-sub', text: markerText(sub) }) : null;
    this.el = h('div', { class: 'lx-obj lx-word' }, this.main, this.sub);
    this.el.setAttribute('aria-label', text);
  }
  layout(): void {
    this.placeInSlot(this.el);
  }
  update(T: number): void {
    const n = this.letters.length;
    const span = this.s.dur * 0.55;
    this.letters.forEach((el, i) => {
      const p = ease(this.prog(T, this.s.t0 + (n > 1 ? (i / (n - 1)) * span : 0), this.s.dur - span || 0.3));
      el.style.opacity = String(p);
      el.style.transform = `translateY(${((1 - p) * 0.45).toFixed(3)}em)`;
    });
    const all = ease(this.prog(T));
    this.main.style.letterSpacing = `${(0.12 + (1 - all) * 0.5).toFixed(3)}em`;
    if (this.sub) this.sub.style.opacity = String(this.prog(T, this.s.t0 + this.s.dur * 0.7, 0.5));
    const out = this.st.reduced ? 1 : clamp01((this.s.tEnd - T) / 0.45);
    const st = (this.el as HTMLElement).style;
    st.opacity = String(out);
    st.transform = `translateY(${((out - 1) * 14).toFixed(1)}px)`;
  }
}

/** {{anim:wipe dur=0.8 label="…"}}: a black curtain with a 1px leading edge sweeps the stage;
 *  it covers everything at the marker time, hiding the scene switch behind it. */
class WipeObj extends Obj {
  private curtain!: HTMLElement;
  private edge!: HTMLElement;
  private label!: HTMLElement;
  build(): void {
    this.curtain = h('div', { class: 'lx-wipe-curtain' });
    this.edge = h('i', { class: 'lx-wipe-edge' });
    this.label = h('span', { class: 'lx-wipe-label', text: this.s.m.args.label ?? '' });
    this.el = h('div', { class: 'lx-obj lx-wipe' }, this.curtain, this.edge, this.label);
  }
  layout(): void {
    const st = (this.el as HTMLElement).style;
    st.left = '0';
    st.top = '0';
    st.width = '100%';
    st.height = '100%';
  }
  update(T: number): void {
    const p = ease(this.prog(T));
    // first half: covers from the left; second half: uncovers towards the right
    const a = p < 0.5 ? 0 : (p - 0.5) * 2;
    const b = p < 0.5 ? p * 2 : 1;
    this.curtain.style.clipPath = `inset(0 ${((1 - b) * 100).toFixed(2)}% 0 ${(a * 100).toFixed(2)}%)`;
    const x =`${((p < 0.5 ? b : a) * 100).toFixed(2)}%`;
    this.edge.style.left = x;
    this.label.style.left = x;
    this.label.style.opacity = String(1 - Math.abs(p - 0.5) * 2);
  }
}

// ── plots (axes + curve / area / darboux / lebesgue / point / lines) ─────

type F = (x: number) => number;
const fnCache = new Map<string, F | null>();
function fnOf(src: string | undefined): F | null {
  if (!src) return null;
  if (fnCache.has(src)) return fnCache.get(src)!;
  const c = compile(src, ['x']);
  const f = c.ok ? (c.fn as F) : null;
  fnCache.set(src, f);
  return f;
}

function niceStep(span: number, target = 6): number {
  const raw = span / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

class PlotObj extends Obj {
  private svg!: SVGSVGElement;
  private axes!: SVGGElement;
  private items = new Map<Spec, { g: SVGGElement; key: string }>();
  W = 1;
  H = 1;
  M = 30;
  x0 = -1;
  x1 = 1;
  y0 = -1;
  y1 = 1;

  build(): void {
    this.svg = sv('svg', { class: 'lx-obj lx-plot' });
    const defs = sv('defs', {}, this.svg);
    const pat = sv('pattern', { id: `hatch-${this.s.id}`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1 }, pat);
    this.axes = sv('g', { class: 'ax' }, this.svg);
    this.el = this.svg;
    [this.x0, this.x1] = nums(this.s.m.args.x, [-1, 1]);
    [this.y0, this.y1] = nums(this.s.m.args.y, [-1, 1]);
  }
  X = (x: number) => this.M + ((x - this.x0) / (this.x1 - this.x0)) * (this.W - 2 * this.M);
  Y = (y: number) => this.H - this.M - ((y - this.y0) / (this.y1 - this.y0)) * (this.H - 2 * this.M);

  layout(): void {
    const r = this.placeInSlot(this.svg);
    this.W = r.width;
    this.H = r.height;
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    this.axes.replaceChildren();
    const ay = this.y0 <= 0 && this.y1 >= 0 ? 0 : this.y0;
    const ax = this.x0 <= 0 && this.x1 >= 0 ? 0 : this.x0;
    if (this.s.m.flags.includes('grid')) {
      const sx = niceStep(this.x1 - this.x0);
      const sy = niceStep(this.y1 - this.y0, 5);
      for (let x = Math.ceil(this.x0 / sx) * sx; x <= this.x1 + 1e-9; x += sx) sv('line', { x1: this.X(x), x2: this.X(x), y1: this.Y(this.y0), y2: this.Y(this.y1), class: 'gr' }, this.axes);
      for (let y = Math.ceil(this.y0 / sy) * sy; y <= this.y1 + 1e-9; y += sy) sv('line', { y1: this.Y(y), y2: this.Y(y), x1: this.X(this.x0), x2: this.X(this.x1), class: 'gr' }, this.axes);
    }
    sv('line', { x1: this.X(this.x0), x2: this.X(this.x1), y1: this.Y(ay), y2: this.Y(ay), class: 'axl' }, this.axes);
    sv('line', { x1: this.X(ax), x2: this.X(ax), y1: this.Y(this.y0), y2: this.Y(this.y1), class: 'axl' }, this.axes);
    const fmt = (v: number) => String(+v.toFixed(3)).replace('.', ',');
    if (!this.s.m.flags.includes('noticks')) {
      const sx = niceStep(this.x1 - this.x0);
      for (let x = Math.ceil(this.x0 / sx) * sx; x <= this.x1 + 1e-9; x += sx) {
        if (Math.abs(x - ax) < 1e-9) continue;
        sv('line', { x1: this.X(x), x2: this.X(x), y1: this.Y(ay) - 3, y2: this.Y(ay) + 3, class: 'axl' }, this.axes);
        sv('text', { x: this.X(x), y: this.Y(ay) + 14, class: 'tk', 'text-anchor': 'middle' }, this.axes).textContent = fmt(x);
      }
      const sy = niceStep(this.y1 - this.y0, 5);
      for (let y = Math.ceil(this.y0 / sy) * sy; y <= this.y1 + 1e-9; y += sy) {
        if (Math.abs(y - ay) < 1e-9) continue;
        sv('line', { y1: this.Y(y), y2: this.Y(y), x1: this.X(ax) - 3, x2: this.X(ax) + 3, class: 'axl' }, this.axes);
        sv('text', { x: this.X(ax) - 6, y: this.Y(y) + 3, class: 'tk', 'text-anchor': 'end' }, this.axes).textContent = fmt(y);
      }
    }
    if (this.s.m.args.xl) sv('text', { x: this.X(this.x1), y: this.Y(ay) - 6, class: 'lb', 'text-anchor': 'end' }, this.axes).textContent = this.s.m.args.xl;
    if (this.s.m.args.yl) sv('text', { x: this.X(ax) + 6, y: this.Y(this.y1) + 4, class: 'lb' }, this.axes).textContent = this.s.m.args.yl;
    for (const it of this.items.values()) it.key = '';
  }

  update(T: number): void {
    this.axes.style.opacity = String(ease(this.prog(T)));
    for (const c of this.s.children) {
      const alive = T >= c.t0 && T < c.tEnd;
      let it = this.items.get(c);
      if (!alive) {
        if (it) it.g.style.display = 'none';
        continue;
      }
      if (!it) {
        it = { g: sv('g', { class: `pi pi-${c.kind}` }, this.svg), key: '' };
        this.items.set(c, it);
      }
      it.g.style.display = '';
      this.drawItem(c, it, T);
    }
  }

  private drawItem(c: Spec, it: { g: SVGGElement; key: string }, T: number): void {
    const a = c.m.args;
    const p = this.prog(T, c.t0, c.dur);
    const f = fnOf(a.fn);
    const from = argAt(c, 'from', T, this.x0);
    const to = argAt(c, 'to', T, this.x1);
    const g = it.g;
    const rebuild = (key: string, draw: () => void) => {
      if (it.key === key) return;
      it.key = key;
      g.replaceChildren();
      draw();
    };
    switch (c.kind) {
      case 'curve': {
        rebuild(`${from}|${to}`, () => {
          if (!f) return;
          let d = '';
          let len = 0;
          let px = 0;
          let py = 0;
          let pen = false;
          const N = 360;
          for (let i = 0; i <= N; i++) {
            const x = from + ((to - from) * i) / N;
            const y = f(x);
            if (!Number.isFinite(y) || y < this.y0 - (this.y1 - this.y0) || y > this.y1 + (this.y1 - this.y0)) {
              pen = false;
              continue;
            }
            const X = this.X(x);
            const Y = this.Y(y);
            if (pen) len += Math.hypot(X - px, Y - py);
            d += `${pen ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}`;
            px = X;
            py = Y;
            pen = true;
          }
          const path = sv('path', { d, class: `cv${c.m.flags.includes('dashed') ? ' dashed' : ''}` }, g);
          path.dataset.len = String(len);
          if (a.label) {
            const lx = to - (to - from) * 0.08;
            const ly = f(lx);
            if (Number.isFinite(ly)) sv('text', { x: this.X(lx), y: this.Y(ly) - 8, class: 'lb', 'text-anchor': 'end' }, g).textContent = a.label;
          }
        });
        const path = g.querySelector('path');
        if (path && !c.m.flags.includes('dashed')) {
          const len = Number(path.dataset.len) || 1;
          path.style.strokeDasharray = `${len}`;
          path.style.strokeDashoffset = `${(1 - ease(p)) * len}`;
        }
        const lb = g.querySelector('text');
        if (lb) lb.style.opacity = String(p >= 1 ? 1 : 0);
        break;
      }
      case 'area': {
        // swept from left to right while it appears
        const e = Math.round(ease(p) * 200) / 200;
        rebuild(`${from}|${to}|${e}`, () => {
          if (!f || e <= 0) return;
          const end = from + (to - from) * e;
          const N = 200;
          let d = `M${this.X(from)},${this.Y(0)}`;
          for (let i = 0; i <= N; i++) {
            const x = from + ((end - from) * i) / N;
            const y = Math.max(this.y0, Math.min(this.y1, f(x)));
            d += `L${this.X(x).toFixed(1)},${this.Y(Number.isFinite(y) ? y : 0).toFixed(1)}`;
          }
          d += `L${this.X(end)},${this.Y(0)}Z`;
          sv('path', { d, fill: `url(#hatch-${this.s.id})`, class: 'ar' }, g);
          if (a.label && e >= 1) sv('text', { x: this.X((from + to) / 2), y: this.Y(0) - 10, class: 'lb', 'text-anchor': 'middle' }, g).textContent = a.label;
        });
        break;
      }
      case 'darboux': {
        const n = Math.max(1, Math.round(argAt(c, 'n', T, 4)));
        const kind = a.kind ?? 'lower';
        rebuild(`${n}|${from}|${to}|${kind}`, () => {
          if (!f) return;
          const pts = (a.points ?? '').split(',').filter(Boolean).map(Number);
          const xs = pts.length >= 2 ? pts : [...Array(n + 1)].map((_, i) => from + ((to - from) * i) / n);
          for (let i = 0; i < xs.length - 1; i++) {
            const u = xs[i];
            const v = xs[i + 1];
            let lo = Infinity;
            let hi = -Infinity;
            for (let k = 0; k <= 48; k++) {
              const y = f(u + ((v - u) * k) / 48);
              if (Number.isFinite(y)) {
                lo = Math.min(lo, y);
                hi = Math.max(hi, y);
              }
            }
            const heights: [number, string][] =
              kind === 'both' ? [[hi, 'up'], [lo, 'lo']] : kind === 'upper' ? [[hi, 'up']] : kind === 'left' ? [[f(u), 'lo']] : kind === 'right' ? [[f(v), 'lo']] : kind === 'mid' ? [[f((u + v) / 2), 'lo']] : [[lo, 'lo']];
            for (const [y, cls] of heights) {
              const yy = Math.max(this.y0, Math.min(this.y1, y));
              const top = Math.min(this.Y(yy), this.Y(0));
              const r = sv('rect', { x: this.X(u), y: top, width: Math.max(0.5, this.X(v) - this.X(u)), height: Math.abs(this.Y(yy) - this.Y(0)), class: `rc ${cls}` }, g);
              r.dataset.i = String(i);
            }
          }
        });
        const count = Math.ceil(ease(p) * n);
        g.querySelectorAll<SVGRectElement>('rect').forEach((r) => (r.style.opacity = Number(r.dataset.i) < count ? '1' : '0'));
        break;
      }
      case 'lebesgue': {
        const n = Math.max(1, Math.round(argAt(c, 'n', T, 5)));
        rebuild(`${n}|${from}|${to}`, () => {
          if (!f) return;
          const N = 600;
          const xs = [...Array(N + 1)].map((_, i) => from + ((to - from) * i) / N);
          const ys = xs.map((x) => f(x));
          const top = Math.min(this.y1, Math.max(...ys.filter(Number.isFinite)));
          const dy = top / n;
          for (let k = 0; k < n; k++) {
            const lvl = k * dy;
            // {x : f(x) > lvl} as a union of intervals → a horizontal layer of height dy
            let start: number | null = null;
            for (let i = 0; i <= N; i++) {
              const inside = ys[i] > lvl + 1e-12;
              if (inside && start === null) start = xs[i];
              if ((!inside || i === N) && start !== null) {
                const end = inside ? xs[i] : xs[i - 1];
                const r = sv('rect', { x: this.X(start), y: this.Y(lvl + dy), width: Math.max(0.5, this.X(end) - this.X(start)), height: Math.abs(this.Y(lvl + dy) - this.Y(lvl)), class: 'rc lvl' }, g);
                r.dataset.i = String(k);
                const s2 = sv('line', { x1: this.X(start), x2: this.X(end), y1: this.Y(0) + 6 + k * 3, y2: this.Y(0) + 6 + k * 3, class: 'set' }, g);
                s2.dataset.i = String(k);
                start = null;
              }
            }
          }
        });
        const count = Math.ceil(ease(p) * n);
        g.querySelectorAll<SVGElement>('[data-i]').forEach((r) => (r.style.opacity = Number(r.dataset.i) < count ? '1' : '0'));
        break;
      }
      case 'point': {
        const x = argAt(c, 'x', T, 0);
        const y = a.y !== undefined ? argAt(c, 'y', T, 0) : f ? f(x) : 0;
        rebuild(`${x}|${y}`, () => {
          sv('circle', { cx: this.X(x), cy: this.Y(y), r: 3.5, class: 'pt' }, g);
          if (a.label) sv('text', { x: this.X(x) + 7, y: this.Y(y) - 7, class: 'lb' }, g).textContent = a.label;
        });
        g.style.opacity = String(p);
        break;
      }
      case 'vline':
      case 'hline':
      case 'segment': {
        const x = argAt(c, 'x', T, 0);
        const y = argAt(c, 'y', T, 0);
        const seg = nums(a.at, [this.x0, this.y0, this.x1, this.y1]);
        rebuild(`${x}|${y}|${a.at}`, () => {
          const [X1, Y1, X2, Y2] =
            c.kind === 'vline' ? [this.X(x), this.Y(this.y0), this.X(x), this.Y(this.y1)] : c.kind === 'hline' ? [this.X(this.x0), this.Y(y), this.X(this.x1), this.Y(y)] : [this.X(seg[0]), this.Y(seg[1]), this.X(seg[2]), this.Y(seg[3])];
          sv('line', { x1: X1, y1: Y1, x2: X2, y2: Y2, class: `ln${c.m.flags.includes('dashed') ? ' dashed' : ''}${c.m.flags.includes('bold') ? ' bold' : ''}` }, g);
          if (a.label) sv('text', { x: c.kind === 'vline' ? X1 + 5 : X2 - 4, y: c.kind === 'vline' ? Y2 + 12 : Y2 - 6, class: 'lb', 'text-anchor': c.kind === 'vline' ? 'start' : 'end' }, g).textContent = a.label;
        });
        g.style.opacity = String(ease(p));
        break;
      }
    }
  }
}

// ── linear map on a grid ────────────────────────────────────────────────

class GridObj extends Obj {
  private svg!: SVGSVGElement;
  private g!: SVGGElement;
  private W = 1;
  private H = 1;
  private key = '';
  build(): void {
    this.svg = sv('svg', { class: 'lx-obj lx-grid' });
    const defs = sv('defs', {}, this.svg);
    const pat = sv('pattern', { id: `ghatch-${this.s.id}`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(255,255,255,.3)', 'stroke-width': 1 }, pat);
    const clip = sv('clipPath', { id: `gclip-${this.s.id}` }, defs);
    sv('rect', { x: 0, y: 0, width: 10, height: 10, class: 'clipr' }, clip);
    this.g = sv('g', { 'clip-path': `url(#gclip-${this.s.id})` }, this.svg);
    this.el = this.svg;
  }
  layout(): void {
    const r = this.placeInSlot(this.svg);
    this.W = r.width;
    this.H = r.height;
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    const cr = this.svg.querySelector('.clipr')!;
    cr.setAttribute('width', String(this.W));
    cr.setAttribute('height', String(this.H));
    this.key = '';
  }
  update(T: number): void {
    const target = nums(this.s.m.args.m, [1, 0, 0, 1]);
    const e = ease(this.prog(T));
    let M = [1 + (target[0] - 1) * e, target[1] * e, target[2] * e, 1 + (target[3] - 1) * e];
    for (const tw of this.s.tweens) {
      if (T < tw.t || !tw.args.m) continue;
      const to = nums(tw.args.m, M);
      const k = ease(clamp01((T - tw.t) / Math.max(1e-6, tw.dur)));
      M = M.map((x, i) => x + (to[i] - x) * k);
    }
    const key = M.map((x) => x.toFixed(4)).join(',');
    if (key === this.key) return;
    this.key = key;
    const R = num(this.s.m.args.r, 3);
    const s = Math.min(this.W, this.H) / (2 * R + 0.6);
    const cx = this.W / 2;
    const cy = this.H / 2;
    const P = (x: number, y: number): [number, number] => [cx + (M[0] * x + M[1] * y) * s, cy - (M[2] * x + M[3] * y) * s];
    const g = this.g;
    g.replaceChildren();
    const L = Math.ceil(R * 3);
    // faint reference grid, then the transformed one
    for (let k = -L; k <= L; k++) {
      sv('line', { x1: cx + k * s, x2: cx + k * s, y1: 0, y2: this.H, class: 'g0' }, g);
      sv('line', { y1: cy + k * s, y2: cy + k * s, x1: 0, x2: this.W, class: 'g0' }, g);
    }
    for (let k = -L; k <= L; k++) {
      const [a1, b1] = P(k, -L);
      const [a2, b2] = P(k, L);
      const [c1, d1] = P(-L, k);
      const [c2, d2] = P(L, k);
      sv('line', { x1: a1, y1: b1, x2: a2, y2: b2, class: k === 0 ? 'g2' : 'g1' }, g);
      sv('line', { x1: c1, y1: d1, x2: c2, y2: d2, class: k === 0 ? 'g2' : 'g1' }, g);
    }
    const [ox, oy] = P(0, 0);
    const [ex, ey] = P(1, 0);
    const [fx, fy] = P(0, 1);
    const [gx, gy] = P(1, 1);
    sv('path', { d: `M${ox},${oy}L${ex},${ey}L${gx},${gy}L${fx},${fy}Z`, fill: `url(#ghatch-${this.s.id})`, class: 'sq' }, g);
    const arrow = (x: number, y: number, label: string) => {
      sv('line', { x1: ox, y1: oy, x2: x, y2: y, class: 'bv' }, g);
      const ang = Math.atan2(y - oy, x - ox);
      const hx = (a: number) => `${x - 9 * Math.cos(ang + a)},${y - 9 * Math.sin(ang + a)}`;
      sv('path', { d: `M${x},${y}L${hx(0.4)}L${hx(-0.4)}Z`, class: 'ah' }, g);
      sv('text', { x: x + 6, y: y - 6, class: 'lb' }, g).textContent = label;
    };
    arrow(ex, ey, this.s.m.args.e1 ?? 'u(e₁)');
    arrow(fx, fy, this.s.m.args.e2 ?? 'u(e₂)');
    if (this.s.m.flags.includes('eig')) {
      // real eigen-directions of the final matrix
      const [a, b, c, d] = target;
      const tr = a + d;
      const det = a * d - b * c;
      const disc = tr * tr - 4 * det;
      if (disc >= 0) {
        for (const lam of [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2]) {
          let vx = b;
          let vy = lam - a;
          if (Math.abs(vx) + Math.abs(vy) < 1e-9) [vx, vy] = [lam - d, c];
          if (Math.abs(vx) + Math.abs(vy) < 1e-9) [vx, vy] = [1, 0];
          const n = Math.hypot(vx, vy);
          vx /= n;
          vy /= n;
          sv('line', { x1: cx - vx * s * 3 * R, y1: cy + vy * s * 3 * R, x2: cx + vx * s * 3 * R, y2: cy - vy * s * 3 * R, class: 'eg' }, g);
          sv('text', { x: cx + vx * s * (R - 0.4) + 6, y: cy - vy * s * (R - 0.4) - 6, class: 'lb' }, g).textContent = `λ = ${String(+lam.toFixed(3)).replace('.', ',')}`;
        }
      }
    }
    if (this.s.m.flags.includes('det')) {
      const det = M[0] * M[3] - M[1] * M[2];
      sv('text', { x: 10, y: this.H - 10, class: 'lb' }, g).textContent = `det = ${det.toFixed(2).replace('.', ',')}`;
    }
  }
}

// ── highlight and arrow (overlay SVG) ─────────────────────────────────────

class MarkObj extends Obj {
  private g!: SVGGElement;
  build(): void {
    this.g = sv('g', { class: `lx-mark ${this.s.kind}` });
    this.el = this.g;
    this.st.marks.append(this.g);
  }
  update(T: number): void {
    const p = ease(this.prog(T));
    const g = this.g;
    g.replaceChildren();
    const objOf = (spec: Spec) => this.st.objOf(spec);
    if (this.s.kind === 'highlight') {
      const o = objOf(this.s.targets[0]);
      const r = o?.termRect(this.s.m.args.term);
      if (!r) return;
      const pad = 5;
      const x0 = r.left - pad;
      const y0 = r.top - pad;
      const x1 = r.right + pad;
      const y1 = r.bottom + pad;
      if (this.s.m.flags.includes('underline')) {
        const w = (x1 - x0) * p;
        sv('line', { x1: x0, y1: y1, x2: x0 + w, y2: y1, class: 'hl' }, g);
      } else {
        const L = Math.min(14, (x1 - x0) / 3, (y1 - y0) / 2) * p;
        const d = `M${x0},${y0 + L}V${y0}H${x0 + L}M${x1 - L},${y0}H${x1}V${y0 + L}M${x1},${y1 - L}V${y1}H${x1 - L}M${x0 + L},${y1}H${x0}V${y1 - L}`;
        sv('path', { d, class: 'hl' }, g);
        if (this.s.m.flags.includes('fill')) sv('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, class: 'hlf', opacity: p * 0.12 }, g);
      }
      if (this.s.m.args.label) {
        const t = sv('text', { x: (x0 + x1) / 2, y: y1 + 16, class: 'lb', 'text-anchor': 'middle' }, g);
        t.textContent = this.s.m.args.label;
        t.style.opacity = String(p);
      }
      return;
    }
    // arrow between two objects (or terms)
    const [fa, ta] = [this.s.m.args.from ?? '', this.s.m.args.to ?? ''];
    const ra = objOf(this.s.targets[0])?.termRect(fa.split(':')[1]);
    const rb = objOf(this.s.targets[1])?.termRect(ta.split(':')[1]);
    if (!ra || !rb) return;
    const ca = [ra.left + ra.width / 2, ra.top + ra.height / 2];
    const cb = [rb.left + rb.width / 2, rb.top + rb.height / 2];
    const edge = (r: DOMRect, c: number[], dx: number, dy: number): [number, number] => {
      const kx = dx ? (r.width / 2 + 6) / Math.abs(dx) : Infinity;
      const ky = dy ? (r.height / 2 + 6) / Math.abs(dy) : Infinity;
      const k = Math.min(kx, ky);
      return [c[0] + dx * k, c[1] + dy * k];
    };
    const dx = cb[0] - ca[0];
    const dy = cb[1] - ca[1];
    const n = Math.hypot(dx, dy) || 1;
    const [x1, y1] = edge(ra, ca, dx / n, dy / n);
    const [x2, y2] = edge(rb, cb, -dx / n, -dy / n);
    const xe = x1 + (x2 - x1) * p;
    const ye = y1 + (y2 - y1) * p;
    sv('line', { x1, y1, x2: xe, y2: ye, class: 'ar' }, g);
    if (p > 0.05) {
      const ang = Math.atan2(ye - y1, xe - x1);
      const hx = (a: number) => `${xe - 10 * Math.cos(ang + a)},${ye - 10 * Math.sin(ang + a)}`;
      sv('path', { d: `M${xe},${ye}L${hx(0.38)}L${hx(-0.38)}Z`, class: 'ah' }, g);
    }
    if (this.s.m.args.label && p >= 1) sv('text', { x: (x1 + x2) / 2 + 8, y: (y1 + y2) / 2 - 8, class: 'lb' }, g).textContent = this.s.m.args.label;
  }
  box(): DOMRect | null {
    return null;
  }
}

// ── stage ───────────────────────────────────────────────────────────────

const FACTORY: Record<string, new (s: Spec, st: Stage) => Obj> = {
  write: EqObj,
  morph: EqObj,
  box: BoxObj,
  title: TitleObj,
  word: WordObj,
  wipe: WipeObj,
  text: TextObj,
  axes: PlotObj,
  grid: GridObj,
  highlight: MarkObj,
  arrow: MarkObj,
};

export class Stage {
  readonly root: HTMLElement;
  readonly marks: SVGSVGElement;
  readonly specs: Spec[];
  readonly reduced = reducedMotion();
  private objs = new Map<Spec, Obj>();
  /** mount time of each object: re-measured while KaTeX fonts may still be loading */
  private born = new Map<Obj, number>();
  private origin = { x: 0, y: 0 };
  private w = 1;
  private h = 1;

  constructor(
    host: HTMLElement,
    readonly course: Course,
    tl: Timeline,
    readonly errors: string[],
  ) {
    this.root = h('div', { class: 'lx', 'aria-hidden': 'true' });
    this.marks = sv('svg', { class: 'lx-marks' });
    this.root.append(this.marks);
    host.append(this.root);
    this.specs = compileSpecs(tl, course, errors);
    this.resize();
    document.fonts?.addEventListener('loadingdone', this.onFonts);
  }

  private onFonts = (): void => this.resize();

  /** stage-local rectangle of a slot */
  rect(slot: string): DOMRect {
    const f = SLOTS[slot] ?? SLOTS.c;
    return new DOMRect(f[0] * this.w, f[1] * this.h, (f[2] - f[0]) * this.w, (f[3] - f[1]) * this.h);
  }

  local(r: DOMRect): DOMRect {
    return new DOMRect(r.left - this.origin.x, r.top - this.origin.y, r.width, r.height);
  }

  objOf(s: Spec): Obj | undefined {
    return this.objs.get(s);
  }

  resize(): void {
    const r = this.root.getBoundingClientRect();
    this.origin = { x: r.left, y: r.top };
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.marks.setAttribute('viewBox', `0 0 ${this.w} ${this.h}`);
    for (const o of this.objs.values()) o.layout();
  }

  /** Show the objects alive at course time T. */
  update(T: number): void {
    const r = this.root.getBoundingClientRect();
    if (Math.abs(r.width - this.w) > 0.5 || Math.abs(r.height - this.h) > 0.5 || r.left !== this.origin.x || r.top !== this.origin.y) this.resize();
    for (const s of this.specs) {
      if (s.parent) continue;
      const alive = T >= s.t0 && T < s.tEnd;
      let o = this.objs.get(s);
      if (!alive) {
        if (o) {
          o.el.remove();
          this.objs.delete(s);
          this.born.delete(o);
        }
        continue;
      }
      if (!o) {
        const C = FACTORY[s.kind];
        if (!C) continue;
        o = new C(s, this);
        o.build();
        if (!(o instanceof MarkObj)) this.root.insertBefore(o.el, this.marks);
        this.objs.set(s, o);
        this.born.set(o, performance.now());
        o.layout();
      } else {
        const age = performance.now() - (this.born.get(o) ?? 0);
        if (age < 900) o.layout();
        else this.born.delete(o);
      }
    }
    // marks last: they read the boxes of the other objects
    for (const o of this.objs.values()) if (!(o instanceof MarkObj)) o.update(T);
    for (const o of this.objs.values()) if (o instanceof MarkObj) o.update(T);
  }

  /** statements shown up to time T (for the summary sheet and the search index) */
  statementsUntil(T = Infinity): string[] {
    return this.specs.filter((s) => s.kind === 'box' && s.t0 <= T).map((s) => s.m.name);
  }

  dispose(): void {
    document.fonts?.removeEventListener('loadingdone', this.onFonts);
    this.root.remove();
    this.objs.clear();
    this.born.clear();
  }
}
