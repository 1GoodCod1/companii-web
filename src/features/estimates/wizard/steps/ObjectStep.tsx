import { Calculator, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
              {t('company.estimateWizard.objectStep.budgetLabel')}
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
        {t('company.estimateWizard.objectStep.projectTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={cabinetFieldClass} />
      </label>
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.siteType')}
        <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className={cabinetSelectClass}>
          {(config?.siteTypes ?? []).map((siteTypeOption) => (
            <option key={siteTypeOption.value} value={siteTypeOption.value}>{siteTypeOption.label}</option>
          ))}
        </select>
      </label>
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.address')}
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={cabinetFieldClass} />
      </label>
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.margin')}
        <input type="number" min={0} max={100} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className={cabinetFieldClass} />
      </label>
      <CustomPricingFields values={customPricing} onChange={setCustomPricing} unitLabel={pricingUnitLabel} />
      <button type="button" onClick={handleSaveObject} className={cabinetBtnPrimary}>
        <Save className="w-4 h-4" /> {t('company.estimateWizard.objectStep.saveAndContinue')}
      </button>
    </Panel>
  );
}
