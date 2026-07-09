// V15: The Night Shift
// Invisible infrastructure. Different people quietly run the website at different hours.

export type Shift = 'day' | 'evening' | 'night' | 'afterhours';

export interface ShiftCatConfig {
  sleeperWeight: number;
  wandererWeight: number;
  initialDelayMultiplier: number;
  wanderSleepChance: number;
  recordSleepChance: number;
  afterHoursCloseText: boolean;
}

export function getCurrentShift(): Shift {
  const hour = new Date().getHours();
  if (hour >= 2 && hour < 6) return 'afterhours';
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night'; // 22–2
}

// A single ambient welcome line, shown rarely on load
export function getShiftWelcome(shift: Shift): string {
  const pools: Record<Shift, string[]> = {
    day: [
      'good timing.',
      'nice to see someone.',
      'everything seems normal.',
    ],
    evening: [
      'long day?',
      'glad you stopped by.',
      'we inherited today\'s problems.',
    ],
    night: [
      'we\'re still awake.',
      'it\'s quiet tonight.',
      'night shift just clocked in.',
      'someone made coffee.',
    ],
    afterhours: [
      '...',
      'you came after closing.',
      'keep your voice down.',
    ],
  };
  const pool = pools[shift];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Full microcopy pool for ambient display throughout a session
export function getShiftMicrocopy(shift: Shift): string[] {
  const pools: Record<Shift, string[]> = {
    day: [
      'good timing.',
      'nice to see someone.',
      'everything seems normal.',
      'the cat ignored the meeting.',
      'someone fed the cat twice.',
      'the lights are on.',
    ],
    evening: [
      'long day?',
      'glad you stopped by.',
      'the previous shift left notes.',
      'we inherited today\'s problems.',
      'the lights are still on.',
      'someone made coffee.',
    ],
    night: [
      'night shift just clocked in.',
      'we\'re still awake.',
      'it\'s quiet tonight.',
      'someone made coffee.',
      'the lights are still on.',
      'the cat ignored the meeting.',
      'thanks for keeping us company.',
      'we don\'t really close.',
    ],
    afterhours: [
      '...',
      'you came after closing.',
      'we don\'t really close.',
      'keep your voice down.',
      'the lights are still on.',
    ],
  };
  return pools[shift];
}

// Very rarely — a special event line for this shift (returns null most of the time)
export function getRareShiftEvent(shift: Shift): string | null {
  const rareThreshold: Record<Shift, number> = {
    day: 0.004,
    evening: 0.004,
    night: 0.006,
    afterhours: 0.008,
  };
  if (Math.random() > rareThreshold[shift]) return null;

  const rare: Record<Shift, string[]> = {
    day: [
      'someone fed the cat twice.',
      'we lost today\'s paperwork.',
    ],
    evening: [
      'the previous shift left a note.',
      'everything seems normal.',
    ],
    night: [
      'night shift forgot where they put the record.',
      'thanks for keeping us company.',
      'we lost today\'s paperwork.',
    ],
    afterhours: [
      'you came after closing.',
      'keep your voice down.',
      'we don\'t really close.',
    ],
  };
  const pool = rare[shift];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getShiftCatConfig(shift: Shift): ShiftCatConfig {
  switch (shift) {
    case 'night':
      return {
        sleeperWeight: 35,
        wandererWeight: 25,
        initialDelayMultiplier: 1.0,
        wanderSleepChance: 0.4,
        recordSleepChance: 0.4,
        afterHoursCloseText: false,
      };
    case 'afterhours':
      return {
        sleeperWeight: 45,
        wandererWeight: 10,
        initialDelayMultiplier: 1.2,
        wanderSleepChance: 0.6,
        recordSleepChance: 0.6,
        afterHoursCloseText: true,
      };
    case 'day':
      return {
        sleeperWeight: 10,
        wandererWeight: 45,
        initialDelayMultiplier: 0.8,
        wanderSleepChance: 0.1,
        recordSleepChance: 0.1,
        afterHoursCloseText: false,
      };
    case 'evening':
    default:
      return {
        sleeperWeight: 20,
        wandererWeight: 30,
        initialDelayMultiplier: 1.0,
        wanderSleepChance: 0.2,
        recordSleepChance: 0.2,
        afterHoursCloseText: false,
      };
  }
}

// Volume modifiers for RecordPlayer
export function getShiftAudioConfig(shift: Shift): { startVolume: number; fadeInDuration: number } {
  switch (shift) {
    case 'night':
      return { startVolume: 0.5, fadeInDuration: 4000 };
    case 'afterhours':
      return { startVolume: 0.3, fadeInDuration: 5000 };
    default:
      return { startVolume: 1.0, fadeInDuration: 2500 };
  }
}
