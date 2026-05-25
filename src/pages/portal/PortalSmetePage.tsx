import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  PortalError,
  PortalEstimatesSection,
  PortalLoading,
} from '@/features/portal/portalSections';
import { usePortalData } from '@/features/portal/usePortalData';

export function PortalSmetePage() {
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Portal client"
        title="Smetele mele"
        description="Smete primite de la companie — acceptă sau respinge în câteva click-uri."
      />
      <PortalEstimatesSection data={data} />
    </div>
  );
}
