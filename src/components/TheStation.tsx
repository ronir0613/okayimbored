import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from './LivingTrain/Train';
import { PixelCat } from './LivingCats/PixelCat';
import { useCatBehavior } from './LivingCats/useCatBehavior';
import { useMicroEvents } from './useMicroEvents';
import { WindLeaves } from './WindLeaves';
import { SkyDetails } from './SkyDetails';
import { PlatformLeaves } from './PlatformLeaves';
import { PleasantRiver } from './PleasantRiver';
import { CitySkyline } from './CitySkyline';
import { useTrainStation } from './station/useTrainStation';
import { DebugOverlay } from './station/DebugOverlay';
import { MusicPlayer } from './MusicPlayer';
import { SignboardScene } from './SignboardScene';
import { DoorScene } from './DoorScene';
import { ReceptionScene } from './ReceptionScene';
import MicroWidget from './MicroWidget';
import type { FSMState } from './station/stationTypes';

/**
 * Maps new FSM states to the legacy state strings that useCatBehavior and
 * PlatformLeaves check. This keeps those components working without modification.
 */
function toLegacyState(state: FSMState): string {
  switch (state) {
    case 'IDLE':              return 'WAITING_EMPTY';
    case 'COOLDOWN':          return 'WAITING_EMPTY';
    case 'AUDIO_LEAD':        return 'WAITING_EMPTY';
    case 'APPROACHING':       return 'APPROACHING';
    case 'BRAKING':           return 'BRAKING';
    case 'STOPPED':           return 'STOPPED';
    case 'DOORS_OPEN_AUDIO':  return 'DOORS_OPENING';
    case 'DOORS_OPEN_WAIT':   return 'DOORS_OPEN';
    case 'DOORS_CLOSE_AUDIO': return 'DOORS_CLOSING';
    case 'PRE_DEPART_DELAY':  return 'DOORS_CLOSING';
    case 'DEPARTING':         return 'DEPARTING_EMPTY';
    case 'PASSING':           return 'PASSING';
    case 'OFFSCREEN':         return 'OFFSCREEN';
    default:                  return 'WAITING_EMPTY';
  }
}

// ─── TheStation ───────────────────────────────────────────────────────────────

