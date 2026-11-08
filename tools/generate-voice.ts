// Voice-over generation for V3CT0R LEARN, run at build time (never in the browser).
//
//   npm run voice -- --dry-run              characters, credits, cost estimate; nothing is sent
//   npm run voice -- --yes                  generate what is missing or outdated (all ready courses)
//   npm run voice -- --yes --course=riemann one course (also: --course=a,b · --course=intro-* )
//   options: --force (regenerate everything) · --revoice (also regenerate clips made with another
//            voice or settings) · --limit=N (at most N clips, to test a voice)
//
// Reads courses/<id>/script.md, converts math to spoken French (courses/pronunciation.fr.json),
// calls ElevenLabs "text-to-speech/{voice_id}/with-timestamps" and writes, per clip,
// courses/<id>/audio/<clip>.mp3 + <clip>.json (word timings). A clip is regenerated only when its
// spoken text changed (hash), so unchanged segments cost nothing.
// The API key comes from .env / .env.local (ELEVENLABS_API_KEY) and is never printed.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashText, parseScript } from '../src/learn/script.ts';
import { Speaker, type SpeechDict } from '../src/learn/speak.ts';
import { buildClips, CPS } from '../src/learn/clips.ts';
import type { Alignment, Clip, LessonMeta } from '../src/learn/types.ts';

interface Config {
  voice_id: string;
  model_id: string;
  output_format: string;
  voice_settings: Record<string, number | boolean>;
  seed?: number;
  apply_text_normalization?: 'auto' | 'on' | 'off';
  language_code?: string;
  context_chars?: number;
  concurrency?: number;
  pricing: { credits_per_char: Record<string, number>; plans: { name: string; usd_per_month: number; credits: number }[] };
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COURSES = join(ROOT, 'courses');
const API = 'https://api.elevenlabs.io/v1/text-to-speech';

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const dry = flag('dry-run') || !flag('yes');
const force = flag('force');
const revoice = flag('revoice');
const only = opt('course');
// --course=riemann · --course=intro-fractals,intro-4d · --course=intro-* (prefix)
const wanted = (id: string): boolean => !only || only.split(',').some((p) => (p.endsWith('*') ? id.startsWith(p.slice(0, -1)) : id === p.trim()));
const limit = Number(opt('limit') ?? Infinity);

const cfg = JSON.parse(readFileSync(join(ROOT, 'tools', 'voice.config.json'), 'utf8')) as Config;
const dict = JSON.parse(readFileSync(join(COURSES, 'pronunciation.fr.json'), 'utf8')) as SpeechDict;
const speaker = new Speaker(dict);
const voiceHash = hashText(JSON.stringify([cfg.voice_id, cfg.model_id, cfg.voice_settings, cfg.output_format, cfg.seed ?? null]));

interface Job {
  course: string;
  clip: Clip;
  prev: string;
  next: string;
  reason: 'nouveau' | 'texte modifié' | 'voix différente' | 'forcé';
}

const fmtN = (n: number) => Math.round(n).toLocaleString('fr-FR');
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length));

// ── collect clips ─────────────────────────────────────────────────────
const jobs: Job[] = [];
const report: { id: string; clips: number; cached: number; todo: number; chars: number; allChars: number; stale: number; errors: string[] }[] = [];
for (const id of readdirSync(COURSES)) {
  const dir = join(COURSES, id);
  const lessonPath = join(dir, 'lesson.json');
  const scriptPath = join(dir, 'script.md');
  if (!existsSync(lessonPath) || !existsSync(scriptPath)) continue;
  if (!wanted(id)) continue;
  const meta = JSON.parse(readFileSync(lessonPath, 'utf8')) as LessonMeta;
  if (meta.status !== 'ready') continue;
  if (meta.voice === false) {
    console.log(`(${id} : cours sans voix, ignoré)`);
    continue;
  }
  const script = parseScript(readFileSync(scriptPath, 'utf8'));
  const clips = buildClips(script, speaker).filter((c) => c.spoken.trim());
  const r = { id, clips: clips.length, cached: 0, todo: 0, chars: 0, allChars: 0, stale: 0, errors: script.errors };
  const ctx = cfg.context_chars ?? 400;
  clips.forEach((clip, i) => consider(r, dir, id, clip, (clips[i - 1]?.spoken ?? '').slice(-ctx), (clips[i + 1]?.spoken ?? '').slice(0, ctx)));
  report.push(r);
}

