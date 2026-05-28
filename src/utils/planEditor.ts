import type { WorkContext } from '@/types/planEditor';

export function uid() {
  return crypto.randomUUID();
}

export function defaultContextFromSlug(slug?: string): WorkContext {
  if (!slug) return 'general';
  if (slug === 'acoperis') return 'roof';
  if (slug === 'fatade') return 'facade';
  if (['santehnika', 'elektrika', 'lucrari-finisaj', 'okna-dveri', 'mobila', 'cleaning', 'it-networks', 'clima'].includes(slug)) {
    return 'indoor';
  }
  return 'general';
}
