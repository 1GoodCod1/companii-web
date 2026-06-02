import { useTranslation } from 'react-i18next';
import { PageHero } from '@/widgets/cabinet/cabinet-ui';
import {
  PortalError,
  PortalLoading,
  PortalQuotesSection,
} from '@/features/portal';
import { usePortalData } from '@/features/portal';

export function PortalOfertePage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('portal.common.eyebrow')}
        title={t('portal.ofertePage.title')}
        description={t('portal.ofertePage.description')}
      />
      <PortalQuotesSection data={data} />
    </div>
  );
}
