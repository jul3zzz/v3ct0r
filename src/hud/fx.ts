/** Text and screen effects: scramble, typewriter, glitch. All respect prefers-reduced-motion. */

const GLYPHS = '!<>-_\\/[]{}=+*^?#01ΣΔΩ∫∂◇░▒';
const running = new WeakMap<Element, number>();

export const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Reveal `text` in `el` with random glyphs that settle left to right. */
export function scramble(el: HTMLElement, text: string, duration = 420): Promise<void> {
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  if (reducedMotion() || duration <= 0) {
    el.textContent = text;
    return Promise.resolve();
  }
  const n = text.length;
  const settle = Array.from({ length: n }, (_, i) => (i / Math.max(1, n)) * duration * 0.65 + Math.random() * duration * 0.35);
  const t0 = performance.now();
  return new Promise((resolve) => {
    const step = (now: number) => {
      const t = now - t0;
      let out = '';
      for (let i = 0; i < n; i++) {
        const ch = text[i];
        if (t >= settle[i] || ch === ' ' || ch === '\n') out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < duration) running.set(el, requestAnimationFrame(step));
      else {
        el.textContent = text;
        running.delete(el);
        resolve();
      }
    };
    running.set(el, requestAnimationFrame(step));
  });
}

/** Type `text` into `el` at `cps` characters per second, with a block cursor. */
export function typewriter(el: HTMLElement, text: string, cps = 90): Promise<void> {
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  if (reducedMotion()) {
    el.textContent = text;
    return Promise.resolve();
  }
  const t0 = performance.now();
  return new Promise((resolve) => {
    const step = (now: number) => {
      const k = Math.min(text.length, Math.floor(((now - t0) / 1000) * cps));
      el.textContent = text.slice(0, k) + (k < text.length ? '█' : '');
      if (k < text.length) running.set(el, requestAnimationFrame(step));
      else {
        running.delete(el);
        resolve();
      }
    };
    running.set(el, requestAnimationFrame(step));
  });
}

/** Short monochrome glitch: slice offsets on the canvases + a few inverted noise bars. */
export function glitch(viewport: HTMLElement, layer: HTMLElement, duration = 190): void {
  if (reducedMotion()) return;
  viewport.classList.remove('fx-glitch');
  void viewport.offsetWidth; // restart animation
  viewport.classList.add('fx-glitch');
  layer.replaceChildren();
  const bars = 3 + ((Math.random() * 4) | 0);
  for (let i = 0; i < bars; i++) {
    const b = document.createElement('i');
    b.style.top = `${Math.random() * 100}%`;
    b.style.height = `${1 + Math.random() * 6}px`;
    b.style.opacity = String(0.3 + Math.random() * 0.6);
    layer.append(b);
  }
  const start = performance.now();
  const jitter = () => {
    const t = performance.now() - start;
    if (t > duration) {
      layer.replaceChildren();
      viewport.classList.remove('fx-glitch');
      return;
    }
    for (const b of Array.from(layer.children) as HTMLElement[]) b.style.top = `${Math.random() * 100}%`;
    requestAnimationFrame(jitter);
  };
  requestAnimationFrame(jitter);
}
