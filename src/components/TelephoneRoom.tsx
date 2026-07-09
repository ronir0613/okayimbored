import React, { useState, useEffect, useRef } from 'react';
import { PixelCat, type CatState } from './LivingCats/PixelCat';
import { motion, AnimatePresence } from 'framer-motion';

type RoomState = 'IDLE' | 'RINGING' | 'ANSWERED' | 'MISSED';

type CatIntegration = 'NONE' | 'SLEEPING' | 'STARING' | 'KNOCKED_OFF';

const STANDARD_CALLS = [
  ['...', '"wrong number."', 'Click.'],
  ['...', '"is the cat there?"', '...', 'Click.'],
  ['...', '"never mind."', 'Click.'],
  ['...', '"we were checking\nif anyone was still here."', 'Click.'],
  ['...', '"can you tell\nthe rooftop\nwe said hello?"', 'Click.'],
  ['...', '"thank you\nfor answering."', 'Click.'],
  ['Silence.', '15 seconds.', 'Click.'],
  ['Very quietly:', '"..."', '"good night."', 'Click.']
];

const MICROCOPY = [
  "Line still active.",
  "No voicemail.",
  "Probably important.",
  "Maybe tomorrow.",
  "Still ringing.",
  "The building has good reception."
];

export default function TelephoneRoom() {
  const [mounted, setMounted] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>('IDLE');
  const [callDialogue, setCallDialogue] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [catIntegration, setCatIntegration] = useState<CatIntegration>('NONE');
  const [microcopy, setMicrocopy] = useState('');
  
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const missedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Determine cat integration
    const rCat = Math.random();
    if (rCat < 0.15) setCatIntegration('SLEEPING');
    else if (rCat < 0.25) setCatIntegration('STARING');
    else if (rCat < 0.3) setCatIntegration('KNOCKED_OFF');

    setMicrocopy(MICROCOPY[Math.floor(Math.random() * MICROCOPY.length)]);

    // Start ring timer (reduced for testing: 3s to 8s)
    if (Math.random() > 0.05) { // 95% chance it rings eventually
      const delay = Math.floor(Math.random() * 5000) + 3000; // 3s to 8s
      ringTimeoutRef.current = setTimeout(() => {
        setRoomState('RINGING');
        
        // If not answered in 20s, miss the call
        missedTimeoutRef.current = setTimeout(() => {
          setRoomState('MISSED');
        }, 20000);
      }, delay);
    }

    return () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      if (missedTimeoutRef.current) clearTimeout(missedTimeoutRef.current);
    };
  }, []);

  // Handle playing dialogue sequence
  useEffect(() => {
    if (roomState === 'ANSWERED' && callDialogue.length > 0 && currentLineIdx < callDialogue.length) {
      const timer = setTimeout(() => {
        setCurrentLineIdx(prev => prev + 1);
      }, 2500); // 2.5s between lines
      return () => clearTimeout(timer);
    }
  }, [roomState, callDialogue, currentLineIdx]);

  const handleAnswer = () => {
    if (missedTimeoutRef.current) clearTimeout(missedTimeoutRef.current);
    
    // Pick dialogue
    const rCall = Math.random();
    let dialogue: string[] = [];

    if (rCall < 0.0001) {
      dialogue = ['...', '"you answered."', '...', '"interesting."', 'Click.'];
    } else if (rCall < 0.0011) {
      dialogue = ['...', '"the record player\nis doing better."', 'Click.'];
    } else if (rCall < 0.0061) {
      dialogue = ['...', '"the Lost & Found\nfound something."', 'Click.'];
    } else {
      dialogue = STANDARD_CALLS[Math.floor(Math.random() * STANDARD_CALLS.length)];
    }

    setCallDialogue(dialogue);
    setCurrentLineIdx(0);
    setRoomState('ANSWERED');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] bg-[#030303] text-[#888] font-serif overflow-x-hidden flex flex-col items-center justify-center relative select-none">
      
      {/* Vignette / Dim Light */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,245,230,0.08)_0%,rgba(0,0,0,0.95)_70%)] z-10"></div>
      <div className="pointer-events-none fixed inset-0 bg-[url('/noise.png')] opacity-[0.015] z-10 mix-blend-overlay"></div>

      <div className="w-full max-w-md relative z-20 flex flex-col items-center gap-12">
        
        {/* Telephone Scene */}
        <div className="relative w-64 h-64 flex flex-col items-center justify-end">
          
          {/* Dim hanging light wire */}
          <div className="absolute top-[-20vh] w-[1px] h-[30vh] bg-gradient-to-b from-black via-white/10 to-white/20 left-1/2 -translate-x-1/2"></div>
          {/* Bulb glow */}
          <div className="absolute top-[10vh] w-2 h-2 rounded-full bg-orange-500/40 shadow-[0_0_60px_rgba(255,160,50,0.4)] left-1/2 -translate-x-1/2"></div>
          {/* Ambient center glow */}
          <div className="absolute bottom-10 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none"></div>

          {/* Table */}
          <div className="w-full h-3 bg-[#2a201a] rounded-sm absolute bottom-0 shadow-2xl border-t border-white/10"></div>
          <div className="w-48 h-2 bg-black/80 absolute bottom-[-6px] blur-sm"></div>

          {/* Cat placement behind/on table */}
          {catIntegration === 'STARING' && (
            <div className="absolute bottom-3 -left-4 w-12 h-12 opacity-50 transform scale-x-[-1]">
              <PixelCat state="idle" />
            </div>
          )}
          {catIntegration === 'SLEEPING' && (
            <div className="absolute -bottom-8 right-8 w-16 h-16 opacity-40">
              <PixelCat state="sleeping" />
            </div>
          )}

          {/* Telephone Placeholder Silhouette */}
          <motion.div 
            className="w-20 h-16 bg-[#1a1a1a] rounded-t-xl rounded-b-md relative mb-3 shadow-[0_10px_20px_rgba(0,0,0,0.8)] border border-white/10"
            animate={roomState === 'RINGING' ? {
              x: [-1, 1, -1, 1, 0],
              y: [0, -1, 0, 1, 0]
            } : {}}
            transition={{
              duration: 0.1,
              repeat: roomState === 'RINGING' ? Infinity : 0,
              repeatType: 'reverse'
            }}
          >
            {/* Receiver */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1a] rounded-full border border-white/10 ${catIntegration === 'KNOCKED_OFF' ? 'rotate-[70deg] translate-x-4 translate-y-6' : ''}`}></div>
            {/* Rotary Dial */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/60"></div>
          </motion.div>

        </div>

        {/* Interaction Area */}
        <div className="h-32 w-full flex flex-col items-center justify-start text-center">
          <AnimatePresence mode="wait">
            
            {roomState === 'IDLE' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-white/30 italic"
              >
                {microcopy}
              </motion.div>
            )}

            {roomState === 'MISSED' && (
              <motion.div 
                key="missed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] uppercase tracking-[0.2em] text-white/20"
              >
                Missed Call.
              </motion.div>
            )}

            {roomState === 'RINGING' && (
              <motion.button
                key="ringing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={handleAnswer}
                className="text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/10 hover:border-white/30 px-6 py-2 transition-all bg-white/[0.02]"
              >
                Answer
              </motion.button>
            )}

            {roomState === 'ANSWERED' && (
              <motion.div 
                key="answered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/80 whitespace-pre-line tracking-wide w-full flex flex-col items-center text-center"
              >
                {callDialogue.slice(0, currentLineIdx + 1).map((line, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 w-full text-center"
                  >
                    {line}
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Tiny Timestamp */}
      <div className="fixed bottom-6 right-6 text-[9px] font-mono tracking-widest text-white/10 z-20">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

    </div>
  );
}
