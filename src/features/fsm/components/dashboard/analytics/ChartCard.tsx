import type { ReactNode } from 'react';
import { Panel, PanelHeader, EmptyState } from '@/widgets/cabinet/cabinet-ui';

export function ChartCard({
  title,
  description,
  isEmpty,
  emptyMessage,
  children,
  className,
}: {
  title: string;
  description?: string;
  isEmpty?: boolean;
  emptyMessage: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <PanelHeader title={title} description={description} />
      <div className="mt-4">
        {isEmpty ? (
          <div className="flex h-[300px]">
            <EmptyState message={emptyMessage} fill />
          </div>
        ) : (
          children
        )}
      </div>
    </Panel>
  );
}
