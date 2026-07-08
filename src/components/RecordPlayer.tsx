import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIONS = [
  { id: 'station-01', name: 'late night radio', file: '/music/juraganvisi-serene-felt-piano-with-airy-pads-and-gentle-vinyl-crackle-ambience-408702.mp3' },
  { id: 'station-02', name: '3:17 AM', file: '/music/dream-protocol-rain-drops-at-sea-ambient-piano-114653.mp3' },
  { id: 'station-03', name: 'dog sleeping mix', file: '/music/morgan-ambient-calm-ambient-dreamscape-529861.mp3' }
];

type PlayerState = 'IDLE' | 'LOADING' | 'PLAYING' | 'EVENT_BROKEN' | 'EVENT_CAT' | 'EVENT_RACCOON';

const FADE_DURATION = 2000; // 2 seconds

export default function RecordPlayer() {
  const [mounted, setMounted] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>('IDLE');
  const [stationIndex, setStationIndex] = useState(0);
  
  const [isTonight, setIsTonight] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes('/tonight');
    }
    return false;
  });

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  });

  // Lowpass filter refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudioContext = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioRef.current);
      const filter = ctx.createBiquadFilter();
      
      filter.type = 'lowpass';
      
      const isBasement = window.location.pathname.includes('/basement');
      const targetFreq = isBasement ? 400 : 20000;
      filter.frequency.setValueAtTime(targetFreq, ctx.currentTime);
      
      source.connect(filter);
      filter.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      sourceNodeRef.current = source;
      filterNodeRef.current = filter;
    } catch (err) {
      console.error('Failed to initialize Web Audio API lowpass filter:', err);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkPath = () => {
      setIsTonight(window.location.pathname.includes('/tonight'));
      setCurrentPath(window.location.pathname);
    };

    checkPath();
    window.addEventListener('astro:page-load', checkPath);
    return () => {
      window.removeEventListener('astro:page-load', checkPath);
    };
  }, []);

  // Update filter cutoff frequency on path change
  useEffect(() => {
    if (!audioCtxRef.current || !filterNodeRef.current) return;
    const isBasement = currentPath.includes('/basement');
    const ctx = audioCtxRef.current;
    if (isBasement) {
      filterNodeRef.current.frequency.setTargetAtTime(400, ctx.currentTime, 0.3);
    } else {
      filterNodeRef.current.frequency.setTargetAtTime(20000, ctx.currentTime, 0.3);
    }
  }, [currentPath]);
  
  // Event states
  const [eventText, setEventText] = useState('');
  const [eventStep, setEventStep] = useState(0);
  const [taps, setTaps] = useState(0);
  const [catChoiceMade, setCatChoiceMade] = useState(false);
  const [isNotRaccoon, setIsNotRaccoon] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeInterval = useRef<number | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    setMounted(true);
    const savedStation = localStorage.getItem('okayimbored_station');
    if (savedStation !== null) {
      setStationIndex(parseInt(savedStation, 10));
    }
    const savedPlaying = localStorage.getItem('okayimbored_playing');
    if (savedPlaying === 'true') {
      // If it was playing, we want it to continue playing seamlessly across navigations.
      // Since this component is `transition:persist`, it shouldn't actually unmount,
      // but if it's the very first load and it says playing, we'll try to resume.
      // Note: Browsers might block autoplay on the very first fresh page load if no interaction.
      // We will try to play, and catch the DOMException if blocked.
      setPlayerState('PLAYING');
      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current.play().catch(() => {
          // Autoplay blocked on fresh load
          setPlayerState('IDLE');
          localStorage.setItem('okayimbored_playing', 'false');
        });
      }
    }
  }, []);

  // Save playing state changes
  useEffect(() => {
    if (playerState === 'PLAYING') {
      localStorage.setItem('okayimbored_playing', 'true');
    } else if (playerState === 'IDLE') {
      localStorage.setItem('okayimbored_playing', 'false');
    }
  }, [playerState]);

  // Reset cat event if navigating to tonight page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePageLoad = () => {
      const isTonightPage = window.location.pathname.includes('/tonight');
      if (isTonightPage && playerState === 'EVENT_CAT') {
        setPlayerState('IDLE');
        setEventText('');
      }
    };
    
    window.addEventListener('astro:page-load', handlePageLoad);
    return () => {
      window.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, [playerState]);

  // Audio Fade Utility
  const fadeAudio = (targetVolume: number, callback?: () => void) => {
    if (!audioRef.current) return;
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    
    const startVolume = audioRef.current.volume;
    const diff = targetVolume - startVolume;
    const steps = 20;
    const stepTime = FADE_DURATION / steps;
    let currentStep = 0;

    if (targetVolume > 0 && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }

    fadeInterval.current = window.setInterval(() => {
      currentStep++;
      if (audioRef.current) {
        let newVol = startVolume + (diff * (currentStep / steps));
        newVol = Math.max(0, Math.min(1, newVol));
        audioRef.current.volume = newVol;
      }
      
      if (currentStep >= steps) {
        if (fadeInterval.current) clearInterval(fadeInterval.current);
        if (targetVolume === 0 && audioRef.current) {
          audioRef.current.pause();
        }
        if (callback) callback();
      }
    }, stepTime);
  };

  const startMusic = (immediate = false) => {
    initAudioContext();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    if (immediate && audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {});
      setPlayerState('PLAYING');
      return;
    }

    setPlayerState('LOADING');
    setTimeout(() => {
      setPlayerState('PLAYING');
      fadeAudio(1);
    }, 2500);
  };

  const stopMusic = () => {
    fadeAudio(0, () => {
      setPlayerState('IDLE');
    });
    // Immediately set to idle visually for responsiveness
    setPlayerState('IDLE');
  };

  const handlePlayClick = () => {
    initAudioContext();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    if (playerState === 'PLAYING') {
      stopMusic();
      return;
    }
    
    if (playerState !== 'IDLE') return;

    const isTonightPage = typeof window !== 'undefined' && window.location.pathname.includes('/tonight');

    // Probability Engine
    const rand = Math.random();
    if (rand < 0.001) {
      // 0.1% Raccoon
      startRaccoonEvent();
    } else if (rand < 0.004 && !isTonightPage) {
      // 0.3% Cat
      startCatEvent();
    } else if (rand < 0.009) {
      // 0.5% Broken
      startBrokenEvent();
    } else {
      // Normal playback
      startMusic();
    }
  };

  const changeStation = () => {
    const nextIdx = (stationIndex + 1) % STATIONS.length;
    setStationIndex(nextIdx);
    localStorage.setItem('okayimbored_station', nextIdx.toString());
    
    if (playerState === 'PLAYING') {
      fadeAudio(0, () => {
        // Change src and fade back in
        setTimeout(() => {
           fadeAudio(1);
        }, 500);
      });
    }
  };

  // --- EVENT: BROKEN ---
  const startBrokenEvent = async () => {
    setPlayerState('EVENT_BROKEN');
    setEventStep(0);
    setTaps(0);
    
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    await wait(1000);
    setEventText("...");
    await wait(2000);
    setEventText("that's embarrassing.");
    await wait(2500);
    setEventText("the record player broke.");
    await wait(2500);
    setEventText("could you help?");
    setEventStep(1); // Show button
  };

  const handleBrokenSure = () => {
    setEventStep(2);
    setEventText("tap the record three times.");
  };

  const handleRecordTap = () => {
    if (playerState !== 'EVENT_BROKEN' || eventStep !== 2) return;
    const newTaps = taps + 1;
    setTaps(newTaps);
    
    if (newTaps >= 3) {
      setEventStep(3);
      (async () => {
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        setEventText("thank you.");
        await wait(2000);
        setEventText("we don't really know\nhow to fix record players.");
        await wait(3000);
        setEventText("");
        startMusic(true);
      })();
    }
  };

  // --- EVENT: CAT ---
  const startCatEvent = async () => {
    setPlayerState('EVENT_CAT');
    setEventStep(0);
    setCatChoiceMade(false);
    
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    setEventText("attempting playback...");
    await wait(2000);
    setEventText("problem detected.");
    await wait(2000);
    setEventText("the cat is sitting\non the record player.");
    setEventStep(1);
  };

  const handleCatChoice = async () => {
    if (catChoiceMade) return;
    setCatChoiceMade(true);
    setEventStep(2);
    setEventText("the cat agreed\nto cooperate.");
    
    setTimeout(() => {
      setEventText("");
      startMusic(true);
    }, 3000);
  };

  // --- EVENT: RACCOON ---
  const startRaccoonEvent = async () => {
    setPlayerState('EVENT_RACCOON');
    setEventStep(0);
    setIsNotRaccoon(false);
    
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    
    setEventText("before we continue...");
    await wait(2000);
    setEventText("prove you're not a raccoon.");
    setEventStep(1);
  };

  const handleRaccoonCheck = () => {
    setIsNotRaccoon(true);
    setEventStep(2);
    setEventText("accepted.");
    
    setTimeout(() => {
      setEventText("");
      startMusic(true);
    }, 2000);
  };


  if (!mounted) return null;

  const isRadioRoom = currentPath === '/radio' || currentPath === '/radio/';

  const recordGraphic = (
    <div 
      onClick={playerState === 'EVENT_BROKEN' && eventStep === 2 ? handleRecordTap : handlePlayClick}
      className={`relative rounded-full border border-white/10 bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] flex-shrink-0 transition-all duration-1000
        ${isRadioRoom ? 'w-48 h-48 sm:w-64 sm:h-64 shadow-[0_0_40px_rgba(0,0,0,0.85)] border-white/20' : 'w-8 h-8'}
        ${(playerState === 'IDLE' || playerState === 'PLAYING') ? 'cursor-pointer hover:border-white/20 hover:scale-[1.03]' : ''}
        ${(playerState === 'EVENT_BROKEN' && eventStep === 2) ? 'cursor-pointer animate-pulse border-[#a5b4fc]/50' : ''}
        ${isRadioRoom ? 'order-1' : 'order-2'}
      `}
    >
      <motion.div 
        className="w-full h-full rounded-full flex items-center justify-center"
        animate={{ 
          rotate: playerState === 'PLAYING' ? 360 : 0,
        }}
        transition={{ 
          rotate: { duration: 4, ease: "linear", repeat: Infinity },
        }}
      >
        {/* Vinyl Grooves */}
        <div className={`absolute rounded-full border border-white/5 transition-all duration-1000 ${isRadioRoom ? 'inset-4 border-white/10' : 'inset-1'}`}></div>
        <div className={`absolute rounded-full border border-white/5 transition-all duration-1000 ${isRadioRoom ? 'inset-8 border-white/10' : 'inset-2'}`}></div>
        {isRadioRoom && (
          <>
            <div className="absolute inset-12 rounded-full border border-white/5"></div>
            <div className="absolute inset-16 rounded-full border border-white/5"></div>
          </>
        )}
        {/* Center Label */}
        <div className={`rounded-full ${playerState === 'PLAYING' ? 'bg-[#a5b4fc]/40' : 'bg-white/10'} flex items-center justify-center transition-all duration-1000
          ${isRadioRoom ? 'w-16 h-16' : 'w-2.5 h-2.5'}
        `}>
          <div className={`bg-black rounded-full transition-all duration-1000 ${isRadioRoom ? 'w-3 h-3' : 'w-0.5 h-0.5'}`}></div>
        </div>
      </motion.div>

      {/* Needle / Tone Arm dot */}
      <div 
        className={`absolute rounded-full bg-white/20 transition-all duration-1000 origin-bottom-left
          ${isRadioRoom ? '-right-4 top-4 w-6 h-6' : '-right-1 top-1 w-1.5 h-1.5'}
          ${playerState === 'PLAYING' ? 'rotate-12 translate-x-[-4px] translate-y-[4px]' : '-rotate-45'}
        `} 
      />
    </div>
  );

  return (
    <div 
      id="record-player-widget"
      className={isRadioRoom 
        ? "fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-auto bg-[#050505]/40"
        : `${isTonight ? 'absolute' : 'fixed'} top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto transition-all duration-1000`
      }
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <audio 
        ref={audioRef}
        src={STATIONS[stationIndex].file}
        loop
        preload="auto"
      />

      <div className={`flex transition-all duration-1000 ${isRadioRoom ? 'flex-col items-center gap-8' : 'flex-row items-center gap-3'}`}>
        {/* Text Area */}
        <div className={`transition-all duration-1000 ${isRadioRoom ? 'text-center order-2 mt-4' : 'text-right order-1'}`}>
          <AnimatePresence mode="wait">
            {playerState === 'LOADING' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`text-xs text-white/50 tracking-wider ${isRadioRoom ? 'text-sm' : ''}`}
              >
                loading tape...
              </motion.div>
            )}
            {playerState === 'PLAYING' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`flex flex-col group cursor-pointer ${isRadioRoom ? 'items-center max-w-sm' : 'items-end max-w-[120px] sm:max-w-[200px] md:max-w-none'}`}
                onClick={changeStation}
                title="Click to change station"
              >
                <span className={`text-white/40 mb-0.5 ${isRadioRoom ? 'text-xs' : 'text-[10px]'}`}>now playing:</span>
                <span className={`text-[#a5b4fc]/80 transition-colors group-hover:text-[#a5b4fc] group-hover:drop-shadow-[0_0_4px_rgba(165,180,252,0.5)] truncate w-full ${isRadioRoom ? 'text-base text-center font-mono' : 'text-xs text-right'}`}>
                  {STATIONS[stationIndex].name}
                </span>
                {isRadioRoom && (
                  <span className="text-[10px] text-white/20 mt-2 font-mono hover:text-white/45 transition-colors">
                    (click text to change track)
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Record Graphic */}
        {recordGraphic}
      </div>

      {/* EVENT OVERLAYS */}
      <AnimatePresence>
        {(playerState === 'EVENT_BROKEN' || playerState === 'EVENT_CAT' || playerState === 'EVENT_RACCOON') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-12 right-0 bg-black/80 backdrop-blur-md border border-white/10 rounded-md p-4 min-w-[240px] max-w-[calc(100vw-32px)] shadow-2xl text-xs text-white/80 whitespace-pre-line text-right flex flex-col items-end"
          >
            <motion.div 
              key={eventText}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            >
              {eventText}
            </motion.div>

            {/* BROKEN EVENT ACTIONS */}
            {playerState === 'EVENT_BROKEN' && eventStep === 1 && (
              <motion.button 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-white"
                onClick={handleBrokenSure}
              >
                sure
              </motion.button>
            )}
            {playerState === 'EVENT_BROKEN' && eventStep === 2 && (
              <div className="mt-2 text-[#a5b4fc]/80">{taps}/3</div>
            )}

            {/* CAT EVENT ACTIONS */}
            {playerState === 'EVENT_CAT' && eventStep === 1 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 flex flex-col gap-2 items-end w-full"
              >
                {/* ASCII CAT */}
                <pre className="text-[10px] leading-tight text-white/60 mb-2 font-mono text-left w-full flex justify-center">
{` /\\_/\\
( o.o )
 > ^ <`}
                </pre>
                <button onClick={handleCatChoice} className="w-full text-right px-2 py-1 hover:bg-white/10 rounded transition-colors">ask politely</button>
                <button onClick={handleCatChoice} className="w-full text-right px-2 py-1 hover:bg-white/10 rounded transition-colors">bribe with treats</button>
                <button onClick={handleCatChoice} className="w-full text-right px-2 py-1 hover:bg-white/10 rounded transition-colors">wait</button>
              </motion.div>
            )}

            {/* RACCOON EVENT ACTIONS */}
            {playerState === 'EVENT_RACCOON' && eventStep === 1 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 -mr-1 rounded transition-colors"
                onClick={handleRaccoonCheck}
              >
                <div className={`w-3.5 h-3.5 border border-white/30 rounded-sm flex items-center justify-center ${isNotRaccoon ? 'bg-[#a5b4fc]/50 border-[#a5b4fc]' : ''}`}>
                  {isNotRaccoon && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                </div>
                <span>i am not a raccoon</span>
              </motion.div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
