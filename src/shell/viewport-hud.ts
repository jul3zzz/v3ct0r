import { h, setText, fmt } from '../hud/dom';
import { icon } from '../hud/deco';
import { touchScreen } from '../core/touch';

type Mapper = (px: number, py: number) => readonly [number, number] | null;

/** a view's mouse hint said with the fingers (touch screen): the wheel is a pinch, the right button two
 *  fingers, a double click a double tap, a hover a touch */
export const touchHint = (text: string): string =>
  text
    .replace(/MOLETTE : ZOOM AU CURSEUR/g, 'PINCER : ZOOM')
    .replace(/MOLETTE : ZOOM/g, 'PINCER : ZOOM')
    .replace(/CLIC DROIT : DÉPLACER/g, 'DEUX DOIGTS : DÉPLACER')
    .replace(/DOUBLE-CLIC/g, 'DOUBLE TAP')
    .replace(/CLIC MAINTENU/g, 'DOIGT POSÉ')
    .replace(/SURVOLER/g, 'TOUCHER')
    .replace(/CLIC/g, 'TAP');

/** Decorative and informative layer over the viewport: corners, rulers, reticle, title, stats, tags. */
export class ViewportHud {
  readonly el: HTMLElement;
  private titleCode: HTMLElement;
  private titleName: HTMLElement;
  private titleSub: HTMLElement;
  private stats: HTMLElement;
  private tags: HTMLElement;
  private coordsXY: HTMLElement;
  private coordsLbl: HTMLElement;
  private hintEl: HTMLElement;
  private rh: HTMLElement;
  private rv: HTMLElement;
  private rbox: HTMLElement;
  private errEl: HTMLElement | null = null;
  private mapper: Mapper | null = null;
  private coordLabels: [string, string] = ['X', 'Y'];
  private mouse: [number, number] | null = null;

  constructor(private host: HTMLElement) {
    this.titleCode = h('div', { class: 'code' });
    this.titleName = h('div', { class: 'name' });
    this.titleSub = h('div', { class: 'sub' });
    this.stats = h('div', { class: 'vp-stats' });
    this.tags = h('div', { class: 'vp-tags' });
    this.coordsXY = h('div', { class: 'xy', text: '—' });
    this.coordsLbl = h('div', { text: 'CURSEUR' });
    this.hintEl = h('div', { class: 'vp-hint' });
    this.rh = h('div', { class: 'reticle-h' });
    this.rv = h('div', { class: 'reticle-v' });
    this.rbox = h('div', { class: 'reticle-box' });
    this.el = h(
      'div',
      { class: 'vp-hud' },
      h('div', { class: 'vp-corner tl' }),
      h('div', { class: 'vp-corner tr' }),
      h('div', { class: 'vp-corner bl' }),
      h('div', { class: 'vp-corner br' }),
      h('div', { class: 'ruler-x' }),
      h('div', { class: 'ruler-y' }),
      this.rh,
      this.rv,
      this.rbox,
      h('div', { class: 'vp-title' }, this.titleCode, this.titleName, this.titleSub),
      this.tags,
      this.stats,
      h('div', { class: 'vp-coords' }, this.coordsLbl, this.coordsXY),
      this.hintEl,
    );
    host.append(this.el);

    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      this.mouse = [e.clientX - r.left, e.clientY - r.top];
      this.updateReticle();
    });
    host.addEventListener('pointerleave', () => {
      this.mouse = null;
      this.updateReticle();
    });
  }

  /** Reset for a new view. */
  reset(code: string, title: string, subtitle: string): void {
    setText(this.titleCode, code);
    setText(this.titleName, title);
    setText(this.titleSub, subtitle);
    this.stats.replaceChildren();
    this.tags.replaceChildren();
    this.hintEl.textContent = '';
    this.mapper = null;
    this.coordLabels = ['X', 'Y'];
    this.clearError();
    this.updateReticle();
  }

  get titleEl(): HTMLElement {
    return this.titleName;
  }

  /** Add a big stat line (bottom-left). Returns a setter. */
  stat(label: string, initial = '—'): (v: string | number) => void {
    const v = h('span', { class: 'v', text: initial });
    this.stats.append(h('span', { class: 'k', text: label }), v);
    return (x) => setText(v, typeof x === 'number' ? fmt(x, 4) : x);
  }

  /** Add a tag (top-right). Returns a setter. */
  tag(text: string, strong = false): (t: string) => void {
    const span = h('span', { text });
    this.tags.append(h('span', { class: 'vp-tag' + (strong ? ' strong' : '') }, icon('diamond'), span));
    return (t) => setText(span, t);
  }

  hint(text: string): void {
    this.hintEl.textContent = touchScreen() ? touchHint(text) : text;
  }

  /** Map screen → world coordinates for the cursor readout; null disables the reticle. */
  setMapper(m: Mapper | null, labels: [string, string] = ['X', 'Y']): void {
    this.mapper = m;
    this.coordLabels = labels;
    this.updateReticle();
  }

  error(message: string): void {
    this.clearError();
    this.errEl = h('div', { class: 'vp-error' }, h('div', { style: 'display:flex;gap:8px;align-items:center;margin-bottom:6px' }, icon('warn'), h('span', { class: 'caps', text: 'ERREUR DE RENDU' })), h('div', { text: message }));
    this.el.append(this.errEl);
  }

  clearError(): void {
    this.errEl?.remove();
    this.errEl = null;
  }

  private updateReticle(): void {
    const on = !!(this.mouse && this.mapper);
    this.el.classList.toggle('reticle-on', on);
    if (!this.mouse || !this.mapper) {
      setText(this.coordsXY, '—');
      return;
    }
    const [x, y] = this.mouse;
    this.rh.style.top = `${Math.round(y)}px`;
    this.rv.style.left = `${Math.round(x)}px`;
    this.rbox.style.left = `${Math.round(x)}px`;
    this.rbox.style.top = `${Math.round(y)}px`;
    const w = this.mapper(x, y);
    const [lx, ly] = this.coordLabels;
    setText(this.coordsXY, w ? `${lx} ${fmt(w[0], 4)}  ${ly} ${fmt(w[1], 4)}` : '—');
  }

  /** Re-evaluate the cursor readout (when the view moved under a still mouse). */
  refresh(): void {
    if (this.mouse && this.mapper) this.updateReticle();
  }
}
