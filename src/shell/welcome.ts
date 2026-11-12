// The way in, before the app starts:
//   0. a school trial (docs/ECOLES.md), when accounts are configured: a key from ?essai= is checked
//      first (welcome card in the school's colours, no account needed, one offered); an ended or
//      stopped trial blocks the app until a new key is given;
//   1. on the website only, once: « Télécharger V3CT0R ? » (no: a download icon stays in the status bar);
//   2. an account is required (website and downloaded version), when accounts are configured:
//      create one or sign in, or J'AI UN CODE for a school trial. A device that has signed in once
//      keeps its session and opens without a connection. If the account server cannot be reached:
//      retry, and on the website, download the offline version instead.
// The steps are asked again after each one (welcome-steps.ts, pure and tested).
// Full-screen, above everything; keys outside it do not reach the app.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { store } from '../core/settings';
import { cloud } from '../core/cloud';
import { school } from '../school/school';
import { accountForm } from './account';
import { codeForm, contactLine, schoolHead } from './school-ui';
import { DL_KEY, downloadKind, welcomeSteps } from './welcome-steps';
import './welcome.css';

export { DL_KEY };

export const isOnline = (): boolean => location.protocol === 'https:' || location.protocol === 'http:';

export interface WelcomeHooks {
  /** start the download of the offline version */
  download(): void;
  /** its size, when known (« 6,4 Mo ») */
  size(): Promise<string | null>;
}

const steps = () => welcomeSteps({ online: isOnline(), answered: store.get<string | null>(DL_KEY, null) !== null, configured: cloud.enabled, signedIn: !!cloud.email, skip: store.get<boolean>('e2e', false), trial: school.step() });

