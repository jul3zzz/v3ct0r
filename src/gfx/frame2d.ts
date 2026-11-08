import { INK, fmtTick, line, niceStep, text } from './plot2d';

/** A fixed plotting rectangle inside the overlay canvas (no pan/zoom): world box → screen rect. */
export class Frame2D {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    public xmin: number,
    public xmax: number,
    public ymin: number,
    public ymax: number,
  ) {}

  set(x: number, y: number, w: number, h: number): this {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    return this;
  }

  world(xmin: number, xmax: number, ymin: number, ymax: number): this {
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
    return this;
  }

  sx(x: number): number {
    return this.x + ((x - this.xmin) / (this.xmax - this.xmin)) * this.w;
  }
  sy(y: number): number {
    return this.y + this.h - ((y - this.ymin) / (this.ymax - this.ymin)) * this.h;
  }
  wx(px: number): number {
    return this.xmin + ((px - this.x) / this.w) * (this.xmax - this.xmin);
  }
  wy(py: number): number {
    return this.ymin + ((this.y + this.h - py) / this.h) * (this.ymax - this.ymin);
  }
  contains(px: number, py: number): boolean {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }

  /** HUD frame with corner ticks + optional title. */
  box(g: CanvasRenderingContext2D, title?: string, fill = true): void {
    if (fill) {
      g.fillStyle = 'rgba(0,0,0,0.78)';
      g.fillRect(this.x, this.y, this.w, this.h);
    }
    g.strokeStyle = INK.f20;
    g.lineWidth = 1;
    g.strokeRect(Math.round(this.x) + 0.5, Math.round(this.y) + 0.5, Math.round(this.w), Math.round(this.h));
    g.strokeStyle = INK.f60;
    const c = 6;
    const x0 = Math.round(this.x) + 0.5;
    const y0 = Math.round(this.y) + 0.5;
    const x1 = x0 + Math.round(this.w);
    const y1 = y0 + Math.round(this.h);
    g.beginPath();
    g.moveTo(x0, y0 + c); g.lineTo(x0, y0); g.lineTo(x0 + c, y0);
    g.moveTo(x1 - c, y0); g.lineTo(x1, y0); g.lineTo(x1, y0 + c);
    g.moveTo(x0, y1 - c); g.lineTo(x0, y1); g.lineTo(x0 + c, y1);
    g.moveTo(x1 - c, y1); g.lineTo(x1, y1); g.lineTo(x1, y1 - c);
    g.stroke();
    if (title) text(g, title, this.x + 8, this.y - 6, { size: 9, color: INK.f60 });
  }

  axes(g: CanvasRenderingContext2D, o: { xName?: string; yName?: string; labels?: boolean; xTicks?: number; yTicks?: number } = {}): void {
    const ax = Math.min(this.y + this.h, Math.max(this.y, this.sy(0)));
    const ay = Math.min(this.x + this.w, Math.max(this.x, this.sx(0)));
    line(g, this.x, ax, this.x + this.w, ax, INK.f40);
    line(g, ay, this.y, ay, this.y + this.h, INK.f40);
    const xs = niceStep(this.xmax - this.xmin, o.xTicks ?? Math.max(3, this.w / 90));
    const ys = niceStep(this.ymax - this.ymin, o.yTicks ?? Math.max(2, this.h / 60));
    g.fillStyle = INK.f40;
    for (let x = Math.ceil(this.xmin / xs) * xs; x <= this.xmax + 1e-12; x += xs) {
      const px = Math.round(this.sx(x));
      g.fillRect(px, ax - 2, 1, 5);
      if (o.labels !== false && Math.abs(x) > xs * 1e-6) text(g, fmtTick(x, xs), px, ax + 13, { align: 'center', size: 9, color: INK.f40 });
    }
    for (let y = Math.ceil(this.ymin / ys) * ys; y <= this.ymax + 1e-12; y += ys) {
      const py = Math.round(this.sy(y));
      g.fillRect(ay - 2, py, 5, 1);
      if (o.labels !== false && Math.abs(y) > ys * 1e-6) text(g, fmtTick(y, ys), ay - 6, py + 3, { align: 'right', size: 9, color: INK.f40 });
    }
    if (o.xName) text(g, o.xName, this.x + this.w - 4, ax - 6, { align: 'right', size: 10, color: INK.f60 });
    if (o.yName) text(g, o.yName, ay + 6, this.y + 12, { size: 10, color: INK.f60 });
  }

  plot(g: CanvasRenderingContext2D, f: (x: number) => number, o: { color?: string; x0?: number; x1?: number; dash?: number[]; n?: number } = {}): void {
    const a = Math.max(this.xmin, o.x0 ?? -Infinity);
    const b = Math.min(this.xmax, o.x1 ?? Infinity);
    if (b <= a) return;
    const n = o.n ?? Math.ceil(((b - a) / (this.xmax - this.xmin)) * this.w * 1.5);
    g.save();
    g.beginPath();
    g.rect(this.x, this.y - 2, this.w, this.h + 4);
    g.clip();
    g.strokeStyle = o.color ?? INK.fg;
    g.lineWidth = 1;
    g.setLineDash(o.dash ?? []);
    g.beginPath();
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(this.sy(y)) > 1e5) {
        pen = false;
        continue;
      }
      if (pen) g.lineTo(this.sx(x), this.sy(y));
      else g.moveTo(this.sx(x), this.sy(y));
      pen = true;
    }
    g.stroke();
    g.restore();
  }
}
