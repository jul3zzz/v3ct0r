// Course player: clock (voice audio as master when present), transport bar, subtitles,
// automatic pause before each exercise with a HUD timer, end card.
import { h, setText } from '../hud/dom';
import { icon } from '../hud/deco';
import { sfx } from '../core/audio';
import { toast } from '../shell/overlays';
import { Stage } from './stage';
import { SceneDriver, type SceneHost } from './scene';
import { renderTokens } from './rich';
import { exerciseCard } from './exercise';
import type { Course, Compiled } from './courses';
import type { LearnProgress } from './progress';
import type { TimedClip } from './clips';
import { Soundtrack, soundCues } from './soundtrack';
import { store } from '../core/settings';
import { music } from '../core/music';

const SFX_KEY = 'learn.sfx';

export const RATES = [0.75, 1, 1.25, 1.5, 2];

export interface PlayerHooks {
  scene: SceneHost;
  progress: LearnProgress;
  onTime(t: number): void;
  onEnd(): void;
  fullscreen(): void;
  sheet(): void;
  colle(): void;
  home(): void;
  /** module intros: open the introduced module in the explorer */
  explore(): void;
}

export const clock = (s: number): string => {
  const v = Math.max(0, Math.floor(s));
  const hh = Math.floor(v / 3600);
  const mm = Math.floor((v % 3600) / 60);
  const ss = v % 60;
  return `${hh ? hh + ':' : ''}${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};

export class Player {
  readonly el: HTMLElement;
  readonly stage: Stage;
  readonly driver: SceneDriver;
  readonly errors: string[];
  t = 0;
  playing = false;
  rate = 1;
  cc = true;
  private audio = new Audio();
  private audioKey = '';
  private failed = new Set<string>();
  private card: HTMLElement | null = null;
  private cardTimer: { left: number; el: HTMLElement } | null = null;
  private cue = -2;
  private subs: HTMLElement;
  private ui: {
    play: HTMLButtonElement;
    time: HTMLElement;
    scrub: HTMLElement;
    fill: HTMLElement;
    thumb: HTMLElement;
    chap: HTMLElement;
    rates: HTMLButtonElement[];
    cc: HTMLButtonElement;
    sfx: HTMLButtonElement | null;
    tip: HTMLElement;
  };
  private pauses: { t: number; ex: string; minutes: number }[];
  private dragging = false;
  /** sound design (courses with "soundtrack": true) */
  readonly sound: Soundtrack | null;

  constructor(
    viewport: HTMLElement,
    readonly course: Course,
    readonly c: Compiled,
    private hooks: PlayerHooks,
    startAt = 0,
  ) {
    this.errors = [...c.errors];
    this.el = h('div', { class: course.meta.level === 'intro' ? 'lxp intro' : 'lxp' });
    viewport.append(this.el);
    this.stage = new Stage(this.el, course, c.timeline, this.errors);
    this.driver = new SceneDriver(c.timeline.events, hooks.scene);
    this.pauses = c.timeline.events.filter((e) => e.m.kind === 'exercise').map((e) => ({ t: e.t, ex: e.m.name, minutes: Number(e.m.args.minutes ?? course.exercises.find((x) => x.id === e.m.name)?.minutes ?? 5) }));
    this.subs = h('div', { class: 'lx-subs', 'aria-hidden': 'true' });
    this.el.append(this.subs);
    this.sound = course.meta.soundtrack ? new Soundtrack(soundCues(c.timeline), !store.get(SFX_KEY, true)) : null;
    this.ui = this.buildBar();
    this.audio.preload = 'auto';
    this.audio.volume = Math.max(0, Math.min(1, course.meta.voiceVolume ?? 1));
    this.audio.addEventListener('error', () => {
      if (!this.audioKey) return;
      this.failed.add(this.audioKey);
      if (this.failed.size === 1) toast('◇ AUDIO INTROUVABLE — LECTURE AVEC SOUS-TITRES SEULS', 3200);
    });
    this.t = Math.max(0, Math.min(startAt, c.timeline.duration - 0.5));
    this.render();
  }

  /** voice playback state (smoke test): clip key, position in the clip, paused, failed clips */
  get voice(): { key: string; time: number; paused: boolean; failed: number } {
    return { key: this.audioKey, time: this.audio.currentTime, paused: this.audio.paused, failed: this.failed.size };
  }

  get duration(): number {
    return this.c.timeline.duration;
  }

  get exerciseOpen(): boolean {
    return !!this.card;
  }

  /** times of the automatic exercise pauses */
  get pauseTimes(): number[] {
    return this.pauses.map((p) => p.t);
  }

  private buildBar() {
    const btn = (ico: string, label: string, fn: () => void, text?: string) => {
      const b = h('button', { type: 'button', class: 'lx-b', title: label, 'aria-label': label }, icon(ico), text ? h('span', { text }) : null);
      b.addEventListener('click', () => {
        sfx.click();
        fn();
      });
      return b;
    };
    const play = btn('play', 'Lecture / pause (Espace)', () => this.toggle());
    const back = btn('reset', 'Reculer de 5 s (←)', () => this.skip(-5), '5 s');
    const fwd = btn('play', 'Avancer de 5 s (→)', () => this.skip(5), '5 s');
    fwd.classList.add('fwd');
    const time = h('span', { class: 'lx-time' });
    const fill = h('i', { class: 'fill' });
    const thumb = h('i', { class: 'thumb' });
    const tip = h('span', { class: 'tip' });
    const ticks = h('span', { class: 'ticks' });
    for (const ch of this.c.timeline.chapters) {
      if (ch.t <= 0) continue;
      ticks.append(h('i', { style: `left:${((100 * ch.t) / this.duration).toFixed(3)}%`, title: ch.title }));
    }
    for (const p of this.pauses) ticks.append(h('b', { style: `left:${((100 * p.t) / this.duration).toFixed(3)}%`, title: 'Exercice' }));
    const scrub = h('div', { class: 'lx-scrub', role: 'slider', tabindex: '0', 'aria-label': 'Position dans le cours', 'aria-valuemin': '0', 'aria-valuemax': String(Math.round(this.duration)) }, ticks, fill, thumb, tip);
    const at = (e: PointerEvent) => {
      const r = scrub.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * this.duration;
    };
    scrub.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      scrub.setPointerCapture(e.pointerId);
      this.seek(at(e));
    });
    scrub.addEventListener('pointermove', (e) => {
      const T = at(e);
      const ch = [...this.c.timeline.chapters].reverse().find((x) => x.t <= T);
      tip.textContent = `${clock(T)} · ${ch?.title ?? ''}`;
      tip.style.left = `${(100 * T) / this.duration}%`;
      if (this.dragging) this.seek(T);
    });
    scrub.addEventListener('pointerup', () => (this.dragging = false));
    scrub.addEventListener('keydown', (e) => {
      if (e.key === 'Home') this.seek(0);
      else if (e.key === 'End') this.seek(this.duration - 0.1);
      else return;
      e.preventDefault();
    });
    const chap = h('span', { class: 'lx-chapname' });
    const rates = RATES.map((r) => {
      const b = h('button', { type: 'button', class: 'lx-rate', 'aria-pressed': String(r === 1), text: `${String(r).replace('.', ',')}×`, title: `Vitesse ${r}×` });
      b.addEventListener('click', () => {
        sfx.click();
        this.setRate(r);
      });
      return b;
    });
    const cc = btn('quiz', 'Sous-titres (C)', () => this.toggleCC(), 'CC');
    cc.setAttribute('aria-pressed', 'true');
    const sfxBtn = this.sound ? btn(this.sound.muted ? 'mute' : 'sound', 'Bruitages (B)', () => this.toggleSfx(), 'SFX') : null;
    sfxBtn?.setAttribute('aria-pressed', String(!this.sound?.muted));
    const full = btn('expand', 'Plein écran (F)', () => this.hooks.fullscreen());
    const bar = h('div', { class: 'lx-bar', role: 'toolbar', 'aria-label': 'Lecture du cours' }, play, back, fwd, time, scrub, chap, h('span', { class: 'lx-rates', role: 'group', 'aria-label': 'Vitesse' }, ...rates), cc, sfxBtn, full);
    this.el.append(bar);
    return { play, time, scrub, fill, thumb, chap, rates, cc, sfx: sfxBtn, tip };
  }

  // ── transport ────────────────────────────────────────────────────────

  private ducking = false;

  private unduck(): void {
    if (!this.ducking) return;
    this.ducking = false;
    music.duck(false);
  }

  play(): void {
    if (this.card) return;
    if (this.t >= this.duration - 0.05) this.seek(0);
    this.playing = true;
    this.audioKey = '';
    this.sound?.start(this.t);
    // the background music steps back while a course plays
    if (!this.ducking) {
      this.ducking = true;
      music.duck(true);
    }
    this.paintPlay();
  }

  pause(): void {
    this.playing = false;
    this.audio.pause();
    this.sound?.stop();
    this.unduck();
    this.paintPlay();
    this.hooks.progress.setPos(this.course.meta.id, this.t);
  }

  toggle(): void {
    if (this.card) {
      this.closeCard(true);
      return;
    }
    if (this.playing) this.pause();
    else this.play();
  }

  skip(dt: number): void {
    this.seek(this.t + dt);
  }

  seek(t: number): void {
    this.t = Math.max(0, Math.min(this.duration - 0.01, t));
    this.audioKey = '';
    this.audio.pause();
    this.sound?.seek(this.t, this.playing);
    if (this.card) this.closeCard(false);
    this.render();
    this.hooks.progress.setPos(this.course.meta.id, this.t);
  }

  setRate(r: number): void {
    this.rate = r;
    this.audio.playbackRate = r;
    this.ui.rates.forEach((b, i) => b.setAttribute('aria-pressed', String(RATES[i] === r)));
  }

  cycleRate(dir: number): void {
    const i = RATES.indexOf(this.rate);
    this.setRate(RATES[Math.max(0, Math.min(RATES.length - 1, i + dir))]);
  }

  toggleCC(): void {
    this.cc = !this.cc;
    this.ui.cc.setAttribute('aria-pressed', String(this.cc));
    this.subs.style.display = this.cc ? '' : 'none';
    toast(this.cc ? 'SOUS-TITRES ACTIVÉS' : 'SOUS-TITRES DÉSACTIVÉS', 1400);
  }

  private paintPlay(): void {
    this.ui.play.replaceChildren(icon(this.playing ? 'pause' : 'play'));
    this.ui.play.setAttribute('aria-label', this.playing ? 'Pause (Espace)' : 'Lecture (Espace)');
    this.el.classList.toggle('playing', this.playing);
  }

  private clipAt(t: number): TimedClip | null {
    const cl = this.c.timeline.clips;
    let lo = 0;
    let hi = cl.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cl[mid].t0 <= t) lo = mid + 1;
      else hi = mid - 1;
    }
    const c = cl[hi];
    return c && t < c.t0 + c.dur ? c : null;
  }

  // ── frame ────────────────────────────────────────────────────────────

  tick(dt: number): void {
    if (this.cardTimer) {
      this.cardTimer.left -= dt;
      const left = this.cardTimer.left;
      setText(this.cardTimer.el, left > 0 ? clock(left) : 'TEMPS ÉCOULÉ');
      this.cardTimer.el.classList.toggle('over', left <= 0);
    }
    if (this.playing && !this.card) {
      const prev = this.t;
      let t = this.t + dt * this.rate;
      const clip = this.clipAt(t);
      if (clip?.audio && !this.failed.has(clip.clip.key)) {
        if (this.audioKey !== clip.clip.key) {
          this.audioKey = clip.clip.key;
          this.audio.src = clip.audio;
          this.audio.playbackRate = this.rate;
          this.audio.currentTime = Math.max(0, t - clip.t0);
          void this.audio.play().catch(() => undefined);
        } else if (!this.audio.paused && this.audio.readyState >= 2) {
          // the voice is the master clock inside its clip
          const at = clip.t0 + this.audio.currentTime;
          if (Math.abs(at - t) < 0.5) t = at;
          else this.audio.currentTime = Math.max(0, t - clip.t0);
        } else if (this.audio.paused) void this.audio.play().catch(() => undefined);
      } else if (!this.audio.paused) this.audio.pause();
      const stop = this.pauses.find((p) => prev < p.t && t >= p.t);
      if (stop) {
        this.t = stop.t;
        this.pause();
        this.openExercise(stop.ex, stop.minutes);
      } else if (t >= this.duration) {
        this.t = this.duration;
        this.pause();
        this.end();
      } else this.t = t;
      this.sound?.cross(prev, this.t);
      this.hooks.progress.addWatched(this.course.meta.id, dt);
      this.hooks.progress.setPos(this.course.meta.id, this.t);
    }
    this.render();
  }

  private render(): void {
    const t = this.t;
    this.driver.update(t);
    this.stage.update(t);
    // subtitles
    const cues = this.c.timeline.cues;
    let k = -1;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].t0 > t) break;
      if (t < cues[i].t1 + 0.35) k = i;
    }
    if (k !== this.cue) {
      this.cue = k;
      this.subs.replaceChildren();
      if (k >= 0) this.subs.append(renderTokens(cues[k].tokens, h('span', { class: 'ln' })));
    }
    // bar
    const f = this.duration ? t / this.duration : 0;
    this.ui.fill.style.width = `${(100 * f).toFixed(3)}%`;
    this.ui.thumb.style.left = `${(100 * f).toFixed(3)}%`;
    setText(this.ui.time, `${clock(t)} / ${clock(this.duration)}`);
    this.ui.scrub.setAttribute('aria-valuenow', String(Math.round(t)));
    this.ui.scrub.setAttribute('aria-valuetext', clock(t));
    const ch = [...this.c.timeline.chapters].reverse().find((x) => x.t <= t + 1e-6);
    setText(this.ui.chap, ch?.title ?? '');
    this.hooks.onTime(t);
  }

  get cueIndex(): number {
    return this.cue;
  }

  // ── cards ────────────────────────────────────────────────────────────

  private openCard(el: HTMLElement): void {
    this.closeCard(false);
    this.card = h('div', { class: 'lx-cardwrap' }, el);
    this.el.append(this.card);
    this.el.classList.add('carded');
    el.querySelector<HTMLElement>('button')?.focus();
  }

  closeCard(resume: boolean): void {
    if (!this.card) return;
    this.card.remove();
    this.card = null;
    this.cardTimer = null;
    this.el.classList.remove('carded');
    if (resume) {
      this.t = Math.min(this.duration, this.t + 0.02);
      this.play();
    }
  }

  openExercise(id: string, minutes: number): void {
    const ex = this.course.exercises.find((x) => x.id === id);
    if (!ex) return;
    sfx.open();
    const cid = this.course.meta.id;
    const timer = h('span', { class: 'lx-timer', text: clock(minutes * 60) });
    const go = h('button', { type: 'button', class: 'btn on' }, icon('play'), h('span', { text: 'CONTINUER LE COURS' }), h('span', { class: 'k', text: 'ESPACE' }));
    go.addEventListener('click', () => this.closeCard(true));
    const more = h('button', { type: 'button', class: 'btn', text: '+ 2 MIN' });
    more.addEventListener('click', () => this.cardTimer && (this.cardTimer.left += 120));
    const card = h(
      'div',
      { class: 'lx-card frame solid', role: 'dialog', 'aria-label': `Exercice : ${ex.title}` },
      h('div', { class: 'lx-card-head' }, h('span', { class: 'big', text: 'À TOI.' }), h('span', { text: `PRENDS ${minutes} MIN.` }), h('span', { class: 'spacer' }), timer),
      exerciseCard(ex, { state: this.hooks.progress.ex(cid, ex.id), update: (p) => this.hooks.progress.updateEx(cid, ex.id, p) }),
      h('div', { class: 'lx-card-foot' }, go, more),
    );
    this.openCard(card);
    // Space resumes the course (the exercise buttons stay reachable with Tab)
    go.focus();
    this.cardTimer = { left: minutes * 60, el: timer };
  }

  private end(): void {
    this.hooks.progress.markDone(this.course.meta.id);
    this.hooks.onEnd();
    const cid = this.course.meta.id;
    const st = this.hooks.progress.course(cid);
    const solved = this.hooks.progress.solvedCount(cid);
    const b = (label: string, ico: string, fn: () => void, on = false) => {
      const x = h('button', { type: 'button', class: `btn${on ? ' on' : ''}` }, icon(ico), h('span', { text: label }));
      x.addEventListener('click', () => (sfx.click(), fn()));
      return x;
    };
    const replay = () => {
      this.closeCard(false);
      this.seek(0);
    };
    if (this.course.meta.level === 'intro') {
      const go = b('EXPLORER LE MODULE →', 'target', () => this.hooks.explore(), true);
      const card = h(
        'div',
        { class: 'lx-card lx-end frame solid', role: 'dialog', 'aria-label': 'Intro terminée' },
        h('div', { class: 'lx-card-head' }, h('span', { class: 'big', text: '▶ INTRO TERMINÉE' })),
        h('div', { class: 'lx-end-title', text: this.course.meta.title }),
        h('div', { class: 'lx-card-foot' }, go, b('REVOIR', 'reset', replay), b('RETOUR À LEARN', 'target', () => this.hooks.home())),
      );
      sfx.confirm();
      this.openCard(card);
      go.focus();
      return;
    }
    const card = h(
      'div',
      { class: 'lx-card lx-end frame solid', role: 'dialog', 'aria-label': 'Cours terminé' },
      h('div', { class: 'lx-card-head' }, h('span', { class: 'big', text: '✓ COURS TERMINÉ' })),
      h('div', { class: 'lx-end-title', text: this.course.meta.title }),
      h('div', { class: 'lx-end-stats' }, h('span', { text: `TEMPS PASSÉ ${clock(st.watched)}` }), h('span', { text: `EXERCICES RÉUSSIS ${solved}/${this.course.exercises.length}` })),
      h(
        'div',
        { class: 'lx-card-foot' },
        b('FICHE RÉCAPITULATIVE (PDF)', 'download', () => this.hooks.sheet(), true),
        b('COLLE', 'quiz', () => this.hooks.colle()),
        b('REVOIR', 'reset', replay),
        b('RETOUR À LEARN', 'target', () => this.hooks.home()),
      ),
    );
    sfx.confirm();
    this.openCard(card);
  }

  /** sound design on/off (remembered); returns the new state, or null without a soundtrack */
  toggleSfx(): boolean | null {
    const s = this.sound;
    if (!s) return null;
    s.setMuted(!s.muted, this.playing);
    store.set(SFX_KEY, !s.muted);
    const b = this.ui.sfx;
    if (b) {
      b.setAttribute('aria-pressed', String(!s.muted));
      b.querySelector('svg')?.replaceWith(icon(s.muted ? 'mute' : 'sound'));
    }
    return !s.muted;
  }

  dispose(): void {
    this.sound?.dispose();
    this.unduck();
    this.audioKey = '';
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.stage.dispose();
    this.el.remove();
    this.hooks.progress.setPos(this.course.meta.id, this.t);
    this.hooks.progress.flush();
  }
}
