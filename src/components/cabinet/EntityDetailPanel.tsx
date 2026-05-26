import type { ReactNode } from 'react';
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
  loadingMessage = 'Se încarcă detaliile...',
  emptyMessage,
  headerAction,
  children,
}: Props) {
  return (
    <Panel>
      <PanelHeader title={title} action={headerAction} />

      {selectedId ? (
        isLoading || !hasDetail ? (
          <div className="text-center py-20 text-gray-400">{loadingMessage}</div>
        ) : (
          children
        )
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Panel>
  );
}
