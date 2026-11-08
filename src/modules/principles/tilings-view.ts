import type { VizDef } from '../../core/types';
import { PanZoom } from '../../gfx/panzoom';
import { INK } from '../../gfx/plot2d';
import { fmtInt } from '../../hud/dom';

const PHI = (1 + Math.sqrt(5)) / 2;
type P = [number, number];
interface Tri {
  t: 0 | 1;
  a: P;
  b: P;
  c: P;
}

/** Robinson-triangle deflation producing a Penrose P3 (rhombus) tiling. */
function penrose(depth: number): Tri[] {
  let tris: Tri[] = [];
  for (let i = 0; i < 10; i++) {
    let b: P = [Math.cos(((2 * i - 1) * Math.PI) / 10), Math.sin(((2 * i - 1) * Math.PI) / 10)];
    let c: P = [Math.cos(((2 * i + 1) * Math.PI) / 10), Math.sin(((2 * i + 1) * Math.PI) / 10)];
    if (i % 2 === 0) [b, c] = [c, b];
    tris.push({ t: 0, a: [0, 0], b, c });
  }
  for (let d = 0; d < depth; d++) {
    const next: Tri[] = [];
    for (const { t, a, b, c } of tris) {
      if (t === 0) {
        const p: P = [a[0] + (b[0] - a[0]) / PHI, a[1] + (b[1] - a[1]) / PHI];
        next.push({ t: 0, a: c, b: p, c: b }, { t: 1, a: p, b: c, c: a });
      } else {
        const q: P = [b[0] + (a[0] - b[0]) / PHI, b[1] + (a[1] - b[1]) / PHI];
        const r: P = [b[0] + (c[0] - b[0]) / PHI, b[1] + (c[1] - b[1]) / PHI];
        next.push({ t: 1, a: r, b: c, c: a }, { t: 1, a: q, b: r, c: b }, { t: 0, a: r, b: q, c: a });
      }
    }
    tris = next;
  }
  return tris;
}

