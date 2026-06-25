import type { ReactNode } from 'react';
import { interventionSectionTitleClass } from '../interventionPanelUi';

export function InterventionDetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={interventionSectionTitleClass}>{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
