import { useTranslation } from 'react-i18next';
import { PageHero } from '@/widgets/cabinet/cabinet-ui';
import {
  PortalError,
  PortalInterventionsSection,
  PortalLoading,
  PortalReviewsSection,
} from '@/features/portal';
import { usePortalData } from '@/features/portal';

export function PortalLucrariPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('portal.common.eyebrow')}
        title={t('portal.lucrariPage.title')}
        description={t('portal.lucrariPage.description')}
      />
      <PortalInterventionsSection data={data} />
      <PortalReviewsSection data={data} />
    </div>
  );
}
