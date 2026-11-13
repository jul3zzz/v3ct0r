// Two apps (docs/ECOLES.md): which build has school keys, the v3ct0r-lycee:// link, what the website offers
// to download, and the way in of V3CT0R Lycée.
import { describe, expect, it } from 'vitest';
import { LYCEE_SCHEME, lyceeLink, schoolMode } from '../src/core/edition';
import { SCHEME, keyFromArgs, keyFromLink } from '../electron/link.cjs';
import { EDITION_KEY, INSTALLER_URL, LYCEE_URL, downloadChoices, welcomeSteps } from '../src/shell/welcome-steps';

const raw = (glob: Record<string, string>) => Object.values(glob)[0] ?? '';
const LYCEE_YML = raw(import.meta.glob('../electron-builder.lycee.yml', { eager: true, query: '?raw', import: 'default' }));
const STD_YML = raw(import.meta.glob('../electron-builder.yml', { eager: true, query: '?raw', import: 'default' }));
const ENV_LYCEE = raw(import.meta.glob('../.env.lycee', { eager: true, query: '?raw', import: 'default' }));

describe('school keys per build', () => {
  it('V3CT0R Lycée always requires a key; V3CT0R has keys on the website only', () => {
    expect(schoolMode('lycee', false)).toBe('required');
    expect(schoolMode('lycee', true)).toBe('required');
    expect(schoolMode('standard', true)).toBe('site');
    expect(schoolMode('standard', false)).toBe('off');
  });
  it('.env.lycee sets the edition and nothing else', () => {
    const lines = ENV_LYCEE.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
    expect(lines).toEqual(['VITE_EDITION=lycee']);
  });
  it('two distinct apps: their own id, name, files, and the MSI only in V3CT0R Lycée', () => {
    expect(LYCEE_YML).toContain('appId: io.github.jul3zzz.v3ct0r.lycee');
    expect(LYCEE_YML).toContain('productName: V3CT0R Lycée');
    expect(LYCEE_YML).toContain('v3ct0rEdition: lycee');
    expect(LYCEE_YML).toContain('artifactName: V3CT0R-Lycee-Setup.exe');
    expect(LYCEE_YML).toContain('artifactName: V3CT0R-Lycee.msi');
    expect(LYCEE_YML).toContain('from: dist-lycee');
    expect(STD_YML).toContain('appId: io.github.jul3zzz.v3ct0r\n');
    expect(STD_YML).toContain('artifactName: V3CT0R-Setup.exe');
    expect(STD_YML).not.toContain('msi');
    expect(INSTALLER_URL.endsWith('/V3CT0R-Setup.exe')).toBe(true);
    expect(LYCEE_URL.endsWith('/V3CT0R-Lycee-Setup.exe')).toBe(true);
  });
});

describe('the v3ct0r-lycee:// link', () => {
  it('the website writes what the app reads', () => {
    expect(SCHEME).toBe(LYCEE_SCHEME);
    expect(keyFromLink(lyceeLink('AAAAA-BBBBB-CCCCC-DDDDD'))).toBe('AAAAA-BBBBB-CCCCC-DDDDD');
    expect(keyFromLink('v3ct0r-lycee://cle/aaaaabbbbbcccccddddd/')).toBe('aaaaabbbbbcccccddddd');
  });
  it('only a key comes out of it', () => {
    for (const bad of ['v3ct0r-lycee://cle/', 'v3ct0r-lycee://cle/AB', 'v3ct0r-lycee://cle/AAAA AAAA', 'v3ct0r-lycee://cle/../../etc', 'v3ct0r-lycee://other/AAAAABBBBB', 'https://evil.test/cle/AAAAABBBBB', `v3ct0r-lycee://cle/${'A'.repeat(65)}`, 42, null])
      expect(keyFromLink(bad)).toBeNull();
  });
  it('found among the arguments of a launch (Windows passes the link as one of them)', () => {
    expect(keyFromArgs(['C:\\V3CT0R Lycée\\V3CT0R Lycée.exe', '--allow-file-access', 'v3ct0r-lycee://cle/AAAAABBBBBCCCCCDDDDD'])).toBe('AAAAABBBBBCCCCCDDDDD');
    expect(keyFromArgs(['V3CT0R Lycée.exe'])).toBeNull();
    expect(keyFromArgs('v3ct0r-lycee://cle/AAAAABBBBB')).toBeNull();
  });
});

describe('what the website offers to download', () => {
  const win = { kind: 'installer' as const, school: true, chosen: null, urlKey: false };
  it('Windows: V3CT0R and V3CT0R Lycée', () => {
    expect(downloadChoices(win)).toEqual(['installer', 'lycee']);
  });
  it('once V3CT0R is chosen, V3CT0R Lycée is gone, unless a key comes with the address', () => {
    expect(EDITION_KEY).toBe('welcome.edition');
    expect(downloadChoices({ ...win, chosen: 'standard' })).toEqual(['installer']);
    expect(downloadChoices({ ...win, chosen: 'standard', urlKey: true })).toEqual(['installer', 'lycee']);
  });
  it('no school keys in this build, or not Windows: as before', () => {
    expect(downloadChoices({ ...win, school: false })).toEqual(['installer']);
    expect(downloadChoices({ ...win, kind: 'zip' })).toEqual(['zip']);
    expect(downloadChoices({ ...win, kind: 'mobile' })).toEqual(['mobile']);
  });
});

describe('way in of V3CT0R Lycée', () => {
  const base = { online: false, answered: false, configured: true, signedIn: false, skip: false, installed: false };
  it('no key yet: the key card, and nothing else (no account, no download), even in end-to-end runs', () => {
    expect(welcomeSteps({ ...base, trial: 'needed' })).toEqual(['key-required']);
    expect(welcomeSteps({ ...base, skip: true, trial: 'needed' })).toEqual(['key-required']);
  });
  it('a key running: straight in, no account', () => {
    expect(welcomeSteps({ ...base, trial: 'active' })).toEqual([]);
  });
  it('the licence of the PC and a link come before', () => {
    expect(welcomeSteps({ ...base, trial: 'machine' })).toEqual(['machine']);
    expect(welcomeSteps({ ...base, trial: 'key' })).toEqual(['trial']);
  });
});
