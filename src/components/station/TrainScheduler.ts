import type { AudioManager } from './AudioManager';
import {
  type FSMState,
  type TrainEventType,
  type TrainTypeConfig,
  type SchedulerCallbacks,
  type MoveCommand,
  COMMUTER_CONFIG,
  BULLET_CONFIG,
  EVENT_WEIGHTS,
  MAX_REPEAT_COUNT,
  COOLDOWN_DURATION_MS,
  FADE_IN_SEC,
  FADE_OUT_SEC,
} from './stationTypes';

// ─── Easing Curves ────────────────────────────────────────────────────────────

/**
 * Braking: starts at approach speed, rapidly decelerates, glides to a stop.
 * The curve is heavily weighted toward the beginning (fast → slow).
 */
const EASE_BRAKING: [number, number, number, number] = [0.05, 0.9, 0.15, 1.0];

/**
 * Departure (commuter): classic ease-in — smooth acceleration.
 */
const EASE_DEPART_COMMUTER: [number, number, number, number] = [0.4, 0.0, 0.8, 0.2];

/**
 * Departure (bullet): smoother, more powerful acceleration.
 */
const EASE_DEPART_BULLET: [number, number, number, number] = [0.3, 0.0, 0.7, 0.1];

// ─── TrainScheduler ───────────────────────────────────────────────────────────

/**
 * The single source of truth for all train event timing.
 *
 * Architecture:
 * - Implements a Finite State Machine (FSM) with exclusive state ownership.
 * - Every timer created here is tracked for clean cancellation.
 * - Audio drives visuals: every animation command is triggered BY an audio event
 *   or audio-derived timer — never the reverse.
 * - Randomisation uses weighted history to prevent excessive repetition.
 * - All platform position calculations are dynamic (resize-safe).
 *
 * Usage:
 *   const sched = new TrainScheduler(audio, callbacks);
 *   sched.start();
 *   // ... on cleanup:
 *   sched.dispose();
 */
export class TrainScheduler {
  private state: FSMState = 'IDLE';
  private locked = false;
  private disposed = false;

  private currentConfig: TrainTypeConfig | null = null;
  private currentEvent: TrainEventType | null = null;
  private currentDirection: 'left' | 'right' = 'left';

  /** Tracks the last N event types to prevent excessive repetition */
  private eventHistory: TrainEventType[] = [];

  /** All outstanding timer IDs — cleared on dispose or restart of a sequence */
  private timers: ReturnType<typeof setTimeout>[] = [];

  /** Wall-clock time when the current audio started (ctx.currentTime) */
  private audioStartCtxTime = 0;

  /** For dwell tracking (debug overlay) */
  private dwellEndTime = 0;
  /** For cooldown tracking (debug overlay) */
  private cooldownEndWallTime = 0;

  /** Allows the user to skip dwell by boarding the train */
  private dwellTimerId: ReturnType<typeof setTimeout> | null = null;
  private boarded = false;

