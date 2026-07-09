import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DAILY_SCENES } from './DailyScenes';

const CAPTIONS = [
  "Nobody stayed here for long.",
  "We liked this one.",
  "It was quiet.",
  "Someone was probably here earlier.",
  "This felt like tonight.",
  "We didn't want to forget.",
  "Nothing happened.",
  "It looked nice.",
  "It is what it is.",
  "Maybe tomorrow."
];

// Simple deterministic PRNG
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getDayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function PolaroidView() {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial playing state
    if (typeof localStorage !== 'undefined') {
      setIsPlaying(localStorage.getItem('okayimbored_playing') === 'true');
    }

    const handleAudioStateChange = () => {
      setIsPlaying(localStorage.getItem('okayimbored_playing') === 'true');
    };

    window.addEventListener('audio:state_change', handleAudioStateChange);
    return () => window.removeEventListener('audio:state_change', handleAudioStateChange);
  }, []);

  const { sceneComponent, caption, isUpsideDown, isJammed, isLostAndFound } = useMemo(() => {
    const seedString = getDayString();
    let seedVal = 0;
    for (let i = 0; i < seedString.length; i++) {
      seedVal += seedString.charCodeAt(i) * (i + 1);
    }
    const rand = mulberry32(seedVal);

    // Roll rare events
    const eventRoll = rand();
    let jammed = false;
    let upsideDown = false;
    let lostAndFound = false;

    if (eventRoll < 0.01) {
      jammed = true;
    } else if (eventRoll < 0.011) {
      upsideDown = true;
    }

    if (rand() < 0.02) {
      lostAndFound = true;
    }

    const Scene = DAILY_SCENES[Math.floor(rand() * DAILY_SCENES.length)];
    const chosenCaption = jammed 
      ? "We'll try again tomorrow." 
      : lostAndFound
        ? "Found near the Lost & Found."
        : CAPTIONS[Math.floor(rand() * CAPTIONS.length)];

    return {
      sceneComponent: Scene,
      caption: chosenCaption,
      isUpsideDown: upsideDown,
      isJammed: jammed,
      isLostAndFound: lostAndFound
    };
  }, []);

  if (!mounted) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const SceneToRender = sceneComponent;

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden selection:bg-white/10 selection:text-white">
      
      {isJammed ? (
        <div className="absolute top-10 left-0 w-full text-center text-white/50 text-sm tracking-widest uppercase">
          Today's camera jammed.
        </div>
      ) : null}

      <motion.div 
        initial={{ opacity: 0, y: 20, rotate: isUpsideDown ? 175 : -2 }}
        animate={{ opacity: 1, y: 0, rotate: isUpsideDown ? 180 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="bg-[#fafafa] p-4 pb-12 sm:p-6 sm:pb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu flex flex-col w-[280px] sm:w-[320px] relative rounded-[2px]"
      >
        {/* Photo Area */}
        <div className="bg-[#111] aspect-square w-full relative overflow-hidden shadow-inner">
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}></div>

          {!isJammed && (
            <SceneToRender className="w-full h-full opacity-90" seed={now.getDate()} />
          )}

          {/* Glare effect */}
          <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-br from-white/10 to-transparent -translate-x-1/4 -translate-y-1/4 rotate-12 pointer-events-none"></div>
        </div>

        {/* Text Area */}
        <div className={`mt-6 flex justify-between items-end ${isUpsideDown ? 'rotate-180' : ''}`}>
          <div className="flex flex-col">
            <span className="text-[#1a1a1a] font-mono text-xs sm:text-sm font-bold tracking-widest">{dateStr}</span>
            <span className="text-[#666] font-mono text-[10px] sm:text-xs tracking-wider">{timeStr}</span>
          </div>
          <div className="text-[#666] font-mono text-[10px] sm:text-xs tracking-wider text-right max-w-[120px]">
            Today's Polaroid
          </div>
        </div>

        {/* Handwritten caption simulated with CSS */}
        <div className={`absolute bottom-4 left-0 w-full text-center text-[#2a2a2a] text-sm sm:text-base font-serif italic opacity-80 ${isUpsideDown ? 'rotate-180 top-4 bottom-auto' : ''}`}>
          {caption}
        </div>
      </motion.div>

      {isPlaying && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-16 text-center text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase"
        >
          Taken while Late Night Radio was playing.
        </motion.div>
      )}

      <button
        onClick={() => {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('okayimbored_returning_from_secret', 'true');
          }
          // Dispatch a custom event or navigate
          import('astro:transitions/client').then(({ navigate }) => navigate('/'));
        }}
        className="absolute bottom-6 text-xs font-mono text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest cursor-pointer"
      >
        go back.
      </button>
    </div>
  );
}
