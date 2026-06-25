import { cn } from '@/lib/utils';

export const interventionPanelShellClass = 'h-full !p-0 overflow-hidden';

export const interventionPanelHeaderClass =
  'border-b border-[var(--dashboard-divider)] px-5 py-4 sm:px-6';

export const interventionPanelSectionClass = 'px-5 py-5 sm:px-6';

export const interventionSectionTitleClass =
  'text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400';

export const interventionHighlightCardClass =
  'rounded-none border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)] bg-white px-4 py-4';

export const interventionAccentButtonClass =
  'inline-flex cursor-pointer items-center justify-center bg-[var(--dashboard-accent)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50';

export const interventionOutlineButtonClass =
  'inline-flex w-full cursor-pointer items-center justify-center border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:border-[var(--dashboard-accent)]/30 hover:text-[var(--dashboard-accent)]';

export const interventionFieldInputClass =
  'w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--dashboard-accent)]/40 focus:ring-2 focus:ring-[var(--dashboard-accent-light)]';

export function interventionListRowClass(isSelected: boolean): string {
  return cn(
    'cursor-pointer transition-colors hover:bg-[var(--dashboard-accent-light)]/20',
    isSelected && 'bg-[var(--dashboard-accent-light)]/35',
  );
}
