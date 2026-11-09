// The COMPTE dialog and the account form shared with the way in (welcome.ts): create an account
// or sign in (email + password), then the progress follows the account across devices
// (src/core/cloud.ts). Settings stay per device.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { Dialog, toast } from './overlays';
import { cloud } from '../core/cloud';
import './account.css';

const when = (t: number) => (t ? new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'jamais');

/** reload once the merged progress is written, so that every screen reads it */
export function reloadAfterSync(): void {
  toast('PROGRESSION SYNCHRONISÉE AVEC TON COMPTE — RECHARGEMENT', 1400);
  setTimeout(() => location.reload(), 1200);
}

const OFFLINE = 'Pas de connexion au serveur';

/**
 * Email + password, SE CONNECTER / CRÉER UN COMPTE. `onSignedIn` once signed in and synced
 * (a reload replaces it when the account brought progress from another device);
 * `onUnreachable` when the server does not answer (else the error is shown in the form).
 */
export function accountForm(onSignedIn: () => void, onUnreachable?: (msg: string) => void): HTMLElement {
  const msg = h('div', { class: 'acc-msg', role: 'status' });
  const say = (text: string, bad = false) => {
    msg.textContent = text;
    msg.classList.toggle('bad', bad);
  };
  const email = h('input', { type: 'email', autocomplete: 'email', placeholder: 'adresse e-mail', 'aria-label': 'Adresse e-mail', spellcheck: 'false' }) as HTMLInputElement;
  const pass = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'mot de passe (6 caractères au moins)', 'aria-label': 'Mot de passe' }) as HTMLInputElement;
  const login = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: 'SE CONNECTER' })) as HTMLButtonElement;
  const create = h('button', { type: 'button', class: 'btn' }, icon('user'), h('span', { text: 'CRÉER UN COMPTE' })) as HTMLButtonElement;
  const go = async (kind: 'in' | 'up') => {
    const e = email.value.trim();
    const p = pass.value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return say('✕ Adresse e-mail invalide', true);
    if (p.length < 6) return say('✕ Mot de passe trop court (6 caractères au moins)', true);
    login.disabled = create.disabled = true;
    say(kind === 'in' ? 'Connexion…' : 'Création du compte…');
    try {
      if (kind === 'up' && (await cloud.signUp(e, p)) === 'confirm') {
        say('✓ Compte créé. Ouvre le lien de confirmation reçu par e-mail, puis connecte-toi ici.');
        return;
      }
      if (kind === 'in') await cloud.signIn(e, p);
      say('✓ Connecté. Synchronisation de la progression…');
      if (await cloud.sync().catch(() => false)) return reloadAfterSync();
      toast(`CONNECTÉ · ${e}`, 2000);
      onSignedIn();
    } catch (err) {
      const m = (err as Error).message;
      if (onUnreachable && m.startsWith(OFFLINE)) onUnreachable(m);
      else say(`✕ ${m}`, true);
    } finally {
      login.disabled = create.disabled = false;
    }
  };
  login.addEventListener('click', () => void go('in'));
  create.addEventListener('click', () => void go('up'));
  pass.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') void go('in');
  });
  setTimeout(() => email.focus(), 30);
  return h('div', { class: 'acc' }, h('label', { class: 'acc-f' }, h('span', { text: 'E-MAIL' }), email), h('label', { class: 'acc-f' }, h('span', { text: 'MOT DE PASSE' }), pass), h('div', { class: 'acc-btns' }, login, create), msg);
}

export function accountDialog(): Dialog {
  const d = new Dialog('COMPTE', { width: 460 });
  d.body.classList.add('acc');
  const msg = h('div', { class: 'acc-msg', role: 'status' });
  const say = (text: string, bad = false) => {
    msg.textContent = text;
    msg.classList.toggle('bad', bad);
  };
  const paint = () => {
    d.body.replaceChildren();
    if (!cloud.enabled) {
      d.body.append(h('p', { text: 'Les comptes ne sont pas configurés dans cette version : la progression reste dans ce navigateur.' }));
      return;
    }
    if (cloud.email) {
      const sync = h('button', { type: 'button', class: 'btn on' }, icon('reset'), h('span', { text: cloud.busy ? 'SYNCHRONISATION…' : 'SYNCHRONISER MAINTENANT' }));
      const out = h('button', { type: 'button', class: 'btn' }, icon('close'), h('span', { text: 'SE DÉCONNECTER' }));
      sync.addEventListener('click', async () => {
        say('Synchronisation…');
        try {
          if (await cloud.sync()) return reloadAfterSync();
          say('✓ À jour : cet appareil et le compte ont la même progression.');
        } catch (e) {
          say(`✕ ${(e as Error).message}`, true);
        }
        paint();
      });
      out.addEventListener('click', async () => {
        await cloud.signOut();
        // an account is required: back to the way in
        toast('DÉCONNECTÉ — LA PROGRESSION RESTE AUSSI SUR CET APPAREIL', 1400);
        setTimeout(() => location.reload(), 1200);
      });
      d.body.append(
        h('div', { class: 'ro' }, h('span', { class: 'k', text: 'CONNECTÉ' }), h('span', { class: 'v', text: cloud.email })),
        h('div', { class: 'ro' }, h('span', { class: 'k', text: 'DERNIÈRE SYNCHRO' }), h('span', { class: 'v', text: when(cloud.lastSync) })),
        h('p', { class: 'acc-note', text: 'Vues validées, cours, leçons-jeux, mode histoire et notes suivent ton compte, sur tous tes appareils. Les réglages (son, qualité, musique) et la position du vaisseau restent propres à chaque appareil.' }),
        h('div', { class: 'acc-btns' }, sync, out),
        msg,
      );
      return;
    }
    d.body.append(
      h('p', { class: 'acc-note', text: 'Un compte garde ta progression (vues validées, cours, leçons-jeux, mode histoire) et tes notes, et les retrouve sur tous tes appareils.' }),
      accountForm(() => paint()),
    );
  };
  cloud.onChange(() => {
    if (d.isOpen && !cloud.busy) paint();
  });
  paint();
  d.foot.append(h('span', { text: 'SERVEUR : SUPABASE · DONNÉES : TA PROGRESSION ET TES NOTES, RIEN D’AUTRE' }));
  return d;
}
