// The installation kit of a school licence (docs/ECOLES.md, phase 1b; docs/DEPLOIEMENT.md): the files
// the school's technician runs to put V3CT0R Lycée (the app of schools) on every PC at once, each PC unlocked for all its Windows
// accounts by %ProgramData%\V3CT0R\licence.json (read by electron/main.cjs). Written by
// `npm run school -- licence --kit` next to the MSI of the latest release. Pure, no DOM, imports with
// `.ts`: shared with tools/school.ts, tested in tests/school-licence.test.ts.
import { formatCode } from './codes.ts';

export const MSI_NAME = 'V3CT0R-Lycee.msi';
export const MSI_URL = `https://github.com/jul3zzz/v3ct0r/releases/latest/download/${MSI_NAME}`;
/** where the desktop app reads the licence of the PC (every Windows account) */
export const LICENCE_PATH = '%ProgramData%\\V3CT0R\\licence.json';

export interface KitInput {
  /** the licence key, in clear (it has to be on the PCs) */
  key: string;
  school: string;
  seats: number;
  /** end of the licence (epoch ms) */
  endsAt: number;
  /** the server the PCs talk to (host of VITE_SUPABASE_URL) */
  server: string;
  /** who the school writes to (VITE_CONTACT_EMAIL), '' when unknown */
  contact: string;
}

/** Windows files: CRLF line ends; the .cmd files stay in ASCII (cmd.exe reads them in the OEM code page) */
const crlf = (lines: string[]): string => `${lines.join('\r\n')}\r\n`;
const ascii = (s: string): string => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[^\x20-\x7e]/g, '?');

