import { COMPANY_CABINET_PATH } from '@/constants/routes.constants';

export type CompanyCabinetPath =
  (typeof COMPANY_CABINET_PATH)[keyof typeof COMPANY_CABINET_PATH];
