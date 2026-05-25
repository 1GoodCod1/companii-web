import { PageHero } from '@/components/cabinet/cabinet-ui';
import {
  PortalDashboardOverview,
  PortalError,
  PortalHero,
  PortalLoading,
} from '@/features/portal/portalSections';
import { usePortalData } from '@/features/portal/usePortalData';

export function PortalDashboardPage() {
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PortalHero data={data} />
      <PortalDashboardOverview data={data} />
      <PageHero
        title="Ce poți face aici"
        description="Fiecare secțiune din meniu îți arată doar informațiile relevante: lucrări, oferte sau facturi."
      />
    </div>
  );
}
