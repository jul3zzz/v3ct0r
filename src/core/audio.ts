import { settings } from './settings';

/** Minimal UI sounds synthesized with Web Audio. Muted by default. */
class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  get enabled(): boolean {
    return settings.sound;
  }

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', gain = 0.03, slideTo?: number, delay = 0): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, gain = 0.03): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2400;
    g.gain.value = gain;
    src.buffer = buf;
    src.connect(f).connect(g).connect(this.master);
    src.start();
  }

  click(): void { this.tone(2200, 0.025, 'square', 0.018); }
  tick(): void { this.tone(3400, 0.012, 'square', 0.01); }
  beep(): void { this.tone(880, 0.09, 'sine', 0.05); }
  confirm(): void { this.tone(660, 0.07, 'sine', 0.045); this.tone(990, 0.1, 'sine', 0.045, undefined, 0.07); }
  error(): void { this.tone(180, 0.18, 'sawtooth', 0.03, 120); }
  glitch(): void { this.noise(0.09, 0.025); this.tone(90, 0.08, 'square', 0.02, 60); }
  open(): void { this.tone(520, 0.08, 'sine', 0.035, 1040); }
  close(): void { this.tone(1040, 0.08, 'sine', 0.03, 520); }
  boot(): void {
    [440, 660, 880, 1320].forEach((f, i) => this.tone(f, 0.08, 'sine', 0.035, undefined, i * 0.09));
  }
  /** Unlock audio from a user gesture (called when the user enables sound). */
  prime(): void { this.ensure(); }
}

export const sfx = new Sfx();
