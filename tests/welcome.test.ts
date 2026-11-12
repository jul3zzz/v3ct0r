import { describe, expect, it } from 'vitest';
import { downloadKind, welcomeSteps } from '../src/shell/welcome-steps';

describe('what TÉLÉCHARGER gives', () => {
  it('Windows: the installer (desktop app); other systems: the zip', () => {
    expect(downloadKind('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36 Edg/140.0')).toBe('installer');
    expect(downloadKind('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15')).toBe('zip');
    expect(downloadKind('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36')).toBe('zip');
    expect(downloadKind('Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36')).toBe('zip');
  });
});

const base = { online: true, answered: false, configured: true, signedIn: false, skip: false };

describe('way in (download offer, required account)', () => {
  it('website, first visit: download offer, then account', () => {
    expect(welcomeSteps(base)).toEqual(['download', 'account']);
  });

  it('the download offer is asked once, and only on the website', () => {
    expect(welcomeSteps({ ...base, answered: true })).toEqual(['account']);
    expect(welcomeSteps({ ...base, online: false })).toEqual(['account']);
  });

  it('downloaded version: the account is required too', () => {
    expect(welcomeSteps({ ...base, online: false, answered: false })).toEqual(['account']);
  });

  it('a device already signed in opens directly (also offline)', () => {
    expect(welcomeSteps({ ...base, answered: true, signedIn: true })).toEqual([]);
    expect(welcomeSteps({ ...base, online: false, signedIn: true })).toEqual([]);
  });

  it('accounts not configured in the build: no account gate', () => {
    expect(welcomeSteps({ ...base, configured: false })).toEqual(['download']);
    expect(welcomeSteps({ ...base, configured: false, online: false })).toEqual([]);
  });

  it('end-to-end runs skip the way in', () => {
    expect(welcomeSteps({ ...base, skip: true })).toEqual([]);
  });
});

describe('way in with a school trial', () => {
  it('a key to check comes first and alone (no download offer)', () => {
    expect(welcomeSteps({ ...base, trial: 'key' })).toEqual(['trial']);
    expect(welcomeSteps({ ...base, online: false, trial: 'key' })).toEqual(['trial']);
  });

  it('a running trial needs no account', () => {
    expect(welcomeSteps({ ...base, trial: 'active' })).toEqual([]);
    expect(welcomeSteps({ ...base, online: false, trial: 'active' })).toEqual([]);
  });

  it('an ended trial blocks, signed in or not', () => {
    expect(welcomeSteps({ ...base, trial: 'expired' })).toEqual(['trial-ended']);
    expect(welcomeSteps({ ...base, signedIn: true, answered: true, trial: 'expired' })).toEqual(['trial-ended']);
  });

  it('no trial: the usual steps', () => {
    expect(welcomeSteps({ ...base, trial: 'none' })).toEqual(['download', 'account']);
  });

  it('end-to-end runs still see the trial (the smoke tests it)', () => {
    expect(welcomeSteps({ ...base, skip: true, trial: 'key' })).toEqual(['trial']);
    expect(welcomeSteps({ ...base, skip: true, trial: 'expired' })).toEqual(['trial-ended']);
  });

  it('without accounts in the build there is no trial: the app is as before', () => {
    for (const trial of ['key', 'active', 'expired'] as const) {
      expect(welcomeSteps({ ...base, configured: false, trial })).toEqual(['download']);
      expect(welcomeSteps({ ...base, configured: false, skip: true, trial })).toEqual([]);
    }
  });
});
