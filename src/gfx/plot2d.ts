import type { PanZoom } from './panzoom';

/** Canvas 2D helpers in HUD style: dot grid, graduated axes, function plots, labels. */

export const INK = {
  fg: '#ffffff',
  f80: 'rgba(255,255,255,0.8)',
  f60: 'rgba(255,255,255,0.66)',
  f40: 'rgba(255,255,255,0.46)',
  f20: 'rgba(255,255,255,0.2)',
  f10: 'rgba(255,255,255,0.1)',
  f05: 'rgba(255,255,255,0.05)',
  bg: '#000000',
};

export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const DISPLAY = '"Michroma", "JetBrains Mono", sans-serif';

export function font(size = 10, family = MONO, weight = 400): string {
  return `${weight} ${size}px ${family}`;
}

/** 1-2-5 step close to range/target. */
export function niceStep(range: number, target = 8): number {
  const raw = range / Math.max(1, target);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

export function fmtTick(v: number, step: number): string {
  if (Math.abs(v) < step * 1e-6) return '0';
  const d = Math.max(0, Math.min(8, -Math.floor(Math.log10(step) + 1e-9)));
  const a = Math.abs(v);
  let s = a >= 1e5 || (a < 1e-4 && a > 0) ? v.toExponential(1) : v.toFixed(d);
  s = s.replace('.', ',');
  return s.startsWith('-') ? '−' + s.slice(1) : s;
}

export function text(
  g: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: { align?: CanvasTextAlign; base?: CanvasTextBaseline; color?: string; size?: number; family?: string; weight?: number } = {},
): void {
  // legibility floor: no canvas text below 10px
  g.font = font(Math.max(10, o.size ?? 11), o.family ?? MONO, o.weight ?? 400);
  g.textAlign = o.align ?? 'left';
  g.textBaseline = o.base ?? 'alphabetic';
  g.fillStyle = o.color ?? INK.f60;
  g.fillText(s, x, y);
}

/** Crisp 1px line between two points (pixel-snapped). */
export function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color = INK.f40, dash?: number[]): void {
  g.strokeStyle = color;
  g.lineWidth = 1;
  g.setLineDash(dash ?? []);
  g.beginPath();
  g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5);
  g.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
  g.stroke();
  g.setLineDash([]);
}

/** Dot grid aligned with world ticks. */
export function dotGrid(g: CanvasRenderingContext2D, pz: PanZoom, step?: number, color = INK.f20): void {
  const W = pz.width;
  const H = pz.height;
  const s = step ?? niceStep(W * pz.scale, 12);
  const [x0, y1] = pz.toWorld(0, 0);
  const [x1, y0] = pz.toWorld(W, H);
  const nx = (x1 - x0) / s;
  const ny = (y1 - y0) / s;
  if (nx * ny > 40000) return;
  g.fillStyle = color;
  for (let x = Math.ceil(x0 / s) * s; x <= x1; x += s) {
    const sx = Math.round(pz.sx(x));
    for (let y = Math.ceil(y0 / s) * s; y <= y1; y += s) g.fillRect(sx, Math.round(pz.sy(y)), 1, 1);
  }
}

/** Graduated axes through the origin (clamped to the viewport edges) with tick labels. */
export function axes(
  g: CanvasRenderingContext2D,
  pz: PanZoom,
  o: { labels?: boolean; xName?: string; yName?: string; color?: string; yStep?: number; xStep?: number } = {},
): void {
  const W = pz.width;
  const H = pz.height;
  const col = o.color ?? INK.f40;
  const sx = niceStep(W * pz.scale, Math.max(4, W / 110));
  const sy = o.yStep ?? niceStep(H * pz.scale, Math.max(3, H / 90));
  const xs = o.xStep ?? sx;
  const ax = Math.min(H - 18, Math.max(18, pz.sy(0)));
  const ay = Math.min(W - 18, Math.max(40, pz.sx(0)));
  line(g, 0, ax, W, ax, col);
  line(g, ay, 0, ay, H, col);
  const [x0, y1] = pz.toWorld(0, 0);
  const [x1, y0] = pz.toWorld(W, H);
  g.fillStyle = col;
  for (let x = Math.ceil(x0 / xs) * xs; x <= x1; x += xs) {
    const px = Math.round(pz.sx(x)) + 0.5;
    g.fillRect(px - 0.5, ax - 3, 1, 7);
    if (o.labels !== false && Math.abs(x) > xs * 1e-6) text(g, fmtTick(x, xs), px, ax + 15, { align: 'center', color: INK.f40, size: 9 });
    for (let k = 1; k < 5; k++) g.fillRect(Math.round(pz.sx(x + (k * xs) / 5)), ax - 1, 1, 3);
  }
  for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) {
    const py = Math.round(pz.sy(y)) + 0.5;
    g.fillRect(ay - 3, py - 0.5, 7, 1);
    if (o.labels !== false && Math.abs(y) > sy * 1e-6) text(g, fmtTick(y, sy), ay - 7, py + 3, { align: 'right', color: INK.f40, size: 9 });
  }
  if (o.xName) text(g, o.xName, W - 10, ax - 8, { align: 'right', color: INK.f60, size: 10 });
  if (o.yName) text(g, o.yName, ay + 8, 14, { color: INK.f60, size: 10 });
}

