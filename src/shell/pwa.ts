// The website as an installable app (PWA): the manifest (icons, full screen) and the service worker that keeps
// every file for offline use (dist/sw.js, written by vite.config.ts). Only over http(s): the downloaded zip and the
// desktop app open index.html in file://, where neither exists (and a manifest link would log an error).

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();

export const onWeb = (): boolean => location.protocol === 'https:' || location.protocol === 'http:';

/** opened from the home screen icon (installed app), not in a browser tab */
export const installedApp = (): boolean => matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function setupPwa(): void {
  if (!onWeb()) return;
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = 'manifest.webmanifest';
  // the iPhone / iPad home screen reads its icon from this link (public/icons, npm run icons)
  const apple = document.createElement('link');
  apple.rel = 'apple-touch-icon';
  apple.href = 'icons/apple-touch-icon.png';
  document.head.append(link, apple);
  // Chrome (Android, desktop): its own install prompt, kept for the INSTALLER button of the tutorial
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    listeners.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((f) => f());
  });
  if ('serviceWorker' in navigator && !import.meta.env.DEV) void navigator.serviceWorker.register('sw.js').catch(() => undefined);
}

/** the browser offers its own install prompt (Chrome, Edge, Samsung Internet) */
export const canPrompt = (): boolean => !!deferred;

/** the prompt became available or was used: repaint (returns: stop listening) */
export function onPromptChange(f: () => void): () => void {
  listeners.add(f);
  return () => listeners.delete(f);
}

export async function promptInstall(): Promise<boolean> {
  const d = deferred;
  if (!d) return false;
  deferred = null;
  await d.prompt();
  const c = await d.userChoice;
  listeners.forEach((f) => f());
  return c.outcome === 'accepted';
}
