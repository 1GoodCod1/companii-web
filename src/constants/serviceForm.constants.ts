import type { ServiceFormState } from '@/types/serviceForm';

export const EMPTY_SERVICE_FORM: ServiceFormState = {
  name: '',
  description: '',
  defaultPrice: '',
  durationValue: '',
  durationUnit: 'hours',
  isPublished: true,
  materialsCost: '',
};
