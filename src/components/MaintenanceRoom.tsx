import React, { useState, useEffect } from 'react';
import { PixelCat } from './LivingCats/PixelCat';
import { motion, AnimatePresence } from 'framer-motion';

// --- Static Data ---
const TOOLBOX_ITEMS: React.ReactNode[] = [
  'Small screwdriver.',
  'Electrical tape.',
  'One fish.',
  'Cat treats.',
  'Flashlight.',
  'Broken cassette.',
  'Coffee mug.',
  <a href="/notices" className="hover:text-white/80 transition-colors cursor-pointer">Sticky notes.</a>,
  'Tiny ladder.',
  'Unknown key.'
];

const WHITEBOARD_NOTES = [
  'Remember to feed nobody.',
  'Replace hallway light.',
  'Ask cat to attend meeting.',
  'Stop leaving boxes everywhere.'
];

const CRT_MESSAGES = [
  'Loading...',
  '...',
  'Still loading...',
  'Everything looks normal.',
  'No issues detected.',
  'The cat disconnected the keyboard.',
  'System check: OK.',
  'Routine inspection.',
  'Still holding together.',
  'Please ignore the noise.',
  'We\'ll fix it eventually.',
  'Temporary forever.',
  'Nothing exploded today.'
];

const LOG_ENTRIES = [
  { time: '02:14 AM', text: 'Replaced one light bulb.' },
  { time: '03:07 AM', text: 'Fixed record player.\nProbably.' },
  { time: '03:41 AM', text: 'Cat ignored instructions.' },
  { time: '04:02 AM', text: 'Dust removed.\nReturned shortly after.' },
  { time: '05:11 AM', text: 'Website still operational.' }
];

