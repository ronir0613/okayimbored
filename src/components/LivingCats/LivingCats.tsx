import React, { useState, useEffect, useRef } from 'react';
import { LivingCat, CAT_SIZE } from './LivingCat';
import type { CatState } from './PixelCat';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper for probabilities
function pickWeighted<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const i of items) {
    if (r < i.weight) return i.item;
    r -= i.weight;
  }
  return items[items.length - 1].item;
}

export default function LivingCats() {
  const [cats, setCats] = useState<Record<string, any>>({});
  const [isPaused, setIsPaused] = useState(false);
  const catsRef = useRef<Record<string, any>>({});
  const pathChosen = useRef(false);
  const startTime = useRef(Date.now());
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  });

  // Listen to path changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePageLoad = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('astro:page-load', handlePageLoad);
    return () => {
      window.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, []);

  // Listen to global pause events
  useEffect(() => {
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);
    
    window.addEventListener('cat:pause', handlePause);
    window.addEventListener('cat:resume', handleResume);
    
    return () => {
      window.removeEventListener('cat:pause', handlePause);
      window.removeEventListener('cat:resume', handleResume);
    };
  }, []);

  // Keep ref in sync
  useEffect(() => { 
    catsRef.current = cats; 
    
    // Dispatch state for atmosphere
    const sleeping = Object.values(cats).some((c: any) => c.state?.includes('sleep'));
    const angry = Object.values(cats).some((c: any) => c.state === 'angry');
    window.dispatchEvent(new CustomEvent('cat:state_change', {
      detail: { sleeping, angry }
    }));
  }, [cats]);



  useEffect(() => {
    if (pathChosen.current) return;
    if (typeof window !== 'undefined') {
      const isTonightPage = window.location.pathname.includes('/tonight');
      const isSecretPage = ['/quiet', '/window', '/attic', '/after-hours', '/basement', '/rooftop', '/wait', '/cats', '/radio'].some(p => window.location.pathname.startsWith(p)) || document.title.toLowerCase().includes('404');
      const isPolaroid = window.location.pathname.includes('/polaroid');
      if (isTonightPage || (isSecretPage && !isPolaroid)) {
        return;
      }
    }
    pathChosen.current = true;
    
    let active = true;
    
    const controls = {
      spawn: (initial: any) => {
        if (!active) return '';
        const id = crypto.randomUUID();
        setCats(prev => ({ ...prev, [id]: { id, x: -CAT_SIZE, y: -CAT_SIZE, opacity: 1, duration: 0, state: 'idle', ...initial } }));
        return id;
      },
      update: (id: string, updates: any) => {
        if (!active) return;
        setCats(prev => {
          if (!prev[id]) return prev;
          return { ...prev, [id]: { ...prev[id], ...updates } };
        });
      },
      remove: (id: string) => {
        if (!active) return;
        setCats(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      },
      sw: () => window.innerWidth,
      sh: () => window.innerHeight,
      getPos: (elId: string) => {
        const el = document.getElementById(elId);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
      },
      waitForEvent: (eventName: string, timeoutMs: number = 0) => {
        return new Promise<boolean>((resolve) => {
          if (!active) {
            resolve(false);
            return;
          }
          let timeout: any;
          const handler = () => {
            if (timeout) clearTimeout(timeout);
            window.removeEventListener(eventName, handler);
            resolve(true);
          };
          window.addEventListener(eventName, handler);
          if (timeoutMs > 0) {
            timeout = setTimeout(() => {
              window.removeEventListener(eventName, handler);
              resolve(false);
            }, timeoutMs);
          }
        });
      }
    };

    runOrchestrator(controls, startTime.current);

    return () => {
      active = false;
    };
  }, []);

  if (currentPath.includes('/tonight')) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      {Object.values(cats).map(cat => (
        <LivingCat
          key={cat.id}
          id={cat.id}
          state={cat.state}
          x={cat.x}
          y={cat.y}
          opacity={cat.opacity}
          duration={cat.duration}
          text={cat.text}
          label={cat.label}
          isPaused={isPaused}
        />
      ))}
    </div>
  );
}

