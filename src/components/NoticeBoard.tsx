import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCat, type CatState } from './LivingCats/PixelCat';

const GENERAL_NOTICES = [
  "The hallway light has been fixed.",
  "We're trying a new coffee.",
  "The radio is working again.",
  "Please close the basement door."
];

const CAT_NOTICES = [
  "The cats have requested\nmore cardboard.",
  "Employee of the Month\nis missing again.",
  "Please stop sleeping\non official paperwork.",
  "Someone fed the cats twice."
];

const LOST_FOUND = [
  "Found:\nOne mitten.",
  "Found:\nConfidence.",
  "Missing:\nTuesday."
];

const COMMUNITY_NOTES = [
  "If anyone finds\nmy playlist,\nplease return it.",
  "Looking for someone\nto water one imaginary plant.",
  "Borrowed umbrella.\n\nSorry."
];

const STRANGE_NOTICES = [
  "Do not feed\nthe invisible pigeons.",
  "The moon has been moved\nto Thursday.",
  "Someone keeps stealing\nall the left socks.",
  "Please ignore\nthe tiny door."
];

const OFFICE_MEMOS = [
  "The meeting has been cancelled.\n\nReason:\nThe cats.",
  "Reminder:\n\nThe rooftop is\nnot a smoking area."
];

const DAILY_NOTICES = [
  "It's quieter than usual.",
  "Drink some water.",
  "Have you looked outside today?",
  "Take a deep breath.",
  "Don't forget to blink.",
  "The building feels heavy today."
];

const MICROCOPY = [
  "Pinned recently.",
  "Still relevant.",
  "Nobody removed this.",
  "Probably outdated.",
  "We should really clean this."
];

const PAPER_COLORS = [
  'bg-[#f8f5e6]', // off-white
  'bg-[#eef2d8]', // pale greenish-yellow
  'bg-[#fdf8e2]', // pale yellow
  'bg-[#f4efe1]', // aged paper
  'bg-[#e2e8f0]', // pale bluish-gray
  'bg-[#fdf3f3]'  // pale pinkish
];

interface NoteData {
  id: string;
  text: string;
  microcopy: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  pinType: 'thumbtack-red' | 'thumbtack-silver' | 'tape-top' | 'tape-corners';
  isFalling?: boolean;
  hasFoldedCorner?: boolean;
  font: string;
  type: string;
}

