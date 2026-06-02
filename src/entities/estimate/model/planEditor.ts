import type { WorkContext } from '@/entities/estimate/model/planEditor.types';

export function uid() {
  return crypto.randomUUID();
}

export function defaultContextFromSlug(slug?: string): WorkContext {
  if (!slug) return 'general';
  if (slug === 'acoperis' || slug === 'acoperis-plat') return 'roof';
  if (slug === 'fatade') return 'facade';
  if (['santehnika', 'elektrika', 'lucrari-finisaj', 'okna-dveri', 'mobila', 'cleaning', 'it-networks', 'clima'].includes(slug)) {
    return 'indoor';
  }
  return 'general';
}
