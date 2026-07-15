import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCat } from './LivingCats/PixelCat';

interface SignboardSceneProps {
  onGoBack: () => void;
  onFollowCat?: () => void;
}

export function SignboardScene({ onGoBack, onFollowCat }: SignboardSceneProps) {
  const [hoverText, setHoverText] = useState<string>('');
  const [catHover, setCatHover] = useState(false);



  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 3 }}
      className="fixed inset-0 bg-black z-[70] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Main container: restricted size so it doesn't take the whole screen */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex-shrink-0 mt-16">
        
        {/* Glow effect strictly behind the board from the light source */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-100/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Light Pole (from behind the board, extending upwards) */}
        <div className="absolute bottom-[40%] left-[20%] w-1.5 h-[150%] bg-[#080808] z-0">
          {/* The light fixture at the top */}
          <div className="absolute top-0 -left-3 w-8 h-3 bg-[#111] rounded-t-sm" />
          {/* Bulb and Glow */}
          <div className="absolute top-2 -left-1 w-4 h-4 rounded-full bg-amber-50 shadow-[0_0_80px_30px_rgba(253,230,138,0.7)]" />
          {/* Light cone shining down */}
          <motion.div 
            className="absolute top-4 -left-20 w-40 h-[400px] bg-gradient-to-b from-amber-100/10 to-transparent blur-xl origin-top pointer-events-none"
          />
        </div>

        {/* Grass and Signboard Images */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          {/* Grass layer, shifted down slightly to align with the board base */}
          <div className="absolute inset-0 top-4">
            <img 
              src="/newassets/grass.png" 
              alt="Grass" 
              className="w-full h-full object-contain filter brightness-[0.7] drop-shadow-2xl"
            />
          </div>
          {/* Signboard */}
          <img 
            src="/newassets/signboard.png" 
            alt="Signboard" 
            className="absolute inset-0 w-full h-full object-contain filter brightness-[0.9] drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* Interactive Areas for the sign arrows */}
        {/* Left half of the board */}
        <div 
          className="absolute top-[30%] left-[10%] w-[35%] h-[40%] z-20 cursor-pointer"
          onMouseEnter={() => setHoverText('Go Back')}
          onMouseLeave={() => setHoverText('')}
          onClick={onGoBack}
        />
        
        {/* Right half of the board */}
        <div 
          className="absolute top-[30%] right-[10%] w-[35%] h-[40%] z-20 cursor-pointer"
          onMouseEnter={() => setHoverText('Follow the cat')}
          onMouseLeave={() => setHoverText('')}
          onClick={() => {
            if (onFollowCat) onFollowCat();
          }}
        />

        {/* Cat placed explicitly at bottom right corner of the signboard */}
        <div 
          className={`absolute bottom-[10%] right-[-5%] sm:right-[5%] w-16 h-16 sm:w-20 sm:h-20 z-30 cursor-pointer transition-all duration-300 ${catHover ? 'filter brightness-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'filter brightness-75 drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]'}`}
          onMouseEnter={() => { setCatHover(true); setHoverText('Meow?'); }}
          onMouseLeave={() => { setCatHover(false); setHoverText(''); }}
        >
          <PixelCat state="idle" />
        </div>
        
      </div>

      {/* The Text Box underneath */}
      <div className="mt-8 h-12 flex items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {hoverText && (
            <motion.div
              key={hoverText}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-6 py-2 bg-white text-black font-mono text-sm sm:text-base uppercase tracking-widest shadow-md rounded-sm"
            >
              {hoverText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
