import { Calculator, Check, Eye, Layers, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Panel,
  cabinetBtnPrimary,
} from '@/components/cabinet/cabinet-ui';
import { downloadFile } from '@/api/files';
import { EstimateLineSourceBadge } from '@/features/estimates/components/EstimateLineSourceBadge';
import { getHiddenStagesCount } from '@/features/estimates/stageVisibility';
import type { EstimateStageDto } from '@/types/estimates';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

function StageCard({
  stage,
  index,
  wizard,
  t,
}: {
  stage: EstimateStageDto;
  index: number;
  wizard: EstimateWizardApi;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const {
    project,
    updateLine,
    editingStore,
    setEditingStore,
    uploadingLineId,
    handleUpdateLineQtyOrPrice,
    handleSaveStore,
    handleUploadReceipt,
    handleDeleteReceipt,
    handleDeleteLine,
    handleAddLine,
    addLineMutation,
  } = wizard;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <p className="font-bold text-gray-900">{stage.name}</p>
            {stage.description && <p className="text-[10px] text-gray-500">{stage.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {stage.laborHours != null && (
            <span>{t('company.estimateWizard.stagesStep.hours', { count: Number(stage.laborHours) })}</span>
          )}
          {stage.durationDays != null && (
            <span>{t('company.estimateWizard.stagesStep.days', { count: stage.durationDays })}</span>
          )}
          <span className="text-sm font-bold text-violet-700">
            {Number(stage.stageTotal ?? 0).toLocaleString('ro-MD')} MDL
          </span>
        </div>
      </div>

      {stage.lines?.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2">{t('company.estimateWizard.stagesStep.colDescription')}</th>
                <th className="py-2 w-20">{t('company.estimateWizard.stagesStep.colQty')}</th>
                <th className="py-2 w-20">{t('company.estimateWizard.stagesStep.colUnit')}</th>
                <th className="py-2 w-28">{t('company.estimateWizard.stagesStep.colUnitPrice')}</th>
                <th className="py-2 w-28">{t('company.estimateWizard.stagesStep.colTotal')}</th>
                <th className="py-2">{t('company.estimateWizard.stagesStep.colStore')}</th>
                <th className="py-2 text-right">{t('company.estimateWizard.stagesStep.colReceipt')}</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {stage.lines.map((line) => {
                const isLabor =
                  line.unit === 'ore' ||
                  line.unit === 'h' ||
                  line.description.toLowerCase().includes('manoperă') ||
                  line.description.toLowerCase().includes('manopera');
                return (
                  <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 min-w-[180px]">
                        <input
                          type="text"
                          defaultValue={line.description}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val && val !== line.description) {
                              updateLine.mutate({
                                projectId: project.id,
                                stageId: stage.id,
                                lineId: line.id,
                                description: val,
                              });
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                        />
                        <EstimateLineSourceBadge source={line.source} />
                      </div>
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        defaultValue={Number(line.qty)}
                        onBlur={(e) =>
                          handleUpdateLineQtyOrPrice(
                            line.id,
                            stage.id,
                            'qty',
                            Number(e.target.value),
                          )
                        }
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                      />
                    </td>
                    <td className="py-3 text-gray-500 font-medium">{line.unit}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={Number(line.unitPrice)}
                          onBlur={(e) =>
                            handleUpdateLineQtyOrPrice(
                              line.id,
                              stage.id,
                              'unitPrice',
                              Number(e.target.value),
                            )
                          }
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                        />
                        <span className="text-[10px] text-gray-400">MDL</span>
                      </div>
                    </td>
                    <td className="py-3 font-extrabold text-gray-900">
                      {Number(line.lineTotal).toLocaleString('ro-MD')} MDL
                    </td>
                    <td className="py-3">
                      {isLabor ? (
                        <span className="text-[10px] text-gray-400 italic">
                          {t('company.estimateWizard.stagesStep.laborService')}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={t('company.estimateWizard.stagesStep.storePlaceholder')}
                            value={
                              editingStore?.lineId === line.id
                                ? editingStore.value
                                : line.materialStore || ''
                            }
                            onChange={(e) =>
                              setEditingStore({ lineId: line.id, value: e.target.value })
                            }
                            onBlur={() => handleSaveStore(line.id, stage.id)}
                            className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium"
                          />
                          {editingStore?.lineId === line.id && (
                            <button
                              type="button"
                              onMouseDown={() => handleSaveStore(line.id, stage.id)}
                              className="rounded-md bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {isLabor ? null : (
                        <div className="inline-flex items-center gap-2">
                          {line.receiptFileKey ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  downloadFile(
                                    line.receiptFileKey!,
                                    `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> {t('company.estimateWizard.stagesStep.viewReceipt')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                              {uploadingLineId === line.id ? (
                                <span className="animate-pulse">{t('cabinet.common.loading')}</span>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" /> {t('company.estimateWizard.stagesStep.receipt')}
                                </>
                              )}
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadReceipt(line.id, stage.id, file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id, stage.id)}
                        title={t('cabinet.common.delete')}
                        className="rounded-lg bg-red-50 border border-red-100 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">{t('company.estimateWizard.stagesStep.noLines')}</p>
      )}

      <button
        type="button"
        onClick={() => handleAddLine(stage.id)}
        disabled={addLineMutation.isPending}
        className="w-full mt-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> {t('company.estimateWizard.stagesStep.addNewLine')}
      </button>
    </div>
  );
}

export function StagesStep({ wizard }: Props) {
  const { t } = useTranslation();
  const {
    project,
    config,
    enabledWorkModules,
    stageGroups,
    calculate,
    handleCalculate,
    estimateMode,
    setEstimateMode,
  } = wizard;

  const hiddenStagesCount = getHiddenStagesCount(
    project.stages ?? [],
    config,
    enabledWorkModules,
  );

  const hasGroups = stageGroups.length > 0;
  const singleGroup = stageGroups.length <= 1 && (stageGroups[0]?.moduleKey === null);

  // J-06: brief mode — filter out groups that have no meaningful stages (no lines)
  const displayGroups = estimateMode === 'brief'
    ? stageGroups.filter(
        (g) => g.stages.some((s) => s.meaningfulLineCount > 0),
      )
    : stageGroups;

  // Flat index counter across all groups
  let globalIndex = 0;

  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-gray-900">{t('company.estimateWizard.stagesStep.title')}</h3>
            <p className="text-sm text-gray-500">
              {t('company.estimateWizard.stagesStep.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* J-06: Estimate mode switcher */}
            <div className="flex rounded-xl bg-slate-100 p-0.5">
              {(['brief', 'detailed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEstimateMode(mode)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    estimateMode === mode
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t(`company.estimateWizard.stagesStep.mode.${mode}`)}
                </button>
              ))}
            </div>
            <button type="button" onClick={handleCalculate} disabled={calculate.isPending} className={cabinetBtnPrimary}>
              <Calculator className="w-4 h-4" /> {t('company.estimateWizard.stagesStep.calculate')}
            </button>
          </div>
        </div>

        {hiddenStagesCount > 0 && (
          <p className="mb-4 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[11px] font-medium text-slate-500">
            {t('company.estimateWizard.stagesStep.hiddenStagesNotice', { count: hiddenStagesCount })}
          </p>
        )}

        {!hasGroups ? (
          <p className="text-xs text-gray-400 italic py-8 text-center">
            {t('company.estimateWizard.stagesStep.noStages')}
          </p>
        ) : (
          <div className="space-y-6">
            {displayGroups.map((group) => (
              <div key={group.moduleKey ?? '__unlabeled__'} className="space-y-4">
                {/* J-04: Module group header — only show when there are multiple groups */}
                {!singleGroup && (
                  <div className="flex items-center gap-2 pt-1">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      {group.label}
                    </h4>
                    <div className="flex-1 h-px bg-indigo-100" />
                  </div>
                )}
                <div className="space-y-4">
                  {group.stages.map(({ stage }) => {
                    const idx = globalIndex++;
                    return (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        index={idx}
                        wizard={wizard}
                        t={t}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}