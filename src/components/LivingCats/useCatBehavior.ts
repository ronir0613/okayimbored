import { useState, useEffect, useRef } from 'react';
import type { CatState } from './PixelCat';

export function useCatBehavior() {
  const [catState, setCatState] = useState<CatState>('idle');
  // Position is a percentage from 0 to 100 (left to right)
  const [catPosition, setCatPosition] = useState(60); 
  const [isVisible, setIsVisible] = useState(true);
  const isTransitioningRef = useRef(false);

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
          setCatPosition(Math.random() * 80 + 10); // Appear somewhere random
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
          timeout = setTimeout(() => {
            setCatState('idle');
            pickNextAction();
          }, duration);
        } else if (rand < 0.6) {
          // Walk Right
          setCatState('walking_right');
          const duration = 2000 + Math.random() * 4000;
          timeout = setTimeout(() => {
            setCatState('idle');
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
         timeout = setTimeout(pickNextAction, 2000);
      }
    };

    timeout = setTimeout(pickNextAction, 2000);

    return () => clearTimeout(timeout);
  }, [catState, isVisible]);

  // Handle position updates during walking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (catState === 'walking_left') {
      interval = setInterval(() => {
        setCatPosition((prev) => Math.max(5, prev - 0.2));
      }, 50);
    } else if (catState === 'walking_right') {
      interval = setInterval(() => {
        setCatPosition((prev) => Math.min(95, prev + 0.2));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [catState]);

  return { catState, catPosition, isVisible };
}
