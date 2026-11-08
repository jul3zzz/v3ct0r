import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { INK, dotGrid, marker } from '../../gfx/plot2d';
import { fmt } from '../../hud/dom';

type Pt = [number, number];

function resample(path: Pt[], n: number): Pt[] {
  const seg: number[] = [0];
  for (let i = 1; i <= path.length; i++) {
    const a = path[i - 1];
    const b = path[i % path.length];
    seg.push(seg[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const L = seg[seg.length - 1] || 1;
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (k / n) * L;
    while (j < path.length - 1 && seg[j + 1] < s) j++;
    const a = path[j];
    const b = path[(j + 1) % path.length];
    const t = (s - seg[j]) / Math.max(1e-12, seg[j + 1] - seg[j]);
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

const SHAPES: Record<string, () => Pt[]> = {
  heart: () => Array.from({ length: 400 }, (_, i) => {
    const t = (2 * Math.PI * i) / 400;
    return [16 * Math.sin(t) ** 3 / 9, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 9];
  }),
  star: () => Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 0.8 : 2;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    return [r * Math.cos(a), r * Math.sin(a)];
  }),
  square: () => [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]],
  pi: () => [[-1.8, 1.2], [1.8, 1.2], [1.8, 0.8], [0.9, 0.8], [0.9, -1.6], [0.5, -1.6], [0.5, 0.8], [-0.5, 0.8], [-0.7, -1.6], [-1.1, -1.6], [-0.9, 0.8], [-1.8, 0.8]],
  trefoil: () => Array.from({ length: 300 }, (_, i) => {
    const t = (2 * Math.PI * i) / 300;
    const r = 2 * Math.cos(3 * t);
    return [r * Math.cos(t), r * Math.sin(t)];
  }),
};

interface Coef {
  f: number;
  re: number;
  im: number;
  amp: number;
}

function dft(pts: Pt[]): Coef[] {
  const N = pts.length;
  const out: Coef[] = [];
  for (let k = 0; k < N; k++) {
    const f = k <= N / 2 ? k : k - N;
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const a = (-2 * Math.PI * f * n) / N;
      const c = Math.cos(a);
      const s = Math.sin(a);
      re += pts[n][0] * c - pts[n][1] * s;
      im += pts[n][0] * s + pts[n][1] * c;
    }
    re /= N;
    im /= N;
    out.push({ f, re, im, amp: Math.hypot(re, im) });
  }
  return out.sort((a, b) => b.amp - a.amp);
}

