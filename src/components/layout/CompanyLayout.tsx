import { useEffect } from 'react';
import {
  Calendar,
  Calculator,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  List,
  MessageSquareQuote,
  Package,
  Receipt,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { CabinetShell } from './CabinetShell';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { COMPANY_NAV_PLAN, hasMinPlan } from '@/features/subscriptions/planAccess';
import { canAccessCompanyRoute } from '@/features/companies/roleAccess';
import type { CompanySubscriptionPlanCode } from '@/features/subscriptions/types';
import type { CabinetNavItem, CabinetNavSection } from '@/components/layout/cabinet-nav';
import { resolveCompanyRole } from '@/components/layout/cabinet-nav';
import { CompanySwitcher } from '@/components/layout/CompanySwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { refreshAuthSession } from '@/features/auth/api/useAuth';

const NAV_DEFS: Array<
  CabinetNavItem & { sectionKey: 'main' | 'operations' | 'company'; minPlanKey: string }
> = [
  {
    key: 'dashboard',
    sectionKey: 'main',
    to: '',
    labelKey: 'company.dashboard',
    icon: <LayoutDashboard />,
    minPlanKey: '',
  },
  {
    key: 'profile',
    sectionKey: 'main',
    to: '/profile',
    labelKey: 'company.profile',
    icon: <User />,
    minPlanKey: '/profile',
  },
  {
    key: 'clienti',
    sectionKey: 'operations',
    to: '/clienti',
    labelKey: 'company.clienti',
    icon: <Users />,
    minPlanKey: '/clienti',
  },
  {
    key: 'cereri',
    sectionKey: 'operations',
    to: '/cereri',
    labelKey: 'company.cereri',
    icon: <Inbox />,
    minPlanKey: '/cereri',
  },
  {
    key: 'lucrari',
    sectionKey: 'operations',
    to: '/lucrari',
    labelKey: 'company.lucrari',
    icon: <Wrench />,
    minPlanKey: '/lucrari',
  },
  {
    key: 'calendar',
    sectionKey: 'operations',
    to: '/calendar',
    labelKey: 'company.calendar',
    icon: <Calendar />,
    minPlanKey: '/calendar',
  },
  {
    key: 'packages',
    sectionKey: 'operations',
    to: '/packages',
    labelKey: 'company.packages',
    icon: <Package />,
    minPlanKey: '/packages',
  },
  {
    key: 'servicii',
    sectionKey: 'operations',
    to: '/servicii',
    labelKey: 'company.servicii',
    icon: <List />,
    minPlanKey: '/servicii',
  },
  {
    key: 'smete',
    sectionKey: 'operations',
    to: '/smete',
    labelKey: 'company.smete',
    icon: <Calculator />,
    minPlanKey: '/smete',
  },
  {
    key: 'oferte',
    sectionKey: 'operations',
    to: '/oferte',
    labelKey: 'company.oferte',
    icon: <FileText />,
    minPlanKey: '/oferte',
  },
  {
    key: 'facturi',
    sectionKey: 'operations',
    to: '/facturi',
    labelKey: 'company.facturi',
    icon: <Receipt />,
    minPlanKey: '/facturi',
  },
  {
    key: 'recenzii',
    sectionKey: 'operations',
    to: '/recenzii',
    labelKey: 'company.recenzii',
    icon: <MessageSquareQuote />,
    minPlanKey: '/recenzii',
  },
  {
    key: 'team',
    sectionKey: 'company',
    to: '/team',
    labelKey: 'company.team',
    icon: <Users />,
    minPlanKey: '/team',
  },
  {
    key: 'subscription',
    sectionKey: 'company',
    to: '/subscription',
    labelKey: 'company.subscription',
    icon: <CreditCard />,
    minPlanKey: '/subscription',
  },
];

const SECTION_ORDER = ['main', 'operations', 'company'] as const;

const SECTION_LABELS: Record<(typeof SECTION_ORDER)[number], string> = {
  main: 'company.sections.main',
  operations: 'company.sections.operations',
  company: 'company.sections.company',
};

function buildCompanySections(
  currentPlan: string | undefined,
  companyRole: string | undefined,
): CabinetNavSection[] {
  const visible = NAV_DEFS.filter((item) => {
    const roleAllowed = canAccessCompanyRoute(companyRole, item.to);
    if (!roleAllowed) return false;

    const required = COMPANY_NAV_PLAN[item.minPlanKey];
    if (!required) return true;
    return hasMinPlan(currentPlan as CompanySubscriptionPlanCode | undefined, required);
  });

  return SECTION_ORDER.flatMap((sectionKey) => {
    const items = visible
      .filter((item) => item.sectionKey === sectionKey)
      .map(({ key, to, labelKey, icon }) => ({ key, to, labelKey, icon }));

    if (items.length === 0) return [];

    return [{
      key: sectionKey,
      labelKey: SECTION_LABELS[sectionKey],
      items,
    }];
  });
}

export function CompanyLayout() {
  const user = useAuthStore((s) => s.user);
  const contextCompanyId = useCompanyContextStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useCompanyContextStore((s) => s.setActiveCompanyId);
  const activeCompanyId = contextCompanyId ?? user?.activeCompanyId;
  const { data: subData } = useMySubscriptionQuery();
  const { data: companyMe } = useCompanyMeQuery();
  const activeCompany =
    companyMe?.owned.find((company) => company.id === activeCompanyId) ??
    companyMe?.memberships.find((membership) => membership.companyId === activeCompanyId)?.company ??
    companyMe?.owned[0];
  const subscription = subData as { plan?: { code?: CompanySubscriptionPlanCode } } | null | undefined;
  const currentPlan =
    subscription?.plan?.code ??
    (activeCompany?.subscription?.plan?.code as CompanySubscriptionPlanCode | undefined);
  const profileRole = resolveCompanyRole(user?.companyRole, companyMe, activeCompanyId);

  useEffect(() => {
    if (!companyMe) return;

    const validIds = new Set([
      ...companyMe.owned.map((company) => company.id),
      ...companyMe.memberships.map((membership) => membership.companyId),
    ]);
    const preferred =
      user?.activeCompanyId ??
      companyMe.owned[0]?.id ??
      companyMe.memberships[0]?.companyId ??
      null;

    if (activeCompanyId && !validIds.has(activeCompanyId) && preferred) {
      setActiveCompanyId(preferred);
      return;
    }

    if (!activeCompanyId && preferred) {
      setActiveCompanyId(preferred);
      return;
    }

    if (!user?.companyRole) {
      void refreshAuthSession();
    }
  }, [companyMe, user?.activeCompanyId, user?.companyRole, activeCompanyId, setActiveCompanyId]);

  const sections = buildCompanySections(currentPlan, profileRole);

  return (
    <CabinetShell
      basePath="/company"
      sections={sections}
      currentPlanCode={currentPlan}
      profileAvatarUrl={activeCompany?.logoUrl}
      profileRole={profileRole}
      sidebarExtras={<CompanySwitcher />}
    />
  );
}
