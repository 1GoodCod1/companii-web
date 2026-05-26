import { useTranslation } from 'react-i18next';

export function PortalLoading() {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-gray-400 animate-pulse">{t('portal.dashboardPage.loading')}</p>
  );
}
