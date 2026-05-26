import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Receipt, TrendingUp } from 'lucide-react';

const INVOICE_NUMBERS = ['FAC-2026-089', 'FAC-2026-088', 'FAC-2026-087'];
const INVOICE_AMOUNTS = ['4.850', '12.400', '2.100'];
const INVOICE_TONES = [
  'text-emerald-600 bg-emerald-50',
  'text-amber-600 bg-amber-50',
  'text-emerald-600 bg-emerald-50',
];
const BARS = [42, 68, 55, 82, 74, 91, 88];

export function LandingFinanceMock({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const invoices = t('landingMocks.finance.invoices', { returnObjects: true }) as Array<{
    client: string;
    status: string;
  }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 12 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`landing-dashboard-3d relative w-full max-w-4xl mx-auto ${className}`}
    >
      <div className="absolute -inset-10 landing-glow rounded-[2.5rem] bg-gradient-to-br from-emerald-400/15 via-indigo-400/10 to-violet-400/20 blur-3xl -z-10" />

      <div className="rounded-[1.75rem] border border-white/60 bg-white/95 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.2)] overflow-hidden backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100/80 bg-slate-50/80">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-[10px] font-medium text-gray-400">
            {t('landingMocks.finance.windowTitle')}
          </span>
        </div>

        <div className="p-5 sm:p-6 grid lg:grid-cols-5 gap-5 bg-gradient-to-br from-white via-emerald-50/20 to-indigo-50/10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/80">
                  {t('landingMocks.finance.eyebrow')}
                </p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {t('landingMocks.finance.amount')}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('landingMocks.finance.growth')}
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-2.5">
                <Receipt className="h-5 w-5 text-violet-600" />
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-gray-100/80 p-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t('landingMocks.finance.weeklyTitle')}
              </p>
              <div className="flex items-end gap-1.5 h-24">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-400 opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl bg-white/70 border border-gray-100/80 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">{t('landingMocks.finance.recentTitle')}</p>
              <span className="text-[10px] font-semibold text-violet-600 flex items-center gap-0.5">
                {t('landingMocks.finance.viewAll')} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="space-y-2">
              {invoices.map((inv, i) => (
                <div
                  key={INVOICE_NUMBERS[i]}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{INVOICE_NUMBERS[i]}</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{inv.client}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{INVOICE_AMOUNTS[i]} MDL</p>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-semibold ${INVOICE_TONES[i]}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-emerald-50/80 py-2.5">
                <p className="text-[9px] text-gray-500">{t('landingMocks.finance.stats.paid')}</p>
                <p className="text-sm font-bold text-emerald-700">62.4k</p>
              </div>
              <div className="rounded-xl bg-amber-50/80 py-2.5">
                <p className="text-[9px] text-gray-500">{t('landingMocks.finance.stats.overdue')}</p>
                <p className="text-sm font-bold text-amber-700">12.4k</p>
              </div>
              <div className="rounded-xl bg-violet-50/80 py-2.5">
                <p className="text-[9px] text-gray-500">{t('landingMocks.finance.stats.vat')}</p>
                <p className="text-sm font-bold text-violet-700">9.8k</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-3 top-12 hidden lg:block rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-premium border border-emerald-100/60"
      >
        <p className="text-[10px] text-gray-400">{t('landingMocks.finance.vatBadge')}</p>
        <p className="text-sm font-bold text-gray-800">{t('landingMocks.finance.vatValue')}</p>
      </motion.div>
    </motion.div>
  );
}
