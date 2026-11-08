import { h } from '../hud/dom';
import { hexDump } from '../hud/deco';
import { scramble, typewriter, reducedMotion } from '../hud/fx';
import { sfx } from '../core/audio';
import { logoSymbol } from '../hud/logo';

/** Boot screen (~2 s). Any key or click skips it. Resolves when the screen is gone. */
export function boot(info: { gpu: string; maxTex: number; modules: number; views: number; failure?: string }): Promise<void> {
  const logo = h('div', { class: 'boot-logo' });
  const sub = h('div', { class: 'boot-sub', text: 'SYS.BOOT // NOYAU D’EXPLORATION MATHÉMATIQUE · v1.0' });
  const log = h('div', { class: 'boot-log' });
  const bar = h('i');
  const dims = ['2D', '3D', '4D'].map((d) => h('span', { text: `[${d}]` }));
  const foot = h('div', { class: 'boot-foot' }, h('span', { text: 'APPUYER SUR UNE TOUCHE POUR PASSER' }), h('span', { text: 'ΣΔ∫ · 数学' }));
  const box = h('div', { class: 'boot-box frame' }, logoSymbol(64, 'sym boot-sym'), logo, sub, log, h('div', { class: 'boot-bar' }, bar), h('div', { class: 'boot-dims' }, ...dims), foot);
  const root = h('div', { class: 'boot', role: 'status' }, h('div', { class: 'boot-kanji', text: '数学無限' }), h('pre', { class: 'boot-hex', text: hexDump('vector-math', 8, 6) }), box);
  document.body.append(root);

  if (info.failure) {
    logo.innerHTML = 'VECTOR<b>//</b>MATH';
    log.append(h('div', { class: 'boot-fail', text: `⚠ ${info.failure}` }));
    return new Promise(() => {});
  }

  let done = false;
  let finish!: () => void;
  const finished = new Promise<void>((r) => (finish = r));
  const close = () => {
    if (done) return;
    done = true;
    window.removeEventListener('keydown', skip, true);
    window.removeEventListener('pointerdown', skip, true);
    root.classList.add('out');
    setTimeout(() => {
      root.remove();
      finish();
    }, reducedMotion() ? 0 : 280);
  };
  const skip = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    close();
  };
  window.addEventListener('keydown', skip, true);
  window.addEventListener('pointerdown', skip, true);

  const lines: [string, number][] = [
    ['> INITIALIZING V3CT0R...', 0],
    [`> GPU ${info.gpu} · MAX_TEX ${info.maxTex}`, 0.25],
    ['> LOADING DIMENSIONS [2D][3D][4D]', 0.5],
    [`> MOUNTING ${info.modules} MODULES · ${info.views} VUES`, 0.75],
    ['> READY.', 1],
  ];

  (async () => {
    sfx.boot();
    logo.innerHTML = '';
    const a = h('span');
    const b = h('b', { text: '//' });
    const c = h('span');
    logo.append(a, b, c);
    void scramble(a, 'VECTOR', 500);
    void scramble(c, 'MATH', 650);
    const t0 = performance.now();
    const total = reducedMotion() ? 200 : 1900;
    const raf = () => {
      if (done) return;
      const k = Math.min(1, (performance.now() - t0) / total);
      bar.style.width = `${(k * 100).toFixed(1)}%`;
      dims.forEach((d, i) => d.classList.toggle('on', k > 0.42 + i * 0.12));
      if (k < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    for (const [text, at] of lines) {
      const wait = t0 + at * total * 0.85 - performance.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (done) return;
      const row = h('div', { class: at === 1 ? 'hi' : '' });
      log.append(row);
      await typewriter(row, text, 140);
    }
    const rest = t0 + total + 150 - performance.now();
    if (rest > 0) await new Promise((r) => setTimeout(r, rest));
    close();
  })();

  return finished;
}
