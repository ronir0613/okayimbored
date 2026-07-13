import React from 'react';
import { motion } from 'framer-motion';

interface CitySkylineProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  getBuildingColor: (layerIndex: number) => string;
}

export const CitySkyline = React.memo(({ timeOfDay, getBuildingColor }: CitySkylineProps) => {
  return (
    <div className="absolute bottom-0 inset-x-0 h-64 w-full flex items-end pointer-events-none z-10 opacity-90 transition-opacity duration-5000">
      {/* Layer -1: Ultra-Distant Megastructures */}
      <div className="absolute bottom-0 inset-x-0 w-full h-[22rem] flex items-end justify-between px-2 opacity-70">
        {[45,80,35,95,50,75,40,100,65,85,30,90,55,70,25,80,45,95,35,65,40].map((h, i) => (
          <div key={`ultra-${i}`} className={`w-10 sm:w-24 ${getBuildingColor(-1)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
            <div className="absolute inset-0 flex flex-wrap gap-1 p-2 justify-center content-start opacity-40 mt-6">
              {[...Array(Math.floor(h * 1.5))].map((_, wIdx) => {
                const isLit = ((h * wIdx * 27.1 + i * 5.3) % 1) > 0.25;
                return <div key={`uw-${wIdx}`} className={`w-1 h-2 sm:w-2 sm:h-3 ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-amber-200/40 shadow-[0_0_2px_rgba(253,230,138,0.2)]' : 'bg-transparent') : (isLit ? 'bg-sky-200/10' : 'bg-black/10')}`} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Layer 0: Huge Skyscrapers */}
      <div className="absolute bottom-0 inset-x-0 w-full h-64 flex items-end justify-between px-8">
        {[60,95,75,40,100,85,55,90,70,80].map((h, i) => {
          const isLean = h >= 95;
          return (
            <div key={`sky-${i}`} className={`${isLean ? 'w-6 sm:w-10' : 'w-12 sm:w-24'} ${getBuildingColor(0)} relative flex flex-col justify-end items-center overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
              {i % 2 === 0 && (
                <div className={`absolute -top-6 w-[2px] h-6 ${getBuildingColor(0)} transition-colors duration-[5000ms]`}>
                  <div className="absolute top-0 -left-[1px] w-1 h-1 bg-red-500/80 rounded-full animate-pulse" />
                </div>
              )}
              <div className="absolute inset-0 flex flex-wrap gap-1 sm:gap-1.5 p-2 justify-center content-start opacity-60 mt-4">
                {[...Array(Math.floor(h * (isLean ? 2 : 1.2)))].map((_, wIdx) => {
                  const isLit = ((h * wIdx * 17.3 + h * 4.1 + wIdx * 2.3) % 1) > 0.3;
                  return <div key={`win-${wIdx}`} className={`w-1 h-2 sm:w-2 sm:h-3 ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-amber-200/50 shadow-[0_0_3px_rgba(253,230,138,0.3)]' : 'bg-transparent') : (isLit ? 'bg-sky-200/20' : 'bg-black/30')}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mid-Distant City Skyline */}
      <div className="absolute bottom-0 inset-x-0 w-full h-40 flex items-end justify-between px-2">
        {[45,25,65,35,80,55,30,70,40,90,60,20,75,45,85,35,65,25,50,70].map((h, i) => (
          <div key={`build0.5-${i}`} className={`w-6 sm:w-12 ${getBuildingColor(0.5)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
            <div className="absolute inset-0 flex flex-wrap gap-[1px] sm:gap-1 p-1 justify-center content-start opacity-60 mt-3">
              {[...Array(Math.floor(h * 1.5))].map((_, wIdx) => {
                const isLit = ((h * wIdx * 13.7 + h * 5.1 + wIdx * 3.3) % 1) > 0.35;
                return <div key={`b0.5win-${wIdx}`} className={`w-1 h-1 sm:w-1.5 sm:h-2 ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-amber-200/40 shadow-[0_0_2px_rgba(253,230,138,0.2)]' : 'bg-transparent') : (isLit ? 'bg-sky-100/10' : 'bg-black/20')}`} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Distant City Skyline */}
      <div className={`absolute bottom-0 left-0 right-0 h-2 ${getBuildingColor(1)} transition-colors duration-[5000ms]`} />
      <div className="absolute bottom-0 inset-x-0 w-full h-24 flex items-end justify-around px-4">
        {[20,40,25,55,30,80,45,15,60,35,20,70,50,25,40,15].map((h, i) => (
          <div key={`build1-${i}`} className={`w-8 sm:w-16 ${getBuildingColor(1)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
            <div className="absolute inset-0 flex flex-wrap gap-[2px] sm:gap-1 p-1 justify-center content-start opacity-60 mt-2">
              {[...Array(Math.floor(h))].map((_, wIdx) => {
                const isLit = ((h * wIdx * 11.7 + h * 3.3 + wIdx * 5.1) % 1) > 0.3;
                return <div key={`b1win-${wIdx}`} className={`w-1 h-1 sm:w-1.5 sm:h-2 ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-orange-200/50 shadow-[0_0_2px_rgba(255,237,213,0.3)]' : 'bg-transparent') : (isLit ? 'bg-white/10' : 'bg-black/30')}`} />;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-1 ${getBuildingColor(2)} transition-colors duration-[5000ms]`} />
      <div className="absolute bottom-0 inset-x-0 w-full h-12 flex items-end justify-around px-2">
        {[30,15,45,20,35,60,25,90,50,10,80,40,20,55,30,20,45].map((h, i) => (
          <div key={`build2-${i}`} className={`w-10 sm:w-20 ${getBuildingColor(2)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
            <div className="absolute inset-0 flex flex-wrap gap-[2px] p-1 justify-center content-start opacity-60 mt-1">
              {[...Array(Math.floor(h))].map((_, wIdx) => {
                const isLit = ((h * wIdx * 19.1 + h * 7.7 + wIdx * 2.9) % 1) > 0.35;
                return <div key={`b2win-${wIdx}`} className={`w-1 h-1 sm:w-[3px] sm:h-[3px] ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-yellow-200/50 shadow-[0_0_1px_rgba(254,240,138,0.3)]' : 'bg-transparent') : (isLit ? 'bg-white/10' : 'bg-black/30')}`} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Foreground City Skyline */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${getBuildingColor(3)} transition-colors duration-[5000ms]`} />
      <div className="absolute bottom-0 inset-x-0 w-full h-6 flex items-end justify-between px-1">
        {[40,20,60,30,50,80,35,95,45,25,75,55,30,85,40,20,65,35,90,50,25,70].map((h, i) => (
          <div key={`build3-${i}`} className={`w-8 sm:w-16 ${getBuildingColor(3)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
            <div className="absolute inset-0 flex flex-wrap gap-[1px] p-[2px] justify-center content-start opacity-70 mt-1">
              {[...Array(Math.floor(h))].map((_, wIdx) => {
                const isLit = ((h * wIdx * 23.1 + h * 9.7 + wIdx * 4.9) % 1) > 0.25;
                return <div key={`b3win-${wIdx}`} className={`w-[2px] h-[2px] sm:w-1 sm:h-1 ${(timeOfDay === 'night' || timeOfDay === 'evening') ? (isLit ? 'bg-orange-200/60 shadow-[0_0_1px_rgba(255,237,213,0.4)]' : 'bg-transparent') : (isLit ? 'bg-white/10' : 'bg-black/40')}`} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Utility Poles & Power Lines */}
      <div className="absolute bottom-0 w-full h-16 flex justify-around opacity-40">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="relative h-full w-[2px] bg-[#05080f]">
            <div className="absolute top-2 -left-3 w-8 h-[1px] bg-[#05080f]" />
            <div className="absolute top-4 -left-2 w-6 h-[1px] bg-[#05080f]" />
            {i % 4 === 0 && (
              <motion.div
                className="absolute -top-1 left-0 w-1 h-1 bg-red-500 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 1] }}
              />
            )}
          </div>
        ))}
        <motion.div
          className="absolute top-2 inset-x-0 h-[1px] bg-[#05080f] opacity-30 transform origin-left"
          animate={{ rotate: ['0.5deg', '0.6deg', '0.5deg'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-4 inset-x-0 h-[1px] bg-[#05080f] opacity-30 transform origin-left"
          animate={{ rotate: ['-0.5deg', '-0.4deg', '-0.5deg'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
});
