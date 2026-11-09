import katex from 'katex';
import { h, setText } from './dom';
import { hexId, icon } from './deco';
import { Sparkline } from './telemetry';
import { compile, type Compiled } from '../math/parser';
import { sfx } from '../core/audio';

export interface Handle<T> {
  el: HTMLElement;
  get(): T;
  /** Update the control; `silent` skips the change callback. */
  set(v: T, silent?: boolean): void;
}

type Opt<T extends string> = T | { id: T; label: string };

const defaultFmt = (step: number) => (v: number) => {
  const d = step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step)));
  return v.toFixed(d).replace('.', ',').replace('-', '−');
};

/** Controls of the current view, addressable by label (used by guided tours and the tutorial).
 *  Reset by the app when the view changes. */
const REGISTRY = { controls: new Map<string, Handle<any>>(), options: new Map<string, () => void>(), optionEls: new Map<string, HTMLElement>() };
export function resetUiRegistry(): void {
  REGISTRY.controls.clear();
  REGISTRY.options.clear();
  REGISTRY.optionEls.clear();
}
/** the element showing a control, an option button or a readout, by its exact label (exercise spotlight) */
export function uiElement(label: string): HTMLElement | undefined {
  return REGISTRY.optionEls.get(label) ?? REGISTRY.controls.get(label)?.el ?? REGISTRY.controls.get(`ro:${label}`)?.el;
}
export function uiControl(label: string): Handle<any> | undefined {
  return REGISTRY.controls.get(label);
}
export function uiOption(label: string): (() => void) | undefined {
  return REGISTRY.options.get(label);
}

export function renderTeX(el: HTMLElement, tex: string, display = true): void {
  try {
    katex.render(tex, el, { displayMode: display, throwOnError: false, errorColor: '#ffffff', strict: 'ignore', output: 'html' });
  } catch {
    el.textContent = tex;
  }
}

/** Builder for the right-hand control panel. Cleared when the view changes. */
export class UI {
  constructor(readonly root: HTMLElement) {}

  clear(): void {
    this.root.replaceChildren();
  }

  section(title: string): HTMLElement {
    const el = h('div', { class: 'sec' }, h('span', { text: title }), h('span', { class: 'hex', text: hexId(title, 4) }));
    this.root.append(el);
    return el;
  }

  note(html: string): HTMLElement {
    const el = h('p', { class: 'ctl-note', html });
    this.root.append(el);
    return el;
  }

