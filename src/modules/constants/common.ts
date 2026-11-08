import { INK, MONO, text } from '../../gfx/plot2d';
import { renderTeX } from '../../hud/ui';
import type { VizContext } from '../../core/types';

/** Vertical stream of decimals that scrolls upward, with the current digit highlighted. */
export class DigitStream {
  pos = 0;
  constructor(private digits: string, public speed = 12) {}
  setDigits(d: string): void {
    this.digits = d;
    this.pos = 0;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dt: number): void {
    const frac = this.digits.split('.')[1] ?? this.digits;
    this.pos += dt * this.speed;
    if (this.pos >= frac.length) this.pos = 0;
    const cols = Math.max(1, Math.floor(w / 9));
    const rowH = 13;
    const visible = Math.max(1, Math.floor(h / rowH));
    const n = Math.floor(this.pos);
    const lastRow = Math.floor(n / cols);
    const firstRow = Math.max(0, lastRow - visible + 1);
    g.font = `400 11px ${MONO}`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    for (let row = firstRow; row <= lastRow; row++) {
      const yy = y + (row - firstRow) * rowH;
      for (let c = 0; c < cols; c++) {
        const idx = row * cols + c;
        if (idx > n) break;
        const age = n - idx;
        g.fillStyle = age === 0 ? INK.fg : age < cols ? INK.f80 : age < cols * 3 ? INK.f60 : INK.f20;
        g.fillText(frac[idx], x + c * 9, yy);
      }
    }
  }
  get index(): number {
    return Math.floor(this.pos);
  }
}

/** A KaTeX formula floating over the viewport (removed on dispose). */
export function floatingTeX(ctx: VizContext, tex: string, style: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', `position:absolute;z-index:4;pointer-events:none;color:#fff;${style}`);
  renderTeX(el, tex, true);
  ctx.input.parentElement!.append(el);
  ctx.onDispose(() => el.remove());
  return el;
}

/** Big framed value: symbol + digits, HUD style. */
export function bigValue(g: CanvasRenderingContext2D, x: number, y: number, sym: string, digits: string, n: number): void {
  text(g, sym, x, y, { size: 34, family: '"Michroma", sans-serif', color: INK.fg });
  text(g, `= ${digits.slice(0, n + 2).replace('.', ',')}…`, x, y + 26, { size: 13, color: INK.f80 });
}
