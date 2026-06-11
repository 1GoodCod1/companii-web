export const QUERY_KEY_ROOT = {
  AUTH: 'auth',
  COMPANIES: 'companies',
  SUBSCRIPTIONS: 'subscriptions',
  FSM: 'fsm',
  PORTAL: 'portal',
  REVIEWS: 'reviews',
  ESTIMATES: 'estimates',
  ADMIN: 'admin',
  TEAM: 'team',
} as const;

export const QUERY_KEY_AUTH = {
  ME: 'me',
} as const;

export const QUERY_KEY_COMPANIES = {
  LIST: 'list',
  ME: 'me',
  DETAIL: 'detail',
  BOOKING_SLOTS: 'booking-slots',
  MEMBERS: 'members',
  INVITATIONS: 'invitations',
  CITIES: 'cities',
  CATEGORIES: 'categories',
} as const;

export const QUERY_KEY_TEAM = {
  INVITE_PREVIEW: 'invite-preview',
} as const;

export const QUERY_KEY_SUBSCRIPTIONS = {
  ME: 'me',
  PLANS: 'plans',
} as const;

export const QUERY_KEY_FSM = {
  CUSTOMERS: 'customers',
  DETAIL: 'detail',
  INTERVENTIONS: 'interventions',
  QUOTES: 'quotes',
  INVOICES: 'invoices',
  CALENDAR_BOARD: 'calendar-board',
  LEADS: 'leads',
  SERVICES: 'services',
  TIMELINE: 'timeline',
  ANALYTICS: 'analytics',
  PIPELINE_BOARD: 'pipeline-board',
  SEARCH: 'search',
} as const;

export const QUERY_KEY_PORTAL = {
  DASHBOARD: 'dashboard',
  LEADS: 'leads',
  ESTIMATES: 'estimates',
  INVITE_PREVIEW: 'invite-preview',
} as const;

export const QUERY_KEY_REVIEWS = {
  SLUG: 'slug',
  COMPANY: 'company',
  ME: 'me',
} as const;

export const QUERY_KEY_ESTIMATES = {
  BLUEPRINTS: 'blueprints',
  PROJECTS: 'projects',
  WORKSHEET: 'worksheet',
  INTERVENTION: 'intervention',
  MY_WORKSHEETS: 'my-worksheets',
} as const;

export const QUERY_KEY_ADMIN = {
  STATS: 'stats',
  PENDING: 'pending',
  COMPANIES: 'companies',
  AUDIT: 'audit',
  WAITLIST: 'waitlist',
  REVIEWS: 'reviews',
  CITIES: 'cities',
  CATEGORIES: 'categories',
  CLIENTS: 'clients',
  BLUEPRINTS: 'blueprints',
} as const;

export const PERSISTED_QUERY_KEY_PREFIXES = [
  [QUERY_KEY_ROOT.SUBSCRIPTIONS, QUERY_KEY_SUBSCRIPTIONS.PLANS],
  [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.LIST],
  [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.CITIES],
  [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.CATEGORIES],
] as const;
