import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cabinetBtnPrimary, cabinetBtnSecondary } from '@/components/cabinet/cabinet-ui';
import { PlanEditor } from '@/features/estimates/components/PlanEditor';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

export function PlanStep({ wizard }: Props) {
  const { t } = useTranslation();
  const {
    project,
    config,
    plan2d,
    setPlan2d,
    handleSavePlan,
    setStepIndex,
  } = wizard;

  return (
    <div className="space-y-6">
      <PlanEditor
        value={plan2d}
        config={config}
        categoryName={project.category.name}
        categorySlug={project.category.slug}
        onChange={setPlan2d}
      />
      <div className="flex gap-3">
        <button type="button" onClick={handleSavePlan} className={cabinetBtnPrimary}>
          <Save className="w-4 h-4" /> {t('company.estimateWizard.planStep.saveDimensions')}
        </button>
        <button type="button" onClick={() => setStepIndex((i) => i + 1)} className={cabinetBtnSecondary}>
          {t('company.estimateWizard.planStep.continueWithoutSave')}
        </button>
      </div>
    </div>
  );
}
