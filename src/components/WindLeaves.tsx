import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const LEAF_COLORS = ['#5b4a36', '#4a3b2c', '#3a4f32', '#6b5428', '#2d3827'];

export function WindLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
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
        size: 4 + Math.random() * 8, // Leaf size between 4px and 12px
        rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 1080),
        opacity: 0.3 + Math.random() * 0.6,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[45]">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            width: leaf.size,
            height: leaf.size * 0.7,
            top: `${leaf.startY}%`,
            left: `${leaf.startX}%`,
            opacity: leaf.opacity,
            backgroundColor: leaf.color,
            borderRadius: '50% 0 50% 0', // Simple CSS leaf shape
            filter: `blur(${Math.random() * 1.5}px)` // Some are out of focus
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
      ))}
    </div>
  );
}
