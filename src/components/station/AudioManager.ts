import {
  FADE_IN_SEC,
  FADE_OUT_SEC,
  WIND_GAIN,
  WIND_FADE_IN_SEC,
} from './stationTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveSound {
  source: AudioBufferSourceNode;
  gain: GainNode;
  /** True if we called stop() early; prevents onEnded from firing */
  stoppedEarly: boolean;
  onEnded?: () => void;
  /** Timer ID for the auto-fade-out, so we can cancel it if stopped early */
  fadeOutTimerId?: ReturnType<typeof setTimeout>;
}

export interface PlayOptions {
  /** Seconds to ramp from 0 to targetGain. Default: FADE_IN_SEC */
  fadeInSec?: number;
  /** Seconds to ramp from targetGain to 0 before track ends. Default: FADE_OUT_SEC */
  fadeOutSec?: number;
  /** Called when the source naturally finishes (not when stopped early) */
  onEnded?: () => void;
}

// ─── AudioManager ─────────────────────────────────────────────────────────────

/**
 * Single owner of all audio in the station.
 *
 * Responsibilities:
 * - Maintains one shared AudioContext (created once, never recreated)
 * - Preloads all audio files as AudioBuffer objects for click-free playback
 * - Loops the wind ambience seamlessly via native AudioBufferSourceNode.loop
 * - Plays one-shot sounds through individual GainNodes (fade in + auto fade out)
 * - Provides the AudioContext for time-of-day synth integration
 * - Disposes all nodes cleanly on unmount
 *
 * Architecture note: Audio drives visuals. All timing callbacks from this class
 * (via onEnded) are the authoritative clock for the TrainScheduler FSM.
 */
export class AudioManager {
  readonly ctx: AudioContext;
  private master: GainNode;

  private buffers: Map<string, AudioBuffer> = new Map();
  private active: Map<string, ActiveSound> = new Map();

  private windSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windStarted = false;

  // Time-of-day synth nodes (re-used from the original useStationAudio design)
  private windNoiseSource: AudioBufferSourceNode | null = null;
  private windNoiseGain: GainNode | null = null;
  private windNoiseFilter: BiquadFilterNode | null = null;
  private cricketOsc: OscillatorNode | null = null;
  private cricketGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private synthInitialized = false;

  private disposed = false;

  constructor() {
    // @ts-expect-error webkit prefix for Safari
    const AC = window.AudioContext ?? window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1.0;
    this.master.connect(this.ctx.destination);
  }

  // ── Preloading ─────────────────────────────────────────────────────────────

  /**
   * Fetch and decode all audio files into AudioBuffers.
   * Call after AudioContext.resume() (post user gesture).
   * Wind ambience is fetched first to minimise startup latency.
   */
  async preload(windUrl: string, otherUrls: string[]): Promise<void> {
    if (this.disposed) return;

    // Wind first (most critical — user hears it immediately)
    await this.preloadOne(windUrl).catch(console.error);
    // Remaining in parallel
    await Promise.allSettled(otherUrls.map(url => this.preloadOne(url)));
  }

  private async preloadOne(url: string): Promise<void> {
    if (this.buffers.has(url)) return;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    if (this.disposed) return;
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.buffers.set(url, audioBuffer);
  }

  // ── Wind Ambience ──────────────────────────────────────────────────────────

  /**
   * Start the wind ambience loop. May only be called once.
   * Fades in over WIND_FADE_IN_SEC seconds.
   * Never restarts; never stops during train events.
   */
  startWindAmbience(url: string): void {
    if (this.windStarted || this.disposed) return;
    const buffer = this.buffers.get(url);
    if (!buffer) {
      console.warn('AudioManager: wind buffer not ready —', url);
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;   // Native loop = perfectly seamless, no gap or click

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(WIND_GAIN, this.ctx.currentTime + WIND_FADE_IN_SEC);

    source.connect(gain);
    gain.connect(this.master);
    source.start();

    this.windSource = source;
    this.windGain = gain;
    this.windStarted = true;
  }

  // ── Sound Playback ─────────────────────────────────────────────────────────

  /**
   * Play a preloaded sound through the audio graph.
   *
   * @param id        Logical name (e.g. 'arrival', 'door'). Calling play() with
   *                  the same id stops the previous sound first (no overlaps).
   * @param url       Must have been preloaded.
   * @param targetGain  Peak normalized gain (0–1).
   * @param opts      Fade and callback options.
   */
  play(id: string, url: string, targetGain: number, opts: PlayOptions = {}): void {
    if (this.disposed) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const { fadeInSec = FADE_IN_SEC, fadeOutSec = FADE_OUT_SEC, onEnded } = opts;

    // Stop any previous sound with this id
    this.stop(id, FADE_OUT_SEC);

    const buffer = this.buffers.get(url);
    if (!buffer) {
      console.warn(`AudioManager: buffer not preloaded for "${url}". Skipping.`);
      // Still fire onEnded so the FSM doesn't get stuck
      if (onEnded) setTimeout(onEnded, 100);
      return;
    }

    const ctx = this.ctx;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + fadeInSec);

    source.connect(gain);
    gain.connect(this.master);

    const entry: ActiveSound = { source, gain, stoppedEarly: false, onEnded };

    // Schedule automatic fade-out before the buffer ends (prevents click on finish)
    const duration = buffer.duration;
    if (duration > fadeInSec + fadeOutSec) {
      const fadeOutStartSec = duration - fadeOutSec;
      entry.fadeOutTimerId = setTimeout(() => {
        if (this.active.get(id) === entry && !entry.stoppedEarly) {
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutSec);
        }
      }, fadeOutStartSec * 1000);
    }

