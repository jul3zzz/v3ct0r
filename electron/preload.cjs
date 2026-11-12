// V3CT0R desktop app: hands the page the licence of this PC and its device id (read by main.cjs from
// %ProgramData%\V3CT0R\licence.json and the Windows registry), as window.v3ct0rDesktop, read only.
// Sandboxed, with context isolation: the page gets these two strings and nothing else from Node.
const { contextBridge } = require('electron');

const ARG = '--v3ct0r-desktop=';
let data = {};
try {
  const a = process.argv.find((x) => x.startsWith(ARG));
  if (a) data = JSON.parse(decodeURIComponent(a.slice(ARG.length)));
} catch {
  data = {};
}
const machineKey = typeof data.machineKey === 'string' && data.machineKey.length <= 64 ? data.machineKey : null;
const device = typeof data.device === 'string' && /^[0-9a-f]{64}$/.test(data.device) ? data.device : null;

contextBridge.exposeInMainWorld('v3ct0rDesktop', Object.freeze({ machineKey, device }));
