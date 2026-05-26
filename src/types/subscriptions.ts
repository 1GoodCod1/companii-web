import {
  CLAIM_FREE_PLAN_CODES,
  SUBSCRIPTION_PLAN,
} from '@/constants/subscriptions.constants';

export type CompanySubscriptionPlanCode =
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

export type ClaimableSubscriptionPlanCode = (typeof CLAIM_FREE_PLAN_CODES)[number];

export interface CompanyPlanDto {
  id: string;
  code: CompanySubscriptionPlanCode;
  name: string;
  price: string | number;
  currency: string;
  maxTechnicians: number | null;
  maxInterventionsPerMonth: number | null;
  features: string[] | Record<string, unknown>;
}

export interface CompanySubscriptionDto {
  id: string;
  companyId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  currentPeriodEnd: string;
  plan: CompanyPlanDto;
  usage?: {
    activeTechnicians: number;
    pendingTechnicianInvites: number;
    interventionsThisMonth: number;
    maxTechnicians: number | null;
    maxInterventionsPerMonth: number | null;
  };
}
