import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PLAN_LABELS } from '@/constants/subscriptions.constants';
import type { CompanySubscriptionPlanCode } from '@/types/subscriptions';
import { cabinetBtnPrimary, cabinetPanelClass } from '@/components/cabinet/cabinet-ui';

export function PlanUpgradePanel({
  requiredPlan,
  featureLabel,
}: {
  requiredPlan: CompanySubscriptionPlanCode;
  featureLabel?: string;
}) {
  const { t } = useTranslation();
  const planName = PLAN_LABELS[requiredPlan];
  const feature =
    featureLabel ??
    t('cabinet.shell.planUpgrade.defaultFeature', { plan: planName });

  return (
    <div className={`${cabinetPanelClass} max-w-xl mx-auto mt-8 p-8 text-center space-y-4`}>
      <p className="text-sm font-bold text-violet-700 uppercase tracking-widest">
        {t('cabinet.shell.planUpgrade.eyebrow')}
      </p>
      <h2 className="text-2xl font-black text-gray-900">
        {t('cabinet.shell.planUpgrade.title', { plan: planName })}
      </h2>
      <p className="text-sm text-gray-600">
        {t('cabinet.shell.planUpgrade.description', { feature, plan: planName })}
      </p>
      <Link
        to={`/company/subscription?upgrade=${requiredPlan}`}
        className={`inline-flex ${cabinetBtnPrimary}`}
      >
        {t('cabinet.shell.planUpgrade.viewSubscriptions')}
      </Link>
    </div>
  );
}
