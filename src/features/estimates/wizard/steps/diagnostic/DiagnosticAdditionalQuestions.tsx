import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormSection,
  AppSelect,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { parseNumberInputValue } from '@/features/estimates/diagnostic/diagnosticValidation';
import { useTranslateOption } from '@/entities/estimate/model/translateOption';
import type { BlueprintDiagnosticQuestion } from '@/entities/estimate/model/estimates';

type DiagnosticAdditionalQuestionsProps = {
  questions: BlueprintDiagnosticQuestion[];
  diagnostic: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  validationErrors?: Record<string, string> | null;
  warningByKey: Map<string, string>;
  isReadOnly: boolean;
};

function DiagnosticQuestionField({
  question,
  currentValue,
  booleanOptions,
  onChange,
  isReadOnly,
  error,
  warning,
}: {
  question: BlueprintDiagnosticQuestion;
  currentValue: unknown;
  booleanOptions: Array<{ value: string; label: string }>;
  onChange: (key: string, value: unknown) => void;
  isReadOnly: boolean;
  error?: string;
  warning?: string;
}) {
  const translateOption = useTranslateOption();

  const selectOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...(question.options ?? []).map((opt) => ({
        value: opt,
        label: translateOption(opt),
      })),
    ],
    [question.options, translateOption],
  );

  return (
    <label className={cabinetLabelClass}>
      {question.label}
      {question.type === 'boolean' ? (
        <AppSelect
          value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
          onChange={(v) => onChange(question.key, v === '' ? undefined : v === 'true')}
          options={booleanOptions}
          disabled={isReadOnly}
          aria-label={question.label}
        />
      ) : question.type === 'select' ? (
        <AppSelect
          value={String(currentValue ?? '')}
          onChange={(v) => onChange(question.key, v === '' ? undefined : v)}
          options={selectOptions}
          disabled={isReadOnly}
          aria-label={question.label}
        />
      ) : (
        <input
          type="number"
          value={currentValue == null || currentValue === '' ? '' : String(currentValue)}
          onChange={(e) => onChange(question.key, parseNumberInputValue(e.target.value))}
          className={cabinetFieldClass}
          disabled={isReadOnly}
        />
      )}
      {error && (
        <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-rose-50/60 border border-rose-100/80 p-2.5 shadow-2xs animate-fade-in">
          <span className="text-rose-600 font-extrabold text-xs shrink-0">🚫</span>
          <span className="text-[11px] font-semibold text-rose-900 leading-relaxed">{error}</span>
        </div>
      )}
      {!error && warning && (
        <div className="mt-1.5 flex items-start gap-2 rounded-xl bg-amber-50/60 border border-amber-100 p-2.5 shadow-2xs animate-fade-in">
          <span className="text-amber-600 font-extrabold text-xs shrink-0">⚠️</span>
          <span className="text-[11px] font-semibold text-amber-950 leading-relaxed">{warning}</span>
        </div>
      )}
    </label>
  );
}

export function DiagnosticAdditionalQuestions({
  questions,
  diagnostic,
  onChange,
  validationErrors,
  warningByKey,
  isReadOnly,
}: DiagnosticAdditionalQuestionsProps) {
  const { t } = useTranslation();

  const booleanOptions = useMemo(
    () => [
      { value: '', label: '—' },
      { value: 'true', label: t('company.estimateWizard.diagnosticStep.yes') },
      { value: 'false', label: t('company.estimateWizard.diagnosticStep.no') },
    ],
    [t],
  );

  if (questions.length === 0) return null;

  return (
    <FormSection title={t('company.estimateWizard.diagnosticStep.additionalQuestions')}>
      <div className="grid sm:grid-cols-2 gap-4">
        {questions.map((q) => (
          <DiagnosticQuestionField
            key={q.key}
            question={q}
            currentValue={diagnostic[q.key]}
            booleanOptions={booleanOptions}
            onChange={onChange}
            isReadOnly={isReadOnly}
            error={validationErrors?.[q.key]}
            warning={warningByKey.get(q.key)}
          />
        ))}
      </div>
    </FormSection>
  );
}
