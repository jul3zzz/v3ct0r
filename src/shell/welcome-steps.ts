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
/** the installers are built by .github/workflows/release.yml and attached to each release:
 *  V3CT0R for everyone, and V3CT0R Lycée (opened only with a school key, src/core/edition.ts) */
export const INSTALLER_URL = 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Setup.exe';
export const LYCEE_URL = 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Lycee-Setup.exe';
/** stored once V3CT0R for everyone has been downloaded on this browser: 'standard' (absent: not chosen) */
export const EDITION_KEY = 'welcome.edition';

/** what the website offers to download: on Windows, V3CT0R and, while school keys work there and
 *  V3CT0R for everyone has not been chosen, V3CT0R Lycée (again with a key in the address, ?essai=) */
export type DownloadChoice = DownloadKind | 'lycee';
export function downloadChoices(o: { kind: DownloadKind; school: boolean; chosen: string | null; urlKey: boolean }): DownloadChoice[] {
  if (o.kind !== 'installer') return [o.kind];
  return o.school && (o.chosen !== 'standard' || o.urlKey) ? ['installer', 'lycee'] : ['installer'];
}
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

export type WelcomeStep = 'download' | 'account' | 'trial' | 'machine' | 'key-required' | 'trial-ended';

/** the school key on this device (src/school/school.ts): the licence set on this PC by its installer
 *  to check (V3CT0R Lycée), a key to check (?essai= on the website, a v3ct0r-lycee:// link in V3CT0R
 *  Lycée), one running, one ended, stopped or without a seat, none yet in V3CT0R Lycée (needed), or none */
export type TrialStep = 'none' | 'machine' | 'key' | 'active' | 'expired' | 'needed';

/**
 * - a school key (docs/ECOLES.md), only when accounts are configured (the server checks keys): the
 *   licence of the PC, then a key from the address, come first and alone (no download offer); an
 *   ended key blocks the app; a running trial or licence needs no account; V3CT0R Lycée asks for a key
 *   (no way around it) until one runs, and never for an account nor a download;
 * - the download offer: on the website only, until answered, and not in the installed app;
 * - the account: required everywhere (website and downloaded version) when accounts are configured
 *   in the build, until this device has signed in once (its session is kept, offline too);
 * - end-to-end runs skip the download offer and the account, not the trial.
 * The way in asks again after each step (welcome.ts): a key refused leads to the usual steps.
 */
export function welcomeSteps(o: { online: boolean; answered: boolean; configured: boolean; signedIn: boolean; skip: boolean; installed?: boolean; trial?: TrialStep }): WelcomeStep[] {
  const trial = o.configured ? (o.trial ?? 'none') : 'none';
  if (trial === 'expired') return ['trial-ended'];
  if (trial === 'machine') return ['machine'];
  if (trial === 'key') return ['trial'];
  if (trial === 'needed') return ['key-required'];
  if (o.skip || trial === 'active') return [];
  const out: WelcomeStep[] = [];
  if (o.online && !o.answered && !o.installed) out.push('download');
  if (o.configured && !o.signedIn) out.push('account');
  return out;
}
