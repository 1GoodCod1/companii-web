import { useTranslation } from 'react-i18next';
import { PageHero } from '@/widgets/cabinet/cabinet-ui';
import {
  PortalDashboardOverview,
  PortalError,
  PortalHero,
  PortalLoading,
} from '@/features/portal';
import { usePortalData } from '@/features/portal';

export function PortalDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PortalHero data={data} />
      <PortalDashboardOverview data={data} />
      <PageHero
        title={t('portal.dashboardPage.guideTitle')}
        description={t('portal.dashboardPage.guideDescription')}
      />
    </div>
  );
}
