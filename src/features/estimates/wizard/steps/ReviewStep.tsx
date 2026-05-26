import { Link } from 'react-router-dom';
import { Check, Eye, FileText, Hammer, Paperclip, Plus, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Panel,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import { downloadFile } from '@/api/files';
import type { EstimateStageDto } from '@/types/estimates';
import type { EstimateWizardApi } from '../useEstimateWizard';

type Props = {
  wizard: EstimateWizardApi;
};

export function ReviewStep({ wizard }: Props) {
  const { t } = useTranslation();
  const {
    project,
    activeCustomPricing,
    canSendEstimate,
    canConvertEstimate,
    sendEstimate,
    generateQuote,
    handleSendEstimate,
    handleGenerateQuote,
    handleConvert,
    editingStore,
    setEditingStore,
    uploadingLineId,
    handleUpdateLineQtyOrPrice,
    handleSaveStore,
    handleUploadReceipt,
    handleDeleteReceipt,
  } = wizard;

  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('company.estimateWizard.reviewStep.summaryTitle')}</h3>
        {(activeCustomPricing.customUnitPriceSqm ||
          activeCustomPricing.customDurationDays ||
          activeCustomPricing.customLaborHours ||
          activeCustomPricing.customLaborTotal) && (
          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">{t('company.estimateWizard.reviewStep.customPricingApplied')}</p>
            {activeCustomPricing.customUnitPriceSqm ? (
              <p>{t('company.estimateWizard.reviewStep.pricePerSqm', { value: activeCustomPricing.customUnitPriceSqm.toLocaleString('ro-MD') })}</p>
            ) : null}
            {activeCustomPricing.customLaborTotal ? (
              <p>{t('company.estimateWizard.reviewStep.fixedLaborTotal', { value: activeCustomPricing.customLaborTotal.toLocaleString('ro-MD') })}</p>
            ) : null}
            {activeCustomPricing.customDurationDays ? (
              <p>{t('company.estimateWizard.reviewStep.durationDays', { count: activeCustomPricing.customDurationDays })}</p>
            ) : null}
            {activeCustomPricing.customLaborHours ? (
              <p>{t('company.estimateWizard.reviewStep.laborHours', { count: activeCustomPricing.customLaborHours })}</p>
            ) : null}
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">{t('company.estimateWizard.reviewStep.labor')}</p>
            <p className="text-xl font-black text-gray-900">{Number(project.laborTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">{t('company.estimateWizard.reviewStep.materials')}</p>
            <p className="text-xl font-black text-gray-900">{Number(project.materialTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-4 border border-violet-100">
            <p className="text-xs text-violet-600">
              {t('company.estimateWizard.reviewStep.totalWithMargin', { margin: Number(project.marginPct) })}
            </p>
            <p className="text-2xl font-black text-violet-700">{Number(project.grandTotal).toLocaleString('ro-MD')} MDL</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {canSendEstimate ? (
            <button
              type="button"
              onClick={handleSendEstimate}
              disabled={sendEstimate.isPending}
              className={cabinetBtnPrimary}
            >
              <Send className="w-4 h-4" />{' '}
              {sendEstimate.isPending
                ? t('company.estimateWizard.reviewStep.sending')
                : t('company.estimateWizard.reviewStep.sendToClient')}
            </button>
          ) : null}
          <button type="button" onClick={handleGenerateQuote} disabled={!!project.quote || generateQuote.isPending} className={cabinetBtnPrimary}>
            <FileText className="w-4 h-4" /> {t('company.estimateWizard.reviewStep.generateQuote')}
          </button>
          {canConvertEstimate ? (
            <>
              <button type="button" onClick={() => handleConvert('single')} className={cabinetBtnSecondary}>
                <Hammer className="w-4 h-4" /> {t('company.estimateWizard.reviewStep.convertSingle')}
              </button>
              <button type="button" onClick={() => handleConvert('by-stage')} className={cabinetBtnSecondary}>
                <Send className="w-4 h-4" /> {t('company.estimateWizard.reviewStep.convertByStage')}
              </button>
            </>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              {t('company.estimateWizard.reviewStep.convertUnavailable')}
            </p>
          )}
          {project.quote && (
            <Link to="/company/oferte" className={cabinetBtnSecondary}>
              {t('company.estimateWizard.reviewStep.viewQuote', { number: project.quote.number })}
            </Link>
          )}
        </div>
      </Panel>

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
                      total: Number(stage.stageTotal).toLocaleString('ro-MD'),
                    })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2">{t('company.estimateWizard.reviewStep.colDescription')}</th>
                        <th className="py-2 w-20">{t('company.estimateWizard.reviewStep.colQty')}</th>
                        <th className="py-2 w-20">{t('company.estimateWizard.reviewStep.colUnit')}</th>
                        <th className="py-2 w-28">{t('company.estimateWizard.reviewStep.colUnitPrice')}</th>
                        <th className="py-2 w-28">{t('company.estimateWizard.reviewStep.colTotal')}</th>
                        <th className="py-2">{t('company.estimateWizard.reviewStep.colStore')}</th>
                        <th className="py-2 text-right">{t('company.estimateWizard.reviewStep.colReceipt')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                      {materialLines.map((line) => {
                        const isLabor =
                          line.unit === 'ore' ||
                          line.unit === 'h' ||
                          line.description.toLowerCase().includes('manoperă') ||
                          line.description.toLowerCase().includes('manopera');
                        return (
                          <tr key={line.id} className="hover:bg-violet-50/20 transition-colors">
                            <td className="py-3 font-semibold text-gray-700">{line.description}</td>
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
                                  {t('company.estimateWizard.reviewStep.laborService')}
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder={t('company.estimateWizard.reviewStep.storePlaceholder')}
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
                                        <Eye className="w-3.5 h-3.5" /> {t('company.estimateWizard.reviewStep.viewReceipt')}
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
                                  )}
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
    </div>
  );
}