/** Plot y = f(x) across the visible range, breaking the path on NaN or vertical jumps. */
export function plot(
  g: CanvasRenderingContext2D,
  pz: PanZoom,
  f: (x: number) => number,
  o: { color?: string; width?: number; x0?: number; x1?: number; dash?: number[]; samples?: number } = {},
): void {
  const W = pz.width;
  const H = pz.height;
  const [vx0] = pz.toWorld(0, 0);
  const [vx1] = pz.toWorld(W, 0);
  const a = Math.max(vx0, o.x0 ?? -Infinity);
  const b = Math.min(vx1, o.x1 ?? Infinity);
  if (b <= a) return;
  const n = o.samples ?? Math.ceil(((b - a) / pz.scale) * 1.5);
  g.strokeStyle = o.color ?? INK.fg;
  g.lineWidth = o.width ?? 1;
  g.setLineDash(o.dash ?? []);
  g.beginPath();
  let pen = false;
  let lastY = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    const px = pz.sx(x);
    const py = pz.sy(y);
    if (pen && Math.abs(py - lastY) > H * 2) pen = false;
    if (Math.abs(py) > 1e6) {
      pen = false;
      continue;
    }
    if (pen) g.lineTo(px, py);
    else g.moveTo(px, py);
    pen = true;
    lastY = py;
  }
  g.stroke();
  g.setLineDash([]);
}

/** Small framed label box near a point (HUD callout). */
export function callout(g: CanvasRenderingContext2D, x: number, y: number, label: string, o: { dx?: number; dy?: number; align?: 'left' | 'right' } = {}): void {
  const dx = o.dx ?? 14;
  const dy = o.dy ?? -14;
  g.font = font(10);
  const w = g.measureText(label).width + 10;
  const right = o.align === 'left' ? false : true;
  const bx = right ? x + dx : x - dx - w;
  const by = y + dy - 8;
  line(g, x, y, right ? bx : bx + w, by + 8, INK.f40);
  g.fillStyle = 'rgba(0,0,0,0.75)';
  g.fillRect(bx, by, w, 16);
  g.strokeStyle = INK.f40;
  g.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, Math.round(w), 16);
  text(g, label, bx + 5, by + 11.5, { color: INK.fg });
}

/** Square marker. */
export function marker(g: CanvasRenderingContext2D, x: number, y: number, size = 5, filled = true, color = INK.fg): void {
  const s = Math.round(size);
  if (filled) {
    g.fillStyle = color;
    g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
  } else {
    g.strokeStyle = color;
    g.lineWidth = 1;
    g.strokeRect(Math.round(x - s / 2) + 0.5, Math.round(y - s / 2) + 0.5, s - 1, s - 1);
  }
}

/** Hatched fill of a closed path (monochrome "area" rendering). */
export function hatch(g: CanvasRenderingContext2D, path: Path2D, spacing = 6, color = INK.f20, angle = Math.PI / 4): void {
  g.save();
  g.clip(path);
  g.strokeStyle = color;
  g.lineWidth = 1;
  const W = g.canvas.width;
  const H = g.canvas.height;
  const d = Math.hypot(W, H);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  g.beginPath();
  for (let k = -d; k < d; k += spacing) {
    g.moveTo(k * s - d * c, -k * c - d * s);
    g.lineTo(k * s + d * c, -k * c + d * s);
  }
  g.stroke();
  g.restore();
}
