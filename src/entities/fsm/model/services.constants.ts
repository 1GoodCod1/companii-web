export type DurationUnit = 'minutes' | 'hours' | 'days';

export const DURATION_UNIT_OPTIONS: Array<{ value: DurationUnit; label: string }> = [
  { value: 'minutes', label: 'Minute' },
  { value: 'hours', label: 'Ore' },
  { value: 'days', label: 'Zile' },
];
