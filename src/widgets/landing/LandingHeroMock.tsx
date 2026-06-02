import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Inbox,
  LayoutDashboard,
  Receipt,
  Users,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_ICONS = [LayoutDashboard, Users, Inbox, Wrench, Calendar] as const;

const KPI_ACCENTS = [
  { tone: 'from-blue-500/10 to-cyan-500/5', iconBg: 'bg-blue-500/10 text-blue-600', hintClass: 'text-blue-600/80' },
  { tone: 'from-amber-500/10 to-orange-500/5', iconBg: 'bg-amber-500/10 text-amber-600', hintClass: 'text-amber-600/80' },
  { tone: 'from-violet-500/10 to-indigo-500/5', iconBg: 'bg-violet-500/10 text-violet-600', hintClass: 'text-violet-600/80' },
  { tone: 'from-emerald-500/10 to-teal-500/5', iconBg: 'bg-emerald-500/10 text-emerald-600', hintClass: 'text-emerald-600/80' },
] as const;

const KPI_ICONS = [Users, Wrench, Receipt, BadgeCheck] as const;

const STATUS_TONES: Record<string, string> = {
  'În lucru': 'bg-blue-50 text-blue-700',
  'Programat': 'bg-violet-50 text-violet-700',
  'В работе': 'bg-blue-50 text-blue-700',
  'Запланировано': 'bg-violet-50 text-violet-700',
};

export function LandingHeroMock() {
  const { t } = useTranslation();
  const kpis = t('landingMocks.hero.kpis', { returnObjects: true }) as Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  const interventions = t('landingMocks.hero.interventions', { returnObjects: true }) as {
    title: string;
    viewAll: string;
    items: Array<{ number: string; type: string; client: string; status: string; time: string }>;
  };
  const leads = t('landingMocks.hero.leads', { returnObjects: true }) as {
    title: string;
    viewAll: string;
    items: Array<{ name: string; phone: string; service: string }>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="landing-dashboard-3d relative w-full max-w-[720px] mx-auto"
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-violet-500/[0.07] blur-[72px] -z-10" />

      <div className="rounded-[1.5rem] border border-gray-200/80 bg-white shadow-[0_32px_80px_-16px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-slate-50/90">
          <span className="h-2 w-2 rounded-full bg-red-400/90" />
          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
          <span className="ml-2 text-[10px] font-medium text-gray-400 truncate">
            {t('landingMocks.hero.windowTitle')}
          </span>
        </div>

        <div className="flex min-h-[380px]">
          <aside className="hidden sm:flex w-11 shrink-0 flex-col items-center gap-1 border-r border-gray-100 bg-white py-3">
            {SIDEBAR_ICONS.map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  i === 0
                    ? 'bg-violet-50 text-violet-600 shadow-xs'
                    : 'text-gray-400',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
            ))}
          </aside>

          <div className="flex-1 min-w-0 bg-slate-50/50 p-3 sm:p-4 space-y-3">
            <div className="rounded-xl border border-violet-100/60 bg-gradient-to-br from-white via-violet-50/20 to-indigo-50/10 px-3.5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-600/80">
                    {t('landingMocks.hero.eyebrow')}
                  </p>
                  <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight mt-0.5 truncate">
                    {t('landingMocks.hero.greeting')}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
                  {t('landingMocks.hero.planBadge')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {kpis.map((kpi, i) => {
                const accent = KPI_ACCENTS[i];
                const Icon = KPI_ICONS[i];
                return (
                  <motion.article
                    key={kpi.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06, duration: 0.45 }}
                    className={cn(
                      'rounded-xl border border-white/80 bg-gradient-to-br p-2.5 sm:p-3',
                      accent.tone,
                    )}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-400 leading-tight">
                        {kpi.label}
                      </span>
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          accent.iconBg,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                    </div>
                    <p className="mt-2 text-lg sm:text-xl font-black tracking-tight text-gray-900">
                      {kpi.value}
                    </p>
                    <p className={cn('text-[9px] font-bold mt-0.5', accent.hintClass)}>{kpi.hint}</p>
                  </motion.article>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <section className="rounded-xl border border-gray-100/80 bg-white/90 p-3">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <p className="text-[11px] font-semibold text-gray-900">{interventions.title}</p>
                  <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                    {interventions.viewAll}
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="space-y-1.5">
                  {interventions.items.map((item) => (
                    <div
                      key={item.number}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                          {item.number}
                        </span>
                        <p className="text-[10px] font-semibold text-gray-800 truncate">{item.type}</p>
                        <p className="text-[9px] text-gray-500 truncate">{item.client}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            'inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold',
                            STATUS_TONES[item.status] ?? 'bg-slate-100 text-gray-600',
                          )}
                        >
                          {item.status}
                        </span>
                        <p className="text-[8px] text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-100/80 bg-white/90 p-3">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <p className="text-[11px] font-semibold text-gray-900">{leads.title}</p>
                  <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                    {leads.viewAll}
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="space-y-1.5">
                  {leads.items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-lg bg-slate-50/80 px-2.5 py-2 space-y-1.5"
                    >
                      <div>
                        <p className="text-[10px] font-semibold text-gray-800">{item.name}</p>
                        <p className="text-[9px] text-gray-500">{item.phone}</p>
                        <p className="text-[9px] font-semibold text-violet-600 mt-0.5">{item.service}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="rounded-md bg-gray-900 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-white">
                          {t('landingMocks.hero.leadActionPrimary')}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[7px] font-semibold text-gray-600">
                          {t('landingMocks.hero.leadActionSecondary')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="absolute -right-1 sm:-right-4 bottom-8 hidden md:block rounded-xl border border-emerald-100/80 bg-white px-3 py-2.5 shadow-lg shadow-emerald-500/5"
      >
        <p className="text-[9px] text-gray-400">{t('landingMocks.hero.statusUpdated')}</p>
        <p className="text-[11px] font-bold text-emerald-600">{t('landingMocks.hero.statusExample')}</p>
      </motion.div>
    </motion.div>
  );
}
