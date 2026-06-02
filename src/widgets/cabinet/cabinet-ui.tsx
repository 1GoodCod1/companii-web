import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export { AppSelect, type AppSelectOption } from '@/shared/ui/AppSelect';

export const cabinetLabelClass = 'text-xs font-medium text-gray-600 block mb-1.5';
export const cabinetFieldClass =
  'w-full rounded-none bg-slate-50/90 px-3.5 py-2.5 text-sm text-gray-900 border border-transparent outline-none placeholder:text-gray-400 focus:bg-white focus:border-slate-300';
export const cabinetSelectClass = `${cabinetFieldClass} cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed`;
export const cabinetBtnPrimary =
  'inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer';
export const cabinetBtnSecondary =
  'inline-flex items-center justify-center px-5 py-2.5 rounded-none text-sm font-medium text-gray-600 hover:bg-slate-100 transition-colors cursor-pointer';
export const cabinetPanelClass = 'glass-panel rounded-none';

/** Content area inset below panel header (30px from panel edges). */
export const cabinetPanelContentInsetClass =
  'flex min-h-0 flex-1 flex-col px-[30px] pb-[30px]';

/** Full inset when panel has no header row. */
export const cabinetPanelFillInsetClass = 'flex min-h-0 flex-1 flex-col p-[30px]';

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  flat,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  flat?: boolean;
}) {
  return (
    <section
      className={cn(
        'relative overflow-visible rounded-none p-6 border border-violet-100/60',
        flat ? 'bg-white' : 'bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/20',
      )}
    >
      {!flat ? (
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
      ) : null}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
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
  fill,
  compact,
}: {
  message: string;
  action?: ReactNode;
  /** Stretch gray background to fill the panel content area. */
  fill?: boolean;
  /** Fixed compact block for dense layouts (e.g. calendar columns). */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-none bg-slate-50/80 text-center w-full',
        fill && 'flex min-h-[180px] flex-1 items-center justify-center px-6 py-10',
        compact && 'px-4 py-8',
        !fill && !compact && 'px-4 py-12',
      )}
    >
      <p className={cn('font-medium text-gray-400', compact ? 'text-xs leading-relaxed' : 'text-sm')}>
        {message}
      </p>
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
    <section className="rounded-none bg-white/60 p-4 sm:p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? <p className="text-xs text-gray-400 mt-0.5">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

// ──────────────────── Loading skeletons ────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-none bg-white p-5 border border-slate-100 animate-pulse', className)}>
      <div className="h-4 w-2/3 bg-slate-200 rounded mb-3" />
      <div className="h-3 w-full bg-slate-100 rounded mb-2" />
      <div className="h-3 w-4/5 bg-slate-100 rounded" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 animate-pulse', className)}>
      <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function SkeletonPage({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl bg-white p-6 border border-violet-100/60">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-5 w-72 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 border border-slate-100 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div className="h-4 w-40 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-full bg-slate-100 rounded mb-2" />
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-10 w-full bg-slate-100 rounded-none" />
        </div>
      ))}
    </div>
  );
}

export function InlineSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 text-white/80"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
