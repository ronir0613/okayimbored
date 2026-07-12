import { useState, useEffect, useRef } from 'react';
import type { CatState } from './PixelCat';

export function useCatBehavior() {
  const [catState, setCatState] = useState<CatState>('idle');
  // Position is a percentage from 0 to 100 (left to right)
  const [catPosition, setCatPosition] = useState(60); 
  const [isVisible, setIsVisible] = useState(true);
  const [catWalkDuration, setCatWalkDuration] = useState(0);
  const isTransitioningRef = useRef(false);
  const positionRef = useRef(60);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const pickNextAction = () => {
      if (isTransitioningRef.current) return;

      const rand = Math.random();
      
      if (!isVisible) {
        // If hidden, high chance to stay hidden, low chance to reappear
        if (rand < 0.8) {
          timeout = setTimeout(pickNextAction, 5000 + Math.random() * 10000);
        } else {
          setIsVisible(true);
          setCatState('idle');
          setCatWalkDuration(0);
          const newPos = Math.random() * 80 + 10;
          setCatPosition(newPos); // Appear somewhere random
          positionRef.current = newPos;
          timeout = setTimeout(pickNextAction, 2000);
        }
        return;
      }

      // If visible, pick next state
      if (catState === 'idle') {
        if (rand < 0.3) {
          // Walk Left
          setCatState('walking_left');
          const duration = 2000 + Math.random() * 4000;
          setCatWalkDuration(duration);
          // Calculate destination: move 4% per second
          const moveAmount = (duration / 1000) * 4;
          const newPos = Math.max(5, positionRef.current - moveAmount);
          setCatPosition(newPos);
          positionRef.current = newPos;

          timeout = setTimeout(() => {
            setCatState('idle');
            setCatWalkDuration(0);
            pickNextAction();
          }, duration);
        } else if (rand < 0.6) {
          // Walk Right
          setCatState('walking_right');
          const duration = 2000 + Math.random() * 4000;
          setCatWalkDuration(duration);
          const moveAmount = (duration / 1000) * 4;
          const newPos = Math.min(95, positionRef.current + moveAmount);
          setCatPosition(newPos);
          positionRef.current = newPos;

          timeout = setTimeout(() => {
            setCatState('idle');
            setCatWalkDuration(0);
            pickNextAction();
          }, duration);
        } else if (rand < 0.8) {
          // Sleep
          isTransitioningRef.current = true;
          setCatState('idle_to_sleeping');
          setTimeout(() => {
            setCatState('sleeping');
            isTransitioningRef.current = false;
            timeout = setTimeout(() => {
              isTransitioningRef.current = true;
              setCatState('sleeping_to_idle');
              setTimeout(() => {
                setCatState('idle');
                isTransitioningRef.current = false;
                pickNextAction();
              }, 600); // Transition out duration
            }, 10000 + Math.random() * 20000); // Sleep duration
          }, 600); // Transition in duration
        } else if (rand < 0.95) {
          // Just stay idle longer
          timeout = setTimeout(pickNextAction, 3000 + Math.random() * 5000);
        } else {
          // Disappear (walk off screen logic could be added, but for now just hide)
          setIsVisible(false);
          timeout = setTimeout(pickNextAction, 10000 + Math.random() * 20000);
        }
      } else {
         // Fallback
         setCatState('idle');
         setCatWalkDuration(0);
         timeout = setTimeout(pickNextAction, 2000);
      }
    };

    timeout = setTimeout(pickNextAction, 2000);

    return () => clearTimeout(timeout);
  }, [catState, isVisible]);

  return { catState, catPosition, isVisible, catWalkDuration };
}

