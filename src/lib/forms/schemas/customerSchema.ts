import { z } from 'zod';
import type { TFunction } from 'i18next';

export type CustomerFormValues = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export function createCustomerSchema(t: TFunction) {
  return z.object({
    fullName: z.string().trim().min(1, t('validation.required')),
    phone: z.string().trim().min(1, t('validation.required')),
    email: z
      .string()
      .trim()
      .refine((value) => value === '' || z.email().safeParse(value).success, t('validation.email')),
    address: z.string().trim().min(1, t('validation.required')),
    notes: z.string(),
  }) satisfies z.ZodType<CustomerFormValues>;
}
