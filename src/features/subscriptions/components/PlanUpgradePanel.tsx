import { Link } from 'react-router-dom';
import { PLAN_LABELS } from '@/config/planEntitlements';
import type { CompanySubscriptionPlanCode } from '@/features/subscriptions/types';
import { cabinetBtnPrimary, cabinetPanelClass } from '@/components/cabinet/cabinet-ui';

export function PlanUpgradePanel({
  requiredPlan,
  featureLabel,
}: {
  requiredPlan: CompanySubscriptionPlanCode;
  featureLabel?: string;
}) {
  const label = featureLabel ?? `funcționalitatea ${PLAN_LABELS[requiredPlan]}`;

  return (
    <div className={`${cabinetPanelClass} max-w-xl mx-auto mt-8 p-8 text-center space-y-4`}>
      <p className="text-sm font-bold text-violet-700 uppercase tracking-widest">Plan necesar</p>
      <h2 className="text-2xl font-black text-gray-900">
        Disponibil din planul {PLAN_LABELS[requiredPlan]}
      </h2>
      <p className="text-sm text-gray-600">
        Planul tău curent nu include {label}. Treci la {PLAN_LABELS[requiredPlan]} pentru a continua.
      </p>
      <Link
        to={`/company/subscription?upgrade=${requiredPlan}`}
        className={`inline-flex ${cabinetBtnPrimary}`}
      >
        Vezi abonamente
      </Link>
    </div>
  );
}