export default function MaintenanceRoom() {
  const [mounted, setMounted] = useState(false);
  
  // Rare Events
  const [flicker, setFlicker] = useState(false);
  const [catWalkEvent, setCatWalkEvent] = useState(false);
  const [monitorMessage, setMonitorMessage] = useState('Loading...');
  const [websiteStatus, setWebsiteStatus] = useState('Online');
  
  // Ambient Cat Placement
  const [catInToolbox, setCatInToolbox] = useState(false);
  const [catOnMonitor, setCatOnMonitor] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Pick random ambient cat (or neither)
    const catRand = Math.random();
    if (catRand < 0.2) setCatInToolbox(true);
    else if (catRand < 0.4) setCatOnMonitor(true);

    // Initial random CRT message
    setMonitorMessage(CRT_MESSAGES[Math.floor(Math.random() * CRT_MESSAGES.length)]);

    // Check Rare Events
    const r = Math.random();
    
    // 0.01% - Website Better
    if (r < 0.0001) {
      setWebsiteStatus('Better');
    }
    // 0.1% - Thank you
    else if (r < 0.001) {
      setMonitorMessage('Thank you for visiting.');
      setTimeout(() => {
        setMonitorMessage(CRT_MESSAGES[Math.floor(Math.random() * CRT_MESSAGES.length)]);
      }, 5000);
    }
    // 0.5% - Cat walks with wrench
    else if (r < 0.006) {
      setTimeout(() => {
        setCatWalkEvent(true);
      }, 2000);
    }
    // 1% - Lights flicker
    else if (r < 0.016) {
      setFlicker(true);
    }

    // Periodically change CRT message (if not showing a rare message permanently)
    const monitorInterval = setInterval(() => {
      setMonitorMessage(prev => {
        if (prev === 'Thank you for visiting.') return prev;
        return CRT_MESSAGES[Math.floor(Math.random() * CRT_MESSAGES.length)];
      });
    }, 15000);

    return () => clearInterval(monitorInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`min-h-[100dvh] bg-[#0a0a0a] text-[#888] font-mono overflow-x-hidden flex flex-col items-center py-16 px-4 sm:px-8 relative ${flicker ? 'animate-pulse' : ''}`}>
      
      {/* Dim ambient light overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.8)_80%)]"></div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col gap-16">
        
        {/* Header / Vibe setter */}
        <div className="text-center space-y-4 mb-8">
          <p className="text-[10px] tracking-[0.4em] text-white/20 uppercase">
            Maintenance Room
          </p>
          <p className="text-xs tracking-widest text-white/10 italic">
            "So this is how the website keeps going."
          </p>
        </div>

        {/* Top Section: Status Board & Whiteboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Status Board */}
          <div className="border border-white/5 p-8 bg-[#0d0d0d] relative shadow-2xl">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8 border-b border-white/5 pb-4">
              Website Status
            </h2>
            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="tracking-wider">Website</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
                  {websiteStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="tracking-wider">Cats</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500/50"></span>
                  Mostly Cooperative
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="tracking-wider">Record Player</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500/30"></span>
                  Working
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="tracking-wider">Lost & Found</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500/30"></span>
                  Overflowing
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="tracking-wider">Archive</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500/30"></span>
                  Stable
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="tracking-wider">Coffee</span>
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                  Empty
                </span>
              </div>
            </div>
          </div>

          {/* Whiteboard */}
          <div className="border border-white/10 bg-white/[0.02] p-8 relative transform -rotate-1">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8 border-b border-white/5 pb-4">
              Notes
            </h2>
            <ul className="space-y-6 text-sm text-white/50 font-serif italic">
              {WHITEBOARD_NOTES.map((note, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-white/20">-</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Section: Desk (Monitor + Toolbox) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-end">
          
          {/* CRT Monitor */}
          <div className="md:col-span-3 border-[8px] border-[#1a1a1a] rounded-lg bg-[#050505] p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] h-64 flex flex-col justify-between">
            {catOnMonitor && (
              <div className="absolute -top-10 right-8 w-10 h-10 opacity-30">
                <PixelCat state="idle" />
              </div>
            )}
            
            <div className="absolute inset-0 pointer-events-none rounded-sm bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20 z-10"></div>
            
            <div className="text-green-500/80 font-mono text-sm uppercase tracking-widest relative z-0 flex-1">
              <span className="animate-pulse opacity-50 mr-2">{'>'}</span>
              {monitorMessage}
            </div>
            
            <div className="text-[9px] text-green-500/30 text-right uppercase tracking-[0.2em] relative z-0">
              Terminal v0.9
            </div>
          </div>

          {/* Toolbox */}
          <div className="md:col-span-2 border border-red-900/20 bg-red-950/10 p-6 relative">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6 border-b border-red-900/30 pb-4">
              Toolbox
            </h2>
            
            {catInToolbox && (
              <div className="absolute -top-6 right-4 w-12 h-12 opacity-40">
                <PixelCat state="sleeping" />
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-white/40">
              {TOOLBOX_ITEMS.map((item, i) => (
                <span key={i} className="bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section: Maintenance Log */}
        <div className="border-t border-white/5 pt-12">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8">
            Maintenance Log
          </h2>
          <div className="space-y-8 max-w-xl">
            {LOG_ENTRIES.map((log, i) => (
              <div key={i} className="flex gap-8">
                <div className="text-xs text-white/30 w-16 pt-1">
                  {log.time}
                </div>
                <div className="text-sm text-white/60 whitespace-pre-line border-l border-white/10 pl-6 pb-4">
                  {log.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Rare Event: Cat Walking with Wrench */}
      <AnimatePresence>
        {catWalkEvent && (
          <motion.div
            initial={{ x: '-10vw', opacity: 0 }}
            animate={{ x: '110vw', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 15, ease: 'linear' }}
            className="fixed bottom-8 left-0 w-12 h-12 z-50 pointer-events-none flex flex-col items-center"
            onAnimationComplete={() => setCatWalkEvent(false)}
          >
            <div className="text-[8px] text-white/50 mb-1 -ml-4 rotate-45 transform origin-bottom-left italic">
              wrench
            </div>
            <PixelCat state="walking_right" className="opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
