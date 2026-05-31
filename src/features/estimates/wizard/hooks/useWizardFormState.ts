import { useCallback, useState } from 'react';
import type { EstimateProjectDto, Plan2dData } from '@/types/estimates';
import type { CustomPricingValues } from '@/features/estimates/utils/customPricing';
import { readCustomPricing } from '@/features/estimates/utils/customPricing';
import { EMPTY_PLAN } from '@/constants/estimatesWizard.constants';
import {
  ENABLED_WORK_MODULES_KEY,
  readEnabledWorkModules,
  toggleWorkModule,
} from '@/features/estimates/diagnostic/workModules';

export function useWizardFormState(project: EstimateProjectDto) {
  const [title, setTitle] = useState(project.title);
  const [siteType, setSiteType] = useState(project.siteType ?? 'apartment');
  const [address, setAddress] = useState(project.address ?? '');
  const [marginPct, setMarginPct] = useState(Number(project.marginPct));
  const [riskReservePct, setRiskReservePct] = useState(Number(project.riskReservePct ?? 0));
  const [siteFloor, setSiteFloor] = useState<number | null>(project.siteFloor ?? null);
  const [accessDifficulty, setAccessDifficulty] = useState<string | null>(
    project.accessDifficulty ?? null,
  );
  const [urgency, setUrgency] = useState<string | null>(project.urgency ?? null);
  const [plan2d, setPlan2d] = useState<Plan2dData>(project.sitePlan?.plan2d ?? EMPTY_PLAN);
  const [diagnostic, setDiagnostic] = useState<Record<string, unknown>>(
    (project.diagnosticAnswers as Record<string, unknown>) ?? {},
  );
  const [customPricing, setCustomPricing] = useState<CustomPricingValues>(() =>
    readCustomPricing((project.diagnosticAnswers as Record<string, unknown>) ?? {}),
  );
  const [dirty, setDirty] = useState(false);
  const [estimateMode, setEstimateMode] = useState<'brief' | 'detailed' | 'by-room'>('detailed');

  const setEnabledWorkModules = (next: string[]) => {
    setDiagnostic((prev) => ({ ...prev, [ENABLED_WORK_MODULES_KEY]: next }));
    setDirty(true);
  };

  const setWorkModuleEnabled = (moduleKey: string, enabled: boolean) => {
    const config = project.blueprint?.config ?? null;
    const currentEnabled = config ? readEnabledWorkModules(diagnostic, config) : [];
    setEnabledWorkModules(toggleWorkModule(currentEnabled, moduleKey, enabled));
  };

  const handleSetSiteType = useCallback(
    (nextType: string) => {
      setSiteType(nextType);
      if (nextType === 'house' && siteFloor !== null) {
        setSiteFloor(null);
      }
      if ((nextType === 'office' || nextType === 'commercial') && !accessDifficulty) {
        setAccessDifficulty('medium');
      }
      const categorySlug = project.category.slug;
      setDiagnostic((prev) => {
        const next = { ...prev };
        let changed = false;
        if (categorySlug === 'elektrika') {
          if (!next.wallMaterial) { next.wallMaterial = 'beton'; changed = true; }
          if (next.voltageStabilizer === undefined) { next.voltageStabilizer = true; changed = true; }
          if (next.groundingRequired === undefined) { next.groundingRequired = true; changed = true; }
        }
        if (categorySlug === 'clima') {
          if (next.isMultiSplit === undefined) { next.isMultiSplit = true; changed = true; }
        }
        if (categorySlug === 'it-networks') {
          if (!next.projectScope) { next.projectScope = 'Mediu (6-20 pagini / 1-2 săptămâni)'; changed = true; }
          if (next.multilingual === undefined) { next.multilingual = true; changed = true; }
          if (next.customDesign === undefined) { next.customDesign = true; changed = true; }
        }
        if (categorySlug === 'it-hardware') {
          if (!next.deviceType) { next.deviceType = 'Desktop / PC'; changed = true; }
          if (next.warrantyMonths === undefined) { next.warrantyMonths = 3; changed = true; }
          if (next.deviceCount === undefined || (typeof next.deviceCount === 'number' && next.deviceCount < 1)) {
            next.deviceCount = 1;
            changed = true;
          }
        }
        if (categorySlug === 'mobila') {
          if (!next.materialType) { next.materialType = 'pal'; changed = true; }
          if (!next.materialThickness) { next.materialThickness = '16 mm'; changed = true; }
          if (!next.finishType) { next.finishType = 'Mat'; changed = true; }
          if (!next.frontMaterialType) { next.frontMaterialType = 'pal'; changed = true; }
          if (next.softClose === undefined) { next.softClose = true; changed = true; }
        }
        if (categorySlug === 'santehnika') {
          if (!next.pipeMaterial) { next.pipeMaterial = 'ppr'; changed = true; }
          if (next.replacePipes === undefined) { next.replacePipes = true; changed = true; }
          if (next.filterSystem === undefined) { next.filterSystem = false; changed = true; }
        }
        if (categorySlug === 'constructii') {
          if (!next.foundationType) { next.foundationType = 'strip'; changed = true; }
          if (!next.wallMaterial) { next.wallMaterial = 'bca'; changed = true; }
          if (!next.slabType) { next.slabType = 'monolithic'; changed = true; }
          if (next.projectDocumentation === undefined) { next.projectDocumentation = true; changed = true; }
        }
        return changed ? next : prev;
      });
    },
    [siteFloor, accessDifficulty, project.category.slug],
  );

  return {
    title,
    setTitle,
    siteType,
    setSiteType: handleSetSiteType,
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
    plan2d,
    setPlan2d,
    diagnostic,
    setDiagnostic,
    customPricing,
    setCustomPricing,
    dirty,
    setDirty,
    estimateMode,
    setEstimateMode,
    setEnabledWorkModules,
    setWorkModuleEnabled,
  };
}

export type WizardFormState = ReturnType<typeof useWizardFormState>;
