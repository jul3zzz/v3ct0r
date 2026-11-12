// School key on this device (docs/ECOLES.md, phases 1 and 1b): a trial (?essai=<key>, or typed) or a
// school licence (typed, or set on the PC by the installation kit: %ProgramData%\V3CT0R\licence.json,
// handed over by electron/preload.cjs). Asks the server (key_open, with this device's id for the seats
// of a licence), keeps the answer so that the app opens offline too, unlocks every prerequisite
// without saving it (Progress.force), applies the school's accent colour, opens on its start route and
// counts the time spent (key_ping). Inactive when accounts are not configured in the build: the app is
// then exactly as before. Rules and checks: trial.ts (pure, tested).
import { store } from '../core/settings';
import { cloud, cloudConfigured } from '../core/cloud';
import { isCode, normCode } from './codes';
import { accentInk, advance, fromRow, input, isDevice, keyFromSearch, keyLabel, newClock, newDevice, parseTrial, take, trialState, validRoute, visibility, withoutKey, type ActiveClock, type KeySource, type TrialInfo, type TrialRow, type TrialState } from './trial';
import type { TrialStep } from '../shell/welcome-steps';

declare global {
  interface Window {
    /** the desktop app (electron/preload.cjs): the licence of this PC and its device id */
    v3ct0rDesktop?: { machineKey?: string | null; device?: string | null };
  }
}

const KEY = 'school.v1';
/** seconds counted but not sent yet (offline) */
const PENDING = 'school.pending';
/** the random device id of this browser (seats of a licence), never synced */
const DEVICE = 'school.device';
const PING_EVERY = 5 * 60_000;
const OFFLINE = 'Pas de connexion au serveur';

export type Redeem = { ok: true; state: TrialState } | { ok: false; message: string; offline: boolean };

/** the licence set on this PC by its installer (desktop app), normalized */
function machineKey(): string | null {
  const raw = window.v3ct0rDesktop?.machineKey;
  if (typeof raw !== 'string' || raw.length > 64) return null;
  const k = normCode(raw);
  return isCode(k) && k.length >= 8 ? k : null;
}

export class School {
  info: TrialInfo | null;
  /** a key from the address, not checked yet */
  urlKey: string | null;
  /** the licence of this PC, not checked yet (checked before the app opens, no card) */
  machineKey: string | null;
  /** trial_open already counted this opening */
  private opened = false;
  private clock: ActiveClock = newClock(Date.now(), document.visibilityState !== 'hidden');
  private listeners = new Set<() => void>();
  private last: TrialState | null;

  constructor() {
    this.info = cloudConfigured ? parseTrial(store.get<unknown>(KEY, null)) : null;
    this.urlKey = cloudConfigured ? keyFromSearch(location.search) : null;
    if (location.search.includes('essai=')) {
      try {
        history.replaceState(null, '', withoutKey(location.href));
      } catch {
        /* file:// in some browsers */
      }
    }
    // the key of the trial already kept here: no need to check it before the app opens
    if (this.urlKey && this.urlKey === this.info?.key) this.urlKey = null;
    const mk = cloudConfigured ? machineKey() : null;
    // a licence kept from a PC that no longer has it (kit removed): dropped
    if (this.info?.source === 'machine' && mk !== this.info.key) {
      this.info = null;
      store.set(KEY, null);
    }
    // the licence of the PC wins over any other key; already kept: nothing to check first
    this.machineKey = mk && mk !== this.info?.key ? mk : null;
    if (this.machineKey) this.urlKey = null;
    this.last = this.state();
    this.apply();
  }

  get enabled(): boolean {
    return cloudConfigured;
  }

  state(now = Date.now()): TrialState | null {
    return this.info ? trialState(this.info, now) : null;
  }

  get active(): boolean {
    return this.state() === 'active';
  }

  /** this device's id for the seats of a licence: the PC's (desktop app), else one kept by this browser */
  device(): string {
    const d = window.v3ct0rDesktop?.device;
    if (isDevice(d)) return d;
    const kept = store.get<unknown>(DEVICE, null);
    if (isDevice(kept)) return kept;
    const fresh = newDevice((n) => crypto.getRandomValues(new Uint8Array(n)));
    store.set(DEVICE, fresh);
    return fresh;
  }

  /** what the way in has to show (welcome-steps.ts) */
  step(): TrialStep {
    if (!this.enabled) return 'none';
    if (this.machineKey) return 'machine';
    if (this.urlKey) return 'key';
    const s = this.state();
    return s === 'active' ? 'active' : s ? 'expired' : 'none';
  }

  /** the visitor goes on without the key of the address (or of the PC, refused) */
  dismissKey(): void {
    this.urlKey = null;
    this.machineKey = null;
  }

  onChange(fn: () => void): void {
    this.listeners.add(fn);
  }

  private emit(): void {
    this.listeners.forEach((f) => f());
  }

  private keep(info: TrialInfo): void {
    this.info = info;
    store.set(KEY, info);
    this.apply();
    const s = this.state();
    if (s !== this.last) {
      this.last = s;
      this.emit();
    }
  }

