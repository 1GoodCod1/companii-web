import {
  Panel,
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetSelectClass,
} from '@/components/cabinet/cabinet-ui';
import { CustomPricingFields } from '@/features/estimates/components/CustomPricingFields';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

export function DiagnosticStep({ wizard }: Props) {
  const {
    project,
    diagnosticQuestions,
    diagnostic,
    setDiagnostic,
    customPricing,
    setCustomPricing,
    pricingUnitLabel,
    handleSaveDiagnostic,
  } = wizard;

  return (
    <Panel className="p-6 max-w-2xl space-y-4">
      <h3 className="font-bold text-gray-900">Diagnostic — {project.category.name}</h3>
      {diagnosticQuestions.map((q) => (
        <label key={q.key} className={cabinetLabelClass}>
          {q.label}
          {q.type === 'boolean' ? (
            <select
              value={String(diagnostic[q.key] ?? '')}
              onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: e.target.value === 'true' })}
              className={cabinetSelectClass}
            >
              <option value="">—</option>
              <option value="true">Da</option>
              <option value="false">Nu</option>
            </select>
          ) : q.type === 'select' ? (
            <select
              value={String(diagnostic[q.key] ?? '')}
              onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: e.target.value })}
              className={cabinetSelectClass}
            >
              <option value="">—</option>
              {(q.options ?? []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={String(diagnostic[q.key] ?? '')}
              onChange={(e) => setDiagnostic({ ...diagnostic, [q.key]: Number(e.target.value) })}
              className={cabinetFieldClass}
            />
          )}
        </label>
      ))}
      <CustomPricingFields values={customPricing} onChange={setCustomPricing} compact unitLabel={pricingUnitLabel} />
      <button type="button" onClick={handleSaveDiagnostic} className={cabinetBtnPrimary}>
        Salvează diagnostic
      </button>
    </Panel>
  );
}
