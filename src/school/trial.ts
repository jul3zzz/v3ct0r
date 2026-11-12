// School keys (docs/ECOLES.md, phases 1 and 1b): a trial for a prospect or a licence for a school that
// bought V3CT0R. What the server says about a key, kept on this device, and the rules the app applies
// (state at a given time, labels, start route, accent colour, time spent, device id for the seats).
// Pure, no DOM: tested in tests/school.test.ts and tests/school-licence.test.ts. The runtime is school.ts.
import { isCode, normCode } from './codes.ts';
import { safeLogo } from './logo.ts';

/** full: every seat of the licence is taken by other devices */
export type TrialState = 'active' | 'expired' | 'disabled' | 'full';
export type KeyKind = 'trial' | 'licence';
/** where the key came from: the link of a mail, typed (J'AI UN CODE), or set on the PC by its installer */
export type KeySource = 'link' | 'code' | 'machine';

/** a trial as cached on this device (store 'school.v1') */
export interface TrialInfo {
  /** normalized key */
  key: string;
  school: string;
  /** data URL, already checked by safeLogo */
  logo: string | null;
  /** #rrggbb */
  accent: string;
  /** route the app opens on ('' = ATLAS) */
  start: string;
  /** end of the trial (epoch ms, server time) */
  endsAt: number;
  /** what the server said at the last contact */
  state: TrialState;
  /** server clock minus this device's clock at the last contact (ms) */
  skew: number;
  /** last contact (epoch ms, this device's clock) */
  checkedAt: number;
  kind: KeyKind;
  source: KeySource;
  /** seats of a licence (0: no limit) and how many devices hold one, at the last contact */
  seats: number;
  seatsUsed: number;
}

/** a row of key_open / key_ping (trial_open / trial_ping in phase 1) */
export interface TrialRow {
  state: string;
  kind?: string | null;
  seats?: number | null;
  seats_used?: number | null;
  school_name?: string | null;
  logo?: string | null;
  accent?: string | null;
  start_route?: string | null;
  ends_at?: string | null;
  server_now?: string | null;
}

const HEX = /^#[0-9a-f]{6}$/;
const ROUTE = /^(#\/[a-z0-9/_-]{1,80})?$/;
const STATES: readonly string[] = ['active', 'expired', 'disabled', 'full'];
const SOURCES: readonly string[] = ['link', 'code', 'machine'];
const count = (x: unknown): number => (typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 10_000 ? x : 0);

/** ?essai=<key> in a query string (normalized, null when absent or not a code) */
export function keyFromSearch(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get('essai');
  } catch {
    return null;
  }
  if (!raw || raw.length > 64) return null;
  const k = normCode(raw);
  return isCode(k) ? k : null;
}

/** the same URL without ?essai= (so the key does not stay in the address bar) */
export function withoutKey(href: string): string {
  const u = new URL(href);
  u.searchParams.delete('essai');
  return u.toString();
}

/** the answer of key_open → a key to keep, or the reason it is refused */
export function fromRow(key: string, row: TrialRow | null | undefined, localNow: number, source: KeySource = 'code'): { ok: true; info: TrialInfo } | { ok: false; reason: 'unknown' | 'busy' | 'invalid' } {
  if (!row) return { ok: false, reason: 'invalid' };
  if (row.state === 'unknown' || row.state === 'busy') return { ok: false, reason: row.state };
  if (!STATES.includes(row.state)) return { ok: false, reason: 'invalid' };
  const endsAt = Date.parse(row.ends_at ?? '');
  const server = Date.parse(row.server_now ?? '');
  if (!Number.isFinite(endsAt) || !row.school_name) return { ok: false, reason: 'invalid' };
  const accent = (row.accent ?? '').toLowerCase();
  const start = row.start_route ?? '';
  return {
    ok: true,
    info: {
      key: normCode(key),
      school: row.school_name.slice(0, 80),
      logo: safeLogo(row.logo),
      accent: HEX.test(accent) ? accent : '#ffffff',
      start: ROUTE.test(start) ? start : '',
      endsAt,
      state: row.state as TrialState,
      skew: Number.isFinite(server) ? server - localNow : 0,
      checkedAt: localNow,
      kind: row.kind === 'licence' ? 'licence' : 'trial',
      source,
      seats: count(row.seats),
      seatsUsed: count(row.seats_used),
    },
  };
}