/** a full-screen card above the app; keys outside it are dropped */
function screen(): { card: HTMLElement; close: () => void } {
  const card = h('div', { class: 'wl-card frame solid', role: 'dialog', 'aria-modal': 'true' });
  const root = h('div', { class: 'wl' }, card);
  // no key reaches the app behind it: keys outside the card are dropped, keys inside it
  // (fields, buttons) stop at the card once its own handlers have run
  const block = (e: KeyboardEvent) => {
    if (!root.contains(e.target as Node)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  const KEYS = ['keydown', 'keyup', 'keypress'] as const;
  for (const k of KEYS) {
    window.addEventListener(k, block, true);
    root.addEventListener(k, (e) => e.stopPropagation());
  }
  document.body.append(root);
  return {
    card,
    close: () => {
      for (const k of KEYS) window.removeEventListener(k, block, true);
      root.remove();
    },
  };
}

const btn = (label: string, ico: string, run: () => void, primary = false) => {
  const b = h('button', { type: 'button', class: primary ? 'btn on' : 'btn' }, icon(ico), h('span', { text: label }));
  b.addEventListener('click', run);
  return b;
};
const head = (k: string, title: string) => [h('div', { class: 'wl-k', text: k }), h('h1', { class: 'wl-title', text: title })];

/** the blocking card of an ended (or stopped) trial; `onKey` once a running trial is kept */
function paintEnded(card: HTMLElement, onKey: () => void): void {
  const info = school.info;
  if (!info) return onKey();
  card.classList.add('sc-card');
  const stopped = info.state === 'disabled';
  const form = codeForm(
    (state) => {
      if (state === 'active') onKey();
      else paintEnded(card, onKey);
    },
    { label: 'NOUVELLE CLÉ' },
  );
  card.replaceChildren(
    h('div', { class: 'wl-k', text: 'V3CT0R · ESSAI TERMINÉ' }),
    schoolHead(info, stopped ? `L’essai de ${info.school} est arrêté` : `L’essai de ${info.school} est terminé`),
    contactLine(),
    h('p', { class: 'wl-dim', text: 'Une nouvelle clé d’essai ou de licence rouvre V3CT0R ici, avec ta progression.' }),
    form,
  );
}

/** while the app runs: the trial has just ended or been stopped → block until a new key */
export function trialEnded(): void {
  if (document.querySelector('.wl')) return;
  const s = screen();
  paintEnded(s.card, () => {
    s.close();
    // every screen reads the new trial (locks, colour, badge)
    location.reload();
  });
}

export function welcome(hooks: WelcomeHooks): Promise<void> {
  const first = steps();
  if (!first.length) return Promise.resolve();
  return new Promise((resolve) => {
    const { card, close } = screen();
    const total = first.length;
    const done = () => {
      close();
      resolve();
    };
    /** « V3CT0R · 2 / 2 » for the usual steps */
    const pos = () => `V3CT0R · ${Math.max(1, total - steps().length + 1)} / ${total}`;

    const showDownload = () => {
      const yes = btn('OUI, TÉLÉCHARGER', 'download', () => {
        store.set(DL_KEY, 'yes');
        hooks.download();
        next();
      }, true);
      const no = btn('NON, CONTINUER EN LIGNE', 'play', () => {
        store.set(DL_KEY, 'no');
        next();
      });
      const installer = downloadKind(navigator.userAgent) === 'installer';
      const size = h('span', { class: 'wl-dim', text: installer ? 'installeur Windows' : 'zip' });
      if (!installer) void hooks.size().then((s) => s && (size.textContent = `zip · ${s}`));
      card.replaceChildren(
        ...head(pos(), 'Télécharger V3CT0R ?'),
        h('p', {
          text: installer
            ? 'L’installeur met V3CT0R sur ton bureau et dans le menu Démarrer : une vraie app, dans sa propre fenêtre, qui s’ouvre sans internet ni navigateur. Les 46 vues, l’ATLAS, les cours, les jeux et le mode histoire, avec les voix.'
            : 'La version téléchargée s’ouvre d’un double-clic sur index.html, sans internet ni installation : les 46 vues, l’ATLAS, les cours, les jeux et le mode histoire, avec les voix.',
        }),
        ...(installer ? [h('p', { class: 'wl-dim', text: 'Au premier lancement, Windows peut afficher « Windows a protégé votre ordinateur » (app non signée) : Informations complémentaires, puis Exécuter quand même.' })] : []),
        h('p', { class: 'wl-dim', text: 'Si tu continues en ligne, une icône de téléchargement reste en bas de l’écran pour plus tard.' }),
        h('div', { class: 'wl-btns' }, yes, no, size),
      );
      setTimeout(() => yes.focus(), 30);
    };

    const showAccount = (problem = '') => {
      card.classList.remove('sc-card');
      const retry = btn('RÉESSAYER', 'reset', () => void check());
      const dl = btn('TÉLÉCHARGER LA VERSION HORS LIGNE', 'download', () => hooks.download());
      if (problem) {
        card.replaceChildren(
          ...head(pos(), 'Serveur de comptes injoignable'),
          h('p', { text: problem }),
          h('p', { class: 'wl-dim', text: isOnline() ? 'Un compte est nécessaire pour ouvrir V3CT0R. En attendant que le serveur réponde, la version hors ligne se télécharge ici.' : 'Un compte est nécessaire à la première ouverture. Vérifie la connexion à internet, puis réessaie.' }),
          h('div', { class: 'wl-btns' }, retry, isOnline() ? dl : null),
        );
        return;
      }
      const code = btn('J’AI UN CODE', 'target', () => showCode());
      card.replaceChildren(
        ...head(pos(), 'Crée ton compte'),
        h('p', { text: 'Un compte est nécessaire pour ouvrir V3CT0R. Il garde ta progression (vues validées, cours, leçons-jeux, mode histoire) et tes notes, et les retrouve sur tous tes appareils.' }),
        accountForm(
          () => next(),
          (msg) => showAccount(msg),
        ),
        h('p', { class: 'wl-dim', text: 'Déjà un compte ? Mêmes champs, puis SE CONNECTER. Un appareil déjà connecté s’ouvre ensuite même sans internet.' }),
        h('div', { class: 'sc-or' }, h('p', { class: 'wl-dim', text: 'Ton établissement t’a envoyé une clé d’essai ?' }), code),
      );
    };

    /** J'AI UN CODE (account card), or a key refused */
    const showCode = (value = '', problem = '') => {
      card.replaceChildren(
        ...head('V3CT0R · ESSAI', problem ? 'Clé refusée' : 'Clé d’essai'),
        h('p', { text: problem || 'Colle la clé reçue de ton établissement (20 caractères, avec ou sans tirets).' }),
        codeForm((state) => (state === 'active' ? showTrial() : next()), { label: 'CLÉ D’ESSAI', value }),
        h('div', { class: 'wl-btns' }, btn('CONTINUER SANS CLÉ', 'close', () => {
          school.dismissKey();
          next();
        })),
      );
    };

    /** a key from the address: check it */
    const checkKey = async () => {
      const key = school.urlKey ?? '';
      card.replaceChildren(...head('V3CT0R · ESSAI', 'Vérification de la clé…'));
      const r = await school.redeem(key);
      if (!r.ok) return showCode(key, r.offline ? `${r.message}. Vérifie la connexion, puis valide à nouveau.` : r.message);
      if (r.state === 'active') showTrial();
      else next();
    };

    /** the school's welcome card */
    const showTrial = () => {
      const info = school.info;
      if (!info) return next();
      card.classList.add('sc-card');
      const start = btn('COMMENCER L’ESSAI', 'play', () => done(), true);
      const acc = btn('CRÉER UN COMPTE (FACULTATIF)', 'user', () => {
        card.replaceChildren(
          h('div', { class: 'wl-k', text: 'V3CT0R · ESSAI' }),
          schoolHead(info, 'Compte facultatif'),
          h('p', { text: 'Le compte garde ta progression et tes notes, et les retrouve sur tes autres appareils. L’essai reste ouvert sans lui.' }),
          accountForm(() => done()),
          h('div', { class: 'wl-btns' }, btn('RETOUR', 'close', () => showTrial())),
        );
      });
      card.replaceChildren(
        h('div', { class: 'wl-k', text: 'V3CT0R · ESSAI' }),
        schoolHead(info),
        h('p', { text: `Tu découvres V3CT0R aux couleurs de ${info.school}, ${school.until()} : les 46 vues, l’ATLAS, les cours, les leçons-jeux et le mode histoire, avec toutes les vues et tous les cours débloqués.` }),
        h('p', { class: 'wl-dim', text: 'Aucun compte n’est nécessaire pendant l’essai. Un compte, facultatif, garde ta progression sur tous tes appareils.' }),
        h('p', { class: 'wl-dim', text: 'Pendant l’essai, V3CT0R compte les ouvertures et le temps passé avec cette clé, rien d’autre.' }),
        h('div', { class: 'wl-btns' }, start, acc),
      );
      setTimeout(() => start.focus(), 30);
    };

    const check = async () => {
      card.replaceChildren(...head('V3CT0R', 'Connexion au serveur de comptes…'));
      if (await cloud.ping()) showAccount();
      else showAccount('Le serveur ne répond pas (pas de connexion, ou projet en pause).');
    };

    const next = () => {
      const s = steps()[0];
      if (!s) return done();
      if (s === 'download') showDownload();
      else if (s === 'account') void check();
      else if (s === 'trial') void checkKey();
      else paintEnded(card, () => (school.active ? showTrial() : next()));
    };
    next();
  });
}
