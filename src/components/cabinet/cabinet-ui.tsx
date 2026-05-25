import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const cabinetLabelClass = 'text-xs font-medium text-gray-600 block mb-1.5';
export const cabinetFieldClass =
  'w-full rounded-xl bg-slate-50/90 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:shadow-sm';
export const cabinetSelectClass = `${cabinetFieldClass} cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed`;
export const cabinetBtnPrimary =
  'inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer';
export const cabinetBtnSecondary =
  'inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-slate-100 transition-colors cursor-pointer';
export const cabinetPanelClass = 'glass-panel rounded-3xl shadow-premium';

export function PageHero({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/20 p-6 shadow-premium">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600/80 mb-2">
              {eyebrow}
            </p>
          ) : null}
          <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{title}</p>
          {description ? (
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn(cabinetPanelClass, 'p-5 sm:p-6', className)}>{children}</section>;
}

export function PanelHeader({
  title,
  description,
  meta,
  action,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? <p className="text-xs text-gray-400 mt-0.5">{description}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {meta}
        {action}
      </div>
    </div>
  );
}

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50/80 px-4 py-12 text-center">
      <p className="text-sm font-medium text-gray-400">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function SoftBadge({
  children,
  tone = 'violet',
}: {
  children: ReactNode;
  tone?: 'violet' | 'emerald' | 'amber' | 'blue' | 'gray';
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-slate-100 text-gray-600',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/60 p-4 sm:p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? <p className="text-xs text-gray-400 mt-0.5">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
