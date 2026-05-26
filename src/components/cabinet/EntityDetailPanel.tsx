import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, Panel, PanelHeader } from '@/components/cabinet/cabinet-ui';

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
    <Panel>
      <PanelHeader title={title} action={headerAction} />

      {selectedId ? (
        isLoading || !hasDetail ? (
          <div className="text-center py-20 text-gray-400">{resolvedLoadingMessage}</div>
        ) : (
          children
        )
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}
