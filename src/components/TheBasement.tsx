import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCat } from './LivingCats/PixelCat';
import { addEcho, hasEcho } from '../lib/echoes';
import { useExperienceStore } from '../lib/store';

const BOX_LABELS = [
  'Maybe Later',
  'Don\'t Throw Away',
  'Old Ideas',
  'Version 2',
  'Unused Ideas',
  'Broken Endings',
  'Cat Paperwork',
  'Old Music',
  'Things We Couldn\'t Explain',
  'Visitor Dreams',
  'Rain Sounds',
  'Very Important Stuff',
  'Probably Nothing'
];

const OBJECT_LABELS = [
  'Nobody touched this in months.',
  'Still works.',
  'Probably important.',
  'We should clean this.',
  'We forgot why this is here.',
  'Do not remove.',
  'Some things end up here.',
  'We\'ll sort this out eventually.',
  'The cat has seen this before.',
  'Still waiting.',
  'Handle with care.',
  'We almost threw this away.'
];

const SHELF_ITEMS = [
  'A cracked mug.',
  'A cassette.',
  'A floppy disk.',
  'A flashlight.',
  'A tiny rubber duck.',
  'Half a chess board.',
  'A folded map.',
  'An old keyboard.',
  'A postcard.',
  'A Polaroid.'
];

const WALL_NOTES: React.ReactNode[] = [
  'Back in five minutes.',
  'We never came back.',
  'The cats know.',
  'If you\'re reading this,\nyou\'ve gone too far.',
  <a href="/notices" className="hover:text-white/60 transition-colors cursor-pointer">A loose piece of paper.</a>
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const useRandomElements = <T,>(arr: T[], count: number): T[] => {
  const [elements, setElements] = useState<T[]>([]);
  useEffect(() => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    setElements(shuffled.slice(0, count));
  }, [arr, count]);
  return elements;
};

// Procedural Audio Hook
const useBasementAudio = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    // Only init on interaction to bypass autoplay policies
    const initAudio = () => {
      if (audioCtxRef.current) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      // 1. Room Tone / Hum
      const humOsc = ctx.createOscillator();
      humOsc.type = 'sine';
      humOsc.frequency.value = 60; // 60Hz hum
      const humGain = ctx.createGain();
      humGain.gain.value = 0.02;
      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();

      // 2. Distant Ventilation (Noise)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise approximation
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      
      // Filter for ventilation sound
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.value = 400; // Muffled
      
      const ventGain = ctx.createGain();
      ventGain.gain.value = 0.05;

      noiseSource.connect(biquadFilter);
      biquadFilter.connect(ventGain);
      ventGain.connect(ctx.destination);
      noiseSource.start();

      // 3. Occasional "wood creak" or "record player static"
      // Simulated by occasional bursts of filtered noise
      const staticInterval = setInterval(() => {
        if (Math.random() < 0.3) {
          const staticGain = ctx.createGain();
          staticGain.gain.setValueAtTime(0, ctx.currentTime);
          staticGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.1);
          staticGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          
          const staticFilter = ctx.createBiquadFilter();
          staticFilter.type = 'highpass';
          staticFilter.frequency.value = 1000;
          
          const sNoise = ctx.createBufferSource();
          sNoise.buffer = noiseBuffer;
          sNoise.connect(staticFilter);
          staticFilter.connect(staticGain);
          staticGain.connect(ctx.destination);
          sNoise.start();
          sNoise.stop(ctx.currentTime + 0.6);
        }
      }, 10000);

      return () => {
        humOsc.stop();
        noiseSource.stop();
        humOsc.disconnect();
        noiseSource.disconnect();
        clearInterval(staticInterval);
        ctx.close();
      };
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('scroll', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('scroll', initAudio);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);
};

