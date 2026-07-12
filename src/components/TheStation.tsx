import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from './LivingTrain/Train';
import { PixelCat, type CatState } from './LivingCats/PixelCat';
import { useStationAudio } from './useStationAudio';

type StationState = 'WAITING_EMPTY' | 'ARRIVING' | 'STOPPED' | 'DEPARTING_EMPTY' | 'DEPARTING_BOARDED';

type StationCat = {
  id: number;
  state: CatState;
  xPos: number; // in vw
};

export function TheStation() {
  const [stationState, setStationState] = useState<StationState>('WAITING_EMPTY');
  const [cats, setCats] = useState<StationCat[]>([]);
  const { playWind, stopWind, playTrainRumble, initAudio } = useStationAudio();
  const [timeOfDayClass, setTimeOfDayClass] = useState('bg-[#0F2027]');
  const [trainTriggered, setTrainTriggered] = useState(0);
  const [currentTrainType, setCurrentTrainType] = useState<'TER' | 'TGV' | 'Industrial' | 'random'>('TER');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeOfDayClass('bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF]');
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDayClass('bg-gradient-to-b from-[#4A90E2] to-[#B3D4FF]');
    } else if (hour >= 17 && hour < 20) {
      setTimeOfDayClass('bg-gradient-to-b from-[#FF7E5F] to-[#FEB47B]');
    } else {
      setTimeOfDayClass('bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]');
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
        // Spawn a new cat
        const newCat: StationCat = {
          id: Date.now(),
          state: 'walking_right',
          xPos: 30 + Math.random() * 20, // Spawn somewhere in the middle-left
        };
        setCats(prev => [...prev, newCat]);
        
        // After 2 seconds, the new cat idles
        setTimeout(() => {
          setCats(prev => prev.map(c => c.id === newCat.id ? { ...c, state: 'idle' } : c));
        }, 2000);

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
          
          // Occasionally clean up old cats if there are too many (e.g. > 5)
          setCats(prev => {
            if (prev.length > 5) {
              return prev.slice(prev.length - 5);
            }
            return prev;
          });
        }, 20000); // Wait 20s to perfectly match the CSS depart animation duration
        break;
        
      case 'DEPARTING_BOARDED':
        playTrainRumble();
        break;
    }

    return () => clearTimeout(timeout);
  }, [stationState, playWind, stopWind, playTrainRumble]);

  // Manage existing cats wandering
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && cats.length > 0) {
        setCats(prev => prev.map(cat => {
          if (Math.random() > 0.5) {
            return {
              ...cat,
              state: Math.random() > 0.5 ? 'walking_right' : 'walking_left',
            };
          }
          return cat;
        }));

        setTimeout(() => {
          setCats(prev => prev.map(cat => ({ ...cat, state: 'idle' })));
        }, 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [cats.length]);

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

      {/* Layer 1: Atmosphere (Top ~40%) */}
      <div className={`relative w-full h-[40dvh] transition-colors duration-[3000ms] ${timeOfDayClass} flex flex-col justify-end overflow-hidden shrink-0`}>
        {/* Distant Atmosphere Elements */}
        <div className="absolute inset-x-0 bottom-0 flex justify-around opacity-20 pointer-events-none">
          <div className="w-16 h-64 border-l-4 border-r-4 border-t-4 rounded-t-lg border-white/20 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-white/40 mt-2 shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
          </div>
          <div className="w-16 h-64 border-l-4 border-r-4 border-t-4 rounded-t-lg border-white/20 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-white/40 mt-2 shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
          </div>
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
              style={{ overflow: 'visible', width: 'fit-content' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Layer 3: Platform (Bottom ~20%) */}
      <div className="relative w-full h-[20dvh] bg-[#111] border-t-4 border-white/10 shadow-[inset_0_20px_20px_rgba(0,0,0,0.5)] z-40">
        {/* Paving details */}
        <div className="absolute top-2 w-full h-4 bg-yellow-900/30 border-y border-yellow-700/20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)' }}></div>
        
        {/* Cats */}
        {cats.map(cat => (
          <motion.div
            key={cat.id}
            initial={{ x: `${cat.xPos - 10}vw`, opacity: 0 }}
            animate={{ x: `${cat.xPos}vw`, opacity: 1 }}
            transition={{ duration: 2, ease: 'linear' }}
            className="absolute -top-12 z-50 w-24 h-24 pointer-events-none"
          >
            <PixelCat state={cat.state} />
          </motion.div>
        ))}
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