    source.addEventListener('ended', () => {
      if (this.active.get(id) === entry) {
        this.active.delete(id);
      }
      try { gain.disconnect(); } catch (_) { /* already disconnected */ }

      if (!entry.stoppedEarly && onEnded) {
        onEnded();
      }
    });

    this.active.set(id, entry);
    source.start();
  }

  /**
   * Gracefully stop a playing sound with a fade-out.
   * The onEnded callback will NOT fire.
   */
  stop(id: string, fadeSec = FADE_OUT_SEC): void {
    const entry = this.active.get(id);
    if (!entry) return;

    entry.stoppedEarly = true;
    if (entry.fadeOutTimerId !== undefined) clearTimeout(entry.fadeOutTimerId);

    const { source, gain } = entry;
    const ctx = this.ctx;

    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeSec);

    setTimeout(() => {
      try { source.stop(); } catch (_) { /* may already be stopped */ }
      try { gain.disconnect(); } catch (_) { /* may already be disconnected */ }
      if (this.active.get(id) === entry) this.active.delete(id);
    }, fadeSec * 1000 + 50);
  }

  /** Stop all currently playing sounds with fade-outs */
  stopAll(fadeSec = FADE_OUT_SEC): void {
    for (const id of [...this.active.keys()]) {
      this.stop(id, fadeSec);
    }
  }

  // ── Time-of-Day Synth Ambience ─────────────────────────────────────────────

  /**
   * Initialize or adjust synthesized ambient nodes (wind noise, crickets, hum).
   * These are independent of the main wind ambience MP3.
   */
  setTimeOfDay(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): void {
    if (this.disposed) return;
    if (this.ctx.state === 'suspended') return;

    this.initSynthNodes();

    const now = this.ctx.currentTime;
    const T = 5; // time constant (seconds) for exponential target

    if (this.windNoiseGain && this.windNoiseFilter) {
      const gains  = { morning: 0.01, afternoon: 0.03, evening: 0.015, night: 0.005 };
      const freqs  = { morning: 300,  afternoon: 600,  evening: 400,   night: 200  };
      this.windNoiseGain.gain.setTargetAtTime(gains[timeOfDay], now, T);
      this.windNoiseFilter.frequency.setTargetAtTime(freqs[timeOfDay], now, T);
    }

    if (this.cricketGain) {
      this.cricketGain.gain.setTargetAtTime(0, now, T);
    }

    if (this.humGain) {
      this.humGain.gain.setTargetAtTime(0, now, T);
    }
  }

  private initSynthNodes(): void {
    if (this.synthInitialized || this.disposed) return;
    const ctx = this.ctx;

    // Filtered white noise as soft wind texture
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.master);
    noiseSource.start();

    this.windNoiseSource = noiseSource;
    this.windNoiseFilter = filter;
    this.windNoiseGain = noiseGain;

    // Cricket chirping has been removed because it sounded like an annoying beep

    // Electrical hum has been removed to prevent vibration sounds

    this.synthInitialized = true;
  }

  // ── Snapshot (for Debug Overlay) ───────────────────────────────────────────

  getGainValues(): Record<string, number> {
    const result: Record<string, number> = {
      wind: this.windGain?.gain.value ?? 0,
    };
    for (const [id, entry] of this.active) {
      result[id] = entry.gain.gain.value;
    }
    return result;
  }

  // ── Visibility & Resume ────────────────────────────────────────────────────

  /** Call when the page becomes visible again (visibilitychange event) */
  resume(): void {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.stopAll(0.15);

    // Stop wind loop
    if (this.windSource) {
      try { this.windSource.stop(); } catch (_) {}
      try { this.windGain?.disconnect(); } catch (_) {}
    }

    // Stop synth nodes
    for (const node of [
      this.windNoiseSource, this.cricketOsc, this.humOsc
    ] as (AudioScheduledSourceNode | null)[]) {
      try { node?.stop(); } catch (_) {}
    }

    // Close the context after a brief delay (allows fade-outs to complete)
    setTimeout(() => {
      this.ctx.close().catch(() => {});
    }, 300);
  }
}
