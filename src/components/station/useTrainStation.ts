import { useEffect, useRef, useState, useCallback } from 'react';
import { useAnimationControls } from 'framer-motion';

import { AudioManager } from './AudioManager';
import { TrainScheduler } from './TrainScheduler';
import type {
  FSMState,
  TrainEventType,
  TrainTypeConfig,
  MoveCommand,
  DebugInfo,
} from './stationTypes';

// ─── Audio file manifest ──────────────────────────────────────────────────────

const WIND_URL = '/environment/Rustle of leaves in the wind.mp3';

const ALL_AUDIO_URLS = [
  '/train-sounds/doktorkleinmusic-electric-train-arrival-and-stop-realistic-urban-soundscape-326648.mp3',
  '/train-sounds/train arriving 2.mp3',
  '/train-sounds/mixkit-train-door-open-1637.wav',
  '/train-sounds/mixkit-lightweight-sliding-door-close-182.wav',
  '/train-sounds/mixkit-train-door-close-1638.wav',
  '/train-sounds/mixkit-train-station-depart-ambience-1639.wav',
  '/train-sounds/mixkit-passenger-train-passing-by-1635.wav',
  '/train-sounds/mixkit-train-passing-by-with-horn-1632.wav',
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface TrainStationState {
  /** Framer Motion animation controls — attach to the motion.div */
  controls: ReturnType<typeof useAnimationControls>;
  /** Ref to measure actual DOM width of the motion.div */
  motionDivRef: React.RefObject<HTMLDivElement | null>;

  /** Current FSM state (for cat behaviour, boarding UI, debug) */
  fsmState: FSMState;
  /** Which train type is currently rendered */
  trainType: 'TER' | 'TGV';
  /** Direction of current train */
  direction: 'left' | 'right';
  /** Whether the user has boarded (triggers fade-to-black in TheStation) */
  boarded: boolean;

  /**
   * Call this after any user gesture (click / keydown / etc.).
   * Creates the AudioContext and starts the wind ambience.
   * Calling it multiple times is safe (idempotent).
   */
  initStation: () => void;

  /**
   * Notify the scheduler that the user boarded.
   * Valid only when fsmState is STOPPED, DOORS_OPEN_AUDIO, or DOORS_OPEN_WAIT.
   */
  handleBoard: () => void;

  /** Whether the train wagons are currently interactable for boarding */
  canBoard: boolean;

  /** Reset boarded state to false */
  resetBoarding: () => void;

  /** Time-of-day audio adjustment — call whenever timeOfDay changes */
  setTimeOfDay: (tod: 'morning' | 'afternoon' | 'evening' | 'night') => void;

  /** Adjust the volume of the station background SFX */
  setSFXVolume: (level: number, fadeSec?: number) => void;

  /** Debug snapshot — populated only in development builds */
  debugInfo: DebugInfo | null;
}

const BOARDABLE_STATES: FSMState[] = ['STOPPED', 'DOORS_OPEN_AUDIO', 'DOORS_OPEN_WAIT'];

export function useTrainStation(): TrainStationState {
  // ── Framer Motion controls ──────────────────────────────────────────────────
  const controls = useAnimationControls();
  const motionDivRef = useRef<HTMLDivElement>(null);

  // ── React state (drives UI) ─────────────────────────────────────────────────
  const [fsmState, setFsmState]     = useState<FSMState>('IDLE');
  const [trainType, setTrainType]   = useState<'TER' | 'TGV'>('TER');
  const [direction, setDirection]   = useState<'left' | 'right'>('left');
  const [boarded, setBoarded]       = useState(false);
  const [debugInfo, setDebugInfo]   = useState<DebugInfo | null>(null);

  // ── System refs (not React state — avoids unnecessary renders) ──────────────
  const audioRef     = useRef<AudioManager | null>(null);
  const schedulerRef = useRef<TrainScheduler | null>(null);
  const initializedRef = useRef(false);

  // ── Dimension callbacks ─────────────────────────────────────────────────────
  const getScreenWidth = useCallback(() => window.innerWidth, []);
  const getTrainWidth  = useCallback(
    () => motionDivRef.current?.offsetWidth ?? 0,
    []
  );

  // ── Framer Motion command handlers (called by TrainScheduler) ───────────────
  const handleMove = useCallback((cmd: MoveCommand) => {
    controls.start({
      x: cmd.x,
      transition: {
        duration: cmd.durationSec,
        ease: cmd.ease as any,
      },
    });
  }, [controls]);

  const handleSet = useCallback((x: number) => {
    controls.set({ x });
  }, [controls]);

  // ── Station Initialisation ─────────────────────────────────────────────────

  const initStation = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const audio = new AudioManager();
    audioRef.current = audio;

    // Resume AudioContext (required post-gesture in modern browsers)
    audio.resume();

    // Preload wind first, then everything else in the background
    audio.preload(WIND_URL, ALL_AUDIO_URLS).then(() => {
      if (!audioRef.current) return; // disposed during preload
      audio.startWindAmbience(WIND_URL);
    }).catch(console.error);

    const scheduler = new TrainScheduler(audio, {
      onStateChange: (state) => {
        setFsmState(state);
      },
      onTrainSetup: (config: TrainTypeConfig, dir: 'left' | 'right', _event: TrainEventType) => {
        setTrainType(config.generatorType);
        setDirection(dir);
        setBoarded(false);
      },
      onMove: handleMove,
      onSet: handleSet,
      getTrainWidth,
      getScreenWidth,
    });

    schedulerRef.current = scheduler;
    scheduler.start();
  }, [handleMove, handleSet, getTrainWidth, getScreenWidth]);

  // ── Boarding ────────────────────────────────────────────────────────────────

  const handleBoard = useCallback(() => {
    if (!BOARDABLE_STATES.includes(fsmState)) return;
    setBoarded(true);
    schedulerRef.current?.triggerBoarding();
  }, [fsmState]);

  const resetBoarding = useCallback(() => {
    setBoarded(false);
  }, []);

  // ── Time-of-Day & Volume ──────────────────────────────────────────────────

  const setTimeOfDay = useCallback((tod: 'morning' | 'afternoon' | 'evening' | 'night') => {
    audioRef.current?.setTimeOfDay(tod);
  }, []);

  const setSFXVolume = useCallback((level: number, fadeSec = 1.0) => {
    audioRef.current?.setSFXVolume(level, fadeSec);
  }, []);

  // ── Auto-init immediately and handle AudioContext resume ───────────────────

  useEffect(() => {
    // Start the station simulation right away
    initStation();

    // Browsers block audio autoplay until user interaction.
    // We try to resume the audio context whenever the user finally interacts.
    const events = ['click', 'keydown', 'pointerdown', 'touchstart', 'scroll'] as const;
    const handler = () => {
      audioRef.current?.resume();
    };
    events.forEach(e => window.addEventListener(e, handler, { once: true, passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [initStation]);

  // ── Visibility Change (tab switching) ──────────────────────────────────────

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        // Resume AudioContext when user comes back — audio + timers stay in sync
        audioRef.current?.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ── Resize Observer ─────────────────────────────────────────────────────────
  // Dimensions are read dynamically at the start of each scheduler event,
  // so no action is needed here. The observer's sole purpose is to trigger
  // scheduler.onResize() for future use if the scheduler needs to react mid-event.

  useEffect(() => {
    const el = motionDivRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      schedulerRef.current?.onResize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  });

  // ── Debug Overlay (development only) ───────────────────────────────────────

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const interval = setInterval(() => {
      const sched = schedulerRef.current;
      const audio = audioRef.current;
      if (!sched || !audio) return;

      setDebugInfo({
        fsmState:           sched.getState(),
        eventType:          sched.getCurrentEvent(),
        configId:           sched.getCurrentConfig()?.id ?? null,
        direction,
        schedulerLocked:    sched.isLocked(),
        cooldownRemainingMs: sched.getCooldownRemainingMs(),
        dwellRemainingMs:    sched.getDwellRemainingMs(),
        gainValues:         audio.getGainValues(),
        audioElapsedSec:    0,  // not tracked per-clip currently
        audioTotalSec:      0,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [direction]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      schedulerRef.current?.dispose();
      audioRef.current?.dispose();
      schedulerRef.current = null;
      audioRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    controls,
    motionDivRef,
    fsmState,
    trainType,
    direction,
    boarded,
    initStation,
    handleBoard,
    canBoard: BOARDABLE_STATES.includes(fsmState),
    resetBoarding,
    setTimeOfDay,
    setSFXVolume,
    debugInfo,
  };
}
