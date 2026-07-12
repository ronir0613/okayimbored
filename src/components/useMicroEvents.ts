import { useState, useEffect } from 'react';

export function useMicroEvents() {
  const [lightsFlickering, setLightsFlickering] = useState(false);
  const [birdLanded, setBirdLanded] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const rollForEvent = () => {
      const rand = Math.random();

      if (rand < 0.05) {
        // Lights flicker
        setLightsFlickering(true);
        setTimeout(() => setLightsFlickering(false), 200 + Math.random() * 500);
      } else if (rand < 0.1) {
        // Bird lands briefly
        setBirdLanded(true);
        setTimeout(() => setBirdLanded(false), 2000 + Math.random() * 5000);
      }
      
      // Roll again between 10s and 30s
      timeout = setTimeout(rollForEvent, 10000 + Math.random() * 20000);
    };

    timeout = setTimeout(rollForEvent, 15000);

    return () => clearTimeout(timeout);
  }, []);

  return { lightsFlickering, birdLanded };
}
