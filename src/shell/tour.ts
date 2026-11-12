import { h, setText } from '../hud/dom';
import { icon } from '../hud/deco';
import { typewriter } from '../hud/fx';
import { sfx } from '../core/audio';
import { NARROW, PHONE, setSheet } from './layout';

/** What a tour step can do to the app. */
export interface TourApi {
  go(id: string): void;
  view(): string;
  pick(optionLabel: string): void;
  set(label: string, value: unknown): void;
  get(label: string): unknown;
  sigma(open: boolean): void;
  sigmaOpen(): boolean;
  paletteOpen(): boolean;
  /** true if a segmented option with this label is currently selected */
  pressed(optionLabel: string): boolean;
  /** true if the user pressed in the viewport after time t (performance.now) */
  touchedSince(t: number): boolean;
  /** the lesson terminal is open */
  termOpen(): boolean;
  /** where the app is: section, ATLAS system, last calculator line, notes kept, written course read */
  app(): { mode: 'explore' | 'learn' | 'atlas'; uni: string | null; calc: { src: string; out: string } | null; notes: number; course: string | null };
  /** close the side panels and the lesson terminal (each tutorial step starts clean) */
  tidy(): void;
}

export interface TourStep {
  title: string;
  text: string;
  /** user instruction (tutorial): shown as "→ À TOI" and validated by `wait` */
  task?: string;
  view?: string;
  do?: (api: TourApi) => void;
  highlight?: string;
  wait?: (api: TourApi, startedAt: number) => boolean;
  seconds: number;
}

export interface Tour {
  id: string;
  title: string;
  kind: 'tuto' | 'parcours';
  summary: string;
  /** stays on when the app switches section (EXPLORER, LEARN, ATLAS): the tutorial visits them all */
  crossMode?: boolean;
  steps: TourStep[];
}

export const tourMinutes = (t: Tour): number => Math.max(1, Math.round(t.steps.reduce((s, x) => s + x.seconds, 0) / 60));

/** Plays a guided tour: docked card over the viewport, narration, optional user tasks,
 *  auto-advance (stories) or validation (tutorial), highlight of the relevant control. */
export class TourPlayer {
  private tour: Tour | null = null;
  private i = 0;
  private t0 = 0;
  private elapsed = 0;
  private paused = false;
  private doneAt = 0;
  private el: HTMLElement | null = null;
  private hl: HTMLElement;
  private refs: { head: HTMLElement; title: HTMLElement; text: HTMLElement; task: HTMLElement; bar: HTMLElement; pause: HTMLButtonElement } | null = null;

  constructor(private host: HTMLElement, private api: TourApi, private onChange: (active: boolean) => void) {
    this.hl = h('div', { class: 'tour-hl', 'aria-hidden': 'true' });
  }

  get active(): boolean {
    return !!this.tour;
  }
  get current(): Tour | null {
    return this.tour;
  }
  get index(): number {
    return this.i;
  }

  start(tour: Tour): void {
    this.stop(false);
    this.tour = tour;
    this.i = 0;
    this.paused = false;
    document.body.classList.add('touring');
    this.build();
    this.enter();
    this.onChange(true);
    sfx.open();
  }

  stop(notify = true): void {
    if (!this.tour) return;
    this.tour = null;
    this.el?.remove();
    this.el = null;
    this.refs = null;
    this.hl.remove();
    document.body.classList.remove('touring');
    if (notify) {
      this.onChange(false);
      sfx.close();
    }
  }

  next(): void {
    if (!this.tour) return;
    if (this.i >= this.tour.steps.length - 1) {
      this.stop();
      return;
    }
    this.i++;
    this.enter();
    sfx.tick();
  }

  prev(): void {
    if (!this.tour || this.i === 0) return;
    this.i--;
    this.enter();
    sfx.tick();
  }

  togglePause(): void {
    this.paused = !this.paused;
    if (this.refs) this.refs.pause.replaceChildren(icon(this.paused ? 'play' : 'pause'), h('span', { text: this.paused ? 'REPRENDRE' : 'PAUSE' }));
  }

