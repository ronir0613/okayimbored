import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenTransition } from './ScreenTransition';

export function Experience() {
  const [step, setStep] = useState(1);
  const [desiredContent, setDesiredContent] = useState<string>('');
  
  // Conversational questions state
  const [qStep, setQStep] = useState(0);

  // Rare events state
  const [isRareEventActive, setIsRareEventActive] = useState(false);
  const [rareEventContent, setRareEventContent] = useState<{title: string, subtitle?: string} | null>(null);
  const [hasSeenRareEvent, setHasSeenRareEvent] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  useEffect(() => {
    // Initial rare event check (3:07 AM or chance)
    const now = new Date();
    const is3AM = now.getHours() === 3 && now.getMinutes() === 7;
    const rand = Math.random();
    
    if ((is3AM || rand > 0.95) && !hasSeenRareEvent) {
      setTimeout(() => {
        setIsRareEventActive(true);
        setRareEventContent({
          title: "Congratulations.",
          subtitle: `You are today's ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} visitor.`
        });
        setHasSeenRareEvent(true);
      }, 5000); // show after 5 seconds of being on site
    }
  }, []);

  // Idle timeout
  useEffect(() => {
    if (step > 1 && step < 7 && !isRareEventActive && !hasSeenRareEvent) {
      const timer = setInterval(() => {
        if (Date.now() - lastInteraction > 45000) { // 45 seconds idle
          setIsRareEventActive(true);
          setRareEventContent({
            title: "The website has a question.",
            subtitle: "Why did you stay?"
          });
          setHasSeenRareEvent(true);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, lastInteraction, isRareEventActive, hasSeenRareEvent]);

  const handleInteraction = () => {
    setLastInteraction(Date.now());
  };

  const nextStep = () => {
    handleInteraction();
    setStep(s => s + 1);
  };

  if (isRareEventActive && rareEventContent) {
    return (
      <div className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px]" onClick={handleInteraction}>
        <AnimatePresence mode="wait">
          <ScreenTransition keyId="rare-event">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-medium">
                {rareEventContent.title}
              </p>
              {rareEventContent.subtitle && (
                <p className="text-lg sm:text-xl text-white/50">
                  {rareEventContent.subtitle}
                </p>
              )}
              <button 
                onClick={() => {
                  setIsRareEventActive(false);
                  setLastInteraction(Date.now());
                }}
                className="mt-8 text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                Return
              </button>
            </div>
          </ScreenTransition>
        </AnimatePresence>
      </div>
    );
  }

  const renderPathContent = () => {
    switch (desiredContent) {
      case 'Something nice':
        return (
          <>
            <p className="text-xl sm:text-2xl text-white/90">You don't have to make tonight productive.</p>
            <p className="text-lg sm:text-xl text-white/50">You're allowed to have a forgettable day.</p>
            <p className="text-lg sm:text-xl text-white/50 pt-2">Most evenings don't become memories.</p>
          </>
        );
      case 'Something honest':
        return (
          <>
            <p className="text-xl sm:text-2xl text-white/90">You probably didn't come here because you wanted entertainment.</p>
            <p className="text-lg sm:text-xl text-white/50">You might just be postponing tomorrow.</p>
            <p className="text-lg sm:text-xl text-white/50 pt-2">You don't need another recommendation.</p>
          </>
        );
      case 'Something strange':
        return (
          <>
            <p className="text-xl sm:text-2xl text-white/90">Do fish know when it's raining?</p>
            <p className="text-lg sm:text-xl text-white/50">Would your 12-year-old self trust you?</p>
            <p className="text-lg sm:text-xl text-white/50 pt-2">The cat has left the interview.</p>
          </>
        );
      case 'Surprise me':
        return (
          <>
            <p className="text-xl sm:text-2xl text-white/90">You have officially spent longer here than we expected.</p>
            <p className="text-lg sm:text-xl text-white/50">There are no achievements for this.</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px]"
      onClick={handleInteraction}
    >
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
                84% of visitors tonight said they were bored.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium italic pt-2">
                16% claimed they were "just checking something."
              </p>
              <p className="text-base sm:text-lg text-white/50 max-w-sm mx-auto leading-relaxed">
                We don't believe them.
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
                Nobody has ever asked the website if it's bored.
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
                        onClick={() => {
                          handleInteraction();
                          setQStep(1);
                        }}
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
                  <p className="text-xl sm:text-2xl text-white/90">Are you alone right now?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['Yes', 'No', 'Sort of'].map(t => (
                      <button 
                        key={t}
                        onClick={() => {
                          handleInteraction();
                          setQStep(2);
                        }}
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
                  <p className="text-xl sm:text-2xl text-white/90">Are you looking for comfort or distraction?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['Comfort', 'Distraction', 'I don\'t know'].map(t => (
                      <button 
                        key={t}
                        onClick={nextStep}
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
                {['Something nice', 'Something honest', 'Something strange', 'Surprise me'].map(choice => (
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
                {renderPathContent()}
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
