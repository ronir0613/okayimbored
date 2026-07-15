import React from 'react';
import { motion } from 'framer-motion';

export function DoorScene({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 bg-black z-[80] flex items-center justify-center cursor-pointer"
      onClick={onEnter}
    >
      <img 
        src="/newassets/door.png" 
        alt="Door" 
        className="max-h-[80vh] max-w-[90vw] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform duration-500 hover:scale-105 hover:brightness-110"
      />
    </motion.div>
  );
}
