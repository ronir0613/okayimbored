import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCat, type CatState } from './LivingCats/PixelCat';

type CatIntegration = 'NONE' | 'SLEEPING_RECEPTION' | 'WALKING' | 'WAITING_ELEVATOR';

const RECEPTION_NOTES = [
  "Back in five minutes.",
  "Please make yourself comfortable.",
  "We'll be right back.",
  "The cat is covering reception."
];

const VISITOR_ENTRIES = [
  "Stayed longer than expected.",
  "Came back.",
  "Looked around.",
  "Said nothing.",
  "Visited the rooftop."
];

const ELEVATOR_FLOORS = ['B2', 'B1', '1', 'R', '2', '3'];

const AMBIENT_SOUNDS = [
  "Clock quietly ticking.",
  "Soft floor reflections.",
  "Distant radio.",
  "Occasional footsteps from another hallway."
];

export default function TheLobby() {
  const [mounted, setMounted] = useState(false);
  const [catIntegration, setCatIntegration] = useState<CatIntegration>('NONE');
  const [receptionNote, setReceptionNote] = useState<string | null>(null);
  const [elevatorFloor, setElevatorFloor] = useState('1');
  const [isElevatorOpen, setIsElevatorOpen] = useState(false);
  const [visitorEntry, setVisitorEntry] = useState(VISITOR_ENTRIES[0]);
  const [ambientSound, setAmbientSound] = useState(AMBIENT_SOUNDS[0]);
  const [ambientTextVisible, setAmbientTextVisible] = useState(false);
  const [isPhoneRinging, setIsPhoneRinging] = useState(false);
  const [isDirectoryFlickering, setIsDirectoryFlickering] = useState(false);
  const [showTinyText, setShowTinyText] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initial random states
    const rCat = Math.random();
    if (rCat < 0.15) setCatIntegration('SLEEPING_RECEPTION');
    else if (rCat < 0.3) setCatIntegration('WALKING');
    else if (rCat < 0.4) setCatIntegration('WAITING_ELEVATOR');

    if (Math.random() < 0.3) {
      setReceptionNote(RECEPTION_NOTES[Math.floor(Math.random() * RECEPTION_NOTES.length)]);
    }

    setVisitorEntry(VISITOR_ENTRIES[Math.floor(Math.random() * VISITOR_ENTRIES.length)]);

    // Elevator Animation Loop
    const elevatorInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        setElevatorFloor(ELEVATOR_FLOORS[Math.floor(Math.random() * ELEVATOR_FLOORS.length)]);
      }
    }, 15000);

    // Ambient Sounds Loop
    const ambientInterval = setInterval(() => {
      setAmbientSound(AMBIENT_SOUNDS[Math.floor(Math.random() * AMBIENT_SOUNDS.length)]);
      setAmbientTextVisible(true);
      setTimeout(() => setAmbientTextVisible(false), 4000);
    }, 25000);

    // Rare Events
    // Phone rings (1%)
    if (Math.random() < 0.01) {
      setTimeout(() => setIsPhoneRinging(true), 10000);
      setTimeout(() => setIsPhoneRinging(false), 30000);
    }

    // Elevator empty open (0.5%)
    if (Math.random() < 0.005) {
      setTimeout(() => {
        setIsElevatorOpen(true);
        setTimeout(() => setIsElevatorOpen(false), 8000);
      }, 18000);
    }

    // Directory flickers (0.1%)
    if (Math.random() < 0.001) {
      setTimeout(() => setIsDirectoryFlickering(true), 20000);
      setTimeout(() => setIsDirectoryFlickering(false), 22000);
    }

    // Tiny text appears (0.01%)
    if (Math.random() < 0.0001) {
      setTimeout(() => setShowTinyText(true), 15000);
    }

    return () => {
      clearInterval(elevatorInterval);
      clearInterval(ambientInterval);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] bg-[#030303] text-[#888] font-serif overflow-x-hidden flex flex-col items-center relative select-none">
      
      {/* Vignette & Noise */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,245,230,0.06)_0%,rgba(0,0,0,0.95)_80%)] z-10"></div>
      <div className="pointer-events-none fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] z-10 mix-blend-overlay"></div>

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-20 flex flex-col md:flex-row gap-16 p-8 pt-24 min-h-[85vh]">
        
        {/* Left Column: Directory & Doors */}
        <div className="w-full md:w-1/3 flex flex-col gap-16 relative">
          
          {/* Building Directory */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-sm shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-8 text-center border-b border-white/5 pb-4">
              Building Directory
            </h2>

            <div className="space-y-6 text-[11px] tracking-widest leading-loose">
              
              <div>
                <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">Lobby</div>
                <div className="pl-4 text-white/30">Main Experience</div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">Level 1</div>
                <div className="pl-4 text-white/30 flex flex-col gap-1">
                  <span>Lost & Found</span>
                  <span>Archive</span>
                  <span>Radio Room</span>
                  <span>Cat Department</span>
                  <span>Notice Board</span>
                  <span>Maintenance</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">Level -1</div>
                <div className="pl-4 text-white/30">Basement</div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">Level 2</div>
                <div className="pl-4 text-white/30 flex flex-col gap-1">
                  <span>Window</span>
                  <span>Rooftop</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">Telephone Room</div>
                <div className="pl-4 text-white/30">Unknown</div>
              </div>

              {isDirectoryFlickering && (
                <div className="border-t border-white/5 pt-4">
                  <div className="text-white/60 mb-2 font-sans text-[9px] uppercase">???</div>
                  <div className="pl-4 text-white/30">???</div>
                </div>
              )}

            </div>
          </div>

          {/* Hallway Labels */}
          <div className="pl-4 border-l border-white/5 flex flex-col gap-4">
            <h3 className="text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">Hallway</h3>
            {['Archive', 'Maintenance', 'Radio', 'Cats', 'Window', 'Basement', 'Rooftop'].map(room => (
              <div key={room} className="text-xs text-white/10 hover:text-white/30 transition-colors cursor-default">
                {room}
              </div>
            ))}
            <div className="text-xs text-white/5 italic">Unlabeled</div>
            <div className="text-xs text-white/5 italic">Unlabeled</div>
          </div>

        </div>

        {/* Right Column: Elevator & Reception */}
        <div className="w-full md:w-2/3 flex flex-col justify-between relative gap-16">
          
          {/* Elevator Area */}
          <div className="flex flex-col items-center">
            {/* Floor Indicator */}
            <div className="w-12 h-6 bg-black border border-white/10 rounded-sm mb-4 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={elevatorFloor}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[10px] font-mono text-orange-500/80 shadow-[0_0_10px_rgba(255,160,50,0.5)]"
                >
                  {elevatorFloor}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Elevator Doors */}
            <div className="w-48 h-64 border-x border-t border-white/10 relative flex justify-center bg-[#050505]">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-black to-transparent z-10"></div>
              
              {/* Left Door */}
              <motion.div 
                className="absolute left-0 top-0 w-1/2 h-full bg-[#111] border-r border-black"
                animate={{ x: isElevatorOpen ? '-95%' : '0%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
              
              {/* Right Door */}
              <motion.div 
                className="absolute right-0 top-0 w-1/2 h-full bg-[#111] border-l border-white/5"
                animate={{ x: isElevatorOpen ? '95%' : '0%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />

              {/* Inside Elevator (Darkness) */}
              <div className="absolute inset-0 -z-10 bg-black"></div>

              {/* Waiting Cat */}
              {catIntegration === 'WAITING_ELEVATOR' && (
                <div className="absolute bottom-0 right-4 w-12 h-12 z-20 opacity-60">
                  <PixelCat state="idle" />
                </div>
              )}
            </div>
            
            {/* Floor line */}
            <div className="w-96 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-1"></div>
          </div>

          {/* Reception Desk Area */}
          <div className="relative flex flex-col items-center mt-12">
            
            {/* Phone Ringing indicator */}
            {isPhoneRinging && (
              <motion.div 
                className="absolute -top-8 text-[10px] uppercase tracking-widest text-white/30"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                *Phone rings*
              </motion.div>
            )}

            {/* The Desk */}
            <div className="w-80 h-24 bg-[#0a0a0a] border-t border-x border-white/5 relative shadow-2xl flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              {/* Reception Note */}
              {receptionNote && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-[#1a1a1a] p-3 text-center border border-white/10 shadow-lg rotate-1">
                  <span className="text-[10px] text-white/60 font-serif italic">
                    "{receptionNote}"
                  </span>
                </div>
              )}

              {/* Sleeping Cat behind reception */}
              {catIntegration === 'SLEEPING_RECEPTION' && (
                <div className="absolute -top-4 right-12 w-16 h-16 opacity-50">
                  <PixelCat state="sleeping" />
                </div>
              )}
            </div>

            {/* Visitor Book (Small table to the side) */}
            <div className="absolute bottom-4 -left-32 w-24 h-32 flex flex-col items-center">
              <div className="text-[8px] uppercase tracking-[0.2em] text-white/20 mb-2">Visitor Book</div>
              <div className="w-16 h-12 bg-[#151515] border border-white/5 rounded-sm relative shadow-lg flex items-center justify-center p-2">
                <span className="text-[6px] text-white/30 italic text-center leading-tight">
                  "{visitorEntry}"
                </span>
              </div>
              <div className="w-20 h-16 bg-[#080808] absolute bottom-0 -z-10 border-t border-white/5"></div>
            </div>

            {/* Walking Cat */}
            {catIntegration === 'WALKING' && (
              <motion.div 
                className="absolute bottom-0 w-16 h-16 opacity-40 z-30"
                initial={{ left: '-50%' }}
                animate={{ left: '150%' }}
                transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
              >
                <PixelCat state="walking_right" />
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* Floor Polish Gradient / Reflection */}
      <div className="w-full flex-grow bg-gradient-to-b from-[#030303] to-[#010101] relative z-0 border-t border-white/[0.02]">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-white/[0.01] to-transparent"></div>
      </div>

      {/* Ambient Text (Bottom Left) */}
      <AnimatePresence>
        {ambientTextVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed bottom-12 left-12 text-[10px] text-white/20 italic tracking-wide z-30"
          >
            {ambientSound}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny Text Event (Bottom Right) */}
      <AnimatePresence>
        {showTinyText && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-12 right-12 text-[8px] text-white/10 tracking-[0.3em] uppercase z-30"
          >
            You've seen most of the building.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Plaque */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 text-center text-[8px] tracking-[0.3em] uppercase text-white/10 z-30 flex flex-col gap-1 border border-white/5 p-3 rounded-[1px] bg-black/40">
        <span className="text-white/30">okayimbored</span>
        <span>Established: One late night.</span>
        <span>Still open.</span>
      </div>

    </div>
  );
}
