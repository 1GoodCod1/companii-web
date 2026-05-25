import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  PortalError,
  PortalInterventionsSection,
  PortalLoading,
  PortalReviewsSection,
} from '@/features/portal/portalSections';
import { usePortalData } from '@/features/portal/usePortalData';

export function PortalLucrariPage() {
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Portal client"
        title="Lucrările mele"
        description="Statusul intervențiilor, programările și recenziile după finalizare."
      />
      <PortalInterventionsSection data={data} />
      <PortalReviewsSection data={data} />
    </div>
  );
}
