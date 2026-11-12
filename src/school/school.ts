// School trial on this device (docs/ECOLES.md, phase 1): reads ?essai=<key>, asks the server
// (trial_open), keeps the answer so that the trial opens offline too, unlocks every prerequisite
// without saving it (Progress.force), applies the school's accent colour, opens on its start
// route and counts the time spent (trial_ping). Inactive when accounts are not configured in the
// build: the app is then exactly as before. Rules and checks: trial.ts (pure, tested).
import { store } from '../core/settings';
import { cloud, cloudConfigured } from '../core/cloud';
import { isCode, normCode } from './codes';
import { accentInk, advance, daysLeft, frDate, fromRow, input, keyFromSearch, newClock, parseTrial, take, trialState, validRoute, visibility, withoutKey, type ActiveClock, type TrialInfo, type TrialRow, type TrialState } from './trial';
import type { TrialStep } from '../shell/welcome-steps';

const KEY = 'school.v1';
/** seconds counted but not sent yet (offline) */
const PENDING = 'school.pending';
const PING_EVERY = 5 * 60_000;
const OFFLINE = 'Pas de connexion au serveur';

export type Redeem = { ok: true; state: TrialState } | { ok: false; message: string; offline: boolean };

export class School {
  info: TrialInfo | null;
  /** a key from the address, not checked yet */
  urlKey: string | null;
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

  /** what the way in has to show (welcome-steps.ts) */
  step(): TrialStep {
    if (!this.enabled) return 'none';
    if (this.urlKey) return 'key';
    const s = this.state();
    return s === 'active' ? 'active' : s ? 'expired' : 'none';
  }

  /** the visitor goes on without the key of the address */
  dismissKey(): void {
    this.urlKey = null;
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

  /** check a key (address, J'AI UN CODE, new key after the end) and keep it if the server knows it */
  async redeem(raw: string): Promise<Redeem> {
    const key = normCode(raw);
    if (!isCode(key) || key.length < 8) return { ok: false, message: 'Code incomplet : vérifie qu’il a été copié en entier', offline: false };
    let rows: TrialRow[];
    try {
      rows = await cloud.rpc<TrialRow[]>('trial_open', { p_key: key });
    } catch (e) {
      const m = (e as Error).message;
      return { ok: false, message: m, offline: m.startsWith(OFFLINE) };
    }
    const r = fromRow(key, rows?.[0], Date.now());
    if (!r.ok) {
      const message = r.reason === 'unknown' ? 'Code inconnu : vérifie qu’il a été copié en entier' : r.reason === 'busy' ? 'Trop d’essais : réessaie dans une minute' : 'Réponse inattendue du serveur';
      return { ok: false, message, offline: false };
    }
    this.opened = true;
    this.urlKey = null;
    this.keep(r.info);
    return { ok: true, state: trialState(r.info, Date.now()) };
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
      const rows = await cloud.rpc<TrialRow[]>('trial_open', { p_key: info.key });
      const r = fromRow(info.key, rows?.[0], Date.now());
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
      const rows = await cloud.rpc<TrialRow[]>('trial_ping', { p_key: info.key, p_seconds: seconds }, { keepalive });
      const row = rows?.[0];
      const now = Date.now();
      if (row && (row.state === 'active' || row.state === 'expired' || row.state === 'disabled')) {
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
    if (!this.info) return '';
    const d = daysLeft(this.info, now);
    return `jusqu’au ${frDate(this.info.endsAt)} (encore ${d} jour${d > 1 ? 's' : ''})`;
  }

  /** test hook (window.__vm.school) */
  debug(): unknown {
    return { enabled: this.enabled, step: this.step(), state: this.state(), school: this.info?.school ?? null, start: this.info?.start ?? null, accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), pending: this.clock.pending };
  }
}

export const school = new School();
