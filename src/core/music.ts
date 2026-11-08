// Generative background music, composed live with WebAudio (no file, offline, never the same twice).
// One mood per zone: ATLAS (deep space), EXPLORER (calm), LEARN (focus), GAME (tension), STORY.
// A chord progression in a modal scale, a pad, slow arpeggios, a bell now and then, a sub bass,
// through a feedback delay ("space"). It fades out under voices (courses, intros, briefings).

export type Mood = 'atlas' | 'explore' | 'learn' | 'game' | 'story' | 'off';

interface MoodSpec {
  /** root (Hz) and scale (semitones) */
  root: number;
  scale: number[];
  /** chord degrees (scale indices) of the progression, one chord per bar */
  prog: number[];
  /** seconds per bar */
  bar: number;
  /** arpeggio notes per bar (0: none) */
  arp: number;
  /** chance of a bell per bar */
  bell: number;
  /** relative levels */
  pad: number;
  bass: number;
  pulse: number;
  /** lowpass of the pad (Hz) */
  bright: number;
}

const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const AEOLIAN = [0, 2, 3, 5, 7, 8, 10];
const LYDIAN = [0, 2, 4, 6, 7, 9, 11];
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];

export const MOODS: Record<Exclude<Mood, 'off'>, MoodSpec> = {
  atlas: { root: 55, scale: LYDIAN, prog: [0, 4, 5, 3], bar: 7.5, arp: 6, bell: 0.45, pad: 1, bass: 0.6, pulse: 0, bright: 900 },
  explore: { root: 65.41, scale: DORIAN, prog: [0, 3, 4, 2], bar: 6.4, arp: 8, bell: 0.25, pad: 0.75, bass: 0.45, pulse: 0, bright: 1300 },
  learn: { root: 73.42, scale: AEOLIAN, prog: [0, 5, 3, 4], bar: 9, arp: 3, bell: 0.35, pad: 0.6, bass: 0.35, pulse: 0, bright: 800 },
  game: { root: 61.74, scale: PHRYGIAN, prog: [0, 1, 0, 6], bar: 4.8, arp: 12, bell: 0.1, pad: 0.55, bass: 0.7, pulse: 1, bright: 1600 },
  story: { root: 49, scale: AEOLIAN, prog: [0, 5, 2, 6], bar: 8, arp: 5, bell: 0.55, pad: 1, bass: 0.55, pulse: 0, bright: 700 },
};

/** frequency of scale degree d (any integer: wraps into octaves) */
export function degreeHz(spec: MoodSpec, d: number): number {
  const n = spec.scale.length;
  const oct = Math.floor(d / n);
  const st = spec.scale[((d % n) + n) % n] + 12 * oct;
  return spec.root * Math.pow(2, st / 12);
}

