import { describe, expect, it } from 'vitest';
import { COURSES, courseTexts, refErrors, resolveRef } from '../src/learn/courses';
import { REF_RE, parseRefs, refLabel, splitRefs } from '../src/learn/refs';
import { tokenize } from '../src/learn/script';
import { DEFAULT_FILTER, buildGraph, courseVisible, nodeVisible, searchGraph } from '../src/learn/graph';
import { layoutGraph } from '../src/learn/layout';
import { FILIERES, FILIERES_1, FILIERES_2, courseYear } from '../src/learn/types';

describe('references [[course#anchor|label]]', () => {
  it('are parsed outside math only, with anchor and label', () => {
    expect(parseRefs('Voir [[suites-series#thm-bw]] et [[riemann|l’intégrale]].')).toEqual([{ course: 'suites-series', anchor: 'thm-bw' }, { course: 'riemann', label: 'l’intégrale' }]);
    // a morphing tag inside math is not a reference
    expect(parseRefs('$[[a:x]] + [[b:y]]$ puis [[algebre-lineaire]]')).toEqual([{ course: 'algebre-lineaire' }]);
    expect(splitRefs('a [[x#y]] b')).toEqual(['a ', { course: 'x', anchor: 'y' }, ' b']);
  });

  it('resolve to a course, a chapter or a statement, and read as their title', () => {
    const c = COURSES.get('suites-series')!;
    const st = Object.keys(c.formulas.statements)[0];
    expect(resolveRef({ course: 'suites-series' })?.kind).toBe('course');
    expect(resolveRef({ course: 'suites-series', anchor: c.written!.chapters[0].id })?.kind).toBe('chapter');
    expect(resolveRef({ course: 'suites-series', anchor: st })?.kind).toBe('statement');
    expect(resolveRef({ course: 'suites-series', anchor: 'nope' })).toBeNull();
    expect(resolveRef({ course: 'nope' })).toBeNull();
    expect(refLabel({ course: 'suites-series', anchor: st })).toBe(c.formulas.statements[st].title);
    expect(refLabel({ course: 'riemann', label: 'ici' })).toBe('ici');
  });

  it('every reference written in a course points somewhere', () => {
    for (const c of COURSES.values()) expect(refErrors(c), c.meta.id).toEqual([]);
  });

  it('no broken [[ outside math (a label holding $…$ would be split and shown raw)', () => {
    const bad: string[] = [];
    for (const c of COURSES.values())
      for (const t of courseTexts(c))
        for (const tok of tokenize(t.src).tokens)
          if (tok.t === 'text' && tok.s.replace(REF_RE, '').includes('[[')) bad.push(`${c.meta.id} ${t.where}: ${tok.s.slice(0, 60)}`);
    expect(bad).toEqual([]);
  });
});

describe('filières', () => {
  it('every prépa course names the tracks whose official programme covers it', () => {
    for (const c of COURSES.values()) {
      const m = c.meta;
      if (m.level !== 'prepa') {
        expect(m.filieres, m.id).toBeUndefined();
        continue;
      }
      expect(m.filieres?.length ?? 0, m.id).toBeGreaterThan(0);
      expect(new Set(m.filieres).size, m.id).toBe(m.filieres!.length);
      for (const f of m.filieres!) expect(FILIERES, `${m.id}: ${f}`).toContain(f);
      // listed in programme order: first year, then second year
      const order = m.filieres!.map((f) => FILIERES.indexOf(f));
      expect(order, m.id).toEqual([...order].sort((a, b) => a - b));
      expect(['complete', 'fiche', undefined]).toContain(m.depth);
    }
    expect(courseYear({ level: 'prepa', filieres: ['MP', 'PCSI'] })).toBe(1);
    expect(courseYear({ level: 'prepa', filieres: ['PT'] })).toBe(2);
    expect(courseYear({ level: 'master' })).toBe(0);
    expect(FILIERES_1.length + FILIERES_2.length).toBe(9);
  });
});

