import type { VizDef } from '../../core/types';
import { Frame2D, NARROW_VIEW, narrowPlot } from '../../gfx/frame2d';
import { INK, text, line, hatch } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';
import { DIGITS } from '../../data/digits';
import { cfOf, cfString } from './data';
import { typewriter } from '../../hud/fx';

/** Babylonian iterations x ← (x + 2/x)/2 in BigInt fixed point; returns decimal strings. */
function babylonian(steps: number, digits = 1200): string[] {
  const S = 10n ** BigInt(digits);
  let x = S;
  const out: string[] = [];
  for (let i = 0; i < steps; i++) {
    x = (x + (2n * S * S) / x) / 2n;
    const s = x.toString();
    out.push(`${s.slice(0, s.length - digits)}.${s.slice(s.length - digits)}`);
  }
  return out;
}

const PROOF = [
  'SUPPOSONS √2 = p/q AVEC p, q ENTIERS, LA FRACTION ÉTANT LA PLUS SIMPLE POSSIBLE.',
  'ALORS p² = 2q² : UN CARRÉ DE CÔTÉ p A LA MÊME AIRE QUE DEUX CARRÉS DE CÔTÉ q.',
  'PLAÇONS LES DEUX CARRÉS q DANS DEUX COINS OPPOSÉS DU CARRÉ p.',
  'LE CHEVAUCHEMENT CENTRAL (CÔTÉ 2q − p) A LA MÊME AIRE QUE LES DEUX COINS VIDES (CÔTÉ p − q).',
  'DONC (2q − p)² = 2(p − q)² : UNE FRACTION PLUS SIMPLE ÉGALE À √2.',
  'ON PEUT RECOMMENCER À L’INFINI : IMPOSSIBLE POUR DES ENTIERS POSITIFS. √2 EST IRRATIONNEL.',
];

