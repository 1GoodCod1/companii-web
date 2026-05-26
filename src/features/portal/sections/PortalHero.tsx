import { PageHero, SoftBadge } from '@/components/cabinet/cabinet-ui';
import { ESTIMATE_STATUS } from '@/constants/estimateStatus.constants';
import { QUOTE_STATUS } from '@/constants/quoteStatus.constants';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import { isActiveInterventionStatus, isInterventionStatus } from '@/utils/interventionStatus';

export function PortalHero({ data }: { data: PortalDashboardDto }) {
  const { customer, interventions, quotes, invoices, estimates } = data;
  const pendingQuotes = quotes.filter((q) => q.status === QUOTE_STATUS.SENT).length;
  const pendingEstimates = estimates.filter((e) => e.status === ESTIMATE_STATUS.SENT).length;
  const activeJobs = interventions.filter(
    (i) => isInterventionStatus(i.status) && isActiveInterventionStatus(i.status),
  ).length;

  return (
    <PageHero
      eyebrow="Portal client Faber"
      title={`Salut, ${customer.fullName}! 👋`}
      description="Urmărește lucrările, aprobă oferte și consultă facturile — totul într-un singur loc."
      action={
        <div className="rounded-2xl bg-white/70 px-4 py-3 text-xs text-gray-600 space-y-1.5 shadow-xs min-w-[200px]">
          <p className="truncate">
            <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wide mr-1">
              Adresă
            </span>
            {customer.address}
          </p>
          <p>
            <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wide mr-1">
              Telefon
            </span>
            {customer.phone}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <SoftBadge tone="violet">{activeJobs} active</SoftBadge>
            <SoftBadge tone="blue">{pendingQuotes} oferte</SoftBadge>
            <SoftBadge tone="amber">{pendingEstimates} smete</SoftBadge>
            <SoftBadge tone="emerald">{invoices.length} facturi</SoftBadge>
          </div>
        </div>
      }
    />
  );
}
