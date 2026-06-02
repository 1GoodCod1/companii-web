import { Calculator, ClipboardList, CreditCard, FileText, LayoutDashboard, Wrench } from 'lucide-react';
import { CabinetShell } from './CabinetShell';
import type { CabinetNavSection } from '@/widgets/layout/cabinet-nav';

const sections: CabinetNavSection[] = [
  {
    key: 'main',
    labelKey: 'portal.sections.main',
    items: [
      { key: 'dashboard', to: '', labelKey: 'portal.dashboard', icon: <LayoutDashboard /> },
      { key: 'cereri', to: '/cereri', labelKey: 'portal.cereri', icon: <ClipboardList /> },
      { key: 'lucrari', to: '/lucrari', labelKey: 'portal.lucrari', icon: <Wrench /> },
      { key: 'oferte', to: '/oferte', labelKey: 'portal.oferte', icon: <FileText /> },
      { key: 'smete', to: '/smete', labelKey: 'portal.smete', icon: <Calculator /> },
      { key: 'facturi', to: '/facturi', labelKey: 'portal.facturi', icon: <CreditCard /> },
    ],
  },
];

export function PortalLayout() {
  return <CabinetShell basePath="/portal" sections={sections} />;
}
