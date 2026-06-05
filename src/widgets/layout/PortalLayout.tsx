import { CalculatorIcon, ClipboardTextIcon, CreditCardIcon, FileTextIcon, LayoutIcon, WrenchIcon } from '@phosphor-icons/react';
import { CabinetShell } from './CabinetShell';
import { EmailVerificationBanner } from './EmailVerificationBanner';
import type { CabinetNavSection } from '@/widgets/layout/cabinet-nav';

const sections: CabinetNavSection[] = [
  {
    key: 'main',
    labelKey: 'portal.sections.main',
    items: [
      { key: 'dashboard', to: '', labelKey: 'portal.dashboard', icon: <LayoutIcon /> },
      { key: 'cereri', to: '/cereri', labelKey: 'portal.cereri', icon: <ClipboardTextIcon /> },
      { key: 'lucrari', to: '/lucrari', labelKey: 'portal.lucrari', icon: <WrenchIcon /> },
      { key: 'oferte', to: '/oferte', labelKey: 'portal.oferte', icon: <FileTextIcon /> },
      { key: 'smete', to: '/smete', labelKey: 'portal.smete', icon: <CalculatorIcon /> },
      { key: 'facturi', to: '/facturi', labelKey: 'portal.facturi', icon: <CreditCardIcon /> },
    ],
  },
];

export function PortalLayout() {
  return (
    <CabinetShell
      basePath="/portal"
      sections={sections}
      banner={<EmailVerificationBanner />}
    />
  );
}
