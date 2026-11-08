import { h } from '../hud/dom';
import { icon, hexId } from '../hud/deco';
import { renderTeX } from '../hud/ui';
import { typewriter } from '../hud/fx';
import { sfx } from '../core/audio';
import type { Formula } from '../core/types';

/** Modal frame used by the palette, keymap, challenge and settings dialogs. */
export class Dialog {
  readonly root: HTMLElement;
  readonly body: HTMLElement;
  readonly foot: HTMLElement;
  onClose?: () => void;
  constructor(title: string, opts: { center?: boolean; width?: number; onClose?: () => void } = {}) {
    this.body = h('div', { class: 'dlg-body' });
    this.foot = h('div', { class: 'dlg-foot' });
    const x = h('button', { class: 'x', type: 'button', 'aria-label': 'Fermer' }, icon('close'));
    x.addEventListener('click', () => this.close());
    const dlg = h(
      'div',
      { class: 'dlg frame solid', role: 'dialog', 'aria-label': title, style: opts.width ? `width:min(${opts.width}px,92vw)` : null },
      h('div', { class: 'dlg-head' }, h('span', { text: `${title}  //  ${hexId(title)}` }), x),
      this.body,
      this.foot,
    );
    this.root = h('div', { class: 'overlay' + (opts.center ? ' center' : '') }, dlg);
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root) this.close();
    });
    this.onClose = opts.onClose;
  }
  open(): this {
    document.body.append(this.root);
    sfx.open();
    return this;
  }
  close(): void {
    if (!this.root.isConnected) return;
    this.root.remove();
    sfx.close();
    this.onClose?.();
  }
  get isOpen(): boolean {
    return this.root.isConnected;
  }
}

export interface KeyDoc {
  label: string;
  keys: string[];
}

export function keymapDialog(docs: KeyDoc[]): Dialog {
  const d = new Dialog('KEYMAP', { center: true, width: 700 });
  const grid = h('div', { class: 'keymap' });
  for (const k of docs) {
    grid.append(h('div', { class: 'row' }, h('span', { text: k.label }), h('span', {}, ...k.keys.map((x) => h('span', { class: 'kbd', text: x })))));
  }
  d.body.append(grid);
  d.foot.append(h('span', { text: 'SOURIS : GLISSER = ORBITE / DÉPLACER · MOLETTE = ZOOM · DOUBLE-CLIC = RECENTRER' }));
  return d;
}

/** Σ sheet: KaTeX formula + short explanation, docked over the viewport. */
export class SigmaSheet {
  private el: HTMLElement | null = null;
  constructor(private host: HTMLElement) {}
  get isOpen(): boolean {
    return !!this.el;
  }
  toggle(title: string, f: Formula): void {
    if (this.el) this.close();
    else this.open(title, f);
  }
  open(title: string, f: Formula): void {
    this.close();
    const tex = h('div', { class: 'sigma-tex' });
    const note = h('div', { class: 'sigma-note' });
    const x = h('button', { type: 'button', 'aria-label': 'Fermer' }, icon('close'));
    x.addEventListener('click', () => this.close());
    this.el = h(
      'div',
      { class: 'sigma frame solid' },
      h('div', { class: 'sigma-head' }, h('span', { text: `Σ // ${title}` }), x),
      tex,
      note,
    );
    renderTeX(tex, f.tex, true);
    this.host.append(this.el);
    void typewriter(note, f.note, 260);
    sfx.open();
  }
  /** Refresh contents if open (view changed). */
  update(title: string, f: Formula): void {
    if (this.el) this.open(title, f);
  }
  close(): void {
    this.el?.remove();
    this.el = null;
  }
}

let toastEl: HTMLElement | null = null;
let toastTimer = 0;
export function toast(text: string, ms = 1800): void {
  toastEl?.remove();
  clearTimeout(toastTimer);
  toastEl = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(toastEl);
  toastTimer = window.setTimeout(() => {
    toastEl?.remove();
    toastEl = null;
  }, ms);
}
