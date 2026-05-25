import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  PortalError,
  PortalLoading,
  PortalQuotesSection,
} from '@/features/portal/portalSections';
import { usePortalData } from '@/features/portal/usePortalData';

export function PortalOfertePage() {
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow="Portal client"
        title="Ofertele mele"
        description="Devize primite de la companie — acceptă sau respinge în câteva click-uri."
      />
      <PortalQuotesSection data={data} />
    </div>
  );
}
