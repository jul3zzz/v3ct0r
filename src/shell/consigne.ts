// An exercise instruction cut around the exact control labels it names (« Affiche le 600-CELL en
// projection STÉRÉOGRAPHIQUE… »): each label becomes a chip that leads to the control. Pure (tested).

export interface ConsigneSegment {
  text: string;
  /** set when this segment is one of the labels */
  label?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** cuts `text` at whole-word occurrences of `labels` (longest first; case and accents kept as they are) */
export function splitLabels(text: string, labels: readonly string[]): ConsigneSegment[] {
  const list = [...new Set(labels.filter((l) => l.trim().length > 0))].sort((a, b) => b.length - a.length);
  if (!list.length) return [{ text }];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${list.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  const out: ConsigneSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i) });
    out.push({ text: m[0], label: m[0] });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
