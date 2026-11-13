// School logos: an SVG or a PNG of at most 150 kB, stored as a data URL (school.schools.logo).
// Two barriers: tools/school.ts checks the file before upload, and the app checks the data URL
// again before showing it. The app only ever shows it through <img src="data:…">: an SVG loaded
// as an image runs no script and fetches no external resource. Pure, no DOM: shared with tools/.

export const LOGO_MAX = 150_000;
/** base64 of LOGO_MAX bytes, plus the data URL prefix (same bound as the SQL check) */
const DATA_URL_MAX = 210_000;
const DATA_URL = /^data:image\/(svg\+xml|png);base64,([A-Za-z0-9+/=]+)$/;

/** what an SVG must not contain: scripts, event handlers, embedded documents, external references */
const SVG_DENY: [RegExp, string][] = [
  [/<script/i, 'balise script'],
  [/<foreignobject/i, 'balise foreignObject'],
  [/<(iframe|embed|object|image|audio|video)\b/i, 'contenu embarqué'],
  [/<!(entity|doctype)/i, 'DOCTYPE ou ENTITY'],
  [/\son[a-z]+\s*=/i, 'gestionnaire d’événement (on…=)'],
  [/javascript:/i, 'lien javascript:'],
  [/@import/i, '@import'],
  [/url\(\s*(?!['"]?\s*#)/i, 'url() externe (seul url(#id) est permis)'],
  [/href\s*=\s*(?!['"]?\s*#)/i, 'lien externe (seul href="#id" est permis)'],
  [/attributename\s*=\s*['"]?\s*(xlink:)?href/i, 'animation d’un lien'],
];

/** the first reason an SVG text is refused, or null */
export function svgProblem(text: string): string | null {
  if (!/<svg[\s>]/i.test(text)) return 'pas de balise <svg>';
  for (const [re, why] of SVG_DENY) if (re.test(text)) return why;
  return null;
}

const isPng = (b: Uint8Array): boolean => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

function toBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** the file of a logo → its data URL, or why it is refused (French, for the admin) */
export function logoDataUrl(bytes: Uint8Array): { ok: true; url: string } | { ok: false; reason: string } {
  if (bytes.length > LOGO_MAX) return { ok: false, reason: `fichier trop lourd (${Math.round(bytes.length / 1000)} ko, ${LOGO_MAX / 1000} ko au plus)` };
  if (isPng(bytes)) return { ok: true, url: `data:image/png;base64,${toBase64(bytes)}` };
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const why = svgProblem(text);
  if (why) return { ok: false, reason: `SVG refusé : ${why}` };
  return { ok: true, url: `data:image/svg+xml;base64,${toBase64(bytes)}` };
}

/** a data URL that the app may show, checked again (null: refused) */
export function safeLogo(url: unknown): string | null {
  if (typeof url !== 'string' || url.length > DATA_URL_MAX) return null;
  const m = DATA_URL.exec(url);
  if (!m) return null;
  let bytes: Uint8Array;
  try {
    bytes = fromBase64(m[2]);
  } catch {
    return null;
  }
  if (m[1] === 'png') return isPng(bytes) ? url : null;
  return svgProblem(new TextDecoder().decode(bytes)) ? null : url;
}
