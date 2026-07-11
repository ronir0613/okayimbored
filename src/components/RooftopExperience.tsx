import React, { useState, useEffect, useRef } from 'react';
import { PixelCat } from './LivingCats/PixelCat';
import { addEcho, hasEcho } from '../lib/echoes';
import { useExperienceStore } from '../lib/store';

const MICROCOPY = [
  "good view.",
  "someone else is probably awake.",
  "take your time.",
  "it's quieter up here.",
  "we come here sometimes.",
  "the city never really sleeps."
];

// Simple noise synth for wind
class AmbientAudio {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  public isPlaying = false;
  private sourceNode: AudioBufferSourceNode | null = null;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create pink noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
      }

      this.sourceNode = this.ctx.createBufferSource();
      this.sourceNode.buffer = buffer;
      this.sourceNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 400; // Muffled wind
      
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0; // Start silent

      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      
      this.sourceNode.start();
      this.isPlaying = true;
      
      // Fade in very subtly
      this.gainNode.gain.setTargetAtTime(0.015, this.ctx.currentTime, 2);
    } catch (e) {
      console.log('Audio init failed', e);
    }
  }

  // Occasional distant rumble (train/traffic)
  triggerRumble() {
    if (!this.ctx || !this.gainNode || !this.filterNode) return;
    // Lower filter frequency and slightly increase gain
    this.filterNode.frequency.setTargetAtTime(150, this.ctx.currentTime, 1);
    this.gainNode.gain.setTargetAtTime(0.025, this.ctx.currentTime, 1);
    
    // Return to normal after a few seconds
    setTimeout(() => {
      if (!this.ctx || !this.gainNode || !this.filterNode) return;
      this.filterNode.frequency.setTargetAtTime(400, this.ctx.currentTime, 2);
      this.gainNode.gain.setTargetAtTime(0.015, this.ctx.currentTime, 2);
    }, 4000);
  }

  stop() {
    if (this.ctx && this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
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

export default function RooftopExperience() {
  const [skyGradient, setSkyGradient] = useState('linear-gradient(to bottom, #020204 0%, #0a0a0f 100%)');
  const [powerOutage, setPowerOutage] = useState(false);
  const [currentMicrocopy, setCurrentMicrocopy] = useState<string | null>(null);
  const [hasSecondBench, setHasSecondBench] = useState(false);
  const [catPresent, setCatPresent] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AmbientAudio | null>(null);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, phase: number, baseOpacity: number}[]>([]);
  const animationRef = useRef<number>(0);
  const shootingStarRef = useRef<{x: number, y: number, length: number, angle: number, opacity: number, speed: number} | null>(null);

  // Determine sky color based on hour
  useEffect(() => {
    const updateSky = () => {
      const hour = new Date().getHours();
      let topColor = '#020204';
      let bottomColor = '#0a0a0f';
      
      if (hour >= 0 && hour <= 3) {
        // Very Late Night
        topColor = '#020204'; bottomColor = '#050508';
      } else if (hour >= 4 && hour <= 5) {
        // Before Sunrise
        topColor = '#050514'; bottomColor = '#100b1a';
      } else if (hour === 6) {
        // Dawn
        topColor = '#15152a'; bottomColor = '#2a1a2b';
      } else if (hour >= 7 && hour <= 15) {
        // Day - still dark enough for stars but more blue/grey
        topColor = '#12182b'; bottomColor = '#1a2235';
      } else if (hour >= 16 && hour <= 17) {
        // Late Afternoon
        topColor = '#0f1423'; bottomColor = '#171e2c';
      } else if (hour === 18) {
        // Blue Hour
        topColor = '#070a18'; bottomColor = '#0f162e';
      } else if (hour >= 19 && hour <= 21) {
        // Early Evening
        topColor = '#04050a'; bottomColor = '#080a14';
      } else if (hour >= 22 && hour <= 23) {
        // Late Night
        topColor = '#020205'; bottomColor = '#05050a';
      }
      setSkyGradient(`linear-gradient(to bottom, ${topColor} 0%, ${bottomColor} 100%)`);
    };
    
    updateSky();
    addEcho('visited_rooftop');
    useExperienceStore.getState().incrementCuriosity();
    const interval = setInterval(updateSky, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', handleResize);

    const initStars = () => {
      starsRef.current = [];
      const starCount = Math.floor((width * height) / 10000); // Responsive star count
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.2 + 0.1,
          speed: 0.005 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
          baseOpacity: Math.random() * 0.5 + 0.1
        });
      }
    };
    initStars();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Stars
      starsRef.current.forEach(star => {
        star.phase += star.speed * 0.5; // Slower twinkling
        // Very subtle twinkling
        const opacity = star.baseOpacity + (Math.sin(star.phase) * 0.15);
        if (opacity < 0) return;
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Shooting Star
      if (shootingStarRef.current) {
        const s = shootingStarRef.current;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.02; // fade out

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStarRef.current = null;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Audio Context (start on interaction)
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioRef.current) {
        audioRef.current = new AmbientAudio();
      }
      if (!audioRef.current.isPlaying) {
        audioRef.current.init();
      }
    };
    
    // We bind to document to catch any click on the page
    document.addEventListener('click', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      if (audioRef.current) {
        audioRef.current.stop();
      }
    };
  }, []);

  // Rare Events Loop
  useEffect(() => {
    const tick = () => {
      const roll = Math.random() * 100;
      
      // Shooting star (1% or 3% with The Star echo)
      const starChance = hasEcho('tarot_the_star') ? 3.0 : 1.0;
      if (roll < starChance && !shootingStarRef.current) {
        shootingStarRef.current = {
          x: Math.random() * (window.innerWidth / 2),
          y: Math.random() * (window.innerHeight / 3),
          length: Math.random() * 50 + 20,
          angle: Math.PI / 6 + (Math.random() * 0.2), // Down and right slightly
          opacity: 1,
          speed: Math.random() * 10 + 15
        };
      }
      
      // Power outage (0.5%)
      if (roll < 0.5 && !powerOutage) {
        setPowerOutage(true);
        setTimeout(() => setPowerOutage(false), 5000); // Returns after 5s
      }

      // Microcopy (0.1%)
      if (roll < 0.1 && !currentMicrocopy) {
        // Small chance for a very specific caption
        if (Math.random() < 0.1) {
          setCurrentMicrocopy("you picked a good night.");
        } else if (hasEcho('visited_window') && Math.random() < 0.3) {
          setCurrentMicrocopy("a natural continuation.");
        } else {
          const quote = MICROCOPY[Math.floor(Math.random() * MICROCOPY.length)];
          setCurrentMicrocopy(quote);
        }
        setTimeout(() => setCurrentMicrocopy(null), 8000);
      }
      
      // Second bench (0.01%) - Very rare
      if (roll < 0.01 && !hasSecondBench) {
        setHasSecondBench(true);
      }
      
      // Distant train/traffic sound (trigger rumble occasionally)
      if (roll < 2.0 && audioRef.current?.isPlaying) {
        audioRef.current.triggerRumble();
      }

      // Cat movement (very rare)
      if (roll < 0.2) {
        // Toggle cat presence rarely
        setCatPresent(prev => !prev);
      }
    };

    const intervalId = setInterval(tick, 3000); // Check every 3s
    
    // Initial rare cat roll
    if (Math.random() < 0.05) setCatPresent(true);

    return () => clearInterval(intervalId);
  }, [powerOutage, currentMicrocopy, hasSecondBench]);

  const handleBack = () => {
    sessionStorage.setItem('okayimbored_returning_from_secret', 'true');
    window.location.href = '/';
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden select-none transition-colors duration-[5000ms] ease-in-out"
      style={{ background: skyGradient }}
    >
      {/* Starfield */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Microcopy */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-[3000ms] ${currentMicrocopy ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="text-xs font-mono text-white/40 tracking-widest font-light">
          {currentMicrocopy}
        </p>
      </div>

      {/* The City & Rooftop Elements */}
      <div className="absolute bottom-0 w-full h-64 z-20 pointer-events-none">
        {/* Distant City Skyline */}
        <div 
          className={`absolute bottom-12 w-full h-32 opacity-20 transition-all duration-[3000ms] ${powerOutage ? 'opacity-5 blur-[2px]' : ''}`}
        >
          {/* Faint generic buildings */}
          <div className="absolute bottom-0 left-[10%] w-16 h-24 bg-[#0a0f1a]" />
          <div className="absolute bottom-0 left-[15%] w-12 h-32 bg-[#050a12]" />
          <div className="absolute bottom-0 left-[25%] w-20 h-16 bg-[#080d15]" />
          
          <div className="absolute bottom-0 right-[20%] w-14 h-28 bg-[#0a0f1a]" />
          <div className="absolute bottom-0 right-[35%] w-24 h-20 bg-[#050a12]" />

          {/* Tiny lit window */}
          {!powerOutage && (
            <div className="absolute bottom-16 left-[12%] w-[2px] h-[3px] bg-[#fdf2b3] opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
          )}

          {/* Radio tower with blinking light */}
          <div className="absolute bottom-0 right-[40%] w-[2px] h-40 bg-[#151a25]">
            {!powerOutage && (
              <div className="absolute -top-1 -left-[1px] w-[4px] h-[4px] rounded-full bg-red-500/80 animate-pulse" style={{ animationDuration: '2s' }} />
            )}
          </div>

          {/* Faint Billboard "okay." */}
          <div className="absolute bottom-12 right-[22%] w-10 h-6 border border-[#1a2233] bg-[#050a12] flex items-center justify-center">
            {!powerOutage && (
              <span className="text-[4px] text-white/30 font-mono">okay.</span>
            )}
          </div>
        </div>

        {/* Rooftop Wall */}
        <div className="absolute bottom-0 w-full h-12 bg-[#050505] border-t border-[#111]" />

        {/* The Bench */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-4 border-t-2 border-[#151515] flex justify-between px-2">
          <div className="w-1 h-6 bg-[#0a0a0a] translate-y-[-2px]" />
          <div className="w-1 h-6 bg-[#0a0a0a] translate-y-[-2px]" />
        </div>

        {/* The Second Bench (0.01% chance) */}
        {hasSecondBench && (
          <div className="absolute bottom-12 left-1/4 -translate-x-1/2 w-32 h-4 border-t-2 border-[#151515] flex justify-between px-2 opacity-50">
            <div className="w-1 h-6 bg-[#0a0a0a] translate-y-[-2px]" />
            <div className="w-1 h-6 bg-[#0a0a0a] translate-y-[-2px]" />
          </div>
        )}

        {/* The Cat */}
        <div className={`absolute bottom-[44px] right-[15%] w-12 h-12 transition-opacity duration-[2000ms] ${catPresent ? 'opacity-70' : 'opacity-0'}`}>
           <PixelCat state="idle" />
        </div>
      </div>

      {/* Return button */}
      <button 
        onClick={handleBack}
        className="absolute top-8 left-8 text-[10px] font-mono text-white/10 hover:text-white/40 transition-colors uppercase tracking-widest cursor-pointer z-50"
      >
        back downstairs.
      </button>
    </div>
  );
}
