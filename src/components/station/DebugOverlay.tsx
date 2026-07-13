import React from 'react';
import type { DebugInfo, FSMState } from './stationTypes';

// Only render in development
const IS_DEV = import.meta.env.DEV;

interface DebugOverlayProps {
  info: DebugInfo | null;
}

/** Colour-code FSM states for quick scanning */
function stateColor(state: FSMState): string {
  switch (state) {
    case 'IDLE':
    case 'COOLDOWN':       return '#888';
    case 'AUDIO_LEAD':     return '#ff0';
    case 'APPROACHING':
    case 'PASSING':        return '#0af';
    case 'BRAKING':        return '#f80';
    case 'STOPPED':        return '#0f0';
    case 'DOORS_OPEN_AUDIO':
    case 'DOORS_OPEN_WAIT': return '#af0';
    case 'DOORS_CLOSE_AUDIO':
    case 'PRE_DEPART_DELAY': return '#f60';
    case 'DEPARTING':      return '#f0f';
    case 'OFFSCREEN':      return '#666';
    default:               return '#fff';
  }
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ color: color ?? '#eee', fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#333', margin: '4px 0' }} />;
}

export function DebugOverlay({ info }: DebugOverlayProps) {
  if (!IS_DEV || !info) return null;

  const cool = (info.cooldownRemainingMs / 1000).toFixed(1);
  const dwell = (info.dwellRemainingMs / 1000).toFixed(1);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        background: 'rgba(0,0,0,0.88)',
        border: '1px solid #333',
        borderRadius: 6,
        color: '#eee',
        fontFamily: '"Courier New", monospace',
        fontSize: 11,
        lineHeight: 1.7,
        padding: '8px 12px',
        zIndex: 9999,
        minWidth: 260,
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Header */}
      <div style={{ color: '#ff0', fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 }}>
        🚂 STATION DEBUG
      </div>

      <Row label="FSM" value={info.fsmState} color={stateColor(info.fsmState)} />
      <Row label="Event" value={info.eventType ?? '—'} />
      <Row label="Train" value={`${info.configId ?? '—'} / ${info.direction}`} />
      <Row label="Locked" value={info.schedulerLocked ? '🔒 YES' : '🔓 no'} color={info.schedulerLocked ? '#f80' : '#0f0'} />

      <Divider />

      <Row label="Cooldown" value={`${cool}s`} color={info.cooldownRemainingMs > 0 ? '#f80' : '#888'} />
      <Row label="Dwell" value={`${dwell}s`} color={info.dwellRemainingMs > 0 ? '#af0' : '#888'} />

      <Divider />

      <div style={{ color: '#888', marginBottom: 2 }}>Gain values</div>
      {Object.entries(info.gainValues).map(([k, v]) => (
        <div key={k} style={{ paddingLeft: 8, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: '#666' }}>{k}</span>
          <span style={{ color: v > 0 ? '#0af' : '#555' }}>{v.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}
