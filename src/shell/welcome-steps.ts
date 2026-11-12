// What the way in asks before the app starts (pure, no DOM: tested in tests/welcome.test.ts).

/** stored answer to the download offer: 'yes' | 'no' (absent: not asked yet) */
export const DL_KEY = 'welcome.download';

/** the phone or tablet system, from the user agent; iPadOS says « Macintosh » but has a touch screen */
export type MobilePlatform = 'android' | 'ios';
export const mobilePlatform = (ua: string, touchPoints = 0): MobilePlatform | null =>
  /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1) ? 'ios' : /Android/i.test(ua) ? 'android' : null;

/** what TÉLÉCHARGER gives: on a phone or a tablet, the steps to install the website as an app (PWA);
 *  on Windows, the installer (desktop app); elsewhere, the zip */
export type DownloadKind = 'installer' | 'zip' | 'mobile';
export const downloadKind = (ua: string, touchPoints = 0): DownloadKind => (mobilePlatform(ua, touchPoints) ? 'mobile' : /Windows/i.test(ua) ? 'installer' : 'zip');
/** the installer is built by .github/workflows/release.yml and attached to each release */
export const INSTALLER_URL = 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Setup.exe';
/** the website, the one a phone installs (GitHub Pages, .github/workflows/pages.yml) */
export const SITE_URL = 'https://jul3zzz.github.io/v3ct0r/';

/** how to put the website on the home screen, per system (the install tutorial, shell/install.ts) */
export const INSTALL_STEPS: Record<MobilePlatform, string[]> = {
  android: [
    'Ouvre ce site dans Chrome (ou Edge, Samsung Internet).',
    'Touche le menu ⋮ (les trois points verticaux) en haut à droite.',
    'Choisis « Installer l’application » (ou « Ajouter à l’écran d’accueil »), puis confirme.',
    'L’icône V3CT0R apparaît sur l’écran d’accueil : elle ouvre V3CT0R en plein écran, même sans internet.',
  ],
  ios: [
    'Ouvre ce site dans Safari.',
    'Touche le bouton Partager (le carré et sa flèche vers le haut) : en bas de l’écran sur iPhone, en haut sur iPad.',
    'Fais défiler la liste et choisis « Sur l’écran d’accueil ».',
    'Touche « Ajouter » : l’icône V3CT0R apparaît sur l’écran d’accueil et ouvre V3CT0R en plein écran, même sans internet.',
  ],
};

export type WelcomeStep = 'download' | 'account';

/**
 * - the download offer: on the website only, until answered, and not in the installed app;
 * - the account: required everywhere (website and downloaded version) when accounts are configured
 *   in the build, until this device has signed in once (its session is kept, offline too);
 * - end-to-end runs skip both.
 */
export function welcomeSteps(o: { online: boolean; answered: boolean; configured: boolean; signedIn: boolean; skip: boolean; installed?: boolean }): WelcomeStep[] {
  if (o.skip) return [];
  const out: WelcomeStep[] = [];
  if (o.online && !o.answered && !o.installed) out.push('download');
  if (o.configured && !o.signedIn) out.push('account');
  return out;
}
