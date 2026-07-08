import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getRandomQuestion, getRandomResponse, type CuriosityQuestion } from '../lib/curiosity';

type CuriosityState = 'idle' | 'asking_permission' | 'asking_question' | 'responding' | 'rare_pause';

export default function CuriosityEvent() {
  const [status, setStatus] = useState<CuriosityState>('idle');
  const [question, setQuestion] = useState<CuriosityQuestion | null>(null);
  const [response, setResponse] = useState<string>('');
  const hasTriggeredRef = useRef(false);

  // 1.5% chance to trigger on interaction, low chance on idle
  const INTERACTION_PROBABILITY = 0.015; 
  const IDLE_PROBABILITY = 0.005;

  useEffect(() => {
    // 1. Listen for global clicks to potentially trigger the event
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't trigger if already active
      if (status !== 'idle' || hasTriggeredRef.current) return;
      
      // Check if we are on the tonight page
      const isTonightPage = typeof window !== 'undefined' && window.location.pathname.includes('/tonight');
      if (isTonightPage) return;
      
      // Don't intercept clicks inside the curiosity event itself
      const target = e.target as HTMLElement;
      if (target.closest('#curiosity-container')) return;

      if (Math.random() < INTERACTION_PROBABILITY) {
        // We intercepted a click! 
        // Stop propagation if we want it to feel like it interrupted them mid-action
        e.stopPropagation();
        triggerCuriosity();
      }
    };

    // Use capture phase to intercept before React handlers
    document.addEventListener('click', handleGlobalClick, { capture: true });

    // 2. Also check periodically if they are just idling
    const idleCheck = setInterval(() => {
      if (status !== 'idle' || hasTriggeredRef.current) return;
      
      const isTonightPage = typeof window !== 'undefined' && window.location.pathname.includes('/tonight');
      if (isTonightPage) return;

      if (Math.random() < IDLE_PROBABILITY) {
        triggerCuriosity();
      }
    }, 10000); // Check every 10 seconds (for testing, usually 30s)

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      clearInterval(idleCheck);
    };
  }, [status]);

  const triggerCuriosity = () => {
    if (typeof document !== 'undefined') {
      if (
        document.body.classList.contains('rare-event-active') ||
        document.body.classList.contains('archaeology-active') ||
        document.body.classList.contains('false-ending-active')
      ) {
        return;
      }
    }

    hasTriggeredRef.current = true;
    
    // Pause cats
    window.dispatchEvent(new CustomEvent('cat:pause'));
    
    setQuestion(getRandomQuestion());
    setStatus('asking_permission');
  };

  const endCuriosity = () => {
    setStatus('idle');
    // Resume cats
    window.dispatchEvent(new CustomEvent('cat:resume'));
  };

  const handlePermission = () => {
    setStatus('asking_question');
  };

  const handleAnswer = () => {
    setResponse(getRandomResponse());
    setStatus('responding');
    
    // 0.1% Rare event check
    if (Math.random() < 0.001) {
      setTimeout(() => {
        setStatus('rare_pause');
        setTimeout(() => {
          endCuriosity();
        }, 3000);
      }, 1500);
    } else {
      setTimeout(() => {
        endCuriosity();
      }, 2500);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePageLoad = () => {
      if (window.location.pathname.includes('/tonight') && status !== 'idle') {
        setStatus('idle');
      }
    };
    window.addEventListener('astro:page-load', handlePageLoad);
    return () => {
      window.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div 
      id="curiosity-container"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      style={{
        fontFamily: "'Space Mono', monospace"
      }}
    >
      <AnimatePresence mode="wait">
        
        {status === 'asking_permission' && (
          <motion.div
            key="permission"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center max-w-md w-full"
          >
            <p className="text-white/80 text-xl sm:text-2xl mb-12 text-center leading-relaxed">
              can we ask you something?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full">
              {['yes', 'okay', 'i guess'].map(btn => (
                <button
                  key={btn}
                  onClick={handlePermission}
                  className="px-6 py-3 rounded-xl hover:bg-white/5 transition-all duration-500 text-white/50 hover:text-white/90 text-sm tracking-widest lowercase"
                >
                  {btn}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {status === 'asking_question' && question && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center max-w-md w-full"
          >
            <p className="text-white/90 text-xl sm:text-2xl mb-12 text-center leading-relaxed whitespace-pre-wrap">
              {question.text}
            </p>
            <div className="flex flex-col gap-3 w-full">
              {question.options.map(opt => (
                <button
                  key={opt}
                  onClick={handleAnswer}
                  className="w-full px-6 py-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 text-white/60 hover:text-white/90 text-sm tracking-widest"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {status === 'responding' && (
          <motion.div
            key="responding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <p className="text-white/70 text-lg sm:text-xl italic">
              {response}
            </p>
          </motion.div>
        )}
        
        {status === 'rare_pause' && (
          <motion.div
            key="rare_pause"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="flex flex-col items-center"
          >
            {/* The screen just remains empty with the dark backdrop for 3 seconds */}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
