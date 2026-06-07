import { cn } from '@/lib/utils';

const iconSizes = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 80,
};

type FaberLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
};

export function FaberLogo({
  className,
  size = 'md',
  showText = true,
  animated = false,
}: FaberLogoProps) {
  const currentSize = iconSizes[size];

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* SVG LOGO MARK */}
      <svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'shrink-0',
          animated && 'animate-pulse-slow'
        )}
      >
        <defs>
          {/* Top face — gold, the lit surface */}
          <linearGradient id="faberGradientTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6ad44" />
            <stop offset="100%" stopColor="#c98f28" />
          </linearGradient>
          {/* Left face — terracotta */}
          <linearGradient id="faberGradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c2593f" />
            <stop offset="100%" stopColor="#8f4030" />
          </linearGradient>
          {/* Right face — graphite, the shadowed surface */}
          <linearGradient id="faberGradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#1c1c20" />
          </linearGradient>
        </defs>
        {/* Clean isometric cube — three faces meeting at the front vertex. */}
        <path
          d="M 50 12 L 82 30 L 50 48 L 18 30 Z"
          fill="url(#faberGradientTop)"
          className={cn(
            animated && 'transition-transform duration-1000 ease-out hover:scale-105 origin-center'
          )}
        />
        <path d="M 18 30 L 50 48 L 50 84 L 18 66 Z" fill="url(#faberGradientLeft)" />
        <path d="M 82 30 L 82 66 L 50 84 L 50 48 Z" fill="url(#faberGradientRight)" />
      </svg>

      {/* BRAND TEXT */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl leading-none">
              Faber
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1.5 block">
            Field Service CRM
          </span>
        </div>
      )}
    </div>
  );
}
