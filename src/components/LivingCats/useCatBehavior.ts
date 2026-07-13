import { useState, useEffect, useRef } from 'react';
import type { CatState } from './PixelCat';

export function useCatBehavior(stationState?: string) {
  const [catState, setCatState] = useState<CatState>('idle');
  // Position is a percentage from 0 to 100 (left to right)
  const [catPosition, setCatPosition] = useState(60); 
  const [isVisible, setIsVisible] = useState(true);
  const [catWalkDuration, setCatWalkDuration] = useState(0);
  const [isBoarding, setIsBoarding] = useState(false);
  const [catY, setCatY] = useState(0); // 0 is default bottom
  
  const isTransitioningRef = useRef(false);
  const positionRef = useRef(60);
  const stationStateRef = useRef(stationState);

  // Sync station state ref
  useEffect(() => {
    stationStateRef.current = stationState;
  }, [stationState]);

  // Handle Boarding logic
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (stationState === 'DOORS_OPEN') {
      // Start boarding sequence after a small delay
      timeout = setTimeout(() => {
        setIsBoarding(true);
        const goLeft = positionRef.current > 50;
        setCatState(goLeft ? 'walking_left' : 'walking_right');
        setCatWalkDuration(4000); // 4 seconds to walk up
        
        // Move diagonally
        setCatY(30); // Move up by 30% of platform
        const newPos = goLeft ? positionRef.current - 15 : positionRef.current + 15;
        setCatPosition(newPos);
        positionRef.current = newPos;
        
        // Disappear after walking up
        setTimeout(() => {
          setIsVisible(false);
          setCatState('idle');
          setCatWalkDuration(0);
        }, 4000);
      }, 1000 + Math.random() * 2000);
    } else if (stationState === 'DEPARTING_EMPTY' || stationState === 'DEPARTING_BOARDED') {
      // When train leaves, prepare a new cat
      setIsBoarding(false);
      setCatY(0);
      setIsVisible(false); // Make sure it's hidden before arriving
    } else if (stationState === 'WAITING_EMPTY' && !isVisible) {
      // Come back from left or right
      timeout = setTimeout(() => {
        const fromLeft = Math.random() > 0.5;
        positionRef.current = fromLeft ? -10 : 110;
        setCatPosition(positionRef.current);
        setIsVisible(true);
        setCatY(0);
        
        // Start walking in
        setTimeout(() => {
          setCatState(fromLeft ? 'walking_right' : 'walking_left');
          setCatWalkDuration(3000);
          const newPos = fromLeft ? 20 + Math.random() * 20 : 60 + Math.random() * 20;
          setCatPosition(newPos);
          positionRef.current = newPos;
          
          setTimeout(() => {
            setCatState('idle_to_sleeping');
            setCatWalkDuration(0);
            setTimeout(() => {
              setCatState('sleeping');
            }, 600);
          }, 3000);
        }, 100);
      }, 3000 + Math.random() * 5000); // Wait 3-8s after station is empty
    } else if (stationState === 'APPROACHING' || stationState === 'BRAKING') {
      // Wake up when train is arriving
      setCatState((prev) => {
        if (prev === 'sleeping' || prev === 'idle_to_sleeping') {
          timeout = setTimeout(() => {
            setCatState('idle');
          }, 600);
          return 'sleeping_to_idle';
        }
        return 'idle';
      });
    }

    return () => clearTimeout(timeout);
  }, [stationState]);

  // Remove the random pickNextAction behavior completely
  // The cat will just follow the deterministic boarding and sleeping cycle.
  return { catState, catPosition, isVisible, catWalkDuration, isBoarding, catY };
}
