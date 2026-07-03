import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenTransition } from './ScreenTransition';

export function Experience() {
  const [step, setStep] = useState(1);
  const [desiredContent, setDesiredContent] = useState<string>('');
  
  // Conversational questions state
  const [qStep, setQStep] = useState(0);

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        
        {/* SCREEN 1 */}
        {step === 1 && (
          <ScreenTransition keyId="s1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-8 sm:mb-12 text-white/90">
              Are you bored?
            </h1>
            <div className="flex gap-4 sm:gap-6 justify-center">
              <button 
                onClick={nextStep}
                className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                Yes
              </button>
              <button 
                onClick={nextStep}
                className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                No
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 2 */}
        {step === 2 && (
          <ScreenTransition keyId="s2">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium italic">
                84% of visitors today said they were bored.
              </p>
              <p className="text-base sm:text-lg text-white/50 max-w-sm mx-auto leading-relaxed">
                Humans often search for entertainment when they're actually searching for novelty.
              </p>
              <button 
                onClick={nextStep}
                className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Continue
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 3 */}
        {step === 3 && (
          <ScreenTransition keyId="s3">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium">
                Cats ignore approximately 93% of human requests.
              </p>
              <p className="text-base sm:text-lg text-white/50 max-w-sm mx-auto leading-relaxed">
                Boredom is often your brain asking for something unexpected.
              </p>
              <button 
                onClick={nextStep}
                className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Continue
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 4: The Interview */}
        {step === 4 && (
          <ScreenTransition keyId={`s4-q${qStep}`}>
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              {qStep === 0 && (
                <>
                  <p className="text-xl sm:text-2xl text-white/90">What time is it for you?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['Late at night', 'Middle of the day', 'Early morning'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setQStep(1)}
                        className="w-full px-4 sm:px-6 py-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qStep === 1 && (
                <>
                  <p className="text-xl sm:text-2xl text-white/90">Are you looking for comfort or distraction?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['Comfort', 'Distraction', 'I don\'t know'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setQStep(2)}
                        className="w-full px-4 sm:px-6 py-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {qStep === 2 && (
                <>
                  <p className="text-xl sm:text-2xl text-white/90">How long have you been scrolling?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['A few minutes', 'Too long', 'Just started'].map(t => (
                      <button 
                        key={t}
                        onClick={nextStep} // Moves to Screen 5 unexpectedly on click
                        className="w-full px-4 sm:px-6 py-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 5 */}
        {step === 5 && (
          <ScreenTransition keyId="s5">
            <div className="space-y-6 px-4 sm:px-0">
              <p className="text-xl sm:text-2xl text-white/90 italic">
                The cat believes this interview has become too personal.
              </p>
              <div className="pt-4 flex justify-center">
                <button 
                  onClick={nextStep}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group border border-transparent hover:border-white/10"
                  aria-label="Apologize to the cat"
                >
                  <span className="opacity-50 group-hover:opacity-100 text-xl transition-opacity">🐾</span>
                </button>
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 6 */}
        {step === 6 && (
          <ScreenTransition keyId="s6">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              <p className="text-2xl sm:text-3xl text-white/90">What do you want to hear?</p>
              <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                {['Something nice', 'Something honest', 'Something strange'].map(choice => (
                  <button 
                    key={choice}
                    onClick={() => {
                      setDesiredContent(choice);
                      nextStep();
                    }}
                    className="w-full px-4 sm:px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white/70 hover:text-white/90 text-sm sm:text-base"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 7 & OUTRO */}
        {step === 7 && (
          <ScreenTransition keyId="s7">
            <div className="space-y-8 sm:space-y-12 px-4 sm:px-0 w-full">
              <div className="space-y-3 sm:space-y-4">
                {desiredContent === 'Something nice' && (
                  <>
                    <p className="text-xl sm:text-2xl text-white/90">You probably don't need another video.</p>
                    <p className="text-lg sm:text-xl text-white/50">You probably need permission to stop searching.</p>
                  </>
                )}
                {desiredContent === 'Something honest' && (
                  <>
                    <p className="text-xl sm:text-2xl text-white/90">You may not be avoiding boredom.</p>
                    <p className="text-lg sm:text-xl text-white/50">You may be avoiding choosing what to do next.</p>
                  </>
                )}
                {desiredContent === 'Something strange' && (
                  <>
                    <p className="text-xl sm:text-2xl text-white/90">You don't sound bored.</p>
                    <p className="text-lg sm:text-xl text-white/50">You sound tired.</p>
                  </>
                )}
              </div>
              
              <div className="h-[1px] w-12 bg-white/10 mx-auto" />

              <div className="space-y-4 sm:space-y-6">
                <p className="text-xs sm:text-sm text-white/40 uppercase tracking-widest">Maybe try one of these</p>
                <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-white/60">
                  <li>Rewatch one scene from your favorite movie.</li>
                  <li>Listen to one song from childhood.</li>
                  <li>Walk around for two minutes.</li>
                  <li>Or honestly, just go to sleep.</li>
                </ul>
              </div>

              <div className="pt-8 sm:pt-12 pb-8">
                <p className="text-white/30 text-xs sm:text-sm italic">
                  Thanks for spending a minute here.
                </p>
              </div>
            </div>
          </ScreenTransition>
        )}
        
      </AnimatePresence>
    </div>
  );
}
