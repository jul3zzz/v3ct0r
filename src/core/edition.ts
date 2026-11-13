// Which V3CT0R this build is (docs/ECOLES.md, « deux apps »):
//   - standard: the website, the zip and the desktop app for everyone (V3CT0R-Setup.exe);
//   - lycee: V3CT0R Lycée, the desktop app of schools (VITE_EDITION=lycee, .env.lycee), opened only with a
//     school key (trial or licence), from the PC's licence, a v3ct0r-lycee:// link or typed.
// School keys live on the website (trials in the browser, the V3CT0R Lycée download) and in V3CT0R Lycée;
// the zip and V3CT0R for everyone have nothing of schools. Pure: tested in tests/edition.test.ts.

export type Edition = 'standard' | 'lycee';
/** site: keys in the browser (?essai=, J'AI UN CODE); required: no app without a key; off: nothing of schools */
export type SchoolMode = 'site' | 'required' | 'off';

export const EDITION: Edition = import.meta.env.VITE_EDITION === 'lycee' ? 'lycee' : 'standard';

export function schoolMode(edition: Edition, online: boolean): SchoolMode {
  if (edition === 'lycee') return 'required';
  return online ? 'site' : 'off';
}

const isOnline = (): boolean => typeof location !== 'undefined' && (location.protocol === 'https:' || location.protocol === 'http:');

/** the school mode of this build, here */
export const SCHOOL_MODE: SchoolMode = schoolMode(EDITION, isOnline());

/** the link that hands a key to V3CT0R Lycée once installed (electron/link.cjs reads it) */
export const LYCEE_SCHEME = 'v3ct0r-lycee';
export const lyceeLink = (key: string): string => `${LYCEE_SCHEME}://cle/${key}`;
