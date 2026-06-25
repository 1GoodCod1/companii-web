import { useId } from 'react';
import { buildSparklinePaths } from '@/entities/fsm/model/dashboardKpiSeries';

export function DashboardSparkline({
  points = [],
  variant = 'default',
  showLastDot = false,
}: {
  points?: number[];
  variant?: 'default' | 'success';
  showLastDot?: boolean;
}) {
  const fillId = useId().replace(/:/g, '');
  const stroke = variant === 'success' ? 'var(--dashboard-success)' : 'var(--dashboard-accent)';
  const paths = buildSparklinePaths(points);

  if (!paths) {
    return (
      <svg viewBox="0 0 108 36" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        <path
          d="M0,32 L108,32"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeOpacity="0.35"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 108 36" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${fillId})`} />
      <path
        d={paths.line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showLastDot ? (
        <>
          <circle cx={paths.lastX} cy={paths.lastY} r="3.5" fill="#fff" />
          <circle cx={paths.lastX} cy={paths.lastY} r="2.25" fill={stroke} />
        </>
      ) : null}
    </svg>
  );
}