const date = (ms: number): string => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** file name → content, for every file of the kit except the MSI itself */
export function kitFiles(k: KitInput): Record<string, string> {
  const key = formatCode(k.key);
  const licence = `${JSON.stringify({ key, school: k.school }, null, 2)}\n`;

  const install = crlf([
    '@echo off',
    'rem V3CT0R: installation on this PC, for every Windows account (run as administrator).',
    'rem Silent: msiexec /qn, then the licence of the school in %ProgramData%\\V3CT0R (read only for users).',
    'setlocal',
    'net session >nul 2>&1',
    'if errorlevel 1 (',
    "  echo Ce script doit etre lance en administrateur : clic droit, Executer en tant qu'administrateur.",
    '  exit /b 1',
    ')',
    'set "HERE=%~dp0"',
    `if not exist "%HERE%${MSI_NAME}" (`,
    `  echo ${MSI_NAME} manque a cote de ce script : voir LISEZ-MOI.txt.`,
    '  exit /b 1',
    ')',
    `msiexec /i "%HERE%${MSI_NAME}" /qn /norestart /l*v "%TEMP%\\v3ct0r-install.log"`,
    'set "RC=%ERRORLEVEL%"',
    'if not "%RC%"=="0" if not "%RC%"=="3010" if not "%RC%"=="1641" (',
    '  echo Echec de l\'installation, code %RC% : journal dans %TEMP%\\v3ct0r-install.log',
    '  exit /b %RC%',
    ')',
    'if not exist "%ProgramData%\\V3CT0R" mkdir "%ProgramData%\\V3CT0R"',
    'copy /y "%HERE%licence.json" "%ProgramData%\\V3CT0R\\licence.json" >nul',
    'if errorlevel 1 (',
    '  echo Impossible de copier licence.json dans %ProgramData%\\V3CT0R.',
    '  exit /b 1',
    ')',
    'rem SYSTEM and Administrators: full control; Users: read (SIDs: the same on every language of Windows)',
    'icacls "%ProgramData%\\V3CT0R\\licence.json" /inheritance:r /grant:r *S-1-5-18:F *S-1-5-32-544:F *S-1-5-32-545:R >nul',
    `echo ${ascii(`V3CT0R Lycée est installé pour tous les utilisateurs de ce poste (licence ${k.school}).`)}`,
    'exit /b 0',
  ]);

  const uninstall = crlf([
    '@echo off',
    'rem V3CT0R: removal from this PC (run as administrator). The progress kept in each Windows profile stays.',
    'setlocal',
    'net session >nul 2>&1',
    'if errorlevel 1 (',
    "  echo Ce script doit etre lance en administrateur : clic droit, Executer en tant qu'administrateur.",
    '  exit /b 1',
    ')',
    'set "HERE=%~dp0"',
    `msiexec /x "%HERE%${MSI_NAME}" /qn /norestart`,
    'if exist "%ProgramData%\\V3CT0R\\licence.json" del /f /q "%ProgramData%\\V3CT0R\\licence.json"',
    'echo V3CT0R Lycee est desinstalle de ce poste.',
    'exit /b 0',
  ]);

  const contact = k.contact ? `Une question : ${k.contact}.` : 'Une question : la personne qui vous a envoyé ce kit.';
  const readme = crlf([
    `V3CT0R Lycée · licence ${k.school}`,
    '='.repeat(Math.min(72, 18 + k.school.length)),
    '',
    `Licence : ${k.seats} poste${k.seats > 1 ? 's' : ''}, jusqu’au ${date(k.endsAt)}.`,
    'Ce kit installe V3CT0R Lycée (l’app des établissements) sur les PC, déjà débloquée pour tous les comptes Windows du poste :',
    'personne n’a de code à saisir.',
    contact,
    '',
    'CONTENU',
    `  ${MSI_NAME}     V3CT0R Lycée (Windows 10 ou 11, 64 bits), installée pour tout le poste`,
    '  licence.json         la clé de la licence, copiée dans %ProgramData%\\V3CT0R',
    '  installer.cmd        installation silencieuse (MSI puis licence.json), à lancer en administrateur',
    '  desinstaller.cmd     désinstallation',
    '',
    `Si ${MSI_NAME} manque : le télécharger depuis ${MSI_URL}`,
    'et le poser à côté de installer.cmd.',
    '',
    'AVANT DE COMMENCER',
    `  - Le pare-feu ou le proxy de l’établissement doit autoriser https://${k.server} (port 443).`,
    '    Chaque poste y vérifie la licence à sa première ouverture, puis s’ouvre aussi hors ligne.',
    '  - Les droits d’administrateur sont nécessaires (installation pour tout le poste).',
    '',
    'INSTALLER : TROIS FAÇONS',
    '  A. Poste par poste',
    '     Copier le dossier du kit sur le poste (ou sur un partage), clic droit sur installer.cmd,',
    '     « Exécuter en tant qu’administrateur ».',
    '  B. Stratégie de groupe (domaine Active Directory)',
    '     1. Copier le kit sur un partage lisible par les ordinateurs (ex. \\\\serveur\\logiciels\\v3ct0r).',
    '     2. Configuration ordinateur > Stratégies > Paramètres du logiciel > Installation de logiciel :',
    `        nouveau package \\\\serveur\\logiciels\\v3ct0r\\${MSI_NAME}, mode « Attribué ».`,
    '     3. Configuration ordinateur > Préférences > Paramètres Windows > Fichiers : nouveau fichier,',
    '        source \\\\serveur\\logiciels\\v3ct0r\\licence.json, destination',
    '        C:\\ProgramData\\V3CT0R\\licence.json, action « Remplacer ».',
    '     4. Redémarrer les postes (l’installation se fait au démarrage).',
    '  C. Intune, PDQ Deploy, SCCM ou équivalent',
    '     Déployer le dossier du kit comme application Win32 (contexte système) :',
    '       installation    installer.cmd',
    '       désinstallation desinstaller.cmd',
    '       détection       le fichier C:\\ProgramData\\V3CT0R\\licence.json existe',
    '     Installation silencieuse seule du MSI : msiexec /i V3CT0R-Lycee.msi /qn /norestart',
    '',
    'VÉRIFIER',
    '  Ouvrir V3CT0R Lycée (bureau ou menu Démarrer) avec un compte élève : la barre du haut montre le logo de',
    `  l’établissement et LICENCE, et rien n’est verrouillé. Si un écran parle du serveur, revoir le pare-feu.`,
    '',
    'BON À SAVOIR',
    `  - Postes : la licence compte ${k.seats} PC au plus. Un PC compte une fois, quel que soit le compte Windows.`,
    '    Au-delà, le PC affiche « toutes les places de la licence sont prises » : écrire au contact ci-dessus,',
    '    qui peut libérer les postes remplacés.',
    '  - Mise à jour : installer le MSI d’une version plus récente par-dessus (même méthode), licence.json reste.',
    '  - La progression des élèves est gardée dans leur profil Windows. Si les profils sont effacés à chaque',
    '    déconnexion, elle repart de zéro à chaque session.',
    '  - Aucune donnée personnelle : le serveur reçoit la clé, une empreinte anonyme du poste, le nombre',
    '    d’ouvertures et le temps d’utilisation.',
    '  - La clé est lisible sur les postes. Si elle est copiée hors de l’établissement, une nouvelle clé',
    '    (nouveau kit) remplace l’ancienne, qui s’arrête.',
  ]);

  return {
    'licence.json': licence,
    'installer.cmd': install,
    'desinstaller.cmd': uninstall,
    // a BOM: the Notepad of older Windows reads it as UTF-8
    'LISEZ-MOI.txt': `\ufeff${readme}`,
  };
}

