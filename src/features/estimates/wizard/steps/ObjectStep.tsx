import { useMemo } from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AppSelect,
  Panel,
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { SitePhotoGallery } from '@/features/estimates/components/SitePhotoGallery';
import type { EstimateWizardApi } from '../useEstimateWizard';
import { ObjectLeadInfo } from './object/ObjectLeadInfo';

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
    riskReservePct,
    setRiskReservePct,
    siteFloor,
    setSiteFloor,
    accessDifficulty,
    setAccessDifficulty,
    urgency,
    setUrgency,
    isServiceCategory,
    isFurnitureCategory,
    isElektrikaCategory,
    isPlumbingCategory,
    handleSaveObject,
  } = wizard;

  const showPhysicalSiteFields =
    !isServiceCategory && !isFurnitureCategory && !isElektrikaCategory && !isPlumbingCategory;

  const siteTypeOptions = useMemo(
    () => (config?.siteTypes ?? []).map((siteTypeOption) => ({
      value: siteTypeOption.value,
      label: siteTypeOption.label,
    })),
    [config?.siteTypes],
  );

  const urgencyOptions = useMemo(
    () => [
      { value: '', label: t('company.estimateWizard.objectStep.urgencyNormal') },
      { value: 'urgent', label: t('company.estimateWizard.objectStep.urgencyUrgent') },
      { value: 'emergency', label: t('company.estimateWizard.objectStep.urgencyEmergency') },
    ],
    [t],
  );

  const accessDifficultyOptions = useMemo(
    () => [
      { value: '', label: t('company.estimateWizard.objectStep.accessEasy') },
      { value: 'medium', label: t('company.estimateWizard.objectStep.accessMedium') },
      { value: 'difficult', label: t('company.estimateWizard.objectStep.accessDifficult') },
    ],
    [t],
  );

  return (
    <Panel className="p-6 max-w-2xl space-y-4">
      <ObjectLeadInfo project={project} />
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.projectTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={cabinetFieldClass} />
      </label>
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.siteType')}
        <AppSelect
          value={siteType}
          onChange={setSiteType}
          options={siteTypeOptions}
          aria-label={t('company.estimateWizard.objectStep.siteType')}
        />
      </label>
      <label className={cabinetLabelClass}>
        {t('company.estimateWizard.objectStep.address')}
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={cabinetFieldClass} />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={cabinetLabelClass}>
          {t('company.estimateWizard.objectStep.margin')}
          <input type="number" min={0} max={100} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className={cabinetFieldClass} />
        </label>
        <label className={cabinetLabelClass}>
          {t('company.estimateWizard.objectStep.riskReserve')}
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            value={riskReservePct}
            onChange={(e) => setRiskReservePct(Number(e.target.value))}
            className={cabinetFieldClass}
            placeholder="0"
          />
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
            {t('company.estimateWizard.objectStep.riskReserveHint')}
          </span>
        </label>
      </div>

      {showPhysicalSiteFields && (
        <div className={`grid grid-cols-1 ${siteType === 'house' ? '' : 'md:grid-cols-2'} gap-4`}>
          {siteType !== 'house' && (
            <label className={cabinetLabelClass}>
              {t('company.estimateWizard.objectStep.siteFloor')}
              <input
                type="number"
                min={0}
                max={50}
                value={siteFloor ?? ''}
                onChange={(e) =>
                  setSiteFloor(e.target.value === '' ? null : Number(e.target.value))
                }
                className={cabinetFieldClass}
                placeholder="Ex: 4"
              />
            </label>
          )}
          <label className={cabinetLabelClass}>
            {t('company.estimateWizard.objectStep.urgency')}
            <AppSelect
              value={urgency ?? ''}
              onChange={(value) => setUrgency(value || null)}
              options={urgencyOptions}
              aria-label={t('company.estimateWizard.objectStep.urgency')}
            />
          </label>
        </div>
      )}

      {showPhysicalSiteFields && (
        <label className={cabinetLabelClass}>
          {t('company.estimateWizard.objectStep.accessDifficulty')}
          <AppSelect
            value={accessDifficulty ?? ''}
            onChange={(value) => setAccessDifficulty(value || null)}
            options={accessDifficultyOptions}
            aria-label={t('company.estimateWizard.objectStep.accessDifficulty')}
          />
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
            {t('company.estimateWizard.objectStep.accessHint')}
          </span>
        </label>
      )}

      {project.category.slug !== 'it-web' && (
        <SitePhotoGallery projectId={project.id} photos={project.photos ?? []} />
      )}

      <button type="button" onClick={handleSaveObject} className={cabinetBtnPrimary}>
        <Save className="size-4" /> {t('company.estimateWizard.objectStep.saveAndContinue')}
      </button>
    </Panel>
  );
}
