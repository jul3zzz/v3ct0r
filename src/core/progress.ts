import { store } from './settings';
import type { ModuleDef } from './types';

/** Per-exercise result. `revealed`: the solution was shown, so it no longer counts. */
export interface ExResult {
  solved: boolean;
  attempts: number;
  revealed: boolean;
}

interface Saved {
  free: boolean;
  views: Record<string, { ex: ExResult[]; read: boolean }>;
}

const KEY = 'progress.v1';
export const NEEDED = 2; // exercises to validate a view (out of 3)
export const CINE_NEEDED = 10; // validated views to unlock the cinematic mode

export const RANKS = [
  { min: 0, name: 'RECRUE' },
  { min: 3, name: 'CADET' },
  { min: 8, name: 'NAVIGATEUR' },
  { min: 16, name: 'ANALYSTE' },
  { min: 28, name: 'ARCHITECTE' },
  { min: 46, name: 'MAÎTRE DES DIMENSIONS' },
];

type Listener = () => void;

/** Unlock rules: the first view of every module is open; validating a view (≥ 2/3 exercises solved
 *  without revealing the solution) unlocks the next one in its module. Free mode opens everything. */
export class Progress {
  private s: Saved;
  private listeners = new Set<Listener>();
  /** unlocked from outside without being saved (a school trial: src/school/school.ts). Never
   *  setFree: `free` is synced with the account, and merging ORs it, so it would stay forever. */
  private forced: () => boolean = () => false;

  constructor(private modules: ModuleDef[]) {
    this.s = store.get<Saved>(KEY, { free: false, views: {} });
    if (typeof this.s.free !== 'boolean' || typeof this.s.views !== 'object') this.s = { free: false, views: {} };
  }

  private save(): void {
    store.set(KEY, this.s);
    this.listeners.forEach((l) => l());
  }

  onChange(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  get free(): boolean {
    return this.s.free;
  }

  setFree(v: boolean): void {
    this.s.free = v;
    this.save();
  }

  force(fn: () => boolean): void {
    this.forced = fn;
    this.listeners.forEach((l) => l());
  }

  /** every lock open: free mode (saved) or forced (school trial, not saved) */
  get open(): boolean {
    return this.s.free || this.forced();
  }

  reset(): void {
    this.s = { free: false, views: {} };
    this.save();
  }

  entry(id: string): { ex: ExResult[]; read: boolean } {
    if (!this.s.views[id]) this.s.views[id] = { ex: [0, 1, 2].map(() => ({ solved: false, attempts: 0, revealed: false })), read: false };
    return this.s.views[id];
  }

  record(id: string, k: number, solved: boolean): void {
    const e = this.entry(id).ex[k];
    e.attempts++;
    if (solved && !e.revealed) e.solved = true;
    this.save();
  }

  reveal(id: string, k: number): void {
    const e = this.entry(id).ex[k];
    if (!e.solved) e.revealed = true;
    this.save();
  }

  markRead(id: string): void {
    if (this.entry(id).read) return;
    this.entry(id).read = true;
    this.save();
  }

  score(id: string): number {
    return this.s.views[id]?.ex.filter((e) => e.solved).length ?? 0;
  }

  validated(id: string): boolean {
    return this.score(id) >= NEEDED;
  }

  /** previous view in the same module, if any */
  prerequisite(modId: string, vizId: string): { modId: string; vizId: string; title: string; code: string } | null {
    const m = this.modules.find((x) => x.id === modId);
    if (!m) return null;
    const i = m.vizs.findIndex((v) => v.id === vizId);
    if (i <= 0) return null;
    const p = m.vizs[i - 1];
    return { modId, vizId: p.id, title: p.title, code: `${m.code}.${String(i).padStart(2, '0')}` };
  }

  unlocked(modId: string, vizId: string): boolean {
    if (this.open) return true;
    const pre = this.prerequisite(modId, vizId);
    return !pre || this.validated(`${pre.modId}/${pre.vizId}`);
  }

  get validatedCount(): number {
    return this.modules.reduce((n, m) => n + m.vizs.filter((v) => this.validated(`${m.id}/${v.id}`)).length, 0);
  }

  get total(): number {
    return this.modules.reduce((n, m) => n + m.vizs.length, 0);
  }

  get rank(): { name: string; index: number; next: number | null } {
    const n = this.validatedCount;
    let index = 0;
    RANKS.forEach((r, i) => n >= r.min && (index = i));
    return { name: RANKS[index].name, index, next: RANKS[index + 1]?.min ?? null };
  }

  cinematicUnlocked(): boolean {
    return this.open || this.validatedCount >= CINE_NEEDED;
  }
}
