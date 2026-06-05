import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingStatus } from '@/shared/ui/LoadingStatus';
import {
  EmptyState,
  Panel,
  PanelHeader,
  SkeletonForm,
  cabinetPanelContentInsetClass,
} from '@/widgets/cabinet/cabinet-ui';
import { cabinetSplitPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';

type Props = {
  title: string;
  selectedId: string | null;
  isLoading: boolean;
  hasDetail: boolean;
  loadingMessage?: string;
  skeletonFields?: number;
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
  skeletonFields = 4,
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
            <LoadingStatus label={resolvedLoadingMessage} className="flex-1">
              <SkeletonForm fields={skeletonFields} />
            </LoadingStatus>
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
