import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  PortalError,
  PortalInvoicesSection,
  PortalLoading,
} from '@/features/portal/portalSections';
import { usePortalData } from '@/features/portal/usePortalData';

export function PortalFacturiPage() {
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Portal client"
        title="Facturile mele"
        description="Toate facturile emise pentru lucrările tale, cu statusul plății."
      />
      <PortalInvoicesSection data={data} />
    </div>
  );
}
