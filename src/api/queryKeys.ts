export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (filters: Record<string, string | undefined>) =>
      ['companies', 'list', filters] as const,
    me: ['companies', 'me'] as const,
    detail: (slug: string) => ['companies', 'detail', slug] as const,
  },
  subscriptions: {
    me: ['subscriptions', 'me'] as const,
    plans: ['subscriptions', 'plans'] as const,
  },
  fsm: {
    customers: ['fsm', 'customers'] as const,
    customer: (id: string) => ['fsm', 'customers', 'detail', id] as const,
    interventions: (status?: string) => ['fsm', 'interventions', status] as const,
    intervention: (id: string) => ['fsm', 'interventions', 'detail', id] as const,
    quotes: ['fsm', 'quotes'] as const,
    quote: (id: string) => ['fsm', 'quotes', 'detail', id] as const,
    invoices: ['fsm', 'invoices'] as const,
    invoice: (id: string) => ['fsm', 'invoices', 'detail', id] as const,
    calendarBoard: (from: string, to: string) => ['fsm', 'calendar-board', from, to] as const,
    leads: (status?: string) => ['fsm', 'leads', status] as const,
    lead: (id: string) => ['fsm', 'leads', id] as const,
    services: ['fsm', 'services'] as const,
    customerTimeline: (id: string) => ['fsm', 'customers', id, 'timeline'] as const,
  },
  portal: {
    dashboard: ['portal', 'dashboard'] as const,
    leads: ['portal', 'leads'] as const,
    estimate: (id: string) => ['portal', 'estimates', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    bySlug: (slug: string) => ['reviews', 'slug', slug] as const,
    companyMe: ['reviews', 'company', 'me'] as const,
  },
  estimates: {
    blueprints: ['estimates', 'blueprints'] as const,
    projects: ['estimates', 'projects'] as const,
    project: (id: string) => ['estimates', 'projects', id] as const,
    worksheetIntervention: (id: string) => ['estimates', 'worksheet', 'intervention', id] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    pending: ['admin', 'pending'] as const,
    companies: ['admin', 'companies'] as const,
    company: (id: string) => ['admin', 'companies', id] as const,
    audit: (filters: Record<string, string | undefined>) => ['admin', 'audit', filters] as const,
    waitlist: ['admin', 'waitlist'] as const,
    reviews: ['admin', 'reviews'] as const,
    cities: ['admin', 'cities'] as const,
    categories: ['admin', 'categories'] as const,
    clients: ['admin', 'clients'] as const,
  },
};
