import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { INK, axes, dotGrid, plot, hatch, marker, text, line, callout } from '../../gfx/plot2d';
import { fmt, fmtSci } from '../../hud/dom';
import { compile, type Node } from '../../math/parser';
import { taylorCoefficients, radiusEstimate } from '../../math/jet';

type F = (x: number) => number;
const fnOf = (src: string): { f: F; ast: Node; tex: string } => {
  const c = compile(src, ['x']);
  if (!c.ok) throw new Error(c.error);
  return { f: c.fn as F, ast: c.ast, tex: c.tex };
};

// ── limits (ε–δ) ───────────────────────────────────────────────────────

const LIMIT_PRESETS: { src: string; a: number }[] = [
  { src: 'sin(x)/x', a: 0 },
  { src: '(1+x)^(1/x)', a: 0 },
  { src: '(x^2-1)/(x-1)', a: 1 },
  { src: 'x sin(1/x)', a: 0 },
  { src: '(exp(x)-1)/x', a: 0 },
  { src: 'abs(x)/x', a: 0 },
];

export const limitsView: VizDef = {
  id: 'limits',
  title: 'LIMITES (ε, δ)',
  subtitle: 'Pour toute marge ε autour de L, il existe une marge δ autour de a où f reste dans la bande. Tape ta propre fonction.',
  stage: '2d',
  keywords: ['limite', 'epsilon', 'delta', 'continuité', 'analyse'],
  formula: {
    tex: '\\lim_{x\\to a}f(x)=L \\iff \\forall\\varepsilon>0,\\ \\exists\\delta>0,\\ 0<|x-a|<\\delta\\Rightarrow|f(x)-L|<\\varepsilon',
    note: 'La définition de Weierstrass transforme « f(x) s’approche de L » en un jeu : on me donne une tolérance ε (bande horizontale), je dois trouver δ (bande verticale) telle que toute la courbe au-dessus de ]a − δ, a + δ[ (sauf peut-être en a) reste dans la bande. La valeur f(a) elle-même n’intervient pas. Si les limites à gauche et à droite diffèrent, aucune bande ne convient.',
  },
  create(ctx) {
    const st = { ...fnOf(LIMIT_PRESETS[0].src), a: 0, eps: 0.3, auto: true, ph: 0 };
    const pz = new PanZoom(ctx, { scale: 0.01 });
    const sides = () => {
      const h = 1e-7;
      return [st.f(st.a - h), st.f(st.a + h)];
    };
    const fit = () => {
      const [l, r] = sides();
      const L = Number.isFinite(l + r) ? (l + r) / 2 : 0;
      pz.fit(st.a - 3, st.a + 3, L - 1.6, L + 1.4, 60);
    };
    ctx.ui.section('FONCTION ET POINT');
    const fIn = ctx.ui.formula({
      prefix: 'f(x) =',
      value: LIMIT_PRESETS[0].src,
      vars: ['x'],
      presets: LIMIT_PRESETS.map((p) => p.src),
      onChange: (c) => {
        Object.assign(st, { f: c.fn as F, ast: c.ast, tex: c.tex });
        const p = LIMIT_PRESETS.find((q) => q.src === c.src);
        if (p) {
          st.a = p.a;
          aS.set(p.a, true);
        }
        fit();
        ctx.setFormula({ tex: `\\lim_{x\\to ${fmt(st.a, 2).replace(',', '{,}')}} ${c.tex}`, note: limitsView.formula.note });
      },
    });
    const aS = ctx.ui.slider({ label: 'POINT a', min: -5, max: 5, step: 0.01, value: 0, onInput: (v) => ((st.a = v), fit()) });
    ctx.ui.section('TOLÉRANCE');
    const eS = ctx.ui.slider({ label: 'ε (MARGE VERTICALE)', min: 0.005, max: 1, step: 0.001, log: true, value: st.eps, onInput: (v) => ((st.eps = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'ε DÉCROÎT AUTOMATIQUEMENT', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('RÉSULTAT');
    const roL = ctx.ui.readout('LIMITE L');
    const roG = ctx.ui.readout('À GAUCHE / À DROITE');
    const roD = ctx.ui.readout('δ TROUVÉ');
    const s1 = ctx.hud.stat('ε', '');
    const s2 = ctx.hud.stat('δ', '');
    const s3 = ctx.hud.stat('L', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    void fIn;
    fit();
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.ph += dt * 0.35;
          st.eps = Math.pow(10, -2 + 2 * (0.5 + 0.5 * Math.cos(st.ph)));
          eS.set(st.eps, true);
        }
        const { f, a } = st;
        const [lg, ld] = sides();
        const exists = Number.isFinite(lg) && Number.isFinite(ld) && Math.abs(lg - ld) < 1e-4 * Math.max(1, Math.abs(lg));
        const l = (lg + ld) / 2;
        let delta = 0;
        if (exists) {
          delta = 3;
          for (let i = 1; i <= 3000; i++) {
            const d = (3 * i) / 3000;
            if (!(Math.abs(f(a + d) - l) < st.eps) || !(Math.abs(f(a - d) - l) < st.eps)) {
              delta = (3 * (i - 1)) / 3000;
              break;
            }
          }
        }
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        dotGrid(g, pz);
        if (exists) {
          const band = new Path2D();
          band.rect(0, pz.sy(l + st.eps), W, pz.sy(l - st.eps) - pz.sy(l + st.eps));
          hatch(g, band, 6, INK.f10);
          line(g, 0, pz.sy(l + st.eps), W, pz.sy(l + st.eps), INK.f40);
          line(g, 0, pz.sy(l - st.eps), W, pz.sy(l - st.eps), INK.f40);
          const vb = new Path2D();
          vb.rect(pz.sx(a - delta), 0, pz.sx(a + delta) - pz.sx(a - delta), H);
          hatch(g, vb, 6, INK.f10, -Math.PI / 4);
          line(g, pz.sx(a - delta), 0, pz.sx(a - delta), H, INK.f60, [3, 3]);
          line(g, pz.sx(a + delta), 0, pz.sx(a + delta), H, INK.f60, [3, 3]);
          text(g, 'L + ε', 12, pz.sy(l + st.eps) - 4, { color: INK.f80 });
          text(g, 'L − ε', 12, pz.sy(l - st.eps) + 13, { color: INK.f80 });
          text(g, 'a − δ', pz.sx(a - delta) - 4, H - 44, { align: 'right', color: INK.f80 });
          text(g, 'a + δ', pz.sx(a + delta) + 4, H - 44, { color: INK.f80 });
        } else {
          line(g, pz.sx(a), 0, pz.sx(a), H, INK.f40, [3, 3]);
          text(g, '✕ LIMITE INEXISTANTE : GAUCHE ≠ DROITE', pz.sx(a) + 8, 150, { color: INK.fg, size: 12 });
        }
        axes(g, pz, { xName: 'x', yName: 'y' });
        plot(g, pz, f, { color: INK.f60 });
        if (exists) plot(g, pz, f, { color: INK.fg, x0: a - delta, x1: a + delta });
        g.strokeStyle = INK.fg;
        if (Number.isFinite(lg)) g.strokeRect(Math.round(pz.sx(a)) - 3.5, Math.round(pz.sy(lg)) - 3.5, 7, 7);
        if (Number.isFinite(ld) && !exists) g.strokeRect(Math.round(pz.sx(a)) - 3.5, Math.round(pz.sy(ld)) - 3.5, 7, 7);
        roL.set(exists ? fmt(l, 6) : '∄');
        roG.set(`${fmt(lg, 4)} / ${fmt(ld, 4)}`);
        roD.set(exists ? fmt(delta, 5) : '—');
        s1(fmt(st.eps, 4));
        s2(exists ? fmt(delta, 4) : '—');
        s3(exists ? fmt(l, 5) : '∄');
      },
      cinematic(t) {
        const k = Math.floor(t / 8) % 4;
        if (fIn.get() !== LIMIT_PRESETS[k].src) fIn.set(LIMIT_PRESETS[k].src);
      },
    };
  },
};

// ── derivative ─────────────────────────────────────────────────────────

const DERIV_PRESETS = ['x^3/3 - x', 'sin(x)', 'exp(x)/3', 'abs(x)', 'x^2 sin(1/x)', 'sqrt(abs(x))'];

export const derivativeView: VizDef = {
  id: 'derivative',
  title: 'DÉRIVÉE',
  subtitle: 'La sécante devient tangente quand h → 0. Sa pente, tracée au fil de x, dessine la fonction dérivée. Tape ta propre fonction.',
  stage: '2d',
  keywords: ['dérivée', 'tangente', 'sécante', 'pente', 'taux d’accroissement'],
  formula: {
    tex: "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
    note: 'Le taux d’accroissement est la pente de la sécante passant par (x, f(x)) et (x + h, f(x + h)). Quand h tend vers 0, la sécante pivote jusqu’à la tangente : sa pente est le nombre dérivé f′(x). En faisant glisser x, on enregistre ces pentes : elles forment la courbe de f′ (en pointillés). La valeur « exacte » est calculée par différentiation automatique.',
  },
  create(ctx) {
    const st = { ...fnOf(DERIV_PRESETS[0]), x: -2, h: 1, auto: true, dir: 1, phase: 0, showD: true };
    const pz = new PanZoom(ctx, { scale: 0.01 });
    pz.fit(-3.2, 3.2, -2.4, 2.4, 50);
    const trail: [number, number][] = [];
    ctx.ui.section('FONCTION');
    const fIn = ctx.ui.formula({
      prefix: 'f(x) =',
      value: DERIV_PRESETS[0],
      vars: ['x'],
      presets: DERIV_PRESETS,
      onChange: (c) => {
        Object.assign(st, { f: c.fn as F, ast: c.ast, tex: c.tex });
        trail.length = 0;
        ctx.setFormula({ tex: `f(x)=${c.tex}`, note: derivativeView.formula.note });
      },
    });
    ctx.ui.section('SÉCANTE');
    const xS = ctx.ui.slider({ label: 'POINT x', min: -3, max: 3, step: 0.001, value: st.x, onInput: (v) => ((st.x = v), (st.auto = false)) });
    const hS = ctx.ui.slider({ label: 'ÉCART h', min: 0.001, max: 2, step: 0.001, log: true, value: st.h, onInput: (v) => ((st.h = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'ANIMATION (h → 0 PUIS x GLISSE)', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.toggle({ label: 'COURBE DE f′', value: true, onChange: (v) => (st.showD = v) });
    ctx.ui.section('RÉSULTAT');
    const roS = ctx.ui.readout('PENTE DE LA SÉCANTE');
    const roT = ctx.ui.readout('f′(x) EXACTE');
    const s1 = ctx.hud.stat('h', '');
    const s2 = ctx.hud.stat('SÉCANTE', '');
    const s3 = ctx.hud.stat('f′(x)', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    return {
      update(_t, dt) {
        pz.tick();
        const f = st.f;
        if (st.auto) {
          st.phase += dt;
          if (st.phase < 2.5) st.h = Math.pow(10, 0.2 - (st.phase / 2.5) * 3.2);
          else {
            st.h = 1e-3;
            st.x += st.dir * dt * 0.7;
            if (st.x > 3) { st.x = 3; st.dir = -1; }
            if (st.x < -3) { st.x = -3; st.dir = 1; st.phase = 0; trail.length = 0; }
          }
          xS.set(st.x, true);
          hS.set(st.h, true);
        }
        const g = ctx.g;
        dotGrid(g, pz);
        axes(g, pz, { xName: 'x', yName: 'y' });
        const d = (x: number) => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;
        if (st.showD) plot(g, pz, d, { color: INK.f40, dash: [4, 4] });
        plot(g, pz, f, { color: INK.fg });
        const x = st.x;
        const fx = f(x);
        const xh = x + st.h;
        const fh = f(xh);
        const m = (fh - fx) / st.h;
        const W = ctx.width;
        const [x0] = pz.toWorld(0, 0);
        const [x1] = pz.toWorld(W, 0);
        line(g, pz.sx(x0), pz.sy(fx + m * (x0 - x)), pz.sx(x1), pz.sy(fx + m * (x1 - x)), INK.f80);
        marker(g, pz.sx(x), pz.sy(fx), 6, true);
        marker(g, pz.sx(xh), pz.sy(fh), 6, false);
        line(g, pz.sx(x), pz.sy(fx), pz.sx(xh), pz.sy(fx), INK.f40, [2, 2]);
        line(g, pz.sx(xh), pz.sy(fx), pz.sx(xh), pz.sy(fh), INK.f40, [2, 2]);
        if (st.h > 0.08) {
          text(g, 'h', (pz.sx(x) + pz.sx(xh)) / 2, pz.sy(fx) + 15, { align: 'center', color: INK.f80 });
          text(g, 'Δy', pz.sx(xh) + 6, (pz.sy(fx) + pz.sy(fh)) / 2, { color: INK.f80 });
        }
        if (st.h <= 0.0015) {
          trail.push([x, m]);
          if (trail.length > 2000) trail.shift();
        }
        g.fillStyle = INK.fg;
        for (const [tx, tm] of trail) g.fillRect(Math.round(pz.sx(tx)), Math.round(pz.sy(tm)), 1, 1);
        const exact = taylorCoefficients(st.ast, x, 1)[1];
        marker(g, pz.sx(x), pz.sy(exact), 5, false);
        callout(g, pz.sx(x), pz.sy(fx), `pente ${fmt(m, 3)}`);
        roS.set(fmt(m, 6));
        roT.set(Number.isFinite(exact) ? fmt(exact, 6) : 'NON DÉRIVABLE');
        s1(fmtSci(st.h, 2));
        s2(fmt(m, 5));
        s3(Number.isFinite(exact) ? fmt(exact, 5) : '∄');
      },
      cinematic(t) {
        const k = Math.floor(t / 8) % 4;
        if (fIn.get() !== DERIV_PRESETS[k]) fIn.set(DERIV_PRESETS[k]);
      },
    };
  },
};

// ── Taylor ─────────────────────────────────────────────────────────────

const TAYLOR_PRESETS = ['sin(x)', 'cos(x)', 'exp(x)', 'ln(1+x)', '1/(1-x)', 'atan(x)', '1/(1+25x^2)', 'sqrt(1+x)'];

export const taylorView: VizDef = {
  id: 'taylor',
  title: 'SÉRIES DE TAYLOR',
  subtitle: 'Un polynôme qui épouse la fonction terme après terme autour de a — partout, ou seulement dans son rayon de convergence. Tape ta propre fonction.',
  stage: '2d',
  keywords: ['taylor', 'maclaurin', 'série entière', 'polynôme', 'approximation', 'rayon de convergence'],
  formula: {
    tex: 'f(x)=\\sum_{k=0}^{\\infty}\\frac{f^{(k)}(a)}{k!}\\,(x-a)^k',
    note: 'Le polynôme de Taylor d’ordre n a les mêmes n premières dérivées que f en a ; elles sont calculées ici exactement par différentiation automatique. Pour sin, cos et exp, il converge sur toute la droite. Pour ln(1 + x), 1/(1 − x) ou 1/(1 + 25x²), l’accord s’arrête au rayon de convergence, imposé par une singularité — parfois cachée dans le plan complexe.',
  },
  create(ctx) {
    const st = { ...fnOf(TAYLOR_PRESETS[0]), a: 0, n: 1, auto: true, timer: 0, max: 30 };
    let coef: Float64Array = new Float64Array(st.max + 1);
    let R = Infinity;
    const recompute = () => {
      coef = taylorCoefficients(st.ast, st.a, st.max);
      R = radiusEstimate(coef);
    };
    const pz = new PanZoom(ctx, { scale: 0.01 });
    pz.fit(-7, 7, -3, 3, 40);
    ctx.ui.section('FONCTION');
    const fIn = ctx.ui.formula({
      prefix: 'f(x) =',
      value: TAYLOR_PRESETS[0],
      vars: ['x'],
      presets: TAYLOR_PRESETS,
      onChange: (c) => {
        Object.assign(st, { f: c.fn as F, ast: c.ast, tex: c.tex });
        st.n = 0;
        recompute();
        ctx.setFormula({ tex: `${c.tex}=\\sum_{k\\ge0}\\frac{f^{(k)}(a)}{k!}(x-a)^k`, note: taylorView.formula.note });
      },
    });
    ctx.ui.slider({ label: 'CENTRE a', min: -3, max: 3, step: 0.01, value: 0, onInput: (v) => ((st.a = v), recompute()) });
    ctx.ui.section('POLYNÔME');
    const nS = ctx.ui.slider({ label: 'ORDRE n', min: 0, max: st.max, step: 1, value: 1, onInput: (v) => ((st.n = v), (st.auto = false)) });
    ctx.ui.toggle({ label: 'AJOUT AUTOMATIQUE DES TERMES', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.section('RÉSULTAT');
    const roR = ctx.ui.readout('RAYON DE CONVERGENCE ≈');
    const roC = ctx.ui.readout('DERNIER COEFFICIENT');
    const roE = ctx.ui.readout('ERREUR EN a + 1');
    const s1 = ctx.hud.stat('ORDRE', '');
    const s2 = ctx.hud.stat('RAYON', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    recompute();
    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 0.7) {
            st.timer = 0;
            st.n = st.n >= (R === Infinity ? 25 : 18) ? 0 : st.n + 1;
            nS.set(st.n, true);
          }
        }
        const P = (x: number, n = st.n) => {
          let s = 0;
          let p = 1;
          const u = x - st.a;
          for (let k = 0; k <= n; k++) {
            s += coef[k] * p;
            p *= u;
          }
          return s;
        };
        const g = ctx.g;
        dotGrid(g, pz);
        axes(g, pz, { xName: 'x', yName: 'y' });
        const H = ctx.height;
        line(g, pz.sx(st.a), 0, pz.sx(st.a), H, INK.f20);
        if (Number.isFinite(R) && R < 100) {
          line(g, pz.sx(st.a - R), 0, pz.sx(st.a - R), H, INK.f40, [4, 4]);
          line(g, pz.sx(st.a + R), 0, pz.sx(st.a + R), H, INK.f40, [4, 4]);
          text(g, `RAYON R ≈ ${fmt(R, 3)}`, pz.sx(st.a + R) + 6, 150, { color: INK.f80 });
        }
        for (let k = Math.max(0, st.n - 4); k < st.n; k++) plot(g, pz, (x) => P(x, k), { color: `rgba(255,255,255,${0.08 + 0.05 * (k - st.n + 5)})` });
        plot(g, pz, st.f, { color: INK.f60, dash: [5, 4] });
        plot(g, pz, (x) => P(x), { color: INK.fg });
        marker(g, pz.sx(st.a), pz.sy(st.f(st.a)), 6, true);
        roR.set(Number.isFinite(R) ? fmt(R, 4) : '∞');
        roC.set(`c${st.n} = ${fmtSci(coef[st.n], 3)}`);
        roE.set(fmtSci(Math.abs(P(st.a + 1) - st.f(st.a + 1)), 2));
        s1(String(st.n));
        s2(Number.isFinite(R) ? fmt(R, 3) : '∞');
      },
      cinematic(t) {
        const k = Math.floor(t / 8) % TAYLOR_PRESETS.length;
        if (fIn.get() !== TAYLOR_PRESETS[k]) fIn.set(TAYLOR_PRESETS[k]);
      },
    };
  },
};
