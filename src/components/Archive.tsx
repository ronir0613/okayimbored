import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PixelCat } from './LivingCats/PixelCat';

const RETIRED_OBSERVATIONS = [
  { text: '"You don\'t sound bored.\nYou sound homesick."', sub: 'Used: 312 times\nRetired: September 2026' },
  { text: '"We thought this one\nworked better."', sub: '' },
  { text: '"Have you considered\ngoing outside?"', sub: 'Used: 18 times\nRetired: August 2026' },
  { text: '"You are waiting for an email."', sub: 'Retired: October 2026' }
];

const RETIRED_CARDS = [
  { title: 'THE WINDOW', sub: 'Retired.\nShown: 482 times.' },
  { title: 'THE COIN', sub: 'Never released.' },
  { title: 'THE BLUE CARD', sub: 'Nobody picked it enough.' },
  { title: 'THE INVISIBLE CARD', sub: 'It was too confusing.' }
];

const RECORD_LOGS = [
  { text: 'The first record player\nbroke 427 times.' },
  { text: 'Late Night Radio', sub: 'First played:\nJuly 2026' },
  { text: 'Dog Sleeping Mix', sub: 'Still surprisingly popular.' },
  { text: 'Jazz for Rain', sub: 'Removed after a\ncopyright scare.' }
];

const CAT_INCIDENTS = [
  { title: 'Incident #004', text: 'Two cats appeared.\nNobody knows why.' },
  { title: 'Incident #011', text: 'Employee of the Month\nwent missing.' },
  { title: 'Incident #018', text: 'The Sleeper slept\nfor an entire session.' },
  { title: 'Incident #024', text: 'A cat knocked over\nthe radio widget.\nIt was never fixed.' }
];

const UNFINISHED_IDEAS = [
  { name: 'Website Elevator', status: 'Abandoned.' },
  { name: 'Coffee Machine', status: 'Cancelled.' },
  { name: 'Talking Dog', status: 'Probably for the best.' },
  { name: 'Interactive Moon', status: 'Maybe someday.' },
  { name: 'Desktop Plant', status: 'Kept dying.' }
];

const MEMORIES = [
  '"The first visitor stayed\n18 minutes."',
  '"We used to have\nfewer cats."',
  '"The homepage looked\nvery different."',
  '"We almost changed the logo."',
  '"We never liked that font."',
  '"Someone kept checking\nthe basement."'
];

const ARCHIVED_MESSAGES = [
  '"This ending was retired."',
  '"This joke stopped being funny."',
  '"We thought this sounded\ntoo serious."',
  '"We couldn\'t make this work."'
];

const LF_ITEMS = ['one sock', 'house keys', 'bus ticket', 'browser tab', 'desktop wallpaper', 'a good idea', 'patience'];

