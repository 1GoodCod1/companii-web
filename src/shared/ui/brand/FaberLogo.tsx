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
          {/* Top bar — gold, the lit edge of the ribbon */}
          <linearGradient id="faberGradientGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e6ad44" />
            <stop offset="100%" stopColor="#c98f28" />
          </linearGradient>
          {/* Mid bar — terracotta */}
          <linearGradient id="faberGradientTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c2593f" />
            <stop offset="100%" stopColor="#8f4030" />
          </linearGradient>
          {/* Stem — graphite, the backbone */}
          <linearGradient id="faberGradientGraphite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#1c1c20" />
          </linearGradient>
        </defs>
        {/*
          The Faber Fold — a single ribbon of crafted material bent into an "F"
          (faber — Latin for "craftsman"). Mitered 45° joints and chisel-cut
          ends echo workshop joinery; crease shadows mark each fold.
        */}
        <path
          d="M 16 10 L 84 10 L 75 27 L 33 27 Z"
          fill="url(#faberGradientGold)"
          className={cn(
            animated && 'transition-transform duration-1000 ease-out hover:scale-105 origin-center'
          )}
        />
        <path d="M 16 10 L 33 27 L 33 86 L 16 94 Z" fill="url(#faberGradientGraphite)" />
        <path d="M 33 45 L 70 45 L 61 62 L 33 62 Z" fill="url(#faberGradientTerracotta)" />
        {/* Crease shadows at the folds */}
        <path d="M 16 10 L 33 10 L 33 27 Z" fill="#000000" opacity="0.14" />
        <path d="M 33 45 L 45 45 L 33 62 Z" fill="#000000" opacity="0.14" />
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
