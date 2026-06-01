import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicPageHeaderProps {
  badge?: string;
  title: ReactNode;
  description?: string;
  className?: string;
}

export function PublicPageHeader({ badge, title, description, className }: PublicPageHeaderProps) {
  return (
    <section className={cn('public-page-header text-center space-y-3', className)}>
      {badge ? (
        <span className="inline-block text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-1.5">
          {badge}
        </span>
      ) : null}
      <h1 className="public-page-header__title text-2xl md:text-3xl font-extrabold text-slate-900">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">{description}</p>
      ) : null}
    </section>
  );
}
