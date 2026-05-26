import { INTERVENTION_CALENDAR_STATUS_TONES } from '@/constants/interventionStatus.constants';
import type { LeadSoftBadgeTone } from '@/types/lead';
import { formatWeekRangeLabel } from '@/utils/date';

export function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export { formatWeekRangeLabel as formatWeekLabel };

export function statusTone(status: string): LeadSoftBadgeTone {
  return INTERVENTION_CALENDAR_STATUS_TONES[status] ?? 'gray';
}
