// V3CT0R desktop app (Windows): the same single-file build as the website (dist/index.html and
// the course voices in dist/courses/), opened in its own window from the disk. No server, works
// offline; only the account (Supabase) uses the network. Packaged by electron-builder
// (electron-builder.yml) into an installer that puts V3CT0R on the desktop and in the Start menu
// (V3CT0R-Setup.exe, for one person) and into an MSI for every account of a PC (V3CT0R-Ecole.msi,
// for schools: docs/DEPLOIEMENT.md). A school's installation kit sets its licence on the PC in
// %ProgramData%\V3CT0R\licence.json: read here, with a pseudonymous id of the PC for the seats of the
// licence, and handed to the page by preload.cjs (window.v3ct0rDesktop).
const { app, BrowserWindow, Menu, shell, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const INDEX = path.join(__dirname, '..', 'dist', 'index.html');
const ICON = path.join(__dirname, '..', 'build', 'icon.ico');
const external = (url) => /^https?:\/\//i.test(url);

/** the licence key of this PC (null: none). V3CT0R_LICENCE_FILE points elsewhere for tests. */
function machineKey() {
  const file = process.env.V3CT0R_LICENCE_FILE || path.join(process.env.ProgramData || 'C:\\ProgramData', 'V3CT0R', 'licence.json');
  try {
    const v = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    return typeof v.key === 'string' && v.key.length <= 64 ? v.key : null;
  } catch {
    return null;
  }
}

/** one id per PC, whatever the Windows account: sha256 of the MachineGuid with an app prefix (the
 *  MachineGuid itself never leaves the PC). null outside Windows or when the registry cannot be read. */
function machineDevice() {
  if (process.platform !== 'win32') return null;
  try {
    const out = execFileSync('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], { encoding: 'utf8', windowsHide: true, timeout: 3000 });
    const m = /MachineGuid\s+REG_SZ\s+([0-9a-fA-F-]{36})/.exec(out);
    return m ? crypto.createHash('sha256').update(`v3ct0r:${m[1].toLowerCase()}`).digest('hex') : null;
  } catch {
    return null;
  }
}

/** what preload.cjs gives the page, read once per launch */
const DESKTOP = encodeURIComponent(JSON.stringify({ machineKey: machineKey(), device: machineDevice() }));

// one window: a second launch brings the first one back
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 940,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#000000',
    title: 'V3CT0R',
    icon: ICON,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: [`--v3ct0r-desktop=${DESKTOP}`],
    },
  });
  win.once('ready-to-show', () => win.show());
  // links (videos, GitHub, sources) open in the usual browser; the app never leaves its page
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (external(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (external(url)) {
      e.preventDefault();
      void shell.openExternal(url);
    }
  });
  win.on('closed', () => (win = null));
  void win.loadFile(INDEX);
}

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

/** a free name in the folder: « v3ct0r.png », then « v3ct0r (1).png »… */
function freePath(dir, name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  let p = path.join(dir, name);
  for (let i = 1; fs.existsSync(p); i++) p = path.join(dir, `${base} (${i})${ext}`);
  return p;
}

app.whenReady().then(() => {
  // the app has its own keys (Ctrl+K, F, Échap…): no menu bar
  Menu.setApplicationMenu(null);
  // PNG, WebM, exported notes: straight into Downloads, like a browser (no save dialog)
  session.defaultSession.on('will-download', (_e, item) => item.setSavePath(freePath(app.getPath('downloads'), item.getFilename())));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
