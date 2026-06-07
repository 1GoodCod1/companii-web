import { useEffect, useMemo } from 'react';
import {
  CalendarIcon,
  CalculatorIcon,
  ClipboardTextIcon,
  BookOpenIcon,
  CreditCardIcon,
  FileTextIcon,
  ImagesIcon,
  KanbanIcon,
  TrayIcon,
  LayoutIcon,
  ListIcon,
  ChatCircleTextIcon,
  ReceiptIcon,
  GearIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import { CabinetShell } from './CabinetShell';
import { useMySubscriptionQuery } from '@/entities/subscription/api/useSubscriptions';
import { useCompanyMeQuery } from '@/features/companies/api/useCompanies';
import { useLeadsQuery } from '@/features/fsm';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';
import { COMPANY_ROUTE_MIN_PLAN, hasMinPlan } from '@/entities/subscription/model/planEntitlements';
import { SUBSCRIPTION_PLAN } from '@/entities/subscription/model/subscriptions.constants';
import { LEAD_STATUS } from '@/entities/fsm/model/leadStatus.constants';
import { canAccessCompanyRoute } from '@/entities/company/model/roleAccess';
import type { CompanySubscriptionPlanCode } from '@/entities/subscription/model/types';
import type { CabinetNavItem, CabinetNavSection } from '@/widgets/layout/cabinet-nav';
import { resolveCompanyRole } from '@/widgets/layout/cabinet-nav';
import { CompanySwitcher } from '@/widgets/layout/CompanySwitcher';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useCompanyContextStore } from '@/entities/company/model/companyContextStore';
import { refreshAuthSession } from '@/features/auth';
import {
  COMPANY_COMPANY_GROUP_LABELS,
  COMPANY_COMPANY_GROUP_ORDER,
  COMPANY_NAV_SECTION_LABELS,
  COMPANY_NAV_SECTION_ORDER,
  COMPANY_OPERATIONS_GROUP_LABELS,
  COMPANY_OPERATIONS_GROUP_ORDER,
  type CompanyCompanyGroupKey,
  type CompanyNavSectionKey,
  type CompanyOperationsGroupKey,
} from '@/entities/company/model/companyNav.constants';

type NavDef = CabinetNavItem & {
  sectionKey: CompanyNavSectionKey;
  groupKey?: CompanyOperationsGroupKey | CompanyCompanyGroupKey;
  minPlanKey: string;
};

const NAV_DEFS: NavDef[] = [
  {
    key: 'dashboard',
    sectionKey: 'main',
    to: '',
    labelKey: 'company.dashboard.nav',
    icon: <LayoutIcon />,
    minPlanKey: '',
  },
  {
    key: 'clienti',
    sectionKey: 'operations',
    groupKey: 'clients',
    to: '/clienti',
    labelKey: 'company.clienti',
    icon: <UsersIcon />,
    minPlanKey: '/clienti',
  },
  {
    key: 'cereri',
    sectionKey: 'operations',
    groupKey: 'clients',
    to: '/cereri',
    labelKey: 'company.cereri',
    icon: <TrayIcon />,
    minPlanKey: '/cereri',
  },
  {
    key: 'pipeline',
    sectionKey: 'operations',
    groupKey: 'clients',
    to: '/pipeline',
    labelKey: 'company.pipeline',
    icon: <KanbanIcon />,
    minPlanKey: '/pipeline',
  },
  {
    key: 'lucrari',
    sectionKey: 'operations',
    groupKey: 'work',
    to: '/lucrari',
    labelKey: 'company.lucrari',
    icon: <WrenchIcon />,
    minPlanKey: '/lucrari',
  },
  {
    key: 'calendar',
    sectionKey: 'operations',
    groupKey: 'work',
    to: '/calendar',
    labelKey: 'company.calendar',
    icon: <CalendarIcon />,
    minPlanKey: '/calendar',
  },
  {
    key: 'smete',
    sectionKey: 'operations',
    groupKey: 'finance',
    to: '/smete',
    labelKey: 'company.smete',
    icon: <CalculatorIcon />,
    minPlanKey: '/smete',
  },
  {
    key: 'smeteTemplates',
    sectionKey: 'operations',
    groupKey: 'finance',
    to: '/smete/templates',
    labelKey: 'company.smeteTemplates',
    icon: <BookOpenIcon />,
    minPlanKey: '/smete',
  },
  {
    key: 'oferte',
    sectionKey: 'operations',
    groupKey: 'finance',
    to: '/oferte',
    labelKey: 'company.oferte',
    icon: <FileTextIcon />,
    minPlanKey: '/oferte',
  },
  {
    key: 'facturi',
    sectionKey: 'operations',
    groupKey: 'finance',
    to: '/facturi',
    labelKey: 'company.facturi',
    icon: <ReceiptIcon />,
    minPlanKey: '/facturi',
  },
  {
    key: 'servicii',
    sectionKey: 'operations',
    groupKey: 'catalog',
    to: '/servicii',
    labelKey: 'company.servicii',
    icon: <ListIcon />,
    minPlanKey: '/servicii',
  },
  {
    key: 'recenzii',
    sectionKey: 'operations',
    groupKey: 'catalog',
    to: '/recenzii',
    labelKey: 'company.recenzii',
    icon: <ChatCircleTextIcon />,
    minPlanKey: '/recenzii',
  },
  {
    key: 'profile',
    sectionKey: 'company',
    groupKey: 'profile',
    to: '/profile',
    labelKey: 'company.profile',
    icon: <UserIcon />,
    minPlanKey: '/profile',
  },
  {
    key: 'gallery',
    sectionKey: 'company',
    groupKey: 'profile',
    to: '/gallery',
    labelKey: 'company.gallery',
    icon: <ImagesIcon />,
    minPlanKey: '/gallery',
  },
  {
    key: 'team',
    sectionKey: 'company',
    groupKey: 'admin',
    to: '/team',
    labelKey: 'company.team',
    icon: <UsersIcon />,
    minPlanKey: '/team',
  },
  {
    key: 'subscription',
    sectionKey: 'company',
    groupKey: 'admin',
    to: '/subscription',
    labelKey: 'company.subscription',
    icon: <CreditCardIcon />,
    minPlanKey: '/subscription',
  },
  {
    key: 'settings',
    sectionKey: 'company',
    groupKey: 'admin',
    to: '/settings',
    labelKey: 'company.settings',
    icon: <GearIcon />,
    minPlanKey: '',
  },
  {
    key: 'audit',
    sectionKey: 'company',
    groupKey: 'admin',
    to: '/audit',
    labelKey: 'company.audit',
    icon: <ClipboardTextIcon />,
    minPlanKey: '',
  },
];