/** deterministic random for the melodies */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private wet: GainNode | null = null;
  private mood: Mood = 'off';
  private want: Mood = 'off';
  private enabled = true;
  private volume = 0.5;
  private ducked = 0;
  private nextBar = 0;
  private bar = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private r = rng(1729);
  private padVoices: { stop(at: number): void }[] = [];

  /** call from a user gesture: browsers only start audio after one */
  wake(): void {
    if (!this.enabled) return;
    if (!this.ctx) {
      try {
        const ctx = new AudioContext();
        const master = ctx.createGain();
        master.gain.value = 0;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.ratio.value = 3;
        master.connect(comp).connect(ctx.destination);
        // "space": a feedback delay with a dark tail
        const bus = ctx.createGain();
        const delay = ctx.createDelay(2);
        delay.delayTime.value = 0.42;
        const fb = ctx.createGain();
        fb.gain.value = 0.48;
        const tone = ctx.createBiquadFilter();
        tone.type = 'lowpass';
        tone.frequency.value = 2200;
        const wet = ctx.createGain();
        wet.gain.value = 0.55;
        bus.connect(master);
        bus.connect(delay);
        delay.connect(tone).connect(fb).connect(delay);
        tone.connect(wet).connect(master);
        this.ctx = ctx;
        this.master = master;
        this.bus = bus;
        this.wet = wet;
      } catch {
        return;
      }
    }
    void this.ctx.resume().catch(() => undefined);
    this.apply();
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 200);
  }

  setMood(m: Mood): void {
    this.want = m;
    this.apply();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    // the audio context itself waits for a user gesture (wake), never created here
    if (on && this.ctx) this.wake();
    this.apply();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    this.apply();
  }

  /** voices speaking (a course, an intro, a briefing): the music steps back */
  duck(on: boolean): void {
    this.ducked = Math.max(0, this.ducked + (on ? 1 : -1));
    this.apply();
  }

  get state(): { mood: Mood; playing: boolean; ducked: boolean } {
    return { mood: this.mood, playing: !!this.ctx && this.ctx.state === 'running' && this.enabled && this.mood !== 'off', ducked: this.ducked > 0 };
  }

  private level(): number {
    if (!this.enabled || this.want === 'off') return 0;
    return 0.5 * this.volume * (this.ducked ? 0.12 : 1);
  }

  private apply(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.level(), t, this.ducked ? 0.4 : 1.2);
    if (this.want !== this.mood) {
      // crossfade: the old pads release, the new mood starts on the next bar
      for (const v of this.padVoices) v.stop(t + 2.5);
      this.padVoices = [];
      this.mood = this.want;
      this.nextBar = Math.max(this.nextBar, t + 0.3);
      this.bar = 0;
    }
  }

  // ── composition ──────────────────────────────────────────────────────

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || this.mood === 'off' || ctx.state !== 'running') return;
    while (this.nextBar < ctx.currentTime + 1.2) {
      this.playBar(MOODS[this.mood as Exclude<Mood, 'off'>], this.nextBar);
      this.nextBar += MOODS[this.mood as Exclude<Mood, 'off'>].bar;
      this.bar++;
    }
  }

  private playBar(s: MoodSpec, t0: number): void {
    const r = this.r;
    const deg = s.prog[this.bar % s.prog.length];
    const chord = [deg, deg + 2, deg + 4, deg + 6];
    // pad: the chord, two octaves up from the root, slow swell
    if (s.pad > 0) for (const d of chord.slice(0, 3)) this.padVoices.push(this.pad(degreeHz(s, d + 7), t0, s.bar * 1.05, 0.05 * s.pad, s.bright));
    if (this.padVoices.length > 12) this.padVoices.splice(0, this.padVoices.length - 12);
    // sub bass on the root of the chord
    if (s.bass > 0) this.tone('sine', degreeHz(s, deg), t0, s.bar * 0.9, 0.12 * s.bass, 0.8, s.bar * 0.6, false);
    // arpeggio: chord tones in a gentle random walk, up an octave or two
    if (s.arp > 0) {
      let k = Math.floor(r() * 4);
      for (let i = 0; i < s.arp; i++) {
        if (r() < 0.22) continue;
        k += r() < 0.5 ? 1 : -1;
        const d = chord[((k % 4) + 4) % 4] + 14 + (r() < 0.25 ? 7 : 0);
        const at = t0 + (i / s.arp) * s.bar + (r() - 0.5) * 0.04;
        this.tone('triangle', degreeHz(s, d), at, 1.6, 0.035, 0.005, 1.4, true);
      }
    }
    // pulse (games): a soft sixteenth-like tick on the root
    if (s.pulse > 0)
      for (let i = 0; i < 8; i++) this.tone('square', degreeHz(s, deg + 7), t0 + (i / 8) * s.bar, 0.12, 0.018 * s.pulse, 0.003, 0.1, false, 900);
    // a bell, sometimes
    if (r() < s.bell) {
      const f = degreeHz(s, chord[Math.floor(r() * 3)] + 21);
      const at = t0 + r() * s.bar * 0.7;
      for (const [m, a, d] of [
        [1, 1, 3.2],
        [2.76, 0.4, 1.8],
        [5.4, 0.18, 1],
      ] as const)
        this.tone('sine', f * m, at, d, 0.03 * a, 0.004, d, true);
    }
  }

  private tone(type: OscillatorType, f: number, t0: number, dur: number, peak: number, attack: number, release: number, wet: boolean, lp = 0): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
    let node: AudioNode = o;
    if (lp) {
      const f2 = ctx.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = lp;
      node = o.connect(f2);
    }
    node.connect(g).connect(wet ? this.bus! : this.master!);
    o.start(t0);
    o.stop(t0 + Math.max(dur, attack + release) + 0.1);
  }

  private pad(f: number, t0: number, dur: number, peak: number, bright: number): { stop(at: number): void } {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = bright;
    lp.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08 + this.r() * 0.06;
    const depth = ctx.createGain();
    depth.gain.value = bright * 0.35;
    lfo.connect(depth).connect(lp.frequency);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const oscs = [-7, 6].map((cents) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = cents;
      o.connect(lp);
      return o;
    });
    lp.connect(g).connect(this.bus!);
    for (const o of [...oscs, lfo]) {
      o.start(t0);
      o.stop(t0 + dur + 0.2);
    }
    return {
      stop: (at: number) => {
        g.gain.cancelScheduledValues(at - 2.4);
        g.gain.setTargetAtTime(0.0001, Math.max(ctx.currentTime, at - 2.4), 0.6);
      },
    };
  }
}

export const music = new Music();
