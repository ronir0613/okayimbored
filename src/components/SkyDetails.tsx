import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function SkyDetails({ timeOfDay }: { timeOfDay: string }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const birds = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({ // Reduced from 12 to 4 birds
      id: i,
      startY: 5 + Math.random() * 35, // top 5% to 40%
      duration: 60 + Math.random() * 100, // slower movement across sky
      delay: Math.random() * 200, // much longer delay between appearances
      scale: 0.4 + Math.random() * 0.6,
      flapSpeed: 0.5 + Math.random() * 0.3, // synchronous flap speed for both wings
      drift: 20 + Math.random() * 30, // vertical drift
      opacity: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  const trails = useMemo(() => {
    return Array.from({ length: 2 }).map((_, i) => ({
      id: i,
      startY: 10 + Math.random() * 15,
      angle: -5 + Math.random() * 10,
      duration: 200 + Math.random() * 150, // very slow
      delay: Math.random() * 100,
      width: 50 + Math.random() * 30,
    }));
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // %
      y: Math.random() * 50, // restrict to top 50%
      size: Math.random() * 2 + 0.5,
      opacity: 0.1 + Math.random() * 0.8,
      twinkleDuration: 2 + Math.random() * 4,
      twinkleDelay: Math.random() * 5,
    }));
  }, []);

  const planes = useMemo(() => {
    return Array.from({ length: 1 }).map((_, i) => ({
      id: i,
      startY: 5 + Math.random() * 25, // restrict to top 30%
      duration: 150 + Math.random() * 100,
      delay: Math.random() * 10, 
      repeatDelay: 30 + Math.random() * 60,
      scale: 0.3 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));
  }, []);

  const isNight = timeOfDay === 'night';
  const isEvening = timeOfDay === 'evening';
  const isMorning = timeOfDay === 'morning';

  if (!isMounted) return null;

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-[5]"
      style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)' }}
    >
      {/* Stars */}
      {isNight && (
        <div className="absolute inset-0">
          {stars.map(star => (
            <motion.div
              key={`star-${star.id}`}
              className="absolute bg-white rounded-full"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              initial={{ opacity: star.opacity }}
              animate={{ opacity: [star.opacity * 0.2, star.opacity, star.opacity * 0.2] }}
              transition={{
                duration: star.twinkleDuration,
                delay: star.twinkleDelay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Airplane Trails */}
      {trails.map(trail => (
        <motion.div
          key={`trail-${trail.id}`}
          className="absolute h-[2px] bg-white/40 blur-[2px] rounded-full"
          style={{
            top: `${trail.startY}%`,
            width: `${trail.width}vw`,
            rotate: `${trail.angle}deg`,
            opacity: isNight ? 0.1 : (isEvening || isMorning ? 0.25 : 0.4),
          }}
          initial={{ x: '-100vw' }}
          animate={{ x: '120vw' }}
          transition={{ duration: trail.duration, delay: trail.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Distant Birds */}
      {!isNight && birds.map(bird => (
        <motion.div
          key={`bird-${bird.id}`}
          className="absolute flex items-center justify-center"
          style={{ top: `${bird.startY}%`, opacity: bird.opacity }}
          initial={{ x: '-10vw', scale: bird.scale }}
          animate={{ x: '110vw', y: [0, -bird.drift, 0, bird.drift, 0], scale: bird.scale }}
          transition={{ 
            x: { duration: bird.duration, delay: bird.delay, repeat: Infinity, ease: 'linear' },
            y: { duration: 15, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <div className="flex gap-[0.5px]">
            {/* Left Wing */}
            <motion.div 
              className="w-2 h-[1.5px] bg-[#1a2530] origin-right rounded-full" 
              animate={{ rotate: [15, -25, 15] }} 
              transition={{ duration: bird.flapSpeed, repeat: Infinity, ease: 'easeInOut' }} 
            />
            {/* Right Wing */}
            <motion.div 
              className="w-2 h-[1.5px] bg-[#1a2530] origin-left rounded-full" 
              animate={{ rotate: [-15, 25, -15] }} 
              transition={{ duration: bird.flapSpeed, repeat: Infinity, ease: 'easeInOut' }} 
            />
          </div>
        </motion.div>
      ))}

      {/* Night Planes */}
      {isNight && planes.map(plane => {
        const initialX = plane.direction === 1 ? '-10vw' : '110vw';
        const targetX = plane.direction === 1 ? '110vw' : '-10vw';
        
        return (
          <motion.div
            key={`plane-${plane.id}`}
            className="absolute flex items-center justify-center gap-6"
            style={{ top: `${plane.startY}%` }}
            initial={{ x: initialX, scale: plane.scale }}
            animate={{ x: targetX, scale: plane.scale }}
            transition={{ 
              x: { duration: plane.duration, delay: plane.delay, repeat: Infinity, ease: 'linear', repeatDelay: plane.repeatDelay }
            }}
          >
            {/* Left Wing Light (Red) */}
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Right Wing Light (Green) */}
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,1)]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, delay: 0.1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