  constructor(
    private audio: AudioManager,
    private callbacks: SchedulerCallbacks,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Begin the scheduler. Immediately enters COOLDOWN for the initial 30 s quiet. */
  start(): void {
    if (this.disposed) return;
    this.enterCooldown();
  }

  /**
   * Called by the React host when the user boards the train.
   * Skips remaining dwell time and triggers immediate door-close sequence.
   */
  triggerBoarding(): void {
    if (this.state !== 'DOORS_OPEN_WAIT') return;
    this.boarded = true;
    if (this.dwellTimerId !== null) {
      clearTimeout(this.dwellTimerId);
      this.dwellTimerId = null;
    }
    this.beginDoorClose();
  }

  /** Called when the browser window resizes. No-op during active events; picks up next cycle. */
  onResize(): void {
    // Positions are calculated dynamically at the start of each event — no action needed here.
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearAllTimers();
    this.audio.stopAll(0.2);
  }

  // ─── State helpers ──────────────────────────────────────────────────────────

  getState(): FSMState { return this.state; }
  isBoarded(): boolean { return this.boarded; }
  getCurrentConfig(): TrainTypeConfig | null { return this.currentConfig; }
  getCurrentEvent(): TrainEventType | null { return this.currentEvent; }
  getDwellRemainingMs(): number {
    return Math.max(0, this.dwellEndTime - Date.now());
  }
  getCooldownRemainingMs(): number {
    return Math.max(0, this.cooldownEndWallTime - Date.now());
  }
  isLocked(): boolean { return this.locked; }

  // ─── FSM Transitions ────────────────────────────────────────────────────────

  private setState(next: FSMState): void {
    this.state = next;
    this.callbacks.onStateChange(next);
  }

  // ─── Timer Management ────────────────────────────────────────────────────────

  private addTimer(delayMs: number, fn: () => void): ReturnType<typeof setTimeout> {
    const id = setTimeout(() => {
      if (this.disposed) return;
      fn();
    }, Math.max(0, delayMs));
    this.timers.push(id);
    return id;
  }

  private clearAllTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.dwellTimerId !== null) {
      clearTimeout(this.dwellTimerId);
      this.dwellTimerId = null;
    }
  }

  // ─── Geometry Helpers ────────────────────────────────────────────────────────

  /**
   * Compute spawn x for a train entering from the given direction.
   * The spawn position is 3 visual train widths beyond the screen edge — the
   * train is completely invisible for at least 2–3 lengths before audio starts.
   *
   * Coordinate system: x=0 → train visually centered on screen.
   * The train's layout width (trainW = trainData.length * scale) determines how
   * far the flex-centered motion.div must shift to be off-screen.
   *
   * Formula derivation:
   *   Natural left edge of centered motion.div = (screenW - trainW) / 2
   *   For left-moving train (enters from right), we want right edge OFF screen right:
   *     (screenW - trainW)/2 + trainW + x > screenW  →  x > (screenW + trainW)/2
   *   Add 3 train widths extra:  x = (screenW + trainW)/2 + 3*trainW = screenW/2 + 3.5*trainW
   */
  private spawnX(direction: 'left' | 'right', screenW: number, trainW: number): number {
    const clearance = screenW / 2 + trainW / 2 + 500;
    return direction === 'left' ? +clearance : -clearance;
  }

  /**
   * Compute the off-screen departure x — symmetric with spawnX but opposite sign.
   * Guarantees the train travels far enough off-screen in 27 s at departure speed.
   */
  private departX(direction: 'left' | 'right', screenW: number, trainW: number): number {
    const clearance = screenW / 2 + trainW / 2 + 1000;
    return direction === 'left' ? -clearance : +clearance;
  }

  // ─── Event Selection ─────────────────────────────────────────────────────────

  /**
   * Weighted random selection with history bias.
   * Reduces weight of any event type that has appeared in the last MAX_REPEAT_COUNT events,
   * producing a naturally varied sequence rather than purely random clustering.
   */
  private pickNextEvent(): TrainEventType {
    const types: TrainEventType[] = ['COMMUTER_STOP', 'COMMUTER_PASS', 'BULLET_STOP', 'BULLET_PASS'];

    // Adjust weights based on recent history
    const adjustedWeights: Record<TrainEventType, number> = { ...EVENT_WEIGHTS };
    const recentWindow = this.eventHistory.slice(-MAX_REPEAT_COUNT);
    for (const t of recentWindow) {
      adjustedWeights[t] = Math.max(0.01, adjustedWeights[t] * 0.3);
    }

    // Normalise
    const total = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const t of types) {
      r -= adjustedWeights[t];
      if (r <= 0) return t;
    }
    return types[0];
  }

  // ─── Cooldown & Entry ────────────────────────────────────────────────────────

  private enterCooldown(): void {
    this.locked = false;
    this.boarded = false;
    this.setState('COOLDOWN');
    this.cooldownEndWallTime = Date.now() + COOLDOWN_DURATION_MS;

    this.addTimer(COOLDOWN_DURATION_MS, () => {
      this.setState('IDLE');
      this.scheduleNextEvent();
    });
  }

  private scheduleNextEvent(): void {
    if (this.disposed || this.locked) return;

    const event = this.pickNextEvent();
    this.eventHistory.push(event);
    if (this.eventHistory.length > 10) this.eventHistory.shift();

    const direction: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';

    this.locked = true;
    this.currentEvent = event;
    this.currentDirection = direction;

    // Select train config
    const config = (event === 'BULLET_STOP' || event === 'BULLET_PASS')
      ? BULLET_CONFIG
      : COMMUTER_CONFIG;
    this.currentConfig = config;

    // Notify React to switch train type + direction
    this.callbacks.onTrainSetup(config, direction, event);

    // Wait 150 ms for React to re-render the Train component and update DOM width
    this.addTimer(150, () => {
      const screenW = this.callbacks.getScreenWidth();
      const trainW  = this.callbacks.getTrainWidth();
      const sX = this.spawnX(direction, screenW, trainW);

      // Instantly place the train at the spawn position (not animated, not visible)
      this.callbacks.onSet(sX);

      // Begin the chosen event
      switch (event) {
        case 'COMMUTER_STOP': this.runStop(config, direction); break;
        case 'COMMUTER_PASS': this.runPass(config, direction); break;
        case 'BULLET_STOP':   this.runStop(config, direction); break;
        case 'BULLET_PASS':   this.runPass(config, direction); break;
      }
    });
  }

  // ─── STOP Sequence ───────────────────────────────────────────────────────────

  /**
   * Full stop sequence for COMMUTER_STOP and BULLET_STOP.
   *
   * Timeline (all times relative to arrival audio t=0):
   *   t=0           → audio starts, train invisible at spawn
   *   t=audioLead   → train nose enters viewport (APPROACHING)
   *   t=brakingStart→ braking animation begins (BRAKING)
   *   t=stopTime    → audio ends, train stopped (STOPPED)
   *   immediately   → door-open audio (COMMUTER only) / wait (BULLET)
   *   +doorOpen     → dwell begins (DOORS_OPEN_WAIT)
   *   +dwell        → door-close audio (DOORS_CLOSE_AUDIO)
   *   +doorClose    → mechanical delay (PRE_DEPART_DELAY)
   *   +delay        → departure audio + animation (DEPARTING)
   *   +27s          → OFFSCREEN → COOLDOWN
   */
  private runStop(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('AUDIO_LEAD');

    // Record audio start time for precise elapsed-time calculations
    this.audioStartCtxTime = this.audio.ctx.currentTime;

    // Start arrival audio (no onEnded — we manage timing via audioCtx.currentTime)
    this.audio.play('arrival', config.arrivalAudioUrl, config.arrivalGain, {
      fadeInSec: FADE_IN_SEC,
      fadeOutSec: 0, // arrival ends exactly at stop — don't auto-fade
    });

    // ── t = audioLeadTime: train enters viewport ──────────────────────────────
    this.addTimer(config.audioLeadTime * 1000, () => {
      this.setState('APPROACHING');

      const elapsed = this.audio.ctx.currentTime - this.audioStartCtxTime;
      const timeToStop = config.stopTime - elapsed;

      // Start a single continuous approach animation toward the stop position.
      // EASE_BRAKING starts fast and decelerates, perfect for a train already at speed coming into view.
      this.callbacks.onMove({
        x: 0,
        durationSec: timeToStop,
        ease: EASE_BRAKING,
      });

      // ── t = brakingStartTime: update FSM state for cat interaction ────────
      const timeUntilBraking = config.brakingStartTime - elapsed;
      this.addTimer(timeUntilBraking * 1000, () => {
        this.setState('BRAKING');

        const remainingUntilStop = config.stopTime - (this.audio.ctx.currentTime - this.audioStartCtxTime);
        // Do NOT trigger a new onMove here. Let the original smooth animation continue.

        // ── t = stopTime: train at full stop ──────────────────────────────────
        this.addTimer(remainingUntilStop * 1000, () => {
          this.audio.stop('arrival', 0.05); // arrival audio naturally ends here
          this.setState('STOPPED');
          this.beginDoorOpen(config, direction);
        });
      });
    });
  }

  private beginDoorOpen(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('DOORS_OPEN_AUDIO');

    if (config.doorOpenAudioUrl && config.doorOpenAudioDuration !== null) {
      // COMMUTER: play separate door-open sound
      let doorOpenFired = false;
      const onDoorOpenEnded = () => {
        if (doorOpenFired) return;
        doorOpenFired = true;
        this.beginDwell(config, direction);
      };

      this.audio.play('door', config.doorOpenAudioUrl, config.doorGain, {
        fadeInSec: FADE_IN_SEC,
        onEnded: onDoorOpenEnded,
      });

      // Fallback: if audio.onEnded never fires, proceed after expected duration
      this.addTimer((config.doorOpenAudioDuration + 0.6) * 1000, onDoorOpenEnded);
    } else {
      // BULLET: door-open already in arrival audio — just transition to dwell
      this.addTimer(200, () => this.beginDwell(config, direction));
    }
  }

  private beginDwell(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('DOORS_OPEN_WAIT');

    const dwellMs = config.minDwellMs + Math.random() * (config.maxDwellMs - config.minDwellMs);
    this.dwellEndTime = Date.now() + dwellMs;

    this.dwellTimerId = setTimeout(() => {
      this.dwellTimerId = null;
      if (this.disposed) return;
      this.beginDoorClose(config, direction);
    }, dwellMs);
  }

  private beginDoorClose(
    config?: TrainTypeConfig,
    direction?: 'left' | 'right',
  ): void {
    const cfg = config ?? this.currentConfig!;
    const dir = direction ?? this.currentDirection;

    this.setState('DOORS_CLOSE_AUDIO');

    let doorCloseFired = false;
    const onDoorCloseEnded = () => {
      if (doorCloseFired) return;
      doorCloseFired = true;
      this.beginMechanicalDelay(cfg, dir);
    };

    this.audio.play('door', cfg.doorCloseAudioUrl, cfg.doorGain, {
      fadeInSec: FADE_IN_SEC,
      onEnded: onDoorCloseEnded,
    });

    // Fallback
    this.addTimer((cfg.doorCloseAudioDuration + 0.6) * 1000, onDoorCloseEnded);
  }

  private beginMechanicalDelay(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('PRE_DEPART_DELAY');

    this.addTimer(config.mechanicalDelayMs, () => {
      this.beginDeparture(config, direction);
    });
  }

  private beginDeparture(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('DEPARTING');

    const screenW = this.callbacks.getScreenWidth();
    const trainW  = this.callbacks.getTrainWidth();
    const dX = this.departX(direction, screenW, trainW);
    const ease = config.id === 'TGV' ? EASE_DEPART_BULLET : EASE_DEPART_COMMUTER;

    // Departure audio starts EXACTLY when wheels begin rolling
    this.audio.play('departure', config.departureAudioUrl, config.departureGain, {
      fadeInSec: FADE_IN_SEC,
      fadeOutSec: 0.25, // natural fade at end of audio
    });

    // Train accelerates away — animation duration matches departure audio duration
    this.callbacks.onMove({
      x: dX,
      durationSec: config.departureAudioDuration,
      ease,
    });

    // Train is well off-screen long before departure audio ends.
    // We wait the full audio duration to let it finish naturally, then add a 1.5s buffer
    // to ensure Framer Motion has 100% completed its exit and the train doesn't disappear prematurely.
    this.addTimer((config.departureAudioDuration + 1.5) * 1000, () => {
      this.audio.stop('departure', FADE_OUT_SEC);
      this.setState('OFFSCREEN');
      this.enterCooldown();
    });
  }

  // ─── PASS Sequence ───────────────────────────────────────────────────────────

  /**
   * Full pass-by sequence for COMMUTER_PASS and BULLET_PASS.
   *
   * Timeline:
   *   t=0                → pass-by audio starts, train at spawn (invisible)
   *   t=passAudioLeadTime→ train enters viewport at constant speed (PASSING)
   *   t=audio_midpoint   → train at screen center (max audio loudness)
   *   t=crossing_end     → train exits opposite side
   *   t=audio_end        → audio fades out naturally → OFFSCREEN → COOLDOWN
   */
  private runPass(config: TrainTypeConfig, direction: 'left' | 'right'): void {
    this.setState('AUDIO_LEAD');

    // Start pass-by audio (will fade out naturally at end)
    this.audio.play('pass', config.passByAudioUrl, config.passByGain, {
      fadeInSec: FADE_IN_SEC,
      fadeOutSec: FADE_OUT_SEC,
    });

    // ── t = passAudioLeadTime: train enters viewport ──────────────────────────
    this.addTimer(config.passAudioLeadTime * 1000, () => {
      this.setState('PASSING');

      const screenW = this.callbacks.getScreenWidth();
      const trainW  = this.callbacks.getTrainWidth();

      const sX = this.spawnX(direction, screenW, trainW);
      const dX = this.departX(direction, screenW, trainW);

      // Constant-speed crossing
      this.callbacks.onMove({
        x: dX,
        durationSec: config.passCrossingDurationSec,
        ease: 'linear',
      });

      // When the train exits (end of crossing), transition to OFFSCREEN.
      // Pass-by audio continues naturally for a moment after the train exits.
      this.addTimer(config.passCrossingDurationSec * 1000, () => {
        // Train is off-screen; let audio finish and fade out naturally
        const audioRemainingMs =
          (config.passByAudioDuration - config.passAudioLeadTime - config.passCrossingDurationSec) * 1000;

        this.addTimer(Math.max(0, audioRemainingMs + 500), () => {
          this.audio.stop('pass', FADE_OUT_SEC);
          this.setState('OFFSCREEN');
          this.enterCooldown();
        });
      });
    });
  }

  // ─── Suppress unused variable warning ─────────────────────────────────────
  // (sX is calculated for documentation purposes in runPass; actual spawn is
  //  already set before runPass is called in scheduleNextEvent)
}
