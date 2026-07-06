import React, { useState, useEffect } from 'react';
import { PixelCat, type CatState } from './PixelCat';

const STATES: CatState[] = ['walking_right', 'walking_left', 'idle', 'idle_to_sleeping', 'sleeping', 'sleeping_to_idle', 'angry'];

const DESCRIPTIONS: Record<CatState, string> = {
  walking_right:    'moves slowly across the screen',
  walking_left:     'moves slowly across the screen',
  idle:             'stops. stays. does not explain itself',
  idle_to_sleeping: 'lies down to sleep',
  sleeping:         'lies down. breathes. ignores you',
  sleeping_to_idle: 'waking up from sleep',
  angry:            'not listening right now. mildly annoyed',
};

// The actual sequences from LivingCat.tsx, displayed as visit previews
const SEQUENCES = [
  { label: 'just sits',         steps: ['idle'] },
  { label: 'sits → sleeps',     steps: ['idle', 'idle_to_sleeping', 'sleeping', 'sleeping_to_idle', 'idle'] },
  { label: 'sleeps',            steps: ['idle', 'idle_to_sleeping', 'sleeping', 'sleeping_to_idle', 'idle'] },
  { label: 'passing through',   steps: ['idle'] },
  { label: 'angry → sits',      steps: ['angry', 'idle'] },
];

// Single cat state card
function CatCard({ state }: { state: CatState }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '32px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{ width: 120, height: 120 }}>
        <PixelCat state={state} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          {state}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.5 }}>
          {DESCRIPTIONS[state]}
        </div>
      </div>
    </div>
  );
}

// Live visit preview — cycles through a sequence of states
function VisitPreview({ steps, label }: { steps: string[]; label: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<'walk-in' | 'idle' | 'walk-out'>('walk-in');

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'walk-in') {
      t = setTimeout(() => setPhase('idle'), 1800);
    } else if (phase === 'idle') {
      if (stepIndex < steps.length - 1) {
        t = setTimeout(() => setStepIndex(i => i + 1), 3000);
      } else {
        t = setTimeout(() => setPhase('walk-out'), 3000);
      }
    } else {
      t = setTimeout(() => {
        setStepIndex(0);
        setPhase('walk-in');
      }, 1800);
    }
    return () => clearTimeout(t);
  }, [phase, stepIndex, steps.length]);

  const currentState: CatState =
    phase === 'walk-in' ? 'walking_right' :
    phase === 'walk-out' ? 'walking_left' :
    (steps[stepIndex] as CatState);

  const walkX =
    phase === 'walk-in'  ? '0%' :
    phase === 'idle'     ? '30%' :
    '100%';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: '20px 20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Track */}
      <div style={{ position: 'relative', height: 72, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: walkX,
            width: 72,
            height: 72,
            transition: 'left 1.6s linear',
          }}
        >
          <PixelCat state={currentState} />
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            title={step}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background:
                phase === 'idle' && stepIndex === i
                  ? 'rgba(255,255,255,0.7)'
                  : 'rgba(255,255,255,0.15)',
              transition: 'background 0.4s',
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

export default function CatsShowcase() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          dev preview
        </div>
        <h1 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 28, fontWeight: 500, margin: 0, marginBottom: 10 }}>
          The Cats
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 420 }}>
          They appear on the live site after ~40 seconds. One at a time.
          Nobody announces them. They don't care.
        </p>
      </div>

      {/* All states */}
      <div style={{ marginBottom: 16, color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        States
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 64,
        }}
      >
        {STATES.map(s => <CatCard key={s} state={s} />)}
      </div>

      {/* Visit sequences */}
      <div style={{ marginBottom: 16, color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Visit Sequences
      </div>
      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 380 }}>
        Each visit picks one of these randomly. The cat always walks in, does its thing, then leaves.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {SEQUENCES.map((seq, i) => (
          <VisitPreview key={i} steps={seq.steps} label={seq.label} />
        ))}
      </div>

      {/* Timing info */}
      <div
        style={{
          marginTop: 64,
          padding: '24px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 24,
        }}
      >
        {[
          { label: 'First appearance', value: '35 – 50 seconds' },
          { label: 'Gap between visits', value: '1 – 3 minutes' },
          { label: 'Max cats on screen', value: '1' },
          { label: 'Walk speed', value: '28 px/s' },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