export default function NoticeBoard() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [dailyNotice, setDailyNotice] = useState<NoteData | null>(null);
  
  // Rare Event states
  const [isThankYouEvent, setIsThankYouEvent] = useState(false);
  const [isHandwrittenEvent, setIsHandwrittenEvent] = useState(false);
  const [newNoteEvent, setNewNoteEvent] = useState(false);

  // Cat integration
  const [catState, setCatState] = useState<{ active: boolean; type: 'on_top' | 'underneath' | 'knocking'; noteId?: string } | null>(null);

  // Record Player State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const checkAudio = () => {
      setIsAudioPlaying(localStorage.getItem('okayimbored_playing') === 'true');
    };
    checkAudio();
    window.addEventListener('audio:state_change', checkAudio);
    return () => {
      window.removeEventListener('audio:state_change', checkAudio);
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    const r = Math.random();
    
    // 0.01% - "Thank you." only
    if (r < 0.0001) {
      setIsThankYouEvent(true);
      return;
    }

    // 0.1% - Handwritten only (Will simulate with italics/handwritten font classes)
    if (r < 0.0011) {
      setIsHandwrittenEvent(true);
    }

    // Generate normal board
    const generateNotes = () => {
      const generated: NoteData[] = [];
      const numNotes = Math.floor(Math.random() * 8) + 12; // 12 to 19 notes
      
      const allPools = [
        { pool: GENERAL_NOTICES, type: 'General' },
        { pool: CAT_NOTICES, type: 'Cat' },
        { pool: LOST_FOUND, type: 'Lost & Found' },
        { pool: COMMUNITY_NOTES, type: 'Community' },
        { pool: STRANGE_NOTICES, type: 'Strange' },
        { pool: OFFICE_MEMOS, type: 'Memo' }
      ];

      for (let i = 0; i < numNotes; i++) {
        const poolObj = allPools[Math.floor(Math.random() * allPools.length)];
        const text = poolObj.pool[Math.floor(Math.random() * poolObj.pool.length)];
        
        generated.push({
          id: `note-${i}`,
          text: isHandwrittenEvent ? text : text, // In handwritten event, all fonts are script
          type: poolObj.type,
          microcopy: MICROCOPY[Math.floor(Math.random() * MICROCOPY.length)],
          x: 5 + Math.random() * 90, // 5% to 95%
          y: 5 + Math.random() * 90, // 5% to 95%
          rotation: (Math.random() - 0.5) * 12, // -6 to 6 deg
          color: PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)],
          pinType: ['thumbtack-red', 'thumbtack-silver', 'tape-top', 'tape-corners'][Math.floor(Math.random() * 4)] as any,
          hasFoldedCorner: Math.random() > 0.7,
          font: isHandwrittenEvent ? 'font-serif italic' : (Math.random() > 0.5 ? 'font-mono' : 'font-sans'),
        });
      }
      return generated;
    };

    const initialNotes = generateNotes();

    // 1% - Notice falls off (pick one to fall)
    if (r < 0.0111 && r >= 0.0011) {
      const fallIndex = Math.floor(Math.random() * initialNotes.length);
      initialNotes[fallIndex].isFalling = true;
    }

    setNotes(initialNotes);

    // Daily Notice
    const today = new Date();
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Use simple pseudo-random for daily note based on daySeed
    const seededRandom = () => {
      const x = Math.sin(daySeed) * 10000;
      return x - Math.floor(x);
    };
    
    const dailyText = DAILY_NOTICES[Math.floor(seededRandom() * DAILY_NOTICES.length)];
    const prefixes = ["Today's Notice:\n", "Today's Reminder:\n", "Today's Question:\n"];
    const dailyPrefix = prefixes[Math.floor(seededRandom() * prefixes.length)];

    setDailyNotice({
      id: 'daily',
      text: dailyPrefix + dailyText,
      microcopy: "Updated daily.",
      type: 'Daily',
      x: 90,
      y: 10,
      rotation: 2,
      color: 'bg-white',
      pinType: 'tape-top',
      hasFoldedCorner: false,
      font: 'font-mono uppercase text-sm'
    });

    // 0.5% - New note appears while reading (set a timeout)
    if (r < 0.0161 && r >= 0.0111) {
      setTimeout(() => {
        setNewNoteEvent(true);
      }, 5000); // 5 seconds after mount
    }

    // Cat Integration
    const catR = Math.random();
    if (catR > 0.7) { // 30% chance for a cat
      const types: ('on_top' | 'underneath' | 'knocking')[] = ['on_top', 'underneath', 'knocking'];
      const catType = types[Math.floor(Math.random() * types.length)];
      
      let noteToKnock: string | undefined = undefined;
      if (catType === 'knocking' && initialNotes.length > 0) {
        noteToKnock = initialNotes[0].id; // Pick the first note to knock
        
        // Actually knock it crooked after a delay
        setTimeout(() => {
          setNotes(prev => prev.map(n => 
            n.id === noteToKnock 
              ? { ...n, rotation: n.rotation + 25 } // knock it!
              : n
          ));
        }, 3000);
      }

      setCatState({
        active: true,
        type: catType,
        noteId: noteToKnock
      });
    }

  }, [isHandwrittenEvent]);

  if (!mounted) return null;

  if (isThankYouEvent) {
    return (
      <div className="min-h-screen bg-[#050505] text-white/40 flex items-center justify-center font-mono select-none overflow-hidden">
        <div className="w-[300px] h-[200px] bg-[#f8f5e6] shadow-2xl flex items-center justify-center -rotate-2 relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-800/80 rounded-full shadow-sm" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5)' }}></div>
          <span className="font-serif italic text-black/80 text-2xl">Thank you.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#080808] text-white/40 font-mono select-none overflow-hidden relative">
      
      {/* Background ambient noises / record player implied */}
      <div className={`absolute bottom-4 left-4 text-[10px] tracking-widest uppercase flex items-center gap-2 transition-colors duration-1000 ${isAudioPlaying ? 'text-white/20' : 'text-white/10'}`}>
        <span className={`w-2 h-2 rounded-full transition-all duration-1000 ${isAudioPlaying ? 'bg-white/20 animate-pulse' : 'bg-white/10'}`}></span>
        {isAudioPlaying ? 'Record player playing' : 'Record player stopped'}
      </div>

      <div className="absolute bottom-4 right-4 text-[10px] tracking-widest text-white/20 uppercase">
        {new Date().toLocaleTimeString()} / Notice Board
      </div>

      {/* Main Cork Board */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-[90vw] max-w-6xl h-[90vh] md:h-[80vh] border-[8px] md:border-[12px] border-[#1a110a] shadow-2xl bg-[#362417] relative">
        {/* Cork texture overlay (subtle noise) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Cat on top */}
        {catState?.active && catState.type === 'on_top' && (
          <div className="absolute -top-[52px] left-1/4 w-12 h-12">
            <PixelCat state="sleeping" />
          </div>
        )}

        {/* Cat underneath */}
        {catState?.active && catState.type === 'underneath' && (
          <div className="absolute -bottom-[52px] right-1/4 w-12 h-12">
            <PixelCat state="idle" />
          </div>
        )}

        {/* Render Notes */}
        {notes.map(note => (
          <Note 
            key={note.id} 
            note={note} 
            isKnocked={catState?.type === 'knocking' && catState.noteId === note.id} 
          />
        ))}

        {/* Daily Notice */}
        {dailyNotice && (
          <Note note={dailyNotice} />
        )}

        {/* 0.5% New Note Appears */}
        <AnimatePresence>
          {newNoteEvent && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute pointer-events-none z-50"
              style={{ top: '40%', left: '40%', transform: `translate(-50%, -50%) rotate(-3deg)` }}
            >
              <div className="w-[200px] bg-white shadow-xl p-4 flex flex-col relative text-black/80">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-700 rounded-full shadow-sm"></div>
                <div className="font-serif italic whitespace-pre-line text-sm leading-relaxed mb-4">
                  "I just pinned this."
                </div>
                <div className="text-[8px] uppercase tracking-widest text-black/30 mt-auto text-right">
                  Pinned just now.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cat knocking a paper */}
        {catState?.active && catState.type === 'knocking' && catState.noteId && (
          <motion.div 
            className="absolute w-12 h-12 z-50"
            // Position the cat near the first note
            style={{ 
              top: `${notes[0]?.y}%`, 
              left: `${notes[0]?.x - 5}%`,
              transform: 'translateY(-50%)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <PixelCat state="walking_right" />
          </motion.div>
        )}

      </div>
    </div>
  );
}

// Note Component
function Note({ note, isKnocked }: { note: NoteData, isKnocked?: boolean }) {
  
  return (
    <motion.div 
      className={`absolute flex flex-col p-4 shadow-md text-black/80 ${note.color} ${isKnocked ? 'z-40' : ''}`}
      style={{
        left: `${note.x}%`,
        top: `${note.y}%`,
        width: Math.max(140, note.text.length * 3 + 80) + 'px',
        maxWidth: 'calc(100vw - 40px)',
        minHeight: '100px'
      }}
      initial={{ rotate: note.rotation, x: `-${note.x}%`, y: `-${note.y}%`, opacity: 1 }}
      animate={note.isFalling ? { y: '100vh', opacity: 0, rotate: note.rotation + 45 } : { x: `-${note.x}%`, y: `-${note.y}%`, rotate: note.rotation }}
      transition={note.isFalling ? { delay: 2, duration: 2, ease: "easeIn" } : { type: "spring" }}
    >
      {/* Pins / Tape */}
      {note.pinType === 'thumbtack-red' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-700 rounded-full shadow-sm" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5)' }}></div>
      )}
      {note.pinType === 'thumbtack-silver' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full shadow-sm" style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.4)' }}></div>
      )}
      {note.pinType === 'tape-top' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 backdrop-blur-sm -rotate-2"></div>
      )}
      {note.pinType === 'tape-corners' && (
        <>
          <div className="absolute -top-2 -left-2 w-8 h-4 bg-white/40 backdrop-blur-sm -rotate-45"></div>
          <div className="absolute -top-2 -right-2 w-8 h-4 bg-white/40 backdrop-blur-sm rotate-45"></div>
        </>
      )}

      {/* Folded Corner */}
      {note.hasFoldedCorner && (
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-black/5" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)' }}></div>
      )}

      <div className={`${note.font} whitespace-pre-line text-xs sm:text-sm leading-relaxed mb-6 mt-2 relative z-10`}>
        {note.text}
      </div>

      <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-black/40 mt-auto border-t border-black/10 pt-2 flex justify-between">
        <span className="opacity-50">{note.type}</span>
        <span>{note.microcopy}</span>
      </div>
    </motion.div>
  );
}
