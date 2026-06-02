import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { EmptyState, Panel, cabinetPanelFillInsetClass } from '@/widgets/cabinet/cabinet-ui';
import { cabinetSplitPanelClass } from '@/widgets/cabinet/EntityListDetailLayout';

type Props = {
  isLoading: boolean;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyMessage: string;
  children: ReactNode;
  className?: string;
};

export function EntityListPanel({
  isLoading,
  isEmpty,
  loadingMessage,
  emptyMessage,
  children,
  className,
}: Props) {
  const { t } = useTranslation();
  const resolvedLoadingMessage = loadingMessage ?? t('cabinet.common.loading');

  return (
    <Panel className={cabinetSplitPanelClass(cn('p-0 overflow-hidden', className))}>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-400">
          {resolvedLoadingMessage}
        </div>
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
