import { useTranslation } from 'react-i18next';
import {
  FormSection,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { parseNumberInputValue } from '@/features/estimates/diagnostic/diagnosticValidation';
import { useTranslateOption } from '@/utils/translateOption';
import type { BlueprintDiagnosticQuestion } from '@/types/estimates';

type DiagnosticAdditionalQuestionsProps = {
  questions: BlueprintDiagnosticQuestion[];
  diagnostic: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  validationErrors?: Record<string, string> | null;
  warningByKey: Map<string, string>;
  isReadOnly: boolean;
};

export function DiagnosticAdditionalQuestions({
  questions,
  diagnostic,
  onChange,
  validationErrors,
  warningByKey,
  isReadOnly,
}: DiagnosticAdditionalQuestionsProps) {
  const { t } = useTranslation();
  const translateOption = useTranslateOption();

  if (questions.length === 0) return null;

  return (
    <FormSection title={t('company.estimateWizard.diagnosticStep.additionalQuestions')}>
      <div className="grid sm:grid-cols-2 gap-4">
        {questions.map((q) => {
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
                    onChange(q.key, v === '' ? undefined : v === 'true');
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
                    onChange(q.key, v === '' ? undefined : v);
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
                  onChange={(e) => onChange(q.key, parseNumberInputValue(e.target.value))}
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
  );
}
