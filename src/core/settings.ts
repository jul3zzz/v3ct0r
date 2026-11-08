import type { QualitySetting } from './types';

type Handler<T> = (v: T) => void;

/** Minimal typed event emitter. */
export class Emitter<E extends Record<string, unknown>> {
  private map = new Map<keyof E, Set<Handler<any>>>();
  on<K extends keyof E>(k: K, h: Handler<E[K]>): () => void {
    let set = this.map.get(k);
    if (!set) this.map.set(k, (set = new Set()));
    set.add(h);
    return () => set!.delete(h);
  }
  emit<K extends keyof E>(k: K, v: E[K]): void {
    this.map.get(k)?.forEach((h) => h(v));
  }
}

export interface Settings {
  quality: QualitySetting;
  sound: boolean;
  scanlines: boolean;
  /** generative background music (src/core/music.ts) */
  music: boolean;
  musicVolume: number;
}

const KEY = 'vector-math.settings.v1';
const DEFAULTS: Settings = { quality: 'auto', sound: false, scanlines: false, music: true, musicVolume: 0.5 };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Settings>;
      return {
        quality: s.quality === 'low' || s.quality === 'high' || s.quality === 'med' || s.quality === 'auto' ? s.quality : DEFAULTS.quality,
        sound: typeof s.sound === 'boolean' ? s.sound : DEFAULTS.sound,
        scanlines: typeof s.scanlines === 'boolean' ? s.scanlines : DEFAULTS.scanlines,
        music: typeof s.music === 'boolean' ? s.music : DEFAULTS.music,
        musicVolume: typeof s.musicVolume === 'number' && s.musicVolume >= 0 && s.musicVolume <= 1 ? s.musicVolume : DEFAULTS.musicVolume,
      };
    }
  } catch {
    /* storage unavailable: defaults */
  }
  return { ...DEFAULTS };
}

export const settings: Settings = load();

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

const setListeners = new Set<(key: string) => void>();

/** be told when a key is written (the account sync follows the progress keys) */
export const onStoreSet = (fn: (key: string) => void): void => void setListeners.add(fn);

/** Per-viewer persistent key/value (challenge scores…), failure-tolerant. */
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem('vector-math.' + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem('vector-math.' + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    setListeners.forEach((f) => f(key));
  },
};
