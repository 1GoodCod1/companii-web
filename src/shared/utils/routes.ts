import { ROUTE_ABS } from '@/shared/constants/routes.constants';

export function companyAbsolutePath(segment: string): string {
  if (!segment) return ROUTE_ABS.COMPANY;
  return `${ROUTE_ABS.COMPANY}/${segment}`;
}

export function portalAbsolutePath(segment: string): string {
  if (!segment) return ROUTE_ABS.PORTAL;
  return `${ROUTE_ABS.PORTAL}/${segment}`;
}

export function adminAbsolutePath(segment: string): string {
  if (!segment) return ROUTE_ABS.ADMIN;
  return `${ROUTE_ABS.ADMIN}/${segment}`;
}
