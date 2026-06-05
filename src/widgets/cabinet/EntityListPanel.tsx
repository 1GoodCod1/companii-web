import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import { EmptyState, Panel, SkeletonList, cabinetPanelFillInsetClass } from '@/widgets/cabinet/cabinet-ui';
import { cabinetSplitPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';

type Props = {
  isLoading: boolean;
  isEmpty: boolean;
  loadingMessage?: string;
  skeletonRows?: number;
  emptyMessage: string;
  children: ReactNode;
  className?: string;
};

export function EntityListPanel({
  isLoading,
  isEmpty,
  loadingMessage,
  skeletonRows = 5,
  emptyMessage,
  children,
  className,
}: Props) {
  const { t } = useTranslation();
  const resolvedLoadingMessage = loadingMessage ?? t('cabinet.common.loading');

  return (
    <Panel className={cabinetSplitPanelClass(cn('p-0 overflow-hidden', className))}>
      {isLoading ? (
        <LoadingStatus label={resolvedLoadingMessage} className="flex-1">
          <SkeletonList rows={skeletonRows} />
        </LoadingStatus>
      ) : isEmpty ? (
        <div className={cabinetPanelFillInsetClass}>
          <EmptyState message={emptyMessage} fill />
        </div>
      ) : (
        children
      )}
    </Panel>
  );
}
