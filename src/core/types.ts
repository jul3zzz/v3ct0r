import type * as THREE from 'three';
import type { UI } from '../hud/ui';
import type { ViewportHud } from '../shell/viewport-hud';
import type { Study } from './study';

export type ModuleId = 'integrals' | '4d' | 'fractals' | 'constants' | 'principles' | 'probability';
export type Quality = 'low' | 'med' | 'high';
/** User setting: a fixed level, or AUTO (medium budgets + resolution adapted to the frame rate). */
export type QualitySetting = Quality | 'auto';
export type StageKind = '2d' | '3d' | 'shader';

/** Content of the Σ sheet: a KaTeX formula and a 3-4 line explanation (French). */
export interface Formula {
  tex: string;
  note: string;
}

/** Everything a visualization may use. Listeners and disposers registered here are
 *  released automatically when the user leaves the view. */
export interface VizContext {
  readonly renderer: THREE.WebGLRenderer;
  readonly glCanvas: HTMLCanvasElement;
  readonly overlay: HTMLCanvasElement;
  /** 2D context of the overlay canvas. Cleared by the app before each update; transform set to CSS pixels. */
  readonly g: CanvasRenderingContext2D;
  /** Element receiving pointer input for the viewport. */
  readonly input: HTMLElement;
  /** Viewport size in CSS pixels. */
  readonly width: number;
  readonly height: number;
  /** Device pixel ratio used by the 2D overlay. */
  readonly dpr: number;
  readonly quality: Quality;
  q<T>(low: T, med: T, high: T): T;
  readonly ui: UI;
  readonly hud: ViewportHud;
  readonly cinematic: boolean;
  /** Replace the Σ content of the current view (multi-mode views). */
  setFormula(f: Formula): void;
  onDispose(fn: () => void): void;
  listen(target: EventTarget, type: string, fn: (e: any) => void, opts?: AddEventListenerOptions | boolean): void;
}

export interface VizInstance {
  /** Called every frame. `t` is the view time in seconds (frozen while paused), `dt` the frame delta. */
  update(t: number, dt: number): void;
  resize?(w: number, h: number): void;
  dispose?(): void;
  /** Cinematic mode: drive parameters automatically. Called before update. */
  cinematic?(t: number, dt: number): void;
}

export interface VizDef {
  id: string;
  title: string;
  subtitle: string;
  stage: StageKind;
  formula: Formula;
  /** Fractal (Hausdorff) dimension shown as a viewport tag. */
  hausdorff?: string;
  keywords?: string[];
  /** Exclude from the cinematic tour (e.g. views that only make sense with input). */
  noCinematic?: boolean;
  create(ctx: VizContext): VizInstance;
}

export interface Challenge {
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}

export interface ModuleDef {
  id: ModuleId;
  code: string;
  title: string;
  kanji: string;
  tagline: string;
  vizs: VizDef[];
  challenges: Challenge[];
  /** lesson + 3 exercises per view id */
  study?: Record<string, Study>;
}
