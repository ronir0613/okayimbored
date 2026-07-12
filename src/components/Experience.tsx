import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from 'astro:transitions/client';
import { addEcho } from '../lib/echoes';
import { TarotCards } from './TarotCards';
import { PixelCat } from './LivingCats/PixelCat';

export function Experience() {
  const [mounted, setMounted] = useState(false);
  const [phoneRinging, setPhoneRinging] = useState(false);
  const [catWalking, setCatWalking] = useState(false);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [tarotActive, setTarotActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    addEcho('entered_building');

    // Phone ringing event
    const phoneTimer = setTimeout(() => {
      setPhoneRinging(true);
      const stopPhoneTimer = setTimeout(() => {
        setPhoneRinging(false);
        addEcho('ignored_phone');
      }, 15000);
      return () => clearTimeout(stopPhoneTimer);
    }, 8000 + Math.random() * 10000);

    // Cat event
    const catTimer = setTimeout(() => {
      setCatWalking(true);
      const stopCatTimer = setTimeout(() => {
        setCatWalking(false);
      }, 20000); // 20s to cross the screen
      return () => clearTimeout(stopCatTimer);
    }, 15000 + Math.random() * 20000);

    // Radio event
    const radioTimer = setTimeout(() => {
      setRadioPlaying(true);
      const stopRadioTimer = setTimeout(() => {
        setRadioPlaying(false);
      }, 25000);
      return () => clearTimeout(stopRadioTimer);
    }, 5000 + Math.random() * 15000);

    // Wait echo
    const waitTimer = setTimeout(() => {
      addEcho('waited_in_entryway');
    }, 45000);

    return () => {
      clearTimeout(phoneTimer);
      clearTimeout(catTimer);
      clearTimeout(radioTimer);
      clearTimeout(waitTimer);
    };
  }, []);

  if (!mounted) return null;

  if (tarotActive) {
    return (
      <div className="w-full h-full min-h-[100dvh] bg-[#030303] flex items-center justify-center relative">
        <TarotCards onComplete={() => setTarotActive(false)} />
        <button 
          onClick={() => setTarotActive(false)}
          className="fixed bottom-12 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
        >
          Step away from the table
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#030303] text-[#888] font-serif overflow-x-hidden flex flex-col items-center justify-center relative select-none">
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,245,230,0.03)_0%,rgba(0,0,0,0.98)_100%)] z-10"></div>
      <div className="pointer-events-none fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] z-10 mix-blend-overlay"></div>

      {/* Main interactive area */}
      <div className="relative z-20 w-full max-w-4xl min-h-[60vh] flex items-center justify-center">
        
        {/* The Hallway / Lobby Entrance */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4 }}
          className="flex flex-col items-center gap-12"
        >
          <div 
            onClick={() => navigate('/lobby')}
            className="w-32 h-64 border border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent hover:border-white/20 transition-all duration-700 cursor-pointer flex items-center justify-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[9px] uppercase tracking-[0.3em] text-white/40 transition-opacity duration-1000 text-center px-4 leading-relaxed">
              Walk further in
            </span>
          </div>
        </motion.div>

        {/* The Small Table (Tarot) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 5, delay: 2 }}
          className="absolute left-[15%] bottom-[20%] flex flex-col items-center gap-4 cursor-pointer group"
          onClick={() => setTarotActive(true)}
        >
          <div className="w-16 h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors duration-700"></div>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 group-hover:text-white/50 transition-colors duration-700 whitespace-nowrap">
            A deck of cards
          </span>
        </motion.div>

        {/* Distant Door */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 6, delay: 4 }}
          onClick={() => navigate('/archive')}
          className="absolute right-[15%] bottom-[25%] w-8 h-16 border-l border-t border-white/10 hover:border-white/30 transition-colors duration-1000 cursor-pointer flex items-center justify-center group"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] uppercase tracking-widest text-white/30 transition-opacity duration-700 whitespace-nowrap absolute right-12">
            A door slightly open
          </span>
        </motion.div>

        {/* Ambient: Phone Ringing */}
        <AnimatePresence>
          {phoneRinging && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
              onClick={() => {
                addEcho('answered_phone');
                navigate('/telephone');
              }}
              className="absolute right-[20%] top-[30%] cursor-pointer group flex items-center gap-3"
            >
              <div className="w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
              <span className="text-[9px] uppercase tracking-widest text-white/30 group-hover:text-white/70 transition-colors duration-500 italic whitespace-nowrap">
                A phone is ringing down the hall
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient: Radio Playing */}
        <AnimatePresence>
          {radioPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4 }}
              onClick={() => {
                navigate('/radio');
              }}
              className="absolute left-[20%] top-[30%] cursor-pointer group"
            >
              <span className="text-[9px] uppercase tracking-widest text-white/20 group-hover:text-white/50 transition-colors duration-500 italic whitespace-nowrap">
                Faint static from a radio
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient: Cat Walking */}
        <AnimatePresence>
          {catWalking && (
            <motion.div 
              initial={{ left: '-10%', opacity: 0 }}
              animate={{ left: '110%', opacity: 1 }}
              transition={{ duration: 25, ease: 'linear' }}
              onClick={() => {
                addEcho('followed_cat');
                navigate('/cats');
              }}
              className="absolute bottom-[35%] w-12 h-12 opacity-30 hover:opacity-80 transition-opacity cursor-pointer z-30"
            >
              <PixelCat state="walking_right" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Vague instructions / Ambience indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 8, delay: 5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.3em] text-white/10"
      >
        You are in the building.
      </motion.div>

    </div>
  );
}