export const tilingsView: VizDef = {
  id: 'tilings',
  title: 'PAVAGES',
  subtitle: 'Seuls triangles, carrés et hexagones pavent le plan régulièrement. Le pavage de Penrose, lui, couvre le plan sans jamais se répéter.',
  stage: '2d',
  keywords: ['pavage', 'penrose', 'apériodique', 'hexagone', 'quasi-cristal', 'nombre d’or'],
  formula: {
    tex: '\\frac{(n-2)\\pi}{n}\\cdot k=2\\pi \\Rightarrow (n,k)\\in\\{(3,6),(4,4),(6,3)\\},\\qquad \\frac{N_{\\text{épais}}}{N_{\\text{fins}}}\\to\\varphi',
    note: 'Un pavage régulier exige que k angles de polygone régulier fassent un tour complet : seules trois solutions existent. Roger Penrose (1974) a trouvé deux losanges qui pavent le plan sans aucune période ; on l’obtient ici par « déflation » de triangles de Robinson. La proportion de losanges épais et fins tend vers le nombre d’or ; ce motif décrit les quasi-cristaux (Shechtman, Nobel 2011).',
  },
  create(ctx) {
    const st = { kind: 'penrose', depth: 5 };
    const pz = new PanZoom(ctx, { scale: 0.01, minScale: 1e-5 });
    pz.fit(-1, 1, -1, 1, 30);
    let cache: { d: number; tris: Tri[] } | null = null;
    ctx.ui.section('PAVAGE');
    ctx.ui.segmented({
      options: [
        { id: 'tri', label: 'TRIANGLES {3,6}' },
        { id: 'sq', label: 'CARRÉS {4,4}' },
        { id: 'hex', label: 'HEXAGONES {6,3}' },
        { id: 'penrose', label: 'PENROSE P3' },
      ],
      value: 'penrose',
      cols: 2,
      onChange: (v) => {
        st.kind = v;
        if (v === 'penrose') pz.fit(-1, 1, -1, 1, 30);
        else pz.fit(-6, 6, -4, 4, 30);
      },
    });
    ctx.ui.slider({ label: 'GÉNÉRATIONS (PENROSE)', min: 1, max: ctx.q(6, 7, 8), step: 1, value: st.depth, onInput: (v) => (st.depth = v) });
    const roN = ctx.ui.readout('TUILES');
    const roR = ctx.ui.readout('ÉPAIS / FINS');
    const s1 = ctx.hud.stat('TUILES', '');
    ctx.hud.hint('GLISSER : DÉPLACER · MOLETTE : ZOOM · DOUBLE-CLIC : RECADRER');
    return {
      update(t) {
        pz.tick();
        const g = ctx.g;
        g.lineWidth = 1;
        if (st.kind === 'penrose') {
          if (!cache || cache.d !== st.depth) cache = { d: st.depth, tris: penrose(st.depth) };
          const tris = cache.tris;
          const thick = new Path2D();
          const edges = new Path2D();
          let nt = 0;
          for (const { t: kind, a, b, c } of tris) {
            // draw the two equal sides only: pairs of triangles form rhombi
            edges.moveTo(pz.sx(c[0]), pz.sy(c[1]));
            edges.lineTo(pz.sx(a[0]), pz.sy(a[1]));
            edges.lineTo(pz.sx(b[0]), pz.sy(b[1]));
            if (kind === 0) {
              nt++;
              thick.moveTo(pz.sx(a[0]), pz.sy(a[1]));
              thick.lineTo(pz.sx(b[0]), pz.sy(b[1]));
              thick.lineTo(pz.sx(c[0]), pz.sy(c[1]));
              thick.closePath();
            }
          }
          g.fillStyle = `rgba(255,255,255,${(0.08 + 0.04 * Math.sin(t * 0.8)).toFixed(3)})`;
          g.fill(thick);
          g.strokeStyle = INK.f80;
          g.stroke(edges);
          const n = tris.length / 2;
          roN.set(fmtInt(n));
          roR.set(`${(nt / Math.max(1, tris.length - nt)).toFixed(4).replace('.', ',')} → φ ≈ 1,6180`);
          s1(fmtInt(n));
        } else {
          const [x0, y1] = pz.toWorld(0, 0);
          const [x1, y0] = pz.toWorld(ctx.width, ctx.height);
          const p = new Path2D();
          let count = 0;
          if (st.kind === 'sq') {
            for (let x = Math.floor(x0); x <= x1; x++) for (let y = Math.floor(y0); y <= y1; y++) {
              p.rect(pz.sx(x), pz.sy(y + 1), 1 / pz.scale, 1 / pz.scale);
              count++;
            }
          } else if (st.kind === 'tri') {
            const h = Math.sqrt(3) / 2;
            for (let j = Math.floor(y0 / h) - 1; j <= y1 / h + 1; j++)
              for (let i = Math.floor(x0) - 1; i <= x1 + 1; i++) {
                const ox = i + (j % 2 ? 0.5 : 0);
                const oy = j * h;
                p.moveTo(pz.sx(ox), pz.sy(oy));
                p.lineTo(pz.sx(ox + 1), pz.sy(oy));
                p.lineTo(pz.sx(ox + 0.5), pz.sy(oy + h));
                p.closePath();
                count += 2;
              }
          } else {
            const r = 0.6;
            const w = Math.sqrt(3) * r;
            for (let j = Math.floor(y0 / (1.5 * r)) - 1; j <= y1 / (1.5 * r) + 1; j++)
              for (let i = Math.floor(x0 / w) - 1; i <= x1 / w + 1; i++) {
                const cx = i * w + (j % 2 ? w / 2 : 0);
                const cy = j * 1.5 * r;
                for (let k = 0; k <= 6; k++) {
                  const a = Math.PI / 6 + (k * Math.PI) / 3;
                  const X = pz.sx(cx + r * Math.cos(a));
                  const Y = pz.sy(cy + r * Math.sin(a));
                  k ? p.lineTo(X, Y) : p.moveTo(X, Y);
                }
                count++;
              }
          }
          g.strokeStyle = INK.f80;
          g.stroke(p);
          roN.set(`${fmtInt(count)} VISIBLES`);
          roR.set('—');
          s1(fmtInt(count));
        }
      },
    };
  },
};
