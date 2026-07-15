import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LivingBuilding() {
  const [flicker, setFlicker] = useState(false);
  const [radioStatic, setRadioStatic] = useState(false);
  
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 50 + Math.random() * 200);
      }
    }, 10000);

    const staticInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        setRadioStatic(true);
        setTimeout(() => setRadioStatic(false), 2000 + Math.random() * 3000);
      }
    }, 25000);

    return () => {
      clearInterval(flickerInterval);
      clearInterval(staticInterval);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {flicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[999] pointer-events-none mix-blend-multiply"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {radioStatic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-[url('/noise.png')] z-[998] pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>
    </>
  );
}
