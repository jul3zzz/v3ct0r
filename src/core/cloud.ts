// Optional account (Supabase): email + password, and the progress synced across devices.
// Configured at build time by VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (.env.local; the anon key
// is public by design, the table is protected by row-level security, supabase/schema.sql). Without
// them, or offline, nothing changes: the progress stays in this browser. No SDK: a few fetch calls
// to the auth (GoTrue) and REST (PostgREST) endpoints.
import { store, onStoreSet } from './settings';
import { SYNCED, mergeSnapshots, sameSnapshot } from './sync';

const URL_ = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim().replace(/\/+$/, '');
const ANON = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim();

export const cloudConfigured = /^https:\/\//.test(URL_) && ANON.length > 20;

interface Session {
  access_token: string;
  refresh_token: string;
  /** epoch seconds */
  expires_at: number;
  user: { id: string; email: string };
}

const SESSION = 'cloud.session';
const LAST = 'cloud.last';

export class CloudError extends Error {}

/** French message for the usual auth and network errors */
function explain(status: number, body: Record<string, unknown> | null): string {
  const raw = String(body?.error_description ?? body?.msg ?? body?.message ?? body?.error ?? '').toLowerCase();
  if (status === 0) return 'Pas de connexion au serveur (hors ligne ?)';
  if (raw.includes('invalid login credentials') || raw.includes('invalid_grant')) return 'Adresse e-mail ou mot de passe incorrect';
  if (raw.includes('email not confirmed')) return 'Adresse e-mail pas encore confirmée : ouvre le lien reçu par e-mail';
  if (raw.includes('already registered') || raw.includes('already exists')) return 'Un compte existe déjà avec cette adresse : connecte-toi';
  if (raw.includes('password') && raw.includes('at least')) return 'Mot de passe trop court (6 caractères au moins)';
  if (raw.includes('invalid') && raw.includes('email')) return 'Adresse e-mail invalide';
  if (raw.includes('rate limit') || status === 429) return 'Trop d’essais : réessaie dans une minute';
  if (status === 401 || raw.includes('jwt')) return 'Session expirée : reconnecte-toi';
  if (status === 404 || raw.includes('relation') || raw.includes('does not exist')) return 'Table « progress » absente : exécuter supabase/schema.sql dans le projet Supabase';
  return `Erreur du serveur (${status || 'réseau'})`;
}

export class Cloud {
  session: Session | null;
  lastSync: number;
  /** a synced key changed since the last push */
  private dirty = false;
  private timer = 0;
  private listeners = new Set<() => void>();
  busy = false;
  lastError = '';
  /** writing merged data: not a local change */
  private applying = false;