  slider(o: {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    log?: boolean;
    fmt?: (v: number) => string;
    onInput: (v: number) => void;
  }): Handle<number> {
    const step = o.step ?? (o.max - o.min) / 100;
    const fmt = o.fmt ?? defaultFmt(step);
    const RES = 1000;
    const toPos = (v: number) =>
      o.log ? (Math.log(v / o.min) / Math.log(o.max / o.min)) * RES : v;
    const fromPos = (p: number) => {
      let v = o.log ? o.min * Math.pow(o.max / o.min, p / RES) : p;
      if (step > 0) v = Math.round(v / step) * step;
      return Math.min(o.max, Math.max(o.min, v));
    };
    const input = h('input', {
      type: 'range',
      min: o.log ? 0 : o.min,
      max: o.log ? RES : o.max,
      step: o.log ? 1 : step,
      value: toPos(o.value),
      'aria-label': o.label,
    }) as HTMLInputElement;
    const val = h('span', { class: 'ctl-val', text: fmt(o.value) });
    const el = h('label', { class: 'ctl ctl-slider' }, h('span', { class: 'ctl-head' }, h('span', { class: 'ctl-label', text: o.label }), val), input);
    let value = o.value;
    const paint = () => {
      const p = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min) || 1);
      input.style.setProperty('--p', `${(p * 100).toFixed(2)}%`);
    };
    paint();
    input.addEventListener('input', () => {
      value = fromPos(Number(input.value));
      setText(val, fmt(value));
      paint();
      o.onInput(value);
    });
    input.addEventListener('change', () => sfx.tick());
    this.root.append(el);
    const api: Handle<number> = {
      el,
      get: () => value,
      set: (v, silent) => {
        value = v;
        input.value = String(toPos(v));
        setText(val, fmt(v));
        paint();
        if (!silent) o.onInput(v);
      },
    };
    REGISTRY.controls.set(o.label, api);
    return api;
  }

  segmented<T extends string>(o: {
    label?: string;
    options: Opt<T>[];
    value: T;
    cols?: number;
    onChange: (id: T) => void;
  }): Handle<T> {
    const opts = o.options.map((x) => (typeof x === 'string' ? { id: x, label: x } : x));
    let value = o.value;
    const seg = h('div', { class: 'seg' + (o.cols ? ' cols' : ''), role: 'group', style: o.cols ? `--cols:${o.cols}` : null });
    const buttons = opts.map((op) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(op.id === value), title: op.label, text: op.label });
      b.addEventListener('click', () => {
        if (value === op.id) return;
        sfx.click();
        api.set(op.id);
      });
      seg.append(b);
      return b;
    });
    const el = h('div', { class: 'ctl' }, o.label ? h('div', { class: 'ctl-head' }, h('span', { class: 'ctl-label', text: o.label })) : null, seg);
    this.root.append(el);
    // a single long word wider than its button (« IRRATIONALITÉ »): tighter letter-spacing, never cut
    requestAnimationFrame(() => buttons.forEach((b) => b.scrollWidth > b.clientWidth + 1 && b.classList.add('tight')));
    const api: Handle<T> = {
      el,
      get: () => value,
      set: (id, silent) => {
        value = id;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(opts[i].id === id)));
        if (!silent) o.onChange(id);
      },
    };
    if (o.label) REGISTRY.controls.set(o.label, api);
    for (const op of opts) REGISTRY.options.set(op.label, () => value !== op.id && api.set(op.id));
    opts.forEach((op, i) => REGISTRY.optionEls.set(op.label, buttons[i]));
    return api;
  }

  toggle(o: { label: string; value: boolean; onChange: (v: boolean) => void }): Handle<boolean> {
    let value = o.value;
    const el = h('button', { type: 'button', class: 'tgl', 'aria-pressed': String(value), text: o.label });
    el.addEventListener('click', () => {
      sfx.click();
      api.set(!value);
    });
    this.root.append(el);
    const api: Handle<boolean> = {
      el,
      get: () => value,
      set: (v, silent) => {
        value = v;
        el.setAttribute('aria-pressed', String(v));
        if (!silent) o.onChange(v);
      },
    };
    REGISTRY.controls.set(o.label, api);
    return api;
  }

  button(label: string, onClick: () => void, opts: { icon?: string; key?: string; parent?: HTMLElement } = {}): HTMLButtonElement {
    const b = h('button', { type: 'button', class: 'btn' }, opts.icon ? icon(opts.icon) : null, h('span', { text: label }), opts.key ? h('span', { class: 'k', text: opts.key }) : null);
    b.addEventListener('click', () => {
      sfx.click();
      onClick();
    });
    (opts.parent ?? this.root).append(b);
    return b;
  }

  buttons(list: { label: string; onClick: () => void; icon?: string }[]): HTMLButtonElement[] {
    const row = h('div', { class: 'btn-row' });
    this.root.append(row);
    return list.map((b) => this.button(b.label, b.onClick, { icon: b.icon, parent: row }));
  }

  readout(label: string, value = '—'): Handle<string> {
    const v = h('span', { class: 'v', text: value });
    const el = h('div', { class: 'ro' }, h('span', { class: 'k', text: label }), v);
    this.root.append(el);
    let cur = value;
    const api: Handle<string> = { el, get: () => cur, set: (s) => { cur = s; setText(v, s); } };
    REGISTRY.controls.set(`ro:${label}`, api);
    return api;
  }

  /** Expression input compiled live by the math parser. */
  formula<T extends { ok: true; src: string; tex: string } = Compiled>(o: {
    label?: string;
    prefix: string;
    value: string;
    vars: string[];
    presets?: string[];
    /** Custom compiler (e.g. complex mode); defaults to the real parser with `vars`. */
    compiler?: (src: string) => T | { ok: false; error: string };
    onChange: (c: T) => void;
  }): Handle<string> & { compiled: () => T | null } {
    const comp = o.compiler ?? ((s: string) => compile(s, o.vars) as unknown as T | { ok: false; error: string });
    const input = h('input', { type: 'text', value: o.value, spellcheck: 'false', autocomplete: 'off', 'aria-label': o.label ?? o.prefix }) as HTMLInputElement;
    const field = h('div', { class: 'field' }, h('span', { class: 'pre', text: o.prefix }), input);
    const msg = h('div', { class: 'field-msg', text: `variables : ${o.vars.join(', ')}` });
    const tex = h('div', { class: 'field-tex' });
    const chips = o.presets?.length ? h('div', { class: 'chips' }) : null;
    const el = h('div', { class: 'ctl' }, o.label ? h('div', { class: 'ctl-head' }, h('span', { class: 'ctl-label', text: o.label })) : null, field, msg, tex, chips);
    let last: T | null = null;
    let timer = 0;
    const run = (src: string, notify: boolean) => {
      const c = comp(src);
      if (c.ok) {
        last = c;
        field.classList.remove('err');
        msg.classList.remove('err');
        msg.replaceChildren(h('span', { text: '◇ OK · ' }), h('span', { class: 'dim', text: `variables : ${o.vars.join(', ')}` }));
        renderTeX(tex, c.tex, false);
        if (notify) o.onChange(c);
      } else {
        field.classList.add('err');
        msg.classList.add('err');
        msg.replaceChildren(icon('warn'), h('span', { text: ' ' + c.error }));
      }
    };
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => run(input.value, true), 180);
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        clearTimeout(timer);
        run(input.value, true);
        input.blur();
      }
      if (e.key === 'Escape') input.blur();
    });
    if (chips && o.presets) {
      for (const p of o.presets) {
        const b = h('button', { type: 'button', text: p });
        b.addEventListener('click', () => {
          sfx.click();
          input.value = p;
          run(p, true);
        });
        chips.append(b);
      }
    }
    run(o.value, false);
    this.root.append(el);
    const api = {
      el,
      get: () => input.value,
      set: (v: string, silent?: boolean) => {
        input.value = v;
        run(v, !silent);
      },
      compiled: () => last,
    };
    REGISTRY.controls.set(o.label ?? o.prefix, api);
    return api;
  }

  spark(label: string, opts: { min?: number; max?: number; log?: boolean; bars?: boolean; size?: number } = {}): Sparkline {
    const s = new Sparkline(opts.size ?? 120, opts);
    const wrap = h('div', { class: 'spark-wrap' }, h('div', { class: 'ctl-head' }, h('span', { class: 'ctl-label', text: label })), s.el);
    this.root.append(wrap);
    return s;
  }

  /** Raw element slot. */
  custom<E extends HTMLElement>(el: E): E {
    this.root.append(el);
    return el;
  }
}
