import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReceptionScene({ onCheckIn }: { onCheckIn: () => void }) {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setCheckedIn(true);
    onCheckIn();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 2 }}
      className="fixed inset-0 bg-black z-[80] flex flex-col items-center justify-center"
    >
      <img 
        src="/newassets/reception.png" 
        alt="Reception" 
        className="max-h-[60vh] max-w-[90vw] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-12"
      />
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence>
          {!checkedIn && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 1 }}
              onClick={handleCheckIn}
              className="bg-white text-black font-mono text-sm px-6 py-3 hover:bg-gray-200 transition-colors uppercase tracking-widest cursor-pointer border-[3px] border-black shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
              style={{ imageRendering: 'pixelated' }}
            >
              Please Check In
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
