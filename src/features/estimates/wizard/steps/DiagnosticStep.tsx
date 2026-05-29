import { useState } from 'react';
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
import { useTranslateOption } from '@/utils/translateOption';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

const ADVANCED_SECTION_KEY = 'Avansat';

export function DiagnosticStep({ wizard }: Props) {
  const { t } = useTranslation();
  const translateOption = useTranslateOption();
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

  const heightRaw = diagnostic.buildingHeightM;
  const heightNum = typeof heightRaw === 'number' ? heightRaw : Number(heightRaw);
  const showHeightCoeffNotice = Number.isFinite(heightNum) && heightNum > 9;

  // Roof: surface manual-review trigger mirrors backend
  // (roofing-measurements.util.ts → shouldRequireRoofManualReview).
  const slopeRaw = diagnostic.roofSlope;
  const slopeNum = typeof slopeRaw === 'number' ? slopeRaw : Number(slopeRaw);
  const shapeRaw = diagnostic.roofShape;
  const showRoofManualReview =
    (Number.isFinite(slopeNum) && slopeNum > 60) || shapeRaw === 'complex';

  // Cleaning: surface module/type mismatch (e.g. type=post_construction but
  // post_construction module is OFF). Without the module the matching pricing
  // line silently never appears.
  const cleaningTypeRaw = String(diagnostic.cleaningType ?? '');
  const cleaningMismatch =
    (cleaningTypeRaw === 'post_construction' &&
      !enabledWorkModules.includes('post_construction')) ||
    (cleaningTypeRaw === 'deep' && !enabledWorkModules.includes('deep_cleaning'));
  const cleaningMismatchModuleLabel =
    cleaningTypeRaw === 'post_construction'
      ? 'Curățenie post-șantier'
      : cleaningTypeRaw === 'deep'
        ? 'Curățenie profundă'
        : '';

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

      {showHeightCoeffNotice && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200 p-3">
          <span className="text-amber-600 font-extrabold text-sm shrink-0">⚠️</span>
          <span className="text-xs font-semibold text-amber-950 leading-relaxed">
            {t('company.estimateWizard.diagnosticStep.heightCoeffNotice', {
              defaultValue:
                'Înălțime peste 9 m — se aplică automat un coeficient de înălțime 1.2× la manoperă.',
              })}
          </span>
        </div>
      )}

      {showRoofManualReview && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50/70 border border-rose-200 p-3">
          <span className="text-rose-600 font-extrabold text-sm shrink-0">⚠️</span>
          <span className="text-xs font-semibold text-rose-950 leading-relaxed">
            {t('company.estimateWizard.diagnosticStep.roofManualReviewNotice', {
              defaultValue:
                'Pantă abruptă sau formă complexă — devizul este orientativ și necesită verificare la fața locului de către maistru.',
            })}
          </span>
        </div>
      )}

      {cleaningMismatch && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200 p-3">
          <span className="text-amber-600 font-extrabold text-sm shrink-0">⚠️</span>
          <span className="text-xs font-semibold text-amber-950 leading-relaxed">
            {t('company.estimateWizard.diagnosticStep.cleaningTypeMismatch', {
              module: cleaningMismatchModuleLabel,
              defaultValue:
                'Ai ales tipul de curățenie corespunzător dar modulul „{{module}}” nu este activ — liniile speciale nu vor apărea. Activează modulul mai sus.',
            })}
          </span>
        </div>
      )}

      {basicSections.map((section) => (
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
                      onChange={(val) => setDiagnostic({ ...diagnostic, [field.key]: val })}
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

      {diagnosticQuestions.length > 0 && (
        <FormSection title={t('company.estimateWizard.diagnosticStep.additionalQuestions')}>
          <div className="grid sm:grid-cols-2 gap-4">
            {diagnosticQuestions.map((q) => {
              const error = validationErrors?.[q.key];
              const warning = warningByKey.get(q.key);
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
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    >
                      <option value="">—</option>
                      {(q.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {translateOption(opt)}
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
                      disabled={isReadOnly}
                    />
                  )}
                  {error && (
                    <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-rose-50/60 border border-rose-100/80 p-2.5 shadow-2xs animate-fade-in">
                      <span className="text-rose-600 font-extrabold text-xs shrink-0">🚫</span>
                      <span className="text-[11px] font-semibold text-rose-900 leading-relaxed">
                        {error}
                      </span>
                    </div>
                  )}
                  {!error && warning && (
                    <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-amber-50/60 border border-amber-100 p-2.5 shadow-2xs animate-fade-in">
                      <span className="text-amber-600 font-extrabold text-xs shrink-0">⚠️</span>
                      <span className="text-[11px] font-semibold text-amber-950 leading-relaxed">
                        {warning}
                      </span>
                    </div>
                  )}
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
