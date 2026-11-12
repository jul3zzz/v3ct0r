// « Installer sur ton téléphone »: the tutorial that puts the website on the home screen of an Android phone or an
// iPhone / iPad (PWA, shell/pwa.ts). Shown by TÉLÉCHARGER on a phone or a tablet, by Ctrl+K, and by the way in
// (welcome.ts) on the website. The steps themselves are pure data (welcome-steps.ts, tested).
import { h } from '../hud/dom';
import { icon } from '../hud/deco';
import { Dialog } from './overlays';
import { INSTALL_STEPS, SITE_URL, mobilePlatform, type MobilePlatform } from './welcome-steps';
import { canPrompt, installedApp, onPromptChange, onWeb, promptInstall } from './pwa';
import './install.css';

/** the tabs ANDROID / IPHONE · IPAD, the steps of the chosen one, the browser's own INSTALLER button when it
 *  offers one (Android), and what « hors ligne » means */
export function installPanel(): HTMLElement {
  let os: MobilePlatform = mobilePlatform(navigator.userAgent, navigator.maxTouchPoints) ?? 'android';
  const tabs = h('div', { class: 'in-tabs', role: 'tablist', 'aria-label': 'Système du téléphone' });
  const steps = h('ol', { class: 'in-steps' });
  const native = h('div', { class: 'in-native' });
  const root = h('div', { class: 'in' }, tabs, steps, native);
  if (installedApp()) {
    root.replaceChildren(h('p', { class: 'in-done', text: '✓ V3CT0R EST INSTALLÉ : tu l’utilises en ce moment depuis son icône, et il s’ouvre même sans internet.' }));
    return root;
  }
  const paint = () => {
    tabs.replaceChildren(
      ...(['android', 'ios'] as const).map((k) => {
        const b = h('button', { type: 'button', role: 'tab', class: 'in-tab', 'aria-selected': String(k === os), text: k === 'android' ? 'ANDROID' : 'IPHONE · IPAD' });
        b.addEventListener('click', () => ((os = k), paint()));
        return b;
      }),
    );
    steps.replaceChildren(...INSTALL_STEPS[os].map((s) => h('li', { text: s })));
    native.replaceChildren();
    if (os === 'android' && canPrompt()) {
      const go = h('button', { type: 'button', class: 'btn on' }, icon('download'), h('span', { text: 'INSTALLER V3CT0R MAINTENANT' }));
      go.addEventListener('click', () => void promptInstall());
      native.append(go, h('span', { class: 'in-dim', text: 'ton navigateur propose l’installation : un seul geste' }));
    }
    // opened from a file (the zip) or another address: the steps start on the website
    if (!onWeb() || !location.hostname.endsWith('github.io')) native.append(h('p', { class: 'in-dim', text: `Adresse du site à ouvrir sur le téléphone : ${SITE_URL}` }));
  };
  paint();
  // the browser's prompt comes (or goes) later: repaint, until the panel has left the page
  const stop = onPromptChange(() => (root.isConnected ? paint() : stop()));
  root.append(h('p', { class: 'in-dim', text: 'La première ouverture garde tout sur le téléphone (≈ 8 Mo : les 46 vues, l’ATLAS, les cours, les jeux, le mode histoire et les voix). Ensuite plus besoin d’internet ; seule la synchro du compte attend le retour du réseau.' }));
  return root;
}

export function installDialog(): Dialog {
  const d = new Dialog('INSTALLER SUR TON TÉLÉPHONE', { center: true, width: 540 });
  d.body.append(installPanel());
  d.foot.append(h('span', { text: 'UNE ICÔNE SUR L’ÉCRAN D’ACCUEIL · PLEIN ÉCRAN · HORS LIGNE' }));
  return d;
}
