import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { COURSES, TRACKS, compileCourse, validateWritten } from '../src/learn/courses';
import { WRITTEN_LEVELS, readingMinutes } from '../src/learn/written';
import { tokenize } from '../src/learn/script';
import { compileSpecs } from '../src/learn/stage';
import { SCENE_ALIASES } from '../src/learn/scene';
import { sceneSound, soundCues } from '../src/learn/soundtrack';
import { MODULES } from '../src/modules/registry';

const LEVELS = ['intro', 'demo', 'prepa', 'master', 'doctorat'];
const views = new Set(MODULES.flatMap((m) => m.vizs.map((v) => `${m.id}/${v.id}`)));
const isIntro = (id: string) => COURSES.get(id)?.meta.level === 'intro';
const reviews = import.meta.glob('../courses/*/review.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const hasReview = (id: string) => Object.entries(reviews).some(([k, v]) => k.includes(`/${id}/`) && v.trim().length > 200);

/** every $…$ / $$…$$ of a rich text compiles with KaTeX */
function texErrors(src: string, where: string): string[] {
  const out: string[] = [];
  const { tokens, errors } = tokenize(src);
  out.push(...errors.map((e) => `${where}: ${e}`));
  for (const t of tokens)
    if (t.t === 'math')
      try {
        katex.renderToString(t.tex, { displayMode: t.display, throwOnError: true, strict: 'ignore' });
      } catch (e) {
        out.push(`${where}: ${(e as Error).message.slice(0, 160)}`);
      }
  return out;
}

describe('curriculum', () => {
  it('every listed course has a folder, and every folder (except module intros) is listed once', () => {
    const listed = TRACKS.flatMap((t) => t.courses);
    expect(new Set(listed).size).toBe(listed.length);
    for (const id of listed) expect(COURSES.has(id) && !isIntro(id), id).toBe(true);
    for (const id of COURSES.keys()) if (!isIntro(id)) expect(listed.includes(id), id).toBe(true);
  });

  it('each explorer module has exactly one 30-second intro, voiced, with no exercise', () => {
    for (const m of MODULES) {
      const intros = [...COURSES.values()].filter((c) => c.meta.level === 'intro' && c.meta.module === m.id);
      expect(intros.map((c) => c.meta.id), m.id).toEqual([`intro-${m.id}`]);
      const c = intros[0];
      expect(c.meta.status).toBe('ready');
      expect(c.meta.prerequisites).toEqual([]);
      expect(c.meta.voice).not.toBe(false);
      expect(c.exercises).toEqual([]);
      // every scene of the intro belongs to its module
      for (const s of c.scenes) expect(s.startsWith(m.id + '/'), s).toBe(true);
      const d = compileCourse(c.meta.id)!.timeline.duration;
      expect(d, `${c.meta.id}: ${d.toFixed(1)} s`).toBeGreaterThan(24);
      expect(d, `${c.meta.id}: ${d.toFixed(1)} s`).toBeLessThan(36);
    }
    for (const c of COURSES.values()) if (c.meta.level === 'intro') expect(MODULES.some((m) => m.id === c.meta.module), c.meta.id).toBe(true);
  });

  it('intros lead with sound design: a cue for the title, each wipe and scene change, a riser into the last word', () => {
    for (const c of COURSES.values()) {
      if (c.meta.level !== 'intro') continue;
      expect(c.meta.soundtrack, c.meta.id).toBe(true);
      expect(c.meta.voiceVolume ?? 1, c.meta.id).toBeLessThan(1);
      const tl = compileCourse(c.meta.id)!.timeline;
      const cues = soundCues(tl);
      const kinds = (k: string) => cues.filter((x) => x.kind === k).length;
      const wipes = tl.events.filter((e) => e.m.kind === 'anim' && e.m.name === 'wipe').length;
      expect(kinds('glitch'), c.meta.id).toBe(1);
      expect(kinds('boom'), c.meta.id).toBe(1);
      expect(kinds('whoosh'), c.meta.id).toBe(wipes);
      expect(kinds('thump'), c.meta.id).toBe(c.scenes.length);
      expect(kinds('riser'), c.meta.id).toBe(1);
      // every scene has its own texture (what the view shows, heard)
      for (const v of c.scenes) expect(sceneSound(v, 0, 6, [1, 2], 1).length, `${c.meta.id}: ${v} sans texture sonore`).toBeGreaterThan(0);
      const textures = new Set(cues.filter((x) => !['glitch', 'boom', 'hit', 'thump', 'whoosh', 'ticks', 'type', 'riser'].includes(x.kind)).map((x) => x.bed ?? x.kind));
      expect(textures.size, `${c.meta.id}: textures ${[...textures].join(', ')}`).toBeGreaterThanOrEqual(3);
      expect(cues.every((x, i) => i === 0 || x.t >= cues[i - 1].t)).toBe(true);
      for (const x of cues) expect([x.t, x.dur, x.f ?? 1, x.g ?? 1, x.pan ?? 0].every(Number.isFinite), `${c.meta.id}: ${JSON.stringify(x)}`).toBe(true);
      // the voice leaves room: at least a quarter of the video without narration
      const spoken = tl.clips.reduce((s, x) => s + (x.clip.spoken ? x.dur : 0), 0);
      expect(spoken / tl.duration, `${c.meta.id}: voix ${spoken.toFixed(1)} s sur ${tl.duration.toFixed(1)} s`).toBeLessThan(0.75);
    }
  });

  it('prerequisites exist and form no cycle', () => {
    const seen = new Map<string, number>();
    const visit = (id: string, path: string[]): void => {
      if (path.includes(id)) throw new Error(`cycle ${[...path, id].join(' → ')}`);
      if (seen.get(id) === 2) return;
      for (const p of COURSES.get(id)!.meta.prerequisites) {
        expect(COURSES.has(p), `${id} → ${p}`).toBe(true);
        visit(p, [...path, id]);
      }
      seen.set(id, 2);
    };
    for (const id of COURSES.keys()) visit(id, []);
  });
});

for (const c of COURSES.values()) {
  const m = c.meta;
  describe(`course ${m.id}`, () => {
    it('lesson.json is well formed', () => {
      expect(LEVELS).toContain(m.level);
      expect(['ready', 'construction']).toContain(m.status);
      expect(m.title.length).toBeGreaterThan(5);
      expect(m.minutes).toBeGreaterThan(0);
      if (m.status === 'construction') expect(m.plan?.length ?? 0, 'plan détaillé').toBeGreaterThanOrEqual(3);
      for (const r of m.references ?? []) expect(typeof r).toBe('string');
    });

    if (m.status !== 'ready') return;

    if (m.format === 'written') {
      it('text.md parses; chapters and statements match lesson.json and formulas.json', () => {
        expect(validateWritten(c)).toEqual([]);
        expect(c.written!.chapters.length).toBeGreaterThanOrEqual(3);
        // titles are plain text (rail, panel, Ctrl+K): Unicode symbols, no LaTeX
        for (const [k, st] of Object.entries(c.formulas.statements)) expect(st.title, k).not.toMatch(/[$\\]/);
        for (const ex of c.exercises) expect(ex.title, ex.id).not.toMatch(/[$\\]/);
      });
      it('every formula compiles with KaTeX', () => {
        const errs: string[] = [];
        for (const ch of c.written!.chapters) for (const b of ch.blocks) if (b.t === 'p') errs.push(...texErrors(b.src, `text.md:${b.line}`));
        for (const [k, st] of Object.entries(c.formulas.statements)) errs.push(...texErrors(st.body, k));
        for (const ex of c.exercises) for (const t of [ex.statement, ...ex.hints, ...ex.solution.map((x) => x.text)]) errs.push(...texErrors(t, ex.id));
        for (const sec of m.plan ?? []) for (const it of sec.items) errs.push(...texErrors(it, 'plan'));
        expect(errs).toEqual([]);
      });
      it('exercises by length: simple ≈ 10 min, moyen ≈ 30 min, complexe 1 h and more', () => {
        expect(new Set(c.exercises.map((e) => e.id)).size).toBe(c.exercises.length);
        for (const lv of WRITTEN_LEVELS) {
          const list = c.exercises.filter((e) => e.level === lv.level);
          expect(list.length, lv.label).toBeGreaterThanOrEqual(lv.level === 3 ? 1 : 2);
          for (const ex of list) {
            expect(ex.minutes, ex.id).toBeGreaterThanOrEqual(lv.min);
            expect(ex.minutes, ex.id).toBeLessThanOrEqual(lv.max);
          }
        }
        for (const ex of c.exercises) {
          expect(ex.hints).toHaveLength(3);
          expect(ex.solution.length, ex.id).toBeGreaterThanOrEqual(ex.level === 3 ? 4 : 2);
          for (const s of ex.solution) expect(s.points).toBeGreaterThan(0);
          if (ex.answer?.kind === 'qcm') expect(ex.answer.answer).toBeLessThan(ex.answer.choices.length);
          if (ex.answer?.kind === 'num') expect(Number.isFinite(ex.answer.value)).toBe(true);
        }
      });
      it('announced length is the reading time (±40 %), references and review.md present', () => {
        const r = readingMinutes(c.written!);
        expect(r / m.minutes).toBeGreaterThan(0.6);
        expect(r / m.minutes).toBeLessThan(1.4);
        expect(m.references?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(hasReview(m.id), 'review.md').toBe(true);
      });
      return;
    }

    it('script compiles with no reference error', () => {
      const comp = compileCourse(m.id)!;
      expect(comp, 'script.md').toBeTruthy();
      expect(comp.errors).toEqual([]);
      const errs: string[] = [];
      compileSpecs(comp.timeline, c, errs);
      expect(errs).toEqual([]);
    });

    it('scenes use known views and controls', () => {
      const comp = compileCourse(m.id)!;
      for (const e of comp.timeline.events) {
        if (e.m.kind !== 'scene') continue;
        const view = e.m.name === 'set' ? comp.timeline.events.filter((x) => x.m.kind === 'scene' && x.m.name !== 'set' && x.t <= e.t).pop()?.m.name : e.m.name;
        if (view === 'none' || !view) continue;
        expect(views.has(view), view).toBe(true);
        for (const k of Object.keys(e.m.args)) if (k !== 'dur' && !/[A-Z ]/.test(k)) expect(SCENE_ALIASES[view]?.[k], `${view}: ${k}`).toBeDefined();
      }
    });

    it('exercises are complete (3 hints, graded steps, valid answers) and all used', () => {
      const comp = compileCourse(m.id)!;
      const used = new Set(comp.timeline.events.filter((e) => e.m.kind === 'exercise').map((e) => e.m.name));
      if (m.level !== 'intro') expect(c.exercises.length).toBeGreaterThan(0);
      for (const ex of c.exercises) {
        expect(ex.hints).toHaveLength(3);
        expect(ex.solution.length).toBeGreaterThanOrEqual(2);
        for (const s of ex.solution) expect(s.points).toBeGreaterThan(0);
        if (ex.answer?.kind === 'qcm') expect(ex.answer.answer).toBeLessThan(ex.answer.choices.length);
        if (ex.answer?.kind === 'num') expect(Number.isFinite(ex.answer.value)).toBe(true);
        expect(used.has(ex.id), `exercice ${ex.id} jamais proposé dans le script`).toBe(true);
      }
    });

    it('announced length matches narration + exercise time (±40 %)', () => {
      const comp = compileCourse(m.id)!;
      const pauses = comp.timeline.events.filter((e) => e.m.kind === 'exercise').reduce((s, e) => s + Number(e.m.args.minutes ?? 5), 0);
      const total = comp.timeline.duration / 60 + pauses;
      expect(total / m.minutes).toBeGreaterThan(0.6);
      expect(total / m.minutes).toBeLessThan(1.4);
    });
  });
}
