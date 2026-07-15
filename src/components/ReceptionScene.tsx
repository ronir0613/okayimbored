import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCat } from './LivingCats/PixelCat';
import { useExperienceStore } from '../lib/store';

export function ReceptionScene() {
  const [localCheckedIn, setLocalCheckedIn] = useState(false);
  const [localCheckedOut, setLocalCheckedOut] = useState(false);
  const { setHasCheckedIn, hasMusicPlayer, setHasMusicPlayer, hasCheckedIn } = useExperienceStore();

  const handleCheckIn = () => {
    setLocalCheckedIn(true);
    setTimeout(() => {
      setHasCheckedIn(true);
      window.location.href = '/lobby';
    }, 1500);
  };

  const handleCheckOut = () => {
    setLocalCheckedOut(true);
    setTimeout(() => {
      setHasCheckedIn(false);
      window.location.href = '/';
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 2 }}
      className="fixed inset-0 bg-black z-[80] flex flex-col items-center justify-center"
    >
      <div className="relative mb-12">
        <img 
          src="/newassets/reception.png" 
          alt="Reception" 
          className="max-h-[60vh] max-w-[90vw] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        />
        <div className="absolute inset-0 pointer-events-none pb-12">
          <div className="absolute bottom-[44%] left-[62%] w-16 h-16 transform -translate-x-1/2">
            <PixelCat state="idle" />
          </div>
        </div>

        {/* Music Player Welcome Gift */}
        <AnimatePresence>
          {!hasMusicPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-[60%] right-[30%] translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer flex flex-col items-center z-50"
              onClick={() => setHasMusicPlayer(true)}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-mono text-center">
                Welcome Gift
              </div>
              <img 
                src="/newassets/music player.png" 
                alt="Music Player" 
                className="w-8 h-8 object-contain drop-shadow-2xl filter brightness-75 contrast-125"
              />
              <motion.div 
                className="absolute inset-x-0 bottom-0 mx-auto w-8 h-8 border-2 border-white/30 rounded-full"
                animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-16 flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {!hasCheckedIn ? (
            !localCheckedIn ? (
              <motion.button
                key="checkin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 1, duration: 1 }}
                onClick={handleCheckIn}
                className="bg-white text-black font-mono text-sm px-6 py-3 hover:bg-gray-200 transition-colors uppercase tracking-widest cursor-pointer border-[3px] border-black shadow-[4px_4px_0_rgba(255,255,255,0.2)] pointer-events-auto"
                style={{ imageRendering: 'pixelated' }}
              >
                Please Check In
              </motion.button>
            ) : (
              <motion.div
                key="checkedin-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-white/60 font-serif italic text-sm"
              >
                Checked in...
              </motion.div>
            )
          ) : (
            !localCheckedOut ? (
              <motion.button
                key="checkout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5, duration: 1 }}
                onClick={handleCheckOut}
                className="bg-black text-white font-mono text-sm px-6 py-3 hover:bg-gray-900 transition-colors uppercase tracking-widest cursor-pointer border-[3px] border-white shadow-[4px_4px_0_rgba(255,255,255,0.2)] pointer-events-auto"
                style={{ imageRendering: 'pixelated' }}
              >
                Check Out
              </motion.button>
            ) : (
              <motion.div
                key="checkedout-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-white/60 font-serif italic text-sm"
              >
                Checking out...
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
