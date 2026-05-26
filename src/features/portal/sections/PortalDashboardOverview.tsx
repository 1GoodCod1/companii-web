import { Link } from 'react-router-dom';
import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { QUOTE_STATUS } from '@/constants/quoteStatus.constants';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { isActiveInterventionStatus, isInterventionStatus } from '@/utils/interventionStatus';
import { isPaidPaymentStatus } from '@/utils/invoicePaymentStatus';

export function PortalDashboardOverview({ data }: { data: PortalDashboardDto }) {
  const { interventions, quotes, invoices, reviews, estimates } = data;
  const pendingQuotes = quotes.filter((q) => q.status === QUOTE_STATUS.SENT).length;
  const pendingEstimates = estimates.filter((e) => e.status === ESTIMATE_STATUS.SENT).length;
  const pendingReviews = interventions.filter((i) => i.canReview).length;

  const cards = [
    {
      label: 'Lucrările mele',
      value: String(interventions.length),
      hint: `${interventions.filter((i) => isInterventionStatus(i.status) && isActiveInterventionStatus(i.status)).length} în curs`,
      to: '/portal/lucrari',
      tone: 'from-violet-500/10 to-indigo-500/5',
    },
    {
      label: 'Oferte de aprobat',
      value: String(pendingQuotes),
      hint: pendingQuotes ? 'Necesită răspuns' : 'Nicio ofertă în așteptare',
      to: '/portal/oferte',
      tone: 'from-blue-500/10 to-cyan-500/5',
    },
    {
      label: 'Smete de aprobat',
      value: String(pendingEstimates),
      hint: pendingEstimates ? 'Necesită răspuns' : 'Nicio smetă în așteptare',
      to: '/portal/smete',
      tone: 'from-violet-500/10 to-purple-500/5',
    },
    {
      label: 'Facturile mele',
      value: String(invoices.length),
      hint: `${invoices.filter((i) => isPaidPaymentStatus(i.paymentStatus)).length} plătite`,
      to: '/portal/facturi',
      tone: 'from-emerald-500/10 to-teal-500/5',
    },
    {
      label: 'Recenzii trimise',
      value: String(reviews.length),
      hint: pendingReviews ? `${pendingReviews} de lăsat` : 'Mulțumim pentru feedback',
      to: '/portal/lucrari',
      tone: 'from-amber-500/10 to-orange-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Link
          key={card.label}
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
