// Reads the same French sentence with several ElevenLabs voices, to choose the voice_id of
// tools/voice.config.json by ear (same model and settings as the courses).
//   npm run voice:sample -- --voices=Matilda:XrExE9yKIg1WjnnlVkGX,George:JBFqnCBsd6RMkjVDRZzb
//        [--text="…"]   estimate only (nothing is sent)
//   … --yes             generate voice-samples/<name>.mp3 (costs 1 credit per character per voice)
// The API key comes from .env / .env.local (ELEVENLABS_API_KEY) and is never printed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'voice-samples');
const cfg = JSON.parse(readFileSync(join(ROOT, 'tools', 'voice.config.json'), 'utf8')) as {
  model_id: string;
  output_format: string;
  voice_settings: Record<string, unknown>;
  seed?: number;
  apply_text_normalization?: string;
};

const opt = (name: string): string | undefined => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const yes = process.argv.includes('--yes');
const text = opt('text') ?? "L'ensemble de Mandelbrot naît d'une seule formule, z devient z au carré plus c.";
const voices = (opt('voices') ?? '')
  .split(',')
  .filter(Boolean)
  .map((s) => {
    const [name, id] = s.includes(':') ? s.split(':') : [s, s];
    return { name: name.trim(), id: id.trim() };
  });
if (!voices.length) {
  console.error('\n✕ --voices=Nom:voice_id,… manquant (voir npm run voice:list).\n');
  process.exit(1);
}

const credits = text.length * voices.length;
console.log(`\n« ${text} »\n${text.length} caractères × ${voices.length} voix = ${credits} crédits (${cfg.model_id})`);
if (!yes) {
  console.log("\nEstimation seulement : rien n'a été envoyé. Ajoute --yes pour générer.\n");
  process.exit(0);
}

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
  console.error('\n✕ ELEVENLABS_API_KEY absente de .env.\n');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
let failed = 0;
for (const v of voices) {
  const body: Record<string, unknown> = { text, model_id: cfg.model_id, voice_settings: cfg.voice_settings, apply_text_normalization: cfg.apply_text_normalization ?? 'auto' };
  if (cfg.seed !== undefined) body.seed = cfg.seed;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(v.id)}?output_format=${cfg.output_format}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    failed++;
    console.error(`✕ ${v.name} : HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    continue;
  }
  const file = join(OUT, `${v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp3`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, buf);
  console.log(`✓ ${v.name.padEnd(10)} ${v.id}  →  ${file}  (${(buf.length / 1024).toFixed(0)} Ko)`);
}
console.log('');
process.exit(failed ? 1 : 0);
