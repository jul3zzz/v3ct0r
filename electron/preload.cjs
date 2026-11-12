// V3CT0R desktop apps: hands the page what main.cjs read once per launch, as window.v3ct0rDesktop:
//   - edition: 'standard' (V3CT0R) or 'lycee' (V3CT0R Lycée);
//   - V3CT0R Lycée only: the licence of this PC (%ProgramData%\V3CT0R\licence.json), its device id, the key of
//     the v3ct0r-lycee:// link it was opened with, and onLinkKey(cb) for a link that comes while it runs.
// Sandboxed, with context isolation: the page gets these strings and one listener, nothing else from Node.
const { contextBridge, ipcRenderer } = require('electron');

const ARG = '--v3ct0r-desktop=';
let data = {};
try {
  const a = process.argv.find((x) => x.startsWith(ARG));
  if (a) data = JSON.parse(decodeURIComponent(a.slice(ARG.length)));
} catch {
  data = {};
}
const key = (k) => (typeof k === 'string' && k.length <= 64 && /^[0-9A-Za-z-]+$/.test(k) ? k : null);
const edition = data.edition === 'lycee' ? 'lycee' : 'standard';
const machineKey = typeof data.machineKey === 'string' && data.machineKey.length <= 64 ? data.machineKey : null;
const device = typeof data.device === 'string' && /^[0-9a-f]{64}$/.test(data.device) ? data.device : null;
const linkKey = key(data.linkKey);

contextBridge.exposeInMainWorld('v3ct0rDesktop', {
  edition,
  machineKey,
  device,
  linkKey,
  /** a v3ct0r-lycee:// link opened while the app runs */
  onLinkKey: (cb) => {
    if (typeof cb !== 'function') return;
    ipcRenderer.on('v3ct0r:link-key', (_e, k) => {
      const v = key(k);
      if (v) cb(v);
    });
  },
});
