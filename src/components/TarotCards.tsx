import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_CARDS = [
  { title: "THE CHAIR", description: "This card appeared\n{count} times tonight." },
  { title: "THE WINDOW", description: "Nobody picked this\nfor 37 minutes." }, // Static for now as requested by user example
  { title: "THE DOG", description: "The dog approves." },
  { title: "THE CAT", description: "The cat selected this earlier." },
  { title: "THE BUTTON", description: "There was supposed\nto be a button here." },
  { title: "THE TUESDAY", description: "This doesn't feel\nlike a Tuesday card." },
  { title: "THE MAP", description: "Three people from your country\npicked this tonight." },
  { title: "THE NOTHING", description: "This card contains\nalmost nothing." },
  { title: "THE WAITING ROOM", description: "This card was waiting\nfor somebody." },
  { title: "THE DESKTOP", description: "You probably have\ntoo many tabs open." }
];

export function TarotCards({ onComplete, sessionId }: { onComplete: () => void, sessionId?: string }) {
  const [cards, setCards] = useState<typeof ALL_CARDS>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cardStats, setCardStats] = useState<number | null>(null);

  useEffect(() => {
    // Pick 3 random unique cards
    const shuffled = [...ALL_CARDS].sort(() => 0.5 - Math.random());
    setCards(shuffled.slice(0, 3));
  }, []);

  const handleCardClick = async (idx: number) => {
    if (selectedCardIdx !== null) return;
    setSelectedCardIdx(idx);
    
    const pickedCard = cards[idx];

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
            className="text-center mb-12"
          >
            <p className="text-xl sm:text-2xl text-white/90">pick a card.</p>
            <p className="text-lg sm:text-xl text-white/50 pt-2">go with whatever feels right.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="post-pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12 h-[64px] sm:h-[72px]" // Keeps spacing consistent
          />
        )}
      </AnimatePresence>

      <div className="flex gap-4 sm:gap-8 justify-center items-center w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
        {cards.map((card, idx) => {
          const isSelected = selectedCardIdx === idx;
          const isOther = selectedCardIdx !== null && !isSelected;
          
          return (
            <motion.div
              key={idx}
              className={`relative cursor-pointer w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-56 ${
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
                  className="absolute inset-0 w-full h-full rounded-xl bg-white/[0.05] border border-white/20 p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <h3 className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] text-white/90 mb-3 sm:mb-4 font-medium">
                    {card.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-white/60 whitespace-pre-line leading-relaxed">
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
            className="mt-16 sm:mt-24"
          >
            <p className="text-xs sm:text-sm text-white/30 uppercase tracking-widest">
              there is no wrong choice.
            </p>
          </motion.div>
        ) : isRevealed ? (
          <motion.div
            key="continue-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }} // Wait a bit for them to read
            className="mt-16 sm:mt-24"
          >
            <button 
              onClick={onComplete}
              className="text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
            >
              Continue
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
