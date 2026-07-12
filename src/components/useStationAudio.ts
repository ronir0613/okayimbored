import { useEffect, useRef, useCallback } from 'react';

export function useStationAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const windNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const windFilterRef = useRef<BiquadFilterNode | null>(null);
  
  const cricketsRef = useRef<OscillatorNode | null>(null);
  const cricketsGainRef = useRef<GainNode | null>(null);
  
  const humRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    audioCtxRef.current = new AudioContext();
  }, []);

  const initNodes = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // --- WIND ---
    if (!windNoiseRef.current) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      
      const gain = ctx.createGain();
      gain.gain.value = 0;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      windNoiseRef.current = noise;
      windFilterRef.current = filter;
      windGainRef.current = gain;
    }

    // --- CRICKETS (Night) ---
    if (!cricketsRef.current) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 4500; // High pitch

      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 15; // Rapid chirping

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4500;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const gain = ctx.createGain();
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      lfo.start();

      cricketsRef.current = osc;
      cricketsGainRef.current = gain;
    }

    // --- ELECTRICAL HUM (Night) ---
    if (!humRef.current) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60; // 60Hz hum

      const gain = ctx.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      humRef.current = osc;
      humGainRef.current = gain;
    }
  }, []);

  const playTimeSpecificAmbience = useCallback((timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    initNodes();
    
    const now = ctx.currentTime;
    const transitionTime = 5; // 5 seconds fade

    if (windGainRef.current && windFilterRef.current) {
      if (timeOfDay === 'morning') {
        windGainRef.current.gain.setTargetAtTime(0.01, now, transitionTime);
        windFilterRef.current.frequency.setTargetAtTime(300, now, transitionTime);
      } else if (timeOfDay === 'afternoon') {
        windGainRef.current.gain.setTargetAtTime(0.03, now, transitionTime);
        windFilterRef.current.frequency.setTargetAtTime(600, now, transitionTime);
      } else if (timeOfDay === 'evening') {
        windGainRef.current.gain.setTargetAtTime(0.015, now, transitionTime);
        windFilterRef.current.frequency.setTargetAtTime(400, now, transitionTime);
      } else {
        // Night
        windGainRef.current.gain.setTargetAtTime(0.005, now, transitionTime);
        windFilterRef.current.frequency.setTargetAtTime(200, now, transitionTime);
      }
    }

    if (cricketsGainRef.current) {
      if (timeOfDay === 'night') {
        cricketsGainRef.current.gain.setTargetAtTime(0.002, now, transitionTime);
      } else {
        cricketsGainRef.current.gain.setTargetAtTime(0, now, transitionTime);
      }
    }

    if (humGainRef.current) {
      if (timeOfDay === 'night' || timeOfDay === 'evening') {
        humGainRef.current.gain.setTargetAtTime(0.01, now, transitionTime);
      } else {
        humGainRef.current.gain.setTargetAtTime(0, now, transitionTime);
      }
    }

  }, [initNodes]);

  const playTrainRumble = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 10);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    // Keep it rumbling until stop is called, but we'll add a long decay just in case
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 30);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    
    // Store it temporarily if we wanted to stop it abruptly, 
    // but the original logic just let it play out. 
    // We can just let it fade.
  }, []);

  const stopTrainRumble = useCallback(() => {
     // Optional: could implement a quick fade out for the rumble here if we stored the gain node.
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
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [initAudio]);

  return { playTimeSpecificAmbience, playTrainRumble, stopTrainRumble, initAudio };
}
