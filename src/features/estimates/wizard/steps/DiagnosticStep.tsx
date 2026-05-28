import { useTranslation } from 'react-i18next';
import {
  FormSection,
  Panel,
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { CustomFieldInput } from '@/features/estimates/components/CustomFieldInput';
import { CustomPricingFields } from '@/features/estimates/components/CustomPricingFields';
import { WorkModulesPicker } from '@/features/estimates/components/WorkModulesPicker';
import { parseNumberInputValue } from '@/features/estimates/diagnosticValidation';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

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
  } = wizard;

  const warningByKey = new Map<string, string>();
  for (const w of validationWarnings ?? []) warningByKey.set(w.key, w.message);
  for (const w of apiWarnings ?? []) {
    if (!warningByKey.has(w.key)) warningByKey.set(w.key, w.message);
  }

  return (
    <Panel className="p-6 max-w-2xl space-y-5">
      <h3 className="font-bold text-gray-900">
        {t('company.estimateWizard.diagnosticStep.title', { category: project.category.name })}
      </h3>

      {/* H-01: Work modules picker */}
      {config?.workModules?.length ? (
        <WorkModulesPicker
          config={config}
          enabled={enabledWorkModules}
          onToggle={setWorkModuleEnabled}
        />
      ) : null}

      {/* H-02 + H-04: Custom fields grouped by section, only for active modules */}
      {customFieldSections.map((section) => (
        <FormSection key={section.key} title={section.label}>
          <div className="grid sm:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <CustomFieldInput
                key={field.key}
                field={field}
                value={diagnostic[field.key]}
                onChange={(val) => setDiagnostic({ ...diagnostic, [field.key]: val })}
                error={validationErrors?.[field.key]}
                warning={warningByKey.get(field.key)}
              />
            ))}
          </div>
        </FormSection>
      ))}

      {/* H-03: Diagnostic questions (excluding keys already in customFields) */}
      {diagnosticQuestions.length > 0 && (
        <FormSection title={t('company.estimateWizard.diagnosticStep.additionalQuestions')}>
          <div className="grid sm:grid-cols-2 gap-4">
            {diagnosticQuestions.map((q) => {
              const error = validationErrors?.[q.key];
              const currentValue = diagnostic[q.key];
              return (
                <label key={q.key} className={cabinetLabelClass}>
                  {q.label}
                  {q.type === 'boolean' ? (
                    <select
                      value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDiagnostic({
                          ...diagnostic,
                          [q.key]: v === '' ? undefined : v === 'true',
                        });
                      }}
                      className={cabinetSelectClass}
                    >
                      <option value="">—</option>
                      <option value="true">{t('company.estimateWizard.diagnosticStep.yes')}</option>
                      <option value="false">{t('company.estimateWizard.diagnosticStep.no')}</option>
                    </select>
                  ) : q.type === 'select' ? (
                    <select
                      value={String(currentValue ?? '')}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDiagnostic({ ...diagnostic, [q.key]: v === '' ? undefined : v });
                      }}
                      className={cabinetSelectClass}
                    >
                      <option value="">—</option>
                      {(q.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={currentValue == null || currentValue === '' ? '' : String(currentValue)}
                      onChange={(e) =>
                        setDiagnostic({
                          ...diagnostic,
                          [q.key]: parseNumberInputValue(e.target.value),
                        })
                      }
                      className={cabinetFieldClass}
                    />
                  )}
                  {error && <span className="text-xs text-rose-600 mt-1">{error}</span>}
                </label>
              );
            })}
          </div>
        </FormSection>
      )}

      <CustomPricingFields
        values={customPricing}
        onChange={setCustomPricing}
        compact
        unitLabel={pricingUnitLabel}
      />

      <button
        type="button"
        onClick={handleSaveDiagnostic}
        disabled={hasBlockingErrors}
        className={cabinetBtnPrimary}
      >
        {t('company.estimateWizard.diagnosticStep.save')}
      </button>
    </Panel>
  );
}
