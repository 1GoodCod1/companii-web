import { useEffect } from 'react';
import {
  Calendar,
  Calculator,
  ClipboardList,
  BookOpen,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  List,
  MessageSquareQuote,
  Receipt,
  Settings,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { CabinetShell } from './CabinetShell';
import { useMySubscriptionQuery } from '@/features/subscriptions/api/useSubscriptions';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useLeadsQuery } from '@/features/fsm/api/useFsm';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';
import { COMPANY_ROUTE_MIN_PLAN, hasMinPlan } from '@/config/planEntitlements';
import { SUBSCRIPTION_PLAN } from '@/constants/subscriptions.constants';
import { LEAD_STATUS } from '@/constants/leadStatus.constants';
import { canAccessCompanyRoute } from '@/utils/roleAccess';
import type { CompanySubscriptionPlanCode } from '@/types/subscriptions';
import type { CabinetNavItem, CabinetNavSection } from '@/components/layout/cabinet-nav';
import { resolveCompanyRole } from '@/components/layout/cabinet-nav';
import { CompanySwitcher } from '@/components/layout/CompanySwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyContextStore } from '@/stores/companyContextStore';
import { refreshAuthSession } from '@/features/auth/api/useAuth';
import {
  COMPANY_NAV_SECTION_LABELS,
  COMPANY_NAV_SECTION_ORDER,
} from '@/constants/companyNav.constants';

const NAV_DEFS: Array<
  CabinetNavItem & { sectionKey: 'main' | 'operations' | 'company'; minPlanKey: string }
> = [
  {
    key: 'dashboard',
    sectionKey: 'main',
    to: '',
    labelKey: 'company.dashboard.nav',
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
    key: 'smeteTemplates',
    sectionKey: 'operations',
    to: '/smete/templates',
    labelKey: 'company.smeteTemplates',
    icon: <BookOpen />,
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
    key: 'audit',
    sectionKey: 'company',
    to: '/audit',
    labelKey: 'company.audit',
    icon: <ClipboardList />,
    minPlanKey: '',
  },
  {
    key: 'subscription',
    sectionKey: 'company',
    to: '/subscription',
    labelKey: 'company.subscription',
    icon: <CreditCard />,
    minPlanKey: '/subscription',
  },
  {
    key: 'settings',
    sectionKey: 'company',
    to: '/settings',
    labelKey: 'company.settings',
    icon: <Settings />,
    minPlanKey: '',
  },
];

function buildCompanySections(
  currentPlan: string | undefined,
  companyRole: string | undefined,
): CabinetNavSection[] {
  const visible = NAV_DEFS.filter((item) => {
    const roleAllowed = canAccessCompanyRoute(companyRole, item.to);
    if (!roleAllowed) return false;

    const required = COMPANY_ROUTE_MIN_PLAN[item.minPlanKey];
    if (!required) return true;
    return hasMinPlan(currentPlan as CompanySubscriptionPlanCode | undefined, required);
  });

  return COMPANY_NAV_SECTION_ORDER.flatMap((sectionKey) => {
    const items = visible
      .filter((item) => item.sectionKey === sectionKey)
      .map(({ key, to, labelKey, icon, badge }) => ({ key, to, labelKey, icon, badge }));

    if (items.length === 0) return [];

    return [{
      key: sectionKey,
      labelKey: COMPANY_NAV_SECTION_LABELS[sectionKey],
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
  const { isManagement } = useCompanyPermissions();
  const cereriPlanAllowed = hasMinPlan(currentPlan, SUBSCRIPTION_PLAN.PRO);
  const cereriRoleAllowed = canAccessCompanyRoute(profileRole, '/cereri');
  const { data: newLeads } = useLeadsQuery(LEAD_STATUS.NEW, {
    enabled: isManagement && cereriPlanAllowed && cereriRoleAllowed && !!activeCompanyId,
  });
  const newLeadCount = newLeads?.length ?? 0;

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

  const sections = buildCompanySections(currentPlan, profileRole).map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.key === 'cereri' && newLeadCount > 0
        ? { ...item, badge: newLeadCount > 99 ? '99+' : newLeadCount }
        : item,
    ),
  }));

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
