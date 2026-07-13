import React, { useMemo, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const LEAF_COLORS = ['#ffb7c5', '#ffc0cb', '#ffd1dc', '#ffe4e1', '#ffffff', '#ff9eaa'];

export function PlatformLeaves({ stationState, trainDirection }: { stationState?: string, trainDirection?: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const leaves = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100, // vw
      startY: Math.random() * 90 + 5, // % of platform height
      size: 2 + Math.random() * 4,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    }));
  }, []);

  if (!isClient) {
    return <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-70" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-70">
      {leaves.map((leaf) => (
        <PlatformLeaf key={leaf.id} leaf={leaf} stationState={stationState} trainDirection={trainDirection} />
      ))}
    </div>
  );
}

function PlatformLeaf({ leaf, stationState, trainDirection }: { leaf: any, stationState?: string, trainDirection?: string }) {
  const x = useMotionValue(leaf.startX);
  const y = useMotionValue(leaf.startY);
  const rotation = useMotionValue(Math.random() * 360);

  const leftValue = useTransform(x, (val) => `${val}vw`);
  const topValue = useTransform(y, (val) => `${val}%`);

  useEffect(() => {
    // Normal ambient breeze
    if (stationState === 'APPROACHING' || stationState === 'BRAKING' || stationState === 'PASSING' || stationState?.startsWith('DEPARTING')) {
       return; // Wind handles it
    }

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
  }, [x, y, rotation, stationState]);

  useEffect(() => {
    // Train wind physics
    if (stationState === 'APPROACHING' || stationState === 'BRAKING' || stationState === 'PASSING' || stationState?.startsWith('DEPARTING')) {
       const windDir = trainDirection === 'left' ? -1 : 1;
       const baseWind = stationState === 'PASSING' ? 15 : 8; // Reduced base wind
       
       const pushLeaf = () => {
         // Calculate distance factor based on Y position. 
         // y=5 is closest to train (factor ~1), y=95 is furthest (factor ~0)
         // We use an exponential falloff so it drops off quickly away from the edge
         const distanceFactor = Math.pow((100 - y.get()) / 95, 2);
         
         // Only push if there's enough force, otherwise let it sit or occasionally twitch
         if (distanceFactor < 0.1 && Math.random() > 0.2) return;

         const moveX = windDir * (baseWind + Math.random() * 8) * distanceFactor;
         const moveY = (Math.random() - 0.5) * 8 * distanceFactor;
         
         let nextX = x.get() + moveX;
         // Wrap around for continuous flow (instant set so it doesn't animate backwards)
         if (nextX < -10) {
            x.set(110);
            nextX = 110 + moveX;
         } else if (nextX > 110) {
            x.set(-10);
            nextX = -10 + moveX;
         }
         
         let nextY = y.get() + moveY;
         if (nextY < 5) nextY = 5;
         if (nextY > 95) nextY = 95;
         
         const nextRotation = rotation.get() + windDir * (90 + Math.random() * 180) * distanceFactor;
         const duration = 0.6 + Math.random() * 0.6; // Slightly slower/more realistic

         animate(x, nextX, { duration, ease: "linear" });
         animate(y, nextY, { duration, ease: "easeInOut" });
         animate(rotation, nextRotation, { duration, ease: "linear" });
       };
       
       pushLeaf();
       // Less frequent updates to reduce visual chaos
       const interval = setInterval(pushLeaf, 800 + Math.random() * 800);
       return () => clearInterval(interval);
    }
  }, [stationState, trainDirection, x, y, rotation]);

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
