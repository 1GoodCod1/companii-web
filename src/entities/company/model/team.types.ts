import type { CompanyRole } from '@/entities/company/model/roles.types';

export type TeamRoleKey = CompanyRole;
export type TeamRoleConfig = {
  label: string;
  sectionTitle: string;
  description: string;
  badgeTone: 'violet' | 'emerald' | 'amber' | 'blue' | 'gray';
  avatarClass: string;
  responsibilities: string[];
};
