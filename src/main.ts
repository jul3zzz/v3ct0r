import './assets/fonts/fonts.css';
import 'katex/dist/katex.min.css';
import './hud/tokens.css';
import './hud/hud.css';
import { App } from './core/app';
import { boot } from './shell/boot';
import { MODULES } from './modules/registry';
import { COURSES, compileCourse } from './learn/courses';

const COURSE_META = (id: string) => COURSES.get(id)?.meta;
import { Soundtrack, soundCues, toWav } from './learn/soundtrack';
import { music } from './core/music';
import { cloud, cloudConfigured } from './core/cloud';

interface LearnState {
  course: string;
  t: number;
  duration: number;
  playing: boolean;
  card: boolean;
  errors: string[];
  objects: number;
  subs: string;
  pauses: number[];
  rate: number;
  cc: boolean;
  /** sound design of the video: on, cues played, cues in total (null: none) */
  sfx: { on: boolean; fired: number; cues: number } | null;
  voice: { key: string; time: number; paused: boolean; failed: number } | null;
}

declare global {
  interface Window {
    __vm?: { views: () => string[]; go: (id: string) => boolean; ready: boolean; tours: () => string[]; tour: (id: string) => void; tourNext: () => void; tourState: () => string; unlockAll: () => void; progress: () => string; answers: () => (number | string)[]; missingLabels: () => string[]; learn: (id?: string, t?: number) => void; learnSeek: (t: number) => void; learnState: () => LearnState; learnSheet: () => void; learnColle: () => void; sfxWav: (id: string, mp3s?: Record<string, string>) => Promise<string>; atlas: (uni?: string) => void; atlasState: () => unknown; atlasApproach: (id: string) => boolean; atlasEnter: () => void; gameState: () => unknown; musicState: () => unknown; calc: (text?: string) => unknown; story: (chapter?: string) => unknown; account: () => unknown };
  }
}

function probeGPU(): { gpu: string; maxTex: number; failure?: string } {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return { gpu: '—', maxTex: 0, failure: 'WEBGL2 INDISPONIBLE — activez l’accélération matérielle du navigateur, puis rechargez.' };
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    let gpu = 'WEBGL2 OK';
    if (info) {
      const raw = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '');
      const m = /ANGLE \([^,]*,\s*([^,(]+)/.exec(raw);
      gpu = (m ? m[1] : raw).trim().toUpperCase().slice(0, 38) || gpu;
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { gpu, maxTex };
  } catch (e) {
    return { gpu: '—', maxTex: 0, failure: `WEBGL2 : ${e instanceof Error ? e.message : String(e)}` };
  }
}

async function main(): Promise<void> {
  const host = document.getElementById('app')!;
  const probe = probeGPU();
  const views = MODULES.reduce((n, m) => n + m.vizs.length, 0);
  let app: App | null = null;
  let failure = probe.failure;
  if (!failure) {
    try {
      app = App.create(host, MODULES);
    } catch (e) {
      console.error(e);
      failure = `INITIALISATION IMPOSSIBLE : ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 400))]);
  await boot({ gpu: probe.gpu, maxTex: probe.maxTex, modules: MODULES.length, views, failure });
  if (!app) return;
  app.start();
  window.__vm = {
    views: () => app!.allViews().map(([m, v]) => `${m.id}/${v.id}`),
    go: (id) => app!.goId(id),
    ready: true,
    tours: () => ['tuto', 'cercle', 'dim4', 'chaos'],
    tour: (id) => app!.startTour(id),
    tourNext: () => app!.tour.next(),
    tourState: () => (app!.tour.active ? `${app!.tour.current!.id}:${app!.tour.index}` : 'off'),
    unlockAll: () => app!.progress.setFree(true),
    progress: () => `${app!.progress.validatedCount}/${app!.progress.total}${app!.progress.free ? ' free' : ''}`,
    answers: () => app!.debugAnswers(),
    missingLabels: () => app!.debugMissingLabels(),
    learn: (id, t) => app!.openLearn(id, t),
    learnSeek: (t) => app!.learn.playing?.seek(t),
    learnState: () => {
      const p = app!.learn.playing;
      return p ? { course: p.course.meta.id, t: p.t, duration: p.duration, playing: p.playing, card: p.exerciseOpen, errors: p.errors.concat(p.driver.errors), objects: document.querySelectorAll('.lx .lx-obj').length, subs: document.querySelector('.lx-subs')?.textContent ?? '', pauses: p.pauseTimes, rate: p.rate, cc: p.cc, sfx: p.sound ? { on: !p.sound.muted, fired: p.sound.fired, cues: p.sound.cues.length } : null, voice: p.voice } : { course: '', t: 0, duration: 0, playing: false, card: false, errors: [], objects: 0, subs: '', pauses: [], rate: 1, cc: true, sfx: null, voice: null };
    },
    learnSheet: () => app!.learn.sheet(),
    learnColle: () => app!.learn.colle(),
    // ATLAS: open (optionally a system), state of the ship, put it in front of a body, press ⏎
    atlas: (uni?: string) => app!.openAtlas(uni),
    atlasState: () => app!.atlas.info(),
    atlasApproach: (id: string) => app!.atlas.run?.approach(id) ?? false,
    atlasEnter: () => app!.atlas.run?.enterTarget(),
    gameState: () => app!.learn.game?.info() ?? null,
    musicState: () => music.state,
    // story mode: state, and (tests) open a beacon's card as if the ship had landed
    story: (chapter?: string) => {
      const r = chapter ? app!.openChapter(chapter) : null;
      const s = app!.storyNow();
      return { opened: r, restored: s.restored, playable: s.playable, acts: s.acts, chapters: s.chapters, parts: s.parts, events: s.events.length };
    },
    // account: configured in this build, signed in, the COMPTE dialog opened
    account: () => {
      app!.openAccount();
      return { enabled: cloudConfigured, email: cloud.email, inputs: document.querySelectorAll('.acc input').length };
    },
    // calculator: open it, optionally evaluate a line, report its state
    calc: (text?: string) => {
      if (!app!.calc.isOpen) app!.calc.open();
      const r = text === undefined ? null : app!.calc.run(text);
      return { result: r, ...app!.calc.debug() };
    },
    // sound design of a course rendered offline, as a base64 WAV (preview for the author);
    // `mp3s` (clip key → base64 MP3, read from courses/<id>/audio by the caller) adds the voice
    sfxWav: async (id: string, mp3s: Record<string, string> = {}) => {
      const c = compileCourse(id);
      if (!c) return '';
      const voice = c.timeline.clips
        .filter((x) => mp3s[x.clip.key])
        .map((x) => ({ t: x.t0, mp3: Uint8Array.from(atob(mp3s[x.clip.key]), (ch) => ch.charCodeAt(0)).buffer }));
      const meta = COURSE_META(id);
      const bytes = toWav(await new Soundtrack(soundCues(c.timeline)).render(c.timeline.duration, 44100, voice, meta?.voiceVolume ?? 1));
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(s);
    },
  };
}

void main();
