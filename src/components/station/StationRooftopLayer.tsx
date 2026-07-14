import React, { useState, useEffect, useRef } from 'react';
import { PixelCat } from '../LivingCats/PixelCat';
import { hasEcho } from '../../lib/echoes';
import { motion } from 'framer-motion';

// Simple noise synth for wind and HVAC hum
class AmbientAudio {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private hvacGain: GainNode | null = null;
  public isPlaying = false;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Quieter wind for station
      }

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = buffer;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 300; 
      
      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0; 

      windSource.connect(windFilter);
      windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      windSource.start();

      const hvacOsc = this.ctx.createOscillator();
      hvacOsc.type = 'sine';
      hvacOsc.frequency.value = 55;

      const hvacOsc2 = this.ctx.createOscillator();
      hvacOsc2.type = 'triangle';
      hvacOsc2.frequency.value = 60;

      this.hvacGain = this.ctx.createGain();
      this.hvacGain.gain.value = 0;
      
      const hvacFilter = this.ctx.createBiquadFilter();
      hvacFilter.type = 'lowpass';
      hvacFilter.frequency.value = 120;

      hvacOsc.connect(hvacFilter);
      hvacOsc2.connect(hvacFilter);
      hvacFilter.connect(this.hvacGain);
      this.hvacGain.connect(this.ctx.destination);

      hvacOsc.start();
      hvacOsc2.start();

      this.isPlaying = true;
      
      this.windGain.gain.setTargetAtTime(0.008, this.ctx.currentTime, 2);
      this.hvacGain.gain.setTargetAtTime(0.006, this.ctx.currentTime, 2);
    } catch (e) {
      console.log('Audio init failed', e);
    }
  }

  stop() {
    if (this.ctx && this.windGain && this.hvacGain) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      this.hvacGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (this.ctx?.state === 'running') {
          this.ctx.close();
          this.ctx = null;
          this.isPlaying = false;
        }
      }, 600);
    }
  }
}

interface StationRooftopLayerProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function StationRooftopLayer({ timeOfDay }: StationRooftopLayerProps) {
  const [catPresent, setCatPresent] = useState(false);
  const [hasCoffeeCup, setHasCoffeeCup] = useState(false);
  
