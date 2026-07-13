// ─── FSM States ──────────────────────────────────────────────────────────────

/**
 * Every train event progresses through these states in strict order.
 * Only ONE state may be active at any time. No transitions may be skipped.
 */
export type FSMState =
  | 'IDLE'              // Quiet station — nothing scheduled
  | 'AUDIO_LEAD'        // Arrival/pass audio started, train completely off-screen
  | 'APPROACHING'       // Train nose crossing into viewport (entering)
  | 'BRAKING'           // Train decelerating continuously toward stop position
  | 'STOPPED'           // Train motionless at platform; arrival audio just ended
  | 'DOORS_OPEN_AUDIO'  // Door-open sound playing; train motionless
  | 'DOORS_OPEN_WAIT'   // Passenger dwell; only wind ambience heard
  | 'DOORS_CLOSE_AUDIO' // Door-close sound playing; train still motionless
  | 'PRE_DEPART_DELAY'  // Brief mechanical pause before wheels roll
  | 'DEPARTING'         // Train accelerating away; departure ambience playing
  | 'PASSING'           // Train crossing at constant speed (no stop)
  | 'OFFSCREEN'         // Train completely beyond viewport; audio fading naturally
  | 'COOLDOWN';         // 30 s quiet before next event becomes eligible

export type TrainEventType =
  | 'COMMUTER_STOP'
  | 'COMMUTER_PASS'
  | 'BULLET_STOP'
  | 'BULLET_PASS';

// ─── Train Definition ─────────────────────────────────────────────────────────

/**
 * A fully-typed configuration object for one train type.
 * Adding new train types in the future only requires adding a new config here;
 * the scheduler logic is driven entirely by these values.
 */
export interface TrainTypeConfig {
  // Identification
  id: 'TER' | 'TGV';
  /** Maps to the existing generator functions in trainGenerator.ts */
  generatorType: 'TER' | 'TGV';

  // ── Audio files ──
  arrivalAudioUrl: string;
  /** Exact duration in seconds (used for precise timing calculations) */
  arrivalAudioDuration: number;

  passByAudioUrl: string;
  passByAudioDuration: number;

  /**
   * null → door-open is already embedded in the arrival audio.
   * DO NOT play a separate door-open sound in this case.
   */
  doorOpenAudioUrl: string | null;
  doorOpenAudioDuration: number | null;

  doorCloseAudioUrl: string;
  doorCloseAudioDuration: number;

  departureAudioUrl: string;
  departureAudioDuration: number;

  // ── Arrival timing (seconds relative to arrival audio t=0) ──
  /** How many seconds of audio play before the train first becomes visible */
  audioLeadTime: number;
  /** Duration of the initial entry animation (linear approach) */
  approachDuration: number;
  /** When braking animation begins (interrupts the approach animation) */
  brakingStartTime: number;
  /** When the train reaches a complete stop — equals arrivalAudioDuration */
  stopTime: number;

  // ── Pass-by timing ──
  /** Seconds of audio before the passing train enters the viewport */
  passAudioLeadTime: number;
  /**
   * Full crossing duration in seconds (off-screen entry to off-screen exit).
   * Calculated so the audio peak coincides with x=0 (center of screen).
   */
  passCrossingDurationSec: number;

  // ── Station dwell ──
  mechanicalDelayMs: number;
  minDwellMs: number;
  maxDwellMs: number;

  // ── Gain (normalized perceived loudness, applied on top of AudioManager master) ──
  arrivalGain: number;
  passByGain: number;
  doorGain: number;
  departureGain: number;
}

// ─── Train Configs ────────────────────────────────────────────────────────────

export const COMMUTER_CONFIG: TrainTypeConfig = {
  id: 'TER',
  generatorType: 'TER',

  arrivalAudioUrl: '/train-sounds/doktorkleinmusic-electric-train-arrival-and-stop-realistic-urban-soundscape-326648.mp3',
  arrivalAudioDuration: 30.302,

  passByAudioUrl: '/train-sounds/mixkit-passenger-train-passing-by-1635.wav',
  passByAudioDuration: 18.306,

  // Commuter arrival does NOT include door-open — play it separately after stop
  doorOpenAudioUrl: '/train-sounds/mixkit-train-door-open-1637.wav',
  doorOpenAudioDuration: 2.541,

  doorCloseAudioUrl: '/train-sounds/mixkit-lightweight-sliding-door-close-182.wav',
  doorCloseAudioDuration: 2.875,

  departureAudioUrl: '/train-sounds/mixkit-train-station-depart-ambience-1639.wav',
  departureAudioDuration: 27.036,

  // At t=2s audio has been playing 2s, train nose enters viewport
  audioLeadTime: 2.0,
  // Linear entry from t=2s to t=6s (4 seconds)
  approachDuration: 4.0,
  // Braking begins at t=6s, train smoothly decelerates until t=30.302s
  brakingStartTime: 6.0,
  stopTime: 30.302,

  passAudioLeadTime: 2.0,
  // Crossing takes 14s; peak at t=2+7=9s ≈ audio midpoint (9.153s)
  passCrossingDurationSec: 14.0,

  mechanicalDelayMs: 400,
  minDwellMs: 6000,
  maxDwellMs: 9000,

  arrivalGain: 0.80,
  passByGain: 0.85,
  doorGain: 0.65,
  departureGain: 0.72,
};

