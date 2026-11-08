import { svgEl } from './dom';
import { reducedMotion } from './fx';

/** V3CT0R symbol — "V-vecteur": the V of V3CT0R drawn as two vectors leaving the same origin, the right
 *  one carrying the arrowhead, framed by HUD corner brackets. 256 grid, arms at ±30° from vertical, stroke 24.
 *  Master file: src/assets/logo/v3ct0r-symbol.svg (built from the logo-design skill workflow). */
export const LOGO_BRACKETS = 'M16 16 H80 V32 H32 V80 H16 Z M240 16 H176 V32 H224 V80 H240 Z M16 240 H80 V224 H32 V176 H16 Z M240 240 H176 V224 H224 V176 H240 Z';
export const LOGO_V = '44.9,68 72.6,68 128,164 170.8,89.8 152.6,79.3 204.2,56 209.8,112.3 191.6,101.8 128,212';

export function logoSymbol(size = 20, className = 'sym'): SVGSVGElement {
  return svgEl(
    `<svg class="${className}" viewBox="0 0 256 256" width="${size}" height="${size}" aria-hidden="true"><path class="br" fill="currentColor" d="${LOGO_BRACKETS}"/><polygon class="v" fill="currentColor" points="${LOGO_V}"/></svg>`,
  );
}

const GLYPHS = '#%&/\\<>_=+*01ΣΔΛΞ∂∫';

/** Animated wordmark: letters float in a slow wave and "bug" in short bursts (scrambled glyphs,
 *  jitter, offset slices). Burst also on hover. Monochrome; respects prefers-reduced-motion. */
export function animatedWordmark(text = 'V3CT0R'): { el: HTMLElement; burst: () => void; destroy: () => void } {
  const el = document.createElement('span');
  el.className = 'wm';
  el.dataset.text = text;
  el.setAttribute('aria-label', text);
  const chars = [...text].map((c, i) => {
    const s = document.createElement('span');
    // '0' gets a slash so that V3CT0R does not read as V3CTOR in the display font
    s.className = 'ch' + (c === '/' ? ' sl' : c === '0' ? ' z' : '');
    s.style.setProperty('--i', String(i));
    s.textContent = c;
    s.setAttribute('aria-hidden', 'true');
    el.append(s);
    return s;
  });
  let timer = 0;
  let running = false;
  const burst = () => {
    if (running || reducedMotion()) return;
    running = true;
    const t0 = performance.now();
    const dur = 220 + Math.random() * 260;
    const tick = () => {
      const t = performance.now() - t0;
      chars.forEach((s, i) => {
        s.textContent = text[i];
        s.classList.remove('bug');
      });
      if (t < dur) {
        const k = 1 + ((Math.random() * 3) | 0);
        for (let j = 0; j < k; j++) {
          const s = chars[(Math.random() * chars.length) | 0];
          if (s.classList.contains('sl')) continue;
          s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          s.style.setProperty('--bx', `${((Math.random() - 0.5) * 5).toFixed(1)}px`);
          s.style.setProperty('--by', `${((Math.random() - 0.5) * 4).toFixed(1)}px`);
          s.classList.add('bug');
        }
        const a = Math.random() * 70;
        el.style.setProperty('--c1', `${a.toFixed(0)}%`);
        el.style.setProperty('--c2', `${(100 - a - 12 - Math.random() * 20).toFixed(0)}%`);
        const b = Math.random() * 70;
        el.style.setProperty('--c3', `${b.toFixed(0)}%`);
        el.style.setProperty('--c4', `${(100 - b - 8 - Math.random() * 25).toFixed(0)}%`);
        el.classList.add('glitch');
        setTimeout(tick, 45 + Math.random() * 40);
      } else {
        el.classList.remove('glitch');
        running = false;
      }
    };
    tick();
  };
  const schedule = () => {
    timer = window.setTimeout(() => {
      burst();
      schedule();
    }, 2600 + Math.random() * 4200);
  };
  schedule();
  return {
    el,
    burst,
    destroy: () => clearTimeout(timer),
  };
}