export const sqrt2View: VizDef = {
  id: 'sqrt2',
  title: '√2 — RACINE DE DEUX',
  subtitle: 'La diagonale du carré unité, la preuve d’irrationalité par descente infinie, et la méthode de Héron qui double les décimales.',
  stage: '2d',
  keywords: ['racine de deux', '√2', 'irrationnel', 'diagonale', 'pythagore', 'héron', 'newton', 'tennenbaum'],
  formula: {
    tex: 'd^2=1^2+1^2=2,\\qquad \\frac pq=\\sqrt2 \\;\\Rightarrow\\; \\frac{2q-p}{p-q}=\\sqrt2\\quad(\\text{plus petit !})',
    note: 'La diagonale d’un carré de côté 1 vérifie d² = 2 (Pythagore). Si √2 était une fraction p/q irréductible, la figure de Tennenbaum fournirait une fraction (2q − p)/(p − q) plus simple, et ainsi de suite sans fin : contradiction. La méthode de Héron xₙ₊₁ = (xₙ + 2/xₙ)/2 double le nombre de décimales exactes à chaque pas.',
  },
  create(ctx) {
    const st = { mode: 'diag', t: 0, step: 0, timer: 0 };
    const iters = babylonian(10);
    const ref = DIGITS.sqrt2;
    const proofBox = document.createElement('div');
    proofBox.setAttribute('style', 'position:absolute;z-index:4;left:26px;right:330px;bottom:90px;color:#fff;font:400 12px "JetBrains Mono",monospace;letter-spacing:.06em;line-height:1.7;pointer-events:none;white-space:pre-wrap');
    ctx.input.parentElement!.append(proofBox);
    ctx.onDispose(() => proofBox.remove());

    ctx.ui.section('VUE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'diag', label: 'DIAGONALE' },
        { id: 'proof', label: 'IRRATIONALITÉ' },
        { id: 'heron', label: 'HÉRON' },
      ],
      value: 'diag',
      onChange: (v) => {
        st.mode = v;
        st.t = 0;
        st.step = 0;
        proofBox.textContent = '';
      },
    });
    ctx.ui.section('VALEUR');
    ctx.ui.readout('√2', ref.slice(0, 22).replace('.', ','));
    ctx.ui.readout('FRACTION CONTINUE', cfString(cfOf('sqrt2'), 10));
    ctx.ui.readout('PELL 99/70', fmt(99 / 70, 8));
    ctx.ui.readout('PELL 577/408', fmt(577 / 408, 10));
    ctx.ui.note('Les fractions de Pell p/q (1/1, 3/2, 7/5, 17/12, 41/29…) vérifient p² − 2q² = ±1 : elles frôlent √2 sans jamais l’atteindre.');
    const s1 = ctx.hud.stat('', '');
    const s2 = ctx.hud.stat('', '');
    ctx.hud.tag('IRRATIONNEL · ALGÉBRIQUE (x² = 2)');

    const fr = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    return {
      update(_t, dt) {
        st.t += dt;
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        // narrow view (phone): no room kept on the right, the figures fill the width
        const narrow = W < NARROW_VIEW;
        const RW = narrow ? 40 : 400;
        proofBox.style.right = narrow ? '14px' : '330px';
        proofBox.style.fontSize = narrow ? '11px' : '12px';
        if (st.mode === 'diag') {
          proofBox.textContent = '';
          const u = Math.min((W - RW) / 3.6, (H - (narrow ? 210 : 260)) / 3.6);
          const ox = (narrow ? 20 : 60) + (W - RW - 3.6 * u) / 2 + 1.3 * u;
          const oy = (narrow ? 92 : 130) + (H - (narrow ? 210 : 260) - 3.6 * u) / 2 + 1.3 * u;
          const P = (x: number, y: number): [number, number] => [ox + x * u, oy + (1 - y) * u];
          const k = Math.min(1, st.t / 1.5);
          const sq = (pts: [number, number][], fill: boolean) => {
            const p = new Path2D();
            pts.forEach(([x, y], i) => (i ? p.lineTo(...P(x, y)) : p.moveTo(...P(x, y))));
            p.closePath();
            if (fill) hatch(g, p, 6, INK.f20);
            g.strokeStyle = INK.f80;
            g.stroke(p);
          };
          sq([[0, 0], [1, 0], [1, 1], [0, 1]], false);
          if (st.t > 1.5) sq([[0, 0], [1, 0], [1, -1], [0, -1]], true);
          if (st.t > 2.2) sq([[1, 0], [2, 0], [2, 1], [1, 1]], true);
          if (st.t > 3) sq([[0, 0], [1, 1], [0, 2], [-1, 1]], true);
          const [ax, ay] = P(0, 0);
          const [bx, by] = P(k, k);
          line(g, ax, ay, bx, by, INK.fg);
          text(g, '1', ...P(0.5, -0.08), { align: 'center', color: INK.f60 });
          text(g, '1', ...P(1.08, 0.5), { color: INK.f60 });
          text(g, '√2', ...P(0.42, 0.6), { color: INK.fg, size: 14 });
          if (st.t > 3.2) text(g, narrow ? 'AIRE 1 + 1 = 2 = CARRÉ DE LA DIAGONALE' : 'AIRE 1 + 1 = 2  =  AIRE DU CARRÉ SUR LA DIAGONALE', ox - 1.3 * u, oy + 2.45 * u, { color: INK.f80 });
          if (st.t > 7) st.t = 0;
          s1('d² = 1² + 1²');
          s2(`d = ${ref.slice(0, 14).replace('.', ',')}…`);
        } else if (st.mode === 'proof') {
          st.timer += dt;
          if (st.timer > 3.2) {
            st.timer = 0;
            st.step = (st.step + 1) % (PROOF.length + 2);
            if (st.step < PROOF.length) void typewriter(proofBox, PROOF.slice(0, st.step + 1).map((l, i) => `${i + 1}. ${l}`).join('\n'), 220);
          }
          // nested Tennenbaum squares with a Pell pair, descending
          const pairs: [number, number][] = [[17, 12], [7, 5], [3, 2], [1, 1]];
          const level = Math.min(pairs.length - 1, Math.floor(st.t / 4) % pairs.length);
          const [p, q] = pairs[level];
          const size = Math.max(60, Math.min(W - RW, H - (narrow ? 300 : 330)));
          fr.set((narrow ? 20 : 60) + (W - RW - size) / 2, narrow ? 92 : 110, size, size).world(0, p, 0, p);
          const rect = (x0: number, y0: number, s: number, fill: number) => {
            const path = new Path2D();
            path.rect(fr.sx(x0), fr.sy(y0 + s), fr.sx(s) - fr.sx(0), fr.sy(0) - fr.sy(s));
            if (fill) hatch(g, path, fill, INK.f20);
            g.strokeStyle = INK.fg;
            g.stroke(path);
          };
          rect(0, 0, p, 0);
          rect(0, 0, q, 7);
          rect(p - q, p - q, q, 7);
          // overlap and empty corners
          const o = 2 * q - p;
          const path = new Path2D();
          path.rect(fr.sx(p - q), fr.sy(q), fr.sx(o) - fr.sx(0), fr.sy(0) - fr.sy(o));
          hatch(g, path, 3, INK.f60, -Math.PI / 4);
          text(g, `p = ${p}`, fr.x + fr.w / 2, fr.y + fr.h + 16, { align: 'center', color: INK.f80 });
          text(g, `q = ${q}`, fr.sx(q / 2), fr.sy(0) - 6, { align: 'center', color: INK.f60 });
          text(g, `2q − p = ${o}`, fr.sx(p - q + o / 2), fr.sy(q - o / 2) + 4, { align: 'center', color: INK.fg });
          s1(`p² = ${p * p}  ·  2q² = ${2 * q * q}`);
          s2(`→ (2q − p, p − q) = (${o}, ${p - q})`);
          if (st.t > 16) st.t = 0;
        } else {
          proofBox.textContent = '';
          const left = narrow ? 16 : 60;
          let y = narrow ? 100 : 140;
          text(g, narrow ? 'HÉRON : xₙ₊₁ = (xₙ + 2/xₙ) / 2, x₀ = 1' : 'HÉRON / NEWTON : xₙ₊₁ = (xₙ + 2/xₙ) / 2,  x₀ = 1', left, y, { color: INK.f80, size: 12 });
          y += 26;
          const shown = Math.min(iters.length, 1 + Math.floor(st.t / 0.9));
          for (let i = 0; i < shown; i++) {
            const s = iters[i];
            let ok = 0;
            while (ok < s.length && s[ok] === ref[ok]) ok++;
            const correct = Math.max(0, ok - 2);
            const vis = s.slice(0, Math.min(narrow ? Math.floor((W - left - 52) / 6.2) : 60, s.length));
            text(g, `x${i + 1}`.padEnd(5), left, y, { color: INK.f40 });
            const head = vis.slice(0, Math.min(vis.length, ok));
            text(g, head.replace('.', ','), left + 40, y, { color: INK.fg });
            g.font = '400 10px "JetBrains Mono", monospace';
            const wHead = g.measureText(head).width;
            text(g, vis.slice(head.length), left + 40 + wHead, y, { color: INK.f20 });
            text(g, `${correct} DÉCIMALES EXACTES`, narrow ? W - 16 : W - 360, narrow ? y + 16 : y, { align: 'right', color: INK.f60, size: narrow ? 9 : undefined });
            const bw = narrow ? Math.min(W - 140, (correct / 1200) * (W - 140)) : Math.min(W - 520, (correct / 1200) * (W - 520));
            g.fillStyle = INK.f40;
            g.fillRect(left + 40, y + 6, Math.max(1, bw), 2);
            y += 34;
          }
          if (st.t > iters.length * 0.9 + 4) st.t = 0;
          s1('CONVERGENCE QUADRATIQUE');
          s2('CHAQUE PAS DOUBLE LES DÉCIMALES');
        }
      },
      cinematic(t) {
        const m = (['diag', 'proof', 'heron'] as const)[Math.floor(t / 7) % 3];
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};
