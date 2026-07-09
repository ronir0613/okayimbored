import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentShift, getShiftMicrocopy, getRareShiftEvent, type Shift } from '../lib/shift';

// Randomly pick from an array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ShiftAmbience() {
  const [shift] = useState<Shift>(() => getCurrentShift());
  const [ambientLine, setAmbientLine] = useState<string | null>(null);
  const [shiftTransitionActive, setShiftTransitionActive] = useState(false);

  // Apply shift class to body
  useEffect(() => {
    const body = document.body;
    ['shift-day', 'shift-evening', 'shift-night', 'shift-afterhours'].forEach(c => body.classList.remove(c));
    body.classList.add(`shift-${shift}`);

    // Emit for other components
    window.dispatchEvent(new CustomEvent('shift:ready', { detail: { shift } }));

    return () => {
      body.classList.remove(`shift-${shift}`);
    };
  }, [shift]);

  // Ambient microcopy: trickle in a line every 8–20 minutes
  useEffect(() => {
    const pool = getShiftMicrocopy(shift);
    const used = new Set<string>();

    const showLine = () => {
      const available = pool.filter(l => !used.has(l));
      if (available.length === 0) used.clear();
      const line = pick(available.length ? available : pool);
      used.add(line);

      setAmbientLine(line);
      // Hide after 6 seconds
      setTimeout(() => setAmbientLine(null), 6000);

      // Schedule next
      const next = 8 * 60 * 1000 + Math.random() * 12 * 60 * 1000; // 8–20 min
      setTimeout(showLine, next);
    };

    // First appearance: 3–8 minutes after load
    const first = 3 * 60 * 1000 + Math.random() * 5 * 60 * 1000;
    const t = setTimeout(showLine, first);
    return () => clearTimeout(t);
  }, [shift]);

  // Rare shift events: check occasionally
  useEffect(() => {
    const check = () => {
      const line = getRareShiftEvent(shift);
      if (line) {
        setAmbientLine(line);
        setTimeout(() => setAmbientLine(null), 7000);
      }
    };
    // Check every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [shift]);

  // Shift transition: once per session, 40% chance, after 3–15 min
  useEffect(() => {
    if (Math.random() > 0.4) return;
    const delay = 3 * 60 * 1000 + Math.random() * 12 * 60 * 1000;
    const t = setTimeout(() => {
      setShiftTransitionActive(true);
      setTimeout(() => setShiftTransitionActive(false), 5000);
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Shift transition overlay */}
      <AnimatePresence>
        {shiftTransitionActive && (
          <motion.div
            key="shift-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center pointer-events-none"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-white/25 text-xs tracking-[0.3em] uppercase font-mono"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              changing shift...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient microcopy — bottom left, very small */}
      <AnimatePresence>
        {ambientLine && !shiftTransitionActive && (
          <motion.p
            key={ambientLine}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[9990] pointer-events-none text-white/20 text-[11px] tracking-wide"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {ambientLine}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
