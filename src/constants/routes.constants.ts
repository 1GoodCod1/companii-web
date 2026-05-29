import { ACCOUNT_KIND } from '@/constants/roles.constants';
import type { AccountKind } from '@/types/roles';

/** Top-level route segments mounted under RootLayout. */
export const ROUTE_ROOT = {
  COMPANY: 'company',
  PORTAL: 'portal',
  ADMIN: 'admin',
} as const;

export const ROUTE_ABS = {
  HOME: '/',
  COMPANY: '/company',
  PORTAL: '/portal',
  ADMIN: '/admin',
} as const;

/** Public pages — path segments under PublicLayout. */
export const PUBLIC_ROUTE = {
  COMPANII: 'companii',
  HOW_IT_WORKS: 'how-it-works',
  FAQ: 'faq',
  CONTACTS: 'contacts',
  PRIVACY: 'privacy',
  TERMS: 'terms',
  SUBSCRIPTIONS: 'subscriptions',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  COMPANIES: 'companies',
  COMPANY_DETAIL: 'companies/:slug',
} as const;

export const INVITE_ROUTE = {
  PORTAL: 'portal/invite',
  TEAM: 'team/invite',
} as const;

/** Company cabinet segments — React Router `path` under /company. */
export const COMPANY_ROUTE = {
  DASHBOARD: '',
  PROFILE: 'profile',
  TEAM: 'team',
  CLIENTI: 'clienti',
  CERERI: 'cereri',
  LUCRARI: 'lucrari',
  LUCRARI_MY: 'lucrari/my',
  CALENDAR: 'calendar',
  LUCRARI_FISA: 'lucrari/:id/fisa',
  SMETE: 'smete',
  SMETE_TEMPLATES: 'smete/templates',
  SMETE_PRICING: 'smete/coeficienti',
  SMETE_NEW: 'smete/new',
  SMETE_DETAIL: 'smete/:id',
  OFERTE: 'oferte',
  SERVICII: 'servicii',
  FACTURI: 'facturi',
  RECENZII: 'recenzii',
  SUBSCRIPTION: 'subscription',
  SETTINGS: 'settings',
  AUDIT: 'audit',
} as const;

/**
 * Relative paths for guards, nav, plan entitlements.
 * Leading slash, no dynamic params.
 */
export const COMPANY_CABINET_PATH = {
  DASHBOARD: '',
  PROFILE: '/profile',
  TEAM: '/team',
  CLIENTI: '/clienti',
  CERERI: '/cereri',
  LUCRARI: '/lucrari',
  LUCRARI_MY: '/lucrari/my',
  CALENDAR: '/calendar',
  LUCRARI_FISA: '/lucrari/fisa',
  SMETE: '/smete',
  SMETE_TEMPLATES: '/smete/templates',
  SMETE_PRICING: '/smete/coeficienti',
  OFERTE: '/oferte',
  SERVICII: '/servicii',
  FACTURI: '/facturi',
  RECENZII: '/recenzii',
  SUBSCRIPTION: '/subscription',
  SETTINGS: '/settings',
  AUDIT: '/audit',
} as const;

export const PORTAL_ROUTE = {
  DASHBOARD: '',
  CERERI: 'cereri',
  LUCRARI: 'lucrari',
  OFERTE: 'oferte',
  SMETE: 'smete',
  FACTURI: 'facturi',
} as const;

export const ADMIN_ROUTE = {
  DASHBOARD: '',
  COMPANIES: 'companies',
  SUBSCRIPTIONS: 'subscriptions',
  WAITLIST: 'waitlist',
  REVIEWS: 'reviews',
  AUDIT: 'audit',
  CITIES: 'cities',
  CATEGORIES: 'categories',
  CLIENTS: 'clients',
  BLUEPRINTS: 'blueprints',
} as const;

/** Account kinds allowed per top-level cabinet route. */
export const ROUTE_ACCESS = {
  COMPANY_CABINET: [ACCOUNT_KIND.COMPANY_STAFF, ACCOUNT_KIND.PLATFORM_ADMIN] as const satisfies readonly AccountKind[],
  END_CLIENT: [ACCOUNT_KIND.END_CLIENT] as const satisfies readonly AccountKind[],
  PLATFORM_ADMIN: [ACCOUNT_KIND.PLATFORM_ADMIN] as const satisfies readonly AccountKind[],
} as const;
