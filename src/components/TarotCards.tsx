import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addEcho } from '../lib/echoes';

const TAROT_OBSERVATIONS = [
  ["...", "You can just leave it there."],
  ["...", "I thought we removed this card from the deck."],
  ["...", "Well.", "That doesn't help at all."],
  ["...", "It reminds me of something.", "I can't remember what."],
  ["...", "Some things don't mean anything.", "And that's fine."],
  ["...", "Did you expect something else?"],
  ["...", "We can just leave it at that."],
  ["...", "A completely average draw."],
  ["...", "You don't have to figure it out right now."],
  ["...", "There isn't a hidden message here."],
  ["...", "It is exactly what it looks like."],
  ["...", "This one has a bit of dust on it."]
];

const ALL_CARDS = [
  { title: "THE CHAIR", description: "Someone was sitting here\njust a moment ago." },
  { title: "THE WINDOW", description: "{count} people have looked\nout of this window." },
  { title: "THE DOG", description: "Happy to just be\nin the same room." },
  { title: "THE CAT", description: "It walks away before\nyou can ask a question." },
  { title: "THE BUTTON", description: "A small, satisfying click\nthat changes nothing." },
  { title: "THE TUESDAY", description: "You probably don't remember\nwhat happened last Tuesday." },
  { title: "THE MAP", description: "There is a place you haven't\nthought about in years." },
  { title: "THE NOTHING", description: "A comfortable silence.\nNo need to fill it." },
  { title: "THE WAITING ROOM", description: "The magazines on the table\nare five years old." },
  { title: "THE DESKTOP", description: "Folders within folders,\ngathering digital dust." }
];

export function TarotCards({ onComplete, sessionId }: { onComplete: () => void, sessionId?: string }) {
  const [cards, setCards] = useState<typeof ALL_CARDS>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cardStats, setCardStats] = useState<number | null>(null);
  const [observation, setObservation] = useState<string[]>([]);

  useEffect(() => {
    // Pick 3 random unique cards
    const shuffled = [...ALL_CARDS].sort(() => 0.5 - Math.random());
    setCards(shuffled.slice(0, 3));
  }, []);

  const handleCardClick = async (idx: number) => {
    if (selectedCardIdx !== null) return;
    setSelectedCardIdx(idx);
    
    const pickedCard = cards[idx];
    setObservation(TAROT_OBSERVATIONS[Math.floor(Math.random() * TAROT_OBSERVATIONS.length)]);
    addEcho('tarot_' + pickedCard.title.toLowerCase().replace(/ /g, '_'));

    // Fire API call in background
    if (sessionId) {
      try {
        const res = await fetch('/api/card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, cardName: pickedCard.title })
        });
        if (res.ok) {
          const data = await res.json();
          setCardStats(data.count);
        }
      } catch (e) {
        console.error("Failed to record card pick", e);
      }
    } else {
       // Mock for testing
       setCardStats(Math.floor(Math.random() * 50) + 1);
    }

    // Slow flip effect
    setTimeout(() => {
      setIsRevealed(true);
    }, 600);
  };

  const renderDescription = (desc: string, count: number | null) => {
    if (desc.includes('{count}')) {
      return desc.replace('{count}', (count !== null ? count.toString() : '...'));
    }
    return desc;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div 
            key="pre-pick"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-6 sm:mb-12"
          >
            <p className="text-xl sm:text-2xl text-white/90">pick a card.</p>
            <p className="text-lg sm:text-xl text-white/50 pt-2">go with whatever feels right.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="post-pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6 sm:mb-12 h-[48px] sm:h-[72px]" // Keeps spacing consistent
          />
        )}
      </AnimatePresence>

      <div className="flex gap-2 min-[360px]:gap-4 sm:gap-8 justify-center items-center w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
        {cards.map((card, idx) => {
          const isSelected = selectedCardIdx === idx;
          const isOther = selectedCardIdx !== null && !isSelected;
          
          return (
            <motion.div
              key={idx}
              className={`relative cursor-pointer w-[76px] h-[114px] min-[360px]:w-[84px] min-[360px]:h-[126px] min-[400px]:w-24 min-[400px]:h-36 sm:w-32 sm:h-48 md:w-40 md:h-56 ${
                selectedCardIdx === null ? 'hover:scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isOther ? 0 : 1,
                y: isSelected ? -20 : 0,
                scale: isSelected ? 1.1 : 1,
                rotateY: isSelected && isRevealed ? 180 : 0,
              }}
              transition={{ 
                duration: isSelected && isRevealed ? 0.8 : 0.4,
                ease: "easeInOut",
                delay: selectedCardIdx === null ? idx * 0.1 : 0
              }}
              onClick={() => handleCardClick(idx)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Floating animation wrapper when idle */}
              <motion.div
                className="w-full h-full"
                animate={selectedCardIdx === null ? {
                  y: [0, -8, 0],
                } : {}}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: idx * 0.5,
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of card (Card back visually) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.03] border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-shadow duration-500"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-full h-full flex items-center justify-center border border-white/5 m-1 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Back of card (Card front visually) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.05] border border-white/20 p-1.5 min-[360px]:p-2.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <h3 className="text-[8px] min-[360px]:text-[10px] sm:text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.2em] text-white/90 mb-1.5 sm:mb-4 font-medium">
                    {card.title}
                  </h3>
                  <p className="text-[7px] min-[360px]:text-[9px] sm:text-[10px] md:text-xs text-white/60 whitespace-pre-line leading-normal sm:leading-relaxed">
                    {renderDescription(card.description, isSelected ? cardStats : null)}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!isRevealed && selectedCardIdx === null ? (
          <motion.div
            key="bottom-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 sm:mt-24 h-24"
          >
            <p className="text-xs sm:text-sm text-white/30 uppercase tracking-widest">
              there is no wrong choice.
            </p>
          </motion.div>
        ) : isRevealed ? (
          <motion.div
            key="observation-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 sm:mt-16 flex flex-col items-center gap-4 h-32"
          >
            <div className="flex flex-col items-center gap-2">
              {observation.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 2.5, duration: 1.5 }}
                  className="text-base sm:text-lg text-white/70 italic text-center"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + observation.length * 2.5, duration: 1 }}
              className="mt-4"
            >
              <button 
                onClick={onComplete}
                className="text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="spacer" className="mt-8 sm:mt-24 h-24" />
        )}
      </AnimatePresence>
    </div>
  );
}
