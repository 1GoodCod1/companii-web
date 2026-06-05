import { FloppyDiskIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { cabinetBtnPrimary, cabinetBtnSecondary } from '@/widgets/cabinet/cabinet-ui';
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
    isReadOnly,
  } = wizard;

  return (
    <div className="space-y-6">
      <PlanEditor
        value={plan2d}
        config={config}
        categoryName={project.category.name}
        categorySlug={project.category.slug}
        onChange={setPlan2d}
        readOnly={isReadOnly}
      />
      <div className="flex gap-3">
        {isReadOnly ? (
          <button type="button" onClick={() => setStepIndex((i) => i + 1)} className={cabinetBtnPrimary}>
            {t('company.estimateWizard.wizard.next', { defaultValue: 'Înainte' })}
          </button>
        ) : (
          <>
            <button type="button" onClick={handleSavePlan} className={cabinetBtnPrimary}>
              <FloppyDiskIcon className="size-4" /> {t('company.estimateWizard.planStep.saveDimensions')}
            </button>
            <button type="button" onClick={() => setStepIndex((i) => i + 1)} className={cabinetBtnSecondary}>
              {t('company.estimateWizard.planStep.continueWithoutSave')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
