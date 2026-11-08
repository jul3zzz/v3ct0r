// Course catalog, bundled at build time from /courses (lesson.json, script.md, formulas.json,
// exercises.json, audio/*.json). Audio files stay next to index.html (courses/<id>/audio/*.mp3):
// the browser can play them over file://, but cannot fetch JSON there, so alignments are bundled.
import type { Alignment, Clip, CourseExercise, FormulasFile, LessonMeta, ParsedScript } from './types';
import { parseScript } from './script';
import { parseWritten, type Written } from './written';
import { parseExercises } from './exmd';
import { Speaker, type SpeechDict } from './speak';
import { buildClips, buildTimeline, type Timeline } from './clips';
import dict from '../../courses/pronunciation.fr.json';
import curriculum from '../../courses/curriculum.json';

const lessons = import.meta.glob('../../courses/*/lesson.json', { eager: true, import: 'default' }) as Record<string, LessonMeta>;
const scripts = import.meta.glob('../../courses/*/script.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const formulas = import.meta.glob('../../courses/*/formulas.json', { eager: true, import: 'default' }) as Record<string, FormulasFile>;
const exercises = import.meta.glob('../../courses/*/exercises.json', { eager: true, import: 'default' }) as Record<string, CourseExercise[]>;
const aligns = import.meta.glob('../../courses/*/audio/*.json', { eager: true, import: 'default' }) as Record<string, Alignment>;
const texts = import.meta.glob('../../courses/*/text.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const exerciseMds = import.meta.glob('../../courses/*/exercises.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export interface Track {
  id: string;
  title: string;
  courses: string[];
}

export interface Course {
  meta: LessonMeta;
  formulas: FormulasFile;
  exercises: CourseExercise[];
  /** explorer views used as scenes, in order of first use */
  scenes: string[];
  hasScript: boolean;
  /** written course (text.md), read on screen instead of played */
  written: Written | null;
  /** number of clips with a generated voice */
  voiced: number;
}

/** a course that can be opened: ready, with a video script or a written text */
export const isReady = (c: Course): boolean => c.meta.status === 'ready' && (c.hasScript || !!c.written);

export interface Compiled {
  script: ParsedScript;
  clips: Clip[];
  timeline: Timeline;
  errors: string[];
}

const dirOf = (path: string): string => /courses\/([^/]+)\//.exec(path)?.[1] ?? '';
const byDir = <T>(m: Record<string, T>, file: string): Map<string, T> => {
  const out = new Map<string, T>();
  for (const [p, v] of Object.entries(m)) if (p.endsWith('/' + file)) out.set(dirOf(p), v);
  return out;
};

const L = byDir(lessons, 'lesson.json');
const S = byDir(scripts, 'script.md');
const F = byDir(formulas, 'formulas.json');
const E = byDir(exercises, 'exercises.json');
const T = byDir(texts, 'text.md');
const X = byDir(exerciseMds, 'exercises.md');
/** parse errors of exercises.md, by course (reported by validateWritten and the tests) */
export const EX_ERRORS = new Map<string, string[]>();
const A = new Map<string, Alignment>();
for (const [p, v] of Object.entries(aligns)) {
  const m = /courses\/([^/]+)\/audio\/([^/]+)\.json$/.exec(p);
  if (m) A.set(`${m[1]}/${m[2]}`, v);
}

export const speaker = new Speaker(dict as unknown as SpeechDict);
export const TRACKS: Track[] = (curriculum as { tracks: Track[] }).tracks;

const scenesOf = (md: string): string[] => {
  const out: string[] = [];
  for (const m of md.matchAll(/\{\{\s*scene:\s*([a-z0-9]+\/[a-z0-9]+)/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
};

export const COURSES = new Map<string, Course>();
for (const [id, meta] of L) {
  if (meta.id !== id) console.warn(`courses/${id}/lesson.json: id « ${meta.id} » ≠ dossier`);
  const md = S.get(id) ?? '';
  const written = meta.format === 'written' && T.get(id)?.trim() ? parseWritten(T.get(id)!) : null;
  const formulasOf = F.get(id) ?? { eq: {}, statements: {} };
  // exercises.md (Markdown, LaTeX as is) takes precedence over exercises.json
  const exMd = X.get(id);
  const exParsed = exMd ? parseExercises(exMd) : null;
  if (exParsed?.errors.length) EX_ERRORS.set(id, exParsed.errors);
  COURSES.set(id, {
    meta,
    // statements written in place in text.md join those of formulas.json
    formulas: written ? { ...formulasOf, statements: { ...formulasOf.statements, ...written.statements } } : formulasOf,
    exercises: exParsed?.exercises ?? E.get(id) ?? [],
    scenes: scenesOf(md),
    hasScript: !!md.trim(),
    written,
    voiced: [...A.keys()].filter((k) => k.startsWith(id + '/')).length,
  });
}

const cache = new Map<string, Compiled>();

/** Parse the script and time it (real voice timings when the audio matches the text). */
export function compileCourse(id: string): Compiled | null {
  const hit = cache.get(id);
  if (hit) return hit;
  const md = S.get(id);
  if (!md) return null;
  const script = parseScript(md);
  const clips = buildClips(script, speaker);
  const timeline = buildTimeline(
    script,
    clips,
    (key) => A.get(`${id}/${key}`),
    (key) => `courses/${id}/audio/${encodeURIComponent(key)}.mp3`,
  );
  const c = COURSES.get(id)!;
  const errors = [...script.errors, ...validate(c, script)];
  const out: Compiled = { script, clips, timeline, errors };
  cache.set(id, out);
  return out;
}

/** Cross-file checks: references from script markers to formulas, statements and exercises. */
export function validate(c: Course, script: ParsedScript): string[] {
  const err: string[] = [];
  const exIds = new Set(c.exercises.map((e) => e.id));
  for (const s of script.segments)
    for (const t of s.tokens) {
      if (t.t !== 'mark') continue;
      const m = t.m;
      const where = `${s.id}: ${m.raw}`;
      if (m.kind === 'box' && !c.formulas.statements[m.name]) err.push(`${where} — énoncé inconnu`);
      if (m.kind === 'exercise' && !exIds.has(m.name)) err.push(`${where} — exercice inconnu`);
      if (m.kind === 'anim' && (m.name === 'write' || m.name === 'morph')) {
        const eq = m.name === 'write' ? m.args.eq : m.args.to;
        if (!eq || c.formulas.eq[eq] === undefined) err.push(`${where} — formule inconnue`);
      }
    }
  for (const id of c.meta.chapters.map((x) => x.id)) if (!script.chapters.some((x) => x.id === id)) err.push(`chapitre « ${id} » de lesson.json absent du script`);
  return err;
}

export function trackOf(id: string): Track | undefined {
  return TRACKS.find((t) => t.courses.includes(id));
}

/** Cross-file checks of a written course: chapters of lesson.json, statements of formulas.json. */
export function validateWritten(c: Course): string[] {
  const w = c.written;
  if (!w) return c.meta.format === 'written' ? ['text.md absent ou vide'] : [];
  const err = [...w.errors, ...(EX_ERRORS.get(c.meta.id) ?? []).map((e) => `exercises.md : ${e}`)];
  const ids = w.chapters.map((x) => x.id);
  const want = c.meta.chapters.map((x) => x.id);
  if (ids.join(',') !== want.join(',')) err.push(`chapitres de text.md (${ids.join(', ')}) ≠ lesson.json (${want.join(', ')})`);
  const used = new Set<string>();
  for (const ch of w.chapters)
    for (const b of ch.blocks)
      if (b.t === 'box') {
        if (!c.formulas.statements[b.name]) err.push(`ligne ${b.line} : énoncé « ${b.name} » absent de formulas.json`);
        used.add(b.name);
      }
  for (const k of Object.keys(c.formulas.statements)) if (!used.has(k)) err.push(`énoncé « ${k} » jamais placé dans text.md`);
  return err;
}