  private build(): void {
    const head = h('div', { class: 'tour-head' });
    const title = h('div', { class: 'tour-title' });
    const text = h('div', { class: 'tour-text' });
    const task = h('div', { class: 'tour-task' });
    const bar = h('i');
    const btn = (label: string, ico: string, fn: () => void) => {
      const b = h('button', { type: 'button', class: 'btn' }, icon(ico), h('span', { text: label }));
      b.addEventListener('click', () => {
        sfx.click();
        fn();
      });
      return b;
    };
    const pause = btn('PAUSE', 'pause', () => this.togglePause());
    const el = h(
      'div',
      // `cross`: the tutorial stays visible in LEARN and the ATLAS (they hide the other tours)
      { class: `tour frame solid${this.tour?.crossMode ? ' cross' : ''}`, role: 'dialog', 'aria-label': 'Visite guidée' },
      head,
      title,
      text,
      task,
      h('div', { class: 'tour-btns' }, btn('PRÉC.', 'reset', () => this.prev()), pause, btn('SUIVANT', 'play', () => this.next()), h('span', { class: 'spacer' }), btn('QUITTER', 'close', () => this.stop())),
      h('div', { class: 'tour-bar' }, bar),
    );
    this.host.append(el);
    document.body.append(this.hl);
    this.el = el;
    this.refs = { head, title, text, task, bar, pause };
  }

  private enter(): void {
    const tour = this.tour!;
    const step = tour.steps[this.i];
    if (step.view && this.api.view() !== step.view) this.api.go(step.view);
    try {
      step.do?.(this.api);
    } catch (e) {
      console.error(e);
    }
    this.t0 = performance.now();
    this.elapsed = 0;
    this.doneAt = 0;
    const r = this.refs!;
    setText(r.title, step.title);
    void typewriter(r.text, step.text, 140);
    r.task.style.display = step.task ? '' : 'none';
    r.task.classList.remove('ok');
    if (step.task) r.task.replaceChildren(h('span', { text: '→ À TOI :' }), h('span', { text: step.task }), h('span', { class: 'st', text: '◇ EN ATTENTE' }));
    this.paintHead();
  }

  private paintHead(): void {
    const tour = this.tour!;
    const left = tour.steps.slice(this.i).reduce((s, x) => s + x.seconds, 0) - this.elapsed;
    const min = Math.max(0, Math.ceil(left / 60));
    setText(this.refs!.head, `${tour.kind === 'tuto' ? 'TUTO' : 'PARCOURS'} · ${tour.title}  ·  ÉTAPE ${this.i + 1}/${tour.steps.length}  ·  ≈ ${min} MIN`);
  }

  /** Called every frame by the app. */
  tick(dt: number): void {
    if (!this.tour || !this.refs) return;
    const step = this.tour.steps[this.i];
    if (!this.paused) this.elapsed += dt;
    const r = this.refs;
    if (step.wait) {
      if (!this.doneAt && step.wait(this.api, this.t0)) {
        this.doneAt = performance.now();
        r.task.classList.add('ok');
        const st = r.task.querySelector('.st');
        if (st) st.textContent = '✓ FAIT';
        sfx.confirm();
      }
      if (this.doneAt && performance.now() - this.doneAt > 1600 && !this.paused) {
        this.next();
        return;
      }
      r.bar.style.width = this.doneAt ? '100%' : `${Math.min(100, (100 * this.elapsed) / step.seconds).toFixed(1)}%`;
    } else {
      r.bar.style.width = `${Math.min(100, (100 * this.elapsed) / step.seconds).toFixed(1)}%`;
      if (this.tour.kind === 'parcours' && this.elapsed >= step.seconds && !this.paused) {
        this.next();
        return;
      }
    }
    if (Math.floor(this.elapsed * 2) !== Math.floor((this.elapsed - dt) * 2)) this.paintHead();
    // highlight
    const target = step.highlight ? (document.querySelector(step.highlight) as HTMLElement | null) : null;
    // narrow window: what the step points at is in the rail drawer → open it
    if (target?.closest('#app > .rail') && matchMedia(NARROW).matches && !document.body.classList.contains('rail-open')) document.body.classList.add('rail-open');
    // phone: it is in the folded panel sheet → open the sheet
    if (target?.closest('#app > .panel') && matchMedia(PHONE).matches && document.body.classList.contains('sheet-min')) setSheet(true);
    if (target && target.offsetParent !== null) {
      const b = target.getBoundingClientRect();
      this.hl.style.display = 'block';
      this.hl.style.left = `${b.left - 4}px`;
      this.hl.style.top = `${b.top - 4}px`;
      this.hl.style.width = `${b.width + 8}px`;
      this.hl.style.height = `${b.height + 8}px`;
    } else this.hl.style.display = 'none';
  }
}
