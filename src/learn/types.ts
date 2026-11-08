// Course content model for V3CT0R LEARN. Shared by the app and by tools/generate-voice.ts
// (Node strips the types): keep this file free of runtime code other than constants.

/** intro: the 30-second introduction of an explorer module (not part of the curriculum tree) */
export type Level = 'intro' | 'demo' | 'prepa' | 'master' | 'doctorat';
export type CourseStatus = 'ready' | 'construction';

/** courses/<id>/lesson.json */
export interface LessonMeta {
  id: string;
  title: string;
  subtitle?: string;
  level: Level;
  /** expected length of a session, narration + exercise time */
  minutes: number;
  prerequisites: string[];
  tags: string[];
  status: CourseStatus;
  chapters: { id: string; title: string }[];
  /** detailed plan (courses under construction, and the overview of ready ones) */
  plan?: { title: string; items: string[] }[];
  /** classic textbooks only; never invented */
  references?: string[];
  /** false: subtitles only, never sent to the voice generator (the demo) */
  voice?: boolean;
  /** level "intro": the explorer module it introduces (ModuleId) */
  module?: string;
  /** synthesized sound design under the video (src/learn/soundtrack.ts) */
  soundtrack?: boolean;
  /** voice level in the mix, 0..1 (default 1); lower it so the sound design leads */
  voiceVolume?: number;
  /** "written": a text read on screen (text.md) with exercises by length; default: a narrated video */
  format?: 'video' | 'written';
}

export type StatementKind = 'definition' | 'theorem' | 'proposition' | 'lemma' | 'corollary' | 'proof' | 'remark' | 'example' | 'method';

export interface Statement {
  kind: StatementKind;
  title: string;
  /** rich text: paragraphs, **bold**, *italic*, $inline$, $$display$$, "- " lists */
  body: string;
}

/** courses/<id>/formulas.json */
export interface FormulasFile {
  /** named LaTeX formulas; `[[key:...]]` tags a term for morphing and highlighting */
  eq: Record<string, string>;
  statements: Record<string, Statement>;
  /** formulas copied to the printable summary sheet */
  recap?: string[];
}

export type ExerciseAnswer = { kind: 'num'; value: number; tol: number } | { kind: 'qcm'; choices: string[]; answer: number };

/** courses/<id>/exercises.json (array) */
export interface CourseExercise {
  id: string;
  title: string;
  /** 1 = application directe, 2 = classique, 3 = difficile */
  level: 1 | 2 | 3;
  minutes: number;
  statement: string;
  /** progressive hints, from a nudge to almost the solution */
  hints: [string, string, string];
  /** worked solution, step by step; points build the COLLE grading */
  solution: { text: string; points: number }[];
  answer?: ExerciseAnswer;
}

// ── script.md ──────────────────────────────────────────────────────────

/** {{kind:name key=value key="quoted value" flag}} */
export interface Marker {
  kind: string;
  name: string;
  args: Record<string, string>;
  flags: string[];
  raw: string;
}

export type Token =
  | { t: 'text'; s: string }
  | { t: 'math'; tex: string; display: boolean; say?: string }
  | { t: 'mark'; m: Marker }
  | { t: 'para' };

export interface ScriptSegment {
  id: string;
  chapter: string;
  tokens: Token[];
  line: number;
}

export interface ParsedScript {
  chapters: { id: string; title: string; line: number }[];
  segments: ScriptSegment[];
  errors: string[];
}

/** One audio request: a segment, or a part of it between two {{wait}} markers. */
export interface Clip {
  key: string;
  segment: string;
  chapter: string;
  spoken: string;
  hash: string;
  /** markers with their offset in `spoken` */
  marks: { at: number; m: Marker }[];
  /** subtitle lines: display tokens + spoken range */
  cues: { from: number; to: number; tokens: Token[] }[];
  /** silence after this clip (seconds) */
  waitAfter: number;
  /** last clip of its segment */
  segEnd: boolean;
}

/** courses/<id>/audio/<clip>.json, written by tools/generate-voice.ts */
export interface Alignment {
  v: 1;
  key: string;
  /** hash of the spoken text the audio was generated from */
  hash: string;
  voice: string;
  duration: number;
  /** word starts, flattened pairs [charOffset, ms, charOffset, ms, …] */
  w: number[];
}

export const LEVEL_LABEL: Record<Level, string> = {
  intro: 'INTRO 30 S',
  demo: 'DÉMO',
  prepa: 'PRÉPA MPSI/MP',
  master: 'LICENCE / MASTER',
  doctorat: 'DOCTORAT',
};

export const STATEMENT_LABEL: Record<StatementKind, string> = {
  definition: 'DÉFINITION',
  theorem: 'THÉORÈME',
  proposition: 'PROPOSITION',
  lemma: 'LEMME',
  corollary: 'COROLLAIRE',
  proof: 'PREUVE',
  remark: 'REMARQUE',
  example: 'EXEMPLE',
  method: 'MÉTHODE',
};
