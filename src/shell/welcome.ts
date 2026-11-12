// The way in, before the app starts:
//   0. a school key (docs/ECOLES.md), when accounts are configured: the licence set on this PC by its
//      installer is checked first, with no card unless it fails (server out of reach, key refused,
//      every seat taken); then a key from ?essai= (welcome card in the school's colours, no account
//      needed, one offered); an ended, stopped or seatless key blocks the app until a new key is given;
//   1. on the website only, once: « Télécharger V3CT0R ? » (no: a download icon stays in the status bar);
//      on Windows, also V3CT0R Lycée with a school key (shell/lycee.ts), until V3CT0R has been chosen;
//   V3CT0R Lycée (src/core/edition.ts) asks for a school key instead, and nothing else;
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
import { codeForm, contactLine, openGrid, schoolHead, statusLine } from './school-ui';
import { endedWords, keyLabel } from '../school/trial';
import { DL_KEY, EDITION_KEY, downloadChoices, downloadKind, welcomeSteps } from './welcome-steps';
import { lyceePanel } from './lycee';
import { installPanel } from './install';
import { installedApp } from './pwa';
import './welcome.css';

export { DL_KEY };

export const isOnline = (): boolean => location.protocol === 'https:' || location.protocol === 'http:';

export interface WelcomeHooks {
  /** start the download of the offline version (V3CT0R for everyone) */
  download(): void;
  /** start the download of V3CT0R Lycée (Windows) */
  downloadLycee(): void;
  /** its size, when known (« 6,4 Mo ») */
  size(): Promise<string | null>;
}

const steps = () => welcomeSteps({ online: isOnline(), answered: store.get<string | null>(DL_KEY, null) !== null, configured: cloud.enabled, signedIn: !!cloud.email, skip: store.get<boolean>('e2e', false), installed: installedApp(), trial: school.step() });

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

