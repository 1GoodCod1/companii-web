import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinkSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  estimateGroupCombinedTotal,
  type EstimateGroupDto,
  type EstimateProjectDto,
} from '@/entities/estimate/model/estimates';
import { estimateStatusLabel } from '@/entities/estimate/model/i18nStatusLabels';
import {
  canHostEstimateRelatedProjects,
  canBeAddedAsRelatedEstimate,
} from '@/entities/estimate/model/estimateCategorySlugs.constants';
import { getTranslatedCategoryName } from '@/shared/utils/translateCityCategory';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetFieldClass,
  cabinetLabelClass,
} from '@/widgets/cabinet/cabinet-ui';
import { AppModal } from '@/shared/ui/AppModal';
import { useEstimateBlueprintsQuery } from '../api/useEstimateBlueprints';
import { useCreateRelatedEstimateProjectMutation } from '../api/useEstimateProjects';

type EstimateRelatedProjectsSectionProps = {
  project: EstimateProjectDto;
  readOnly?: boolean;
};

function resolveGroupProjects(
  project: EstimateProjectDto,
): EstimateGroupDto['projects'] {
  const siblings = project.group?.projects ?? [];
  if (siblings.length > 0) {
    return siblings;
  }
  return [
    {
      id: project.id,
      number: project.number,
      title: project.title,
      status: project.status,
      grandTotal: project.grandTotal,
      grandTotalWithVat: project.grandTotalWithVat,
      category: project.category,
    },
  ];
}

export function EstimateRelatedProjectsSection({
  project,
  readOnly = false,
}: EstimateRelatedProjectsSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const { data: blueprints = [] } = useEstimateBlueprintsQuery();
  const createRelated = useCreateRelatedEstimateProjectMutation();

  const groupProjects = useMemo(() => resolveGroupProjects(project), [project]);
  const canHostRelated = canHostEstimateRelatedProjects(project.category.slug);
  const canManageRelated = canHostRelated && !readOnly;
  const usedCategoryIds = useMemo(
    () => new Set(groupProjects.map((item) => item.category.id)),
    [groupProjects],
  );
  const availableBlueprints = useMemo(
    () =>
      blueprints.filter(
        (blueprint) =>
          !usedCategoryIds.has(blueprint.category.id) &&
          canBeAddedAsRelatedEstimate(blueprint.category.slug),
      ),
    [blueprints, usedCategoryIds],
  );
  const combinedTotal = useMemo(
    () => estimateGroupCombinedTotal(groupProjects),
    [groupProjects],
  );
  const hasMultipleProjects = groupProjects.length > 1;

  if (!hasMultipleProjects && !canManageRelated) {
    return null;
  }

  const handleCreate = async () => {
    if (!categoryId) {
      toast.error(t('company.estimateWizard.relatedProjects.selectCategory'));
      return;
    }

    try {
      const created = await createRelated.mutateAsync({
        sourceProjectId: project.id,
        categoryId,
        title: title.trim() || undefined,
      });
      toast.success(t('company.estimateWizard.relatedProjects.created'));
      setModalOpen(false);
      setCategoryId('');
      setTitle('');
      navigate(`/company/smete/${created.id}`);
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, t('company.estimateWizard.relatedProjects.createFailed')),
      );
    }
  };

  return (
    <>
      <Panel className="p-4 space-y-3 border border-slate-200/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-violet-700">
              <LinkSimpleIcon className="size-4" weight="bold" />
              <p className="text-[10px] font-black uppercase tracking-wider">
                {t('company.estimateWizard.relatedProjects.title')}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('company.estimateWizard.relatedProjects.description')}
            </p>
          </div>
          {canManageRelated && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`${cabinetBtnSecondary} inline-flex items-center gap-2`}
              disabled={availableBlueprints.length === 0}
            >
              <PlusIcon className="size-4" />
              {t('company.estimateWizard.relatedProjects.addButton')}
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {groupProjects.map((item) => {
            const isCurrent = item.id === project.id;
            const itemTotal = Number(item.grandTotalWithVat ?? item.grandTotal ?? 0);
            return (
              <li
                key={item.id}
                className={`rounded-xl border px-3 py-2.5 ${
                  isCurrent
                    ? 'border-violet-200 bg-violet-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {isCurrent ? (
                        <>
                          {item.number} · {item.title}
                          <span className="ml-2 text-[10px] font-black uppercase text-violet-700">
                            {t('company.estimateWizard.relatedProjects.current')}
                          </span>
                        </>
                      ) : (
                        <Link
                          to={`/company/smete/${item.id}`}
                          className="hover:text-violet-700 transition-colors"
                        >
                          {item.number} · {item.title}
                        </Link>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getTranslatedCategoryName(t, item.category)} ·{' '}
                      {estimateStatusLabel(item.status, t)}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-800 whitespace-nowrap">
                    {itemTotal.toLocaleString('ro-MD')} MDL
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {hasMultipleProjects && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('company.estimateWizard.relatedProjects.combinedTotal')}
            </span>
            <span className="text-sm font-black text-violet-700">
              {combinedTotal.toLocaleString('ro-MD')} MDL
            </span>
          </div>
        )}
      </Panel>

      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('company.estimateWizard.relatedProjects.modalTitle')}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className={cabinetBtnSecondary}
              disabled={createRelated.isPending}
            >
              {t('cabinet.common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void handleCreate()}
              className={cabinetBtnPrimary}
              disabled={createRelated.isPending || availableBlueprints.length === 0}
            >
              {createRelated.isPending
                ? t('cabinet.common.saving')
                : t('company.estimateWizard.relatedProjects.createButton')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {t('company.estimateWizard.relatedProjects.modalDescription')}
          </p>
          {availableBlueprints.length === 0 ? (
            <p className="text-xs font-semibold text-amber-700">
              {t('company.estimateWizard.relatedProjects.noCategoriesLeft')}
            </p>
          ) : (
            <>
              <div>
                <label className={cabinetLabelClass}>
                  {t('company.estimateWizard.newForm.workCategory')}
                </label>
                <select
                  className={cabinetFieldClass}
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">
                    {t('company.estimateWizard.newForm.selectCategory')}
                  </option>
                  {availableBlueprints.map((blueprint) => (
                    <option key={blueprint.category.id} value={blueprint.category.id}>
                      {getTranslatedCategoryName(t, blueprint.category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cabinetLabelClass}>
                  {t('company.estimateWizard.newForm.titleOptional')}
                </label>
                <input
                  className={cabinetFieldClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t('company.estimateWizard.newForm.titlePlaceholder')}
                />
              </div>
            </>
          )}
        </div>
      </AppModal>
    </>
  );
}
