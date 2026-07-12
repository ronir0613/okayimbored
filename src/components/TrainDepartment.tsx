import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Train } from './LivingTrain/Train';

// --- Data Pools ---
const TRAINS = [
  'Locomotive 42', 'The Midnight Express', 'Ghost Train', 'Rusty', 'Local Commuter', 'Silver Streak', 'Unknown Engine', 'Track 9'
];

const ROUTES = [
  'Endless Loop', 'Nowhere to Nowhere', 'Delayed Indefinitely', 
  'Maintenance Track', 'Underground Circle', 'Scenic Void', 
  'Abandoned Line', 'Vibration Testing'
];

const STATUSES = [
  'Delayed', 'Arriving', 'Departed', 'Unknown', 
  'Derailing Slowly', 'Missing', 'Refusing to Stop', 
  'Technically Present', 'Staring at a red signal', 'Under Investigation'
];

const MEMOS: React.ReactNode[] = [
  "Please stop leaving\npassengers in the void.",
  "Reminder:\n\nThe tracks\ndo not lead anywhere.",
  "The engines have requested\nmore coal.",
  "Station closed.\n\nNobody noticed.",
  "Someone keeps\npulling the emergency brake.",
  <span key="basement">Someone left the door to<br/>the <a href="/basement" className="underline decoration-white/20 underline-offset-4 hover:text-white/60 transition-colors cursor-pointer">basement</a> open again.</span>,
  "Schedule is complicated.",
  "Maintenance has given up.",
  <span key="notices">Please stop pinning things to<br/>the <a href="/notices" className="underline decoration-white/20 underline-offset-4 hover:text-white/60 transition-colors cursor-pointer">notice board</a>.</span>,
  "The conductor approved this."
];

const INCIDENTS = [
  { id: "003", text: "Train arrived before\nit departed." },
  { id: "011", text: "Engine refused to stop." },
  { id: "018", text: "Unknown train appeared.\n\nNobody boarded." },
  { id: "025", text: "Conductor of the Month\nstole a ticket." },
  { id: "042", text: "Two trains occupied\nthe same track.\n\nNo collision occurred." }
];

const EOTM_REASONS = [
  "\"Consistently unavailable.\"",
  "\"Excellent whistling.\"",
  "\"Unknown.\"",
  "\"Showed up once.\"",
  "\"Did not derail\nthis month.\""
];

const INTERNAL_EMAILS = [
  { subject: "Where is Rusty?", response: "Unknown." },
  { subject: "Signals fixed?", response: "Mostly." },
  { subject: "Who approved this route?", response: "Nobody." },
  { subject: "Are we paying them?", response: "They receive one lump of coal\nevery Friday." },
  { subject: "Ticket shortage", response: "Print more paper." }
];

const RARE_EVENTS = {
  EMPTY_STATION: 0.005, // 0.5%
  ALL_DELAYED: 0.001, // 0.1%
  CLASSIFIED_TRAIN: 0.0001 // 0.01%
};

