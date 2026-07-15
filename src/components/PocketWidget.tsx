import React, { useState } from 'react';
import { useExperienceStore } from '../lib/store';
import { AnimatePresence, motion } from 'framer-motion';

export function PocketWidget() {
  const pocket = useExperienceStore((state) => state.pocket);
  const [isOpen, setIsOpen] = useState(false);

  if (pocket.length === 0) return null;

  return (
    <div className="fixed top-6 right-8 z-[100] flex flex-col items-end pointer-events-auto">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 shadow-lg cursor-pointer"
        title="Inventory"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg flex flex-col items-end gap-2 min-w-[140px] shadow-2xl"
          >
            <span className="text-[9px] uppercase tracking-widest text-white/40 mb-2 border-b border-white/10 pb-2 w-full text-right">
              Things You're Carrying
            </span>
            {pocket.map((item, i) => (
              <span
                key={item}
                className="text-xs font-serif text-white/80 italic tracking-wide break-words text-right"
              >
                {item}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
