/** Mini telemetry graph (sparkline) drawn on a small canvas, 1px white line. */
export class Sparkline {
  readonly el: HTMLCanvasElement;
  private buf: Float32Array;
  private n = 0;
  private head = 0;
  private g: CanvasRenderingContext2D;
  constructor(
    private size = 90,
    private opts: { min?: number; max?: number; log?: boolean; bars?: boolean; height?: number } = {},
    className = 'spark',
  ) {
    this.buf = new Float32Array(size);
    this.el = document.createElement('canvas');
    this.el.className = className;
    this.g = this.el.getContext('2d')!;
  }

  reset(): void {
    this.n = 0;
    this.head = 0;
  }

  push(v: number): void {
    this.buf[this.head] = v;
    this.head = (this.head + 1) % this.size;
    this.n = Math.min(this.size, this.n + 1);
    this.draw();
  }

  /** Replace the whole series. */
  set(values: ArrayLike<number>): void {
    this.reset();
    const k = Math.min(values.length, this.size);
    for (let i = values.length - k; i < values.length; i++) {
      this.buf[this.head] = values[i];
      this.head = (this.head + 1) % this.size;
      this.n++;
    }
    this.draw();
  }

  private draw(): void {
    const el = this.el;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(10, el.clientWidth || 90);
    const h = Math.max(8, el.clientHeight || this.opts.height || 14);
    if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    }
    const g = this.g;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    if (!this.n) return;
    const vals: number[] = [];
    for (let i = 0; i < this.n; i++) {
      let v = this.buf[(this.head - this.n + i + this.size) % this.size];
      if (this.opts.log) v = Math.log10(Math.max(1e-300, Math.abs(v)));
      vals.push(v);
    }
    let lo = this.opts.min ?? Math.min(...vals);
    let hi = this.opts.max ?? Math.max(...vals);
    if (hi - lo < 1e-12) { hi += 0.5; lo -= 0.5; }
    const x = (i: number) => (i / (this.size - 1)) * (w - 1) + 0.5;
    const y = (v: number) => h - 1.5 - ((v - lo) / (hi - lo)) * (h - 3);
    g.strokeStyle = 'rgba(255,255,255,0.15)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, h - 0.5);
    g.lineTo(w, h - 0.5);
    g.stroke();
    if (this.opts.bars) {
      g.fillStyle = 'rgba(255,255,255,0.7)';
      const off = this.size - this.n;
      for (let i = 0; i < vals.length; i++) {
        const yy = y(vals[i]);
        g.fillRect(Math.floor(x(i + off)), yy, 1, h - yy);
      }
      return;
    }
    g.strokeStyle = '#fff';
    g.beginPath();
    const off = this.size - this.n;
    vals.forEach((v, i) => (i ? g.lineTo(x(i + off), y(v)) : g.moveTo(x(i + off), y(v))));
    g.stroke();
  }
}