// --- Component ---
export default function TrainDepartment() {
  const [mounted, setMounted] = useState(false);
  
  // States for random generation
  const [boardTrains, setBoardTrains] = useState<any[]>([]);
  const [activeMemos, setActiveMemos] = useState<React.ReactNode[]>([]);
  const [incident, setIncident] = useState<{id: string, text: string} | null>(null);
  const [eotm, setEotm] = useState<{name: string, reason: string} | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [trainOfTheDay, setTrainOfTheDay] = useState<string>('');
  
  // Rare states
  const [isStationEmpty, setIsStationEmpty] = useState(false);
  const [isAllDelayed, setIsAllDelayed] = useState(false);

  useEffect(() => {
    setMounted(true);

    const r = Math.random();
    let event_empty = false;
    let event_delayed = false;
    let event_classified = false;

    if (r < RARE_EVENTS.CLASSIFIED_TRAIN) {
      event_classified = true;
    } else if (r < RARE_EVENTS.ALL_DELAYED + RARE_EVENTS.CLASSIFIED_TRAIN) {
      event_delayed = true;
    } else if (r < RARE_EVENTS.EMPTY_STATION + RARE_EVENTS.ALL_DELAYED + RARE_EVENTS.CLASSIFIED_TRAIN) {
      event_empty = true;
    }

    setIsStationEmpty(event_empty);
    setIsAllDelayed(event_delayed);

    // Pick 3-4 random trains for the board
    const shuffledTrains = [...TRAINS].sort(() => 0.5 - Math.random());
    const numTrains = Math.floor(Math.random() * 2) + 3; // 3 or 4
    
    let selectedTrains = shuffledTrains.slice(0, numTrains).map(name => ({
      name,
      route: ROUTES[Math.floor(Math.random() * ROUTES.length)],
      status: event_delayed ? "Delayed Indefinitely" : STATUSES[Math.floor(Math.random() * STATUSES.length)]
    }));

    if (event_classified) {
      selectedTrains.push({
        name: "???",
        route: "Classified",
        status: "Unknown"
      });
    }

    setBoardTrains(selectedTrains);

    // Pick 1-2 memos
    const shuffledMemos = [...MEMOS].sort(() => 0.5 - Math.random());
    setActiveMemos(shuffledMemos.slice(0, Math.floor(Math.random() * 2) + 1));

    // Pick incident
    setIncident(INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)]);

    // Pick EOTM
    setEotm({
      name: TRAINS[Math.floor(Math.random() * TRAINS.length)],
      reason: EOTM_REASONS[Math.floor(Math.random() * EOTM_REASONS.length)]
    });

    // Pick emails
    const shuffledEmails = [...INTERNAL_EMAILS].sort(() => 0.5 - Math.random());
    setEmails(shuffledEmails.slice(0, 2));

    // Pick Train of the Day
    setTrainOfTheDay(TRAINS[Math.floor(Math.random() * TRAINS.length)]);

  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white/40 font-mono p-8 sm:p-16 overflow-hidden relative select-none selection:bg-white/10 selection:text-white">
      
      {/* Background Trains */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden filter grayscale">
        <Train 
          trainType="random" 
          direction="right" 
          speed={0.5} 
          scale={3} 
          loop={true} 
          style={{ top: '15%' }}
        />
        <Train 
          trainType="random" 
          direction="left" 
          speed={0.3} 
          scale={2.5} 
          loop={true} 
          style={{ top: '75%' }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-24 text-center flex flex-col items-center relative">
          <div className="text-[10px] tracking-[0.4em] text-white/20 uppercase mb-2">
            INTERNAL DOCUMENT
          </div>
          <h1 className="text-2xl sm:text-4xl tracking-[0.4em] text-white/80 uppercase font-light mb-4">
            THE TRAIN DEPARTMENT
          </h1>
          <p className="text-xs tracking-widest text-white/30 italic">
            "Nobody remembers building the tracks."
          </p>
        </header>

        {isStationEmpty ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="border border-white/10 p-8 flex flex-col items-center max-w-xs text-center">
              <div className="w-4 h-4 bg-white/20 rounded-sm mb-6"></div>
              <p className="text-sm text-white/60 tracking-widest uppercase mb-4">
                Track maintenance.
              </p>
              <p className="text-[10px] text-white/30 italic">
                Station currently empty.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            
            {/* Left Column (Employee Board, Incident) */}
            <div className="md:col-span-5 space-y-16">
              
              {/* Train Board */}
              <section className="border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
                <h2 className="text-xs tracking-[0.3em] text-white/50 uppercase border-b border-white/10 pb-4 mb-8">
                  DEPARTURE BOARD
                </h2>
                <div className="space-y-8">
                  {boardTrains.map((train, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="text-sm text-white/80 uppercase tracking-widest">{train.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Route: {train.route}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Status: {train.status}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Incident Report */}
              {incident && (
                <section className="border-l-2 border-white/20 pl-6 bg-black/40 p-4 rounded-r-md backdrop-blur-sm">
                  <h2 className="text-[10px] tracking-[0.3em] text-white/50 uppercase mb-4">
                    Incident #{incident.id}
                  </h2>
                  <p className="text-sm text-white/70 whitespace-pre-line italic">
                    {incident.text}
                  </p>
                </section>
              )}

              {/* Performance Reviews */}
              <section className="space-y-4 backdrop-blur-sm p-4 bg-white/[0.01]">
                <h2 className="text-[10px] tracking-[0.3em] text-white/50 uppercase mb-6">
                  Recent Performance
                </h2>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Punctuality</span>
                  <span>★★</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Speed</span>
                  <span>★</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Reliability</span>
                  <span>Unknown</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest pb-2">
                  <span>Presence</span>
                  <span>Technically Present</span>
                </div>
              </section>

            </div>

            {/* Right Column (Memos, EOTM, Emails, Misc) */}
            <div className="md:col-span-7 space-y-16">
              
              {/* Pinned Memos */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {activeMemos.map((memo, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/10 p-6 relative backdrop-blur-sm">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-sm bg-white/20"></div>
                    <p className={`mt-4 text-xs text-white/60 text-center italic tracking-wider leading-relaxed ${typeof memo === 'string' ? 'whitespace-pre-line' : ''}`}>
                      {memo}
                    </p>
                  </div>
                ))}
              </section>

              {/* EOTM & Train of the Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {eotm && (
                  <section className="border border-white/5 p-6 flex flex-col items-center text-center backdrop-blur-sm bg-black/20">
                    <h2 className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-6">
                      Train of the Month
                    </h2>
                    <div className="w-24 h-16 border border-white/20 flex items-center justify-center mb-6 bg-white/5 overflow-hidden relative">
                       <Train 
                         trainType="random" 
                         stationary={true} 
                         showTracks={true} 
                         scale={0.5}
                         containerWidth={300}
                         className="filter grayscale opacity-80"
                         style={{ top: 'auto', bottom: 4, left: 4 }} 
                       />
                    </div>
                    <div className="text-sm text-white/80 uppercase tracking-widest mb-2">
                      {eotm.name}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">
                      Reason:
                    </div>
                    <div className="text-xs text-white/60 italic mt-1 whitespace-pre-line">
                      {eotm.reason}
                    </div>
                  </section>
                )}

                <div className="space-y-8 flex flex-col justify-between">
                  <section className="border-b border-white/5 pb-8">
                    <h2 className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
                      Today's Train
                    </h2>
                    <div className="text-sm text-white/70 uppercase tracking-widest mb-2">
                      {trainOfTheDay}
                    </div>
                    <div className="text-xs text-white/40">
                      Current Activity: Waiting for a signal to change.
                    </div>
                  </section>

                  <section className="pt-4 border-l border-white/5 pl-6">
                     <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Missing:</div>
                     <div className="text-sm text-white/70 uppercase tracking-widest mb-1">Ghost Train</div>
                     <div className="text-xs text-white/40 italic">Last seen: Near the edge of the map.</div>
                  </section>
                </div>
              </div>

              {/* Internal Emails */}
              <section className="mt-16 border-t border-white/5 pt-12">
                <h2 className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-8">
                  Recent Communications
                </h2>
                <div className="space-y-6">
                  {emails.map((email, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider w-32 shrink-0">
                        Subject: {email.subject}
                      </div>
                      <div className="text-xs text-white/60 italic whitespace-pre-line">
                        Response: {email.response}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Benefits */}
              <section className="text-[10px] text-white/20 flex flex-wrap gap-4 uppercase tracking-[0.2em] mt-16 pt-8 border-t border-white/[0.02]">
                <span>Benefits:</span>
                <span>Unlimited Coal</span>
                <span className="opacity-50">/</span>
                <span>Free Track Grease</span>
                <span className="opacity-50">/</span>
                <span>Dim Lighting</span>
                <span className="opacity-50">/</span>
                <span>Optional Stops</span>
              </section>

              {/* Attribution */}
              <section className="text-[8px] text-white/10 uppercase tracking-[0.2em] mt-8 mb-4">
                Train assets from <a href="https://github.com/nrissot/desktop_train" target="_blank" rel="noopener noreferrer" className="hover:text-white/30 underline decoration-white/10 transition-colors">nrissot/desktop_train</a> under the <a href="/TRAINS_LICENSE.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white/30 underline decoration-white/10 transition-colors">MIT License</a>.
              </section>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
