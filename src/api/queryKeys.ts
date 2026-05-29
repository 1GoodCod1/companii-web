import {
  QUERY_KEY_ADMIN,
  QUERY_KEY_AUTH,
  QUERY_KEY_COMPANIES,
  QUERY_KEY_ESTIMATES,
  QUERY_KEY_FSM,
  QUERY_KEY_PORTAL,
  QUERY_KEY_REVIEWS,
  QUERY_KEY_ROOT,
  QUERY_KEY_SUBSCRIPTIONS,
  QUERY_KEY_TEAM,
} from '@/constants/queryKeys.constants';

export const queryKeys = {
  auth: {
    me: [QUERY_KEY_ROOT.AUTH, QUERY_KEY_AUTH.ME] as const,
  },
  companies: {
    all: [QUERY_KEY_ROOT.COMPANIES] as const,
    list: (filters: Record<string, string | undefined>) =>
      [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.LIST, filters] as const,
    me: [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.ME] as const,
    detail: (slug: string) =>
      [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.DETAIL, slug] as const,
    members: [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.MEMBERS] as const,
    invitations: [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.INVITATIONS] as const,
    cities: [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.CITIES] as const,
    categories: [QUERY_KEY_ROOT.COMPANIES, QUERY_KEY_COMPANIES.CATEGORIES] as const,
    teamInvitePreview: (token: string) =>
      [QUERY_KEY_ROOT.TEAM, QUERY_KEY_TEAM.INVITE_PREVIEW, token] as const,
  },
  subscriptions: {
    me: [QUERY_KEY_ROOT.SUBSCRIPTIONS, QUERY_KEY_SUBSCRIPTIONS.ME] as const,
    plans: [QUERY_KEY_ROOT.SUBSCRIPTIONS, QUERY_KEY_SUBSCRIPTIONS.PLANS] as const,
  },
  fsm: {
    customers: [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.CUSTOMERS] as const,
    customer: (id: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.CUSTOMERS, QUERY_KEY_FSM.DETAIL, id] as const,
    interventions: (status?: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.INTERVENTIONS, status] as const,
    intervention: (id: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.INTERVENTIONS, QUERY_KEY_FSM.DETAIL, id] as const,
    quotes: [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.QUOTES] as const,
    quote: (id: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.QUOTES, QUERY_KEY_FSM.DETAIL, id] as const,
    invoices: [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.INVOICES] as const,
    invoice: (id: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.INVOICES, QUERY_KEY_FSM.DETAIL, id] as const,
    calendarBoard: (from: string, to: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.CALENDAR_BOARD, from, to] as const,
    /** Prefix key — invalidates all lead queries regardless of status filter. */
    leadsAll: [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.LEADS] as const,
    leads: (status?: string) => [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.LEADS, status] as const,
    lead: (id: string) => [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.LEADS, id] as const,
    services: [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.SERVICES] as const,
    customerTimeline: (id: string) =>
      [QUERY_KEY_ROOT.FSM, QUERY_KEY_FSM.CUSTOMERS, id, QUERY_KEY_FSM.TIMELINE] as const,
  },
  portal: {
    dashboard: [QUERY_KEY_ROOT.PORTAL, QUERY_KEY_PORTAL.DASHBOARD] as const,
    leads: [QUERY_KEY_ROOT.PORTAL, QUERY_KEY_PORTAL.LEADS] as const,
    estimate: (id: string) =>
      [QUERY_KEY_ROOT.PORTAL, QUERY_KEY_PORTAL.ESTIMATES, id] as const,
    invitePreview: (token: string) =>
      [QUERY_KEY_ROOT.PORTAL, QUERY_KEY_PORTAL.INVITE_PREVIEW, token] as const,
  },
  reviews: {
    all: [QUERY_KEY_ROOT.REVIEWS] as const,
    bySlug: (slug: string) =>
      [QUERY_KEY_ROOT.REVIEWS, QUERY_KEY_REVIEWS.SLUG, slug] as const,
    companyMe: [QUERY_KEY_ROOT.REVIEWS, QUERY_KEY_REVIEWS.COMPANY, QUERY_KEY_REVIEWS.ME] as const,
  },
  estimates: {
    blueprints: [QUERY_KEY_ROOT.ESTIMATES, QUERY_KEY_ESTIMATES.BLUEPRINTS] as const,
    projects: [QUERY_KEY_ROOT.ESTIMATES, QUERY_KEY_ESTIMATES.PROJECTS] as const,
    project: (id: string) =>
      [QUERY_KEY_ROOT.ESTIMATES, QUERY_KEY_ESTIMATES.PROJECTS, id] as const,
    templates: [QUERY_KEY_ROOT.ESTIMATES, 'templates'] as const,
    template: (id: string) =>
      [QUERY_KEY_ROOT.ESTIMATES, 'templates', id] as const,
    worksheetIntervention: (id: string) =>
      [
        QUERY_KEY_ROOT.ESTIMATES,
        QUERY_KEY_ESTIMATES.WORKSHEET,
        QUERY_KEY_ESTIMATES.INTERVENTION,
        id,
      ] as const,
    myWorksheets: [QUERY_KEY_ROOT.ESTIMATES, QUERY_KEY_ESTIMATES.MY_WORKSHEETS] as const,
  },
  admin: {
    stats: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.STATS] as const,
    pending: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.PENDING] as const,
    companies: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.COMPANIES] as const,
    company: (id: string) =>
      [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.COMPANIES, id] as const,
    audit: (filters: Record<string, string | undefined>) =>
      [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.AUDIT, filters] as const,
    waitlist: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.WAITLIST] as const,
    reviews: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.REVIEWS] as const,
    cities: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.CITIES] as const,
    categories: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.CATEGORIES] as const,
    clients: [QUERY_KEY_ROOT.ADMIN, QUERY_KEY_ADMIN.CLIENTS] as const,
    blueprints: [QUERY_KEY_ROOT.ADMIN, 'blueprints'] as const,
  },
};
