import { Suspense, type ReactNode } from 'react';
import { PageLoader } from '@/shared/ui/PageLoader';

export function LazyPage({
  children,
  fallback = <PageLoader />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
