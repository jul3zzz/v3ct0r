// What the way in asks before the app starts (pure, no DOM: tested in tests/welcome.test.ts).

/** stored answer to the download offer: 'yes' | 'no' (absent: not asked yet) */
export const DL_KEY = 'welcome.download';

/** what TÉLÉCHARGER gives: the Windows installer (desktop app) on Windows, else the zip */
export type DownloadKind = 'installer' | 'zip';
export const downloadKind = (ua: string): DownloadKind => (/Windows/i.test(ua) ? 'installer' : 'zip');
/** the installer is built by .github/workflows/release.yml and attached to each release */
export const INSTALLER_URL = 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Setup.exe';

export type WelcomeStep = 'download' | 'account';

/**
 * - the download offer: on the website only, until answered;
 * - the account: required everywhere (website and downloaded version) when accounts are configured
 *   in the build, until this device has signed in once (its session is kept, offline too);
 * - end-to-end runs skip both.
 */
export function welcomeSteps(o: { online: boolean; answered: boolean; configured: boolean; signedIn: boolean; skip: boolean }): WelcomeStep[] {
  if (o.skip) return [];
  const out: WelcomeStep[] = [];
  if (o.online && !o.answered) out.push('download');
  if (o.configured && !o.signedIn) out.push('account');
  return out;
}
