import { CheckIcon, EyeIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { downloadFile } from '@/shared/api/files';
import { EstimateLineSourceBadge } from '@/features/estimates/components/EstimateLineSourceBadge';
import { EstimateLineUnitSelect } from '@/features/estimates/components/EstimateLineUnitSelect';
import type { EstimateMeasurementUnit } from '@/entities/estimate/model/estimateMeasurementUnits.constants';
import type { EstimateStageDto } from '@/entities/estimate/model/estimates';
import type { EstimateWizardApi } from '../../useEstimateWizard';
import { getLineExplanation } from '@/features/estimates/utils/calculationExplanation';
import { isEstimateLaborLine } from '@/features/estimates/utils/estimateLaborLine';
import {
  estimateLineColPrice,
  estimateLineColQty,
  estimateLineColTotal,
  estimateLineColUnit,
  estimateLineInputBase,
  estimateLineNumericCellCenter,
  estimateLineNumericCellEnd,
  estimateLinePriceInput,
  estimateLinePriceWrap,
  estimateLineQtyInput,
} from '@/features/estimates/components/estimateLineTableStyles';

type StageCardProps = {
  stage: EstimateStageDto;
  index: number;
  wizard: EstimateWizardApi;
};

export function StageCard({ stage, index, wizard }: StageCardProps) {
  const { t } = useTranslation();
  const {
    project,
    updateLine,
    editingStore,
    setEditingStore,
    uploadingLineId,
    handleUpdateLineQtyOrPrice,
    handleUpdateLineUnit,
    handleSaveStore,
    handleUploadReceipt,
    handleDeleteReceipt,
    handleDeleteLine,
    handleAddLine,
    addLineMutation,
    isReadOnly,
    laborUnits,
    isServiceCategory,
  } = wizard;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center">
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
                <th className={`py-2 ${estimateLineColQty} text-center`}>{t('company.estimateWizard.stagesStep.colQty')}</th>
                <th className={`py-2 ${estimateLineColUnit} text-center`}>{t('company.estimateWizard.stagesStep.colUnit')}</th>
                <th className={`py-2 ${estimateLineColPrice} text-right`}>{t('company.estimateWizard.stagesStep.colUnitPrice')}</th>
                <th className={`py-2 ${estimateLineColTotal} text-right`}>{t('company.estimateWizard.stagesStep.colTotal')}</th>
                {!isServiceCategory && <th className="py-2">{t('company.estimateWizard.stagesStep.colStore')}</th>}
                {!isServiceCategory && <th className="py-2 text-right">{t('company.estimateWizard.stagesStep.colReceipt')}</th>}
                {!isReadOnly && (
                  <th className="py-2 w-10">
                    <span className="sr-only">
                      {t('company.estimateWizard.stagesStep.colActions', { defaultValue: 'Acțiuni' })}
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {stage.lines.map((line) => {
                const isLabor = isEstimateLaborLine({
                  unit: line.unit,
                  description: line.description,
                  stageKind: stage.kind,
                });
                const unitOptions: readonly EstimateMeasurementUnit[] | undefined = isLabor
                  ? laborUnits
                  : undefined;
                return (
                  <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 min-w-[180px] w-full">
                        <div className="flex-1">
                          <input
                            type="text"
                            defaultValue={line.description}
                            disabled={isReadOnly}
                            aria-label={t('company.estimateWizard.stagesStep.colDescription')}
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
                            className={`${estimateLineInputBase} w-full px-2 text-left`}
                          />
                          {(() => {
                            const diagnostic = (project?.diagnosticAnswers ?? {}) as Record<string, unknown>;
                            const measurements = Object.fromEntries(
                              (project?.measurements ?? []).map((m) => [m.key, Number(m.value)]),
                            );
                            const explanation = getLineExplanation(line.description, measurements, diagnostic);
                            return explanation ? (
                              <div className="text-[10px] text-violet-600 font-semibold mt-0.5 px-2">
                                {explanation}
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <EstimateLineSourceBadge source={line.source} />
                      </div>
                    </td>
                    <td className={estimateLineNumericCellCenter}>
                      <input
                        type="number"
                        defaultValue={Number(line.qty)}
                        disabled={isReadOnly}
                        aria-label={t('company.estimateWizard.stagesStep.colQty')}
                        onBlur={(e) =>
                          handleUpdateLineQtyOrPrice(
                            line.id,
                            stage.id,
                            'qty',
                            Number(e.target.value),
                          )
                        }
                        className={estimateLineQtyInput}
                      />
                    </td>
                    <td className={estimateLineNumericCellCenter}>
                      <EstimateLineUnitSelect
                        value={line.unit}
                        disabled={isReadOnly}
                        allowedUnits={unitOptions}
                        onChange={(unit) => handleUpdateLineUnit(line.id, stage.id, unit)}
                      />
                    </td>
                    <td className={estimateLineNumericCellEnd}>
                      <div className={estimateLinePriceWrap}>
                        <input
                          type="number"
                          defaultValue={Number(line.unitPrice)}
                          disabled={isReadOnly}
                          aria-label={t('company.estimateWizard.stagesStep.colUnitPrice')}
                          onBlur={(e) =>
                            handleUpdateLineQtyOrPrice(
                              line.id,
                              stage.id,
                              'unitPrice',
                              Number(e.target.value),
                            )
                          }
                          className={estimateLinePriceInput}
                        />
                        <span className="w-7 shrink-0 text-[10px] font-semibold text-gray-400 text-right">MDL</span>
                      </div>
                    </td>
                    <td className={`${estimateLineNumericCellEnd} font-extrabold text-gray-900 tabular-nums whitespace-nowrap`}>
                      {Number(line.lineTotal).toLocaleString('ro-MD')} MDL
                    </td>
                    {!isServiceCategory && (
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
                              aria-label={t('company.estimateWizard.stagesStep.colStore')}
                              disabled={isReadOnly}
                              value={
                                editingStore?.lineId === line.id
                                  ? editingStore.value
                                  : line.materialStore || ''
                              }
                              onChange={(e) =>
                                setEditingStore({ lineId: line.id, value: e.target.value })
                              }
                              onBlur={() => handleSaveStore(line.id, stage.id)}
                              className="w-36 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:border-violet-600 focus:outline-none bg-white font-medium disabled:bg-slate-50 disabled:text-gray-500"
                            />
                            {!isReadOnly && editingStore?.lineId === line.id && (
                              <button
                                type="button"
                                onMouseDown={() => handleSaveStore(line.id, stage.id)}
                                className="rounded-md bg-emerald-100 p-1 text-emerald-700 hover:bg-emerald-200 transition-colors"
                              >
                                <CheckIcon className="size-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                    {!isServiceCategory && (
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
                                      `Bon-${line.description.replace(/\s+/g, '_')}`,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-xl bg-violet-50 border border-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                                >
                                  <EyeIcon className="size-3.5" /> {t('company.estimateWizard.stagesStep.viewReceipt')}
                                </button>
                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                    className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                                  >
                                    <TrashIcon className="size-3.5" />
                                  </button>
                                )}
                              </>
                            ) : !isReadOnly ? (
                              <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                {uploadingLineId === line.id ? (
                                  <span className="animate-pulse">{t('cabinet.common.loading')}</span>
                                ) : (
                                  <>
                                    <PlusIcon className="size-3" /> {t('company.estimateWizard.stagesStep.receipt')}
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
                            ) : null}
                          </div>
                        )}
                      </td>
                    )}
                    {!isReadOnly && (
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(line.id, stage.id)}
                          title={t('cabinet.common.delete')}
                          className="rounded-lg bg-red-50 border border-red-100 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">{t('company.estimateWizard.stagesStep.noLines')}</p>
      )}

      {!isReadOnly && (
        <button
          type="button"
          onClick={() => handleAddLine(stage.id)}
          disabled={addLineMutation.isPending}
          className="w-full mt-2 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <PlusIcon className="size-3.5" /> {t('company.estimateWizard.stagesStep.addNewLine')}
        </button>
      )}
    </div>
  );
}
