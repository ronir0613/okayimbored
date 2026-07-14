import React, { useMemo, useState, useEffect } from 'react';
import type { TrainProps, WagonData } from './trainTypes';
import { generateTracks, generateTrain } from './trainGenerator';


export const Train: React.FC<TrainProps & { timeOfDay?: string }> = ({
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
  isInteractable = true,
  timeOfDay,
}) => {
  const [trainData, setTrainData] = useState(() => generateTrain(trainType));

  useEffect(() => {
    setTrainData(generateTrain(trainType));
  }, [trainType]);

  const [tracks, setTracks] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (showTracks) {
      let w = containerWidth;
      if (!w) {
         w = typeof window !== 'undefined' ? window.innerWidth : 1920;
      }
      setTracks(generateTracks(w));
    }
  }, [showTracks, containerWidth]);

  const isLeft = direction === 'left';

  const renderWagon = (wagon: WagonData, index: number) => {
    const shouldFlip = isLeft ? !wagon.flip : wagon.flip;
    const wagonScaleX = shouldFlip ? -1 : 1;
    
    // Window lighting logic
    const isNight = timeOfDay === 'night' || timeOfDay === 'evening';

    return (
      <div
        key={index}
        style={{
          position: 'relative',
          width: wagon.length,
          height: 32,
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 16,
          overflow: 'hidden',
        }}>
          {/* Background blocker acts as window lights during night */}
          <div style={{
             position: 'absolute',
             bottom: 12,
             left: 0,
             width: '100%',
             height: 12,
             backgroundColor: isNight ? '#fcd34d' : '#050810',
             boxShadow: isNight ? '0 0 15px rgba(252, 211, 77, 0.6)' : 'none',
             transition: 'background-color 5s, box-shadow 5s',
          }} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 32,
              backgroundImage: `url('/assets/train/trains.png')`,
              backgroundPosition: `-${wagon.sprite.x}px -${wagon.sprite.y}px`,
              transform: `scaleX(${wagonScaleX})`,
              transformOrigin: 'bottom center',
              imageRendering: 'pixelated',
              cursor: 'default',
              pointerEvents: (wagon.isBoardable && isInteractable) ? 'auto' : 'none',
            }}
            onClick={(wagon.isBoardable && isInteractable) ? onBoard : undefined}
          />
          {wagon.tag && (
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
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
        width: stationary ? (containerWidth || 'max-content') : '100%',
        height: 32 * scale,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: stationary ? 'hidden' : 'visible',
        ...style
      }}
    >
      {/* Static Tracks Layer */}
      {isMounted && showTracks && (
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

      {isMounted && (
        <div 
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
              width: 'max-content',
              flexDirection: isLeft ? 'row' : 'row-reverse', 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left' 
            }}
          >
             {trainData.wagons.map((wagon, i) => renderWagon(wagon, i))}
          </div>
        </div>
      )}
    </div>
  );
};
