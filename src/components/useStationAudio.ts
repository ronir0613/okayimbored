import { useEffect, useRef, useCallback } from 'react';

export function useStationAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    audioCtxRef.current = new AudioContext();
  }, []);

  const playWind = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    if (windNodeRef.current) return;
    
    // Create a very simple white noise buffer for wind
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it sound like wind
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low frequency for distant wind
    
    const gain = ctx.createGain();
    gain.gain.value = 0; // Start silent

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    windNodeRef.current = noise;
    windGainRef.current = gain;

    // Fade in
    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 2);
  }, []);

  const stopWind = useCallback(() => {
    if (windGainRef.current && audioCtxRef.current) {
      windGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 1);
      setTimeout(() => {
        if (windNodeRef.current) {
          try {
            windNodeRef.current.stop();
          } catch (e) {}
          windNodeRef.current = null;
        }
      }, 2000);
    }
  }, []);
  
  const playTrainRumble = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 4);
  }, []);

  useEffect(() => {
    // Only init on user interaction to comply with browser autoplay policies
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      stopWind();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [initAudio, stopWind]);

  return { playWind, stopWind, playTrainRumble, initAudio };
}