/** a cached trial, checked field by field (a damaged value is dropped) */
export function parseTrial(raw: unknown): TrialInfo | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x);
  if (typeof r.key !== 'string' || !isCode(r.key) || typeof r.school !== 'string' || !r.school) return null;
  if (typeof r.accent !== 'string' || !HEX.test(r.accent) || typeof r.start !== 'string' || !ROUTE.test(r.start)) return null;
  if (!num(r.endsAt) || !num(r.skew) || !num(r.checkedAt) || typeof r.state !== 'string' || !STATES.includes(r.state)) return null;
  // a cache written in phase 1 has no kind nor source: a trial, typed or from a link
  return {
    key: r.key,
    school: r.school.slice(0, 80),
    logo: safeLogo(r.logo),
    accent: r.accent,
    start: r.start,
    endsAt: r.endsAt as number,
    state: r.state as TrialState,
    skew: r.skew as number,
    checkedAt: r.checkedAt as number,
    kind: r.kind === 'licence' ? 'licence' : 'trial',
    source: typeof r.source === 'string' && SOURCES.includes(r.source) ? (r.source as KeySource) : 'code',
    seats: count(r.seats),
    seatsUsed: count(r.seatsUsed),
  };
}

/** the state now: the server's last word, unless the end has passed since (server time) */
export function trialState(t: TrialInfo, now: number): TrialState {
  if (t.state !== 'active') return t.state;
  return now + t.skew >= t.endsAt ? 'expired' : 'active';
}

/** whole days left, counting today (0 once ended) */
export function daysLeft(t: TrialInfo, now: number): number {
  return Math.max(0, Math.ceil((t.endsAt - (now + t.skew)) / 86_400_000));
}

/** « 12 décembre 2026 » */
export const frDate = (ms: number): string => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** the words of a key in the app: badge, noun, the « jusqu'au … » line */
export function keyLabel(t: TrialInfo, now: number): { badge: 'ESSAI' | 'LICENCE'; noun: 'essai' | 'licence'; Noun: 'Essai' | 'Licence'; until: string; short: string } {
  const lic = t.kind === 'licence';
  const d = daysLeft(t, now);
  return {
    badge: lic ? 'LICENCE' : 'ESSAI',
    noun: lic ? 'licence' : 'essai',
    Noun: lic ? 'Licence' : 'Essai',
    until: `jusqu’au ${frDate(t.endsAt)} (encore ${d} jour${d > 1 ? 's' : ''})`,
    // the badge of a wide window: « ESSAI · J-21 »; a licence shows its days only near the end
    short: lic ? (d <= WARN_DAYS ? `LICENCE · J-${d}` : 'LICENCE') : `ESSAI · J-${d}`,
  };
}

/** a key ending within this many days: a notice once a day (not blocking) */
export const WARN_DAYS = 7;

/** « 2026-11-12 » on this device's calendar */
export const dayStamp = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** the days left to tell today (null: nothing to say, or already said today) */
export function warnToday(t: TrialInfo, now: number, lastWarned: string | null): number | null {
  if (trialState(t, now) !== 'active') return null;
  const d = daysLeft(t, now);
  if (d > WARN_DAYS) return null;
  return lastWarned === dayStamp(now) ? null : d;
}

