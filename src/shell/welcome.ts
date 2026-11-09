// The way in, before the app starts:
//   1. on the website only, once: « Télécharger V3CT0R ? » (no: a download icon stays in the status bar);
//   2. an account is required (website and downloaded version), when accounts are configured:
//      create one or sign in. A device that has signed in once keeps its session and opens without
//      a connection. If the account server cannot be reached: retry, and on the website, download
//      the offline version instead.
// Full-screen, above everything; keys outside it do not reach the app.
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { store } from '../core/settings';
import { cloud } from '../core/cloud';
import { accountForm } from './account';
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

export function welcome(hooks: WelcomeHooks): Promise<void> {
  const steps = welcomeSteps({ online: isOnline(), answered: store.get<string | null>(DL_KEY, null) !== null, configured: cloud.enabled, signedIn: !!cloud.email, skip: store.get<boolean>('e2e', false) });
  if (!steps.length) return Promise.resolve();
  return new Promise((resolve) => {
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
    const done = () => {
      for (const k of KEYS) window.removeEventListener(k, block, true);
      root.remove();
      resolve();
    };
    const btn = (label: string, ico: string, run: () => void, primary = false) => {
      const b = h('button', { type: 'button', class: primary ? 'btn on' : 'btn' }, icon(ico), h('span', { text: label }));
      b.addEventListener('click', run);
      return b;
    };
    const head = (k: string, title: string) => [h('div', { class: 'wl-k', text: k }), h('h1', { class: 'wl-title', text: title })];

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
        ...head('V3CT0R · 1 / 2', 'Télécharger V3CT0R ?'),
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
      const retry = btn('RÉESSAYER', 'reset', () => void check());
      const dl = btn('TÉLÉCHARGER LA VERSION HORS LIGNE', 'download', () => hooks.download());
      const n = steps.length;
      if (problem) {
        card.replaceChildren(
          ...head(`V3CT0R · ${n} / ${n}`, 'Serveur de comptes injoignable'),
          h('p', { text: problem }),
          h('p', { class: 'wl-dim', text: isOnline() ? 'Un compte est nécessaire pour ouvrir V3CT0R. En attendant que le serveur réponde, la version hors ligne se télécharge ici.' : 'Un compte est nécessaire à la première ouverture. Vérifie la connexion à internet, puis réessaie.' }),
          h('div', { class: 'wl-btns' }, retry, isOnline() ? dl : null),
        );
        return;
      }
      card.replaceChildren(
        ...head(`V3CT0R · ${n} / ${n}`, 'Crée ton compte'),
        h('p', { text: 'Un compte est nécessaire pour ouvrir V3CT0R. Il garde ta progression (vues validées, cours, leçons-jeux, mode histoire) et tes notes, et les retrouve sur tous tes appareils.' }),
        accountForm(
          () => done(),
          (msg) => showAccount(msg),
        ),
        h('p', { class: 'wl-dim', text: 'Déjà un compte ? Mêmes champs, puis SE CONNECTER. Un appareil déjà connecté s’ouvre ensuite même sans internet.' }),
      );
    };

    const check = async () => {
      card.replaceChildren(...head('V3CT0R', 'Connexion au serveur de comptes…'));
      if (await cloud.ping()) showAccount();
      else showAccount('Le serveur ne répond pas (pas de connexion, ou projet en pause).');
    };

    let k = 0;
    const next = () => {
      const s = steps[k++];
      if (!s) return done();
      if (s === 'download') showDownload();
      else void check();
    };
    next();
  });
}
