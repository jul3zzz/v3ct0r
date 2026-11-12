import type { VizContext } from '../core/types';

export interface PanZoomOptions {
  cx?: number;
  cy?: number;
  /** World units per CSS pixel. */
  scale?: number;
  minScale?: number;
  maxScale?: number;
  pan?: boolean;
  zoom?: boolean;
  /** Called on a click that was not a drag (world coords). */
  onClick?: (x: number, y: number, e: PointerEvent) => void;
  /** Called while dragging if provided; returning true consumes the drag (no pan). */
  onDrag?: (x: number, y: number, e: PointerEvent, phase: 'start' | 'move' | 'end') => boolean;
  coordLabels?: [string, string];
}

/** The 2D camera of the current view (LEARN scenes move it). */
export const CAMERA: { current: PanZoom | null } = { current: null };

/** 2D camera for canvas and shader views: drag to pan, wheel to zoom at cursor,
 *  double-click to return home. World y points up. Coordinates are float64. */
export class PanZoom {
  cx: number;
  cy: number;
  scale: number;
  mouse: [number, number] | null = null;
  dragging = false;
  private home: { cx: number; cy: number; scale: number };
  private anim: { t0: number; from: { cx: number; cy: number; scale: number }; to: { cx: number; cy: number; scale: number } } | null = null;
  private down: { x: number; y: number; id: number; moved: boolean; custom: boolean } | null = null;

