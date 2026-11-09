import { svgEl } from './dom';

/** FNV-1a 32-bit hash: stable ids for decorative hex codes and barcodes. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hexId(seed: string, digits = 4): string {
  return '0x' + hash32(seed).toString(16).toUpperCase().padStart(8, '0').slice(0, digits);
}

/** Barcode SVG generated from a string. */
export function barcode(seed: string, width = 96, height = 14): SVGSVGElement {
  let h = hash32(seed);
  let x = 0;
  let rects = '';
  while (x < width) {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
    const w = 1 + (h % 3);
    const gap = 1 + ((h >>> 8) % 3);
    if (x + w > width) break;
    rects += `<rect x="${x}" y="0" width="${w}" height="${height}"/>`;
    x += w + gap;
  }
  return svgEl(
    `<svg class="barcode" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="currentColor" aria-hidden="true">${rects}</svg>`,
  );
}

/** 1px line icons (stroke = currentColor). */
const ICONS: Record<string, string> = {
  sigma: '<path d="M9 2H2.5L6 6 2.5 10H9"/>',
  download: '<path d="M6 1.5v6.5M3 5.5l3 3 3-3M2 10.5h8"/>',
  rec: '<rect x="3" y="3" width="6" height="6"/>',
  stop: '<rect x="2.5" y="2.5" width="7" height="7"/>',
  play: '<path d="M3 2l7 4-7 4z"/>',
  pause: '<path d="M3.5 2v8M8.5 2v8"/>',
  warn: '<path d="M6 1.5l5 9H1z M6 5v2.5 M6 8.6v.4"/>',
  close: '<path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/>',
  diamond: '<path d="M6 1.5L10.5 6 6 10.5 1.5 6z"/>',
  help: '<path d="M4 4.2a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.3v.7M6 9.6v.5"/>',
  sound: '<path d="M2 4.5h2l3-2.5v8L4 7.5H2z M8.5 4.5a2 2 0 0 1 0 3 M9.6 3a4 4 0 0 1 0 6"/>',
  mute: '<path d="M2 4.5h2l3-2.5v8L4 7.5H2z M8.5 4.5l2.5 3 M11 4.5l-2.5 3"/>',
  menu: '<path d="M1.5 3h9 M1.5 6h9 M1.5 9h9"/>',
  grid: '<path d="M1.5 1.5h9v9h-9z M1.5 6h9 M6 1.5v9"/>',
  film: '<path d="M1.5 2.5h9v7h-9z M3.5 2.5v7 M8.5 2.5v7"/>',
  target: '<path d="M6 1v3 M6 8v3 M1 6h3 M8 6h3"/><rect x="4" y="4" width="4" height="4"/>',
  cmd: '<path d="M2 3.5l3 2.5-3 2.5 M6.5 9h4"/>',
  note: '<path d="M2.5 1.5h7v9h-7z M4 4h4 M4 6h4 M4 8h2.5"/>',
  user: '<path d="M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M2.5 10.5c.4-2 1.8-3.2 3.5-3.2s3.1 1.2 3.5 3.2"/>',
  calc: '<path d="M2.5 1.5h7v9h-7z M4 3.5h4 M4 6h1 M7 6h1 M4 8.5h1 M7 8.5h1"/>',
  quality: '<path d="M1.5 10.5h2v-3h-2z M5 10.5h2v-6H5z M8.5 10.5h2v-9h-2z"/>',
  expand: '<path d="M1.5 4.5v-3h3 M7.5 1.5h3v3 M10.5 7.5v3h-3 M4.5 10.5h-3v-3"/>',
  reset: '<path d="M2.5 6a3.5 3.5 0 1 0 1-2.5 M2.5 1.5v2.5H5"/>',
  quiz: '<path d="M1.5 1.5h9v7h-5l-2.5 2v-2h-1.5z M4.5 4h3 M4.5 6h2"/>',
};

export function icon(name: keyof typeof ICONS | string): SVGSVGElement {
  return svgEl(
    `<svg class="icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square" aria-hidden="true">${ICONS[name] ?? ''}</svg>`,
  );
}

export const KANJI = {
  math: '数学',
  infinity: '無限',
  dimension: '次元',
  integral: '積分',
  fractal: '分形',
  constant: '定数',
  principle: '原理',
  space: '空間',
  analysis: '解析',
} as const;

/** Random-ish hex dump lines for decoration. */
export function hexDump(seed: string, lines = 6, cols = 6): string {
  let h = hash32(seed);
  const out: string[] = [];
  for (let l = 0; l < lines; l++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
      row.push((h & 0xffff).toString(16).toUpperCase().padStart(4, '0'));
    }
    out.push(`${(l * 16).toString(16).toUpperCase().padStart(4, '0')}  ${row.join(' ')}`);
  }
  return out.join('\n');
}
