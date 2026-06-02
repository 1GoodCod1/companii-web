import type { CompanyServiceDto } from '@/entities/fsm/model/types';
import type { ServiceFormState } from '@/entities/fsm/model/serviceForm.types';
import {
  durationFormToMinutes,
  minutesToDurationForm,
} from '@/entities/fsm/model/serviceDuration';

export function serviceToForm(service: CompanyServiceDto): ServiceFormState {
  const duration = minutesToDurationForm(service.durationMinutes);
  return {
    name: service.name,
    description: service.description ?? '',
    defaultPrice: String(service.defaultPrice),
    durationValue: duration.value,
    durationUnit: duration.unit,
    isPublished: service.isPublished ?? false,
    materialsCost: service.materialsCost != null ? String(service.materialsCost) : '',
  };
}

export function buildServicePayload(
  form: ServiceFormState,
  canUseInternalPricing: boolean,
): {
  name: string;
  description: string;
  defaultPrice: number;
  isPublished: boolean;
  durationMinutes?: number;
  materialsCost?: number | null;
} {
  const durationMinutes = form.durationValue.trim()
    ? durationFormToMinutes(form.durationValue, form.durationUnit) ?? undefined
    : undefined;

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    defaultPrice: Number(form.defaultPrice),
    isPublished: form.isPublished,
    ...(durationMinutes != null ? { durationMinutes } : {}),
    ...(canUseInternalPricing
      ? { materialsCost: form.materialsCost.trim() ? Number(form.materialsCost) : null }
      : {}),
  };
}
