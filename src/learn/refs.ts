// Cross-references between courses, written like Obsidian links in any course text (outside math):
//   [[course]]                 the course
//   [[course#anchor]]          a chapter or a statement of that course (its {#id})
//   [[course#anchor|label]]    the same, shown with another text
// Pure (no DOM): parsed by the graph and the tests, rendered as links by rich.ts.
// `[[key:…]]` inside math is something else (a morphing tag, see rich.ts expandTags).
import { tokenize } from './script';

export interface Ref {
  course: string;
  anchor?: string;
  label?: string;
}

/** one reference; ids are those of folders and of {#id} (lowercase, digits, -) */
export const REF_RE = /\[\[([a-z0-9-]+)(?:#([\w-]+))?(?:\|([^\]|]+))?\]\]/g;

/** split a plain-text run into text and references */
export function splitRefs(s: string): (string | Ref)[] {
  const out: (string | Ref)[] = [];
  let last = 0;
  for (const m of s.matchAll(REF_RE)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    out.push({ course: m[1], ...(m[2] ? { anchor: m[2] } : {}), ...(m[3] ? { label: m[3].trim() } : {}) });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

/** every reference of a rich text, math excluded */
export function parseRefs(src: string): Ref[] {
  const out: Ref[] = [];
  for (const t of tokenize(src).tokens) if (t.t === 'text') for (const p of splitRefs(t.s)) if (typeof p !== 'string') out.push(p);
  return out;
}

/** how a reference is shown when it has no label (set by the course catalog) */
let labeler: (r: Ref) => string | null = () => null;
export const setRefLabeler = (fn: (r: Ref) => string | null): void => void (labeler = fn);
export const refLabel = (r: Ref): string => r.label ?? labeler(r) ?? (r.anchor ? `${r.course}#${r.anchor}` : r.course);
export const refKey = (r: Ref): string => (r.anchor ? `${r.course}#${r.anchor}` : r.course);
