import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cloud, Clock, Gift, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAT_ICONS = [Layers, Clock, Gift, Cloud] as const;
const STAT_STYLES = [
  { tone: 'from-violet-500/10 to-indigo-500/5', iconBg: 'bg-violet-500/10', iconClass: 'text-violet-600' },
  { tone: 'from-blue-500/10 to-cyan-500/5', iconBg: 'bg-blue-500/10', iconClass: 'text-blue-600' },
  { tone: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-500/10', iconClass: 'text-emerald-600' },
  { tone: 'from-slate-500/10 to-slate-400/5', iconBg: 'bg-slate-500/10', iconClass: 'text-slate-600' },
] as const;

export function LandingStats() {
  const { t } = useTranslation();
  const stats = t('landing.stats', { returnObjects: true }) as Array<{
    value: string;
    label: string;
    hint?: string;
  }>;

  return (
    <section className="border-y border-gray-100/80 bg-slate-50/40">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[i];
            const style = STAT_STYLES[i];

            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={cn(
                  'rounded-2xl border border-white/80 bg-gradient-to-br p-5 sm:p-6 shadow-sm',
                  style.tone,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      style.iconBg,
                      style.iconClass,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-4 leading-snug">{stat.label}</p>
                {stat.hint ? (
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{stat.hint}</p>
                ) : null}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
