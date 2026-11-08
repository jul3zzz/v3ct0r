/** Lessons and exercises attached to each view (content lives in src/modules/<module>/study.ts). */
import { compile } from '../math/parser';

export interface Lesson {
  /** what the view is about, 1–2 sentences */
  objective: string;
  /** key notions, 3–4 short bullets */
  notions: string[];
  /** what to do / look at in the view (refers to the panel controls) */
  observe: string[];
  /** KaTeX formula */
  formula: string;
  /** one historical or surprising fact */
  fact: string;
}

/** Read-only access to the current view’s panel, for live-checked manipulation exercises. */
export interface TaskApi {
  view(): string;
  /** value of a slider / toggle / formula / segmented control by label */
  get(label: string): unknown;
  /** a segmented option with this label is selected */
  pressed(optionLabel: string): boolean;
  /** numeric value shown by a readout (French formatting parsed) */
  num(readoutLabel: string): number;
  /** text shown by a readout */
  text(readoutLabel: string): string;
}

interface Base {
  q: string;
  hint: string;
  explain: string;
}

export type Exercise =
  | (Base & { kind: 'qcm'; choices: string[]; answer: number })
  | (Base & { kind: 'num'; answer: number; tol: number; unit?: string })
  | (Base & { kind: 'task'; check: (api: TaskApi) => boolean; uses: string[] });

export interface Study {
  lesson: Lesson;
  exercises: [Exercise, Exercise, Exercise];
}

/** Parse a number displayed in French HUD style: "−1,25", "3 456", "1,2e−5", "×4,09e26", "12 %". */
export function parseHudNumber(s: string): number {
  if (!s) return NaN;
  const m = s
    .replace(/[   ]/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '')
    .replace(/,/g, '.')
    .match(/-?\d+(\.\d+)?(e-?\d+)?/i);
  return m ? Number(m[0]) : NaN;
}

/** Evaluate a numeric answer typed by the user with the app’s parser: accepts 0,25 / 1/4 / pi/2 / √2 / 2^10 / e. */
export function parseAnswer(src: string): number {
  const t = src.trim().replace(/(\d),(\d)/g, '$1.$2');
  if (!t) return NaN;
  const c = compile(t, []);
  if (c.ok) {
    const v = c.fn();
    if (Number.isFinite(v)) return v;
  }
  return parseHudNumber(t);
}