function buildGroupItems(
  visible: NavDef[],
  sectionKey: CompanyNavSectionKey,
  groupKey: CompanyOperationsGroupKey | CompanyCompanyGroupKey,
): CabinetNavItem[] {
  return visible
    .filter((item) => item.sectionKey === sectionKey && item.groupKey === groupKey)
    .map(({ key, to, labelKey, icon, badge }) => ({ key, to, labelKey, icon, badge }));
}

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

  const sections: CabinetNavSection[] = [];

  for (const sectionKey of COMPANY_NAV_SECTION_ORDER) {
    if (sectionKey === 'main') {
      const items = visible
        .filter((item) => item.sectionKey === 'main')
        .map(({ key, to, labelKey, icon, badge }) => ({ key, to, labelKey, icon, badge }));

      if (items.length > 0) {
        sections.push({
          key: sectionKey,
          labelKey: COMPANY_NAV_SECTION_LABELS[sectionKey],
          items,
        });
      }
      continue;
    }

    const groups =
      sectionKey === 'operations'
        ? COMPANY_OPERATIONS_GROUP_ORDER.flatMap((groupKey) => {
            const items = buildGroupItems(visible, sectionKey, groupKey);
            if (items.length === 0) return [];
            return [{
              key: groupKey,
              labelKey: COMPANY_OPERATIONS_GROUP_LABELS[groupKey],
              items,
            }];
          })
        : COMPANY_COMPANY_GROUP_ORDER.flatMap((groupKey) => {
            const items = buildGroupItems(visible, sectionKey, groupKey);
            if (items.length === 0) return [];
            return [{
              key: groupKey,
              labelKey: COMPANY_COMPANY_GROUP_LABELS[groupKey],
              items,
            }];
          });

    if (groups.length > 0) {
      sections.push({
        key: sectionKey,
        labelKey: COMPANY_NAV_SECTION_LABELS[sectionKey],
        groups,
      });
    }
  }

  return sections;
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
    items: section.items?.map((item) =>
      item.key === 'cereri' && newLeadCount > 0
        ? { ...item, badge: newLeadCount > 99 ? '99+' : newLeadCount }
        : item,
    ),
    groups: section.groups?.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.key === 'cereri' && newLeadCount > 0
          ? { ...item, badge: newLeadCount > 99 ? '99+' : newLeadCount }
          : item,
      ),
    })),
  }));

  const sidebarExtras = useMemo(() => <CompanySwitcher />, []);

  return (
    <CabinetShell
      basePath="/company"
      sections={sections}
      currentPlanCode={currentPlan}
      profileAvatarUrl={activeCompany?.logoUrl}
      profileRole={profileRole}
      sidebarExtras={sidebarExtras}
    />
  );
}