  constructor(private ctx: VizContext, private o: PanZoomOptions = {}) {
    this.cx = o.cx ?? 0;
    this.cy = o.cy ?? 0;
    this.scale = o.scale ?? 0.01;
    this.home = { cx: this.cx, cy: this.cy, scale: this.scale };
    CAMERA.current = this;
    ctx.onDispose(() => {
      if (CAMERA.current === this) CAMERA.current = null;
    });
    const el = ctx.input;
    const local = (e: MouseEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    if (o.pan !== false || o.onDrag) el.classList.add('grab');
    ctx.onDispose(() => el.classList.remove('grab', 'grabbing'));

    // touch: two fingers pinch to zoom (and pan with their midpoint); a double tap is a dblclick (core/touch.ts)
    const touches = new Map<number, [number, number]>();
    let pinch: { d: number; mx: number; my: number } | null = null;
    const pinchNow = () => {
      const [a, b] = [...touches.values()];
      return { d: Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1])), mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 };
    };
    ctx.listen(el, 'pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        touches.set(e.pointerId, local(e));
        if (touches.size === 2) {
          // a second finger: the one-finger drag (if any) ends where it is, the pinch begins
          if (this.down) {
            if (this.down.custom) o.onDrag?.(...this.toWorld(this.down.x, this.down.y), e, 'end');
            this.down = null;
            this.dragging = false;
            el.classList.remove('grabbing');
          }
          el.setPointerCapture(e.pointerId);
          pinch = pinchNow();
          this.anim = null;
          return;
        }
        if (touches.size > 2) return;
      }
      if (e.button !== 0) return;
      const [x, y] = local(e);
      const [wx, wy] = this.toWorld(x, y);
      const custom = !!o.onDrag?.(wx, wy, e, 'start');
      this.down = { x, y, id: e.pointerId, moved: false, custom };
      el.setPointerCapture(e.pointerId);
      this.anim = null;
    });
    ctx.listen(el, 'pointermove', (e: PointerEvent) => {
      const [x, y] = local(e);
      if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
        touches.set(e.pointerId, [x, y]);
        if (pinch && touches.size === 2) {
          const p = pinchNow();
          if (o.zoom !== false) this.zoomAt(p.mx, p.my, pinch.d / p.d);
          if (o.pan !== false) {
            this.cx -= (p.mx - pinch.mx) * this.scale;
            this.cy += (p.my - pinch.my) * this.scale;
          }
          pinch = p;
          ctx.hud.refresh();
          return;
        }
      }
      this.mouse = [x, y];
      if (!this.down || this.down.id !== e.pointerId) return;
      const dx = x - this.down.x;
      const dy = y - this.down.y;
      if (!this.down.moved && Math.hypot(dx, dy) > 3) {
        this.down.moved = true;
        this.dragging = true;
        el.classList.add('grabbing');
      }
      if (!this.down.moved) return;
      if (this.down.custom) {
        const [wx, wy] = this.toWorld(x, y);
        o.onDrag?.(wx, wy, e, 'move');
      } else if (o.pan !== false) {
        this.cx -= dx * this.scale;
        this.cy += dy * this.scale;
      }
      this.down.x = x;
      this.down.y = y;
      ctx.hud.refresh();
    });
    const up = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        touches.delete(e.pointerId);
        // the end of a pinch: the finger left on the screen does not start a drag
        if (pinch) {
          if (touches.size < 2) pinch = null;
          return;
        }
      }
      if (!this.down || this.down.id !== e.pointerId) return;
      const [x, y] = local(e);
      const [wx, wy] = this.toWorld(x, y);
      if (this.down.custom) o.onDrag?.(wx, wy, e, 'end');
      else if (!this.down.moved) o.onClick?.(wx, wy, e);
      this.down = null;
      this.dragging = false;
      el.classList.remove('grabbing');
    };
    ctx.listen(el, 'pointerup', up);
    ctx.listen(el, 'pointercancel', up);
    ctx.listen(el, 'pointerleave', () => (this.mouse = null));
    ctx.listen(
      el,
      'wheel',
      (e: WheelEvent) => {
        if (o.zoom === false) return;
        e.preventDefault();
        const [x, y] = local(e);
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        this.zoomAt(x, y, Math.exp(dy * 0.0015));
      },
      { passive: false },
    );
    ctx.listen(el, 'dblclick', () => this.goHome());
    ctx.hud.setMapper((px, py) => this.toWorld(px, py), o.coordLabels);
  }

  get width(): number {
    return this.ctx.width;
  }
  get height(): number {
    return this.ctx.height;
  }

  toWorld(px: number, py: number): [number, number] {
    return [this.cx + (px - this.ctx.width / 2) * this.scale, this.cy - (py - this.ctx.height / 2) * this.scale];
  }

  toScreen(x: number, y: number): [number, number] {
    return [this.ctx.width / 2 + (x - this.cx) / this.scale, this.ctx.height / 2 - (y - this.cy) / this.scale];
  }

  sx(x: number): number {
    return this.ctx.width / 2 + (x - this.cx) / this.scale;
  }
  sy(y: number): number {
    return this.ctx.height / 2 - (y - this.cy) / this.scale;
  }

  zoomAt(px: number, py: number, factor: number): void {
    const [wx, wy] = this.toWorld(px, py);
    let s = this.scale * factor;
    if (this.o.minScale) s = Math.max(this.o.minScale, s);
    if (this.o.maxScale) s = Math.min(this.o.maxScale, s);
    this.scale = s;
    this.cx = wx - (px - this.ctx.width / 2) * s;
    this.cy = wy + (py - this.ctx.height / 2) * s;
    this.anim = null;
    this.ctx.hud.refresh();
  }

  /** Fit a world box into the viewport (with margin in CSS px) and make it the home view. */
  fit(xmin: number, xmax: number, ymin: number, ymax: number, margin = 60, setHome = true): void {
    const w = Math.max(50, this.ctx.width - 2 * margin);
    const h = Math.max(50, this.ctx.height - 2 * margin);
    this.scale = Math.max((xmax - xmin) / w, (ymax - ymin) / h);
    this.cx = (xmin + xmax) / 2;
    this.cy = (ymin + ymax) / 2;
    if (setHome) this.home = { cx: this.cx, cy: this.cy, scale: this.scale };
  }

  setHome(): void {
    this.home = { cx: this.cx, cy: this.cy, scale: this.scale };
  }

  goHome(): void {
    this.anim = { t0: performance.now(), from: { cx: this.cx, cy: this.cy, scale: this.scale }, to: { ...this.home } };
  }

  /** Smoothly fly to a view. */
  flyTo(cx: number, cy: number, scale: number): void {
    this.anim = { t0: performance.now(), from: { cx: this.cx, cy: this.cy, scale: this.scale }, to: { cx, cy, scale } };
  }

  /** Advance the home/fly animation; call once per frame. */
  tick(): void {
    if (!this.anim) return;
    const k = Math.min(1, (performance.now() - this.anim.t0) / 700);
    const e = 1 - Math.pow(1 - k, 3);
    const { from, to } = this.anim;
    this.cx = from.cx + (to.cx - from.cx) * e;
    this.cy = from.cy + (to.cy - from.cy) * e;
    this.scale = Math.exp(Math.log(from.scale) + (Math.log(to.scale) - Math.log(from.scale)) * e);
    if (k >= 1) this.anim = null;
    this.ctx.hud.refresh();
  }

  get animating(): boolean {
    return !!this.anim;
  }

  /** Re-express everything in a coordinate system translated by (dx, dy): world' = world − (dx, dy).
   *  Used by deep-zoom views that keep a high-precision origin and small local coordinates. */
  translate(dx: number, dy: number): void {
    this.cx -= dx;
    this.cy -= dy;
    this.home = { ...this.home, cx: this.home.cx - dx, cy: this.home.cy - dy };
    if (this.anim) {
      this.anim.from = { ...this.anim.from, cx: this.anim.from.cx - dx, cy: this.anim.from.cy - dy };
      this.anim.to = { ...this.anim.to, cx: this.anim.to.cx - dx, cy: this.anim.to.cy - dy };
    }
  }

  /** Override the double-click home view. */
  setHomeTo(cx: number, cy: number, scale: number): void {
    this.home = { cx, cy, scale };
  }
}