// the briefings of the leçons-jeux (src/games/briefs.json) → courses/games/audio/<id>.mp3
const BRIEFS = join(ROOT, 'src', 'games', 'briefs.json');
if (existsSync(BRIEFS) && wanted('games')) {
  const briefs = JSON.parse(readFileSync(BRIEFS, 'utf8')) as Record<string, string>;
  const entries = Object.entries(briefs).filter(([k]) => !k.startsWith('_'));
  const r = { id: 'games (briefings)', clips: entries.length, cached: 0, todo: 0, chars: 0, allChars: 0, stale: 0, errors: [] as string[] };
  for (const [key, text] of entries) {
    const spoken = text.trim();
    consider(r, join(COURSES, 'games'), 'games', { key, segment: key, chapter: 'brief', spoken, hash: hashText(spoken), marks: [], cues: [], waitAfter: 0, segEnd: true }, '', '');
  }
  report.push(r);
}

/** queue a clip unless its audio is up to date (same spoken text, same voice) */
function consider(r: (typeof report)[number], dir: string, course: string, clip: Clip, prev: string, next: string): void {
  r.allChars += clip.spoken.length;
  const base = join(dir, 'audio', clip.key);
  let reason: Job['reason'] | null = force ? 'forcé' : null;
  if (!reason) {
    if (!existsSync(base + '.json') || !existsSync(base + '.mp3')) reason = 'nouveau';
    else {
      const al = JSON.parse(readFileSync(base + '.json', 'utf8')) as Alignment;
      if (al.hash !== clip.hash) reason = 'texte modifié';
      else if (al.voice !== voiceHash) {
        if (revoice) reason = 'voix différente';
        else r.stale++;
      }
    }
  }
  if (!reason) {
    r.cached++;
    return;
  }
  r.todo++;
  r.chars += clip.spoken.length;
  jobs.push({ course, clip, prev, next, reason });
}

// ── estimate ──────────────────────────────────────────────────────────
const selected = jobs.slice(0, Number.isFinite(limit) ? limit : jobs.length);
const chars = selected.reduce((s, j) => s + j.clip.spoken.length, 0);
const cpc = cfg.pricing.credits_per_char[cfg.model_id] ?? 1;
const credits = chars * cpc;
const kbps = Number(/mp3_\d+_(\d+)/.exec(cfg.output_format)?.[1] ?? 128);
const minutes = chars / CPS / 60;

