import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import {
  AppSelect,
  Panel,
  cabinetBtnPrimary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { useCategoriesQuery } from '@/features/companies/api/useCompanies';
import { useCustomersQuery } from '@/features/fsm';
import {
  useCreateEstimateProjectMutation,
  useEstimateBlueprintsQuery,
} from '@/features/estimates/api/useEstimates';
import {
  useEstimateTemplatesQuery,
  useApplyEstimateTemplateMutation,
} from '@/features/estimates/api/useEstimateTemplates';
import { CategoryDescriptionPanel } from '@/features/estimates/components/CategoryDescriptionPanel';
import { ExcludedCategoryNotice } from '@/features/estimates/components/ExcludedCategoryNotice';
import { isEstimateExcludedCategorySlug } from '@/entities/estimate/model/estimateCategorySlugs.constants';
import type { OwnedCompanyDto } from '@/entities/company/model/companies.types';
import { getErrorMessage } from '@/shared/utils/errors';

type Props = {
  activeCompany: OwnedCompanyDto | null | undefined;
};

export function NewEstimateForm({ activeCompany }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: categories } = useCategoriesQuery();
  const { data: blueprints } = useEstimateBlueprintsQuery();
  const { data: customers } = useCustomersQuery();
  const { data: templates } = useEstimateTemplatesQuery();
  const createProject = useCreateEstimateProjectMutation();
  const applyTemplate = useApplyEstimateTemplateMutation();
  const blueprintCategoryIds = useMemo(
    () => new Set((blueprints ?? []).map((bp) => bp.category.id)),
    [blueprints],
  );
  const selectableCategories = useMemo(
    () => (categories ?? []).filter((c) => blueprintCategoryIds.has(c.id)),
    [categories, blueprintCategoryIds],
  );

  const [customerId, setCustomerId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => searchParams.get('categoryId') ?? '',
  );
  const [templateId, setTemplateId] = useState(
    () => searchParams.get('templateId') ?? '',
  );
  const [title, setTitle] = useState('');

  const categoryId = activeCompany?.categoryId ?? selectedCategoryId;

  const selectedCategory = useMemo(
    () => (categoryId ? categories?.find((c) => c.id === categoryId) ?? null : null),
    [categories, categoryId],
  );

  const activeBlueprint = useMemo(() => {
    if (!categoryId) return null;
    return blueprints?.find((bp) => bp.category.id === categoryId) ?? null;
  }, [blueprints, categoryId]);

  const isExcluded =
    !!selectedCategory &&
    !activeBlueprint &&
    isEstimateExcludedCategorySlug(selectedCategory.slug);

  const customerOptions = useMemo(
    () => [
      { value: '', label: t('company.estimateWizard.newForm.selectCustomer') },
      ...(customers?.map((c) => ({
        value: c.id,
        label: `${c.fullName} · ${c.phone}`,
      })) ?? []),
    ],
    [customers, t],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('company.estimateWizard.newForm.selectCategory') },
      ...selectableCategories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [selectableCategories, t],
  );

  const templateOptions = useMemo(
    () => [
      { value: '', label: t('company.estimatesTemplatesPage.noTemplate') },
      ...(templates?.map((tpl) => ({ value: tpl.id, label: tpl.name })) ?? []),
    ],
    [templates, t],
  );

  const handleCreate = async () => {
    if (!customerId || !categoryId) {
      toast.error(t('company.estimateWizard.newForm.selectCustomerAndCategory'));
      return;
    }
    if (!activeBlueprint) {
      toast.error(t('company.estimateWizard.newForm.noBlueprintForCategory'));
      return;
    }
    try {
      const created = await createProject.mutateAsync({
        customerId,
        categoryId,
        title: title || undefined,
        siteType: 'apartment',
      });

      if (templateId) {
        await applyTemplate.mutateAsync({
          id: templateId,
          projectId: created.id,
          mode: 'overwrite',
        });
      }

      toast.success(t('company.estimateWizard.newForm.created'));
      navigate(`/company/smete/${created.id}`, { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('company.estimateWizard.newForm.createFailed')));
    }
  };

  return (
    <Panel className="p-6 max-w-2xl">
      <div className="space-y-4">
        <label className={cabinetLabelClass}>
          {t('company.estimateWizard.newForm.client')}
          <AppSelect
            value={customerId}
            onChange={setCustomerId}
            options={customerOptions}
            aria-label={t('company.estimateWizard.newForm.client')}
          />
        </label>

        {activeCompany?.categoryId ? (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest">
              {t('company.estimateWizard.newForm.categoryAutoDetected')}
            </span>
            <p className="font-extrabold text-gray-900 text-sm">
              {selectedCategory?.name || t('company.estimateWizard.newForm.loadingDomain')}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {t('company.estimateWizard.newForm.categoryAutoDescription')}
            </p>
          </div>
        ) : (
          <label className={cabinetLabelClass}>
            {t('company.estimateWizard.newForm.workCategory')}
            <AppSelect
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categoryOptions}
              aria-label={t('company.estimateWizard.newForm.workCategory')}
            />
            <span className="text-[11px] text-gray-400 mt-1">
              {t('company.estimateWizard.newForm.onlyBlueprintCategoriesHint')}
            </span>
          </label>
        )}

        {/* K-02: excluded category alternative flow */}
        {isExcluded && selectedCategory && (
          <ExcludedCategoryNotice
            slug={selectedCategory.slug}
            categoryName={selectedCategory.name}
          />
        )}

        {/* K-03: blueprint description (only when a blueprint resolves) */}
        {categoryId && activeBlueprint && (
          <CategoryDescriptionPanel blueprint={activeBlueprint} />
        )}

        {templates && templates.length > 0 && (
          <label className={cabinetLabelClass}>
            {t('company.estimatesTemplatesPage.initializingFromTemplate')}
            <AppSelect
              value={templateId}
              onChange={setTemplateId}
              options={templateOptions}
              aria-label={t('company.estimatesTemplatesPage.initializingFromTemplate')}
            />
          </label>
        )}

        <label className={cabinetLabelClass}>
          {t('company.estimateWizard.newForm.titleOptional')}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cabinetFieldClass}
            placeholder={t('company.estimateWizard.newForm.titlePlaceholder')}
          />
        </label>

        <button
          type="button"
          onClick={handleCreate}
          disabled={createProject.isPending || !activeBlueprint || isExcluded}
          className={cabinetBtnPrimary}
        >
          {t('company.estimateWizard.newForm.createEstimate')} <ArrowRight className="size-4" />
        </button>
      </div>
    </Panel>
  );
}
