import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ORDINARY = [
  'one sock', 'house keys', 'bus ticket', 'grocery list', 'umbrella',
  'receipt', 'pen', 'coffee cup', 'headphones', 'hoodie'
];

const DIGITAL = [
  'browser tab', 'playlist', 'desktop wallpaper', 'bookmark',
  'unread email', 'USB drive', 'old password'
];

const ABSTRACT = [
  'motivation', 'confidence', 'a good idea', 'Tuesday', 'the plot',
  'patience', 'three hours', 'one conversation', 'courage', 'sleep',
  'a childhood memory', "someone's train of thought", 'an apology'
];

const WEIRD = [
  'tiny frog', 'suspicious spoon', 'half a sandwich', 'one cloud',
  'imaginary pigeon', 'banana sticker', 'haunted stapler',
  'very small moon', 'invisible chair'
];

const RARE_LOST = ['the answer', 'your other sock', '2007', 'the last slice of pizza'];
const RARE_FOUND = ['today', 'a perfect excuse', "someone's lucky coin"];

const NOTES = [
  "Still waiting.",
  "Nobody came back.",
  "We're holding onto it.",
  "Probably important.",
  "Looks familiar.",
  "We think this belongs to somebody.",
  "No questions asked.",
  "Found near the record player.",
  "The cat refused to explain."
];

// Helper to get random item from array
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate random time like "2:14 AM"
const randomTime = () => {
  let h = Math.floor(Math.random() * 12) + 1;
  let m = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  let ampm = Math.random() > 0.5 ? 'AM' : 'PM';
  return `${h}:${m} ${ampm}`;
};

type ItemStatus = 'LOST' | 'FOUND';
type VisualEvent = 'NONE' | 'CLAIMED' | 'ARRIVED';

interface LFItem {
  id: string;
  status: ItemStatus;
  name: string;
  note: string;
  x: number; // percentage
  y: number; // percentage
  visualEvent: VisualEvent;
  hasCat: 'NONE' | 'SLEEPING' | 'STARING';
}

