import type { ServiceFormState } from '@/entities/fsm/model/serviceForm.types';

export const EMPTY_SERVICE_FORM: ServiceFormState = {
  name: '',
  description: '',
  defaultPrice: '',
  durationValue: '',
  durationUnit: 'hours',
  isPublished: true,
  materialsCost: '',
};
