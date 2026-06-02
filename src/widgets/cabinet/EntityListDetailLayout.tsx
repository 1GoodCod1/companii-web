import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  list: ReactNode;
  detail?: ReactNode;
}

/** Shared min-height so list + detail columns align on desktop. */
export const cabinetSplitColumnClass = 'flex min-h-[280px] flex-col';

export function EntityListDetailLayout({ list, detail }: Props) {
  if (!detail) {
    return <div className="space-y-4">{list}</div>;
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-2">
      <div className={cabinetSplitColumnClass}>{list}</div>
      <div className={cabinetSplitColumnClass}>{detail}</div>
    </div>
  );
}

export function cabinetSplitPanelClass(className?: string) {
  return cn('flex h-full min-h-[280px] flex-col', className);
}
