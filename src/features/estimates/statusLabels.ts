export const ESTIMATE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Ciornă',
  MEASURED: 'Măsurători',
  CALCULATED: 'Calculată',
  APPROVED: 'Aprobată',
  SENT: 'Trimisă',
  ACCEPTED: 'Acceptată',
  IN_EXECUTION: 'În execuție',
  DONE: 'Finalizată',
  CANCELLED: 'Anulată',
};

export const ESTIMATE_STATUS_TONES: Record<string, 'gray' | 'blue' | 'violet' | 'amber' | 'emerald'> = {
  DRAFT: 'gray',
  MEASURED: 'blue',
  CALCULATED: 'violet',
  APPROVED: 'violet',
  SENT: 'amber',
  ACCEPTED: 'emerald',
  IN_EXECUTION: 'amber',
  DONE: 'emerald',
  CANCELLED: 'gray',
};

export const WIZARD_STEP_LABELS: Record<string, string> = {
  object: 'Obiect',
  plan: 'Plan 2D/3D',
  diagnostic: 'Diagnostic',
  stages: 'Etape & preț',
  review: 'Revizuire',
};
