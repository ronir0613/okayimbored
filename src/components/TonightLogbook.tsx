import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type TonightData = {
  observations: string[];
  lastVisitor: {
    stayedFor: string;
    wanted: string;
    left: string;
  };
  websiteNote: string;
};

export default function TonightLogbook() {
  const [data, setData] = useState<TonightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tonight')
      .then(r => r.json())
      .then(d => {
        // Filter out any observations containing cat-related words
        const filteredObservations = d.observations.filter((obs: string) => 
          !/cat|sleeper|wanderer/i.test(obs)
        );
        
        let filteredNote = d.websiteNote;
        if (/cat/i.test(filteredNote)) {
          filteredNote = "Thanks for stopping by.";
        }

        const lastVisitor = { ...d.lastVisitor };
        if (/cat/i.test(lastVisitor.wanted)) {
          lastVisitor.wanted = "Something strange";
        }

        setData({
          observations: filteredObservations,
          lastVisitor,
          websiteNote: filteredNote
        });
        setTimeout(() => setLoading(false), 2000); // Wait for breath animation to settle
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white/30 text-xs tracking-[0.3em] uppercase animate-pulse font-mono">Opening logbook...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white/90 font-sans px-4 sm:px-8 py-24 sm:py-32 flex flex-col items-center selection:bg-white/20 selection:text-white cursor-default">
      <div className="w-full max-w-3xl flex flex-col items-start gap-12 text-lg sm:text-2xl md:text-3xl font-light tracking-wide leading-relaxed">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 4, ease: "easeOut", delay: 0.5 }}
          className="text-white/30 uppercase tracking-[0.4em] text-xs sm:text-sm mb-16 font-mono"
        >
          The website kept some notes.
        </motion.div>

        {/* Observations */}
        <div className="flex flex-col gap-10 sm:gap-14 w-full">
          {data.observations.map((obs, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 5 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 4, ease: "easeOut", delay: 2 + i * 1.5 }}
              className="text-white/70 hover:text-white transition-colors duration-1000"
            >
              {obs}
            </motion.div>
          ))}
        </div>

        {/* Last Visitor */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 5, ease: "easeOut", delay: 2 + data.observations.length * 1.5 + 4 }}
          className="mt-32 w-full font-mono text-xs sm:text-sm flex flex-col gap-6"
        >
          <div className="text-white/40 uppercase tracking-[0.3em] mb-4">The last visitor:</div>
          <div className="flex flex-col gap-4 pl-6 py-2 border-l border-white/10 text-white/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Stayed for</span>
              <span className="text-white/80 font-sans text-base sm:text-lg">{data.lastVisitor.stayedFor}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Wanted</span>
              <span className="text-white/80 font-sans text-base sm:text-lg">{data.lastVisitor.wanted}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="uppercase tracking-widest text-[10px] sm:text-xs">Left</span>
              <span className="text-white/80 font-sans text-base sm:text-lg">{data.lastVisitor.left}</span>
            </div>
          </div>
        </motion.div>

        {/* Website Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 8, ease: "easeInOut", delay: 2 + data.observations.length * 1.5 + 10 }}
          className="mt-40 mb-32 text-center w-full text-white/40 italic font-serif text-lg sm:text-2xl"
        >
          {data.websiteNote}
        </motion.div>

      </div>
    </div>
  );
}
