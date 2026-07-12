import React, { useMemo, useState, useEffect } from 'react';
import type { TrainProps, WagonData } from './trainTypes';
import { useTrainAnimation } from './trainAnimation';
import { generateTracks } from './trainGenerator';


export const Train: React.FC<TrainProps> = ({
  trainType = 'random',
  direction = 'left',
  speed = 1,
  scale = 1,
  loop = false,
  autoDepart = true,
  showTracks = true,
  stationary = false,
  containerWidth,
  className = '',
  style = {},
  onBoard,
}) => {
  const { containerRef, trainData } = useTrainAnimation({
    trainType,
    direction,
    speedMultiplier: speed,
    scale,
    loop,
    autoDepart,
    stationary,
  });

  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    if (showTracks) {
      // Determine the width for tracks. If stationary and no width provided, just generate a few tracks.
      // If moving, we usually want it to span the whole screen width.
      let w = containerWidth;
      if (!w) {
         w = typeof window !== 'undefined' ? window.innerWidth : 1920;
      }
      setTracks(generateTracks(w));
    }
  }, [showTracks, containerWidth]);

  const isLeft = direction === 'left';

  const renderWagon = (wagon: WagonData, index: number) => {
    // In Desktop Train, sprites are flipped by default unless wagon.flip is true.
    // So "flip" means "do not flip" from the default left-facing orientation.
    // If direction is left, we scaleX(-1) by default, and scaleX(1) if wagon.flip.
    // If direction is right, we do the exact opposite.
    const shouldFlip = isLeft ? !wagon.flip : wagon.flip;
    const wagonScaleX = shouldFlip ? -1 : 1;

    return (
      <div
        key={index}
        style={{
          position: 'relative',
          width: wagon.length,
          height: 32,
          backgroundImage: `url('/assets/train/trains.png')`,
          backgroundPosition: `-${wagon.sprite.x}px -${wagon.sprite.y}px`,
          transform: `scaleX(${wagonScaleX})`,
          imageRendering: 'pixelated',
          flexShrink: 0,
          cursor: wagon.isBoardable ? 'pointer' : 'default',
          pointerEvents: wagon.isBoardable ? 'auto' : 'auto',
          clipPath: 'inset(1px 0px 0px 0px)',
        }}
        onClick={wagon.isBoardable ? onBoard : undefined}
        className={wagon.isBoardable ? 'hover:brightness-125 transition-all' : ''}
      >
        {wagon.tag && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0, 
              width: wagon.tag.w,
              height: wagon.tag.h,
              backgroundImage: `url('/assets/train/trains.png')`,
              backgroundPosition: `-${wagon.tag.x}px -${wagon.tag.y}px`,
              imageRendering: 'pixelated',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className={`living-train-wrapper ${className}`} 
      style={{
        position: stationary ? 'relative' : 'absolute',
        top: 0,
        left: 0,
        width: stationary ? (containerWidth || '100%') : '100%',
        height: 32 * scale,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: stationary ? 'hidden' : 'visible',
        ...style
      }}
    >
      {/* Static Tracks Layer */}
      {showTracks && (
        <div 
          className="living-train-tracks"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '100%',
          }}
        >
          {tracks.map((track, i) => (
            <div 
              key={i}
              style={{
                width: track.w,
                height: track.h,
                backgroundImage: `url('/assets/train/trains.png')`,
                backgroundPosition: `-${track.x}px -${track.y}px`,
                imageRendering: 'pixelated',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Moving Train Layer */}
      <div 
        ref={containerRef}
        className="living-train"
        style={{
          position: stationary ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          width: stationary ? trainData.length * scale : undefined,
          willChange: 'transform',
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: isLeft ? 'row' : 'row-reverse', 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left' 
          }}
        >
           {trainData.wagons.map((wagon, i) => renderWagon(wagon, i))}
        </div>
      </div>
    </div>
  );
};
