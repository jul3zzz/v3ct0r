// LEARN progress, saved in localStorage (store() already guards every access with try/catch).
import { store } from '../core/settings';

export interface ExState {
  solved: boolean;
  hints: number;
  revealed: boolean;
  /** self-assessment after reading the solution (exercises without an automatic check) */
  self?: 'ok' | 'ko';
}

export interface CourseState {
  /** last position (s) */
  pos: number;
  /** time actually spent in the course (s) */
  watched: number;
  done: boolean;
  lastAt: number;
  ex: Record<string, ExState>;
}

export interface ColleResult {
  course: string;
  ex: string;
  score: number;
  max: number;
  seconds: number;
  at: number;
}

interface Saved {
  courses: Record<string, CourseState>;
  colles: ColleResult[];
}

const KEY = 'learn.v1';

export class LearnProgress {
  private s: Saved;
  private listeners = new Set<() => void>();
  private dirty = false;
  private timer = 0;

  constructor() {
    const raw = store.get<Saved>(KEY, { courses: {}, colles: [] });
    this.s = raw && typeof raw.courses === 'object' && Array.isArray(raw.colles) ? raw : { courses: {}, colles: [] };
  }

  onChange(fn: () => void): void {
    this.listeners.add(fn);
  }

  private save(now = false): void {
    this.dirty = true;
    const flush = () => {
      this.timer = 0;
      if (!this.dirty) return;
      this.dirty = false;
      store.set(KEY, this.s);
    };
    if (now) flush();
    else if (!this.timer) this.timer = window.setTimeout(flush, 1500);
    this.listeners.forEach((l) => l());
  }

  course(id: string): CourseState {
    return (this.s.courses[id] ??= { pos: 0, watched: 0, done: false, lastAt: 0, ex: {} });
  }

  has(id: string): boolean {
    return !!this.s.courses[id];
  }

  setPos(id: string, t: number): void {
    const c = this.course(id);
    c.pos = t;
    c.lastAt = Date.now();
    this.dirty = true;
    if (!this.timer) this.timer = window.setTimeout(() => this.save(true), 4000);
  }

  addWatched(id: string, dt: number): void {
    this.course(id).watched += dt;
  }

  markDone(id: string): void {
    const c = this.course(id);
    if (c.done) return;
    c.done = true;
    this.save(true);
  }

  ex(id: string, ex: string): ExState {
    return (this.course(id).ex[ex] ??= { solved: false, hints: 0, revealed: false });
  }

  updateEx(id: string, ex: string, patch: Partial<ExState>): void {
    Object.assign(this.ex(id, ex), patch);
    this.save(true);
  }

  solvedCount(id: string): number {
    return Object.values(this.s.courses[id]?.ex ?? {}).filter((e) => e.solved || e.self === 'ok').length;
  }

  addColle(r: ColleResult): void {
    this.s.colles.push(r);
    if (this.s.colles.length > 200) this.s.colles.splice(0, this.s.colles.length - 200);
    this.save(true);
  }

  get colles(): ColleResult[] {
    return this.s.colles;
  }

  reset(): void {
    this.s = { courses: {}, colles: [] };
    this.save(true);
  }

  flush(): void {
    this.save(true);
  }
}
