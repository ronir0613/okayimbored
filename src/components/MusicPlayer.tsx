import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATION_TRACKS } from './station/tracks';
import { useExperienceStore } from '../lib/store';

interface MusicPlayerProps {
  /** Callback to lower station SFX. (level, fadeSec) */
  setSFXVolume?: (level: number, fadeSec?: number) => void;
  /** Optional override for the maximum music volume */
  volumeOverride?: number;
}

const MAX_MUSIC_VOLUME = 0.4;

export function MusicPlayer({ setSFXVolume, volumeOverride }: MusicPlayerProps) {
  const { hasMusicPlayer, setHasMusicPlayer } = useExperienceStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Use two Audio instances for crossfading
  const audioA = useRef<HTMLAudioElement | null>(null);
  const audioB = useRef<HTMLAudioElement | null>(null);
  const activeAudio = useRef<'A' | 'B'>('A');
  const fadeIntervalId = useRef<number | null>(null);
  const [globalVolumeOverride, setGlobalVolumeOverride] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handleOverride = (e: any) => {
      setGlobalVolumeOverride(e.detail?.volume);
    };
    window.addEventListener('music:override', handleOverride);
    return () => window.removeEventListener('music:override', handleOverride);
  }, []);

  // Determine the effective max volume based on override
  const currentMaxVolume = globalVolumeOverride !== undefined ? globalVolumeOverride : (volumeOverride !== undefined ? volumeOverride : MAX_MUSIC_VOLUME);

  // Track the actual volume target internally so effect can apply it smoothly
  useEffect(() => {
    const targetVol = currentMaxVolume;
    const currentAudio = activeAudio.current === 'A' ? audioA.current : audioB.current;
    if (currentAudio && isPlaying) {
      // Very simple gradual fade over a short duration
      let currentVol = currentAudio.volume;
      const step = (targetVol - currentVol) / 20;
      let steps = 0;
      const interval = setInterval(() => {
        steps++;
        currentVol += step;
        currentAudio.volume = Math.max(0, Math.min(1, currentVol));
        if (steps >= 20) {
          clearInterval(interval);
          currentAudio.volume = targetVol;
        }
      }, 50);
    } else if (currentAudio && !isPlaying) {
      currentAudio.volume = targetVol;
    }
  }, [currentMaxVolume, isPlaying]);

  // Initialize Audio instances only once
  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    audioA.current.volume = currentMaxVolume;
    audioB.current.volume = currentMaxVolume;

    const handleEnded = () => {
      // Auto-play next track when one ends
      handleNext();
    };

    audioA.current.addEventListener('ended', handleEnded);
    audioB.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioA.current) {
        audioA.current.removeEventListener('ended', handleEnded);
        audioA.current.pause();
        audioA.current = null;
      }
      if (audioB.current) {
        audioB.current.removeEventListener('ended', handleEnded);
        audioB.current.pause();
        audioB.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update SFX volume whenever play state changes
  useEffect(() => {
    if (setSFXVolume) {
      if (isPlaying) {
        setSFXVolume(0.3, 1.0); // 30% volume, 1s fade
      } else {
        setSFXVolume(1.0, 1.0); // 100% volume, 1s fade
      }
    }
    // Also dispatch global event for other listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('music:playing', { detail: { isPlaying } }));
    }
  }, [isPlaying, setSFXVolume]);

  const crossfadeTo = useCallback((nextAudio: HTMLAudioElement, prevAudio: HTMLAudioElement) => {
    if (fadeIntervalId.current) window.clearInterval(fadeIntervalId.current);
    
    nextAudio.volume = 0;
    const playPromise = nextAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.warn('Playback prevented:', e));
    }

    const steps = 20;
    const stepTime = 1000 / steps; // 1 second crossfade total
    let stepCount = 0;

    fadeIntervalId.current = window.setInterval(() => {
      stepCount++;
      const ratio = stepCount / steps;
      nextAudio.volume = ratio * currentMaxVolume;
      
      const prevVol = Math.max(0, currentMaxVolume - (ratio * currentMaxVolume));
      prevAudio.volume = prevVol;
      
      if (stepCount >= steps) {
        window.clearInterval(fadeIntervalId.current!);
        prevAudio.pause();
        prevAudio.volume = currentMaxVolume; // reset for next time
      }
    }, stepTime);
  }, [currentMaxVolume]);

  const togglePlayPause = () => {
    const currentAudio = activeAudio.current === 'A' ? audioA.current : audioB.current;
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      // If we don't have a source set, set it
      if (!currentAudio.src) {
        currentAudio.src = STATION_TRACKS[currentTrackIndex].url;
      }
      currentAudio.volume = currentMaxVolume;
      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Playback prevented:', e));
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % STATION_TRACKS.length;
    playTrack(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentTrackIndex - 1 + STATION_TRACKS.length) % STATION_TRACKS.length;
    playTrack(prevIndex);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (!audioA.current || !audioB.current) return;

    const prevAudio = activeAudio.current === 'A' ? audioA.current : audioB.current;
    const nextAudio = activeAudio.current === 'A' ? audioB.current : audioA.current;
    
    // Switch active reference
    activeAudio.current = activeAudio.current === 'A' ? 'B' : 'A';

    nextAudio.src = STATION_TRACKS[index].url;
    
    if (isPlaying) {
      crossfadeTo(nextAudio, prevAudio);
    } else {
      // Not playing, just prepare source, don't auto play (or auto play based on preference)
      setIsPlaying(true);
      nextAudio.volume = currentMaxVolume;
      const playPromise = nextAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn('Playback prevented:', e));
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      <AnimatePresence>
        {!hasMusicPlayer && (
          <motion.div
            layoutId="music-player-container"
            className="absolute bottom-12 left-12 md:bottom-24 md:left-32 cursor-pointer pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setHasMusicPlayer(true)}
          >
            <img 
              src="/newassets/music player.png" 
              alt="Found Music Player" 
              className="w-16 h-16 object-contain drop-shadow-2xl filter brightness-75 contrast-125"
            />
            {/* Pulsing indicator */}
            <motion.div 
              className="absolute -inset-2 border-2 border-white/30 rounded-full"
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasMusicPlayer && (
          <motion.div
            layoutId="music-player-container"
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl pointer-events-auto w-[300px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <img 
              src="/newassets/music player.png" 
              alt="Music Player" 
              className="w-12 h-12 object-contain filter drop-shadow-lg"
            />
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-white/90 text-sm font-medium truncate">
                {STATION_TRACKS[currentTrackIndex].title}
              </div>
              <div className="text-white/50 text-xs truncate">
                {STATION_TRACKS[currentTrackIndex].artist}
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <button onClick={handlePrev} className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                </button>
                
                <button onClick={togglePlayPause} className="text-white hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
                </button>

                <button onClick={handleNext} className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                </button>
              </div>
            </div>

            {/* Audio visualization bars (decorative) */}
            <div className="flex items-end gap-0.5 h-6">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-amber-400/80 rounded-t-sm"
                  animate={isPlaying ? {
                    height: ["20%", "100%", "40%", "80%", "20%"]
                  } : { height: "10%" }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
