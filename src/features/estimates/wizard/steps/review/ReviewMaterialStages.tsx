import { Check, Eye, Paperclip, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Panel } from '@/widgets/cabinet/cabinet-ui';
import { downloadFile } from '@/shared/api/files';
import { EstimateLineSourceBadge } from '@/features/estimates/components/EstimateLineSourceBadge';
import { EstimateLineUnitSelect } from '@/features/estimates/components/EstimateLineUnitSelect';
import type { EstimateMeasurementUnit } from '@/entities/estimate/model/estimateMeasurementUnits.constants';
import type { EstimateStageDto } from '@/entities/estimate/model/estimates';
import { getLineExplanation } from '@/features/estimates/utils/calculationExplanation';
import { isEstimateLaborLine } from '@/features/estimates/utils/estimateLaborLine';
import type { EstimateWizardApi } from '../../useEstimateWizard';
import {
  estimateLineColPrice,
  estimateLineColQty,
  estimateLineColTotal,
  estimateLineColUnit,
  estimateLineNumericCellCenter,
  estimateLineNumericCellEnd,
  estimateLinePriceInput,
  estimateLinePriceWrap,
  estimateLineQtyInput,
} from '@/features/estimates/components/estimateLineTableStyles';

type ReviewMaterialStagesProps = {
  wizard: EstimateWizardApi;
};

export function ReviewMaterialStages({ wizard }: ReviewMaterialStagesProps) {
  const { t } = useTranslation();
  const {
    project,
    editingStore,
    setEditingStore,
    uploadingLineId,
    handleUpdateLineQtyOrPrice,
    handleUpdateLineUnit,
    handleSaveStore,
    handleUploadReceipt,
    handleDeleteReceipt,
    isReadOnly,
    laborUnits,
  } = wizard;

  const showMaterialsSection = (project.stages as EstimateStageDto[]).some(
    (stage) => (stage.lines ?? []).some((l) => l.source !== 'stage-default')
  );

  if (!showMaterialsSection) return null;

  return (
    <Panel className="p-6">
      <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mb-1">
        <Paperclip className="w-5 h-5 text-violet-600 animate-pulse" /> {t('company.estimateWizard.reviewStep.materialsTitle')}
      </h3>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        {t('company.estimateWizard.reviewStep.materialsDescription')}
      </p>

      <div className="space-y-6">
        {(project.stages as EstimateStageDto[]).map((stage) => {
          const materialLines = (stage.lines ?? []).filter((l) => l.source !== 'stage-default');
          if (materialLines.length === 0) return null;

          return (
            <div key={stage.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 shadow-xs">
              <div className="font-extrabold text-sm text-gray-800 border-b border-gray-100/80 pb-2 flex items-center justify-between">
                <span className="text-gray-900 font-bold text-sm">
                  {t('company.estimateWizard.reviewStep.stageLabel', { name: stage.name })}
                </span>
                <span className="text-xs font-semibold text-violet-600">
                  {t('company.estimateWizard.reviewStep.stageTotal', {
                    value: Number(stage.stageTotal).toLocaleString('ro-MD'),
                  })}
                </span>
              </div>

              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-2 pr-2">{t('company.estimateWizard.reviewStep.colDescription')}</th>
                      <th className={`py-2 ${estimateLineColQty} text-center`}>{t('company.estimateWizard.reviewStep.colQty')}</th>
                      <th className={`py-2 hidden sm:table-cell ${estimateLineColUnit} text-center`}>{t('company.estimateWizard.reviewStep.colUnit')}</th>
                      <th className={`py-2 hidden sm:table-cell ${estimateLineColPrice} text-right`}>{t('company.estimateWizard.reviewStep.colUnitPrice')}</th>
                      <th className={`py-2 ${estimateLineColTotal} text-right`}>{t('company.estimateWizard.reviewStep.colTotal')}</th>
                      <th className="py-2 pr-2">{t('company.estimateWizard.reviewStep.colStore')}</th>
                      <th className="py-2 text-right">{t('company.estimateWizard.reviewStep.colReceipt')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {materialLines.map((line) => {
                      const isLabor = isEstimateLaborLine({
                        unit: line.unit,
                        description: line.description,
                      });
                      const unitOptions: readonly EstimateMeasurementUnit[] | undefined = isLabor
                        ? laborUnits
                        : undefined;
                      return (
                        <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                          <td className="py-3 font-semibold text-gray-700">
                            <div>
                              <span className="inline-flex items-center gap-1.5">
                                {line.description}
                                <EstimateLineSourceBadge source={line.source} />
                              </span>
                              {(() => {
                                const diagnostic = (project?.diagnosticAnswers ?? {}) as Record<string, unknown>;
                                const measurements = Object.fromEntries(
                                  (project?.measurements ?? []).map((m) => [m.key, Number(m.value)]),
                                );
                                const explanation = getLineExplanation(line.description, measurements, diagnostic);
                                return explanation ? (
                                  <div className="text-[10px] text-violet-600 font-semibold mt-0.5 px-0">
                                    {explanation}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </td>
                          <td className={estimateLineNumericCellCenter}>
                            <input
                              type="number"
                              defaultValue={Number(line.qty)}
                              disabled={isReadOnly}
                              aria-label={t('company.estimateWizard.reviewStep.qtyLabel', {
                                defaultValue: 'Cantitate',
                              })}
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
                          <td className={`${estimateLineNumericCellCenter} hidden sm:table-cell`}>
                            <EstimateLineUnitSelect
                              value={line.unit}
                              disabled={isReadOnly}
                              allowedUnits={unitOptions}
                              onChange={(unit) => handleUpdateLineUnit(line.id, stage.id, unit)}
                            />
                          </td>
                          <td className={`${estimateLineNumericCellEnd} hidden sm:table-cell`}>
                            <div className={estimateLinePriceWrap}>
                              <input
                                type="number"
                                defaultValue={Number(line.unitPrice)}
                                disabled={isReadOnly}
                                aria-label={t('company.estimateWizard.reviewStep.unitPriceLabel', {
                                  defaultValue: 'Preț unitar',
                                })}
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
                          <td className="py-3">
                            {isLabor ? (
                              <span className="text-[10px] text-gray-400 italic">
                                {t('company.estimateWizard.reviewStep.laborService')}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder={t('company.estimateWizard.reviewStep.storePlaceholder')}
                                  aria-label={t('company.estimateWizard.reviewStep.storePlaceholder')}
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
                                    <Check className="w-3.5 h-3.5" />
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
                                      <Eye className="w-3.5 h-3.5" /> {t('company.estimateWizard.reviewStep.viewReceipt')}
                                    </button>
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReceipt(line.id, stage.id)}
                                        className="rounded-xl bg-red-50 border border-red-100 p-1 text-red-600 hover:bg-red-100 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                ) : !isReadOnly ? (
                                  <label className="relative cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                    {uploadingLineId === line.id ? (
                                      <span className="animate-pulse">{t('cabinet.common.loading')}</span>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" /> {t('company.estimateWizard.reviewStep.attachReceipt')}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
