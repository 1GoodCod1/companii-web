import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, Panel, PanelHeader, cabinetPanelContentInsetClass } from '@/widgets/cabinet/cabinet-ui';
import { cabinetSplitPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';

type Props = {
  title: string;
  selectedId: string | null;
  isLoading: boolean;
  hasDetail: boolean;
  loadingMessage?: string;
  emptyMessage: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function EntityDetailPanel({
  title,
  selectedId,
  isLoading,
  hasDetail,
  loadingMessage,
  emptyMessage,
  headerAction,
  children,
}: Props) {
  const { t } = useTranslation();
  const resolvedLoadingMessage = loadingMessage ?? t('cabinet.common.loadingDetails');

  return (
    <Panel className={cabinetSplitPanelClass()}>
      <PanelHeader title={title} action={headerAction} />

      <div className={cabinetPanelContentInsetClass}>
        {selectedId ? (
          isLoading || !hasDetail ? (
            <div className="flex flex-1 items-center justify-center text-center text-gray-400">
              {resolvedLoadingMessage}
            </div>
          ) : (
            children
          )
        ) : (
          <EmptyState message={emptyMessage} fill />
        )}
      </div>
    </Panel>
  );
}
