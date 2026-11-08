import type { VizDef } from '../../core/types';
import { Frame2D } from '../../gfx/frame2d';
import { INK, text, line, marker } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

/** A small asymmetric glyph (so rotations are visible): an "F" made of segments. */
const GLYPH: [number, number][][] = [
  [[0.25, 0.15], [0.25, 0.85]],
  [[0.25, 0.85], [0.7, 0.85]],
  [[0.25, 0.52], [0.58, 0.52]],
];

export const iView: VizDef = {
  id: 'i',
  title: 'i — UNITÉ IMAGINAIRE',
  subtitle: 'Multiplier par i, c’est tourner d’un quart de tour : deux fois de suite donne −1.',
  stage: '2d',
  keywords: ['i', 'imaginaire', 'complexe', 'rotation', 'quart de tour', 'racine de -1'],
  formula: {
    tex: 'i^2=-1,\\qquad i\\cdot(a+bi)=-b+ai,\\qquad i^0,i^1,i^2,i^3=1,\\,i,\\,-1,\\,-i',
    note: 'Aucun réel n’a un carré négatif. On ajoute donc une direction perpendiculaire : multiplier par i fait tourner tout le plan de 90°. Deux quarts de tour font un demi-tour, d’où i² = −1. Les puissances de i tournent en boucle : 1, i, −1, −i, 1… i n’a pas de décimales : c’est une direction, pas une longueur.',
  },
  create(ctx) {
    const st = { t: 0, a: 1.2, b: 0.5, speed: 0.6 };
    ctx.ui.section('NOMBRE z = a + bi');
    ctx.ui.slider({ label: 'PARTIE RÉELLE a', min: -2, max: 2, step: 0.01, value: st.a, onInput: (v) => (st.a = v) });
    ctx.ui.slider({ label: 'PARTIE IMAGINAIRE b', min: -2, max: 2, step: 0.01, value: st.b, onInput: (v) => (st.b = v) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.1, max: 2, step: 0.01, value: st.speed, onInput: (v) => (st.speed = v) });
    ctx.ui.section('PUISSANCES DE i');
    ['i⁰ = 1', 'i¹ = i', 'i² = −1', 'i³ = −i', 'i⁴ = 1'].forEach((s, k) => ctx.ui.readout(`ROTATION ${k * 90}°`, s));
    const roZ = ctx.ui.readout('z');
    const roIZ = ctx.ui.readout('i · z');
    const s1 = ctx.hud.stat('PUISSANCE', '');
    const s2 = ctx.hud.stat('iᵏ · z', '');
    ctx.hud.tag('|i| = 1 · arg(i) = π/2');
    const fr = new Frame2D(0, 0, 1, 1, -2.6, 2.6, -2.6, 2.6);
    return {
      update(_t, dt) {
        st.t += dt * st.speed;
        const g = ctx.g;
        const W = ctx.width;
        const H = ctx.height;
        const size = Math.min(W - 120, H - 180);
        fr.set((W - size) / 2 - 40, 110 + (H - 180 - size) / 2, size, size);
        // rotating grid: angle eases between quarter turns
        const k = Math.floor(st.t);
        const f = st.t - k;
        const ease = f < 0.5 ? 0 : (1 - Math.cos((f - 0.5) * 2 * Math.PI)) / 2 * (f < 1 ? 1 : 1);
        const ang = (k + Math.min(1, ease)) * (Math.PI / 2);
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const R = (x: number, y: number): [number, number] => [fr.sx(c * x - s * y), fr.sy(s * x + c * y)];
        g.save();
        g.beginPath();
        g.rect(fr.x, fr.y, fr.w, fr.h);
        g.clip();
        for (let v = -3; v <= 3; v += 0.5) {
          const a1 = R(v, -3);
          const a2 = R(v, 3);
          const b1 = R(-3, v);
          const b2 = R(3, v);
          line(g, a1[0], a1[1], a2[0], a2[1], Math.abs(v) < 1e-9 ? INK.f40 : INK.f10);
          line(g, b1[0], b1[1], b2[0], b2[1], Math.abs(v) < 1e-9 ? INK.f40 : INK.f10);
        }
        g.restore();
        fr.axes(g, { xName: 'RÉEL', yName: 'IMAGINAIRE', labels: true });
        g.strokeStyle = INK.f40;
        g.beginPath();
        g.arc(fr.sx(0), fr.sy(0), fr.sx(1) - fr.sx(0), 0, Math.PI * 2);
        g.stroke();
        // powers of i on the unit circle
        ['1', 'i', '−1', '−i'].forEach((lbl, j) => {
          const x = fr.sx(Math.cos((j * Math.PI) / 2));
          const y = fr.sy(Math.sin((j * Math.PI) / 2));
          marker(g, x, y, 6, j === ((k + (ease > 0.99 ? 1 : 0)) % 4));
          text(g, lbl, x + 8, y - 8, { color: INK.f80, size: 11 });
        });
        // the glyph z and its rotation
        const drawGlyph = (rot: number, col: string, scale: number) => {
          const cc = Math.cos(rot);
          const ss = Math.sin(rot);
          g.strokeStyle = col;
          g.beginPath();
          for (const seg of GLYPH)
            seg.forEach(([x, y], j) => {
              const X = (x * st.a - y * st.b) * scale;
              const Y = (x * st.b + y * st.a) * scale;
              const px = fr.sx(cc * X - ss * Y);
              const py = fr.sy(ss * X + cc * Y);
              j ? g.lineTo(px, py) : g.moveTo(px, py);
            });
          g.stroke();
        };
        drawGlyph(0, INK.f20, 1.6);
        drawGlyph(ang, INK.fg, 1.6);
        const zx = c * st.a - s * st.b;
        const zy = s * st.a + c * st.b;
        line(g, fr.sx(0), fr.sy(0), fr.sx(st.a), fr.sy(st.b), INK.f40, [3, 3]);
        line(g, fr.sx(0), fr.sy(0), fr.sx(zx), fr.sy(zy), INK.fg);
        marker(g, fr.sx(zx), fr.sy(zy), 6, true);
        text(g, `i${['⁰', '¹', '²', '³'][(k + (ease > 0.99 ? 1 : 0)) % 4]} · z`, fr.sx(zx) + 8, fr.sy(zy) + 14, { color: INK.fg });
        roZ.set(`${fmt(st.a, 2)} ${st.b >= 0 ? '+' : '−'} ${fmt(Math.abs(st.b), 2)} i`);
        roIZ.set(`${fmt(-st.b, 2)} ${st.a >= 0 ? '+' : '−'} ${fmt(Math.abs(st.a), 2)} i`);
        s1(`i${['⁰', '¹', '²', '³'][k % 4]} → i${['¹', '²', '³', '⁴'][k % 4]}  (+90°)`);
        s2(`${fmt(zx, 3)} ${zy >= 0 ? '+' : '−'} ${fmt(Math.abs(zy), 3)} i`);
      },
    };
  },
};
