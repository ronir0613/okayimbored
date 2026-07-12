import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addEcho, hasEcho } from '../lib/echoes';

const CHANNELS = [
  { freq: 87.7, name: 'Late Night Radio' },
  { freq: 91.3, name: 'Quiet FM' },
  { freq: 94.2, name: 'Cat Watch' },
  { freq: 97.8, name: 'Internet Archaeology' },
  { freq: 101.1, name: 'Lost & Found' },
  { freq: 103.5, name: 'Weather Somewhere Else' },
  { freq: 106.2, name: 'Dead Air' }
];

const BROADCASTS: Record<number, (string | React.ReactNode)[]> = {
  87.7: [
    "someone stayed longer than expected.",
    "the cat is asleep.",
    "we're almost out of coffee.",
    "the record skipped.",
    "it's raining somewhere.",
    "tonight feels quieter.",
    "three people picked something honest.",
    <span key="basement">nobody has found the <a href="/basement" className="hover:text-white/60 transition-colors cursor-pointer underline decoration-white/30 underline-offset-4">basement</a> today.</span>,
    "thanks for listening."
  ],
  91.3: [
    "...",
    "still quiet.",
    "nothing to report.",
    "..."
  ],
  94.2: [
    "The Sleeper is still sleeping.",
    "movement detected near the console.",
    "purring continues.",
    "a slow blink was recorded.",
    "tail flicked twice."
  ],
  97.8: [
    "the first webcam monitored a coffee pot.",
    "the <body> tag used to have a background attribute.",
    "there are thousands of forgotten geocities pages.",
    "marquee and blink tags are mostly dead now.",
    "someone is still seeding that torrent from 2005."
  ],
  101.1: [
    "Found: one mitten.",
    "Found: a grocery list from 1999.",
    "Found: an expired subway pass.",
    "Found: a set of keys with a broken keychain.",
    "Found: half a conversation."
  ],
  103.5: [
    "Currently raining. Not here.",
    "Windy in a place you've never been.",
    "Snow falling on an empty street.",
    "Overcast somewhere else entirely.",
    "Clear skies above a different roof."
  ],
  106.2: [] // Dead air
};

const ANNOUNCEMENTS = [
  "good evening.",
  "that's all.",
  "we're still here.",
  "you're listening to okay FM.",
  "thanks for stopping by."
];

const STATIC_NOISES = [
  "ssssshhhhhhh...",
  "ssshk...",
  "khhhhh...",
  "..."
];

