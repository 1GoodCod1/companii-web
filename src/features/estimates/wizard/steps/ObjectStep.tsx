import { Calculator, Save } from 'lucide-react';
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

export function ObjectStep({ wizard }: Props) {
  const {
    project,
    config,
    title,
    setTitle,
    siteType,
    setSiteType,
    address,
    setAddress,
    marginPct,
    setMarginPct,
    customPricing,
    setCustomPricing,
    pricingUnitLabel,
    handleSaveObject,
  } = wizard;

  return (
    <Panel className="p-6 max-w-2xl space-y-4">
      {project.sourceLead?.estimatedBudget && (
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 p-5 mb-2 shadow-xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">
              Buget estimativ solicitat de client
            </p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {Number(project.sourceLead.estimatedBudget).toLocaleString('ro-MD')} MDL
            </p>
            {project.sourceLead.message && (
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed italic">
                "{project.sourceLead.message}"
              </p>
            )}
          </div>
        </div>
      )}
      <label className={cabinetLabelClass}>
        Titlu proiect
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={cabinetFieldClass} />
      </label>
      <label className={cabinetLabelClass}>
        Tip obiect
        <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className={cabinetSelectClass}>
          {(config?.siteTypes ?? []).map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className={cabinetLabelClass}>
        Adresă obiect
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={cabinetFieldClass} />
      </label>
      <label className={cabinetLabelClass}>
        Marjă (%)
        <input type="number" min={0} max={100} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className={cabinetFieldClass} />
      </label>
      <CustomPricingFields values={customPricing} onChange={setCustomPricing} unitLabel={pricingUnitLabel} />
      <button type="button" onClick={handleSaveObject} className={cabinetBtnPrimary}>
        <Save className="w-4 h-4" /> Salvează și continuă
      </button>
    </Panel>
  );
}
