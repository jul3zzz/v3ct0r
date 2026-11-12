// V3CT0R service worker: the website installed on a phone (PWA) opens without internet. Written to dist/sw.js
// by vite.config.ts (pwa plugin), which fills in the version and the list of files; registered by src/shell/pwa.ts
// over http(s) only. The page: network first (a new version as soon as it is online), the kept copy offline.
// Everything else (icons, course voices): the kept copy, sliced for the <audio> range requests.
const CACHE = 'v3ct0r-__VERSION__';
const FILES = __FILES__;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('v3ct0r-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** the requested bytes of a kept file (an <audio> element asks for ranges) */
async function ranged(req, res) {
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return res;
  const buf = await res.arrayBuffer();
  const start = Math.min(Number(m[1]), Math.max(0, buf.byteLength - 1));
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // the account sync (Supabase) and every other site go to the network, untouched
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) await (await caches.open(CACHE)).put('./', res.clone());
          return res;
        } catch {
          return (await caches.match('./')) || Response.error();
        }
      })(),
    );
    return;
  }
  e.respondWith(
    (async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return req.headers.has('range') ? ranged(req, hit) : hit;
      return fetch(req);
    })(),
  );
});