export default function TheBasement() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  
  // Rare Events
  const [isDark, setIsDark] = useState(false); // Bulb flickering
  const [elevatorOpen, setElevatorOpen] = useState(false);
  const [hiddenTextVisible, setHiddenTextVisible] = useState(false);
  
  // Mouse tracking for torch
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current && e.touches.length > 0) {
      containerRef.current.style.setProperty('--mouse-x', `${e.touches[0].clientX}px`);
      containerRef.current.style.setProperty('--mouse-y', `${e.touches[0].clientY}px`);
    }
  };

  // Hydration state
  const boxes = useRandomElements(BOX_LABELS, 6);
  const objects = useRandomElements(OBJECT_LABELS, 4);
  const shelves = useRandomElements(SHELF_ITEMS, 5);
  
  const dynamicWallNotes = useMemo(() => {
    const notes = [...WALL_NOTES];
    if (hasEcho('answered_telephone')) {
      notes.push('The lines are disconnected.');
    }
    if (hasEcho('tarot_the_hermit')) {
      notes.push('Someone was looking for this.');
    }
    return notes;
  }, []);
  const wallNote = useRandomElements(dynamicWallNotes, 1)[0];

  // Random Cats
  const [catPositions, setCatPositions] = useState<{id: number, type: string, top: string, left: string}[]>([]);

  useBasementAudio();

  useEffect(() => {
    setMounted(true);
    addEcho('visited_basement');
    useExperienceStore.getState().incrementCuriosity();
    
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Initial cats
    const cats = [];
    const eyesChance = hasEcho('tarot_the_moon') ? 0.45 : 0.3;
    const walkingChance = hasEcho('tarot_the_fool') ? 0.35 : 0.2;
    
    if (Math.random() < 0.4) {
      cats.push({ id: 1, type: 'sleeping', top: '75%', left: '10%' });
    }
    if (Math.random() < eyesChance) {
      cats.push({ id: 2, type: 'eyes', top: '30%', left: '80%' });
    }
    if (Math.random() < walkingChance) {
      cats.push({ id: 3, type: 'walking', top: '15%', left: '60%' }); // Walking behind shelf
    }
    setCatPositions(cats);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Rare events loop
    const rareEventLoop = setInterval(() => {
      const r = Math.random();
      
      const lightsOutChance = hasEcho('tarot_the_tower') ? 0.015 : 0.005;
      
      // Light goes out for 5s
      if (r < lightsOutChance && !isDark) {
        setIsDark(true);
        setTimeout(() => setIsDark(false), 5000);
      }
      
      // 0.1% Tiny elevator door opens
      if (r < 0.006 && r >= 0.005 && !elevatorOpen) {
        setElevatorOpen(true);
        setTimeout(() => setElevatorOpen(false), 8000);
      }

      // 0.01% Tiny hidden text
      if (r < 0.0001 && !hiddenTextVisible) {
        setHiddenTextVisible(true);
        setTimeout(() => setHiddenTextVisible(false), 15000);
      }

    }, 2000);

    return () => clearInterval(rareEventLoop);
  }, [mounted, isDark, elevatorOpen, hiddenTextVisible]);

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
      className="min-h-[250dvh] bg-[#020202] text-white/30 font-mono select-none relative overflow-x-hidden"
    >
      
      {/* Torch Glow Layer */}
      <div 
        className="pointer-events-none fixed inset-0 z-[45]"
        style={{
          background: 'radial-gradient(circle 350px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(255, 245, 230, 0.15) 0%, rgba(255, 245, 230, 0.05) 30%, transparent 80%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Darkness Gradient Overlay (gets darker at the bottom + mouse torch mask) */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-1000"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.98) 100%)',
          opacity: isDark ? 1 : 0.8,
          maskImage: 'radial-gradient(circle 400px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), transparent 0%, rgba(0,0,0,0.4) 30%, black 80%)',
          WebkitMaskImage: 'radial-gradient(circle 400px at var(--mouse-x, 50vw) var(--mouse-y, 50vh), transparent 0%, rgba(0,0,0,0.4) 30%, black 80%)'
        }}
      />

      {/* The Bulb (Top Light Source) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none z-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-white/20 origin-top ${isDark ? 'opacity-0' : 'opacity-100'} transition-opacity`}></div>
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 w-3 h-4 rounded-full bg-[#ffeedd] ${isDark ? 'opacity-5' : 'opacity-60 blur-sm shadow-[0_0_100px_40px_rgba(255,238,221,0.15)]'} transition-all duration-300`}></div>
      </div>

      {/* Timestamp */}
      <div className="fixed top-4 left-4 text-[9px] tracking-widest text-white/20 z-10 opacity-50">
        {time}
      </div>

      {/* Hidden Text Rare Event */}
      <AnimatePresence>
        {hiddenTextVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 text-[8px] text-white/20 tracking-widest text-center whitespace-pre-line z-10"
          >
            We've been down here<br/>
            longer than we remember.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative z-10 pt-48 pb-64 px-8 sm:px-24 max-w-5xl mx-auto flex flex-col gap-48">

        {/* Intro */}
        <div className="text-xs tracking-widest text-center italic text-white/20">
          <p>the basement.</p>
        </div>

        {/* Section: The Wall */}
        <div className="relative h-64 border-l border-white/[0.02] pl-12 flex items-center">
          {wallNote && (
            <div className="text-[10px] uppercase tracking-widest text-white/30 p-4 border border-white/5 bg-white/[0.01] rotate-1">
              {wallNote}
            </div>
          )}
          
          <div className="absolute top-12 right-12 opacity-10">
            <div className="text-[8px] uppercase tracking-[0.3em]">Old Record Player</div>
            <div className="text-[10px] text-white/40 mt-2">"{objects[0] || OBJECT_LABELS[0]}"</div>
          </div>
        </div>

        {/* Section: The Shelves */}
        <div className="relative">
          <div className="border-b border-white/[0.05] w-full max-w-xl mx-auto h-12 relative flex items-end justify-between px-8 pb-2">
             <div className="text-[9px] tracking-widest text-white/20">{shelves[0]}</div>
             <div className="text-[9px] tracking-widest text-white/20">{shelves[1]}</div>
             
             {/* Cat behind shelf */}
             {catPositions.some(c => c.type === 'walking') && (
               <div className="absolute bottom-2 left-1/3 w-8 h-8 opacity-10 -z-10">
                 <PixelCat state="walking_right" />
               </div>
             )}
          </div>
          <div className="border-b border-white/[0.03] w-full max-w-lg mx-auto h-24 relative flex items-end justify-around px-8 pb-2">
             <div className="text-[9px] tracking-widest text-white/20">{shelves[2]}</div>
             
             {/* Archive Connection */}
             <div className="absolute -right-32 bottom-0 w-48 h-64 border border-white/[0.05] flex items-center justify-center bg-[#010101]">
               <div className="text-center">
                 <div className="text-[8px] tracking-[0.4em] uppercase text-white/30 mb-2">Archive Overflow</div>
                 <div className="text-[8px] tracking-widest text-red-900/40 uppercase">Locked</div>
               </div>
             </div>
          </div>
          <div className="border-b border-white/[0.02] w-full max-w-md mx-auto h-24 relative flex items-end justify-center pb-2">
             <div className="text-[9px] tracking-widest text-white/20">{shelves[3]}</div>
          </div>
        </div>

        {/* Section: Lost & Found */}
        <div className="flex justify-start pl-8 sm:pl-32 mt-32">
          <div className="border border-dashed border-white/[0.05] p-8 relative">
            <div className="text-[10px] text-white/40 mb-4">{shelves[4]}</div>
            <div className="absolute -bottom-3 -right-3 bg-[#030303] px-2 py-1 border border-white/10 text-[8px] uppercase tracking-widest text-white/40 rotate-[-5deg]">
              Archived Permanently.
            </div>
          </div>
        </div>

        {/* Section: Stacks of Boxes */}
        <div className="relative h-96 mt-48">
          <div className="absolute bottom-0 left-12 border border-white/[0.02] w-32 h-24 flex items-center justify-center text-center">
            <span className="text-[8px] tracking-widest uppercase text-white/20">{boxes[0]}</span>
            {catPositions.some(c => c.type === 'sleeping') && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 opacity-20">
                <PixelCat state="sleeping" />
              </div>
            )}
          </div>
          
          <div className="absolute bottom-24 left-16 border border-white/[0.03] w-24 h-20 flex items-center justify-center text-center">
            <span className="text-[8px] tracking-widest uppercase text-white/20">{boxes[1]}</span>
          </div>

          <div className="absolute bottom-0 right-32 border border-white/[0.04] w-48 h-32 flex flex-col items-center justify-center text-center p-4">
            <span className="text-[8px] tracking-widest uppercase text-white/20 mb-4">{boxes[2]}</span>
            <span className="text-[8px] text-white/30 italic">"{objects[1] || OBJECT_LABELS[1]}"</span>
          </div>

          <div className="absolute bottom-32 right-40 border border-white/[0.02] w-20 h-16 flex items-center justify-center text-center">
            <span className="text-[8px] tracking-widest uppercase text-white/20">{boxes[3]}</span>
          </div>
        </div>

        {/* Other forgotten objects */}
        <div className="grid grid-cols-2 gap-32 mt-32 opacity-30">
          <div className="text-center">
             <div className="text-[10px] tracking-widest mb-2">Broken Visitor Counter</div>
             <div className="text-[8px] font-sans">000000</div>
          </div>
          <div className="text-center relative">
             <div className="text-[10px] tracking-widest">
               <a href="/maintenance" className="hover:text-white/60 transition-colors cursor-pointer">A ladder.</a>
             </div>
             {catPositions.some(c => c.type === 'eyes') && (
               <div className="absolute top-0 right-0 text-[10px] tracking-widest text-yellow-500/50 animate-pulse">
                 . .
               </div>
             )}
          </div>
          <div className="col-span-2 text-center mt-32">
             <div className="text-[10px] tracking-widest">A dusty window.</div>
             <div className="text-[8px] text-white/30 italic mt-2">"{objects[2] || OBJECT_LABELS[2]}"</div>
          </div>
        </div>

        {/* Tiny Elevator Event */}
        <div className="absolute top-[60%] left-4 w-12 h-16 border border-white/[0.02] flex items-end">
           <div className={`w-full bg-[#050505] transition-all duration-1000 ${elevatorOpen ? 'h-0' : 'h-full'}`}></div>
        </div>
      </div>
      
    </div>
  );
}
