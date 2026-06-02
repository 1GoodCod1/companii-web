import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Compass,
  HardHat,
  Home,
  Lock,
  Mail,
  RefreshCw,
  Ruler,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { cn } from '@/lib/utils';

export type StatusPageVariant = '404' | '403' | 'error';

type StatusPageProps = {
  variant: StatusPageVariant;
  onReload?: () => void;
  compact?: boolean;
};

const VARIANT_CONFIG = {
  '404': {
    leftDigit: '4',
    rightDigit: '4',
    icon: Compass,
    accent: 'from-violet-600 via-indigo-600 to-violet-500',
    glow: 'bg-violet-400/20',
    iconColor: 'text-violet-600',
    iconRing: 'border-violet-100 shadow-violet-500/15',
    badgeClass:
      'border-violet-100 bg-violet-50/80 text-violet-700 [&_.status-dot]:bg-violet-600 [&_.status-ping]:bg-violet-400',
    badgeKey: 'notFound.badge',
    titleKey: 'notFound.title',
    descriptionKey: 'notFound.description',
    hintKey: 'notFound.hint',
  },
  '403': {
    leftDigit: '4',
    rightDigit: '3',
    icon: Lock,
    accent: 'from-amber-600 via-orange-600 to-amber-500',
    glow: 'bg-amber-400/20',
    iconColor: 'text-amber-600',
    iconRing: 'border-amber-100 shadow-amber-500/15',
    badgeClass:
      'border-amber-100 bg-amber-50/80 text-amber-800 [&_.status-dot]:bg-amber-600 [&_.status-ping]:bg-amber-400',
    badgeKey: 'forbidden.badge',
    titleKey: 'forbidden.title',
    descriptionKey: 'forbidden.description',
    hintKey: 'forbidden.hint',
  },
  error: {
    leftDigit: null,
    rightDigit: null,
    icon: Wrench,
    accent: 'from-rose-600 via-red-600 to-rose-500',
    glow: 'bg-rose-400/20',
    iconColor: 'text-rose-600',
    iconRing: 'border-rose-100 shadow-rose-500/15',
    badgeClass:
      'border-rose-100 bg-rose-50/80 text-rose-700 [&_.status-dot]:bg-rose-600 [&_.status-ping]:bg-rose-400',
    badgeKey: 'routeError.badge',
    titleKey: 'routeError.title',
    descriptionKey: 'routeError.description',
    hintKey: 'routeError.description',
  },
} as const;

const FLOATING_ICONS = [
  { Icon: HardHat, className: 'left-[8%] top-[18%] text-violet-300/70', delay: 0 },
  { Icon: Ruler, className: 'right-[10%] top-[22%] text-indigo-300/60', delay: 0.4 },
  { Icon: Wrench, className: 'left-[14%] bottom-[24%] text-violet-300/50', delay: 0.8 },
  { Icon: Building2, className: 'right-[12%] bottom-[20%] text-indigo-300/55', delay: 1.2 },
] as const;

export function StatusPage({ variant, onReload, compact = false }: StatusPageProps) {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const config = VARIANT_CONFIG[variant];
  const HeroIcon = config.icon;

  const actionLinks =
    variant === '403'
      ? [
          { to: lp('/'), label: t('forbidden.goHome'), icon: Home, primary: true },
          { to: '/login', label: t('forbidden.goLogin'), icon: ArrowLeft },
          { to: lp('/contacts'), label: t('forbidden.contactSupport'), icon: Mail },
        ]
      : variant === 'error'
        ? [{ to: lp('/'), label: t('routeError.goHome'), icon: Home, primary: true }]
        : [
            { to: lp('/'), label: t('notFound.goHome'), icon: Home, primary: true },
            { to: lp('/companies'), label: t('notFound.browseCompanies'), icon: Building2 },
            { to: lp('/contacts'), label: t('notFound.contactSupport'), icon: Mail },
          ];

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        compact ? 'py-8' : 'min-h-[60vh] py-12 sm:py-16 flex items-center justify-center',
      )}
    >
      <div className="error-blueprint-grid pointer-events-none absolute inset-0" aria-hidden />

      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]',
          config.glow,
        )}
        aria-hidden
      />

      {!compact &&
        FLOATING_ICONS.map(({ Icon, className, delay }, index) => (
          <motion.div
            key={index}
            className={cn('pointer-events-none absolute hidden md:block', className)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { delay, duration: 0.6 },
              y: { delay, duration: 5 + index, repeat: Infinity, ease: 'easeInOut' },
            }}
            aria-hidden
          >
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </motion.div>
        ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto w-full max-w-2xl px-4 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]',
            config.badgeClass,
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="status-ping absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="status-dot relative inline-flex h-2 w-2 rounded-full" />
          </span>
          {t(config.badgeKey)}
        </motion.span>

        <div className="mt-8 mb-6 flex justify-center">
          {variant === 'error' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
              className={cn(
                'flex items-center justify-center rounded-2xl border bg-white shadow-lg backdrop-blur-sm',
                config.iconRing,
                compact ? 'h-24 w-24' : 'h-28 w-28 sm:h-32 sm:w-32',
              )}
              aria-hidden
            >
              <HeroIcon
                className={cn(config.iconColor, compact ? 'h-10 w-10' : 'h-11 w-11 sm:h-12 sm:w-12')}
                strokeWidth={1.75}
              />
            </motion.div>
          ) : (
            <div
              className="flex items-center justify-center gap-1 sm:gap-3"
              aria-label={variant === '404' ? '404' : '403'}
            >
              <span
                className={cn(
                  'select-none font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br',
                  config.accent,
                  compact ? 'text-[4.5rem] sm:text-[5rem]' : 'text-[5.5rem] sm:text-[7rem]',
                )}
                aria-hidden
              >
                {config.leftDigit}
              </span>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
                className={cn(
                  'mx-1 flex shrink-0 items-center justify-center rounded-2xl border bg-white shadow-lg backdrop-blur-sm',
                  config.iconRing,
                  compact ? 'h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20' : 'h-20 w-20 sm:h-24 sm:w-24',
                )}
                aria-hidden
              >
                <HeroIcon
                  className={cn(
                    config.iconColor,
                    compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-9 sm:h-10 sm:w-10',
                  )}
                  strokeWidth={1.75}
                />
              </motion.div>

              <span
                className={cn(
                  'select-none font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br',
                  config.accent,
                  compact ? 'text-[4.5rem] sm:text-[5rem]' : 'text-[5.5rem] sm:text-[7rem]',
                )}
                aria-hidden
              >
                {config.rightDigit}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          {t(config.titleKey)}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-gray-500 sm:text-base">
          {t(config.descriptionKey)}
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          {t(config.hintKey)}
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {variant === 'error' && onReload && (
            <button
              type="button"
              onClick={onReload}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t('routeError.reload')}
            </button>
          )}

          {actionLinks.map(({ to, label, icon: Icon, primary }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider transition-colors',
                primary
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
