// Parser for courses/<id>/script.md. Pure (no DOM), shared with tools/generate-voice.ts.
//
//   # Chapter title {#chapter-id}
//   ## segment-id
//   Narration with $inline math$, $$display math$$ and {{kind:name key=value flag}} markers.
//   <!-- author notes are ignored -->
//
// A blank line inside a segment is a paragraph break (transcript only).
import type { Marker, ParsedScript, ScriptSegment, Token } from './types.ts';

// quoted values may contain braces and LaTeX (e.g. text="… $\mathbb{R}$ …"); only \" is an escape
const QUOTED = String.raw`"(?:[^"\\]|\\.)*"`;
const MARKER = new RegExp(String.raw`^\{\{\s*([a-z]+)(?::\s*(${QUOTED}|[^\s}]+))?((?:${QUOTED}|[^}"])*)\}\}`);
const ARG = new RegExp(String.raw`([A-Za-z_][\w.-]*)=(${QUOTED}|[^\s"]+)|(${QUOTED}|[^\s=]+)`, 'g');

const unquote = (s: string): string => (s.startsWith('"') ? s.slice(1, -1).replace(/\\"/g, '"') : s);

export function parseMarker(raw: string): Marker | null {
  const m = MARKER.exec(raw);
  if (!m) return null;
  const args: Record<string, string> = {};
  const flags: string[] = [];
  for (const a of (m[3] ?? '').matchAll(ARG)) {
    if (a[1]) args[a[1]] = unquote(a[2]);
    else if (a[3]) flags.push(unquote(a[3]));
  }
  return { kind: m[1], name: m[2] ? unquote(m[2]) : '', args, flags, raw: m[0] };
}

/** Split one segment body into text, math, markers and paragraph breaks. */
export function tokenize(src: string): { tokens: Token[]; errors: string[] } {
  const tokens: Token[] = [];
  const errors: string[] = [];
  let text = '';
  const flush = () => {
    if (text) tokens.push({ t: 'text', s: text });
    text = '';
  };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && src[i + 1] === '$') {
      text += '$';
      i += 2;
      continue;
    }
    if (c === '$') {
      const display = src[i + 1] === '$';
      const open = display ? 2 : 1;
      const end = src.indexOf(display ? '$$' : '$', i + open);
      if (end < 0) {
        errors.push(`math non fermée : ${src.slice(i, i + 40)}`);
        text += src.slice(i);
        break;
      }
      flush();
      tokens.push({ t: 'math', tex: src.slice(i + open, end).trim(), display });
      i = end + open;
      continue;
    }
    if (c === '{' && src[i + 1] === '{') {
      const m = parseMarker(src.slice(i));
      const end = m ? i + m.raw.length - 2 : -1;
      if (!m) {
        errors.push(`marqueur illisible : ${src.slice(i, i + 40)}`);
        text += c;
        i++;
        continue;
      }
      if (m.kind === 'say') {
        // {{say:"…"}} gives the pronunciation of the math token right before it (spaces allowed)
        const prev = [...tokens].reverse().find((t) => t.t !== 'mark');
        if (!text.trim() && prev && prev.t === 'math') prev.say = m.name;
        else errors.push(`{{say}} sans formule juste avant : ${m.raw}`);
      } else {
        flush();
        tokens.push({ t: 'mark', m });
      }
      i = end + 2;
      continue;
    }
    if (c === '\n') {
      // blank line → paragraph; single newline → space
      let j = i;
      let nl = 0;
      while (j < src.length && /\s/.test(src[j])) {
        if (src[j] === '\n') nl++;
        j++;
      }
      if (nl >= 2) {
        flush();
        tokens.push({ t: 'para' });
      } else text += ' ';
      i = j;
      continue;
    }
    text += c;
    i++;
  }
  flush();
  return { tokens, errors };
}

export function parseScript(md: string): ParsedScript {
  const out: ParsedScript = { chapters: [], segments: [], errors: [] };
  const lines = md.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, (s) => s.replace(/[^\n]/g, '')).split('\n');
  let chapter = '';
  let seg: { id: string; line: number; body: string[] } | null = null;
  const ids = new Set<string>();
  const close = () => {
    if (!seg) return;
    const { tokens, errors } = tokenize(seg.body.join('\n').trim());
    errors.forEach((e) => out.errors.push(`ligne ${seg!.line} (${seg!.id}) : ${e}`));
    const s: ScriptSegment = { id: seg.id, chapter, tokens, line: seg.line };
    out.segments.push(s);
    seg = null;
  };
  lines.forEach((line, n) => {
    const h1 = /^#\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/.exec(line);
    const h2 = /^##\s+([a-z0-9][a-z0-9-]*)\s*$/.exec(line);
    if (h1) {
      close();
      chapter = h1[2];
      if (out.chapters.some((c) => c.id === chapter)) out.errors.push(`ligne ${n + 1} : chapitre en double « ${chapter} »`);
      out.chapters.push({ id: chapter, title: h1[1], line: n + 1 });
    } else if (h2) {
      close();
      if (!chapter) out.errors.push(`ligne ${n + 1} : segment « ${h2[1]} » avant tout chapitre`);
      if (ids.has(h2[1])) out.errors.push(`ligne ${n + 1} : segment en double « ${h2[1]} »`);
      ids.add(h2[1]);
      seg = { id: h2[1], line: n + 1, body: [] };
    } else if (/^#/.test(line)) {
      out.errors.push(`ligne ${n + 1} : titre mal formé « ${line.slice(0, 50)} » (attendu « # Titre {#id} » ou « ## id »)`);
    } else if (seg) seg.body.push(line);
    else if (line.trim()) out.errors.push(`ligne ${n + 1} : texte hors segment`);
  });
  close();
  return out;
}

/** cyrb53: small, fast, stable 53-bit string hash (same result in Node and in the browser). */
export function hashText(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
