import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from './LivingTrain/Train';
import { PixelCat, type CatState } from './LivingCats/PixelCat';
import { useStationAudio } from './useStationAudio';

type StationState = 'WAITING_EMPTY' | 'ARRIVING' | 'STOPPED' | 'DEPARTING_EMPTY' | 'DEPARTING_BOARDED';

export function TheStation() {
  const [stationState, setStationState] = useState<StationState>('WAITING_EMPTY');
  const { playWind, stopWind, playTrainRumble, initAudio } = useStationAudio();
  const [timeOfDayClass, setTimeOfDayClass] = useState('bg-[#0F2027]');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('night');
  const [trainTriggered, setTrainTriggered] = useState(0);
  const [currentTrainType, setCurrentTrainType] = useState<'TER' | 'TGV' | 'Industrial' | 'random'>('TER');
  const [catState, setCatState] = useState<CatState>('idle');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setTimeOfDay('morning');
      setTimeOfDayClass('bg-gradient-to-b from-sky-300 via-orange-100 to-amber-200');
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay('afternoon');
      setTimeOfDayClass('bg-gradient-to-b from-blue-400 to-blue-200');
    } else if (hour >= 17 && hour < 20) {
      setTimeOfDay('evening');
      setTimeOfDayClass('bg-gradient-to-b from-indigo-800 via-purple-500 to-orange-400');
    } else {
      setTimeOfDay('night');
      setTimeOfDayClass('bg-gradient-to-b from-[#060B19] via-[#0D1832] to-[#17254A]');
    }
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    switch (stationState) {
      case 'WAITING_EMPTY':
        timeout = setTimeout(() => {
          setStationState('ARRIVING');
          playWind();
        }, 5000 + Math.random() * 5000); // Wait 5-10 seconds before arriving
        break;

      case 'ARRIVING':
        playTrainRumble();
        timeout = setTimeout(() => {
          setStationState('STOPPED');
        }, 5000);
        break;

      case 'STOPPED':
        // Train waits for 5-8 seconds
        timeout = setTimeout(() => {
          setStationState('DEPARTING_EMPTY');
        }, 5000 + Math.random() * 3000);
        break;

      case 'DEPARTING_EMPTY':
        playTrainRumble();
        timeout = setTimeout(() => {
          const isPassenger = Math.random() > 0.5; // 50/50 mix
          setCurrentTrainType(isPassenger ? (Math.random() > 0.5 ? 'TER' : 'TGV') : 'Industrial');
          setStationState('WAITING_EMPTY');
          setTrainTriggered(prev => prev + 1);
          stopWind();
        }, 20000); // Wait 20s to perfectly match the CSS depart animation duration
        break;
        
      case 'DEPARTING_BOARDED':
        playTrainRumble();
        break;
    }

    return () => clearTimeout(timeout);
  }, [stationState, playWind, stopWind, playTrainRumble]);


  const handleBoardTrain = () => {
    if (stationState === 'STOPPED') {
      initAudio();
      setStationState('DEPARTING_BOARDED');
    }
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] overflow-hidden select-none bg-black">
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] z-50 mix-blend-overlay"></div>

      {/* Layer 1: Atmosphere (Top ~30%) */}
      <div className={`relative w-full h-[30dvh] transition-colors duration-[3000ms] ${timeOfDayClass} flex flex-col justify-end overflow-hidden shrink-0`}>
        {/* Morning Mist */}
        {timeOfDay === 'morning' && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 mix-blend-screen blur-md pointer-events-none"></div>
        )}
        
        {/* Faint Stars for Night */}
        {timeOfDay === 'night' && (
          <div className="absolute inset-0 opacity-40">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute bg-white rounded-full" 
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2}px`,
                  height: `${Math.random() * 2}px`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Subtle Distant Horizon */}
        <div className="absolute bottom-0 inset-x-0 h-16 w-full flex items-end pointer-events-none z-10 opacity-60 mix-blend-multiply">
          {/* Distant City Skyline */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#1a2530]"></div>
          <div className="absolute bottom-0 inset-x-0 w-full h-16 flex items-end justify-around px-4">
            {[20, 40, 25, 55, 30, 80, 45, 15, 60, 35, 20, 70, 50, 25, 40, 15].map((h, i) => (
               <div key={`build1-${i}`} className="w-8 sm:w-16 bg-[#1a2530]" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#121824]"></div>
          <div className="absolute bottom-0 inset-x-0 w-full h-10 flex items-end justify-around px-2">
            {[30, 15, 45, 20, 35, 60, 25, 90, 50, 10, 80, 40, 20, 55, 30, 20, 45].map((h, i) => (
               <div key={`build2-${i}`} className="w-10 sm:w-20 bg-[#121824]" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          
          {/* Subtle Utility Poles & Power Lines */}
          <div className="absolute bottom-0 w-full h-16 flex justify-around opacity-40">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative h-full w-[2px] bg-[#05080f]">
                <div className="absolute top-2 -left-3 w-8 h-[1px] bg-[#05080f]"></div>
                <div className="absolute top-4 -left-2 w-6 h-[1px] bg-[#05080f]"></div>
              </div>
            ))}
            {/* Power lines connecting poles */}
            <div className="absolute top-2 inset-x-0 h-[1px] bg-[#05080f] opacity-30 transform origin-left rotate-[0.5deg]"></div>
            <div className="absolute top-4 inset-x-0 h-[1px] bg-[#05080f] opacity-30 transform origin-left -rotate-[0.5deg]"></div>
          </div>
        </div>

        {/* Signal Lights */}
        <div className="absolute bottom-2 inset-x-0 w-full h-2 pointer-events-none z-20 opacity-80">
          <div className="absolute bottom-0 right-[20%] w-1 h-1 rounded-full bg-red-500/80 blur-[0.5px]"></div>
          <div className="absolute bottom-0 left-[35%] w-1 h-1 rounded-full bg-orange-500/80 blur-[0.5px]"></div>
        </div>
      </div>

      {/* Layer 2: Train (Middle ~40%) */}
      {/* We clip the train here so it feels massive but stays contained in its layer */}
      <div className="relative w-full h-[40dvh] bg-black/10 overflow-hidden flex items-end z-30">
        
        {/* The Train Layer */}
        {/* With scale=32, the train is 1024px tall. We push it down by ~96px so the bottom track/wheels are hidden by the platform. */}
        <div className="absolute bottom-[-96px] w-full h-[1024px] pointer-events-none flex justify-center">
           <motion.div
            key={trainTriggered} // Force remount if we want a fresh train
            initial={{ x: 'calc(50vw + 50%)' }}
             animate={{
              x: stationState === 'WAITING_EMPTY' ? 'calc(50vw + 50%)' :
                 stationState === 'ARRIVING' || stationState === 'STOPPED' ? '0vw' : 'calc(-50vw - 50%)'
            }}
            transition={{ 
              duration: stationState === 'WAITING_EMPTY' ? 0 : 
                        stationState === 'DEPARTING_EMPTY' || stationState === 'DEPARTING_BOARDED' ? 20 : 10, 
              ease: stationState === 'ARRIVING' ? 'easeOut' : 
                    stationState === 'WAITING_EMPTY' ? 'linear' : 'easeIn'
            }}
            className="w-fit h-full pointer-events-auto"
          >
            <Train
              trainType={currentTrainType} 
              direction="left"
              speed={1}
              scale={32}
              stationary={true}
              showTracks={false}
              onBoard={handleBoardTrain}
              className="drop-shadow-[0_-5px_15px_rgba(255,165,0,0.15)] filter brightness-[0.85] contrast-[1.1] sepia-[0.1]"
              style={{ overflow: 'visible', width: 'fit-content' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Layer 3: Platform (Bottom ~30%) */}
      <div className={`relative w-full h-[30dvh] transition-colors duration-[3000ms] shadow-[inset_0_30px_40px_rgba(0,0,0,0.8)] z-40 overflow-hidden ${
        timeOfDay === 'morning' ? 'bg-[#1a1c23]' : 
        timeOfDay === 'afternoon' ? 'bg-[#22242a]' : 
        timeOfDay === 'evening' ? 'bg-[#151210]' : 
        'bg-[#0a0a0c]'
      }`}>
        
        {/* Blending light spilling onto platform */}
        <div className={`absolute top-0 inset-x-0 w-full h-full flex justify-around px-16 sm:px-32 pointer-events-none mix-blend-screen transition-opacity duration-[3000ms] opacity-40`}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-32 sm:w-64 h-[150%] bg-gradient-to-b to-transparent blur-3xl transform -skew-x-12 origin-top transition-colors duration-[3000ms] ${
              timeOfDay === 'morning' ? 'from-amber-200/10' :
              timeOfDay === 'afternoon' ? 'from-transparent' :
              timeOfDay === 'evening' ? 'from-amber-500/15' :
              'from-indigo-400/10'
            }`}></div>
          ))}
        </div>

        {/* The Cat */}
        <div className="absolute bottom-[20%] right-[30%] sm:right-[40%] z-50 scale-125 origin-bottom">
          <PixelCat state={catState} />
        </div>
      </div>

      {/* Fade out ending transition for boarding */}
      <AnimatePresence>
        {stationState === 'DEPARTING_BOARDED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4, delay: 2 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 6, duration: 2 }}
              className="text-white/30 text-sm tracking-[0.3em] font-serif uppercase"
            >
              Where does it go?
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
