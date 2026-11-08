// Written courses (lesson.json "format": "written"): courses/<id>/text.md, read on screen at
// one's own pace, with exercises grouped by length (simple ≈ 10 min, moyen ≈ 30 min,
// complexe ≥ 1 h). Pure parsing, shared with the tests.
//
// text.md:
//   ## Title of the chapter {#chapter-id}     (ids and order = lesson.json chapters)
//   ### Sub-heading
//   {{box:statement-id}}                       (alone on its line: a statement of formulas.json)
//   ::: théorème Bolzano-Weierstrass {#thm-bw}  (a statement written in place, LaTeX as is;
//   body…                                        kinds: définition théorème proposition lemme
//   :::                                          corollaire preuve remarque exemple méthode)
//   paragraphs separated by blank lines: **bold**, *italic*, $inline$, $$display$$, "- " lists
import type { Statement, StatementKind } from './types';

const KINDS: Record<string, StatementKind> = {
  définition: 'definition', definition: 'definition',
  théorème: 'theorem', theoreme: 'theorem', theorem: 'theorem',
  proposition: 'proposition',
  lemme: 'lemma', lemma: 'lemma',
  corollaire: 'corollary', corollary: 'corollary',
  preuve: 'proof', démonstration: 'proof', proof: 'proof',
  remarque: 'remark', remark: 'remark',
  exemple: 'example', example: 'example',
  méthode: 'method', methode: 'method', method: 'method',
};

export type WBlock = { t: 'p'; src: string; line: number } | { t: 'h3'; text: string; line: number } | { t: 'box'; name: string; line: number };

export interface WChapter {
  id: string;
  title: string;
  line: number;
  blocks: WBlock[];
}

export interface Written {
  chapters: WChapter[];
  /** statements written in place (::: blocks), by id */
  statements: Record<string, Statement>;
  errors: string[];
  /** words of the text (statements excluded), for the reading time */
  words: number;
}

/** exercise groups of a written course, by `level` of exercises.json */
export const WRITTEN_LEVELS = [
  { level: 1, label: 'SIMPLE', time: '≈ 10 MIN', min: 5, max: 15 },
  { level: 2, label: 'MOYEN', time: '≈ 30 MIN', min: 20, max: 45 },
  { level: 3, label: 'COMPLEXE', time: '1 H ET PLUS', min: 60, max: 240 },
] as const;

export function parseWritten(md: string): Written {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const chapters: WChapter[] = [];
  const statements: Record<string, Statement> = {};
  const errors: string[] = [];
  let words = 0;
  let para: string[] = [];
  let paraLine = 0;
  let open: { kind: StatementKind; title: string; id: string; line: number; body: string[] } | null = null;
  const cur = () => chapters[chapters.length - 1];
  const flush = () => {
    if (!para.length) return;
    const src = para.join('\n');
    words += src.replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' x ').split(/\s+/).filter(Boolean).length;
    if (cur()) cur().blocks.push({ t: 'p', src, line: paraLine });
    else errors.push(`ligne ${paraLine} : texte avant le premier chapitre (## Titre {#id})`);
    para = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const n = i + 1;
    // inside a ::: statement
    if (open) {
      if (/^:::\s*$/.test(line)) {
        const st = open;
        open = null;
        if (statements[st.id]) errors.push(`ligne ${st.line} : énoncé « ${st.id} » en double`);
        statements[st.id] = { kind: st.kind, title: st.title, body: st.body.join('\n').trim() };
        if (!statements[st.id].body) errors.push(`ligne ${st.line} : énoncé vide`);
        if (cur()) cur().blocks.push({ t: 'box', name: st.id, line: st.line });
        else errors.push(`ligne ${st.line} : énoncé avant le premier chapitre`);
      } else open.body.push(raw);
      return;
    }
    const st = /^:::\s*(\S+)\s+(.+?)\s*(?:\{#([\w-]+)\})?\s*$/.exec(line);
    if (st) {
      flush();
      const kind = KINDS[st[1].toLowerCase()];
      if (!kind) errors.push(`ligne ${n} : type d’énoncé inconnu « ${st[1]} »`);
      const auto = `${cur()?.id ?? 'x'}-${kind ?? 'remark'}-${n}`;
      open = { kind: kind ?? 'remark', title: st[2], id: st[3] ?? auto, line: n, body: [] };
      return;
    }
    const ch =/^##\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/.exec(line);
    if (ch) {
      flush();
      if (chapters.some((c) => c.id === ch[2])) errors.push(`ligne ${n} : chapitre « ${ch[2]} » en double`);
      chapters.push({ id: ch[2], title: ch[1], line: n, blocks: [] });
      return;
    }
    if (/^##\s/.test(line) && !/^###/.test(line)) {
      flush();
      errors.push(`ligne ${n} : chapitre sans identifiant ({#id} attendu)`);
      return;
    }
    const h3 = /^###\s+(.+)$/.exec(line);
    if (h3) {
      flush();
      if (cur()) cur().blocks.push({ t: 'h3', text: h3[1], line: n });
      else errors.push(`ligne ${n} : sous-titre avant le premier chapitre`);
      return;
    }
    const box = /^\{\{\s*box:\s*([\w-]+)\s*\}\}$/.exec(line.trim());
    if (box) {
      flush();
      if (cur()) cur().blocks.push({ t: 'box', name: box[1], line: n });
      else errors.push(`ligne ${n} : énoncé avant le premier chapitre`);
      return;
    }
    if (/\{\{/.test(line)) errors.push(`ligne ${n} : marqueur inconnu dans un cours écrit (seul {{box:id}} seul sur sa ligne est permis)`);
    if (!line.trim()) {
      flush();
      return;
    }
    if (!para.length) paraLine = n;
    para.push(line);
  });
  flush();
  if (open) errors.push(`ligne ${(open as { line: number }).line} : énoncé non fermé (::: attendu)`);
  // unbalanced math would swallow the rest of a paragraph
  for (const c of chapters)
    for (const b of c.blocks)
      if (b.t === 'p') {
        const dd = (b.src.match(/\$\$/g) ?? []).length;
        const single = (b.src.replace(/\$\$/g, '').match(/\$/g) ?? []).length;
        if (dd % 2 || single % 2) errors.push(`ligne ${b.line} : délimiteurs $ non appariés`);
      }
  return { chapters, statements, errors, words };
}

/** reading time in minutes (technical text: about 120 words per minute, plus 1 min per statement) */
export function readingMinutes(w: Written): number {
  const boxes = w.chapters.reduce((s, c) => s + c.blocks.filter((b) => b.t === 'box').length, 0);
  return Math.max(5, Math.round(w.words / 120 + boxes));
}
