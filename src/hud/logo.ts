import { svgEl } from './dom';
import { reducedMotion } from './fx';

/** V3CT0R symbol — "orbite et vecteur": a planet and its tilted orbit, crossed by a vector (the ATLAS and
 *  the V of V3CT0R). 256 grid; a cut-out gap keeps the vector apart from what it crosses. Two drawings:
 *  regular, and thicker for 24 px and below. Masters (with the black tile of the app icon):
 *  src/assets/logo/v3ct0r-icon.svg and v3ct0r-icon-small.svg (npm run icons builds the icons from them). */
const LOGO = {
  big: { cy: 128, rx: 108, ry: 56, ring: 12, r: 36, line: [44, 212, 182, 74], cut: 30, w: 14, head: '218,38 200.8,90 166,55.2', headCut: 9 },
  small: { cy: 134, rx: 112, ry: 66, ring: 22, r: 40, line: [36, 226, 170, 92], cut: 50, w: 28, head: '228,26 205,102 152,49', headCut: 12 },
};
let maskId = 0;

export function logoSymbol(size = 20, className = 'sym'): SVGSVGElement {
  const g = size <= 24 ? LOGO.small : LOGO.big;
  const [x1, y1, x2, y2] = g.line;
  const id = `v3-cut-${++maskId}`;
  return svgEl(
    `<svg class="${className}" viewBox="0 0 256 256" width="${size}" height="${size}" aria-hidden="true">` +
      `<mask id="${id}"><rect width="256" height="256" fill="#fff"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${g.cut}"/><polygon points="${g.head}" fill="#000" stroke="#000" stroke-width="${g.headCut}"/></mask>` +
      `<g class="orb" mask="url(#${id})"><ellipse cx="128" cy="${g.cy}" rx="${g.rx}" ry="${g.ry}" transform="rotate(-20 128 ${g.cy})" fill="none" stroke="currentColor" stroke-width="${g.ring}"/><circle cx="128" cy="${g.cy}" r="${g.r}" fill="currentColor"/></g>` +
      `<g class="v"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${g.w}"/><polygon points="${g.head}" fill="currentColor"/></g></svg>`,
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
