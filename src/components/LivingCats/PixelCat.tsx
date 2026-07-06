import React, { useState, useEffect } from 'react';

export type CatState = 
  | 'idle' 
  | 'idle_to_sleeping' 
  | 'sleeping' 
  | 'sleeping_to_idle' 
  | 'walking_left' 
  | 'walking_right' 
  | 'angry';

interface PixelCatProps {
  state: CatState;
  className?: string;
}

export const PixelCat: React.FC<PixelCatProps> = ({ state, className = '' }) => {
  const [frameIdx, setFrameIdx] = useState(0);

  // Pre-define sequences based on desktop-cat main.py
  const sequences: Record<CatState, { frames: string[], delay: number }> = {
    idle: {
      frames: ['idle1.png', 'idle2.png', 'idle3.png', 'idle4.png'],
      delay: 400
    },
    idle_to_sleeping: {
      frames: ['sleeping1.png', 'sleeping2.png', 'sleeping3.png', 'sleeping4.png', 'sleeping5.png', 'sleeping6.png'],
      delay: 100
    },
    sleeping: {
      frames: ['zzz1.png', 'zzz2.png', 'zzz3.png', 'zzz4.png'],
      delay: 400
    },
    sleeping_to_idle: {
      frames: ['sleeping6.png', 'sleeping5.png', 'sleeping4.png', 'sleeping3.png', 'sleeping2.png', 'sleeping1.png'],
      delay: 100
    },
    walking_left: {
      frames: ['walkingleft1.png', 'walkingleft2.png', 'walkingleft3.png', 'walkingleft4.png'],
      delay: 100
    },
    walking_right: {
      frames: ['walkingright1.png', 'walkingright2.png', 'walkingright3.png', 'walkingright4.png'],
      delay: 100
    },
    angry: {
      frames: ['angry.png'],
      delay: 400
    }
  };

  const activeSequence = sequences[state] || sequences.idle;

  useEffect(() => {
    setFrameIdx(0); // Reset animation when state changes
    
    // Don't set interval if only one frame
    if (activeSequence.frames.length <= 1) return;

    const interval = setInterval(() => {
      setFrameIdx(prev => {
        // If it's a transition animation, stop at the last frame
        if ((state === 'idle_to_sleeping' || state === 'sleeping_to_idle') && prev === activeSequence.frames.length - 1) {
          return prev;
        }
        return (prev + 1) % activeSequence.frames.length;
      });
    }, activeSequence.delay);

    return () => clearInterval(interval);
  }, [state, activeSequence.delay, activeSequence.frames.length]);

  // Handle case where we switch states and frameIdx might be out of bounds
  const safeIdx = Math.min(frameIdx, activeSequence.frames.length - 1);
  const currentFrame = activeSequence.frames[safeIdx];

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <img 
        src={`/assets/desktop-cat/${currentFrame}`} 
        alt={`Cat is ${state}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          imageRendering: 'pixelated', // Keep pixel art crisp
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
};
