import React from 'react';

export interface SceneProps {
  className?: string;
  seed?: number;
}

const EmptyBusStop: React.FC<SceneProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
    <rect width="100" height="100" fill="#050505" />
    {/* Ground */}
    <rect x="0" y="80" width="100" height="20" fill="#111" />
    {/* Shelter roof */}
    <rect x="20" y="30" width="60" height="4" fill="#333" />
    {/* Shelter back wall */}
    <rect x="25" y="34" width="50" height="46" fill="#1a1a1a" />
    {/* Shelter posts */}
    <rect x="22" y="34" width="2" height="46" fill="#222" />
    <rect x="76" y="34" width="2" height="46" fill="#222" />
    {/* Bench */}
    <rect x="30" y="65" width="40" height="3" fill="#2a2a2a" />
    <rect x="35" y="68" width="2" height="12" fill="#2a2a2a" />
    <rect x="63" y="68" width="2" height="12" fill="#2a2a2a" />
    {/* Sign pole */}
    <rect x="85" y="20" width="2" height="60" fill="#222" />
    <rect x="80" y="20" width="12" height="10" fill="#333" />
  </svg>
);

const Chair: React.FC<SceneProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
    <rect width="100" height="100" fill="#080808" />
    {/* Floor line */}
    <line x1="0" y1="85" x2="100" y2="85" stroke="#1a1a1a" strokeWidth="1" />
    {/* Chair back */}
    <rect x="35" y="30" width="30" height="30" fill="none" stroke="#333" strokeWidth="2" />
    <line x1="42" y1="30" x2="42" y2="60" stroke="#333" strokeWidth="2" />
    <line x1="50" y1="30" x2="50" y2="60" stroke="#333" strokeWidth="2" />
    <line x1="58" y1="30" x2="58" y2="60" stroke="#333" strokeWidth="2" />
    {/* Chair seat */}
    <polygon points="30,60 70,60 65,65 35,65" fill="#333" />
    {/* Legs */}
    <line x1="35" y1="65" x2="33" y2="85" stroke="#333" strokeWidth="2" />
    <line x1="65" y1="65" x2="67" y2="85" stroke="#333" strokeWidth="2" />
    <line x1="40" y1="60" x2="40" y2="80" stroke="#222" strokeWidth="2" />
    <line x1="60" y1="60" x2="60" y2="80" stroke="#222" strokeWidth="2" />
  </svg>
);

const RainyWindow: React.FC<SceneProps> = ({ className, seed = 1 }) => {
  const drops = Array.from({ length: 15 }).map((_, i) => {
    const x = ((seed * (i + 1) * 17) % 80) + 10;
    const y = ((seed * (i + 1) * 23) % 70) + 10;
    return <line key={i} x1={x} y1={y} x2={x - 2} y2={y + 4} stroke="#444" strokeWidth="1" opacity={0.6} />;
  });

  return (
    <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
      <rect width="100" height="100" fill="#020202" />
      {/* Window Frame */}
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="#222" strokeWidth="4" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#222" strokeWidth="4" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="#222" strokeWidth="4" />
      {/* Outside vague shape */}
      <circle cx="70" cy="30" r="15" fill="#111" />
      <rect x="20" y="60" width="20" height="30" fill="#0a0a0a" />
      {/* Rain drops */}
      {drops}
    </svg>
  );
};

const StreetLamp: React.FC<SceneProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
    <rect width="100" height="100" fill="#000" />
    {/* Ground */}
    <ellipse cx="50" cy="90" rx="30" ry="5" fill="#111" />
    {/* Lamp post */}
    <rect x="48" y="20" width="4" height="70" fill="#222" />
    <rect x="45" y="85" width="10" height="5" fill="#333" />
    {/* Lamp head */}
    <polygon points="45,20 55,20 60,10 40,10" fill="#333" />
    {/* Light beam (very subtle) */}
    <polygon points="45,20 55,20 80,90 20,90" fill="#fff" opacity="0.03" />
    {/* The bulb */}
    <circle cx="50" cy="22" r="2" fill="#fff" opacity="0.6" />
    <circle cx="50" cy="22" r="5" fill="#fff" opacity="0.1" />
  </svg>
);

const Staircase: React.FC<SceneProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
    <rect width="100" height="100" fill="#050505" />
    {/* Stairs descending right to left */}
    <polygon points="100,20 70,20 70,40 40,40 40,60 10,60 10,100 100,100" fill="#1a1a1a" />
    {/* Treads */}
    <rect x="70" y="20" width="30" height="2" fill="#2a2a2a" />
    <rect x="40" y="40" width="30" height="2" fill="#2a2a2a" />
    <rect x="10" y="60" width="30" height="2" fill="#2a2a2a" />
    {/* Handrail */}
    <line x1="90" y1="5" x2="30" y2="45" stroke="#333" strokeWidth="2" />
    <line x1="85" y1="8" x2="85" y2="20" stroke="#222" strokeWidth="1" />
    <line x1="55" y1="28" x2="55" y2="40" stroke="#222" strokeWidth="1" />
    <line x1="25" y1="48" x2="25" y2="60" stroke="#222" strokeWidth="1" />
  </svg>
);

const CoffeeMug: React.FC<SceneProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} preserveAspectRatio="xMidYMid meet">
    <rect width="100" height="100" fill="#0a0a0a" />
    {/* Table edge */}
    <polygon points="0,60 100,40 100,100 0,100" fill="#111" />
    {/* Coaster */}
    <ellipse cx="45" cy="70" rx="18" ry="6" fill="#1a1a1a" />
    {/* Mug */}
    <rect x="35" y="45" width="20" height="22" rx="2" fill="#2a2a2a" />
    {/* Handle */}
    <path d="M 55 50 C 65 50, 65 60, 55 60" fill="none" stroke="#2a2a2a" strokeWidth="3" />
    {/* Liquid inside */}
    <ellipse cx="45" cy="45" rx="10" ry="3" fill="#050505" />
    {/* Steam */}
    <path d="M 40 40 Q 35 30 45 20" fill="none" stroke="#fff" strokeWidth="1" opacity="0.1" />
    <path d="M 50 42 Q 55 35 45 25" fill="none" stroke="#fff" strokeWidth="1" opacity="0.08" />
  </svg>
);

export const DAILY_SCENES = [
  EmptyBusStop,
  Chair,
  RainyWindow,
  StreetLamp,
  Staircase,
  CoffeeMug,
];
