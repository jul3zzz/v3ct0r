// School licence (docs/ECOLES.md, phase 1b): kinds and seats in what the server says, the words of the
// app, the notice of the last days, device ids, the installation kit and its guide.
import { describe, expect, it } from 'vitest';
import { WARN_DAYS, dayStamp, endedWords, fromRow, isDevice, keyLabel, newDevice, parseTrial, seatsLine, trialState, warnToday, type TrialInfo, type TrialRow } from '../src/school/trial';
import { LICENCE_PATH, MSI_NAME, MSI_URL, kitFiles } from '../src/school/kit';
import { welcomeSteps } from '../src/shell/welcome-steps';

const raw = (glob: Record<string, string>) => Object.values(glob)[0] ?? '';
const DEPLOY = raw(import.meta.glob('../docs/DEPLOIEMENT.md', { eager: true, query: '?raw', import: 'default' }));
const SQL = raw(import.meta.glob('../supabase/migrations/*_school_licence.sql', { eager: true, query: '?raw', import: 'default' }));

const DAY = 86_400_000;
const now = Date.parse('2026-11-12T10:00:00Z');
const row: TrialRow = { state: 'active', kind: 'licence', school_name: 'Lycée Test', logo: null, accent: '#118844', start_route: '#/learn', ends_at: '2027-08-31T00:00:00Z', seats: 30, seats_used: 12, server_now: '2026-11-12T10:00:00Z' };
const licence = (): TrialInfo => {
  const r = fromRow('aaaaa-bbbbb-ccccc-ddddd', row, now, 'machine');
  if (!r.ok) throw new Error('row refused');
  return r.info;
};

describe('licence keys', () => {
  it('keeps the kind, the seats and where the key came from', () => {
    const t = licence();
    expect([t.kind, t.source, t.seats, t.seatsUsed]).toEqual(['licence', 'machine', 30, 12]);
    expect(parseTrial(JSON.parse(JSON.stringify(t)))).toEqual(t);
  });

  it('a phase 1 answer or cache is a typed trial', () => {
    const { kind: _k, seats: _s, seats_used: _u, ...old } = row;
    const r = fromRow('X', old, now);
    expect(r.ok && [r.info.kind, r.info.source, r.info.seats]).toEqual(['trial', 'code', 0]);
    const t = licence();
    const { kind: _a, source: _b, seats: _c, seatsUsed: _d, ...cache } = t;
    expect(parseTrial(cache)).toMatchObject({ kind: 'trial', source: 'code', seats: 0, seatsUsed: 0 });
  });

  it('every seat taken is a state of its own, kept and blocking', () => {
    const r = fromRow('X', { ...row, state: 'full' }, now);
    expect(r.ok && r.info.state).toBe('full');
    if (!r.ok) return;
    expect(trialState(r.info, now)).toBe('full');
    expect(parseTrial(JSON.parse(JSON.stringify(r.info)))?.state).toBe('full');
  });

  it('odd seat numbers fall back to none', () => {
    const r = fromRow('X', { ...row, seats: -3, seats_used: 1.5 }, now);
    expect(r.ok && [r.info.seats, r.info.seatsUsed]).toEqual([0, 0]);
  });
});

describe('words of a key', () => {
  it('ESSAI or LICENCE, with the end and the days left', () => {
    const t = licence();
    expect(keyLabel(t, now)).toMatchObject({ badge: 'LICENCE', noun: 'licence', short: 'LICENCE' });
    expect(keyLabel(t, now).until).toMatch(/^jusqu’au 31 août 2027 \(encore \d+ jours\)$/);
    expect(keyLabel(t, t.endsAt - 3 * DAY).short).toBe('LICENCE · J-3');
    const trial: TrialInfo = { ...t, kind: 'trial', endsAt: now + 21 * DAY };
    expect(keyLabel(trial, now)).toMatchObject({ badge: 'ESSAI', short: 'ESSAI · J-21' });
    expect(keyLabel({ ...trial, endsAt: now + DAY - 1 }, now).until).toBe(`jusqu’au ${new Date(now + DAY - 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} (encore 1 jour)`);
  });

  it('seats only for a licence that has some', () => {
    expect(seatsLine(licence())).toBe('12 / 30 postes');
    expect(seatsLine({ ...licence(), seats: 1, seatsUsed: 1 })).toBe('1 / 1 poste');
    expect(seatsLine({ ...licence(), kind: 'trial', seats: 0 })).toBe('');
  });

  it('the end screens say what happened, in the right gender', () => {
    const t = licence();
    expect(endedWords(t, 'expired')).toMatchObject({ k: 'V3CT0R · LICENCE TERMINÉE', title: 'La licence de Lycée Test est terminée' });
    expect(endedWords(t, 'disabled')).toMatchObject({ k: 'V3CT0R · LICENCE ARRÊTÉE', title: 'La licence de Lycée Test est arrêtée' });
    expect(endedWords({ ...t, kind: 'trial' }, 'expired')).toMatchObject({ k: 'V3CT0R · ESSAI TERMINÉ', title: 'L’essai de Lycée Test est terminé' });
    expect(endedWords({ ...t, kind: 'trial' }, 'disabled').title).toBe('L’essai de Lycée Test est arrêté');
    const full = endedWords(t, 'full');
    expect(full.k).toBe('V3CT0R · POSTES COMPLETS');
    expect(full.text).toContain('30 postes');
  });
});

