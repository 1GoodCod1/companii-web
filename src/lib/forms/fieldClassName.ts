import { cn } from '@/lib/utils';

export function fieldClassName(baseClass: string, hasError?: boolean) {
  return cn(baseClass, hasError && 'border-red-300 ring-2 ring-red-100');
}
