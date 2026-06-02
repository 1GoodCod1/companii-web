export type CustomerImportAction = 'create' | 'update' | 'skip' | 'error';

export const CUSTOMER_IMPORT_ACTION_LABELS: Record<CustomerImportAction, string> = {
  create: 'Nou',
  update: 'Actualizare',
  skip: 'Omis',
  error: 'Eroare',
};

export const CUSTOMER_IMPORT_ACTION_TONES: Record<
  CustomerImportAction,
  'emerald' | 'blue' | 'gray' | 'amber'
> = {
  create: 'emerald',
  update: 'blue',
  skip: 'gray',
  error: 'amber',
};
