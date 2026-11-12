// V3CT0R for schools: the admin script (docs/ADMIN.md, docs/ECOLES.md).
//   npm run school -- create  --slug lycee-x --name "Lycée X" [--logo logo.svg] [--accent #3366ff] [--start #/learn/riemann]
//   npm run school -- trial   --school lycee-x [--days 30] [--label "proviseure, mail du 12/11"]
//   npm run school -- extend  (--key <id> | --school <slug>) --days 15
//   npm run school -- disable (--key <id> | --school <slug>) [--on]
//   npm run school -- status  --school <slug> --set trial|pilot|licensed|disabled
//   npm run school -- report  [--school <slug>]
//   npm run school -- licence --school lycee-x --seats 30 (--until 2027-08-31 | --days 365) [--label "…"] [--kit [--msi <fichier>] [--out <dossier>]]
//   npm run school -- devices --key <id> [--reset]
//   npm run school -- rotate  --key <id> [--kit [--msi <fichier>] [--out <dossier>]]
// Add --local to work on the local stack (npm run supabase -- start) instead of the project.
// The Supabase secret key comes from .env.local (SUPABASE_SECRET_KEY = sb_secret_…, or the legacy
// SUPABASE_SERVICE_ROLE_KEY) and is never printed. It calls the admin_* functions only
// (supabase/migrations/2026111*_school_*.sql), granted to service_role alone.
// A key is printed once: the server only keeps its sha256. The installation kit of a licence
// (src/school/kit.ts, docs/DEPLOIEMENT.md) goes outside the repository: ../V3CT0R-kits/<slug>/.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { CODE_LENGTH, codeHash, formatCode, newCode } from '../src/school/codes.ts';
import { logoDataUrl } from '../src/school/logo.ts';
import { MSI_NAME, MSI_URL, kitFiles } from '../src/school/kit.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = (process.env.SITE_URL ?? 'https://jul3zzz.github.io/v3ct0r/').replace(/\/?$/, '/');
/** same pinned CLI as package.json (npm run supabase) */
const CLI = '-y supabase@2.122.0';

const { positionals, values: o } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: 'string' },
    name: { type: 'string' },
    logo: { type: 'string' },
    accent: { type: 'string' },
    start: { type: 'string' },
    school: { type: 'string' },
    key: { type: 'string' },
    days: { type: 'string' },
    label: { type: 'string' },
    set: { type: 'string' },
    seats: { type: 'string' },
    until: { type: 'string' },
    kit: { type: 'boolean', default: false },
    msi: { type: 'string' },
    out: { type: 'string' },
    reset: { type: 'boolean', default: false },
    on: { type: 'boolean', default: false },
    local: { type: 'boolean', default: false },
  },
});

function fail(msg: string): never {
  console.error(`\n✕ ${msg}\n`);
  process.exit(1);
}

// ── connection ───────────────────────────────────────────────────────────

function readEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function target(): { url: string; key: string; where: string } {
  if (o.local) {
    let s: Record<string, string>;
    try {
      s = JSON.parse(execSync(`npx ${CLI} status -o json`, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })) as Record<string, string>;
    } catch {
      return fail('pile locale arrêtée : lancer « npm run supabase -- start » (Docker Desktop ouvert)');
    }
    return { url: s.API_URL, key: s.SECRET_KEY || s.SERVICE_ROLE_KEY, where: 'pile locale' };
  }
  const env = { ...readEnvLocal(), ...process.env } as Record<string, string | undefined>;
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!/^https:\/\//.test(url)) fail('VITE_SUPABASE_URL absente de .env.local');
  if (key.length < 20) fail('SUPABASE_SECRET_KEY absente de .env.local : la coller toi-même (Supabase → Project Settings → API Keys → Secret keys), jamais dans un chat');
  if (/^sb_publishable_/.test(key)) fail('SUPABASE_SECRET_KEY contient une clé publique (sb_publishable_…) : il faut la clé secrète (sb_secret_…)');
  return { url, key, where: url.replace(/^https:\/\//, '') };
}

const T = target();

async function rpc<R>(fn: string, args: Record<string, unknown> = {}): Promise<R> {
  const headers: Record<string, string> = { apikey: T.key, 'Content-Type': 'application/json' };
  // legacy service_role key (a JWT): also as the bearer; a secret key (sb_secret_…) goes in apikey only
  if (T.key.startsWith('eyJ')) headers.Authorization = `Bearer ${T.key}`;
  let r: Response;
  try {
    r = await fetch(`${T.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
  } catch {
    return fail(`serveur injoignable (${T.where})`);
  }
  const text = await r.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!r.ok) {
    const m = String((body as { message?: string } | null)?.message ?? r.status);
    const fr: Record<string, string> = {
      unknown_school: 'école inconnue (voir npm run school -- report)',
      unknown_key: 'clé inconnue (voir npm run school -- report)',
      name_required: '--name est requis pour une nouvelle école',
      bad_days: '--days doit être entre 1 et 366',
      bad_hash: 'empreinte invalide',
      bad_seats: '--seats : de 1 à 10000 postes pour une licence',
      bad_end: 'fin de licence : dans le futur, à 3 ans au plus',
      bad_kind: 'type de clé inconnu',
    };
    if (r.status === 404 || /could not find the function/i.test(m)) fail(`fonction ${fn} absente : appliquer d’abord la migration (docs/ADMIN.md)`);
    if (r.status === 401 || r.status === 403 || /permission denied/i.test(m)) fail('clé refusée : il faut la clé secrète du projet (sb_secret_…), pas la clé publique');
    fail(fr[m] ?? `erreur du serveur : ${m}`);
  }
  return body as R;
}

// ── helpers ──────────────────────────────────────────────────────────────

const when = (iso: string | null): string => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const day = (iso: string): string => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const duration = (s: number): string => (s < 60 ? `${s} s` : s < 3600 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}`);
const STATE_FR: Record<string, string> = { active: 'en cours', expired: 'terminé', disabled: 'désactivé', full: 'postes complets' };

function days(def?: number): number {
  const d = o.days === undefined ? def : Number(o.days);
  if (d === undefined || !Number.isInteger(d) || d < 1 || d > 366) return fail('--days doit être un entier entre 1 et 366');
  return d;
}

interface ReportRow {
  school_slug: string;
  school_name: string;
  school_status: string;
  key_id: string | null;
  kind: 'trial' | 'licence' | null;
  seats: number | null;
  seats_used: number | null;
  label: string | null;
  created_at: string | null;
  ends_at: string | null;
  state: string | null;
  first_opened_at: string | null;
  last_seen_at: string | null;
  visits: number | null;
  seconds: number | null;
}

/** a key from its first characters (as shown by report) */
async function keyRow(prefix: string): Promise<ReportRow & { key_id: string }> {
  const p = prefix.toLowerCase();
  const rows = (await rpc<ReportRow[]>('admin_report')).filter((r) => r.key_id?.startsWith(p));
  if (rows.length !== 1) fail(rows.length ? `plusieurs clés commencent par ${prefix} : en donner plus de caractères` : `aucune clé ne commence par ${prefix}`);
  return rows[0] as ReportRow & { key_id: string };
}
const keyId = async (prefix: string): Promise<string> => (await keyRow(prefix)).key_id;

/** the installation kit of a licence, outside the repository; the MSI from --msi or the latest release */
async function writeKit(slug: string, k: { key: string; school: string; seats: number; endsAt: number }): Promise<string> {
  const dir = resolve(o.out ?? join(ROOT, '..', 'V3CT0R-kits', slug));
  if (dir === resolve(ROOT) || dir.startsWith(resolve(ROOT) + '\\') || dir.startsWith(resolve(ROOT) + '/')) fail('--out : le kit contient la clé en clair, jamais dans le dépôt');
  mkdirSync(dir, { recursive: true });
  const env = { ...readEnvLocal(), ...process.env } as Record<string, string | undefined>;
  const files = kitFiles({ ...k, server: new URL(T.url).host, contact: (env.VITE_CONTACT_EMAIL ?? '').trim() });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text, 'utf8');
  const msi = join(dir, MSI_NAME);
  let msiNote = '';
  if (o.msi) {
    if (!existsSync(resolve(o.msi))) fail(`MSI introuvable : ${o.msi}`);
    copyFileSync(resolve(o.msi), msi);
    msiNote = `${MSI_NAME} copié depuis ${o.msi}`;
  } else {
    try {
      const r = await fetch(MSI_URL);
      if (!r.ok) throw new Error(String(r.status));
      writeFileSync(msi, new Uint8Array(await r.arrayBuffer()));
      msiNote = `${MSI_NAME} téléchargé depuis la dernière release`;
    } catch {
      msiNote = `${MSI_NAME} absent : publier une release (tag v*) puis relancer, ou --msi release/${MSI_NAME} après npm run app:win`;
    }
  }
  console.log(`\n  Kit d’installation : ${dir}\n  ${msiNote}.`);
  console.log('  À envoyer par un lien de partage (OneDrive…), pas en pièce jointe : les messageries bloquent les .cmd.');
  return dir;
}

function seats(): number {
  const n = Number(o.seats);
  if (!Number.isInteger(n) || n < 1 || n > 10_000) return fail('--seats requis : le nombre de postes de la licence (1 à 10000)');
  return n;
}

/** --until 2027-08-31 (end of that day, this computer's time) or --days N (default 365) */
function licenceEnd(): number {
  if (o.until !== undefined) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(o.until);
    const t = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59).getTime() : NaN;
    if (!Number.isFinite(t) || t <= Date.now()) return fail('--until au format AAAA-MM-JJ, dans le futur (ex. 2027-08-31)');
    return t;
  }
  const d = o.days === undefined ? 365 : Number(o.days);
  if (!Number.isInteger(d) || d < 1 || d > 1095) return fail('--days : de 1 à 1095 jours pour une licence');
  return Date.now() + d * 86_400_000;
}

