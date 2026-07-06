import React, { useEffect, useState, useRef } from 'react';

export default function Atmosphere() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const cursorRef = useRef({ x: -100, y: -100 });

  // Time & Cat states
  const [timeFilter, setTimeFilter] = useState('');
  const [catTemperature, setCatTemperature] = useState('');
  const [falseEndingFilter, setFalseEndingFilter] = useState('');

  // 1. Cursor Light
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animationFrameId: number;
    const updateCursor = () => {
      setCursorPos(prev => {
        const dx = cursorRef.current.x - prev.x;
        const dy = cursorRef.current.y - prev.y;
        return {
          x: prev.x + dx * 0.1, // slight interpolation delay
          y: prev.y + dy * 0.1
        };
      });
      animationFrameId = requestAnimationFrame(updateCursor);
    };
    updateCursor();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Time Changes
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 1 && hour < 3) {
        setTimeFilter('brightness(0.9)'); 
      } else if (hour >= 3 && hour < 5) {
        setTimeFilter('sepia(0.2) hue-rotate(180deg) brightness(0.95)');
      } else if (hour >= 5 && hour < 7) {
        setTimeFilter('sepia(0.3) hue-rotate(-20deg)'); 
      } else {
        setTimeFilter('');
      }
    };
    updateTime(); 
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. Cat Atmosphere
  useEffect(() => {
    const handleCatState = (e: any) => {
      const { sleeping, angry } = e.detail;
      if (angry) {
        setCatTemperature('hue-rotate(10deg) saturate(0.9)'); 
      } else if (sleeping) {
        setCatTemperature('sepia(0.1) saturate(1.1)'); 
      } else {
        setCatTemperature('');
      }
    };
    window.addEventListener('cat:state_change', handleCatState);
    return () => window.removeEventListener('cat:state_change', handleCatState);
  }, []);

  // 3.5 False Ending Atmosphere
  useEffect(() => {
    const handleFalseEnding = () => {
      setFalseEndingFilter('brightness(0.6) contrast(1.1)');
      document.body.classList.add('false-ending-active');
      window.dispatchEvent(new CustomEvent('cat:pause'));
    };
    window.addEventListener('cat:false_ending', handleFalseEnding);
    return () => window.removeEventListener('cat:false_ending', handleFalseEnding);
  }, []);

  // Apply filters to body
  useEffect(() => {
    const filters = [timeFilter, catTemperature, falseEndingFilter].filter(Boolean).join(' ');
    document.body.style.filter = filters;
  }, [timeFilter, catTemperature, falseEndingFilter]);

  // 4. Website Blinks
  useEffect(() => {
    let timeoutId: number;
    const scheduleBlink = () => {
      const nextBlink = 120000 + Math.random() * 180000; // 2-5 mins
      timeoutId = window.setTimeout(() => {
        document.body.style.opacity = '0.97';
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 50 + Math.random() * 50); // 50-100ms blink duration
        scheduleBlink();
      }, nextBlink);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {/* Film Grain: Very subtle 1-2% opacity, slowly animated via CSS */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.015] mix-blend-overlay animate-[grain_8s_steps(10)_infinite]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Cursor Light */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full mix-blend-screen"
        style={{
          width: '64px',
          height: '64px',
          left: `${cursorPos.x - 32}px`,
          top: `${cursorPos.y - 32}px`,
          background: 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 70%)',
          willChange: 'left, top'
        }}
      />
    </>
  );
}