describe('LEARN graph', () => {
  const g = buildGraph();

  it('has a node per course, chapter and statement, each with a parent', () => {
    expect(new Set(g.nodes.map((n) => n.id)).size).toBe(g.nodes.length);
    const courses = g.nodes.filter((n) => n.kind === 'course');
    expect(courses.length).toBeGreaterThanOrEqual(20);
    expect(g.nodes.filter((n) => n.kind === 'statement').length).toBeGreaterThan(100);
    for (const n of g.nodes) {
      if (n.kind === 'course') continue;
      const i = g.index.get(n.id)!;
      const up = g.edges.filter((e) => e.kind === 'member' && e.b === i);
      expect(up.length, n.id).toBe(1);
      const p = g.nodes[up[0].a];
      expect(p.course).toBe(n.course);
      expect(p.kind).toBe(n.kind === 'chapter' ? 'course' : n.chapter ? 'chapter' : 'course');
    }
    // statements of written courses all sit in a chapter
    for (const n of g.nodes) if (n.kind === 'statement' && COURSES.get(n.course)?.written) expect(n.chapter, n.id).toBeTruthy();
  });

  it('links prerequisites, and every edge joins two distinct nodes once', () => {
    const keys = new Set<string>();
    for (const e of g.edges) {
      expect(e.a).not.toBe(e.b);
      const k = e.a < e.b ? `${e.a}-${e.b}` : `${e.b}-${e.a}`;
      expect(keys.has(k)).toBe(false);
      keys.add(k);
    }
    const pre = g.edges.filter((e) => e.kind === 'prereq').map((e) => `${g.nodes[e.a].course}>${g.nodes[e.b].course}`);
    expect(pre).toContain('algebre-lineaire>reduction');
    for (const e of g.edges) expect(g.adj[e.a]).toContain(e.b);
  });

  it('filters by filière (prépa only), level and kind', () => {
    const mp = { ...DEFAULT_FILTER, filiere: 'MP' as const };
    expect(courseVisible({ level: 'prepa', filieres: ['MP', 'PC'] }, mp)).toBe(true);
    expect(courseVisible({ level: 'prepa', filieres: ['MPSI'] }, mp)).toBe(false);
    expect(courseVisible({ level: 'master', filieres: [] }, mp)).toBe(true);
    expect(courseVisible({ level: 'master', filieres: [] }, { ...DEFAULT_FILTER, levels: ['prepa'] })).toBe(false);
    const st = g.nodes.find((n) => n.kind === 'statement')!;
    expect(nodeVisible(st, { ...DEFAULT_FILTER, statements: false })).toBe(false);
    expect(nodeVisible(st, DEFAULT_FILTER)).toBe(true);
  });

  it('search finds courses and statements, accents ignored, courses first', () => {
    const all = () => true;
    const hits = searchGraph(g, 'reduction', all).map((i) => g.nodes[i]);
    expect(hits[0].id).toBe('c:reduction');
    const bw = searchGraph(g, 'bolzano', all).map((i) => g.nodes[i]);
    expect(bw.some((n) => n.kind === 'statement' && n.course === 'suites-series')).toBe(true);
    expect(searchGraph(g, '   ', all)).toEqual([]);
  });

  it('layout is deterministic, finite, clustered, with no overlapping course', () => {
    const t0 = performance.now();
    const a = layoutGraph(g);
    const ms = performance.now() - t0;
    const b = layoutGraph(buildGraph());
    expect([...a.pos]).toEqual([...b.pos]);
    expect([...a.pos].every(Number.isFinite)).toBe(true);
    for (const [i, n] of g.nodes.entries()) {
      const c = a.clusters.get(n.course)!;
      const d = Math.hypot(a.pos[i * 3] - c.x, a.pos[i * 3 + 1] - c.y, a.pos[i * 3 + 2] - c.z);
      expect(d, n.id).toBeLessThanOrEqual(c.r + 1e-4);
    }
    const cl = [...a.clusters.entries()];
    for (let x = 0; x < cl.length; x++)
      for (let y = x + 1; y < cl.length; y++) {
        const [ia, A] = cl[x];
        const [ib, B] = cl[y];
        expect(Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z), `${ia} / ${ib}`).toBeGreaterThanOrEqual(A.r + B.r);
      }
    // prépa below master below doctorat, on average
    const meanY = (lv: string) => {
      const ys = cl.filter(([id]) => COURSES.get(id)!.meta.level === lv).map(([, c]) => c.y);
      return ys.reduce((s, y) => s + y, 0) / ys.length;
    };
    expect(meanY('prepa')).toBeLessThan(meanY('master'));
    expect(meanY('master')).toBeLessThan(meanY('doctorat'));
    expect(ms, `layout ${ms.toFixed(0)} ms`).toBeLessThan(1500);
  });
});
