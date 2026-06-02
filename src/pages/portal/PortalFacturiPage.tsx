import { useTranslation } from 'react-i18next';
import { PageHero } from '@/widgets/cabinet/cabinet-ui';
import {
  PortalError,
  PortalInvoicesSection,
  PortalLoading,
} from '@/features/portal';
import { usePortalData } from '@/features/portal';

export function PortalFacturiPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePortalData();

  if (isLoading) return <PortalLoading />;
  if (isError || !data) return <PortalError />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        eyebrow={t('portal.common.eyebrow')}
        title={t('portal.facturiPage.title')}
        description={t('portal.facturiPage.description')}
      />
      <PortalInvoicesSection data={data} />
    </div>
  );
}
