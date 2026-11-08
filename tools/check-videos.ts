// Checks the YouTube videos suggested for each explorer view (src/modules/videos.json) against
// YouTube's public oEmbed endpoint: the video must exist and keep its title and channel.
//   npm run videos:check               report only (exit code 1 if a video is missing)
//   npm run videos:check -- --write    also store the current title, channel and length
// Network only; no key needed. Not part of `npm run check` (the app itself stays offline).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface Video {
  id: string;
  lang: 'fr' | 'en';
  title?: string;
  channel?: string;
  len?: string;
}
interface VideosFile {
  _doc: string;
  checked: string;
  views: Record<string, Video[]>;
}

const FILE = fileURLToPath(new URL('../src/modules/videos.json', import.meta.url));
const write = process.argv.includes('--write');
const data = JSON.parse(readFileSync(FILE, 'utf8')) as VideosFile;

interface Found {
  ok: boolean;
  status: number;
  title?: string;
  channel?: string;
  len?: string;
}

async function oembed(id: string): Promise<Found> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      if (r.status === 404 || r.status === 401 || r.status === 403) return { ok: false, status: r.status };
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { title: string; author_name: string };
      return { ok: true, status: 200, title: j.title, channel: j.author_name };
    } catch {
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
  }
  return { ok: false, status: 0 };
}

/** video length from the watch page (best effort; oEmbed does not give it) */
async function length(id: string): Promise<string | undefined> {
  try {
    const r = await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
    const s = Number(/"lengthSeconds":"(\d+)"/.exec(await r.text())?.[1] ?? NaN);
    if (!Number.isFinite(s) || s <= 0) return undefined;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  } catch {
    return undefined;
  }
}

const ids = [...new Set(Object.values(data.views).flatMap((list) => list.map((v) => v.id)))];
const found = new Map<string, Found>();
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < ids.length) {
      const id = ids[next++];
      const f = await oembed(id);
      if (f.ok && write) f.len = await length(id);
      found.set(id, f);
    }
  }),
);

let missing = 0;
let changed = 0;
for (const [view, list] of Object.entries(data.views)) {
  for (const v of list) {
    const f = found.get(v.id)!;
    if (!f.ok) {
      missing++;
      console.log(`✕ ${view}  ${v.id}  ${f.status ? `HTTP ${f.status}` : 'réseau'} — ${v.title ?? '(sans titre)'}`);
      continue;
    }
    const diff = (v.title && v.title !== f.title) || (v.channel && v.channel !== f.channel);
    if (diff) {
      changed++;
      console.log(`△ ${view}  ${v.id}  « ${v.title} » (${v.channel}) → « ${f.title} » (${f.channel})`);
    }
    if (write) {
      v.title = f.title;
      v.channel = f.channel;
      if (f.len) v.len = f.len;
    }
  }
}

const total = Object.values(data.views).reduce((s, l) => s + l.length, 0);
console.log(`\n${total - missing}/${total} vidéos en ligne (${ids.length} distinctes), ${changed} titre(s) ou chaîne(s) modifié(s), ${missing} introuvable(s).`);
if (write) {
  data.checked = new Date().toISOString().slice(0, 10);
  // one video per line keeps the file readable and diff-friendly
  const body = Object.entries(data.views)
    .map(([view, list]) => `    ${JSON.stringify(view)}: [\n${list.map((v) => `      ${JSON.stringify(v)}`).join(',\n')}\n    ]`)
    .join(',\n');
  writeFileSync(FILE, `{\n  "_doc": ${JSON.stringify(data._doc)},\n  "checked": ${JSON.stringify(data.checked)},\n  "views": {\n${body}\n  }\n}\n`);
  console.log(`→ ${FILE} mis à jour.`);
}
process.exit(missing ? 1 : 0);
