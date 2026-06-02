import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Calendar,
  Download,
  FileText,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_ICONS = [LayoutDashboard, Users, Wrench, FileText, Receipt, Calendar] as const;
const ACTIVE_SIDEBAR_INDEX = 4;

const INVOICE_NUMBERS = ['FAC-2026-089', 'FAC-2026-088', 'FAC-2026-087'];
const INVOICE_AMOUNTS = ['4.850', '12.400', '2.100'];
const INVOICE_DATES = ['28 mai', '26 mai', '24 mai'];
const INVOICE_WORKS = ['LUC-1039', 'LUC-1042', 'LUC-1045'];
const STATUS_TONES = [
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
];
const BARS = [42, 68, 55, 82, 74, 91, 88];

const SUMMARY_ACCENTS = [
  { tone: 'from-emerald-500/10 to-teal-500/5', valueClass: 'text-gray-900', hintClass: 'text-emerald-600' },
  { tone: 'from-blue-500/10 to-cyan-500/5', valueClass: 'text-emerald-700', hintClass: 'text-gray-400' },
  { tone: 'from-amber-500/10 to-orange-500/5', valueClass: 'text-amber-700', hintClass: 'text-gray-400' },
] as const;

export function LandingFinanceMock({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const invoices = t('landingMocks.finance.invoices', { returnObjects: true }) as Array<{
    client: string;
    status: string;
  }>;
  const summaryCards = t('landingMocks.finance.summaryCards', { returnObjects: true }) as Array<{
    label: string;
    value: string;
    hint: string;
  }>;

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn('landing-dashboard-3d relative w-full max-w-[720px] mx-auto', className)}
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-emerald-500/[0.07] blur-[72px] -z-10" />

      <div className="rounded-[1.5rem] border border-gray-200/80 bg-white shadow-[0_32px_80px_-16px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-slate-50/90">
          <span className="size-2 rounded-full bg-red-400/90" />
          <span className="size-2 rounded-full bg-amber-400/90" />
          <span className="size-2 rounded-full bg-emerald-400/90" />
          <span className="ml-2 text-[10px] font-medium text-gray-400 truncate">
            {t('landingMocks.finance.windowTitle')}
          </span>
        </div>

        <div className="flex min-h-[400px]">
          <aside className="hidden sm:flex w-11 shrink-0 flex-col items-center gap-1 border-r border-gray-100 bg-white py-3">
            {SIDEBAR_ICONS.map((Icon, i) => (
              <span
                key={Icon.displayName}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg transition-colors',
                  i === ACTIVE_SIDEBAR_INDEX
                    ? 'bg-violet-50 text-violet-600 shadow-xs'
                    : 'text-gray-400',
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            ))}
          </aside>

          <div className="flex-1 min-w-0 bg-slate-50/50 p-3 sm:p-4 space-y-3">
            <div className="rounded-xl border border-violet-100/60 bg-gradient-to-br from-white via-violet-50/20 to-indigo-50/10 px-3.5 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                    {t('landingMocks.finance.pageTitle')}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-sm">
                    {t('landingMocks.finance.pageDescription')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <span className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[9px] font-bold text-gray-600">
                    {t('landingMocks.finance.filterAll')}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-semibold text-gray-600">
                    <Download className="size-3" />
                    {t('landingMocks.finance.exportBtn')}
                  </span>
                  <span className="rounded-lg bg-gray-900 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                    {t('landingMocks.finance.generateBtn')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {summaryCards.map((card, i) => {
                const accent = SUMMARY_ACCENTS[i];
                return (
                  <article
                    key={card.label}
                    className={cn(
                      'rounded-xl border border-white/80 bg-gradient-to-br p-2.5 sm:p-3',
                      accent.tone,
                    )}
                  >
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-400">
                      {card.label}
                    </p>
                    <p className={cn('mt-1.5 text-base sm:text-lg font-black tracking-tight', accent.valueClass)}>
                      {card.value}
                    </p>
                    <p className={cn('text-[9px] font-semibold mt-0.5 flex items-center gap-0.5', accent.hintClass)}>
                      {i === 0 ? <TrendingUp className="size-3 shrink-0" /> : null}
                      {card.hint}
                    </p>
                  </article>
                );
              })}
            </div>

            <section className="rounded-xl border border-gray-100/80 bg-white/90 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {(
                        t('landingMocks.finance.columns', { returnObjects: true }) as string[]
                      ).map((col) => (
                        <th
                          key={col}
                          className="px-2.5 py-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((inv, i) => (
                      <tr key={INVOICE_NUMBERS[i]} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-2.5 py-2">
                          <p className="text-[10px] font-bold text-gray-800">{INVOICE_NUMBERS[i]}</p>
                          <p className="text-[8px] font-semibold uppercase text-gray-400 mt-0.5">
                            {INVOICE_DATES[i]}
                          </p>
                        </td>
                        <td className="px-2.5 py-2">
                          <p className="text-[10px] font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">
                            {inv.client}
                          </p>
                          <p className="text-[8px] text-gray-400 mt-0.5">{INVOICE_WORKS[i]}</p>
                        </td>
                        <td className="px-2.5 py-2">
                          <p className="text-[10px] sm:text-xs font-black text-gray-950 whitespace-nowrap">
                            {INVOICE_AMOUNTS[i]} MDL
                          </p>
                        </td>
                        <td className="px-2.5 py-2">
                          <span
                            className={cn(
                              'inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide',
                              STATUS_TONES[i],
                            )}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100/80 bg-white/90 p-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {t('landingMocks.finance.weeklyTitle')}
                </p>
                <span className="text-[9px] font-semibold text-violet-600 flex items-center gap-0.5">
                  {t('landingMocks.finance.viewAll')}
                  <ArrowUpRight className="size-2.5" />
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-16 sm:h-20">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-emerald-500/80"
                    style={{ height: `${h}%`, opacity: 0.45 + (h / 100) * 0.55 }}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -right-1 sm:-right-4 top-16 hidden md:block rounded-xl border border-emerald-100/80 bg-white px-3 py-2.5 shadow-lg shadow-emerald-500/5"
      >
        <p className="text-[9px] text-gray-400">{t('landingMocks.finance.vatBadge')}</p>
        <p className="text-[11px] font-bold text-gray-800">{t('landingMocks.finance.vatValue')}</p>
      </m.div>
    </m.div>
  );
}
