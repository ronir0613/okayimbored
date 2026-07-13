import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BoatData = {
  id: number;
  type: 'superyacht' | 'yacht' | 'speedboat';
  top: number;
  direction: 1 | -1;
  duration: number;
  delay: number;
};

export function PleasantRiver({ timeOfDay }: { timeOfDay: string }) {
  const riverColor = 
    timeOfDay === 'morning' ? 'from-cyan-300 via-sky-400 to-blue-500' :
    timeOfDay === 'afternoon' ? 'from-blue-400 via-blue-500 to-indigo-700' :
    timeOfDay === 'evening' ? 'from-indigo-600 via-fuchsia-700 to-purple-900' :
    'from-[#0b1320] via-[#080d17] to-[#040812]'; // Night

  const reflectionColor = 
    timeOfDay === 'morning' ? 'bg-white/40' :
    timeOfDay === 'afternoon' ? 'bg-sky-200/30' :
    timeOfDay === 'evening' ? 'bg-orange-300/30' :
    'bg-indigo-300/10';

  // Generate static shimmering pixel-lines
  const waves = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      top: 5 + Math.random() * 90,
      width: 2 + Math.random() * 15, // narrow pixel lines
      opacity: 0.2 + Math.random() * 0.6,
      duration: 15 + Math.random() * 40,
      direction: Math.random() > 0.5 ? 1 : -1,
      delay: Math.random() * -40,
      height: Math.random() > 0.8 ? 2 : 1, // 1px or 2px high
    }));
  }, []);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [boats, setBoats] = useState<BoatData[]>([]);

  useEffect(() => {
    // Generate boats dynamically
    const generateBoat = () => {
      const type = Math.random() > 0.85 ? 'superyacht' : (Math.random() > 0.6 ? 'yacht' : 'speedboat');
      const direction = Math.random() > 0.5 ? 1 : -1;
      // Drastically increase duration for massive distant movement
      const duration = type === 'superyacht' ? (600 + Math.random() * 400) : 
                       type === 'yacht' ? (400 + Math.random() * 200) : 
                       (200 + Math.random() * 100); 
      
      const newBoat: BoatData = {
        id: Date.now() + Math.random(),
        type,
        top: 2 + Math.random() * 25, // push them very close to the horizon

        direction,
        duration,
        delay: 0,
      };

      setBoats(prev => [...prev, newBoat]);

      // Remove the boat after it finishes its animation
      setTimeout(() => {
        setBoats(prev => prev.filter(b => b.id !== newBoat.id));
      }, (duration + 5) * 1000);
    };

    // Initial boats
    for(let i = 0; i < 4; i++) {
       // scatter initial boats
       setTimeout(() => generateBoat(), Math.random() * 20000);
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.4) generateBoat();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${riverColor} overflow-hidden transition-colors duration-[5000ms] pointer-events-none`}>
      
      {/* City skyline and street glow reflection at the horizon */}
      <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b to-transparent transition-colors duration-[5000ms] mix-blend-screen ${
        timeOfDay === 'night' ? 'from-amber-400/10 via-amber-600/5' :
        timeOfDay === 'evening' ? 'from-orange-400/15 via-orange-600/5' :
        'from-white/20'
      }`}></div>

      {/* Shore streetlight reflections */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <div className="absolute top-0 inset-x-0 w-full h-12 flex justify-between px-2 sm:px-4 opacity-30 mix-blend-screen pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={`sl-ref-${i}`} className="w-[1.5px] h-full bg-gradient-to-b from-amber-200/50 to-transparent blur-[1px] transform -skew-x-12" />
          ))}
        </div>
      )}

      {/* Background Noise for texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay"></div>

      {/* Pixel Water Waves */}
      <div className="absolute inset-0 mix-blend-overlay">
        {isMounted && waves.map((wave, i) => (
          <motion.div
            key={i}
            className={`absolute ${reflectionColor}`}
            style={{ 
              top: `${wave.top}%`, 
              height: `${wave.height}px`,
            }}
            animate={{ 
              x: wave.direction > 0 ? ['-150vw', '150vw'] : ['150vw', '-150vw'],
              scaleX: [1, 1.5, 1],
              opacity: [wave.opacity * 0.5, wave.opacity, wave.opacity * 0.5],
            }}
            transition={{ 
              x: { duration: wave.duration, repeat: Infinity, ease: 'linear', delay: wave.delay },
              scaleX: { duration: wave.duration / 3, repeat: Infinity, ease: 'easeInOut', delay: wave.delay },
              opacity: { duration: wave.duration / 4, repeat: Infinity, ease: 'easeInOut', delay: wave.delay },
            }}
          />
        ))}
      </div>

      {/* Subtle depth gradient at the top (distant water) */}
      <div className="absolute top-0 inset-x-0 h-4 bg-black/40"></div>
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>

      {/* Boats Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {boats.map(boat => {
            const isYacht = boat.type === 'yacht';
            // Calculate scale and opacity to simulate massive distant ships
            const scaleX = boat.direction === 1 ? -1 : 1;
            const distanceScale = 0.5 + (boat.top / 100) * 0.4; // 0.5 to 0.6 scale, large but distant
            const distanceOpacity = 0.4 + (boat.top / 100) * 0.4; // 0.4 to 0.8 opacity, slightly opaque
            
            const isEveningOrNight = timeOfDay === 'evening' || timeOfDay === 'night';
            const windowColor = isEveningOrNight ? 'bg-amber-100 shadow-[0_0_12px_rgba(251,191,36,1)]' : 'bg-slate-900';
            const cabinGlow = isEveningOrNight ? <div className="absolute inset-0 bg-amber-300/40 blur-[6px] rounded-full mix-blend-screen pointer-events-none" /> : null;

            return (
              <motion.div
                key={boat.id}
                className="absolute flex flex-col items-center justify-end pointer-events-none mix-blend-screen"
                style={{
                  top: `${boat.top}%`,
                  transformOrigin: 'bottom center',
                  zIndex: Math.floor(boat.top), // sort by Y coordinate (fake depth)
                }}
                initial={{ x: boat.direction === 1 ? '-20vw' : '120vw', opacity: 0 }}
                animate={{ x: boat.direction === 1 ? '120vw' : '-20vw', opacity: distanceOpacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: boat.duration, ease: 'linear' }}
              >
                <div style={{ transform: `scale(${scaleX * distanceScale}, ${distanceScale})` }} className="relative">
                  {boat.type === 'superyacht' ? (
                    // Superyacht Pixel Art
                    <div className="relative w-48 h-12">
                       {/* Hull */}
                       <div className="absolute bottom-0 left-0 w-48 h-5 bg-white rounded-bl-3xl rounded-br-md">
                         <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900/60"></div>
                       </div>
                       {/* Multiple Decks */}
                       <div className="absolute bottom-5 left-4 w-40 h-4 bg-white">
                         {cabinGlow}
                         <div className="absolute bottom-0 left-2 w-32 h-2 bg-slate-900/80 flex justify-between px-1">
                           {[...Array(6)].map((_, i) => <div key={i} className={`w-4 h-full ${windowColor}`}></div>)}
                         </div>
                       </div>
                       <div className="absolute bottom-9 left-12 w-24 h-3 bg-white">
                         {cabinGlow}
                         <div className="absolute bottom-0 left-2 w-16 h-2 bg-slate-900/80 flex justify-evenly px-1">
                           {[...Array(3)].map((_, i) => <div key={i} className={`w-3 h-full ${windowColor}`}></div>)}
                         </div>
                       </div>
                       {/* Radar & Antennas */}
                       <div className="absolute bottom-12 left-20 w-8 h-2 bg-slate-200">
                         <div className="absolute -top-3 left-2 w-[1px] h-3 bg-slate-400"></div>
                         <div className="absolute -top-4 left-6 w-[2px] h-4 bg-slate-300"></div>
                       </div>
                       {/* Wake Trail */}
                       <div className="absolute -bottom-1 -right-24 w-40 h-[2px] bg-white/40 blur-[2px] rounded-full"></div>
                    </div>
                  ) : boat.type === 'yacht' ? (
                    // Yacht Pixel Art (facing left by default)
                    <div className="relative w-24 h-8">
                       {/* Hull */}
                       <div className="absolute bottom-0 left-0 w-24 h-4 bg-white rounded-bl-xl rounded-br-sm">
                         {/* Water line */}
                         <div className="absolute bottom-0 left-0 w-full h-[2px] bg-sky-900/40"></div>
                       </div>
                       {/* Cabin */}
                       <div className="absolute bottom-4 left-4 w-16 h-3 bg-white">
                         {cabinGlow}
                         {/* Windows */}
                         <div className="absolute bottom-0 left-1 w-12 h-2 bg-slate-900/80 flex justify-evenly">
                           <div className={`w-2 h-full ${windowColor}`}></div>
                           <div className={`w-2 h-full ${windowColor}`}></div>
                           <div className={`w-2 h-full ${windowColor}`}></div>
                         </div>
                       </div>
                       {/* Upper deck */}
                       <div className="absolute bottom-7 left-8 w-8 h-1 bg-white">
                         {/* Radar */}
                         <div className="absolute -top-2 left-2 w-1 h-2 bg-slate-300"></div>
                         <div className="absolute -top-2 left-1 w-3 h-[2px] bg-slate-400"></div>
                       </div>
                       {/* Wake Trail */}
                       <div className="absolute -bottom-1 -right-12 w-20 h-[2px] bg-white/40 blur-[1px] rounded-full"></div>
                    </div>
                  ) : (
                    // Speedboat Pixel Art (facing left by default)
                    <div className="relative w-12 h-4">
                       {/* Hull */}
                       <div className="absolute bottom-0 left-0 w-12 h-2 bg-white rounded-bl-lg">
                          {/* Stripe */}
                          <div className="absolute bottom-[1px] left-0 w-full h-[1px] bg-red-500"></div>
                       </div>
                       {/* Windshield / Cabin */}
                       <div className="absolute bottom-2 left-2 w-6 h-2 bg-cyan-900/80 rounded-tr-md rounded-tl-sm relative">
                         {isEveningOrNight && <div className="absolute inset-0 bg-amber-300/50 blur-[4px] mix-blend-screen pointer-events-none" />}
                         {isEveningOrNight && <div className="absolute bottom-0 right-1 w-1.5 h-1.5 bg-amber-100 rounded-full shadow-[0_0_8px_rgba(251,191,36,1)]"></div>}
                       </div>
                       
                       {/* Wake / Splash */}
                       <div className="absolute -bottom-1 -right-6 w-12 h-[2px] bg-white/60 blur-[1px] rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Boat Reflection */}
                  <div className="absolute top-full left-0 w-full h-full scale-y-[-1] opacity-20 blur-[2px] pointer-events-none">
                     <div className={`w-full ${boat.type === 'superyacht' ? 'h-12' : boat.type === 'yacht' ? 'h-8' : 'h-4'} bg-white rounded-t-xl`}></div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Depth gradient at the bottom (water meeting the platform edge) */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
    </div>
  );
}
