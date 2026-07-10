import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenTransition } from './ScreenTransition';
import { TarotCards } from './TarotCards';
import { ArchaeologyEvent } from './ArchaeologyEvent';
import { getRandomArtifact, type Artifact } from '../lib/archaeology';
import { PixelCat } from './LivingCats/PixelCat';
import { navigate } from 'astro:transitions/client';

export function Experience() {
  const [step, setStep] = useState(1);
  
  // Conversational questions state (V26)
  const [opening, setOpening] = useState<{text: string, options: string[]} | null>(null);
  const [statisticTemplate, setStatisticTemplate] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<{text: string, options: {text: string, reaction: string}[]}[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);
  const [breathingSpace, setBreathingSpace] = useState<string>('');
  const [timeCaption, setTimeCaption] = useState<string>('');

  // Rare events state
  const [isRareEventActive, setIsRareEventActive] = useState(false);
  const [rareEventContent, setRareEventContent] = useState<{title: string, subtitle?: string, isMono?: boolean} | null>(null);
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

  // --- V12 STATE PRESERVATION START ---
  // Load state on mount if returning from a secret room
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const isReturning = sessionStorage.getItem('okayimbored_returning_from_secret') === 'true';
      if (isReturning) {
        sessionStorage.removeItem('okayimbored_returning_from_secret');
        try {
          const saved = sessionStorage.getItem('okayimbored_state');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.step === 'number') setStep(parsed.step);
            if (parsed.falseEndingActive !== undefined) setFalseEndingActive(parsed.falseEndingActive);
            if (parsed.falseEndingPhase !== undefined) setFalseEndingPhase(parsed.falseEndingPhase);
            if (parsed.falseEndingType !== undefined) setFalseEndingType(parsed.falseEndingType);
            if (parsed.falseEndingChoice !== undefined) setFalseEndingChoice(parsed.falseEndingChoice);
            if (parsed.opening) setOpening(parsed.opening);
            if (parsed.statisticTemplate) setStatisticTemplate(parsed.statisticTemplate);
            if (parsed.selectedQuestions) setSelectedQuestions(parsed.selectedQuestions);
            if (parsed.reactions) setReactions(parsed.reactions);
            if (parsed.breathingSpace) setBreathingSpace(parsed.breathingSpace);
            if (parsed.timeCaption) setTimeCaption(parsed.timeCaption);
          }
        } catch (e) {
          console.error('Failed to restore state', e);
        }
      }
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('okayimbored_state', JSON.stringify({
        step,
        falseEndingActive,
        falseEndingPhase,
        falseEndingType,
        falseEndingChoice,
        opening,
        statisticTemplate,
        selectedQuestions,
        reactions,
        breathingSpace,
        timeCaption
      }));
    }
  }, [step, falseEndingActive, falseEndingPhase, falseEndingType, falseEndingChoice, opening, statisticTemplate, selectedQuestions, reactions, breathingSpace, timeCaption]);
  // --- V12 STATE PRESERVATION END ---

  // --- V26 CONVERSATION SETUP START ---
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const isReturning = sessionStorage.getItem('okayimbored_returning_from_secret') === 'true';
      const hasSavedState = !!sessionStorage.getItem('okayimbored_state');
      if (isReturning && hasSavedState) {
        return; // Don't re-roll if we are restoring state
      }
    }

    const openings = [
      { text: "Are you bored?", options: ["Yes.", "No.", "Sort of."] },
      { text: "Been here a while?", options: ["Yes.", "Not really.", "Time is blurred."] },
      { text: "A quiet moment?", options: ["Very.", "Not quite.", "Trying to find one."] },
      { text: "Taking a break?", options: ["Yes.", "Not really.", "From everything."] },
      { text: "Avoiding something?", options: ["Maybe.", "Yes.", "No."] },
      { text: "Just passing through?", options: ["Yes.", "Probably.", "We'll see."] },
      { text: "Need a minute?", options: ["Yes.", "Take your time.", "I have plenty."] },
      { text: "Looking for something?", options: ["Yes.", "No.", "Not sure."] },
      { text: "You found us.", options: ["I did.", "Where is this?", "By accident."] },
      { text: "Hello.", options: ["Hi.", "Hey.", "..."] },
      { text: "Come in.", options: ["Okay.", "Thanks.", "..."] },
      { text: "Well... you're here.", options: ["I am.", "True.", "..."] },
      { text: "One minute?", options: ["Sure.", "Okay.", "Make it quick."] },
      { text: "Let's start somewhere simple.", options: ["Okay.", "Go ahead.", "..."] }
    ];

    const statsTemplates = [
      "{boredPercentage}% of visitors recently said they were procrastinating.",
      "{boredPercentage}% chose comfort.",
      "Most visitors arrived here by accident.",
      "{activeVisitors} people are still wandering around.",
      "{boredPercentage}% said they stayed longer than they expected."
    ];

    const questionsPool = [
      {
        text: "How's your energy right now?",
        options: [
          { text: "Wide awake.", reaction: "Good." },
          { text: "Running on fumes.", reaction: "I had a feeling." },
          { text: "Somewhere in between.", reaction: "Fair enough." }
        ]
      },
      {
        text: "What sounds good right now?",
        options: [
          { text: "Music.", reaction: "I'll turn it up." },
          { text: "Silence.", reaction: "Understood." },
          { text: "Rain.", reaction: "Good choice." }
        ]
      },
      {
        text: "How did you end up here?",
        options: [
          { text: "By accident.", reaction: "Happy accidents." },
          { text: "Someone sent me.", reaction: "Tell them hello." },
          { text: "No idea.", reaction: "That's a surprisingly common answer." }
        ]
      },
      {
        text: "If this moment had a soundtrack...",
        options: [
          { text: "Quiet.", reaction: "Nice." },
          { text: "Loud.", reaction: "Bold." },
          { text: "Static.", reaction: "Comforting." }
        ]
      },
      {
        text: "What's been on your mind today?",
        options: [
          { text: "Too much.", reaction: "Let it go for a minute." },
          { text: "Nothing really.", reaction: "Lucky you." },
          { text: "I'd rather not say.", reaction: "That's fine." }
        ]
      },
      {
        text: "How long do you think you'll stay?",
        options: [
          { text: "About a minute.", reaction: "We'll be quick." },
          { text: "Longer than planned.", reaction: "Take your time." },
          { text: "No idea.", reaction: "Fair enough." }
        ]
      },
      {
        text: "Have you looked outside recently?",
        options: [
          { text: "Yes.", reaction: "Good." },
          { text: "No.", reaction: "Maybe you should." },
          { text: "There are no windows.", reaction: "Ah." }
        ]
      }
    ];

    const spaces = [
      "The cat disagrees.",
      "...",
      "Anyway.",
      "The record is still spinning.",
      "We almost forgot what we were asking.",
      "The cat walked across the keyboard again."
    ];

    const timeCaptions = [
      "That's usually when people start opening random websites.",
      "Time moves at its own pace here.",
      "You could be doing something else right now.",
      "We were just wondering when someone would show up.",
      "It's a good time to take a breath.",
      "Nothing urgent is happening right now."
    ];

    setOpening(openings[Math.floor(Math.random() * openings.length)]);
    setStatisticTemplate(statsTemplates[Math.floor(Math.random() * statsTemplates.length)]);
    setBreathingSpace(spaces[Math.floor(Math.random() * spaces.length)]);
    setTimeCaption(timeCaptions[Math.floor(Math.random() * timeCaptions.length)]);
    
    const shuffledQs = [...questionsPool].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffledQs.slice(0, 3));
  }, []);
  // --- V26 CONVERSATION SETUP END ---

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
          { title: "The cat walked across the keyboard.", subtitle: Array.from({length: 12 + Math.floor(Math.random() * 8)}, () => "qwertyuiopasdfghjklzxcvbnm1234567890,./;'[]"[Math.floor(Math.random() * 41)]).join(''), isMono: true },
          { title: "Something weird is about to happen.", subtitle: "Just wait." }
        ];
        setRareEventContent(rareEventsList[Math.floor(Math.random() * rareEventsList.length)]);
        setHasSeenRareEvent(true);
      }, 5000);
    }
  }, []); // Run once on mount

  // Midnight check for After Hours secret room
  useEffect(() => {
    const now = new Date();
    const isLateNight = now.getHours() >= 0 && now.getHours() < 6;
    if (isLateNight && Math.random() < 0.05) { // 5% chance on mount if late night
      const t = setTimeout(() => {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('okayimbored_returning_from_secret', 'true');
        navigate('/after-hours');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

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
    if (step > 1 && step < 10 && !isRareEventActive && !hasSeenRareEvent) {
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
    if (step === 10) {
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

    // Random secret room discovery (0.8% chance)
    if (step > 1 && step < 10 && Math.random() < 0.008) {
      const secretRooms = ['/quiet', '/window', '/attic', '/basement', '/rooftop', '/wait', '/radio'];
      const randomRoom = secretRooms[Math.floor(Math.random() * secretRooms.length)];
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('okayimbored_returning_from_secret', 'true');
      navigate(randomRoom);
      return;
    }

    // Occasional internet archaeology interruption (5% chance)
    if (step > 1 && step < 9 && !isRareEventActive && !isArchaeologyActive && Math.random() < 0.05) {
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
                <p className={`text-lg sm:text-xl text-white/50 ${rareEventContent.isMono ? 'font-mono tracking-widest break-all' : ''}`}>
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



  if (falseEndingActive && falseEndingType) {
    let content: any[] = [];
    const motionProps = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 1.5, ease: "easeOut" as const }
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
              <PixelCat state="idle" />
            </div>
          </motion.div>
        );
      }
    } else if (falseEndingType === 4) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>before you go.</motion.p>);
      if (falseEndingPhase >= 2) content.push(<motion.p key="2" {...motionProps}>can we ask something?</motion.p>);
    } else if (falseEndingType === 5) {
      if (falseEndingPhase >= 1) content.push(<motion.p key="1" {...motionProps}>it's quiet in here.</motion.p>);
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
                Read the logbook
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
        
        {/* SCREEN 1: Opening */}
        {step === 1 && opening && (
          <ScreenTransition key="s1" keyId="s1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-8 sm:mb-12 text-white/90">
              {opening.text}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              {opening.options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => {
                    handleInteraction('opening', opt);
                    nextStep();
                  }}
                  className="px-6 py-3 sm:py-2 rounded-full hover:bg-white/5 transition-all duration-300 text-white/70 hover:text-white"
                >
                  {opt}
                </button>
              ))}
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 2: Statistic */}
        {step === 2 && (
          <ScreenTransition key="s2" keyId="s2">
            <div id="statistics-content" className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium italic">
                {statisticTemplate.replace('{boredPercentage}', String(stats.boredPercentage)).replace('{activeVisitors}', String(stats.activeVisitors))}
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

        {/* SCREEN 3: Observation */}
        {step === 3 && (
          <ScreenTransition key="s3" keyId="s3">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium">
                It's {new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} where you are.
              </p>
              <p className="text-base sm:text-lg text-white/50 max-w-sm mx-auto leading-relaxed">
                {timeCaption}
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

        {/* SCREEN 4: Question 1 */}
        {step === 4 && selectedQuestions.length > 0 && (
          <ScreenTransition key="s4" keyId="s4">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              <p className="text-xl sm:text-2xl text-white/90">{selectedQuestions[0].text}</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                {selectedQuestions[0].options.map(opt => (
                  <button 
                    key={opt.text}
                    onClick={() => {
                      setReactions(prev => { const n = [...prev]; n[0] = opt.reaction; return n; });
                      handleInteraction('q1', opt.text);
                      nextStep();
                    }}
                    className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 5: Reaction 1 */}
        {step === 5 && (
          <ScreenTransition key="s5" keyId="s5">
            <div className="space-y-6 sm:space-y-12 px-4 sm:px-0">
              <p className="text-xl sm:text-2xl text-white/90 italic">
                {reactions[0]}
              </p>
              <p className="text-base sm:text-lg text-white/50 pt-4">
                {breathingSpace}
              </p>
              <button 
                onClick={nextStep}
                className="mt-6 sm:mt-8 text-xs sm:text-sm text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest block mx-auto"
              >
                Continue
              </button>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 6: Question 2 */}
        {step === 6 && selectedQuestions.length > 1 && (
          <ScreenTransition key="s6" keyId="s6">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              <p className="text-xl sm:text-2xl text-white/90">{selectedQuestions[1].text}</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                {selectedQuestions[1].options.map(opt => (
                  <button 
                    key={opt.text}
                    onClick={() => {
                      setReactions(prev => { const n = [...prev]; n[1] = opt.reaction; return n; });
                      handleInteraction('q2', opt.text);
                      nextStep();
                    }}
                    className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 7: Reaction 2 + Cat */}
        {step === 7 && (
          <ScreenTransition key="s7" keyId="s7">
            <div className="space-y-6 px-4 sm:px-0">
              <p className="text-xl sm:text-2xl text-white/90 italic">
                {reactions[1]}
              </p>
              <p className="text-base sm:text-lg text-white/50 pt-4 max-w-sm mx-auto">
                The cat believes this conversation has become too personal.
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

        {/* SCREEN 8: Question 3 */}
        {step === 8 && selectedQuestions.length > 2 && (
          <ScreenTransition key="s8" keyId="s8">
            <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 w-full">
              <p className="text-xl sm:text-2xl text-white/90">{selectedQuestions[2].text}</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                {selectedQuestions[2].options.map(opt => (
                  <button 
                    key={opt.text}
                    onClick={() => {
                      handleInteraction('q3', opt.text);
                      nextStep();
                    }}
                    className="w-full px-4 sm:px-6 py-3 rounded-xl hover:bg-white/5 transition-all text-white/60 hover:text-white/90 text-sm sm:text-base"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </ScreenTransition>
        )}

        {/* SCREEN 9: Tarot Cards */}
        {step === 9 && (
          <ScreenTransition key="s9-cards" keyId="s9-cards">
            <TarotCards onComplete={nextStep} sessionId={sessionId} />
          </ScreenTransition>
        )}

        {/* SCREEN 10: Outro */}
        {step === 10 && (
          <ScreenTransition key="s10" keyId="s10">
            <div className="space-y-8 sm:space-y-12 px-4 sm:px-0 w-full text-center">

              <div className="space-y-4 sm:space-y-6">
                <p className="text-xs sm:text-sm text-white/40 uppercase tracking-widest">Maybe try one of these</p>
                <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-white/60">
                  <li>Rewatch one scene from your favorite movie.</li>
                  <li>Listen to one song from childhood.</li>
                  <li>Walk around for two minutes.</li>
                  <li>Or honestly, just go to sleep.</li>
                  <li className="text-[10px] text-white/10 hover:text-white/35 transition-colors pt-2 flex flex-wrap gap-1 justify-center">
                    <a onClick={(e) => { e.preventDefault(); if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('okayimbored_returning_from_secret', 'true'); navigate('/rooftop'); }} href="/rooftop" className="hover:underline cursor-pointer">Climb to the roof.</a> 
                    <span>or</span> 
                    <a onClick={(e) => { e.preventDefault(); if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('okayimbored_returning_from_secret', 'true'); navigate('/wait'); }} href="/wait" className="hover:underline cursor-pointer">wait here.</a>
                    <span>or</span>
                    <a onClick={(e) => { e.preventDefault(); if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('okayimbored_returning_from_secret', 'true'); navigate('/polaroid'); }} href="/polaroid" className="hover:underline cursor-pointer">find a picture.</a>
                  </li>
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
                  Read the logbook
                </motion.a>
              </div>
            </div>
          </ScreenTransition>
        )}
        
      </AnimatePresence>
    </div>
  );
}