describe('notice of the last days', () => {
  const t = { ...licence(), endsAt: now + 5 * DAY };
  it(`once a day, in the last ${WARN_DAYS} days only`, () => {
    expect(warnToday(t, now, null)).toBe(5);
    expect(warnToday(t, now, dayStamp(now))).toBeNull();
    expect(warnToday(t, now + DAY, dayStamp(now))).toBe(4);
    expect(warnToday({ ...t, endsAt: now + 20 * DAY }, now, null)).toBeNull();
  });
  it('nothing once the key no longer runs', () => {
    expect(warnToday({ ...t, state: 'disabled' }, now, null)).toBeNull();
    expect(warnToday(t, now + 6 * DAY, null)).toBeNull();
  });
});

describe('device ids', () => {
  it('32 random bytes in lower-case hex, as the server takes them', () => {
    const d = newDevice((n) => Uint8Array.from({ length: n }, (_, i) => i * 7));
    expect(d).toHaveLength(64);
    expect(isDevice(d)).toBe(true);
    expect(d.startsWith('00070e15')).toBe(true);
    expect(isDevice(d.toUpperCase())).toBe(false);
    expect(isDevice('abc')).toBe(false);
    expect(isDevice(null)).toBe(false);
  });
  it('the server checks the same shape', () => {
    expect(SQL).toContain("p_device !~ '^[0-9a-f]{64}$'");
  });
});

describe('way in with the licence of the PC', () => {
  const base = { online: false, answered: false, configured: true, signedIn: false, skip: false, installed: false };
  it('checked first and alone, even in end-to-end runs', () => {
    expect(welcomeSteps({ ...base, trial: 'machine' })).toEqual(['machine']);
    expect(welcomeSteps({ ...base, skip: true, trial: 'machine' })).toEqual(['machine']);
    expect(welcomeSteps({ ...base, online: true, trial: 'machine' })).toEqual(['machine']);
  });
  it('nothing without accounts in the build', () => {
    expect(welcomeSteps({ ...base, configured: false, trial: 'machine' })).toEqual([]);
  });
});

describe('installation kit', () => {
  const files = kitFiles({ key: 'aaaaabbbbbcccccddddd', school: 'Lycée Émile-Zola', seats: 30, endsAt: Date.parse('2027-08-31T12:00:00Z'), server: 'dpefjnxejkapgchgcrco.supabase.co', contact: 'contact@v3ct0r.invalid' });

  it('four files, the MSI comes from the release', () => {
    expect(Object.keys(files).sort()).toEqual(['LISEZ-MOI.txt', 'desinstaller.cmd', 'installer.cmd', 'licence.json']);
    expect(MSI_URL).toBe('https://github.com/jul3zzz/v3ct0r/releases/latest/download/V3CT0R-Ecole.msi');
  });

  it('licence.json holds the key the desktop app reads', () => {
    expect(JSON.parse(files['licence.json'])).toEqual({ key: 'AAAAA-BBBBB-CCCCC-DDDDD', school: 'Lycée Émile-Zola' });
    expect(LICENCE_PATH).toBe('%ProgramData%\\V3CT0R\\licence.json');
  });

  it('installer.cmd: administrator, silent MSI, the licence for every account, read only for users', () => {
    const c = files['installer.cmd'];
    expect(c).toContain('net session >nul 2>&1');
    expect(c).toContain(`msiexec /i "%HERE%${MSI_NAME}" /qn /norestart`);
    expect(c).toContain('copy /y "%HERE%licence.json" "%ProgramData%\\V3CT0R\\licence.json"');
    expect(c).toContain('*S-1-5-32-545:R');
    expect(c).toContain('if not "%RC%"=="0" if not "%RC%"=="3010" if not "%RC%"=="1641"');
  });

  it('the .cmd files are ASCII with CRLF line ends (cmd.exe)', () => {
    for (const f of ['installer.cmd', 'desinstaller.cmd']) {
      // eslint-disable-next-line no-control-regex
      expect(/^[\x20-\x7e\r\n]*$/.test(files[f])).toBe(true);
      expect(files[f].split('\r\n').length).toBeGreaterThan(5);
      expect(/[^\r]\n/.test(files[f])).toBe(false);
    }
    expect(files['installer.cmd']).toContain('V3CT0R est installe pour tous les utilisateurs de ce poste (licence Lycee Emile-Zola).');
  });

  it('LISEZ-MOI.txt: the three ways, the server to allow, the seats and the end', () => {
    const t = files['LISEZ-MOI.txt'];
    expect(t.startsWith('\ufeff')).toBe(true);
    for (const s of ['https://dpefjnxejkapgchgcrco.supabase.co (port 443)', 'Installation de logiciel', 'Préférences > Paramètres Windows > Fichiers', 'Intune', 'msiexec /i V3CT0R-Ecole.msi /qn /norestart', '30 postes, jusqu’au 31 août 2027', 'contact@v3ct0r.invalid', 'C:\\ProgramData\\V3CT0R\\licence.json'])
      expect(t).toContain(s);
  });

  it('docs/DEPLOIEMENT.md says the same as the kit', () => {
    for (const s of ['msiexec /i V3CT0R-Ecole.msi /qn /norestart', 'C:\\ProgramData\\V3CT0R\\licence.json', 'installer.cmd', 'desinstaller.cmd', 'Installation de logiciel', 'Intune', 'supabase.co', 'port 443'])
      expect(DEPLOY).toContain(s);
  });
});