export const fourierView: VizDef = {
  id: 'fourier',
  title: 'SÉRIES DE FOURIER',
  subtitle: 'Une chaîne de cercles qui tournent à des fréquences entières redessine n’importe quelle courbe fermée. Dessine la tienne.',
  stage: '2d',
  keywords: ['fourier', 'épicycles', 'transformée', 'fréquences', 'dft', 'dessin'],
  formula: {
    tex: 'z(t)=\\sum_{k=-\\infty}^{\\infty} c_k\\,e^{2\\pi i k t},\\qquad c_k=\\int_0^1 z(t)\\,e^{-2\\pi i k t}\\,dt',
    note: 'On voit la courbe comme un point z(t) du plan complexe. Chaque coefficient c_k est un cercle de rayon |c_k| qui tourne k fois par tour. Les flèches mises bout à bout (rangées de la plus grande à la plus petite) tracent la forme. Avec peu de cercles on obtient une silhouette lisse ; les angles vifs demandent des fréquences élevées.',
  },
  create(ctx) {
    const st = { shape: 'heart', terms: 40, speed: 0.12, t: 0, drawing: [] as Pt[], isDrawing: false };
    const N = 256;
    let coefs = dft(resample(SHAPES.heart(), N));
    let trail: Pt[] = [];
    const pz = new PanZoom(ctx, {
      scale: 0.01,
      pan: false,
      onDrag: (x, y, _e, phase) => {
        if (st.shape !== 'draw') return false;
        if (phase === 'start') {
          st.drawing = [[x, y]];
          st.isDrawing = true;
        } else if (phase === 'move') st.drawing.push([x, y]);
        else {
          st.isDrawing = false;
          if (st.drawing.length > 8) {
            coefs = dft(resample(st.drawing, N));
            trail = [];
            st.t = 0;
          }
        }
        return true;
      },
    });
    pz.fit(-2.6, 2.6, -2.4, 2.4, 50);
    const setShape = (s: string) => {
      st.shape = s;
      trail = [];
      st.t = 0;
      if (s !== 'draw') coefs = dft(resample(SHAPES[s](), N));
      else {
        st.drawing = [];
        coefs = [];
      }
    };
    ctx.ui.section('FORME');
    const shapeSeg = ctx.ui.segmented({
      options: [
        { id: 'heart', label: 'CŒUR' },
        { id: 'star', label: 'ÉTOILE' },
        { id: 'square', label: 'CARRÉ' },
        { id: 'pi', label: 'π' },
        { id: 'trefoil', label: 'TRÈFLE' },
        { id: 'draw', label: '✎ DESSIN LIBRE' },
      ],
      value: 'heart',
      cols: 3,
      onChange: setShape,
    });
    ctx.ui.note('En mode <b>dessin libre</b>, trace une courbe fermée dans la vue (clic maintenu) : ses épicycles sont calculés au relâchement.');
    const tS = ctx.ui.slider({ label: 'NOMBRE DE CERCLES', min: 1, max: N, step: 1, log: true, value: st.terms, onInput: (v) => ((st.terms = v), (trail = [])) });
    ctx.ui.slider({ label: 'VITESSE', min: 0.02, max: 0.5, step: 0.001, value: st.speed, onInput: (v) => (st.speed = v) });
    const roE = ctx.ui.readout('ÉNERGIE CAPTÉE');
    const s1 = ctx.hud.stat('CERCLES', '');
    const s2 = ctx.hud.stat('FRÉQ. MAX', '');
    ctx.hud.hint('MODE DESSIN : CLIC MAINTENU POUR TRACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    return {
      update(_t, dt) {
        pz.tick();
        const g = ctx.g;
        dotGrid(g, pz);
        if (st.shape === 'draw' && (st.isDrawing || !coefs.length)) {
          g.strokeStyle = INK.fg;
          g.beginPath();
          st.drawing.forEach(([x, y], i) => (i ? g.lineTo(pz.sx(x), pz.sy(y)) : g.moveTo(pz.sx(x), pz.sy(y))));
          g.stroke();
          s1('—');
          return;
        }
        if (!coefs.length) return;
        st.t = (st.t + dt * st.speed) % 1;
        const n = Math.min(st.terms, coefs.length);
        let x = 0;
        let y = 0;
        let maxF = 0;
        g.lineWidth = 1;
        for (let k = 0; k < n; k++) {
          const c = coefs[k];
          const a = 2 * Math.PI * c.f * st.t;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const nx = x + c.re * ca - c.im * sa;
          const ny = y + c.re * sa + c.im * ca;
          const r = c.amp / pz.scale;
          if (r > 1.5 && c.f !== 0) {
            g.strokeStyle = `rgba(255,255,255,${Math.min(0.35, 0.05 + r / 400).toFixed(3)})`;
            g.beginPath();
            g.arc(pz.sx(x), pz.sy(y), r, 0, Math.PI * 2);
            g.stroke();
          }
          g.strokeStyle = INK.f60;
          g.beginPath();
          g.moveTo(pz.sx(x), pz.sy(y));
          g.lineTo(pz.sx(nx), pz.sy(ny));
          g.stroke();
          x = nx;
          y = ny;
          maxF = Math.max(maxF, Math.abs(c.f));
        }
        trail.push([x, y]);
        if (trail.length > 900) trail.shift();
        g.strokeStyle = INK.fg;
        g.beginPath();
        trail.forEach(([tx, ty], i) => (i ? g.lineTo(pz.sx(tx), pz.sy(ty)) : g.moveTo(pz.sx(tx), pz.sy(ty))));
        g.stroke();
        marker(g, pz.sx(x), pz.sy(y), 5, true);
        let eTot = 0;
        let eN = 0;
        coefs.forEach((c, i) => {
          eTot += c.amp * c.amp;
          if (i < n) eN += c.amp * c.amp;
        });
        roE.set(`${fmt((100 * eN) / (eTot || 1), 2)} %`);
        s1(String(n));
        s2(String(maxF));
      },
      cinematic(t) {
        const s = (['heart', 'star', 'pi', 'trefoil'] as const)[Math.floor(t / 8) % 4];
        if (s !== st.shape) shapeSeg.set(s);
        const k = Math.round(2 + 60 * (0.5 - 0.5 * Math.cos(t * 0.4)));
        if (k !== st.terms) {
          st.terms = k;
          tS.set(k, true);
        }
      },
    };
  },
};
