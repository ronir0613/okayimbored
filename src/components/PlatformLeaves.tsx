import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LEAF_COLORS = ['#ffb7c5', '#ffc0cb', '#ffd1dc', '#ffe4e1', '#ffffff', '#ff9eaa'];

export function PlatformLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100, // vw
      startY: Math.random() * 90 + 5, // % of platform height
      size: 2 + Math.random() * 4,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-70">
      {leaves.map((leaf) => (
        <PlatformLeaf key={leaf.id} leaf={leaf} />
      ))}
    </div>
  );
}

function PlatformLeaf({ leaf }: { leaf: any }) {
  const [x, setX] = useState(leaf.startX);
  const [y, setY] = useState(leaf.startY);
  const [rotation, setRotation] = useState(Math.random() * 360);

  useEffect(() => {
    const interval = setInterval(() => {
      // 70% chance to just sit there, 30% chance to be caught by a small breeze
      if (Math.random() > 0.7) {
        // Skitter around locally
        const moveX = (Math.random() - 0.5) * 8; // -4 to +4 vw
        const moveY = (Math.random() - 0.5) * 6; // -3 to +3 %
        
        setX((prev: number) => {
          let next = prev + moveX;
          if (next < 2) next = 2;
          if (next > 98) next = 98;
          return next;
        });
        
        setY((prev: number) => {
          let next = prev + moveY;
          if (next < 5) next = 5;
          if (next > 95) next = 95;
          return next;
        });
        
        setRotation((prev: number) => prev + (Math.random() * 240 - 120));
      }
    }, 1000 + Math.random() * 4000); // Check every 1-5s

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute"
      style={{
        width: leaf.size,
        height: leaf.size * 0.7,
        backgroundColor: leaf.color,
        borderRadius: '50% 0 50% 0',
      }}
      initial={{ left: `${leaf.startX}vw`, top: `${leaf.startY}%`, rotate: rotation }}
      animate={{
        left: `${x}vw`,
        top: `${y}%`,
        rotate: rotation,
      }}
      transition={{
        duration: 0.8 + Math.random() * 1.5,
        ease: "easeOut"
      }}
    />
  );
}
