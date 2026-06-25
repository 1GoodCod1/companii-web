export const calendarPanelShellClass = 'h-full !p-0 overflow-hidden';

export const calendarPanelHeaderClass =
  'border-b border-[var(--dashboard-divider)] px-5 py-4 sm:px-6';

export const calendarPanelBodyClass = 'space-y-3 px-5 py-5 sm:px-6';

export const calendarCountBadgeClass =
  'inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--dashboard-accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--dashboard-accent)]';

export const calendarInboxLinkClass =
  'text-xs font-semibold text-[var(--dashboard-accent)] transition-opacity hover:opacity-80';

export const calendarDayHeaderClass =
  'flex items-center gap-2 border-b border-[var(--dashboard-divider)] pb-2.5';

export const calendarDayLabelClass =
  'text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500';

export const calendarCardClass =
  'overflow-hidden border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)] bg-white';

export const calendarCardBodyClass = 'space-y-3 p-4';

export const calendarMetaLabelClass =
  'text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400';

export const calendarFieldInputClass =
  'w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--dashboard-accent)]/40 focus:ring-2 focus:ring-[var(--dashboard-accent-light)]';

export const calendarAssignTabClass = (active: boolean) =>
  active
    ? 'border-[var(--dashboard-accent)] bg-[var(--dashboard-accent)] text-white'
    : 'border-gray-200 bg-white text-gray-600 hover:border-[var(--dashboard-accent)]/30 hover:text-[var(--dashboard-accent)]';

export const calendarLeadCardClass =
  'space-y-2.5 border border-[var(--dashboard-divider)] border-l-[3px] border-l-[var(--dashboard-accent)]/60 bg-white p-4';

export const calendarWeekBadgeClass =
  'inline-flex items-center gap-2 border border-[var(--dashboard-divider)] bg-white px-4 py-2 text-xs font-bold text-gray-700';