export function TheStation() {
  // ── New railway simulation system ─────────────────────────────────────────
  const {
    controls,
    motionDivRef,
    fsmState,
    trainType,
    direction,
    boarded,
    initStation,
    handleBoard,
    canBoard,
    resetBoarding,
    setTimeOfDay: setAudioTimeOfDay,
    setSFXVolume,
    debugInfo,
  } = useTrainStation();

  // ── Time of day (visual + audio) ──────────────────────────────────────────
  const [timeOfDayClass, setTimeOfDayClass] = useState('bg-[#0F2027]');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('night');
  const [isMounted, setIsMounted] = useState(false);
  const [godModeTime, setGodModeTime] = useState<'morning' | 'afternoon' | 'evening' | 'night' | null>(null);
  
  // ── Middle light state ──
  const [middleLightPhase, setMiddleLightPhase] = useState<'off' | 'flicker' | 'on'>('off');

  const legacyState = useMemo(() => toLegacyState(fsmState), [fsmState]);
  const { catState, catPosition, isVisible: isCatVisible, catWalkDuration, isBoarding, catY, catWillBoard } = useCatBehavior(legacyState);
  const { lightsFlickering, birdLanded } = useMicroEvents();
  
  const [userDeclinedBoarding, setUserDeclinedBoarding] = useState(false);
  const [scenePhase, setScenePhase] = useState<'station' | 'where' | 'transition' | 'signboard' | 'door' | 'reception'>('station');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    if (!canBoard) {
      setUserDeclinedBoarding(false);
    }
  }, [canBoard]);

  // ── Scene Sequence Effect ───────────────────────────────────────────────
  const [sceneTriggered, setSceneTriggered] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (boarded && fsmState === 'DEPARTING' && !sceneTriggered) {
      setSceneTriggered(true);
      timeoutsRef.current = [
        setTimeout(() => setScenePhase('where'), 6000), // "Where does it go?" shows at 6s
        setTimeout(() => {
          // At 10s: fade out text, drop SFX audio, set music to 0.1
          setScenePhase('transition');
          setSFXVolume(0, 5);
        }, 10000),
        setTimeout(() => setScenePhase('signboard'), 13000)
      ];
    }
  }, [boarded, fsmState, setSFXVolume, sceneTriggered]);

  useEffect(() => {
    // When returning to station explicitly
    if (!boarded && sceneTriggered) {
      setSceneTriggered(false);
      setScenePhase('station');
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    }
  }, [boarded, sceneTriggered]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  // ── Mount effect ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Update time of day every minute ───────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (godModeTime) {
        setTimeOfDay(godModeTime);
        if (godModeTime === 'morning') setTimeOfDayClass('bg-gradient-to-b from-sky-300 via-orange-50 to-amber-100');
        else if (godModeTime === 'afternoon') setTimeOfDayClass('bg-gradient-to-b from-blue-400 to-sky-200');
        else if (godModeTime === 'evening') setTimeOfDayClass('bg-gradient-to-b from-indigo-800 via-purple-400 to-orange-300');
        else setTimeOfDayClass('bg-gradient-to-b from-[#040812] via-[#0A1226] to-[#121E3B]');
        return;
      }

      const h = new Date().getHours();
      if (h >= 6 && h < 12) {
        setTimeOfDay('morning');
        setTimeOfDayClass('bg-gradient-to-b from-sky-300 via-orange-50 to-amber-100');
      } else if (h >= 12 && h < 17) {
        setTimeOfDay('afternoon');
        setTimeOfDayClass('bg-gradient-to-b from-blue-400 to-sky-200');
      } else if (h >= 17 && h < 20) {
        setTimeOfDay('evening');
        setTimeOfDayClass('bg-gradient-to-b from-indigo-800 via-purple-400 to-orange-300');
      } else {
        setTimeOfDay('night');
        setTimeOfDayClass('bg-gradient-to-b from-[#040812] via-[#0A1226] to-[#121E3B]');
      }
    };
    update();
    const iv = setInterval(update, 60_000);
    return () => clearInterval(iv);
  }, [godModeTime]);

  // Sync time of day to AudioManager
  useEffect(() => {
    setAudioTimeOfDay(timeOfDay);
  }, [timeOfDay, setAudioTimeOfDay]);

  // ── Middle light lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const loop = () => {
      setMiddleLightPhase(current => {
        const roll = Math.random();
        if (current === 'off') {
          return roll < 0.3 ? 'flicker' : 'off';
        } else if (current === 'flicker') {
          return roll < 0.5 ? 'on' : 'off';
        } else {
          return roll < 0.4 ? 'flicker' : (roll < 0.6 ? 'off' : 'on');
        }
      });
      timeoutId = setTimeout(loop, 2000 + Math.random() * 5000);
    };
    timeoutId = setTimeout(loop, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  // ── Building colours ──────────────────────────────────────────────────────
  const getBuildingColor = useCallback((layerIndex: number) => {
    switch (timeOfDay) {
      case 'morning':
        return ({
          '-1': 'bg-[#8fb8d9]', '0': 'bg-[#7a9bb8]', '0.5': 'bg-[#678299]',
          '1': 'bg-[#546b7a]', '2': 'bg-[#40525c]', '3': 'bg-[#2c383d]',
        } as Record<string, string>)[String(layerIndex)];
      case 'afternoon':
        return ({
          '-1': 'bg-[#6fa0cc]', '0': 'bg-[#5c85aa]', '0.5': 'bg-[#4a6b8a]',
          '1': 'bg-[#375269]', '2': 'bg-[#273a4a]', '3': 'bg-[#17222b]',
        } as Record<string, string>)[String(layerIndex)];
      case 'evening':
        return ({
          '-1': 'bg-[#4c3b52]', '0': 'bg-[#3d2f42]', '0.5': 'bg-[#302533]',
          '1': 'bg-[#221a24]', '2': 'bg-[#161117]', '3': 'bg-[#0a080a]',
        } as Record<string, string>)[String(layerIndex)];
      case 'night':
      default:
        return ({
          '-1': 'bg-[#253242]', '0': 'bg-[#202b38]', '0.5': 'bg-[#1d2734]',
          '1': 'bg-[#1a2530]', '2': 'bg-[#121824]', '3': 'bg-[#0a0f16]',
        } as Record<string, string>)[String(layerIndex)];
    }
  }, [timeOfDay]);

  const isDeparting = fsmState === 'DEPARTING';

  return (
    <div
      className="flex flex-col w-full h-[100dvh] overflow-hidden select-none bg-black"
      onClick={initStation}
    >
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] z-50 mix-blend-overlay" />

      {/* Center-frame wrapper for mobile/smaller devices optimization */}
      <div className="absolute inset-x-0 mx-auto w-full min-w-[1280px] h-full flex flex-col left-1/2 -translate-x-1/2">
        
        {/* Global Ambient Reflection */}
        <div className="absolute inset-0 z-[45] pointer-events-none overflow-hidden">
          {(timeOfDay === 'evening' || timeOfDay === 'night') && (
            <div className={`absolute inset-0 mix-blend-screen transition-opacity duration-100 ${lightsFlickering ? 'opacity-[0.02]' : 'opacity-10'}`}>
              <div className="w-full h-full bg-gradient-to-b from-slate-200/40 via-cyan-100/5 to-transparent" />
            </div>
          )}
        </div>

        {/* ─── Simple Platform Light Effect (z-[55]) ───────────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] z-[55] pointer-events-none overflow-hidden">
          {(timeOfDay === 'evening' || timeOfDay === 'night') && (
            <div className={`absolute inset-0 bg-gradient-to-t from-slate-200/10 to-transparent mix-blend-overlay transition-opacity duration-100 ${lightsFlickering ? 'opacity-30' : 'opacity-80'}`} />
          )}
        </div>

        {/* Wind Leaves Layer */}
        <WindLeaves timeOfDay={timeOfDay} />

      {/* ─── Layer 1: Atmosphere (Top ~40%) ─────────────────────────────────── */}
      <div className={`relative w-full h-[40dvh] transition-colors duration-[5000ms] ${timeOfDayClass} flex flex-col justify-end overflow-hidden shrink-0`}>

        <SkyDetails timeOfDay={timeOfDay} />

        {/* Morning Mist */}
        {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 mix-blend-screen blur-lg pointer-events-none"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Stars (night / evening) */}
        {isMounted && (timeOfDay === 'night' || timeOfDay === 'evening') && (
          <div className={`absolute inset-0 transition-opacity duration-3000 ${timeOfDay === 'night' ? 'opacity-50' : 'opacity-10'} pointer-events-none`} style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)' }}>
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 1.5 + 0.5}px`,
                  height: `${Math.random() * 1.5 + 0.5}px`,
                  opacity: Math.random() * 0.6 + 0.1,
                }}
                animate={{ opacity: [Math.random() * 0.4 + 0.1, Math.random() * 0.8 + 0.2, Math.random() * 0.4 + 0.1] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}

        {/* City skyline */}
        <CitySkyline timeOfDay={timeOfDay} getBuildingColor={getBuildingColor} />

        {/* Waterfront Promenade Streetlights & City Glow */}
        {(timeOfDay === 'night' || timeOfDay === 'evening') && (
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-500/20 via-orange-400/5 to-transparent pointer-events-none z-10 blur-2xl mix-blend-screen opacity-70" />
        )}
        <div className="absolute bottom-0 inset-x-0 w-full h-2 pointer-events-none z-20 flex justify-between px-2 sm:px-4 opacity-80">
          {[...Array(50)].map((_, i) => (
            <div key={`sl-${i}`} className="relative flex flex-col items-center justify-end h-full">
              {(timeOfDay === 'night' || timeOfDay === 'evening') && (
                <div className="absolute top-[1px] w-[1.5px] h-[1.5px] bg-amber-100 shadow-[0_0_6px_rgba(251,191,36,1)] rounded-full" />
              )}
              <div className="w-[1px] h-[4px] bg-[#0a0f16]" />
            </div>
          ))}
        </div>

        {/* Signal Lights */}
        <div className="absolute bottom-1 inset-x-0 w-full h-2 pointer-events-none z-20 opacity-80">
          <div className="absolute bottom-0 right-[20%] w-[3px] h-[3px] rounded-full bg-red-500/90 blur-[0.5px]" />
          <div className="absolute bottom-0 left-[35%] w-[3px] h-[3px] rounded-full bg-orange-500/90 blur-[0.5px]" />
        </div>
      </div>

      {/* ─── Layer 2: Train & River (Middle ~40%) ───────────────────────────── */}
      <div className="relative w-full h-[40dvh] overflow-hidden flex items-end z-30 transition-colors duration-5000">

        {/* River Background */}
        <PleasantRiver timeOfDay={timeOfDay} />

        {/* Subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none mix-blend-multiply" />

        {/* ── THE TRAIN ──────────────────────────────────────────────────────── */}
        {/*
          The motion.div is positioned in a flex justify-center container.
          x=0 → train visually centered on screen (platform alignment).
          Large positive x → off-screen right (left-moving train spawn).
          Large negative x → off-screen left (left-moving train departure).
          Framer Motion's controls.start() / controls.set() drive this externally
          via the TrainScheduler → useTrainStation hook chain.
          No key prop: the Train component re-renders its wagons when trainType changes.
        */}
        <div className="absolute bottom-[-224px] w-full h-[1024px] pointer-events-none flex justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (fsmState === 'IDLE' || fsmState === 'COOLDOWN') ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex justify-center"
          >
            <motion.div
              ref={motionDivRef}
              animate={controls}
              className="w-fit h-full pointer-events-auto"
            >
            <Train
              trainType={trainType}
              direction={direction}
              speed={1}
              scale={32}
              stationary={true}
              showTracks={false}
              onBoard={handleBoard}
              isInteractable={canBoard && catWillBoard && !userDeclinedBoarding}
              timeOfDay={timeOfDay}
              className={`drop-shadow-[0_-5px_15px_rgba(0,0,0,0.5)] transition-all duration-3000 ${
                timeOfDay === 'night'
                  ? 'filter brightness-[0.45] contrast-[1.3]'
                  : 'filter brightness-[0.85] contrast-[1.1] sepia-[0.1]'
              }`}
              style={{ overflow: 'visible', width: 'fit-content' }}
            />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── Layer 3: Platform (Bottom ~20%) ───────────────────────────────── */}
      <div className={`relative w-full h-[20dvh] transition-colors duration-[5000ms] shadow-[inset_0_30px_50px_rgba(0,0,0,0.9)] z-40 overflow-hidden ${
        timeOfDay === 'morning' ? 'bg-[#18191e]' :
        timeOfDay === 'afternoon' ? 'bg-[#1e2025]' :
        timeOfDay === 'evening' ? 'bg-[#12100f]' :
        'bg-[#08080a]'
      }`}>

        {/* Platform Edge Trim */}
        <div className="absolute top-0 inset-x-0 w-full h-3 border-b-2 border-black/60 bg-white/10 pointer-events-none z-30" />
        <div className="absolute top-3 inset-x-0 w-full h-1 bg-black/40 pointer-events-none z-30" />

        {/* Platform Leaves */}
        <PlatformLeaves stationState={legacyState} trainDirection={direction} timeOfDay={timeOfDay} />

        {/* Concrete Block Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #000 2px, transparent 2px), linear-gradient(to bottom, #000 2px, transparent 2px)`,
            backgroundSize: '128px 64px',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 2px, transparent 2px)`,
              backgroundSize: '128px 64px',
              backgroundPosition: '64px 32px',
            }}
          />
        </div>

        {/* Grunge and Weathering */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay pointer-events-none" />

        {/* Platform lights */}
        <div className={`absolute top-0 inset-x-0 w-full h-full flex justify-around px-16 sm:px-32 pointer-events-none mix-blend-screen transition-opacity duration-[5000ms] opacity-30 ${lightsFlickering ? 'opacity-10' : ''}`}>
          {[1,2,3,4].map(i => (
            <div key={i} className={`w-32 sm:w-64 h-[150%] bg-gradient-to-b to-transparent blur-3xl transform -skew-x-12 origin-top transition-colors duration-[5000ms] ${
              timeOfDay === 'morning' ? 'from-amber-100/10' :
              timeOfDay === 'afternoon' ? 'from-white/5' :
              timeOfDay === 'evening' ? 'from-amber-400/15' :
              'from-blue-300/10'
            }`} />
          ))}
        </div>


        {/* Bird micro-event */}
        {birdLanded && timeOfDay !== 'night' && (
          <div className="absolute bottom-[40%] right-[15%] w-2 h-2 bg-black/60 rounded-full animate-pulse" />
        )}

        {/* The Cat */}
        {isCatVisible && (
          <div
            className="absolute z-50 origin-bottom transition-all"
            style={{
              bottom: `calc(20% + ${catY}%)`,
              left: `${catPosition}%`,
              transform: `scale(${isBoarding ? 1.25 - catY / 100 : 1.25})`,
              opacity: isBoarding && catY > 20 ? 1 - (catY - 20) / 10 : 1,
              transitionDuration: `${catState.startsWith('walking') ? catWalkDuration : 100}ms`,
              transitionTimingFunction: 'linear',
            }}
          >
            <PixelCat state={catState} />
          </div>
        )}
      </div>
      </div>

      {/* ─── Boarding Choices ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {canBoard && catWillBoard && !userDeclinedBoarding && !boarded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150px] flex gap-4 z-[100] pointer-events-auto"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleBoard(); }}
              className="bg-white text-black font-mono text-sm px-4 py-2 hover:bg-gray-200 transition-colors uppercase tracking-widest cursor-pointer border-[3px] border-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
              style={{ imageRendering: 'pixelated' }}
            >
              Enter
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setUserDeclinedBoarding(true); }}
              className="bg-white text-black font-mono text-sm px-4 py-2 hover:bg-gray-200 transition-colors uppercase tracking-widest cursor-pointer border-[3px] border-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
              style={{ imageRendering: 'pixelated' }}
            >
              No
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Boarding fade-to-black ─────────────────────────────────────────── */}
      <AnimatePresence>
        {boarded && isDeparting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4, delay: 2 }}
            className="fixed inset-0 bg-black z-[60] flex items-center justify-center pointer-events-none"
          >
            <AnimatePresence>
              {(scenePhase === 'where' || scenePhase === 'station') && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scenePhase === 'where' ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  className="text-white/30 text-sm tracking-[0.3em] font-serif uppercase"
                >
                  Where does it go?
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Post-Train Scenes (Signboard, Door, Reception) ────────────────── */}
      <AnimatePresence>
        {(scenePhase === 'signboard' || scenePhase === 'door' || scenePhase === 'reception') && (
          <motion.div
            key="persistent-black-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 bg-black z-[65] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scenePhase === 'signboard' && (
          <SignboardScene 
            key="signboard"
            onGoBack={() => {
              // User chose to go back:
              setScenePhase('station');
              resetBoarding();
              setSFXVolume(1.0, 2); // Restore SFX volume
            }}
            onFollowCat={() => {
              setScenePhase('door');
            }}
          />
        )}
        {scenePhase === 'door' && (
          <DoorScene key="door" onEnter={() => setScenePhase('reception')} />
        )}
        {scenePhase === 'reception' && (
          <ReceptionScene key="reception" onCheckIn={() => setIsCheckedIn(true)} />
        )}
      </AnimatePresence>

      {isCheckedIn && <MicroWidget className="z-[100]" />}

      {/* ─── Music Player ────────────────────────────────────────────────────── */}
      <MusicPlayer 
        setSFXVolume={setSFXVolume} 
        volumeOverride={
          (scenePhase === 'transition' || scenePhase === 'signboard') ? 0.1 : undefined
        } 
      />

      {/* ─── Development debug overlay ────────────────────────────────────── */}
      <DebugOverlay info={debugInfo} />

      {/* GOD MODE TEMPORARY OVERLAY */}
      <div className="fixed top-4 left-4 z-[999] bg-black/80 border border-white/20 p-2 text-white font-mono text-xs rounded pointer-events-auto flex flex-col">
        <div className="mb-2 font-bold text-amber-400">GOD MODE (Time)</div>
        <div className="flex gap-2">
          {['morning', 'afternoon', 'evening', 'night'].map(t => (
            <button
              key={t}
              onClick={(e) => { e.stopPropagation(); setGodModeTime(t as any); }}
              className={`px-2 py-1 rounded cursor-pointer ${godModeTime === t || (!godModeTime && timeOfDay === t) ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {t}
            </button>
          ))}
          <button 
            onClick={(e) => { e.stopPropagation(); setGodModeTime(null); }}
            className={`px-2 py-1 rounded ml-2 border border-red-500/50 cursor-pointer ${!godModeTime ? 'bg-red-500/20' : 'bg-transparent hover:bg-red-500/10'}`}
          >
            Auto
          </button>
        </div>
      </div>
    </div>
  );
}
