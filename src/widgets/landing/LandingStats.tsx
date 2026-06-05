import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CloudIcon, ClockIcon, GiftIcon, StackIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const STAT_ICONS = [StackIcon, ClockIcon, GiftIcon, CloudIcon] as const;
const STAT_STYLES = [
  { tone: 'from-violet-500/4 to-indigo-500/1', iconBg: 'bg-violet-500/10', iconClass: 'text-violet-600' },
  { tone: 'from-blue-500/4 to-cyan-500/1', iconBg: 'bg-blue-500/10', iconClass: 'text-blue-600' },
  { tone: 'from-emerald-500/4 to-teal-500/1', iconBg: 'bg-emerald-500/10', iconClass: 'text-emerald-600' },
  { tone: 'from-slate-500/4 to-slate-400/1', iconBg: 'bg-slate-500/10', iconClass: 'text-slate-600' },
] as const;

export function LandingStats() {
  const { t } = useTranslation();
  const stats = t('landing.stats', { returnObjects: true }) as Array<{
    value: string;
    label: string;
    hint?: string;
  }>;

  return (
    <section className="border-y border-gray-100 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[i];
            const style = STAT_STYLES[i];

            return (
              <m.article
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={cn(
                  'rounded-none border border-white/80 bg-gradient-to-br p-5 sm:p-6 shadow-sm',
                  style.tone,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-none',
                      style.iconBg,
                      style.iconClass,
                    )}
                  >
                    <Icon className="size-5" weight="light" />
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-4 leading-snug">{stat.label}</p>
                {stat.hint ? (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{stat.hint}</p>
                ) : null}
              </m.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
