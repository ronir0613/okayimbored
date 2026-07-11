import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ExperienceState {
  echoes: string[];
  restlessness_score: number;
  curiosity_score: number;
  pity_timer: number;
  
  addEcho: (echo: string) => void;
  removeEcho: (echo: string) => void;
  incrementRestlessness: () => void;
  incrementCuriosity: () => void;
  incrementPityTimer: () => void;
  resetPityTimer: () => void;
}

export const useExperienceStore = create<ExperienceState>()(
  persist(
    (set) => ({
      echoes: [],
      restlessness_score: 0,
      curiosity_score: 0,
      pity_timer: 0,

      addEcho: (echo: string) => 
        set((state) => ({
          echoes: state.echoes.includes(echo) ? state.echoes : [...state.echoes, echo]
        })),
        
      removeEcho: (echo: string) =>
        set((state) => ({
          echoes: state.echoes.filter((e) => e !== echo)
        })),

      incrementRestlessness: () => 
        set((state) => ({ restlessness_score: state.restlessness_score + 1 })),
        
      incrementCuriosity: () => 
        set((state) => ({ curiosity_score: state.curiosity_score + 2 })),
        
      incrementPityTimer: () => 
        set((state) => ({ pity_timer: state.pity_timer + 1 })),
        
      resetPityTimer: () => 
        set({ pity_timer: 0 }),
    }),
    {
      name: 'okayimbored_state_metrics',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
