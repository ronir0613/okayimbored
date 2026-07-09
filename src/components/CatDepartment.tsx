import React, { useState, useEffect } from 'react';
import { PixelCat, type CatState } from './LivingCats/PixelCat';

// --- Data Pools ---
const EMPLOYEES = [
  'Mochi', 'Beans', 'Toast', 'Pebble', 'Nori', 'Chairman Meow', 'Socks', 'Pixel'
];

const POSITIONS = [
  'Professional Sleeper', 'Window Inspector', 'Record Player Supervisor', 
  'Lost & Found Assistant', 'Senior Observer', 'Paperweight Manager', 
  'Box Quality Assurance', 'Vibration Analyst'
];

const STATUSES = [
  'On Break', 'Missing', 'Sleeping During Shift', 'Ignoring Responsibilities', 
  'Watching Someone', 'Technically Present', 'Refusing Promotion', 
  'Unknown', 'Staring at absolutely nothing', 'Under Investigation'
];

const MEMOS = [
  "Please stop sleeping\ninside the record player.",
  "Reminder:\n\nThe timestamp\nis not a bed.",
  "The cats have requested\nmore cardboard boxes.",
  "Meeting cancelled.\n\nNobody attended.",
  "Someone keeps\nknocking papers off shelves.",
  "Payroll is complicated.",
  "Human Resources has given up.",
  "The cats approved this."
];

const INCIDENTS = [
  { id: "003", text: "Employee slept through\nentire shift." },
  { id: "011", text: "Cat refused promotion." },
  { id: "018", text: "Unknown cat appeared.\n\nNobody questioned it." },
  { id: "025", text: "Employee of the Month\nstole lunch." },
  { id: "042", text: "Two cats occupied\nthe same box." }
];

const EOTM_REASONS = [
  "\"Consistently unavailable.\"",
  "\"Excellent sleeping.\"",
  "\"Unknown.\"",
  "\"Showed up once.\"",
  "\"Did not break anything\nthis month.\""
];

const INTERNAL_EMAILS = [
  { subject: "Where is Toast?", response: "Unknown." },
  { subject: "Record player fixed?", response: "Mostly." },
  { subject: "Who approved this?", response: "Nobody." },
  { subject: "Are we paying them?", response: "They receive one fish\nevery Friday." },
  { subject: "Box shortage", response: "Order more cardboard." }
];

const RARE_EVENTS = {
  EMPTY_OFFICE: 0.005, // 0.5%
  ALL_SLEEPING: 0.001, // 0.1%
  CLASSIFIED_EMPLOYEE: 0.0001 // 0.01%
};

