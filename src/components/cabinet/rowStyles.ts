import { cn } from '@/lib/utils';

export function entityListRowClass(isSelected: boolean): string {
  return cn(
    'hover:bg-violet-50/20 transition-colors cursor-pointer',
    isSelected && 'bg-violet-50/40 font-semibold',
  );
}
