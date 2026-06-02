import { Calculator, Layers, Tag } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  AppSelect,
  Panel,
  cabinetBtnPrimary,
} from '@/widgets/cabinet/cabinet-ui';
import { LeadBudgetGauge } from '@/features/estimates/components/LeadBudgetGauge';
import {
  useApplyEstimateTemplateMutation,
  useEstimateTemplatesQuery,
} from '@/features/estimates/api/useEstimateTemplates';
import { getHiddenStagesCount } from '@/features/estimates/stages/stageVisibility';
import { getErrorMessage } from '@/shared/utils/errors';
import type { EstimateWizardApi } from '../useEstimateWizard';
import { StageCard } from './stages/StageCard';

type Props = {
  wizard: EstimateWizardApi;
};

export function StagesStep({ wizard }: Props) {
  const { t } = useTranslation();
  const {
    project,
    config,
    enabledWorkModules,
    stageGroups,
    calculate,
    handleCalculate,
    estimateMode,
    setEstimateMode,
    previewTotals,
    isReadOnly,
  } = wizard;

  const currentTotal = Number(project.grandTotal ?? 0) || previewTotals?.grandTotal || 0;
  const { data: templates } = useEstimateTemplatesQuery();
  const applyTemplate = useApplyEstimateTemplateMutation();

  const handleApplyPricingTemplate = async (templateId: string) => {
    if (!templateId) return;
    try {
      const result = await applyTemplate.mutateAsync({
        id: templateId,
        projectId: project.id,
        mode: 'pricing',
      });
      const count = result.pricingMatchedCount ?? 0;
      if (count === 0) {
        toast(
          t('company.estimateWizard.stagesStep.pricingTemplateNoMatch', {
            defaultValue: 'Niciun preț din șablon nu se potrivește cu liniile curente',
          }),
          { icon: 'ℹ️' },
        );
      } else {
        toast.success(
          t('company.estimateWizard.stagesStep.pricingTemplateAppliedCount', {
            count,
            defaultValue: '{{count}} prețuri actualizate din șablon',
          }),
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to apply pricing template'));
    }
  };

  const hiddenStagesCount = getHiddenStagesCount(
    project.stages ?? [],
    config,
    enabledWorkModules,
  );

  const hasGroups = stageGroups.length > 0;
  const singleGroup = stageGroups.length <= 1 && (stageGroups[0]?.moduleKey == null);

  const displayGroups = estimateMode === 'brief'
    ? stageGroups.filter(
        (g) => g.stages.some((s) => s.meaningfulLineCount > 0),
      )
    : stageGroups;

  let globalIndex = 0;

  const pricingTemplateOptions = useMemo(
    () => [
      {
        value: '',
        label: t('company.estimateWizard.stagesStep.applyPricingTemplate', {
          defaultValue: 'Aplică prețuri din șablon...',
        }),
      },
      ...(templates?.map((tpl) => ({ value: tpl.id, label: tpl.name })) ?? []),
    ],
    [templates, t],
  );

  return (
    <div className="space-y-4">
      {project.sourceLead?.estimatedBudget && (
        <LeadBudgetGauge
          budget={project.sourceLead.estimatedBudget}
          currentTotal={currentTotal}
        />
      )}
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-gray-900">{t('company.estimateWizard.stagesStep.title')}</h3>
            <p className="text-sm text-gray-500">
              {t('company.estimateWizard.stagesStep.description')}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!isReadOnly && templates && templates.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <Tag className="size-3.5 text-indigo-500" />
                <AppSelect
                  value=""
                  onChange={handleApplyPricingTemplate}
                  options={pricingTemplateOptions}
                  aria-label={t('company.estimateWizard.stagesStep.applyPricingTemplate', {
                    defaultValue: 'Aplică prețuri din șablon...',
                  })}
                  className="max-w-[180px]"
                  maxVisibleItems={8}
                  disabled={applyTemplate.isPending}
                />
              </div>
            )}
            <div className="flex rounded-xl bg-slate-100 p-0.5">
              {(['brief', 'detailed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEstimateMode(mode)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    estimateMode === mode
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t(`company.estimateWizard.stagesStep.mode.${mode}`)}
                </button>
              ))}
            </div>
            {isReadOnly ? (
              <button
                type="button"
                onClick={() => wizard.setStepIndex(wizard.steps.indexOf('review'))}
                className={cabinetBtnPrimary}
              >
                {t('company.estimateWizard.wizard.next', { defaultValue: 'Înainte' })}
              </button>
            ) : (
              <button type="button" onClick={handleCalculate} disabled={calculate.isPending} className={cabinetBtnPrimary}>
                <Calculator className="size-4" /> {t('company.estimateWizard.stagesStep.calculate')}
              </button>
            )}
          </div>
        </div>

        {hiddenStagesCount > 0 && (
          <p className="mb-4 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[11px] font-medium text-slate-500">
            {t('company.estimateWizard.stagesStep.hiddenStagesNotice', { count: hiddenStagesCount })}
          </p>
        )}

        {!hasGroups ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-6 text-center space-y-2">
            <p className="text-xs font-semibold text-amber-900">
              {t('company.estimateWizard.stagesStep.noStages')}
            </p>
            <p className="text-[11px] text-amber-700/80 leading-relaxed">
              {t('company.estimateWizard.stagesStep.noStagesHint', {
                defaultValue:
                  'Reveniți la pasul «Diagnostic» și activați modulele de care aveți nevoie — etapele se vor genera automat.',
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayGroups.map((group) => (
              <div key={group.moduleKey ?? '__unlabeled__'} className="space-y-4">
                {!singleGroup && (
                  <div className="flex items-center gap-2 pt-1">
                    <Layers className="size-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      {group.label}
                    </h4>
                    <div className="flex-1 h-px bg-indigo-100" />
                  </div>
                )}
                <div className="space-y-4">
                  {group.stages.map(({ stage }) => {
                    const idx = globalIndex++;
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        index={idx}
                        wizard={wizard}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}