// --- Component ---
export default function CatDepartment() {
  const [mounted, setMounted] = useState(false);
  
  // States for random generation
  const [boardEmployees, setBoardEmployees] = useState<any[]>([]);
  const [activeMemos, setActiveMemos] = useState<string[]>([]);
  const [incident, setIncident] = useState<{id: string, text: string} | null>(null);
  const [eotm, setEotm] = useState<{name: string, reason: string} | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [catOfTheDay, setCatOfTheDay] = useState<string>('');
  
  // Rare states
  const [isOfficeEmpty, setIsOfficeEmpty] = useState(false);
  const [isAllSleeping, setIsAllSleeping] = useState(false);
  const [hasClassified, setHasClassified] = useState(false);

  // Living cats states (random positions)
  const [livingCats, setLivingCats] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    const r = Math.random();
    let event_empty = false;
    let event_sleeping = false;
    let event_classified = false;

    if (r < RARE_EVENTS.CLASSIFIED_EMPLOYEE) {
      event_classified = true;
    } else if (r < RARE_EVENTS.ALL_SLEEPING + RARE_EVENTS.CLASSIFIED_EMPLOYEE) {
      event_sleeping = true;
    } else if (r < RARE_EVENTS.EMPTY_OFFICE + RARE_EVENTS.ALL_SLEEPING + RARE_EVENTS.CLASSIFIED_EMPLOYEE) {
      event_empty = true;
    }

    setIsOfficeEmpty(event_empty);
    setIsAllSleeping(event_sleeping);
    setHasClassified(event_classified);

    // Pick 3-4 random employees for the board
    const shuffledEmployees = [...EMPLOYEES].sort(() => 0.5 - Math.random());
    const numEmployees = Math.floor(Math.random() * 2) + 3; // 3 or 4
    
    let selectedEmployees = shuffledEmployees.slice(0, numEmployees).map(name => ({
      name,
      position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
      status: event_sleeping ? "Sleeping" : STATUSES[Math.floor(Math.random() * STATUSES.length)]
    }));

    if (event_classified) {
      selectedEmployees.push({
        name: "???",
        position: "Classified",
        status: "Unknown"
      });
    }

    setBoardEmployees(selectedEmployees);

    // Pick 1-2 memos
    const shuffledMemos = [...MEMOS].sort(() => 0.5 - Math.random());
    setActiveMemos(shuffledMemos.slice(0, Math.floor(Math.random() * 2) + 1));

    // Pick incident
    setIncident(INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)]);

    // Pick EOTM
    setEotm({
      name: EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)],
      reason: EOTM_REASONS[Math.floor(Math.random() * EOTM_REASONS.length)]
    });

    // Pick emails
    const shuffledEmails = [...INTERNAL_EMAILS].sort(() => 0.5 - Math.random());
    setEmails(shuffledEmails.slice(0, 2));

    // Pick Cat of the Day
    setCatOfTheDay(EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)]);

    // Generate 1-3 living cats in the background
    if (!event_empty) {
      const numLivingCats = Math.floor(Math.random() * 3) + 1;
      const cats = [];
      const catStates: CatState[] = ['idle', 'sleeping', 'walking_left', 'walking_right'];
      
      for(let i=0; i<numLivingCats; i++) {
        cats.push({
          id: i,
          top: Math.random() * 80 + 10, // 10% to 90%
          left: Math.random() * 80 + 10,
          state: event_sleeping ? 'sleeping' : catStates[Math.floor(Math.random() * catStates.length)]
        });
      }
      setLivingCats(cats);
    }

  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white/40 font-mono p-8 sm:p-16 overflow-hidden relative select-none selection:bg-white/10 selection:text-white">
      
      {/* Background Living Cats */}
      {livingCats.map(cat => (
        <div 
          key={cat.id} 
          className="absolute w-12 h-12 opacity-30 pointer-events-none"
          style={{ top: `${cat.top}%`, left: `${cat.left}%`, zIndex: 0 }}
        >
          <PixelCat state={cat.state} />
        </div>
      ))}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-24 text-center flex flex-col items-center relative">
          <div className="text-[10px] tracking-[0.4em] text-white/20 uppercase mb-2">
            INTERNAL DOCUMENT
          </div>
          <h1 className="text-2xl sm:text-4xl tracking-[0.4em] text-white/80 uppercase font-light mb-4">
            THE CAT DEPARTMENT
          </h1>
          <p className="text-xs tracking-widest text-white/30 italic">
            "Nobody remembers hiring them."
          </p>
        </header>

        {isOfficeEmpty ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="border border-white/10 p-8 flex flex-col items-center max-w-xs text-center">
              <div className="w-4 h-4 bg-white/20 rounded-full mb-6"></div>
              <p className="text-sm text-white/60 tracking-widest uppercase mb-4">
                Team building exercise.
              </p>
              <p className="text-[10px] text-white/30 italic">
                Office currently empty.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            
            {/* Left Column (Employee Board, Incident) */}
            <div className="md:col-span-5 space-y-16">
              
              {/* Employee Board */}
              <section className="border border-white/5 bg-white/[0.02] p-8">
                <h2 className="text-xs tracking-[0.3em] text-white/50 uppercase border-b border-white/10 pb-4 mb-8">
                  EMPLOYEE BOARD
                </h2>
                <div className="space-y-8">
                  {boardEmployees.map((emp, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="text-sm text-white/80 uppercase tracking-widest">{emp.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Position: {emp.position}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Status: {emp.status}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Incident Report */}
              {incident && (
                <section className="border-l-2 border-white/20 pl-6">
                  <h2 className="text-[10px] tracking-[0.3em] text-white/50 uppercase mb-4">
                    Incident #{incident.id}
                  </h2>
                  <p className="text-sm text-white/70 whitespace-pre-line italic">
                    {incident.text}
                  </p>
                </section>
              )}

              {/* Performance Reviews */}
              <section className="space-y-4">
                <h2 className="text-[10px] tracking-[0.3em] text-white/50 uppercase mb-6">
                  Recent Performance
                </h2>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Sleeping</span>
                  <span>★★★★★</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Listening</span>
                  <span>★</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Productivity</span>
                  <span>Unknown</span>
                </div>
                <div className="text-xs text-white/40 flex justify-between uppercase tracking-widest pb-2">
                  <span>Attendance</span>
                  <span>Technically Present</span>
                </div>
              </section>

            </div>

            {/* Right Column (Memos, EOTM, Emails, Misc) */}
            <div className="md:col-span-7 space-y-16">
              
              {/* Pinned Memos */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {activeMemos.map((memo, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/10 p-6 relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20"></div>
                    <p className="mt-4 text-xs text-white/60 whitespace-pre-line text-center italic tracking-wider leading-relaxed">
                      {memo}
                    </p>
                  </div>
                ))}
              </section>

              {/* EOTM & Cat of the Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {eotm && (
                  <section className="border border-white/5 p-6 flex flex-col items-center text-center">
                    <h2 className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-6">
                      Employee of the Month
                    </h2>
                    <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6 bg-white/5">
                       <PixelCat state="idle" />
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
                      Today's Cat
                    </h2>
                    <div className="text-sm text-white/70 uppercase tracking-widest mb-2">
                      {catOfTheDay}
                    </div>
                    <div className="text-xs text-white/40">
                      Current Activity: Staring at absolutely nothing.
                    </div>
                  </section>

                  <section className="pt-4 border-l border-white/5 pl-6">
                     <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Missing:</div>
                     <div className="text-sm text-white/70 uppercase tracking-widest mb-1">Chairman Meow</div>
                     <div className="text-xs text-white/40 italic">Last seen: Near the Window Room.</div>
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
                <span>Unlimited Naps</span>
                <span className="opacity-50">/</span>
                <span>Free Cardboard</span>
                <span className="opacity-50">/</span>
                <span>Sunlight</span>
                <span className="opacity-50">/</span>
                <span>Optional Meetings</span>
              </section>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
