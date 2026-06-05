import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BuildingsIcon, CreditCardIcon, LayoutIcon, MapPinIcon, ChatIcon, ScrollIcon, TagIcon, UsersIcon, UserPlusIcon, SlidersIcon } from '@phosphor-icons/react';
import { CabinetShell } from './CabinetShell';
import type { CabinetNavSection } from '@/widgets/layout/cabinet-nav';

const sections: CabinetNavSection[] = [
  {
    key: 'main',
    labelKey: 'admin.sections.main',
    items: [
      { key: 'dashboard', to: '', labelKey: 'admin.dashboard', icon: <LayoutIcon /> },
    ],
  },
  {
    key: 'platform',
    labelKey: 'admin.sections.platform',
    items: [
      { key: 'companies', to: '/companies', labelKey: 'admin.companies', icon: <BuildingsIcon /> },
      {
        key: 'subscriptions',
        to: '/subscriptions',
        labelKey: 'admin.subscriptions',
        icon: <CreditCardIcon />,
      },
      { key: 'waitlist', to: '/waitlist', labelKey: 'admin.waitlist', icon: <UserPlusIcon /> },
      { key: 'reviews', to: '/reviews', labelKey: 'admin.reviews', icon: <ChatIcon /> },
      { key: 'audit', to: '/audit', labelKey: 'admin.audit', icon: <ScrollIcon /> },
    ],
  },
  {
    key: 'catalog',
    labelKey: 'admin.sections.catalog',
    items: [
      { key: 'cities', to: '/cities', labelKey: 'admin.cities', icon: <MapPinIcon /> },
      { key: 'categories', to: '/categories', labelKey: 'admin.categories', icon: <TagIcon /> },
      { key: 'clients', to: '/clients', labelKey: 'admin.clients', icon: <UsersIcon /> },
      { key: 'blueprints', to: '/blueprints', labelKey: 'admin.blueprints', icon: <SlidersIcon /> },
    ],
  },
];

export function AdminLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('admin.documentTitle');
  }, [t]);

  return (
    <CabinetShell
      basePath="/admin"
      sections={sections}
      profileRole="Administrator"
    />
  );
}
