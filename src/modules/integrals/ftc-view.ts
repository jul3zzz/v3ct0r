import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, hatch, marker, text, line, callout } from '../../gfx/plot2d';
import { range } from '../../math/numeric';
import { fmt } from '../../hud/dom';
import { PRESETS_1D } from './riemann-view';

export const ftcView: VizDef = {
  id: 'ftc',
  title: 'THÉORÈME FONDAMENTAL',
  subtitle: 'L’aire accumulée F(x) = ∫ₐˣ f croît exactement à la vitesse f(x) : la pente de F en x vaut f(x).',
  stage: '2d',
  keywords: ['théorème fondamental', 'primitive', 'dérivée', 'aire accumulée', 'newton', 'leibniz'],
  formula: {
    tex: 'F(x)=\\int_a^x f(t)\\,dt \\quad\\Longrightarrow\\quad F\\,\'(x)=f(x)',
    note: 'Quand x avance de dx, l’aire sous f gagne une fine bande de hauteur f(x) : F(x + dx) − F(x) ≈ f(x)·dx. Diviser par dx donne F′(x) = f(x). Intégrer et dériver sont deux opérations inverses — c’est ce qui permet de calculer une aire avec une primitive : ∫ₐᵇ f = F(b) − F(a).',
  },
  create(ctx) {
    const st = { f: (x: number) => Math.sin(x) + 1.5, a: 0, b: 6, x: 0, auto: true, speed: 0.6, src: 'sin(x) + 1.5' };
    const N = 1200;
    let F = new Float64Array(N + 1);
    let fr: [number, number] = [-1, 1];
    let Fr: [number, number] = [-1, 1];
    const build = () => {
      const h = (st.b - st.a) / N;
      F = new Float64Array(N + 1);
      for (let i = 1; i <= N; i++) {
        const x0 = st.a + (i - 1) * h;
        const v = (st.f(x0) + 4 * st.f(x0 + h / 2) + st.f(x0 + h)) / 6;
        F[i] = F[i - 1] + (Number.isFinite(v) ? v : 0) * h;
      }
      fr = range(st.f, st.a, st.b);
      let lo = 0;
      let hi = 0;
      for (const v of F) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      Fr = [lo, hi];
    };
    const Fat = (x: number) => {
      const t = ((x - st.a) / (st.b - st.a)) * N;
      const i = Math.max(0, Math.min(N - 1, Math.floor(t)));
      return F[i] + (F[i + 1] - F[i]) * (t - i);
    };

    ctx.ui.section('FONCTION');
    ctx.ui.formula({
      prefix: 'f(x) =',
      value: st.src,
      vars: ['x'],
      presets: PRESETS_1D.filter((p) => p !== '1/x' && p !== 'sqrt(x)'),
      onChange: (c) => {
        st.f = c.fn as (x: number) => number;
        build();
      },
    });
    ctx.ui.slider({ label: 'BORNE a', min: -6, max: 5, step: 0.01, value: st.a, onInput: (v) => ((st.a = Math.min(v, st.b - 0.5)), build()) });
    ctx.ui.slider({ label: 'BORNE b', min: -5, max: 8, step: 0.01, value: st.b, onInput: (v) => ((st.b = Math.max(v, st.a + 0.5)), build()) });
    ctx.ui.section('BALAYAGE');
    const xS = ctx.ui.slider({ label: 'POSITION x', min: 0, max: 1, step: 0.001, value: 0, fmt: (v) => fmt(st.a + v * (st.b - st.a), 3), onInput: (v) => ((st.x = v), (st.auto = false), autoT.set(false, true)) });
    const autoT = ctx.ui.toggle({ label: 'BALAYAGE AUTOMATIQUE', value: true, onChange: (v) => (st.auto = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.1, max: 2, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.section('VÉRIFICATION');
    const roF = ctx.ui.readout('F(x)');
    const roD = ctx.ui.readout('F′(x) ≈ [F(x+h) − F(x−h)] / 2h');
    const rof = ctx.ui.readout('f(x)');
    const sF = ctx.hud.stat('F(x)', '');
    const sD = ctx.hud.stat('F′(x)', '');
    const sf = ctx.hud.stat('f(x)', '');
    build();

    const top = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    const bot = new Frame2D(0, 0, 1, 1, 0, 1, 0, 1);
    let frame = 0;
    let dir = 1;
    return {
      update(_t, dt) {
        if (st.auto) {
          st.x += dir * dt * st.speed * 0.12;
          if (st.x > 1) { st.x = 1; dir = -1; }
          if (st.x < 0) { st.x = 0; dir = 1; }
          if (frame % 3 === 0) xS.set(st.x, true);
        }
        const W = ctx.width;
        const H = ctx.height;
        const L = 70;
        const R = 40;
        const ph = (H - 200) / 2;
        top.set(L, 130, W - L - R, ph - 10).world(st.a, st.b, Math.min(0, fr[0]) - 0.1 * (fr[1] - fr[0] || 1), Math.max(0, fr[1]) + 0.15 * (fr[1] - fr[0] || 1));
        bot.set(L, 130 + ph + 30, W - L - R, ph - 10).world(st.a, st.b, Math.min(0, Fr[0]) - 0.1 * (Fr[1] - Fr[0] || 1), Math.max(0, Fr[1]) + 0.15 * (Fr[1] - Fr[0] || 1));
        const g = ctx.g;
        const x = st.a + st.x * (st.b - st.a);
        // top: f with accumulated area
        top.box(g, 'f(t) — AIRE ACCUMULÉE DE a À x', false);
        top.axes(g, { xName: 't', yName: 'f' });
        const area = new Path2D();
        area.moveTo(top.sx(st.a), top.sy(0));
        const k = 300;
        for (let i = 0; i <= k; i++) {
          const t = st.a + ((x - st.a) * i) / k;
          const v = st.f(t);
          area.lineTo(top.sx(t), top.sy(Number.isFinite(v) ? v : 0));
        }
        area.lineTo(top.sx(x), top.sy(0));
        area.closePath();
        hatch(g, area, 5, INK.f20);
        top.plot(g, st.f);
        const fx = st.f(x);
        // thin strip f(x)·dx
        const dx = (st.b - st.a) * 0.012;
        g.fillStyle = INK.f40;
        g.fillRect(top.sx(x), Math.min(top.sy(fx), top.sy(0)), Math.max(2, top.sx(x + dx) - top.sx(x)), Math.abs(top.sy(fx) - top.sy(0)));
        line(g, top.sx(x), top.y, top.sx(x), top.y + top.h, INK.f40, [2, 3]);
        marker(g, top.sx(x), top.sy(fx), 6, true);
        callout(g, top.sx(x), top.sy(fx), `f(x) = ${fmt(fx, 3)}`);
        // bottom: F with tangent of slope f(x)
        bot.box(g, 'F(x) = ∫ₐˣ f(t) dt — PENTE DE LA TANGENTE = f(x)', false);
        bot.axes(g, { xName: 'x', yName: 'F' });
        bot.plot(g, Fat, { color: INK.f40 });
        bot.plot(g, Fat, { x1: x, color: INK.fg });
        const Fx = Fat(x);
        const span = (st.b - st.a) * 0.18;
        line(g, bot.sx(x - span), bot.sy(Fx - fx * span), bot.sx(x + span), bot.sy(Fx + fx * span), INK.fg);
        line(g, bot.sx(x), bot.y, bot.sx(x), bot.y + bot.h, INK.f40, [2, 3]);
        marker(g, bot.sx(x), bot.sy(Fx), 6, true);
        callout(g, bot.sx(x), bot.sy(Fx), `pente = ${fmt(fx, 3)}`, { dy: 18 });
        text(g, 'F′ = f', bot.x + bot.w - 8, bot.y + 16, { align: 'right', color: INK.f60, size: 12 });
        if (frame++ % 4 === 0) {
          const h = (st.b - st.a) / N;
          const d = (Fat(Math.min(st.b, x + h)) - Fat(Math.max(st.a, x - h))) / (Math.min(st.b, x + h) - Math.max(st.a, x - h));
          roF.set(fmt(Fx, 6));
          roD.set(fmt(d, 6));
          rof.set(fmt(fx, 6));
          sF(fmt(Fx, 5));
          sD(fmt(d, 5));
          sf(fmt(fx, 5));
        }
      },
    };
  },
};
