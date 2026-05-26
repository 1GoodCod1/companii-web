import type { DurationUnit } from '@/constants/services.constants';

export type ServiceFormState = {
  name: string;
  description: string;
  defaultPrice: string;
  durationValue: string;
  durationUnit: DurationUnit;
  isPublished: boolean;
  materialsCost: string;
};
