import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { EmptyState, Panel } from '@/components/cabinet/cabinet-ui';

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
    <Panel className={cn('lg:col-span-2 p-0 overflow-hidden', className)}>
      {isLoading ? (
        <div className="p-8 text-center text-gray-400">{resolvedLoadingMessage}</div>
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} />
      ) : (
        children
      )}
    </Panel>
  );
}
