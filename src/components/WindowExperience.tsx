import React, { useState, useEffect } from 'react';

const SCENES = [
  'RAIN', 'EMPTY_STREET', 'STREET_LAMP', 'APARTMENT_WINDOWS',
  'DISTANT_MOUNTAINS', 'MOON_CLOUDS', 'QUIET_OCEAN', 'SNOW_FALLING',
  'WIND_TREES', 'CITY_LIGHTS', 'TRAIN_PLATFORM', 'TELEPHONE_POLES', 'ROOFTOPS'
];

const CAPTIONS = [
  "Someone else is awake.",
  "It's quiet tonight.",
  "The world kept going.",
  "Nobody noticed this.",
  "Still raining.",
  "We like this view.",
  "You don't have to hurry."
];

// Returns an object containing sky color and ambient tint
function getLocalLighting() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 11) {
    // Morning
    return { bg: 'linear-gradient(to top, #4a6583, #1e3c5a)', opacity: 0.8 };
  } else if (hour >= 11 && hour < 16) {
    // Afternoon
    return { bg: 'linear-gradient(to top, #7b9ebc, #4a6b8c)', opacity: 1.0 };
  } else if (hour >= 16 && hour < 19) {
    // Sunset
    return { bg: 'linear-gradient(to top, #c77b58, #4a3b52)', opacity: 0.9 };
  } else if (hour >= 19 && hour < 23) {
    // Night
    return { bg: 'linear-gradient(to top, #151828, #050508)', opacity: 0.5 };
  } else {
    // Late night (23-5)
    return { bg: 'linear-gradient(to top, #0a0b10, #020203)', opacity: 0.2 };
  }
}