export const RadioRoom: React.FC = () => {
  const [frequencyIndex, setFrequencyIndex] = useState(0);
  const [broadcast, setBroadcast] = useState<React.ReactNode | null>(null);
  const [isStatic, setIsStatic] = useState(false);
  const [catState, setCatState] = useState<string | null>(null);
  const [time, setTime] = useState<string>('');
  
  const currentChannel = CHANNELS[frequencyIndex];
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clock & Echo
  useEffect(() => {
    addEcho('visited_radio');
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast Engine
  useEffect(() => {
    let mounted = true;

    const scheduleNextBroadcast = (delay: number) => {
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
      broadcastTimeoutRef.current = setTimeout(triggerBroadcast, delay);
    };

    const triggerBroadcast = () => {
      if (!mounted) return;

      const rand = Math.random();
      
      // Rare events
      if (rand < 0.0001) {
        setBroadcast("...");
        scheduleNextBroadcast(30000); // 30 seconds silence
        setTimeout(() => { if (mounted) setBroadcast("thank you."); }, 30000);
        return;
      }
      if (rand < 0.001) {
        setBroadcast("we didn't think anyone would find this room.");
        scheduleNextBroadcast(getRandomDelay());
        return;
      }
      if (rand < 0.005) {
        setBroadcast("if you're hearing this... welcome.");
        scheduleNextBroadcast(getRandomDelay());
        return;
      }

      // Channel 106.2 is always dead air / static
      if (currentChannel.freq === 106.2) {
        setIsStatic(true);
        setBroadcast(STATIC_NOISES[Math.floor(Math.random() * STATIC_NOISES.length)]);
        setTimeout(() => { if (mounted) setBroadcast(null); }, 4000);
        scheduleNextBroadcast(getRandomDelay());
        return;
      }

      // Normal broadcast
      setIsStatic(false);
      
      // Static interruption (10% chance)
      if (Math.random() < 0.1) {
        setIsStatic(true);
        setBroadcast(STATIC_NOISES[Math.floor(Math.random() * STATIC_NOISES.length)]);
        setTimeout(() => {
          if (!mounted) return;
          setIsStatic(false);
          playNormalBroadcast();
        }, 2000 + Math.random() * 3000);
      } else {
        playNormalBroadcast();
      }
    };

    const playNormalBroadcast = () => {
      // 15% chance for a global announcement, otherwise channel specific
      if (Math.random() < 0.15) {
        setBroadcast(ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)]);
      } else {
        const messages = [...(BROADCASTS[currentChannel.freq] || [])];
        
        if (currentChannel.freq === 87.7 && hasEcho('answered_telephone')) {
          messages.push("conversations never really end.");
        }
        if (currentChannel.freq === 87.7 && hasEcho('ignored_phone')) {
          messages.push("some calls go unanswered.");
        }
        if (currentChannel.freq === 91.3 && hasEcho('tarot_the_moon')) {
          messages.push("the moon looks different tonight.");
        }
        if (currentChannel.freq === 94.2 && hasEcho('followed_cat')) {
          messages.push("a visitor followed the cat today.");
        }
        
        if (messages && messages.length > 0) {
          setBroadcast(messages[Math.floor(Math.random() * messages.length)]);
        } else {
          setBroadcast("...");
        }
      }
      
      // Clear broadcast after a few seconds
      setTimeout(() => {
        if (mounted) setBroadcast(null);
      }, 5000 + Math.random() * 4000);

      scheduleNextBroadcast(getRandomDelay());
    };

    const getRandomDelay = () => {
      // Between 15 and 45 seconds for testing/ux, standard slow atmospheric timing
      return 15000 + Math.random() * 30000;
    };

    // Start the first broadcast fairly soon after entering or changing channel
    scheduleNextBroadcast(3000 + Math.random() * 5000);

    return () => {
      mounted = false;
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    };
  }, [currentChannel.freq]);

  // Cat integration engine
  useEffect(() => {
    let mounted = true;
    
    const catLoop = () => {
      if (!mounted) return;
      const rand = Math.random();
      
      if (rand < 0.1) {
        setCatState("sleeping on the console");
        setTimeout(() => { if (mounted) setCatState(null); }, 20000);
      } else if (rand < 0.15) {
        setCatState("walking behind the equipment");
        setTimeout(() => { if (mounted) setCatState(null); }, 8000);
      } else if (rand < 0.18) {
        setCatState("stepped on a button");
        setIsStatic(true);
        setBroadcast("ssssshhk...");
        setTimeout(() => {
          if (mounted) {
            setIsStatic(false);
            setBroadcast(null);
            setCatState(null);
          }
        }, 3000);
      }

      setTimeout(catLoop, 30000 + Math.random() * 60000);
    };

    const catTimeout = setTimeout(catLoop, 45000);
    return () => {
      mounted = false;
      clearTimeout(catTimeout);
    };
  }, []);

  const changeFrequency = (dir: 1 | -1) => {
    let newIndex = frequencyIndex + dir;
    if (newIndex < 0) newIndex = CHANNELS.length - 1;
    if (newIndex >= CHANNELS.length) newIndex = 0;
    setFrequencyIndex(newIndex);
    setBroadcast(null);
    setIsStatic(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-transparent pointer-events-auto overflow-hidden"
    >
      {/* Dust particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Broadcast Display Area */}
      <div className="absolute top-1/3 w-full text-center px-8 flex flex-col items-center justify-center h-32 z-[60] pointer-events-none">
        <AnimatePresence mode="wait">
          {broadcast && (
            <motion.div
              key={React.isValidElement(broadcast) ? broadcast.key : (broadcast as React.Key)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 2 } }}
              className={`text-sm md:text-base font-mono tracking-widest leading-loose ${isStatic ? 'text-white/30 italic' : 'text-white/60'}`}
            >
              {isStatic && <span className="animate-pulse mr-2">≈</span>}
              {broadcast}
              {isStatic && <span className="animate-pulse ml-2">≈</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Radio Console UI */}
      <div className="absolute bottom-1/4 flex flex-col items-center gap-8 z-10">
        
        {/* Cat Status */}
        <AnimatePresence>
          {catState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-mono text-white/20 absolute -top-12"
            >
              [ cat is {catState} ]
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border border-white/5 p-4 sm:p-6 rounded-lg bg-black/40 backdrop-blur-sm relative">
          {/* ON AIR Light */}
          <div className="absolute -top-3 left-6 flex items-center gap-2 bg-black px-2">
            <div className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            <span className="text-[9px] font-mono text-red-500/80 tracking-widest font-bold">ON AIR</span>
          </div>

          {/* Dept Sticker */}
          <a 
            href="/cats" 
            className="absolute -bottom-6 right-6 text-[8px] font-mono text-white/10 hover:text-white/40 transition-colors tracking-[0.3em] uppercase cursor-pointer"
          >
            Property of Dept.
          </a>

          <div className="flex items-center gap-4 sm:gap-8">
            {/* Left Tape Reel */}
            <motion.div 
              animate={{ rotate: isStatic ? 0 : 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="hidden sm:flex w-10 h-10 border-2 border-white/10 rounded-full items-center justify-center"
            >
              <div className="w-8 h-8 border border-white/5 rounded-full relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5" />
                <div className="absolute inset-0 m-auto w-2 h-2 bg-white/10 rounded-full" />
              </div>
            </motion.div>

            {/* Frequency Display */}
            <div className="flex flex-col items-center gap-2 w-40 sm:w-48">
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => changeFrequency(-1)}
                  className="text-white/20 hover:text-white/60 transition-colors font-mono cursor-pointer p-2"
                >
                  {'<'}
                </button>
                
                <div className="flex flex-col items-center w-24 sm:w-32">
                  <span className="text-xl font-mono text-white/80 tabular-nums tracking-widest">
                    {currentChannel.freq.toFixed(1)}
                  </span>
                  <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase mt-1 text-center w-full min-h-[20px]">
                    {currentChannel.name}
                  </span>
                </div>

                <button 
                  onClick={() => changeFrequency(1)}
                  className="text-white/20 hover:text-white/60 transition-colors font-mono cursor-pointer p-2"
                >
                  {'>'}
                </button>
              </div>
              
              {/* Fake frequency bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 bottom-0 w-1 bg-red-500/50"
                  initial={false}
                  animate={{ left: `${((currentChannel.freq - 87.7) / (106.2 - 87.7)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Right Tape Reel */}
            <motion.div 
              animate={{ rotate: isStatic ? 0 : 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="hidden sm:flex w-10 h-10 border-2 border-white/10 rounded-full items-center justify-center"
            >
               <div className="w-8 h-8 border border-white/5 rounded-full relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5" />
                <div className="absolute inset-0 m-auto w-2 h-2 bg-white/10 rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* VU Meters & Clock */}
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 sm:ml-4 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4">
            <div className="flex gap-1 h-6 items-end">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-white/20 rounded-t-sm origin-bottom"
                  animate={{ 
                    height: isStatic ? '2px' : ['4px', `${Math.random() * 20 + 4}px`, '4px'] 
                  }}
                  transition={{ 
                    duration: Math.random() * 0.5 + 0.2,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                />
              ))}
            </div>
            <div className="text-[10px] font-mono text-white/30 tabular-nums tracking-widest">
              {time}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
