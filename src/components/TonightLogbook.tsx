import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEchoes } from '../lib/echoes';
import { useExperienceStore } from '../lib/store';

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
  const { pocket, removeFromPocket, hasInPocket } = useExperienceStore();
  const [placedPhoto, setPlacedPhoto] = useState(false);

  useEffect(() => {
    fetch('/api/tonight')
      .then(r => r.json())
      .then(d => {
        // Filter out any observations containing cat-related words
        const filteredObservations = d.observations.filter((obs: string) => 
          !/cat|sleeper|wanderer/i.test(obs)
        );
        
        const echoes = getEchoes();
        if (echoes.includes('started_journey') && !echoes.includes('finished_interview')) {
          // just a small touch
        }
        if (echoes.includes('visited_rooftop')) {
          filteredObservations.push("You spent some time looking out.");
        }
        if (echoes.includes('visited_basement')) {
          filteredObservations.push("You wandered somewhere quiet.");
        }
        if (echoes.includes('tarot_the_moon')) {
          filteredObservations.push("The night felt a little longer.");
        }
        if (echoes.includes('tarot_the_star')) {
          filteredObservations.push("You kept looking for something bright.");
        }
        if (echoes.includes('tarot_the_tower')) {
          filteredObservations.push("Everything felt a bit unsteady.");
        }
        if (echoes.includes('tarot_the_hermit')) {
          filteredObservations.push("You seemed to prefer the quiet.");
        }
        if (echoes.includes('tarot_the_fool')) {
          filteredObservations.push("You didn't seem to mind being lost.");
        }
        if (echoes.includes('answered_telephone')) {
          filteredObservations.push("You answered when it rang.");
        }
        if (echoes.includes('ignored_telephone')) {
          filteredObservations.push("You let it ring.");
        }
        if (echoes.includes('visited_radio')) {
          filteredObservations.push("You listened to the static.");
        }
        if (echoes.includes('chose_honesty')) {
          filteredObservations.push("You didn't want to be comforted.");
        }
        if (echoes.includes('stayed_idle')) {
          filteredObservations.push("You didn't seem to be in a rush.");
        }
        
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
          className="mt-40 text-center w-full text-white/40 italic font-serif text-lg sm:text-2xl"
        >
          {placedPhoto ? "We remember this." : data.websiteNote}
        </motion.div>

        {/* Placing Photograph Interaction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 8, ease: "easeInOut", delay: 2 + data.observations.length * 1.5 + 12 }}
          className="mb-32 flex justify-center w-full"
        >
          {hasInPocket('Faded Photograph') && !placedPhoto ? (
            <button 
              onClick={() => {
                removeFromPocket('Faded Photograph');
                setPlacedPhoto(true);
              }}
              className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors border-b border-white/10 pb-1"
            >
              Leave the Faded Photograph here
            </button>
          ) : placedPhoto ? (
            <div className="text-[10px] uppercase tracking-widest text-white/20 italic">
              A faded photograph rests between the pages.
            </div>
          ) : null}
        </motion.div>

      </div>
    </div>
  );
}
