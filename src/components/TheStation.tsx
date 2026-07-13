import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from './LivingTrain/Train';
import { PixelCat, type CatState } from './LivingCats/PixelCat';
import { useStationAudio } from './useStationAudio';
import { useCatBehavior } from './LivingCats/useCatBehavior';
import { useMicroEvents } from './useMicroEvents';
import { WindLeaves } from './WindLeaves';
import { SkyDetails } from './SkyDetails';
import { PlatformLeaves } from './PlatformLeaves';
import { PleasantRiver } from './PleasantRiver';

type StationState = 'WAITING_EMPTY' | 'ARRIVING' | 'STOPPED' | 'DEPARTING_EMPTY' | 'DEPARTING_BOARDED' | 'PASSING_THROUGH';

export function TheStation() {
  const [stationState, setStationState] = useState<StationState>('WAITING_EMPTY');
  const { playTimeSpecificAmbience, playTrainRumble, stopTrainRumble, initAudio } = useStationAudio();
  const [timeOfDayClass, setTimeOfDayClass] = useState('bg-[#0F2027]');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('night');
  const [trainTriggered, setTrainTriggered] = useState(0);
  const [currentTrainType, setCurrentTrainType] = useState<'TER' | 'TGV' | 'Industrial' | 'random'>('TER');
  const [trainDirection, setTrainDirection] = useState<'left' | 'right'>('left');
  const [willStop, setWillStop] = useState<boolean>(true);
  
  const { catState, catPosition, isVisible: isCatVisible, catWalkDuration, isBoarding, catY } = useCatBehavior(stationState);
  const { lightsFlickering, birdLanded } = useMicroEvents();

  const getBuildingColor = (layerIndex: number) => {
    switch (timeOfDay) {
      case 'morning':
        return {
          '-1': 'bg-[#8fb8d9]', 
          '0': 'bg-[#7a9bb8]', 
          '0.5': 'bg-[#678299]', 
          '1': 'bg-[#546b7a]', 
          '2': 'bg-[#40525c]', 
          '3': 'bg-[#2c383d]'
        }[layerIndex];
      case 'afternoon':
        return {
          '-1': 'bg-[#6fa0cc]', 
          '0': 'bg-[#5c85aa]', 
          '0.5': 'bg-[#4a6b8a]', 
          '1': 'bg-[#375269]', 
          '2': 'bg-[#273a4a]', 
          '3': 'bg-[#17222b]'
        }[layerIndex];
      case 'evening':
        return {
          '-1': 'bg-[#4c3b52]', 
          '0': 'bg-[#3d2f42]', 
          '0.5': 'bg-[#302533]', 
          '1': 'bg-[#221a24]', 
          '2': 'bg-[#161117]', 
          '3': 'bg-[#0a080a]'
        }[layerIndex];
      case 'night':
      default:
        return {
          '-1': 'bg-[#253242]', 
          '0': 'bg-[#202b38]', 
          '0.5': 'bg-[#1d2734]', 
          '1': 'bg-[#1a2530]', 
          '2': 'bg-[#121824]', 
          '3': 'bg-[#0a0f16]'
        }[layerIndex];
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setTimeOfDay('morning');
        setTimeOfDayClass('bg-gradient-to-b from-sky-300 via-orange-50 to-amber-100');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon');
        setTimeOfDayClass('bg-gradient-to-b from-blue-400 to-sky-200');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening');
        setTimeOfDayClass('bg-gradient-to-b from-indigo-800 via-purple-400 to-orange-300');
      } else {
        setTimeOfDay('night');
        setTimeOfDayClass('bg-gradient-to-b from-[#040812] via-[#0A1226] to-[#121E3B]');
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    playTimeSpecificAmbience(timeOfDay);
  }, [timeOfDay, playTimeSpecificAmbience]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    switch (stationState) {
      case 'WAITING_EMPTY':
        timeout = setTimeout(() => {
          setStationState(willStop ? 'ARRIVING' : 'PASSING_THROUGH');
        }, 15000 + Math.random() * 20000); // Wait 15-35 seconds before arriving
        break;

      case 'ARRIVING':
        playTrainRumble();
        timeout = setTimeout(() => {
          setStationState('STOPPED');
          stopTrainRumble();
        }, 10000);
        break;

      case 'STOPPED':
        // Train waits for 15-25 seconds
        timeout = setTimeout(() => {
          setStationState('DEPARTING_EMPTY');
        }, 15000 + Math.random() * 10000);
        break;

      case 'PASSING_THROUGH':
        playTrainRumble();
        timeout = setTimeout(() => {
          const rand = Math.random();
          setCurrentTrainType(rand > 0.95 ? 'Industrial' : (rand > 0.475 ? 'TGV' : 'TER'));
          setTrainDirection(Math.random() > 0.5 ? 'left' : 'right');
          setWillStop(Math.random() > 0.25); // 75% stop, 25% pass through
          setStationState('WAITING_EMPTY');
          setTrainTriggered(prev => prev + 1);
          stopTrainRumble();
        }, 12000); // Wait 12s to pass through completely
        break;

      case 'DEPARTING_EMPTY':
        playTrainRumble();
        timeout = setTimeout(() => {
          const rand = Math.random();
          // 5% chance Industrial, ~47.5% TGV, ~47.5% TER
          setCurrentTrainType(rand > 0.95 ? 'Industrial' : (rand > 0.475 ? 'TGV' : 'TER'));
          setTrainDirection(Math.random() > 0.5 ? 'left' : 'right');
          setWillStop(Math.random() > 0.25); // 75% stop, 25% pass through
          setStationState('WAITING_EMPTY');
          setTrainTriggered(prev => prev + 1);
          stopTrainRumble();
        }, 20000); // Wait 20s to perfectly match the CSS depart animation duration
        break;
        
      case 'DEPARTING_BOARDED':
        playTrainRumble();
        break;
    }

    return () => clearTimeout(timeout);
  }, [stationState, playTrainRumble, stopTrainRumble]);


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
      
      {/* Wind Leaves Layer */}
      <WindLeaves />

      {/* Layer 1: Atmosphere (Top ~40%) */}
      <div className={`relative w-full h-[40dvh] transition-colors duration-[5000ms] ${timeOfDayClass} flex flex-col justify-end overflow-hidden shrink-0`}>
        
        {/* Airplane trails and distant birds */}
        <SkyDetails timeOfDay={timeOfDay} />

        {/* Animated Clouds */}
        <motion.div 
          className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          style={{ width: '200%', backgroundImage: 'url("/assets/backgrounds/clouds.png")', backgroundSize: '50% 100%', backgroundRepeat: 'repeat-x' }}
        />

        {/* Morning Mist / Particles */}
        {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 mix-blend-screen blur-lg pointer-events-none"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        
        {/* Faint Stars for Night */}
        {(timeOfDay === 'night' || timeOfDay === 'evening') && (
          <div className={`absolute inset-0 transition-opacity duration-3000 ${timeOfDay === 'night' ? 'opacity-50' : 'opacity-10'}`}>
            {[...Array(25)].map((_, i) => (
              <motion.div 
                key={i} 
                className="absolute bg-white rounded-full" 
                style={{
                  top: `${Math.random() * 90}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 1.5 + 0.5}px`,
                  height: `${Math.random() * 1.5 + 0.5}px`,
                  opacity: Math.random() * 0.6 + 0.1
                }}
                animate={{ opacity: [Math.random() * 0.4 + 0.1, Math.random() * 0.8 + 0.2, Math.random() * 0.4 + 0.1] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}

        {/* Subtle Distant Horizon */}
        <div className="absolute bottom-0 inset-x-0 h-64 w-full flex items-end pointer-events-none z-10 opacity-90 transition-opacity duration-5000">
          
          {/* Layer -1: Ultra-Distant Megastructures */}
          <div className="absolute bottom-0 inset-x-0 w-full h-[22rem] flex items-end justify-between px-2 opacity-60">
            {[45, 80, 35, 95, 50, 75, 40, 100, 65, 85, 30, 90, 55, 70, 25, 80, 45, 95, 35, 65, 40].map((h, i) => (
               <div key={`ultra-${i}`} className={`w-10 sm:w-24 ${getBuildingColor(-1)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 <div className="absolute inset-0 flex flex-wrap gap-1 p-2 justify-center content-start opacity-30 mt-6">
                   {[...Array(Math.floor(h * 1.5))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 27.1 + i * 5.3) % 1) > 0.4;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-amber-100/30' : 'bg-transparent')
                       : (isLit ? 'bg-sky-200/10' : 'bg-black/10');
                     return (
                       <div key={`uw-${wIdx}`} className={`w-1 h-2 sm:w-2 sm:h-3 ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>

          {/* Layer 0: Huge Skyscrapers */}
          <div className="absolute bottom-0 inset-x-0 w-full h-64 flex items-end justify-between px-8">
            {[60, 95, 75, 40, 100, 85, 55, 90, 70, 80].map((h, i) => {
               const isLean = h >= 95;
               return (
               <div key={`sky-${i}`} className={`${isLean ? 'w-6 sm:w-10' : 'w-12 sm:w-24'} ${getBuildingColor(0)} relative flex flex-col justify-end items-center overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 {/* Antennas on some skyscrapers */}
                 {i % 2 === 0 && (
                   <div className={`absolute -top-6 w-[2px] h-6 ${getBuildingColor(0)} transition-colors duration-[5000ms]`}>
                      <div className="absolute top-0 -left-[1px] w-1 h-1 bg-red-500/80 rounded-full animate-pulse"></div>
                   </div>
                 )}
                 {/* Skyscraper windows */}
                 <div className="absolute inset-0 flex flex-wrap gap-1 sm:gap-1.5 p-2 justify-center content-start opacity-70 mt-4">
                   {[...Array(Math.floor(h * (isLean ? 2 : 1.2)))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 17.3 + h * 4.1 + wIdx * 2.3) % 1) > 0.4;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-amber-100/60' : 'bg-transparent')
                       : (isLit ? 'bg-sky-200/20' : 'bg-black/30');
                     return (
                       <div key={`win-${wIdx}`} className={`w-1 h-2 sm:w-2 sm:h-3 ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
               );
            })}
          </div>

          {/* Mid-Distant City Skyline (New Layer) */}
          <div className="absolute bottom-0 inset-x-0 w-full h-40 flex items-end justify-between px-2">
            {[45, 25, 65, 35, 80, 55, 30, 70, 40, 90, 60, 20, 75, 45, 85, 35, 65, 25, 50, 70].map((h, i) => (
               <div key={`build0.5-${i}`} className={`w-6 sm:w-12 ${getBuildingColor(0.5)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 <div className="absolute inset-0 flex flex-wrap gap-[1px] sm:gap-1 p-1 justify-center content-start opacity-60 mt-3">
                   {[...Array(Math.floor(h * 1.5))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 13.7 + h * 5.1 + wIdx * 3.3) % 1) > 0.45;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-amber-100/40' : 'bg-transparent')
                       : (isLit ? 'bg-sky-100/10' : 'bg-black/20');
                     return (
                       <div key={`b0.5win-${wIdx}`} className={`w-1 h-1 sm:w-1.5 sm:h-2 ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>

          {/* Distant City Skyline */}
          <div className={`absolute bottom-0 left-0 right-0 h-2 ${getBuildingColor(1)} transition-colors duration-[5000ms]`}></div>
          <div className="absolute bottom-0 inset-x-0 w-full h-24 flex items-end justify-around px-4">
            {[20, 40, 25, 55, 30, 80, 45, 15, 60, 35, 20, 70, 50, 25, 40, 15].map((h, i) => (
               <div key={`build1-${i}`} className={`w-8 sm:w-16 ${getBuildingColor(1)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 {/* Windows */}
                 <div className="absolute inset-0 flex flex-wrap gap-[2px] sm:gap-1 p-1 justify-center content-start opacity-50 mt-2">
                   {[...Array(Math.floor(h))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 11.7 + h * 3.3 + wIdx * 5.1) % 1) > 0.5;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-orange-100/50' : 'bg-transparent')
                       : (isLit ? 'bg-white/10' : 'bg-black/30');
                     return (
                       <div key={`b1win-${wIdx}`} className={`w-1 h-1 sm:w-1.5 sm:h-2 ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${getBuildingColor(2)} transition-colors duration-[5000ms]`}></div>
          <div className="absolute bottom-0 inset-x-0 w-full h-12 flex items-end justify-around px-2">
            {[30, 15, 45, 20, 35, 60, 25, 90, 50, 10, 80, 40, 20, 55, 30, 20, 45].map((h, i) => (
               <div key={`build2-${i}`} className={`w-10 sm:w-20 ${getBuildingColor(2)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 {/* Windows */}
                 <div className="absolute inset-0 flex flex-wrap gap-[2px] p-1 justify-center content-start opacity-40 mt-1">
                   {[...Array(Math.floor(h))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 19.1 + h * 7.7 + wIdx * 2.9) % 1) > 0.6;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-yellow-100/40' : 'bg-transparent')
                       : (isLit ? 'bg-white/10' : 'bg-black/30');
                     return (
                       <div key={`b2win-${wIdx}`} className={`w-1 h-1 sm:w-[3px] sm:h-[3px] ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>
          
          {/* Foreground City Skyline (New Layer, Darkest) */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${getBuildingColor(3)} transition-colors duration-[5000ms]`}></div>
          <div className="absolute bottom-0 inset-x-0 w-full h-6 flex items-end justify-between px-1">
            {[40, 20, 60, 30, 50, 80, 35, 95, 45, 25, 75, 55, 30, 85, 40, 20, 65, 35, 90, 50, 25, 70].map((h, i) => (
               <div key={`build3-${i}`} className={`w-8 sm:w-16 ${getBuildingColor(3)} relative overflow-hidden transition-colors duration-[5000ms]`} style={{ height: `${h}%` }}>
                 {/* Windows */}
                 <div className="absolute inset-0 flex flex-wrap gap-[1px] p-[2px] justify-center content-start opacity-30 mt-1">
                   {[...Array(Math.floor(h))].map((_, wIdx) => {
                     const isLit = ((h * wIdx * 23.1 + h * 9.7 + wIdx * 4.9) % 1) > 0.65;
                     const windowColor = (timeOfDay === 'night' || timeOfDay === 'evening')
                       ? (isLit ? 'bg-orange-100/30' : 'bg-transparent')
                       : (isLit ? 'bg-white/10' : 'bg-black/40');
                     return (
                       <div key={`b3win-${wIdx}`} className={`w-[2px] h-[2px] sm:w-1 sm:h-1 ${windowColor}`}></div>
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>

          {/* Subtle Utility Poles & Power Lines */}
          <div className="absolute bottom-0 w-full h-16 flex justify-around opacity-40">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative h-full w-[2px] bg-[#05080f]">
                <div className="absolute top-2 -left-3 w-8 h-[1px] bg-[#05080f]"></div>
                <div className="absolute top-4 -left-2 w-6 h-[1px] bg-[#05080f]"></div>
                {/* Subtle blinking red lights on distant towers */}
                {i % 4 === 0 && (
                  <motion.div 
                    className="absolute -top-1 left-0 w-1 h-1 bg-red-500 rounded-full"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 1] }}
                  />
                )}
              </div>
            ))}
            {/* Power lines connecting poles swaying slowly */}
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

        {/* Waterfront Promenade Streetlights */}
        <div className="absolute bottom-0 inset-x-0 w-full h-2 pointer-events-none z-20 flex justify-between px-2 sm:px-4 opacity-80">
          {[...Array(50)].map((_, i) => (
            <div key={`sl-${i}`} className="relative flex flex-col items-center justify-end h-full">
              {(timeOfDay === 'night' || timeOfDay === 'evening') && (
                <div className="absolute top-[1px] w-[1.5px] h-[1.5px] bg-amber-200/90 shadow-[0_0_3px_rgba(251,191,36,0.9)] rounded-full"></div>
              )}
              <div className="w-[1px] h-[4px] bg-[#0a0f16]"></div>
            </div>
          ))}
        </div>

        {/* Signal Lights */}
        <div className="absolute bottom-1 inset-x-0 w-full h-2 pointer-events-none z-20 opacity-80">
          <div className="absolute bottom-0 right-[20%] w-[3px] h-[3px] rounded-full bg-red-500/90 blur-[0.5px]"></div>
          <div className="absolute bottom-0 left-[35%] w-[3px] h-[3px] rounded-full bg-orange-500/90 blur-[0.5px]"></div>
        </div>
      </div>

      {/* Layer 2: Train & River (Middle ~40%) */}
      <div className="relative w-full h-[40dvh] overflow-hidden flex items-end z-30 transition-colors duration-5000">
        
        {/* River Background */}
        <PleasantRiver timeOfDay={timeOfDay} />

        {/* Subtle background behind train for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none mix-blend-multiply"></div>

        {/* The Train Layer */}
        <div className="absolute bottom-[-224px] w-full h-[1024px] pointer-events-none flex justify-center z-50">
           <motion.div
            key={trainTriggered}
            initial={{ x: trainDirection === 'left' ? 'calc(50vw + 50%)' : 'calc(-50vw - 50%)' }}
             animate={{
              x: stationState === 'WAITING_EMPTY' ? (trainDirection === 'left' ? 'calc(50vw + 50%)' : 'calc(-50vw - 50%)') :
                 stationState === 'ARRIVING' || stationState === 'STOPPED' ? '0vw' : 
                 (trainDirection === 'left' ? 'calc(-50vw - 50%)' : 'calc(50vw + 50%)')
            }}
            transition={{ 
              x: {
                duration: stationState === 'WAITING_EMPTY' ? 0 : 
                          stationState === 'PASSING_THROUGH' ? 12 :
                          stationState === 'DEPARTING_EMPTY' || stationState === 'DEPARTING_BOARDED' ? 20 : 10, 
                ease: stationState === 'ARRIVING' ? 'easeOut' : 
                      stationState === 'PASSING_THROUGH' ? 'linear' :
                      stationState === 'WAITING_EMPTY' ? 'linear' : 'easeIn'
              }
            }}
            className="w-fit h-full pointer-events-auto"
          >
            <Train
              trainType={currentTrainType} 
              direction={trainDirection}
              speed={stationState === 'PASSING_THROUGH' ? 1.5 : 1}
              scale={32}
              stationary={true}
              showTracks={false}
              onBoard={handleBoardTrain}
              isInteractable={stationState === 'STOPPED'}
              timeOfDay={timeOfDay}
              className={`drop-shadow-[0_-5px_15px_rgba(0,0,0,0.5)] transition-all duration-3000 ${timeOfDay === 'night' ? 'filter brightness-[0.7] contrast-[1.2]' : 'filter brightness-[0.85] contrast-[1.1] sepia-[0.1]'}`}
              style={{ overflow: 'visible', width: 'fit-content' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Layer 3: Platform (Bottom ~20%) */}
      <div className={`relative w-full h-[20dvh] transition-colors duration-[5000ms] shadow-[inset_0_30px_50px_rgba(0,0,0,0.9)] z-40 overflow-hidden ${
        timeOfDay === 'morning' ? 'bg-[#18191e]' : 
        timeOfDay === 'afternoon' ? 'bg-[#1e2025]' : 
        timeOfDay === 'evening' ? 'bg-[#12100f]' : 
        'bg-[#08080a]'
      }`}>
        
        {/* Platform Edge Trim */}
        <div className="absolute top-0 inset-x-0 w-full h-3 border-b-2 border-black/60 bg-white/10 pointer-events-none z-30"></div>
        <div className="absolute top-3 inset-x-0 w-full h-1 bg-black/40 pointer-events-none z-30"></div>

        {/* Fallen Petals on the Platform */}
        <PlatformLeaves stationState={stationState} trainDirection={trainDirection} />

        {/* Concrete Block Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 2px, transparent 2px),
              linear-gradient(to bottom, #000 2px, transparent 2px)
            `,
            backgroundSize: '128px 64px'
          }}
        >
          {/* Staggered vertical lines for brick effect */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 2px, transparent 2px)`,
              backgroundSize: '128px 64px',
              backgroundPosition: '64px 32px'
            }}
          />
        </div>

        {/* Grunge and Weathering */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>
        
        {/* Enhanced noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.08] mix-blend-overlay pointer-events-none"></div>

        {/* Blending light spilling onto platform */}
        <div className={`absolute top-0 inset-x-0 w-full h-full flex justify-around px-16 sm:px-32 pointer-events-none mix-blend-screen transition-opacity duration-[5000ms] opacity-30 ${lightsFlickering ? 'opacity-10' : ''}`}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-32 sm:w-64 h-[150%] bg-gradient-to-b to-transparent blur-3xl transform -skew-x-12 origin-top transition-colors duration-[5000ms] ${
              timeOfDay === 'morning' ? 'from-amber-100/10' :
              timeOfDay === 'afternoon' ? 'from-white/5' :
              timeOfDay === 'evening' ? 'from-amber-400/15' :
              'from-blue-300/10'
            }`}></div>
          ))}
        </div>

        {/* Fluorescent light effects (Evening specific) */}
        <AnimatePresence>
          {timeOfDay === 'evening' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
              className={`absolute top-0 inset-x-0 w-full h-full flex justify-around px-20 sm:px-40 pointer-events-none mix-blend-screen opacity-60 ${lightsFlickering ? 'opacity-10' : ''}`}
            >
              {[1, 2, 3].map(i => (
                <div key={`fluor-${i}`} className="relative w-24 sm:w-48 h-[150%]">
                   {/* Buzzing fluorescent spill */}
                   <motion.div 
                     className="absolute inset-0 bg-gradient-to-b from-cyan-300/20 via-emerald-200/5 to-transparent blur-2xl transform -skew-x-12 origin-top"
                     animate={{ opacity: [0.8, 1, 0.7, 0.9, 1, 0.6, 1] }}
                     transition={{ duration: 4 + i, repeat: Infinity, repeatType: "mirror" }}
                   />
                   {/* Bright core reflection on the ground */}
                   <motion.div 
                     className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-32 h-6 bg-cyan-100/10 blur-xl rounded-[100%]"
                     animate={{ opacity: [0.5, 0.8, 0.4, 0.9, 0.7] }}
                     transition={{ duration: 2 + (i * 0.5), repeat: Infinity, repeatType: "mirror" }}
                   />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Bird micro event */}
        {birdLanded && timeOfDay !== 'night' && (
          <div className="absolute bottom-[40%] right-[15%] w-2 h-2 bg-black/60 rounded-full animate-pulse" />
        )}

        {/* The Cat */}
        {isCatVisible && (
          <div 
            className="absolute z-50 origin-bottom transition-all"
            style={{ 
              bottom: `calc(20% + ${catY}%)`,
              left: `${catPosition}%`,
              transform: `scale(${isBoarding ? 1.25 - (catY / 100) : 1.25})`,
              opacity: isBoarding && catY > 20 ? 1 - ((catY - 20) / 10) : 1,
              transitionDuration: `${catState.startsWith('walking') ? catWalkDuration : 100}ms`,
              transitionTimingFunction: 'linear'
            }}
          >
            <PixelCat state={catState} />
          </div>
        )}
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
