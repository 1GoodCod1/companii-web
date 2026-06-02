import { cn } from '@/lib/utils';

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
  const iconSizes = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 80,
  };

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
          <linearGradient id="faberGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" /> 
            <stop offset="100%" stopColor="#4f46e5" /> 
          </linearGradient>
          <linearGradient id="faberGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" /> 
            <stop offset="100%" stopColor="#ec4899" /> 
          </linearGradient>
          <linearGradient id="faberGradientTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" /> 
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d="M 50 15 L 18 33.5 L 18 70.5 L 50 52 L 50 15 Z"
          fill="url(#faberGradientLeft)"
          opacity="0.95"
          className={cn(
            animated && 'transition-all duration-1000 ease-out hover:scale-105 origin-center'
          )}
        />
        <path
          d="M 50 52 L 82 70.5 L 82 33.5 L 50 15 L 50 52 Z"
          fill="url(#faberGradientRight)"
          opacity="0.95"
        />
        <path
          d="M 50 52 L 18 70.5 L 50 89 L 82 70.5 L 50 52 Z"
          fill="url(#faberGradientTop)"
          opacity="0.85"
        />
        <path
          d="M 32 41.5 L 50 32 M 50 32 L 68 41.5 M 50 52 L 50 72.5"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        
        <circle cx="50" cy="32" r="2.5" fill="white" />
        <circle cx="32" cy="41.5" r="2.5" fill="white" />
        <circle cx="68" cy="41.5" r="2.5" fill="white" />
        <circle cx="50" cy="72.5" r="2.5" fill="white" />
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
