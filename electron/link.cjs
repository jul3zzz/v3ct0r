// V3CT0R Lycée: the link the website gives once the app is installed, v3ct0r-lycee://cle/<KEY>, hands the
// app a school key without typing it (src/core/edition.ts writes it). Any website can open such a link:
// only a key comes out of it (Crockford base32 and dashes, 8 to 64 characters), checked by the server
// afterwards. Pure, no Electron: required by main.cjs, tested in tests/edition.test.ts.
const SCHEME = 'v3ct0r-lycee';

/** v3ct0r-lycee://cle/AAAAA-BBBBB-… → the key, else null */
function keyFromLink(url) {
  if (typeof url !== 'string' || url.length > 200) return null;
  const m = /^v3ct0r-lycee:\/\/cle\/([0-9A-Za-z-]{8,64})\/?$/i.exec(url.trim());
  return m ? m[1] : null;
}

/** the link among the arguments of a launch (Windows passes it as one argument) */
function keyFromArgs(argv) {
  if (!Array.isArray(argv)) return null;
  for (const a of argv) {
    const k = keyFromLink(a);
    if (k) return k;
  }
  return null;
}

module.exports = { SCHEME, keyFromLink, keyFromArgs };