/** the blocking card of a key that no longer opens the app: its kicker, its title, what to do */
export function endedWords(t: TrialInfo, state: TrialState): { k: string; title: string; text: string } {
  const lic = t.kind === 'licence';
  const of = lic ? `La licence de ${t.school}` : `L’essai de ${t.school}`;
  const e = lic ? 'e' : '';
  if (state === 'full')
    return {
      k: 'V3CT0R · POSTES COMPLETS',
      title: 'Toutes les places de la licence sont prises',
      text: `La licence de ${t.school} compte ${t.seats} poste${t.seats > 1 ? 's' : ''}, tous utilisés par d’autres appareils. Le référent numérique de l’établissement peut faire libérer les postes remplacés.`,
    };
  if (state === 'disabled') return { k: `V3CT0R · ${lic ? 'LICENCE ARRÊTÉE' : 'ESSAI ARRÊTÉ'}`, title: `${of} est arrêté${e}`, text: '' };
  return { k: `V3CT0R · ${lic ? 'LICENCE TERMINÉE' : 'ESSAI TERMINÉ'}`, title: `${of} est terminé${e}`, text: '' };
}

/** « 12 / 30 postes » for a licence with seats, '' otherwise */
export const seatsLine = (t: TrialInfo): string => (t.kind === 'licence' && t.seats > 0 ? `${t.seatsUsed} / ${t.seats} poste${t.seats > 1 ? 's' : ''}` : '');

// ── device (seats of a licence) ──────────────────────────────────────────

/** a device id as the server takes it: 32 bytes in lower-case hex */
export const isDevice = (x: unknown): x is string => typeof x === 'string' && /^[0-9a-f]{64}$/.test(x);

/** a new random device id (a browser: kept in its storage, never synced) */
export function newDevice(random: (n: number) => ArrayLike<number>): string {
  return Array.from(random(32), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** the start route if the app knows it, else '' (the ATLAS) */
export function validRoute(route: string, known: { views: readonly string[]; courses: readonly string[] }): string {
  const m = /^#\/([a-z0-9_-]+)(?:\/([a-z0-9_-]+))?$/.exec(route);
  if (!m) return '';
  const [, a, b] = m;
  if (a === 'atlas') return route;
  if (a === 'learn') return !b || known.courses.includes(b) ? route : '';
  return b && known.views.includes(`${a}/${b}`) ? route : '';
}

// ── accent colour ────────────────────────────────────────────────────────

const lum = (hex: string): number => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

/** WCAG contrast ratio of two #rrggbb colours (1 to 21) */
export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** the text colour that reads best on the accent: black or white */
export const accentInk = (accent: string): '#000000' | '#ffffff' => (contrast(accent, '#000000') >= contrast(accent, '#ffffff') ? '#000000' : '#ffffff');

// ── time spent ───────────────────────────────────────────────────────────

/** no input for this long: the time no longer counts */
export const IDLE_MS = 5 * 60_000;
/** a gap longer than this (sleep, frozen tab) counts this much at most */
const MAX_STEP = 60_000;
/** the server adds at most this much per ping */
export const PING_MAX = 900;

export interface ActiveClock {
  /** seconds counted, not sent yet */
  pending: number;
  lastTick: number;
  lastInput: number;
  visible: boolean;
}

export const newClock = (now: number, visible = true): ActiveClock => ({ pending: 0, lastTick: now, lastInput: now, visible });

/** count the time since the last tick if the page was visible and someone was there */
export function advance(c: ActiveClock, now: number): ActiveClock {
  const dt = Math.min(Math.max(now - c.lastTick, 0), MAX_STEP);
  const counts = c.visible && now - c.lastInput <= IDLE_MS;
  return { ...c, pending: c.pending + (counts ? dt / 1000 : 0), lastTick: now };
}

export const input = (c: ActiveClock, now: number): ActiveClock => ({ ...advance(c, now), lastInput: now });

export const visibility = (c: ActiveClock, now: number, visible: boolean): ActiveClock => ({ ...advance(c, now), visible, ...(visible ? { lastInput: now } : {}) });

/** the whole seconds to send in one ping, and the clock without them */
export function take(c: ActiveClock): { seconds: number; clock: ActiveClock } {
  const seconds = Math.min(Math.floor(c.pending), PING_MAX);
  return { seconds, clock: { ...c, pending: c.pending - seconds } };
}
