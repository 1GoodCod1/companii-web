import { useEffect } from 'react';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  ScrollText,
  Tags,
  Users,
  UserPlus,
} from 'lucide-react';
import { CabinetShell } from './CabinetShell';
import type { CabinetNavSection } from '@/components/layout/cabinet-nav';

const sections: CabinetNavSection[] = [
  {
    key: 'main',
    labelKey: 'admin.sections.main',
    items: [
      { key: 'dashboard', to: '', labelKey: 'admin.dashboard', icon: <LayoutDashboard /> },
    ],
  },
  {
    key: 'platform',
    labelKey: 'admin.sections.platform',
    items: [
      { key: 'companies', to: '/companies', labelKey: 'admin.companies', icon: <Building2 /> },
      {
        key: 'subscriptions',
        to: '/subscriptions',
        labelKey: 'admin.subscriptions',
        icon: <CreditCard />,
      },
      { key: 'waitlist', to: '/waitlist', labelKey: 'admin.waitlist', icon: <UserPlus /> },
      { key: 'reviews', to: '/reviews', labelKey: 'admin.reviews', icon: <MessageSquare /> },
      { key: 'audit', to: '/audit', labelKey: 'admin.audit', icon: <ScrollText /> },
    ],
  },
  {
    key: 'catalog',
    labelKey: 'admin.sections.catalog',
    items: [
      { key: 'cities', to: '/cities', labelKey: 'admin.cities', icon: <MapPin /> },
      { key: 'categories', to: '/categories', labelKey: 'admin.categories', icon: <Tags /> },
      { key: 'clients', to: '/clients', labelKey: 'admin.clients', icon: <Users /> },
    ],
  },
];

export function AdminLayout() {
  useEffect(() => {
    document.title = 'Admin · Faber Companii';
  }, []);

  return (
    <CabinetShell
      basePath="/admin"
      sections={sections}
      profileRole="Administrator"
    />
  );
}