export default function LostAndFound() {
  const [items, setItems] = useState<LFItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);

  const generateNote = (musicPlaying: boolean, stationName: string | null) => {
    const r = Math.random();
    if (musicPlaying && stationName && r < 0.15) {
      return Math.random() > 0.5 
        ? `Found while ${stationName} was playing.`
        : `Recovered during ${stationName}.`;
    }
    if (r < 0.2) return `Found: ${randomTime()}`;
    if (r < 0.4) return "Still here.";
    if (r < 0.5) return "We don't know either.";
    if (r < 0.6) return "Nobody claimed it.";
    return pick(NOTES);
  };

  const generateSingleItem = (musicPlaying: boolean, stationName: string | null, preventRare: boolean = false): LFItem => {
    let name = '';
    let status: ItemStatus = Math.random() > 0.5 ? 'LOST' : 'FOUND';
    let note = generateNote(musicPlaying, stationName);

    const isRare = !preventRare && Math.random() < 0.005; // 0.5%
    if (isRare) {
      if (Math.random() > 0.5) {
        name = pick(RARE_LOST);
        status = 'LOST';
      } else {
        name = pick(RARE_FOUND);
        status = 'FOUND';
      }
    } else {
      const poolChoice = Math.random();
      if (poolChoice < 0.4) name = pick(ORDINARY);
      else if (poolChoice < 0.6) name = pick(DIGITAL);
      else if (poolChoice < 0.8) name = pick(ABSTRACT);
      else name = pick(WEIRD);
    }

    const hasCatChoice = Math.random();
    let hasCat: 'NONE' | 'SLEEPING' | 'STARING' = 'NONE';
    if (hasCatChoice < 0.05) hasCat = 'SLEEPING';
    else if (hasCatChoice < 0.1) hasCat = 'STARING';

    return {
      id: `item-${nextId.current++}`,
      status,
      name,
      note,
      x: 15 + Math.random() * 70, // 15% to 85%
      y: 15 + Math.random() * 70, // 15% to 85%
      visualEvent: 'NONE',
      hasCat
    };
  };

  useEffect(() => {
    setMounted(true);

    const isPlaying = localStorage.getItem('okayimbored_playing') === 'true';
    let stationName = null;
    if (isPlaying) {
      const idx = localStorage.getItem('okayimbored_station');
      if (idx === '0') stationName = 'Late Night Radio';
      else if (idx === '1') stationName = '3:17 AM';
      else if (idx === '2') stationName = 'Dog Sleeping Mix';
    }

    const numItems = Math.floor(Math.random() * 6) + 5; // 5 to 10
    const initialItems = [];
    for (let i = 0; i < numItems; i++) {
      initialItems.push(generateSingleItem(isPlaying, stationName));
    }

    // Ensure they don't overlap too badly by doing a simple relaxation
    for (let i = 0; i < initialItems.length; i++) {
      for (let j = i + 1; j < initialItems.length; j++) {
        const dx = initialItems[i].x - initialItems[j].x;
        const dy = initialItems[i].y - initialItems[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 15) { // 15% minimum distance roughly
          initialItems[j].y += 15;
          if (initialItems[j].y > 85) initialItems[j].y -= 30;
        }
      }
    }

    setItems(initialItems);

    // Random events timer
    const eventInterval = setInterval(() => {
      setItems(current => {
        const r = Math.random();
        if (r < 0.02 && current.length > 3) { // 2% chance every 5s to claim an item
          // Item disappears
          const targetIdx = Math.floor(Math.random() * current.length);
          const newItems = [...current];
          newItems[targetIdx] = { ...newItems[targetIdx], visualEvent: 'CLAIMED' };
          
          setTimeout(() => {
            setItems(items2 => items2.filter(i => i.id !== newItems[targetIdx].id));
          }, 4000); // Wait 4s before removing it from DOM
          
          return newItems;
        } else if (r > 0.98 && current.length < 15) { // 2% chance to add new item
          const newItem = generateSingleItem(isPlaying, stationName);
          newItem.visualEvent = 'ARRIVED';
          
          setTimeout(() => {
            setItems(items2 => items2.map(i => i.id === newItem.id ? { ...i, visualEvent: 'NONE' } : i));
          }, 4000);

          return [...current, newItem];
        }
        return current;
      });
    }, 5000);

    return () => clearInterval(eventInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ 
              opacity: item.visualEvent === 'CLAIMED' ? 0 : 1, 
              filter: item.visualEvent === 'CLAIMED' ? 'blur(8px)' : 'blur(0px)',
              transition: { duration: item.visualEvent === 'CLAIMED' ? 3 : 2 }
            }}
            exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 2 } }}
            className="absolute flex flex-col items-center pointer-events-auto"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`, 
              transform: 'translate(-50%, -50%)',
              maxWidth: '200px'
            }}
          >
            {/* Museum Label */}
            <div className="bg-[#050505] p-5 rounded-sm flex flex-col items-center text-center font-mono">
              <span className="text-[10px] tracking-[0.3em] text-white/30 mb-4 border-b border-white/5 pb-2 w-full uppercase">
                {item.status}
              </span>
              
              <span className="text-base md:text-lg text-white/80 tracking-widest mb-4 leading-relaxed font-light">
                {item.name}
              </span>
              
              <span className="text-[11px] text-white/40 italic w-full">
                {item.note}
              </span>
            </div>

            {/* Event Microcopy */}
            <AnimatePresence>
              {item.visualEvent === 'CLAIMED' && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 text-[11px] text-white/40 tracking-widest font-mono"
                >
                  claimed.
                </motion.span>
              )}
              {item.visualEvent === 'ARRIVED' && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-8 text-[11px] text-white/40 tracking-widest font-mono"
                >
                  just arrived.
                </motion.span>
              )}
            </AnimatePresence>

            {/* Cats */}
            {item.hasCat === 'SLEEPING' && (
              <div className="absolute -left-16 bottom-0 text-white/20 text-[10px] font-mono opacity-60">
                <pre className="leading-tight">
{` /\\_/\\
( -.- )
  zZ`}
                </pre>
              </div>
            )}
            {item.hasCat === 'STARING' && (
              <div className="absolute -right-16 bottom-2 text-white/20 text-[10px] font-mono opacity-80">
                <pre className="leading-tight">
{` /\\_/\\
( o.o )`}
                </pre>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
