type Kid = Node | string | number | null | undefined | false;

/** Tiny hyperscript helper. `text`, `html`, `class`, `style` and `on*` handlers are special-cased. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> | null = null,
  ...kids: Kid[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k === 'style') el.setAttribute('style', String(v));
      else if (k === 'text') el.textContent = String(v);
      else if (k === 'html') el.innerHTML = String(v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of kids) if (c != null && c !== false) el.append(typeof c === 'number' ? String(c) : c);
  return el;
}

export function svgEl(markup: string): SVGSVGElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstChild as SVGSVGElement;
}

/** Set text only when it changed (avoids layout work in per-frame readouts). */
export function setText(el: Element, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v;
}

/** French number formatting with a fixed number of decimals and a proper minus sign. */
export function fmt(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'NaN' : v > 0 ? '+∞' : '−∞';
  const s = v.toFixed(digits).replace('.', ',');
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}

/** Compact scientific formatting: 1,23e−5. */
export function fmtSci(v: number, digits = 2): string {
  if (v === 0) return '0';
  if (!Number.isFinite(v)) return fmt(v);
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e5) return fmt(v, digits + 2);
  const [m, e] = v.toExponential(digits).split('e');
  return `${m.replace('.', ',').replace('-', '−')}e${e.replace('-', '−').replace('+', '')}`;
}

/** Integer with narrow no-break space thousands separator. */
export function fmtInt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    .replace('-', '−');
}