export default function Archive() {
  const [mounted, setMounted] = useState(false);
  const [isSuperRare, setIsSuperRare] = useState(false);
  const [isRare, setIsRare] = useState(false);
  const [hasLostAndFound, setHasLostAndFound] = useState<{name: string, index: number} | null>(null);

  useEffect(() => {
    setMounted(true);
    const r = Math.random();
    
    // 0.01% Super Rare
    if (r < 0.0001) {
      setIsSuperRare(true);
      return;
    }
    
    // 0.1% Rare
    if (r < 0.0011) {
      setIsRare(true);
      return;
    }

    // 5% chance of lost & found item appearing somewhere near the end
    if (r < 0.0511) {
      setHasLostAndFound({
        name: LF_ITEMS[Math.floor(Math.random() * LF_ITEMS.length)],
        index: Math.floor(Math.random() * 3)
      });
    }

  }, []);

  if (!mounted) return null;

  if (isSuperRare) {
    return (
      <div className="min-h-screen bg-[#050505] text-white/40 flex items-center justify-center font-mono select-none">
        <div className="text-xs tracking-widest text-white/30 lowercase">
          we're still writing history.
        </div>
      </div>
    );
  }

  if (isRare) {
    return (
      <div className="min-h-screen bg-[#050505] text-white/40 flex flex-col items-center justify-center font-mono select-none">
        <div className="border border-white/10 p-12 text-center relative">
          <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-8 pb-4 border-b border-white/5">
            FOUND
          </div>
          <div className="text-lg tracking-widest mb-6">
            Version 0.
          </div>
          <div className="text-xs text-white/20 italic">
            Contents unavailable.
          </div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 opacity-50">
            <PixelCat state="staring" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white/40 font-mono select-none py-32 px-6 sm:px-12 md:px-24 max-w-4xl mx-auto overflow-x-hidden">
      
      {/* Header */}
      <div className="mb-48 text-center sm:text-left flex flex-col items-center sm:items-start relative mt-16">
        <h1 className="text-2xl sm:text-4xl tracking-[0.4em] text-white/80 uppercase font-light mb-8">
          ARCHIVE
        </h1>
        <p className="text-xs sm:text-sm tracking-widest text-white/30 italic">
          "Things we decided to keep."
        </p>

        {/* Ambient Cat on the header */}
        <div className="absolute -top-12 sm:top-2 right-12 sm:-right-8 w-12 h-12 opacity-30">
          <PixelCat state="cleaning" />
        </div>
      </div>

      {/* SECTION 1: RETIRED OBSERVATIONS */}
      <section className="mb-48">
        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-16 border-b border-white/5 pb-4">
          Section 1 / Retired Observations
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
          {RETIRED_OBSERVATIONS.map((obs, i) => (
            <div key={i} className="flex flex-col items-start gap-4 p-8 border border-white/[0.03] hover:border-white/10 transition-colors">
              <div className="text-[10px] uppercase tracking-widest text-white/20 bg-white/5 px-2 py-1 mb-2">
                RETIRED
              </div>
              <div className="text-sm sm:text-base text-white/70 leading-relaxed whitespace-pre-line font-serif italic">
                {obs.text}
              </div>
              {obs.sub && (
                <div className="text-[10px] text-white/30 whitespace-pre-line mt-4 uppercase tracking-wider">
                  {obs.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: RETIRED CARDS */}
      <section className="mb-48 relative">
        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-16 border-b border-white/5 pb-4">
          Section 2 / Retired Cards
        </div>
        {/* Ambient Cat walking */}
        <div className="absolute -top-6 right-1/4 w-10 h-10 opacity-20 hidden sm:block">
          <PixelCat state="walking" />
        </div>
        <div className="flex flex-wrap gap-12 justify-center sm:justify-start">
          {RETIRED_CARDS.map((card, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4 w-48">
              <div className="w-24 h-36 border border-white/10 flex items-center justify-center bg-white/[0.01]">
                <span className="text-[10px] text-white/20 tracking-widest uppercase">
                  {card.title.split(' ')[1] || 'CARD'}
                </span>
              </div>
              <div className="text-xs text-white/60 uppercase tracking-widest mt-2">{card.title}</div>
              <div className="text-[10px] text-white/30 whitespace-pre-line italic">
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: OLD RECORD PLAYER LOGS */}
      <section className="mb-48 max-w-2xl">
        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-16 border-b border-white/5 pb-4">
          Section 3 / Old Record Player Logs
        </div>
        <div className="space-y-12">
          {RECORD_LOGS.map((log, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-l border-white/10 pl-6">
              <div className="text-sm text-white/60 whitespace-pre-line flex-1">
                {log.text}
              </div>
              {log.sub && (
                <div className="text-[10px] text-white/30 whitespace-pre-line sm:text-right italic">
                  {log.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: CAT INCIDENT REPORTS */}
      <section className="mb-48 relative">
        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-16 border-b border-white/5 pb-4">
          Section 4 / Cat Incident Reports
        </div>
        
        {/* Sleeping cat on the archive boxes representation */}
        <div className="absolute top-24 -right-4 sm:-right-16 w-16 h-16 opacity-40 hidden sm:block">
          <PixelCat state="sleeping" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16 max-w-3xl">
          {CAT_INCIDENTS.map((inc, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40 underline decoration-white/10 underline-offset-4">
                {inc.title}
              </div>
              <div className="text-xs text-white/50 whitespace-pre-line leading-relaxed">
                {inc.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: UNFINISHED IDEAS */}
      <section className="mb-48">
        <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-16 border-b border-white/5 pb-4">
          Section 5 / Unfinished Ideas
        </div>
        <div className="space-y-6 text-sm text-white/50">
          {UNFINISHED_IDEAS.map((idea, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-white/5"></span>
              <span className="tracking-wider">{idea.name}</span>
              <span className="w-12 border-b border-dashed border-white/10 flex-1 opacity-50 hidden sm:block"></span>
              <span className="text-[10px] text-white/30 italic">Status: {idea.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 & 7: MEMORIES & MESSAGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-24 mb-48">
        <section>
          <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-12 border-b border-white/5 pb-4">
            Section 6 / Website Memories
          </div>
          <div className="flex flex-col gap-10">
            {MEMORIES.map((mem, i) => (
              <div key={i} className="text-xs text-white/40 italic leading-relaxed font-serif relative pl-4 border-l-[0.5px] border-white/10">
                {mem}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase mb-12 border-b border-white/5 pb-4 relative">
            Section 7 / Archived Messages
          </div>
          <div className="flex flex-col gap-8">
            {ARCHIVED_MESSAGES.map((msg, i) => (
              <div key={i} className="bg-white/[0.02] p-6 text-xs text-white/50 tracking-wide text-center">
                {msg}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RARE LOST AND FOUND CONNECTION */}
      {hasLostAndFound && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 2 }}
          className="my-48 flex justify-center"
        >
          <div className="flex flex-col items-center gap-6 p-12 border border-white/5 bg-[#080808]">
            <div className="text-[10px] tracking-[0.3em] text-white/20 mb-2 border-b border-white/5 pb-2 uppercase w-full text-center">
              LOST & FOUND
            </div>
            <div className="text-lg text-white/70 tracking-widest font-light">
              {hasLostAndFound.name}
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-widest italic">
              "Archived because nobody came back."
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-64 pb-32 text-center">
        <div className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-white/10 animate-pulse"></div>
        <p className="mt-8 text-[10px] tracking-[0.5em] text-white/20 uppercase">
          End of Archive
        </p>
      </div>
      
    </div>
  );
}
