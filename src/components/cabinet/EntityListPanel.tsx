import type { ReactNode } from 'react';
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
  loadingMessage = 'Se încarcă...',
  emptyMessage,
  children,
  className,
}: Props) {
  return (
    <Panel className={cn('lg:col-span-2 p-0 overflow-hidden', className)}>
      {isLoading ? (
        <div className="p-8 text-center text-gray-400">{loadingMessage}</div>
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} />
      ) : (
        children
      )}
    </Panel>
  );
}

export function entityListRowClass(isSelected: boolean): string {
  return cn(
    'hover:bg-violet-50/20 transition-colors cursor-pointer',
    isSelected && 'bg-violet-50/40 font-semibold',
  );
}