export const BULLET_CONFIG: TrainTypeConfig = {
  id: 'TGV',
  generatorType: 'TGV',

  arrivalAudioUrl: '/train-sounds/train arriving 2.mp3',
  arrivalAudioDuration: 24.512,

  passByAudioUrl: '/train-sounds/mixkit-train-passing-by-with-horn-1632.wav',
  passByAudioDuration: 19.964,

  // Bullet arrival audio already contains door-open — do NOT play another
  doorOpenAudioUrl: null,
  doorOpenAudioDuration: null,

  doorCloseAudioUrl: '/train-sounds/mixkit-train-door-close-1638.wav',
  doorCloseAudioDuration: 3.516,

  departureAudioUrl: '/train-sounds/mixkit-train-station-depart-ambience-1639.wav',
  departureAudioDuration: 27.036,

  // Bullet glides in faster; visible at t=2s
  audioLeadTime: 2.0,
  approachDuration: 3.0,
  brakingStartTime: 5.0,
  stopTime: 24.512,

  passAudioLeadTime: 2.0,
  // Crossing takes 16s; center at t=2+8=10s ≈ horn peak; audio ends at 19.964s (3.964s after exit)
  passCrossingDurationSec: 16.0,

  mechanicalDelayMs: 500,
  minDwellMs: 5000,
  maxDwellMs: 8000,

  arrivalGain: 0.80,
  passByGain: 0.85,
  doorGain: 0.65,
  departureGain: 0.72,
};

// ─── Scheduler Constants ──────────────────────────────────────────────────────

/** Mandatory quiet period after every train event (ms) */
export const COOLDOWN_DURATION_MS = 30_000;

/** Applied to ALL non-looping sounds to prevent clicks */
export const FADE_IN_SEC = 0.2;
export const FADE_OUT_SEC = 0.2;

/** Wind ambience target volume (always running, never interrupted) */
export const WIND_GAIN = 0.22;
/** Wind ambience fade-in duration on first play (seconds) */
export const WIND_FADE_IN_SEC = 3.0;

/** Weighted probability for each event type (must sum to 1.0) */
export const EVENT_WEIGHTS: Record<TrainEventType, number> = {
  COMMUTER_STOP: 0.30,
  COMMUTER_PASS: 0.20,
  BULLET_STOP:   0.30,
  BULLET_PASS:   0.20,
};

/** Scheduler will not allow the same event type more than N times in a row */
export const MAX_REPEAT_COUNT = 2;

// ─── Inter-system Communication ───────────────────────────────────────────────

/**
 * The ONLY way the scheduler moves the train.
 * Framer Motion's controls.start() is called with these values.
 */
export interface MoveCommand {
  /** Target x (pixels in Framer Motion coordinate space) */
  x: number;
  /** Animation duration in seconds */
  durationSec: number;
  /** Framer Motion easing: named string or cubic-bezier [p1x,p1y,p2x,p2y] */
  ease: string | [number, number, number, number];
}

/**
 * All callbacks the scheduler needs from the React host.
 * None of these may be undefined at runtime.
 */
export interface SchedulerCallbacks {
  /** Notify React of FSM state changes (for cat behaviour, UI, etc.) */
  onStateChange: (state: FSMState) => void;
  /** Request a new train type + direction. React re-renders Train component. */
  onTrainSetup: (config: TrainTypeConfig, direction: 'left' | 'right', event: TrainEventType) => void;
  /** Move the train using Framer Motion interpolation */
  onMove: (cmd: MoveCommand) => void;
  /** Instantly reposition the train (no animation) */
  onSet: (x: number) => void;
  /** Dynamically read the train's current layout width from the DOM */
  getTrainWidth: () => number;
  /** Dynamically read the viewport width */
  getScreenWidth: () => number;
}

// ─── Debug ────────────────────────────────────────────────────────────────────

export interface DebugInfo {
  fsmState: FSMState;
  eventType: TrainEventType | null;
  configId: string | null;
  direction: 'left' | 'right';
  schedulerLocked: boolean;
  cooldownRemainingMs: number;
  dwellRemainingMs: number;
  gainValues: Record<string, number>;
  audioElapsedSec: number;
  audioTotalSec: number;
}