/** the blocking card of an ended, stopped or seatless key; `onKey` once a running key is kept */
function paintEnded(card: HTMLElement, onKey: () => void): void {
  const info = school.info;
  const state = school.state();
  if (!info || !state || state === 'active') return onKey();
  card.classList.add('sc-card');
  const w = endedWords(info, state);
  const form = codeForm(
    (s) => {
      if (s === 'active') onKey();
      else paintEnded(card, onKey);
    },
    { label: 'NOUVELLE CLÉ' },
  );
  card.replaceChildren(
    h('div', { class: 'wl-k', text: w.k }),
    schoolHead(info, w.title, info.school),
    ...(w.text ? [h('p', { text: w.text })] : []),
    contactLine(),
    h('p', { class: 'wl-dim', text: 'Ta progression reste sur cet appareil. Une nouvelle clé d’essai ou de licence rouvre V3CT0R ici, avec elle.' }),
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

/** V3CT0R Lycée: a v3ct0r-lycee:// link opened while the app runs; a key already running is replaced
 *  only if the person says so (any website can open such a link) */
export function linkKeyArrived(key: string): void {
  if (school.info?.key === key && school.active) return;
  const s = screen();
  const go = async () => {
    s.card.replaceChildren(...head('V3CT0R LYCÉE', 'Vérification de la clé…'));
    const r = await school.redeem(key, 'link');
    if (r.ok && r.state === 'active') {
      s.close();
      // every screen reads the new key (locks, colour, badge)
      location.reload();
      return;
    }
    s.card.replaceChildren(
      ...head('V3CT0R LYCÉE', 'Clé du lien refusée'),
      h('p', { text: r.ok ? 'Cette clé n’ouvre plus V3CT0R Lycée (terminée, arrêtée ou postes complets).' : r.message }),
      h('div', { class: 'wl-btns' }, btn('FERMER', 'close', () => s.close())),
    );
  };
  const running = school.active ? school.info : null;
  if (!running) return void go();
  s.card.replaceChildren(
    ...head('V3CT0R LYCÉE', 'Nouvelle clé reçue'),
    h('p', { text: `Un lien donne une autre clé à V3CT0R Lycée. Remplacer la clé de ${running.school}, qui tourne ici ?` }),
    h('div', { class: 'wl-btns' }, btn('REMPLACER', 'play', () => void go(), true), btn('GARDER', 'close', () => s.close())),
  );
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
      // a phone or a tablet: the website goes on the home screen (PWA), the steps right here
      if (downloadKind(navigator.userAgent, navigator.maxTouchPoints) === 'mobile') {
        const ok = btn('C’EST FAIT', 'play', () => {
          store.set(DL_KEY, 'yes');
          next();
        }, true);
        const later = btn('PLUS TARD, CONTINUER ICI', 'play', () => {
          store.set(DL_KEY, 'no');
          next();
        });
        card.replaceChildren(
          ...head(pos(), 'Installer V3CT0R sur ton téléphone ?'),
          h('p', { text: 'Installé sur l’écran d’accueil, V3CT0R s’ouvre comme une app, en plein écran et même sans internet : les 46 vues, l’ATLAS, les cours, les jeux et le mode histoire, avec les voix.' }),
          installPanel(),
          h('p', { class: 'wl-dim', text: 'Plus tard : le bouton INSTALLER de la barre du haut redonne ces étapes.' }),
          h('div', { class: 'wl-btns' }, ok, later),
        );
        return;
      }
      const installer = downloadKind(navigator.userAgent) === 'installer';
      const lycee = downloadChoices({ kind: downloadKind(navigator.userAgent, navigator.maxTouchPoints), school: school.enabled, chosen: store.get<string | null>(EDITION_KEY, null), urlKey: false }).includes('lycee');
      const ly = lycee ? btn('TÉLÉCHARGER V3CT0R LYCÉE', 'download', () => showLycee()) : null;
      if (ly) yes.lastElementChild!.textContent = 'OUI, TÉLÉCHARGER V3CT0R';
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
        ...(ly ? [h('p', { class: 'wl-dim', text: 'Ton établissement t’a donné une clé d’essai ou de licence ? V3CT0R Lycée, l’app des établissements, s’ouvre avec elle, tout débloqué.' })] : []),
        h('p', { class: 'wl-dim', text: 'Si tu continues en ligne, une icône de téléchargement reste en bas de l’écran pour plus tard.' }),
        h('div', { class: 'wl-btns' }, yes, ly, no, size),
      );
      setTimeout(() => yes.focus(), 30);
    };

    /** the website: V3CT0R Lycée with a school key; `back`: where RETOUR goes */
    const showLycee = (key?: string, back: () => void = showDownload, onDone: () => void = () => {
      store.set(DL_KEY, 'yes');
      next();
    }) => {
      card.replaceChildren(
        ...head('V3CT0R · LYCÉE', 'Télécharger V3CT0R Lycée'),
        lyceePanel({ key, auto: !!key, download: hooks.downloadLycee, onDone }),
        h('div', { class: 'wl-btns' }, btn('RETOUR', 'close', back)),
      );
    };

    /** V3CT0R Lycée: no app without a school key (trial or licence) */
    const showRequired = () => {
      card.classList.remove('sc-card');
      card.replaceChildren(
        ...head('V3CT0R LYCÉE', 'Clé de ton établissement'),
        h('p', { text: 'V3CT0R Lycée s’ouvre avec la clé d’essai ou de licence que ton établissement t’a donnée (20 caractères, avec ou sans tirets). Depuis le site de V3CT0R, le bouton OUVRIR V3CT0R LYCÉE la donne à l’app tout seul.' }),
        codeForm((state) => (state === 'active' ? showTrial() : next()), { label: 'CLÉ D’ÉTABLISSEMENT', button: 'OUVRIR' }),
        h('p', { class: 'wl-dim', text: 'Pas de clé ? V3CT0R, l’app pour tous, se télécharge sur le site de V3CT0R.' }),
      );
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
      const code = school.enabled ? btn('J’AI UN CODE', 'target', () => showCode()) : null;
      card.replaceChildren(
        ...head(pos(), 'Crée ton compte'),
        h('p', { text: 'Un compte est nécessaire pour ouvrir V3CT0R. Il garde ta progression (vues validées, cours, leçons-jeux, mode histoire) et tes notes, et les retrouve sur tous tes appareils.' }),
        accountForm(
          () => next(),
          (msg) => showAccount(msg),
        ),
        h('p', { class: 'wl-dim', text: 'Déjà un compte ? Mêmes champs, puis SE CONNECTER. Un appareil déjà connecté s’ouvre ensuite même sans internet.' }),
        ...(code ? [h('div', { class: 'sc-or' }, h('p', { class: 'wl-dim', text: 'Ton établissement t’a envoyé une clé d’essai ou de licence ?' }), code)] : []),
      );
    };

    /** J'AI UN CODE (account card), or a key refused */
    const showCode = (value = '', problem = '') => {
      card.replaceChildren(
        ...head('V3CT0R · ÉCOLE', problem ? 'Clé refusée' : 'Clé d’établissement'),
        h('p', { text: problem || 'Colle la clé d’essai ou de licence reçue de ton établissement (20 caractères, avec ou sans tirets).' }),
        codeForm((state) => (state === 'active' ? showTrial() : next()), { label: 'CLÉ', value }),
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
      const r = await school.redeem(key, school.urlSource);
      if (!r.ok) return showCode(key, r.offline ? `${r.message}. Vérifie la connexion, puis valide à nouveau.` : r.message);
      if (r.state === 'active') showTrial();
      else next();
    };

    /** the school's welcome card (a trial, or a licence typed here) */
    const showTrial = () => {
      const info = school.info;
      if (!info) return next();
      card.classList.add('sc-card');
      const l = keyLabel(info, Date.now());
      const lic = info.kind === 'licence';
      const start = btn(lic ? 'OUVRIR V3CT0R' : 'COMMENCER L’ESSAI', 'play', () => done(), true);
      const acc = btn('CRÉER UN COMPTE (FACULTATIF)', 'user', () => {
        card.replaceChildren(
          h('div', { class: 'wl-k', text: `V3CT0R · ${l.badge}` }),
          schoolHead(info, 'Compte facultatif', info.school),
          h('p', { text: `Le compte garde ta progression et tes notes, et les retrouve sur tes autres appareils. ${lic ? 'La licence' : 'L’essai'} reste ouvert${lic ? 'e' : ''} sans lui.` }),
          accountForm(() => done()),
          h('div', { class: 'wl-btns' }, btn('RETOUR', 'close', () => showTrial())),
        );
      });
      // the website on Windows: the same key opens V3CT0R Lycée, the app of schools
      const ly =
        !school.required && downloadKind(navigator.userAgent, navigator.maxTouchPoints) === 'installer'
          ? btn('TÉLÉCHARGER V3CT0R LYCÉE', 'download', () => showLycee(info.key, showTrial, () => done()))
          : null;
      card.replaceChildren(
        h('div', { class: 'wl-k', text: `V3CT0R · ${l.badge}` }),
        schoolHead(info, info.school, statusLine(info)),
        h('p', { text: lic ? `V3CT0R aux couleurs de ${info.school}, avec tout débloqué :` : `Tu découvres V3CT0R aux couleurs de ${info.school}, avec tout débloqué :` }),
        openGrid(),
        h('p', { class: 'wl-dim', text: `Aucun compte n’est nécessaire ${lic ? 'avec la licence' : 'pendant l’essai'}. Un compte, facultatif, garde ta progression sur tous tes appareils.` }),
        h('p', { class: 'wl-dim', text: `${lic ? 'Avec la licence' : 'Pendant l’essai'}, V3CT0R compte les ouvertures et le temps passé avec cette clé, rien d’autre.` }),
        h('div', { class: 'wl-btns' }, start, ly, acc),
      );
      setTimeout(() => start.focus(), 30);
    };

    /** the licence of this PC (installation kit): checked with no card, one only if it fails */
    const checkMachine = async () => {
      card.classList.add('sc-card');
      card.replaceChildren(...head('V3CT0R · LICENCE', 'Licence de l’établissement…'));
      const r = await school.checkMachine();
      if (r.ok) return next();
      const retry = btn('RÉESSAYER', 'reset', () => void checkMachine(), true);
      const without = btn('CONTINUER SANS LA LICENCE', 'close', () => {
        school.dismissKey();
        card.classList.remove('sc-card');
        next();
      });
      card.replaceChildren(
        ...head('V3CT0R · LICENCE', r.offline ? 'Serveur de licence injoignable' : 'Licence refusée'),
        h('p', { text: r.offline ? 'Ce poste a une licence de l’établissement, mais il n’a pas pu la vérifier.' : r.message }),
        h('p', {
          class: 'wl-dim',
          text: r.offline
            ? 'Une seule vérification suffit : ensuite, le poste s’ouvre aussi sans internet. Si le réseau de l’établissement filtre les sites, le référent numérique doit autoriser le serveur de V3CT0R (voir le LISEZ-MOI du kit d’installation).'
            : 'Signale-le au référent numérique de l’établissement : la clé du kit d’installation n’est plus reconnue.',
        }),
        h('div', { class: 'wl-btns' }, retry, without),
      );
      setTimeout(() => retry.focus(), 30);
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
      else if (s === 'machine') void checkMachine();
      else if (s === 'key-required') showRequired();
      else paintEnded(card, () => (school.active ? showTrial() : next()));
    };
    next();
  });
}
