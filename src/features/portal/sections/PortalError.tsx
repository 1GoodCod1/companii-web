import { useTranslation } from 'react-i18next';
import { Panel, EmptyState } from '@/widgets/cabinet/cabinet-ui';

export function PortalError() {
  const { t } = useTranslation();
  return (
    <Panel>
      <EmptyState
        message={t('portal.dashboardPage.errorMessage')}
        action={
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            {t('portal.dashboardPage.errorHint')}
          </p>
        }
      />
    </Panel>
  );
}
