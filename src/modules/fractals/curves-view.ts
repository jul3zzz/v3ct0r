import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { INK, hatch } from '../../gfx/plot2d';
import { fmt, fmtInt } from '../../hud/dom';

// ── Koch snowflake ─────────────────────────────────────────────────────

function kochPoints(base: [number, number][], depth: number, lambda: number, inward: boolean, closed: boolean): [number, number][] {
  let pts = base.slice();
  const s = inward ? -1 : 1;
  for (let d = 0; d < depth; d++) {
    const lam = d === depth - 1 ? lambda : 1;
    const next: [number, number][] = [];
    const n = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const dx = (b[0] - a[0]) / 3;
      const dy = (b[1] - a[1]) / 3;
      const p1: [number, number] = [a[0] + dx, a[1] + dy];
      const p3: [number, number] = [a[0] + 2 * dx, a[1] + 2 * dy];
      // apex: midpoint pushed outward by the height of an equilateral bump (√3/2 · |seg|/3)
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const h = (Math.sqrt(3) / 2) * lam * s;
      const p2: [number, number] = [mx + dy * h, my - dx * h];
      next.push(a, p1, p2, p3);
    }
    if (!closed) next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

export const kochView: VizDef = {
  id: 'koch',
  title: 'FLOCON DE KOCH',
  subtitle: 'Chaque segment est remplacé par quatre segments d’un tiers : périmètre infini, aire finie.',
  stage: '2d',
  hausdorff: 'ln 4 / ln 3 ≈ 1,262',
  keywords: ['koch', 'flocon', 'courbe', 'périmètre infini', 'von koch'],
  formula: {
    tex: 'P_n=P_0\\left(\\tfrac43\\right)^n\\to\\infty,\\qquad A_\\infty=\\tfrac85\\,A_0,\\qquad D=\\frac{\\ln 4}{\\ln 3}\\approx 1{,}2619',
    note: 'À chaque étape le nombre de segments est multiplié par 4 et leur longueur divisée par 3 : le périmètre est multiplié par 4/3 et diverge. Pourtant la courbe reste dans un disque : l’aire converge vers 8/5 de celle du triangle de départ. Helge von Koch (1904) l’a construite comme courbe continue nulle part dérivable.',
  },
  create(ctx) {
    const pz = new PanZoom(ctx, { scale: 0.005, minScale: 1e-7 });
    pz.fit(-1.2, 1.2, -1.2, 1.2, 40);
    const st = { mode: 'flake', depth: 0, max: ctx.q(6, 7, 7), auto: true, timer: 0, lam: 1, fill: true };
    const R = 1.0;
    const tri: [number, number][] = [0, 1, 2].map((k) => [R * Math.cos(Math.PI / 2 + (k * 2 * Math.PI) / 3), R * Math.sin(Math.PI / 2 + (k * 2 * Math.PI) / 3)]);
    // counterclockwise so that bumps point outward
    const flakeBase: [number, number][] = [tri[0], tri[1], tri[2]];
    ctx.ui.section('VARIANTE');
    const modeSeg = ctx.ui.segmented({
      options: [
        { id: 'flake', label: 'FLOCON' },
        { id: 'anti', label: 'ANTI-FLOCON' },
        { id: 'curve', label: 'COURBE' },
      ],
      value: 'flake',
      onChange: (v) => (st.mode = v),
    });
    const dS = ctx.ui.slider({ label: 'ÉTAPE n', min: 0, max: st.max, step: 1, value: 0, onInput: (v) => ((st.depth = v), (st.lam = 0)) });
    ctx.ui.toggle({ label: 'CONSTRUCTION AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.toggle({ label: 'HACHURER L’AIRE', value: true, onChange: (v) => (st.fill = v) });
    ctx.ui.section('MESURES');
    const roS = ctx.ui.readout('SEGMENTS 3·4ⁿ');
    const roP = ctx.ui.readout('PÉRIMÈTRE / P₀');
    const roA = ctx.ui.readout('AIRE / A₀');
    const sN = ctx.hud.stat('n', '');
    const sP = ctx.hud.stat('PÉRIMÈTRE', '');
    const sA = ctx.hud.stat('AIRE', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');

    return {
      update(_t, dt) {
        pz.tick();
        if (st.auto) {
          st.timer += dt;
          if (st.timer > 1.8) {
            st.timer = 0;
            st.depth = st.depth >= st.max ? 0 : st.depth + 1;
            st.lam = 0;
            dS.set(st.depth, true);
          }
        }
        st.lam = Math.min(1, st.lam + dt * 1.6);
        const e = 1 - Math.pow(1 - st.lam, 3);
        const closed = st.mode !== 'curve';
        const base: [number, number][] = closed ? flakeBase : [[1.2, -0.35], [-1.2, -0.35]];
        const pts = kochPoints(base, st.depth, e, st.mode === 'anti', closed);
        const g = ctx.g;
        const path = new Path2D();
        pts.forEach((p, i) => (i ? path.lineTo(pz.sx(p[0]), pz.sy(p[1])) : path.moveTo(pz.sx(p[0]), pz.sy(p[1]))));
        if (closed) path.closePath();
        if (st.fill && closed) hatch(g, path, 7, INK.f10);
        g.strokeStyle = INK.fg;
        g.lineWidth = 1;
        g.stroke(path);
        const n = st.depth;
        const segs = (closed ? 3 : 1) * 4 ** n;
        const perim = (4 / 3) ** n;
        // area ratio of the (anti)flake relative to the base triangle
        let area = 1;
        for (let k = 1; k <= n; k++) area += (st.mode === 'anti' ? -1 : 1) * (3 * 4 ** (k - 1)) / 9 ** k;
        roS.set(fmtInt(segs));
        roP.set(fmt(perim, 4));
        roA.set(closed ? fmt(area, 5) : '—');
        sN(String(n));
        sP(`${fmt(perim, 3)} × P₀`);
        sA(closed ? `${fmt(area, 4)} × A₀ → ${st.mode === 'anti' ? '2/5' : '8/5'}` : '—');
      },
      cinematic(t) {
        const m = (['flake', 'anti', 'curve'] as const)[Math.floor(t / 7) % 3];
        if (m !== st.mode) modeSeg.set(m);
      },
    };
  },
};

// ── Hilbert curve ──────────────────────────────────────────────────────

function hilbertD2XY(n: number, d: number): [number, number] {
  let x = 0;
  let y = 0;
  let t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & (t / 2);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      [x, y] = [y, x];
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return [x, y];
}

export const hilbertView: VizDef = {
  id: 'hilbert',
  title: 'COURBE DE HILBERT',
  subtitle: 'Une courbe continue qui, à la limite, passe par tous les points du carré : une ligne de dimension 2.',
  stage: '2d',
  hausdorff: '2 (REMPLIT LE PLAN)',
  keywords: ['hilbert', 'peano', 'courbe qui remplit', 'space filling'],
  formula: {
    tex: 'H:[0,1]\\to[0,1]^2\\ \\text{continue et surjective},\\qquad L_n = 2^n-\\frac{1}{2^n}\\to\\infty',
    note: 'La courbe d’ordre n visite les 4ⁿ cases d’une grille 2ⁿ × 2ⁿ dans un ordre qui préserve la localité. Les courbes convergent uniformément vers une application continue qui remplit tout le carré (Hilbert, 1891, après Peano). Cet ordre sert en informatique pour indexer des images ou des bases de données spatiales.',
  },
  create(ctx) {
    const pz = new PanZoom(ctx, { scale: 0.005, minScale: 1e-6 });
    pz.fit(-0.02, 1.02, -0.02, 1.02, 50);
    const st = { order: 1, max: ctx.q(7, 8, 8), auto: true, draw: 0, speed: 1, grid: true, hold: 0 };
    ctx.ui.section('CONSTRUCTION');
    const oS = ctx.ui.slider({ label: 'ORDRE n', min: 1, max: st.max, step: 1, value: 1, onInput: (v) => ((st.order = v), (st.draw = 0)) });
    ctx.ui.toggle({ label: 'TRACÉ AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'VITESSE DE TRACÉ', min: 0.2, max: 4, step: 0.01, value: 1, onInput: (v) => (st.speed = v) });
    ctx.ui.toggle({ label: 'GRILLE 2ⁿ × 2ⁿ', value: true, onChange: (v) => (st.grid = v) });
    ctx.ui.section('MESURES');
    const roC = ctx.ui.readout('CASES 4ⁿ');
    const roL = ctx.ui.readout('LONGUEUR');
    const sN = ctx.hud.stat('ORDRE', '');
    const sL = ctx.hud.stat('LONGUEUR', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');
    let cache: { n: number; pts: [number, number][] } | null = null;
    return {
      update(_t, dt) {
        pz.tick();
        const n = 1 << st.order;
        const N = n * n;
        if (!cache || cache.n !== n) {
          cache = { n, pts: Array.from({ length: N }, (_, d) => hilbertD2XY(n, d)) };
        }
        st.draw = Math.min(1, st.draw + (dt * st.speed) / 2.2);
        if (st.auto && st.draw >= 1) {
          st.draw = 1.0001;
          st.hold += dt;
          if (st.hold > 0.9) {
            st.hold = 0;
            st.order = st.order >= st.max ? 1 : st.order + 1;
            st.draw = 0;
            oS.set(st.order, true);
          }
        }
        const g = ctx.g;
        if (st.grid && st.order <= 6) {
          g.strokeStyle = INK.f05;
          g.beginPath();
          for (let i = 0; i <= n; i++) {
            const v = i / n;
            g.moveTo(pz.sx(v), pz.sy(0));
            g.lineTo(pz.sx(v), pz.sy(1));
            g.moveTo(pz.sx(0), pz.sy(v));
            g.lineTo(pz.sx(1), pz.sy(v));
          }
          g.stroke();
        }
        g.strokeStyle = INK.f20;
        g.strokeRect(Math.round(pz.sx(0)) + 0.5, Math.round(pz.sy(1)) + 0.5, Math.round(pz.sx(1) - pz.sx(0)), Math.round(pz.sy(0) - pz.sy(1)));
        const k = Math.max(1, Math.floor(Math.min(1, st.draw) * N));
        const pts = cache.pts;
        g.beginPath();
        for (let i = 0; i < k; i++) {
          const x = (pts[i][0] + 0.5) / n;
          const y = (pts[i][1] + 0.5) / n;
          if (i) g.lineTo(pz.sx(x), pz.sy(y));
          else g.moveTo(pz.sx(x), pz.sy(y));
        }
        g.strokeStyle = INK.fg;
        g.lineWidth = 1;
        g.stroke();
        const last = pts[k - 1];
        g.fillStyle = INK.fg;
        g.fillRect(Math.round(pz.sx((last[0] + 0.5) / n)) - 2, Math.round(pz.sy((last[1] + 0.5) / n)) - 2, 5, 5);
        const L = n - 1 / n;
        roC.set(fmtInt(N));
        roL.set(fmt(L, 4));
        sN(String(st.order));
        sL(fmt(L, 3));
      },
    };
  },
};

// ── fractal tree ───────────────────────────────────────────────────────

export const treeView: VizDef = {
  id: 'tree',
  title: 'ARBRE FRACTAL',
  subtitle: 'Un tronc qui se divise en deux branches réduites d’un facteur r, à l’infini. Le vent fait onduler les angles.',
  stage: '2d',
  keywords: ['arbre', 'pythagore', 'branches', 'récursion', 'similarité'],
  formula: {
    tex: 'D_s=\\frac{\\ln 2}{\\ln(1/r)}\\quad(\\text{branches sans chevauchement}),\\qquad L_{\\text{tot}}=\\sum_{k\\ge0}(2r)^k',
    note: 'Chaque branche porte deux copies d’elle-même réduites du facteur r : la dimension de similarité vaut ln 2 / ln(1/r). Pour r = 1/√2 elle atteint 2 : la canopée remplit le plan. La longueur totale est finie seulement si r < 1/2.',
  },
  create(ctx) {
    const pz = new PanZoom(ctx, { scale: 0.005, minScale: 1e-5 });
    pz.fit(-1.6, 1.6, -0.1, 2.6, 30);
    const st = { depth: ctx.q(10, 12, 13), angle: 0.42, ratio: 0.72, asym: 0, wind: true, windAmp: 0.08, t: 0 };
    ctx.ui.section('ARBRE');
    const aS = ctx.ui.slider({ label: 'ANGLE', min: 0, max: Math.PI / 2, step: 0.001, value: st.angle, fmt: (v) => `${Math.round((v * 180) / Math.PI)}°`, onInput: (v) => (st.angle = v) });
    ctx.ui.slider({ label: 'RAPPORT r', min: 0.4, max: 0.8, step: 0.001, value: st.ratio, onInput: (v) => (st.ratio = v) });
    ctx.ui.slider({ label: 'ASYMÉTRIE', min: -0.5, max: 0.5, step: 0.001, value: 0, onInput: (v) => (st.asym = v) });
    ctx.ui.slider({ label: 'PROFONDEUR', min: 1, max: ctx.q(12, 14, 15), step: 1, value: st.depth, onInput: (v) => (st.depth = v) });
    ctx.ui.toggle({ label: 'VENT', value: true, onChange: (v) => (st.wind = v) });
    ctx.ui.slider({ label: 'FORCE DU VENT', min: 0, max: 0.3, step: 0.001, value: st.windAmp, onInput: (v) => (st.windAmp = v) });
    const roD = ctx.ui.readout('DIM. SIMILARITÉ');
    const roN = ctx.ui.readout('BRANCHES');
    const tag = ctx.hud.tag('', true);
    const sD = ctx.hud.stat('D', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECENTRER');
    return {
      update(_t, dt) {
        pz.tick();
        if (st.wind) st.t += dt;
        const g = ctx.g;
        const byDepth: Path2D[] = Array.from({ length: st.depth + 1 }, () => new Path2D());
        const rec = (x: number, y: number, a: number, len: number, d: number) => {
          const sway = st.wind ? Math.sin(st.t * 1.4 + d * 0.6 + x * 1.5) * st.windAmp * (1 - d / (st.depth + 1)) : 0;
          const x2 = x + Math.cos(a + sway) * len;
          const y2 = y + Math.sin(a + sway) * len;
          const p = byDepth[st.depth - d];
          p.moveTo(pz.sx(x), pz.sy(y));
          p.lineTo(pz.sx(x2), pz.sy(y2));
          if (d <= 0) return;
          rec(x2, y2, a + sway + st.angle * (1 + st.asym), len * st.ratio, d - 1);
          rec(x2, y2, a + sway - st.angle * (1 - st.asym), len * st.ratio, d - 1);
        };
        rec(0, 0, Math.PI / 2, 0.7, st.depth);
        byDepth.forEach((p, i) => {
          g.strokeStyle = `rgba(255,255,255,${(0.95 - (0.75 * i) / Math.max(1, st.depth)).toFixed(3)})`;
          g.lineWidth = 1;
          g.stroke(p);
        });
        const D = Math.log(2) / Math.log(1 / st.ratio);
        const ds = `${fmt(D, 3)}`;
        roD.set(ds);
        roN.set(fmtInt(2 ** (st.depth + 1) - 1));
        tag(`DIM. SIMILARITÉ ln2/ln(1/r) ≈ ${fmt(D, 3)}`);
        sD(ds);
      },
      cinematic(t) {
        st.angle = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.25));
        aS.set(st.angle, true);
      },
    };
  },
};