  const audioRef = useRef<AmbientAudio | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      if (!audioRef.current) audioRef.current = new AmbientAudio();
      if (!audioRef.current.isPlaying) audioRef.current.init();
    };
    document.addEventListener('click', handleInteraction, { once: true });
    
    // Auto-init if already interacted
    if (navigator.userActivation?.hasBeenActive) {
      handleInteraction();
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      if (audioRef.current) audioRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const roll = Math.random() * 100;
      if (roll < 5) setCatPresent(prev => !prev);
    };
    const intervalId = setInterval(tick, 10000); 
    if (Math.random() < 0.2) setCatPresent(true);
    if (Math.random() < 0.1) setHasCoffeeCup(true);
    return () => clearInterval(intervalId);
  }, []);

  const skyClasses = {
    morning: 'bg-gradient-to-b from-[#8fb8d9] via-[#c6d8e6] to-[#e4eef5]',
    afternoon: 'bg-gradient-to-b from-[#6fa0cc] via-[#8dbde6] to-[#b8dcf2]',
    evening: 'bg-gradient-to-b from-[#4c3b52] via-[#755972] to-[#b38b9d]',
    night: 'bg-gradient-to-b from-[#0a0a0f] via-[#10131c] to-[#1a1f2b]'
  };

  const cloudOpacity = timeOfDay === 'night' ? 'opacity-20' : 'opacity-60';

  return (
    <div className={`relative w-full h-[25dvh] shrink-0 overflow-hidden select-none transition-colors duration-[5000ms] ease-in-out ${skyClasses[timeOfDay]} border-b-[8px] border-[#0a0c10] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50`}>
      
      {/* Background Ambience & Clouds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {timeOfDay === 'night' && (
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-screen" />
        )}
        <motion.div 
          className={`absolute top-[10%] w-[200%] h-32 flex ${cloudOpacity}`}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_60%)] blur-xl transform scale-y-50" />
          <div className="w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_60%)] blur-xl transform scale-y-50 translate-x-32" />
        </motion.div>
      </div>

      {/* The City Skyline (Distant) */}
      <div className="absolute bottom-16 w-full h-32 z-10 pointer-events-none opacity-40">
        <div className={`absolute inset-0 transition-opacity duration-3000 ${timeOfDay === 'night' ? 'opacity-80' : 'opacity-30'}`}>
           <div className="absolute inset-0 bg-gradient-to-t from-[#e4eef5] to-transparent dark:from-[#1a1f2b] mix-blend-overlay opacity-50 z-20" />
           
           <div className="absolute bottom-0 left-[5%] w-16 h-20 bg-[#404c5e] blur-[1px]" />
           <div className="absolute bottom-0 left-[12%] w-12 h-32 bg-[#333d4e] blur-[1px]" />
           <div className="absolute bottom-0 left-[25%] w-24 h-16 bg-[#283242] blur-[1px]" />
           
           <div className="absolute bottom-0 right-[8%] w-16 h-28 bg-[#333d4e] blur-[1px]" />
           <div className="absolute bottom-0 right-[20%] w-20 h-16 bg-[#283242] blur-[1px]" />
           
           {timeOfDay === 'night' && (
             <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-amber-500/10 to-transparent blur-2xl mix-blend-screen" />
           )}
        </div>
      </div>

      {/* Structural Rooftop Foreground */}
      <div className="absolute bottom-0 w-full h-24 z-20">
        
        {/* Safety Railings */}
        <div className="absolute top-0 w-full h-8 border-t-[3px] border-b-2 border-[#1c222b] flex justify-between px-8 z-30 opacity-90 drop-shadow-md">
           {[...Array(32)].map((_, i) => (
             <div key={i} className="w-1 h-full bg-[#1c222b] shadow-[1px_0_0_rgba(255,255,255,0.05)]" />
           ))}
        </div>
        
        {/* Concrete Parapet Wall */}
        <div className="absolute top-8 w-full h-2 bg-gradient-to-b from-[#2a313b] to-[#202630] border-t border-white/5 z-20 shadow-inner" />
        
        {/* Concrete Flooring */}
        <div className="absolute top-10 w-full h-14 bg-[#1a1e26] overflow-hidden z-20 shadow-[inset_0_10px_10px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          
          <div className="absolute bottom-2 left-1/4 w-8 h-4 bg-[#0a0c10] rounded-sm border border-[#2a313b] shadow-inner opacity-80 flex flex-col justify-evenly py-0.5 px-0.5">
              {[...Array(3)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black" />)}
          </div>
        </div>

        {/* HVAC Unit 1 (Left) */}
        <div className="absolute bottom-4 left-[10%] w-24 h-20 bg-gradient-to-b from-[#2a313b] to-[#1c222b] rounded-sm border-t border-white/10 shadow-[3px_3px_10px_rgba(0,0,0,0.6)] z-30 flex flex-col items-center pt-2">
           <div className="w-16 h-16 bg-[#111] rounded-full border-2 border-[#1a1e26] flex items-center justify-center relative overflow-hidden shadow-inner">
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
             <div className="w-2 h-2 bg-[#2a313b] rounded-full z-10" />
             <motion.div 
               className="absolute w-14 h-14 opacity-80"
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-6 bg-[#0a0c10]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-6 bg-[#0a0c10]" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-6 h-1 bg-[#0a0c10]" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-1 bg-[#0a0c10]" />
             </motion.div>
           </div>
        </div>

        {/* Electrical / Utility Box */}
        <div className="absolute bottom-6 right-[35%] w-10 h-16 bg-[#3a4454] rounded-sm border-l border-white/10 shadow-[4px_4px_10px_rgba(0,0,0,0.5)] z-30 flex flex-col items-center pt-1 gap-1">
          <div className="w-8 h-6 bg-[#2a313b] border border-black/50 shadow-inner rounded-sm" />
          <div className="w-8 h-1.5 bg-[#1a1e26] border border-black/50" />
        </div>

        {/* Rooftop Access Door Building (Right Edge) */}
        <div className="absolute bottom-6 right-0 w-24 h-28 bg-gradient-to-l from-[#1a1e26] to-[#2a313b] border-l border-white/5 shadow-[-5px_0_15px_rgba(0,0,0,0.7)] z-30 flex justify-center items-end">
          <div className="w-14 h-24 bg-[#0f1217] rounded-t-sm border border-black relative shadow-inner">
            <div className="absolute top-1/2 right-1.5 w-1.5 h-1.5 bg-zinc-400 rounded-full shadow-sm" /> 
            {/* Warning Sign */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-6 bg-yellow-500/90 rounded-[1px] shadow-sm flex flex-col items-center justify-center py-0.5 opacity-80">
              <div className="w-2.5 h-2.5 rounded-full border border-black/80 flex items-center justify-center">
                 <div className="w-[1px] h-1.5 bg-black/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Storytelling: Forgotten Coffee Cup */}
        {hasCoffeeCup && (
          <div className="absolute top-7 left-[40%] w-1.5 h-2 bg-white/90 rounded-b-sm rounded-t-[1px] shadow-sm z-40">
            <div className="absolute -top-0.5 w-full h-[1px] bg-amber-800/80" />
          </div>
        )}

        {/* Storytelling: The Cat */}
        <div className={`absolute bottom-6 left-[28%] w-8 h-8 transition-opacity duration-[2000ms] z-40 ${catPresent ? 'opacity-80' : 'opacity-0'} transform scale-75 origin-bottom`}>
           <PixelCat state="sleeping" />
        </div>

        {/* Atmospheric Lighting Overlay */}
        {timeOfDay === 'night' && (
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply pointer-events-none z-50" />
        )}
        {timeOfDay === 'morning' && (
          <div className="absolute inset-0 bg-amber-100/10 mix-blend-screen pointer-events-none z-50" />
        )}
      </div>
    </div>
  );
}
