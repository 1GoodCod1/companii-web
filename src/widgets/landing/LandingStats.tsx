import { useTranslation } from 'react-i18next';
import { CloudIcon, ClockIcon, GiftIcon, StackIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const STAT_ICONS = [StackIcon, ClockIcon, GiftIcon, CloudIcon] as const;
const STAT_ICON_CLASSES = [
  'bg-violet-50 text-violet-600',
  'bg-blue-50 text-blue-600',
  'bg-emerald-50 text-emerald-600',
  'bg-slate-100 text-slate-600',
] as const;

export function LandingStats() {
  const { t } = useTranslation();
  const stats = t('landing.stats', { returnObjects: true }) as Array<{
    value: string;
    label: string;
    hint?: string;
  }>;

  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[i];

            return (
              <article key={stat.label} className="bg-white p-6 sm:p-7">
                <span
                  className={cn(
                    'flex size-10 items-center justify-center',
                    STAT_ICON_CLASSES[i],
                  )}
                >
                  <Icon className="size-5" weight="light" />
                </span>
                <p className="mt-5 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-1.5 leading-snug">{stat.label}</p>
                {stat.hint ? (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{stat.hint}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
