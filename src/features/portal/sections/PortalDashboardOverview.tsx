import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { QUOTE_STATUS } from '@/constants/quoteStatus.constants';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { isActiveInterventionStatus, isInterventionStatus } from '@/utils/interventionStatus';
import { isPaidPaymentStatus } from '@/utils/invoicePaymentStatus';

export function PortalDashboardOverview({ data }: { data: PortalDashboardDto }) {
  const { t } = useTranslation();
  const { interventions, quotes, invoices, reviews, estimates } = data;
  const pendingQuotes = quotes.filter((q) => q.status === QUOTE_STATUS.SENT).length;
  const pendingEstimates = estimates.filter((e) => e.status === ESTIMATE_STATUS.SENT).length;
  const pendingReviews = interventions.filter((i) => i.canReview).length;
  const activeJobs = interventions.filter(
    (i) => isInterventionStatus(i.status) && isActiveInterventionStatus(i.status),
  ).length;
  const paidInvoices = invoices.filter((i) => isPaidPaymentStatus(i.paymentStatus)).length;

  const cards = [
    {
      label: t('portal.dashboardPage.cardJobs'),
      value: String(interventions.length),
      hint: t('portal.dashboardPage.cardJobsHint', { count: activeJobs }),
      to: '/portal/lucrari',
      tone: 'from-violet-500/10 to-indigo-500/5',
    },
    {
      label: t('portal.dashboardPage.cardQuotes'),
      value: String(pendingQuotes),
      hint: pendingQuotes
        ? t('portal.dashboardPage.cardQuotesPending')
        : t('portal.dashboardPage.cardQuotesEmpty'),
      to: '/portal/oferte',
      tone: 'from-blue-500/10 to-cyan-500/5',
    },
    {
      label: t('portal.dashboardPage.cardEstimates'),
      value: String(pendingEstimates),
      hint: pendingEstimates
        ? t('portal.dashboardPage.cardEstimatesPending')
        : t('portal.dashboardPage.cardEstimatesEmpty'),
      to: '/portal/smete',
      tone: 'from-violet-500/10 to-purple-500/5',
    },
    {
      label: t('portal.dashboardPage.cardInvoices'),
      value: String(invoices.length),
      hint: t('portal.dashboardPage.cardInvoicesPaid', { count: paidInvoices }),
      to: '/portal/facturi',
      tone: 'from-emerald-500/10 to-teal-500/5',
    },
    {
      label: t('portal.dashboardPage.cardReviews'),
      value: String(reviews.length),
      hint: pendingReviews
        ? t('portal.dashboardPage.cardReviewsPending', { count: pendingReviews })
        : t('portal.dashboardPage.cardReviewsThanks'),
      to: '/portal/lucrari',
      tone: 'from-amber-500/10 to-orange-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Link
          key={card.to + card.label}
          to={card.to}
          className={`block rounded-3xl bg-gradient-to-br ${card.tone} p-5 shadow-premium hover:-translate-y-0.5 transition-transform`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
          <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
          <p className="mt-2 text-xs font-medium text-gray-500">{card.hint}</p>
        </Link>
      ))}
    </div>
  );
}
