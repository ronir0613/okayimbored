import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LEAF_COLORS = ['#ffb7c5', '#ffc0cb', '#ffd1dc', '#ffe4e1', '#ffffff', '#ff9eaa'];

export function WindLeaves({ timeOfDay }: { timeOfDay?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const leaves = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => { // Increased count slightly for blossoms
      // Start mostly from left offscreen, but some can start higher up
      const isLeftEdge = Math.random() > 0.3;
      const startX = isLeftEdge ? -10 - Math.random() * 20 : Math.random() * 100;
      const startY = isLeftEdge ? Math.random() * 80 : -10 - Math.random() * 20;
      
      return {
        id: i,
        startX,
        startY,
        endX: 120 + Math.random() * 50, // Move way past the right screen edge
        endY: startY + 20 + Math.random() * 40, // Drift downwards
        duration: 8 + Math.random() * 12, // Move relatively fast with the wind
        delay: Math.random() * 20, // Stagger spawns
        size: 3 + Math.random() * 6, // Blossom petals are slightly smaller
        rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 1080),
        baseOpacity: 0.4 + Math.random() * 0.5,
        nightVisibility: Math.random() > 0.4 ? 0 : 0.15 + Math.random() * 0.15, // 60% invisible at night, 40% very dim
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
      };
    });
  }, []);

  if (!isMounted) {
    return null;
  }

  const isNight = timeOfDay === 'night';
  const isEvening = timeOfDay === 'evening';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[45]">
      {leaves.map((leaf) => {
        const currentOpacity = isNight ? leaf.nightVisibility : isEvening ? leaf.baseOpacity * 0.5 : leaf.baseOpacity;
        return (
          <motion.div
            key={leaf.id}
            className="absolute"
            style={{
              width: leaf.size,
              height: leaf.size * 0.7,
              top: `${leaf.startY}%`,
              left: `${leaf.startX}%`,
              opacity: currentOpacity,
              backgroundColor: leaf.color,
              borderRadius: '50% 0 50% 0', // Simple CSS leaf shape
              filter: `blur(${Math.random() * 1.5}px) ${isNight ? 'brightness(0.3)' : 'brightness(1)'}`
            }}
            animate={{
              x: `${leaf.endX}vw`,
              y: `${leaf.endY}vh`,
              rotate: [0, leaf.rotationSpeed],
            }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        );
      })}
    </div>
  );
}
