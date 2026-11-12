// What the way in asks before the app starts (pure, no DOM: tested in tests/welcome.test.ts).

/** stored answer to the download offer: 'yes' | 'no' (absent: not asked yet) */
export const DL_KEY = 'welcome.download';

/** what TÉLÉCHARGER gives: the Windows installer (desktop app) on Windows, else the zip */
export type DownloadKind = 'installer' | 'zip';
export const downloadKind = (ua: string): DownloadKind => (/Windows/i.test(ua) ? 'installer' : 'zip');
/** the installer is built by .github/workflows/release.yml and attached to each release */
export const INSTALLER_URL = 'https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Setup.exe';

export type WelcomeStep = 'download' | 'account' | 'trial' | 'trial-ended';

/** the school trial on this device (src/school/school.ts): a key to check (from ?essai=), one
 *  running, one ended or stopped, or none */
export type TrialStep = 'none' | 'key' | 'active' | 'expired';

/**
 * - a school trial (docs/ECOLES.md), only when accounts are configured (the server checks keys):
 *   a key to check comes first and alone (no download offer); an ended trial blocks the app; a
 *   running one needs no account;
 * - the download offer: on the website only, until answered;
 * - the account: required everywhere (website and downloaded version) when accounts are configured
 *   in the build, until this device has signed in once (its session is kept, offline too);
 * - end-to-end runs skip the download offer and the account, not the trial.
 * The way in asks again after each step (welcome.ts): a key refused leads to the usual steps.
 */
export function welcomeSteps(o: { online: boolean; answered: boolean; configured: boolean; signedIn: boolean; skip: boolean; trial?: TrialStep }): WelcomeStep[] {
  const trial = o.configured ? (o.trial ?? 'none') : 'none';
  if (trial === 'expired') return ['trial-ended'];
  if (trial === 'key') return ['trial'];
  if (o.skip || trial === 'active') return [];
  const out: WelcomeStep[] = [];
  if (o.online && !o.answered) out.push('download');
  if (o.configured && !o.signedIn) out.push('account');
  return out;
}
