// LEARN home graph: courses (big), their chapters (medium) and statements (small) as nodes;
// membership, prerequisites and [[course#anchor]] references as edges. Pure data (no DOM, no three):
// built from the catalog, laid out by layout.ts, drawn by graph-view.ts, checked by the tests.
import { COURSES, TRACKS, courseTexts, resolveRef, statementChapters, type Course } from './courses';
import { parseRefs } from './refs';
import { courseYear, type Filiere, type Level, type StatementKind } from './types';

export type GKind = 'course' | 'chapter' | 'statement';

export interface GNode {
  /** c:<course> · ch:<course>/<chapter> · st:<course>/<statement> */
  id: string;
  kind: GKind;
  course: string;
  /** chapter or statement id inside its course */
  anchor?: string;
  /** statements: their chapter */
  chapter?: string;
  title: string;
  stKind?: StatementKind;
  level: Level;
  /** prépa: 1 or 2 (first year it is met); 0 elsewhere */
  year: 0 | 1 | 2;
  filieres: Filiere[];
}

export type EdgeKind = 'member' | 'prereq' | 'ref';

export interface GEdge {
  a: number;
  b: number;
  kind: EdgeKind;
}

export interface Graph {
  nodes: GNode[];
  edges: GEdge[];
  index: Map<string, number>;
  /** neighbours of each node, by node index */
  adj: number[][];
}

export const courseNode = (id: string): string => `c:${id}`;
export const chapterNode = (course: string, ch: string): string => `ch:${course}/${ch}`;
export const statementNode = (course: string, st: string): string => `st:${course}/${st}`;

/** proofs belong to their statement: not a node of their own */
const SKIP: StatementKind[] = ['proof'];

/** chapters shown for a course: its chapters, or the sections of its plan (course under construction) */
export function graphChapters(c: Course): { id: string; title: string }[] {
  const chs = c.written?.chapters ?? c.meta.chapters;
  if (chs.length) return chs.map((x) => ({ id: x.id, title: x.title }));
  return (c.meta.plan ?? []).map((s, i) => ({ id: `plan-${i + 1}`, title: s.title.replace(/^\d+\.\s*/, '') }));
}

/** courses of the curriculum, in its order (module intros and games stay out) */
export function graphCourses(): Course[] {
  return TRACKS.flatMap((t) => t.courses.map((id) => COURSES.get(id)).filter((c): c is Course => !!c));
}

export function buildGraph(courses: Course[] = graphCourses()): Graph {
  const nodes: GNode[] = [];
  const index = new Map<string, number>();
  const edges: GEdge[] = [];
  const seen = new Set<string>();
  const add = (n: GNode): number => {
    index.set(n.id, nodes.length);
    nodes.push(n);
    return nodes.length - 1;
  };
  const link = (a: number | undefined, b: number | undefined, kind: EdgeKind) => {
    if (a === undefined || b === undefined || a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b, kind });
  };
  const ids = new Set(courses.map((c) => c.meta.id));

  for (const c of courses) {
    const m = c.meta;
    const base = { course: m.id, level: m.level, year: courseYear(m), filieres: m.filieres ?? [] };
    const ci = add({ ...base, id: courseNode(m.id), kind: 'course', title: m.title });
    for (const ch of graphChapters(c)) link(ci, add({ ...base, id: chapterNode(m.id, ch.id), kind: 'chapter', anchor: ch.id, title: ch.title }), 'member');
    const stCh = statementChapters(c);
    for (const [sid, s] of Object.entries(c.formulas.statements)) {
      if (SKIP.includes(s.kind)) continue;
      const chapter = stCh.get(sid);
      const si = add({ ...base, id: statementNode(m.id, sid), kind: 'statement', anchor: sid, chapter, title: s.title, stKind: s.kind });
      link(chapter ? (index.get(chapterNode(m.id, chapter)) ?? ci) : ci, si, 'member');
    }
  }
  // prerequisites between courses
  for (const c of courses) for (const p of c.meta.prerequisites) if (ids.has(p)) link(index.get(courseNode(p)), index.get(courseNode(c.meta.id)), 'prereq');
  // references: from the statement (or chapter, or course) holding them to what they point to
  for (const c of courses) {
    const id = c.meta.id;
    for (const t of courseTexts(c)) {
      const from = (t.statement !== undefined ? index.get(statementNode(id, t.statement)) : undefined) ?? (t.chapter ? index.get(chapterNode(id, t.chapter)) : undefined) ?? index.get(courseNode(id));
      for (const r of parseRefs(t.src)) {
        const tg = resolveRef(r);
        if (!tg || !ids.has(tg.course)) continue;
        const to = tg.kind === 'statement' ? (index.get(statementNode(tg.course, tg.anchor!)) ?? index.get(chapterNode(tg.course, statementChapters(COURSES.get(tg.course)!).get(tg.anchor!) ?? ''))) : tg.kind === 'chapter' ? index.get(chapterNode(tg.course, tg.anchor!)) : index.get(courseNode(tg.course));
        link(from, to ?? index.get(courseNode(tg.course)), 'ref');
      }
    }
  }
  const adj: number[][] = nodes.map(() => []);
  for (const e of edges) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }
  return { nodes, edges, index, adj };
}

/** what the viewer chose to see */
export interface GraphFilter {
  /** one track, or every one */
  filiere: Filiere | 'ALL';
  levels: Level[];
  chapters: boolean;
  statements: boolean;
}

export const DEFAULT_FILTER: GraphFilter = { filiere: 'ALL', levels: ['prepa', 'master', 'doctorat'], chapters: true, statements: true };

/** a course kept by the filter (a filière only narrows the prépa courses) */
export function courseVisible(n: Pick<GNode, 'level' | 'filieres'>, f: GraphFilter): boolean {
  const lv = n.level === 'demo' ? 'prepa' : n.level;
  if (!f.levels.includes(lv)) return false;
  if (f.filiere !== 'ALL' && n.level === 'prepa') return n.filieres.includes(f.filiere);
  if (f.filiere !== 'ALL' && n.level === 'demo') return false;
  return true;
}

export function nodeVisible(n: GNode, f: GraphFilter): boolean {
  if (!courseVisible(n, f)) return false;
  return n.kind === 'course' || (n.kind === 'chapter' ? f.chapters : f.statements);
}

/** accents and case out: "Théorème" matches "theoreme" */
export const fold = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** nodes whose title (or course title) holds every word of the query, best first */
export function searchGraph(g: Graph, q: string, visible: (i: number) => boolean, limit = 30): number[] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const courseTitle = new Map(g.nodes.filter((n) => n.kind === 'course').map((n) => [n.course, fold(n.title)]));
  const scored: [number, number][] = [];
  g.nodes.forEach((n, i) => {
    if (!visible(i)) return;
    const t = fold(n.title);
    const hay = `${t} ${n.kind === 'course' ? '' : courseTitle.get(n.course) ?? ''} ${n.anchor ?? ''}`;
    if (!words.every((w) => hay.includes(w))) return;
    const rank = (t.startsWith(words[0]) ? 0 : t.includes(words[0]) ? 1 : 2) * 3 + (n.kind === 'course' ? 0 : n.kind === 'chapter' ? 1 : 2);
    scored.push([rank, i]);
  });
  return scored.sort((x, y) => x[0] - y[0] || x[1] - y[1]).slice(0, limit).map((x) => x[1]);
}
