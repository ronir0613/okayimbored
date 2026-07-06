import React from 'react';
import { motion } from 'framer-motion';
import { PixelCat, type CatState } from './PixelCat';

export const CAT_SIZE = 48;

export interface LivingCatProps {
  id: string;
  state: CatState;
  x: number;
  y: number;
  opacity?: number;
  duration?: number;
  text?: string;
  label?: string;
}

export const LivingCat: React.FC<LivingCatProps> = ({ 
  id, state, x, y, opacity = 1, duration = 0, text, label 
}) => {
  return (
    <motion.div
      key={id}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: CAT_SIZE,
        height: CAT_SIZE,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
      initial={false}
      animate={{ x, y, opacity }}
      transition={{
        x: { duration, ease: 'linear' },
        y: { duration, ease: 'linear' },
        opacity: { duration: 1, ease: 'easeInOut' } // Fixed opacity duration so it fades in/out nicely
      }}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        {text && (
          <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-black/80 backdrop-blur-sm border border-white/10 text-white/80 text-[11px] px-3 py-2 rounded-lg text-center whitespace-pre-wrap shadow-xl font-mono leading-relaxed pointer-events-none">
            {text}
          </div>
        )}
        {label && (
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-max text-[#fef08a] text-[9px] uppercase tracking-widest bg-black/60 px-1.5 py-0.5 rounded border border-[#fef08a]/20 pointer-events-none">
            {label}
          </div>
        )}
        <PixelCat state={state} />
      </div>
    </motion.div>
  );
};
