import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LoadingStatusProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Accessible wrapper for in-place loading placeholders (skeletons, spinners). */
export function LoadingStatus({ label, children, className }: LoadingStatusProps) {
  return (
    <output aria-live="polite" className={cn('block', className)}>
      {children}
      <span className="sr-only">{label}</span>
    </output>
  );
}