  constructor() {
    const s = store.get<Session | null>(SESSION, null);
    this.session = s && typeof s.access_token === 'string' && s.user?.id ? s : null;
    this.lastSync = store.get<number>(LAST, 0);
    onStoreSet((key) => {
      if (this.applying || !this.session || !(SYNCED as readonly string[]).includes(key)) return;
      this.dirty = true;
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => void this.push().catch(() => undefined), 8000);
    });
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.dirty) void this.push(true).catch(() => undefined);
    });
  }

  get enabled(): boolean {
    return cloudConfigured;
  }

  get email(): string | null {
    return this.session?.user.email ?? null;
  }

  onChange(fn: () => void): void {
    this.listeners.add(fn);
  }

  private emit(): void {
    this.listeners.forEach((f) => f());
  }

  private async call(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<unknown> {
    if (!cloudConfigured) throw new CloudError('Comptes non configurés dans cette version');
    const headers: Record<string, string> = { apikey: ANON, 'Content-Type': 'application/json', ...((init.headers as Record<string, string>) ?? {}) };
    if (init.auth !== false && this.session) headers.Authorization = `Bearer ${this.session.access_token}`;
    let res: Response;
    try {
      res = await fetch(`${URL_}${path}`, { ...init, headers });
    } catch {
      throw new CloudError(explain(0, null));
    }
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!res.ok) throw new CloudError(explain(res.status, body as Record<string, unknown> | null));
    return body;
  }

  private keep(b: Record<string, unknown>): void {
    const user = b.user as { id: string; email: string };
    this.session = { access_token: String(b.access_token), refresh_token: String(b.refresh_token), expires_at: Number(b.expires_at ?? Math.floor(Date.now() / 1000) + Number(b.expires_in ?? 3600)), user: { id: user.id, email: user.email } };
    store.set(SESSION, this.session);
    this.emit();
  }

  /** a valid access token (refreshed a minute before it expires) */
  private async fresh(): Promise<void> {
    if (!this.session) throw new CloudError('Non connecté');
    if (this.session.expires_at - 60 > Date.now() / 1000) return;
    try {
      const b = (await this.call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: JSON.stringify({ refresh_token: this.session.refresh_token }) })) as Record<string, unknown>;
      this.keep(b);
    } catch (e) {
      this.forget();
      throw e;
    }
  }

  /** the account server answers (a network error or a 5xx, e.g. a paused project: no) */
  async ping(): Promise<boolean> {
    if (!cloudConfigured) return false;
    try {
      const r = await fetch(`${URL_}/auth/v1/health`, { headers: { apikey: ANON } });
      return r.status > 0 && r.status < 500;
    } catch {
      return false;
    }
  }

  /** create an account; 'confirm' when the project asks to confirm the email first */
  async signUp(email: string, password: string): Promise<'ok' | 'confirm'> {
    const b = (await this.call('/auth/v1/signup', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) })) as Record<string, unknown>;
    if (b && typeof b.access_token === 'string') {
      this.keep(b);
      return 'ok';
    }
    return 'confirm';
  }

  async signIn(email: string, password: string): Promise<void> {
    const b = (await this.call('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) })) as Record<string, unknown>;
    this.keep(b);
  }

  async signOut(): Promise<void> {
    if (this.dirty) await this.push().catch(() => undefined);
    await this.call('/auth/v1/logout', { method: 'POST' }).catch(() => undefined);
    this.forget();
  }

  private forget(): void {
    this.session = null;
    store.set(SESSION, null);
    this.emit();
  }

  /** this device's synced progress */
  snapshot(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const k of SYNCED) {
      const v = store.get<unknown>(k, null);
      if (v !== null) out[k] = v;
    }
    return out;
  }

  private async pull(): Promise<Record<string, unknown> | null> {
    await this.fresh();
    const rows = (await this.call(`/rest/v1/progress?select=data,updated_at&user_id=eq.${encodeURIComponent(this.session!.user.id)}`, { method: 'GET' })) as { data: Record<string, unknown> }[];
    return rows?.[0]?.data ?? null;
  }

  async push(keepalive = false): Promise<void> {
    if (!this.session) return;
    await this.fresh();
    const data = this.snapshot();
    await this.call('/rest/v1/progress', {
      method: 'POST',
      keepalive,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: this.session!.user.id, data, updated_at: new Date().toISOString() }),
    });
    this.dirty = false;
    this.lastSync = Date.now();
    store.set(LAST, this.lastSync);
    this.emit();
  }

  /** pull, merge with this device, write back here and there; true when this device changed */
  async sync(): Promise<boolean> {
    if (!this.session || this.busy) return false;
    this.busy = true;
    this.lastError = '';
    this.emit();
    try {
      const local = this.snapshot();
      const remote = (await this.pull()) ?? {};
      const merged = mergeSnapshots(local, remote);
      const changed = !sameSnapshot(merged, local);
      if (changed) {
        this.applying = true;
        for (const [k, v] of Object.entries(merged)) store.set(k, v);
        this.applying = false;
      }
      if (changed || !sameSnapshot(merged, remote)) {
        this.dirty = true;
        await this.push();
      } else {
        this.lastSync = Date.now();
        store.set(LAST, this.lastSync);
      }
      return changed;
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      this.busy = false;
      this.emit();
    }
  }
}

export const cloud = new Cloud();
