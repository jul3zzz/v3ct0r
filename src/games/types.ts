// V3CT0R LEARN · leçons-jeux: interactive challenges for adults (precision and reasoning, timed,
// graded), each one built on an exact theorem revealed at the debrief.

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoundResult {
  ok: boolean;
  /** 0..100 */
  score: number;
  /** one line shown at the reveal ("δ = 0,041 · optimum δ* = 0,048") */
  detail: string;
}

export interface GameLevel {
  title: string;
  /** one line: what changes at this level */
  brief: string;
  rounds: number;
  /** seconds per round */
  time: number;
}

/** touch screen: an on-screen button for what only the keyboard does; it sends `key` (and `code`, Maj with
 *  `shift`) to key(). `hold`: pressed until released (keyUp); `repeat`: sent again while it is held. */
export interface TouchKey {
  label: string;
  title?: string;
  key: string;
  code?: string;
  shift?: boolean;
  hold?: boolean;
  repeat?: boolean;
}

/** The mechanics of one game; the shell (engine.ts) runs briefing, rounds, timer, scores. */
export interface GameLogic {
  /** touch screen: the buttons that stand for keyboard-only controls (engine.ts draws them under the play area) */
  touchKeys?(): TouchKey[];
  /** touch screen: what the fingers do, one line (default: controls()) */
  touchControls?(): string;
  /** prepare round k (0-based) of a level; r: seeded random */
  start(level: number, round: number, r: () => number): void;
  /** instruction shown above the play area (may contain the current function, ε…) */
  prompt(): string;
  /** what the keys and the mouse do, one line */
  controls(): string;
  draw(g: CanvasRenderingContext2D, box: Box, t: number, phase: 'play' | 'reveal'): void;
  pointer?(type: 'move' | 'down' | 'up' | 'wheel', x: number, y: number, e: PointerEvent | WheelEvent): void;
  /** game keys; true when handled */
  key?(e: KeyboardEvent): boolean;
  /** a key is released (null: all of them, the window lost the focus) — for held controls */
  keyUp?(e: KeyboardEvent | null): void;
  /** every frame while a round is played */
  tick?(dt: number): void;
  /** once, with the view context: games that render on the GPU (shared WebGL2 context) */
  attach?(ctx: import('../core/types').VizContext): void;
  /** the player commits (⏎ / Espace), or time is up; null: the round goes on (multi-step rounds) */
  submit(timeout: boolean): RoundResult | null;
  /** a round that ends by itself (a click found the answer) */
  poll?(): RoundResult | null;
}

export interface GameDef {
  id: string;
  title: string;
  subtitle: string;
  /** ATLAS system it orbits, and the explorer view / LEARN course it relates to */
  module: string;
  view?: string;
  course?: string;
  minutes: number;
  /** mission briefing: two or three sentences */
  brief: string;
  rules: string[];
  /** the same rules for a touch screen, in the same order: taps, drags and the touch bar's buttons instead of
   *  keys, clicks and the wheel (required as soon as `rules` names one, tests/games.test.ts) */
  touchRules?: string[];
  levels: GameLevel[];
  /** the exact statement behind the game, revealed at the debrief (rich text, $…$) */
  theorem: { kind: 'definition' | 'theorem' | 'proposition'; title: string; body: string };
  references?: string[];
  make(): GameLogic;
}

/** S ≥ 90, A ≥ 75, B ≥ 55, C ≥ 30, D below (average round score) */
export function grade(avg: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  return avg >= 90 ? 'S' : avg >= 75 ? 'A' : avg >= 55 ? 'B' : avg >= 30 ? 'C' : 'D';
}

/** deterministic random, for reproducible rounds in tests */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** French number display: 0,041 */
export const fr = (x: number, d = 3): string => {
  const s = Number.isFinite(x) ? x.toFixed(d) : '∞';
  return s.replace('.', ',').replace(/^-/, '−');
};