async function runOrchestrator(c: any, startupTime: number) {
  // Wait a bit before spawning anything (35-50s for normal paths)
  // But we decide the path now.
  const isPolaroid = window.location.pathname.includes('/polaroid');

  const paths = isPolaroid ? [
    { item: 'POLAROID_WALK', weight: 50 },
    { item: 'POLAROID_SIT', weight: 50 }
  ] : [
    { item: 'SLEEPER', weight: 20 },
    { item: 'WANDERER', weight: 30 },
    { item: 'OBSERVER', weight: 15 },
    { item: 'RECORD_PLAYER', weight: 10 },
    { item: 'PEEKER', weight: 15 },
    { item: 'ANGRY', weight: 3 },
    { item: 'DOUBLE', weight: 0.5 },
    { item: 'LOST', weight: 1 },
    { item: 'INSPECTOR', weight: 2 },
    { item: 'GHOST', weight: 0.2 },
    { item: '3AM', weight: new Date().getHours() === 3 ? 10 : 0 },
    { item: 'EMPLOYEE', weight: 0.05 },
    { item: 'CLOSED', weight: 0.1 },
    { item: 'JUDGE', weight: 1 },
    { item: 'ENDING', weight: 1 },
    { item: 'CAT_MODE', weight: 0.01 },
  ];

  const chosenPath = pickWeighted(paths);
  console.log('LivingCats path chosen:', chosenPath);

  // For most paths, we wait a bit so it feels accidental.
  const initialDelay = 10000 + Math.random() * 5000; // 10-15 seconds

  switch (chosenPath) {
    case 'POLAROID_WALK': {
      await wait(5000 + Math.random() * 5000); // 5-10 seconds
      const y = c.sh() - CAT_SIZE; // bottom of screen
      const startLeft = Math.random() < 0.5;
      const startX = startLeft ? -CAT_SIZE : c.sw() + CAT_SIZE;
      const endX = startLeft ? c.sw() + CAT_SIZE : -CAT_SIZE;
      
      const id = c.spawn({ x: startX, y, state: startLeft ? 'walking_right' : 'walking_left', opacity: 1 });
      await wait(100);
      
      const walkDur = Math.abs(endX - startX) / 30; // 30px/s
      c.update(id, { x: endX, duration: walkDur });
      await wait(walkDur * 1000);
      c.remove(id);
      break;
    }

    case 'POLAROID_SIT': {
      await wait(5000 + Math.random() * 5000);
      const x = c.sw() / 2 - CAT_SIZE / 2;
      const y = c.sh() - CAT_SIZE; // bottom center, below the photo
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 2 });
      await wait(2000);
      c.update(id, { state: 'idle_to_sleeping' });
      await wait(600);
      c.update(id, { state: 'sleeping' });
      // Stays sleeping
      break;
    }

    case 'SLEEPER': {
      await wait(initialDelay);
      const target = c.getPos('timestamp-widget');
      if (!target) return;
      const x = target.x + target.w / 2 - CAT_SIZE / 2;
      const y = target.y - CAT_SIZE + 12; // sit nicely on top of the widget
      
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 2 });
      await wait(2000);
      c.update(id, { state: 'idle_to_sleeping' });
      await wait(600);
      c.update(id, { state: 'sleeping' });

      // Rare event: wakes up
      if (Math.random() < 0.1) {
        await wait(60000 + Math.random() * 120000); // 1-3 mins later
        c.update(id, { state: 'sleeping_to_idle' });
        await wait(600);
        c.update(id, { state: 'idle' });
        await wait(3000);
        c.update(id, { state: 'idle_to_sleeping' });
        await wait(600);
        c.update(id, { state: 'sleeping' });
      }
      break;
    }

    case 'WANDERER': {
      await wait(initialDelay);
      const y = c.sh() - CAT_SIZE;
      const startLeft = Math.random() < 0.5;
      const startX = startLeft ? -CAT_SIZE : c.sw() + CAT_SIZE;
      const endX = startLeft ? c.sw() + CAT_SIZE : -CAT_SIZE;
      
      const id = c.spawn({ x: startX, y, state: startLeft ? 'walking_right' : 'walking_left', opacity: 1 });
      await wait(100);
      
      // walk halfway
      const midX = c.sw() / 2 + (Math.random() * 200 - 100);
      const walkDur1 = Math.abs(midX - startX) / 30; // 30px/s
      c.update(id, { x: midX, duration: walkDur1 });
      await wait(walkDur1 * 1000);
      
      // stop
      c.update(id, { state: 'idle', duration: 0 });
      await wait(4000);
      
      // rare variant: sleep
      if (Math.random() < 0.2) {
        c.update(id, { state: 'idle_to_sleeping' });
        await wait(600);
        c.update(id, { state: 'sleeping' });
        await wait(15000);
        c.update(id, { state: 'sleeping_to_idle' });
        await wait(600);
        c.update(id, { state: 'idle' });
        await wait(2000);
      }

      // continue walking
      c.update(id, { state: startLeft ? 'walking_right' : 'walking_left' });
      const walkDur2 = Math.abs(endX - midX) / 30;
      c.update(id, { x: endX, duration: walkDur2 });
      await wait(walkDur2 * 1000);
      c.remove(id);
      break;
    }

    case 'OBSERVER': {
      await wait(initialDelay);
      // Wait for statistics-content to exist
      let pos = c.getPos('statistics-content');
      while (!pos) {
        await wait(5000);
        pos = c.getPos('statistics-content');
      }
      
      const x = pos.x - CAT_SIZE; // left of stats
      const y = pos.y + pos.h / 2 - CAT_SIZE / 2;
      
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 2 });
      await wait(10000); // watch for 10s
      c.update(id, { opacity: 0, duration: 2 });
      await wait(2000);
      c.remove(id);
      break;
    }

    case 'RECORD_PLAYER': {
      await wait(initialDelay);
      const pos = c.getPos('record-player-widget');
      if (!pos) return;
      
      const y = pos.y + pos.h - CAT_SIZE + 16; // sit aligned near the bottom of the widget
      const startX = c.sw() + CAT_SIZE;
      const targetX = pos.x + pos.w / 2 - CAT_SIZE / 2;
      
      const id = c.spawn({ x: startX, y, state: 'walking_left', opacity: 1 });
      await wait(100);
      const dur = Math.abs(targetX - startX) / 30;
      c.update(id, { x: targetX, duration: dur });
      await wait(dur * 1000);
      
      c.update(id, { state: 'idle', duration: 0 });
      await wait(5000);
      
      if (Math.random() < 0.2) {
        c.update(id, { state: 'idle_to_sleeping' });
        await wait(600);
        c.update(id, { state: 'sleeping' });
        await wait(30000); // sleep for a long time
        c.update(id, { state: 'sleeping_to_idle' });
        await wait(600);
        c.update(id, { state: 'idle' });
      }

      await wait(2000);
      c.update(id, { state: 'walking_right' });
      const exitDur = Math.abs(startX - targetX) / 30;
      c.update(id, { x: startX, duration: exitDur });
      await wait(exitDur * 1000);
      c.remove(id);
      break;
    }

    case 'PEEKER': {
      await wait(initialDelay);
      const y = c.sh() - CAT_SIZE - 100;
      const startLeft = Math.random() < 0.5;
      const hiddenX = startLeft ? -CAT_SIZE + 20 : c.sw() - 20; // just barely off screen
      const peekX = startLeft ? 0 : c.sw() - CAT_SIZE;
      
      const id = c.spawn({ x: hiddenX, y, state: startLeft ? 'walking_right' : 'walking_left', opacity: 1 });
      await wait(100);
      
      c.update(id, { x: peekX, duration: 1.5 });
      await wait(1500);
      c.update(id, { state: 'idle', duration: 0 });
      await wait(2000); // look around
      
      c.update(id, { state: startLeft ? 'walking_left' : 'walking_right' });
      c.update(id, { x: hiddenX, duration: 1.5 });
      await wait(1500);
      c.remove(id);
      break;
    }

    case 'ANGRY': {
      // Wait for strange choice
      await c.waitForEvent('cat:strange_choice');
      await wait(2000);
      
      const startLeft = Math.random() < 0.5;
      const y = c.sh() - CAT_SIZE;
      const targetX = startLeft ? 50 : c.sw() - CAT_SIZE - 50;
      
      const id = c.spawn({ x: targetX, y, opacity: 0, state: 'angry' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 1 });
      await wait(2000);
      c.update(id, { text: "not listening right now.\nmildly annoyed." });
      await wait(4000);
      c.update(id, { opacity: 0, duration: 1, text: undefined });
      await wait(1000);
      c.remove(id);
      break;
    }

    case 'DOUBLE': {
      await wait(initialDelay);
      const y = c.sh() - CAT_SIZE;
      const startX1 = -CAT_SIZE;
      const startX2 = c.sw() + CAT_SIZE;
      
      const mid1 = c.sw() / 2 - CAT_SIZE;
      const mid2 = c.sw() / 2 + CAT_SIZE;
      
      const id1 = c.spawn({ x: startX1, y, state: 'walking_right' });
      const id2 = c.spawn({ x: startX2, y, state: 'walking_left' });
      
      const dur = c.sw() / 2 / 30;
      
      await wait(100);
      c.update(id1, { x: mid1, duration: dur });
      c.update(id2, { x: mid2, duration: dur });
      await wait(dur * 1000);
      
      c.update(id1, { state: 'idle', duration: 0 });
      c.update(id2, { state: 'idle', duration: 0 });
      await wait(3000); // Look at each other
      
      // One leaves
      c.update(id1, { state: 'walking_left', duration: dur, x: startX1 });
      // Other stays
      c.update(id2, { state: 'idle_to_sleeping' });
      await wait(600);
      c.update(id2, { state: 'sleeping' });
      
      await wait(dur * 1000);
      c.remove(id1);
      break;
    }

    case 'LOST': {
      await wait(initialDelay);
      const y = c.sh() - CAT_SIZE;
      const id = c.spawn({ x: -CAT_SIZE, y, state: 'walking_right' });
      
      await wait(100);
      c.update(id, { x: 200, duration: 200 / 30 });
      await wait((200 / 30) * 1000);
      
      c.update(id, { state: 'idle', duration: 0 });
      await wait(2000); // turns around (just idles for a bit)
      
      c.update(id, { state: 'walking_left' });
      c.update(id, { x: -CAT_SIZE, duration: 200 / 30 });
      await wait((200 / 30) * 1000);
      c.remove(id);
      break;
    }

    case 'INSPECTOR': {
      await wait(initialDelay);
      // Spawn, move to one spot, then another
      const id = c.spawn({ x: -CAT_SIZE, y: c.sh() - CAT_SIZE, state: 'walking_right' });
      await wait(100);
      
      const spots = [
        { x: c.sw() * 0.2, y: c.sh() - CAT_SIZE },
        { x: c.sw() * 0.8, y: c.sh() - CAT_SIZE }
      ];
      
      let currX = -CAT_SIZE;
      for (const spot of spots) {
        const dur = Math.abs(spot.x - currX) / 30;
        c.update(id, { state: spot.x > currX ? 'walking_right' : 'walking_left', x: spot.x, y: spot.y, duration: dur });
        await wait(dur * 1000);
        c.update(id, { state: 'idle', duration: 0 });
        await wait(2000); // inspect
        currX = spot.x;
      }
      
      // leave
      const dur = (c.sw() + CAT_SIZE - currX) / 30;
      c.update(id, { state: 'walking_right', x: c.sw() + CAT_SIZE, duration: dur });
      await wait(dur * 1000);
      c.remove(id);
      break;
    }

    case 'GHOST': {
      await wait(initialDelay);
      const y = c.sh() - CAT_SIZE;
      const id = c.spawn({ x: -CAT_SIZE, y, state: 'walking_right' });
      
      await wait(100);
      c.update(id, { x: c.sw() / 2, duration: (c.sw()/2 + CAT_SIZE) / 30 });
      await wait(((c.sw()/2 + CAT_SIZE) / 30) * 1000 * 0.5); // disappear halfway through walk
      
      c.update(id, { opacity: 0, duration: 0.1 }); // poof
      await wait(500);
      c.remove(id);
      break;
    }

    case '3AM': {
      // already validated it's around 3AM due to weights
      const x = c.sw() / 2 - CAT_SIZE / 2;
      const y = c.sh() - CAT_SIZE;
      const id = c.spawn({ x, y, opacity: 0, state: 'sleeping' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 3 });
      // never moves
      break;
    }

    case 'EMPLOYEE': {
      await wait(initialDelay);
      const x = c.sw() / 2 - CAT_SIZE / 2;
      const y = c.sh() - CAT_SIZE;
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 1 });
      await wait(1500);
      c.update(id, { label: "employee of the month" });
      await wait(5000);
      c.update(id, { opacity: 0, duration: 1 });
      await wait(1000);
      c.remove(id);
      break;
    }

    case 'CLOSED': {
      await wait(initialDelay);
      const x = c.sw() / 2 - CAT_SIZE / 2;
      const y = c.sh() - CAT_SIZE;
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 1 });
      await wait(2000);
      c.update(id, { text: "the website is closed.\n\nthe cat stayed anyway." });
      await wait(5000);
      c.update(id, { text: undefined, state: 'idle_to_sleeping' });
      await wait(600);
      c.update(id, { state: 'sleeping' });
      // sleeps indefinitely
      break;
    }

    case 'JUDGE': {
      // wait for "something honest"
      await c.waitForEvent('cat:honest_choice');
      await wait(2000);
      
      const x = c.sw() / 2 - CAT_SIZE / 2;
      const y = 50; // top of screen
      const id = c.spawn({ x, y, opacity: 0, state: 'idle' });
      await wait(100);
      c.update(id, { opacity: 1, duration: 2 });
      await wait(4000);
      c.update(id, { opacity: 0, duration: 2 });
      await wait(2000);
      c.remove(id);
      break;
    }

    case 'ENDING': {
      // Wait for final screen
      await c.waitForEvent('cat:final_screen');
      // Wait to ensure 3 minutes have passed since load
      const timeSpent = Date.now() - startupTime;
      if (timeSpent < 180000) {
        await wait(180000 - timeSpent); // wait until 3 mins total have passed
      }
      
      // At final screen: "thanks for spending a minute here."
      // After 10 seconds:
      await wait(10000);
      
      const y = c.sh() - CAT_SIZE - 20;
      const id = c.spawn({ x: -CAT_SIZE, y, state: 'walking_right' });
      
      await wait(100);
      const midX = c.sw() / 2 - CAT_SIZE / 2;
      const dur = (midX + CAT_SIZE) / 30;
      c.update(id, { x: midX, duration: dur });
      await wait(dur * 1000);
      
      c.update(id, { state: 'idle', duration: 0 });
      await wait(5000);
      
      c.update(id, { state: 'walking_right' });
      const dur2 = (c.sw() - midX) / 30;
      c.update(id, { x: c.sw() + CAT_SIZE, duration: dur2 });
      await wait(dur2 * 1000);
      c.remove(id);
      break;
    }

    case 'CAT_MODE': {
      await wait(initialDelay);
      const x1 = c.sw() / 2 - CAT_SIZE;
      const x2 = c.sw() / 2 + 10;
      const y = c.sh() - CAT_SIZE;
      
      const id1 = c.spawn({ x: x1, y, state: 'idle', opacity: 0 });
      const id2 = c.spawn({ x: x2, y, state: 'idle', opacity: 0 });
      
      await wait(100);
      c.update(id1, { opacity: 1, duration: 2 });
      c.update(id2, { opacity: 1, duration: 2 });
      await wait(2000);
      
      c.update(id1, { state: 'idle_to_sleeping' });
      c.update(id2, { state: 'idle_to_sleeping' });
      await wait(600);
      c.update(id1, { state: 'sleeping' });
      c.update(id2, { state: 'sleeping' });
      
      // Cat mode: nothing else happens.
      break;
    }
  }
}