console.log(`\nV3CT0R LEARN · VOIX OFF  —  modèle ${cfg.model_id} · ${cfg.output_format} · voix ${cfg.voice_id === 'VOTRE_VOICE_ID' ? '(à choisir)' : cfg.voice_id}`);
console.log('─'.repeat(92));
console.log(`${pad('COURS', 22)}${pad('CLIPS', 8)}${pad('EN CACHE', 10)}${pad('À GÉNÉRER', 11)}${pad('CARACTÈRES', 13)}${pad('TOTAL COURS', 13)}`);
for (const r of report) {
  console.log(`${pad(r.id, 22)}${pad(String(r.clips), 8)}${pad(String(r.cached), 10)}${pad(String(r.todo), 11)}${pad(fmtN(r.chars), 13)}${pad(fmtN(r.allChars), 13)}${r.stale ? `  (${r.stale} clip(s) d'une autre voix : --revoice)` : ''}`);
  for (const e of r.errors) console.log(`   ⚠ ${e}`);
}
console.log('─'.repeat(92));
console.log(`À générer : ${selected.length} clip(s) · ${fmtN(chars)} caractères · ${fmtN(credits)} crédits (${cpc} crédit/caractère pour ${cfg.model_id})`);
console.log(`Audio estimé : ≈ ${minutes.toFixed(1).replace('.', ',')} min · ≈ ${((minutes * 60 * kbps) / 8 / 1024).toFixed(1).replace('.', ',')} Mo en ${kbps} kbit/s`);
if (credits > 0) {
  console.log('Coût estimé selon l’abonnement (prorata des crédits mensuels ; tarifs relevés le 2026-11-07, à revérifier) :');
  for (const p of cfg.pricing.plans) {
    const share = credits / p.credits;
    const usd = p.usd_per_month ? (p.usd_per_month * credits) / p.credits : 0;
    console.log(`   ${pad(p.name, 9)} ${pad(fmtN(p.credits) + ' crédits/mois', 24)} → ${(share * 100).toFixed(0).padStart(4)} % du quota${p.usd_per_month ? ` · ≈ ${usd.toFixed(2).replace('.', ',')} $` : ''}${share > 1 ? '  ✕ quota insuffisant' : ''}`);
  }
}

if (dry) {
  console.log(`\n${flag('dry-run') ? 'Simulation (--dry-run)' : 'Aucune génération sans --yes'} : rien n'a été envoyé. Pour générer : npm run voice -- --yes${only ? ` --course=${only}` : ''}\n`);
  process.exit(0);
}

// ── generate ──────────────────────────────────────────────────────────
function readKey(): string {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  for (const f of ['.env.local', '.env']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = /^\s*ELEVENLABS_API_KEY\s*=\s*(.*)\s*$/.exec(line);
      if (m) return m[1].replace(/^["']|["']$/g, '').trim();
    }
  }
  return '';
}

const key = readKey();
if (!key) {
  console.error('\n✕ ELEVENLABS_API_KEY absente : copie .env.example en .env et colle ta clé dedans (jamais dans le code ni dans le chat).\n');
  process.exit(1);
}
if (!cfg.voice_id || cfg.voice_id === 'VOTRE_VOICE_ID') {
  console.error('\n✕ voice_id non configuré dans tools/voice.config.json.\n');
  process.exit(1);
}

interface ApiResponse {
  audio_base64: string;
  alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } | null;
  normalized_alignment?: unknown;
}

function wordTimes(spoken: string, al: NonNullable<ApiResponse['alignment']>): number[] {
  const chars = al.characters;
  const same = chars.join('') === spoken;
  if (!same) console.warn(`   ⚠ alignement non identique au texte (${chars.length} vs ${spoken.length} car.) : correspondance proportionnelle`);
  const w: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const isStart = chars[i].trim() !== '' && (i === 0 || chars[i - 1].trim() === '');
    if (!isStart) continue;
    const offset = same ? i : Math.round((i * spoken.length) / chars.length);
    w.push(offset, Math.round(al.character_start_times_seconds[i] * 1000));
  }
  return w;
}

async function call(job: Job, attempt = 1): Promise<void> {
  const body: Record<string, unknown> = {
    text: job.clip.spoken,
    model_id: cfg.model_id,
    voice_settings: cfg.voice_settings,
    apply_text_normalization: cfg.apply_text_normalization ?? 'auto',
  };
  if (cfg.seed !== undefined) body.seed = cfg.seed;
  if (job.prev) body.previous_text = job.prev;
  if (job.next) body.next_text = job.next;
  if (cfg.language_code) body.language_code = cfg.language_code;
  const res = await fetch(`${API}/${encodeURIComponent(cfg.voice_id)}/with-timestamps?output_format=${cfg.output_format}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error('clé API refusée (401) : vérifie ELEVENLABS_API_KEY dans .env');
  if ((res.status === 429 || res.status >= 500) && attempt <= 4) {
    const wait = 2000 * attempt * attempt;
    console.warn(`   … ${res.status}, nouvel essai dans ${wait / 1000} s`);
    await new Promise((r) => setTimeout(r, wait));
    return call(job, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} : ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as ApiResponse;
  if (!data.audio_base64 || !data.alignment) throw new Error('réponse sans audio ou sans alignement');
  const dir = join(COURSES, job.course, 'audio');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${job.clip.key}.mp3`), Buffer.from(data.audio_base64, 'base64'));
  const ends = data.alignment.character_end_times_seconds;
  const al: Alignment & { model: string; generatedAt: string } = {
    v: 1,
    key: job.clip.key,
    hash: job.clip.hash,
    voice: voiceHash,
    duration: Math.round((ends[ends.length - 1] ?? 0) * 1000 + 150) / 1000,
    w: wordTimes(job.clip.spoken, data.alignment),
    model: cfg.model_id,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(join(dir, `${job.clip.key}.json`), JSON.stringify(al));
}

let done = 0;
let failed = 0;
const queue = [...selected];
const worker = async () => {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    try {
      await call(job);
      done++;
      console.log(`✓ [${done + failed}/${selected.length}] ${job.course}/${job.clip.key} (${job.reason}, ${job.clip.spoken.length} car.)`);
    } catch (e) {
      failed++;
      console.error(`✕ ${job.course}/${job.clip.key} : ${e instanceof Error ? e.message : String(e)}`);
      if (e instanceof Error && e.message.includes('401')) queue.length = 0;
    }
  }
};
await Promise.all([...Array(Math.max(1, cfg.concurrency ?? 2))].map(worker));
console.log(`\n${done} clip(s) généré(s), ${failed} échec(s). Relance « npm run build » pour embarquer les nouveaux alignements.\n`);
process.exit(failed ? 1 : 0);