export default function WindowExperience() {
  const [mounted, setMounted] = useState(false);
  const [scene, setScene] = useState('');
  const [caption, setCaption] = useState('');
  const [lighting, setLighting] = useState({ bg: '#020203', opacity: 0.5 });
  const [hasReflection, setHasReflection] = useState(false);
  const [catState, setCatState] = useState<'NONE' | 'SILL' | 'WALK' | 'SLEEP'>('NONE');

  useEffect(() => {
    // 1. Time of day
    setLighting(getLocalLighting());

    // 2. Select scene
    setScene(SCENES[Math.floor(Math.random() * SCENES.length)]);

    // 3. Captions
    const veryRare = Math.random() < 0.0001; // 0.01%
    if (veryRare) {
      setCaption("We've been looking out this window for a long time.");
    } else {
      // Occasional regular caption (20% chance to show a caption at all)
      if (Math.random() < 0.2) {
        setCaption(CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)]);
      }
    }

    // 4. Rare event
    const reflectionRare = Math.random() < 0.001; // 0.1%
    if (reflectionRare) {
      setHasReflection(true);
    }

    // 5. Cats
    const catRand = Math.random();
    if (catRand < 0.05) {
      setCatState('SILL');
    } else if (catRand < 0.1) {
      setCatState('SLEEP');
    } else if (catRand < 0.15) {
      setCatState('WALK');
    }

    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleBack = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('okayimbored_returning_from_secret', 'true');
    }
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] space-y-16 select-none bg-[#0a0a0a] w-full relative overflow-hidden m-0 p-0">
      
      <button 
        onClick={handleBack}
        className="absolute top-8 left-8 text-[10px] font-mono text-white/10 hover:text-white/40 transition-colors uppercase tracking-widest cursor-pointer z-50"
      >
        turn away.
      </button>

      {/* Container for Window Frame */}
      <div className="relative">
        
        {/* Sleeping Cat Beneath */}
        {catState === 'SLEEP' && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-3 bg-black/80 rounded-full animate-pulse blur-[0.5px]"></div>
        )}

        <div className="relative w-[180px] h-[240px] md:w-[220px] md:h-[300px] bg-[#020203] rounded-md shadow-[inset_0_0_40px_rgba(0,0,0,0.9),0_0_20px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden">
          
          {/* Inner Sky & Scene Background */}
          <div 
            className="absolute inset-0 transition-opacity duration-[5000ms]"
            style={{ background: lighting.bg, opacity: lighting.opacity }}
          ></div>

          {/* Render Active Scene */}
          <div className="absolute inset-0 overflow-hidden">
            <SceneRenderer type={scene} />
          </div>

          {/* Window Dividers */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#0a0a0a] z-20 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
          <div className="absolute left-0 right-0 top-[40%] h-[2px] bg-[#0a0a0a] z-20 shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>

          {/* Rare Reflection */}
          {hasReflection && (
            <div className="absolute inset-0 z-30 pointer-events-none opacity-5 mix-blend-screen bg-gradient-to-tr from-white/10 to-transparent blur-md flex items-end justify-center pb-10">
              {/* Vague silhouette */}
              <div className="w-16 h-24 bg-white/20 rounded-t-full blur-xl"></div>
            </div>
          )}

          {/* Cat on windowsill */}
          {catState === 'SILL' && (
            <div className="absolute bottom-[40%] right-[52%] w-4 h-5 bg-[#050505] rounded-t-sm z-30 translate-y-[-2px]">
              {/* Ears */}
              <div className="absolute -top-[3px] -left-[1px] w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent border-b-[#050505]"></div>
              <div className="absolute -top-[3px] -right-[1px] w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent border-b-[#050505]"></div>
            </div>
          )}

          {/* Cat Walking Past (Animation) */}
          {catState === 'WALK' && (
            <div className="absolute bottom-[40%] w-6 h-3 bg-[#050505] rounded-t-full z-30 opacity-90 translate-y-[-2px]" style={{ animation: 'catWalk 25s linear infinite' }}>
              <div className="absolute -right-1 top-0 w-2 h-2 bg-[#050505] rounded-full"></div>
              <div className="absolute -left-2 top-0 w-3 h-[2px] bg-[#050505] rotate-45"></div>
            </div>
          )}

          {/* Glass reflection/glare overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent z-40 pointer-events-none"></div>
        </div>
      </div>

      {/* Caption Area */}
      <div className="h-6">
        {caption && (
          <p className="text-[11px] font-mono text-white/20 tracking-widest font-light transition-opacity duration-1000">
            {caption}
          </p>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes driftRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes driftLeft {
          0% { transform: translateX(300%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes rainfall {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(350px) translateX(10px); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes snowfall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(350px) translateX(30px) rotate(360deg); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }
        @keyframes catWalk {
          0% { transform: translateX(-50px); }
          10% { transform: translateX(-50px); }
          40% { transform: translateX(300px); }
          100% { transform: translateX(300px); }
        }
        @keyframes trainPass {
          0% { transform: translateX(-100%); }
          20% { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        @keyframes shootingStar {
          0% { transform: translate(150px, -50px) rotate(-45deg) scale(0); opacity: 1; }
          10% { transform: translate(-50px, 150px) rotate(-45deg) scale(1); opacity: 0; }
          100% { transform: translate(-50px, 150px) rotate(-45deg) scale(0); opacity: 0; }
        }
      `}} />
    </div>
  );
}

// Scene rendering logic
function SceneRenderer({ type }: { type: string }) {
  // Common details
  const showBird = Math.random() < 0.1;
  const showPlane = Math.random() < 0.15;
  const showShootingStar = Math.random() < 0.05;
  const showTrain = Math.random() < 0.08;

  return (
    <>
      {/* Render the specific scene type */}
      {(() => {
        switch (type) {
          case 'RAIN':
            return <RainScene />;
          case 'EMPTY_STREET':
            return <EmptyStreetScene />;
          case 'STREET_LAMP':
            return <StreetLampScene />;
          case 'APARTMENT_WINDOWS':
            return <ApartmentWindowsScene />;
          case 'DISTANT_MOUNTAINS':
            return <MountainsScene />;
          case 'MOON_CLOUDS':
            return <MoonCloudsScene />;
          case 'QUIET_OCEAN':
            return <OceanScene />;
          case 'SNOW_FALLING':
            return <SnowScene />;
          case 'WIND_TREES':
            return <TreesScene />;
          case 'CITY_LIGHTS':
            return <CityLightsScene />;
          case 'TRAIN_PLATFORM':
            return <TrainPlatformScene />;
          case 'TELEPHONE_POLES':
            return <TelephonePolesScene />;
          case 'ROOFTOPS':
            return <RooftopsScene />;
          default:
            return <RainScene />;
        }
      })()}

      {/* Rare Occasional Details that can happen in any scene */}
      {showBird && (
        <div 
          className="absolute top-[20%] w-2 h-1 bg-black/60 rounded-full blur-[0.5px] z-10"
          style={{ animation: 'driftRight 45s linear infinite', animationDelay: '5s' }}
        ></div>
      )}
      
      {showPlane && (
        <div 
          className="absolute top-[10%] w-[2px] h-[2px] bg-red-500/80 rounded-full z-10"
          style={{ animation: 'driftLeft 120s linear infinite, blink 2s infinite' }}
        ></div>
      )}

      {showShootingStar && (
        <div 
          className="absolute w-10 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-white z-10"
          style={{ animation: 'shootingStar 20s linear infinite', animationDelay: '10s' }}
        ></div>
      )}

      {showTrain && (
        <div 
          className="absolute bottom-[5%] h-1 bg-yellow-500/10 flex space-x-1 z-10 blur-[1px]"
          style={{ animation: 'trainPass 60s linear infinite', width: '200px' }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-4 h-full bg-yellow-100/40"></div>
          ))}
        </div>
      )}
    </>
  );
}

function RainScene() {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white/20 w-[1px] h-[15px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animation: `rainfall ${0.5 + Math.random() * 0.4}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        ></div>
      ))}
      <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-white/5 to-transparent"></div>
    </>
  );
}

function SnowScene() {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white/40 rounded-full"
          style={{
            width: `${Math.random() > 0.8 ? 3 : 2}px`,
            height: `${Math.random() > 0.8 ? 3 : 2}px`,
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animation: `snowfall ${4 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        ></div>
      ))}
    </>
  );
}

function CityLightsScene() {
  return (
    <div className="absolute inset-0 flex items-end opacity-60 mix-blend-screen">
      {Array.from({ length: 15 }).map((_, i) => {
        const height = 10 + Math.random() * 40;
        const width = 10 + Math.random() * 20;
        const left = Math.random() * 90;
        return (
          <div 
            key={i} 
            className="absolute bottom-0 bg-black/80"
            style={{ height: `${height}%`, width: `${width}%`, left: `${left}%` }}
          >
            {/* Windows in the building */}
            <div className="w-full h-full p-1 flex flex-wrap gap-[2px] content-start overflow-hidden opacity-40">
              {Array.from({ length: 10 }).map((_, j) => (
                <div 
                  key={j} 
                  className="w-[2px] h-[3px] bg-yellow-100"
                  style={{ 
                    opacity: Math.random() > 0.3 ? 1 : 0,
                    animation: Math.random() > 0.95 ? 'blink 5s infinite' : 'none' 
                  }}
                ></div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MoonCloudsScene() {
  return (
    <>
      <div className="absolute top-[20%] left-[60%] w-8 h-8 bg-[#fdfaf6] rounded-full blur-[2px] opacity-80 shadow-[0_0_15px_rgba(253,250,246,0.6)]"></div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white/5 rounded-full blur-[10px]"
          style={{
            width: `${80 + Math.random() * 100}px`,
            height: `${40 + Math.random() * 40}px`,
            top: `${10 + Math.random() * 50}%`,
            animation: `driftRight ${40 + Math.random() * 30}s linear infinite`,
            animationDelay: `-${Math.random() * 40}s`
          }}
        ></div>
      ))}
    </>
  );
}

function EmptyStreetScene() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <div className="w-full h-[30%] bg-black/60 relative border-t border-black/80">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-white/20"></div>
      </div>
    </div>
  );
}

function StreetLampScene() {
  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <div className="w-[3px] h-[60%] bg-black relative">
        <div className="absolute -top-1 -left-2 w-5 h-2 bg-black rounded-t-full"></div>
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-24 bg-yellow-200/20 blur-md" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
      </div>
    </div>
  );
}

function ApartmentWindowsScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-6 opacity-80">
        {Array.from({ length: 9 }).map((_, i) => {
          const turnsOff = Math.random() > 0.9;
          const isOn = Math.random() > 0.4;
          return (
            <div 
              key={i} 
              className={`w-6 h-8 relative ${isOn ? 'bg-yellow-100/80 shadow-[0_0_8px_rgba(254,240,138,0.5)]' : 'bg-black/80'}`}
              style={turnsOff && isOn ? { animation: 'blink 20s infinite', animationDelay: `${Math.random() * 10}s` } : undefined}
            >
              <div className="absolute w-full h-[1px] top-1/2 bg-black/40"></div>
              <div className="absolute w-[1px] h-full left-1/2 bg-black/40"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MountainsScene() {
  return (
    <div className="absolute inset-0 flex items-end opacity-40">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[40%] text-black">
        <polygon points="0,100 0,50 30,20 60,60 80,40 100,70 100,100" fill="currentColor" />
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[30%] text-[#050505]">
        <polygon points="0,100 0,60 40,30 70,50 100,40 100,100" fill="currentColor" />
      </svg>
    </div>
  );
}

function OceanScene() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <div className="w-full h-[40%] bg-blue-900/10 border-t border-white/5 relative overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute h-[1px] bg-white/10"
            style={{
              width: `${10 + Math.random() * 30}px`,
              top: `${Math.random() * 100}%`,
              animation: `driftRight ${10 + Math.random() * 20}s linear infinite alternate`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

function TreesScene() {
  return (
    <div className="absolute inset-0 flex items-end justify-between px-2 opacity-80">
      <div className="w-8 h-[60%] bg-black rounded-t-full blur-[1px] origin-bottom" style={{ animation: 'driftRight 8s ease-in-out infinite alternate' }}></div>
      <div className="w-12 h-[50%] bg-black rounded-t-full blur-[1px] origin-bottom" style={{ animation: 'driftLeft 12s ease-in-out infinite alternate' }}></div>
      <div className="w-6 h-[70%] bg-black rounded-t-full blur-[1px] origin-bottom" style={{ animation: 'driftRight 10s ease-in-out infinite alternate' }}></div>
    </div>
  );
}

function TrainPlatformScene() {
  return (
    <div className="absolute inset-0 flex items-end">
      <div className="w-full h-[15%] bg-black/80 relative border-t border-white/10">
        <div className="absolute top-[-30px] left-10 w-2 h-8 bg-black"></div>
        <div className="absolute top-[-40px] left-8 w-6 h-2 bg-black"></div>
      </div>
    </div>
  );
}

function TelephonePolesScene() {
  return (
    <div className="absolute inset-0 flex items-end justify-between px-4">
      <div className="w-1 h-[70%] bg-black relative">
        <div className="absolute top-4 -left-2 w-5 h-1 bg-black"></div>
        <svg className="absolute top-4 left-2 w-[150px] h-[50px] overflow-visible pointer-events-none text-black/80">
          <path d="M 0 0 Q 75 20 150 0" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <div className="w-1 h-[65%] bg-black relative ml-[150px]">
        <div className="absolute top-4 -left-2 w-5 h-1 bg-black"></div>
      </div>
    </div>
  );
}

function RooftopsScene() {
  return (
    <div className="absolute inset-0 flex items-end opacity-90">
      <div className="w-1/3 h-[30%] bg-black relative">
        <div className="absolute -top-6 right-2 w-[1px] h-6 bg-black"></div>
      </div>
      <div className="w-1/3 h-[45%] bg-black relative">
        <div className="absolute -top-4 left-4 w-3 h-4 bg-black"></div>
        <div className="absolute -top-8 left-4 w-2 h-2 bg-white/5 blur-sm rounded-full animate-pulse"></div>
      </div>
      <div className="w-1/3 h-[25%] bg-black relative"></div>
    </div>
  );
}
