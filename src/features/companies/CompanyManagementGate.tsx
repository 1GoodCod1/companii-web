import type { ReactNode } from 'react';
import { EmptyState } from '@/components/cabinet/cabinet-ui';
import { useCompanyPermissions } from '@/features/companies/useCompanyPermissions';

type GateProps = {
  children: ReactNode;
  message?: string;
};

export function CompanyManagementGate({
  children,
  message = 'Această secțiune este disponibilă doar pentru owner și manager.',
}: GateProps) {
  const { isManagement } = useCompanyPermissions();
  if (!isManagement) {
    return <EmptyState message={message} />;
  }
  return <>{children}</>;
}

export function CompanyOwnerGate({
  children,
  message = 'Această secțiune este disponibilă doar pentru proprietarul companiei.',
}: GateProps) {
  const { isOwner } = useCompanyPermissions();
  if (!isOwner) {
    return <EmptyState message={message} />;
  }
  return <>{children}</>;
}
