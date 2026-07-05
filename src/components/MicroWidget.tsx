import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RARE_STATES = [
  { chars: ['3', 'A', 'M', '!'], bottom: 'NOW' },
  { chars: ['I', 'N', 'D', ' '], bottom: '#127' },
  { chars: ['Y', 'O', 'U', '?'], bottom: 'HERE' },
  { chars: ['C', 'A', 'T', ' '], bottom: 'OK' },
  { chars: ['S', 'Y', 'S', '!'], bottom: 'SLP' },
];

export default function MicroWidget() {
  const [mounted, setMounted] = useState(false);
  const [displayState, setDisplayState] = useState<{
    chars: string[];
    bottom: string;
  } | null>(null);

  useEffect(() => {
    // Delay mounting slightly to simulate an old tube warming up
    const mountTimer = setTimeout(() => setMounted(true), 1500);

    const updateTime = () => {
      const now = new Date();
      
      const isRare = Math.random() < 0.005; // Make rare states much rarer to avoid interrupting the time
      if (isRare) {
        const randomState = RARE_STATES[Math.floor(Math.random() * RARE_STATES.length)];
        setDisplayState(randomState);
        return;
      }

      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[now.getMonth()];
      const date = now.getDate().toString().padStart(2, '0');
      
      let hours = now.getHours();
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = now.getMinutes().toString().padStart(2, '0');
      
      const chars = [hoursStr[0], hoursStr[1], minutesStr[0], minutesStr[1]];
      const newBottom = `${month} ${date}`;

      setDisplayState(prev => {
        if (prev && prev.chars.join('') === chars.join('') && prev.bottom === newBottom) {
          return prev;
        }
        return { chars, bottom: newBottom };
      });
    };

    updateTime();
    
    // Check frequently to align well with the actual minute change
    const interval = setInterval(updateTime, 1000);
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
    };
  }, []);

  if (!displayState) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-0 pointer-events-none transition-opacity duration-[3000ms] ${mounted ? 'opacity-70' : 'opacity-0'}`}
      style={{
        fontFamily: "'Space Mono', monospace",
      }}
    >
      <div className="flex flex-col items-center justify-center animate-[breath_6s_ease-in-out_infinite]">
        
        {/* 4 Time Boxes */}
        <div className="flex gap-1 mb-1.5" style={{ perspective: '1000px' }}>
          {displayState.chars.map((char, index) => (
             <FlipBox key={index} char={char} />
          ))}
        </div>
        
        {/* Month Box */}
        <div 
          className="w-full border border-[#a5b4fc]/30 bg-black/40 rounded px-2 py-1.5 flex flex-col items-center justify-center shadow-[0_0_8px_rgba(165,180,252,0.1)]"
          style={{
            textShadow: '0 0 4px rgba(165,180,252,0.4)',
          }}
        >
          <span className="text-[#a5b4fc]/80 text-[10px] leading-none tracking-widest">{displayState.bottom}</span>
        </div>
        
      </div>
    </div>
  );
}

function FlipBox({ char }: { char: string }) {
  return (
    <div className="relative w-7 h-9 border border-[#fef08a]/20 rounded bg-black/40 overflow-hidden shadow-[0_0_8px_rgba(254,240,138,0.05)] flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={char}
          initial={{ rotateX: 90, opacity: 0, y: -10 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: -90, opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute text-[#fef9c3]/90 text-[16px] leading-none font-bold"
          style={{ textShadow: '0 0 4px rgba(254,249,195,0.4)', transformOrigin: 'center' }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
      
      {/* Subtle scanline overlay on each box */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none" />
    </div>
  );
}