function table(rows: string[][]): string {
  const w = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  return rows.map((r) => r.map((c, i) => c.padEnd(w[i])).join('  ')).join('\n');
}

// ── commands ─────────────────────────────────────────────────────────────

async function create(): Promise<void> {
  if (!o.slug || !/^[a-z0-9][a-z0-9-]{1,39}$/.test(o.slug)) fail('--slug requis : minuscules, chiffres et tirets (ex. lycee-x)');
  let logo: string | undefined;
  if (o.logo) {
    const p = resolve(o.logo);
    if (!existsSync(p)) fail(`logo introuvable : ${o.logo}`);
    const r = logoDataUrl(new Uint8Array(readFileSync(p)));
    if (!r.ok) return fail(`logo refusé : ${r.reason}`);
    logo = r.url;
  }
  const accent = o.accent?.toLowerCase();
  if (accent !== undefined && !/^#[0-9a-f]{6}$/.test(accent)) fail('--accent au format #rrggbb (ex. #3366ff)');
  if (o.start !== undefined && !/^(#\/[a-z0-9/_-]{1,80})?$/.test(o.start)) fail('--start : une route de l’app (#/learn/riemann, #/4d/polytopes, #/atlas/integrals) ou "" pour l’ATLAS');
  const id = await rpc<string>('admin_school_upsert', { p_slug: o.slug, p_name: o.name ?? null, p_logo: logo ?? null, p_accent: accent ?? null, p_start_route: o.start ?? null });
  console.log(`\n✓ École ${o.slug} enregistrée (${T.where}, id ${id.slice(0, 8)}).`);
  if (o.start) console.log('  Vue de départ : si l’app ne connaît pas cette route, elle s’ouvre sur l’ATLAS.');
  console.log('  Clé d’essai : npm run school -- trial --school ' + o.slug + '\n');
}

async function trial(): Promise<void> {
  if (!o.school) fail('--school <slug> requis');
  const key = newCode(CODE_LENGTH.trial);
  const [row] = await rpc<{ key_id: string; ends_at: string }[]>('admin_trial_create', { p_slug: o.school, p_key_hash: await codeHash(key), p_days: days(30), p_label: o.label ?? '' });
  console.log(`\n✓ Clé d’essai pour ${o.school} : fin le ${day(row.ends_at)} (id ${row.key_id.slice(0, 8)}, ${T.where}).`);
  console.log(`\n  Clé  : ${formatCode(key)}`);
  console.log(`  Lien : ${SITE}?essai=${key}`);
  console.log('\n  App de bureau : J’AI UN CODE sur l’écran d’accueil, puis la clé.');
  console.log('  Affichée une seule fois : le serveur n’en garde que l’empreinte. À copier maintenant.\n');
}

async function extend(): Promise<void> {
  const d = days();
  if (o.key) {
    const end = await rpc<string>('admin_trial_extend', { p_key_id: await keyId(o.key), p_days: d });
    console.log(`\n✓ Clé ${o.key} prolongée : fin le ${day(end)}.\n`);
  } else if (o.school) {
    const n = await rpc<number>('admin_school_extend', { p_slug: o.school, p_days: d });
    console.log(`\n✓ ${n} clé(s) de ${o.school} prolongée(s) de ${d} jours.\n`);
  } else fail('--key <id> ou --school <slug> requis');
}

async function disable(): Promise<void> {
  if (o.key) {
    await rpc('admin_trial_disable', { p_key_id: await keyId(o.key), p_disabled: !o.on });
    console.log(`\n✓ Clé ${o.key} ${o.on ? 'réactivée' : 'désactivée'} : l’app le voit à sa prochaine connexion (5 min au plus).\n`);
  } else if (o.school) {
    await rpc('admin_school_status', { p_slug: o.school, p_status: o.on ? 'trial' : 'disabled' });
    console.log(`\n✓ École ${o.school} ${o.on ? 'réactivée (essai)' : 'désactivée : toutes ses clés s’arrêtent'}.\n`);
  } else fail('--key <id> ou --school <slug> requis');
}

async function status(): Promise<void> {
  if (!o.school || !['trial', 'pilot', 'licensed', 'disabled'].includes(o.set ?? '')) fail('--school <slug> --set trial|pilot|licensed|disabled');
  await rpc('admin_school_status', { p_slug: o.school, p_status: o.set });
  console.log(`\n✓ École ${o.school} : ${o.set}.\n`);
}

async function report(): Promise<void> {
  const rows = (await rpc<ReportRow[]>('admin_report')).filter((r) => !o.school || r.school_slug === o.school);
  if (!rows.length) return void console.log(`\nAucune école${o.school ? ` « ${o.school} »` : ''} (${T.where}).\n`);
  const head = ['ÉCOLE', 'CLÉ', 'TYPE', 'NOTE', 'FIN', 'ÉTAT', 'POSTES', '1RE OUVERTURE', 'VISITES', 'TEMPS', 'DERNIÈRE VISITE'];
  const body = rows.map((r) =>
    r.key_id
      ? [r.school_slug, r.key_id.slice(0, 8), r.kind === 'licence' ? 'licence' : 'essai', r.label || '—', when(r.ends_at), STATE_FR[r.state ?? ''] ?? r.state ?? '', r.kind === 'licence' ? `${r.seats_used ?? 0}/${r.seats ?? 0}` : '—', when(r.first_opened_at), String(r.visits ?? 0), duration(r.seconds ?? 0), when(r.last_seen_at)]
      : [r.school_slug, '—', '', '(aucune clé)', '', r.school_status, '', '', '', '', ''],
  );
  console.log(`\nSuivi des essais et licences (${T.where}) :\n\n${table([head, ...body])}\n`);
  const opened = rows.filter((r) => r.first_opened_at).length;
  const keys = rows.filter((r) => r.key_id).length;
  console.log(`${opened} clé(s) ouverte(s) sur ${keys}. Prolonger : npm run school -- extend --key <CLÉ> --days 15\n`);
}

async function licence(): Promise<void> {
  if (!o.school) fail('--school <slug> requis');
  const school = (await rpc<ReportRow[]>('admin_report')).find((r) => r.school_slug === o.school);
  if (!school) fail(`école inconnue : ${o.school} (voir npm run school -- report)`);
  const n = seats();
  const end = licenceEnd();
  const key = newCode(CODE_LENGTH.trial);
  const [row] = await rpc<{ key_id: string; ends_at: string }[]>('admin_key_create', { p_slug: o.school, p_key_hash: await codeHash(key), p_kind: 'licence', p_ends_at: new Date(end).toISOString(), p_seats: n, p_label: o.label ?? '' });
  console.log(`\n✓ Licence pour ${school.school_name} : ${n} poste${n > 1 ? 's' : ''}, fin le ${day(row.ends_at)} (id ${row.key_id.slice(0, 8)}, ${T.where}).`);
  console.log(`\n  Clé : ${formatCode(key)}`);
  console.log('  À saisir dans J’AI UN CODE (site, PWA, zip), ou posée sur les PC par le kit (--kit).');
  console.log('  Affichée une seule fois : le serveur n’en garde que l’empreinte.');
  if (o.kit) await writeKit(o.school, { key, school: school.school_name, seats: n, endsAt: Date.parse(row.ends_at) });
  console.log('');
}

async function devices(): Promise<void> {
  if (!o.key) fail('--key <id> requis (voir npm run school -- report)');
  const k = await keyRow(o.key);
  if (o.reset) {
    const n = await rpc<number>('admin_devices_reset', { p_key_id: k.key_id });
    return void console.log(`\n✓ ${n} poste(s) libéré(s) sur la clé ${o.key} : chaque PC reprend une place à sa prochaine ouverture.\n`);
  }
  const rows = await rpc<{ device: string; first_seen: string; last_seen: string }[]>('admin_devices', { p_key_id: k.key_id });
  if (!rows.length) return void console.log(`\nAucun poste sur la clé ${o.key} (${k.kind === 'licence' ? `${k.seats} place(s)` : 'essai : pas de postes comptés'}).\n`);
  console.log(`\nPostes de la clé ${o.key} (${rows.length}/${k.seats ?? 0}) :\n\n${table([['POSTE', 'PREMIÈRE FOIS', 'DERNIÈRE FOIS'], ...rows.map((r) => [r.device, when(r.first_seen), when(r.last_seen)])])}\n`);
  console.log('Libérer les postes remplacés : npm run school -- devices --key <CLÉ> --reset\n');
}

async function rotate(): Promise<void> {
  if (!o.key) fail('--key <id> requis (voir npm run school -- report)');
  const k = await keyRow(o.key);
  const key = newCode(CODE_LENGTH.trial);
  const [row] = await rpc<{ key_id: string; ends_at: string }[]>('admin_key_rotate', { p_key_id: k.key_id, p_key_hash: await codeHash(key) });
  console.log(`\n✓ Nouvelle clé pour ${k.school_name} (id ${row.key_id.slice(0, 8)}) : l’ancienne (${o.key}) est désactivée, ses postes libérés.`);
  console.log(`\n  Clé : ${formatCode(key)}`);
  console.log('  Affichée une seule fois. Les PC de l’établissement s’arrêtent jusqu’à ce que le nouveau kit soit installé.');
  if (o.kit) {
    if (k.kind !== 'licence') fail('--kit : seulement pour une licence');
    await writeKit(k.school_slug, { key, school: k.school_name, seats: k.seats ?? 0, endsAt: Date.parse(row.ends_at) });
  }
  console.log('');
}

const COMMANDS: Record<string, () => Promise<void>> = { create, trial, licence, extend, disable, status, devices, rotate, report };
const cmd = COMMANDS[positionals[0] ?? ''];
if (!cmd) fail(`commande attendue : ${Object.keys(COMMANDS).join(', ')} (voir docs/ADMIN.md)`);
await cmd();
