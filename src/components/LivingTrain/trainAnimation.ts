import { useEffect, useRef, useState } from 'react';
import { generateTrain } from './trainGenerator';
import type { TrainData, TrainType } from './trainTypes';

interface UseTrainAnimationProps {
  trainType: TrainType;
  direction: 'left' | 'right';
  speedMultiplier: number;
  scale: number;
  loop: boolean;
  autoDepart?: boolean;
  stationary?: boolean;
}

export function useTrainAnimation({
  trainType,
  direction,
  speedMultiplier,
  scale,
  loop,
  autoDepart,
  stationary,
}: UseTrainAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We store the train data in state so React can render the correct wagons
  const [trainData, setTrainData] = useState<TrainData>(() => generateTrain(trainType));
  
  // Refs for animation state to avoid dependency cycles and re-renders
  const xRef = useRef<number>(0);
  const trainDataRef = useRef<TrainData>(trainData);
  const initialized = useRef(false);
  const isFinished = useRef(false);

  // Sync trainData state to ref
  useEffect(() => {
    trainDataRef.current = trainData;
  }, [trainData]);

  // If trainType changes, reset the train completely
  useEffect(() => {
    if (initialized.current) {
      const newTrain = generateTrain(trainType);
      setTrainData(newTrain);
      initialized.current = false;
      isFinished.current = false;
    }
  }, [trainType]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const update = (time: number) => {
      animationFrameId = requestAnimationFrame(update);
      const deltaTime = time - lastTime;
      lastTime = time;
      
      const container = containerRef.current;
      if (!container) return;

      const parent = container.parentElement;
      const screenWidth = parent ? parent.clientWidth : window.innerWidth;
      
      const currentTrain = trainDataRef.current;
      
      const visualLength = currentTrain.length * scale;
      
      if (!initialized.current) {
        if (stationary) {
          xRef.current = 0; // Or whatever logic centers it, but container itself can be positioned.
        } else if (direction === 'left') {
          xRef.current = screenWidth + visualLength;
        } else {
          xRef.current = -visualLength;
        }
        initialized.current = true;
      }
      
      if (!isFinished.current && !stationary) {
        // Ebiten runs at 60 TPS by default. 
        // Speed in Ebiten is pixels per frame.
        // Movement per second = speed * 60.
        const baseSpeed = currentTrain.speed * speedMultiplier * scale;
        const moveAmount = (baseSpeed * 60 * deltaTime) / 1000;

        if (direction === 'left') {
          xRef.current -= moveAmount;
          
          if (xRef.current <= -visualLength) {
            if (loop) {
              const newTrain = generateTrain(trainType);
              setTrainData(newTrain);
              xRef.current = screenWidth + (newTrain.length * scale);
            } else {
              isFinished.current = true;
            }
          }
        } else {
          xRef.current += moveAmount;
          
          if (xRef.current >= screenWidth + visualLength) {
            if (loop) {
              const newTrain = generateTrain(trainType);
              setTrainData(newTrain);
              xRef.current = -(newTrain.length * scale);
            } else {
              isFinished.current = true;
            }
          }
        }
      }
      
      container.style.transform = `translateX(${xRef.current}px)`;
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [direction, speedMultiplier, loop, scale, trainType, stationary]);

  return { containerRef, trainData };
}
