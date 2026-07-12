import React, { useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

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
  const x = useMotionValue(leaf.startX);
  const y = useMotionValue(leaf.startY);
  const rotation = useMotionValue(Math.random() * 360);

  const leftValue = useTransform(x, (val) => `${val}vw`);
  const topValue = useTransform(y, (val) => `${val}%`);

  useEffect(() => {
    const interval = setInterval(() => {
      // 70% chance to just sit there, 30% chance to be caught by a small breeze
      if (Math.random() > 0.7) {
        // Skitter around locally
        const moveX = (Math.random() - 0.5) * 8; // -4 to +4 vw
        const moveY = (Math.random() - 0.5) * 6; // -3 to +3 %
        
        let nextX = x.get() + moveX;
        if (nextX < 2) nextX = 2;
        if (nextX > 98) nextX = 98;
        
        let nextY = y.get() + moveY;
        if (nextY < 5) nextY = 5;
        if (nextY > 95) nextY = 95;
        
        const nextRotation = rotation.get() + (Math.random() * 240 - 120);
        const duration = 0.8 + Math.random() * 1.5;

        animate(x, nextX, { duration, ease: "easeOut" });
        animate(y, nextY, { duration, ease: "easeOut" });
        animate(rotation, nextRotation, { duration, ease: "easeOut" });
      }
    }, 1000 + Math.random() * 4000); // Check every 1-5s

    return () => clearInterval(interval);
  }, [x, y, rotation]);

  return (
    <motion.div
      className="absolute"
      style={{
        width: leaf.size,
        height: leaf.size * 0.7,
        backgroundColor: leaf.color,
        borderRadius: '50% 0 50% 0',
        left: leftValue,
        top: topValue,
        rotate: rotation,
      }}
    />
  );
}
