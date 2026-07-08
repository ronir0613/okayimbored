import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenTransition } from './ScreenTransition';
import { TarotCards } from './TarotCards';
import { ArchaeologyEvent } from './ArchaeologyEvent';
import { getRandomArtifact, type Artifact } from '../lib/archaeology';
import { PixelCat } from './LivingCats/PixelCat';
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

  // Archaeology events state
  const [isArchaeologyActive, setIsArchaeologyActive] = useState(false);
  const [archaeologyContent, setArchaeologyContent] = useState<Artifact | null>(null);

  // V4 specific state
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [stats, setStats] = useState({ boredPercentage: 84, activeVisitors: 1 });

  // False ending state
  const [falseEndingActive, setFalseEndingActive] = useState(false);
  const [falseEndingPhase, setFalseEndingPhase] = useState(0);
  const [falseEndingType, setFalseEndingType] = useState<number | null>(null);
  const [falseEndingChoice, setFalseEndingChoice] = useState<string | null>(null);
  // 1. Initial rare event check
  useEffect(() => {
    const now = new Date();
    const is3AM = now.getHours() === 3 && now.getMinutes() === 7;
    const rand = Math.random();
    
    if (is3AM || rand > 0.92) {
      setTimeout(() => {
        setIsRareEventActive(true);
        const rareEventsList = [
          { title: "Congratulations.", subtitle: `You are today's ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} visitor.` },
          { title: "The card deck is feeling chaotic today.", subtitle: "Go with it." },
          { title: "You opened this at the perfect time.", subtitle: "We don't know why, but you did." },
          { title: "The cat walked across the keyboard.", subtitle: "ajsdnfklasdjbf" },
          { title: "Something weird is about to happen.", subtitle: "Just wait." }
        ];
        setRareEventContent(rareEventsList[Math.floor(Math.random() * rareEventsList.length)]);
        setHasSeenRareEvent(true);
      }, 5000);
    }
  }, []); // Run once on mount

  // 2. Initialize session
  useEffect(() => {
    fetch('/api/session', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.message) {
          // Show country moment slightly later to not overlap
          setTimeout(() => {
            setIsRareEventActive(prev => {
              if (!prev) {
                setRareEventContent({ title: data.message });
                setHasSeenRareEvent(true);
                return true;
              }
              return prev;
            });
          }, 8000);
        }
      }).catch(console.error);
  }, []); // Run once on mount

  // 3. Fetch stats periodically and update time
  useEffect(() => {
    const fetchStats = () => {
      fetch(`/api/stats${sessionId ? `?sessionId=${sessionId}` : ''}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.boredPercentage) {
            setStats(data);
          }
        }).catch(console.error);
    };
    
    fetchStats();
    const statTimer = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(statTimer);
    };
  }, [sessionId]); // Re-run if sessionId changes (which happens once after init)

  // Idle timeout
  useEffect(() => {
    if (step > 1 && step < 8 && !isRareEventActive && !hasSeenRareEvent) {
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

  // Final screen event & False Ending logic
  useEffect(() => {
    if (step === 8) {
      window.dispatchEvent(new CustomEvent('cat:final_screen'));
      
      const isRare = Math.random() < 0.0001;
      const delay = isRare ? 30000 : 3000 + Math.random() * 7000;
      
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cat:false_ending'));
        setFalseEndingActive(true);
        if (isRare) {
          setFalseEndingType(11);
          setFalseEndingPhase(1);
        } else {
          setFalseEndingType(Math.floor(Math.random() * 10) + 1);
          setFalseEndingPhase(1);
          const thoughts = ["you probably didn't need another video.", "you stayed longer than we expected.", "thanks."];
          setFalseEndingChoice(thoughts[Math.floor(Math.random() * thoughts.length)]);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [step]);

  // False ending progression
  useEffect(() => {
    if (!falseEndingActive || !falseEndingType) return;
    
    const advance = (ms: number) => {
      const t = setTimeout(() => {
        setFalseEndingPhase(p => p + 1);
      }, ms);
      return () => clearTimeout(t);
    };

    if (falseEndingType === 1 && falseEndingPhase < 3) return advance(2500); // ACTUALLY
    if (falseEndingType === 2 && falseEndingPhase < 3) return advance(2500); // THE WEBSITE REMEMBERED
    if (falseEndingType === 3 && falseEndingPhase < 2) return advance(3000); // THE CAT OBJECTED
    if (falseEndingType === 4 && falseEndingPhase < 3) return advance(2500); // THE WEBSITE HAS A QUESTION
    if (falseEndingType === 5 && falseEndingPhase < 2) return advance(3000); // THE WEBSITE GOT LONELY
    if (falseEndingType === 6 && falseEndingPhase < 2) return advance(3000); // THE RECORD PLAYER
    if (falseEndingType === 7 && falseEndingPhase < 3) return advance(2500); // THE LAST THOUGHT
    if (falseEndingType === 8) {
      if (falseEndingPhase === 1) return advance(2000); // show buttons
      if (falseEndingPhase === 3) return advance(2500); // after interesting
    }
    if (falseEndingType === 9 && falseEndingPhase < 3) return advance(2500); // THE WEBSITE APOLOGIZES
    if (falseEndingType === 10 && falseEndingPhase < 3) return advance(2500); // THE REAL ENDING
    if (falseEndingType === 11 && falseEndingPhase < 2) return advance(4000); // Rare

  }, [falseEndingActive, falseEndingType, falseEndingPhase]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isRareEventActive) {
        document.body.classList.add('rare-event-active');
      } else {
        document.body.classList.remove('rare-event-active');
      }
    }
  }, [isRareEventActive]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isArchaeologyActive) {
        document.body.classList.add('archaeology-active');
      } else {
        document.body.classList.remove('archaeology-active');
      }
    }
  }, [isArchaeologyActive]);

  const handleInteraction = (stepName?: string, value?: string) => {
    setLastInteraction(Date.now());
    if (sessionId && stepName && value) {
      fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, stepName, value })
      })
      .then(res => res.json())
      .then(data => {
        if (data.trace && !isRareEventActive && !hasSeenRareEvent && Math.random() > 0.6) {
          // Occasional live trace popup
          setTimeout(() => {
            setIsRareEventActive(true);
            setRareEventContent({ title: data.trace, subtitle: "We thought you should know." });
            setHasSeenRareEvent(true);
          }, 3000);
        }
      })
      .catch(console.error);
    }
  };

  const nextStep = () => {
    handleInteraction();

    // Occasional internet archaeology interruption (5% chance)
    if (step > 1 && step < 7 && !isRareEventActive && !isArchaeologyActive && Math.random() < 0.05) {
      setArchaeologyContent(getRandomArtifact());
      setIsArchaeologyActive(true);
    }

    setStep(s => s + 1);
  };

  if (isRareEventActive && rareEventContent) {
    return (
      <div className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px] px-4" onClick={() => handleInteraction()}>
        <AnimatePresence mode="wait">
          <ScreenTransition key="rare-event" keyId="rare-event">
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

  if (isArchaeologyActive && archaeologyContent) {
    return (
      <ArchaeologyEvent 
        artifact={archaeologyContent} 
        onReturn={() => {
          setIsArchaeologyActive(false);
          setLastInteraction(Date.now());
        }} 
      />
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

  if (falseEndingActive && falseEndingType) {
    let content = [];
    const motionProps = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 1.5, ease: "easeOut" }
    };
    
    if (falseEndingType === 1) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>actually.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>one more thing.</motion.p>);
    } else if (falseEndingType === 2) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>wait.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>we forgot something.</motion.p>);
    } else if (falseEndingType === 3) {
      if (falseEndingPhase >= 1) {
        content.push(<motion.p key="1" {...motionProps}>the cat disagrees.</motion.p>);
        content.push(
          <motion.div key="cat" {...motionProps} transition={{ duration: 2, delay: 0.5 }} className="mt-12 flex justify-center w-full">
            <div className="w-16 h-16 opacity-70 transform -scale-x-100">
              <PixelCat state="idle" duration={0} />
            </div>
          </motion.div>
        );
      }
    } else if (falseEndingType === 4) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>before you go.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>can we ask something?</motion.p>);
    } else if (falseEndingType === 5) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>it's quiet tonight.</motion.p>);
    } else if (falseEndingType === 6) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>the record is still playing.</motion.p>);
    } else if (falseEndingType === 7) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>one last thought.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>{falseEndingChoice || "thanks."}</motion.p>);
    } else if (falseEndingType === 8) {
      if (falseEndingPhase >= 1 && falseEndingPhase < 3) content.push(<motion.p key="1" {...motionProps}>are you still here?</motion.p>);
      if (falseEndingPhase === 2) {
        content.push(
          <motion.div key="btns" {...motionProps} className="flex flex-col gap-3 mt-8 items-center">
            {['yes', 'unfortunately', 'apparently'].map(b => (
              <button key={b} onClick={() => setFalseEndingPhase(3)} className="px-6 py-3 rounded-full hover:bg-white/5 transition-all text-white/50 hover:text-white text-sm sm:text-base tracking-wide">
                {b}
              </button>
            ))}
          </motion.div>
        );
      }
      if (falseEndingPhase >= 3) {
        content.push(<motion.p key="3" {...motionProps}>interesting.</motion.p>);
      }
    } else if (falseEndingType === 9) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>sorry.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>we're not very good at endings.</motion.p>);
    } else if (falseEndingType === 10) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>okay.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>this one is real.</motion.p>);
    } else if (falseEndingType === 11) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>thank you for waiting.</motion.p>);
    }

    const showLogbookLink = 
      (falseEndingType === 8 && falseEndingPhase >= 3) ||
      ([3, 5, 6, 11].includes(falseEndingType) && falseEndingPhase >= 1) ||
      ([1, 2, 4, 7, 9, 10].includes(falseEndingType) && falseEndingPhase >= 2);

    return (
      <div 
        className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px]"
        onClick={() => handleInteraction()}
      >
        <div className="space-y-8 sm:space-y-12 text-center text-xl sm:text-2xl md:text-3xl text-white/90 font-medium tracking-tight px-4 w-full">
          {content}
          
          {showLogbookLink && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
              className="pt-4"
            >
              <a 
                href="/tonight" 
                className="inline-block text-xs text-white/30 hover:text-white/70 border border-white/10 hover:border-white/30 rounded-full px-4 py-2 tracking-wider font-mono uppercase transition-colors duration-300"
              >
                Read tonight's logbook
              </a>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full max-w-lg mx-auto relative flex items-center justify-center min-h-[400px] px-4"
      onClick={() => handleInteraction()}
    >
      <AnimatePresence mode="wait">
        
        {/* SCREEN 1 */}
        {step === 1 && (
          <ScreenTransition key="s1" keyId="s1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-8 sm:mb-12 text-white/90">
              Are you bored?
            </h1>
            <div className="flex gap-4 sm:gap-6 justify-center">
              <button 
                onClick={() => {
                  handleInteraction('are_you_bored', 'Yes');
                  nextStep();
                }}
                className="px-6 py-2 rounded-full hover:bg-white/5 transition-all duration-300 text-white/70 hover:text-white"
              >
                Yes
              </button>
              <button 
                onClick={() => {
                  handleInteraction('are_you_bored', 'No');
                  nextStep();
                }}
                className="px-6 py-2 rounded-full hover:bg-white/5 transition-all duration-300 text-white/70 hover:text-white"
              >
                No
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 2 */}
        {step === 2 && (
          <ScreenTransition key="s2" keyId="s2">
            <div id="statistics-content" className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium italic">
                {stats.boredPercentage}% of visitors tonight said they were bored.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium italic pt-2">
                {100 - stats.boredPercentage}% claimed they were "just checking something."
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
          <ScreenTransition key="s3" keyId="s3">
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
          <ScreenTransition key={`s4-q${qStep}`} keyId={`s4-q${qStep}`}>
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              {qStep === 0 && (
                <>
                  <p className="text-xl sm:text-2xl text-white/90">What time is it for you?</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                    {['Late at night', 'Middle of the day', 'Early morning'].map(t => (
                      <button 
                        key={t}
                        onClick={() => {
                          handleInteraction('time_of_day', t);
                          setQStep(1);
                        }}
                        className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
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
                          handleInteraction('alone', t);
                          setQStep(2);
                        }}
                        className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
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
                        onClick={() => {
                          handleInteraction('seeking', t);
                          nextStep();
                        }}
                        className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
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
          <ScreenTransition key="s5" keyId="s5">
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

        {/* SCREEN 6: Tarot Cards */}
        {step === 6 && (
          <ScreenTransition key="s6-cards" keyId="s6-cards">
            <TarotCards onComplete={nextStep} sessionId={sessionId} />
          </ScreenTransition>
        )}

        {/* SCREEN 7 */}
        {step === 7 && (
          <ScreenTransition key="s7" keyId="s7">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              <p className="text-sm sm:text-base text-white/50 italic mb-2">The card chose you. Now you choose.</p>
              <p className="text-2xl sm:text-3xl text-white/90">What do you want to hear?</p>
              <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                {['Something nice', 'Something honest', 'Something strange', 'Surprise me'].map(choice => (
                  <button 
                    key={choice}
                    onClick={() => {
                      if (choice === 'Something honest') {
                        window.dispatchEvent(new CustomEvent('cat:honest_choice'));
                      }
                      if (choice === 'Something strange') {
                        window.dispatchEvent(new CustomEvent('cat:strange_choice'));
                      }
                      handleInteraction('desired_content', choice);
                      setDesiredContent(choice);
                      nextStep();
                    }}
                    className="w-full px-4 sm:px-6 py-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white/70 hover:text-white/90 text-sm sm:text-base"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 8 & OUTRO */}
        {step === 8 && (
          <ScreenTransition key="s8" keyId="s8">
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

              <div className="pt-8 sm:pt-12 pb-8 flex flex-col items-center gap-4 text-center">
                <p className="text-white/30 text-xs sm:text-sm italic">
                  Thanks for spending a minute here.
                </p>
                <motion.a 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  whileHover={{ opacity: 0.8, borderColor: 'rgba(255,255,255,0.3)' }}
                  transition={{ duration: 2, delay: 1 }}
                  href="/tonight" 
                  className="mt-2 text-xs text-white border border-white/10 rounded-full px-4 py-2 tracking-wider font-mono uppercase"
                >
                  Read tonight's logbook
                </motion.a>
              </div>
            </div>
          </ScreenTransition>
        )}
        
      </AnimatePresence>
    </div>
  );
}
