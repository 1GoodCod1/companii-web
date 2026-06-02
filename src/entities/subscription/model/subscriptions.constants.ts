export const SUBSCRIPTION_PLAN = {
  FREE: 'FREE',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS',
} as const;

export const CLAIM_FREE_PLAN_CODES = [
  SUBSCRIPTION_PLAN.PRO,
  SUBSCRIPTION_PLAN.BUSINESS,
] as const;

export const SUBSCRIPTION_PLAN_CODES = Object.values(SUBSCRIPTION_PLAN);

export const PLAN_RANK: Record<
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN],
  number
> = {
  [SUBSCRIPTION_PLAN.FREE]: 0,
  [SUBSCRIPTION_PLAN.PRO]: 1,
  [SUBSCRIPTION_PLAN.BUSINESS]: 2,
};

export const PLAN_LABELS: Record<
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN],
  string
> = {
  [SUBSCRIPTION_PLAN.FREE]: 'Free',
  [SUBSCRIPTION_PLAN.PRO]: 'Pro',
  [SUBSCRIPTION_PLAN.BUSINESS]: 'Business',
};

export const PLAN_ACCENTS: Record<
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN],
  { ring: string; badge: string; btn: string }
> = {
  [SUBSCRIPTION_PLAN.FREE]: {
    ring: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    btn: 'bg-gray-900 hover:bg-gray-800 text-white',
  },
  [SUBSCRIPTION_PLAN.PRO]: {
    ring: 'border-violet-300 ring-2 ring-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white',
  },
  [SUBSCRIPTION_PLAN.BUSINESS]: {
    ring: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
};

export const DEFAULT_SUBSCRIPTION_PLAN = SUBSCRIPTION_PLAN.FREE;
