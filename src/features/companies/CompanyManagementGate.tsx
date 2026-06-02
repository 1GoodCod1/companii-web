import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/widgets/cabinet/cabinet-ui';
import { useCompanyPermissions } from '@/features/companies/hooks/useCompanyPermissions';

type GateProps = {
  children: ReactNode;
  message?: string;
};

export function CompanyManagementGate({ children, message }: GateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('company.gates.managementOnly');
  const { isManagement } = useCompanyPermissions();
  if (!isManagement) {
    return <EmptyState message={displayMessage} />;
  }
  return <>{children}</>;
}

export function CompanyOwnerGate({ children, message }: GateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('company.gates.ownerOnly');
  const { isOwner } = useCompanyPermissions();
  if (!isOwner) {
    return <EmptyState message={displayMessage} />;
  }
  return <>{children}</>;
}
