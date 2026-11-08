// Lists the ElevenLabs voices available to the account and the remaining credits, to pick the
// voice_id of tools/voice.config.json. Read-only calls: no credit is spent, nothing is generated.
//   npm run voice:list            all voices (French-capable ones first)
// The API key comes from .env / .env.local (ELEVENLABS_API_KEY) and is never printed.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const API = 'https://api.elevenlabs.io/v1';

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
  console.error('\n✕ ELEVENLABS_API_KEY absente ou vide dans .env (colle-la toi-même après le signe =, puis enregistre le fichier).\n');
  process.exit(1);
}

async function get<T>(path: string): Promise<{ status: number; body: T | null }> {
  const r = await fetch(API + path, { headers: { 'xi-api-key': key } });
  return { status: r.status, body: r.ok ? ((await r.json()) as T) : null };
}

interface Sub {
  tier?: string;
  character_count?: number;
  character_limit?: number;
  next_character_count_reset_unix?: number;
}
interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  verified_languages?: { language?: string; accent?: string; locale?: string }[];
}

const fmt = (n: number) => n.toLocaleString('fr-FR');

const sub = await get<Sub>('/user/subscription');
if (sub.status === 401) {
  console.error('\n✕ Clé refusée (401) : vérifie qu’elle est complète dans .env, ou qu’elle a les droits « User » et « Voices » en lecture.\n');
  process.exit(1);
}
if (sub.body) {
  const s = sub.body;
  const left = (s.character_limit ?? 0) - (s.character_count ?? 0);
  const reset = s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toLocaleDateString('fr-FR') : '?';
  console.log(`\n✓ Clé acceptée · abonnement ${s.tier ?? '?'} · ${fmt(s.character_count ?? 0)} / ${fmt(s.character_limit ?? 0)} crédits utilisés · ${fmt(left)} restants (renouvellement le ${reset})`);
} else console.log(`\n(abonnement non lisible : HTTP ${sub.status} — droit « User » absent de la clé ?)`);

const res = await get<{ voices: Voice[] }>('/voices');
if (!res.body) {
  console.error(`\n✕ Liste des voix illisible : HTTP ${res.status} (droit « Voices » en lecture absent de la clé ?)\n`);
  process.exit(1);
}
const french = (v: Voice) => (v.verified_languages ?? []).some((l) => l.language === 'fr') || /fr/i.test(v.labels?.language ?? '') || /french|fran/i.test(`${v.labels?.accent ?? ''} ${v.labels?.description ?? ''}`);
const voices = [...res.body.voices].sort((a, b) => Number(french(b)) - Number(french(a)) || a.name.localeCompare(b.name));
console.log(`\n${voices.length} voix disponibles (★ = français vérifié ou indiqué). Toutes parlent français avec eleven_multilingual_v2 ; les ★ ont l'accent natif.\n`);
console.log('   VOICE_ID               NOM                       TYPE        GENRE    ÂGE           ACCENT / DESCRIPTION');
for (const v of voices) {
  const l = v.labels ?? {};
  const fr = (v.verified_languages ?? []).filter((x) => x.language === 'fr').map((x) => x.accent ?? x.locale).filter(Boolean).join(', ');
  console.log(
    `${french(v) ? ' ★' : '  '} ${v.voice_id.padEnd(22)} ${v.name.slice(0, 25).padEnd(25)} ${(v.category ?? '').padEnd(11)} ${(l.gender ?? '').padEnd(8)} ${(l.age ?? '').padEnd(13)} ${[fr ? `fr : ${fr}` : '', l.accent, l.description, l.use_case].filter(Boolean).join(' · ')}`,
  );
}
console.log('\nPour choisir : écoute les aperçus dans ElevenLabs, puis mets le voice_id dans tools/voice.config.json.\n');
