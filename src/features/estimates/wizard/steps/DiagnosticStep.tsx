import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormSection,
  Panel,
  cabinetBtnPrimary,
} from '@/components/cabinet/cabinet-ui';
import { CustomFieldInput } from '@/features/estimates/components/CustomFieldInput';
import { CustomPricingFields } from '@/features/estimates/components/CustomPricingFields';
import { WorkModulesPicker } from '@/features/estimates/components/WorkModulesPicker';
import type { EstimateWizardApi } from '../useEstimateWizard';
import { DiagnosticWarnings } from './diagnostic/DiagnosticWarnings';
import { DiagnosticAdditionalQuestions } from './diagnostic/DiagnosticAdditionalQuestions';

type Props = {
  wizard: EstimateWizardApi;
};

const ADVANCED_SECTION_KEY = 'Avansat';

export function DiagnosticStep({ wizard }: Props) {
  const { t } = useTranslation();
  const {
    project,
    config,
    diagnosticQuestions,
    diagnostic,
    setDiagnostic,
    customPricing,
    setCustomPricing,
    pricingUnitLabel,
    handleSaveDiagnostic,
    enabledWorkModules,
    setWorkModuleEnabled,
    customFieldSections,
    validationErrors,
    validationWarnings,
    apiWarnings,
    hasBlockingErrors,
    isReadOnly,
  } = wizard;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const warningByKey = new Map<string, string>();
  for (const w of validationWarnings ?? []) warningByKey.set(w.key, w.message);
  for (const w of apiWarnings ?? []) {
    if (!warningByKey.has(w.key)) warningByKey.set(w.key, w.message);
  }

  const basicSections = customFieldSections.filter((s) => s.label !== ADVANCED_SECTION_KEY);
  const advancedSections = customFieldSections.filter((s) => s.label === ADVANCED_SECTION_KEY);
  const advancedFieldsCount = advancedSections.reduce((acc, s) => acc + s.fields.length, 0);

  const handleUpdateField = (key: string, value: unknown) => {
    setDiagnostic({ ...diagnostic, [key]: value });
  };

  return (
    <Panel className="p-6 max-w-2xl space-y-5">
      <h3 className="font-bold text-gray-900">
        {t('company.estimateWizard.diagnosticStep.title', { category: project.category.name })}
      </h3>

      {config?.workModules?.length ? (
        <WorkModulesPicker
          config={config}
          enabled={enabledWorkModules}
          onToggle={setWorkModuleEnabled}
          disabled={isReadOnly}
        />
      ) : null}

      <DiagnosticWarnings
        diagnostic={diagnostic}
        enabledWorkModules={enabledWorkModules}
      />

      {basicSections.map((section) => (
        <FormSection key={section.key} title={section.label}>
          <div className="grid sm:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <CustomFieldInput
                key={field.key}
                field={field}
                value={diagnostic[field.key]}
                onChange={(val) => handleUpdateField(field.key, val)}
                error={validationErrors?.[field.key]}
                warning={warningByKey.get(field.key)}
                disabled={isReadOnly}
              />
            ))}
          </div>
        </FormSection>
      ))}

      {advancedFieldsCount > 0 && (
        <div className="rounded-none border border-slate-200 bg-white/60">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
            aria-expanded={showAdvanced}
          >
            <span className="text-sm font-semibold text-gray-900">
              {t('company.estimateWizard.diagnosticStep.advancedToggle', {
                defaultValue: 'Detalii avansate',
              })}
              <span className="ml-2 text-[11px] font-medium text-gray-400">
                ({advancedFieldsCount})
              </span>
            </span>
            <span className="text-xs font-bold text-gray-500">{showAdvanced ? '−' : '+'}</span>
          </button>
          {showAdvanced && (
            <div className="border-t border-slate-200 p-4 sm:p-5 space-y-4">
              {advancedSections.map((section) => (
                <div key={section.key} className="grid sm:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <CustomFieldInput
                      key={field.key}
                      field={field}
                      value={diagnostic[field.key]}
                      onChange={(val) => handleUpdateField(field.key, val)}
                      error={validationErrors?.[field.key]}
                      warning={warningByKey.get(field.key)}
                      disabled={isReadOnly}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <DiagnosticAdditionalQuestions
        questions={diagnosticQuestions}
        diagnostic={diagnostic}
        onChange={handleUpdateField}
        validationErrors={validationErrors}
        warningByKey={warningByKey}
        isReadOnly={isReadOnly}
      />

      <CustomPricingFields
        values={customPricing}
        onChange={setCustomPricing}
        compact
        unitLabel={pricingUnitLabel}
        disabled={isReadOnly}
      />

      {isReadOnly ? (
        <button
          type="button"
          onClick={() => wizard.setStepIndex((i) => Math.min(i + 1, wizard.steps.length - 1))}
          className={cabinetBtnPrimary}
        >
          {t('company.estimateWizard.wizard.next', { defaultValue: 'Înainte' })}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSaveDiagnostic}
          disabled={hasBlockingErrors}
          className={cabinetBtnPrimary}
        >
          {t('company.estimateWizard.diagnosticStep.save')}
        </button>
      )}
    </Panel>
  );
}