  /** check a key (address, J'AI UN CODE, the PC's licence, a new key after the end) and keep it if the server knows it */
  async redeem(raw: string, source: KeySource = 'code', o: { onlyIfActive?: boolean } = {}): Promise<Redeem> {
    const key = normCode(raw);
    if (!isCode(key) || key.length < 8) return { ok: false, message: 'Code incomplet : vérifie qu’il a été copié en entier', offline: false };
    let rows: TrialRow[];
    try {
      rows = await cloud.rpc<TrialRow[]>('key_open', { p_key: key, p_device: this.device() });
    } catch (e) {
      const m = (e as Error).message;
      return { ok: false, message: m, offline: m.startsWith(OFFLINE) };
    }
    const r = fromRow(key, rows?.[0], Date.now(), source);
    if (!r.ok) {
      const message = r.reason === 'unknown' ? 'Code inconnu : vérifie qu’il a été copié en entier' : r.reason === 'busy' ? 'Trop d’essais : réessaie dans une minute' : 'Réponse inattendue du serveur';
      return { ok: false, message, offline: false };
    }
    this.urlKey = null;
    if (key === this.machineKey) this.machineKey = null;
    const state = trialState(r.info, Date.now());
    // the PC's licence has ended while a key typed here still runs: that key stays
    if (o.onlyIfActive && state !== 'active') return { ok: true, state: this.state() ?? state };
    this.opened = true;
    this.keep(r.info);
    return { ok: true, state };
  }

  /** the licence of this PC, checked before the app opens (welcome.ts, step « machine »); it takes the
   *  place of any other key, except a running one typed here when the PC's licence is not active */
  checkMachine(): Promise<Redeem> {
    if (!this.machineKey) return Promise.resolve({ ok: false, message: 'Pas de licence sur ce poste', offline: false });
    return this.redeem(this.machineKey, 'machine', { onlyIfActive: this.active });
  }

  /** once the app runs: ask the server again (visit, new end, stopped), then count the time */
  start(): void {
    if (!this.info) return;
    if (!this.opened) void this.reopen();
    const on = () => (this.clock = input(this.clock, Date.now()));
    for (const ev of ['pointerdown', 'keydown', 'wheel'] as const) window.addEventListener(ev, on, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => {
      const shown = document.visibilityState !== 'hidden';
      this.clock = visibility(this.clock, Date.now(), shown);
      if (!shown) void this.ping(true);
    });
    setInterval(() => (this.clock = advance(this.clock, Date.now())), 15_000);
    setInterval(() => void this.ping(), PING_EVERY);
    // the end may come while the app is open
    setInterval(() => {
      const s = this.state();
      if (s !== this.last) {
        this.last = s;
        this.emit();
      }
    }, 60_000);
  }

  private async reopen(): Promise<void> {
    const info = this.info;
    if (!info) return;
    try {
      const rows = await cloud.rpc<TrialRow[]>('key_open', { p_key: info.key, p_device: this.device() });
      const r = fromRow(info.key, rows?.[0], Date.now(), info.source);
      this.opened = true;
      if (r.ok) this.keep(r.info);
      else if (r.reason === 'unknown') this.keep({ ...info, state: 'disabled' });
    } catch {
      /* offline: the trial kept here holds */
    }
  }

  /** send the time spent (and learn whether the trial was stopped) */
  private async ping(keepalive = false): Promise<void> {
    const info = this.info;
    if (!info || trialState(info, Date.now()) !== 'active') return;
    this.clock = advance(this.clock, Date.now());
    const pending = store.get<number>(PENDING, 0);
    const { seconds, clock } = take({ ...this.clock, pending: this.clock.pending + (Number.isFinite(pending) ? pending : 0) });
    this.clock = { ...clock, pending: 0 };
    store.set(PENDING, clock.pending);
    try {
      const rows = await cloud.rpc<TrialRow[]>('key_ping', { p_key: info.key, p_seconds: seconds, p_device: this.device() }, { keepalive });
      const row = rows?.[0];
      const now = Date.now();
      if (row && (row.state === 'active' || row.state === 'expired' || row.state === 'disabled' || row.state === 'full')) {
        const endsAt = Date.parse(row.ends_at ?? '');
        const server = Date.parse(row.server_now ?? '');
        this.keep({ ...info, state: row.state, endsAt: Number.isFinite(endsAt) ? endsAt : info.endsAt, skew: Number.isFinite(server) ? server - now : info.skew, checkedAt: now });
      }
    } catch {
      // offline: keep the seconds for later
      store.set(PENDING, store.get<number>(PENDING, 0) + seconds);
    }
  }

  /** the school's accent on the app (CSS variables); the default theme when no trial runs */
  apply(): void {
    const root = document.documentElement.style;
    const s = this.state();
    if (this.info && s) {
      root.setProperty('--accent', this.info.accent);
      root.setProperty('--accent-ink', accentInk(this.info.accent));
    } else {
      root.removeProperty('--accent');
      root.removeProperty('--accent-ink');
    }
  }

  /** the route to open on when the address has none (null: the usual home) */
  startRoute(known: { views: readonly string[]; courses: readonly string[] }): string | null {
    if (!this.active || !this.info) return null;
    return validRoute(this.info.start, known) || null;
  }

  /** « jusqu’au 12 décembre 2026 (encore 21 jours) » */
  until(now = Date.now()): string {
    return this.info ? keyLabel(this.info, now).until : '';
  }

  /** a licence (not a trial) */
  get licence(): boolean {
    return this.info?.kind === 'licence';
  }

  /** test hook (window.__vm.school) */
  debug(): unknown {
    const i = this.info;
    return { enabled: this.enabled, step: this.step(), state: this.state(), kind: i?.kind ?? null, source: i?.source ?? null, seats: i ? `${i.seatsUsed}/${i.seats}` : null, school: i?.school ?? null, start: i?.start ?? null, accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), pending: this.clock.pending };
  }
}

export const school = new School();
