import { useExperienceStore } from './store';

// We keep this key exported just in case other parts of the code check it directly
export const SESSION_KEY = 'okayimbored_echoes';

export function addEcho(echo: string) {
  if (typeof sessionStorage === 'undefined') return;
  useExperienceStore.getState().addEcho(echo);
}

export function hasEcho(echo: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return useExperienceStore.getState().echoes.includes(echo);
}

export function getEchoes(): string[] {
  if (typeof sessionStorage === 'undefined') return [];
  return useExperienceStore.getState().echoes;
}

export function hasEchoesAny(echoes: string[]): boolean {
  const current = getEchoes();
  return echoes.some(e => current.includes(e));
}

export function removeEcho(echo: string) {
  if (typeof sessionStorage === 'undefined') return;
  useExperienceStore.getState().removeEcho(echo);
}
