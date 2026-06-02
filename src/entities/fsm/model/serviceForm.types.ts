import type { DurationUnit } from '@/entities/fsm/model/services.constants';

export type ServiceFormState = {
  name: string;
  description: string;
  defaultPrice: string;
  durationValue: string;
  durationUnit: DurationUnit;
  isPublished: boolean;
  materialsCost: string;
};
