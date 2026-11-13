import { describe, expect, it } from 'vitest';
import { ALPHABET, CODE_LENGTH, codeHash, formatCode, isTrialKey, newCode, normCode } from '../src/school/codes';
import { LOGO_MAX, logoDataUrl, safeLogo, svgProblem } from '../src/school/logo';
import { IDLE_MS, PING_MAX, accentInk, advance, contrast, daysLeft, fromRow, input, keyFromSearch, newClock, parseTrial, take, trialState, validRoute, visibility, withoutKey, type TrialInfo } from '../src/school/trial';

const enc = (s: string) => new TextEncoder().encode(s);
const migration = Object.values(import.meta.glob('../supabase/migrations/*_school_trial.sql', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>)[0];
const DAY = 86_400_000;

describe('school codes (Crockford base32)', () => {
  it('typing is forgiving: case, spaces, dashes, O/0, I/L/1', () => {
    expect(normCode('aaaaa-bbbbb ccccc_ddddd')).toBe('AAAAABBBBBCCCCCDDDDD');
    expect(normCode('O0 Il1')).toBe('00111');
    expect(normCode('é ß ü 7')).toBe('7');
  });

  it('a trial key has 20 symbols of the alphabet (100 bits)', () => {
    expect(CODE_LENGTH.trial * 5).toBe(100);
    expect(isTrialKey('aaaaa-bbbbb-ccccc-ddddd')).toBe(true);
    expect(isTrialKey('AAAAA-BBBBB-CCCCC-DDDD')).toBe(false);
    // U is not in the alphabet
    expect(isTrialKey('UUUUU-BBBBB-CCCCC-DDDDD')).toBe(false);
  });

  it('formats in groups', () => {
    expect(formatCode('aaaaabbbbbcccccddddd')).toBe('AAAAA-BBBBB-CCCCC-DDDDD');
    expect(formatCode('abcdefgh', 4)).toBe('ABCD-EFGH');
  });

  it('draws codes uniformly from the 32 symbols', () => {
    const all = Uint8Array.from({ length: 256 }, (_, i) => i);
    const code = newCode(256, () => all);
    expect(code).toHaveLength(256);
    expect(new Set(code).size).toBe(32);
    for (const s of ALPHABET) expect(code.split(s).length - 1).toBe(8);
    expect(newCode(20)).toMatch(/^[0-9A-HJKMNP-TV-Z]{20}$/);
  });

  it('hashes the normalized code, as the SQL test fixture expects', async () => {
    expect(await codeHash('ppppp-qqqqq-rrrrr-sssss')).toBe('f250d1966a76ddd9fcae4a9b7a25de21edb7fc1a94485dbf8f1d91551b9f9bf7');
    expect(await codeHash('PPPPPQQQQQRRRRRSSSSS')).toBe(await codeHash('ppppp qqqqq rrrrr sssss'));
  });

  it('the server normalizes the same way (school.norm_code)', () => {
    expect(migration).toContain("translate(upper(regexp_replace(coalesce(p_code, ''), '[^0-9A-Za-z]', '', 'g')), 'OIL', '011')");
  });
});

describe('school logos', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"/></defs><rect fill="url(#g)" width="10" height="10"/><use href="#g"/></svg>';

  it('accepts a plain SVG and a PNG', () => {
    const s = logoDataUrl(enc(svg));
    expect(s.ok && s.url.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const p = logoDataUrl(png);
    expect(p.ok && p.url.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('refuses scripts, handlers, embedded documents and external references', () => {
    const bad = [
      '<svg><script>alert(1)</script></svg>',
      '<svg onload="alert(1)"></svg>',
      '<svg><foreignObject><div/></foreignObject></svg>',
      '<svg><image href="https://evil.test/x.png"/></svg>',
      '<svg><a href="https://evil.test">x</a></svg>',
      '<svg><use xlink:href="other.svg#a"/></svg>',
      '<svg><rect fill="url(https://evil.test/p.svg#a)"/></svg>',
      '<svg><style>@import "https://evil.test/a.css";</style></svg>',
      '<!DOCTYPE svg [<!ENTITY a "b">]><svg></svg>',
      '<svg><a href="javascript:alert(1)">x</a></svg>',
      '<svg><set attributeName="href" to="https://evil.test"/></svg>',
      '<html><body>no svg</body></html>',
    ];
    for (const b of bad) expect(svgProblem(b), b).not.toBeNull();
    expect(svgProblem(svg)).toBeNull();
  });

  it('refuses a file over 150 kB', () => {
    const r = logoDataUrl(enc(`<svg>${' '.repeat(LOGO_MAX)}</svg>`));
    expect(r.ok).toBe(false);
  });

  it('the app checks the data URL again before showing it', () => {
    const r = logoDataUrl(enc(svg));
    if (!r.ok) throw new Error('svg refused');
    expect(safeLogo(r.url)).toBe(r.url);
    expect(safeLogo(`data:image/svg+xml;base64,${btoa('<svg><script>x</script></svg>')}`)).toBeNull();
    expect(safeLogo(`data:image/png;base64,${btoa('<svg></svg>')}`)).toBeNull();
    expect(safeLogo('data:text/html;base64,PGgxPng8L2gxPg==')).toBeNull();
    expect(safeLogo('https://evil.test/logo.svg')).toBeNull();
    expect(safeLogo(42)).toBeNull();
  });
});

describe('school trial', () => {
  const now = Date.parse('2026-11-20T10:00:00Z');
  const row = { state: 'active', school_name: 'Lycée Test', logo: null, accent: '#3366FF', start_route: '#/learn/riemann', ends_at: '2026-12-01T10:00:00Z', server_now: '2026-11-20T10:00:30Z' };

  it('reads the key in the address and removes it', () => {
    expect(keyFromSearch('?essai=aaaaa-bbbbb-ccccc-ddddd')).toBe('AAAAABBBBBCCCCCDDDDD');
    expect(keyFromSearch('?x=1')).toBeNull();
    expect(keyFromSearch('?essai=')).toBeNull();
    expect(keyFromSearch(`?essai=${'A'.repeat(65)}`)).toBeNull();
    expect(withoutKey('file:///C:/v3ct0r/index.html?essai=ABC#/learn')).toBe('file:///C:/v3ct0r/index.html#/learn');
    expect(withoutKey('https://jul3zzz.github.io/v3ct0r/?essai=ABC&x=1')).toBe('https://jul3zzz.github.io/v3ct0r/?x=1');
  });

  it('keeps what the server says, checked', () => {
    const r = fromRow('aaaaa-bbbbb-ccccc-ddddd', row, now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.info).toEqual({ key: 'AAAAABBBBBCCCCCDDDDD', school: 'Lycée Test', logo: null, accent: '#3366ff', start: '#/learn/riemann', endsAt: Date.parse('2026-12-01T10:00:00Z'), state: 'active', skew: 30_000, checkedAt: now, kind: 'trial', source: 'code', seats: 0, seatsUsed: 0 });
    expect(parseTrial(JSON.parse(JSON.stringify(r.info)))).toEqual(r.info);
  });

  it('refuses unknown keys, a busy server and odd answers', () => {
    expect(fromRow('X', { state: 'unknown' }, now)).toEqual({ ok: false, reason: 'unknown' });
    expect(fromRow('X', { state: 'busy' }, now)).toEqual({ ok: false, reason: 'busy' });
    expect(fromRow('X', { ...row, state: 'maybe' }, now)).toEqual({ ok: false, reason: 'invalid' });
    expect(fromRow('X', { ...row, ends_at: null }, now)).toEqual({ ok: false, reason: 'invalid' });
    expect(fromRow('X', null, now)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('a bad accent, route or logo falls back to the defaults', () => {
    const r = fromRow('X', { ...row, accent: 'red', start_route: 'javascript:alert(1)', logo: 'https://evil.test/a.svg' }, now);
    expect(r.ok && [r.info.accent, r.info.start, r.info.logo]).toEqual(['#ffffff', '', null]);
  });

  it('a damaged cache is dropped', () => {
    expect(parseTrial(null)).toBeNull();
    expect(parseTrial({ key: 'AAAA', school: 'X' })).toBeNull();
    const r = fromRow('X', row, now);
    if (!r.ok) throw new Error();
    expect(parseTrial({ ...r.info, accent: 'url(x)' })).toBeNull();
    expect(parseTrial({ ...r.info, state: 'forever' })).toBeNull();
    expect(parseTrial({ ...r.info, logo: '<svg onload=x>' })?.logo).toBeNull();
  });

  it('ends at the end date, in server time', () => {
    const t: TrialInfo = { key: 'A', school: 'X', logo: null, accent: '#ffffff', start: '', endsAt: now + 2 * DAY, state: 'active', skew: 0, checkedAt: now, kind: 'trial', source: 'code', seats: 0, seatsUsed: 0 };
    expect(trialState(t, now)).toBe('active');
    expect(trialState(t, now + 2 * DAY)).toBe('expired');
    // this device is an hour late: the server's clock decides
    expect(trialState({ ...t, skew: 3_600_000 }, now + 2 * DAY - 1_800_000)).toBe('expired');
    expect(trialState({ ...t, state: 'disabled' }, now)).toBe('disabled');
    expect(trialState({ ...t, state: 'expired' }, now)).toBe('expired');
    expect(daysLeft(t, now)).toBe(2);
    expect(daysLeft(t, now + DAY + 1)).toBe(1);
    expect(daysLeft(t, now + 3 * DAY)).toBe(0);
  });

  it('opens only on a route the app knows', () => {
    const known = { views: ['4d/polytopes'], courses: ['riemann'] };
    expect(validRoute('#/learn/riemann', known)).toBe('#/learn/riemann');
    expect(validRoute('#/learn', known)).toBe('#/learn');
    expect(validRoute('#/learn/nope', known)).toBe('');
    expect(validRoute('#/4d/polytopes', known)).toBe('#/4d/polytopes');
    expect(validRoute('#/4d/nope', known)).toBe('');
    expect(validRoute('#/atlas/integrals', known)).toBe('#/atlas/integrals');
    expect(validRoute('', known)).toBe('');
    expect(validRoute('javascript:alert(1)', known)).toBe('');
  });

  it('writes on the accent in black or white, whichever reads best', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(accentInk('#ffffff')).toBe('#000000');
    expect(accentInk('#000000')).toBe('#ffffff');
    expect(accentInk('#ffcc00')).toBe('#000000');
    expect(accentInk('#3366ff')).toBe('#ffffff');
  });

  it('counts the time spent: visible, someone there, gaps capped', () => {
    let c = newClock(0);
    c = advance(c, 30_000);
    expect(c.pending).toBe(30);
    // nobody for more than 5 minutes: no longer counted
    c = advance(c, 30_000 + IDLE_MS);
    const idle = c.pending;
    c = advance(c, 40_000 + IDLE_MS);
    expect(c.pending).toBe(idle);
    // someone is back
    c = input(c, 50_000 + IDLE_MS);
    c = advance(c, 60_000 + IDLE_MS);
    expect(c.pending).toBe(idle + 10);
    // hidden: nothing counts; a long sleep counts one minute at most
    c = visibility(c, 60_000 + IDLE_MS, false);
    c = advance(c, 120_000 + IDLE_MS);
    expect(c.pending).toBe(idle + 10);
    c = visibility(c, 120_000 + IDLE_MS, true);
    c = advance(c, 120_000 + IDLE_MS + 4 * 60_000);
    expect(c.pending).toBe(idle + 10 + 60);
  });

  it('sends whole seconds, at most what the server accepts per ping', () => {
    const { seconds, clock } = take({ ...newClock(0), pending: 1000.5 });
    expect(seconds).toBe(PING_MAX);
    expect(clock.pending).toBeCloseTo(100.5, 5);
  });
});
