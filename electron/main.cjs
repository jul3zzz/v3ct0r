// V3CT0R desktop app (Windows): the same single-file build as the website (dist/index.html and
// the course voices in dist/courses/), opened in its own window from the disk. No server, works
// offline; only the account (Supabase) uses the network. Packaged by electron-builder
// (electron-builder.yml) into an installer that puts V3CT0R on the desktop and in the Start menu.
const { app, BrowserWindow, Menu, shell, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const INDEX = path.join(__dirname, '..', 'dist', 'index.html');
const ICON = path.join(__dirname, '..', 'build', 'icon.ico');
const external = (url) => /^https?:\/\//i.test(url);

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
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
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
