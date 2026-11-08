// Progression of the story mode. The state is derived (pure, tested) from two facts: which games
// have been passed (scores of the leçons-jeux, rank C or better) and which beacons' logs have been
// read (saved here). Rules (STORY.md §2): an act opens once the acts it follows are restored; in an
// act, the first ready beacon opens first, then all the others, and the last beacon closes the act.
import { store } from '../core/settings';
import { ACTS, CHAPTERS, EVENTS, PARTS, type Chapter, type TimelineEvent } from './data';

export type BeaconState = 'locked' | 'open' | 'done' | 'construction';

export interface StoryInput {
  /** the game has a passing score (rank C or better) at some level */
  gameDone(id: string): boolean;
  /** beacons whose log has been read (landed on, or « consigné ») */
  read: Set<string>;
}

export interface StoryState {
  acts: Record<number, 'locked' | 'open' | 'done'>;
  chapters: Record<string, BeaconState>;
  /** ship parts earned, in order */
  parts: string[];
  /** timeline events unlocked, by year */
  events: TimelineEvent[];
  restored: number;
  /** beacons with a mission built */
  playable: number;
}

const byCode = (a: Chapter, b: Chapter) => {
  const n = (c: Chapter) => Number(c.code.split('.')[1]);
  return a.act - b.act || n(a) - n(b);
};

export function chapterDone(c: Chapter, inp: StoryInput): boolean {
  if (!c.ready || !inp.read.has(c.id)) return false;
  return c.game ? inp.gameDone(c.game) : true;
}

export function storyState(inp: StoryInput): StoryState {
  const acts: StoryState['acts'] = {};
  const chapters: StoryState['chapters'] = {};
  const done = new Set(CHAPTERS.filter((c) => chapterDone(c, inp)).map((c) => c.id));
  const actDone = (n: number) => {
    const ready = CHAPTERS.filter((c) => c.act === n && c.ready);
    return ready.length > 0 && ready.every((c) => done.has(c.id));
  };
  for (const a of ACTS) {
    const open = a.after.every((b) => actDone(b));
    acts[a.n] = !open ? 'locked' : actDone(a.n) ? 'done' : 'open';
    const order = CHAPTERS.filter((c) => c.act === a.n).sort(byCode);
    const ready = order.filter((c) => c.ready);
    const entry = ready[0];
    const last = order[order.length - 1];
    for (const c of order) {
      if (!c.ready) chapters[c.id] = 'construction';
      else if (done.has(c.id)) chapters[c.id] = 'done';
      else if (!open) chapters[c.id] = 'locked';
      else if (c === entry) chapters[c.id] = 'open';
      else if (c === last) chapters[c.id] = ready.filter((x) => x !== c).every((x) => done.has(x.id)) ? 'open' : 'locked';
      else chapters[c.id] = done.has(entry.id) ? 'open' : 'locked';
    }
  }
  const parts = CHAPTERS.filter((c) => c.reward && done.has(c.id)).sort(byCode).map((c) => c.reward!);
  const events = EVENTS.filter((e) => done.has(e.chapter)).sort((a, b) => a.year - b.year);
  return { acts, chapters, parts: parts.filter((p) => PARTS.some((x) => x.id === p)), events, restored: done.size, playable: CHAPTERS.filter((c) => c.ready).length };
}

const KEY = 'story.v1';

/** what the player did in the story (the rest is derived) */
export class StoryProgress {
  private read: Set<string>;
  constructor() {
    const raw = store.get<{ read?: string[] }>(KEY, {});
    this.read = new Set(Array.isArray(raw.read) ? raw.read.filter((x) => typeof x === 'string') : []);
  }

  get readSet(): Set<string> {
    return this.read;
  }

  markRead(id: string): boolean {
    if (this.read.has(id)) return false;
    this.read.add(id);
    store.set(KEY, { read: [...this.read] });
    return true;
  }

  reset(): void {
    this.read.clear();
    store.set(KEY, { read: [] });
  }
}
