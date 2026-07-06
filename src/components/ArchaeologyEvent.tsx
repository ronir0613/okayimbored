import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScreenTransition } from './ScreenTransition';
import type { Artifact } from '../lib/archaeology';

interface Props {
  artifact: Artifact;
  onReturn: () => void;
}

export function ArchaeologyEvent({ artifact, onReturn }: Props) {
  const [step, setStep] = useState(0); // 0: interrupt, 1: content, 2: follow-up
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const d = new Date();
    setTimestamp(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString());
  }, []);

  useEffect(() => {
    // Sequence the event
    const t1 = setTimeout(() => setStep(1), 2500); // Wait 2.5s on "internet artifact discovered"
    return () => clearTimeout(t1);
  }, []);

  const handleNext = () => {
    if (step === 1 && artifact.followUp) {
      setStep(2);
    } else {
      onReturn();
    }
  };

  const handleOption = () => {
    setStep(2);
  };

  return (
    <div className="w-full h-full max-w-2xl mx-auto relative flex flex-col items-center justify-center min-h-[400px] crt-flicker">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <ScreenTransition keyId="arch-intro">
            <p className="text-sm sm:text-base text-white/40 tracking-[0.2em] uppercase font-mono">
              internet artifact discovered.
            </p>
          </ScreenTransition>
        )}

        {step === 1 && (
          <ScreenTransition keyId="arch-content">
            <div className="space-y-12 px-8 sm:px-16 w-full text-center flex flex-col items-center">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-white/20 font-mono tracking-widest uppercase">
                  Log_{timestamp}
                </p>
                <div className="h-[1px] w-8 bg-white/10 mx-auto" />
              </div>
              
              <div className="py-8 w-full max-w-md mx-auto">
                {artifact.category === 'memory' ? (
                  <div className="space-y-10 w-full">
                    <p className="text-xl sm:text-2xl text-white/90 whitespace-pre-wrap leading-relaxed font-serif">
                      {artifact.content}
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                      {artifact.options?.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={handleOption}
                          className="w-full px-4 sm:px-6 py-3 rounded-none border border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm font-mono"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12 w-full cursor-pointer" onClick={handleNext}>
                    <p className="text-xl sm:text-3xl text-white/90 whitespace-pre-wrap leading-loose font-serif">
                      {artifact.content}
                    </p>
                    <div className="pt-4 opacity-50 hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white/30 tracking-widest uppercase">click to continue</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScreenTransition>
        )}

        {step === 2 && (
          <ScreenTransition keyId="arch-followup">
            <div className="space-y-12 px-8 sm:px-16 w-full text-center cursor-pointer" onClick={onReturn}>
              <p className="text-lg sm:text-xl text-white/50 italic font-serif">
                {artifact.category === 'memory' && artifact.followUpResponses 
                  ? artifact.followUpResponses[Math.floor(Math.random() * artifact.followUpResponses.length)]
                  : artifact.followUp}
              </p>
              <div className="pt-8">
                <button className="text-xs text-white/30 hover:text-white/60 tracking-widest uppercase transition-colors">
                  Return
                </button>
              </div>
            </div>
          </ScreenTransition>
        )}
      </AnimatePresence>
    </div>
  );
}
